import { View, Text, TextInput, Button } from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function InviteStudentsScreen() {
  const { id } = useLocalSearchParams();
  const [email, setEmail] = useState('');
  const [invited, setInvited] = useState<string[]>([]);
  const router = useRouter();

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Invite Students to Class {id}</Text>
      <TextInput
        placeholder="Student Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 12 }}
      />
      <Button title="Invite" onPress={() => {
        if (email) {
          setInvited([...invited, email]);
          setEmail('');
        }
      }} />
      <Text style={{ marginTop: 16, fontWeight: 'bold' }}>Invited Students:</Text>
      {invited.map((e, i) => (
        <Text key={i} style={{ marginLeft: 8 }}>{e}</Text>
      ))}
      <Button title="Done" onPress={() => {
        let classId = Array.isArray(id) ? id[0] : id;
        router.replace({ pathname: '/class/[id]', params: { id: classId } });
      }} />
    </View>
  );
}
