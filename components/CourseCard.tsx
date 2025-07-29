import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Course } from '@/types';
import Colors from '@/constants/colors';
import Card from './Card';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/course/${course.id}`);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Card variant="elevated" style={styles.card}>
        <Image
          source={{ uri: course.coverImage || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=500' }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.content}>
          <Text style={styles.subject}>{course.subject}</Text>
          <Text style={styles.title}>{course.title}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {course.description}
          </Text>
          <View style={styles.footer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {course.gradeLevel.replace(/([a-z])([0-9])/i, '$1 $2').toUpperCase()}
              </Text>
            </View>
            <Text style={styles.students}>
              {course.students.length} {course.students.length === 1 ? 'student' : 'students'}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  image: {
    height: 140,
    width: '100%',
  },
  content: {
    padding: 16,
  },
  subject: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.text.primary,
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: Colors.primary + '20', // 20% opacity
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  students: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
});