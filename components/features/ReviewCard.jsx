import { Text, View } from 'react-native';
import Avatar from '../ui/Avatar';
import Card from '../ui/Card';
import Rating from '../ui/Rating';
import { timeAgo } from '../../lib/utils';
export default function ReviewCard({ review }) { return <Card style={{ marginBottom: 8 }}><View style={{ flexDirection: 'row', gap: 10 }}><Avatar size='sm' uri={review.reviewer?.avatar_url} name={review.reviewer?.full_name} /><View style={{ flex: 1 }}><Text style={{ fontWeight: '700' }}>{review.reviewer?.full_name}</Text><Text style={{ color: '#6B6585' }}>{timeAgo(review.created_at)}</Text><Rating value={review.rating} size='sm' /><Text>{review.comment}</Text></View></View></Card>; }
