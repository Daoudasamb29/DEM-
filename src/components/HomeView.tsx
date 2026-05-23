import React, { useState, useEffect } from 'react';
import { Plane, Bus, Ticket, ChevronRight, ArrowRight } from 'lucide-react';
import { BookingData } from '../types';
import senegalTravelBanner from '../assets/images/senegal_travel_banner_1779489253831.png';
import logo from '../assets/images/logo.png';

interface HomeViewProps {
  onSelectStandardTrip: (from: string, to: string, price: number) => void;
  onSelectAibdTrip: () => void;
  onViewMyTickets: () => void;
  savedBookingsCount: number;
  availableTrips?: Array<{ from: string; to: string; price: number }>;
}

export default function HomeView({
  onSelectStandardTrip,
  onSelectAibdTrip,
  onViewMyTickets,
  savedBookingsCount,
  availableTrips
 }: HomeViewProps) {
  const [cardTop, setCardTop] = useState(typeof window !== 'undefined' ? window.innerHeight * 0.45 : 300);
  const [textOpacity, setTextOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scroll = window.scrollY
      const windowHeight = window.innerHeight
      const startTop = windowHeight * 0.45
      const endTop = 80
      if (scroll <= 150) {
        const newTop = startTop - ((startTop - endTop) * scroll / 150)
        setCardTop(newTop)
      } else {
        setCardTop(endTop)
      }

      const opacity = Math.max(0, 1 - scroll / 80)
      setTextOpacity(opacity)
    }
    window.addEventListener('scroll', handleScroll)
    // Run immediately
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // Standard routes available
  const defaultTrips = [
    { from: 'Dakar', to: 'Tivaouane', price: 2000 },
    { from: 'Tivaouane', to: 'Dakar', price: 2000 },
    { from: 'Dakar', to: 'Thiès', price: 1500 },
    { from: 'Thiès', to: 'Dakar', price: 1500 },
    { from: 'Dakar', to: 'Touba', price: 2500 },
    { from: 'Touba', to: 'Dakar', price: 2500 },
  ];

  const standardTrips = availableTrips && availableTrips.length > 0 ? availableTrips : defaultTrips;

  return (
    <div id="home-view" className="flex flex-col min-h-screen bg-[#EEF2FF]">
      {/* Background container or directly the fixed hero image */}
      <img 
        src={senegalTravelBanner} 
        alt="Voyage au Sénégal avec Niou Dem" 
        referrerPolicy="no-referrer"
        className="opacity-60 select-none pointer-events-none"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '50vh',
          zIndex: 0,
          objectFit: 'cover'
        }}
      />

      {/* Superposed Absolute/Fixed Content in top-left (stays visible) */}
      <div 
        className="flex flex-col gap-4 items-start select-none pointer-events-none p-1"
        style={{
          position: 'fixed',
          top: 20,
          left: 16,
          zIndex: 10
        }}
      >
        {/* Logo box */}
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md py-1.5 px-3.5 rounded-full border border-white/10 shadow-sm pointer-events-auto">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#F4841C]/80 bg-white flex items-center justify-center shadow-inner">
            <img 
              src={logo} 
              alt="DEM Logo Icon" 
              className="w-full h-full object-contain p-0.5"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-black text-[#F4841C] text-sm tracking-widest leading-none">DEM</span>
            <span className="text-[8px] text-indigo-200 mt-0.5 font-bold leading-none tracking-tight">niou_dem</span>
          </div>
        </div>

        {/* Bonjour / Où allez-vous text */}
        <div className="flex flex-col mt-2 drop-shadow-lg" style={{ opacity: textOpacity, transition: 'opacity 0.1s ease-out' }}>
          <span className="text-indigo-200 text-xs font-semibold tracking-wider uppercase">Bonjour 👋</span>
          <h2 className="text-white text-3xl font-black mt-1 leading-none tracking-tight">Où allez-vous ?</h2>
        </div>
      </div>

      {/* RENDERED CARDS BLOCK — Rounded top corners white container */}
      <div 
        className="pb-20 px-4"
        style={{
          marginTop: `${cardTop}px`,
          transition: 'margin-top 0.1s ease-out',
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.18)',
          position: 'relative',
          zIndex: 5,
          backgroundColor: 'white',
          minHeight: '100vh'
        }}
      >
        {/* Drag Handle Bar Accent */}
        <div style={{
          width: 36,
          height: 4,
          borderRadius: 2,
          backgroundColor: '#c8cfe8',
          margin: '8px auto 12px'
        }} />
        
        {/* Title */}
        <div className="flex items-center justify-between mb-4 mt-1">
          <h3 className="text-[#0D1B4B] text-base font-bold tracking-tight">Trajets disponibles</h3>
          <span className="text-xs text-indigo-500 font-medium">Glisser pour voir</span>
        </div>

        {/* CAROUSEL - Horizontal Swiper Card */}
        <div className="flex gap-4.5 overflow-x-auto pb-4 pt-1 snap-x scroll-smooth no-scrollbar select-none">
          {standardTrips.map((trip, idx) => (
            <div
              key={idx}
              onClick={() => onSelectStandardTrip(trip.from, trip.to, trip.price)}
              className="flex-shrink-0 w-[170px] bg-white rounded-2xl border border-indigo-100/80 p-4 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-300 cursor-pointer snap-start group relative overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 w-16 h-16 bg-orange-50/50 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 z-0"></div>
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-[#F4841C] mb-3 group-hover:bg-[#F4841C] group-hover:text-white transition-all duration-300">
                    <Bus className="w-4.5 h-4.5" />
                  </div>
                  
                  <div className="font-bold text-slate-800 text-base leading-snug">{trip.from}</div>
                  <div className="flex items-center gap-1.5 text-xs text-indigo-500 font-semibold my-1">
                    <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
                    <span>direction</span>
                  </div>
                  <div className="font-extrabold text-[#0D1B4B] text-lg leading-tight">{trip.to}</div>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-semibold">ALLER SIMPLE</span>
                    <span className="font-bold text-[#0D1B4B] font-mono text-sm">
                      {trip.price.toLocaleString('fr-FR')} <span className="text-[10px] text-[#F4841C] font-semibold">FCFA</span>
                    </span>
                  </div>
                  <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 group-hover:translate-x-1 duration-300">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SPECIAL AIRPORT CATEGORY - AIBD CARD */}
        <div className="mt-6">
          <h4 className="text-[#0D1B4B] text-sm font-bold tracking-tight mb-3">Service Spécial Aéroport</h4>
          
          <div
            onClick={onSelectAibdTrip}
            className="bg-[#1B3080] rounded-2xl p-5 shadow-md border border-indigo-900/40 relative overflow-hidden hover:opacity-95 transition-all duration-200 cursor-pointer scale-100 active:scale-98 group"
          >
            {/* Artistic element planes in background layer */}
            <div className="absolute -right-6 -bottom-6 text-white/5 pointer-events-none stroke-current">
              <Plane className="w-32 h-32 rotate-[35deg]" />
            </div>

            <div className="flex items-start justify-between relative z-10">
              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#F4841C] flex items-center justify-center text-white shadow-md">
                  <Plane className="w-5.5 h-5.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="text-white font-extrabold text-base tracking-tight">AIBD · Aéroport</h5>
                    <span className="bg-[#F4841C] text-white font-bold text-[8px] tracking-widest px-1.5 py-0.5 rounded uppercase">
                      SPÉCIAL
                    </span>
                  </div>
                  <p className="text-indigo-200 text-xs mt-1.5 font-medium">
                    Shuttle direct · Climatisation & grands bagages inclus
                  </p>
                  
                  <div className="flex gap-4 mt-3">
                    <div className="flex items-center gap-1 bg-[#0D1B4B]/30 px-2.5 py-1 rounded-md text-[10px] text-indigo-100 border border-indigo-700/30">
                      <span>✓ Bagages inclus (23kg)</span>
                    </div>
                    <div className="flex items-center gap-1 bg-[#0D1B4B]/30 px-2.5 py-1 rounded-md text-[10px] text-indigo-100 border border-indigo-700/30">
                      <span>✓ Climatisation garantie</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="self-center w-8 h-8 rounded-full bg-indigo-900/60 text-[#F4841C] flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4.5 h-4.5" />
              </div>
            </div>
          </div>
        </div>

        {/* MY RECENT TICKETS SECTION */}
        <div className="mt-7">
          <div
            onClick={onViewMyTickets}
            className="bg-white rounded-2xl border border-indigo-100/80 p-4.5 flex items-center justify-between shadow-sm cursor-pointer hover:border-indigo-300 transition-all active:scale-99 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">MES RÉSERVATIONS</span>
                <span className="text-[#0D1B4B] font-bold text-sm">
                  Consulter mes tickets ({savedBookingsCount})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {savedBookingsCount > 0 && (
                <span className="bg-red-500 text-white font-bold text-xs px-2.5 py-0.5 rounded-full">
                  {savedBookingsCount}
                </span>
              )}
              <ChevronRight className="w-5 h-5 text-indigo-300" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
