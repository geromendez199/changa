import { useEffect, useState } from 'react';
import { Linking, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { getBookingById, updateBookingStatus } from '../../lib/bookings';
import Button from '../../components/ui/Button';
import { hasReviewed } from '../../lib/reviews';
export default function BookingDetail() { const { id } = useLocalSearchParams(); const { user, profile } = useAuth(); const [b, setB] = useState(null); const [reviewed, setReviewed] = useState(false);
  const load = async () => { const data = await getBookingById(id); setB(data); setReviewed(await hasReviewed(id, user.id)); };
  useEffect(() => { load(); }, [id]);
  if (!b) return null;
  const isChangarin = profile?.role === 'changarin'; const other = isChangarin ? b.cliente : b.changarin;
  return <SafeAreaView style={{ flex: 1, padding: 16 }}><Text>Estado: Enviado → Aceptado → En curso → Completado ({b.status})</Text><Text style={{ fontWeight: '700', marginTop: 8 }}>{isChangarin ? 'Cliente' : 'Changarín'}: {other?.full_name}</Text><Text onPress={() => other?.phone && Linking.openURL(`tel:${other.phone}`)}>{other?.phone || 'Sin teléfono'}</Text><Text>Servicio: {b.service?.title || 'General'}</Text><Text>Dirección: {b.address}</Text><Text>Mensaje: {b.message || 'Sin mensaje'}</Text>{isChangarin && b.status === 'pending' ? <View style={{ flexDirection: 'row', gap: 8 }}><Button title='Aceptar' onPress={async () => { await updateBookingStatus(id, 'accepted'); load(); }} /><Button title='Rechazar' variant='danger' onPress={async () => { await updateBookingStatus(id, 'cancelled'); load(); }} /></View> : null}{isChangarin && b.status === 'accepted' ? <Button title='Marcar como en curso' onPress={async () => { await updateBookingStatus(id, 'in_progress'); load(); }} /> : null}{isChangarin && b.status === 'in_progress' ? <Button title='Marcar como completado' onPress={async () => { await updateBookingStatus(id, 'completed'); load(); }} /> : null}{!isChangarin && b.status === 'completed' && !reviewed ? <Button title='Dejar reseña' onPress={() => router.push(`/review/nuevo?bookingId=${id}&changarinId=${b.changarin_id}`)} /> : null}{['accepted', 'in_progress'].includes(b.status) ? <Button title='Abrir chat' variant='outline' onPress={() => router.push(`/chat/${id}`)} /> : null}<Button title='Ir al chat →' variant='ghost' onPress={() => router.push(`/chat/${id}`)} /></SafeAreaView>; }
