/* ============ helpers ============ */
const C={ok:'#16a34a',imp:'#0284c7',warn:'#d97706',crit:'#dc2626',det:'#ea580c',acc:'#0d9488',mut:'#5b6b85',grid:'#e6ecf5',vio:'#7c3aed'};
const $=s=>document.querySelector(s);
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const R=rng(20260930);
const rr=(a,b)=>a+R()*(b-a), ri=(a,b)=>Math.round(rr(a,b));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pad=n=>String(n).padStart(2,'0');
const dur=s=>{s=Math.floor(s);return pad(Math.floor(s/3600))+':'+pad(Math.floor(s%3600/60))+':'+pad(s%60)};
const mmss=s=>pad(Math.floor(s/60))+':'+pad(Math.floor(s%60));
const STC={critical:C.crit,stable:C.ok,improving:C.imp,deteriorating:C.det};

/* ============ data ============ */
const NAMES=['Ahmed Hassan','Mona Ibrahim','Youssef Adel','Salma Farouk','Omar Khaled','Nour El-Din','Hana Mostafa','Karim Samir','Laila Nabil','Tarek Mahmoud','Mariam Osman','Ali Fathy','Dina Saad','Hossam Anwar','Yasmin Gamal','Mahmoud Reda','Rana Ashraf','Sherif Wael','Heba Zaki','Amr Lotfy','Farida Essam','Walid Sabry','Nada Emad','Bassem Shawky'];
const DX=['Sepsis','Pneumonia','Post-op cardiac','Respiratory failure','Stroke','Trauma','COPD exacerbation','DKA','Heart failure','Pancreatitis'];
const DEVN=['MAX30102 (SpO\u2082/HR)','MLX90614 (Temp)','ECG Module','Load Cells','Camera'];
const STATUS={};
[104,107,111,116,118,122].forEach(i=>STATUS[i]='critical');
[109,113].forEach(i=>STATUS[i]='deteriorating');
[103,112,119,123,124].forEach(i=>STATUS[i]='improving');
const BASE={
 critical:{hr:[104,122],spo2:[88,93],rr:[24,30],sys:[84,100],dia:[50,62],temp:[37.8,39.1],gcs:[8,12]},
 deteriorating:{hr:[96,112],spo2:[92,95],rr:[20,25],sys:[98,112],dia:[58,70],temp:[37.6,38.4],gcs:[12,14]},
 improving:{hr:[76,94],spo2:[94,97],rr:[16,21],sys:[106,124],dia:[64,78],temp:[36.7,37.5],gcs:[13,15]},
 stable:{hr:[62,86],spo2:[95,99],rr:[13,18],sys:[110,130],dia:[68,82],temp:[36.4,37.2],gcs:[14,15]}
};
const patients=[];
for(let i=0;i<24;i++){
  const id=101+i, st=STATUS[id]||'stable', b=BASE[st];
  const p={id,name:NAMES[i],age:ri(34,82),sex:R()>.5?'M':'F',bed:'B-'+pad(i+1),dx:DX[i%DX.length],status:st,
    doctor:['Dr. Samir','Dr. Farah','Dr. Nabil'][i%3],adm:ri(1,14),
    vent:(st==='critical'&&i%2===0)||[103,105,110,120,121,122,114,116].includes(id),o2:false,
    v:{hr:rr(...b.hr),spo2:rr(...b.spo2),rr:rr(...b.rr),sys:rr(...b.sys),dia:rr(...b.dia),temp:rr(...b.temp)},
    gcs:ri(...b.gcs),pain:ri(0,st==='critical'?7:4),
    h:{hr:[],spo2:[],rr:[],sys:[],dia:[],temp:[]},
    weight:+rr(58,96).toFixed(1),pos:['Back','Left','Right'][i%3],posSec:ri(300,7200),
    move:['Low','Moderate','High'][ri(0,2)],pr:['Low','Moderate','High'][st==='critical'?ri(1,2):ri(0,1)],
    head:[15,25,30,35,45][i%5],leg:[0,10,15,20][i%4],mat:['Normal','Normal','Normal','Low'][i%4],bedExit:false,
    fallRisk:st==='critical'||i%5===0?'High':(i%2?'Moderate':'Low'),
    fin:ri(1800,3400),fout:ri(1400,3300),urine:ri(25,90),glu:ri(90,210),lac:+rr(.8,st==='critical'?4.6:2).toFixed(1),ph:+rr(7.31,7.46).toFixed(2),
    vm:['SIMV','AC/VC','PSV','CPAP'][i%4],fio2:ri(30,70),peak:ri(18,32),flow:ri(2,12),
    devs:DEVN.map(n=>({n,state:'online',batt:ri(35,100),last:ri(1,4)}))
  };
  p.o2=p.vent||R()>.55;
  for(let k=0;k<60;k++)for(const key in p.h)p.h[key].push(p.v[key]+rr(-1,1)*(key==='temp'?.05:key==='spo2'?.6:2.5));
  patients.push(p);
}
const byId=id=>patients.find(p=>p.id===+id);
/* scripted anomalies to match the spec examples */
byId(104).v.spo2=90.6;byId(104).v.hr=112;byId(104).v.rr=27;byId(104).v.sys=92;byId(104).v.dia=58;byId(104).v.temp=38.4;byId(104).gcs=12;byId(104).pos='Right';byId(104).posSec=42*60;byId(104).weight=74.6;byId(104).move='Low';byId(104).pr='Moderate';byId(104).head=35;byId(104).fallRisk='High';byId(104).bedExit=false;
for(let k=0;k<60;k++)byId(104).h.spo2[k]=96-k*.09+rr(-.4,.4);
byId(109).v.hr=131;byId(113).v.temp=38.6;for(let k=0;k<60;k++)byId(113).h.temp[k]=37.2+k*.022;
byId(118).bedExit=true;
byId(121).devs[2].state='error';byId(121).devs[2].last=380;
byId(107).devs[0].state='offline';byId(107).devs[0].last=740;byId(112).devs[4].state='offline';byId(112).devs[4].last=910;byId(120).devs[1].state='offline';byId(120).devs[1].last=1200;
byId(103).devs[3].batt=14;byId(115).devs[0].batt=11;
const TOTAL_BEDS=30;
const OCC7=[72,75,83,90,87,82,80],ADM7=[3,4,5,6,3,2,4],DIS7=[2,2,3,3,4,3,1],CRIT7=[5,6,8,9,8,7,7],VENT7=[5,6,7,9,9,8,8],ALR7=[21,26,33,40,31,28,19];
const hourly=Array.from({length:24},(_,i)=>Math.round(2+3*Math.abs(Math.sin(i/3.3))+R()*3));

/* alerts */
const alerts=[];
const nowMin=()=>{const d=new Date();return d.getHours()*60+d.getMinutes()};
function addA(pid,type,sev,state,agoMin,resp){alerts.push({pid,type,sev,state,ago:agoMin,resp})}
addA(104,'Low SpO\u2082','c','active',3);
addA(118,'Patient left bed','c','active',7);
addA(109,'High heart rate','h','active',14);
addA(113,'High temperature','h','active',20);
addA(121,'ECG sensor error','h','active',26);
addA(107,'Device offline (MAX30102)','m','active',31);
addA(116,'Respiratory abnormality','h','ack',44,72);
addA(111,'Abnormal blood pressure','h','ack',58,95);
addA(112,'Device offline (Camera)','m','ack',66,150);
addA(103,'Low battery (Load Cells)','i','ack',80,210);
addA(115,'Low battery (MAX30102)','i','active',95);
addA(122,'Emergency button pressed','c','resolved',130,40);
addA(120,'Device offline (MLX90614)','m','resolved',170,120);
addA(107,'Fall detected','h','resolved',210,58);
addA(104,'Seizure / movement detected','h','resolved',260,66);
addA(116,'ECG abnormality','m','resolved',320,101);
addA(110,'Low SpO\u2082','h','resolved',380,84);
const SEV={c:['Critical',C.crit],h:['High',C.det],m:['Medium',C.warn],i:['Info',C.imp]};

/* ============ derived ============ */
const map=p=>Math.round((p.v.sys+2*p.v.dia)/3);
function vstate(k,v){
  if(k==='hr')return v>130||v<45?'crit':(v>110||v<55?'warn':'');
  if(k==='spo2')return v<90?'crit':v<94?'warn':'';
  if(k==='rr')return v>28||v<8?'crit':(v>22||v<10?'warn':'');
  if(k==='sys')return v<85||v>180?'crit':(v<95||v>160?'warn':'');
  if(k==='temp')return v>39?'crit':(v>38||v<35.5?'warn':'');
  if(k==='gcs')return v<=8?'crit':(v<=12?'warn':'');
  return '';
}
function attention(){
  const out=[];
  patients.forEach(p=>{
    const r=[];
    if(p.bedExit)r.push([2,'Bed exit detected']);
    if(vstate('spo2',p.v.spo2)==='crit')r.push([2,'SpO\u2082 critically low ('+Math.round(p.v.spo2)+'%)']);
    else if(vstate('spo2',p.v.spo2)==='warn'&&p.h.spo2[0]-p.v.spo2>2)r.push([2,'SpO\u2082 decreasing']);
    else if(vstate('spo2',p.v.spo2)==='warn')r.push([1,'SpO\u2082 low ('+Math.round(p.v.spo2)+'%)']);
    if(vstate('hr',p.v.hr))r.push([vstate('hr',p.v.hr)==='crit'?2:1,'Heart rate abnormal ('+Math.round(p.v.hr)+')']);
    if(vstate('temp',p.v.temp)&&p.v.temp>38)r.push([1,'Temperature increasing ('+p.v.temp.toFixed(1)+'\u00b0C)']);
    if(p.devs.some(d=>d.state!=='online'))r.push([1,'Sensor disconnected']);
    if(r.length){r.sort((a,b)=>b[0]-a[0]);out.push({p,sev:r[0][0],why:r[0][1]})}
  });
  return out.sort((a,b)=>b.sev-a.sev).slice(0,7);
}
function stats(){
  const cnt={critical:0,stable:0,improving:0,deteriorating:0};patients.forEach(p=>cnt[p.status]++);
  const devs=patients.flatMap(p=>p.devs);
  const online=devs.filter(d=>d.state==='online').length;
  const active=alerts.filter(a=>a.state==='active');
  const resp=alerts.filter(a=>a.resp).map(a=>a.resp);
  const full=patients.filter(p=>p.devs.every(d=>d.state==='online')).length;
  return{cnt,devs:devs.length,online,offline:devs.filter(d=>d.state==='offline').length,err:devs.filter(d=>d.state==='error').length,
    low:devs.filter(d=>d.batt<20).length,vent:patients.filter(p=>p.vent).length,o2:patients.filter(p=>p.o2).length,
    active:active.length,critA:active.filter(a=>a.sev==='c').length,ack:alerts.filter(a=>a.state==='ack').length,res:alerts.filter(a=>a.state==='resolved').length,
    avgResp:resp.reduce((a,b)=>a+b,0)/resp.length,full,occ:Math.round(patients.length/TOTAL_BEDS*100)}
}

/* ============ chart builders (pure SVG) ============ */
function spark(data,color,w=90,h=32){
  const mn=Math.min(...data),mx=Math.max(...data),s=mx-mn||1;
  const pts=data.map((v,i)=>[i/(data.length-1)*w,h-2-(v-mn)/s*(h-4)]);
  const d=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path d="${d} L${w} ${h} L0 ${h}Z" fill="${color}" opacity=".13"/><path d="${d}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
let gid=0;
function line(o){
  const W=o.w||560,H=o.h||220,L=42,Rr=14,T=14,B=28,iw=W-L-Rr,ih=H-T-B;
  const all=o.series.flatMap(s=>s.data);
  let mn=o.min!=null?o.min:Math.min(...all),mx=o.max!=null?o.max:Math.max(...all);
  if(mn===mx){mn-=1;mx+=1}
  const X=(i,n)=>L+i/(n-1)*iw,Y=v=>T+ih-(v-mn)/(mx-mn)*ih;
  let g='',ticks=4;
  for(let i=0;i<=ticks;i++){const v=mn+(mx-mn)*i/ticks,y=Y(v);g+=`<line x1="${L}" x2="${W-Rr}" y1="${y}" y2="${y}" stroke="${C.grid}"/><text x="${L-8}" y="${y+4}" fill="${C.mut}" font-size="11" text-anchor="end">${(o.fmt?o.fmt(v):Math.round(v))}</text>`}
  if(o.labels)o.labels.forEach((t,i)=>{g+=`<text x="${X(i,o.labels.length)}" y="${H-8}" fill="${C.mut}" font-size="11" text-anchor="middle">${t}</text>`});
  (o.bands||[]).forEach(b=>{const y1=Y(clamp(b[1],mn,mx)),y0=Y(clamp(b[0],mn,mx));g+=`<rect x="${L}" y="${y1}" width="${iw}" height="${Math.max(0,y0-y1)}" fill="${b[2]}" opacity=".10"/>`});
  (o.lines||[]).forEach(l=>{const y=Y(l[0]);g+=`<line x1="${L}" x2="${W-Rr}" y1="${y}" y2="${y}" stroke="${l[1]}" stroke-dasharray="5 4" opacity=".7"/>`});
  let paths='';
  o.series.forEach(s=>{
    const id='g'+(gid++),n=s.data.length,pts=s.data.map((v,i)=>[X(i,n),Y(v)]);
    const d=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
    paths+=`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.color}" stop-opacity=".35"/><stop offset="1" stop-color="${s.color}" stop-opacity="0"/></linearGradient></defs>`;
    if(o.area!==false&&o.series.length===1)paths+=`<path d="${d} L${pts[n-1][0]} ${T+ih} L${pts[0][0]} ${T+ih}Z" fill="url(#${id})"/>`;
    paths+=`<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
    if(o.dots)pts.forEach(p=>paths+=`<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="#f6f9fd" stroke="${s.color}" stroke-width="2"/>`);
    else paths+=`<circle cx="${pts[n-1][0]}" cy="${pts[n-1][1]}" r="4" fill="${s.color}"/>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block">${g}${paths}</svg>`;
}
function bars(o){
  const W=o.w||560,H=o.h||200,L=34,Rr=8,T=10,B=26,iw=W-L-Rr,ih=H-T-B,n=o.labels.length,ns=o.series.length;
  const mx=o.max||Math.max(...o.series.flatMap(s=>s.data))*1.15;
  let g='';
  for(let i=0;i<=3;i++){const v=mx*i/3,y=T+ih-ih*i/3;g+=`<line x1="${L}" x2="${W-Rr}" y1="${y}" y2="${y}" stroke="${C.grid}"/><text x="${L-6}" y="${y+4}" fill="${C.mut}" font-size="11" text-anchor="end">${Math.round(v)}</text>`}
  const gw=iw/n,bw=Math.min(26,gw*.7/ns);
  o.labels.forEach((t,i)=>{
    if(!o.skip||i%o.skip===0)g+=`<text x="${L+gw*i+gw/2}" y="${H-8}" fill="${C.mut}" font-size="11" text-anchor="middle">${t}</text>`;
    o.series.forEach((s,k)=>{const v=s.data[i],h=v/mx*ih,x=L+gw*i+gw/2-bw*ns/2+k*bw;
      g+=`<rect x="${x}" y="${T+ih-h}" width="${bw-2}" height="${h}" rx="4" fill="${s.colors?s.colors[i]:s.color}" opacity=".92"/>`})
  });
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block">${g}</svg>`;
}
function donut(segs,size=190,center){
  const tot=segs.reduce((a,s)=>a+s.v,0),r=size/2-16,c=2*Math.PI*r;let off=0,out='';
  segs.forEach(s=>{const len=s.v/tot*c;out+=`<circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${s.c}" stroke-width="20" stroke-dasharray="${Math.max(0,len-3)} ${c}" stroke-dashoffset="${-off}" transform="rotate(-90 ${size/2} ${size/2})" stroke-linecap="round"/>`;off+=len});
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size}" style="flex:none"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="#e5ebf5" stroke-width="20"/>${out}<text x="50%" y="${size/2+2}" text-anchor="middle" fill="#0f1b2d" font-size="34" font-weight="800">${center[0]}</text><text x="50%" y="${size/2+22}" text-anchor="middle" fill="${C.mut}" font-size="11" letter-spacing="1">${center[1]}</text></svg>`.replace(`viewBox="0 0 ${size}"`,`viewBox="0 0 ${size} ${size}"`);
}
function ring(pct,color,size=54){
  const r=size/2-6,c=2*Math.PI*r;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="flex:none"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="#e5ebf5" stroke-width="7"/><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${c*pct/100} ${c}" transform="rotate(-90 ${size/2} ${size/2})"/></svg>`;
}
function gauge(pct,color){
  const r=70,c=Math.PI*r;
  return `<svg viewBox="0 0 180 110" width="100%" style="max-width:220px;display:block;margin:auto"><path d="M20 95 A70 70 0 0 1 160 95" fill="none" stroke="#e5ebf5" stroke-width="16" stroke-linecap="round"/><path d="M20 95 A70 70 0 0 1 160 95" fill="none" stroke="${color}" stroke-width="16" stroke-linecap="round" stroke-dasharray="${c*pct/100} ${c}"/><text x="90" y="88" text-anchor="middle" fill="#0f1b2d" font-size="30" font-weight="800">${pct}%</text></svg>`;
}
const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const pill=s=>`<span class="pill s-${s}"><i></i>${s.toUpperCase()}</span>`;
const ini=n=>n.split(' ').map(x=>x[0]).join('');
const vcls=(k,v)=>vstate(k,v)||'ok';

/* ============ pages ============ */
let updater=null,ecgStop=null;
function setNav(r){document.querySelectorAll('#nav a').forEach(a=>a.classList.toggle('on',a.dataset.r===r));$('#nb').textContent=alerts.filter(a=>a.state==='active').length}
function header(title,sub){return `<div class="top"><div><h1>${title}</h1><div class="sub">${sub}</div></div><div class="sp"></div><div class="live"><span class="dot"></span>LIVE &middot; <span class="clock" id="clk"></span></div></div>`}

function pageDashboard(){
  const m=$('#main');
  m.innerHTML=header('ICU Command Center','Real-time overview of the unit &middot; auto-refreshing every 2 seconds')+`<div id="dash"></div>`;
  updater=()=>{
    const s=stats(),att=attention(),n=patients.length;
    const kpi=(l,v,d,c,data)=>`<div class="card kpi" style="--c:${c}"><div class="l">${l}</div><div class="v">${v}</div><div class="d">${d}</div><div class="spark">${spark(data,c)}</div></div>`;
    const mini=(l,v,ringPct,c,sub)=>`<div class="card mini">${ring(ringPct,c)}<div><div class="l">${l}</div><div class="v">${v}</div>${sub?`<div style="color:var(--dim);font-size:11.5px">${sub}</div>`:''}</div></div>`;
    const sevC={c:0,h:0,m:0,i:0};alerts.filter(a=>a.state==='active').forEach(a=>sevC[a.sev]++);
    $('#dash').innerHTML=`
    <div class="grid g4" style="margin-bottom:16px">
      ${kpi('ICU Patients',n,'of '+TOTAL_BEDS+' beds occupied',C.acc,[20,22,21,23,22,24,n])}
      ${kpi('Available Beds',TOTAL_BEDS-n,'ready for admission',C.imp,[10,8,4,3,6,7,TOTAL_BEDS-n])}
      ${kpi('Critical Patients',s.cnt.critical,s.cnt.deteriorating+' deteriorating',C.crit,CRIT7.concat([s.cnt.critical]).slice(-7))}
      ${kpi('Active Alerts',s.active,s.critA+' critical &middot; '+(s.active-s.critA)+' other',C.warn,ALR7.map(x=>x/4).concat([s.active]).slice(-7))}
    </div>
    <div class="grid g6" style="margin-bottom:16px">
      ${mini('Bed Occupancy',s.occ+'%',s.occ,s.occ>85?C.crit:C.acc,n+' / '+TOTAL_BEDS)}
      ${mini('Ventilators',s.vent,s.vent/n*100,C.vio,'patients ventilated')}
      ${mini('Oxygen Support',s.o2,s.o2/n*100,C.imp,'incl. ventilated')}
      ${mini('Devices Online',s.online+'/'+s.devs,s.online/s.devs*100,C.ok,s.offline+' offline')}
      ${mini('Avg Alert Response',mmss(s.avgResp),Math.max(5,100-s.avgResp/3),C.warn,'target &lt; 02:00')}
      ${mini('Fully Monitored',s.full+'/'+n,s.full/n*100,C.acc,'all sensors OK')}
    </div>
    <div class="grid g-a" style="margin-bottom:16px">
      <div class="card"><h3>Patient status<span class="r">set by clinical staff</span></h3>
        <div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap;justify-content:center">
          ${donut([{v:s.cnt.stable,c:C.ok},{v:s.cnt.improving,c:C.imp},{v:s.cnt.deteriorating,c:C.det},{v:s.cnt.critical,c:C.crit}],180,[n,'PATIENTS'])}
          <div class="legend" style="min-width:150px">
            <div><i style="background:${C.ok}"></i>Stable<b>${s.cnt.stable}</b></div>
            <div><i style="background:${C.imp}"></i>Improving<b>${s.cnt.improving}</b></div>
            <div><i style="background:${C.det}"></i>Deteriorating<b>${s.cnt.deteriorating}</b></div>
            <div><i style="background:${C.crit}"></i>Critical<b>${s.cnt.critical}</b></div>
          </div></div></div>
      <div class="card"><h3>ICU occupancy &middot; last 7 days<span class="r">% of beds</span></h3>
        ${line({series:[{data:OCC7.concat([]).slice(0,6).concat([s.occ]),color:C.acc}],labels:days,min:60,max:100,dots:true,lines:[[85,C.crit]],fmt:v=>Math.round(v)+'%',w:440,h:420})}</div>
      <div class="card"><h3>Patients needing attention<span class="r">${att.length} flagged</span></h3>
        <div class="att">${att.map(a=>`<a href="#/patient/${a.p.id}" style="--c:${a.sev===2?C.crit:C.warn}"><div class="b">${a.p.bed.slice(2)}</div><div><b>#${a.p.id} ${a.p.name}</b><small>${a.why}</small></div><span class="t">${a.sev===2?'\u25cf HIGH':'\u25cf MED'}</span></a>`).join('')}</div></div>
    </div>
    <div class="grid g-b" style="margin-bottom:16px">
      <div class="card"><h3>Admissions vs discharges<span class="r">last 7 days</span></h3>
        ${bars({labels:days,series:[{data:ADM7,color:C.acc},{data:DIS7,color:C.vio}],w:440,h:300})}
        <div class="legend" style="grid-template-columns:auto auto;display:flex;gap:18px;margin-top:6px"><div><i style="background:${C.acc}"></i>Admissions</div><div><i style="background:${C.vio}"></i>Discharges</div></div></div>
      <div class="card"><h3>Active alerts by severity</h3>
        ${['c','h','m','i'].map(k=>`<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:var(--mut)">${SEV[k][0]}</span><b>${sevC[k]}</b></div><div class="bar"><i style="width:${Math.max(4,sevC[k]/Math.max(1,s.active)*100)}%;background:${SEV[k][1]}"></i></div></div>`).join('')}
        <div class="kv" style="margin-top:8px"><div><span>Acknowledged</span><b>${s.ack}</b></div><div><span>Resolved</span><b>${s.res}</b></div><div><span>Alerts today</span><b>${alerts.length+9}</b></div></div></div>
      <div class="card"><h3>Device status<span class="r">${Math.round(s.online/s.devs*100)}% availability</span></h3>
        <div class="grid g2" style="gap:10px">
          ${[['Online',s.online,C.ok],['Offline',s.offline,C.crit],['Sensor error',s.err,C.warn],['Low battery',s.low,C.det]].map(x=>`<div style="background:#f6f9fd;border:1px solid var(--line);border-radius:12px;padding:12px"><div style="color:var(--mut);font-size:11.5px;text-transform:uppercase">${x[0]}</div><div style="font-size:28px;font-weight:800;color:${x[2]}">${x[1]}</div></div>`).join('')}
        </div>
        <div class="bar" style="margin-top:14px;display:flex"><i style="width:${s.online/s.devs*100}%;background:${C.ok};border-radius:0"></i><i style="width:${s.offline/s.devs*100}%;background:${C.crit};border-radius:0"></i><i style="width:${s.err/s.devs*100}%;background:${C.warn};border-radius:0"></i></div>
        <div class="note">Availability = online / total devices</div></div>
    </div>
    <div class="grid g-b">
      <div class="card"><h3>Alerts per hour<span class="r">last 24 h</span></h3>
        ${bars({labels:hourly.map((_,i)=>pad(i)),series:[{data:hourly,colors:hourly.map(v=>v>=7?C.crit:v>=5?C.warn:C.imp)}],w:440,h:330,skip:3})}</div>
      <div class="card"><h3>Ventilator usage<span class="r">last 7 days</span></h3>
        ${line({series:[{data:VENT7.slice(0,6).concat([s.vent]),color:C.vio}],labels:days,min:0,max:12,w:360,h:330,dots:true})}</div>
      <div class="card"><h3>Recent alerts<span class="r"><a href="#/alerts" style="color:var(--acc)">view all &rarr;</a></span></h3>
        <div class="feed">${alerts.slice(0,6).map(a=>{const t=new Date(Date.now()-a.ago*60000);return `<div class="row sev-${a.sev}"><time>${pad(t.getHours())}:${pad(t.getMinutes())}</time><span class="tag"></span><div class="grow"><b>#${a.pid}</b> ${a.type}<br><small>${SEV[a.sev][0]} &middot; ${a.state}</small></div></div>`}).join('')}</div></div>
    </div>`;
  };
  updater();
}

function pagePatients(){
  const m=$('#main');let q='',f='all',view='table';
  m.innerHTML=header('Patients','All ICU patients &middot; click a row to open the full patient record')+`
  <div class="tools"><input class="search" id="q" placeholder="Search by name, bed or ID\u2026">
   <span id="chips"></span>
   <div class="seg"><button data-v="table" class="on">List</button><button data-v="cards">Cards</button></div></div><div id="plist"></div>`;
  const chips=['all','critical','deteriorating','improving','stable'];
  function draw(){
    $('#chips').innerHTML=chips.map(c=>`<span class="chip ${f===c?'on':''}" data-f="${c}">${c[0].toUpperCase()+c.slice(1)}${c==='all'?' ('+patients.length+')':' ('+patients.filter(p=>p.status===c).length+')'}</span>`).join(' ');
    const list=patients.filter(p=>(f==='all'||p.status===f)&&(p.name+p.bed+p.id).toLowerCase().includes(q));
    const rank={critical:0,deteriorating:1,improving:2,stable:3};list.sort((a,b)=>rank[a.status]-rank[b.status]||a.id-b.id);
    if(view==='table')$('#plist').innerHTML=`<div class="card" style="padding:6px 8px"><div class="tw"><table><thead><tr><th>Bed</th><th>Patient</th><th>Status</th><th>HR</th><th>SpO\u2082</th><th>RR</th><th>BP</th><th>Temp</th><th>GCS</th><th>SpO\u2082 trend</th><th>Support</th><th>Devices</th><th></th></tr></thead><tbody>${list.map(p=>{const off=p.devs.filter(d=>d.state!=='online').length;return `<tr onclick="location.hash='#/patient/${p.id}'"><td><b>${p.bed}</b></td><td><b>${p.name}</b><br><small style="color:var(--dim)">#${p.id} &middot; ${p.age}${p.sex} &middot; ${p.dx}</small></td><td>${pill(p.status)}</td><td class="${vcls('hr',p.v.hr)}">${Math.round(p.v.hr)}</td><td class="${vcls('spo2',p.v.spo2)}">${Math.round(p.v.spo2)}%</td><td class="${vcls('rr',p.v.rr)}">${Math.round(p.v.rr)}</td><td class="${vcls('sys',p.v.sys)}">${Math.round(p.v.sys)}/${Math.round(p.v.dia)}</td><td class="${vcls('temp',p.v.temp)}">${p.v.temp.toFixed(1)}\u00b0</td><td class="${vcls('gcs',p.gcs)}">${p.gcs}</td><td>${spark(p.h.spo2.slice(-30),STC[p.status],80,26)}</td><td>${p.vent?'<span class="flag w">VENT</span>':p.o2?'<span class="flag w" style="background:#38bdf822;color:#0369a1">O\u2082</span>':'\u2014'}${p.bedExit?'<span class="flag">BED EXIT</span>':''}</td><td>${off?`<span class="warn">${off} issue${off>1?'s':''}</span>`:'<span style="color:var(--ok)">\u25cf OK</span>'}</td><td style="color:var(--dim)">\u203a</td></tr>`}).join('')}</tbody></table></div></div>`;
    else $('#plist').innerHTML=`<div class="pcards">${list.map(p=>`<div class="card pc s-${p.status}" onclick="location.hash='#/patient/${p.id}'" style="--c:${STC[p.status]}"><div class="h"><div class="avatar">${ini(p.name)}</div><div style="flex:1"><b>${p.name}</b><small>${p.bed} &middot; #${p.id} &middot; ${p.dx}</small></div>${pill(p.status)}</div><div class="vs"><div><small>HR</small><b class="${vcls('hr',p.v.hr)}">${Math.round(p.v.hr)}</b></div><div><small>SpO\u2082</small><b class="${vcls('spo2',p.v.spo2)}">${Math.round(p.v.spo2)}</b></div><div><small>RR</small><b class="${vcls('rr',p.v.rr)}">${Math.round(p.v.rr)}</b></div><div><small>Temp</small><b class="${vcls('temp',p.v.temp)}">${p.v.temp.toFixed(1)}</b></div></div>${spark(p.h.hr.slice(-40),STC[p.status],260,34)}${p.bedExit?'<div style="margin-top:8px"><span class="flag">BED EXIT</span></div>':''}</div>`).join('')}</div>`;
    if(!list.length)$('#plist').innerHTML='<div class="card" style="text-align:center;color:var(--mut)">No patients match.</div>';
  }
  $('#q').oninput=e=>{q=e.target.value.toLowerCase();draw()};
  $('#chips').onclick=e=>{if(e.target.dataset.f){f=e.target.dataset.f;draw()}};
  m.querySelector('.seg').onclick=e=>{if(e.target.dataset.v){view=e.target.dataset.v;m.querySelectorAll('.seg button').forEach(b=>b.classList.toggle('on',b.dataset.v===view));draw()}};
  draw();updater=draw;
}

function bedSVG(p){
  const ang=p.head,rad=ang*Math.PI/180,hx=190,hy=118,L=110;
  const tx=hx-Math.cos(rad)*L,ty=hy-Math.sin(rad)*L;
  const lang=p.leg*Math.PI/180,ex=hx+Math.cos(lang)*90,ey=hy-Math.sin(lang)*90;
  // pressure map
  const cells=[];const zones={Back:[[1,1],[1,2],[2,1],[2,2],[4,1],[4,2]],Left:[[1,0],[2,0],[3,0],[4,0],[2,1]],Right:[[1,3],[2,3],[3,3],[4,3],[2,2]]}[p.pos];
  let map='';const rk={Low:.4,Moderate:.7,High:1}[p.pr];
  for(let r=0;r<6;r++)for(let c=0;c<4;c++){
    let val=.12+.08*((r*7+c*3+p.id)%5)/5;
    if(zones.some(z=>z[0]===r&&z[1]===c))val=.45+.5*rk;
    if(zones.some(z=>z[0]===r&&z[1]===c)&&r===4)val=Math.min(1,val+.1);
    const col=val>.8?C.crit:val>.55?C.warn:val>.3?C.ok:'#cfe8ee';
    map+=`<rect x="${c*24}" y="${r*24}" width="21" height="21" rx="5" fill="${col}" opacity="${.5+val*.5}"/>`;
  }
  return `<div style="display:flex;gap:18px;flex-wrap:wrap;align-items:center;justify-content:space-around">
  <svg viewBox="0 0 320 170" width="330"><rect x="10" y="150" width="300" height="6" rx="3" fill="#cbd5e1"/><rect x="24" y="118" width="6" height="34" fill="#cbd5e1"/><rect x="290" y="118" width="6" height="34" fill="#cbd5e1"/>
   <rect x="${hx}" y="112" width="70" height="8" rx="4" fill="#94a3b8"/>
   <line x1="${hx}" y1="${hy}" x2="${ex}" y2="${ey}" stroke="#94a3b8" stroke-width="8" stroke-linecap="round"/>
   <line x1="${hx}" y1="${hy}" x2="${tx}" y2="${ty}" stroke="${C.acc}" stroke-width="8" stroke-linecap="round"/>
   <circle cx="${tx+Math.cos(rad)*-2}" cy="${ty-16}" r="13" fill="#38bdf8" opacity=".85"/>
   <line x1="${tx+8}" y1="${ty-6}" x2="${hx+40}" y2="${hy-10}" stroke="#38bdf8" stroke-width="14" stroke-linecap="round" opacity=".55"/>
   <path d="M${hx-70} ${hy} A70 70 0 0 0 ${hx-70*Math.cos(rad)} ${hy-70*Math.sin(rad)}" fill="none" stroke="${C.warn}" stroke-dasharray="3 3"/>
   <text x="${hx-96}" y="${hy-18}" fill="${C.warn}" font-size="13" font-weight="700">${p.head}\u00b0</text>
   <text x="12" y="20" fill="${C.mut}" font-size="11">HEAD ELEVATION</text></svg>
  <div><div style="color:var(--mut);font-size:11px;letter-spacing:.7px;margin-bottom:6px">PRESSURE MATRIX</div><svg viewBox="0 0 96 144" width="110">${map}</svg>
  <div style="display:flex;gap:6px;font-size:10.5px;color:var(--mut);margin-top:6px"><span style="color:${C.ok}">\u25cf low</span><span style="color:${C.warn}">\u25cf mid</span><span style="color:${C.crit}">\u25cf high</span></div></div></div>`;
}

function pagePatient(id){
  const p=byId(id);const m=$('#main');
  if(!p){m.innerHTML='<div class="card">Patient not found. <a href="#/patients" style="color:var(--acc)">Back to list</a></div>';return}
  m.innerHTML=`<a class="back" href="#/patients">\u2190 All patients</a>
  <div class="card" style="margin-bottom:16px;--c:${STC[p.status]}"><div class="phead"><div class="avatar" style="width:60px;height:60px;font-size:20px">${ini(p.name)}</div>
   <div><h2>${p.name}</h2><div class="meta" style="margin-top:6px"><div>Patient ID<b>#${p.id}</b></div><div>Bed<b>${p.bed}</b></div><div>Age / Sex<b>${p.age} / ${p.sex}</b></div><div>Diagnosis<b>${p.dx}</b></div><div>Physician<b>${p.doctor}</b></div><div>Day in ICU<b>${p.adm}</b></div></div></div>
   <div class="big-status">${p.status.toUpperCase()}<div style="font-size:11px;font-weight:500;letter-spacing:0;opacity:.8">status set by staff</div></div></div></div>
  <div class="grid g4" id="vit" style="margin-bottom:16px"></div>
  <div class="grid" style="grid-template-columns:1.6fr 1fr;margin-bottom:16px">
    <div class="card"><h3>ECG &middot; lead II<span class="r" id="ecgr"></span></h3><canvas id="ecg" width="900" height="170"></canvas><div class="note" id="arr"></div></div>
    <div class="card"><h3>Ventilation &amp; respiratory support</h3><div class="kv" id="resp"></div></div>
  </div>
  <div class="grid g2" style="margin-bottom:16px" id="trends"></div>
  <div class="grid g3" style="margin-bottom:16px">
    <div class="card"><h3>Neurological / condition</h3><div class="kv" id="neuro"></div></div>
    <div class="card"><h3>Fluid &amp; metabolic</h3><div class="kv" id="fluid"></div><div style="margin-top:14px"><div style="display:flex;justify-content:space-between;font-size:12px;color:var(--mut);margin-bottom:6px"><span>Input</span><span id="fi"></span></div><div class="bar"><i id="fib" style="background:${C.imp}"></i></div><div style="display:flex;justify-content:space-between;font-size:12px;color:var(--mut);margin:10px 0 6px"><span>Output</span><span id="fo"></span></div><div class="bar"><i id="fob" style="background:${C.warn}"></i></div></div></div>
    <div class="card"><h3>Devices<span class="r" id="devr"></span></h3><div class="dev" id="devs"></div></div>
  </div>
  <div class="grid" style="grid-template-columns:1.6fr 1fr">
    <div class="card"><h3>Smart bed<span class="r">live</span></h3><div class="grid" style="grid-template-columns:1.3fr 1fr;gap:20px"><div id="bed"></div><div class="kv" id="bedkv"></div></div></div>
    <div class="card"><h3>Alerts for this patient</h3><div class="feed" id="palerts"></div></div>
  </div>`;
  const t=(k,l,u,dec=0)=>{const v=k==='gcs'||k==='pain'?p[k]:p.v[k];return{k,l,u,v,dec}};
  updater=()=>{
    const vs=[['hr','Heart rate','BPM',p.v.hr,0],['spo2','SpO\u2082','%',p.v.spo2,0],['rr','Resp. rate','/min',p.v.rr,0],['sys','Blood pressure','mmHg',p.v.sys,0],['map','MAP','mmHg',map(p),0],['temp','Temperature','\u00b0C',p.v.temp,1],['gcs','GCS','/15',p.gcs,0],['pain','Pain score','/10',p.pain,0]];
    $('#vit').innerHTML=vs.map(x=>{const k=x[0];let st=k==='map'?(x[3]<65?'crit':x[3]<70?'warn':''):k==='pain'?(x[3]>=7?'crit':x[3]>=5?'warn':''):vstate(k,x[3]);
      const val=k==='sys'?Math.round(p.v.sys)+'/'+Math.round(p.v.dia):x[3].toFixed(x[4]);
      const hk=p.h[k]?p.h[k].slice(-30):null;
      return `<div class="vit ${st}"><small>${x[1]}</small><div><span class="n">${val}</span><span class="u">${x[2]}</span></div>${hk?`<div class="sp2">${spark(hk,st==='crit'?C.crit:st==='warn'?C.warn:C.acc,80,28)}</div>`:''}</div>`}).join('');
    const hrv=Math.round(p.v.hr);
    $('#ecgr').textContent=hrv+' BPM';
    $('#arr').innerHTML=hrv>130?'<span class="flag">TACHYCARDIA</span>':hrv<50?'<span class="flag">BRADYCARDIA</span>':'<span style="color:var(--ok)">\u25cf Sinus rhythm (simulated waveform)</span>';
    $('#resp').innerHTML=`<div><span>Ventilator</span><b class="${p.vent?'':'ok'}">${p.vent?'ON':'OFF'}</b></div><div><span>Mode</span><b>${p.vent?p.vm:'\u2014'}</b></div><div><span>Oxygen flow</span><b>${p.o2?p.flow+' L/min':'\u2014'}</b></div><div><span>FiO\u2082</span><b>${p.o2?p.fio2+' %':'21 %'}</b></div><div><span>Peak airway pressure</span><b>${p.vent?p.peak+' cmH\u2082O':'\u2014'}</b></div><div><span>EtCO\u2082</span><b>${p.vent?Math.round(34+p.v.rr/6)+' mmHg':'\u2014'}</b></div>`;
    const tr=(name,key,color,mn,mx,bands,unit,fmt)=>`<div class="card"><h3>${name}<span class="r">last ${p.h[key].length*2>>0} s</span></h3>${line({series:[{data:p.h[key],color}],min:mn,max:mx,bands,h:190,fmt})}</div>`;
    $('#trends').innerHTML=tr('Heart rate (BPM)','hr',C.crit,40,150,[[60,100,C.ok]])+tr('SpO\u2082 (%)','spo2',C.imp,84,100,[[94,100,C.ok]])+tr('Temperature (\u00b0C)','temp',C.warn,35.5,40,[[36.1,37.5,C.ok]],'',v=>v.toFixed(1))+
      `<div class="card"><h3>Blood pressure (mmHg)<span class="r">sys / dia</span></h3>${line({series:[{data:p.h.sys,color:C.vio},{data:p.h.dia,color:C.acc}],min:40,max:150,h:190})}</div>`;
    const conc=p.gcs>=14?'Alert':p.gcs>=10?'Drowsy / confused':'Reduced consciousness';
    $('#neuro').innerHTML=`<div><span>Consciousness</span><b class="${vcls('gcs',p.gcs)}">${conc}</b></div><div><span>GCS</span><b class="${vcls('gcs',p.gcs)}">${p.gcs}/15</b></div><div><span>Pain score</span><b>${p.pain}/10</b></div><div><span>Altered mental status</span><b>${p.gcs<13?'Yes':'No'}</b></div><div><span>Fall detected</span><b>No</b></div><div><span>Seizure / movement alert</span><b>None</b></div><div><span>Fall risk</span><b class="${p.fallRisk==='High'?'crit':''}">${p.fallRisk}</b></div>`;
    const net=p.fin-p.fout;
    $('#fluid').innerHTML=`<div><span>Urine output</span><b class="${p.urine<30?'warn':''}">${Math.round(p.urine)} mL/h</b></div><div><span>Net balance (24h)</span><b>${net>0?'+':''}${net} mL</b></div><div><span>Glucose</span><b class="${p.glu>180?'warn':''}">${p.glu} mg/dL</b></div><div><span>Lactate</span><b class="${p.lac>2?'warn':''}">${p.lac} mmol/L</b></div><div><span>Blood pH</span><b>${p.ph}</b></div><div><span>Body weight</span><b>${p.weight} kg</b></div>`;
    $('#fi').textContent=p.fin+' mL';$('#fo').textContent=p.fout+' mL';$('#fib').style.width=p.fin/40+'%';$('#fob').style.width=p.fout/40+'%';
    const bad=p.devs.filter(d=>d.state!=='online').length;
    $('#devr').innerHTML=bad?`<span class="warn">${bad} issue${bad>1?'s':''}</span>`:'<span style="color:var(--ok)">all online</span>';
    $('#devs').innerHTML=p.devs.map(d=>`<div class="${d.state!=='online'?'off':''}"><span class="s ${d.state==='error'?'err':d.state==='offline'?'off':''}"></span>${d.n}<em>${d.state==='online'?d.batt+'% &middot; '+(d.last)+'s ago':d.state==='error'?'ERROR':'OFFLINE '+mmss(d.last)}</em></div>`).join('');
    $('#bed').innerHTML=bedSVG(p);
    $('#bedkv').innerHTML=`<div><span>Weight</span><b>${p.weight} kg</b></div><div><span>Position</span><b>${p.pos}</b></div><div><span>Time in position</span><b class="${p.posSec>7200?'warn':''}">${dur(p.posSec)}</b></div><div><span>Movement</span><b>${p.move}</b></div><div><span>Pressure-ulcer risk</span><b class="${p.pr==='High'?'crit':p.pr==='Moderate'?'warn':''}">${p.pr}</b></div><div><span>Head / leg angle</span><b>${p.head}\u00b0 / ${p.leg}\u00b0</b></div><div><span>Mattress pressure</span><b class="${p.mat!=='Normal'?'warn':''}">${p.mat}</b></div><div><span>Bed exit</span><b class="${p.bedExit?'crit':''}">${p.bedExit?'YES':'No'}</b></div><div><span>Emergency button</span><b>Not pressed</b></div>`;
    const pa=alerts.filter(a=>a.pid===p.id);
    $('#palerts').innerHTML=(pa.length?pa:[{type:'No alerts',sev:'i',state:'clear',ago:0}]).map(a=>{const tt=new Date(Date.now()-a.ago*60000);return `<div class="row sev-${a.sev}"><time>${pad(tt.getHours())}:${pad(tt.getMinutes())}</time><span class="tag"></span><div class="grow">${a.type}<br><small>${SEV[a.sev][0]} &middot; ${a.state}</small></div></div>`}).join('')
      +(p.bedExit?`<div class="row sev-c"><time>now</time><span class="tag"></span><div class="grow">Patient left bed<br><small>Critical &middot; active</small></div></div>`:'');
  };
  updater();
  /* ECG animation */
  const cv=$('#ecg'),cx=cv.getContext('2d'),W=cv.width,H=cv.height,buf=new Array(W).fill(H/2);let pos=0,tm=0,raf;
  const g=(x,c,w)=>Math.exp(-((x-c)**2)/(2*w*w));
  function sample(hr){const per=60/hr,ph=(tm%per)/per;return .12*g(ph,.18,.03)-.12*g(ph,.36,.008)+1.0*g(ph,.4,.009)-.22*g(ph,.44,.009)+.28*g(ph,.68,.045)+(Math.random()-.5)*.02}
  function frame(){
    for(let i=0;i<3;i++){tm+=1/110;buf[pos]=H*.7-sample(p.v.hr)*H*.5;pos=(pos+1)%W}
    cx.fillStyle='#f8fbff';cx.fillRect(0,0,W,H);
    cx.strokeStyle='#e2eaf5';cx.lineWidth=1;for(let x=0;x<W;x+=30){cx.beginPath();cx.moveTo(x,0);cx.lineTo(x,H);cx.stroke()}for(let y=0;y<H;y+=30){cx.beginPath();cx.moveTo(0,y);cx.lineTo(W,y);cx.stroke()}
    cx.strokeStyle=C.ok;cx.lineWidth=2;cx.lineJoin='round';cx.beginPath();let started=false;
    for(let i=0;i<W;i++){if(((i-pos+W)%W)<24)continue;if(!started||i===pos){cx.moveTo(i,buf[i]);started=true}else cx.lineTo(i,buf[i])}
    cx.stroke();raf=requestAnimationFrame(frame);
  }
  for(let i=0;i<W;i++){tm+=1/110;buf[pos]=H*.7-sample(p.v.hr)*H*.5;pos=(pos+1)%W}
  frame();ecgStop=()=>cancelAnimationFrame(raf);
}

function pageAlerts(){
  const s=stats(),m=$('#main');
  m.innerHTML=header('Alerts','Active and historical alerts &middot; response statistics')+`
  <div class="grid g4" style="margin-bottom:16px">
   ${[['Active alerts',s.active,C.warn],['Critical active',s.critA,C.crit],['Acknowledged',s.ack,C.imp],['Resolved',s.res,C.ok]].map(x=>`<div class="card kpi" style="--c:${x[2]}"><div class="l">${x[0]}</div><div class="v">${x[1]}</div></div>`).join('')}
  </div>
  <div class="grid" style="grid-template-columns:1fr 2fr;margin-bottom:16px">
   <div class="card"><h3>Response time</h3>${gauge(Math.round(Math.max(5,100-s.avgResp/3)),C.acc)}<div style="text-align:center;margin-top:8px"><div style="font-size:26px;font-weight:800">${mmss(s.avgResp)}</div><div style="color:var(--mut);font-size:12px">avg. alert created \u2192 acknowledged</div></div></div>
   <div class="card"><h3>Alerts per day<span class="r">last 7 days</span></h3>${bars({labels:days,series:[{data:ALR7,colors:ALR7.map(v=>v>35?C.crit:v>25?C.warn:C.imp)}],h:200})}</div>
  </div>
  <div class="card" style="padding:6px 8px"><div class="tw"><table><thead><tr><th>Time</th><th>Severity</th><th>Patient</th><th>Alert</th><th>State</th><th>Response</th></tr></thead><tbody>
  ${alerts.map(a=>{const p=byId(a.pid),t=new Date(Date.now()-a.ago*60000);return `<tr onclick="location.hash='#/patient/${a.pid}'"><td>${pad(t.getHours())}:${pad(t.getMinutes())}</td><td><span class="pill" style="--c:${SEV[a.sev][1]}"><i></i>${SEV[a.sev][0].toUpperCase()}</span></td><td>#${p.id} ${p.name} <small style="color:var(--dim)">${p.bed}</small></td><td>${a.type}</td><td>${a.state==='active'?'<span class="crit">\u25cf active</span>':a.state==='ack'?'<span style="color:var(--imp)">acknowledged</span>':'<span style="color:var(--ok)">resolved</span>'}</td><td>${a.resp?mmss(a.resp):'\u2014'}</td></tr>`}).join('')}
  </tbody></table></div></div>`;
  updater=null;
}

function pageDevices(){
  const s=stats(),m=$('#main');
  const rows=patients.flatMap(p=>p.devs.map(d=>({p,d}))).sort((a,b)=>{const r=x=>x.d.state==='online'?(x.d.batt<20?1:2):0;return r(a)-r(b)});
  m.innerHTML=header('Devices','Health of the IoT sensors and gateways &middot; computed from heartbeats / last-seen timestamps')+`
  <div class="grid g4" style="margin-bottom:16px">
   ${[['Total devices',s.devs,C.acc],['Online',s.online,C.ok],['Offline / error',s.offline+s.err,C.crit],['Low battery',s.low,C.warn]].map(x=>`<div class="card kpi" style="--c:${x[2]}"><div class="l">${x[0]}</div><div class="v">${x[1]}</div></div>`).join('')}
  </div>
  <div class="grid" style="grid-template-columns:1fr 2fr;margin-bottom:16px">
   <div class="card"><h3>Availability</h3><div style="display:flex;justify-content:center">${donut([{v:s.online,c:C.ok},{v:s.offline,c:C.crit},{v:s.err,c:C.warn}],190,[Math.round(s.online/s.devs*100)+'%','ONLINE'])}</div></div>
   <div class="card"><h3>Gateway / ESP32 nodes</h3><div class="grid g2" style="gap:10px">${['ESP32-Gateway-A (Beds 1\u201312)','ESP32-Gateway-B (Beds 13\u201324)','Edge server','MQTT broker'].map((n,i)=>`<div class="dev"><div><span class="s ${i===1?'err':''}"></span>${n}<em>${i===1?'high latency':'connected'}</em></div></div>`).join('')}</div><div class="note">Each patient bed reports MAX30102, MLX90614, ECG, load cells and camera through its gateway.</div></div>
  </div>
  <div class="card" style="padding:6px 8px"><div class="tw"><table><thead><tr><th>Bed</th><th>Patient</th><th>Device</th><th>Status</th><th>Battery</th><th>Last communication</th></tr></thead><tbody>
  ${rows.slice(0,40).map(({p,d})=>`<tr onclick="location.hash='#/patient/${p.id}'"><td>${p.bed}</td><td>#${p.id} ${p.name}</td><td>${d.n}</td><td>${d.state==='online'?'<span style="color:var(--ok)">\u25cf Online</span>':d.state==='error'?'<span class="warn">\u25cf Error</span>':'<span class="crit">\u25cf Offline</span>'}</td><td style="min-width:130px"><div class="bar"><i style="width:${d.batt}%;background:${d.batt<20?C.crit:d.batt<50?C.warn:C.ok}"></i></div><small style="color:var(--mut)">${d.batt}%</small></td><td>${d.state==='online'?d.last+' s ago':mmss(d.last)+' ago'}</td></tr>`).join('')}
  </tbody></table></div><div class="note" style="padding:0 12px 10px">Showing the 40 devices that most need attention.</div></div>`;
  updater=null;
}

/* ============ router & live simulation ============ */
function route(){
  if(ecgStop){ecgStop();ecgStop=null}
  const h=(location.hash||'#/dashboard').slice(2).split('/');
  setNav(h[0]==='patient'?'patients':h[0]);
  window.scrollTo(0,0);
  ({dashboard:pageDashboard,patients:pagePatients,alerts:pageAlerts,devices:pageDevices,patient:()=>pagePatient(h[1])}[h[0]]||pageDashboard)();
  tickClock();
}
function tickClock(){const c=$('#clk');if(c)c.textContent=new Date().toLocaleTimeString('en-GB')}
function simulate(){
  patients.forEach(p=>{
    const b=BASE[p.status],w=(k,a,bnd,d)=>{p.v[k]=clamp(p.v[k]+rr(-a,a)+(((bnd[0]+bnd[1])/2)-p.v[k])*.03,bnd[0]-d,bnd[1]+d);};
    w('hr',2.2,b.hr,p.id===109?40:6);w('spo2',.5,b.spo2,2);w('rr',.9,b.rr,2);w('sys',1.8,b.sys,5);w('dia',1.2,b.dia,4);w('temp',.03,b.temp,p.id===113?1:.3);
    if(p.id===109)p.v.hr=clamp(p.v.hr,118,140);
    if(p.id===113)p.v.temp=clamp(p.v.temp,38.3,39);
    p.v.spo2=Math.min(100,p.v.spo2);
    for(const k in p.h){p.h[k].push(p.v[k]);p.h[k].shift()}
    p.posSec+=2;p.urine=clamp(p.urine+rr(-2,2),12,120);
    p.devs.forEach(d=>{if(d.state==='online')d.last=ri(1,4);else d.last+=2});
  });
}
setInterval(()=>{simulate();tickClock();$('#nb').textContent=alerts.filter(a=>a.state==='active').length;if(updater)updater()},2000);
setInterval(tickClock,1000);
window.addEventListener('hashchange',route);
route();
