import React, { useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { Image } from 'expo-image';
import Colors from '@/constants/colors';
import { getOptimizedImageUrl } from '@/utils/performance';

interface OptimizedImageProps {
  source: { uri: string };
  style: any;
  contentFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  width?: number;
  height?: number;
  placeholder?: string;
}

export default function OptimizedImage({
  source,
  style,
  contentFit = 'cover',
  width = 500,
  height = 300,
  placeholder,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const optimizedUri = getOptimizedImageUrl(source.uri, width, height);

  return (
    <View style={[style, styles.container]}>
      {isLoading && (
        <View style={[style, styles.loadingContainer]}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      )}
      
      <Image
        source={{ uri: optimizedUri }}
        style={[style, hasError && styles.hidden]}
        contentFit={contentFit}
        placeholder={placeholder}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        transition={300}
        cachePolicy="memory-disk"
      />
      
      {hasError && (
        <View style={[style, styles.errorContainer]}>
          <Text style={styles.errorText}>Failed to load image</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    zIndex: 1,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorText: {
    color: Colors.text.secondary,
    fontSize: 12,
  },
  hidden: {
    opacity: 0,
  },
});