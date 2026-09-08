// Dịch vụ xử lý máy ảnh & nén ảnh hiện trường

/**
 * Nén hình ảnh về kích thước tối đa maxDimension (1024px) và chất lượng quality (0.8)
 * Giúp tối ưu lưu trữ trong IndexedDB và truyền dữ liệu khi mạng yếu.
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

        // Chuyển sang Base64 Data URL JPEG
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Tính kích thước xấp xỉ
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
