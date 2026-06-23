import React, { useState } from 'react';
import { Card, Button, Modal, InputField, SelectField, TipeBadge } from '../components/ui/Components';

function useToast() {
  const [toast, setToast] = useState(null);
  function show(type, message) { setToast({ type, message }); setTimeout(() => setToast(null), 3200); }
  return { toast, showSuccess: m => show('success', m), showError: m => show('error', m) };
}
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{
      position:'fixed', top:24, left:'50%', transform:'translateX(-50%)',
      zIndex:99999, padding:'14px 24px', borderRadius:14,
      background:toast.type==='success'?'#16A34A':'#DC2626', color:'#fff',
      fontWeight:700, fontSize:14, boxShadow:'0 8px 32px rgba(0,0,0,0.2)',
      display:'flex', alignItems:'center', gap:10, fontFamily:'inherit'
    }}>
      {toast.type==='success'?'✅':'❌'} {toast.message}
    </div>
  );
}

// ── Status jadwal ─────────────────────────────────────────────
function getStatusJadwal(tanggal, jamMulai, jamSelesai) {
  if (!tanggal) return 'mendatang';
  const now   = new Date();
  const today = now.toISOString().split('T')[0];
  if (tanggal < today) return 'selesai';
  if (tanggal > today) return 'mendatang';
  const jm = jamMulai  || '00:00';
  const js = jamSelesai || '23:59';
  const mulai   = new Date(`${tanggal}T${jm}:00`);
  const selesai = new Date(`${tanggal}T${js}:00`);
  if (now > selesai) return 'selesai';
  return 'berlangsung'; // hari ini
}

const STATUS_CFG = {
  selesai:     { label: 'Selesai',        bg: '#F3F4F6', color: '#9E9E9E' },
  berlangsung: { label: '🟢 Berlangsung', bg: '#F0FDF4', color: '#16A34A' },
  mendatang:   { label: 'Mendatang',      bg: '#EFF6FF', color: '#2563EB' },
};

const DAFTAR_VAKSIN = [
  'BCG','HB-0','Polio 1','Polio 2','Polio 3',
  'DPT-HB-Hib 1','DPT-HB-Hib 2','DPT-HB-Hib 3','DPT-HB-Hib 4',
  'Campak-Rubela','IPV','RV 1','RV 2','RV 3',
];

const TIPE_OPTIONS = [
  { value: 'posyandu',   label: 'Posyandu',   icon: '🏥', color: '#16A34A' },
  { value: 'imunisasi',  label: 'Imunisasi',  icon: '💉', color: '#2563EB' },
  { value: 'penyuluhan', label: 'Penyuluhan', icon: '📢', color: '#EA580C' },
  { value: 'pmt',        label: 'PMT',        icon: '🍱', color: '#9333EA' },
];

const TIPE_COLOR = { posyandu:'#16A34A', imunisasi:'#2563EB', penyuluhan:'#EA580C', pmt:'#9333EA' };

// ── Time input ────────────────────────────────────────────────
function TimeInput({ label, value, onChange }) {
  return (
    <div>
      <label style={{ fontSize:11, fontWeight:600, color:'#6B7280', display:'block', marginBottom:4 }}>{label}</label>
      <input
        type="time" value={value || ''}
        onChange={e => onChange(e.target.value)}
        style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1.5px solid #E5E7EB', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box', background:'#fff' }}
        onFocus={e => e.target.style.borderColor='#1B6B3A'}
        onBlur={e  => e.target.style.borderColor='#E5E7EB'}
      />
    </div>
  );
}

// ── Form ──────────────────────────────────────────────────────
function FormJadwal({ form, setForm }) {
  function toggleVaksin(v) {
    const curr = form.vaksin || [];
    setForm(p => ({ ...p, vaksin: curr.includes(v) ? curr.filter(x=>x!==v) : [...curr, v] }));
  }
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

      {/* Tipe Kegiatan */}
      <div>
        <label style={{ fontSize:11, fontWeight:600, color:'#6B7280', display:'block', marginBottom:6 }}>Tipe Kegiatan</label>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {TIPE_OPTIONS.map(t => (
            <button key={t.value} onClick={() => setForm(p=>({...p,tipe:t.value,vaksin:[]}))} style={{
              padding:'10px 14px', borderRadius:10, cursor:'pointer',
              border:`2px solid ${form.tipe===t.value ? t.color : '#E5E7EB'}`,
              background: form.tipe===t.value ? `${t.color}10` : '#fff',
              display:'flex', alignItems:'center', gap:8,
              fontSize:13, fontWeight: form.tipe===t.value ? 700 : 500,
              color: form.tipe===t.value ? t.color : '#374151',
              fontFamily:'inherit', transition:'all 0.12s',
            }}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pilih Vaksin — hanya jika Imunisasi */}
      {form.tipe === 'imunisasi' && (
        <div style={{ background:'#EFF6FF', borderRadius:12, padding:'12px 14px', border:'1px solid #BFDBFE' }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#2563EB', marginBottom:10 }}>
            💉 Pilih Vaksin yang akan diberikan
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
            {DAFTAR_VAKSIN.map(v => {
              const active = (form.vaksin||[]).includes(v);
              return (
                <button key={v} onClick={() => toggleVaksin(v)} style={{
                  padding:'5px 12px', borderRadius:20, cursor:'pointer',
                  border:`1.5px solid ${active?'#2563EB':'#BFDBFE'}`,
                  background: active?'#2563EB':'#fff',
                  color: active?'#fff':'#2563EB',
                  fontSize:11, fontWeight:600, fontFamily:'inherit', transition:'all 0.1s',
                }}>
                  💉 {v}
                </button>
              );
            })}
          </div>
          {(form.vaksin||[]).length > 0 && (
            <div style={{ fontSize:10, color:'#6B7280', marginTop:8 }}>
              Dipilih: {form.vaksin.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Judul */}
      <InputField label="Judul Kegiatan *" value={form.judul} onChange={v=>setForm(p=>({...p,judul:v}))} placeholder="Contoh: Posyandu Rutin Maret 2026"/>

      {/* Tanggal */}
      <InputField label="Tanggal *" value={form.tanggal} onChange={v=>setForm(p=>({...p,tanggal:v}))} type="date"/>

      {/* Jam Mulai & Selesai */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <TimeInput label="Jam Mulai" value={form.jamMulai} onChange={v=>setForm(p=>({...p,jamMulai:v}))}/>
        <TimeInput label="Jam Selesai" value={form.jamSelesai} onChange={v=>setForm(p=>({...p,jamSelesai:v}))}/>
      </div>

      {/* Lokasi */}
      <InputField label="Lokasi" value={form.lokasi} onChange={v=>setForm(p=>({...p,lokasi:v}))} placeholder="Contoh: Balai Desa Mekarjaya"/>

      {/* ID Posyandu */}
      <InputField label="ID Posyandu (opsional)" value={form.posyanduId||''} onChange={v=>setForm(p=>({...p,posyanduId:v}))} type="number" placeholder="1, 2, 3..."/>

      {/* Deskripsi */}
      <div>
        <label style={{ fontSize:11, fontWeight:600, color:'#6B7280', display:'block', marginBottom:4 }}>Deskripsi (opsional)</label>
        <textarea
          value={form.deskripsi} onChange={e=>setForm(p=>({...p,deskripsi:e.target.value}))}
          placeholder="Catatan tambahan..." rows={2}
          style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1.5px solid #E5E7EB', fontSize:12, fontFamily:'inherit', outline:'none', resize:'vertical', boxSizing:'border-box', background:'#fff' }}
          onFocus={e=>e.target.style.borderColor='#1B6B3A'}
          onBlur={e =>e.target.style.borderColor='#E5E7EB'}
        />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
export default function JadwalPage({ jadwal, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [form, setForm] = useState({
    tipe:'posyandu', judul:'', tanggal:'',
    jamMulai:'', jamSelesai:'', lokasi:'',
    posyanduId:'', deskripsi:'', vaksin:[],
  });
  const { toast, showSuccess, showError } = useToast();

  async function save() {
    if (!form.judul)   { showError('Judul wajib diisi'); return; }
    if (!form.tanggal) { showError('Tanggal wajib diisi'); return; }
    setSaving(true);
    const waktu = form.jamMulai && form.jamSelesai ? `${form.jamMulai}-${form.jamSelesai}` : form.jamMulai || '';
    const vaksinInfo = (form.vaksin?.length>0) ? `Vaksin: ${form.vaksin.join(', ')}` : '';
    const dto = {
      tipe:       form.tipe,
      judul:      form.judul,
      tanggal:    form.tanggal,
      waktu,
      jamMulai:   form.jamMulai   || null,
      jamSelesai: form.jamSelesai || null,
      lokasi:     form.lokasi     || null,
      posyanduId: form.posyanduId ? parseInt(form.posyanduId) : null,
      deskripsi:  [form.deskripsi, vaksinInfo].filter(Boolean).join(' | ') || null,
      vaksin:     form.vaksin || [],
    };
    const result = await onAdd(dto);
    setSaving(false);
    if (result?.ok !== false) {
      showSuccess('Jadwal berhasil ditambahkan!');
      setForm({ tipe:'posyandu', judul:'', tanggal:'', jamMulai:'', jamSelesai:'', lokasi:'', posyanduId:'', deskripsi:'', vaksin:[] });
      setShowForm(false);
    } else {
      showError(result?.message || 'Gagal menambahkan jadwal');
    }
  }

  return (
    <div style={{ padding:24 }}>
      <Toast toast={toast}/>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>Jadwal Posyandu ({jadwal.length})</h3>
        {onAdd
          ? <Button onClick={() => setShowForm(true)}>➕ Tambah Jadwal</Button>
          : <span style={{ fontSize:12, color:'#9E9E9E' }}>👁️ Lihat saja</span>
        }
      </div>

      {jadwal.length === 0 ? (
        <div style={{ textAlign:'center', padding:'48px', color:'#9E9E9E' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>📅</div>
          <div>Belum ada jadwal</div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:14 }}>
          {jadwal.map(j => {
            const jm = j.jamMulai  || j.waktu?.split(/[-–]/)[0]?.trim() || '';
            const js = j.jamSelesai || j.waktu?.split(/[-–]/)[1]?.trim() || '';
            const status = getStatusJadwal(j.tanggal, jm, js);
            const cfg    = STATUS_CFG[status];
            const color  = TIPE_COLOR[j.tipe] || '#9E9E9E';
            const waktuDisplay = jm && js ? `${jm} – ${js}` : jm || j.waktu || '';
            return (
              <Card key={j.id} style={{ opacity: status==='selesai' ? 0.65 : 1 }}>
                <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                  <div style={{ width:52, height:52, borderRadius:12, background:`${color}14`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <div style={{ fontSize:18, fontWeight:800, color, lineHeight:1 }}>{new Date(j.tanggal).getDate()}</div>
                    <div style={{ fontSize:9, color, fontWeight:600 }}>{new Date(j.tanggal).toLocaleString('id',{month:'short'}).toUpperCase()}</div>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:13, marginBottom:4 }}>{j.judul}</div>
                    <TipeBadge tipe={j.tipe}/>
                    {waktuDisplay && <div style={{ fontSize:11, color:'#9E9E9E', marginTop:6 }}>🕐 {waktuDisplay}{j.lokasi?` • 📍 ${j.lokasi}`:''}</div>}
                    {j.deskripsi  && <div style={{ fontSize:12, color:'#6B7280', marginTop:6 }}>{j.deskripsi}</div>}
                  </div>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:12 }}>
                  <span style={{ padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:700, background:cfg.bg, color:cfg.color }}>{cfg.label}</span>
                  {onDelete && <Button size="sm" variant="danger" onClick={() => onDelete(j.id)}>🗑️</Button>}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Tambah Jadwal" width={500}>
        <FormJadwal form={form} setForm={setForm}/>
        <div style={{ display:'flex', gap:10, marginTop:20 }}>
          <button onClick={save} disabled={saving} style={{
            flex:1, padding:'12px', background:'#1B6B3A', color:'#fff',
            border:'none', borderRadius:10, fontWeight:700, fontSize:14,
            cursor:saving?'not-allowed':'pointer', fontFamily:'inherit',
            opacity:saving?0.8:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8
          }}>
            {saving
              ? <><span style={{ width:14,height:14,border:'2px solid #fff',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block',animation:'spin 0.7s linear infinite' }}/>Menyimpan...</>
              : '💾 Simpan Jadwal'
            }
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </button>
          <Button variant="ghost" onClick={() => setShowForm(false)} disabled={saving}>Batal</Button>
        </div>
      </Modal>
    </div>
  );
}