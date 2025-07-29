import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, BookOpen, Calendar, FileText, ChevronRight, Download, Bell } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useCoursesStore } from '@/store/courses-store';
import { useCommunityStore } from '@/store/community-store';
import { useOfflineStore } from '@/store/offline-store';
import { Course, Assignment, CommunityPost } from '@/types';
import Colors from '@/constants/colors';
import Input from '@/components/Input';
import CourseCard from '@/components/CourseCard';
import Card from '@/components/Card';

// Helper to format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { fetchCourses, fetchAssignments, courses, assignments } = useCoursesStore();
  const { fetchPosts, posts } = useCommunityStore();
  const { getTotalDownloadSize, downloadedContent } = useOfflineStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<CommunityPost[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Filtered courses based on search query
  const filteredCourses = searchQuery
    ? courses.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : recentCourses;

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          const userCourses = await fetchCourses(
            user.role === 'student' ? user.gradeLevel : undefined
          );
          setRecentCourses(userCourses.slice(0, 3));
          // Fetch trending posts (top 3 by downloads)
          const allPosts = await fetchPosts();
          setTrendingPosts(
            [...allPosts].sort((a, b) => b.downloads - a.downloads).slice(0, 3)
          );
        } catch (error) {
          console.error('Error loading home data:', error);
        }
      }
    };
    loadData();
  }, [user]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      try {
        const response = await fetch(`http://192.168.137.1:3001/api/notifications?userId=${user.id}`);
        const data = await response.json();
        const unread = (data.notifications || []).filter((n: any) => !n.read).length;
        setUnreadCount(unread);
      } catch (e) {
        setUnreadCount(0);
      }
    };
    fetchNotifications();
  }, [user]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{user?.name ?? 'User'}</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.push('/notifications' as any)} style={styles.bellIcon} accessibilityLabel="Go to notifications">
              <Bell size={24} color={Colors.primary} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.avatarPlaceholder}
              onPress={() => router.push('/account')}
              accessibilityLabel="Go to profile"
            >
              <Text style={styles.avatarText}>
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <Input
          placeholder="Search courses, resources..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Search size={20} color={Colors.text.secondary} />}
          containerStyle={styles.searchContainer}
        />

        {/* Stat Cards */}
        <View style={styles.statRow}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/courses')}
          >
            <View style={[styles.statIconContainer, { backgroundColor: Colors.primary + '20' }]}> 
              <BookOpen size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{courses.length}</Text>
            <Text style={styles.statLabel} numberOfLines={1} ellipsizeMode="tail">Courses</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/assignments')}
          >
            <View style={[styles.statIconContainer, { backgroundColor: Colors.secondary + '20' }]}> 
              <Calendar size={20} color={Colors.secondary} />
            </View>
            <Text style={styles.statValue}>{assignments.length}</Text>
            <Text style={styles.statLabel} numberOfLines={1} ellipsizeMode="tail">Assignments</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/community')}
          >
            <View style={[styles.statIconContainer, { backgroundColor: Colors.accent + '20' }]}> 
              <FileText size={20} color={Colors.accent} />
            </View>
            <Text style={styles.statValue}>{posts.length}</Text>
            <Text style={styles.statLabel} numberOfLines={1} ellipsizeMode="tail">Community</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/downloads')}
          >
            <View style={[styles.statIconContainer, { backgroundColor: Colors.success + '20' }]}> 
              <Download size={20} color={Colors.success} />
            </View>
            <Text style={styles.statValue}>{downloadedContent.length}</Text>
            <Text style={styles.statLabel} numberOfLines={1} ellipsizeMode="tail">Downloads</Text>
          </TouchableOpacity>
        </View>

        {/* Offline Card */}
        {downloadedContent.length > 0 && (
          <Card variant="elevated">
            <View style={styles.offlineCard}>
              <View style={styles.offlineHeader}>
                <Download size={20} color={Colors.success} />
                <Text style={styles.offlineTitle}>Offline Content</Text>
              </View>
              <Text style={styles.offlineDescription}>
                You have {downloadedContent.length} files ({formatFileSize(getTotalDownloadSize())}) available offline
              </Text>
              <TouchableOpacity
                style={styles.offlineButton}
                onPress={() => router.push('/downloads')}
              >
                <Text style={styles.offlineButtonText}>Manage Downloads</Text>
                <ChevronRight size={16} color={Colors.success} />
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Recent Courses Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Courses</Text>
            <TouchableOpacity onPress={() => router.push('/courses')}>
              <Text style={styles.sectionLink}>See All</Text>
            </TouchableOpacity>
          </View>
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course: Course) => (
              <CourseCard key={course.id} course={course} />
            ))
          ) : (
            <Card variant="outlined">
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? "No courses match your search."
                    : "No courses yet. Browse available courses to get started."
                  }
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => router.push('/courses')}
                >
                  <Text style={styles.emptyButtonText}>Browse Courses</Text>
                  <ChevronRight size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </Card>
          )}
        </View>

        {/* Trending in Community Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending in Community</Text>
            <TouchableOpacity onPress={() => router.push('/community')}>
              <Text style={styles.sectionLink}>See All</Text>
            </TouchableOpacity>
          </View>
          {trendingPosts.length > 0 ? (
            trendingPosts.map((post: CommunityPost) => (
              <Card key={post.id} variant="outlined" style={styles.trendingCard}>
                <View>
                  <View style={styles.trendingHeader}>
                    <Text style={styles.trendingTitle} numberOfLines={1}>
                      {post.title}
                    </Text>
                    <View style={[styles.categoryBadge, { backgroundColor: Colors.primary + '20' }]}>
                      <Text style={styles.categoryText}>{post.category.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={styles.trendingMeta}>
                    {post.downloads} downloads • {(post.rating ?? 0).toFixed(1)} ⭐
                  </Text>
                </View>
              </Card>
            ))
          ) : (
            <Card variant="outlined">
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  No community posts yet. Be the first to share!
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => router.push('/community')}
                >
                  <Text style={styles.emptyButtonText}>Explore Community</Text>
                  <ChevronRight size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  searchContainer: {
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 0,
    marginLeft: 4,
    marginRight: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    marginBottom: 24,
    gap: 12,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9.5, // slightly reduced
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 2, // add a bit of horizontal padding
  },
  offlineCard: {
    padding: 16,
    marginBottom: 24,
    backgroundColor: Colors.success + '10',
  },
  offlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  offlineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.success,
    marginLeft: 8,
  },
  offlineDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  offlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  offlineButtonText: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '500',
    marginRight: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  sectionLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  emptyCard: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginRight: 4,
  },
  trendingCard: {
    padding: 12,
    marginVertical: 4,
  },
  trendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  trendingTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary,
  },
  trendingMeta: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  bellIcon: {
    marginBottom: 4,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});