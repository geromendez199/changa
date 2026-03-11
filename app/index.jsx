import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Modal, Alert, ActivityIndicator,
  RefreshControl, Platform,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Btn, Field, Avatar, Badge, SectionTitle, EmptyState } from '../components/UI';
import { C, CATEGORIES } from '../constants';

const isWeb = Platform.OS === 'web';

// ─── Service Card ─────────────────────────────────────────────────────────────
function ServiceCard({ sv, onBook }) {
  const [open, setOpen] = useState(false);
  const cat   = CATEGORIES.find(c => c.id === sv.category);
  const color = cat?.color || C.accent;
  const name  = sv.profiles?.full_name || 'Prestador';

  return (
    <TouchableOpacity
      style={[s.card, open && s.cardOpen]}
      onPress={() => setOpen(!open)}
      activeOpacity={0.88}
    >
      {/* Color accent strip */}
      <View style={[s.cardStrip, { backgroundColor: color }]} />

      <View style={s.cardInner}>
        <View style={s.cardRow}>
          <Avatar name={name} color={color} size={44} />
          <View style={{ flex: 1 }}>
            <Text style={s.workerName}>{name}</Text>
            <Text style={s.serviceTitle} numberOfLines={1}>{sv.title}</Text>
          </View>
          <View style={s.cardRight}>
            <Text style={[s.price, { color }]}>${sv.price?.toLocaleString()}</Text>
            <Text style={s.priceSub}>/hora</Text>
          </View>
        </View>

        <View style={s.tagsRow}>
          <Badge label={`${cat?.icon} ${cat?.label}`} color={color} />
          {sv.zone ? <Badge label={`📍 ${sv.zone}`} color={C.muted} /> : null}
        </View>

        {open && (
          <View style={s.expanded}>
            {sv.description ? <Text style={s.desc}>{sv.description}</Text> : null}
            <Btn label={`Contratar a ${name.split(' ')[0]} →`} onPress={() => onBook(sv)} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Booking Modal ─────────────────────────────────────────────────────────────
function BookingModal({ sv, visible, onClose, onDone }) {
  const { user } = useAuth();
  const [address, setAddress] = useState('');
  const [when, setWhen]       = useState('');
  const [note, setNote]       = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!address) return Alert.alert('Falta la dirección', 'Ingresá tu dirección.');
    setLoading(true);
    const { error } = await supabase.from('bookings').insert({
      client_id: user.id, service_id: sv.id, worker_id: sv.worker_id,
      address, scheduled_for: when, note, status: 'pending',
    });
    setLoading(false);
    if (error) return Alert.alert('Error', error.message);
    setAddress(''); setWhen(''); setNote('');
    onDone();
  };

  if (!sv) return null;
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.handle} />
          <Text style={s.sheetTitle}>Contratar servicio</Text>
          <Text style={s.sheetSub}>{sv.title} · ${sv.price?.toLocaleString()}/hora</Text>

          <Field label="Tu dirección en Rafaela *" value={address} onChangeText={setAddress} placeholder="Bv. Santa Fe 1234" autoCapitalize="sentences" />
          <Field label="¿Cuándo lo necesitás?"     value={when}    onChangeText={setWhen}    placeholder="Hoy a las 15h / Esta semana" autoCapitalize="sentences" />
          <Field label="Descripción (opcional)"    value={note}    onChangeText={setNote}    placeholder="El caño perdió agua..." multiline autoCapitalize="sentences" />

          <Btn label="Enviar solicitud 🚀" onPress={send} loading={loading} />
          <Btn label="Cancelar" onPress={onClose} ghost />
        </View>
      </View>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const [services,   setServices]   = useState([]);
  const [activeCat,  setActiveCat]  = useState(null);
  const [search,     setSearch]     = useState('');
  const [booking,    setBooking]    = useState(null);
  const [showModal,  setShowModal]  = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast,      setToast]      = useState(false);

  const load = useCallback(async () => {
    let q = supabase
      .from('services')
      .select('*, profiles(full_name)')
      .eq('active', true)
      .order('created_at', { ascending: false });
    if (activeCat) q = q.eq('category', activeCat);
    const { data } = await q;
    setServices(data || []);
    setLoading(false);
    setRefreshing(false);
  }, [activeCat]);

  useEffect(() => { load(); }, [load]);

  const filtered = services.filter(sv =>
    !search ||
    sv.title?.toLowerCase().includes(search.toLowerCase()) ||
    sv.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const onDone = () => {
    setShowModal(false);
    setToast(true);
    setTimeout(() => setToast(false), 3500);
  };

  // Web grid: 2 columns when space allows
  const cardStyle = isWeb
    ? { width: 'calc(50% - 6px)', marginBottom: 12 }
    : {};

  return (
    <SafeAreaView style={s.safe}>
      {toast && (
        <View style={s.toast}>
          <Text style={s.toastText}>✅ Solicitud enviada — te contactarán pronto</Text>
        </View>
      )}

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.accent} />
        }
      >
        <View style={s.page}>

          {/* Hero */}
          <View style={s.hero}>
            {!isWeb && (
              <View style={s.heroTop}>
                <Text style={s.logo}>changa.</Text>
                <Text style={s.logoSub}>RAFAELA · SANTA FE</Text>
              </View>
            )}

            <View style={s.pill}>
              <View style={s.pillDot} />
              <Text style={s.pillText}>📍 Rafaela, Santa Fe</Text>
            </View>

            <Text style={s.heroTitle}>
              ¿Qué necesitás{'\n'}
              <Text style={s.heroAccent}>resolver hoy?</Text>
            </Text>

            <Text style={s.heroSub}>
              Conectate con {loading ? '...' : services.length} prestadores locales verificados
            </Text>
          </View>

          {/* Search bar */}
          <View style={s.searchWrap}>
            <View style={s.searchBar}>
              <Text style={{ fontSize: 17 }}>🔍</Text>
              <TextInput
                style={s.searchInput}
                placeholder="Plomero, pintor, limpieza..."
                placeholderTextColor={C.muted}
                value={search}
                onChangeText={setSearch}
              />
              {search !== '' && (
                <TouchableOpacity onPress={() => setSearch('')} style={s.clearBtn}>
                  <Text style={{ color: C.muted, fontSize: 15 }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Category chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catsScroll} contentContainerStyle={s.catsContainer}>
            <TouchableOpacity
              style={[s.catChip, !activeCat && s.catChipAll]}
              onPress={() => setActiveCat(null)}
              activeOpacity={0.8}
            >
              <Text style={[s.catText, !activeCat && s.catTextAll]}>Todos</Text>
            </TouchableOpacity>
            {CATEGORIES.map(cat => {
              const active = activeCat === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.8}
                  style={[s.catChip, active && { backgroundColor: cat.color + '20', borderColor: cat.color }]}
                  onPress={() => setActiveCat(active ? null : cat.id)}
                >
                  <Text style={{ fontSize: 14 }}>{cat.icon}</Text>
                  <Text style={[s.catText, active && { color: cat.color }]}>{cat.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Results header */}
          <View style={s.resultsHeader}>
            <SectionTitle>
              {filtered.length} servicio{filtered.length !== 1 ? 's' : ''} disponible{filtered.length !== 1 ? 's' : ''}
            </SectionTitle>
          </View>

          {/* Results */}
          {loading ? (
            <ActivityIndicator color={C.accent} style={{ marginTop: 48 }} />
          ) : filtered.length === 0 ? (
            <EmptyState
              emoji="🔍"
              title="Sin servicios por ahora"
              sub="Sé el primero en publicar en tu zona."
            />
          ) : (
            <View style={[s.cardGrid, isWeb && s.cardGridWeb]}>
              {filtered.map(sv => (
                <View key={sv.id} style={isWeb ? s.cardWebWrap : { width: '100%' }}>
                  <ServiceCard
                    sv={sv}
                    onBook={sv => { setBooking(sv); setShowModal(true); }}
                  />
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      <BookingModal sv={booking} visible={showModal} onClose={() => setShowModal(false)} onDone={onDone} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  page: {
    paddingTop: isWeb ? 40 : 0,
    paddingBottom: 24,
    maxWidth: isWeb ? 900 : undefined,
    width: '100%',
    alignSelf: isWeb ? 'center' : undefined,
  },

  // Hero
  hero:    { paddingHorizontal: 24, paddingTop: isWeb ? 0 : 20, paddingBottom: 24 },
  heroTop: { marginBottom: 20 },
  logo:    { fontSize: 28, fontWeight: '800', color: C.accent, letterSpacing: -1 },
  logoSub: { fontSize: 10, color: C.muted, letterSpacing: 3 },

  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: C.accentDim, borderWidth: 1, borderColor: C.accentBorder,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 16,
  },
  pillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.accent },
  pillText: { fontSize: 12, color: C.accent, fontWeight: '600', letterSpacing: 0.5 },

  heroTitle: {
    fontSize: isWeb ? 42 : 30,
    fontWeight: '800',
    lineHeight: isWeb ? 50 : 38,
    letterSpacing: -1,
    color: C.text,
    marginBottom: 10,
  },
  heroAccent: { color: C.accent },
  heroSub:    { fontSize: 14, color: C.muted, lineHeight: 20 },

  // Search
  searchWrap: { paddingHorizontal: 24, marginBottom: 16 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.card,
    borderWidth: 1.5, borderColor: C.border,
    borderRadius: 16, paddingHorizontal: 18, paddingVertical: 14,
  },
  searchInput: { flex: 1, color: C.text, fontSize: 15 },
  clearBtn: { padding: 4 },

  // Categories
  catsScroll:    { marginBottom: 24 },
  catsContainer: { paddingHorizontal: 24, gap: 8 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 24, paddingHorizontal: 14, paddingVertical: 9,
  },
  catChipAll: { borderColor: C.accent, backgroundColor: C.accentDim },
  catText:    { fontSize: 13, color: C.muted, fontWeight: '600' },
  catTextAll: { color: C.accent },

  // Results
  resultsHeader: { paddingHorizontal: 24, marginBottom: 4 },
  cardGrid:    { paddingHorizontal: 24 },
  cardGridWeb: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cardWebWrap: { width: 'calc(50% - 6px)' },

  // Card
  card: {
    backgroundColor: C.card,
    borderWidth: 1.5, borderColor: C.border,
    borderRadius: 20, marginBottom: 10,
    overflow: 'hidden',
    ...(isWeb && {
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      cursor: 'pointer',
    }),
  },
  cardOpen:  { borderColor: C.accent },
  cardStrip: { height: 3, width: '100%' },
  cardInner: { padding: 16 },
  cardRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  cardRight: { alignItems: 'flex-end' },

  workerName:   { fontSize: 12, color: C.muted, marginBottom: 2 },
  serviceTitle: { fontSize: 15, fontWeight: '700', color: C.text },
  price:        { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  priceSub:     { fontSize: 11, color: C.muted },
  tagsRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },

  expanded: {
    marginTop: 14, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  desc: { fontSize: 13, color: C.muted, lineHeight: 20, marginBottom: 14 },

  // Toast
  toast: {
    position: 'absolute', top: 16, left: 20, right: 20, zIndex: 99,
    backgroundColor: C.accent, borderRadius: 14, padding: 16, alignItems: 'center',
  },
  toastText: { color: '#000', fontWeight: '800', fontSize: 14 },

  // Modal
  overlay: { flex: 1, backgroundColor: C.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 28, paddingBottom: 48,
    borderWidth: 1, borderColor: C.border, borderBottomWidth: 0,
    ...(isWeb && { maxWidth: 560, width: '100%', alignSelf: 'center', borderRadius: 28, marginBottom: 40 }),
  },
  handle:     { width: 40, height: 4, backgroundColor: C.dim, borderRadius: 2, alignSelf: 'center', marginBottom: 24 },
  sheetTitle: { fontSize: 22, fontWeight: '800', color: C.text, marginBottom: 6, letterSpacing: -0.5 },
  sheetSub:   { fontSize: 14, color: C.muted, marginBottom: 24 },
});
