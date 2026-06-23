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

export default function JadwalPage({ jadwal, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ judul:'', tanggal:'', waktu:'', lokasi:'', tipe:'posyandu', deskripsi:'' });
  const { toast, showSuccess, showError } = useToast();
  const TIPE_COLOR = { posyandu:'#16A34A', imunisasi:'#2563EB', penyuluhan:'#EA580C', pmt:'#9333EA' };

  async function save() {
    if (!form.judul || !form.tanggal) { showError('Judul dan tanggal wajib diisi'); return; }
    const result = await onAdd(form);
    if (result?.ok !== false) {
      showSuccess('Jadwal berhasil ditambahkan!');
      setForm({ judul:'', tanggal:'', waktu:'', lokasi:'', tipe:'posyandu', deskripsi:'' });
      setShowForm(false);
    } else { showError(result?.message || 'Gagal menambahkan jadwal'); }
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
            const isPast = new Date(j.tanggal) < new Date();
            const color = TIPE_COLOR[j.tipe] || '#9E9E9E';
            return (
              <Card key={j.id} style={{ opacity: isPast ? 0.65 : 1 }}>
                <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                  <div style={{
                    width:52, height:52, borderRadius:12, background:`${color}14`,
                    display:'flex', flexDirection:'column', alignItems:'center',
                    justifyContent:'center', flexShrink:0
                  }}>
                    <div style={{ fontSize:18, fontWeight:800, color, lineHeight:1 }}>
                      {new Date(j.tanggal).getDate()}
                    </div>
                    <div style={{ fontSize:9, color, fontWeight:600 }}>
                      {new Date(j.tanggal).toLocaleString('id',{month:'short'}).toUpperCase()}
                    </div>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:13, marginBottom:4 }}>{j.judul}</div>
                    <TipeBadge tipe={j.tipe}/>
                    <div style={{ fontSize:11, color:'#9E9E9E', marginTop:6 }}>🕐 {j.waktu} • 📍 {j.lokasi}</div>
                    <div style={{ fontSize:12, color:'#6B7280', marginTop:6 }}>{j.deskripsi}</div>
                  </div>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:12 }}>
                  <span style={{
                    padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:700,
                    background: isPast?'#F9FAFB':'#F0FDF4', color: isPast?'#9E9E9E':'#16A34A'
                  }}>{isPast ? 'Selesai' : 'Mendatang'}</span>
                  {onDelete && <Button size="sm" variant="danger" onClick={() => onDelete(j.id)}>🗑️</Button>}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Tambah Jadwal" width={480}>
        <InputField label="Judul Kegiatan *" value={form.judul} onChange={v => setForm(p=>({...p,judul:v}))}/>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <InputField label="Tanggal *" value={form.tanggal} onChange={v => setForm(p=>({...p,tanggal:v}))} type="date"/>
          <InputField label="Waktu" value={form.waktu} onChange={v => setForm(p=>({...p,waktu:v}))} placeholder="08:00–12:00"/>
          <SelectField label="Tipe" value={form.tipe} onChange={v => setForm(p=>({...p,tipe:v}))}
            options={['posyandu','imunisasi','penyuluhan','pmt']}/>
          <InputField label="Lokasi" value={form.lokasi} onChange={v => setForm(p=>({...p,lokasi:v}))}/>
        </div>
        <InputField label="Deskripsi" value={form.deskripsi} onChange={v => setForm(p=>({...p,deskripsi:v}))}/>
        <div style={{ display:'flex', gap:10 }}>
          <Button onClick={save}>💾 Simpan</Button>
          <Button variant="ghost" onClick={() => setShowForm(false)}>Batal</Button>
        </div>
      </Modal>
    </div>
  );
}