import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isOnline,
  onSyncChange,
  registerBackgroundSync,
  syncAllPending
} from '../src/services/sync-service.js';
import {
  saveSurvey,
  addToSyncQueue,
  clearSyncQueue,
  getSyncQueue,
  getSurvey
} from '../src/db/database.js';

describe('Sync & Offline Queue Service (sync-service.js)', () => {
  beforeEach(async () => {
    await clearSyncQueue();
  });

  it('1. Kiểm tra trạng thái mạng isOnline()', () => {
    // Mặc định happy-dom navigator.onLine là boolean
    expect(typeof isOnline()).toBe('boolean');
  });

  it('2. Đăng ký lắng nghe sự kiện onSyncChange', () => {
    const mockListener = vi.fn();
    const unsubscribe = onSyncChange(mockListener);

    expect(typeof unsubscribe).toBe('function');
    unsubscribe();
  });

  it('3. Xử lý Background Sync an toàn khi trình duyệt không hỗ trợ', async () => {
    // Trong môi trường happy-dom không có SyncManager
    const supported = await registerBackgroundSync();
    expect(supported).toBe(false);
  });

  it('4. Đồng bộ dữ liệu thành công từ Sync Queue khi có mạng', async () => {
    // Đảm bảo navigator.onLine là true
    vi.stubGlobal('navigator', { ...navigator, onLine: true });

    const testItem = {
      id: 'survey_sync_test_01',
      building: 'KHU_A',
      room: 'A.101',
      status: 'danger',
      syncStatus: 'pending',
      createdAt: new Date().toISOString()
    };

    await saveSurvey(testItem);
    await addToSyncQueue(testItem);

    let queue = await getSyncQueue();
    expect(queue.length).toBe(1);

    const result = await syncAllPending();
    expect(result.success).toBe(true);
    expect(result.syncedCount).toBe(1);

    // Sau khi sync, hàng đợi phải được xóa
    queue = await getSyncQueue();
    expect(queue.length).toBe(0);

    // Phiếu trong DB phải được cập nhật thành synced
    const updated = await getSurvey('survey_sync_test_01');
    expect(updated.syncStatus).toBe('synced');
    expect(updated.syncedAt).toBeDefined();

    vi.unstubAllGlobals();
  });
});
