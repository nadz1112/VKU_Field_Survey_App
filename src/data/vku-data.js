// Danh mục dữ liệu khảo sát cơ sở vật chất Đại học CNTT & Truyền thông Việt - Hàn (VKU)

export const VKU_BUILDINGS = [
  { id: 'KHU_V', name: 'Khu V - Tòa nhà Điều hành & Giảng đường trung tâm' },
  { id: 'KHU_A', name: 'Khu A - Khu Giảng đường Lý thuyết' },
  { id: 'KHU_B', name: 'Khu B - Tòa nhà Công nghệ & Phòng Lab thực hành' },
  { id: 'KHU_C', name: 'Khu C - Khu Giảng đường & Hội trường lớn' },
  { id: 'KHU_K', name: 'Khu K - Ký túc xá sinh viên VKU' },
  { id: 'THU_VIEN', name: 'Thư viện số & Trung tâm Đổi mới sáng tạo (MakerSpace)' },
  { id: 'THE_THAO', name: 'Khu phức hợp Thể thao & Sân bóng' },
  { id: 'CAN_TIN', name: 'Nhà ăn Sinh viên & Căn tin dịch vụ' },
  { id: 'BAI_XE', name: 'Bãi đỗ xe Giảng viên & Sinh viên' },
  { id: 'KHUON_VIEN', name: 'Khuôn viên cảnh quan & Đường nội bộ' }
];

export const VKU_ROOMS_MAP = {
  KHU_V: ['V.101', 'V.102', 'V.201', 'V.202', 'V.301', 'V.302', 'V.401 (Phòng họp)', 'Văn phòng Khoa'],
  KHU_A: ['A.101', 'A.102', 'A.201', 'A.202', 'A.203', 'A.301', 'A.302', 'A.303'],
  KHU_B: ['Lab B.101 (Lập trình)', 'Lab B.102 (Đa phương tiện)', 'Lab B.201 (Trí tuệ nhân tạo AI)', 'Lab B.202 (Internet vạn vật IoT)', 'Lab B.301 (An toàn thông tin)', 'Phòng Server Trung tâm'],
  KHU_C: ['C.101', 'C.102', 'C.201 (Hội trường lớn)', 'C.301 (Phòng Hội thảo quốc tế)'],
  KHU_K: ['Phòng KTX 102', 'Phòng KTX 205', 'Phòng KTX 308', 'Phòng KTX 412', 'Khu tự học tầng 1', 'Khu giặt phơi'],
  THU_VIEN: ['Tầng 1 - Khu tra cứu & Mượn sách', 'Tầng 2 - Không gian học nhóm MakerSpace', 'Tầng 3 - Phòng đọc điện tử'],
  THE_THAO: ['Nhà thi đấu đa năng', 'Sân bóng đá cỏ nhân tạo', 'Khu bóng rổ & bóng chuyền'],
  CAN_TIN: ['Sảnh ăn chính sinh viên', 'Khu chế biến dịch vụ', 'Khu quầy nước'],
  BAI_XE: ['Bãi xe Nhà B', 'Bãi xe Ký túc xá', 'Bãi xe Nhà Điều hành V'],
  KHUON_VIEN: ['Cổng chính đường Nam Kỳ Khởi Nghĩa', 'Quảng trường trung tâm', 'Khu ghế đá hồ điều hòa', 'Lối đi bộ nối Khu A & B']
};

export const VKU_EQUIPMENT_CATEGORIES = [
  { id: 'PROJECTOR', name: 'Máy chiếu, Màn chiếu & Remote', icon: '📽️' },
  { id: 'AIR_CONDITIONER', name: 'Điều hòa nhiệt độ & Điều khiển', icon: '❄️' },
  { id: 'LIGHT_FAN', name: 'Hệ thống đèn LED & Quạt trần/Quạt tường', icon: '💡' },
  { id: 'FURNITURE', name: 'Bàn ghế sinh viên & Bàn giảng viên', icon: '🪑' },
  { id: 'NETWORK', name: 'Bộ phát Wifi AP, Cáp mạng LAN & Tủ Rack', icon: '📶' },
  { id: 'FIRE_SAFETY', name: 'Bình chữa cháy, Chuông báo & Đèn Exit', icon: '🧯' },
  { id: 'POWER_SOCKET', name: 'Ổ cắm điện, Công tắc & Aptomat', icon: '🔌' },
  { id: 'BOARD_CURTAIN', name: 'Bảng từ/Bút viết & Rèm cửa chống nắng', icon: '📋' },
  { id: 'DOOR_WINDOW', name: 'Khóa cửa, Tay nắm & Cửa kính', icon: '🚪' },
  { id: 'BUILDING_STRUCTURE', name: 'Trần, Tường, Gạch nền & Sơn ẩm mốc', icon: '🧱' },
  { id: 'SANITATION', name: 'Nhà vệ sinh, Vòi nước & Bồn rửa', icon: '🚰' }
];

export const SURVEY_STATUSES = [
  {
    id: 'good',
    label: 'Hoạt động tốt / Bình thường',
    color: '#10B981',
    badgeClass: 'badge-good',
    icon: '✅'
  },
  {
    id: 'warning',
    label: 'Hư hỏng nhẹ / Cần bảo trì định kỳ',
    color: '#F59E0B',
    badgeClass: 'badge-warning',
    icon: '⚠️'
  },
  {
    id: 'danger',
    label: 'Hỏng nặng / Nguy cơ mất an toàn / Thay thế khẩn cấp',
    color: '#EF4444',
    badgeClass: 'badge-danger',
    icon: '🚨'
  }
];
