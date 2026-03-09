import { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  KeyboardAvoidingView, ScrollView, Platform, Alert, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { Btn, Field } from '../../components/UI';
import { C } from '../../constants';

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
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          <View style={s.hero}>
            <Text style={s.logo}>changa.</Text>
            <Text style={s.logoSub}>RAFAELA · SANTA FE</Text>
          </View>

          <View style={s.card}>
            <Text style={s.title}>Bienvenido 👋</Text>
            <Text style={s.sub}>Ingresá para continuar</Text>

            <Field label="Email"      value={email}    onChangeText={setEmail}    placeholder="tu@email.com"  keyboard="email-address" />
            <Field label="Contraseña" value={password} onChangeText={setPassword} placeholder="••••••••" secure />

            <Btn label="Ingresar →" onPress={handleLogin} loading={loading} />

            <View style={s.divider}>
              <View style={s.line} /><Text style={s.or}>o</Text><View style={s.line} />
            </View>

            <Btn label="Crear cuenta nueva" onPress={() => router.push('/(auth)/register')} ghost />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  hero: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 48, fontWeight: '700', color: C.accent, letterSpacing: -2 },
  logoSub: { fontSize: 11, color: C.muted, letterSpacing: 4, marginTop: -6 },
  card: { backgroundColor: C.card, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: C.border },
  title: { fontSize: 24, fontWeight: '700', color: C.text, marginBottom: 4 },
  sub: { fontSize: 13, color: C.muted, marginBottom: 24 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 16 },
  line: { flex: 1, height: 1, backgroundColor: C.border },
  or: { color: C.muted, fontSize: 12 },
});
