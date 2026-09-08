export function renderAboutView(containerElement) {
  const swSupported = 'serviceWorker' in navigator;
  const idbSupported = 'indexedDB' in window;
  const syncSupported = 'SyncManager' in window;
  const geoSupported = 'geolocation' in navigator;
  const cameraSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) || ('HTMLInputElement' in window);

  containerElement.innerHTML = `
    <!-- Giới thiệu đề tài -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">🏫 VKU Field Survey App</h2>
      </div>
      <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 12px;">
        Ứng dụng khảo sát hiện trường cơ sở vật chất (phòng học, máy chiếu, điều hòa, phòng lab, PCCC...) tại 
        <b>Trường Đại học Công nghệ Thông tin & Truyền thông Việt - Hàn (VKU)</b> theo mô hình chuẩn <b>Offline-First Progressive Web App (PWA)</b>.
      </p>

      <div style="background: var(--bg-input); padding: 12px; border-radius: var(--radius-md); font-size: 0.82rem; line-height: 1.6;">
        <div><b>Học phần:</b> Phát triển Ứng dụng Đa Nền tảng</div>
        <div><b>Đề tài:</b> Mini-Project 1 - PWA Khảo Sát Hiện Trường</div>
        <div><b>Cầu nối Android:</b> Sẵn sàng tích hợp Capacitor Bridge (APK)</div>
      </div>
    </div>

    <!-- Kiểm tra tính năng PWA Thiết bị -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">⚙️ Khả Năng Tương Thích Thiết Bị</h2>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border-subtle);">
          <span>Service Worker (Bộ nhớ đệm App Shell)</span>
          <span style="font-weight: 700; color: ${swSupported ? 'var(--color-success)' : 'var(--color-danger)'};">
            ${swSupported ? '✅ Đã hỗ trợ' : '❌ Không hỗ trợ'}
          </span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border-subtle);">
          <span>IndexedDB (Kho dữ liệu Offline client)</span>
          <span style="font-weight: 700; color: ${idbSupported ? 'var(--color-success)' : 'var(--color-danger)'};">
            ${idbSupported ? '✅ Đã hỗ trợ' : '❌ Không hỗ trợ'}
          </span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border-subtle);">
          <span>Background Sync API (Đồng bộ ngầm)</span>
          <span style="font-weight: 700; color: ${syncSupported ? 'var(--color-success)' : 'var(--color-warning)'};">
            ${syncSupported ? '✅ Đã hỗ trợ' : '⚠️ Fallback Online Event'}
          </span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border-subtle);">
          <span>Geolocation (Định vị GPS hiện trường)</span>
          <span style="font-weight: 700; color: ${geoSupported ? 'var(--color-success)' : 'var(--color-danger)'};">
            ${geoSupported ? '✅ Đã hỗ trợ' : '❌ Không hỗ trợ'}
          </span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
          <span>Camera & Nén ảnh hiện trường</span>
          <span style="font-weight: 700; color: ${cameraSupported ? 'var(--color-success)' : 'var(--color-danger)'};">
            ${cameraSupported ? '✅ Sẵn sàng' : '❌ Không hỗ trợ'}
          </span>
        </div>
      </div>
    </div>

    <!-- Nguyên lý Offline-First -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">💡 Giải Pháp Kỹ Thuật Offline-First</h2>
      </div>
      <ul style="font-size: 0.83rem; color: var(--text-secondary); line-height: 1.6; padding-left: 18px;">
        <li><b>App Shell Architecture:</b> Tải ngay lập tức giao diện người dùng từ Cache Storage mà không cần chờ nạp qua mạng internet (Zero-network cold start).</li>
        <li><b>Local Persistence:</b> Mọi thao tác ghi nhận (phiếu khảo sát, ảnh hiện trường nén, tọa độ GPS) đều được ghi vào IndexedDB trước tiên.</li>
        <li><b>Resilient Sync Queue:</b> Hàng đợi offline đảm bảo không bao giờ mất dữ liệu dù mất điện, tắt trình duyệt hoặc mất kết nối 4G/Wifi.</li>
        <li><b>Capacitor Ready:</b> Đóng gói code HTML/JS/CSS độc lập, tương thích 100% với Capacitor WebView Android/iOS.</li>
      </ul>
    </div>
  `;
}
