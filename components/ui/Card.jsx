import { Pressable, StyleSheet, View } from 'react-native';
import { Colors, Radius, Shadow } from '../../constants/theme';
export default function Card({ children, style, onPress, elevated }) { const C = onPress ? Pressable : View; return <C onPress={onPress} style={({ pressed }) => [s.card, elevated && Shadow.md, style, onPress && { opacity: pressed ? 0.95 : 1 }]}>{children}</C>; }
const s = StyleSheet.create({ card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 14 } });
