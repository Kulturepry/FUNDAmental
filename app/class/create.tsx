import { View, Text, TextInput, Button } from 'react-native';
import { useState } from 'react';
import { useRouter, Stack } from 'expo-router';

export default function CreateClassScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'Create Class', headerBackVisible: true }} />
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Create a New Class</Text>
        <TextInput
          placeholder="Class Name"
          value={name}
          onChangeText={setName}
          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 12 }}
        />
        <TextInput
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 12 }}
        />
        <Button title="Create" onPress={() => {
          // TODO: Call backend to create class
          router.replace('../');
        }} />
      </View>
    </>
  );
}
