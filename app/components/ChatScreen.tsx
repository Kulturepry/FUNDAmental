import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import Colors from '@/constants/colors';

const API_BASE_URL = 'https://fundamental.onrender.com/api';

export interface ChatScreenProps {
  courseId: string | number;
  user: { id: string | number; name: string };
  onClose?: () => void;
}

interface Message {
  id: number;
  userId: string | number;
  userName: string;
  text: string;
  timestamp: string;
}

export default function ChatScreen({ courseId, user, onClose }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${courseId}/chat`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (e) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, [courseId]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    try {
      await fetch(`${API_BASE_URL}/courses/${courseId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, userName: user.name, text: input.trim() }),
      });
      setInput('');
      fetchMessages();
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) {
      // handle error
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View style={[styles.message, item.userId === user.id ? styles.myMessage : styles.otherMessage]}>
      <Text style={styles.userName}>{item.userName}</Text>
      <Text style={styles.text}>{item.text}</Text>
      <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Class Chat</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityLabel="Close chat">
            <Text style={{ fontSize: 18, color: Colors.primary }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          editable={!sending}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={sending || !input.trim()}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 8,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  message: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    maxWidth: '80%',
  },
  myMessage: {
    backgroundColor: Colors.primary + '22',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: Colors.card,
    alignSelf: 'flex-start',
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 2,
    color: Colors.text.secondary,
  },
  text: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  timestamp: {
    fontSize: 10,
    color: Colors.text.disabled,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.card,
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    fontSize: 16,
    marginRight: 8,
    color: Colors.text.primary,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  sendButtonText: {
    color: Colors.text.inverse,
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 