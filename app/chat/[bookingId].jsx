import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMessages } from '../../hooks/useMessages';
import { useAuth } from '../../hooks/useAuth';
import ChatBubble from '../../components/features/ChatBubble';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
export default function ChatScreen() { const { bookingId } = useLocalSearchParams(); const { user } = useAuth(); const { messages, sendMessage } = useMessages(bookingId, user?.id); const [text, setText] = useState('');
  return <SafeAreaView style={{ flex: 1 }}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }} keyboardVerticalOffset={80}><FlatList data={[...messages].reverse()} inverted keyExtractor={(i) => i.id} contentContainerStyle={{ padding: 12 }} renderItem={({ item, index }) => <ChatBubble message={item} isOwn={item.sender_id === user.id} showAvatar={messages[index+1]?.sender_id !== item.sender_id} />} ListEmptyComponent={<EmptyState icon='💬' title='Todavía no hay mensajes. ¡Rompé el hielo! 👋' />} /><View style={{ padding: 10, borderTopWidth: 1, borderColor: '#E8E4FF', flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}><TextInput multiline value={text} onChangeText={setText} placeholder='Escribí un mensaje...' style={{ flex: 1, backgroundColor: '#fff', borderRadius: 12, maxHeight: 110, padding: 10 }} />{!!text.trim() && <Button title='↑' onPress={async () => { await sendMessage(text.trim()); setText(''); }} />}</View></KeyboardAvoidingView></SafeAreaView>; }
