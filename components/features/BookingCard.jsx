import { Text, View } from 'react-native';
import { router } from 'expo-router';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { STATUS_COLORS, STATUS_LABELS } from '../../constants/categories';
import { formatDate } from '../../lib/utils';
export default function BookingCard({ booking, role }) { const other = role === 'cliente' ? booking.changarin : booking.cliente; return <Card onPress={() => router.push(`/booking/${booking.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}><Avatar uri={other?.avatar_url} name={other?.full_name} /><View style={{ flex: 1 }}><Text style={{ fontWeight: '700' }}>{other?.full_name}</Text><Text>{booking.service?.title || 'Servicio'}</Text><Text style={{ color: '#6B6585' }}>{formatDate(booking.scheduled_at || booking.created_at)}</Text></View><Badge label={STATUS_LABELS[booking.status]} color={STATUS_COLORS[booking.status]} textColor='#fff' /></Card>; }
