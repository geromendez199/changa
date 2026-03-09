import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { C } from '../constants';

export function Btn({ label, onPress, loading, ghost, danger, style }) {
  return (
    <TouchableOpacity
      style={[
        st.btn,
        ghost  && st.btnGhost,
        danger && st.btnDanger,
        !ghost && !danger && st.btnAccent,
        (loading) && { opacity: 0.6 },
        style,
      ]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading
        ? <ActivityIndicator color={ghost || danger ? C.muted : '#000'} />
        : <Text style={[st.btnText, ghost && st.btnTextGhost, danger && st.btnTextDanger]}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

export function Field({ label, value, onChangeText, placeholder, secure, keyboard, multiline, autoCapitalize }) {
  return (
    <View style={st.fieldWrap}>
      {label && <Text style={st.fieldLabel}>{label.toUpperCase()}</Text>}
      <TextInput
        style={[st.input, multiline && { height: 80, textAlignVertical: 'top' }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.dim}
        secureTextEntry={secure}
        keyboardType={keyboard || 'default'}
        autoCapitalize={autoCapitalize || 'none'}
        multiline={multiline}
      />
    </View>
  );
}

export function Avatar({ name, size = 46, color = C.accent }) {
  const initials = name
    ?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  return (
    <View style={[st.avatar, { width: size, height: size, borderRadius: size * 0.26, backgroundColor: color + '22', borderColor: color + '55' }]}>
      <Text style={[st.avatarText, { color, fontSize: size * 0.32 }]}>{initials}</Text>
    </View>
  );
}

export function Badge({ label, color }) {
  return (
    <View style={[st.badge, { backgroundColor: color + '22', borderColor: color + '44' }]}>
      <Text style={[st.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function SectionTitle({ children }) {
  return <Text style={st.sectionTitle}>{children}</Text>;
}

export function EmptyState({ emoji, title, sub }) {
  return (
    <View style={st.empty}>
      <Text style={{ fontSize: 40 }}>{emoji}</Text>
      <Text style={st.emptyTitle}>{title}</Text>
      {sub && <Text style={st.emptySub}>{sub}</Text>}
    </View>
  );
}

const st = StyleSheet.create({
  btn: { borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginVertical: 4 },
  btnAccent: { backgroundColor: C.accent },
  btnGhost:  { borderWidth: 1, borderColor: C.border },
  btnDanger: { backgroundColor: '#FF4D4D22', borderWidth: 1, borderColor: '#FF4D4D55' },
  btnText:      { color: '#000', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
  btnTextGhost: { color: C.muted, fontSize: 14 },
  btnTextDanger:{ color: C.red,  fontSize: 14, fontWeight: '700' },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: { fontSize: 10, color: C.muted, letterSpacing: 2, marginBottom: 6, fontWeight: '700' },
  input: {
    backgroundColor: C.bg, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    color: C.text, fontSize: 14,
  },
  avatar: { borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '700' },
  badge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  sectionTitle: { fontSize: 10, letterSpacing: 3, color: C.muted, textTransform: 'uppercase', marginBottom: 14, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 52, gap: 8 },
  emptyTitle: { fontSize: 15, color: C.muted, fontWeight: '600' },
  emptySub: { fontSize: 13, color: C.dim, textAlign: 'center' },
});
