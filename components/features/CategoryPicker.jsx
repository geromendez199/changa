import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { CATEGORIES } from '../../constants/categories';
import { Colors } from '../../constants/theme';
export default function CategoryPicker({ selected, onSelect, showAll }) {
  const items = showAll ? [{ id: '', label: 'Todos', emoji: '🧭' }, ...CATEGORIES] : CATEGORIES;
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>{items.map((c) => { const act = selected === c.id; return <TouchableOpacity key={c.id || 'all'} onPress={() => onSelect(c.id)} style={[s.pill, act && s.act]}><Text style={[s.t, act && { color: '#fff' }]}>{c.emoji} {c.label}</Text></TouchableOpacity>; })}</ScrollView>;
}
const s = StyleSheet.create({ row: { gap: 8, paddingVertical: 8 }, pill: { borderWidth: 1, borderColor: Colors.primary, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff' }, act: { backgroundColor: Colors.primary }, t: { color: Colors.primary, fontWeight: '600' } });
