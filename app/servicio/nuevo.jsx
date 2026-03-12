import { useState } from 'react';
import { Alert, Switch, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/ui/Input';
import CategoryPicker from '../../components/features/CategoryPicker';
import Button from '../../components/ui/Button';
import { PRICE_UNITS } from '../../constants/categories';
import { useAuth } from '../../hooks/useAuth';
import { createService } from '../../lib/services';
import { router } from 'expo-router';
export default function NuevoServicio() { const { user } = useAuth(); const [form, setForm] = useState({ title: '', category: '', description: '', price_from: '', price_unit: 'hora', is_active: true });
  const submit = async () => { if (!form.title || !form.category || !form.price_from) return Alert.alert('Faltan datos', 'Completá título, categoría y precio.'); const { error } = await createService({ ...form, changarin_id: user.id, price_from: Number(form.price_from) }); if (error) return Alert.alert('Error', error.message); Alert.alert('Éxito', 'Servicio creado'); router.replace('/(changarin)/mis-servicios'); };
  return <SafeAreaView style={{ flex: 1, padding: 16 }}><Input label='Título del servicio' value={form.title} onChangeText={(title) => setForm((p) => ({ ...p, title }))} /><Text>Categoría</Text><CategoryPicker selected={form.category} onSelect={(category) => setForm((p) => ({ ...p, category }))} /><Input label='Descripción' value={form.description} onChangeText={(description) => setForm((p) => ({ ...p, description }))} multiline maxLength={500} /><Input label='Precio desde' value={String(form.price_from)} onChangeText={(price_from) => setForm((p) => ({ ...p, price_from }))} keyboardType='numeric' /><Text>Unidad de precio</Text>{PRICE_UNITS.map((u) => <Text key={u.value} onPress={() => setForm((p) => ({ ...p, price_unit: u.value }))}>{form.price_unit === u.value ? '●' : '○'} {u.label}</Text>)}<Text>Disponible <Switch value={form.is_active} onValueChange={(is_active) => setForm((p) => ({ ...p, is_active }))} /></Text><Button title='Guardar servicio' onPress={submit} /></SafeAreaView>; }
