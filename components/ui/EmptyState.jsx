import { StyleSheet, Text, View } from 'react-native';
import Button from './Button';
export default function EmptyState({ icon = '📭', title, subtitle, actionLabel, onAction }) { return <View style={s.wrap}><Text style={s.icon}>{icon}</Text><Text style={s.t}>{title}</Text><Text style={s.s}>{subtitle}</Text>{actionLabel ? <Button title={actionLabel} onPress={onAction} /> : null}</View>; }
const s = StyleSheet.create({ wrap: { alignItems: 'center', padding: 24 }, icon: { fontSize: 60 }, t: { fontWeight: '700', fontSize: 18, marginTop: 8 }, s: { color: '#6B6585', textAlign: 'center', marginVertical: 10 } });
