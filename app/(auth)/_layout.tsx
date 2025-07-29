import { Stack } from "expo-router";
import React from "react";
import Colors from "@/constants/colors";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerTintColor: Colors.primary,
        contentStyle: {
          backgroundColor: Colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Welcome",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: "Log In",
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: "Create Account",
        }}
      />
    </Stack>
  );
}