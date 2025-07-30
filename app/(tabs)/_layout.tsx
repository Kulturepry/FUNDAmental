import { Tabs } from "expo-router";
import React, { useRef, useEffect } from "react";
import { ScrollView, View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Home, BookOpen, Calendar, FileText, User, Users, Download } from "lucide-react-native";
import Colors from "@/constants/colors";
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

/**
 * Custom tab bar component for horizontal scroll and spacing.
 * @param props - BottomTabBarProps from @react-navigation/bottom-tabs
 */
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const scrollRef = useRef<ScrollView>(null);
  
  // Safety check - don't render if state is not properly initialized
  if (!state || !state.routes || !descriptors) {
    return null;
  }
  
  useEffect(() => {
    // Auto-scroll hint: scroll right then back
    const timeout1 = setTimeout(() => {
      scrollRef.current?.scrollTo({ x: 120, animated: true });
    }, 500);
    const timeout2 = setTimeout(() => {
      scrollRef.current?.scrollTo({ x: 0, animated: true });
    }, 1500);
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, []);
  return (
    <View style={{ backgroundColor: 'white', elevation: 8 }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8, gap: 8 }}
      >
        {state.routes?.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const color = isFocused ? Colors.primary : Colors.text.secondary;
          const size = 22;
          let label: React.ReactNode;
          if (typeof options.tabBarLabel === 'function') {
            label = options.tabBarLabel({
              focused: isFocused,
              color,
              position: 'below-icon',
              children: options.title ?? route.name,
            });
          } else if (typeof options.tabBarLabel === 'string') {
            label = options.tabBarLabel;
          } else if (typeof options.title === 'string') {
            label = options.title;
          } else {
            label = route.name;
          }
          let icon: React.ReactNode = null;
          if (typeof options.tabBarIcon === 'function') {
            icon = options.tabBarIcon({
              focused: isFocused,
              color,
              size: 26, // set icon size here
            });
          }
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={typeof label === 'string' ? label : route.name}
              onPress={() => navigation.navigate(route.name)}
              style={[
                styles.tabItem,
                isFocused && styles.tabItemActive,
              ]}
            >
              {icon}
              <Text style={{ color, fontSize: 14, fontWeight: '500' }} numberOfLines={1}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.secondary,
        tabBarStyle: {
          borderTopColor: Colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: "Courses",
          tabBarIcon: ({ color }) => <BookOpen size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="assignments"
        options={{
          title: "Assignments",
          tabBarIcon: ({ color }) => <Calendar size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: "Resources",
          tabBarIcon: ({ color }) => <FileText size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "Community",
          tabBarIcon: ({ color }) => <Users size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="downloads"
        options={{
          title: "Downloads",
          tabBarIcon: ({ color }) => <Download size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="class"
        options={{
          title: "Classes",
          tabBarIcon: ({ color }) => <Users size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12, // increased
    paddingHorizontal: 20, // increased
    borderRadius: 10, // slightly larger
    marginHorizontal: 4, // slightly more space
    minWidth: 80, // increased
    maxWidth: 100, // increased
  },
  tabItemActive: {
    backgroundColor: '#eef3ff',
  },
});