import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';
const variants = {
  primary: { bg: Colors.primary, text: Colors.textInverse, border: Colors.primary },
  secondary: { bg: Colors.primaryLight, text: Colors.textInverse, border: Colors.primaryLight },
  outline: { bg: 'transparent', text: Colors.primary, border: Colors.primary },
  ghost: { bg: 'transparent', text: Colors.textPrimary, border: 'transparent' },
  danger: { bg: Colors.error, text: Colors.textInverse, border: Colors.error },
};
const sizes = { sm: { py: 10, px: 12 }, md: { py: 12, px: 16 }, lg: { py: 15, px: 18 } };
export default function Button({ title, onPress, variant = 'primary', size = 'md', loading, disabled, icon }) {
  const v = variants[variant]; const sz = sizes[size];
  return <Pressable onPress={onPress} disabled={disabled || loading} style={({ pressed }) => [s.base, { backgroundColor: v.bg, borderColor: v.border, paddingVertical: sz.py, paddingHorizontal: sz.px, opacity: disabled ? 0.5 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}>{loading ? <ActivityIndicator color={v.text} /> : <Text style={[s.text, { color: v.text }]}>{icon ? `${icon} ` : ''}{title}</Text>}</Pressable>;
}
const s = StyleSheet.create({ base: { borderWidth: 1, borderRadius: Radius.md, alignItems: 'center' }, text: { ...Typography.button } });
