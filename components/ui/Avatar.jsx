import { Image, StyleSheet, Text, View } from 'react-native';
import { getInitials, nameToColor } from '../../lib/utils';
const sizes = { sm: 32, md: 48, lg: 72, xl: 96 };
export default function Avatar({ uri, name, size = 'md', online }) {
  const dim = sizes[size] || 48;
  return <View style={{ width: dim, height: dim }}><View style={[s.base, { width: dim, height: dim, borderRadius: dim / 2, backgroundColor: uri ? '#fff' : nameToColor(name) }]}>{uri ? <Image source={{ uri }} style={{ width: dim, height: dim, borderRadius: dim / 2 }} /> : <Text style={s.txt}>{getInitials(name)}</Text>}</View>{online ? <View style={s.dot} /> : null}</View>;
}
const s = StyleSheet.create({ base: { alignItems: 'center', justifyContent: 'center' }, txt: { color: '#fff', fontWeight: '700' }, dot: { position: 'absolute', right: 1, bottom: 1, width: 10, height: 10, borderRadius: 5, backgroundColor: '#00C48C', borderColor: '#fff', borderWidth: 1 } });
