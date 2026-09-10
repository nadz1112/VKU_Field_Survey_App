import { describe, it, expect, vi } from 'vitest';
import { getCurrentLocation } from '../src/services/location-service.js';

describe('Geolocation Service (location-service.js)', () => {
  it('1. Lấy tọa độ GPS thành công khi được cấp quyền', async () => {
    // Mock navigator.geolocation
    const mockPosition = {
      coords: {
        latitude: 15.975239,
        longitude: 108.253127,
        accuracy: 6
      },
      timestamp: Date.now()
    };

    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: (success) => success(mockPosition)
      }
    });

    const location = await getCurrentLocation();
    expect(location.latitude).toBe(15.975239);
    expect(location.longitude).toBe(108.253127);
    expect(location.accuracy).toBe(6);
    expect(location.timestamp).toBeDefined();

    vi.unstubAllGlobals();
  });

  it('2. Báo lỗi thân thiện khi người dùng từ chối quyền truy cập GPS', async () => {
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: (success, error) => error({ code: 1, PERMISSION_DENIED: 1 })
      }
    });

    await expect(getCurrentLocation()).rejects.toThrow('Bạn đã từ chối quyền truy cập vị trí GPS.');

    vi.unstubAllGlobals();
  });

  it('3. Báo lỗi khi trình duyệt không hỗ trợ Geolocation', async () => {
    vi.stubGlobal('navigator', {});

    await expect(getCurrentLocation()).rejects.toThrow('Trình duyệt của bạn không hỗ trợ định vị GPS');

    vi.unstubAllGlobals();
  });
});
