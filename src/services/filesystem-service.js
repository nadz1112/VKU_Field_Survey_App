import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

/**
 * Lưu file ảnh tạm vào bộ nhớ thiết bị qua Capacitor Filesystem
 */
export async function saveTempPhotoFile(base64DataUrl) {
  if (!Capacitor.isNativePlatform()) {
    // Nếu chạy trên Web, trả về id giả lập
    return `web_temp_${Date.now()}.jpg`;
  }

  try {
    const fileName = `survey_img_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.jpg`;
    // Tách phần base64 data ra khỏi data URL
    const base64Data = base64DataUrl.includes(',') 
      ? base64DataUrl.split(',')[1] 
      : base64DataUrl;

    const result = await Filesystem.writeFile({
      path: `survey_photos/${fileName}`,
      data: base64Data,
      directory: Directory.Data,
      recursive: true
    });

    console.log('[Filesystem] Đã lưu file ảnh vào thiết bị:', result.uri);
    return result.uri;
  } catch (error) {
    console.warn('[Filesystem] Không thể ghi file vào bộ nhớ thiết bị:', error);
    return null;
  }
}

/**
 * Đọc file ảnh từ bộ nhớ thiết bị
 */
export async function readTempPhotoFile(path) {
  if (!Capacitor.isNativePlatform()) return null;

  try {
    const contents = await Filesystem.readFile({
      path,
      directory: Directory.Data
    });
    return contents.data;
  } catch (error) {
    console.warn('[Filesystem] Không thể đọc file:', error);
    return null;
  }
}

/**
 * Xóa thư mục ảnh tạm
 */
export async function clearTempPhotoFiles() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await Filesystem.rmdir({
      path: 'survey_photos',
      directory: Directory.Data,
      recursive: true
    });
    console.log('[Filesystem] Đã dọn dẹp thư mục ảnh tạm');
  } catch (e) {
    // Thư mục có thể chưa tồn tại
  }
}
