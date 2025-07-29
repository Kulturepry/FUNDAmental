import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import Colors from '@/constants/colors';

export type CommentType = 'resource' | 'assignment';

interface CommentsSectionProps {
  type: CommentType;
  itemId: string;
  user: { id: string; name: string; role?: string };
  moderatorIds?: string[]; // teacher/admin/course creator IDs
}

type Comment = {
  id: number;
  type: CommentType;
  itemId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
};

export default function CommentsSection({ type, itemId, user }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line
  }, [itemId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://192.168.137.1:3001/api/comments?type=${type}&id=${itemId}`);
      const data = await response.json();
      setComments(data.comments || []);
    } catch (e) {
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!text.trim()) return;
    setPosting(true);
    try {
      await fetch('http://192.168.137.1:3001/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          itemId,
          userId: user.id,
          userName: user.name,
          text,
        }),
      });
      setText('');
      await fetchComments();
    } finally {
      setPosting(false);
    }
  };

  const isModerator = (commentUserId: string) => {
    return (
      user.role === 'admin' ||
      (moderatorIds && moderatorIds.includes(user.id))
    );
  };

  const handleEdit = async (id: number) => {
    if (!editText.trim()) return;
    setPosting(true);
    try {
      await fetch(`http://192.168.137.1:3001/api/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: editText, userId: user.id }),
      });
      setEditingId(null);
      setEditText('');
      await fetchComments();
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setPosting(true);
    try {
      await fetch(`http://192.168.137.1:3001/api/comments/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, isModerator: isModerator(user.id) }),
      });
      await fetchComments();
    } finally {
      setPosting(false);
    }
  };

  const handleReply = async (parentId: number) => {
    if (!replyText.trim()) return;
    setPosting(true);
    try {
      await fetch(`http://192.168.137.1:3001/api/comments/${parentId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          itemId,
          userId: user.id,
          userName: user.name,
          text: replyText,
        }),
      });
      setReplyTo(null);
      setReplyText('');
      await fetchComments();
    } finally {
      setPosting(false);
    }
  };

  const renderComment = (c: Comment & { replies?: Comment[] }) => (
    <View key={c.id} style={styles.commentCard}>
      <Text style={styles.commentUser}>{c.userName}</Text>
      {editingId === c.id ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 8 }]}
            value={editText}
            onChangeText={setEditText}
            editable={!posting}
          />
          <TouchableOpacity onPress={() => handleEdit(c.id)} disabled={posting || !editText.trim()} style={styles.postButton}>
            <Text style={styles.postButtonText}>{posting ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setEditingId(null)} style={[styles.postButton, { backgroundColor: Colors.error, marginLeft: 4 }] }>
            <Text style={styles.postButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.commentText}>{c.text}</Text>
      )}
      <Text style={styles.commentDate}>{new Date(c.createdAt).toLocaleString()}</Text>
      <View style={{ flexDirection: 'row', marginTop: 4 }}>
        {(c.userId === user.id) && (
          <TouchableOpacity onPress={() => { setEditingId(c.id); setEditText(c.text); }} style={{ marginRight: 12 }}>
            <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>Edit</Text>
          </TouchableOpacity>
        )}
        {(c.userId === user.id || isModerator(c.userId)) && (
          <TouchableOpacity onPress={() => handleDelete(c.id)} style={{ marginRight: 12 }}>
            <Text style={{ color: Colors.error, fontWeight: 'bold' }}>Delete</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => setReplyTo(replyTo === c.id ? null : c.id)}>
          <Text style={{ color: Colors.secondary, fontWeight: 'bold' }}>Reply</Text>
        </TouchableOpacity>
      </View>
      {replyTo === c.id && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 8 }]}
            value={replyText}
            onChangeText={setReplyText}
            editable={!posting}
            placeholder="Write a reply..."
          />
          <TouchableOpacity onPress={() => handleReply(c.id)} disabled={posting || !replyText.trim()} style={styles.postButton}>
            <Text style={styles.postButtonText}>{posting ? 'Replying...' : 'Reply'}</Text>
          </TouchableOpacity>
        </View>
      )}
      {c.replies && c.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {c.replies.map(reply => (
            <View key={reply.id} style={styles.replyCard}>
              <Text style={styles.commentUser}>{reply.userName}</Text>
              <Text style={styles.commentText}>{reply.text}</Text>
              <Text style={styles.commentDate}>{new Date(reply.createdAt).toLocaleString()}</Text>
              <View style={{ flexDirection: 'row', marginTop: 4 }}>
                {(reply.userId === user.id) && (
                  <TouchableOpacity onPress={() => { setEditingId(reply.id); setEditText(reply.text); }} style={{ marginRight: 12 }}>
                    <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>Edit</Text>
                  </TouchableOpacity>
                )}
                {(reply.userId === user.id || isModerator(reply.userId)) && (
                  <TouchableOpacity onPress={() => handleDelete(reply.id)} style={{ marginRight: 12 }}>
                    <Text style={{ color: Colors.error, fontWeight: 'bold' }}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comments</Text>
      {loading ? (
        <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 16 }} />
      ) : (
        <ScrollView style={styles.commentsList} contentContainerStyle={{ paddingBottom: 8 }}>
          {comments.length === 0 ? (
            <Text style={styles.empty}>No comments yet. Be the first to comment!</Text>
          ) : (
            comments.map(renderComment)
          )}
        </ScrollView>
      )}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          value={text}
          onChangeText={setText}
          editable={!posting}
        />
        <TouchableOpacity style={styles.postButton} onPress={handlePost} disabled={posting || !text.trim()}>
          <Text style={styles.postButtonText}>{posting ? 'Posting...' : 'Post'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  commentsList: {
    maxHeight: 200,
    marginBottom: 8,
  },
  empty: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginVertical: 16,
  },
  commentCard: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  commentUser: {
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 2,
  },
  commentText: {
    fontSize: 15,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  commentDate: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    backgroundColor: Colors.background,
    marginRight: 8,
  },
  postButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  postButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  repliesContainer: {
    marginLeft: 24,
    marginTop: 8,
    borderLeftWidth: 2,
    borderLeftColor: Colors.border,
    paddingLeft: 12,
  },
  replyCard: {
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
}); 