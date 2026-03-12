import { useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useBookings } from '../../hooks/useBookings';
import BookingCard from '../../components/features/BookingCard';
export default function Pedidos() { const { user } = useAuth(); const { bookings } = useBookings(user?.id, 'cliente'); const [tab, setTab] = useState('activos'); const filtered = bookings.filter((b) => tab === 'activos' ? ['pending', 'accepted', 'in_progress'].includes(b.status) : ['completed', 'cancelled'].includes(b.status));
  return <SafeAreaView style={{ flex: 1, padding: 16 }}><View style={{ flexDirection: 'row', gap: 10 }}><Text onPress={() => setTab('activos')}>Activos</Text><Text onPress={() => setTab('historial')}>Historial</Text></View><FlatList data={filtered} keyExtractor={(i) => i.id} renderItem={({ item }) => <BookingCard booking={item} role='cliente' />} /></SafeAreaView>; }
