import { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  KeyboardAvoidingView, ScrollView, Platform, Alert, TouchableOpacity, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { Btn, Field, Divider } from '../../components/UI';
import { C } from '../../constants';

const W = Dimensions.get('window').width;

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Completá email y contraseña.');
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) Alert.alert('No se pudo ingresar', error.message);
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Background glow blobs */}
          <View style={s.blob1} pointerEvents="none" />
          <View style={s.blob2} pointerEvents="none" />

          {/* Center wrapper */}
          <View style={s.center}>

            {/* Logo section */}
            <View style={s.hero}>
              <View style={s.logoPill}>
                <Text style={s.logoEmoji}>⚡</Text>
              </View>
              <Text style={s.logo}>changa.</Text>
              <Text style={s.logoSub}>RAFAELA · SANTA FE</Text>
            </View>

            {/* Card */}
            <View style={s.card}>
              {/* Card glow top border */}
              <View style={s.cardAccentBar} />

              <Text style={s.title}>Bienvenido 👋</Text>
              <Text style={s.sub}>Ingresá para continuar y contratar prestadores en minutos.</Text>

              <Field label="Email"      value={email}    onChangeText={setEmail}    placeholder="tu@email.com"  keyboard="email-address" />
              <Field label="Contraseña" value={password} onChangeText={setPassword} placeholder="••••••••" secure />

              <Btn label="Ingresar →" onPress={handleLogin} loading={loading} />

              <Divider label="o" />

              <Btn label="Crear cuenta nueva" onPress={() => router.push('/(auth)/register')} ghost />
            </View>

            {/* Footer */}
            <Text style={s.footer}>Hecho en Rafaela con ❤️ · Experiencia rápida, simple y segura</Text>
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

  // Background decorative blobs
  blob1: {
    position: 'absolute', top: -80, right: -80,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: C.accent + '0D',
    ...(isWeb && { filter: 'blur(80px)' }),
  },
  blob2: {
    position: 'absolute', bottom: -60, left: -100,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: C.blue + '12',
    ...(isWeb && { filter: 'blur(80px)' }),
  },

  // Centering wrapper for web
  center: {
    ...(isWeb && {
      maxWidth: 420,
      width: '100%',
      alignSelf: 'center',
    }),
  },

  // Logo
  hero: { alignItems: 'center', marginBottom: 36 },
  logoPill: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: C.accent + '15',
    borderWidth: 1, borderColor: C.accent + '40',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  logoEmoji: { fontSize: 28 },
  logo: {
    fontSize: 52, fontWeight: '800', color: C.accent,
    letterSpacing: -3,
    ...(isWeb && { fontFamily: 'system-ui, -apple-system, sans-serif' }),
  },
  logoSub: { fontSize: 11, color: C.muted, letterSpacing: 5, marginTop: 2 },

  // Card
  card: {
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: C.borderSoft,
    overflow: 'hidden',
    ...(isWeb && {
      boxShadow: '0 25px 60px rgba(3,9,23,0.55), 0 0 0 1px rgba(124,155,255,0.2)',
      backdropFilter: 'blur(20px)',
    }),
  },
  cardAccentBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 2,
    backgroundColor: C.accent,
    opacity: 0.8,
  },
  title: { fontSize: 26, fontWeight: '800', color: C.text, marginBottom: 6, letterSpacing: -0.5 },
  sub: { fontSize: 14, color: C.muted, marginBottom: 26, lineHeight: 20 },

  // Footer
  footer: { textAlign: 'center', color: C.dim, fontSize: 12, marginTop: 24, lineHeight: 18 },
});
