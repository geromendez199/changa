import { useState } from 'react';
import { Alert, Text } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { createBooking } from '../../lib/bookings';
import { supabase } from '../../lib/supabase';
export default function NewBooking() { const { changarinId, serviceId } = useLocalSearchParams(); const { user } = useAuth(); const [date, setDate] = useState(new Date()); const [address, setAddress] = useState('Rafaela, Santa Fe'); const [message, setMessage] = useState('');
  const submit = async () => { const { data, error } = await createBooking({ cliente_id: user.id, changarin_id: changarinId, service_id: serviceId || null, scheduled_at: date.toISOString(), address, message }); if (error) return Alert.alert('Error', error.message); await supabase.from('notifications').insert({ user_id: changarinId, title: 'Nuevo pedido', body: 'Tenés una nueva solicitud', type: 'booking_new', data: { booking_id: data.id } }); Alert.alert('Pedido creado', '¡Tu solicitud fue enviada!'); router.replace(`/booking/${data.id}`); };
  return <SafeAreaView style={{ flex: 1, padding: 16 }}><Text style={{ fontSize: 20, fontWeight: '700' }}>Nuevo pedido</Text><Input label='¿Cuándo necesitás el servicio?' value={date.toISOString().slice(0,16)} onChangeText={(v)=>setDate(new Date(v))} /><Input label='¿Dónde?' value={address} onChangeText={setAddress} /><Input label='Contale al changarín qué necesitás' value={message} onChangeText={setMessage} multiline maxLength={300} /><Text>Precio final a acordar con el changarín</Text><Button title='Confirmar pedido' onPress={submit} /></SafeAreaView>; }
