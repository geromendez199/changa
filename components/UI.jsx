import {
  View, Text, TouchableOpacity, TextInput,
  ActivityIndicator, StyleSheet, Platform,
} from 'react-native';
import { C } from '../constants';

const isWeb = Platform.OS === 'web';

export function Btn({ label, onPress, loading, ghost, danger, small, style }) {
  const variant = ghost ? 'ghost' : danger ? 'danger' : 'accent';
  return (
    <TouchableOpacity
      style={[
        st.btn,
        variant === 'accent' && st.btnAccent,
        variant === 'ghost' && st.btnGhost,
        variant === 'danger' && st.btnDanger,
        small && st.btnSmall,
        loading && st.btnDisabled,
        isWeb && { outlineStyle: 'none' },
        style,
      ]}
      onPress={onPress}
      disabled={!!loading}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={typeof label === 'string' ? label : undefined}
      accessibilityState={{ disabled: !!loading, busy: !!loading }}
      tabIndex={0}
    >
      {loading
        ? <ActivityIndicator color={variant === 'accent' ? '#081024' : C.textSec} size="small" />
        : <Text style={[
            st.btnText,
            variant === 'ghost' && st.btnTextGhost,
            variant === 'danger' && st.btnTextDanger,
            small && st.btnTextSmall,
          ]}>{label}</Text>}
    </TouchableOpacity>
  );
}

export function Field({
  label, value, onChangeText, placeholder, secure,
  keyboard, multiline, autoCapitalize, hint, error,
}) {
  return (
    <View style={st.fieldWrap}>
      {label && <Text style={st.fieldLabel}>{label.toUpperCase()}</Text>}
      <TextInput
        style={[st.input, multiline && st.inputMulti, error && st.inputError]}
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
      />
      {error && <Text style={st.fieldError}>{error}</Text>}
      {!error && hint && <Text style={st.fieldHint}>{hint}</Text>}
    </View>
  );
}

export function Avatar({ name, size = 46, color = C.accent }) {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  return (
    <View
      style={[st.avatar, {
        width: size,
        height: size,
        borderRadius: size * 0.28,
        backgroundColor: `${color}1F`,
        borderColor: `${color}59`,
      }]}
      accessibilityRole="image"
      accessibilityLabel={`Avatar de ${name || 'usuario'}`}
    >
      <Text style={[st.avatarText, { color, fontSize: size * 0.34 }]}>{initials}</Text>
    </View>
  );
}

export function Badge({ label, color }) {
  return (
    <View style={[st.badge, { backgroundColor: `${color}1A`, borderColor: `${color}4D` }]}>
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
      <View style={st.emptyIcon}><Text style={{ fontSize: 34 }}>{emoji}</Text></View>
      <Text style={st.emptyTitle}>{title}</Text>
      {sub && <Text style={st.emptySub}>{sub}</Text>}
    </View>
  );
}

export function StatCard({ label, value, color = C.accent }) {
  return (
    <View style={[st.statCard, { borderColor: `${color}4D` }]}>
      <Text style={[st.statValue, { color }]}>{value}</Text>
      <Text style={st.statLabel}>{label}</Text>
    </View>
  );
}

export function Divider({ label }) {
  return (
    <View style={st.divider} accessibilityRole="separator">
      <View style={st.divLine} />
      {label && <Text style={st.divLabel}>{label}</Text>}
      {label && <View style={st.divLine} />}
    </View>
  );
}

const st = StyleSheet.create({
  btn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    borderWidth: 1,
    borderColor: 'transparent',
    ...(isWeb && { cursor: 'pointer', userSelect: 'none', transitionDuration: '160ms' }),
  },
  btnAccent: {
    backgroundColor: C.accent,
    borderColor: C.accentStrong,
    ...(isWeb && { boxShadow: `0 12px 24px ${C.shadow}` }),
  },
  btnGhost: { borderColor: C.border, backgroundColor: C.bgElevated },
  btnDanger: { backgroundColor: `${C.red}1F`, borderColor: `${C.red}66` },
  btnSmall: { paddingVertical: 9, borderRadius: 10 },
  btnDisabled: { opacity: 0.6 },

  btnText: { color: '#081024', fontSize: 15, fontWeight: '800', letterSpacing: 0.2 },
  btnTextGhost: { color: C.textSec, fontSize: 14, fontWeight: '700' },
  btnTextDanger: { color: C.red, fontSize: 14, fontWeight: '700' },
  btnTextSmall: { fontSize: 13 },

  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 11, color: C.muted, letterSpacing: 1.2, marginBottom: 8, fontWeight: '700' },
  fieldHint: { fontSize: 11, color: C.muted, marginTop: 5 },
  fieldError: { fontSize: 11, color: C.red, marginTop: 5, fontWeight: '600' },
  input: {
    backgroundColor: C.bgElevated,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: C.text,
    fontSize: 15,
    ...(isWeb && { outlineStyle: 'none', outlineWidth: 0 }),
  },
  inputMulti: { height: 88, textAlignVertical: 'top', paddingTop: 14 },
  inputError: { borderColor: C.red },

  avatar: { borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '800', letterSpacing: -0.3 },

  badge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },

  sectionTitle: {
    fontSize: 10,
    letterSpacing: 2,
    color: C.muted,
    textTransform: 'uppercase',
    marginBottom: 14,
    fontWeight: '800',
  },

  empty: { alignItems: 'center', paddingVertical: 64, gap: 12 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: C.bgElevated,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 16, color: C.textSec, fontWeight: '700' },
  emptySub: { fontSize: 13, color: C.muted, textAlign: 'center', maxWidth: 260, lineHeight: 20 },

  statCard: {
    flex: 1,
    backgroundColor: C.card,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 4,
    alignItems: 'flex-start',
  },
  statValue: { fontSize: 28, fontWeight: '800', letterSpacing: -0.8 },
  statLabel: { fontSize: 11, color: C.muted, fontWeight: '600', letterSpacing: 0.5 },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 16 },
  divLine: { flex: 1, height: 1, backgroundColor: C.borderSoft },
  divLabel: { fontSize: 12, color: C.muted, letterSpacing: 0.5 },
});
