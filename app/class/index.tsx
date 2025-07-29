import { Stack, useRouter } from 'expo-router';
import { Home } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, Modal } from 'react-native';

import ClassCard from '@/components/ClassCard';
import Colors from '@/constants/colors';
import { Plus, Users, BookOpen } from 'lucide-react-native';

// Remove mockClasses and all demo class logic

/**
 * Classes page: shows a list of classes, search, and add/leave actions.
 * Enhanced with better empty state, pull-to-refresh, accessibility, and polish.
 */
export default function ClassListScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  // Remove mockClasses and all demo class logic
  const [classes, setClasses] = useState([]); // Placeholder for actual classes
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const filtered = classes.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      // In a real app, fetch new data here
    }, 1000);
  };

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    try {
      // Replace with real backend call
      // Example: await fetch(`/api/classes/join`, { method: 'POST', body: JSON.stringify({ code: joinCode, userId: ... }) })
      // For now, just close modal
      setShowJoinModal(false);
      setJoinCode('');
      // TODO: Refresh class list
    } finally {
      setJoining(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: 'Classes',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/(tabs)')}
              style={{ marginRight: 16 }}
              accessibilityLabel="Go Home"
            >
              <Home size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>My Classes</Text>
          <View style={styles.avatar}><Users size={22} color={Colors.primary} /></View>
        </View>
        <TextInput
          placeholder="Search classes..."
          value={search}
          onChangeText={setSearch}
          style={styles.search}
          placeholderTextColor={Colors.text.disabled}
        />
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <BookOpen size={48} color={Colors.primary} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyText}>No classes found. Join a class with a code or create your own!</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push({ pathname: '/class/create' })}
              accessibilityLabel="Create your first class"
            >
              <Text style={styles.createButtonText}>Create your first class</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: Colors.secondary, marginTop: 8 }]}
              onPress={() => setShowJoinModal(true)}
              accessibilityLabel="Join class by code"
            >
              <Text style={styles.createButtonText}>Join by Code</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={{ marginBottom: 16 }}>
                <ClassCard
                  name={item.name}
                  description={item.description}
                  onPress={() => { setSelectedClass(item); setShowDetailsModal(true); }}
                />
                <TouchableOpacity
                  style={styles.leaveButton}
                  onPress={() => {
                    // In a real app, remove the class from the list
                    setClasses(prev => prev.filter(c => c.id !== item.id));
                  }}
                  accessibilityLabel={`Leave class ${item.name}`}
                >
                  <Text style={styles.leaveButtonText}>Leave Class</Text>
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 120 }}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        )}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push({ pathname: '/class/create' })}
          accessibilityLabel="Add new class"
          activeOpacity={0.7}
        >
          <Plus size={28} color={Colors.text.inverse} />
        </TouchableOpacity>
        {/* Join by Code Modal */}
        <Modal visible={showJoinModal} animationType="slide" transparent onRequestClose={() => setShowJoinModal(false)}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, width: '90%' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Join Class by Code</Text>
              <TextInput
                placeholder="Enter class code"
                value={joinCode}
                onChangeText={setJoinCode}
                style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, marginBottom: 16, padding: 10 }}
              />
              <TouchableOpacity
                style={[styles.createButton, { marginBottom: 8 }]}
                onPress={handleJoinByCode}
                disabled={joining}
              >
                <Text style={styles.createButtonText}>{joining ? 'Joining...' : 'Join'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: Colors.error }]}
                onPress={() => setShowJoinModal(false)}
              >
                <Text style={styles.createButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* Class Details Modal */}
        <Modal visible={showDetailsModal} animationType="slide" transparent onRequestClose={() => setShowDetailsModal(false)}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, width: '90%' }}>
              {selectedClass && (
                <>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>{selectedClass.name}</Text>
                  <Text style={{ fontSize: 16, color: Colors.text.secondary, marginBottom: 8 }}>{selectedClass.description}</Text>
                  {/* Add more class details here, e.g., members, code, etc. */}
                  <TouchableOpacity
                    style={[styles.createButton, { backgroundColor: Colors.error, marginTop: 16 }]}
                    onPress={() => setShowDetailsModal(false)}
                  >
                    <Text style={styles.createButtonText}>Close</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 15,
    color: Colors.text.primary,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: Colors.text.disabled,
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  createButton: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: Colors.text.inverse,
    fontWeight: '600',
    fontSize: 15,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: Colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  leaveButton: {
    marginTop: 6,
    alignSelf: 'flex-end',
    backgroundColor: '#ffeded',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  leaveButtonText: {
    color: '#d32f2f',
    fontWeight: '600',
    fontSize: 13,
  },
});
