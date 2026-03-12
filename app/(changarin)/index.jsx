import { useMemo } from 'react';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useBookings } from '../../hooks/useBookings';
import { useServices } from '../../hooks/useServices';
import BookingCard from '../../components/features/BookingCard';
import ServiceCard from '../../components/features/ServiceCard';
import { formatARS } from '../../lib/utils';
export default function Dashboard() { const { user, profile } = useAuth(); const { bookings } = useBookings(user?.id, 'changarin'); const { services } = useServices(user?.id); const pending = bookings.filter((b) => b.status === 'pending'); const active = bookings.filter((b) => ['accepted', 'in_progress'].includes(b.status)); const completed = bookings.filter((b) => b.status === 'completed');
  const earnings = useMemo(() => completed.reduce((a, b) => a + Number(b.total_price || 0), 0), [completed]);
  return <SafeAreaView style={{ flex: 1, padding: 16 }}><Text style={{ fontSize: 24, fontWeight: '700' }}>Hola, {profile?.full_name?.split(' ')[0]} 👋</Text><View style={{ flexDirection: 'row', gap: 8, marginVertical: 10 }}><Text>Pedidos activos: {active.length}</Text><Text>Completados: {completed.length}</Text><Text>⭐ {profile?.rating || 0}</Text></View><Text>Solicitudes pendientes</Text><FlatList data={pending.slice(0,3)} renderItem={({ item }) => <BookingCard booking={item} role='changarin' />} keyExtractor={(i) => i.id} /><Text>Tus servicios</Text>{services.slice(0,3).map((s) => <ServiceCard key={s.id} service={s} />)}<Text>Esta semana: {formatARS(earnings)} ARS</Text></SafeAreaView>; }
