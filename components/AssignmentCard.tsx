import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Clock } from 'lucide-react-native';
import { Assignment } from '@/types';
import Colors from '@/constants/colors';
import Card from './Card';

interface AssignmentCardProps {
  assignment: Assignment;
}

export default function AssignmentCard({ assignment }: AssignmentCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/assignment/${assignment.id}`);
  };

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

  const daysRemaining = getDaysRemaining(assignment.dueDate);
  const isOverdue = daysRemaining < 0;
  const isToday = daysRemaining === 0;

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Card variant="outlined" style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{assignment.title}</Text>
          <View style={[
            styles.pointsBadge,
            { backgroundColor: Colors.primary + '20' }
          ]}>
            <Text style={styles.pointsText}>{assignment.points} pts</Text>
          </View>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {assignment.description}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.dateContainer}>
            <Calendar size={16} color={Colors.text.secondary} />
            <Text style={styles.dateText}>
              Due: {formatDate(assignment.dueDate)}
            </Text>
          </View>
          
          <View style={styles.statusContainer}>
            <Clock size={16} color={
              isOverdue ? Colors.error : 
              isToday ? Colors.warning : 
              Colors.text.secondary
            } />
            <Text style={[
              styles.statusText,
              isOverdue && styles.overdueText,
              isToday && styles.todayText,
            ]}>
              {isOverdue ? 'Overdue' : 
               isToday ? 'Due today' : 
               `${daysRemaining} days left`}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  pointsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
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
});