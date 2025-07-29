import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { Download, Star, Eye, FileText, BookOpen, File, GraduationCap } from 'lucide-react-native';
import { CommunityPost } from '@/types';
import { getEducationLevelLabel } from '@/constants/education-levels';
import { useCommunityStore } from '@/store/community-store';
import { useOfflineStore } from '@/store/offline-store';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import Card from './Card';

interface CommunityPostCardProps {
  post: CommunityPost;
  onPress?: () => void;
}

export default function CommunityPostCard({ post, onPress }: CommunityPostCardProps) {
  const { user } = useAuthStore();
  const { incrementDownloads, ratePost } = useCommunityStore();
  const { addDownload, isContentDownloaded, setDownloading, setDownloadProgress } = useOfflineStore();

  const getTypeIcon = () => {
    switch (post.type) {
      case 'past_paper':
        return <FileText size={20} color={Colors.primary} />;
      case 'notes':
        return <BookOpen size={20} color={Colors.primary} />;
      case 'course_outline':
        return <GraduationCap size={20} color={Colors.primary} />;
      default:
        return <File size={20} color={Colors.primary} />;
    }
  };

  const getTypeLabel = () => {
    switch (post.type) {
      case 'past_paper':
        return 'Past Paper';
      case 'notes':
        return 'Study Notes';
      case 'course_outline':
        return 'Course Outline';
      case 'study_guide':
        return 'Study Guide';
      default:
        return 'Resource';
    }
  };

  const getCategoryColor = () => {
    switch (post.category) {
      case 'university':
        return Colors.accent;
      case 'polytechnic':
        return Colors.success;
      default:
        return Colors.primary;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to download resources.');
      return;
    }

    if (isContentDownloaded(post.id)) {
      Alert.alert('Already Downloaded', 'This resource is already available offline.');
      return;
    }

    try {
      setDownloading(post.id, true);
      setDownloadProgress(post.id, 0);

      // Simulate download progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setDownloadProgress(post.id, i);
      }

      // Add to downloaded content
      addDownload({
        id: post.id,
        type: 'community_post',
        title: post.title,
        filePath: `/downloads/${post.fileName}`,
        downloadedAt: new Date().toISOString(),
        size: post.fileSize,
      });

      incrementDownloads(post.id);
      Alert.alert('Download Complete', 'Resource is now available offline.');
    } catch (error) {
      Alert.alert('Download Failed', 'Failed to download resource. Please try again.');
    } finally {
      setDownloading(post.id, false);
    }
  };

  const handleRate = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to rate resources.');
      return;
    }

    Alert.alert(
      'Rate Resource',
      'How would you rate this resource?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '⭐ 1 Star', onPress: () => ratePost(post.id, user.id, 1) },
        { text: '⭐⭐ 2 Stars', onPress: () => ratePost(post.id, user.id, 2) },
        { text: '⭐⭐⭐ 3 Stars', onPress: () => ratePost(post.id, user.id, 3) },
        { text: '⭐⭐⭐⭐ 4 Stars', onPress: () => ratePost(post.id, user.id, 4) },
        { text: '⭐⭐⭐⭐⭐ 5 Stars', onPress: () => ratePost(post.id, user.id, 5) },
      ]
    );
  };

  const isDownloaded = isContentDownloaded(post.id);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card variant="outlined" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.typeContainer}>
            {getTypeIcon()}
            <Text style={styles.typeText}>{getTypeLabel()}</Text>
          </View>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor() + '20' }]}>
            <Text style={[styles.categoryText, { color: getCategoryColor() }]}>
              {post.category.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {post.title}
        </Text>

        <Text style={styles.description} numberOfLines={2}>
          {post.description}
        </Text>

        <View style={styles.metaContainer}>
          <Text style={styles.metaText}>
            {getEducationLevelLabel(post.gradeLevel)} • {post.subject}
          </Text>
          <Text style={styles.metaText}>
            {formatFileSize(post.fileSize)} • By {post.authorName}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Download size={14} color={Colors.text.secondary} />
              <Text style={styles.statText}>{post.downloads}</Text>
            </View>
            
            <TouchableOpacity style={styles.statItem} onPress={handleRate}>
              <Star size={14} color={Colors.warning} />
              <Text style={styles.statText}>
                {post.rating.toFixed(1)} ({post.ratingCount})
              </Text>
            </TouchableOpacity>
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
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Eye size={16} color={Colors.success} />
                <Text style={[styles.downloadText, { color: Colors.success }]}>
                  Downloaded
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Download size={16} color={Colors.primary} />
                <Text style={styles.downloadText}>Download</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  metaContainer: {
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    gap: 4,
  },
  downloadedButton: {
    backgroundColor: Colors.success + '20',
  },
  downloadText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary,
  },
});