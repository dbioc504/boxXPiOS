import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: false,
        shouldShowList: true,
    }),
});

export async function ensureNotifPermissions() {
    const { status } = await Notifications.getPermissionsAsync();
    if ( status !== 'granted' ) await Notifications.requestPermissionsAsync();
}