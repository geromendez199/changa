import { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Rating from '../../components/ui/Rating';
import ServiceCard from '../../components/features/ServiceCard';
import ReviewCard from '../../components/features/ReviewCard';
import Button from '../../components/ui/Button';
import { getProfile } from '../../lib/profiles';
import { getServicesByChangarin } from '../../lib/services';
import { getReviewsByChangarin } from '../../lib/reviews';
import { formatARS } from '../../lib/utils';
export default function PublicProfile() { const { id } = useLocalSearchParams(); const [p, setP] = useState(null); const [services, setServices] = useState([]); const [reviews, setReviews] = useState([]);
  useEffect(() => { (async () => { setP(await getProfile(id)); setServices(await getServicesByChangarin(id)); setReviews(await getReviewsByChangarin(id)); })(); }, [id]);
  if (!p) return null;
  return <SafeAreaView style={{ flex: 1 }}><FlatList contentContainerStyle={{ padding: 16, paddingBottom: 100 }} data={services} keyExtractor={(i) => i.id} ListHeaderComponent={<View><Avatar size='xl' uri={p.avatar_url} name={p.full_name} /><Text style={{ fontSize: 24, fontWeight: '700' }}>{p.full_name}</Text><Badge label={p.category || 'General'} color='#EFE9FF' textColor='#4A2FCC' /><Rating value={Number(p.rating || 0)} /><Text>{p.review_count || 0} reseñas</Text><Text>{p.is_available ? 'Disponible' : 'No disponible'} · {p.location}</Text><Text style={{ marginTop: 12, fontWeight: '700' }}>Sobre mí</Text><Text>{p.bio || 'Sin descripción.'}</Text><Text style={{ marginTop: 12, fontWeight: '700' }}>Servicios</Text></View>} renderItem={({ item }) => <ServiceCard service={item} />} ListFooterComponent={<View><Text style={{ marginTop: 12, fontWeight: '700' }}>Reseñas</Text>{reviews.slice(0,5).map((r) => <ReviewCard key={r.id} review={r} />)}</View>} /><View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 12, borderTopWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text>{formatARS(services?.[0]?.price_from)}</Text><Button title='Contratar' onPress={() => router.push(`/booking/nuevo?changarinId=${id}&serviceId=${services?.[0]?.id || ''}`)} /></View></SafeAreaView>; }
