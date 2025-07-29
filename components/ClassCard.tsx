import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Card from './Card';
import Colors from '@/constants/colors';

interface ClassCardProps {
  name: string;
  description: string;
  onPress: () => void;
}

export default function ClassCard({ name, description, onPress }: ClassCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card variant="outlined" style={styles.card}>
        <View style={styles.container}>
          <View style={styles.icon} />
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={1}>{name}</Text>
            <Text style={styles.description} numberOfLines={2}>{description}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    padding: 12,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
});
