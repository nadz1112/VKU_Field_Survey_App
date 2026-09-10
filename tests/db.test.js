import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveSurvey,
  getSurvey,
  getAllSurveys,
  deleteSurvey,
  addToSyncQueue,
  getSyncQueue,
  removeFromSyncQueue,
  clearSyncQueue,
  getSetting,
  saveSetting,
  getStorageStats
} from '../src/db/database.js';

describe('IndexedDB Database Layer (database.js)', () => {
  const mockSurvey = {
    id: 'test_survey_01',
    surveyorName: 'Nguyễn Văn Test',
    building: 'KHU_V',
    buildingName: 'Khu V',
    room: 'V.201',
    category: 'PROJECTOR',
    categoryName: 'Máy chiếu',
    status: 'warning',
    notes: 'Điều khiển hết pin',
    location: { latitude: 15.9752, longitude: 108.2531, accuracy: 5 },
    photos: [],
    createdAt: new Date().toISOString(),
    syncStatus: 'pending'
  };

  it('1. Nên lưu và lấy lại thành công một phiếu khảo sát', async () => {
    const saved = await saveSurvey(mockSurvey);
    expect(saved.id).toBe('test_survey_01');
    expect(saved.updatedAt).toBeDefined();

    const fetched = await getSurvey('test_survey_01');
    expect(fetched).toBeDefined();
    expect(fetched.room).toBe('V.201');
    expect(fetched.status).toBe('warning');
  });

  it('2. Nên lấy danh sách tất cả các phiếu khảo sát và sắp xếp theo ngày tạo', async () => {
    await saveSurvey({
      ...mockSurvey,
      id: 'survey_older',
      createdAt: new Date(Date.now() - 10000).toISOString()
    });
    await saveSurvey({
      ...mockSurvey,
      id: 'survey_newer',
      createdAt: new Date().toISOString()
    });

    const all = await getAllSurveys();
    expect(all.length).toBeGreaterThanOrEqual(2);
    // Bản ghi mới hơn phải đứng trước
    const newerIndex = all.findIndex(s => s.id === 'survey_newer');
    const olderIndex = all.findIndex(s => s.id === 'survey_older');
    expect(newerIndex).toBeLessThan(olderIndex);
  });

  it('3. Nên xóa thành công một phiếu khảo sát và dọn khỏi queue', async () => {
    await saveSurvey({ ...mockSurvey, id: 'survey_to_delete' });
    await addToSyncQueue({ ...mockSurvey, id: 'survey_to_delete' });

    await deleteSurvey('survey_to_delete');
    const checkSurvey = await getSurvey('survey_to_delete');
    expect(checkSurvey).toBeUndefined();

    const queue = await getSyncQueue();
    expect(queue.some(q => q.id === 'survey_to_delete')).toBe(false);
  });

  it('4. Quản lý hàng đợi đồng bộ (Sync Queue): thêm, lấy và xóa', async () => {
    await clearSyncQueue();
    const item = await addToSyncQueue(mockSurvey);
    expect(item.type).toBe('CREATE_SURVEY');
    expect(item.retryCount).toBe(0);

    let queue = await getSyncQueue();
    expect(queue.length).toBe(1);
    expect(queue[0].id).toBe(mockSurvey.id);

    await removeFromSyncQueue(mockSurvey.id);
    queue = await getSyncQueue();
    expect(queue.length).toBe(0);
  });

  it('5. Lưu và lấy cấu hình người dùng (Settings)', async () => {
    await saveSetting('surveyor_name', 'Trần Văn Tester');
    const name = await getSetting('surveyor_name');
    expect(name).toBe('Trần Văn Tester');

    const defaultVal = await getSetting('non_existing_key', 'Default');
    expect(defaultVal).toBe('Default');
  });

  it('6. Thống kê bộ nhớ và trạng thái các phiếu (getStorageStats)', async () => {
    await saveSurvey({ ...mockSurvey, id: 's_pending', syncStatus: 'pending' });
    await saveSurvey({ ...mockSurvey, id: 's_synced', syncStatus: 'synced' });
    await saveSurvey({ ...mockSurvey, id: 's_draft', syncStatus: 'draft' });

    const stats = await getStorageStats();
    expect(stats.totalSurveys).toBeGreaterThanOrEqual(3);
    expect(stats.pendingCount).toBeGreaterThanOrEqual(1);
    expect(stats.syncedCount).toBeGreaterThanOrEqual(1);
    expect(stats.draftCount).toBeGreaterThanOrEqual(1);
    expect(stats.storageUsageMB).toBeDefined();
  });
});
