import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

/**
 * Lấy tọa độ GPS hiện trường bằng Capacitor Geolocation Plugin
 * Tương tác trực tiếp với chip định vị GPS của thiết bị Android Native
 */
export async function getCurrentLocation() {
  try {
    // 1. Kiểm tra và yêu cầu cấp quyền GPS trên thiết bị Native
    if (Capacitor.isNativePlatform()) {
      let permStatus = await Geolocation.checkPermissions();
      if (permStatus.location !== 'granted') {
        permStatus = await Geolocation.requestPermissions();
        if (permStatus.location !== 'granted') {
          throw new Error('Bạn đã từ chối cấp quyền truy cập vị trí GPS trên thiết bị.');
        }
      }
    }

    // 2. Lấy tọa độ với độ chính xác cao
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    });

    return {
      latitude: Number(position.coords.latitude.toFixed(6)),
      longitude: Number(position.coords.longitude.toFixed(6)),
      accuracy: Math.round(position.coords.accuracy || 0),
      timestamp: new Date(position.timestamp).toISOString(),
    };
  } catch (error) {
    console.error('[Geolocation] Lỗi định vị GPS:', error);
    let message = error.message || 'Không thể lấy vị trí hiện tại.';
    if (error.code === 1 || message.includes('denied') || message.includes('permission')) {
      message = 'Bạn đã từ chối quyền truy cập vị trí GPS.';
    } else if (error.code === 3 || message.includes('timeout')) {
      message = 'Quá thời gian chờ lấy tọa độ GPS.';
    } else if (error.code === 2 || message.includes('unavailable') || message.includes('disabled') || message.includes('undefined')) {
      message = 'Trình duyệt của bạn không hỗ trợ định vị GPS hoặc tín hiệu GPS không khả dụng.';
    }
    throw new Error(message);
  }
}
