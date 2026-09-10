import { describe, it, expect } from 'vitest';
import {
  VKU_BUILDINGS,
  VKU_ROOMS_MAP,
  VKU_EQUIPMENT_CATEGORIES,
  SURVEY_STATUSES
} from '../src/data/vku-data.js';

describe('VKU Field Survey Master Data (vku-data.js)', () => {
  it('1. Danh sách khu nhà (VKU_BUILDINGS) phải đầy đủ và có định danh id, name', () => {
    expect(VKU_BUILDINGS.length).toBeGreaterThanOrEqual(8);
    VKU_BUILDINGS.forEach(b => {
      expect(b.id).toBeDefined();
      expect(typeof b.id).toBe('string');
      expect(b.name).toBeDefined();
      expect(b.name.length).toBeGreaterThan(3);
    });
  });

  it('2. Mỗi tòa nhà phải có danh sách phòng học tương ứng trong VKU_ROOMS_MAP', () => {
    VKU_BUILDINGS.forEach(b => {
      const rooms = VKU_ROOMS_MAP[b.id];
      expect(rooms).toBeDefined();
      expect(Array.isArray(rooms)).toBe(true);
      expect(rooms.length).toBeGreaterThan(0);
    });
  });

  it('3. Danh mục hạng mục cơ sở vật chất (VKU_EQUIPMENT_CATEGORIES) có biểu tượng và tên rõ ràng', () => {
    expect(VKU_EQUIPMENT_CATEGORIES.length).toBeGreaterThanOrEqual(10);
    VKU_EQUIPMENT_CATEGORIES.forEach(c => {
      expect(c.id).toBeDefined();
      expect(c.name).toBeDefined();
      expect(c.icon).toBeDefined();
    });
  });

  it('4. Trạng thái khảo sát (SURVEY_STATUSES) phải có đủ 3 mức: good, warning, danger', () => {
    expect(SURVEY_STATUSES.length).toBe(3);
    const statusIds = SURVEY_STATUSES.map(s => s.id);
    expect(statusIds).toContain('good');
    expect(statusIds).toContain('warning');
    expect(statusIds).toContain('danger');
  });
});
