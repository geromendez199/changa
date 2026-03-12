import { useState } from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { resetPassword } from '../../lib/auth';
export default function ForgotPassword() { const [email, setEmail] = useState(''); const [msg, setMsg] = useState(''); return <SafeAreaView style={{ flex: 1, padding: 20 }}><Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 12 }}>Recuperar contraseña</Text><Input label='Email' value={email} onChangeText={setEmail} /><Button title='Enviar link de recuperación' onPress={async () => { const { error } = await resetPassword(email); setMsg(error ? 'No pudimos enviar el correo.' : 'Listo, te mandamos un link para recuperar tu cuenta.'); }} />{!!msg && <Text style={{ marginTop: 12 }}>{msg}</Text>}</SafeAreaView>; }
