// Đăng ký Service Worker và quản lý PWA Install Prompt

let deferredInstallPrompt = null;
const installListeners = new Set();

export function onInstallPromptAvailable(callback) {
  installListeners.add(callback);
  if (deferredInstallPrompt) {
    callback(deferredInstallPrompt);
  }
  return () => installListeners.delete(callback);
}

export async function promptInstallPWA() {
  if (!deferredInstallPrompt) {
    return false;
  }
  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  console.log('[PWA] Kết quả người dùng chọn:', outcome);
  deferredInstallPrompt = null;
  installListeners.forEach(cb => cb(null));
  return outcome === 'accepted';
}

export function registerServiceWorker() {
  // Bắt sự kiện cài đặt PWA (Add to Home Screen)
  window.addEventListener('beforeinstallprompt', (e) => {
    // Ngăn chặn prompt mặc định của trình duyệt để tự điều khiển UI
    e.preventDefault();
    deferredInstallPrompt = e;
    console.log('[PWA] Sự kiện beforeinstallprompt đã sẵn sàng');
    installListeners.forEach(cb => cb(deferredInstallPrompt));
  });

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] Ứng dụng VKU Field Survey đã được cài đặt thành công!');
    deferredInstallPrompt = null;
    installListeners.forEach(cb => cb(null));
  });

  // Đăng ký Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[Service Worker] Đăng ký thành công với scope:', registration.scope);

          // Kiểm tra bản cập nhật mới
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[Service Worker] Có bản cập nhật mới sẵn sàng.');
                  // Thông báo người dùng tải lại
                  window.dispatchEvent(new CustomEvent('vku-sw-update-available'));
                }
              };
            }
          };
        })
        .catch((error) => {
          console.error('[Service Worker] Đăng ký thất bại:', error);
        });
    });
  }
}
