import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import Button from '@/components/Button';

type Notification = {
  id: number;
  userId: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

export default function NotificationsScreen() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const handleMarkAsRead = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/notifications/${id}/read`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      const data = await response.json();
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: data.notification.read } : n))
      );
    } catch (e) {
      // fallback: mark as read locally
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    }
  };

  const createTestNotification = async () => {
    if (!user) return;
    await fetch('http://localhost:3001/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        title: 'Test Notification',
        message: 'This is a test notification.',
      }),
    });
    // Refresh notifications
    const response = await fetch(`http://localhost:3001/api/notifications?userId=${user.id}`);
    const data = await response.json();
    setNotifications(data.notifications || []);
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3001/api/notifications?userId=${user.id}`);
        const data = await response.json();
        setNotifications(data.notifications || []);
      } catch (e) {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [user]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Notifications</Text>
      <Button title="Create Test Notification" onPress={createTestNotification} style={{ marginBottom: 16 }} />
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 32 }} />
      ) : notifications.length === 0 ? (
        <Text style={styles.empty}>No notifications yet.</Text>
      ) : (
        notifications.map((n) => (
          <TouchableOpacity key={n.id} style={styles.notificationCard} onPress={() => handleMarkAsRead(n.id)}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {!n.read && <View style={styles.unreadDot} />}
              <Text style={styles.notificationTitle}>{n.title}</Text>
            </View>
            <Text style={styles.notificationMessage}>{n.message}</Text>
            <Text style={styles.notificationDate}>{new Date(n.createdAt).toLocaleString()}</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  empty: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 32,
  },
  notificationCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  notificationDate: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginRight: 8,
  },
}); 