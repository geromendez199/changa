import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import CategoryPicker from '../../components/features/CategoryPicker';
import { useState } from 'react';
export default function PerfilCh() { const { user } = useAuth(); const { profile, save } = useProfile(user?.id); const [form, setForm] = useState({}); if (!profile) return null;
  return <SafeAreaView style={{ flex: 1, padding: 16 }}><Text style={{ fontSize: 22, fontWeight: '700' }}>{profile.full_name}</Text><Text>Calificación promedio: ⭐ {profile.rating || 0}</Text><CategoryPicker selected={form.category || profile.category} onSelect={(category) => setForm((p) => ({ ...p, category }))} /><Input label='Bio' value={form.bio ?? profile.bio ?? ''} onChangeText={(bio) => setForm((p) => ({ ...p, bio }))} multiline /><Input label='Precio desde' value={String(form.price_from ?? profile.price_from ?? '')} onChangeText={(price_from) => setForm((p) => ({ ...p, price_from }))} keyboardType='numeric' /><Button title='Guardar perfil' onPress={() => save(form)} /></SafeAreaView>; }
