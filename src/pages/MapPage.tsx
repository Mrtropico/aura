import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, MapPin, X, Loader2, Calendar, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

// Fix Leaflet Default Icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

// Custom Icons for different types
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const ICONS: Record<string, L.DivIcon> = {
  exposition: createCustomIcon('#E8507A'),
  performance: createCustomIcon('#0ABAB5'),
  atelier_ouvert: createCustomIcon('#F97316'),
  rencontre_flash: createCustomIcon('#A855F7'),
  radio: createCustomIcon('#FCD34D'),
  autre: createCustomIcon('#0F172A'),
};

function RecenterButton({ userPosition }: { userPosition: [number, number] | null }) {
  const map = useMap();
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400]">
      <button
        type="button"
        onClick={() => userPosition ? map.flyTo(userPosition, 14, { duration: 1.2 }) : map.flyTo([20, 0], 2, { duration: 1.5 })}
        className="bg-white/90 backdrop-blur px-6 py-3 rounded-full font-bold text-xs shadow-lg border border-neutral-200 hover:bg-neutral-50 transition-colors text-brand-ink uppercase tracking-wider"
      >
        {userPosition ? 'Ma Position' : 'Vue Mondiale'}
      </button>
    </div>
  );
}

function LocationController({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 13, { duration: 1.5 });
  }, [position]);
  return null;
}

interface MapActivity {
  id: string;
  creator_id: string;
  creator_name: string;
  creator_type: 'artist' | 'association';
  title: string;
  description: string;
  type: 'exposition' | 'performance' | 'atelier_ouvert' | 'rencontre_flash' | 'radio' | 'autre';
  lat: number;
  lng: number;
  address: string;
  start_date: any;
  end_date?: any;
  radio_stream_url?: string;
  radio_frequency?: string;
}

export function MapPage() {
  const { user, profile, activeRole } = useAuth();
  const [activities, setActivities] = useState<MapActivity[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFlashModal, setShowFlashModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPin, setSelectedPin] = useState<MapActivity | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);

  // Form state normal
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'exposition' as MapActivity['type'],
    address: '',
    lat: 20,
    lng: 0,
    start_date: '',
    radio_stream_url: '',
    radio_frequency: '',
  });

  // Form state flash
  const [flashForm, setFlashForm] = useState({
    what: '',
    where: '',
    duration: '3',
    lat: 20,
    lng: 0,
  });

  const handleGeocode = async (addressStr: string, isFlash = false) => {
    if (!addressStr) return;
    setGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressStr)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        if (isFlash) {
          setFlashForm(f => ({ ...f, lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }));
        } else {
          setForm(f => ({ ...f, lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }));
        }
      } else {
        toast.error("Adresse introuvable");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur de géolocalisation");
    } finally {
      setGeocoding(false);
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPosition(coords);
        setForm(f => ({ ...f, lat: coords[0], lng: coords[1] }));
        setFlashForm(f => ({ ...f, lat: coords[0], lng: coords[1] }));
      },
      () => {},
      { timeout: 6000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      const { data, error } = await supabase.from('map_activities').select('*');
      if (!error && data) {
        setActivities(data as MapActivity[]);
      }
      setLoading(false);
    }

    fetchActivities();

    const subscription = supabase
      .channel('public:map_activities')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'map_activities' }, () => {
        fetchActivities();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAddFlash = async () => {
    if (!profile || !user) return;
    setLoading(true);
    try {
      const start = new Date();
      const end = new Date(start.getTime() + parseInt(flashForm.duration) * 3600 * 1000);
      
      await supabase.from('map_activities').insert([{
        creator_id: user.id,
        creator_name: profile.full_name,
        creator_type: activeRole || 'artist',
        title: flashForm.what,
        description: `Rencontre Flash (${flashForm.duration}h)`,
        type: 'rencontre_flash',
        lat: flashForm.lat,
        lng: flashForm.lng,
        address: flashForm.where,
        start_date: start.toISOString(),
        end_date: end.toISOString()
      }]);
      
      await supabase.from('feed_events').insert([{
        actor_id: user.id,
        actor_name: profile.full_name || 'Un membre',
        action_type: 'started_flash',
        metadata: { title: flashForm.what, address: flashForm.where }
      }]);

      setShowFlashModal(false);
      setFlashForm({ ...flashForm, what: '', where: '' });
      toast.success("Rencontre Flash lancée !");
    } catch (err) {
      toast.error("Échec du lancement");
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async () => {
    if (!profile || !user) return;
    setLoading(true);
    try {
      await supabase.from('map_activities').insert([{
        creator_id: user.id,
        creator_name: profile.full_name,
        creator_type: activeRole,
        title: form.title,
        description: form.description,
        type: form.type,
        lat: form.lat,
        lng: form.lng,
        address: form.address,
        start_date: new Date(form.start_date).toISOString(),
        radio_stream_url: form.type === 'radio' ? (form.radio_stream_url || null) : null,
        radio_frequency: form.type === 'radio' ? (form.radio_frequency || null) : null,
      }]);
      setShowAddModal(false);
      setForm({ ...form, title: '', description: '', start_date: '', radio_stream_url: '', radio_frequency: '' });
      toast.success("Événement ajouté avec succès sur la carte");
    } catch (err) {
      toast.error("Échec lors de l'ajout sur la carte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] relative rounded-[3rem] overflow-hidden border border-neutral-100 shadow-sm bg-neutral-100 animate-in fade-in duration-700">
      
      <div className="w-full h-full z-0">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%', zIndex: 0 }}
          zoomControl={false}
        >
          <LocationController position={userPosition} />
          <RecenterButton userPosition={userPosition} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
            subdomains="abc"
            maxZoom={19}
          />
          {activities.map(activity => (
            <Marker 
              key={activity.id} 
              position={[activity.lat, activity.lng]}
              icon={ICONS[activity.type] || ICONS.autre}
              eventHandlers={{
                click: () => setSelectedPin(activity),
              }}
            />
          ))}
        </MapContainer>
      </div>

      {/* Floating Controls — top bar */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-none z-10">
        <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 shadow-xl pointer-events-auto flex items-center gap-4">
          <MapPin className="text-brand-turquoise" size={20} />
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-brand-ink">Carte Ouverte</h2>
            <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest italic">{activities.length} épingle{activities.length !== 1 ? 's' : ''} active{activities.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Desktop buttons — hidden on mobile */}
        {(activeRole === 'artist' || activeRole === 'association') && (
          <div className="hidden sm:flex gap-4">
            <button
              onClick={() => setShowFlashModal(true)}
              className="h-14 px-6 bg-brand-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:scale-105 active:scale-95 transition-all pointer-events-auto flex items-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Flash
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="h-14 px-8 bg-brand-ink text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all pointer-events-auto flex items-center gap-3"
            >
              <Plus size={18} />
              Épingler
            </button>
          </div>
        )}
      </div>

      {/* Mobile FABs — visible only on small screens */}
      {(activeRole === 'artist' || activeRole === 'association') && (
        <div className="sm:hidden absolute bottom-6 right-4 flex flex-col gap-3 z-20 pointer-events-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-14 h-14 bg-brand-ink text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
            aria-label="Épingler une activité"
          >
            <Plus size={22} />
          </button>
          <button
            onClick={() => setShowFlashModal(true)}
            className="w-14 h-14 bg-brand-primary text-white rounded-full shadow-[0_0_20px_rgba(168,85,247,0.5)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
            aria-label="Lancer un Flash"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </button>
        </div>
      )}

      {/* Selected Info Sidebar */}
      <AnimatePresence>
        {selectedPin && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute top-6 bottom-6 right-6 w-80 bg-white/95 backdrop-blur-xl rounded-[2.5rem] border border-neutral-100 shadow-2xl z-20 flex flex-col overflow-hidden"
          >
            <div className="p-8 space-y-6 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className={cn(
                  "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                  selectedPin.type === 'exposition' ? "bg-brand-rose/10 text-brand-rose border-brand-rose/20" :
                  selectedPin.type === 'performance' ? "bg-brand-turquoise/10 text-brand-turquoise border-brand-turquoise/20" :
                  selectedPin.type === 'rencontre_flash' ? "bg-purple-100 text-purple-600 border-purple-200" :
                  "bg-brand-orange/10 text-brand-orange border-brand-orange/20"
                )}>
                  {selectedPin.type}
                </span>
                <button onClick={() => setSelectedPin(null)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div>
                <h3 className="text-2xl font-black text-brand-ink uppercase italic leading-tight mb-2">{selectedPin.title}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Par {selectedPin.creator_name}</p>
              </div>

              {/* Radio specifics */}
              {selectedPin.type === 'radio' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-yellow-700">
                    <Radio size={16} />
                    {selectedPin.radio_frequency && (
                      <span className="text-sm font-black">{selectedPin.radio_frequency}</span>
                    )}
                  </div>
                  {selectedPin.radio_stream_url && (
                    <a
                      href={selectedPin.radio_stream_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 w-full py-3 px-4 bg-yellow-400 text-yellow-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-300 transition-colors"
                    >
                      🎙️ Écouter en direct
                    </a>
                  )}
                </div>
              )}

              <p className="text-sm text-neutral-500 font-medium leading-relaxed italic">{selectedPin.description}</p>

              <div className="space-y-3 pt-6 border-t border-neutral-50">
                <div className="flex items-center gap-3 text-neutral-400">
                  <MapPin size={16} />
                  <span className="text-xs font-bold">{selectedPin.address}</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-400">
                  <Calendar size={16} />
                  <span className="text-xs font-bold">À partir du {selectedPin.start_date ? new Date(selectedPin.start_date).toLocaleDateString('fr-FR') : ''}</span>
                </div>
              </div>
            </div>

            <div className="p-8 bg-neutral-50 border-t border-neutral-100">
              <button onClick={() => setSelectedPin(null)} className="w-full py-4 bg-brand-ink text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">
                Fermer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flash Modal */}
      <AnimatePresence>
        {showFlashModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-primary/20 backdrop-blur-sm"
              onClick={() => setShowFlashModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-brand-primary rounded-[3rem] p-10 w-full max-w-lg shadow-2xl relative z-10 space-y-8"
            >
              <div className="flex items-center justify-between text-white">
                <h3 className="text-3xl font-black uppercase italic flex items-center gap-3">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  Rencontre Flash
                </h3>
                <button onClick={() => setShowFlashModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-white/70 font-black ml-4">Quoi ?</label>
                  <input 
                    placeholder="Ex: Session croquis en direct"
                    className="w-full px-6 py-4 rounded-2xl bg-white/10 border-2 border-white/20 text-white placeholder:text-white/40 focus:border-white focus:bg-white/20 outline-none transition-all font-bold text-lg"
                    value={flashForm.what}
                    onChange={e => setFlashForm({...flashForm, what: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-white/70 font-black ml-4">Où ?</label>
                  <div className="relative">
                    <input 
                      placeholder="Ex: Place du Capitole"
                      className="w-full px-6 py-4 rounded-2xl bg-white/10 border-2 border-white/20 text-white placeholder:text-white/40 focus:border-white focus:bg-white/20 outline-none transition-all font-bold text-lg"
                      value={flashForm.where}
                      onChange={e => setFlashForm({...flashForm, where: e.target.value})}
                      onBlur={() => handleGeocode(flashForm.where, true)}
                    />
                    {geocoding && <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 animate-spin text-white/50" size={20} />}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-white/70 font-black ml-4">Combien de temps ?</label>
                  <select 
                    className="w-full px-6 py-4 rounded-2xl bg-brand-primary border-2 border-white/20 text-white focus:border-white outline-none transition-all font-bold text-lg cursor-pointer"
                    value={flashForm.duration}
                    onChange={e => setFlashForm({...flashForm, duration: e.target.value})}
                  >
                    <option value="1">1 heure</option>
                    <option value="2">2 heures</option>
                    <option value="3">3 heures</option>
                    <option value="6">6 heures</option>
                    <option value="12">12 heures</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  disabled={!flashForm.what || !flashForm.where || loading}
                  onClick={handleAddFlash}
                  className="w-full py-5 bg-white text-brand-primary rounded-2xl text-[14px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? <Loader2 className="animate-spin text-brand-primary" size={24} /> : 'Lancer le Flash'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-ink/40 backdrop-blur-md"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[3rem] p-10 w-full max-w-xl shadow-2xl relative z-10 space-y-8"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-brand-ink uppercase italic">Nouvelle Épingle</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-neutral-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className={labelCls}>Titre de l'activité</label>
                    <input 
                      placeholder="Ex: Exposition Éphémère"
                      className={inputCls}
                      value={form.title}
                      onChange={e => setForm({...form, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelCls}>Type</label>
                    <select
                      className={inputCls}
                      value={form.type}
                      onChange={e => setForm({...form, type: e.target.value as MapActivity['type']})}
                    >
                      <option value="exposition">Exposition</option>
                      <option value="performance">Performance</option>
                      <option value="atelier_ouvert">Atelier Ouvert</option>
                      <option value="radio">Passage Radio</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={labelCls}>Adresse complète</label>
                  <div className="relative">
                    <input 
                      placeholder="12 rue des Artistes, Paris"
                      className={inputCls}
                      value={form.address}
                      onChange={e => setForm({...form, address: e.target.value})}
                      onBlur={() => handleGeocode(form.address, false)}
                    />
                    {geocoding && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-neutral-400" size={16} />}
                  </div>
                  <p className="text-[10px] text-neutral-400 ml-1 italic">Les coordonnées s'actualisent automatiquement à la saisie de l'adresse.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className={labelCls}>Date de début</label>
                    <input 
                      type="date"
                      className={inputCls}
                      value={form.start_date}
                      onChange={e => setForm({...form, start_date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelCls}>Coordonnées (Simulation)</label>
                    <div className="flex gap-2">
                       <input className={cn(inputCls, "text-xs")} placeholder="Lat" value={form.lat} readOnly />
                       <input className={cn(inputCls, "text-xs")} placeholder="Lng" value={form.lng} readOnly />
                    </div>
                  </div>
                </div>

                {/* Radio-specific fields */}
                {form.type === 'radio' && (
                  <div className="space-y-3 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
                    <p className="text-[9px] font-black uppercase tracking-widest text-yellow-700">Infos Passage Radio</p>
                    <div className="space-y-1.5">
                      <label className={labelCls}>URL Streaming</label>
                      <input
                        type="url"
                        placeholder="https://stream.radio.fr/..."
                        className={inputCls}
                        value={form.radio_stream_url}
                        onChange={e => setForm({...form, radio_stream_url: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelCls}>Fréquence FM (optionnel)</label>
                      <input
                        type="text"
                        placeholder="92.3 MHz Toulouse"
                        className={inputCls}
                        value={form.radio_frequency}
                        onChange={e => setForm({...form, radio_frequency: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className={labelCls}>Description</label>
                  <textarea
                    rows={3}
                    placeholder="Dites-en plus sur cet événement..."
                    className={cn(inputCls, "resize-none")}
                    value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-neutral-50">
                <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Annuler</button>
                <button 
                  disabled={!form.title || !form.start_date || loading}
                  onClick={handleAddActivity}
                  className="flex-1 py-4 bg-brand-ink text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin text-white" size={16} /> : 'Valider'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const labelCls = 'block text-[8px] uppercase tracking-widest text-neutral-400 font-black mb-1 ml-1';
const inputCls = 'w-full px-5 py-3 rounded-xl bg-neutral-50 border-2 border-transparent focus:border-brand-ink focus:bg-white outline-none transition-all font-bold text-xs text-brand-ink';

