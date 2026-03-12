import { Alert, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useServices } from '../../hooks/useServices';
import ServiceCard from '../../components/features/ServiceCard';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
export default function MisServicios() { const { user } = useAuth(); const { services, refresh, deleteService, toggleServiceActive } = useServices(user?.id);
  return <SafeAreaView style={{ flex: 1, padding: 16 }}><FlatList data={services} keyExtractor={(i) => i.id} ListEmptyComponent={<EmptyState icon='🧰' title='Todavía no tenés servicios. ¡Creá tu primer servicio!' />} renderItem={({ item }) => <ServiceCard service={item} editable onEdit={() => router.push(`/servicio/${item.id}`)} onDelete={() => Alert.alert('Eliminar', '¿Eliminar servicio?', [{ text: 'No' }, { text: 'Sí', onPress: async () => { await deleteService(item.id); refresh(); } }])} onToggle={async () => { await toggleServiceActive(item.id, !item.is_active); refresh(); }} />} /><View style={{ position: 'absolute', right: 20, bottom: 24 }}><Button title='+' size='lg' onPress={() => router.push('/servicio/nuevo')} /></View></SafeAreaView>; }
