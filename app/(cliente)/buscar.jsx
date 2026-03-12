import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryPicker from '../../components/features/CategoryPicker';
import ChangarinCard from '../../components/features/ChangarinCard';
import EmptyState from '../../components/ui/EmptyState';
import { getChangarines } from '../../lib/profiles';
export default function Buscar() { const params = useLocalSearchParams(); const [category, setCategory] = useState(params.category || ''); const [search, setSearch] = useState(''); const [sortBy, setSortBy] = useState('rating'); const [items, setItems] = useState([]); const [refreshing, setRefreshing] = useState(false);
  const load = async () => setItems(await getChangarines({ category, search, sortBy }));
  useEffect(() => { load(); }, [category, search, sortBy]);
  return <SafeAreaView style={{ flex: 1, padding: 16 }}><TextInput value={search} onChangeText={setSearch} placeholder='Buscar por nombre o servicio' style={{ backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E8E4FF' }} /><CategoryPicker selected={category} onSelect={setCategory} showAll /><View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}><Text onPress={() => setSortBy('rating')}>Mejor calificados</Text><Text onPress={() => setSortBy('price')}>Más económicos</Text><Text onPress={() => setSortBy('new')}>Más nuevos</Text></View><FlatList data={items.filter((i) => i.full_name.toLowerCase().includes(search.toLowerCase()) || i.services?.some((s) => s.title?.toLowerCase().includes(search.toLowerCase())))} keyExtractor={(i) => i.id} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />} renderItem={({ item }) => <ChangarinCard changarin={item} />} ListEmptyComponent={<EmptyState icon='🔍' title='No encontramos changarines para tu búsqueda' subtitle='Probá otra categoría o texto.' />} /></SafeAreaView>; }
