// VKU Field Survey App - Service Worker
// Phiên bản Cache
const CACHE_NAME = 'vku-survey-cache-v1';

// Danh sách tài nguyên cốt lõi (App Shell) cần Pre-cache khi cài đặt
const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/favicon.png',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable.png'
];

// 1. Giai đoạn INSTALL: Lưu trước App Shell vào Cache Storage
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Đang cài đặt (Install)...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Đang nạp App Shell vào Cache...');
      return cache.addAll(APP_SHELL_ASSETS);
    }).then(() => {
      // Bỏ qua chờ đợi, kích hoạt ngay lập tức
      return self.skipWaiting();
    })
  );
});

// 2. Giai đoạn ACTIVATE: Dọn dẹp các cache cũ không còn dùng
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Đang kích hoạt (Activate)...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[Service Worker] Đang xóa cache cũ:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      // Giành quyền kiểm soát tất cả client tabs đang mở
      return self.clients.claim();
    })
  );
});

// 3. Giai đoạn FETCH: Can thiệp và xử lý các yêu cầu mạng theo chiến lược phù hợp
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Bỏ qua các request không phải GET hoặc thuộc scheme chrome-extension / ngoại vi
  if (request.method !== 'GET') {
    return;
  }

  // A. Chiến lược Cache-First cho App Shell & Tài nguyên tĩnh (Fonts, Images, Icons, JS, CSS)
  if (
    url.origin === self.location.origin &&
    (
      APP_SHELL_ASSETS.includes(url.pathname) ||
      url.pathname.startsWith('/assets/') ||
      url.pathname.startsWith('/icons/') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.ico')
    )
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Trả về từ Cache ngay lập tức (Cache-First)
          // Đồng thời cập nhật ngầm nếu cần (Stale-While-Revalidate)
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          }).catch(() => {
            // Đang offline, không sao vì đã có cache
          });
          return cachedResponse;
        }

        // Nếu chưa có trong cache thì fetch từ mạng rồi lưu vào cache
        return fetch(request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return networkResponse;
        }).catch((err) => {
          console.warn('[Service Worker] Lỗi tải tài nguyên tĩnh khi offline:', request.url);
        });
      })
    );
    return;
  }

  // B. Chiến lược Network-First with Cache Fallback cho HTML Navigation (Trang chính)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // Mất mạng hoàn toàn -> Trả về /index.html từ Cache
          return caches.match('/index.html').then((cachedIndex) => {
            return cachedIndex || caches.match('/');
          });
        })
    );
    return;
  }

  // C. Các API hoặc request khác: Network-First
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});

// 4. Giai đoạn BACKGROUND SYNC: Tự động đồng bộ dữ liệu khi thiết bị có mạng trở lại
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Nhận sự kiện sync tag:', event.tag);
  if (event.tag === 'sync-surveys') {
    event.waitUntil(notifyClientsToSync());
  }
});

// Hàm thông báo cho các trang mở để thực hiện đồng bộ dữ liệu từ IndexedDB
async function notifyClientsToSync() {
  const allClients = await self.clients.matchAll({ includeUncontrolled: true });
  for (const client of allClients) {
    client.postMessage({
      type: 'TRIGGER_BACKGROUND_SYNC',
      timestamp: Date.now()
    });
  }
}

// 5. Lắng nghe tin nhắn từ trang giao diện (Client PostMessage)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
