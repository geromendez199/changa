import { Pressable, Text, View } from 'react-native';
import { Colors } from '../../constants/theme';
export default function Rating({ value = 0, interactive, onChange, size = 'md' }) {
  const fs = size === 'lg' ? 28 : size === 'sm' ? 14 : 18;
  return <View style={{ flexDirection: 'row', gap: 2 }}>{[1,2,3,4,5].map((n) => <Pressable key={n} onPress={() => interactive && onChange?.(n)}><Text style={{ fontSize: fs, color: n <= value ? Colors.primary : '#D9D3F5' }}>★</Text></Pressable>)}</View>;
}
