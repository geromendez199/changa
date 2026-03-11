import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, Platform,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Btn, Field, Avatar } from '../components/UI';
import { C } from '../constants';

const isWeb = Platform.OS === 'web';

export default function PerfilScreen() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone:     profile?.phone     || '',
    bio:       profile?.bio       || '',
    zone:      profile?.zone      || '',
  });

  const f = key => val => setForm(p => ({ ...p, [key]: val }));

  const save = async () => {
    setLoading(true);
    const { error } = await updateProfile(form);
    setLoading(false);
    if (error) Alert.alert('Error', error.message);
    else setEditing(false);
  };

  const logout = () => Alert.alert('Cerrar sesión', '¿Estás seguro?', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Salir', style: 'destructive', onPress: signOut },
  ]);

  const INFO_ROWS = [
    { icon: '👤', label: 'Nombre',    val: profile?.full_name },
    { icon: '📱', label: 'Teléfono',  val: profile?.phone },
    { icon: '📝', label: 'Biografía', val: profile?.bio },
    { icon: '📍', label: 'Zona',      val: profile?.zone },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.page}>

          {/* Top bar (mobile only) */}
          {!isWeb && (
            <View style={s.topBar}>
              <Text style={s.logo}>changa.</Text>
              <TouchableOpacity onPress={logout}>
                <Text style={s.logoutText}>Salir →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Profile header */}
          <View style={s.profileHero}>
            <View style={s.avatarBg}>
              <Avatar name={profile?.full_name || user?.email} size={88} color={C.accent} />
            </View>
            <Text style={s.profileName}>{profile?.full_name || 'Sin nombre'}</Text>
            <View style={s.emailPill}>
              <Text style={s.emailText}>{user?.email}</Text>
            </View>
            {isWeb && (
              <TouchableOpacity onPress={logout} style={s.webLogoutBtn}>
                <Text style={s.webLogoutText}>Cerrar sesión</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Info / Edit card */}
          <View style={s.card}>
            {editing ? (
              <>
                <Text style={s.cardTitle}>EDITAR PERFIL</Text>
                <Field label="Nombre completo"     value={form.full_name} onChangeText={f('full_name')} placeholder="María García"       autoCapitalize="words" />
                <Field label="Teléfono / WhatsApp" value={form.phone}     onChangeText={f('phone')}     placeholder="+54 9 3492 000000"   keyboard="phone-pad" />
                <Field label="Biografía"           value={form.bio}       onChangeText={f('bio')}       placeholder="Contá algo sobre vos..." multiline autoCapitalize="sentences" />
                <Field label="Zona"                value={form.zone}      onChangeText={f('zone')}      placeholder="Rafaela centro"      autoCapitalize="sentences" />
                <Btn label="Guardar cambios ✓" onPress={save} loading={loading} />
                <Btn label="Cancelar" onPress={() => setEditing(false)} ghost />
              </>
            ) : (
              <>
                <View style={s.cardTitleRow}>
                  <Text style={s.cardTitle}>MI INFORMACIÓN</Text>
                  <TouchableOpacity onPress={() => setEditing(true)} style={s.editChip}>
                    <Text style={s.editChipText}>✏️ Editar</Text>
                  </TouchableOpacity>
                </View>

                {INFO_ROWS.map(row => (
                  <View key={row.label} style={s.infoRow}>
                    <View style={s.infoIconWrap}>
                      <Text style={{ fontSize: 16 }}>{row.icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.infoLabel}>{row.label.toUpperCase()}</Text>
                      <Text style={row.val ? s.infoVal : s.infoEmpty}>
                        {row.val || '—  Sin completar'}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>

          {/* Account card */}
          <View style={s.accountCard}>
            <Text style={s.accountTitle}>CUENTA</Text>
            <View style={s.accountRow}>
              <Text style={s.accountKey}>Email</Text>
              <Text style={s.accountVal}>{user?.email}</Text>
            </View>
            <View style={s.accountRow}>
              <Text style={s.accountKey}>ID</Text>
              <Text style={s.accountVal}>{user?.id?.slice(0, 16)}...</Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  page:   { paddingBottom: 40 },

  // Top bar (mobile)
  topBar: {
    paddingHorizontal: 20, paddingTop: 16, marginBottom: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  logo:       { fontSize: 22, fontWeight: '800', color: C.accent, letterSpacing: -1 },
  logoutText: { color: C.red, fontSize: 14, fontWeight: '700' },

  // Profile hero
  profileHero: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    gap: 10,
  },
  avatarBg: {
    padding: 4,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: C.accentBorder,
    backgroundColor: C.accentDim,
    marginBottom: 4,
  },
  profileName: { fontSize: 24, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
  emailPill:   {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7,
  },
  emailText:   { fontSize: 13, color: C.muted, fontWeight: '500' },

  webLogoutBtn:  { marginTop: 8, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: C.red + '18', borderWidth: 1, borderColor: C.red + '35' },
  webLogoutText: { fontSize: 13, color: C.red, fontWeight: '700' },

  // Info card
  card: {
    backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 22, padding: 22, marginHorizontal: 20, marginBottom: 16,
  },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitle:    { fontSize: 10, color: C.muted, letterSpacing: 2.5, fontWeight: '800' },
  editChip: {
    backgroundColor: C.dim, borderRadius: 10,
    paddingVertical: 7, paddingHorizontal: 12,
  },
  editChipText: { fontSize: 12, color: C.textSec, fontWeight: '700' },

  infoRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 18 },
  infoIconWrap:{ width: 36, height: 36, borderRadius: 10, backgroundColor: C.dim, alignItems: 'center', justifyContent: 'center' },
  infoLabel:   { fontSize: 9, color: C.muted, letterSpacing: 1.5, marginBottom: 3, fontWeight: '700' },
  infoVal:     { fontSize: 15, color: C.text, fontWeight: '500' },
  infoEmpty:   { fontSize: 14, color: C.dim + 'CC', fontStyle: 'italic' },

  // Account card
  accountCard: {
    backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 22, padding: 22, marginHorizontal: 20,
  },
  accountTitle: { fontSize: 10, color: C.muted, letterSpacing: 2.5, fontWeight: '800', marginBottom: 16 },
  accountRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  accountKey:   { fontSize: 13, color: C.muted, fontWeight: '600' },
  accountVal:   { fontSize: 13, color: C.textSec, fontWeight: '500', maxWidth: '70%', textAlign: 'right' },
});
