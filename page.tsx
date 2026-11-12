"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeftRight, ArrowRight, ArrowUpRight, TrainFront, MapPin, CalendarDays,
  Clock3, Search, ShieldCheck, Ticket, UserRound, Users, Wallet, ChevronRight,
  Menu, X, LayoutDashboard, Train, CircleHelp, LogOut, Bell, Plus, Trash2,
  CheckCircle2, AlertCircle, Info, Map, Gauge, Sparkles, RefreshCw, Download,
  SlidersHorizontal, CreditCard, CircleUserRound, Building2, Route, Armchair,
  CalendarCheck, ClipboardList, ChartNoAxesCombined, SearchCheck
} from "lucide-react";

type Status = "CNF" | "RAC" | "WL" | "CANCELLED";
type Passenger = { name: string; age: number; gender: string; berth: string; status: Status; seat?: string };
type Booking = {
  pnr: string; trainNo: string; trainName: string; from: string; to: string; date: string;
  departure: string; arrival: string; className: string; fare: number; passengers: Passenger[];
  createdAt: string; payment: string;
};
type TrainItem = {
  id: string; no: string; name: string; from: string; to: string; departure: string; arrival: string;
  duration: string; type: string; fare: number; classes: string[]; availability: Record<string, { cnf: number; rac: number; wl: number }>;
};

const initialTrains: TrainItem[] = [
  { id:"t1", no:"12951", name:"Mumbai Rajdhani Express", from:"New Delhi (NDLS)", to:"Mumbai Central (MMCT)", departure:"16:55", arrival:"08:35", duration:"15h 40m", type:"Rajdhani", fare:2450, classes:["1A","2A","3A"], availability:{"3A":{cnf:12,rac:6,wl:18},"2A":{cnf:4,rac:4,wl:12},"1A":{cnf:2,rac:2,wl:8}} },
  { id:"t2", no:"12301", name:"Howrah Rajdhani Express", from:"New Delhi (NDLS)", to:"Howrah Junction (HWH)", departure:"16:50", arrival:"09:55", duration:"17h 05m", type:"Rajdhani", fare:2280, classes:["1A","2A","3A"], availability:{"3A":{cnf:8,rac:5,wl:20},"2A":{cnf:3,rac:3,wl:10},"1A":{cnf:1,rac:2,wl:6}} },
  { id:"t3", no:"12007", name:"Shatabdi Express", from:"Chennai Central (MAS)", to:"Bengaluru City (SBC)", departure:"06:00", arrival:"10:25", duration:"4h 25m", type:"Shatabdi", fare:980, classes:["CC","EC"], availability:{"CC":{cnf:32,rac:0,wl:8},"EC":{cnf:6,rac:0,wl:3}} },
  { id:"t4", no:"22436", name:"Vande Bharat Express", from:"New Delhi (NDLS)", to:"Varanasi Junction (BSB)", departure:"06:00", arrival:"14:00", duration:"8h 00m", type:"Vande Bharat", fare:1795, classes:["CC","EC"], availability:{"CC":{cnf:24,rac:0,wl:12},"EC":{cnf:5,rac:0,wl:5}} },
  { id:"t5", no:"12957", name:"Swarna Jayanti Rajdhani", from:"Ahmedabad (ADI)", to:"New Delhi (NDLS)", departure:"17:40", arrival:"07:30", duration:"13h 50m", type:"Rajdhani", fare:2140, classes:["1A","2A","3A"], availability:{"3A":{cnf:15,rac:5,wl:14},"2A":{cnf:5,rac:3,wl:9},"1A":{cnf:2,rac:2,wl:4}} },
  { id:"t6", no:"12986", name:"Jaipur Double Decker", from:"Jaipur (JP)", to:"Delhi Sarai Rohilla (DEE)", departure:"06:00", arrival:"10:30", duration:"4h 30m", type:"Superfast", fare:760, classes:["CC"], availability:{"CC":{cnf:18,rac:0,wl:10}} },
];

const stationOptions = ["New Delhi (NDLS)","Mumbai Central (MMCT)","Howrah Junction (HWH)","Chennai Central (MAS)","Bengaluru City (SBC)","Varanasi Junction (BSB)","Ahmedabad (ADI)","Jaipur (JP)","Delhi Sarai Rohilla (DEE)"];
const today = new Date().toISOString().slice(0,10);
const seedBookings: Booking[] = [
  { pnr:"RS48291630", trainNo:"12951", trainName:"Mumbai Rajdhani Express", from:"New Delhi (NDLS)", to:"Mumbai Central (MMCT)", date:today, departure:"16:55", arrival:"08:35", className:"3A", fare:2450, passengers:[{name:"Aarav Sharma",age:21,gender:"Male",berth:"Lower",status:"CNF",seat:"B2 / 31"},{name:"Ananya Sharma",age:20,gender:"Female",berth:"Any",status:"RAC",seat:"RAC 04"}], createdAt:"Today, 09:42 AM", payment:"Paid" },
  { pnr:"RS17382046", trainNo:"12301", trainName:"Howrah Rajdhani Express", from:"New Delhi (NDLS)", to:"Howrah Junction (HWH)", date:today, departure:"16:50", arrival:"09:55", className:"2A", fare:4560, passengers:[{name:"Rohan Mehta",age:22,gender:"Male",berth:"Upper",status:"WL",seat:"WL 03"}], createdAt:"Yesterday", payment:"Paid" }
];

const currency = (n:number) => "₹" + n.toLocaleString("en-IN");
const makePnr = () => "RS" + Math.floor(10000000 + Math.random()*89999999);
const statusLabel = (s:Status) => s === "CNF" ? "Confirmed" : s === "RAC" ? "RAC" : s === "WL" ? "Waiting list" : "Cancelled";

export default function Home() {
  const [page,setPage] = useState("home");
  const [mobileOpen,setMobileOpen] = useState(false);
  const [from,setFrom] = useState("New Delhi (NDLS)");
  const [to,setTo] = useState("Mumbai Central (MMCT)");
  const [date,setDate] = useState(today);
  const [travelClass,setTravelClass] = useState("3A");
  const [trains,setTrains] = useState<TrainItem[]>(initialTrains);
  const [bookings,setBookings] = useState<Booking[]>(seedBookings);
  const [selectedTrain,setSelectedTrain] = useState<TrainItem|null>(null);
  const [selectedClass,setSelectedClass] = useState("3A");
  const [passengers,setPassengers] = useState([{name:"",age:21,gender:"Male",berth:"No preference"}]);
  const [bookingStep,setBookingStep] = useState(0);
  const [pnrQuery,setPnrQuery] = useState("");
  const [pnrResult,setPnrResult] = useState<Booking|null>(null);
  const [toast,setToast] = useState("");
  const [filter,setFilter] = useState("All trains");
  const [userName,setUserName] = useState("Rohith");
  const [loggedIn,setLoggedIn] = useState(true);
  const [adminMode,setAdminMode] = useState(false);
  const [adminForm,setAdminForm] = useState(false);
  const [newTrain,setNewTrain] = useState({no:"",name:"",from:"New Delhi (NDLS)",to:"Mumbai Central (MMCT)",departure:"08:00",arrival:"18:00",duration:"10h 00m",type:"Express",fare:"1200"});
  const [cancelTarget,setCancelTarget] = useState<{pnr:string;index:number}|null>(null);

  useEffect(() => {
    try {
      const b = localStorage.getItem("railsync-bookings");
      const t = localStorage.getItem("railsync-trains");
      if (b) setBookings(JSON.parse(b));
      if (t) setTrains(JSON.parse(t));
    } catch {}
  },[]);
  useEffect(() => { try { localStorage.setItem("railsync-bookings",JSON.stringify(bookings)); } catch {} },[bookings]);
  useEffect(() => { try { localStorage.setItem("railsync-trains",JSON.stringify(trains)); } catch {} },[trains]);
  useEffect(() => { if(toast) { const id=setTimeout(()=>setToast(""),3200); return ()=>clearTimeout(id); } },[toast]);

  const results = useMemo(() => trains.filter(t => t.from.toLowerCase().includes(from.toLowerCase().split(" (")[0]) && t.to.toLowerCase().includes(to.toLowerCase().split(" (")[0]) && (filter==="All trains" || t.type===filter)),[trains,from,to,filter]);
  const allPassengers = bookings.flatMap(b=>b.passengers);
  const activeBookings = bookings.filter(b=>b.passengers.some(p=>p.status!=="CANCELLED"));
  const totalRevenue = bookings.reduce((s,b)=>s+b.fare,0);

  function swapStations(){setFrom(to);setTo(from);}
  function openBooking(t:TrainItem,cls:string){setSelectedTrain(t);setSelectedClass(cls);setPassengers([{name:"",age:21,gender:"Male",berth:"No preference"}]);setBookingStep(0);setPage("book");}
  function addPassenger(){if(passengers.length<6)setPassengers([...passengers,{name:"",age:21,gender:"Male",berth:"No preference"}]);}
  function updatePassenger(i:number,key:string,value:string|number){setPassengers(passengers.map((p,j)=>j===i?{...p,[key]:value}:p));}
  function allocateStatus(t:TrainItem,cls:string):Status {
    const a=t.availability[cls] || {cnf:0,rac:0,wl:0};
    if(a.cnf>0)return "CNF";
    if(a.rac>0)return "RAC";
    return "WL";
  }
  function confirmBooking(){
    if(!selectedTrain)return;
    if(passengers.some(p=>!p.name.trim() || p.age<1 || p.age>120)){setToast("Please enter valid details for every passenger.");return;}
    const status=allocateStatus(selectedTrain,selectedClass);
    const pList:Passenger[]=passengers.map((p,i)=>({...p,status,seat:status==="CNF"?`B${1+Math.floor(i/8)} / ${21+i}`:status==="RAC"?`RAC ${String(i+1).padStart(2,"0")}`:`WL ${String(i+1).padStart(2,"0")}`}));
    const b:Booking={pnr:makePnr(),trainNo:selectedTrain.no,trainName:selectedTrain.name,from:selectedTrain.from,to:selectedTrain.to,date,departure:selectedTrain.departure,arrival:selectedTrain.arrival,className:selectedClass,fare:selectedTrain.fare*passengers.length,passengers:pList,createdAt:new Date().toLocaleString(),payment:"Demo payment successful"};
    setBookings([b,...bookings]);
    setSelectedTrain(null);setBookingStep(0);setPage("bookings");setToast("Booking created successfully. Your demo PNR is "+b.pnr);
  }
  function promoteQueue(nextBookings:Booking[],trainNo:string){
    const pool=nextBookings.filter(b=>b.trainNo===trainNo).flatMap(b=>b.passengers.map((p,i)=>({b,i,p}))).filter(x=>x.p.status==="RAC"||x.p.status==="WL");
    const rac=pool.find(x=>x.p.status==="RAC");
    if(rac){rac.p.status="CNF";rac.p.seat="B1 / 24";return;}
    const wl=pool.find(x=>x.p.status==="WL");
    if(wl){wl.p.status="RAC";wl.p.seat="RAC 01";}
  }
  function cancelPassenger(pnr:string,index:number){
    const next=bookings.map(b=>({...b,passengers:b.passengers.map((p,i)=>i===index&&b.pnr===pnr?{...p,status:"CANCELLED" as Status,seat:undefined}: {...p})}));
    const target=next.find(b=>b.pnr===pnr);
    if(target)promoteQueue(next,target.trainNo);
    setBookings(next);setCancelTarget(null);setToast("Passenger cancelled. Reservation queue has been processed.");
  }
  function searchPnr(){const found=bookings.find(b=>b.pnr.toUpperCase()===pnrQuery.trim().toUpperCase());setPnrResult(found||null);if(!found)setToast("No booking found for that PNR.");}
  function addTrain(){
    if(!newTrain.no||!newTrain.name){setToast("Enter train number and name.");return;}
    setTrains([{id:"t"+Date.now(),no:newTrain.no,name:newTrain.name,from:newTrain.from,to:newTrain.to,departure:newTrain.departure,arrival:newTrain.arrival,duration:newTrain.duration,type:newTrain.type,fare:Number(newTrain.fare),classes:["3A","2A","SL"],availability:{"3A":{cnf:20,rac:5,wl:20},"2A":{cnf:10,rac:3,wl:12},"SL":{cnf:40,rac:8,wl:30}}},...trains]);
    setAdminForm(false);setToast("Train added to the demo timetable.");
  }
  function go(p:string){setPage(p);setMobileOpen(false);setSelectedTrain(null);}

  const navItems=[{id:"home",label:"Home",icon:TrainFront},{id:"search",label:"Search trains",icon:Search},{id:"pnr",label:"PNR enquiry",icon:Ticket},{id:"bookings",label:"My bookings",icon:ClipboardList}];
  return (
    <main>
      <div className="top-strip"><div className="container strip-inner"><span><span className="live-dot"/> Live CNF · RAC · WL reservation demo</span><span className="strip-right"><ShieldCheck size={13}/> Secure prototype <span className="strip-divider"/> Help centre</span></div></div>
      <header className="header"><div className="container header-inner">
        <button className="brand" onClick={()=>go("home")}><span className="brand-mark"><TrainFront size={23}/></span><span>rail<span>sync</span><small>SMART RAIL RESERVATIONS</small></span></button>
        <nav className="desktop-nav">{navItems.map(n=><button key={n.id} className={page===n.id?"nav-link active":"nav-link"} onClick={()=>go(n.id)}>{n.label}</button>)}</nav>
        <div className="header-actions"><button className="icon-btn" aria-label="Notifications"><Bell size={18}/></button><button className="profile-pill" onClick={()=>{setAdminMode(false);go("account")}}><span className="avatar">R</span><span>{userName}</span></button><button className="menu-btn" onClick={()=>setMobileOpen(!mobileOpen)}>{mobileOpen?<X/>:<Menu/>}</button></div>
      </div>
      {mobileOpen&&<div className="mobile-nav">{navItems.map(n=><button key={n.id} onClick={()=>go(n.id)}>{n.label}</button>)}<button onClick={()=>go("admin")}>Admin portal</button></div>}
      </header>

      <div className="container page-shell">
        {page==="home"&&<HomeView from={from} to={to} date={date} travelClass={travelClass} setFrom={setFrom} setTo={setTo} setDate={setDate} setTravelClass={setTravelClass} swap={swapStations} search={()=>go("search")} go={go} />}
        {page==="search"&&<section className="content-page">
          <div className="page-heading"><div><div className="eyebrow">PLAN YOUR JOURNEY</div><h1>Find your next <em>train.</em></h1><p>Compare schedules, fares and availability across popular routes.</p></div><span className="date-chip"><CalendarDays size={15}/>{new Date(date+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span></div>
          <SearchPanel from={from} to={to} date={date} travelClass={travelClass} setFrom={setFrom} setTo={setTo} setDate={setDate} setTravelClass={setTravelClass} swap={swapStations} onSearch={()=>{}}/>
          <div className="results-head"><div><h2>{results.length} trains found</h2><p>{from} <ArrowRight size={13}/> {to}</p></div><select className="select-small" value={filter} onChange={e=>setFilter(e.target.value)}><option>All trains</option><option>Rajdhani</option><option>Shatabdi</option><option>Vande Bharat</option><option>Superfast</option><option>Express</option></select></div>
          {results.length===0?<EmptyState title="No trains on this route" desc="Try another station pair or clear your filters."/>:<div className="train-list">{results.map(t=><TrainCard key={t.id} train={t} selectedClass={travelClass} onClass={setTravelClass} onBook={openBooking}/>)}</div>}
        </section>}
        {page==="book"&&selectedTrain&&<section className="content-page narrow-page">
          <button className="back-link" onClick={()=>go("search")}><ArrowRight className="back-arrow" size={15}/> Back to trains</button>
          <div className="page-heading"><div><div className="eyebrow">RESERVATION · {selectedTrain.no}</div><h1>Complete your <em>booking.</em></h1><p>{selectedTrain.name} · {selectedTrain.from} to {selectedTrain.to}</p></div></div>
          <div className="steps"><span className={bookingStep>=0?"step active": "step"}>01 <b>Passengers</b></span><i/><span className={bookingStep>=1?"step active":"step"}>02 <b>Review</b></span><i/><span className={bookingStep>=2?"step active":"step"}>03 <b>Confirm</b></span></div>
          {bookingStep===0&&<div className="panel"><div className="panel-title"><div><h2>Passenger details</h2><p>Add up to six passengers to one PNR.</p></div><span className="soft-tag">{selectedClass}</span></div>
            {passengers.map((p,i)=><div className="passenger-form" key={i}><div className="passenger-head"><b>Passenger {i+1}</b>{passengers.length>1&&<button className="text-danger" onClick={()=>setPassengers(passengers.filter((_,j)=>j!==i))}><Trash2 size={14}/> Remove</button>}</div><div className="form-grid"><label>Full name<input value={p.name} onChange={e=>updatePassenger(i,"name",e.target.value)} placeholder="As on identity document"/></label><label>Age<input type="number" min="1" max="120" value={p.age} onChange={e=>updatePassenger(i,"age",Number(e.target.value))}/></label><label>Gender<select value={p.gender} onChange={e=>updatePassenger(i,"gender",e.target.value)}><option>Male</option><option>Female</option><option>Other</option></select></label><label>Berth preference<select value={p.berth} onChange={e=>updatePassenger(i,"berth",e.target.value)}><option>No preference</option><option>Lower</option><option>Middle</option><option>Upper</option><option>Side lower</option><option>Side upper</option></select></label></div></div>)}
            {passengers.length<6&&<button className="add-passenger" onClick={addPassenger}><Plus size={15}/> Add another passenger</button>}
            <div className="panel-footer"><span className="muted">Fare estimate <b>{currency(selectedTrain.fare*passengers.length)}</b></span><button className="primary-btn" onClick={()=>{if(passengers.some(p=>!p.name.trim()))setToast("Please enter every passenger name.");else setBookingStep(1)}}>Continue to review <ArrowRight size={16}/></button></div>
          </div>}
          {bookingStep===1&&<div className="panel"><div className="panel-title"><div><h2>Review your journey</h2><p>Check passenger and travel details before confirming.</p></div></div><JourneySummary train={selectedTrain} date={date} cls={selectedClass}/><div className="review-passengers">{passengers.map((p,i)=><div key={i}><span>{i+1}. {p.name}</span><span>{p.age} · {p.gender} · {p.berth}</span></div>)}</div><div className="fare-row"><span>Total estimated fare</span><strong>{currency(selectedTrain.fare*passengers.length)}</strong></div><div className="notice"><Info size={16}/> This is a simulated academic prototype. No real payment will be collected and tickets are not valid for travel.</div><div className="panel-footer"><button className="secondary-btn" onClick={()=>setBookingStep(0)}>Edit passengers</button><button className="primary-btn" onClick={()=>setBookingStep(2)}>Proceed to demo payment <ArrowRight size={16}/></button></div></div>}
          {bookingStep===2&&<div className="panel confirm-panel"><div className="success-icon"><CheckCircle2 size={34}/></div><h2>Ready to confirm?</h2><p>Your demo booking will be saved locally in this browser.</p><div className="notice"><CreditCard size={16}/> Demo payment only — no card details or real payment are required.</div><button className="primary-btn full-btn" onClick={confirmBooking}>Confirm demo booking <CheckCircle2 size={16}/></button><button className="secondary-btn full-btn" onClick={()=>setBookingStep(1)}>Go back</button></div>}
        </section>}
        {page==="pnr"&&<section className="content-page narrow-page"><div className="page-heading"><div><div className="eyebrow">BOOKING ENQUIRY</div><h1>Track your <em>PNR.</em></h1><p>Get the latest reservation status for every passenger on your booking.</p></div></div><div className="pnr-search panel"><label>Enter your 10-character RailSync PNR</label><div className="pnr-input"><Ticket size={18}/><input value={pnrQuery} onChange={e=>setPnrQuery(e.target.value)} placeholder="e.g. RS48291630" onKeyDown={e=>e.key==="Enter"&&searchPnr()}/><button className="primary-btn" onClick={searchPnr}>Check status <ArrowRight size={15}/></button></div><p className="muted tiny">Try demo PNR: RS48291630</p></div>{pnrResult&&<BookingCard booking={pnrResult} onCancel={(i)=>setCancelTarget({pnr:pnrResult.pnr,index:i})}/>}</section>}
        {page==="bookings"&&<section className="content-page"><div className="page-heading"><div><div className="eyebrow">YOUR TRAVEL SPACE</div><h1>My <em>bookings.</em></h1><p>All your reservations, together in one place.</p></div><button className="primary-btn" onClick={()=>go("search")}><Plus size={16}/> New booking</button></div><div className="stats-grid"><Stat label="Total bookings" value={bookings.length.toString()} icon={<Ticket/>}/><Stat label="Active passengers" value={allPassengers.filter(p=>p.status!=="CANCELLED").length.toString()} icon={<Users/>}/><Stat label="Confirmed" value={allPassengers.filter(p=>p.status==="CNF").length.toString()} icon={<CheckCircle2/>}/><Stat label="On waiting list" value={allPassengers.filter(p=>p.status==="WL"||p.status==="RAC").length.toString()} icon={<Clock3/>}/></div>{bookings.length===0?<EmptyState title="No bookings yet" desc="Your next journey starts with a train search."/>:<div className="booking-list">{bookings.map(b=><BookingCard key={b.pnr} booking={b} onCancel={i=>setCancelTarget({pnr:b.pnr,index:i})}/>)}</div>}</section>}
        {page==="account"&&<section className="content-page narrow-page"><div className="page-heading"><div><div className="eyebrow">ACCOUNT SETTINGS</div><h1>Your <em>profile.</em></h1><p>Manage your RailSync demo account.</p></div></div><div className="panel profile-card"><div className="profile-large">R</div><h2>{userName} Sanapala</h2><p className="muted">Passenger account · Demo profile</p><label>Display name<input value={userName} onChange={e=>setUserName(e.target.value)}/></label><button className="primary-btn" onClick={()=>setToast("Profile updated in this browser.")}>Save profile</button><button className="secondary-btn" onClick={()=>{setLoggedIn(false);setPage("login")}}>Sign out</button></div></section>}
        {page==="login"&&<section className="content-page narrow-page"><div className="auth-card panel"><span className="brand-mark big"><TrainFront size={27}/></span><div className="eyebrow">PASSENGER PORTAL</div><h1>Welcome <em>aboard.</em></h1><p>Sign in to book tickets, track PNRs and manage your journeys.</p><label>Email address<input type="email" placeholder="you@example.com"/></label><label>Password<input type="password" placeholder="Enter your password"/></label><button className="primary-btn full-btn" onClick={()=>{setLoggedIn(true);go("home");setToast("Demo passenger session started.")}}>Sign in to RailSync <ArrowRight size={16}/></button><p className="tiny muted">Demo mode: no real authentication is configured.</p><button className="text-link" onClick={()=>go("admin")}>Administrator portal <ArrowUpRight size={14}/></button></div></section>}
        {page==="admin"&&<section className="content-page"><div className="page-heading"><div><div className="eyebrow">CONTROL OFFICE</div><h1>Operations <em>overview.</em></h1><p>Monitor the timetable, inventory and reservation activity.</p></div><button className="primary-btn" onClick={()=>setAdminForm(!adminForm)}><Plus size={16}/> Add train</button></div><div className="stats-grid"><Stat label="Scheduled trains" value={trains.length.toString()} icon={<Train/>}/><Stat label="Bookings created" value={bookings.length.toString()} icon={<Ticket/>}/><Stat label="Active passengers" value={allPassengers.filter(p=>p.status!=="CANCELLED").length.toString()} icon={<Users/>}/><Stat label="Demo booking value" value={currency(totalRevenue)} icon={<Wallet/>}/></div>{adminForm&&<div className="panel admin-form"><div className="panel-title"><h2>Add a train</h2><button className="icon-btn" onClick={()=>setAdminForm(false)}><X size={17}/></button></div><div className="form-grid"><label>Train number<input value={newTrain.no} onChange={e=>setNewTrain({...newTrain,no:e.target.value})} placeholder="e.g. 12952"/></label><label>Train name<input value={newTrain.name} onChange={e=>setNewTrain({...newTrain,name:e.target.value})} placeholder="Train name"/></label><label>From<select value={newTrain.from} onChange={e=>setNewTrain({...newTrain,from:e.target.value})}>{stationOptions.map(s=><option key={s}>{s}</option>)}</select></label><label>To<select value={newTrain.to} onChange={e=>setNewTrain({...newTrain,to:e.target.value})}>{stationOptions.map(s=><option key={s}>{s}</option>)}</select></label><label>Departure<input type="time" value={newTrain.departure} onChange={e=>setNewTrain({...newTrain,departure:e.target.value})}/></label><label>Arrival<input type="time" value={newTrain.arrival} onChange={e=>setNewTrain({...newTrain,arrival:e.target.value})}/></label><label>Duration<input value={newTrain.duration} onChange={e=>setNewTrain({...newTrain,duration:e.target.value})}/></label><label>Base fare<input type="number" value={newTrain.fare} onChange={e=>setNewTrain({...newTrain,fare:e.target.value})}/></label></div><button className="primary-btn" onClick={addTrain}>Save train <CheckCircle2 size={15}/></button></div>}<div className="admin-columns"><div className="panel"><div className="panel-title"><div><h2>Train inventory</h2><p>Manage the sample timetable.</p></div><span className="soft-tag">{trains.length} trains</span></div>{trains.map(t=><div className="admin-train" key={t.id}><div className="train-mini-icon"><TrainFront size={17}/></div><div className="admin-train-info"><b>{t.no} · {t.name}</b><span>{t.from.split(" (")[0]} → {t.to.split(" (")[0]}</span></div><strong>{currency(t.fare)}</strong><button className="icon-btn danger-icon" title="Remove train" onClick={()=>{setTrains(trains.filter(x=>x.id!==t.id));setToast("Train removed from sample timetable.")}}><Trash2 size={15}/></button></div>)}</div><div className="panel"><div className="panel-title"><div><h2>Reservation monitor</h2><p>Current passenger statuses.</p></div><span className="soft-tag">Live demo</span></div><div className="queue-metrics"><div><span className="status-dot green"/> <b>{allPassengers.filter(p=>p.status==="CNF").length}</b><small>Confirmed</small></div><div><span className="status-dot amber"/> <b>{allPassengers.filter(p=>p.status==="RAC").length}</b><small>RAC-like</small></div><div><span className="status-dot red"/> <b>{allPassengers.filter(p=>p.status==="WL").length}</b><small>Waiting list</small></div></div><div className="notice"><Info size={16}/> Demo data is stored in this browser. Production-grade queue consistency requires a transactional Java backend and database locking.</div><button className="secondary-btn full-btn" onClick={()=>go("bookings")}>View all bookings <ArrowRight size={15}/></button></div></div></section>}
      </div>

      <footer className="footer"><div className="container footer-top"><div className="footer-brand"><span className="brand-mark"><TrainFront size={22}/></span><div><b>rail<span>sync</span></b><small>SMART RAIL RESERVATIONS</small></div></div><p>An intelligent railway reservation and management prototype inspired by Indian Railways.</p><div className="footer-links"><button onClick={()=>go("search")}>Search trains</button><button onClick={()=>go("pnr")}>PNR enquiry</button><button onClick={()=>go("bookings")}>My bookings</button><button onClick={()=>go("admin")}>Admin portal</button></div></div><div className="container footer-bottom"><span>© 2026 RailSync. Academic demonstration prototype.</span><span>Not affiliated with Indian Railways or IRCTC. Simulated bookings are not valid for travel.</span></div></footer>

      {cancelTarget&&<div className="modal-backdrop"><div className="modal"><button className="modal-close" onClick={()=>setCancelTarget(null)}><X size={18}/></button><span className="warning-icon"><AlertCircle size={25}/></span><h2>Cancel this passenger?</h2><p>This will mark the selected passenger as cancelled and run the demo promotion process for the same train.</p><div className="modal-actions"><button className="secondary-btn" onClick={()=>setCancelTarget(null)}>Keep booking</button><button className="danger-btn" onClick={()=>cancelPassenger(cancelTarget.pnr,cancelTarget.index)}>Confirm cancellation</button></div></div></div>}
      {toast&&<div className="toast"><CheckCircle2 size={17}/>{toast}<button onClick={()=>setToast("")}><X size={15}/></button></div>}
    </main>
  );
}

function HomeView({from,to,date,travelClass,setFrom,setTo,setDate,setTravelClass,swap,search,go}:any){
  return <><section className="hero"><div className="hero-copy"><div className="eyebrow"><span className="live-dot"/> SMARTER RAIL TRAVEL STARTS HERE</div><h1>Your journey,<br/><em>one click away.</em></h1><p>Search trains across India, book for up to six passengers, track your PNR and move through the reservation queue automatically when seats open up.</p><div className="hero-points"><span><CheckCircle2 size={15}/> Simple booking</span><span><CheckCircle2 size={15}/> Smart queue updates</span><span><CheckCircle2 size={15}/> PNR tracking</span></div></div><div className="hero-art"><div className="route-glow"/><div className="hero-train-card"><div className="train-card-top"><span>YOUR NEXT JOURNEY</span><span className="live-pill"><i/> DEMO LIVE</span></div><div className="hero-route"><div><small>FROM</small><b>NDLS</b><span>New Delhi</span></div><div className="route-line"><span/><TrainFront size={22}/><span/></div><div><small>TO</small><b>MMCT</b><span>Mumbai Central</span></div></div><div className="hero-card-bottom"><span><CalendarDays size={14}/> Daily departures</span><span><ShieldCheck size={14}/> Secure prototype</span></div></div><div className="floating-chip chip-one"><span className="mini-check"><CheckCircle2 size={14}/></span><div><b>Seat confirmed</b><small>Coach B2 · Berth 31</small></div></div><div className="floating-chip chip-two"><span className="mini-clock"><RefreshCw size={14}/></span><div><b>Queue updated</b><small>WL 03 → RAC 01</small></div></div><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/></div></section>
    <SearchPanel from={from} to={to} date={date} travelClass={travelClass} setFrom={setFrom} setTo={setTo} setDate={setDate} setTravelClass={setTravelClass} swap={swap} onSearch={search}/>
    <section className="popular-section"><div className="section-heading"><div><div className="eyebrow">POPULAR ROUTES</div><h2>Where India travels <em>next.</em></h2><p>Explore a few of the country's most-travelled connections.</p></div><button className="text-link" onClick={()=>go("search")}>Explore all trains <ArrowRight size={15}/></button></div><div className="route-grid">{[{a:"NDLS",b:"MMCT",from:"New Delhi",to:"Mumbai",time:"15h 40m",no:"12951",type:"Rajdhani"},{a:"NDLS",b:"HWH",from:"New Delhi",to:"Kolkata",time:"17h 05m",no:"12301",type:"Rajdhani"},{a:"MAS",b:"SBC",from:"Chennai",to:"Bengaluru",time:"4h 25m",no:"12007",type:"Shatabdi"},{a:"NDLS",b:"BSB",from:"New Delhi",to:"Varanasi",time:"8h 00m",no:"22436",type:"Vande Bharat"}].map(r=><button className="route-card" key={r.no} onClick={()=>go("search")}><div className="route-card-top"><span className="route-type">{r.type}</span><ArrowUpRight size={16}/></div><div className="route-codes"><b>{r.a}</b><span className="dotted-route"/><b>{r.b}</b></div><div className="route-names"><span>{r.from}</span><span>{r.to}</span></div><div className="route-card-bottom"><span><Train size={13}/> {r.no}</span><span><Clock3 size={13}/> {r.time}</span></div></button>)}</div></section>
    <section className="engine-section"><div className="engine-copy"><div className="eyebrow">INTELLIGENT RESERVATION ENGINE</div><h2>Every cancellation<br/>moves someone <em>forward.</em></h2><p>Our academic booking prototype models a clear reservation flow. When a confirmed passenger cancels, the next eligible RAC-like passenger is promoted, followed by the waiting list.</p><button className="text-link" onClick={()=>go("pnr")}>Check a PNR <ArrowRight size={15}/></button></div><div className="status-flow"><div className="flow-card confirmed"><span className="flow-number">01</span><div className="flow-icon"><CheckCircle2/></div><div><b>Confirmed</b><small>Seat and berth allocated</small></div><span className="flow-badge">CNF</span></div><div className="flow-connector"><span/><small>When confirmed berths are full</small></div><div className="flow-card rac"><span className="flow-number">02</span><div className="flow-icon"><RefreshCw/></div><div><b>Reservation against cancellation</b><small>RAC-like shared berth status</small></div><span className="flow-badge">RAC</span></div><div className="flow-connector"><span/><small>When RAC capacity is full</small></div><div className="flow-card waiting"><span className="flow-number">03</span><div className="flow-icon"><Clock3/></div><div><b>Waiting list</b><small>First-in, first-out queue</small></div><span className="flow-badge">WL</span></div></div></section>
    <section className="features-section"><div className="section-heading centered"><div className="eyebrow">BUILT FOR BETTER JOURNEYS</div><h2>Everything you need,<br/><em>in one place.</em></h2></div><div className="feature-grid"><Feature icon={<SearchCheck/>} title="Smart train search" desc="Find trains by station, date and class, then compare departure times and fares."/><Feature icon={<Armchair/>} title="Automatic seat allocation" desc="A structured seat inventory helps prevent duplicate allocations in the booking model."/><Feature icon={<Users/>} title="Group bookings" desc="Add up to six passengers to one booking and manage each passenger's status."/><Feature icon={<Ticket/>} title="Live PNR tracking" desc="See the booking-time status alongside the latest simulated reservation status."/><Feature icon={<Wallet/>} title="Transparent fare summary" desc="Review estimated fares and demo cancellation records before confirming."/><Feature icon={<LayoutDashboard/>} title="Operations dashboard" desc="Administrators can manage the sample timetable and monitor reservation activity." /></div></section>
    <section className="cta-band"><div><div className="eyebrow">READY WHEN YOU ARE</div><h2>Your next journey<br/><em>starts here.</em></h2></div><button className="light-btn" onClick={search}>Search trains <ArrowRight size={16}/></button><div className="cta-decoration"><TrainFront size={112}/></div></section>
  </>;
}

function SearchPanel({from,to,date,travelClass,setFrom,setTo,setDate,setTravelClass,swap,onSearch}:any){
  return <div className="search-panel"><div className="search-panel-heading"><div><span className="search-icon"><Search size={17}/></span><div><b>Find your train</b><small>Search across popular Indian routes</small></div></div><span className="search-note"><ShieldCheck size={14}/> Simple. Smart. Seamless.</span></div><div className="search-fields"><label className="field station-field"><span>FROM</span><MapPin size={17}/><select value={from} onChange={e=>setFrom(e.target.value)}>{stationOptions.map(s=><option key={s}>{s}</option>)}</select></label><button className="swap-btn" onClick={swap} aria-label="Swap stations"><ArrowLeftRight size={17}/></button><label className="field station-field"><span>TO</span><MapPin size={17}/><select value={to} onChange={e=>setTo(e.target.value)}>{stationOptions.map(s=><option key={s}>{s}</option>)}</select></label><label className="field date-field"><span>JOURNEY DATE</span><CalendarDays size={17}/><input type="date" min={today} value={date} onChange={e=>setDate(e.target.value)}/></label><label className="field class-field"><span>TRAVEL CLASS</span><Armchair size={17}/><select value={travelClass} onChange={e=>setTravelClass(e.target.value)}><option>3A</option><option>2A</option><option>1A</option><option>SL</option><option>CC</option><option>EC</option></select></label><button className="search-submit" onClick={onSearch}><Search size={17}/> Search trains</button></div></div>
}

function TrainCard({train,selectedClass,onClass,onBook}:any){
  const cls=train.classes.includes(selectedClass)?selectedClass:train.classes[0];
  const a=train.availability[cls]||{cnf:0,rac:0,wl:0};
  return <div className="train-card"><div className="train-card-main"><div className="train-title"><span className="train-symbol"><TrainFront size={19}/></span><div><h3>{train.name}</h3><span>{train.no} · {train.type}</span></div></div><div className="train-times"><div><b>{train.departure}</b><span>{train.from.split(" (")[0]}</span></div><div className="duration"><span>{train.duration}</span><i/></div><div><b>{train.arrival}</b><span>{train.to.split(" (")[0]}</span></div></div></div><div className="train-card-bottom"><div className="class-options">{train.classes.map((c:string)=><button key={c} className={cls===c?"class-chip selected":"class-chip"} onClick={()=>onClass(c)}>{c}</button>)}</div><div className="availability"><span className={a.cnf>0?"avail-green":"avail-amber"}>{a.cnf>0?`${a.cnf} CNF`:a.rac>0?`${a.rac} RAC`:`${a.wl} WL`}</span><small>{currency(train.fare)} onwards</small></div><button className="book-btn" onClick={()=>onBook(train,cls)}>Book now <ArrowRight size={14}/></button></div></div>
}

function JourneySummary({train,date,cls}:any){return <div className="journey-summary"><div className="journey-train"><span className="train-symbol"><TrainFront size={19}/></span><div><b>{train.name}</b><small>{train.no} · {cls}</small></div></div><div className="journey-times"><div><b>{train.departure}</b><small>{train.from}</small></div><div><small>{train.duration}</small><i/></div><div><b>{train.arrival}</b><small>{train.to}</small></div></div><div className="journey-date"><CalendarDays size={15}/>{new Date(date+"T00:00:00").toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}</div></div>}

function BookingCard({booking,onCancel}:any){
  return <div className="booking-card"><div className="booking-card-head"><div><span className="eyebrow">PNR NUMBER</span><h3>{booking.pnr}</h3><small>Booked {booking.createdAt}</small></div><span className="soft-tag">{booking.payment}</span></div><JourneySummary train={{...booking}} date={booking.date} cls={booking.className}/><div className="booking-passengers"><div className="passenger-table-head"><span>PASSENGER</span><span>BOOKING STATUS</span><span>SEAT / BERTH</span><span>ACTION</span></div>{booking.passengers.map((p:Passenger,i:number)=><div className="passenger-row" key={i}><div><b>{p.name}</b><small>{p.age} · {p.gender}</small></div><div><StatusBadge status={p.status}/></div><span className="seat-text">{p.seat||"—"}</span><div>{p.status!=="CANCELLED"?<button className="cancel-link" onClick={()=>onCancel(i)}>Cancel</button>:<span className="muted tiny">Cancelled</span>}</div></div>)}</div><div className="booking-card-foot"><span>{booking.className} · {currency(booking.fare)}</span><span><CalendarDays size={13}/> {new Date(booking.date+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span></div></div>
}

function StatusBadge({status}:any){return <span className={`status-badge ${status.toLowerCase()}`}><i/>{statusLabel(status)}</span>}
function Feature({icon,title,desc}:any){return <div className="feature-card"><span className="feature-icon">{icon}</span><h3>{title}</h3><p>{desc}</p><ArrowUpRight className="feature-arrow" size={16}/></div>}
function Stat({label,value,icon}:any){return <div className="stat-card"><span className="stat-icon">{icon}</span><div><small>{label}</small><b>{value}</b></div></div>}
function EmptyState({title,desc}:any){return <div className="empty-state"><span><Search size={24}/></span><h3>{title}</h3><p>{desc}</p></div>}
