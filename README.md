# VKU Field Survey App (PWA Offline-First)

Ứng dụng Web Tiến bộ (**Progressive Web App - PWA**) phục vụ công tác kiểm tra và khảo sát hiện trường cơ sở vật chất (phòng học, máy chiếu, điều hòa, phòng thực hành, thiết bị mạng, PCCC,...) tại **Trường Đại học Công nghệ Thông tin & Truyền thông Việt - Hàn (VKU)**.

Ứng dụng được thiết kế theo mô hình **Offline-First**, hoạt động tin cậy và mượt mà ngay cả khi thiết bị hoàn toàn không có kết nối internet (**Zero Network Connectivity**).

---

## 🌟 Tính Năng Nổi Bật

- 📱 **Chuẩn PWA Toàn Diện & Cài Đặt (Installability)**:
  - Cấu hình `manifest.webmanifest` chuẩn với biểu tượng ứng dụng riêng, hỗ trợ màn hình splash và maskable icon.
  - Hoạt động ở chế độ hiển thị toàn màn hình độc lập (**Standalone Display Mode**), không thanh địa chỉ trình duyệt.
  - Giao diện chuẩn **Mobile-First Responsive** với nhận diện thương hiệu VKU (Cam `#F26522`, Xanh Navy `#003366`).
- ⚡ **Kiến Trúc App Shell & Service Worker**:
  - Quản lý đầy đủ vòng đời Service Worker: `install` (lưu trước App Shell), `activate` (dọn cache cũ) và `fetch` (đón bắt request mạng).
  - Chiến lược **Cache-First** kết hợp **Stale-While-Revalidate** cho App Shell (HTML, CSS, JS, Icons), nạp tức thì trong 0 giây (Cold Start).
  - Chiến lược **Network-First with Cache Fallback** cho điều hướng và dữ liệu.
- 💾 **Lưu Trữ Dữ Liệu Ngoại Tuyến (IndexedDB)**:
  - Tích hợp thư viện `idb` lưu trữ bản ghi khảo sát và ảnh hiện trường bất đồng bộ.
  - Tự động nén ảnh chất lượng cao (Canvas compressor) trước khi lưu vào IndexedDB để tiết kiệm dung lượng.
- 🔄 **Hàng Đợi Đồng Bộ (Background Sync / Offline Queue)**:
  - Lưu trữ các thao tác nộp phiếu khi mất mạng vào kho `sync_queue`.
  - Tích hợp **Background Sync API** (`sync-surveys`) tự động đồng bộ ngầm khi thiết bị có kết nối mạng.
  - Cơ chế tự động lắng nghe sự kiện `online` để gửi dữ liệu tồn đọng lên máy chủ.
- 📍 **Hỗ Trợ Định Vị Hiện Trường (GPS Geolocation)**:
  - Tự động lấy tọa độ kinh độ/vĩ độ và độ chính xác hiện trường khi kiểm tra.
- 🚀 **Sẵn Sàng Đóng Gói Android APK (Capacitor Bridge)**:
  - Thư mục build độc lập `dist/`, tối ưu hóa 100% để chuyển đổi sang file APK Android bằng Capacitor.

---

## 🏗️ Cấu Trúc Thư Mục Dự Án

```text
VKU_Field_Survey_App/
├── index.html                   # HTML chính của App Shell
├── package.json                 # Cấu hình dự án & thư viện phụ thuộc
├── vite.config.js               # Cấu hình Vite bundler
├── public/                      # Thư mục tài nguyên tĩnh
│   ├── favicon.ico              # Favicon trình duyệt
│   ├── favicon.png              # Icon PWA nhỏ
│   ├── manifest.webmanifest     # File cấu hình PWA Manifest
│   ├── sw.js                    # Service Worker (Cache Storage + Background Sync)
│   └── icons/                   # Bộ icon VKU PWA (SVG, 192x192, 512x512, maskable)
├── src/
│   ├── main.js                  # Entry point chính: Khởi tạo app & đăng ký Service Worker
│   ├── styles/
│   │   ├── main.css             # Biến CSS VKU, reset, layout, navigation
│   │   └── components.css       # Style cho card, form, sync badges, modal, toast
│   ├── db/
│   │   └── database.js          # IndexedDB manager (Stores: surveys, sync_queue, settings)
│   ├── services/
│   │   ├── sw-register.js       # Đăng ký Service Worker & bắt sự kiện PWA Install Prompt
│   │   ├── sync-service.js      # Logic Offline Queue, Background Sync & Mock Server
│   │   ├── location-service.js  # Lấy tọa độ GPS hiện trường qua HTML5 Geolocation
│   │   └── camera-service.js    # Nén ảnh hiện trường tối ưu lưu trữ trong IndexedDB
│   ├── components/
│   │   ├── survey-form.js       # Biểu mẫu khảo sát cơ sở vật chất VKU
│   │   ├── survey-list.js       # Danh sách lịch sử khảo sát & bộ lọc
│   │   ├── sync-manager.js      # Bảng điều khiển kiểm tra hàng đợi & đồng bộ
│   │   ├── modal-detail.js      # Hộp thoại xem chi tiết phiếu và phóng to ảnh
│   │   ├── about-view.js        # Giới thiệu & kiểm tra tính tương thích thiết bị
│   │   └── toast.js             # Hệ thống thông báo trạng thái
│   └── data/
│       └── vku-data.js          # Danh mục khu nhà, phòng học và thiết bị tại VKU
├── report/
│   └── Technical_Report.md      # Khung Báo cáo kỹ thuật chi tiết (2-4 trang)
└── README.md
```

---

## 💻 Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Local Development)

### Yêu cầu tiên quyết:
- **Node.js**: phiên bản `>= 18.x`
- **npm**: phiên bản `>= 9.x`

### 1. Cài đặt các gói phụ thuộc:
```bash
npm install
```

### 2. Chạy môi trường phát triển (Dev Server):
```bash
npm run dev
```
Mở trình duyệt truy cập: `http://localhost:3000/`

### 3. Đóng gói mã nguồn (Build Production):
```bash
npm run build
```
Kết quả build được tạo trong thư mục `dist/` phục vụ deploy lên web hoặc chuyển giao cho Capacitor.

### 4. Xem thử bản build (Preview):
```bash
npm run preview
```

---

## 🧪 Hướng Dẫn Kiểm Thử Chế Độ Offline-First

1. Mở ứng dụng trên Google Chrome hoặc Microsoft Edge: `http://localhost:3000/`
2. Nhấn **F12** mở Chrome DevTools $\rightarrow$ Chuyển sang tab **Network** $\rightarrow$ Chọn mục **Offline** thay vì *No throttling* (hoặc tắt Wi-Fi của máy tính/điện thoại).
3. **Kiểm tra App Shell**: Nhấn **F5** để tải lại trang. Ứng dụng vẫn tải lên tức thì không gặp lỗi "No Internet" nhờ Service Worker đã lưu App Shell.
4. **Kiểm tra Lưu trữ Offline**:
   - Điền biểu mẫu khảo sát, chọn phòng, chọn thiết bị hư hỏng, chụp ảnh và bấm **🚀 Gửi khảo sát**.
   - Quan sát thông báo: *"Đang ngoại tuyến. Phiếu đã được lưu an toàn vào IndexedDB và xếp vào hàng đợi đồng bộ."*
   - Vào tab **Lịch sử**: Phiếu hiển thị với trạng thái `⏳ Chờ gửi`.
   - Vào tab **Đồng bộ**: Xem số lượng phiếu tồn đọng trong hàng đợi.
5. **Kiểm tra Tự Động Đồng Bộ**:
   - Trên DevTools Network, chuyển lại từ **Offline** sang **No throttling** (bật lại mạng).
   - Hệ thống tự động bắt sự kiện phục hồi kết nối, đẩy dữ liệu lên máy chủ và chuyển trạng thái phiếu sang `☁️ Đã đồng bộ`.

---

## 🚀 Hướng Dẫn Triển Khai Trực Tuyến (Deploy Live HTTPS)

Ứng dụng PWA bắt buộc phải chạy qua giao thức **HTTPS** để Service Worker và Manifest có thể kích hoạt tính năng cài đặt.

### Cách 1: Triển khai qua Vercel (Khuyên dùng)

1. Đẩy mã nguồn lên một GitHub Repository công khai (Public).
2. Đăng nhập vào [Vercel](https://vercel.com/) $\rightarrow$ Chọn **Add New...** $\rightarrow$ **Project**.
3. Chọn Repository GitHub của bạn.
4. Thiết lập dự án:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Nhấn **Deploy**. Chỉ trong 30 giây, bạn sẽ nhận được đường link HTTPS chính thức (ví dụ: `https://vku-field-survey-app.vercel.app`).

Hoặc dùng Vercel CLI từ máy tính:
```bash
npm i -g vercel
vercel
```

---

### Cách 2: Triển khai qua Cloudflare Pages

1. Đăng nhập vào [Cloudflare Dashboard](https://dash.cloudflare.com/) $\rightarrow$ Chọn **Workers & Pages** $\rightarrow$ **Create Application** $\rightarrow$ **Pages** $\rightarrow$ **Connect to Git**.
2. Chọn Repository GitHub của bạn.
3. Cấu hình Build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Nhấn **Save and Deploy**. Cloudflare Pages sẽ tự động cấp SSL HTTPS miễn phí toàn cầu.

---

## 📱 Lộ Trình Tuần Tiếp Theo: Đóng Gói Thành APK Android Bằng Capacitor

Vì ứng dụng được tổ chức với thư mục đầu ra chuẩn `dist/`, việc tích hợp sang **Capacitor Bridge** trong tuần kế tiếp sẽ cực kỳ đơn giản:

```bash
# 1. Cài đặt Capacitor Core và CLI
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Khởi tạo cấu hình Capacitor
npx cap init "VKU Field Survey" "vn.edu.vku.survey" --web-dir "dist"

# 3. Tạo thư mục Android Native
npx cap add android

# 4. Build web và đồng bộ vào Android
npm run build
npx cap sync android

# 5. Mở dự án bằng Android Studio để xuất file APK
npx cap open android
```

---

## 👥 Nhóm Tác Giả & Bản Quyền

- **Học phần**: Phát triển Ứng dụng Đa Nền tảng (PWA & Hybrid Mobile Apps)
- **Đơn vị**: Khoa Công nghệ Thông tin & Truyền thông - Trường Đại học CNTT & TT Việt - Hàn (VKU)
- **Giấy phép**: MIT License.
