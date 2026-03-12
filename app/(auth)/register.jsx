import { useMemo, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import CategoryPicker from '../../components/features/CategoryPicker';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
export default function Register() {
  const params = useLocalSearchParams();
  const { signUp } = useAuth();
  const [step, setStep] = useState(1); const [role, setRole] = useState(params.role || 'cliente');
  const [fullName, setFullName] = useState(''); const [phone, setPhone] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [category, setCategory] = useState(''); const [bio, setBio] = useState(''); const [priceFrom, setPriceFrom] = useState(''); const [loading, setLoading] = useState(false);
  const max = role === 'changarin' ? 3 : 2;
  const submit = async () => {
    setLoading(true);
    const { data, error } = await signUp({ email: email.trim(), password, full_name: fullName, role });
    if (error) { setLoading(false); return Alert.alert('Error', error.message); }
    if (role === 'changarin' && data?.user?.id) await supabase.from('profiles').update({ phone, category, bio, price_from: Number(priceFrom || 0) }).eq('id', data.user.id);
    setLoading(false); Alert.alert('Listo', 'Revisá tu correo para confirmar tu cuenta'); router.replace('/(auth)/login');
  };
  return <SafeAreaView style={{ flex: 1, padding: 20 }}><Text style={{ fontWeight: '700', marginBottom: 12 }}>Paso {step} de {max}</Text>{step === 1 && <View style={{ gap: 10 }}><Button title='Cliente' variant={role === 'cliente' ? 'primary' : 'outline'} onPress={() => setRole('cliente')} /><Button title='Changarín' variant={role === 'changarin' ? 'primary' : 'outline'} onPress={() => setRole('changarin')} /></View>}{step === 2 && <View><Input label='Nombre completo' value={fullName} onChangeText={setFullName} /><Input label='Teléfono' value={phone} onChangeText={setPhone} keyboardType='phone-pad' /><Input label='Email' value={email} onChangeText={setEmail} /><Input label='Contraseña' value={password} onChangeText={setPassword} secureTextEntry /></View>}{step === 3 && role === 'changarin' && <View><Text style={{ marginBottom: 8 }}>Categoría principal</Text><CategoryPicker selected={category} onSelect={setCategory} /><Input label='Bio' value={bio} onChangeText={setBio} multiline /><Input label='Precio desde' value={priceFrom} onChangeText={setPriceFrom} keyboardType='numeric' /></View>}<View style={{ marginTop: 20, flexDirection: 'row', gap: 10 }}>{step > 1 && <Button title='Atrás' variant='outline' onPress={() => setStep(step - 1)} />}{step < max ? <Button title='Siguiente' onPress={() => setStep(step + 1)} /> : <Button title='Crear cuenta' onPress={submit} loading={loading} />}</View></SafeAreaView>;
}
