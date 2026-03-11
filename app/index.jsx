import { useState, useEffect, useCallback, useMemo, memo } from 'react';
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
const PAGE_SIZE = 20;

// ─── Service Card (memoized to prevent unnecessary re-renders) ─────────────────
const ServiceCard = memo(function ServiceCard({ sv, onBook }) {
  const [open, setOpen] = useState(false);
  const cat   = CATEGORIES.find(c => c.id === sv.category);
  const color = cat?.color || C.accent;
  const name  = sv.profiles?.full_name || 'Prestador';

  return (
    <TouchableOpacity
      style={[s.card, open && s.cardOpen]}
      onPress={() => setOpen(o => !o)}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`${sv.title} por ${name}, $${sv.price} por hora`}
      accessibilityHint={open ? 'Toca para cerrar' : 'Toca para ver detalle y contratar'}
      accessibilityState={{ expanded: open }}
    >
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
          <Badge label={`${cat?.icon || '✨'} ${cat?.label || 'Otros'}`} color={color} />
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
});

// ─── Booking Modal ─────────────────────────────────────────────────────────────
function BookingModal({ sv, visible, onClose, onDone }) {
  const { user } = useAuth();
  const [address, setAddress] = useState('');
  const [when, setWhen]       = useState('');
  const [note, setNote]       = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!address.trim()) return Alert.alert('Falta dirección', 'Ingresá tu dirección para la visita.');
    if (!user?.id) return Alert.alert('Error', 'Necesitás estar autenticado.');
    setLoading(true);
    try {
      const { error } = await supabase.from('bookings').insert({
        client_id: user.id, service_id: sv.id, worker_id: sv.worker_id,
        address: address.trim(), scheduled_for: when.trim(), note: note.trim(),
        status: 'pending',
      });
      if (error) throw error;
      setAddress(''); setWhen(''); setNote('');
      onDone();
    } catch (e) {
      Alert.alert('Error al enviar', e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!sv) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View style={s.overlay}>
        <View style={s.sheet} accessibilityRole="dialog" accessibilityLabel="Formulario de contratación">
          <View style={s.handle} />
          <Text style={s.sheetTitle}>Contratar servicio</Text>
          <Text style={s.sheetSub}>{sv.title} · ${sv.price?.toLocaleString()}/hora</Text>

          <Field label="Tu dirección *" value={address} onChangeText={setAddress}
            placeholder="Bv. Santa Fe 1234" autoCapitalize="sentences" />
          <Field label="¿Cuándo lo necesitás?" value={when} onChangeText={setWhen}
            placeholder="Hoy a las 15h / Esta semana" autoCapitalize="sentences" />
          <Field label="Descripción (opcional)" value={note} onChangeText={setNote}
            placeholder="Describí brevemente el trabajo..." multiline autoCapitalize="sentences" />

          <Btn label="Enviar solicitud 🚀" onPress={send} loading={loading} />
          <Btn label="Cancelar" onPress={onClose} ghost />
        </View>
      </View>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const [allServices, setAllServices] = useState([]);   // full loaded set
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [activeCat,   setActiveCat]   = useState(null);
  const [search,      setSearch]      = useState('');
  const [page,        setPage]        = useState(0);
  const [hasMore,     setHasMore]     = useState(true);
  const [booking,     setBooking]     = useState(null);
  const [showModal,   setShowModal]   = useState(false);
  const [toast,       setToast]       = useState(false);

  // ── Load a page from Supabase (initial + pagination) ──────────────────────
  const load = useCallback(async (pageNum = 0, replace = false) => {
    try {
      const from = pageNum * PAGE_SIZE;
      const to   = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('services')
        .select('*, profiles(full_name)')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      setAllServices(prev => replace ? (data || []) : [...prev, ...(data || [])]);
      setHasMore((data || []).length === PAGE_SIZE);
    } catch (e) {
      Alert.alert('Error al cargar servicios', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(0, true); }, [load]);

  const loadMore = () => {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    load(next);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(0);
    load(0, true);
  };

  // ── Local filtering (no extra Supabase round-trips) ───────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allServices.filter(sv => {
      const matchCat  = !activeCat || sv.category === activeCat;
      const matchSearch = !q
        || sv.title?.toLowerCase().includes(q)
        || sv.profiles?.full_name?.toLowerCase().includes(q)
        || sv.zone?.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [allServices, activeCat, search]);

  const showToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 3500);
  };

  return (
    <SafeAreaView style={s.safe}>
      {toast && (
        <View style={s.toast} accessibilityLiveRegion="polite">
          <Text style={s.toastText}>✅ Solicitud enviada — te contactarán pronto</Text>
        </View>
      )}

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={({ nativeEvent: e }) => {
          // Trigger load-more when user reaches ~90% of the scroll
          const near = e.layoutMeasurement.height + e.contentOffset.y >= e.contentSize.height * 0.9;
          if (near) loadMore();
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />
        }
      >
        <View style={s.page}>

          {/* ── Hero ─────────────────────────────────────────────────────── */}
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
              Conectate con {loading ? '...' : allServices.length}+ prestadores locales verificados
            </Text>
          </View>

          {/* ── Search ───────────────────────────────────────────────────── */}
          <View style={s.searchWrap}>
            <View style={s.searchBar}>
              <Text style={{ fontSize: 17 }}>🔍</Text>
              <TextInput
                style={s.searchInput}
                placeholder="Plomero, pintor, limpieza..."
                placeholderTextColor={C.muted}
                value={search}
                onChangeText={setSearch}
                accessibilityLabel="Buscar servicios"
                accessibilityHint="Escribí el tipo de servicio o nombre del prestador"
              />
              {search !== '' && (
                <TouchableOpacity
                  onPress={() => setSearch('')}
                  style={s.clearBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Limpiar búsqueda"
                >
                  <Text style={{ color: C.muted, fontSize: 15 }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* ── Category chips ───────────────────────────────────────────── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.catsScroll}
            contentContainerStyle={s.catsContainer}
            accessibilityRole="radiogroup"
            accessibilityLabel="Filtrar por categoría"
          >
            <TouchableOpacity
              style={[s.catChip, !activeCat && s.catChipAll]}
              onPress={() => setActiveCat(null)}
              activeOpacity={0.8}
              accessibilityRole="radio"
              accessibilityLabel="Todos los servicios"
              accessibilityState={{ selected: !activeCat }}
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
                  accessibilityRole="radio"
                  accessibilityLabel={cat.label}
                  accessibilityState={{ selected: active }}
                >
                  <Text style={{ fontSize: 14 }}>{cat.icon}</Text>
                  <Text style={[s.catText, active && { color: cat.color }]}>{cat.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ── Results header ───────────────────────────────────────────── */}
          <View style={s.resultsHeader}>
            <SectionTitle>
              {filtered.length} servicio{filtered.length !== 1 ? 's' : ''}
              {activeCat ? ` · ${CATEGORIES.find(c => c.id === activeCat)?.label}` : ''}
            </SectionTitle>
          </View>

          {/* ── Card grid (responsive: 1 col mobile, 2 col tablet, 3 col desktop) */}
          {loading && allServices.length === 0 ? (
            <ActivityIndicator color={C.accent} style={{ marginTop: 48 }} />
          ) : filtered.length === 0 ? (
            <EmptyState emoji="🔍" title="Sin servicios" sub="Probá con otra categoría o búsqueda." />
          ) : (
            <View style={s.grid}>
              {filtered.map(sv => (
                <View key={sv.id} style={s.gridItem}>
                  <ServiceCard sv={sv} onBook={sv => { setBooking(sv); setShowModal(true); }} />
                </View>
              ))}
            </View>
          )}

          {/* ── Load more ────────────────────────────────────────────────── */}
          {hasMore && !loading && filtered.length > 0 && (
            <View style={s.loadMoreWrap}>
              <Btn label="Cargar más →" onPress={loadMore} ghost small style={{ width: 180 }} />
            </View>
          )}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      <BookingModal
        sv={booking}
        visible={showModal}
        onClose={() => setShowModal(false)}
        onDone={() => { setShowModal(false); showToast(); }}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },

  // Page container — centers content and caps max width on wide screens
  page: {
    paddingBottom: 24,
    // On web, center content with a max-width so it doesn't stretch on 4K monitors
    maxWidth: isWeb ? 1280 : undefined,
    width: '100%',
    alignSelf: isWeb ? 'center' : undefined,
  },

  // Hero
  hero:    { paddingHorizontal: 24, paddingTop: isWeb ? 48 : 20, paddingBottom: 28 },
  heroTop: { marginBottom: 20 },
  logo:    { fontSize: 28, fontWeight: '800', color: C.accent, letterSpacing: -1 },
  logoSub: { fontSize: 10, color: C.muted, letterSpacing: 3 },

  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: C.accentDim, borderWidth: 1, borderColor: C.accentBorder,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 16,
  },
  pillDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: C.accent },
  pillText: { fontSize: 12, color: C.accent, fontWeight: '600', letterSpacing: 0.5 },

  heroTitle: {
    fontSize: isWeb ? 48 : 30, fontWeight: '800',
    lineHeight: isWeb ? 58 : 38,
    letterSpacing: -1.5, color: C.text, marginBottom: 12,
  },
  heroAccent: { color: C.accent },
  heroSub:    { fontSize: 14, color: C.muted, lineHeight: 22 },

  // Search
  searchWrap: { paddingHorizontal: 24, marginBottom: 16 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 16, paddingHorizontal: 18, paddingVertical: 14,
  },
  searchInput: { flex: 1, color: C.text, fontSize: 15 },
  clearBtn:    { padding: 4 },

  // Category chips
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

  // Results header
  resultsHeader: { paddingHorizontal: 24, marginBottom: 8 },

  // ── RESPONSIVE GRID ────────────────────────────────────────────────────────
  // Mobile:  1 column (full width, natural card stacking)
  // Tablet:  2 columns (≥ 600px)
  // Desktop: 3 columns (uses flexWrap + percentage width)
  grid: {
    paddingHorizontal: 24,
    ...(isWeb && {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    }),
  },
  // Each card item: full width on native, ~33% on web (minus gap)
  // Uses calc()-equivalent via percentage: (100% / N) - gap
  gridItem: {
    width: '100%',
    ...(isWeb && {
      // Responsive breakpoints are approximated via minWidth on the container:
      // If there's enough space for 3 columns: ~32%, 2 columns: ~48%, 1: 100%
      flexBasis: '31%',
      flexGrow: 1,
      minWidth: 280,
      maxWidth: 500,
    }),
    marginBottom: isWeb ? 0 : 10,
  },

  // Service card
  card: {
    backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 20, overflow: 'hidden', flex: 1,
    ...(isWeb && { cursor: 'pointer' }),
  },
  cardOpen:  { borderColor: C.accent },
  cardStrip: { height: 3 },
  cardInner: { padding: 16 },
  cardRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  cardRight: { alignItems: 'flex-end' },

  workerName:   { fontSize: 12, color: C.muted, marginBottom: 2 },
  serviceTitle: { fontSize: 15, fontWeight: '700', color: C.text },
  price:        { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  priceSub:     { fontSize: 11, color: C.muted },
  tagsRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  expanded:     { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: C.border },
  desc:         { fontSize: 13, color: C.muted, lineHeight: 20, marginBottom: 14 },

  // Load more
  loadMoreWrap: { alignItems: 'center', marginTop: 12, marginBottom: 4 },

  // Toast
  toast: {
    position: 'absolute', top: 16, left: 20, right: 20, zIndex: 99,
    backgroundColor: C.accent, borderRadius: 14, padding: 16, alignItems: 'center',
  },
  toastText: { color: '#000', fontWeight: '800', fontSize: 14 },

  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 28, paddingBottom: 48,
    borderWidth: 1, borderColor: C.border, borderBottomWidth: 0,
    ...(isWeb && {
      maxWidth: 560, width: '100%', alignSelf: 'center',
      borderRadius: 28, marginBottom: 40,
    }),
  },
  handle:     { width: 40, height: 4, backgroundColor: C.dim, borderRadius: 2, alignSelf: 'center', marginBottom: 24 },
  sheetTitle: { fontSize: 22, fontWeight: '800', color: C.text, marginBottom: 6, letterSpacing: -0.5 },
  sheetSub:   { fontSize: 14, color: C.muted, marginBottom: 24 },
});
