import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, User, School } from 'lucide-react-native';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import GradeLevelSelector from '@/components/GradeLevelSelector';
import { GradeLevel } from '@/types';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel | null>('form1');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    gradeLevel?: string;
  }>({});

  const validateForm = () => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      gradeLevel?: string;
    } = {};
    
    if (!name) {
      newErrors.name = 'Name is required';
    }
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!gradeLevel) {
      newErrors.gradeLevel = 'Grade level is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    try {
      await register(name, email, password, role, gradeLevel!);
      Alert.alert(
        'Account Created',
        'Your account has been created successfully!',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (error) {
      Alert.alert(
        'Registration Failed',
        'There was an error creating your account. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the premier e-learning platform</Text>
      </View>
      
      <View style={styles.form}>
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          value={name}
          onChangeText={setName}
          leftIcon={<User size={20} color={Colors.text.secondary} />}
          error={errors.name}
        />
        
        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon={<Mail size={20} color={Colors.text.secondary} />}
          error={errors.email}
        />
        
        <Input
          label="Password"
          placeholder="Create a password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          leftIcon={<Lock size={20} color={Colors.text.secondary} />}
          error={errors.password}
        />
        
        <Input
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          leftIcon={<Lock size={20} color={Colors.text.secondary} />}
          error={errors.confirmPassword}
        />
        <GradeLevelSelector
          selectedLevel={gradeLevel}
          onSelectLevel={setGradeLevel}
        />
        
        <Text style={styles.roleLabel}>I am a:</Text>
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              role === 'student' && styles.roleButtonActive,
            ]}
            onPress={() => setRole('student')}
          >
            <School size={20} color={role === 'student' ? Colors.text.inverse : Colors.text.primary} />
            <Text
              style={[
                styles.roleText,
                role === 'student' && styles.roleTextActive,
              ]}
            >
              Student
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.roleButton,
              role === 'teacher' && styles.roleButtonActive,
            ]}
            onPress={() => setRole('teacher')}
          >
            <User size={20} color={role === 'teacher' ? Colors.text.inverse : Colors.text.primary} />
            <Text
              style={[
                styles.roleText,
                role === 'teacher' && styles.roleTextActive,
              ]}
            >
              Teacher
            </Text>
          </TouchableOpacity>
        </View>
        
        <Button
          title="Create Account"
          onPress={handleRegister}
          isLoading={isLoading}
          style={styles.button}
          size="large"
        />
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Already have an account?{' '}
          <Text 
            style={styles.footerLink}
            onPress={() => router.push('/login')}
          >
            Log In
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  form: {
    marginBottom: 24,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: Colors.text.primary,
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  roleButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roleText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  roleTextActive: {
    color: Colors.text.inverse,
  },
  button: {
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  footerLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
});