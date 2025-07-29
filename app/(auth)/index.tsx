import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { SvgXml } from 'react-native-svg';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <SvgXml
            xml={`<svg width="220" height="60" viewBox="0 0 220 60" fill="none" xmlns="http://www.w3.org/2000/svg">
</svg>`}
            width={180}
            height={48}
            style={{ marginBottom: 8 }}
          />
          <Text style={styles.logoText}>FUNDAmental</Text>
          <Text style={styles.tagline}>Your Gateway to Smarter Learning</Text>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.title}>Empowering Lifelong Learners</Text>
          <Text style={styles.subtitle}>
            Study, collaborate, and achieve your academic goals with access to quality resources and interactive tools.
          </Text>
        </View>
        
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureIconText}>🌐</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>All-in-One Learning Hub</Text>
              <Text style={styles.featureDescription}>
                Access courses, assignments, and resources for every level, all in one place.
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureIconText}>🤝</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Collaborative Community</Text>
              <Text style={styles.featureDescription}>
                Join study groups, participate in discussions, and connect with peers and educators.
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureIconText}>⬆️⬇️</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Easy Upload & Download</Text>
              <Text style={styles.featureDescription}>
                Seamlessly upload assignments and download study materials anytime, anywhere.
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Button
          title="Create Account"
          onPress={() => router.push('/register')}
          style={styles.button}
          size="large"
        />
        
        <TouchableOpacity
          onPress={() => router.push('/login')}
          style={styles.loginLink}
        >
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginTextBold}>Log In</Text>
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)')}
          style={styles.skipLink}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '50%',
  },
  content: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'white',
    opacity: 0.85,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
  },
  featuresContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureIconText: {
    fontSize: 24,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: Colors.text.primary,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    backgroundColor: 'white',
  },
  button: {
    marginBottom: 16,
  },
  loginLink: {
    alignItems: 'center',
    marginBottom: 16,
  },
  loginText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  loginTextBold: {
    fontWeight: '600',
    color: Colors.primary,
  },
  skipLink: {
    alignItems: 'center',
  },
  skipText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
});