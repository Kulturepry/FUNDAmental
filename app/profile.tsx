import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { Camera, User, Mail, School, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import Input from '@/components/Input';
import Button from '@/components/Button';
import GradeLevelSelector from '@/components/GradeLevelSelector';
import { GradeLevel } from '@/types';

export default function ProfileScreen() {
  const { user, updateProfile } = useAuthStore();
  const API_BASE_URL = 'http://localhost:3001/api';
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [school, setSchool] = useState(user?.school || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isLoading, setIsLoading] = useState(false);
  const [gradeLevel, setGradeLevel] = useState<GradeLevel | null>(user?.gradeLevel || null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const localUri = result.assets[0].uri;
        // Upload to backend
        const formData = new FormData();
        formData.append('avatar', {
          uri: localUri,
          name: 'avatar.jpg',
          type: 'image/jpeg',
        } as any);
        const response = await fetch(`${API_BASE_URL}/auth/upload-avatar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });
        if (!response.ok) throw new Error('Avatar upload failed');
        const data = await response.json();
        setAvatar(data.url);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    if (!gradeLevel) {
      Alert.alert('Error', 'Grade level is required');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user?.id,
          name,
          gradeLevel,
          school,
          avatar,
        }),
      });
      if (!response.ok) throw new Error('Profile update failed');
      const data = await response.json();
      updateProfile(data.user);
      setIsLoading(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert('Error', error.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    setIsChangingPassword(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user?.id,
          currentPassword,
          newPassword,
        }),
      });
      if (!response.ok) throw new Error('Password change failed');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Password changed successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Stack.Screen 
        options={{ 
          title: 'Edit Profile',
          headerTitleStyle: {
            fontSize: 18,
          },
        }} 
      />
      
      <View style={styles.avatarSection}>
        {avatar ? (
          <Image
            source={{ uri: avatar }}
            style={styles.avatar}
            contentFit="cover"
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {name.charAt(0) || 'U'}
            </Text>
          </View>
        )}
        
        <View style={styles.avatarButtons}>
          <TouchableOpacity 
            style={styles.avatarButton}
            onPress={handlePickImage}
          >
            <Upload size={16} color={Colors.primary} />
            <Text style={styles.avatarButtonText}>Upload</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.avatarButton}
            onPress={() => {
              // In a real app, this would open the camera
              Alert.alert('Camera', 'Camera functionality would be implemented here');
            }}
          >
            <Camera size={16} color={Colors.primary} />
            <Text style={styles.avatarButtonText}>Camera</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.form}>
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          value={name}
          onChangeText={setName}
          leftIcon={<User size={20} color={Colors.text.secondary} />}
        />
        
        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon={<Mail size={20} color={Colors.text.secondary} />}
        />
        
        <Input
          label="School/Institution"
          placeholder="Enter your school or institution"
          value={school}
          onChangeText={setSchool}
          leftIcon={<School size={20} color={Colors.text.secondary} />}
        />
        <GradeLevelSelector
          selectedLevel={gradeLevel}
          onSelectLevel={setGradeLevel}
        />
        
        <View style={styles.roleContainer}>
          <Text style={styles.roleLabel}>Account Type</Text>
          <View style={styles.roleValue}>
            <Text style={styles.roleText}>
              {user?.role === 'teacher' ? 'Teacher' : 'Student'}
            </Text>
            {user?.role === 'student' && user?.gradeLevel && (
              <View style={styles.gradeBadge}>
                <Text style={styles.gradeBadgeText}>
                  {user.gradeLevel.replace(/([a-z])([0-9])/i, '$1 $2').toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <Button
          title="Save Changes"
          onPress={handleSave}
          isLoading={isLoading}
          style={styles.saveButton}
          size="large"
        />
        <Button
          title="Change Password"
          onPress={() => setShowPasswordModal(true)}
          style={[styles.saveButton, { backgroundColor: Colors.secondary }]}
          size="large"
        />
        <Modal
          visible={showPasswordModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowPasswordModal(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, width: '90%' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Change Password</Text>
              <TextInput
                placeholder="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, marginBottom: 12, padding: 10 }}
              />
              <TextInput
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, marginBottom: 12, padding: 10 }}
              />
              <TextInput
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, marginBottom: 16, padding: 10 }}
              />
              <Button
                title={isChangingPassword ? 'Changing...' : 'Change Password'}
                onPress={handleChangePassword}
                isLoading={isChangingPassword}
                style={{ marginBottom: 8 }}
              />
              <Button
                title="Cancel"
                onPress={() => setShowPasswordModal(false)}
                style={{ backgroundColor: Colors.error }}
              />
            </View>
          </View>
        </Modal>
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  avatarButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    gap: 6,
  },
  avatarButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
  form: {
    marginBottom: 24,
  },
  roleContainer: {
    marginBottom: 24,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: Colors.text.primary,
  },
  roleValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  gradeBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  gradeBadgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: 8,
  },
});