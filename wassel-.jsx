import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ShoppingBag, Truck, CreditCard, Wallet, Banknote, Smartphone, Bitcoin,
  Copy, Check, ArrowRight, Sparkles, MapPin, Clock, Gift, Users, Star,
  X, Loader2, ShieldCheck, Info, RotateCcw, Heart, MessageCircle, Send,
  Flame, TrendingUp, BadgePercent, ChevronRight, Package,
} from 'lucide-react';

const TND_PER_EUR = 4.8;

const PLATFORMS = {
  shein: {
    label: 'Shein', accent: '#E0577A',
    items: [
      { name: 'Oversized Knit Cardigan', cat: 'clothing', price: [14, 22], weight: [0.30, 0.45], sizes: ['S','M','L','XL'] },
      { name: 'High-Waist Wide Leg Jeans', cat: 'clothing', price: [18, 28], weight: [0.40, 0.60], sizes: ['XS','S','M','L'] },
      { name: 'Chunky Platform Sneakers', cat: 'shoes', price: [26, 38], weight: [0.80, 1.10], sizes: ['37','38','39','40'] },
      { name: 'Gold-Plated Layered Necklace', cat: 'accessory', price: [5, 9], weight: [0.05, 0.08] },
      { name: 'Faux Leather Crossbody Bag', cat: 'bag', price: [16, 24], weight: [0.35, 0.50], colors: ['Black','Tan','Red'] },
      { name: 'Ribbed Tank Top 3-Pack', cat: 'clothing', price: [9, 14], weight: [0.15, 0.20], sizes: ['S','M','L'] },
      { name: 'Satin Slip Dress', cat: 'clothing', price: [15, 23], weight: [0.20, 0.30], colors: ['Emerald','Black','Champagne'] },
    ],
  },
  temu: {
    label: 'Temu', accent: '#E2A53A',
    items: [
      { name: 'Mini LED Desk Lamp', cat: 'home', price: [8, 13], weight: [0.30, 0.50] },
      { name: 'Silicone Phone Case', cat: 'tech', price: [3, 6], weight: [0.05, 0.10], colors: ['Clear','Black','Pink'] },
      { name: 'Stainless Steel Tumbler 500ml', cat: 'home', price: [7, 11], weight: [0.25, 0.35] },
      { name: 'Mini Hand Blender', cat: 'home', price: [10, 16], weight: [0.40, 0.60] },
      { name: 'Press-On Nail Set', cat: 'beauty', price: [4, 7], weight: [0.05, 0.07] },
      { name: 'Wireless Earbuds Case Skin', cat: 'tech', price: [3, 5], weight: [0.03, 0.05] },
      { name: 'Cat-Ear Hair Clip Set', cat: 'accessory', price: [2, 4], weight: [0.02, 0.04] },
    ],
  },
  aliexpress: {
    label: 'AliExpress', accent: '#3A8DE2',
    items: [
      { name: 'USB-C Fast Charger 65W', cat: 'tech', price: [12, 19], weight: [0.20, 0.30] },
      { name: 'Mechanical Switch Set (x10)', cat: 'tech', price: [6, 10], weight: [0.10, 0.15] },
      { name: 'Car Phone Mount', cat: 'tech', price: [5, 9], weight: [0.15, 0.25] },
      { name: 'Smart Watch Band', cat: 'accessory', price: [4, 8], weight: [0.04, 0.08], colors: ['Black','Blue','Green'] },
      { name: 'Mini Tripod Stand', cat: 'tech', price: [7, 12], weight: [0.20, 0.30] },
      { name: 'LED Strip Lights 5m', cat: 'home', price: [9, 15], weight: [0.30, 0.40] },
    ],
  },
};

const PX = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=480&h=480&fit=crop`;

const CAT_IMG = {
  clothing: PX(8408556),
  shoes: PX(20298286),
  accessory: PX(25096378),
  bag: PX(1214212),
  tech: PX(33298188),
  home: PX(3737800),
  beauty: PX(31552021),
};

const PAY_METHODS = [
  { id:'card', label:'Credit / Debit Card', icon: CreditCard },
  { id:'paypal', label:'PayPal', icon: Wallet },
  { id:'bank', label:'Local Bank Transfer', icon: Banknote },
  { id:'cod', label:'Cash on Delivery', icon: Truck, note:'where available' },
  { id:'mobile', label:'Mobile Wallet', icon: Smartphone },
  { id:'crypto', label:'Cryptocurrency', icon: Bitcoin, note:'optional' },
];

const TRACK_STAGES = ['Ordered','Processing','Shipped','Customs','Out for delivery','Delivered'];

const ORIGIN_BY_PLATFORM = {
  shein: 'Guangzhou, China',
  temu: 'Shenzhen, China',
  aliexpress: 'Hangzhou, China',
};
const DEST_CITY = 'Tunis, Tunisia';
// route waypoints as % position along the map path, one per TRACK_STAGES index
const ROUTE_POINTS = [
  { x: 14, y: 30 },  // Ordered — origin warehouse
  { x: 14, y: 30 },  // Processing — still origin
  { x: 38, y: 18 },  // Shipped — in transit, air/sea hub
  { x: 62, y: 46 },  // Customs — regional hub
  { x: 82, y: 58 },  // Out for delivery — local depot
  { x: 90, y: 64 },  // Delivered — destination
];
const STAGE_CITY = (platform, i) => {
  if (i === 0) return ORIGIN_BY_PLATFORM[platform] || 'Origin warehouse';
  if (i === 1) return ORIGIN_BY_PLATFORM[platform] || 'Origin warehouse';
  if (i === 2) return 'International transit hub';
  if (i === 3) return 'Tunis customs facility';
  if (i === 4) return 'Local delivery depot, Tunis';
  return DEST_CITY;
};
const VIP = [{ name:'Bronze', min:0 },{ name:'Silver', min:500 },{ name:'Gold', min:2000 },{ name:'Platinum', min:5000 }];
const SCAN = ['Reading your link','Detecting platform','Scanning cart items','Estimating weight','Calculating shipping & customs'];
const STEPS = ['input','scanning','manifest','ticket','payment','confirmed'];

const TODAY = new Date('2026-06-29T09:00:00');

const SAMPLES = {
  shein:'https://shein.com/cart?ref=demo-92f1',
  temu:'https://temu.com/cart?share=demo-71ac',
  aliexpress:'https://aliexpress.com/cart?token=demo-30bd',
};

const STORE = [
  { id:'s1', name:'Oversized Hoodie', cat:'clothing', cost:850, img:PX(8159428) },
  { id:'s2', name:'Canvas Tote Bag', cat:'bag', cost:400, img:PX(3735146) },
  { id:'s3', name:'Leather Crossbody Bag', cat:'bag', cost:900, img:PX(157888) },
  { id:'s4', name:'Silk Scarf', cat:'accessory', cost:250, img:PX(3944690) },
  { id:'s5', name:'Sunglasses', cat:'accessory', cost:500, img:PX(25096378) },
  { id:'s6', name:'Canvas Sneakers', cat:'shoes', cost:1100, img:PX(20298286) },
  { id:'s7', name:'Wireless Earbuds', cat:'tech', cost:1200, img:PX(33298188) },
  { id:'s8', name:'Skincare Gift Set', cat:'beauty', cost:600, img:PX(31552021) },
  { id:'s9', name:'Wassel Tumbler', cat:'home', cost:300, img:PX(3737800) },
  { id:'s10', name:'Graphic T-Shirt', cat:'clothing', cost:350, img:PX(8408556) },
  { id:'s11', name:'Free Shipping Coupon', cat:'coupon', cost:150, img:null },
  { id:'s12', name:'10 TND Discount', cat:'coupon', cost:1000, img:null },
];

const STORE_CATS = [
  { id:'all', label:'All' },{ id:'clothing', label:'Clothing' },{ id:'bag', label:'Bags' },
  { id:'accessory', label:'Accessories' },{ id:'shoes', label:'Shoes' },
  { id:'tech', label:'Tech' },{ id:'beauty', label:'Beauty' },{ id:'coupon', label:'Coupons' },
];

const AI_SUGGESTIONS = [
  'Why is my customs estimate non-zero?',
  'How do I earn more loyalty points?',
  'What can I buy with points in the store?',
  'Standard vs express — what changes?',
];

const MOCK_REFS = [
  { name:'Salma B.', status:'ordered', pts:200 },
  { name:'Karim T.', status:'joined', pts:0 },
  { name:'Ines M.', status:'ordered', pts:200 },
];

/* ── helpers ─────────────────────────────────────────── */
function hashSeed(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng32(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5)|0;
    let t = Math.imul(a^(a>>>15), 1|a);
    t = (t+Math.imul(t^(t>>>7),61|t))^t;
    return ((t^(t>>>14))>>>0)/4294967296;
  };
}
function pick(r, arr) { return arr[Math.floor(r()*arr.length)]; }
function rv(r, pair) { return pair[0]+r()*(pair[1]-pair[0]); }
function eur(n) { return `€${n.toFixed(2)}`; }
function tnd(n) { return `${n.toFixed(2)} TND`; }
function detectP(url) {
  const u = url.toLowerCase();
  if (u.includes('shein')) return 'shein';
  if (u.includes('temu')) return 'temu';
  if (u.includes('aliexpress')||u.includes('ali-express')) return 'aliexpress';
  return null;
}
function shipping(pKey, wKg, r) {
  const base = {shein:4,temu:3,aliexpress:3.5}[pKey]??3.5;
  const pkg  = {shein:3.2,temu:2.6,aliexpress:2.9}[pKey]??3;
  const dr   = {shein:{s:[9,16],e:[4,7]},temu:{s:[11,20],e:[5,9]},aliexpress:{s:[14,24],e:[6,10]}}[pKey]??{s:[12,20],e:[5,9]};
  const sc = base+pkg*wKg;
  const ec = sc*1.65;
  const sd = dr.s[0]+Math.floor(r()*(dr.s[1]-dr.s[0]+1));
  const ed = dr.e[0]+Math.floor(r()*(dr.e[1]-dr.e[0]+1));
  return { standard:{costEUR:sc,days:sd}, express:{costEUR:ec,days:ed} };
}
function customs(subEUR) {
  const subTND = subEUR*TND_PER_EUR;
  if (subTND<=200) return 0;
  return ((subTND-200)*0.25)/TND_PER_EUR;
}
function sparkPts(r, base) {
  const pts=[]; let v=base*(0.85+r()*0.15);
  for(let i=0;i<9;i++){v+=(r()-0.5)*base*0.06;pts.push(Math.max(base*0.55,v));}
  pts.push(base); return pts;
}
function analyse(url) {
  const seed=hashSeed(url); const r=rng32(seed);
  const pKey=detectP(url)||pick(r,['shein','temu','aliexpress']);
  const cat=PLATFORMS[pKey]; const pool=[...cat.items];
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  const count=2+Math.floor(r()*4); const chosen=pool.slice(0,count);
  let subEUR=0, wKg=0;
  const items=chosen.map((b,idx)=>{
    const up=Math.round(rv(r,b.price)*100)/100;
    const uw=Math.round(rv(r,b.weight)*1000)/1000;
    const qty=1+Math.floor(r()*3);
    const size=b.sizes?pick(r,b.sizes):null;
    const color=b.colors?pick(r,b.colors):null;
    subEUR+=up*qty; wKg+=uw*qty;
    return {id:`i${idx}`,name:b.name,cat:b.cat,up,uw,qty,size,color,lineEUR:up*qty,spark:sparkPts(r,up)};
  });
  const dr=r();
  const discount=dr<0.18?{type:'freeShipping',label:'Free shipping promo detected'}
    :dr<0.42?{type:'pct',pct:8+Math.floor(r()*12),label:r()<0.5?'Flash sale detected':'Bundle discount detected'}
    :null;
  const ship=shipping(pKey,wKg,r);
  const custEUR=customs(subEUR);
  const svcEUR=subEUR*0.045+1.5;
  return {pKey,platform:cat.label,accent:cat.accent,items,subEUR,wKg,discount,ship,custEUR,svcEUR,seed};
}
function totals(a, speed) {
  let sEUR=a.ship[speed].costEUR; const days=a.ship[speed].days; let dEUR=0;
  if(a.discount){
    if(a.discount.type==='freeShipping'){dEUR=sEUR;sEUR=0;}
    else dEUR=a.subEUR*(a.discount.pct/100);
  }
  const fEUR=a.subEUR-dEUR+sEUR+a.custEUR+a.svcEUR;
  const fTND=fEUR*TND_PER_EUR;
  const pts=Math.max(0,Math.round(fTND));
  const eta=new Date(TODAY); eta.setDate(eta.getDate()+days);
  return {subEUR:a.subEUR,dEUR,sEUR,custEUR:a.custEUR,svcEUR:a.svcEUR,fEUR,fTND,days,eta,pts};
}
function waybill(seed,bump){
  const n=(((seed+bump*7919)%900000)+900000)%900000+100000;
  return `TN-${n}`;
}
function tierFor(s){
  let cur=VIP[0];
  for(let i=0;i<VIP.length;i++) if(s>=VIP[i].min) cur=VIP[i];
  const idx=VIP.findIndex(t=>t.name===cur.name);
  return {cur, next:VIP[idx+1]||null};
}

/* ── tiny components ─────────────────────────────────── */
function Spark({pts}) {
  const w=56,h=18;
  const mn=Math.min(...pts),mx=Math.max(...pts),sp=mx-mn||1;
  const d=pts.map((p,i)=>{
    const x=(i/(pts.length-1))*w;
    const y=h-((p-mn)/sp)*h;
    return `${i===0?'M':'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return(
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={d} fill="none" stroke={pts[pts.length-1]>=pts[0]?'#0E6B4F':'#C9707A'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function Dots({cur}) {
  const idx=STEPS.indexOf(cur);
  return(
    <div className="dots-row">
      {STEPS.map((s,i)=>(
        <div key={s} className={`dot ${i<idx?'done':''} ${i===idx?'active':''}`}/>
      ))}
    </div>
  );
}
function Chip({children,active,onClick}) {
  return <button type="button" className={`chip ${active?'chip-on':''}`} onClick={onClick}>{children}</button>;
}
function Img({src,alt,className}) {
  const [err,setErr]=useState(false);
  if(!src||err) return <div className={className} style={{background:'#E7F1EC'}}/>;
  return <img src={src} alt={alt} className={className} onError={()=>setErr(true)} loading="lazy"/>;
}
function CostRow({label,sub,eur:e,tndV,muted,accent}) {
  return(
    <div className="cost-row">
      <div className="cost-lbl">{label}{sub&&<span className="cost-sub">{sub}</span>}</div>
      <div className={`cost-vals ${muted?'muted':''} ${accent?'accent':''}`}>
        <div className="cv-tnd">{tnd(tndV)}</div>
        <div className="cv-eur">{eur(e)}</div>
      </div>
    </div>
  );
}

function ShipmentMap({ platform, stage, eta }) {
  const pos = ROUTE_POINTS[Math.min(stage, ROUTE_POINTS.length - 1)];
  const city = STAGE_CITY(platform, Math.min(stage, ROUTE_POINTS.length - 1));
  const pathD = `M ${ROUTE_POINTS[0].x} ${ROUTE_POINTS[0].y} ` +
    ROUTE_POINTS.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
  const travelledD = `M ${ROUTE_POINTS[0].x} ${ROUTE_POINTS[0].y} ` +
    ROUTE_POINTS.slice(1, stage + 1).map(p => `L ${p.x} ${p.y}`).join(' ');
  const today = new Date(TODAY);
  const daysLeft = Math.max(0, Math.ceil((eta - today) / 86400000));

  return (
    <div className="shipmap-card">
      <div className="shipmap-top">
        <div>
          <div className="fl">Current location</div>
          <div className="shipmap-city"><MapPin size={15}/> {city}</div>
        </div>
        <div className="shipmap-eta">
          <div className="fl" style={{textAlign:'right'}}>Estimated arrival</div>
          <div className="shipmap-eta-date">{eta.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</div>
          <div className="ty" style={{textAlign:'right'}}>{daysLeft===0?'Arriving today':`${daysLeft} day${daysLeft===1?'':'s'} left`}</div>
        </div>
      </div>

      <svg viewBox="0 0 100 80" className="shipmap-svg" preserveAspectRatio="none">
        <path d={pathD} fill="none" stroke="var(--ln)" strokeWidth="1.2" strokeDasharray="2.2 2.2" strokeLinecap="round"/>
        <path d={travelledD} fill="none" stroke="var(--gr)" strokeWidth="1.4" strokeLinecap="round"/>
        {ROUTE_POINTS.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i<=stage?1.6:1.2}
            fill={i<stage?'var(--gr)':i===stage?'var(--go)':'var(--ln)'}
            stroke="#fff" strokeWidth="0.5" />
        ))}
        <g transform={`translate(${pos.x} ${pos.y})`}>
          <circle r="3.2" fill="var(--go)" opacity="0.22">
            <animate attributeName="r" values="3.2;5.2;3.2" dur="1.8s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.3;0.05;0.3" dur="1.8s" repeatCount="indefinite"/>
          </circle>
          <circle r="1.9" fill="var(--go)" stroke="#fff" strokeWidth="0.6"/>
        </g>
      </svg>

      <div className="shipmap-route-labels">
        <span><Package size={11}/> {ORIGIN_BY_PLATFORM[platform] || 'Origin'}</span>
        <span>{DEST_CITY} <MapPin size={11}/></span>
      </div>
    </div>
  );
}


export default function App() {
  const [acc,setAcc]=useState(null);
  const [gName,setGName]=useState(''); const [gEmail,setGEmail]=useState(''); const [gErr,setGErr]=useState('');
  const [page,setPage]=useState('calc');
  const [step,setStep]=useState('input');
  const [link,setLink]=useState(''); const [speed,setSpeed]=useState('standard');
  const [ana,setAna]=useState(null); const [err,setErr]=useState('');
  const [scanIdx,setScanIdx]=useState(0); const [stamped,setStamped]=useState(false);
  const [pay,setPay]=useState(null); const [order,setOrder]=useState(null);
  const [track,setTrack]=useState(0); const [ptDisp,setPtDisp]=useState(0);
  const [copied,setCopied]=useState(false);
  const [drawer,setDrawer]=useState(false);
  const [spendTND,setSpendTND]=useState(0); const [pts,setPts]=useState(0); const [savTND,setSavTND]=useState(0);
  const [orders,setOrders]=useState([]);
  const [streak,setStreak]=useState(3); const [dayClaimed,setDayClaimed]=useState(false);
  const [wish,setWish]=useState([]);
  const [prefs,setPrefs]=useState({alerts:true,promos:false});
  const [redeemed,setRedeemed]=useState([]); const [storeFilter,setStoreFilter]=useState('all'); const [redMsg,setRedMsg]=useState('');
  const [chatOpen,setChatOpen]=useState(false); const [msgs,setMsgs]=useState([]); const [chatIn,setChatIn]=useState(''); const [chatLoad,setChatLoad]=useState(false);
  const chatRef=useRef(null);

  const T=useMemo(()=>ana?totals(ana,speed):null,[ana,speed]);
  const tier=tierFor(spendTND);
  const tierPct=tier.next?Math.min(100,((spendTND-tier.cur.min)/(tier.next.min-tier.cur.min))*100):100;
  const refLink=`wassel.app/r/${acc?acc.name.split(' ')[0].toLowerCase():'demo'}-${(ana?ana.seed:1234)%10000}`;

  useEffect(()=>{
    if(step!=='scanning') return;
    if(scanIdx>=SCAN.length){const r=analyse(link);setAna(r);const t=setTimeout(()=>setStep('manifest'),400);return()=>clearTimeout(t);}
    const t=setTimeout(()=>setScanIdx(i=>i+1),460);return()=>clearTimeout(t);
  },[step,scanIdx,link]);

  useEffect(()=>{
    if(step==='ticket'){setStamped(false);const t=setTimeout(()=>setStamped(true),550);return()=>clearTimeout(t);}
  },[step]);

  useEffect(()=>{
    if(step!=='confirmed'||!order) return;
    setPtDisp(0); const tgt=order.T.pts; const start=Date.now(); let raf;
    const tick=()=>{const p=Math.min(1,(Date.now()-start)/900);setPtDisp(Math.round(tgt*p));if(p<1)raf=requestAnimationFrame(tick);};
    raf=requestAnimationFrame(tick); return()=>cancelAnimationFrame(raf);
  },[step,order]);

  useEffect(()=>{
    if(step!=='confirmed') return;
    if(track>=2) return;
    const t=setTimeout(()=>setTrack(s=>s+1),3600);return()=>clearTimeout(t);
  },[step,track]);

  useEffect(()=>{if(chatRef.current)chatRef.current.scrollTop=chatRef.current.scrollHeight;},[msgs,chatLoad]);

  const doCreate=()=>{
    if(!gName.trim()){setGErr('Enter your name.');return;}
    if(!gEmail.includes('@')){setGErr('Enter a valid email.');return;}
    setGErr(''); setAcc({name:gName.trim(),email:gEmail.trim()}); setPts(50);
  };

  const doAnalyze=()=>{
    if(link.trim().length<5){setErr('Paste a Shein, Temu, or AliExpress cart link.');return;}
    setErr(''); setScanIdx(0); setStep('scanning');
  };

  const doCopy=()=>{
    try{navigator.clipboard.writeText(`https://${refLink}`);setCopied(true);setTimeout(()=>setCopied(false),1800);}
    catch{}
  };

  const doOrder=()=>{
    if(!ana||!T) return;
    const wb=waybill(ana.seed,orders.length);
    const tTND=Math.round(T.fTND);
    setOrder({waybill:wb,platform:ana.platform,T,speed});
    setOrders(p=>[{id:wb,platform:ana.platform,tTND,status:'Processing'},...p]);
    setSpendTND(s=>s+tTND); setPts(p=>p+T.pts); setSavTND(s=>s+Math.round(tTND*0.12));
    setTrack(0); setStep('confirmed');
  };

  const doReset=()=>{setStep('input');setLink('');setAna(null);setPay(null);setOrder(null);setErr('');setSpeed('standard');};

  const toggleWish=(e)=>setWish(p=>p.find(w=>w.id===e.id)?p.filter(w=>w.id!==e.id):[...p,e]);

  const doRedeem=(item)=>{
    if(pts<item.cost) return;
    setPts(p=>p-item.cost);
    setRedeemed(p=>[{id:`${item.id}-${Date.now()}`,name:item.name,cost:item.cost},...p]);
    setRedMsg(`Redeemed "${item.name}" for ${item.cost} pts!`);
    setTimeout(()=>setRedMsg(''),2600);
  };

  const doClaim=()=>{
    if(dayClaimed) return;
    setPts(p=>p+15); setStreak(s=>Math.min(7,s+1)); setDayClaimed(true);
  };

  const ctxSummary=()=>{
    const lines=[`Page: ${page}, step: ${step}.`];
    if(ana&&T) lines.push(`Cart: ${ana.platform}, ${ana.items.length} items, ${ana.wKg.toFixed(2)}kg. Final: ${tnd(T.fTND)} / ${eur(T.fEUR)}. Rate used: 1 EUR = ${TND_PER_EUR} TND (simulated).`);
    lines.push(`User: ${acc?.name||'guest'}, ${pts} points, ${spendTND} TND spent, VIP ${tier.cur.name}.`);
    if(order) lines.push(`Last order ${order.waybill}, stage: ${TRACK_STAGES[track]}.`);
    lines.push(`Store has ${STORE.length} items costing 150–1200 pts.`);
    return lines.join(' ');
  };

  const doChat=async(preset)=>{
    const text=(preset!==undefined?preset:chatIn).trim();
    if(!text||chatLoad) return;
    const h=[...msgs,{role:'user',content:text}];
    setMsgs(h); setChatIn(''); setChatLoad(true);
    try{
      const res=await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          model:'claude-sonnet-4-6',max_tokens:1000,
          system:`You are the in-app AI for Wassel, a Tunisia-focused cross-border shopping platform. Be concise (2-5 sentences), friendly, concrete. All prices, customs, shipping, and the exchange rate in this app are simulated demo data — say so if asked. Context: ${ctxSummary()}`,
          messages:h,
        }),
      });
      const d=await res.json();
      const reply=(d.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('\n').trim()||"Couldn't generate a reply — try again?";
      setMsgs(h=>[...h,{role:'assistant',content:reply}]);
    } catch {
      setMsgs(h=>[...h,{role:'assistant',content:"Couldn't reach the assistant. Try again in a moment."}]);
    } finally { setChatLoad(false); }
  };

  const storeFilt=storeFilter==='all'?STORE:STORE.filter(i=>i.cat===storeFilter);

  return (
    <div className="W">
    <style>{`
      *{box-sizing:border-box;margin:0;padding:0;}
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
      .W{
        --bg:#F7F5F0;--sur:#FFFFFF;--sur2:#EEE9DC;--ink:#1C201C;--soft:#6B7468;--ln:#E0D9CC;
        --gr:#0E6B4F;--grd:#0A5640;--grt:#E7F1EC;--go:#C9962B;--got:#FBF2DF;
        --rs:#C9707A;--bl:#3A8DE2;
        --s1:0 2px 8px rgba(0,0,0,.06);--s2:0 8px 24px rgba(0,0,0,.09);--s3:0 20px 50px rgba(0,0,0,.13);
        --fd:'Outfit',sans-serif;--fb:'Inter',-apple-system,sans-serif;--fm:'JetBrains Mono',monospace;
        background:
          radial-gradient(ellipse 900px 500px at 15% -5%, rgba(14,107,79,0.07), transparent 60%),
          radial-gradient(ellipse 700px 500px at 100% 10%, rgba(201,150,43,0.08), transparent 55%),
          var(--bg);
        color:var(--ink);font-family:var(--fb);min-height:100vh;padding-bottom:80px;
      }

      /* topbar */
      .topbar{display:flex;align-items:center;justify-content:space-between;padding:20px 24px 12px;max-width:940px;margin:0 auto;}
      .brand{display:flex;align-items:center;gap:12px;}
      .bmark{position:relative;width:42px;height:42px;border-radius:14px;background:linear-gradient(135deg,var(--gr),var(--grd));display:flex;align-items:center;justify-content:center;box-shadow:0 6px 16px rgba(14,107,79,.3), inset 0 1px 0 rgba(255,255,255,.25);flex-shrink:0;}
      .bdot{position:absolute;top:-4px;right:-4px;width:13px;height:13px;border-radius:50%;background:var(--go);border:2.5px solid var(--bg);}
      .bname{font-family:var(--fd);font-size:21px;font-weight:800;letter-spacing:-.01em;color:var(--ink);}
      .btag{font-size:11.5px;color:var(--soft);margin-top:2px;}
      .hright{display:flex;align-items:center;gap:12px;}
      .rate-badge{display:flex;align-items:center;gap:6px;background:var(--sur);border:1px solid var(--ln);padding:7px 13px;border-radius:999px;font-family:var(--fm);font-size:12.5px;color:var(--soft);box-shadow:var(--s1);}
      .rate-badge b{color:var(--gr);}
      .acc-btn{display:flex;align-items:center;gap:7px;background:var(--sur);border:1px solid var(--ln);color:var(--ink);padding:9px 16px;border-radius:999px;font-size:13px;cursor:pointer;font-weight:600;box-shadow:var(--s1);font-family:var(--fb);}
      .acc-btn:hover{border-color:var(--gr);}

      /* tabs */
      .tabs{display:flex;gap:8px;max-width:940px;margin:0 auto;padding:8px 24px 18px;}
      .tab{background:var(--sur);border:1px solid var(--ln);color:var(--soft);padding:10px 22px;border-radius:999px;font-size:13.5px;font-weight:700;cursor:pointer;font-family:var(--fb);box-shadow:var(--s1);}
      .tab.on{background:var(--gr);color:#fff;border-color:var(--gr);}

      /* dots */
      .dots-row{display:flex;gap:7px;justify-content:center;padding:0 0 20px;}
      .dot{width:7px;height:7px;border-radius:50%;background:var(--ln);}
      .dot.done{background:var(--gr);}
      .dot.active{background:var(--go);width:22px;border-radius:4px;}

      /* stage */
      .stage{max-width:760px;margin:0 auto;padding:6px 24px 40px;animation:fu .4s ease both;}
      @keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}

      /* typography */
      .ey{font-family:var(--fm);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--go);margin-bottom:10px;font-weight:600;}
      .ht{font-family:var(--fd);font-size:36px;font-weight:800;line-height:1.15;color:var(--ink);margin-bottom:14px;letter-spacing:-.01em;}
      .hs{color:var(--soft);font-size:15px;line-height:1.6;max-width:540px;margin-bottom:26px;}

      /* input card */
      .icard{background:var(--sur);border:1px solid var(--ln);border-radius:20px;padding:24px;box-shadow:var(--s2);}
      .irow{display:flex;gap:10px;}
      .lnk{flex:1;background:var(--sur2);border:1.5px solid var(--ln);color:var(--ink);padding:13px 16px;border-radius:12px;font-size:14px;font-family:var(--fm);}
      .lnk:focus{outline:none;border-color:var(--gr);background:#fff;}
      .lnk::placeholder{color:var(--soft);}
      .btn-p{display:flex;align-items:center;gap:8px;background:var(--gr);color:#fff;border:none;padding:13px 22px;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer;white-space:nowrap;font-family:var(--fb);box-shadow:0 8px 20px rgba(14,107,79,.28);transition:transform .15s,background .15s;}
      .btn-p:hover{background:var(--grd);transform:translateY(-1px);}
      .btn-p:disabled{opacity:.45;cursor:not-allowed;transform:none;box-shadow:none;}
      .btn-go{display:flex;align-items:center;gap:7px;background:var(--go);border:none;color:#fff;padding:9px 15px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:var(--fb);}
      .btn-go:disabled{opacity:.45;cursor:not-allowed;}
      .btn-gh{display:flex;align-items:center;gap:7px;background:transparent;border:1.5px solid var(--ln);color:var(--ink);padding:10px 16px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:var(--fb);}
      .btn-gh:hover{border-color:var(--gr);}
      .btn-tl{display:flex;align-items:center;gap:7px;background:var(--gr);border:none;color:#fff;padding:10px 16px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:var(--fb);}
      .err{color:var(--rs);font-size:13px;margin-top:10px;font-weight:600;}

      /* chips */
      .srow{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;}
      .chip{background:var(--sur2);border:1px solid var(--ln);color:var(--soft);padding:7px 14px;border-radius:999px;font-size:12px;cursor:pointer;font-weight:600;font-family:var(--fb);}
      .chip:hover{border-color:var(--gr);color:var(--ink);}
      .chip-on{background:var(--gr);color:#fff;border-color:var(--gr);}

      /* trust */
      .trust{display:flex;align-items:center;gap:8px;color:var(--soft);font-size:12.5px;margin-top:18px;}
      .trust svg{color:var(--gr);}

      /* back */
      .back{color:var(--soft);font-size:13px;cursor:pointer;display:inline-flex;align-items:center;gap:5px;margin-bottom:14px;background:none;border:none;padding:0;font-family:var(--fb);font-weight:600;}
      .back:hover{color:var(--ink);}

      /* scan */
      .scard{background:var(--sur);border:1px solid var(--ln);border-radius:20px;padding:30px;box-shadow:var(--s2);}
      .srow-s{display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid var(--ln);}
      .srow-s:last-child{border-bottom:none;}
      .sic{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:var(--sur2);color:var(--soft);font-size:11px;font-weight:700;}
      .sic.done{background:var(--gr);color:#fff;}
      .sic.act{background:var(--go);color:#fff;}
      .slb{font-size:14px;color:var(--soft);}
      .slb.live{color:var(--ink);font-weight:700;}
      @keyframes spin{to{transform:rotate(360deg)}}
      .spin{animation:spin 1s linear infinite;}

      /* summary chips */
      .schips{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px;align-items:center;}
      .sch{background:var(--sur);border:1px solid var(--ln);border-radius:12px;padding:10px 16px;box-shadow:var(--s1);}
      .sch .v{font-family:var(--fm);font-weight:700;font-size:15px;color:var(--ink);}
      .sch .l{font-size:11px;color:var(--soft);text-transform:uppercase;letter-spacing:.05em;}

      /* promo */
      .promo{display:flex;align-items:center;gap:9px;background:var(--got);border:1px solid #EAD49E;color:#93701B;padding:11px 15px;border-radius:12px;font-size:13px;font-weight:600;margin-bottom:18px;}

      /* manifest */
      .mcard{background:var(--sur);border-radius:20px;padding:8px 18px;box-shadow:var(--s2);border:1px solid var(--ln);}
      .prow{display:flex;align-items:center;gap:14px;padding:16px 0;border-bottom:1px solid var(--ln);}
      .prow:last-child{border-bottom:none;}
      .pthumb{width:54px;height:54px;border-radius:13px;object-fit:cover;flex-shrink:0;background:var(--sur2);}
      .pn{font-weight:700;font-size:14.5px;margin-bottom:3px;color:var(--ink);}
      .pmeta{display:flex;gap:6px;flex-wrap:wrap;}
      .vc{font-size:10.5px;background:var(--sur2);padding:2px 8px;border-radius:999px;color:var(--soft);font-weight:600;}
      .prgt{display:flex;align-items:center;gap:14px;margin-left:auto;}
      .pqty{font-family:var(--fm);font-size:13px;color:var(--soft);}
      .pprc{font-family:var(--fm);font-weight:700;font-size:14px;min-width:80px;text-align:right;color:var(--ink);}
      .wh{background:none;border:none;cursor:pointer;color:var(--ln);flex-shrink:0;padding:4px;display:flex;}
      .wh.on{color:var(--rs);}

      /* ticket */
      .tcard{display:flex;background:var(--sur);border-radius:20px;overflow:visible;box-shadow:var(--s3);position:relative;border:1px solid var(--ln);}
      .tmain{flex:1;padding:26px 26px 22px;position:relative;}
      .tnot{position:relative;width:0;border-left:2px dashed var(--ln);}
      .tnot::before,.tnot::after{content:'';position:absolute;width:18px;height:18px;background:var(--bg);border-radius:50%;left:-9px;}
      .tnot::before{top:-9px;} .tnot::after{bottom:-9px;}
      .tstub{width:220px;padding:26px 22px;display:flex;flex-direction:column;justify-content:space-between;background:var(--grt);border-radius:0 20px 20px 0;flex-shrink:0;}
      .tey{font-family:var(--fm);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--soft);margin-bottom:4px;}
      .cost-row{display:flex;justify-content:space-between;align-items:flex-start;padding:9px 0;}
      .cost-lbl{font-size:13.5px;font-weight:600;display:flex;flex-direction:column;color:var(--ink);}
      .cost-sub{font-size:11px;color:var(--soft);font-weight:500;}
      .cost-vals{text-align:right;}
      .cv-tnd{font-family:var(--fm);font-weight:700;font-size:14px;color:var(--ink);}
      .cv-eur{font-family:var(--fm);font-size:11px;color:var(--soft);}
      .cost-vals.muted .cv-tnd{color:var(--soft);}
      .cost-vals.accent .cv-tnd{color:var(--rs);}
      .div-ln{border-top:1.5px dashed var(--ln);margin:6px 0;}
      .spd-tog{display:flex;gap:8px;margin:10px 0 6px;}
      .spd-btn{flex:1;border:1.5px solid var(--ln);background:var(--sur2);padding:9px;border-radius:10px;font-size:12.5px;font-weight:700;cursor:pointer;color:var(--soft);font-family:var(--fb);}
      .spd-btn.on{background:var(--ink);color:#fff;border-color:var(--ink);}
      .ftl{font-family:var(--fm);font-size:26px;font-weight:800;color:var(--grd);}
      .ftl-eur{font-family:var(--fm);font-size:13px;color:var(--soft);margin-top:2px;}
      .fl{font-family:var(--fd);font-size:11.5px;font-weight:700;letter-spacing:.06em;color:var(--soft);margin-bottom:4px;text-transform:uppercase;}
      .srow2{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--soft);margin-top:8px;}
      .stamp{position:absolute;top:18px;right:18px;width:78px;height:78px;border:3px solid var(--go);border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--go);font-family:var(--fd);font-weight:700;font-size:9.5px;text-align:center;transform:rotate(-10deg) scale(0);opacity:0;transition:all .45s cubic-bezier(.34,1.56,.64,1);pointer-events:none;background:var(--got);}
      .stamp.on{transform:rotate(-10deg) scale(1);opacity:1;}
      .inote{display:flex;gap:8px;align-items:flex-start;background:var(--sur2);border-radius:12px;padding:11px 13px;margin-top:14px;font-size:12px;color:var(--soft);}
      .inote svg{flex-shrink:0;margin-top:1px;color:var(--bl);}

      /* payment */
      .pgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:18px 0;}
      .pcard{display:flex;align-items:center;gap:10px;background:var(--sur);border:1.5px solid var(--ln);border-radius:14px;padding:14px;cursor:pointer;text-align:left;color:var(--ink);box-shadow:var(--s1);font-family:var(--fb);}
      .pcard.on{border-color:var(--gr);background:var(--grt);}
      .pic{width:32px;height:32px;border-radius:9px;background:var(--sur2);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--ink);}
      .plb{font-size:13px;font-weight:700;}
      .pnt{font-size:10.5px;color:var(--soft);}
      .pch{margin-left:auto;color:var(--gr);}
      .recap{background:var(--sur);border:1px solid var(--ln);border-radius:14px;padding:16px;margin-bottom:18px;box-shadow:var(--s1);}
      .rrow{display:flex;justify-content:space-between;font-size:13px;padding:4px 0;color:var(--soft);}
      .rrow b{color:var(--ink);font-family:var(--fm);}

      /* tracking */
      .tline{display:flex;justify-content:space-between;margin:22px 0 6px;position:relative;}
      .tline::before{content:'';position:absolute;top:9px;left:0;right:0;height:2px;background:var(--ln);z-index:0;}
      .tls{display:flex;flex-direction:column;align-items:center;gap:6px;flex:1;position:relative;z-index:1;}
      .tld{width:18px;height:18px;border-radius:50%;background:var(--sur);border:2px solid var(--ln);}
      .tld.done{background:var(--gr);border-color:var(--gr);}
      .tld.act{background:var(--go);border-color:var(--go);}
      .tll{font-size:10px;text-align:center;color:var(--soft);max-width:64px;font-weight:600;}
      .tll.live{color:var(--ink);}

      /* confirmed */
      .ptb{display:flex;align-items:center;gap:10px;}
      .ptn{font-family:var(--fm);font-size:26px;font-weight:800;color:var(--go);}
      .rcard{background:var(--sur);border:1px solid var(--ln);border-radius:16px;padding:18px;margin-top:18px;box-shadow:var(--s1);}

      /* shipment map */
      .shipmap-card{background:var(--sur);border:1px solid var(--ln);border-radius:20px;padding:20px 22px;margin-top:18px;box-shadow:var(--s2);}
      .shipmap-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;flex-wrap:wrap;gap:12px;}
      .shipmap-city{display:flex;align-items:center;gap:6px;font-family:var(--fd);font-weight:700;font-size:17px;color:var(--ink);}
      .shipmap-city svg{color:var(--go);flex-shrink:0;}
      .shipmap-eta{text-align:right;}
      .shipmap-eta-date{font-family:var(--fm);font-weight:800;font-size:18px;color:var(--grd);}
      .shipmap-svg{width:100%;height:150px;display:block;background:linear-gradient(180deg,var(--grt) 0%,var(--sur2) 100%);border-radius:14px;margin-bottom:10px;}
      .shipmap-route-labels{display:flex;justify-content:space-between;font-size:11px;color:var(--soft);font-weight:600;}
      .shipmap-route-labels span{display:flex;align-items:center;gap:5px;}
      .rlrow{display:flex;gap:8px;margin-top:10px;}
      .rll{flex:1;background:var(--sur2);border:1px solid var(--ln);padding:10px 12px;border-radius:10px;font-family:var(--fm);font-size:12.5px;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
      .fa{display:flex;gap:10px;margin-top:26px;flex-wrap:wrap;}

      /* drawer */
      .ov{position:fixed;inset:0;background:rgba(20,24,21,.45);z-index:20;}
      .dr{position:fixed;top:0;right:0;height:100%;width:370px;max-width:92vw;background:var(--bg);border-left:1px solid var(--ln);z-index:21;padding:22px;overflow-y:auto;animation:si .3s ease both;}
      @keyframes si{from{transform:translateX(100%)}to{transform:none}}
      .drh{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;}
      .drc{background:none;border:none;color:var(--soft);cursor:pointer;}
      .vbadge{display:inline-flex;align-items:center;gap:6px;background:var(--got);color:#93701B;padding:6px 13px;border-radius:999px;font-size:12px;font-weight:700;}
      .pbar{height:7px;background:var(--sur2);border-radius:999px;overflow:hidden;margin:8px 0 4px;}
      .pfill{height:100%;background:linear-gradient(90deg,var(--go),var(--gr));border-radius:999px;}
      .ty{font-size:11.5px;color:var(--soft);}
      .oitem{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--ln);font-size:13px;}
      .oitem:last-child{border-bottom:none;}
      .spl{font-size:10px;padding:3px 9px;border-radius:999px;font-weight:700;}
      .spl.Delivered{background:var(--grt);color:var(--gr);}
      .spl.Processing{background:var(--got);color:#93701B;}
      .spl.Cancelled{background:#FBEAEC;color:var(--rs);}
      .drs{margin-top:22px;padding-top:18px;border-top:1px solid var(--ln);}
      .drs h4{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--soft);margin-bottom:10px;}
      .sgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
      .sbox{background:var(--sur);border:1px solid var(--ln);border-radius:12px;padding:13px;box-shadow:var(--s1);}
      .sbox .v{font-family:var(--fm);font-weight:800;font-size:17px;color:var(--ink);}
      .sbox .l{font-size:10.5px;color:var(--soft);margin-top:2px;}

      /* store */
      .sfrow{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;}
      .sgrd{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;}
      .ssc{background:var(--sur);border-radius:18px;overflow:hidden;border:1px solid var(--ln);box-shadow:var(--s1);transition:transform .15s,box-shadow .15s;}
      .ssc:hover{transform:translateY(-3px);box-shadow:var(--s2);}
      .spw{position:relative;aspect-ratio:1.05;background:var(--sur2);}
      .sph{width:100%;height:100%;object-fit:cover;display:block;}
      .spf{display:flex;align-items:center;justify-content:center;color:var(--go);}
      .scpill{position:absolute;top:10px;left:10px;background:rgba(255,255,255,.92);padding:4px 10px;border-radius:999px;font-size:10px;font-weight:700;color:var(--ink);}
      .scb{padding:14px;}
      .scost{display:flex;align-items:center;gap:5px;font-family:var(--fm);font-weight:800;font-size:14px;color:var(--go);margin:6px 0 10px;}
      .sbtn{width:100%;justify-content:center;padding:10px;font-size:13px;}

      /* loyalty */
      .lhero{display:flex;align-items:center;justify-content:space-between;background:linear-gradient(135deg,var(--gr),var(--grd));border-radius:20px;padding:22px 24px;color:#fff;box-shadow:var(--s3);}
      .lhero .fl{color:rgba(255,255,255,.7);}
      .lpbig{display:flex;align-items:center;gap:9px;font-family:var(--fm);font-size:32px;font-weight:800;color:var(--go);}
      .lhero .vbadge{background:rgba(255,255,255,.18);color:#fff;}
      .scard-l{background:var(--sur);border:1px solid var(--ln);border-radius:18px;padding:18px;margin-top:18px;box-shadow:var(--s1);}
      .scard-lh{display:flex;align-items:center;gap:9px;margin-bottom:12px;font-size:14.5px;}
      .strkrow{display:flex;gap:7px;margin-bottom:14px;}
      .sday{flex:1;aspect-ratio:1;border-radius:10px;background:var(--sur2);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--soft);border:1.5px solid var(--ln);}
      .sday.done{background:var(--grt);color:var(--gr);border-color:var(--gr);}
      .sday.today{border-color:var(--go);color:var(--go);}
      .drow{display:flex;justify-content:space-between;align-items:center;background:var(--sur2);border-radius:12px;padding:11px 13px;gap:10px;}
      .rl{margin-top:6px;}
      .howl{margin:0;padding-left:18px;font-size:13px;color:var(--soft);line-height:1.8;}
      .pref-r{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--ln);}
      .pref-r:last-child{border-bottom:none;}
      .sw{width:42px;height:24px;border-radius:999px;background:var(--ln);border:none;position:relative;cursor:pointer;flex-shrink:0;transition:background .15s;}
      .sw.on{background:var(--gr);}
      .swk{position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .15s;box-shadow:0 1px 3px rgba(0,0,0,.3);}
      .sw.on .swk{transform:translateX(18px);}

      /* chat */
      .cb{position:fixed;bottom:20px;right:20px;z-index:30;display:flex;align-items:center;gap:8px;background:var(--gr);color:#fff;border:none;padding:13px 18px;border-radius:999px;font-weight:700;font-size:13px;cursor:pointer;box-shadow:0 12px 30px rgba(14,107,79,.4);font-family:var(--fb);}
      .cp{position:fixed;bottom:84px;right:20px;width:330px;max-width:90vw;height:440px;max-height:70vh;background:var(--sur);border:1px solid var(--ln);border-radius:18px;z-index:30;display:flex;flex-direction:column;overflow:hidden;box-shadow:var(--s3);}
      .ch{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid var(--ln);flex-shrink:0;}
      .cms{flex:1;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:10px;}
      .cm{font-size:13px;line-height:1.5;padding:9px 12px;border-radius:14px;max-width:85%;white-space:pre-wrap;}
      .cm.user{background:var(--gr);color:#fff;align-self:flex-end;}
      .cm.assistant{background:var(--sur2);color:var(--ink);align-self:flex-start;}
      .cir{display:flex;gap:8px;padding:12px;border-top:1px solid var(--ln);flex-shrink:0;}
      .cir .lnk{padding:10px 12px;font-family:var(--fb);font-size:13px;}
      .cir .btn-p{padding:10px 12px;box-shadow:none;}
      .td{letter-spacing:2px;opacity:.6;}

      /* disc */
      .disc{text-align:center;font-size:11px;color:var(--soft);margin-top:30px;opacity:.8;}

      @media(max-width:560px){
        .pgrid{grid-template-columns:1fr;}
        .sgrd{grid-template-columns:1fr 1fr;}
        .tcard{flex-direction:column;}
        .tnot{display:none;}
        .tstub{border-radius:0 0 20px 20px;width:auto;}
        .ht{font-size:28px;}
        .cp{right:12px;left:12px;width:auto;}
        .rate-badge{display:none;}
      }
    `}</style>

    {/* ── topbar ── */}
    <div className="topbar">
      <div className="brand">
        <div className="bmark"><ShoppingBag size={20} color="#fff"/><span className="bdot"/></div>
        <div><div className="bname">Wassel</div><div className="btag">Shop Shein · Temu · AliExpress — pay the real total</div></div>
      </div>
      <div className="hright">
        <div className="rate-badge"><TrendingUp size={13}/> 1 € = <b>{TND_PER_EUR.toFixed(1)} TND</b></div>
        {acc && <button className="acc-btn" onClick={()=>setDrawer(true)}><Users size={15}/> {acc.name.split(' ')[0]}</button>}
      </div>
    </div>

    {!acc ? (
      <div className="stage">
        <div className="ey">Step 1 — free to join</div>
        <h1 className="ht">Create your account<br/>to shop smarter.</h1>
        <p className="hs">Takes a few seconds. You'll get 50 welcome points right away, and every order earns more.</p>
        <div className="icard">
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <input className="lnk" placeholder="Your name" value={gName} onChange={e=>setGName(e.target.value)}/>
            <input className="lnk" placeholder="Email address" value={gEmail} onChange={e=>setGEmail(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')doCreate();}}/>
          </div>
          {gErr && <div className="err">{gErr}</div>}
          <button className="btn-p" style={{marginTop:14,width:'100%',justifyContent:'center'}} onClick={doCreate}>
            Create account & continue <ArrowRight size={16}/>
          </button>
        </div>
      </div>
    ) : (
      <>
      <div className="tabs">
        <button className={`tab ${page==='calc'?'on':''}`} onClick={()=>setPage('calc')}>Calculator</button>
        <button className={`tab ${page==='store'?'on':''}`} onClick={()=>setPage('store')}>Rewards store</button>
        <button className={`tab ${page==='loyalty'?'on':''}`} onClick={()=>setPage('loyalty')}>Loyalty & Referrals</button>
      </div>

      {page==='calc' && <Dots cur={step}/>}

      <div className="stage">

        {/* ── STORE page ── */}
        {page==='store' && <>
          <div className="ey">Rewards store</div>
          <h2 className="ht" style={{fontSize:28}}>Spend your points</h2>
          <p className="hs">Redeem loyalty points for clothing, bags, accessories, coupons and more.</p>
          <div className="schips"><div className="sch"><div className="v">{pts}</div><div className="l">Your points</div></div></div>
          {redMsg && <div className="promo"><Check size={15}/> {redMsg}</div>}
          <div className="sfrow">
            {STORE_CATS.map(c=><Chip key={c.id} active={storeFilter===c.id} onClick={()=>setStoreFilter(c.id)}>{c.label}</Chip>)}
          </div>
          <div className="sgrd">
            {storeFilt.map(item=>{
              const can=pts>=item.cost;
              return(
                <div className="ssc" key={item.id}>
                  <div className="spw">
                    {item.img
                      ? <Img src={item.img} alt={item.name} className="sph"/>
                      : <div className="sph spf"><Gift size={30}/></div>
                    }
                    <span className="scpill">{item.cat.charAt(0).toUpperCase()+item.cat.slice(1)}</span>
                  </div>
                  <div className="scb">
                    <div className="pn">{item.name}</div>
                    <div className="scost"><Star size={13}/> {item.cost} pts</div>
                    <button className="btn-p sbtn" disabled={!can} onClick={()=>doRedeem(item)}>
                      {can?'Redeem':`Need ${item.cost-pts} more`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>}

        {/* ── LOYALTY page ── */}
        {page==='loyalty' && <>
          <div className="ey">Loyalty & Referrals</div>
          <h2 className="ht" style={{fontSize:28}}>Your rewards status</h2>

          <div className="lhero">
            <div>
              <div className="fl">Points balance</div>
              <div className="lpbig"><Star size={24} fill="currentColor"/> {pts}</div>
            </div>
            <span className="vbadge"><Sparkles size={13}/> {tier.cur.name}</span>
          </div>

          {tier.next && <>
            <div className="pbar" style={{marginTop:14}}><div className="pfill" style={{width:`${tierPct}%`}}/></div>
            <div className="ty">{Math.max(0,tier.next.min-spendTND)} TND of lifetime spend to {tier.next.name}</div>
          </>}

          <div className="sgrid" style={{marginTop:18}}>
            <div className="sbox"><div className="v">{spendTND} TND</div><div className="l">Total spent</div></div>
            <div className="sbox"><div className="v">{savTND} TND</div><div className="l">Total saved</div></div>
          </div>

          {/* daily */}
          <div className="scard-l">
            <div className="scard-lh"><Flame size={16} color="#C9962B"/><b>Daily login bonus</b></div>
            <div className="strkrow">
              {Array.from({length:7}).map((_,i)=>(
                <div key={i} className={`sday ${i<streak?'done':''} ${i===streak?'today':''}`}>
                  {i<streak?<Check size={13}/>:i+1}
                </div>
              ))}
            </div>
            <div className="drow">
              <span className="ty">{dayClaimed?`Day ${streak} streak — come back tomorrow!`:"Claim today's bonus to keep your streak."}</span>
              <button className="btn-go" disabled={dayClaimed} onClick={doClaim}><Gift size={14}/> {dayClaimed?'Claimed':'+15 pts'}</button>
            </div>
          </div>

          {/* referrals */}
          <div className="scard-l">
            <div className="scard-lh"><Users size={16} color="#0E6B4F"/><b>Invite friends, earn together</b></div>
            <div className="ty">Your friend gets bonus points on signup. You both earn 200 pts once they place their first order over 80 TND.</div>
            <div className="rlrow">
              <div className="rll">{refLink}</div>
              <button className="btn-gh" onClick={doCopy}>{copied?<Check size={14}/>:<Copy size={14}/>} {copied?'Copied':'Copy'}</button>
            </div>
            <div className="rl">
              {MOCK_REFS.map((r,i)=>(
                <div className="oitem" key={i}>
                  <div style={{fontWeight:600}}>{r.name}</div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span className={`spl ${r.status==='ordered'?'Delivered':'Processing'}`}>{r.status==='ordered'?'Ordered':'Joined'}</span>
                    <span className="ty" style={{fontFamily:'var(--fm)'}}>+{r.pts} pts</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="ty" style={{marginTop:8}}>{MOCK_REFS.length} friends invited · {MOCK_REFS.reduce((s,r)=>s+r.pts,0)} points earned from referrals.</div>
          </div>

          {/* how it works */}
          <div className="scard-l">
            <div className="scard-lh"><Info size={16} color="#3A8DE2"/><b>How points work</b></div>
            <ul className="howl">
              <li>Earn 1 point for every 1 TND your order costs.</li>
              <li>Redeem points any time in the Rewards store.</li>
              <li>Referral bonuses land once your friend places their first order.</li>
              <li>Higher VIP tiers unlock better discounts and priority support.</li>
            </ul>
          </div>

          {/* preferences */}
          <div className="scard-l">
            <div className="scard-lh"><BadgePercent size={16} color="#C9707A"/><b>Notification preferences</b></div>
            <div className="pref-r">
              <span className="ty">Notify me when wishlist prices drop</span>
              <button className={`sw ${prefs.alerts?'on':''}`} onClick={()=>setPrefs(p=>({...p,alerts:!p.alerts}))}><span className="swk"/></button>
            </div>
            <div className="pref-r">
              <span className="ty">Send me promo & flash-sale emails</span>
              <button className={`sw ${prefs.promos?'on':''}`} onClick={()=>setPrefs(p=>({...p,promos:!p.promos}))}><span className="swk"/></button>
            </div>
          </div>
        </>}

        {/* ── CALCULATOR pages ── */}
        {page==='calc' && step==='input' && <>
          <div className="ey">Cross-border cart calculator</div>
          <h1 className="ht">Know your total<br/>before you tap buy.</h1>
          <p className="hs">Paste a cart link from Shein, Temu, or AliExpress. We estimate weight, shipping, customs and convert everything to Tunisian Dinar — before you pay a cent.</p>
          <div className="icard">
            <div className="irow">
              <input className="lnk" placeholder="Paste your cart link here…" value={link} onChange={e=>setLink(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')doAnalyze();}}/>
              <button className="btn-p" onClick={doAnalyze}>Calculate <ArrowRight size={16}/></button>
            </div>
            {err && <div className="err">{err}</div>}
            <div className="srow">
              {Object.entries(SAMPLES).map(([k,u])=>(
                <Chip key={k} active={link===u} onClick={()=>setLink(u)}>Try {PLATFORMS[k].label}</Chip>
              ))}
            </div>
          </div>
          <div className="trust"><ShieldCheck size={15}/> Nothing is charged until you confirm payment.</div>
        </>}

        {page==='calc' && step==='scanning' && (
          <div className="scard">
            <div className="ey">Reading your cart</div>
            {SCAN.map((lb,i)=>(
              <div className="srow-s" key={lb}>
                <div className={`sic ${i<scanIdx?'done':i===scanIdx?'act':''}`}>
                  {i<scanIdx?<Check size={14}/>:i===scanIdx?<Loader2 size={14} className="spin"/>:i+1}
                </div>
                <div className={`slb ${i<=scanIdx?'live':''}`}>{lb}</div>
              </div>
            ))}
          </div>
        )}

        {page==='calc' && step==='manifest' && ana && <>
          <button className="back" onClick={()=>setStep('input')}>‹ Edit link</button>
          <div className="ey">{ana.platform} cart · detected automatically</div>
          <h2 className="ht" style={{fontSize:26}}>Here's what's in the cart</h2>
          {ana.discount && (
            <div className="promo">
              <Sparkles size={15}/>
              {ana.discount.label} — {ana.discount.type==='freeShipping'?'shipping waived automatically.':`${ana.discount.pct}% applied automatically.`}
            </div>
          )}
          <div className="schips">
            <div className="sch"><div className="v">{ana.items.length}</div><div className="l">Items</div></div>
            <div className="sch"><div className="v">{ana.wKg.toFixed(2)} kg</div><div className="l">Est. weight</div></div>
            <div className="sch"><div className="v">{tnd(ana.subEUR*TND_PER_EUR)}</div><div className="l">Subtotal</div></div>
          </div>
          <div className="mcard">
            {ana.items.map(item=>{
              const wid=`${ana.seed}-${item.id}`;
              const isW=wish.some(w=>w.id===wid);
              return(
                <div className="prow" key={item.id}>
                  <Img src={CAT_IMG[item.cat]} alt={item.name} className="pthumb"/>
                  <div style={{flex:1,minWidth:0}}>
                    <div className="pn">{item.name}</div>
                    <div className="pmeta">
                      {item.size&&<span className="vc">Size {item.size}</span>}
                      {item.color&&<span className="vc">{item.color}</span>}
                    </div>
                  </div>
                  <Spark pts={item.spark}/>
                  <button className={`wh ${isW?'on':''}`} onClick={()=>toggleWish({id:wid,name:item.name,platform:ana.platform})}>
                    <Heart size={16} fill={isW?'currentColor':'none'}/>
                  </button>
                  <div className="prgt">
                    <div className="pqty">×{item.qty}</div>
                    <div className="pprc">{tnd(item.lineEUR*TND_PER_EUR)}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="fa">
            <button className="btn-p" onClick={()=>setStep('ticket')}>See total cost breakdown <ArrowRight size={16}/></button>
          </div>
        </>}

        {page==='calc' && step==='ticket' && ana && T && <>
          <button className="back" onClick={()=>setStep('manifest')}>‹ Back to cart</button>
          <div className="ey">Cost breakdown</div>
          <h2 className="ht" style={{fontSize:26}}>Your customs ticket</h2>
          <div className="tcard">
            <div className="tmain">
              <div className={`stamp ${stamped?'on':''}`}><ShieldCheck size={16}/>CLEARED<br/>FOR CHECKOUT</div>
              <div className="tey">{ana.platform} · {ana.items.length} items</div>
              <div className="spd-tog">
                <button className={`spd-btn ${speed==='standard'?'on':''}`} onClick={()=>setSpeed('standard')}>Standard shipping</button>
                <button className={`spd-btn ${speed==='express'?'on':''}`} onClick={()=>setSpeed('express')}>Express shipping</button>
              </div>
              <CostRow label="Product subtotal" eur={T.subEUR} tndV={T.subEUR*TND_PER_EUR}/>
              {ana.discount && <CostRow label="Discount" sub={ana.discount.label} eur={-T.dEUR} tndV={-T.dEUR*TND_PER_EUR} accent/>}
              <div className="div-ln"/>
              <CostRow label="Shipping" sub={speed==='express'?'Express':'Standard'} eur={T.sEUR} tndV={T.sEUR*TND_PER_EUR} muted={T.sEUR===0}/>
              <CostRow label="Customs & duty" sub="On value above 200 TND" eur={T.custEUR} tndV={T.custEUR*TND_PER_EUR} muted={T.custEUR===0}/>
              <CostRow label="Service fee" sub="Platform handling" eur={T.svcEUR} tndV={T.svcEUR*TND_PER_EUR}/>
              <div className="inote"><Info size={14}/> Fixed rate: 1 € = {TND_PER_EUR} TND — simulated for this demo.</div>
            </div>
            <div className="tnot"/>
            <div className="tstub">
              <div>
                <div className="fl">Final total</div>
                <div className="ftl">{tnd(T.fTND)}</div>
                <div className="ftl-eur">{eur(T.fEUR)}</div>
                <div className="srow2"><ShoppingBag size={13}/> {ana.wKg.toFixed(2)} kg</div>
                <div className="srow2"><Clock size={13}/> {T.days} days</div>
                <div className="srow2"><MapPin size={13}/> {T.eta.toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</div>
              </div>
            </div>
          </div>
          <div className="fa">
            <button className="btn-p" onClick={()=>setStep('payment')}>Confirm & pay <ArrowRight size={16}/></button>
          </div>
        </>}

        {page==='calc' && step==='payment' && ana && T && <>
          <button className="back" onClick={()=>setStep('ticket')}>‹ Back</button>
          <div className="ey">Payment</div>
          <h2 className="ht" style={{fontSize:26}}>How would you like to pay?</h2>
          <div className="recap">
            <div className="rrow"><span>{ana.platform} · {ana.items.length} items · {speed}</span><b>{tnd(T.fTND)}</b></div>
            <div className="rrow"><span>Estimated delivery</span><b>{T.eta.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</b></div>
          </div>
          <div className="pgrid">
            {PAY_METHODS.map(m=>{
              const Icon=m.icon; const sel=pay===m.id;
              return(
                <button key={m.id} className={`pcard ${sel?'on':''}`} onClick={()=>setPay(m.id)}>
                  <div className="pic"><Icon size={16}/></div>
                  <div><div className="plb">{m.label}</div>{m.note&&<div className="pnt">{m.note}</div>}</div>
                  {sel&&<Check size={16} className="pch"/>}
                </button>
              );
            })}
          </div>
          <div className="fa">
            <button className="btn-p" disabled={!pay} onClick={doOrder}>
              Place order — {tnd(T.fTND)} <ArrowRight size={16}/>
            </button>
          </div>
        </>}

        {page==='calc' && step==='confirmed' && order && <>
          <div className="ey">Order confirmed</div>
          <h2 className="ht" style={{fontSize:26}}>You're all set.</h2>
          <div className="tcard">
            <div className="tmain">
              <div className="tey">Waybill {order.waybill} · {order.platform}</div>
              <div className="fl" style={{marginTop:8}}>Tracking</div>
              <div className="tline">
                {TRACK_STAGES.map((s,i)=>(
                  <div className="tls" key={s}>
                    <div className={`tld ${i<track?'done':i===track?'act':''}`}/>
                    <div className={`tll ${i<=track?'live':''}`}>{s}</div>
                  </div>
                ))}
              </div>
              <div className="srow2" style={{marginTop:14}}>
                <MapPin size={13}/> Estimated delivery {order.T.eta.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
              </div>
            </div>
            <div className="tnot"/>
            <div className="tstub">
              <div>
                <div className="fl">You earned</div>
                <div className="ptb"><Gift size={20} color="#C9962B"/><div className="ptn">{ptDisp}</div></div>
                <div className="ty" style={{marginTop:2}}>loyalty points</div>
              </div>
              <div className="srow2"><Star size={13}/> {tnd(order.T.fTND)} paid</div>
            </div>
          </div>

          <ShipmentMap platform={order.platform.toLowerCase()==='shein'?'shein':order.platform.toLowerCase()==='temu'?'temu':'aliexpress'} stage={track} eta={order.T.eta}/>

          <div className="rcard">
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
              <Users size={16} color="#0E6B4F"/>
              <b style={{fontSize:14}}>Invite a friend, earn together</b>
            </div>
            <div className="ty">Your friend gets bonus points on signup. You both earn 200 pts once they place their first order over 80 TND.</div>
            <div className="rlrow">
              <div className="rll">{refLink}</div>
              <button className="btn-gh" onClick={doCopy}>{copied?<Check size={14}/>:<Copy size={14}/>} {copied?'Copied':'Copy'}</button>
            </div>
          </div>

          <div className="fa">
            <button className="btn-tl" onClick={()=>setPage('loyalty')}><Star size={15}/> Loyalty & referrals</button>
            <button className="btn-gh" onClick={doReset}><RotateCcw size={15}/> New cart</button>
            <button className="btn-gh" onClick={()=>setPage('store')}><Gift size={15}/> Spend points</button>
          </div>
        </>}

        <div className="disc">Wassel is a demo prototype. Exchange rates, shipping costs, and customs rules are simulated. Product images are illustrative stock photography.</div>
      </div>

      {/* account drawer */}
      {drawer && <>
        <div className="ov" onClick={()=>setDrawer(false)}/>
        <div className="dr">
          <div className="drh">
            <b style={{fontSize:16}}>{acc.name}'s account</b>
            <button className="drc" onClick={()=>setDrawer(false)}><X size={18}/></button>
          </div>
          <div className="ty">{acc.email}</div>
          <div style={{marginTop:14}}><span className="vbadge"><Star size={12}/> {tier.cur.name} tier</span></div>
          {tier.next && <>
            <div className="pbar" style={{marginTop:12}}><div className="pfill" style={{width:`${tierPct}%`}}/></div>
            <div className="ty">{Math.max(0,tier.next.min-spendTND)} TND to {tier.next.name}</div>
          </>}
          <div className="sgrid" style={{marginTop:16}}>
            <div className="sbox"><div className="v">{spendTND} TND</div><div className="l">Total spent</div></div>
            <div className="sbox"><div className="v">{pts}</div><div className="l">Points</div></div>
            <div className="sbox"><div className="v">{savTND} TND</div><div className="l">Total saved</div></div>
            <div className="sbox"><div className="v">{orders.length}</div><div className="l">Orders</div></div>
          </div>
          <div className="drs">
            <h4>Order history</h4>
            {orders.length===0 && <div className="ty">No orders yet.</div>}
            {orders.map(o=>(
              <div className="oitem" key={o.id}>
                <div><div style={{fontWeight:600}}>{o.platform}</div><div className="ty" style={{fontFamily:'var(--fm)'}}>{o.id}</div></div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontFamily:'var(--fm)',fontWeight:700}}>{o.tTND} TND</div>
                  <span className={`spl ${o.status}`}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="drs">
            <h4>Wishlist ({wish.length})</h4>
            {wish.length===0 && <div className="ty">Tap ♡ on any item to save it.</div>}
            {wish.map(w=>(
              <div className="oitem" key={w.id}>
                <div style={{fontWeight:600}}>{w.name}</div>
                <button className="btn-gh" style={{padding:'5px 10px',fontSize:11}} onClick={()=>toggleWish(w)}>Remove</button>
              </div>
            ))}
          </div>
          <div className="drs">
            <h4>Redeemed ({redeemed.length})</h4>
            {redeemed.length===0 && <div className="ty">Nothing redeemed yet.</div>}
            {redeemed.map(r=>(
              <div className="oitem" key={r.id}>
                <div>{r.name}</div>
                <div className="ty" style={{fontFamily:'var(--fm)'}}>-{r.cost} pts</div>
              </div>
            ))}
          </div>
          <div className="drs">
            <button className="btn-gh" style={{width:'100%',justifyContent:'center'}} onClick={()=>{setDrawer(false);setPage('loyalty');}}>
              <ChevronRight size={15}/> Full loyalty & referrals page
            </button>
          </div>
        </div>
      </>}

      {/* AI chat */}
      <button className="cb" onClick={()=>setChatOpen(o=>!o)}><MessageCircle size={20}/> {!chatOpen&&'Ask Wassel AI'}</button>
      {chatOpen && (
        <div className="cp">
          <div className="ch">
            <div style={{display:'flex',alignItems:'center',gap:8}}><Sparkles size={15} color="#C9962B"/><b>Wassel AI</b></div>
            <button className="drc" onClick={()=>setChatOpen(false)}><X size={16}/></button>
          </div>
          <div className="cms" ref={chatRef}>
            {msgs.length===0 && (
              <div>
                <div className="ty" style={{marginBottom:8}}>Try asking:</div>
                {AI_SUGGESTIONS.map((q,i)=>(
                  <button key={i} className="chip" style={{display:'block',width:'100%',textAlign:'left',marginBottom:6}} onClick={()=>doChat(q)}>{q}</button>
                ))}
              </div>
            )}
            {msgs.map((m,i)=><div key={i} className={`cm ${m.role}`}>{m.content}</div>)}
            {chatLoad && <div className="cm assistant"><span className="td">● ● ●</span></div>}
          </div>
          <div className="cir">
            <input className="lnk" placeholder="Ask anything…" value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')doChat();}}/>
            <button className="btn-p" onClick={()=>doChat()} disabled={chatLoad}><Send size={15}/></button>
          </div>
        </div>
      )}
      </>
    )}
    </div>
  );
}
