import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { C } from '../constants';

const isWeb = Platform.OS === 'web';

// ─── Button ──────────────────────────────────────────────────────────────────
export function Btn({ label, onPress, loading, ghost, danger, small, style }) {
  return (
    <TouchableOpacity
      style={[
        st.btn,
        ghost  && st.btnGhost,
        danger && st.btnDanger,
        !ghost && !danger && st.btnAccent,
        small  && st.btnSmall,
        loading && { opacity: 0.6 },
        style,
      ]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.82}
    >
      {loading
        ? <ActivityIndicator color={ghost || danger ? C.muted : '#000'} size="small" />
        : <Text style={[st.btnText, ghost && st.btnTextGhost, danger && st.btnTextDanger, small && st.btnTextSmall]}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

// ─── Input Field ─────────────────────────────────────────────────────────────
export function Field({ label, value, onChangeText, placeholder, secure, keyboard, multiline, autoCapitalize, hint }) {
  return (
    <View style={st.fieldWrap}>
      {label && <Text style={st.fieldLabel}>{label.toUpperCase()}</Text>}
      <TextInput
        style={[st.input, multiline && { height: 88, textAlignVertical: 'top', paddingTop: 14 }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.muted}
        secureTextEntry={secure}
        keyboardType={keyboard || 'default'}
        autoCapitalize={autoCapitalize || 'none'}
        multiline={multiline}
      />
      {hint && <Text style={st.fieldHint}>{hint}</Text>}
    </View>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
export function Avatar({ name, size = 46, color = C.accent }) {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  return (
    <View style={[st.avatar, { width: size, height: size, borderRadius: size * 0.28, backgroundColor: color + '18', borderColor: color + '40' }]}>
      <Text style={[st.avatarText, { color, fontSize: size * 0.34 }]}>{initials}</Text>
    </View>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────
export function Badge({ label, color }) {
  return (
    <View style={[st.badge, { backgroundColor: color + '18', borderColor: color + '35' }]}>
      <Text style={[st.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

// ─── Section Title ───────────────────────────────────────────────────────────
export function SectionTitle({ children }) {
  return <Text style={st.sectionTitle}>{children}</Text>;
}

// ─── Empty State ─────────────────────────────────────────────────────────────
export function EmptyState({ emoji, title, sub }) {
  return (
    <View style={st.empty}>
      <View style={st.emptyIconWrap}>
        <Text style={{ fontSize: 36 }}>{emoji}</Text>
      </View>
      <Text style={st.emptyTitle}>{title}</Text>
      {sub && <Text style={st.emptySub}>{sub}</Text>}
    </View>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
export function StatCard({ label, value, color = C.accent }) {
  return (
    <View style={[st.statCard, { borderColor: color + '30' }]}>
      <Text style={[st.statValue, { color }]}>{value}</Text>
      <Text style={st.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
export function Divider({ label }) {
  return (
    <View style={st.divider}>
      <View style={st.divLine} />
      {label && <Text style={st.divLabel}>{label}</Text>}
      {label && <View style={st.divLine} />}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  // Button
  btn: {
    borderRadius: 14, paddingVertical: 15, alignItems: 'center', justifyContent: 'center',
    marginVertical: 4,
    ...(isWeb && { cursor: 'pointer', transition: 'opacity 0.15s ease, transform 0.1s ease', userSelect: 'none' }),
  },
  btnAccent:  { backgroundColor: C.accent },
  btnGhost:   { borderWidth: 1, borderColor: C.border, backgroundColor: C.card },
  btnDanger:  { backgroundColor: '#FF4D4D15', borderWidth: 1, borderColor: '#FF4D4D40' },
  btnSmall:   { paddingVertical: 9, borderRadius: 10 },
  btnText:      { color: '#000', fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
  btnTextGhost: { color: C.textSec, fontSize: 14, fontWeight: '600' },
  btnTextDanger:{ color: C.red,     fontSize: 14, fontWeight: '700' },
  btnTextSmall: { fontSize: 13 },

  // Field
  fieldWrap:  { marginBottom: 16 },
  fieldLabel: { fontSize: 11, color: C.muted, letterSpacing: 1.5, marginBottom: 7, fontWeight: '700' },
  fieldHint:  { fontSize: 11, color: C.muted, marginTop: 5 },
  input: {
    backgroundColor: C.dim + 'AA',
    borderWidth: 1.5, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    color: C.text, fontSize: 15,
    ...(isWeb && { outlineStyle: 'none', outlineWidth: 0, transition: 'border-color 0.15s ease' }),
  },

  // Avatar
  avatar: { borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '800', letterSpacing: -0.5 },

  // Badge
  badge:     { borderWidth: 1, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },

  // Section Title
  sectionTitle: {
    fontSize: 10, letterSpacing: 2.5, color: C.muted,
    textTransform: 'uppercase', marginBottom: 14, fontWeight: '800',
  },

  // Empty State
  empty: { alignItems: 'center', paddingVertical: 64, gap: 12 },
  emptyIconWrap: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: C.dim + '80', borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  emptyTitle: { fontSize: 16, color: C.textSec, fontWeight: '700' },
  emptySub:   { fontSize: 13, color: C.muted, textAlign: 'center', maxWidth: 240, lineHeight: 20 },

  // Stat Card
  statCard: {
    flex: 1, backgroundColor: C.card, borderWidth: 1,
    borderRadius: 16, padding: 16, gap: 4, alignItems: 'flex-start',
  },
  statValue: { fontSize: 28, fontWeight: '800', letterSpacing: -1 },
  statLabel: { fontSize: 11, color: C.muted, fontWeight: '600', letterSpacing: 0.5 },

  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 16 },
  divLine:  { flex: 1, height: 1, backgroundColor: C.border },
  divLabel: { fontSize: 12, color: C.muted, letterSpacing: 0.5 },
});
