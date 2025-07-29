import { GradeLevel } from '@/types';

export const educationLevels = [
  {
    id: 'primary',
    label: 'Primary School',
    levels: [
      { id: 'grade1', label: 'Grade 1' },
      { id: 'grade2', label: 'Grade 2' },
      { id: 'grade3', label: 'Grade 3' },
      { id: 'grade4', label: 'Grade 4' },
      { id: 'grade5', label: 'Grade 5' },
      { id: 'grade6', label: 'Grade 6' },
      { id: 'grade7', label: 'Grade 7' },
    ] as { id: GradeLevel; label: string }[],
  },
  {
    id: 'secondary',
    label: 'Secondary School',
    levels: [
      { id: 'form1', label: 'Form 1' },
      { id: 'form2', label: 'Form 2' },
      { id: 'form3', label: 'Form 3' },
      { id: 'form4', label: 'Form 4' },
      { id: 'form5', label: 'Form 5' },
      { id: 'form6', label: 'Form 6' },
    ] as { id: GradeLevel; label: string }[],
  },
  {
    id: 'university',
    label: 'University',
    levels: [
      { id: 'university_accounting', label: 'Accounting' },
      { id: 'university_agriculture', label: 'Agriculture' },
      { id: 'university_architecture', label: 'Architecture' },
      { id: 'university_business', label: 'Business Studies' },
      { id: 'university_chemistry', label: 'Chemistry' },
      { id: 'university_computer_science', label: 'Computer Science' },
      { id: 'university_economics', label: 'Economics' },
      { id: 'university_education', label: 'Education' },
      { id: 'university_engineering', label: 'Engineering' },
      { id: 'university_english', label: 'English Literature' },
      { id: 'university_environmental_science', label: 'Environmental Science' },
      { id: 'university_geography', label: 'Geography' },
      { id: 'university_history', label: 'History' },
      { id: 'university_law', label: 'Law' },
      { id: 'university_mathematics', label: 'Mathematics' },
      { id: 'university_medicine', label: 'Medicine' },
      { id: 'university_nursing', label: 'Nursing' },
      { id: 'university_pharmacy', label: 'Pharmacy' },
      { id: 'university_physics', label: 'Physics' },
      { id: 'university_psychology', label: 'Psychology' },
      { id: 'university_sociology', label: 'Sociology' },
    ] as { id: GradeLevel; label: string }[],
  },
  {
    id: 'polytechnic',
    label: 'Polytechnic',
    levels: [
      { id: 'polytechnic_automotive', label: 'Automotive Technology' },
      { id: 'polytechnic_building', label: 'Building Technology' },
      { id: 'polytechnic_electrical', label: 'Electrical Engineering' },
      { id: 'polytechnic_hospitality', label: 'Hospitality Management' },
      { id: 'polytechnic_information_technology', label: 'Information Technology' },
      { id: 'polytechnic_mechanical', label: 'Mechanical Engineering' },
      { id: 'polytechnic_textile', label: 'Textile Technology' },
    ] as { id: GradeLevel; label: string }[],
  },
];

export const getEducationLevelLabel = (gradeLevel: GradeLevel): string => {
  for (const category of educationLevels) {
    const level = category.levels.find(l => l.id === gradeLevel);
    if (level) {
      return level.label;
    }
  }
  return gradeLevel.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const getEducationCategory = (gradeLevel: GradeLevel): string => {
  if (gradeLevel.startsWith('grade')) return 'primary';
  if (gradeLevel.startsWith('form')) return 'secondary';
  if (gradeLevel.startsWith('university')) return 'university';
  if (gradeLevel.startsWith('polytechnic')) return 'polytechnic';
  return 'other';
};