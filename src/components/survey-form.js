import {
  VKU_BUILDINGS,
  VKU_ROOMS_MAP,
  VKU_EQUIPMENT_CATEGORIES,
  SURVEY_STATUSES
} from '../data/vku-data.js';
import { saveSurvey, addToSyncQueue, getSetting, saveSetting } from '../db/database.js';
import { getCurrentLocation } from '../services/location-service.js';
import { capturePhotoFromCamera } from '../services/camera-service.js';
import { isOnline, syncAllPending, registerBackgroundSync } from '../services/sync-service.js';
import { showToast } from './toast.js';

let currentPhotos = [];
let currentLocation = null;

export async function initSurveyForm(containerElement, onSurveySaved) {
  const savedSurveyor = await getSetting('surveyor_name', '');

  // Render form HTML
  containerElement.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">📝 Phiếu Kiểm Tra Cơ Sở Vật Chất</h2>
      </div>

      <form id="field-survey-form">
        <!-- Người kiểm tra -->
        <div class="form-group">
          <label class="form-label" for="surveyor-name">
            Họ tên người kiểm tra / Khảo sát viên <span class="required">*</span>
          </label>
          <input 
            type="text" 
            id="surveyor-name" 
            class="form-control" 
            placeholder="Ví dụ: Nguyễn Văn A - Lớp 21IT..." 
            value="${savedSurveyor}"
            required
          />
        </div>

        <!-- Chọn Khu nhà & Phòng -->
        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label class="form-label" for="select-building">
              Khu vực / Tòa nhà <span class="required">*</span>
            </label>
            <select id="select-building" class="form-control" required>
              <option value="">-- Chọn tòa nhà --</option>
              ${VKU_BUILDINGS.map(b => `<option value="${b.id}">${b.name}</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="form-label" for="select-room">
              Phòng / Vị trí cụ thể <span class="required">*</span>
            </label>
            <select id="select-room" class="form-control" required disabled>
              <option value="">-- Chọn khu trước --</option>
            </select>
          </div>
        </div>

        <!-- Hạng mục cơ sở vật chất -->
        <div class="form-group">
          <label class="form-label" for="select-category">
            Hạng mục thiết bị cần khảo sát <span class="required">*</span>
          </label>
          <select id="select-category" class="form-control" required>
            <option value="">-- Chọn hạng mục kiểm tra --</option>
            ${VKU_EQUIPMENT_CATEGORIES.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}
          </select>
        </div>

        <!-- Tình trạng thiết bị (Status radio cards) -->
        <div class="form-group">
          <label class="form-label">
            Tình trạng ghi nhận hiện trường <span class="required">*</span>
          </label>
          <div class="status-options">
            <label class="status-option-label selected-good" id="status-label-good">
              <input type="radio" name="survey-status" value="good" checked />
              <span class="status-option-text">✅ Hoạt động tốt / Bình thường</span>
            </label>

            <label class="status-option-label" id="status-label-warning">
              <input type="radio" name="survey-status" value="warning" />
              <span class="status-option-text">⚠️ Hư hỏng nhẹ / Cần bảo trì</span>
            </label>

            <label class="status-option-label" id="status-label-danger">
              <input type="radio" name="survey-status" value="danger" />
              <span class="status-option-text">🚨 Hỏng nặng / Mất an toàn / Thay thế gấp</span>
            </label>
          </div>
        </div>

        <!-- Định vị GPS -->
        <div class="form-group">
          <label class="form-label">Tọa độ GPS hiện trường</label>
          <div class="gps-box">
            <div class="gps-info" id="gps-display">
              Chưa lấy tọa độ GPS hiện trường.
            </div>
            <button type="button" id="btn-get-gps" class="btn-gps">
              📍 Lấy tọa độ
            </button>
          </div>
        </div>

        <!-- Chụp & Đính kèm ảnh hiện trường bằng Native Camera -->
        <div class="form-group">
          <label class="form-label">Hình ảnh minh chứng hiện trường (Chụp trực tiếp từ máy ảnh)</label>
          <div class="photo-upload-container" id="photo-dropzone">
            <div class="photo-upload-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
              <div style="font-weight: 600; font-size: 0.9rem;">📷 Bấm để Mở Máy Ảnh Chụp Hiện Trường</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Sử dụng Capacitor Camera Native Plugin, tự động tối ưu lưu trữ</div>
            </div>
          </div>
          <div class="photo-preview-grid" id="photo-preview-grid"></div>
        </div>

        <!-- Mô tả & Ghi chú -->
        <div class="form-group">
          <label class="form-label" for="survey-notes">
            Mô tả chi tiết sự cố / Ghi chú bổ sung
          </label>
          <textarea 
            id="survey-notes" 
            class="form-control" 
            placeholder="Ví dụ: Máy chiếu Panasonic bị ố vàng góc trái, điều khiển hết pin, cần thay bóng đèn LED số 2..."
          ></textarea>
        </div>

        <!-- Nút gửi & Lưu nháp -->
        <div class="form-actions">
          <button type="button" id="btn-save-draft" class="btn btn-secondary">
            💾 Lưu bản nháp
          </button>
          <button type="submit" id="btn-submit-survey" class="btn btn-primary">
            🚀 Gửi khảo sát
          </button>
        </div>
      </form>
    </div>
  `;

  // === CÁC SỰ KIỆN TƯƠNG TÁC TRÊN FORM ===

  const form = containerElement.querySelector('#field-survey-form');
  const buildingSelect = containerElement.querySelector('#select-building');
  const roomSelect = containerElement.querySelector('#select-room');
  const gpsDisplay = containerElement.querySelector('#gps-display');
  const getGpsBtn = containerElement.querySelector('#btn-get-gps');
  const photoDropzone = containerElement.querySelector('#photo-dropzone');
  const previewGrid = containerElement.querySelector('#photo-preview-grid');
  const saveDraftBtn = containerElement.querySelector('#btn-save-draft');
  const surveyorInput = containerElement.querySelector('#surveyor-name');

  // Đổi tòa nhà -> Cập nhật danh sách phòng
  buildingSelect.addEventListener('change', () => {
    const buildingId = buildingSelect.value;
    roomSelect.innerHTML = '<option value="">-- Chọn phòng / vị trí --</option>';
    if (buildingId && VKU_ROOMS_MAP[buildingId]) {
      roomSelect.disabled = false;
      VKU_ROOMS_MAP[buildingId].forEach(room => {
        const opt = document.createElement('option');
        opt.value = room;
        opt.textContent = room;
        roomSelect.appendChild(opt);
      });
    } else {
      roomSelect.disabled = true;
    }
  });

  // Tùy biến kiểu viền theo trạng thái Radio đã chọn
  const statusRadios = containerElement.querySelectorAll('input[name="survey-status"]');
  statusRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      ['good', 'warning', 'danger'].forEach(type => {
        const label = containerElement.querySelector(`#status-label-${type}`);
        if (label) label.className = 'status-option-label';
      });
      const checkedVal = form.querySelector('input[name="survey-status"]:checked').value;
      const activeLabel = containerElement.querySelector(`#status-label-${checkedVal}`);
      if (activeLabel) activeLabel.classList.add(`selected-${checkedVal}`);
    });
  });

  // Sự kiện bấm lấy GPS
  getGpsBtn.addEventListener('click', async () => {
    getGpsBtn.disabled = true;
    getGpsBtn.textContent = '⏳ Đang quét...';
    try {
      currentLocation = await getCurrentLocation();
      gpsDisplay.innerHTML = `
        <div class="gps-coords">📍 ${currentLocation.latitude}, ${currentLocation.longitude}</div>
        <div style="font-size: 0.72rem; color: var(--color-success); font-weight: 600;">
          Độ chính xác: ±${currentLocation.accuracy}m (${new Date().toLocaleTimeString('vi-VN')})
        </div>
      `;
      showToast('Đã ghi nhận tọa độ GPS hiện trường.', 'success');
    } catch (err) {
      gpsDisplay.innerHTML = `<span style="color: var(--color-danger);">${err.message}</span>`;
      showToast(err.message, 'danger');
    } finally {
      getGpsBtn.disabled = false;
      getGpsBtn.textContent = '📍 Cập nhật GPS';
    }
  });

  // Sự kiện chụp ảnh hiện trường trực tiếp qua Capacitor Camera
  photoDropzone.addEventListener('click', async () => {
    try {
      const photo = await capturePhotoFromCamera();
      if (photo) {
        currentPhotos.push(photo);
        renderPhotoPreviews(previewGrid);
        showToast('Đã chụp và lưu ảnh hiện trường thành công!', 'success');
      }
    } catch (err) {
      showToast('Lỗi khi mở máy ảnh: ' + (err.message || err), 'danger');
    }
  });

  function renderPhotoPreviews(gridEl) {
    gridEl.innerHTML = '';
    currentPhotos.forEach((photo, idx) => {
      const item = document.createElement('div');
      item.className = 'photo-preview-item';
      item.innerHTML = `
        <img src="${photo.dataUrl}" alt="Ảnh hiện trường ${idx + 1}" />
        <button type="button" class="btn-remove-photo" data-idx="${idx}">×</button>
      `;
      const removeBtn = item.querySelector('.btn-remove-photo');
      removeBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        currentPhotos.splice(idx, 1);
        renderPhotoPreviews(gridEl);
      });
      gridEl.appendChild(item);
    });
  }

  // Hàm gom dữ liệu form
  function collectFormData(isDraft = false) {
    const buildingId = buildingSelect.value;
    const buildingObj = VKU_BUILDINGS.find(b => b.id === buildingId);
    const categoryId = form.querySelector('#select-category').value;
    const categoryObj = VKU_EQUIPMENT_CATEGORIES.find(c => c.id === categoryId);
    const statusVal = form.querySelector('input[name="survey-status"]:checked').value;
    const notesVal = form.querySelector('#survey-notes').value.trim();
    const surveyor = surveyorInput.value.trim();

    return {
      id: 'survey_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      surveyorName: surveyor,
      building: buildingId,
      buildingName: buildingObj ? buildingObj.name : '',
      room: roomSelect.value,
      category: categoryId,
      categoryName: categoryObj ? categoryObj.name : '',
      categoryIcon: categoryObj ? categoryObj.icon : '📋',
      status: statusVal,
      notes: notesVal,
      location: currentLocation,
      photos: [...currentPhotos],
      createdAt: new Date().toISOString(),
      syncStatus: isDraft ? 'draft' : (isOnline() ? 'synced' : 'pending'),
      syncedAt: (!isDraft && isOnline()) ? new Date().toISOString() : null
    };
  }

  function resetForm() {
    buildingSelect.value = '';
    roomSelect.innerHTML = '<option value="">-- Chọn khu trước --</option>';
    roomSelect.disabled = true;
    form.querySelector('#select-category').value = '';
    form.querySelector('#survey-notes').value = '';
    form.querySelector('input[name="survey-status"][value="good"]').checked = true;
    ['warning', 'danger'].forEach(t => {
      const l = containerElement.querySelector(`#status-label-${t}`);
      if (l) l.className = 'status-option-label';
    });
    const goodLabel = containerElement.querySelector('#status-label-good');
    if (goodLabel) goodLabel.className = 'status-option-label selected-good';

    currentPhotos = [];
    currentLocation = null;
    gpsDisplay.innerHTML = 'Chưa lấy tọa độ GPS hiện trường.';
    previewGrid.innerHTML = '';
  }

  // Xử lý Lưu bản nháp
  saveDraftBtn.addEventListener('click', async () => {
    if (!surveyorInput.value.trim()) {
      showToast('Vui lòng nhập họ tên người kiểm tra.', 'warning');
      surveyorInput.focus();
      return;
    }
    await saveSetting('surveyor_name', surveyorInput.value.trim());

    const draftData = collectFormData(true);
    await saveSurvey(draftData);
    showToast('Đã lưu bản nháp vào IndexedDB!', 'success');
    resetForm();
    if (onSurveySaved) onSurveySaved();
  });

  // Xử lý Nộp phiếu khảo sát
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!buildingSelect.value || !roomSelect.value || !form.querySelector('#select-category').value) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc (*).', 'warning');
      return;
    }

    await saveSetting('surveyor_name', surveyorInput.value.trim());

    const surveyData = collectFormData(false);

    if (isOnline()) {
      // Đang có mạng: Lưu trực tiếp trạng thái Synced
      surveyData.syncStatus = 'synced';
      surveyData.syncedAt = new Date().toISOString();
      await saveSurvey(surveyData);
      showToast('Đã gửi phiếu khảo sát thành công lên máy chủ!', 'success');
    } else {
      // Đang Offline: Lưu vào IndexedDB và đưa vào Sync Queue
      surveyData.syncStatus = 'pending';
      await saveSurvey(surveyData);
      await addToSyncQueue(surveyData);
      
      // Đăng ký Background Sync nếu trình duyệt hỗ trợ
      registerBackgroundSync();

      showToast('📴 Đang ngoại tuyến. Phiếu đã được lưu an toàn vào IndexedDB và xếp vào hàng đợi đồng bộ.', 'warning', 4500);
    }

    resetForm();
    if (onSurveySaved) onSurveySaved();
  });
}
