import { getAllSurveys } from '../db/database.js';
import { openSurveyDetailModal } from './modal-detail.js';

let currentFilter = 'all';
let currentSearchTerm = '';

export async function renderSurveyList(containerElement, onNavigateToNewSurvey) {
  const allSurveys = await getAllSurveys();

  containerElement.innerHTML = `
    <div class="card" style="padding: 14px 16px; margin-bottom: 12px;">
      <div style="display: flex; gap: 8px; margin-bottom: 10px;">
        <input 
          type="text" 
          id="survey-search-input" 
          class="form-control" 
          placeholder="🔍 Tìm theo phòng, tòa nhà, thiết bị..." 
          value="${currentSearchTerm}"
          style="padding: 8px 12px; font-size: 0.88rem;"
        />
      </div>

      <div class="filter-tabs" id="survey-filter-tabs">
        <button class="filter-btn ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">
          Tất cả (${allSurveys.length})
        </button>
        <button class="filter-btn ${currentFilter === 'pending' ? 'active' : ''}" data-filter="pending">
          ⏳ Chờ gửi (${allSurveys.filter(s => s.syncStatus === 'pending').length})
        </button>
        <button class="filter-btn ${currentFilter === 'synced' ? 'active' : ''}" data-filter="synced">
          ☁️ Đã đồng bộ (${allSurveys.filter(s => s.syncStatus === 'synced').length})
        </button>
        <button class="filter-btn ${currentFilter === 'draft' ? 'active' : ''}" data-filter="draft">
          📝 Nháp (${allSurveys.filter(s => s.syncStatus === 'draft').length})
        </button>
      </div>
    </div>

    <div id="survey-cards-container"></div>
  `;

  const searchInput = containerElement.querySelector('#survey-search-input');
  const filterTabs = containerElement.querySelector('#survey-filter-tabs');
  const cardsContainer = containerElement.querySelector('#survey-cards-container');

  function updateCards() {
    let filtered = allSurveys;

    if (currentFilter !== 'all') {
      filtered = filtered.filter(s => s.syncStatus === currentFilter);
    }

    if (currentSearchTerm.trim()) {
      const q = currentSearchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        (s.room && s.room.toLowerCase().includes(q)) ||
        (s.buildingName && s.buildingName.toLowerCase().includes(q)) ||
        (s.categoryName && s.categoryName.toLowerCase().includes(q)) ||
        (s.notes && s.notes.toLowerCase().includes(q))
      );
    }

    if (filtered.length === 0) {
      cardsContainer.innerHTML = `
        <div class="card" style="text-align: center; padding: 36px 20px;">
          <div style="font-size: 2.5rem; margin-bottom: 10px;">📋</div>
          <h3 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 6px;">Không tìm thấy phiếu khảo sát nào</h3>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 18px;">
            ${currentFilter !== 'all' ? 'Chưa có bản ghi nào trong mục này.' : 'Hãy tạo phiếu khảo sát cơ sở vật chất đầu tiên.'}
          </p>
          <button id="btn-empty-create" class="btn btn-primary" style="margin: 0 auto; padding: 10px 18px; font-size: 0.85rem;">
            ➕ Tạo phiếu khảo sát mới
          </button>
        </div>
      `;
      const btnCreate = cardsContainer.querySelector('#btn-empty-create');
      if (btnCreate && onNavigateToNewSurvey) {
        btnCreate.addEventListener('click', onNavigateToNewSurvey);
      }
      return;
    }

    cardsContainer.innerHTML = filtered.map(survey => {
      let statusBadge = '';
      if (survey.status === 'good') {
        statusBadge = '<span class="badge badge-good">✅ Bình thường</span>';
      } else if (survey.status === 'warning') {
        statusBadge = '<span class="badge badge-warning">⚠️ Cần bảo trì</span>';
      } else {
        statusBadge = '<span class="badge badge-danger">🚨 Hỏng nặng</span>';
      }

      let syncBadge = '';
      if (survey.syncStatus === 'synced') {
        syncBadge = '<span class="badge badge-synced">☁️ Đã đồng bộ</span>';
      } else if (survey.syncStatus === 'pending') {
        syncBadge = '<span class="badge badge-pending">⏳ Chờ gửi</span>';
      } else {
        syncBadge = '<span class="badge badge-draft">📝 Nháp</span>';
      }

      const photoCountBadge = (survey.photos && survey.photos.length > 0)
        ? `<span style="font-size: 0.75rem; background: var(--bg-input); padding: 2px 6px; border-radius: 4px;">📷 ${survey.photos.length} ảnh</span>`
        : '';

      const gpsBadge = survey.location
        ? `<span style="font-size: 0.75rem; background: var(--bg-input); padding: 2px 6px; border-radius: 4px;">📍 GPS</span>`
        : '';

      return `
        <div class="survey-item" data-id="${survey.id}">
          <div class="survey-item-header">
            <div>
              <div class="survey-location">${survey.room || 'Chưa rõ phòng'} - ${survey.buildingName || ''}</div>
              <div class="survey-category">${survey.categoryIcon || '📋'} ${survey.categoryName || 'Thiết bị'}</div>
            </div>
            ${statusBadge}
          </div>

          <div style="display: flex; gap: 6px; align-items: center;">
            ${photoCountBadge}
            ${gpsBadge}
            ${survey.notes ? `<span style="font-size: 0.75rem; color: var(--text-secondary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 180px;">💬 ${survey.notes}</span>` : ''}
          </div>

          <div class="survey-meta">
            <div>${syncBadge}</div>
            <div>${new Date(survey.createdAt).toLocaleDateString('vi-VN')} ${new Date(survey.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>
      `;
    }).join('');

    // Bắt sự kiện click vào từng card để mở chi tiết
    cardsContainer.querySelectorAll('.survey-item').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const item = allSurveys.find(s => s.id === id);
        if (item) {
          openSurveyDetailModal(item, () => {
            renderSurveyList(containerElement, onNavigateToNewSurvey);
          });
        }
      });
    });
  }

  // Sự kiện tìm kiếm
  searchInput.addEventListener('input', (e) => {
    currentSearchTerm = e.target.value;
    updateCards();
  });

  // Sự kiện chuyển bộ lọc
  filterTabs.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      filterTabs.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      updateCards();
    });
  });

  updateCards();
}
