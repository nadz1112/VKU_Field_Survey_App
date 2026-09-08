// Dịch vụ định vị GPS hiện trường

export async function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Trình duyệt của bạn không hỗ trợ định vị GPS (Geolocation).'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
          accuracy: Math.round(position.coords.accuracy),
          timestamp: new Date(position.timestamp).toISOString(),
        });
      },
      (error) => {
        let message = 'Không thể lấy vị trí hiện tại.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Bạn đã từ chối quyền truy cập vị trí GPS.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Tín hiệu GPS hiện trường không khả dụng.';
            break;
          case error.TIMEOUT:
            message = 'Quá thời gian chờ lấy tọa độ GPS.';
            break;
        }
        reject(new Error(message));
      },
      options
    );
  });
}
