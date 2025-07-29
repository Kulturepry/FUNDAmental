import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Calendar, FileText, User, ChevronRight } from 'lucide-react-native';
import { useCoursesStore } from '@/store/courses-store';
import { Course, Assignment, Resource } from '@/types';
import Colors from '@/constants/colors';
import Card from '@/components/Card';
import AssignmentCard from '@/components/AssignmentCard';
import ResourceCard from '@/components/ResourceCard';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { fetchCourseById, fetchAssignments, fetchResources, isLoading } = useCoursesStore();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  
  useEffect(() => {
    if (id) {
      loadCourseData(id as string);
    }
  }, [id]);

  const loadCourseData = async (courseId: string) => {
    try {
      const courseData = await fetchCourseById(courseId);
      if (courseData) {
        setCourse(courseData);
        
        // Load assignments for this course
        const assignmentsData = await fetchAssignments(courseId);
        setAssignments(assignmentsData);
        
        // Load resources for this course
        const resourcesData = await fetchResources(courseId);
        setResources(resourcesData);
      }
    } catch (error) {
      console.error('Error loading course data:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Course not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Stack.Screen 
        options={{ 
          title: course.subject,
          headerTitleStyle: {
            fontSize: 18,
          },
        }} 
      />
      
      <Image
        source={{ uri: course.coverImage || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=500' }}
        style={styles.coverImage}
        contentFit="cover"
      />
      
      <View style={styles.courseInfo}>
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {course.gradeLevel.replace(/([a-z])([0-9])/i, '$1 $2').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.title}>{course.title}</Text>
          <Text style={styles.description}>{course.description}</Text>
        </View>
        
        <Card variant="outlined" style={styles.statsCard}>
          <View style={styles.statsItem}>
            <Calendar size={20} color={Colors.primary} />
            <View style={styles.statsTextContainer}>
              <Text style={styles.statsLabel}>Assignments</Text>
              <Text style={styles.statsValue}>{assignments.length}</Text>
            </View>
          </View>
          
          <View style={styles.statsDivider} />
          
          <View style={styles.statsItem}>
            <FileText size={20} color={Colors.primary} />
            <View style={styles.statsTextContainer}>
              <Text style={styles.statsLabel}>Resources</Text>
              <Text style={styles.statsValue}>{resources.length}</Text>
            </View>
          </View>
          
          <View style={styles.statsDivider} />
          
          <View style={styles.statsItem}>
            <User size={20} color={Colors.primary} />
            <View style={styles.statsTextContainer}>
              <Text style={styles.statsLabel}>Students</Text>
              <Text style={styles.statsValue}>{course.students.length}</Text>
            </View>
          </View>
        </Card>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Assignments</Text>
          <TouchableOpacity onPress={() => router.push('/assignments')}>
            <Text style={styles.sectionLink}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {assignments.length > 0 ? (
          assignments.map(assignment => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))
        ) : (
          <Card variant="outlined" style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No assignments have been added to this course yet.
            </Text>
          </Card>
        )}
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <TouchableOpacity onPress={() => router.push('/resources')}>
            <Text style={styles.sectionLink}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {resources.length > 0 ? (
          resources.map(resource => (
            <ResourceCard key={resource.id} resource={resource} />
          ))
        ) : (
          <Card variant="outlined" style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No resources have been added to this course yet.
            </Text>
          </Card>
        )}
      </View>
      
      <TouchableOpacity style={styles.joinButton}>
        <Text style={styles.joinButtonText}>Join Class Discussion</Text>
        <ChevronRight size={20} color={Colors.text.inverse} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  coverImage: {
    height: 200,
    width: '100%',
  },
  courseInfo: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 8,
  },
  badgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  statsItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsTextContainer: {
    marginLeft: 8,
  },
  statsLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  statsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  statsDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
  section: {
    padding: 16,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  sectionLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  emptyCard: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 8,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.inverse,
    marginRight: 4,
  },
});