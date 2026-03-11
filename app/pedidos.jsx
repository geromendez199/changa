import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, RefreshControl, Alert, Platform,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Btn, EmptyState, Badge } from '../components/UI';
import { C } from '../constants';

const isWeb = Platform.OS === 'web';

const STATUS_MAP = {
  pending:   { label: 'Pendiente',  emoji: '⏳', color: '#F0B27A' },
  confirmed: { label: 'Confirmado', emoji: '✓',  color: C.accent  },
  completed: { label: 'Completado', emoji: '✅',  color: C.green   },
  cancelled: { label: 'Cancelado',  emoji: '✕',  color: C.red     },
};

export default function PedidosScreen() {
  const { user } = useAuth();
  const [bookings,   setBookings]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab,        setTab]        = useState('client');
  const [error,      setError]      = useState(null);

  const load = useCallback(async () => {
    // Guard: user might not be set yet
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const field = tab === 'client' ? 'client_id' : 'worker_id';
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select('*, services(title, price), client:profiles!bookings_client_id_fkey(full_name), worker:profiles!bookings_worker_id_fkey(full_name)')
        .eq(field, user.id)
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setBookings(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, tab]);

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
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.accent} />
        }
      >
        <View style={s.page}>

          {/* Header */}
          {!isWeb && (
            <View style={s.mobileHeader}>
              <Text style={s.logo}>changa.</Text>
            </View>
          )}

          <View style={s.header}>
            <View>
              <Text style={s.pageTitle}>Mis pedidos</Text>
              <Text style={s.pageSub}>{bookings.length} pedido{bookings.length !== 1 ? 's' : ''} en total</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={s.tabs}>
            {[
              { id: 'client', label: '👤 Como cliente' },
              { id: 'worker', label: '🛠️ Como prestador' },
            ].map(t => (
              <TouchableOpacity
                key={t.id}
                style={[s.tab, tab === t.id && s.tabActive]}
                onPress={() => setTab(t.id)}
                activeOpacity={0.8}
              >
                <Text style={[s.tabText, tab === t.id && s.tabTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content */}
          {error ? (
            <View style={s.errorBox}>
              <Text style={s.errorText}>⚠️ Error: {error}</Text>
              <Btn label="Reintentar" onPress={load} small ghost style={{ marginTop: 12 }} />
            </View>
          ) : loading ? (
            <ActivityIndicator color={C.accent} style={{ marginTop: 60 }} />
          ) : bookings.length === 0 ? (
            <EmptyState emoji="📋" title="Sin pedidos todavía" sub={tab === 'client' ? 'Contratá tu primer servicio desde la pantalla de Inicio.' : 'Cuando alguien te contrate, aparecerá aquí.'} />
          ) : (
            <View style={s.list}>
              {bookings.map(b => {
                const st = STATUS_MAP[b.status] || STATUS_MAP.pending;
                const other = tab === 'client' ? b.worker?.full_name : b.client?.full_name;
                return (
                  <View key={b.id} style={s.card}>
                    {/* Card top */}
                    <View style={[s.cardStatusBar, { backgroundColor: st.color + '25' }]}>
                      <View style={[s.statusDot, { backgroundColor: st.color }]} />
                      <Text style={[s.statusText, { color: st.color }]}>{st.emoji} {st.label}</Text>
                    </View>

                    <View style={s.cardBody}>
                      <View style={s.cardTop}>
                        <View style={{ flex: 1 }}>
                          <Text style={s.serviceTitle} numberOfLines={2}>{b.services?.title}</Text>
                          <Text style={s.priceLine}>${b.services?.price?.toLocaleString()}/hora</Text>
                        </View>
                      </View>

                      <View style={s.metaGrid}>
                        {other && (
                          <View style={s.metaItem}>
                            <Text style={s.metaIcon}>{tab === 'client' ? '🛠️' : '👤'}</Text>
                            <Text style={s.metaText}>{other}</Text>
                          </View>
                        )}
                        {b.address && (
                          <View style={s.metaItem}>
                            <Text style={s.metaIcon}>📍</Text>
                            <Text style={s.metaText}>{b.address}</Text>
                          </View>
                        )}
                        {b.scheduled_for && (
                          <View style={s.metaItem}>
                            <Text style={s.metaIcon}>🕐</Text>
                            <Text style={s.metaText}>{b.scheduled_for}</Text>
                          </View>
                        )}
                        {b.note && (
                          <View style={s.metaItem}>
                            <Text style={s.metaIcon}>📝</Text>
                            <Text style={s.metaText}>{b.note}</Text>
                          </View>
                        )}
                      </View>

                      {/* Worker actions */}
                      {tab === 'worker' && b.status === 'pending' && (
                        <View style={s.actions}>
                          <Btn label="✓ Confirmar" onPress={() => setStatus(b.id, 'confirmed')} style={{ flex: 1 }} />
                          <Btn label="✕ Rechazar"  onPress={() => setStatus(b.id, 'cancelled')} danger style={{ flex: 1 }} />
                        </View>
                      )}
                      {tab === 'worker' && b.status === 'confirmed' && (
                        <Btn label="✅ Marcar completado" onPress={() => setStatus(b.id, 'completed')} style={{ marginTop: 10 }} />
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  page:   { paddingBottom: 24 },

  mobileHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  logo:         { fontSize: 22, fontWeight: '800', color: C.accent, letterSpacing: -1 },

  header:    { paddingHorizontal: 20, marginBottom: 24, paddingTop: 12 },
  pageTitle: { fontSize: 28, fontWeight: '800', color: C.text, letterSpacing: -1, marginBottom: 4 },
  pageSub:   { fontSize: 14, color: C.muted },

  tabs: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 20,
    backgroundColor: C.card, borderRadius: 14,
    borderWidth: 1, borderColor: C.border, padding: 4,
  },
  tab:           { flex: 1, paddingVertical: 11, alignItems: 'center', borderRadius: 11 },
  tabActive:     { backgroundColor: C.accent },
  tabText:       { fontSize: 13, color: C.muted, fontWeight: '600' },
  tabTextActive: { color: '#000', fontWeight: '700' },

  errorBox: { margin: 20, padding: 20, backgroundColor: C.red + '15', borderWidth: 1, borderColor: C.red + '40', borderRadius: 16 },
  errorText:{ fontSize: 14, color: C.red, textAlign: 'center' },

  list: { paddingHorizontal: 20 },

  card: {
    backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 20, marginBottom: 12, overflow: 'hidden',
  },
  cardStatusBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  statusDot:     { width: 8, height: 8, borderRadius: 4 },
  statusText:    { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },

  cardBody:  { padding: 16 },
  cardTop:   { marginBottom: 14 },
  serviceTitle: { fontSize: 17, fontWeight: '800', color: C.text, marginBottom: 4, letterSpacing: -0.3 },
  priceLine:    { fontSize: 14, color: C.accent, fontWeight: '700' },

  metaGrid: { gap: 8, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  metaIcon: { fontSize: 14, marginTop: 1 },
  metaText: { fontSize: 13, color: C.textSec, flex: 1, lineHeight: 18 },

  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
});
