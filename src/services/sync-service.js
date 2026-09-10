import {
  getSyncQueue,
  removeFromSyncQueue,
  saveSurvey,
  getSurvey,
  getAllSurveys
} from '../db/database.js';
import { notifySyncSuccess } from './notification-service.js';

// Trạng thái đồng bộ hiện tại
let isSyncing = false;
const syncListeners = new Set();

/**
 * Đăng ký lắng nghe sự kiện đồng bộ
 */
export function onSyncChange(callback) {
  syncListeners.add(callback);
  return () => syncListeners.delete(callback);
}

function notifySyncListeners(state) {
  for (const cb of syncListeners) {
    try {
      cb(state);
    } catch (e) {
      console.error('Lỗi listener sync:', e);
    }
  }
}

/**
 * Kiểm tra trạng thái mạng thực tế
 */
export function isOnline() {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

/**
 * Đăng ký Background Sync API nếu trình duyệt hỗ trợ
 */
export async function registerBackgroundSync() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-surveys');
      console.log('[Sync Service] Đã kích hoạt Background Sync: sync-surveys');
      return true;
    } catch (err) {
      console.warn('[Sync Service] Background Sync không được cấp phép hoặc gặp lỗi:', err);
      return false;
    }
  }
  return false;
}

/**
 * Giả lập gửi dữ liệu lên máy chủ VKU Backend (Mock API)
 * Sẵn sàng kết nối tới REST API thật khi triển khai máy chủ
 */
async function sendSurveyToServer(survey) {
  // Giả lập thời gian truyền gói tin mạng (500ms - 1000ms)
  await new Promise(resolve => setTimeout(resolve, 600));

  // Kiểm tra mạng lần nữa
  if (!isOnline()) {
    throw new Error('Mất kết nối mạng trong quá trình gửi.');
  }

  // Tùy chọn: Lưu bản sao trên Server Mock Storage (LocalStorage server replica)
  const serverRecords = JSON.parse(localStorage.getItem('vku_server_synced_records') || '[]');
  const existingIdx = serverRecords.findIndex(r => r.id === survey.id);
  const serverPayload = {
    ...survey,
    serverReceivedAt: new Date().toISOString(),
    status: 'CONFIRMED'
  };

  if (existingIdx >= 0) {
    serverRecords[existingIdx] = serverPayload;
  } else {
    serverRecords.push(serverPayload);
  }
  localStorage.setItem('vku_server_synced_records', JSON.stringify(serverRecords));

  return {
    success: true,
    surveyId: survey.id,
    syncedAt: new Date().toISOString()
  };
}

/**
 * Thực hiện đồng bộ toàn bộ hàng đợi trong IndexedDB lên máy chủ
 */
export async function syncAllPending() {
  if (isSyncing) {
    console.log('[Sync Service] Quá trình đồng bộ đang chạy dở...');
    return { success: false, message: 'Đang trong quá trình đồng bộ.' };
  }

  if (!isOnline()) {
    console.log('[Sync Service] Thiết bị đang Offline, không thể đồng bộ ngay bây giờ.');
    notifySyncListeners({ isSyncing: false, isOnline: false, queueLength: (await getSyncQueue()).length });
    return { success: false, message: 'Thiết bị đang Offline.' };
  }

  const queue = await getSyncQueue();
  if (queue.length === 0) {
    notifySyncListeners({ isSyncing: false, isOnline: true, queueLength: 0 });
    return { success: true, syncedCount: 0 };
  }

  isSyncing = true;
  notifySyncListeners({ isSyncing: true, isOnline: true, queueLength: queue.length });

  let successCount = 0;
  let failCount = 0;

  for (const item of queue) {
    try {
      // 1. Gửi bản ghi lên Server
      const result = await sendSurveyToServer(item.payload);

      // 2. Cập nhật bản ghi trong IndexedDB
      const currentSurvey = await getSurvey(item.id);
      if (currentSurvey) {
        currentSurvey.syncStatus = 'synced';
        currentSurvey.syncedAt = result.syncedAt;
        await saveSurvey(currentSurvey);
      }

      // 3. Xóa khỏi hàng đợi Sync Queue
      await removeFromSyncQueue(item.id);
      successCount++;
    } catch (err) {
      console.error(`[Sync Service] Đồng bộ phiếu ${item.id} thất bại:`, err);
      failCount++;
      // Nếu đứt mạng giữa chừng, dừng vòng lặp
      if (!isOnline()) break;
    }
  }

  isSyncing = false;
  const remainingQueue = await getSyncQueue();

  if (successCount > 0) {
    try {
      await notifySyncSuccess(successCount);
    } catch (notifErr) {
      console.warn('[Sync Service] Lỗi gửi thông báo:', notifErr);
    }
  }

  notifySyncListeners({
    isSyncing: false,
    isOnline: isOnline(),
    queueLength: remainingQueue.length,
    lastSyncAt: new Date().toISOString()
  });

  return {
    success: failCount === 0,
    syncedCount: successCount,
    failedCount: failCount,
    remainingCount: remainingQueue.length
  };
}

/**
 * Khởi tạo các bộ lắng nghe sự kiện mạng (Online/Offline) và thông điệp từ Service Worker
 */
export function initSyncService() {
  // Lắng nghe mạng phục hồi
  window.addEventListener('online', () => {
    console.log('[Sync Service] Thiết bị đã kết nối mạng trở lại (Online)!');
    notifySyncListeners({ isOnline: true });
    // Tự động đồng bộ ngay lập tức
    setTimeout(() => {
      syncAllPending();
    }, 1000);
  });

  // Lắng nghe mất mạng
  window.addEventListener('offline', () => {
    console.log('[Sync Service] Thiết bị mất kết nối mạng (Offline). Chuyển sang Offline-First!');
    notifySyncListeners({ isOnline: false });
  });

  // Lắng nghe Service Worker trigger sync
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'TRIGGER_BACKGROUND_SYNC') {
        console.log('[Sync Service] Nhận tín hiệu TRIGGER_BACKGROUND_SYNC từ Service Worker');
        syncAllPending();
      }
    });
  }

  // Nếu đang có mạng khi mở app, kiểm tra hàng đợi để sync
  if (isOnline()) {
    setTimeout(() => {
      syncAllPending();
    }, 1500);
  }
}

/**
 * Xuất dữ liệu khảo sát ra file JSON hoặc CSV
 */
export async function exportSurveysAsJSON() {
  const surveys = await getAllSurveys();
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(surveys, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `VKU_Survey_Export_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
