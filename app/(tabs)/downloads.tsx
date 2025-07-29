import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Trash2, FolderOpen, HardDrive, Download } from 'lucide-react-native';
import { useOfflineStore } from '@/store/offline-store';
import Colors from '@/constants/colors';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';

export default function DownloadsScreen() {
  const { 
    downloadedContent, 
    removeDownload, 
    getTotalDownloadSize 
  } = useOfflineStore();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleDeleteDownload = (id: string, title: string) => {
    Alert.alert(
      'Delete Download',
      `Are you sure you want to delete "${title}"? This will remove the offline copy.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => removeDownload(id)
        },
      ]
    );
  };

  const handleClearAll = () => {
    if (downloadedContent.length === 0) return;
    
    Alert.alert(
      'Clear All Downloads',
      'Are you sure you want to delete all downloaded content? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => {
            downloadedContent.forEach(item => removeDownload(item.id));
          }
        },
      ]
    );
  };

  const totalSize = getTotalDownloadSize();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Downloads</Text>
        {downloadedContent.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={handleClearAll}
          >
            <Trash2 size={20} color={Colors.error} />
          </TouchableOpacity>
        )}
      </View>
      
      {downloadedContent.length > 0 && (
        <Card variant="outlined" style={styles.statsCard}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <HardDrive size={20} color={Colors.primary} />
              <View style={styles.statTextContainer}>
                <Text style={styles.statValue}>{formatFileSize(totalSize)}</Text>
                <Text style={styles.statLabel}>Total Size</Text>
              </View>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <FolderOpen size={20} color={Colors.primary} />
              <View style={styles.statTextContainer}>
                <Text style={styles.statValue}>{downloadedContent.length}</Text>
                <Text style={styles.statLabel}>Files</Text>
              </View>
            </View>
          </View>
        </Card>
      )}
      
      <ScrollView 
        style={styles.downloadsContainer}
        contentContainerStyle={styles.downloadsContent}
      >
        {downloadedContent.length > 0 ? (
          downloadedContent
            .sort((a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime())
            .map(item => (
              <Card key={item.id} variant="outlined" style={styles.downloadCard}>
                <View style={styles.downloadHeader}>
                  <View style={styles.downloadInfo}>
                    <Text style={styles.downloadTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <View style={styles.downloadMeta}>
                      <Text style={styles.downloadMetaText}>
                        {formatFileSize(item.size)} • Downloaded {formatDate(item.downloadedAt)}
                      </Text>
                      <View style={styles.typeBadge}>
                        <Text style={styles.typeBadgeText}>
                          {item.type === 'resource' ? 'Course Resource' : 'Community Post'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteDownload(item.id, item.title)}
                  >
                    <Trash2 size={18} color={Colors.error} />
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                  style={styles.openButton}
                  onPress={() => {
                    // In a real app, this would open the file
                    Alert.alert('Open File', `Opening ${item.title}`);
                  }}
                >
                  <FolderOpen size={16} color={Colors.primary} />
                  <Text style={styles.openButtonText}>Open File</Text>
                </TouchableOpacity>
              </Card>
            ))
        ) : (
          <EmptyState
            title="No Downloads Yet"
            description="Downloaded resources and community posts will appear here for offline access."
            icon={<Download size={48} color={Colors.text.disabled} />}
            actionLabel="Browse Resources"
            onAction={() => {
              // Navigate to resources or community
              alert('Navigate to resources');
            }}
            style={styles.emptyState}
          />
        )}
      </ScrollView>
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
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTextContainer: {
    marginLeft: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  downloadsContainer: {
    flex: 1,
  },
  downloadsContent: {
    padding: 16,
    paddingTop: 0,
  },
  downloadCard: {
    padding: 16,
    marginVertical: 6,
  },
  downloadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  downloadInfo: {
    flex: 1,
    marginRight: 12,
  },
  downloadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 6,
  },
  downloadMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  downloadMetaText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  typeBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.primary,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary + '20',
    gap: 6,
  },
  openButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 40,
  },
});