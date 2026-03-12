import { useState } from 'react';
import { Alert, Text } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReviewForm from '../../components/features/ReviewForm';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { createReview } from '../../lib/reviews';
export default function NewReview() { const { bookingId, changarinId } = useLocalSearchParams(); const { user } = useAuth(); const [rating, setRating] = useState(0); const [comment, setComment] = useState('');
  return <SafeAreaView style={{ flex: 1, padding: 16 }}><Text style={{ fontSize: 22, fontWeight: '700' }}>¿Cómo fue tu experiencia?</Text><ReviewForm rating={rating} setRating={setRating} comment={comment} setComment={setComment} /><Button title='Publicar reseña' onPress={async () => { if (!rating) return Alert.alert('Falta puntaje', 'Elegí una cantidad de estrellas.'); const { error } = await createReview({ booking_id: bookingId, reviewer_id: user.id, reviewed_id: changarinId, rating, comment }); if (error) return Alert.alert('Error', error.message); Alert.alert('Gracias', 'Tu reseña fue publicada.'); router.back(); }} /></SafeAreaView>; }
