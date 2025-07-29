import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Search, Filter, FileText, BookOpen, GraduationCap, File } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useCommunityStore } from '@/store/community-store';
import { GradeLevel } from '@/types';
import Colors from '@/constants/colors';
import Input from '@/components/Input';
import CommunityPostCard from '@/components/CommunityPostCard';
import GradeLevelSelector from '@/components/GradeLevelSelector';
import EmptyState from '@/components/EmptyState';
import { Picker } from '@react-native-picker/picker';

export default function CommunityScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { fetchPosts, posts, isLoading, addPost } = useCommunityStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<GradeLevel | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostDescription, setNewPostDescription] = useState('');
  const [newPostType, setNewPostType] = useState('past_paper');
  const [newPostCategory, setNewPostCategory] = useState('university');
  const [newPostSubject, setNewPostSubject] = useState('');
  const [adding, setAdding] = useState(false);
  
  useEffect(() => {
    loadPosts();
  }, [selectedType, selectedCategory, selectedLevel]);

  const loadPosts = async () => {
    await fetchPosts({
      type: selectedType || undefined,
      category: selectedCategory || undefined,
      gradeLevel: selectedLevel || undefined,
      subject: searchQuery || undefined,
    });
  };

  const handleSearch = () => {
    loadPosts();
  };

  const handleAddPost = async () => {
    if (!user) {
      alert('Please log in to share resources.');
      return;
    }
    setShowAddModal(true);
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostDescription.trim() || !newPostSubject.trim()) {
      alert('Please fill in all required fields.');
      return;
    }
    setAdding(true);
    try {
      await addPost({
        title: newPostTitle,
        description: newPostDescription,
        type: newPostType,
        category: newPostCategory,
        subject: newPostSubject,
        authorId: user.id,
        authorName: user.name,
        gradeLevel: user.gradeLevel,
      });
      setShowAddModal(false);
      setNewPostTitle('');
      setNewPostDescription('');
      setNewPostType('past_paper');
      setNewPostCategory('university');
      setNewPostSubject('');
      loadPosts();
    } catch (error) {
      alert('Failed to create post. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const postTypes = [
    { id: 'past_paper', label: 'Past Papers', icon: FileText },
    { id: 'notes', label: 'Study Notes', icon: BookOpen },
    { id: 'course_outline', label: 'Course Outlines', icon: GraduationCap },
    { id: 'study_guide', label: 'Study Guides', icon: File },
  ];

  const categories = [
    // Removed Zimbabwe-specific category
    { id: 'hexco', label: 'HEXCO', color: Colors.secondary },
    { id: 'university', label: 'University', color: Colors.accent },
    { id: 'polytechnic', label: 'Polytechnic', color: Colors.success },
  ];

  const filteredPosts = posts.filter(post => {
    if (searchQuery === '') return true;
    
    const query = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      post.description.toLowerCase().includes(query) ||
      post.subject.toLowerCase().includes(query) ||
      post.authorName.toLowerCase().includes(query)
    );
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddPost}
          >
            <Plus size={20} color={Colors.text.inverse} />
          </TouchableOpacity>
        </View>
      </View>
      
      <Input
        placeholder="Search resources, subjects, authors..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        leftIcon={<Search size={20} color={Colors.text.secondary} />}
        containerStyle={styles.searchContainer}
        onSubmitEditing={handleSearch}
      />
      
      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterTabs}
          >
            <Text style={styles.filterLabel}>Type:</Text>
            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedType === null && styles.activeFilterTab,
              ]}
              onPress={() => setSelectedType(null)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedType === null && styles.activeFilterTabText,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            
            {postTypes.map(type => {
              const Icon = type.icon;
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.filterTab,
                    selectedType === type.id && styles.activeFilterTab,
                  ]}
                  onPress={() => setSelectedType(type.id)}
                >
                  <Icon 
                    size={14} 
                    color={selectedType === type.id ? Colors.text.inverse : Colors.text.primary} 
                    style={styles.filterIcon}
                  />
                  <Text
                    style={[
                      styles.filterTabText,
                      selectedType === type.id && styles.activeFilterTabText,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterTabs}
          >
            <Text style={styles.filterLabel}>Category:</Text>
            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedCategory === null && styles.activeFilterTab,
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedCategory === null && styles.activeFilterTabText,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.filterTab,
                  selectedCategory === category.id && { backgroundColor: category.color },
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    selectedCategory === category.id && styles.activeFilterTabText,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <GradeLevelSelector
            selectedLevel={selectedLevel}
            onSelectLevel={setSelectedLevel}
          />
        </View>
      )}
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView 
          style={styles.postsContainer}
          contentContainerStyle={styles.postsContent}
        >
          {filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <CommunityPostCard 
                key={post.id} 
                post={post}
                onPress={() => {
                  // Navigate to post detail or open file
                  alert(`Opening ${post.title}`);
                }}
              />
            ))
          ) : (
            <EmptyState
              title="No Resources Found"
              description={
                searchQuery
                  ? "We couldn't find any resources matching your search."
                  : "No community resources available yet. Be the first to share!"
              }
              icon={<BookOpen size={48} color={Colors.text.disabled} />}
              actionLabel={searchQuery ? "Clear Search" : "Share Resource"}
              onAction={() => {
                if (searchQuery) {
                  setSearchQuery('');
                } else {
                  handleAddPost();
                }
              }}
              style={styles.emptyState}
            />
          )}
        </ScrollView>
      )}
      
      {/* Add Post Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, width: '90%', maxHeight: '80%' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Share Resource</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                placeholder="Resource Title"
                value={newPostTitle}
                onChangeText={setNewPostTitle}
                style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, marginBottom: 12, padding: 10 }}
              />
              
              <TextInput
                placeholder="Description"
                value={newPostDescription}
                onChangeText={setNewPostDescription}
                multiline
                numberOfLines={3}
                style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, marginBottom: 12, padding: 10, textAlignVertical: 'top' }}
              />
              
              <TextInput
                placeholder="Subject"
                value={newPostSubject}
                onChangeText={setNewPostSubject}
                style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, marginBottom: 12, padding: 10 }}
              />
              
              <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8, color: Colors.text.primary }}>Type:</Text>
              <Picker
                selectedValue={newPostType}
                onValueChange={setNewPostType}
                style={{ marginBottom: 12 }}
              >
                <Picker.Item label="Past Paper" value="past_paper" />
                <Picker.Item label="Study Notes" value="notes" />
                <Picker.Item label="Course Outline" value="course_outline" />
                <Picker.Item label="Study Guide" value="study_guide" />
              </Picker>
              
              <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8, color: Colors.text.primary }}>Category:</Text>
              <Picker
                selectedValue={newPostCategory}
                onValueChange={setNewPostCategory}
                style={{ marginBottom: 16 }}
              >
                <Picker.Item label="HEXCO" value="hexco" />
                <Picker.Item label="University" value="university" />
                <Picker.Item label="Polytechnic" value="polytechnic" />
              </Picker>
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.createButton, { marginBottom: 8 }]}
              onPress={handleCreatePost}
              disabled={adding || !newPostTitle.trim()}
            >
              <Text style={styles.createButtonText}>{adding ? 'Creating...' : 'Create Post'}</Text>
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
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
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
  filtersContainer: {
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 16,
  },
  filterTabs: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginRight: 12,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  activeFilterTab: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterIcon: {
    marginRight: 4,
  },
  filterTabText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  activeFilterTabText: {
    color: Colors.text.inverse,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postsContainer: {
    flex: 1,
  },
  postsContent: {
    padding: 16,
    paddingTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 40,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    color: Colors.text.inverse,
    fontSize: 16,
    fontWeight: 'bold',
  },
});