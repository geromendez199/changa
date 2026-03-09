import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Btn, SectionTitle, EmptyState } from '../components/UI';
import { C } from '../constants';

const STATUS = {
  pending:   { label: '⏳ Pendiente',   color: '#F0B27A' },
  confirmed: { label: '✓ Confirmado',   color: C.accent  },
  completed: { label: '✅ Completado',  color: C.muted   },
  cancelled: { label: '✕ Cancelado',   color: C.red     },
};

export default function PedidosScreen() {
  const { user } = useAuth();
  const [bookings,   setBookings]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab,        setTab]        = useState('client');

  const load = useCallback(async () => {
    if (!user?.id) return;
    const field = tab === 'client' ? 'client_id' : 'worker_id';
    const { data } = await supabase
      .from('bookings')
      .select('*, services(title, price), client:profiles!bookings_client_id_fkey(full_name), worker:profiles!bookings_worker_id_fkey(full_name)')
      .eq(field, user.id)
      .order('created_at', { ascending: false });
    setBookings(data || []);
    setLoading(false);
    setRefreshing(false);
  }, [user.id, tab]);

  useEffect(() => { load(); }, [load]);

  const setStatus = (id, status) => {
    const labels = { confirmed: 'Confirmar', completed: 'Marcar completado', cancelled: 'Rechazar' };
    Alert.alert('Actualizar pedido', `¿${labels[status]}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sí', onPress: async () => {
        await supabase.from('bookings').update({ status }).eq('id', id);
        load();
      }},
    ]);
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.logo}>changa.</Text>
        <Text style={s.title}>Mis pedidos</Text>
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {['client', 'worker'].map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>
              {t === 'client' ? 'Como cliente' : 'Como prestador'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.accent} />}>
        <View style={s.body}>
          {loading
            ? <ActivityIndicator color={C.accent} style={{ marginTop: 40 }} />
            : bookings.length === 0
              ? <EmptyState emoji="📋" title="Sin pedidos todavía" />
              : bookings.map(b => {
                  const st = STATUS[b.status] || STATUS.pending;
                  const other = tab === 'client' ? b.worker?.full_name : b.client?.full_name;
                  return (
                    <View key={b.id} style={s.card}>
                      <View style={s.cardTop}>
                        <Text style={s.serviceTitle} numberOfLines={1}>{b.services?.title}</Text>
                        <View style={[s.badge, { backgroundColor: st.color + '22' }]}>
                          <Text style={[s.badgeText, { color: st.color }]}>{st.label}</Text>
                        </View>
                      </View>
                      <Text style={s.meta}>{tab === 'client' ? '🛠️' : '👤'} {other || '—'}</Text>
                      {b.address      && <Text style={s.meta}>📍 {b.address}</Text>}
                      {b.scheduled_for && <Text style={s.meta}>🕐 {b.scheduled_for}</Text>}
                      {b.note         && <Text style={s.meta}>📝 {b.note}</Text>}
                      <Text style={s.price}>${b.services?.price?.toLocaleString()}/hora</Text>

                      {/* Worker actions */}
                      {tab === 'worker' && b.status === 'pending' && (
                        <View style={s.actions}>
                          <Btn label="✓ Confirmar" onPress={() => setStatus(b.id, 'confirmed')} style={{ flex: 1 }} />
                          <Btn label="✕ Rechazar"  onPress={() => setStatus(b.id, 'cancelled')} danger style={{ flex: 1 }} />
                        </View>
                      )}
                      {tab === 'worker' && b.status === 'confirmed' && (
                        <Btn label="✅ Marcar completado" onPress={() => setStatus(b.id, 'completed')} />
                      )}
                    </View>
                  );
                })
          }
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  logo: { fontSize: 20, fontWeight: '700', color: C.accent, letterSpacing: -0.5 },
  title: { fontSize: 28, fontWeight: '700', color: C.text, letterSpacing: -0.5, marginTop: 4 },
  tabs: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 8, backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: C.accent },
  tabText: { fontSize: 13, color: C.muted, fontWeight: '600' },
  tabTextActive: { color: '#000' },
  body: { padding: 20 },
  card: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 16, marginBottom: 10 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 },
  serviceTitle: { fontSize: 15, fontWeight: '700', color: C.text, flex: 1 },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, flexShrink: 0 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  meta: { fontSize: 12, color: C.muted, marginBottom: 3 },
  price: { fontSize: 15, color: C.accent, fontWeight: '700', marginTop: 8 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
});
