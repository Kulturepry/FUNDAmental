import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { GradeLevel } from '@/types';
import { educationLevels } from '@/constants/education-levels';
import Colors from '@/constants/colors';

interface GradeLevelSelectorProps {
  selectedLevel: GradeLevel | null;
  onSelectLevel: (level: GradeLevel) => void;
}

export default function GradeLevelSelector({ selectedLevel, onSelectLevel }: GradeLevelSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Education Level</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {educationLevels.map((category) => (
          <View key={category.id} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{category.label}</Text>
            <View style={styles.levelsContainer}>
              {category.levels.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.levelButton,
                    selectedLevel === level.id && styles.selectedLevelButton,
                  ]}
                  onPress={() => onSelectLevel(level.id)}
                >
                  <Text 
                    style={[
                      styles.levelText,
                      selectedLevel === level.id && styles.selectedLevelText,
                    ]}
                  >
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 16,
    color: Colors.text.primary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  categoryContainer: {
    marginRight: 24,
    minWidth: 200,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  levelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  levelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedLevelButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  levelText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  selectedLevelText: {
    color: Colors.text.inverse,
    fontWeight: '500',
  },
});