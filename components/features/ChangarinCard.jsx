import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Rating from '../ui/Rating';
import { formatARS } from '../../lib/utils';
export default function ChangarinCard({ changarin }) { const service = changarin.services?.[0]; return <Card elevated onPress={() => router.push(`/changarin/${changarin.id}`)} style={s.c}><Avatar uri={changarin.avatar_url} name={changarin.full_name} online={changarin.is_available} /><View style={{ flex: 1 }}><Text style={s.n}>{changarin.full_name}</Text><Badge label={changarin.category || 'General'} color='#EFE9FF' textColor='#4A2FCC' size='sm' /><View style={s.r}><Rating value={Number(changarin.rating || 0)} size='sm' /><Text style={s.m}>({changarin.review_count || 0})</Text></View><Text style={s.m}>desde {formatARS(service?.price_from)}/hora</Text></View><Text>›</Text></Card>; }
const s = StyleSheet.create({ c: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 10 }, n: { fontWeight: '700', marginBottom: 4 }, r: { flexDirection: 'row', alignItems: 'center', gap: 6 }, m: { color: '#6B6585' } });
