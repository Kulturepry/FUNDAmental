import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Calendar, Clock, Upload, Check } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useCoursesStore } from '@/store/courses-store';
import { Assignment, Course } from '@/types';
import Colors from '@/constants/colors';
import Card from '@/components/Card';
import Button from '@/components/Button';
import CommentsSection from '@/components/CommentsSection';

export default function AssignmentDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  const { assignments, courses, isLoading } = useCoursesStore();
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  useEffect(() => {
    if (id) {
      // Find the assignment in the store
      const foundAssignment = assignments.find(a => a.id === id);
      if (foundAssignment) {
        setAssignment(foundAssignment);
        
        // Find the course for this assignment
        const foundCourse = courses.find(c => c.id === foundAssignment.courseId);
        if (foundCourse) {
          setCourse(foundCourse);
        }
      }
    }
  }, [id, assignments, courses]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysRemaining = (dueDateString: string) => {
    const dueDate = new Date(dueDateString);
    const today = new Date();
    
    // Set time to midnight for accurate day calculation
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const handleSubmit = () => {
    if (!answer.trim()) {
      alert('Please enter your answer before submitting.');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!assignment || !course) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Assignment not found</Text>
      </View>
    );
  }

  const daysRemaining = getDaysRemaining(assignment.dueDate);
  const isOverdue = daysRemaining < 0;
  const isToday = daysRemaining === 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Stack.Screen 
        options={{ 
          title: 'Assignment',
          headerTitleStyle: {
            fontSize: 18,
          },
        }} 
      />
      
      <View style={styles.header}>
        <Text style={styles.courseTitle}>{course.subject}</Text>
        <Text style={styles.title}>{assignment.title}</Text>
        
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Calendar size={16} color={Colors.text.secondary} />
            <Text style={styles.metaText}>
              Due: {formatDate(assignment.dueDate)}
            </Text>
          </View>
          
          <View style={styles.metaItem}>
            <Clock size={16} color={
              isOverdue ? Colors.error : 
              isToday ? Colors.warning : 
              Colors.text.secondary
            } />
            <Text style={[
              styles.metaText,
              isOverdue && styles.overdueText,
              isToday && styles.todayText,
            ]}>
              {isOverdue ? 'Overdue' : 
               isToday ? 'Due today' : 
               `${daysRemaining} days left`}
            </Text>
          </View>
        </View>
      </View>
      
      <Card variant="elevated" style={styles.descriptionCard}>
        <Text style={styles.descriptionTitle}>Instructions</Text>
        <Text style={styles.description}>{assignment.description}</Text>
        
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsText}>Points: {assignment.points}</Text>
        </View>
      </Card>
      
      {user?.role === 'student' && (
        <View style={styles.submissionSection}>
          <Text style={styles.submissionTitle}>Your Submission</Text>
          
          {isSubmitted ? (
            <Card variant="outlined" style={styles.submittedCard}>
              <View style={styles.submittedHeader}>
                <Check size={20} color={Colors.success} />
                <Text style={styles.submittedText}>Submitted Successfully</Text>
              </View>
              <Text style={styles.submittedAnswer}>{answer}</Text>
            </Card>
          ) : (
            <View>
              <TextInput
                style={styles.answerInput}
                placeholder="Type your answer here..."
                multiline
                value={answer}
                onChangeText={setAnswer}
                editable={!isOverdue}
              />
              <View style={styles.buttonContainer}>
                <Button
                  title="Upload File"
                  variant="outline"
                  leftIcon={<Upload size={16} color={Colors.primary} />}
                  style={styles.uploadButton}
                  disabled={isOverdue}
                />
                <Button
                  title="Submit"
                  isLoading={isSubmitting}
                  onPress={handleSubmit}
                  disabled={isOverdue || !answer.trim()}
                />
              </View>
              {isOverdue && (
                <Text style={styles.overdueWarning}>
                  This assignment is past due and can no longer be submitted.
                </Text>
              )}
            </View>
          )}
        </View>
      )}
      
      {user?.role === 'teacher' && (
        <View style={styles.teacherSection}>
          <Text style={styles.submissionTitle}>Student Submissions</Text>
          
          <Card variant="outlined" style={styles.submissionStatsCard}>
            <View style={styles.submissionStat}>
              <Text style={styles.submissionStatValue}>0/{course.students.length}</Text>
              <Text style={styles.submissionStatLabel}>Submitted</Text>
            </View>
            
            <View style={styles.submissionStat}>
              <Text style={styles.submissionStatValue}>0</Text>
              <Text style={styles.submissionStatLabel}>Graded</Text>
            </View>
            
            <View style={styles.submissionStat}>
              <Text style={styles.submissionStatValue}>
                {isOverdue ? 'Closed' : 'Open'}
              </Text>
              <Text style={styles.submissionStatLabel}>Status</Text>
            </View>
          </Card>
          
          <Button
            title="View All Submissions"
            style={styles.viewSubmissionsButton}
          />
        </View>
      )}
      {user && assignment && course && (
        <CommentsSection type="assignment" itemId={assignment.id} user={{ id: user.id, name: user.name, role: user.role }} moderatorIds={[course.teacherId]} />
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
  header: {
    marginBottom: 16,
  },
  courseTitle: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  overdueText: {
    color: Colors.error,
    fontWeight: '500',
  },
  todayText: {
    color: Colors.warning,
    fontWeight: '500',
  },
  descriptionCard: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 24,
    marginBottom: 16,
  },
  pointsContainer: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  pointsText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  submissionSection: {
    marginBottom: 24,
  },
  submissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  answerInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 16,
    minHeight: 150,
    fontSize: 16,
    color: Colors.text.primary,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
  },
  overdueWarning: {
    color: Colors.error,
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
  submittedCard: {
    padding: 16,
  },
  submittedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  submittedText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.success,
  },
  submittedAnswer: {
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 24,
  },
  teacherSection: {
    marginBottom: 24,
  },
  submissionStatsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 16,
  },
  submissionStat: {
    alignItems: 'center',
  },
  submissionStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  submissionStatLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  viewSubmissionsButton: {
    marginTop: 8,
  },
});