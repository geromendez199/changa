import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useFocusEffect, router } from 'expo-router';
import { getActiveBooking } from '../../lib/bookings';
import { getChangarines } from '../../lib/profiles';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import CategoryPicker from '../../components/features/CategoryPicker';
import ChangarinCard from '../../components/features/ChangarinCard';
export default function Home() { const { profile, user } = useAuth(); const [loading, setLoading] = useState(true); const [refreshing, setRefreshing] = useState(false); const [active, setActive] = useState(null); const [list, setList] = useState([]);
  const load = async () => { setLoading(true); setActive(await getActiveBooking(user?.id)); setList(await getChangarines({ sortBy: 'rating' })); setLoading(false); };
  useFocusEffect(useCallback(() => { load(); }, [user?.id]));
  if (loading) return <LoadingSpinner fullScreen text='Cargando inicio…' />;
  return <SafeAreaView style={{ flex: 1, padding: 16 }}><FlatList data={list} keyExtractor={(i) => i.id} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />} ListHeaderComponent={<View><Text style={{ fontSize: 24, fontWeight: '700' }}>Hola, {profile?.full_name?.split(' ')[0]} 👋</Text><Text style={{ color: '#6B6585' }}>Rafaela, Santa Fe</Text>{active ? <Text onPress={() => router.push(`/booking/${active.id}`)} style={{ backgroundColor: '#EFE9FF', padding: 10, borderRadius: 10, marginTop: 10 }}>Tenés un pedido {active.status}</Text> : null}<Text style={{ marginTop: 14, fontWeight: '700' }}>¿Qué necesitás hoy?</Text><CategoryPicker showAll onSelect={(c) => router.push(`/(cliente)/buscar?category=${c}`)} /><Text style={{ marginTop: 14, fontWeight: '700' }}>Changarines cerca tuyo</Text></View>} ListEmptyComponent={<EmptyState title='Sin changarines cercanos' subtitle='Volvé a intentar más tarde' />} renderItem={({ item }) => <ChangarinCard changarin={item} />} /></SafeAreaView>; }
