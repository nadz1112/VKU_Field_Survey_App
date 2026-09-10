import { describe, it, expect, vi } from 'vitest';
import { Geolocation } from '@capacitor/geolocation';
import { getCurrentLocation } from '../src/services/location-service.js';

vi.mock('@capacitor/geolocation', () => ({
  Geolocation: {
    checkPermissions: vi.fn(),
    requestPermissions: vi.fn(),
    getCurrentPosition: vi.fn()
  }
}));

describe('Geolocation Service (location-service.js)', () => {
  it('1. Lấy tọa độ GPS thành công khi được cấp quyền', async () => {
    vi.mocked(Geolocation.getCurrentPosition).mockResolvedValue({
      coords: {
        latitude: 15.975239,
        longitude: 108.253127,
        accuracy: 6
      },
      timestamp: Date.now()
    });

    const location = await getCurrentLocation();
    expect(location.latitude).toBe(15.975239);
    expect(location.longitude).toBe(108.253127);
    expect(location.accuracy).toBe(6);
    expect(location.timestamp).toBeDefined();
  });

  it('2. Báo lỗi thân thiện khi người dùng từ chối quyền truy cập GPS', async () => {
    vi.mocked(Geolocation.getCurrentPosition).mockRejectedValue(new Error('User denied Geolocation'));

    await expect(getCurrentLocation()).rejects.toThrow('Bạn đã từ chối quyền truy cập vị trí GPS.');
  });

  it('3. Báo lỗi khi không thể lấy vị trí GPS hoặc tín hiệu không khả dụng', async () => {
    vi.mocked(Geolocation.getCurrentPosition).mockRejectedValue(new Error('Location unavailable'));

    await expect(getCurrentLocation()).rejects.toThrow('Trình duyệt của bạn không hỗ trợ định vị GPS hoặc tín hiệu GPS không khả dụng.');
  });
});
