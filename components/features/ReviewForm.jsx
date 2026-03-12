import { View } from 'react-native';
import Rating from '../ui/Rating';
import Input from '../ui/Input';
export default function ReviewForm({ rating, setRating, comment, setComment }) { return <View><Rating interactive value={rating} onChange={setRating} size='lg' /><Input multiline maxLength={500} label='Contanos más (opcional)' value={comment} onChangeText={setComment} /></View>; }
