import { Alert, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useBookings } from '../../hooks/useBookings';
import BookingCard from '../../components/features/BookingCard';
import Button from '../../components/ui/Button';
import { updateBookingStatus } from '../../lib/bookings';
export default function Solicitudes() { const { user } = useAuth(); const { bookings, refresh } = useBookings(user?.id, 'changarin'); const [tab, setTab] = useState('nuevas'); const filtered = bookings.filter((b) => tab === 'nuevas' ? b.status === 'pending' : tab === 'activas' ? ['accepted', 'in_progress'].includes(b.status) : ['completed', 'cancelled'].includes(b.status));
  return <SafeAreaView style={{ flex: 1, padding: 16 }}><View style={{ flexDirection: 'row', gap: 8 }}><Text onPress={() => setTab('nuevas')}>Nuevas</Text><Text onPress={() => setTab('activas')}>Activas</Text><Text onPress={() => setTab('historial')}>Historial</Text></View><FlatList data={filtered} keyExtractor={(i) => i.id} renderItem={({ item }) => <View><BookingCard booking={item} role='changarin' />{item.status === 'pending' ? <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}><Button title='Aceptar' size='sm' onPress={async () => { await updateBookingStatus(item.id, 'accepted'); refresh(); }} /><Button title='Rechazar' size='sm' variant='danger' onPress={async () => { await updateBookingStatus(item.id, 'cancelled'); refresh(); }} /></View> : null}</View>} /></SafeAreaView>; }
