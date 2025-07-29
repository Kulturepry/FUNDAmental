import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Linking, Alert } from 'react-native';
import { FileText, Video, FileQuestion, File, Download, Eye } from 'lucide-react-native';
import { Resource } from '@/types';
import { useOfflineStore } from '@/store/offline-store';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import Card from './Card';

interface ResourceCardProps {
  resource: Resource;
}

export default function ResourceCard({ resource }: ResourceCardProps) {
  const { user } = useAuthStore();
  const { addDownload, isContentDownloaded, setDownloading, setDownloadProgress } = useOfflineStore();

  const handlePress = () => {
    if (isContentDownloaded(resource.id)) {
      // Open offline version
      Alert.alert('Open Offline', `Opening offline version of ${resource.title}`);
    } else {
      // Open online version
      Linking.openURL(resource.url);
    }
  };

  const handleDownload = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to download resources.');
      return;
    }

    if (isContentDownloaded(resource.id)) {
      Alert.alert('Already Downloaded', 'This resource is already available offline.');
      return;
    }

    try {
      setDownloading(resource.id, true);
      setDownloadProgress(resource.id, 0);

      // Simulate download progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setDownloadProgress(resource.id, i);
      }

      // Add to downloaded content
      addDownload({
        id: resource.id,
        type: 'resource',
        title: resource.title,
        filePath: `/downloads/${resource.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
        downloadedAt: new Date().toISOString(),
        size: Math.floor(Math.random() * 5000000) + 500000, // Random size between 0.5-5MB
      });

      Alert.alert('Download Complete', 'Resource is now available offline.');
    } catch (error) {
      Alert.alert('Download Failed', 'Failed to download resource. Please try again.');
    } finally {
      setDownloading(resource.id, false);
    }
  };

  const getIcon = () => {
    switch (resource.type) {
      case 'document':
        return <FileText size={24} color={Colors.primary} />;
      case 'video':
        return <Video size={24} color={Colors.primary} />;
      case 'quiz':
        return <FileQuestion size={24} color={Colors.primary} />;
      default:
        return <File size={24} color={Colors.primary} />;
    }
  };

  const getTypeLabel = () => {
    switch (resource.type) {
      case 'document':
        return 'Document';
      case 'video':
        return 'Video';
      case 'quiz':
        return 'Quiz';
      default:
        return 'Resource';
    }
  };

  const isDownloaded = isContentDownloaded(resource.id);

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Card variant="outlined" style={styles.card}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            {getIcon()}
          </View>
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={1}>
              {resource.title}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {resource.description}
            </Text>
            <View style={styles.footer}>
              <View style={[
                styles.typeBadge,
                { backgroundColor: Colors.primary + '20' }
              ]}>
                <Text style={styles.typeText}>{getTypeLabel()}</Text>
              </View>
              <Text style={styles.subject}>{resource.subject}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.downloadButton,
              isDownloaded && styles.downloadedButton,
            ]}
            onPress={handleDownload}
            disabled={isDownloaded}
          >
            {isDownloaded ? (
              <Eye size={16} color={Colors.success} />
            ) : (
              <Download size={16} color={Colors.primary} />
            )}
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: Colors.primary + '10', // 10% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary,
  },
  subject: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  downloadButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadedButton: {
    backgroundColor: Colors.success + '20',
  },
});