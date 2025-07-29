import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { 
  User, 
  Mail, 
  School, 
  LogOut, 
  Settings, 
  HelpCircle, 
  Bell, 
  BookOpen, 
  FileText, 
  ChevronRight 
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import Card from '@/components/Card';

export default function AccountScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)');
          }
        },
      ]
    );
  };

  const menuItems = [
    {
      title: 'Account Settings',
      items: [
        {
          icon: <User size={20} color={Colors.primary} />,
          label: 'Edit Profile',
          onPress: () => router.push('/profile' as any),
        },
        {
          icon: <Bell size={20} color={Colors.primary} />,
          label: 'Notifications',
          onPress: () => router.push('/notifications' as any),
        },
        {
          icon: <Settings size={20} color={Colors.primary} />,
          label: 'App Settings',
          onPress: () => alert('App settings would be implemented here'),
        },
      ],
    },
    {
      title: 'Academic',
      items: [
        {
          icon: <BookOpen size={20} color={Colors.primary} />,
          label: 'My Courses',
          onPress: () => router.push('/courses'),
        },
        {
          icon: <FileText size={20} color={Colors.primary} />,
          label: 'My Resources',
          onPress: () => router.push('/resources'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: <HelpCircle size={20} color={Colors.primary} />,
          label: 'Help & Support',
          onPress: () => alert('Help & Support would be implemented here'),
        },
        {
          icon: <LogOut size={20} color={Colors.error} />,
          label: 'Log Out',
          onPress: handleLogout,
          textColor: Colors.error,
        },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.profileSection}>
        {user?.avatar ? (
          <Image
            source={{ uri: user.avatar }}
            style={styles.avatar}
            contentFit="cover"
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0) || 'U'}
            </Text>
          </View>
        )}
        
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Mail size={16} color={Colors.text.secondary} />
            <Text style={styles.infoText}>{user?.email || 'email@example.com'}</Text>
          </View>
          
          {user?.role && (
            <View style={styles.infoItem}>
              <User size={16} color={Colors.text.secondary} />
              <Text style={styles.infoText}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Text>
            </View>
          )}
          
          {user?.school && (
            <View style={styles.infoItem}>
              <School size={16} color={Colors.text.secondary} />
              <Text style={styles.infoText}>{user.school}</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => router.push('/profile' as any)}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
      
      {menuItems.map((section, index) => (
        <View key={index} style={styles.menuSection}>
          <Text style={styles.menuTitle}>{section.title}</Text>
          <Card variant="elevated" style={styles.menuCard}>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={[
                  styles.menuItem,
                  itemIndex < section.items.length - 1 && styles.menuItemBorder,
                ]}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  {item.icon}
                  <Text style={[
                    styles.menuItemText,
                    item.textColor && { color: item.textColor },
                  ]}>
                    {item.label}
                  </Text>
                </View>
                <ChevronRight size={20} color={Colors.text.secondary} />
              </TouchableOpacity>
            ))}
          </Card>
        </View>
      ))}
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>FUNDAmental v1.0.0</Text>
        <Text style={styles.footerText}>© 2025 FUNDAmental Education</Text>
      </View>
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
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  infoContainer: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 8,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
  menuSection: {
    marginBottom: 24,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
});