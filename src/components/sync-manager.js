import {
  getStorageStats,
  getAllSurveys,
  saveSurvey,
  deleteSurvey
} from '../db/database.js';
import {
  isOnline,
  syncAllPending,
  exportSurveysAsJSON,
  onSyncChange
} from '../services/sync-service.js';
import { showToast } from './toast.js';

export async function renderSyncManager(containerElement, onDataUpdated) {
  const stats = await getStorageStats();
  const online = isOnline();

  containerElement.innerHTML = `
    <!-- Trạng thái kết nối hiện tại -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">📡 Trạng Thái Kết Nối & Hàng Đợi</h2>
        <span class="network-badge ${online ? 'online' : 'offline'}">
          <span class="status-dot"></span>
          ${online ? 'Trực tuyến (Online)' : 'Ngoại tuyến (Offline)'}
        </span>
      </div>

      <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 16px;">
        ${online 
          ? 'Hệ thống đang kết nối internet. Mọi dữ liệu mới sẽ được gửi ngay lên máy chủ hoặc đồng bộ ngầm.' 
          : 'Hệ thống đang hoạt động ở chế độ <b>Offline-First</b>. Dữ liệu khảo sát và ảnh được lưu trữ an toàn trong <b>IndexedDB</b> cục bộ.'
        }
      </p>

      <!-- Thống kê số lượng bản ghi -->
      <div class="sync-stat-grid">
        <div class="stat-box">
          <div class="stat-number" style="color: var(--vku-orange);" id="stat-pending">${stats.pendingCount}</div>
          <div class="stat-label">Chờ đồng bộ</div>
        </div>
        <div class="stat-box">
          <div class="stat-number" style="color: var(--color-success);" id="stat-synced">${stats.syncedCount}</div>
          <div class="stat-label">Đã đồng bộ</div>
        </div>
        <div class="stat-box">
          <div class="stat-number" style="color: var(--vku-navy-light);" id="stat-total">${stats.totalSurveys}</div>
          <div class="stat-label">Tổng số phiếu</div>
        </div>
      </div>

      <!-- Nút kích hoạt đồng bộ -->
      <button id="btn-trigger-sync" class="btn btn-primary" style="width: 100%; margin-top: 6px;">
        🔄 Đồng bộ dữ liệu ngay (${stats.pendingCount} phiếu)
      </button>
    </div>

    <!-- Quản lý Bộ nhớ IndexedDB -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">💾 Bộ Nhớ Cục Bộ (IndexedDB)</h2>
      </div>
      
      <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px;">
        Dung lượng đã sử dụng: <b>${stats.storageUsageMB} MB</b>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${Math.min(100, Math.max(5, (stats.storageUsageBytes / (1024 * 1024 * 50)) * 100))}%;"></div>
      </div>
      <div style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 16px;">
        Lưu trữ ảnh hiện trường, bản nháp và hàng đợi Service Worker hoàn toàn trên thiết bị client.
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <button id="btn-export-json" class="btn btn-secondary" style="font-size: 0.85rem; padding: 10px;">
          📥 Xuất file JSON
        </button>
        <button id="btn-clean-synced" class="btn btn-secondary" style="font-size: 0.85rem; padding: 10px; color: var(--text-secondary);">
          🧹 Dọn phiếu đã sync
        </button>
      </div>
    </div>

    <!-- Hướng dẫn Kiểm thử Offline-First cho Giảng viên / Ban Giám Khảo -->
    <div class="card" style="background: var(--color-info-bg); border-color: rgba(2, 132, 199, 0.3);">
      <h3 style="font-size: 0.95rem; font-weight: 700; color: var(--color-info); margin-bottom: 8px;">
        🧪 Hướng dẫn Kiểm tra Tính năng Offline-First:
      </h3>
      <ol style="font-size: 0.82rem; color: var(--text-secondary); padding-left: 18px; line-height: 1.6;">
        <li>Mở <b>F12 (DevTools)</b> $\rightarrow$ Chọn tab <b>Network</b> $\rightarrow$ Chuyển sang <b>Offline</b> (hoặc tắt Wi-Fi).</li>
        <li>Tải lại trang (F5): Ứng dụng vẫn hoạt động 100% nhờ <b>Service Worker App Shell Cache</b>.</li>
        <li>Tạo phiếu khảo sát kèm chụp ảnh hiện trường và bấm <b>Gửi khảo sát</b>.</li>
        <li>Quan sát phiếu được lưu tức thì vào <b>IndexedDB</b> với huy hiệu <i>"Chờ gửi"</i> và hàng đợi <b>sync_queue</b>.</li>
        <li>Bật lại mạng (Online) hoặc bấm <b>"Đồng bộ dữ liệu ngay"</b>: Dữ liệu tự động đẩy lên máy chủ và đổi trạng thái thành <i>"Đã đồng bộ"</i>.</li>
      </ol>
    </div>
  `;

  const syncBtn = containerElement.querySelector('#btn-trigger-sync');
  const exportBtn = containerElement.querySelector('#btn-export-json');
  const cleanSyncedBtn = containerElement.querySelector('#btn-clean-synced');

  // Xử lý bấm đồng bộ
  syncBtn.addEventListener('click', async () => {
    if (!isOnline()) {
      showToast('Thiết bị đang Offline. Vui lòng kết nối mạng để đồng bộ.', 'warning');
      return;
    }

    syncBtn.disabled = true;
    syncBtn.innerHTML = '⏳ Đang đồng bộ dữ liệu...';

    try {
      const result = await syncAllPending();
      if (result.success) {
        showToast(`Đồng bộ thành công ${result.syncedCount} phiếu khảo sát!`, 'success');
      } else {
        showToast(result.message || 'Có lỗi trong quá trình đồng bộ.', 'warning');
      }
    } catch (e) {
      showToast('Lỗi đồng bộ: ' + e.message, 'danger');
    } finally {
      syncBtn.disabled = false;
      renderSyncManager(containerElement, onDataUpdated);
      if (onDataUpdated) onDataUpdated();
    }
  });

  // Xuất file JSON
  exportBtn.addEventListener('click', async () => {
    await exportSurveysAsJSON();
    showToast('Đã tải xuống file dữ liệu khảo sát JSON.', 'success');
  });

  // Dọn dẹp phiếu đã đồng bộ
  cleanSyncedBtn.addEventListener('click', async () => {
    if (confirm('Bạn có muốn xóa các phiếu đã đồng bộ thành công để giải phóng bộ nhớ? (Các phiếu chưa đồng bộ sẽ được giữ nguyên)')) {
      const all = await getAllSurveys();
      const synced = all.filter(s => s.syncStatus === 'synced');
      for (const s of synced) {
        await deleteSurvey(s.id);
      }
      showToast(`Đã dọn dẹp ${synced.length} phiếu đã đồng bộ.`, 'success');
      renderSyncManager(containerElement, onDataUpdated);
      if (onDataUpdated) onDataUpdated();
    }
  });
}
