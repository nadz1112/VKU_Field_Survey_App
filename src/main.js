import { registerServiceWorker, onInstallPromptAvailable, promptInstallPWA } from './services/sw-register.js';
import { initSyncService, isOnline, onSyncChange } from './services/sync-service.js';
import { getStorageStats } from './db/database.js';
import { initSurveyForm } from './components/survey-form.js';
import { renderSurveyList } from './components/survey-list.js';
import { renderSyncManager } from './components/sync-manager.js';
import { renderAboutView } from './components/about-view.js';
import { initDetailModal } from './components/modal-detail.js';
import { showToast } from './components/toast.js';
import { initNotificationService } from './services/notification-service.js';

// DOM Elements
const networkBadge = document.getElementById('header-network-badge');
const networkText = document.getElementById('header-network-text');
const offlineBanner = document.getElementById('offline-banner');
const installBtn = document.getElementById('btn-install-pwa');
const navSyncBadge = document.getElementById('nav-sync-badge');

const tabElements = {
  'tab-new': document.getElementById('tab-new'),
  'tab-history': document.getElementById('tab-history'),
  'tab-sync': document.getElementById('tab-sync'),
  'tab-about': document.getElementById('tab-about'),
};

let currentActiveTab = 'tab-new';

/**
 * Cập nhật hiển thị trạng thái kết nối mạng (Online/Offline)
 */
function updateNetworkUI(online) {
  if (online) {
    networkBadge.className = 'network-badge online';
    networkText.textContent = 'Online';
    offlineBanner.classList.remove('active');
  } else {
    networkBadge.className = 'network-badge offline';
    networkText.textContent = 'Offline';
    offlineBanner.classList.add('active');
  }
}

/**
 * Cập nhật số lượng phiếu chờ gửi trên Bottom Navigation badge
 */
async function updateNavBadge() {
  const stats = await getStorageStats();
  if (stats.pendingCount > 0) {
    navSyncBadge.textContent = stats.pendingCount;
    navSyncBadge.classList.add('has-items');
  } else {
    navSyncBadge.classList.remove('has-items');
  }
}

/**
 * Chuyển tab hiển thị
 */
function switchTab(tabId) {
  if (!tabElements[tabId]) return;

  currentActiveTab = tabId;

  // Cập nhật giao diện tab content
  Object.keys(tabElements).forEach(id => {
    if (id === tabId) {
      tabElements[id].classList.add('active');
    } else {
      tabElements[id].classList.remove('active');
    }
  });

  // Cập nhật trạng thái nút navigation
  document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Tải nội dung tương ứng theo tab
  if (tabId === 'tab-history') {
    renderSurveyList(tabElements['tab-history'], () => switchTab('tab-new'));
  } else if (tabId === 'tab-sync') {
    renderSyncManager(tabElements['tab-sync'], () => {
      updateNavBadge();
    });
  } else if (tabId === 'tab-about') {
    renderAboutView(tabElements['tab-about']);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Khởi động ứng dụng
 */
async function bootstrap() {
  console.log('[App] Khởi động VKU Field Survey App...');

  // 1. Đăng ký Service Worker
  registerServiceWorker();

  // 2. Khởi tạo dịch vụ đồng bộ & mạng & thông báo
  initSyncService();
  initNotificationService();
  updateNetworkUI(isOnline());

  window.addEventListener('online', () => {
    updateNetworkUI(true);
    showToast('Đã kết nối internet trở lại! Đang tự động đồng bộ...', 'success');
    updateNavBadge();
  });

  window.addEventListener('offline', () => {
    updateNetworkUI(false);
    showToast('Mất kết nối internet. Chuyển sang chế độ Offline-First.', 'warning');
    updateNavBadge();
  });

  onSyncChange(async (state) => {
    await updateNavBadge();
    if (currentActiveTab === 'tab-sync') {
      renderSyncManager(tabElements['tab-sync'], () => updateNavBadge());
    } else if (currentActiveTab === 'tab-history') {
      renderSurveyList(tabElements['tab-history'], () => switchTab('tab-new'));
    }
  });

  // 3. Xử lý nút Cài đặt PWA (Install)
  onInstallPromptAvailable((promptEvent) => {
    if (promptEvent) {
      installBtn.classList.add('visible');
    } else {
      installBtn.classList.remove('visible');
    }
  });

  installBtn.addEventListener('click', async () => {
    const installed = await promptInstallPWA();
    if (installed) {
      showToast('Đang cài đặt VKU Field Survey App...', 'success');
    }
  });

  // 4. Lắng nghe cập nhật Service Worker
  window.addEventListener('vku-sw-update-available', () => {
    showToast('Có bản cập nhật mới! Tải lại trang để áp dụng.', 'info', 6000);
  });

  // 5. Gắn sự kiện Bottom Navigation
  document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // 6. Khởi tạo modal chi tiết
  initDetailModal(() => {
    updateNavBadge();
    if (currentActiveTab === 'tab-history') {
      renderSurveyList(tabElements['tab-history'], () => switchTab('tab-new'));
    }
  });

  // 7. Khởi tạo Form khảo sát ở tab đầu tiên
  await initSurveyForm(tabElements['tab-new'], async () => {
    await updateNavBadge();
  });

  // 8. Cập nhật huy hiệu ban đầu
  await updateNavBadge();

  // 9. Xử lý URL hash khi mở qua shortcut
  if (window.location.hash === '#sync') {
    switchTab('tab-sync');
  } else if (window.location.hash === '#history') {
    switchTab('tab-history');
  }
}

// Khởi chạy khi DOM sẵn sàng
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
