import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

let notificationsInitialized = false;

/**
 * Yêu cầu quyền thông báo đẩy trên thiết bị Android
 */
export async function initNotificationService() {
  if (notificationsInitialized) return;

  if (Capacitor.isNativePlatform()) {
    try {
      // Yêu cầu quyền Local Notifications
      const permStatus = await LocalNotifications.requestPermissions();
      console.log('[Notification] Quyền thông báo cục bộ:', permStatus);

      // Yêu cầu quyền Push Notifications nếu hỗ trợ
      try {
        const pushPerm = await PushNotifications.requestPermissions();
        if (pushPerm.receive === 'granted') {
          await PushNotifications.register();
        }
      } catch (e) {
        console.log('[Notification] Push notification registration note:', e.message);
      }

      notificationsInitialized = true;
    } catch (err) {
      console.warn('[Notification] Lỗi khởi tạo quyền thông báo:', err);
    }
  }
}

/**
 * Gửi thông báo cục bộ tới người dùng khi quá trình đồng bộ (sync) hoàn tất
 */
export async function notifySyncSuccess(syncedCount) {
  console.log(`[Notification] Phát thông báo đồng bộ thành công cho ${syncedCount} phiếu.`);

  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'VKU Field Survey - Đồng Bộ Thành Công! 🚀',
            body: `Đã đồng bộ thành công ${syncedCount} phiếu khảo sát hiện trường lên máy chủ VKU.`,
            id: Math.floor(Math.random() * 100000),
            schedule: { at: new Date(Date.now() + 100) },
            sound: 'beep.wav',
            smallIcon: 'ic_launcher',
            actionTypeId: '',
            extra: null
          }
        ]
      });
      return true;
    } catch (err) {
      console.warn('[Notification] Lỗi khi gửi thông báo Native:', err);
    }
  }

  // Fallback web notification nếu chạy trên trình duyệt hỗ trợ Notification API
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    new Notification('VKU Field Survey - Đồng Bộ Thành Công! 🚀', {
      body: `Đã đồng bộ thành công ${syncedCount} phiếu khảo sát hiện trường lên máy chủ VKU.`,
      icon: '/icons/icon-192.png'
    });
  }

  return false;
}
