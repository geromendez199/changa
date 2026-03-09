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
    Alert.alert('¡Cuenta creada! 🎉', 'Revisá tu email para confirmar la cuenta y luego ingresá.', [
      { text: 'Ir al login', onPress: () => router.replace('/(auth)/login') },
    ]);
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          <TouchableOpacity onPress={() => router.back()} style={s.back}>
            <Text style={s.backText}>← Volver</Text>
          </TouchableOpacity>

          <View style={s.hero}>
            <Text style={s.logo}>changa.</Text>
            <Text style={s.logoSub}>CREAR CUENTA</Text>
          </View>

          <View style={s.card}>
            <Text style={s.title}>Registrate</Text>
            <Text style={s.sub}>Gratis · 30 segundos</Text>

            <Field label="Nombre completo" value={name}     onChangeText={setName}     placeholder="María García"   autoCapitalize="words" />
            <Field label="Email"           value={email}    onChangeText={setEmail}    placeholder="tu@email.com"   keyboard="email-address" />
            <Field label="Contraseña"      value={password} onChangeText={setPassword} placeholder="mínimo 6 caracteres" secure />

            <Btn label="Crear cuenta →" onPress={handleRegister} loading={loading} />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1, padding: 24 },
  back: { marginBottom: 16 },
  backText: { color: C.muted, fontSize: 14 },
  hero: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 42, fontWeight: '700', color: C.accent, letterSpacing: -2 },
  logoSub: { fontSize: 11, color: C.muted, letterSpacing: 4, marginTop: -4 },
  card: { backgroundColor: C.card, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: C.border },
  title: { fontSize: 24, fontWeight: '700', color: C.text, marginBottom: 4 },
  sub: { fontSize: 13, color: C.muted, marginBottom: 24 },
});
