export function hitungUmurBulan(tanggalLahir) {
  const now = new Date(); const lahir = new Date(tanggalLahir);
  return (now.getFullYear()-lahir.getFullYear())*12+now.getMonth()-lahir.getMonth();
}
export function formatUmur(tanggalLahir) {
  const b=hitungUmurBulan(tanggalLahir);
  if(b<12)return`${b} bulan`;
  const t=Math.floor(b/12),s=b%12;
  return s===0?`${t} tahun`:`${t} thn ${s} bln`;
}
export function formatTanggal(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'});
}
export function getStatusStunting(tb,umurBulan,jk) {
  const rL={0:49.9,3:61.4,6:67.6,9:72.0,12:75.7,18:82.3,24:87.8,36:96.1,48:103.3,60:110.0};
  const rP={0:49.1,3:59.8,6:65.7,9:70.1,12:74.0,18:80.7,24:86.4,36:95.1,48:102.7,60:109.4};
  const ref=jk==='Laki-laki'?rL:rP;
  const keys=Object.keys(ref).map(Number).sort((a,b)=>a-b);
  let m=ref[keys[0]]; for(const k of keys){if(umurBulan>=k)m=ref[k];}
  const r=tb/m; if(r<0.90)return'Stunting'; if(r<0.95)return'Risiko'; return'Normal';
}
export function getStatusGizi(bb,umurBulan,jk) {
  const rL={0:3.3,3:6.0,6:7.9,9:9.2,12:9.6,18:11.1,24:12.2,36:14.3,48:16.3,60:18.3};
  const rP={0:3.2,3:5.6,6:7.3,9:8.5,12:8.9,18:10.2,24:11.5,36:13.9,48:15.9,60:17.9};
  const ref=jk==='Laki-laki'?rL:rP;
  const keys=Object.keys(ref).map(Number).sort((a,b)=>a-b);
  let m=ref[keys[0]]; for(const k of keys){if(umurBulan>=k)m=ref[k];}
  const r=bb/m; if(r<0.70)return'Gizi Buruk'; if(r<0.80)return'Gizi Kurang'; if(r<=1.20)return'Gizi Baik'; return'Gizi Lebih';
}
export function hitungStatistik(list) {
  let stunting=0,risiko=0,normal=0,giziKurang=0;
  for(const b of list){
    if(!b.riwayat.length){normal++;continue;}
    const last=b.riwayat[b.riwayat.length-1],umur=hitungUmurBulan(b.tanggalLahir);
    const ss=getStatusStunting(last.tb,umur,b.jenisKelamin);
    const sg=getStatusGizi(last.bb,umur,b.jenisKelamin);
    if(ss==='Stunting')stunting++; else if(ss==='Risiko')risiko++; else normal++;
    if(sg==='Gizi Kurang'||sg==='Gizi Buruk')giziKurang++;
  }
  return{total:list.length,stunting,risiko,normal,giziKurang};
}
export const statusColor={
  'Stunting':{bg:'#FEF2F2',text:'#DC2626',border:'#FECACA'},
  'Risiko':{bg:'#FFFBEB',text:'#D97706',border:'#FDE68A'},
  'Normal':{bg:'#F0FDF4',text:'#16A34A',border:'#BBF7D0'},
  'Gizi Baik':{bg:'#F0FDF4',text:'#16A34A',border:'#BBF7D0'},
  'Gizi Kurang':{bg:'#FFFBEB',text:'#D97706',border:'#FDE68A'},
  'Gizi Buruk':{bg:'#FEF2F2',text:'#DC2626',border:'#FECACA'},
  'Gizi Lebih':{bg:'#F5F3FF',text:'#7C3AED',border:'#DDD6FE'},
  'Belum diukur':{bg:'#F9FAFB',text:'#6B7280',border:'#E5E7EB'},
};
export const roleLabelMap={admin:'Admin',bidan:'Bidan',kader:'Kader',orang_tua:'Orang Tua'};
