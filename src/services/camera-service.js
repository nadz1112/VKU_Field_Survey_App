import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { saveTempPhotoFile } from './filesystem-service.js';

/**
 * Chụp ảnh hiện trường bằng Capacitor Camera Plugin
 * Mở trực tiếp ứng dụng Máy ảnh gốc (Native Camera) trên điện thoại Android
 */
export async function capturePhotoFromCamera() {
  try {
    const photo = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl, // Lấy Data URL (Base64 JPEG)
      source: CameraSource.Camera, // Mở thẳng máy ảnh gốc
      width: 1024, // Giới hạn chiều rộng tối đa 1024px để tối ưu bộ nhớ
      correctOrientation: true,
    });

    const dataUrl = photo.dataUrl;
    const approxSizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);

    // Lưu tệp ảnh tạm vào bộ nhớ thiết bị qua Capacitor Filesystem
    let localFilePath = null;
    try {
      localFilePath = await saveTempPhotoFile(dataUrl);
    } catch (e) {
      console.warn('Lỗi lưu file tạm:', e);
    }

    return {
      dataUrl,
      format: photo.format || 'jpeg',
      sizeKb: approxSizeKb,
      capturedAt: new Date().toISOString(),
      filePath: localFilePath
    };
  } catch (error) {
    // Nếu người dùng nhấn nút Back/Hủy trên máy ảnh
    if (error.message && (error.message.includes('User cancelled') || error.message.includes('cancelled'))) {
      return null;
    }
    console.error('[Camera] Lỗi khi chụp ảnh:', error);
    throw error;
  }
}

/**
 * Hàm hỗ trợ nén ảnh cho web/fallback
 */
export async function compressImage(file, maxDimension = 1024, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const approxSizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);

        resolve({
          dataUrl,
          width,
          height,
          sizeKb: approxSizeKb,
          originalName: file.name,
          capturedAt: new Date().toISOString()
        });
      };
      img.onerror = () => reject(new Error('Không thể đọc file hình ảnh.'));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error('Lỗi khi đọc file.'));
    reader.readAsDataURL(file);
  });
}
