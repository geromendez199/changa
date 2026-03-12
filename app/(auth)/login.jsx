import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
export default function Login() {
  const { signIn, profile } = useAuth();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [loading, setLoading] = useState(false);
  const submit = async () => { setLoading(true); const { error } = await signIn(email.trim(), password); setLoading(false); if (error) return Alert.alert('Ups', error.message || 'No pudimos iniciar sesión'); router.replace(profile?.role === 'changarin' ? '/(changarin)' : '/(cliente)'); };
  return <SafeAreaView style={{ flex: 1, padding: 20, justifyContent: 'center' }}><Text style={{ fontSize: 40, fontWeight: '800', color: '#6C47FF' }}>changa.</Text><Input label='Email' value={email} onChangeText={setEmail} keyboardType='email-address' /><Input label='Contraseña' value={password} onChangeText={setPassword} secureTextEntry /><Button title='Iniciar sesión' onPress={submit} loading={loading} /><Link href='/(auth)/forgot-password' style={{ marginTop: 12, color: '#6C47FF' }}>Olvidé mi contraseña</Link><Link href='/(auth)/register' style={{ marginTop: 8 }}>Crear cuenta</Link></SafeAreaView>;
}
