import { Text, View } from 'react-native';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { formatARS } from '../../lib/utils';
import { CATEGORIES } from '../../constants/categories';
export default function ServiceCard({ service, editable, onEdit, onDelete, onToggle }) { const cat = CATEGORIES.find((c) => c.id === service.category); return <Card style={{ marginBottom: 10 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ fontWeight: '700' }}>{cat?.emoji} {service.title}</Text><Badge label={service.is_active ? 'Activo' : 'Pausado'} color={service.is_active ? '#00C48C' : '#A09BBC'} textColor='#fff' size='sm' /></View><Text numberOfLines={2} style={{ color: '#6B6585', marginVertical: 6 }}>{service.description}</Text><Text style={{ fontWeight: '600' }}>Desde {formatARS(service.price_from)} / {service.price_unit}</Text>{editable ? <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}><Button title='Editar' size='sm' variant='outline' onPress={onEdit} /><Button title='Eliminar' size='sm' variant='danger' onPress={onDelete} /><Button title={service.is_active ? 'Pausar' : 'Activar'} size='sm' variant='ghost' onPress={onToggle} /></View> : null}</Card>; }
