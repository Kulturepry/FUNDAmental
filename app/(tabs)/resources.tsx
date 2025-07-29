import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Alert, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Search, FileText, BookOpen, Video, FileQuestion } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useCoursesStore } from '@/store/courses-store';
import Colors from '@/constants/colors';
import Input from '@/components/Input';
import ResourceCard from '@/components/ResourceCard';
import EmptyState from '@/components/EmptyState';
import * as DocumentPicker from 'expo-document-picker';
import { Picker } from '@react-native-picker/picker';

export default function ResourcesScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { fetchResources, resources, isLoading, addResource } = useCoursesStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceDescription, setNewResourceDescription] = useState('');
  const [newResourceType, setNewResourceType] = useState('document');
  const [newResourceSubject, setNewResourceSubject] = useState('');
  const [newResourceFile, setNewResourceFile] = useState<any>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    await fetchResources(
      undefined,
      user?.role === 'student' ? user.gradeLevel : undefined
    );
  };

  const handleAddResource = () => {
    if (!user) {
      alert('Please log in to upload resources.');
      return;
    }
    setShowAddModal(true);
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        setNewResourceFile(result.assets[0]);
      }
    } catch (error) {
      alert('Failed to pick file. Please try again.');
    }
  };

  const handleCreateResource = async () => {
    if (!newResourceTitle.trim() || !newResourceDescription.trim() || !newResourceSubject.trim() || !newResourceFile) {
      alert('Please fill in all required fields and select a file.');
      return;
    }
    setAdding(true);
    try {
      const formData = new FormData();
      formData.append('file', newResourceFile as any);
      formData.append('title', newResourceTitle);
      formData.append('description', newResourceDescription);
      formData.append('type', newResourceType);
      formData.append('subject', newResourceSubject);
      formData.append('subjectId', user?.gradeLevel || '');
      
      const response = await fetch('http://192.168.137.1:3001/api/resources/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      
      setShowAddModal(false);
      setNewResourceTitle('');
      setNewResourceDescription('');
      setNewResourceType('document');
      setNewResourceSubject('');
      setNewResourceFile(null);
      loadResources();
    } catch (error) {
      alert('Failed to upload resource. Please try again.');
    } finally {
      setAdding(false);
    }
  };

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

  const handleUploadResource = async () => {
    try {
      if (!user) throw new Error('User not found');
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      const formData = new FormData();
      formData.append('file', file as any);
      formData.append('title', file.name);
      formData.append('description', 'Uploaded via app');
      formData.append('subjectId', user.gradeLevel || '');
      const response = await fetch('http://192.168.137.1:3001/api/resources/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      Alert.alert('Success', 'Resource uploaded successfully');
      loadResources();
    } catch (e: unknown) {
      const err = e as Error;
      Alert.alert('Upload Error', err.message);
    }
  };

  const handleDownloadResource = async (resource: any) => {
    try {
      const url = `http://192.168.137.1:3001/api/resources/${resource.id}/download`;
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

  const filteredResources = resources.filter(resource => {
    // Filter by type if selected
    if (selectedType && resource.type !== selectedType) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery === '') return true;
    
    const query = searchQuery.toLowerCase();
    return (
      resource.title.toLowerCase().includes(query) ||
      resource.description.toLowerCase().includes(query) ||
      resource.subject.toLowerCase().includes(query)
    );
  });

  const resourceTypes = [
    { id: 'document', label: 'Documents', icon: BookOpen },
    { id: 'video', label: 'Videos', icon: Video },
    { id: 'quiz', label: 'Quizzes', icon: FileQuestion },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Resources</Text>
        {user?.role === 'teacher' && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddResource}
          >
            <Plus size={20} color={Colors.text.inverse} />
          </TouchableOpacity>
        )}
      </View>
      
      <Input
        placeholder="Search resources..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        leftIcon={<Search size={20} color={Colors.text.secondary} />}
        containerStyle={styles.searchContainer}
      />
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.typeTabs}
      >
        <TouchableOpacity
          style={[
            styles.typeTab,
            selectedType === null && styles.activeTab,
          ]}
          onPress={() => setSelectedType(null)}
        >
          <Text
            style={[
              styles.typeTabText,
              selectedType === null && styles.activeTabText,
            ]}
          >
            All Resources
          </Text>
        </TouchableOpacity>
        
        {resourceTypes.map(type => {
          const Icon = type.icon;
          return (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeTab,
                selectedType === type.id && styles.activeTab,
              ]}
              onPress={() => setSelectedType(type.id)}
            >
              <Icon 
                size={16} 
                color={selectedType === type.id ? Colors.text.inverse : Colors.text.primary} 
                style={styles.typeIcon}
              />
              <Text
                style={[
                  styles.typeTabText,
                  selectedType === type.id && styles.activeTabText,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView 
          style={styles.resourcesContainer}
          contentContainerStyle={styles.resourcesContent}
        >
          {canUpload(user) && (
            <TouchableOpacity style={styles.uploadButton} onPress={handleUploadResource}>
              <Text style={styles.uploadButtonText}>Upload Resource</Text>
            </TouchableOpacity>
          )}
          {filteredResources.length > 0 ? (
            filteredResources.map(resource => (
              <View key={resource.id} style={{ marginBottom: 16 }}>
                <ResourceCard resource={resource} />
                <TouchableOpacity style={styles.downloadButton} onPress={() => handleDownloadResource(resource)}>
                  <Text style={styles.downloadButtonText}>Download</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <EmptyState
              title="No Resources Found"
              description={
                searchQuery
                  ? "We couldn't find any resources matching your search."
                  : selectedType
                  ? `There are no ${selectedType} resources available yet.`
                  : "No educational resources available yet."
              }
              icon={<FileText size={48} color={Colors.text.disabled} />}
              actionLabel={searchQuery || selectedType ? "Clear Filters" : "Refresh"}
              onAction={() => {
                if (searchQuery) {
                  setSearchQuery('');
                }
                if (selectedType) {
                  setSelectedType(null);
                } else {
                  loadResources();
                }
              }}
              style={styles.emptyState}
            />
          )}
        </ScrollView>
      )}
      
      {/* Add Resource Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, width: '90%', maxHeight: '80%' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Upload Resource</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                placeholder="Resource Title"
                value={newResourceTitle}
                onChangeText={setNewResourceTitle}
                style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, marginBottom: 12, padding: 10 }}
              />
              
              <TextInput
                placeholder="Description"
                value={newResourceDescription}
                onChangeText={setNewResourceDescription}
                multiline
                numberOfLines={3}
                style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, marginBottom: 12, padding: 10, textAlignVertical: 'top' }}
              />
              
              <TextInput
                placeholder="Subject"
                value={newResourceSubject}
                onChangeText={setNewResourceSubject}
                style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, marginBottom: 12, padding: 10 }}
              />
              
              <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8, color: Colors.text.primary }}>Type:</Text>
              <Picker
                selectedValue={newResourceType}
                onValueChange={setNewResourceType}
                style={{ marginBottom: 12 }}
              >
                <Picker.Item label="Document" value="document" />
                <Picker.Item label="Video" value="video" />
                <Picker.Item label="Audio" value="audio" />
                <Picker.Item label="Image" value="image" />
                <Picker.Item label="Other" value="other" />
              </Picker>
              
              <TouchableOpacity
                style={[styles.uploadButton, { marginBottom: 16 }]}
                onPress={handlePickFile}
              >
                <Text style={styles.uploadButtonText}>
                  {newResourceFile ? `Selected: ${newResourceFile.name}` : 'Select File'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.createButton, { marginBottom: 8 }]}
              onPress={handleCreateResource}
              disabled={adding || !newResourceTitle.trim() || !newResourceFile}
            >
              <Text style={styles.createButtonText}>{adding ? 'Uploading...' : 'Upload Resource'}</Text>
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
  typeTabs: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  typeTab: {
    flexDirection: 'row',
    alignItems: 'center',
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
  typeIcon: {
    marginRight: 6,
  },
  typeTabText: {
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
  resourcesContainer: {
    flex: 1,
  },
  resourcesContent: {
    padding: 16,
    paddingTop: 8,
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
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});