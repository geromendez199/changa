import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { updateService, deleteService } from '../../lib/services';
export default function EditService() { const { id } = useLocalSearchParams(); const [form, setForm] = useState(null);
  useEffect(() => { supabase.from('services').select('*').eq('id', id).single().then(({ data }) => setForm(data)); }, [id]);
  if (!form) return null;
  return <SafeAreaView style={{ flex: 1, padding: 16 }}><Input label='Título' value={form.title} onChangeText={(title) => setForm((p) => ({ ...p, title }))} /><Input label='Descripción' value={form.description || ''} onChangeText={(description) => setForm((p) => ({ ...p, description }))} multiline /><Input label='Precio desde' value={String(form.price_from || '')} onChangeText={(price_from) => setForm((p) => ({ ...p, price_from }))} keyboardType='numeric' /><Button title='Guardar cambios' onPress={async () => { await updateService(id, { ...form, price_from: Number(form.price_from) }); router.back(); }} /><Button title='Eliminar servicio' variant='danger' onPress={() => Alert.alert('Confirmar', '¿Eliminar?', [{ text: 'No' }, { text: 'Sí', onPress: async () => { await deleteService(id); router.replace('/(changarin)/mis-servicios'); } }])} /></SafeAreaView>; }
