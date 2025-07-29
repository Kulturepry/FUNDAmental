import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import AssignmentCard from '@/components/AssignmentCard';
import Colors from '@/constants/colors';

// Remove mockAssignments and mockOutline and all demo logic

export default function ClassDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  // TODO: Fetch class details by id
  return (
    <>
      <Stack.Screen options={{ title: 'Class Details', headerBackVisible: true }} />
      <View style={styles.container}>
        <Text style={styles.title}>Class Details</Text>
        <Text style={styles.subtitle}>ID: {id}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Module Outline</Text>
          {/* TODO: Fetch and display module outline */}
          <Text style={styles.emptyText}>Module outline not yet available.</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Assignments</Text>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          {/* TODO: Fetch and display assignments */}
          <Text style={styles.emptyText}>No assignments yet.</Text>
        </View>

        <TouchableOpacity
          style={styles.inviteButton}
          onPress={() =>
            router.push({
              pathname: '/class/invite/[id]',
              params: { id: Array.isArray(id) ? id[0] : id }
            })
          }
        >
          <Text style={styles.inviteButtonText}>Invite Students</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  outlineItem: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 8,
    marginBottom: 2,
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  addButtonText: {
    color: Colors.text.inverse,
    fontWeight: '600',
    fontSize: 13,
  },
  emptyText: {
    color: Colors.text.disabled,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  inviteButton: {
    backgroundColor: Colors.accent,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  inviteButtonText: {
    color: Colors.text.inverse,
    fontWeight: 'bold',
    fontSize: 15,
  },
});
