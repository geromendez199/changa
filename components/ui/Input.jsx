import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';
export default function Input({ label, error, maxLength, value = '', leftIcon, rightIcon, ...props }) {
  const [focus, setFocus] = useState(false);
  return <View style={s.wrap}><Text style={s.label}>{label}</Text><View style={[s.box, focus && s.focus, error && s.error]}>{leftIcon && <Text>{leftIcon}</Text>}<TextInput value={value} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} style={s.input} placeholderTextColor={Colors.textMuted} {...props} />{rightIcon && <Text>{rightIcon}</Text>}</View>{maxLength ? <Text style={s.counter}>{value.length}/{maxLength}</Text> : null}{error ? <Text style={s.errTxt}>{error}</Text> : null}</View>;
}
const s = StyleSheet.create({ wrap: { marginBottom: Spacing.md }, label: { color: Colors.textSecondary, marginBottom: Spacing.xs }, box: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, backgroundColor: Colors.surface, paddingHorizontal: 12 }, input: { flex: 1, minHeight: 44, color: Colors.textPrimary }, focus: { borderColor: Colors.primary }, error: { borderColor: Colors.error }, errTxt: { color: Colors.error, marginTop: 4 }, counter: { color: Colors.textMuted, textAlign: 'right', marginTop: 2, fontSize: 11 } });
