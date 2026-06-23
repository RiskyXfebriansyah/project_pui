// ── PosyanduPage ───────────────────────────────────────────────
import React, { useState } from 'react';
import { Card, EmptyState, StatusBadge } from '../components/ui/Components';
import { posyanduList as initPosyandu } from '../data/dummyData';

export function PosyanduPage() {
  const [data] = useState(initPosyandu);
  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14 }}>
        {data.map(p => (
          <Card key={p.id}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <div style={{ width:44, height:44, background:'#F0FDF4', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🏥</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{p.nama}</div>
                <div style={{ fontSize:11, color:'#9E9E9E' }}>Desa {p.desa}</div>
              </div>
              <span style={{ padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:700, background:p.aktif?'#F0FDF4':'#F9FAFB', color:p.aktif?'#16A34A':'#9E9E9E' }}>{p.aktif?'Aktif':'Nonaktif'}</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[['Total Balita',p.totalBalita,'#1565C0'],['Stunting',p.stunting,p.stunting>0?'#DC2626':'#9E9E9E']].map(([l,v,c])=>(
                <div key={l} style={{ background:'#F9FAFB', borderRadius:8, padding:'10px 12px', textAlign:'center' }}>
                  <div style={{ fontSize:20, fontWeight:800, color:c }}>{v}</div>
                  <div style={{ fontSize:10, color:'#9E9E9E' }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:12, fontSize:12, color:'#6B7280' }}>👤 Kader: <strong>{p.kader}</strong></div>
          </Card>
        ))}
      </div>
    </div>
  );
}


