import { Text, View } from 'react-native';
import Avatar from '../ui/Avatar';
import { timeAgo } from '../../lib/utils';
import { Colors } from '../../constants/theme';
export default function ChatBubble({ message, isOwn, showAvatar, user }) { return <View style={{ flexDirection: isOwn ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 6, marginBottom: 8 }}>{showAvatar && !isOwn ? <Avatar size='sm' uri={user?.avatar_url} name={user?.full_name} /> : <View style={{ width: 32 }} /> }<View style={{ maxWidth: '78%' }}><View style={{ backgroundColor: isOwn ? Colors.primary : '#fff', padding: 10, borderRadius: 16 }}><Text style={{ color: isOwn ? '#fff' : Colors.textPrimary }}>{message.content}</Text></View><Text style={{ fontSize: 11, color: '#A09BBC', textAlign: isOwn ? 'right' : 'left' }}>{timeAgo(message.created_at)} {isOwn && message.read_at ? '✓✓' : ''}</Text></View></View>; }
