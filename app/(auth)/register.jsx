import { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  KeyboardAvoidingView, ScrollView, Platform, Alert, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { Btn, Field } from '../../components/UI';
import { C } from '../../constants';

export default function Register() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) return Alert.alert('Error', 'Completá todos los campos.');
    if (password.length < 6) return Alert.alert('Error', 'La contraseña necesita al menos 6 caracteres.');
    setLoading(true);
    const { error } = await signUp(email.trim(), password, name.trim());
    setLoading(false);
    if (error) return Alert.alert('Error', error.message);
    Alert.alert('Cuenta creada', 'Revisá tu email para confirmar la cuenta y luego ingresá.', [
      { text: 'Ir al login', onPress: () => router.replace('/login') },
    ]);
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Background glow blobs */}
          <View style={s.blob1} pointerEvents="none" />
          <View style={s.blob2} pointerEvents="none" />

          <View style={s.center}>

            <TouchableOpacity onPress={() => router.back()} style={s.back}>
              <Text style={s.backText}>← Volver</Text>
            </TouchableOpacity>

            <View style={s.hero}>
              <Text style={s.logo}>changa.</Text>
              <Text style={s.logoSub}>CREAR CUENTA GRATIS</Text>
            </View>

            <View style={s.card}>
              <View style={s.cardAccentBar} />
              <Text style={s.title}>Registrate</Text>
              <Text style={s.sub}>Gratis · 30 segundos · Publicá o contratá sin fricción</Text>

              <Field label="Nombre completo" value={name}     onChangeText={setName}     placeholder="María García"       autoCapitalize="words" />
              <Field label="Email"           value={email}    onChangeText={setEmail}    placeholder="tu@email.com"       keyboard="email-address" />
              <Field label="Contraseña"      value={password} onChangeText={setPassword} placeholder="mínimo 6 caracteres" secure />

              <Btn label="Crear cuenta →" onPress={handleRegister} loading={loading} />
            </View>

            <Text style={s.footer}>Hecho en Rafaela · Experiencia rápida, simple y segura</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const isWeb = Platform.OS === 'web';

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    ...(isWeb && { minHeight: '100vh' }),
  },
  blob1: {
    position: 'absolute', top: -100, left: -80,
    width: 320, height: 320, borderRadius: 160,
    backgroundColor: C.accent + '0A',
    ...(isWeb && { filter: 'blur(80px)' }),
  },
  blob2: {
    position: 'absolute', bottom: -80, right: -100,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: C.blue + '12',
    ...(isWeb && { filter: 'blur(80px)' }),
  },
  center: {
    ...(isWeb && { maxWidth: 420, width: '100%', alignSelf: 'center' }),
  },
  back: { marginBottom: 20 },
  backText: { color: C.muted, fontSize: 14, fontWeight: '600' },
  hero: { alignItems: 'center', marginBottom: 32 },
  logo: {
    fontSize: 48, fontWeight: '800', color: C.accent, letterSpacing: -3,
    ...(isWeb && { fontFamily: 'system-ui, -apple-system, sans-serif' }),
  },
  logoSub: { fontSize: 11, color: C.muted, letterSpacing: 4, marginTop: 2 },
  card: {
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: C.borderSoft,
    overflow: 'hidden',
    ...(isWeb && {
      boxShadow: '0 25px 60px rgba(3,9,23,0.55), 0 0 0 1px rgba(124,155,255,0.2)',
    }),
  },
  cardAccentBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 2, backgroundColor: C.accent, opacity: 0.8,
  },
  title: { fontSize: 26, fontWeight: '800', color: C.text, marginBottom: 6, letterSpacing: -0.5 },
  sub: { fontSize: 14, color: C.muted, marginBottom: 28 },
  footer: { textAlign: 'center', color: C.dim, fontSize: 12, marginTop: 24, lineHeight: 18 },
});
