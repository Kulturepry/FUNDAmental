import React, { useEffect, useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Alert, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Search, Calendar } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useCoursesStore } from '@/store/courses-store';
import { Assignment } from '@/types';
import { useFilteredData, usePaginatedData } from '@/utils/performance';
import Colors from '@/constants/colors';
import Input from '@/components/Input';
import AssignmentCard from '@/components/AssignmentCard';
import EmptyState from '@/components/EmptyState';
import * as DocumentPicker from 'expo-document-picker';
import { Picker } from '@react-native-picker/picker';

export default function AssignmentsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { fetchCourses, fetchAssignments, courses, assignments, isLoading, error, addAssignment } = useCoursesStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [allAssignments, setAllAssignments] = useState<Assignment[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
  const [newAssignmentDescription, setNewAssignmentDescription] = useState('');
  const [newAssignmentDueDate, setNewAssignmentDueDate] = useState('');
  const [newAssignmentPoints, setNewAssignmentPoints] = useState('100');
  const [newAssignmentCourseId, setNewAssignmentCourseId] = useState('');
  const [adding, setAdding] = useState(false);
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // First load courses
      const userCourses = await fetchCourses(
        user?.role === 'student' ? user.gradeLevel : undefined
      );
      
      if (userCourses.length > 0) {
        // Load assignments for all courses
        const assignmentsPromises = userCourses.map(course => 
          fetchAssignments(course.id)
        );
        
        const assignmentsResults = await Promise.all(assignmentsPromises);
        
        // Flatten the array of assignment arrays
        const allAssignmentsData = assignmentsResults.flat();
        
        // Sort by due date
        const sortedAssignments = [...allAssignmentsData].sort((a, b) => 
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        );
        
        setAllAssignments(sortedAssignments);
        
        // Set the first course as selected by default
        if (!selectedCourseId && userCourses.length > 0) {
          setSelectedCourseId(userCourses[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const handleAddAssignment = () => {
    if (!user || user.role !== 'teacher') {
      alert('Only teachers can create assignments.');
      return;
    }
    setShowAddModal(true);
  };

  const handleCreateAssignment = async () => {
    if (!newAssignmentTitle.trim() || !newAssignmentDescription.trim() || !newAssignmentDueDate.trim() || !newAssignmentCourseId) {
      alert('Please fill in all required fields.');
      return;
    }
    setAdding(true);
    try {
      await addAssignment({
        title: newAssignmentTitle,
        description: newAssignmentDescription,
        dueDate: newAssignmentDueDate,
        points: parseInt(newAssignmentPoints),
        courseId: newAssignmentCourseId,
      });
      setShowAddModal(false);
      setNewAssignmentTitle('');
      setNewAssignmentDescription('');
      setNewAssignmentDueDate('');
      setNewAssignmentPoints('100');
      setNewAssignmentCourseId('');
      loadData();
    } catch (error) {
      alert('Failed to create assignment. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const filteredAssignments = useMemo(() => {
    const baseAssignments = selectedCourseId
      ? assignments.filter(assignment => assignment.courseId === selectedCourseId)
      : allAssignments;
    
    return baseAssignments;
  }, [selectedCourseId, assignments, allAssignments]);

  const searchFilteredAssignments = useFilteredData(
    filteredAssignments,
    searchQuery,
    (assignment, query) => 
      assignment.title.toLowerCase().includes(query) ||
      assignment.description.toLowerCase().includes(query)
  );

  const { paginatedData, hasMore, loadMore } = usePaginatedData(searchFilteredAssignments, 10);

  // Helper to check upload eligibility
  const canUpload = (user: any) => {
    if (!user) return false;
    if (user.role === 'teacher') return true;
    const allowedLevels = [
      'form1','form2','form3','form4','form5','form6',
      'university_accounting','university_agriculture','university_architecture',
      'university_business','university_chemistry','university_computer_science',
      'university_economics','university_education','university_engineering',
      'university_english','university_environmental_science','university_geography',
      'university_history','university_law','university_mathematics','university_medicine',
      'university_nursing','university_pharmacy','university_physics','university_psychology',
      'university_sociology','polytechnic_automotive','polytechnic_building','polytechnic_electrical',
      'polytechnic_hospitality','polytechnic_information_technology','polytechnic_mechanical','polytechnic_textile'
    ];
    return allowedLevels.includes(user.gradeLevel);
  };

  const handleUploadAssignment = async () => {
    try {
      if (!user) throw new Error('User not found');
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
      } as any);
      formData.append('title', file.name);
      formData.append('description', 'Uploaded via app');
      formData.append('classId', user.gradeLevel || '');
      formData.append('uploadedBy', user.id.toString());
      const response = await fetch('https://fundamental.onrender.com/api/assignments/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      Alert.alert('Success', 'Assignment uploaded successfully');
      loadData();
      await fetch('http://192.168.137.1:3001/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: 'Assignment Uploaded',
          message: 'Your assignment was uploaded successfully!',
        }),
      });
    } catch (e: unknown) {
      const err = e as Error;
      Alert.alert('Upload Error', err.message);
    }
  };

  const handleDownloadAssignment = async (assignment: any) => {
    try {
      const url = `https://fundamental.onrender.com/api/assignments/${assignment.id}/download`;
      // For demo: open in browser (real app: use FileSystem API)
      if (Platform.OS === 'web') {
        window.open(url, '_blank');
      } else {
        Alert.alert('Download', 'Download started (implement FileSystem save for mobile)');
      }
    } catch (e: unknown) {
      const err = e as Error;
      Alert.alert('Download Error', err.message);
    }
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity onPress={loadData} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Assignments</Text>
        {user?.role === 'teacher' && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddAssignment}
          >
            <Plus size={20} color={Colors.text.inverse} />
          </TouchableOpacity>
        )}
      </View>
      
      <Input
        placeholder="Search assignments..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        leftIcon={<Search size={20} color={Colors.text.secondary} />}
        containerStyle={styles.searchContainer}
      />
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.courseTabs}
      >
        <TouchableOpacity
          style={[
            styles.courseTab,
            selectedCourseId === null && styles.activeTab,
          ]}
          onPress={() => setSelectedCourseId(null)}
        >
          <Text
            style={[
              styles.courseTabText,
              selectedCourseId === null && styles.activeTabText,
            ]}
          >
            All Assignments
          </Text>
        </TouchableOpacity>
        
        {courses.map(course => (
          <TouchableOpacity
            key={course.id}
            style={[
              styles.courseTab,
              selectedCourseId === course.id && styles.activeTab,
            ]}
            onPress={() => setSelectedCourseId(course.id)}
          >
            <Text
              style={[
                styles.courseTabText,
                selectedCourseId === course.id && styles.activeTabText,
              ]}
            >
              {course.subject}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView 
          style={styles.assignmentsContainer}
          contentContainerStyle={styles.assignmentsContent}
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
            
            if (isCloseToBottom && hasMore) {
              loadMore();
            }
          }}
          scrollEventThrottle={400}
        >
          {canUpload(user) && (
            <TouchableOpacity style={styles.uploadButton} onPress={handleUploadAssignment}>
              <Text style={styles.uploadButtonText}>Upload Assignment</Text>
            </TouchableOpacity>
          )}
          {paginatedData.length > 0 ? (
            <View>
              {paginatedData.map(assignment => (
                <View key={assignment.id} style={{ marginBottom: 16 }}>
                  <AssignmentCard assignment={assignment} />
                  <TouchableOpacity style={styles.downloadButton} onPress={() => handleDownloadAssignment(assignment)}>
                    <Text style={styles.downloadButtonText}>Download</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {hasMore && (
                <View style={styles.loadingMore}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                </View>
              )}
            </View>
          ) : (
            <EmptyState
              title="No Assignments Found"
              description={
                searchQuery
                  ? "We couldn't find any assignments matching your search."
                  : selectedCourseId
                  ? "There are no assignments for this course yet."
                  : "You don't have any assignments yet."
              }
              icon={<Calendar size={48} color={Colors.text.disabled} />}
              actionLabel={searchQuery ? "Clear Search" : "Refresh"}
              onAction={() => {
                if (searchQuery) {
                  setSearchQuery('');
                } else {
                  loadData();
                }
              }}
              style={styles.emptyState}
            />
          )}
        </ScrollView>
      )}
      
      {/* Add Assignment Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, width: '90%', maxHeight: '80%' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Create Assignment</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                placeholder="Assignment Title"
                value={newAssignmentTitle}
                onChangeText={setNewAssignmentTitle}
                style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, marginBottom: 12, padding: 10 }}
              />
              
              <TextInput
                placeholder="Description"
                value={newAssignmentDescription}
                onChangeText={setNewAssignmentDescription}
                multiline
                numberOfLines={3}
                style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, marginBottom: 12, padding: 10, textAlignVertical: 'top' }}
              />
              
              <TextInput
                placeholder="Due Date (YYYY-MM-DD)"
                value={newAssignmentDueDate}
                onChangeText={setNewAssignmentDueDate}
                style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, marginBottom: 12, padding: 10 }}
              />
              
              <TextInput
                placeholder="Points"
                value={newAssignmentPoints}
                onChangeText={setNewAssignmentPoints}
                keyboardType="numeric"
                style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, marginBottom: 12, padding: 10 }}
              />
              
              <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8, color: Colors.text.primary }}>Course:</Text>
              <Picker
                selectedValue={newAssignmentCourseId}
                onValueChange={setNewAssignmentCourseId}
                style={{ marginBottom: 16 }}
              >
                <Picker.Item label="Select a course" value="" />
                {courses.map(course => (
                  <Picker.Item key={course.id} label={course.title} value={course.id} />
                ))}
              </Picker>
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.createButton, { marginBottom: 8 }]}
              onPress={handleCreateAssignment}
              disabled={adding || !newAssignmentTitle.trim()}
            >
              <Text style={styles.createButtonText}>{adding ? 'Creating...' : 'Create Assignment'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: Colors.error }]}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.createButtonText}>Cancel</Text>
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
  courseTabs: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  courseTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  courseTabText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  activeTabText: {
    color: Colors.text.inverse,
    fontWeight: '500',
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
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.text.inverse,
    fontWeight: '500',
  },
  assignmentsContainer: {
    flex: 1,
  },
  assignmentsContent: {
    padding: 16,
    paddingTop: 8,
  },
  loadingMore: {
    padding: 20,
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 40,
  },
  uploadButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  downloadButton: {
    backgroundColor: Colors.secondary,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  downloadButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});