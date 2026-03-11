import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, ActivityIndicator, Platform,
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

  const f = (key) => (val) => setForm(p => ({ ...p, [key]: val }));

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

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.header}>
          <Text style={s.logo}>changa.</Text>
          <TouchableOpacity onPress={logout}><Text style={s.logoutText}>Salir →</Text></TouchableOpacity>
        </View>

        <View style={s.webCenter}>
          {/* Avatar */}
          <View style={s.avatarWrap}>
            <Avatar name={profile?.full_name} size={80} color={C.accent} />
            <Text style={s.name}>{profile?.full_name || 'Sin nombre'}</Text>
            <Text style={s.email}>{user?.email}</Text>
          </View>

          {editing ? (
            <View style={s.card}>
              <Text style={s.cardTitle}>EDITAR PERFIL</Text>
              <Field label="Nombre completo" value={form.full_name} onChangeText={f('full_name')} placeholder="María García"     autoCapitalize="words" />
              <Field label="Teléfono / WhatsApp" value={form.phone} onChangeText={f('phone')} placeholder="+54 9 3492 000000" keyboard="phone-pad" />
              <Field label="Bio" value={form.bio} onChangeText={f('bio')} placeholder="Contá algo sobre vos..." multiline autoCapitalize="sentences" />
              <Field label="Zona" value={form.zone} onChangeText={f('zone')} placeholder="Rafaela centro" autoCapitalize="sentences" />
              <Btn label="Guardar cambios" onPress={save} loading={loading} />
              <Btn label="Cancelar" onPress={() => setEditing(false)} ghost />
            </View>
          ) : (
            <View style={s.card}>
              <Text style={s.cardTitle}>MI INFORMACIÓN</Text>
              {[
                { icon: '👤', label: 'Nombre',   val: profile?.full_name },
                { icon: '📱', label: 'Teléfono', val: profile?.phone },
                { icon: '📝', label: 'Bio',      val: profile?.bio },
                { icon: '📍', label: 'Zona',     val: profile?.zone },
              ].map(row => (
                <View key={row.label} style={s.infoRow}>
                  <Text style={s.infoIcon}>{row.icon}</Text>
                  <View>
                    <Text style={s.infoLabel}>{row.label.toUpperCase()}</Text>
                    <Text style={row.val ? s.infoVal : s.infoEmpty}>{row.val || 'Sin completar'}</Text>
                  </View>
                </View>
              ))}
              <Btn label="✏️ Editar perfil" onPress={() => setEditing(true)} />
            </View>
          )}

          <View style={s.accountCard}>
            <Text style={s.accountLabel}>CUENTA</Text>
            <Text style={s.accountEmail}>{user?.email}</Text>
            <Text style={s.accountId}>ID: {user?.id?.slice(0, 12)}...</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  webCenter: {
    ...(isWeb && { maxWidth: 640, width: '100%', alignSelf: 'center', paddingHorizontal: 0 }),
  },
  header: { paddingHorizontal: 20, paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: 20, fontWeight: '700', color: C.accent, letterSpacing: -0.5 },
  logoutText: { color: C.red, fontSize: 14, fontWeight: '600' },
  body: { padding: 20 },
  avatarWrap: { alignItems: 'center', marginBottom: 28, gap: 8 },
  name: { fontSize: 22, fontWeight: '700', color: C.text, letterSpacing: -0.5 },
  email: { fontSize: 13, color: C.muted },
  card: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 20, padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 10, color: C.muted, letterSpacing: 3, marginBottom: 20 },
  infoRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 16 },
  infoIcon: { fontSize: 18, marginTop: 2 },
  infoLabel: { fontSize: 9, color: C.dim, letterSpacing: 1, marginBottom: 2 },
  infoVal: { fontSize: 14, color: C.text },
  infoEmpty: { fontSize: 14, color: C.dim },
  accountCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 16 },
  accountLabel: { fontSize: 10, color: C.dim, letterSpacing: 2, marginBottom: 8 },
  accountEmail: { fontSize: 14, color: C.text, fontWeight: '600' },
  accountId: { fontSize: 11, color: C.dim, marginTop: 4 },
});
