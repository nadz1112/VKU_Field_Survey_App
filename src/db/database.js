import { openDB } from 'idb';

const DB_NAME = 'VKU_Field_Survey_DB';
const DB_VERSION = 1;

let dbPromise = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // 1. Store lưu trữ các phiếu khảo sát
        if (!db.objectStoreNames.contains('surveys')) {
          const surveyStore = db.createObjectStore('surveys', { keyPath: 'id' });
          surveyStore.createIndex('createdAt', 'createdAt');
          surveyStore.createIndex('syncStatus', 'syncStatus');
          surveyStore.createIndex('building', 'building');
        }

        // 2. Store lưu trữ hàng đợi đồng bộ khi Offline (Offline Sync Queue)
        if (!db.objectStoreNames.contains('sync_queue')) {
          const queueStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
          queueStore.createIndex('queuedAt', 'queuedAt');
        }

        // 3. Store lưu trữ cấu hình & thông tin người khảo sát
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      },
    });
  }
  return dbPromise;
}

// === CÁC THAO TÁC VỚI SURVEYS ===

export async function saveSurvey(survey) {
  const db = await getDB();
  const data = {
    ...survey,
    updatedAt: new Date().toISOString()
  };
  await db.put('surveys', data);
  return data;
}

export async function getSurvey(id) {
  const db = await getDB();
  return db.get('surveys', id);
}

export async function getAllSurveys() {
  const db = await getDB();
  const surveys = await db.getAll('surveys');
  // Sắp xếp mới nhất lên trước
  return surveys.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function deleteSurvey(id) {
  const db = await getDB();
  await db.delete('surveys', id);
  // Đồng thời xóa khỏi sync_queue nếu có
  await removeFromSyncQueue(id);
}

// === CÁC THAO TÁC VỚI HÀNG ĐỢI ĐỒNG BỘ (SYNC QUEUE) ===

export async function addToSyncQueue(survey) {
  const db = await getDB();
  const queueItem = {
    id: survey.id,
    type: 'CREATE_SURVEY',
    payload: survey,
    queuedAt: new Date().toISOString(),
    retryCount: 0
  };
  await db.put('sync_queue', queueItem);
  return queueItem;
}

export async function getSyncQueue() {
  const db = await getDB();
  return db.getAll('sync_queue');
}

export async function removeFromSyncQueue(id) {
  const db = await getDB();
  await db.delete('sync_queue', id);
}

export async function clearSyncQueue() {
  const db = await getDB();
  await db.clear('sync_queue');
}

// === CÁC THAO TÁC VỚI SETTINGS ===

export async function getSetting(key, defaultValue = null) {
  const db = await getDB();
  const val = await db.get('settings', key);
  return val !== undefined ? val : defaultValue;
}

export async function saveSetting(key, value) {
  const db = await getDB();
  await db.put('settings', value, key);
  return value;
}

// Thống kê bộ nhớ và số lượng bản ghi
export async function getStorageStats() {
  const surveys = await getAllSurveys();
  const queue = await getSyncQueue();
  const pendingCount = surveys.filter(s => s.syncStatus === 'pending').length;
  const syncedCount = surveys.filter(s => s.syncStatus === 'synced').length;
  const draftCount = surveys.filter(s => s.syncStatus === 'draft').length;

  let estimate = { quota: 0, usage: 0 };
  if (navigator.storage && navigator.storage.estimate) {
    try {
      estimate = await navigator.storage.estimate();
    } catch (e) {
      console.warn('Không thể lấy storage estimate:', e);
    }
  }

  return {
    totalSurveys: surveys.length,
    pendingCount,
    syncedCount,
    draftCount,
    queueCount: queue.length,
    storageUsageBytes: estimate.usage || 0,
    storageQuotaBytes: estimate.quota || 0,
    storageUsageMB: ((estimate.usage || 0) / (1024 * 1024)).toFixed(2),
  };
}
