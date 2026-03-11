import {
  View, Text, TouchableOpacity, TextInput,
  ActivityIndicator, StyleSheet, Platform,
} from 'react-native';
import { C } from '../constants';

const isWeb = Platform.OS === 'web';

// ─── Button ───────────────────────────────────────────────────────────────────
export function Btn({ label, onPress, loading, ghost, danger, small, style }) {
  const variant = ghost ? 'ghost' : danger ? 'danger' : 'accent';
  return (
    <TouchableOpacity
      style={[
        st.btn,
        variant === 'accent' && st.btnAccent,
        variant === 'ghost'  && st.btnGhost,
        variant === 'danger' && st.btnDanger,
        small   && st.btnSmall,
        loading && st.btnDisabled,
        isWeb   && { outlineStyle: 'none' },
        style,
      ]}
      onPress={onPress}
      disabled={!!loading}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={typeof label === 'string' ? label : undefined}
      accessibilityState={{ disabled: !!loading, busy: !!loading }}
      tabIndex={0}
    >
      {loading
        ? <ActivityIndicator color={variant === 'accent' ? '#000' : C.muted} size="small" />
        : <Text style={[
            st.btnText,
            variant === 'ghost'  && st.btnTextGhost,
            variant === 'danger' && st.btnTextDanger,
            small && st.btnTextSmall,
          ]}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
export function Field({
  label, value, onChangeText, placeholder, secure,
  keyboard, multiline, autoCapitalize, hint, error,
}) {
  return (
    <View style={st.fieldWrap}>
      {label && (
        <Text style={st.fieldLabel} accessibilityRole="text">
          {label.toUpperCase()}
        </Text>
      )}
      <TextInput
        style={[
          st.input,
          multiline && st.inputMulti,
          error      && st.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.muted}
        secureTextEntry={secure}
        keyboardType={keyboard || 'default'}
        autoCapitalize={autoCapitalize || 'none'}
        multiline={multiline}
        accessibilityLabel={label}
        accessibilityHint={placeholder}
        accessibilityState={{ selected: false }}
      />
      {error  && <Text style={st.fieldError}>{error}</Text>}
      {!error && hint && <Text style={st.fieldHint}>{hint}</Text>}
    </View>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ name, size = 46, color = C.accent }) {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  return (
    <View
      style={[st.avatar, {
        width: size, height: size,
        borderRadius: size * 0.28,
        backgroundColor: color + '18',
        borderColor: color + '40',
      }]}
      accessibilityRole="image"
      accessibilityLabel={`Avatar de ${name || 'usuario'}`}
    >
      <Text style={[st.avatarText, { color, fontSize: size * 0.34 }]}>{initials}</Text>
    </View>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ label, color }) {
  return (
    <View style={[st.badge, { backgroundColor: color + '18', borderColor: color + '35' }]}>
      <Text style={[st.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

// ─── Section Title ────────────────────────────────────────────────────────────
export function SectionTitle({ children }) {
  return <Text style={st.sectionTitle} accessibilityRole="header">{children}</Text>;
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ emoji, title, sub }) {
  return (
    <View style={st.empty} accessibilityRole="text">
      <View style={st.emptyIcon}>
        <Text style={{ fontSize: 36 }}>{emoji}</Text>
      </View>
      <Text style={st.emptyTitle}>{title}</Text>
      {sub && <Text style={st.emptySub}>{sub}</Text>}
    </View>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, color = C.accent }) {
  return (
    <View
      style={[st.statCard, { borderColor: color + '30' }]}
      accessibilityRole="text"
      accessibilityLabel={`${label}: ${value}`}
    >
      <Text style={[st.statValue, { color }]}>{value}</Text>
      <Text style={st.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ label }) {
  return (
    <View style={st.divider} accessibilityRole="separator">
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
    borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', justifyContent: 'center',
    marginVertical: 4,
    ...(isWeb && { cursor: 'pointer', userSelect: 'none' }),
  },
  btnAccent:   { backgroundColor: C.accent },
  btnGhost:    { borderWidth: 1, borderColor: C.border, backgroundColor: C.card },
  btnDanger:   { backgroundColor: '#FF4D4D15', borderWidth: 1, borderColor: '#FF4D4D40' },
  btnSmall:    { paddingVertical: 9, borderRadius: 10 },
  btnDisabled: { opacity: 0.55 },

  btnText:      { color: '#000', fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
  btnTextGhost: { color: C.textSec, fontSize: 14, fontWeight: '600' },
  btnTextDanger:{ color: C.red,     fontSize: 14, fontWeight: '700' },
  btnTextSmall: { fontSize: 13 },

  // Field
  fieldWrap:  { marginBottom: 16 },
  fieldLabel: { fontSize: 11, color: C.muted, letterSpacing: 1.5, marginBottom: 7, fontWeight: '700' },
  fieldHint:  { fontSize: 11, color: C.muted, marginTop: 5 },
  fieldError: { fontSize: 11, color: C.red,   marginTop: 5, fontWeight: '600' },

  input: {
    backgroundColor: C.dim + 'AA', borderWidth: 1.5, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    color: C.text, fontSize: 15,
    ...(isWeb && { outlineStyle: 'none', outlineWidth: 0 }),
  },
  inputMulti:  { height: 88, textAlignVertical: 'top', paddingTop: 14 },
  inputError:  { borderColor: C.red },

  // Avatar
  avatar:     { borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '800', letterSpacing: -0.5 },

  // Badge
  badge:     { borderWidth: 1, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },

  // Section title
  sectionTitle: {
    fontSize: 10, letterSpacing: 2.5, color: C.muted,
    textTransform: 'uppercase', marginBottom: 14, fontWeight: '800',
  },

  // Empty state
  empty:     { alignItems: 'center', paddingVertical: 64, gap: 12 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: C.dim + '80', borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  emptyTitle: { fontSize: 16, color: C.textSec, fontWeight: '700' },
  emptySub:   { fontSize: 13, color: C.muted, textAlign: 'center', maxWidth: 240, lineHeight: 20 },

  // Stat Card
  statCard: {
    flex: 1, backgroundColor: C.card,
    borderWidth: 1, borderRadius: 16, padding: 16,
    gap: 4, alignItems: 'flex-start',
  },
  statValue: { fontSize: 28, fontWeight: '800', letterSpacing: -1 },
  statLabel: { fontSize: 11, color: C.muted, fontWeight: '600', letterSpacing: 0.5 },

  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 16 },
  divLine: { flex: 1, height: 1, backgroundColor: C.border },
  divLabel: { fontSize: 12, color: C.muted, letterSpacing: 0.5 },
});
