import { deleteSurvey } from '../db/database.js';
import { showToast } from './toast.js';

let modalOverlay = null;

export function initDetailModal(onDataChanged) {
  modalOverlay = document.getElementById('detail-modal');
  if (!modalOverlay) return;

  const closeBtn = modalOverlay.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });
}

export function openSurveyDetailModal(survey, onDataChanged) {
  if (!modalOverlay) {
    modalOverlay = document.getElementById('detail-modal');
  }
  if (!modalOverlay) return;

  const modalBody = modalOverlay.querySelector('.modal-body');
  const modalTitle = modalOverlay.querySelector('.modal-title');

  modalTitle.textContent = `${survey.room || 'Chưa rõ'} - ${survey.buildingName || 'Khu nhà'}`;

  let statusBadgeHtml = '';
  if (survey.status === 'good') {
    statusBadgeHtml = '<span class="badge badge-good">✅ Bình thường</span>';
  } else if (survey.status === 'warning') {
    statusBadgeHtml = '<span class="badge badge-warning">⚠️ Cần bảo trì</span>';
  } else {
    statusBadgeHtml = '<span class="badge badge-danger">🚨 Hỏng nặng / Khẩn cấp</span>';
  }

  let syncBadgeHtml = '';
  if (survey.syncStatus === 'synced') {
    syncBadgeHtml = '<span class="badge badge-synced">☁️ Đã đồng bộ máy chủ</span>';
  } else if (survey.syncStatus === 'pending') {
    syncBadgeHtml = '<span class="badge badge-pending">⏳ Chờ đồng bộ (Offline)</span>';
  } else {
    syncBadgeHtml = '<span class="badge badge-draft">📝 Bản nháp</span>';
  }

  const photosHtml = (survey.photos && survey.photos.length > 0)
    ? `
      <div style="margin-top: 14px;">
        <label class="form-label">Hình ảnh hiện trường (${survey.photos.length}):</label>
        <div class="photo-preview-grid" style="grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));">
          ${survey.photos.map((p, idx) => `
            <a href="${p.dataUrl}" target="_blank" title="Xem ảnh gốc" class="photo-preview-item" style="cursor: zoom-in;">
              <img src="${p.dataUrl}" alt="Ảnh lỗi ${idx + 1}" />
            </a>
          `).join('')}
        </div>
      </div>
    `
    : '<div style="margin-top: 12px; font-size: 0.85rem; color: var(--text-muted);">Không có hình ảnh đính kèm.</div>';

  const gpsHtml = survey.location && survey.location.latitude
    ? `
      <div class="gps-box" style="margin-top: 12px;">
        <div class="gps-info">
          <div>📍 Tọa độ GPS: <b>${survey.location.latitude}, ${survey.location.longitude}</b></div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">Độ chính xác: ±${survey.location.accuracy || 0}m</div>
        </div>
        <a href="https://maps.google.com/?q=${survey.location.latitude},${survey.location.longitude}" target="_blank" class="btn-gps" style="text-decoration: none;">
          Mở bản đồ
        </a>
      </div>
    `
    : '';

  modalBody.innerHTML = `
    <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">
      ${statusBadgeHtml}
      ${syncBadgeHtml}
    </div>

    <div style="background: var(--bg-input); padding: 14px; border-radius: var(--radius-md); font-size: 0.9rem; line-height: 1.6;">
      <div><b>Hạng mục:</b> ${survey.categoryName || 'Chưa phân loại'}</div>
      <div><b>Khu vực:</b> ${survey.buildingName || ''} - ${survey.room || ''}</div>
      <div><b>Người kiểm tra:</b> ${survey.surveyorName || 'Cán bộ khảo sát VKU'}</div>
      <div><b>Thời gian tạo:</b> ${new Date(survey.createdAt).toLocaleString('vi-VN')}</div>
      ${survey.syncedAt ? `<div><b>Thời gian đồng bộ:</b> ${new Date(survey.syncedAt).toLocaleString('vi-VN')}</div>` : ''}
    </div>

    ${gpsHtml}

    <div style="margin-top: 14px;">
      <label class="form-label">Ghi chú chi tiết sự cố:</label>
      <div style="background: var(--bg-input); padding: 12px; border-radius: var(--radius-md); font-size: 0.9rem; white-space: pre-wrap;">
        ${survey.notes ? survey.notes : '<i>Không có ghi chú thêm.</i>'}
      </div>
    </div>

    ${photosHtml}

    <div style="margin-top: 24px; display: flex; gap: 10px; justify-content: flex-end;">
      <button id="btn-delete-survey" class="btn" style="background: var(--color-danger-bg); color: var(--color-danger); border: 1px solid rgba(239,68,68,0.3); padding: 10px 14px;">
        🗑️ Xóa phiếu
      </button>
      <button id="btn-close-modal" class="btn btn-secondary" style="padding: 10px 18px;">
        Đóng
      </button>
    </div>
  `;

  // Gắn sự kiện Xóa
  const deleteBtn = modalBody.querySelector('#btn-delete-survey');
  deleteBtn.addEventListener('click', async () => {
    if (confirm('Bạn có chắc chắn muốn xóa bản ghi khảo sát này?')) {
      await deleteSurvey(survey.id);
      showToast('Đã xóa phiếu khảo sát.', 'warning');
      closeModal();
      if (onDataChanged) onDataChanged();
    }
  });

  const closeBottomBtn = modalBody.querySelector('#btn-close-modal');
  closeBottomBtn.addEventListener('click', closeModal);

  modalOverlay.classList.add('active');
}

export function closeModal() {
  if (modalOverlay) {
    modalOverlay.classList.remove('active');
  }
}
