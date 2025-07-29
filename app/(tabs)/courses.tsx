import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Search, BookOpen } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useCoursesStore } from '@/store/courses-store';
import { GradeLevel } from '@/types';
import Colors from '@/constants/colors';
import Input from '@/components/Input';
import CourseCard from '@/components/CourseCard';
import GradeLevelSelector from '@/components/GradeLevelSelector';
import EmptyState from '@/components/EmptyState';

export default function CoursesScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { fetchCourses, courses, isLoading } = useCoursesStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<GradeLevel | null>(
    user?.gradeLevel || null
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newGradeLevel, setNewGradeLevel] = useState<GradeLevel | null>(user?.gradeLevel || null);
  const [newSubject, setNewSubject] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<string | null>(null);
  
  useEffect(() => {
    loadCourses();
  }, [selectedLevel]);

  const loadCourses = async () => {
    await fetchCourses(selectedLevel || undefined);
  };

  const filteredCourses = courses.filter(course => {
    if (searchQuery === '') return true;
    
    const query = searchQuery.toLowerCase();
    return (
      course.title.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query) ||
      course.subject.toLowerCase().includes(query)
    );
  });

  const handleAddCourse = () => {
    setShowCreateModal(true);
  };

  const handleCreateCourse = async () => {
    if (!newTitle || !newGradeLevel || !newSubject) {
      alert('All fields are required');
      return;
    }
    setCreating(true);
    try {
      await fetch('http://192.168.137.1:3001/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          gradeLevel: newGradeLevel,
          subject: newSubject,
          teacherId: user?.id,
        }),
      });
      setShowCreateModal(false);
      setNewTitle('');
      setNewDescription('');
      setNewGradeLevel(user?.gradeLevel || null);
      setNewSubject('');
      await loadCourses();
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (courseId: string) => {
    setJoining(courseId);
    await fetch(`http://192.168.137.1:3001/api/courses/${courseId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user?.id }),
    });
    await loadCourses();
    setJoining(null);
  };

  const handleLeave = async (courseId: string) => {
    setLeaving(courseId);
    await fetch(`http://192.168.137.1:3001/api/courses/${courseId}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user?.id }),
    });
    await loadCourses();
    setLeaving(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Courses</Text>
        {user?.role === 'teacher' && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddCourse}
          >
            <Plus size={20} color={Colors.text.inverse} />
          </TouchableOpacity>
        )}
      </View>
      
      <Input
        placeholder="Search courses..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        leftIcon={<Search size={20} color={Colors.text.secondary} />}
        containerStyle={styles.searchContainer}
      />
      
      <GradeLevelSelector
        selectedLevel={selectedLevel}
        onSelectLevel={setSelectedLevel}
      />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView 
          style={styles.coursesContainer}
          contentContainerStyle={styles.coursesContent}
        >
          {filteredCourses.length > 0 ? (
            filteredCourses.map(course => {
              const isTeacher = user?.id === course.teacherId;
              const isEnrolled = course.students.includes(user?.id);
              return (
                <View key={course.id} style={{ marginBottom: 16 }}>
                  <CourseCard course={course} />
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                    {isTeacher && (
                      <Text style={{ color: Colors.primary, fontWeight: 'bold', marginRight: 12 }}>
                        Teaching
                      </Text>
                    )}
                    {user?.role === 'student' && (
                      isEnrolled ? (
                        <TouchableOpacity
                          style={{ backgroundColor: Colors.error, padding: 8, borderRadius: 8, marginRight: 8 }}
                          onPress={() => handleLeave(course.id)}
                          disabled={leaving === course.id}
                        >
                          <Text style={{ color: 'white', fontWeight: 'bold' }}>
                            {leaving === course.id ? 'Leaving...' : 'Leave'}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={{ backgroundColor: Colors.primary, padding: 8, borderRadius: 8, marginRight: 8 }}
                          onPress={() => handleJoin(course.id)}
                          disabled={joining === course.id}
                        >
                          <Text style={{ color: 'white', fontWeight: 'bold' }}>
                            {joining === course.id ? 'Joining...' : 'Join'}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <EmptyState
              title="No Courses Found"
              description={
                searchQuery
                  ? "We couldn't find any courses matching your search."
                  : "There are no courses available for the selected level yet."
              }
              icon={<BookOpen size={48} color={Colors.text.disabled} />}
              actionLabel={searchQuery ? "Clear Search" : "Browse All Courses"}
              onAction={() => {
                if (searchQuery) {
                  setSearchQuery('');
                } else {
                  setSelectedLevel(null);
                }
              }}
              style={styles.emptyState}
            />
          )}
        </ScrollView>
      )}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, width: '90%' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Create Course</Text>
            <TextInput
              placeholder="Title"
              value={newTitle}
              onChangeText={setNewTitle}
              style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, marginBottom: 12, padding: 10 }}
            />
            <TextInput
              placeholder="Description"
              value={newDescription}
              onChangeText={setNewDescription}
              style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, marginBottom: 12, padding: 10 }}
            />
            <TextInput
              placeholder="Subject"
              value={newSubject}
              onChangeText={setNewSubject}
              style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, marginBottom: 12, padding: 10 }}
            />
            <GradeLevelSelector
              selectedLevel={newGradeLevel}
              onSelectLevel={setNewGradeLevel}
            />
            <TouchableOpacity
              style={{ backgroundColor: Colors.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 }}
              onPress={handleCreateCourse}
              disabled={creating}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                {creating ? 'Creating...' : 'Create Course'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ backgroundColor: Colors.error, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 }}
              onPress={() => setShowCreateModal(false)}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coursesContainer: {
    flex: 1,
  },
  coursesContent: {
    padding: 16,
    paddingTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 40,
  },
});