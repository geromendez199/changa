import { StyleSheet, Text, View } from 'react-native';
export default function Badge({ label, color = '#eee', textColor = '#111', size = 'md' }) { return <View style={[s.badge, size === 'sm' && s.sm, { backgroundColor: color }]}><Text style={[s.txt, { color: textColor }]}>{label}</Text></View>; }
const s = StyleSheet.create({ badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }, sm: { paddingVertical: 3, paddingHorizontal: 8 }, txt: { fontWeight: '600', fontSize: 12 } });
