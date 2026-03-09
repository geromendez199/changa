import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Modal, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Btn, Field, Avatar, Badge, SectionTitle, EmptyState } from '../components/UI';
import { C, CATEGORIES } from '../constants';

// ─── Service Card ────────────────────────────────────────────
function ServiceCard({ sv, onBook }) {
  const [open, setOpen] = useState(false);
  const cat   = CATEGORIES.find(c => c.id === sv.category);
  const color = cat?.color || C.accent;
  const name  = sv.profiles?.full_name || 'Prestador';

  return (
    <TouchableOpacity style={[s.card, open && s.cardOpen]} onPress={() => setOpen(!open)} activeOpacity={0.88}>
      <View style={s.cardRow}>
        <Avatar name={name} color={color} />
        <View style={{ flex: 1 }}>
          <Text style={s.workerName}>{name}</Text>
          <Text style={s.serviceTitle}>{sv.title}</Text>
          <View style={s.row}>
            <Badge label={`${cat?.icon} ${cat?.label}`} color={color} />
            {sv.zone ? <Badge label={`📍 ${sv.zone}`} color={C.muted} /> : null}
          </View>
          <Text style={s.price}>${sv.price?.toLocaleString()} <Text style={s.priceSub}>/hora</Text></Text>
        </View>
      </View>

      {open && (
        <View style={s.expanded}>
          {sv.description ? <Text style={s.desc}>{sv.description}</Text> : null}
          <Btn label={`Contratar a ${name.split(' ')[0]} →`} onPress={() => onBook(sv)} />
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Booking Modal ────────────────────────────────────────────
function BookingModal({ sv, visible, onClose, onDone }) {
  const { user } = useAuth();
  const [address, setAddress]   = useState('');
  const [when, setWhen]         = useState('');
  const [note, setNote]         = useState('');
  const [loading, setLoading]   = useState(false);

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
          <Field label="¿Cuándo lo necesitás?"   value={when}    onChangeText={setWhen}    placeholder="Hoy a las 15h / Esta semana" autoCapitalize="sentences" />
          <Field label="Descripción (opcional)"  value={note}    onChangeText={setNote}    placeholder="El caño perdió agua..." multiline autoCapitalize="sentences" />

          <Btn label="Enviar solicitud 🚀" onPress={send} loading={loading} />
          <Btn label="Cancelar" onPress={onClose} ghost />
        </View>
      </View>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────
export default function HomeScreen() {
  const [services,  setServices]  = useState([]);
  const [activeCat, setActiveCat] = useState(null);
  const [search,    setSearch]    = useState('');
  const [booking,   setBooking]   = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [refreshing,setRefreshing]= useState(false);
  const [toast,     setToast]     = useState(false);

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

  return (
    <SafeAreaView style={s.safe}>
      {toast && <View style={s.toast}><Text style={s.toastText}>✅ Solicitud enviada — te contactarán pronto</Text></View>}

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.accent} />}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.logo}>changa.</Text>
          <Text style={s.logoSub}>RAFAELA · SANTA FE</Text>
        </View>

        <View style={s.body}>
          {/* Hero */}
          <View style={s.pill}><Text style={s.pillText}>📍 Rafaela, Santa Fe</Text></View>
          <Text style={s.hero}>¿Qué necesitás{'\n'}<Text style={{ color: C.accent }}>resolver hoy?</Text></Text>

          {/* Search */}
          <View style={s.searchBar}>
            <Text style={{ fontSize: 16 }}>🔍</Text>
            <TextInput style={s.searchInput} placeholder="Plomero, pintor, limpieza..." placeholderTextColor={C.dim}
              value={search} onChangeText={setSearch} />
            {search !== '' && <TouchableOpacity onPress={() => setSearch('')}><Text style={{ color: C.muted, fontSize: 16 }}>✕</Text></TouchableOpacity>}
          </View>

          {/* Categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', gap: 8, paddingRight: 8 }}>
              {CATEGORIES.map(cat => {
                const active = activeCat === cat.id;
                return (
                  <TouchableOpacity key={cat.id} activeOpacity={0.8}
                    style={[s.catChip, active && { backgroundColor: cat.color + '22', borderColor: cat.color }]}
                    onPress={() => setActiveCat(active ? null : cat.id)}
                  >
                    <Text style={{ fontSize: 15 }}>{cat.icon}</Text>
                    <Text style={[s.catText, active && { color: cat.color }]}>{cat.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Results */}
          <SectionTitle>{filtered.length} servicio{filtered.length !== 1 ? 's' : ''} disponible{filtered.length !== 1 ? 's' : ''}</SectionTitle>

          {loading
            ? <ActivityIndicator color={C.accent} style={{ marginTop: 40 }} />
            : filtered.length === 0
              ? <EmptyState emoji="🔍" title="Sin servicios por ahora" sub="Sé el primero en publicar en tu zona." />
              : filtered.map(sv => (
                  <ServiceCard key={sv.id} sv={sv} onBook={sv => { setBooking(sv); setShowModal(true); }} />
                ))
          }
        </View>
      </ScrollView>

      <BookingModal sv={booking} visible={showModal} onClose={() => setShowModal(false)} onDone={onDone} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  logo: { fontSize: 26, fontWeight: '700', color: C.accent, letterSpacing: -1 },
  logoSub: { fontSize: 10, color: C.muted, letterSpacing: 3 },
  body: { padding: 20 },
  pill: { alignSelf: 'flex-start', backgroundColor: '#C8FF0015', borderWidth: 1, borderColor: '#C8FF0033', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 12 },
  pillText: { fontSize: 11, color: C.accent, letterSpacing: 1 },
  hero: { fontSize: 30, fontWeight: '700', lineHeight: 36, letterSpacing: -0.5, color: C.text, marginBottom: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, marginBottom: 16 },
  searchInput: { flex: 1, color: C.text, fontSize: 14 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 20, paddingHorizontal: 13, paddingVertical: 9 },
  catText: { fontSize: 12, color: C.muted, fontWeight: '600' },
  card: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 14, marginBottom: 10 },
  cardOpen: { borderColor: C.accent },
  cardRow: { flexDirection: 'row', gap: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginVertical: 6 },
  workerName: { fontSize: 12, color: C.muted, marginBottom: 2 },
  serviceTitle: { fontSize: 15, fontWeight: '700', color: C.text },
  price: { fontSize: 16, color: C.accent, fontWeight: '700', marginTop: 4 },
  priceSub: { fontSize: 11, color: C.muted, fontWeight: '400' },
  expanded: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: C.border },
  desc: { fontSize: 13, color: C.muted, lineHeight: 19, marginBottom: 12 },
  toast: { position: 'absolute', top: 16, left: 20, right: 20, zIndex: 99, backgroundColor: C.accent, borderRadius: 12, padding: 14, alignItems: 'center' },
  toastText: { color: '#000', fontWeight: '700', fontSize: 13 },
  overlay: { flex: 1, backgroundColor: '#000000BB', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, borderWidth: 1, borderColor: C.border, borderBottomWidth: 0 },
  handle: { width: 40, height: 4, backgroundColor: C.dim, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 4 },
  sheetSub: { fontSize: 13, color: C.muted, marginBottom: 20 },
});
