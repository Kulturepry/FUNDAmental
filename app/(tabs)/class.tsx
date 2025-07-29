
import { Stack } from 'expo-router';
import { Home } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, Modal } from 'react-native';
import ClassCard from '@/components/ClassCard';
import Colors from '@/constants/colors';
import { Plus, Users, BookOpen } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import ChatScreen from '../components/ChatScreen';
import { Picker } from '@react-native-picker/picker';

type Course = {
  id: number | string;
  title: string;
  description?: string;
  gradeLevel?: string;
  subject?: string;
  teacherId?: string;
  students?: string[];
  createdAt?: string;
};

const API_BASE_URL = 'http://192.168.137.1:3001/api';

export default function ClassListScreen() {
  const user = useAuthStore(s => s.user);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [classes, setClasses] = useState<Course[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Course | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClassTitle, setNewClassTitle] = useState('');
  const [newClassDescription, setNewClassDescription] = useState('');
  const [newClassGradeLevel, setNewClassGradeLevel] = useState('form1');
  const [newClassSubject, setNewClassSubject] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchClasses = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/courses`);
      const data = await res.json();
      setClasses(data.courses || []);
    } catch (e) {
      // handle error
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleRefresh = fetchClasses;

  const handleJoinByCode = async () => {
    if (!joinCode.trim() || !user) return;
    setJoining(true);
    try {
      // Find course by code (simulate: code is course id)
      const course = classes.find(c => String(c.id) === joinCode.trim());
      if (!course) throw new Error('Class not found');
      await fetch(`${API_BASE_URL}/courses/${course.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      setShowJoinModal(false);
      setJoinCode('');
      fetchClasses();
    } catch (e) {
      // handle error
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async (courseId: number | string) => {
    if (!user) return;
    await fetch(`${API_BASE_URL}/courses/${courseId}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    });
    fetchClasses();
  };

  const handleShowDetails = async (item: Course) => {
    setLoadingDetails(true);
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${item.id}`);
      const data = await res.json();
      setSelectedClass(data);
      setShowDetailsModal(true);
    } catch (e) {
      // handle error
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCreateClass = async () => {
    if (!user) return;
    setCreating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newClassTitle,
          description: newClassDescription,
          gradeLevel: newClassGradeLevel,
          subject: newClassSubject,
          teacherId: user.id,
        }),
      });
      if (!res.ok) throw new Error('Failed to create class');
      setShowCreateModal(false);
      setNewClassTitle('');
      setNewClassDescription('');
      setNewClassGradeLevel('form1');
      setNewClassSubject('');
      fetchClasses();
    } catch (e) {
      // Optionally show error
    } finally {
      setCreating(false);
    }
  };

  const filtered: Course[] = classes.filter(c => c.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: 'Classes',
          headerRight: () => (
            <TouchableOpacity style={{ marginRight: 16 }} accessibilityLabel="Go Home">
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
              accessibilityLabel="Create your first class"
              onPress={() => setShowCreateModal(true)}
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
            keyExtractor={item => String(item.id)}
            renderItem={({ item }: { item: Course }) => (
              <View style={{ marginBottom: 16 }}>
                <ClassCard
                  name={item.title || 'Untitled'}
                  description={item.description || ''}
                  onPress={() => handleShowDetails(item)}
                />
                <TouchableOpacity
                  style={styles.leaveButton}
                  onPress={() => handleLeave(item.id)}
                  accessibilityLabel={`Leave class ${item.title}`}
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
          accessibilityLabel="Add new class"
          activeOpacity={0.7}
          onPress={() => setShowCreateModal(true)}
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
        {/* Create Class Modal */}
        <Modal visible={showCreateModal} animationType="slide" transparent onRequestClose={() => setShowCreateModal(false)}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, width: '90%' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Create New Class</Text>
              <TextInput
                placeholder="Class Title"
                value={newClassTitle}
                onChangeText={setNewClassTitle}
                style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, marginBottom: 12, padding: 10 }}
              />
              <TextInput
                placeholder="Description"
                value={newClassDescription}
                onChangeText={setNewClassDescription}
                style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, marginBottom: 12, padding: 10 }}
              />
              <Picker
                selectedValue={newClassGradeLevel}
                onValueChange={setNewClassGradeLevel}
                style={{ marginBottom: 12 }}
              >
                <Picker.Item label="Form 1" value="form1" />
                <Picker.Item label="Form 2" value="form2" />
                <Picker.Item label="Form 3" value="form3" />
                <Picker.Item label="Form 4" value="form4" />
                <Picker.Item label="A Level" value="alevel" />
                <Picker.Item label="University/College" value="university" />
                <Picker.Item label="Teacher" value="teacher" />
              </Picker>
              <TextInput
                placeholder="Subject"
                value={newClassSubject}
                onChangeText={setNewClassSubject}
                style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, marginBottom: 16, padding: 10 }}
              />
              <TouchableOpacity
                style={[styles.createButton, { marginBottom: 8 }]}
                onPress={handleCreateClass}
                disabled={creating || !newClassTitle.trim()}
              >
                <Text style={styles.createButtonText}>{creating ? 'Creating...' : 'Create'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: Colors.error }]}
                onPress={() => setShowCreateModal(false)}
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
              {selectedClass && !showChatModal && (
                <>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>{selectedClass.title}</Text>
                  <Text style={{ fontSize: 16, color: Colors.text.secondary, marginBottom: 8 }}>{selectedClass.description}</Text>
                  {/* Add more class details here, e.g., members, code, etc. */}
                  <TouchableOpacity
                    style={[styles.createButton, { backgroundColor: Colors.primary, marginTop: 16 }]}
                    onPress={() => setShowChatModal(true)}
                  >
                    <Text style={styles.createButtonText}>Chat</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.createButton, { backgroundColor: Colors.error, marginTop: 8 }]}
                    onPress={() => setShowDetailsModal(false)}
                  >
                    <Text style={styles.createButtonText}>Close</Text>
                  </TouchableOpacity>
                </>
              )}
              {selectedClass && showChatModal && user && (
                <View style={{ height: 500, width: '100%' }}>
                  <ChatScreen
                    courseId={selectedClass.id}
                    user={{ id: user.id, name: user.name }}
                    onClose={() => setShowChatModal(false)}
                  />
                </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  search: {
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: Colors.background,
    marginBottom: 16,
    fontSize: 16,
    color: Colors.text.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  createButtonText: {
    color: Colors.text.inverse,
    fontSize: 16,
    fontWeight: 'bold',
  },
  leaveButton: {
    backgroundColor: Colors.error,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  leaveButtonText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: Colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
