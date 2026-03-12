import { useState, useMemo, memo } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Modal, Alert, ActivityIndicator,
  RefreshControl, Platform, FlatList, useWindowDimensions
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useServices } from '../hooks/useServices';
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
      style={[
        s.card, 
        open && s.cardOpen,
        isWeb && { outlineStyle: 'none' }
      ]}
      onPress={() => setOpen(o => !o)}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`${sv.title} por ${name}, $${sv.price} por hora`}
      accessibilityHint={open ? 'Toca para cerrar' : 'Toca para ver detalle y contratar'}
      accessibilityState={{ expanded: open }}
      tabIndex={0}
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
  const { width } = useWindowDimensions();
  const webColumns = width > 1200 ? 3 : width > 840 ? 2 : 1;
  const [activeCat,   setActiveCat]   = useState(null);
  const [search,      setSearch]      = useState('');
  const [booking,     setBooking]     = useState(null);
  const [showModal,   setShowModal]   = useState(false);
  const [toast,       setToast]       = useState(false);

  const {
    data,
    isLoading: loading,
    isRefetching: refreshing,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage: hasMore,
    refetch,
  } = useServices();

  const allServices = useMemo(() => {
    return data?.pages.flatMap(page => page.data) || [];
  }, [data]);

  const loadMore = () => {
    if (hasMore && !isFetchingNextPage) fetchNextPage();
  };

  const onRefresh = () => {
    refetch();
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

      <FlatList
        style={s.scroll}
        contentContainerStyle={s.page}
        data={filtered}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />
        }
        numColumns={isWeb ? webColumns : 1}
        key={isWeb ? `web-grid-${webColumns}` : 'mobile-list'}
        columnWrapperStyle={isWeb ? { gap: 16, paddingHorizontal: 24 } : undefined}
        renderItem={({ item }) => (
          <View style={[s.gridItem, !isWeb && { paddingHorizontal: 24 }]}>
            <ServiceCard sv={item} onBook={sv => { setBooking(sv); setShowModal(true); }} />
          </View>
        )}
        ListHeaderComponent={(
          <>
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
                Encontrá en segundos al profesional indicado. Todos los perfiles incluyen zona, precio y disponibilidad.
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
                    style={[s.clearBtn, isWeb && { outlineStyle: 'none' }]}
                    accessibilityRole="button"
                    accessibilityLabel="Limpiar búsqueda"
                    tabIndex={0}
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
                style={[s.catChip, !activeCat && s.catChipAll, isWeb && { outlineStyle: 'none' }]}
                onPress={() => setActiveCat(null)}
                activeOpacity={0.8}
                accessibilityRole="radio"
                accessibilityLabel="Todos los servicios"
                accessibilityState={{ selected: !activeCat }}
                tabIndex={0}
              >
                <Text style={[s.catText, !activeCat && s.catTextAll]}>Todos</Text>
              </TouchableOpacity>

              {CATEGORIES.map(cat => {
                const active = activeCat === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    activeOpacity={0.8}
                    style={[
                      s.catChip, 
                      active && { backgroundColor: cat.color + '20', borderColor: cat.color },
                      isWeb && { outlineStyle: 'none' }
                    ]}
                    onPress={() => setActiveCat(active ? null : cat.id)}
                    accessibilityRole="radio"
                    accessibilityLabel={cat.label}
                    accessibilityState={{ selected: active }}
                    tabIndex={0}
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
            
            {loading && allServices.length === 0 ? (
              <ActivityIndicator color={C.accent} style={{ marginTop: 48 }} />
            ) : filtered.length === 0 ? (
              <EmptyState emoji="🔍" title="Sin servicios" sub="Probá con otra categoría o búsqueda." />
            ) : null}
          </>
        )}
        ListFooterComponent={(
          <>
            {hasMore && !loading && filtered.length > 0 && (
              <View style={s.loadMoreWrap}>
                <Btn label={isFetchingNextPage ? "Cargando..." : "Cargar más →"} onPress={loadMore} ghost small style={{ width: 180 }} loading={isFetchingNextPage} />
              </View>
            )}
            <View style={{ height: 40 }} />
          </>
        )}
      />

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
    backgroundColor: C.bgElevated, borderWidth: 1.5, borderColor: C.border,
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

  // Mobile:  1 column (full width, natural card stacking)
  // Desktop: 3 columns (uses FlatList numColumns)
  grid: {
    paddingHorizontal: 24,
  },
  gridItem: {
    flex: 1,
    marginBottom: isWeb ? 0 : 10,
    ...(isWeb && {
      minWidth: 280,
      maxWidth: 500,
    }),
  },

  // Service card
  card: {
    backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 20, overflow: 'hidden', flex: 1,
    ...(isWeb && { cursor: 'pointer', boxShadow: '0 12px 28px rgba(3,9,23,0.35)' }),
  },
  cardOpen:  { borderColor: C.accentStrong },
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
    backgroundColor: C.accentStrong, borderRadius: 14, padding: 16, alignItems: 'center',
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
