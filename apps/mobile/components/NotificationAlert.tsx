import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import useRealtime from '../hooks/useRealtime';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
}

export default function NotificationAlert() {
  const { notifications, removeNotification, clearNotifications } = useRealtime();
  const [displayedNotifications, setDisplayedNotifications] = useState<Notification[]>([]);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[notifications.length - 1];
      setDisplayedNotifications([latestNotification]);

      // Auto-remove after 5 seconds
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          removeNotification(latestNotification.id || '');
          setDisplayedNotifications([]);
        });
      }, 5000);

      // Show notification
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assessment_started':
        return '📊';
      case 'recommendation':
        return '⭐';
      case 'message':
        return '💬';
      case 'system':
        return 'ℹ️';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'assessment_started':
        return '#3b82f6';
      case 'recommendation':
        return '#10b981';
      case 'message':
        return '#a855f7';
      case 'system':
        return '#6b7280';
      default:
        return '#3b82f6';
    }
  };

  if (displayedNotifications.length === 0) {
    return null;
  }

  const notification = displayedNotifications[0];
  const color = getNotificationColor(notification.type);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={[styles.notification, { borderLeftColor: color }]}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.icon}>{getNotificationIcon(notification.type)}</Text>
            <Text style={styles.title}>{notification.title}</Text>
          </View>
          <Text style={styles.message} numberOfLines={2}>
            {notification.message}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            removeNotification(notification.id);
            setDisplayedNotifications([]);
          }}
          style={styles.closeButton}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  notification: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  message: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  closeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#999',
  },
});
