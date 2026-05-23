import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, User, Phone, MapPin, Briefcase, Snowflake, Check, HelpCircle } from 'lucide-react';
import { chargerHoraires } from '../supabase';

interface AibdFormViewProps {
  onBack: () => void;
  onSubmit: (data: {
    from: string;
    to: string;
    price: number;
    date: string;
    time: string;
    fullName: string;
    phone: string;
    departureAddress: string;
    options: {
      baggage: boolean;
      ac: boolean;
    };
  }) => void;
}

export default function AibdFormView({
  onBack,
  onSubmit
}: AibdFormViewProps) {
  
  // State variables for Airport Form
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [departureAddress, setDepartureAddress] = useState('');
  
  // Options states (Baggage checked, AC unchecked by default)
  const [baggage, setBaggage] = useState(true);
  const [ac, setAc] = useState(false);
  
  // Validation tracking
  const [errors, setErrors] = useState<{
    date?: string;
    time?: string;
    fullName?: string;
    phone?: string;
    departureAddress?: string;
  }>({});

  const [airportShuttleTimes, setAirportShuttleTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  useEffect(() => {
    if (!date) {
      setAirportShuttleTimes([]);
      return;
    }
    setLoadingTimes(true);
    chargerHoraires('Dakar', 'AIBD')
      .then((hours) => {
        setAirportShuttleTimes(hours);
        if (hours && hours.length > 0) {
          setTime(hours[0]);
        }
      })
      .catch((err) => {
        console.error("Erreur de chargement des navettes:", err);
        setAirportShuttleTimes(['08h30', '12h00', '16h30', '20h00']);
        setTime('08h30');
      })
      .finally(() => {
        setLoadingTimes(false);
      });
  }, [date]);

  const fixedPrice = 6000; // Special AIBD shuttle flat rate in FCFA

  const handleConfirmAibd = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    // Validate date
    if (!date) {
      newErrors.date = 'La date du voyage est requise.';
    }

    // Validate departure time
    if (date && !time) {
      newErrors.time = 'Veuillez choisir un horaire de navette.';
    }

    // Validate passenger name
    if (!fullName.trim()) {
      newErrors.fullName = 'Le nom complet du voyageur est requis.';
    }

    // Validate phone number
    const numericPhone = phoneNumber.replace(/\s+/g, '');
    if (!numericPhone) {
      newErrors.phone = 'Le numéro de portable est requis.';
    } else if (numericPhone.length < 7) {
      newErrors.phone = 'Saisir au moins 7 chiffres.';
    }

    // Validate departure/pickup address
    if (!departureAddress.trim()) {
      newErrors.departureAddress = 'L\'adresse de prise en charge est requise.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to first error element
      const firstErrorKey = Object.keys(newErrors)[0];
      const elem = document.getElementById(`field-${firstErrorKey}`);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setErrors({});
    onSubmit({
      from: 'Dakar',
      to: 'AIBD Aéroport',
      price: fixedPrice,
      date,
      time,
      fullName: fullName.trim(),
      phone: `+221 ${phoneNumber.trim()}`,
      departureAddress: departureAddress.trim(),
      options: {
        baggage,
        ac
      }
    });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div id="aibd-form-view" className="flex flex-col min-h-screen bg-[#EEF2FF]">
      {/* HEADER SPECIALE AIRPORT - Dark Blue #1B3080 */}
      <header className="bg-[#1B3080] text-white py-4 px-4 shadow-md flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            aria-label="Retour"
            className="p-1.5 hover:bg-slate-800/40 rounded-lg text-indigo-200 hover:text-white transition-transform active:scale-90"
          >
            <ArrowLeft className="w-5.5 h-5.5" />
          </button>
          <div>
            <h2 className="font-bold text-base leading-snug">AIBD · Aéroport</h2>
            <p className="text-[10px] text-indigo-250 font-medium">Navette Aéroport Spéciale · 6 000 FCFA</p>
          </div>
        </div>
        
        <span className="bg-[#F4841C] text-white font-extrabold text-[8.5px] tracking-wider px-2.5 py-1 rounded">
          SPÉCIAL
        </span>
      </header>

      {/* FORM FILLING WORKFLOW CONTAINER */}
      <form onSubmit={handleConfirmAibd} className="flex-1 p-5 pb-24 flex flex-col gap-5 max-w-xl mx-auto w-full">
        
        {/* FIELD 1: DATE OF TRAVEL (MANDATORY & BLOCKING) */}
        <div id="field-date" className="bg-white rounded-2xl border border-indigo-100 p-4 shadow-sm">
          <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>1. Date du voyage <span className="text-xs text-red-500 font-bold">*</span></span>
            <span className="text-[9px] text-[#F4841C] font-bold font-mono">ÉTAPE BLOCKANTE</span>
          </label>
          
          <div 
            className={`flex items-center gap-3 bg-white rounded-xl px-3.5 py-3 transition-colors relative ${
              errors.date ? 'border-2 border-red-500' : 'border-1.5 border-[#F4841C]'
            }`}
          >
            <Calendar className="w-5 h-5 text-[#F4841C]" />
            <input 
              type="date"
              min={today}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (errors.date) setErrors(prev => ({ ...prev, date: undefined }));
              }}
              className="w-full bg-transparent focus:outline-none text-slate-800 text-sm font-semibold cursor-pointer"
            />
          </div>
          
          <p className="text-[10px] text-[#F4841C] font-semibold mt-1.5 leading-snug flex items-center gap-1">
            <HelpCircle className="w-3 h-3 flex-shrink-0" />
            <span>Sélectionnez une date pour voir les horaires des navettes.</span>
          </p>
          
          {errors.date && (
            <p className="text-xs text-red-500 font-bold mt-1.5">{errors.date}</p>
          )}
        </div>

        {/* FIELD 2: SHUTTLE TIMES (ONLY SHOWS AFTER DATE SELECTION) */}
        {date ? (
          <div id="field-time" className="bg-[#0D1B4B] rounded-2xl p-4.5 shadow-md border border-indigo-950/65 animate-fadeIn">
            <label className="block text-indigo-200 font-bold text-xs uppercase tracking-wider mb-3 flex justify-between items-center">
              <span>2. Horaires des navettes · AIBD <span className="text-red-400 font-bold">*</span></span>
              {loadingTimes && (
                <span className="text-[10px] text-orange-400 animate-pulse font-normal">Chargement...</span>
              )}
            </label>
            
            <div className="flex gap-2.5 flex-wrap">
              {airportShuttleTimes.map((hour) => {
                const isSelected = time === hour;
                return (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => {
                      setTime(hour);
                      if (errors.time) setErrors(prev => ({ ...prev, time: undefined }));
                    }}
                    className={`flex-1 min-w-[80px] text-center font-bold text-sm py-2 px-3.5 rounded-xl transition-all ${
                      isSelected 
                        ? 'bg-[#F4841C] text-white ring-2 ring-orange-300' 
                        : 'bg-[#1B3080] text-indigo-200 border border-indigo-700/30 hover:bg-indigo-850'
                    }`}
                  >
                    {hour}
                  </button>
                );
              })}
            </div>
            
            {errors.time && (
              <p className="text-xs text-red-400 font-bold mt-2">{errors.time}</p>
            )}
          </div>
        ) : (
          /* Orange Alert box for missing date */
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 text-center text-orange-700 text-xs py-6 flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#F4841C] mb-2 font-black select-none text-base">
              !
            </div>
            <span className="font-extrabold text-[#F4841C] mb-1">Information requise</span>
            <span className="font-bold text-amber-800">Sélectionnez une date pour voir les trajets disponibles.</span>
          </div>
        )}

        {/* FIELD 3: PASSENGER FULL NAME */}
        <div id="field-fullName" className="bg-white rounded-2xl border border-indigo-100 p-4 shadow-sm font-sans">
          <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider mb-2">
            3. Nom complet <span className="text-red-500 font-bold">*</span>
          </label>
          <div className={`flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 transition-colors ${errors.fullName ? 'border-red-500 bg-red-50/10' : 'focus-within:border-indigo-400 focus-within:bg-white'}`}>
            <User className="w-4.5 h-4.5 text-slate-450" />
            <input 
              type="text"
              placeholder="Ex: Fatou Ndiaye"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors(prev => ({ ...prev, fullName: undefined }));
              }}
              className="w-full bg-transparent focus:outline-none text-slate-800 text-sm font-semibold"
            />
          </div>
          {errors.fullName && (
            <p className="text-xs text-red-500 font-bold mt-1.5">{errors.fullName}</p>
          )}
        </div>

        {/* FIELD 4: TELEPHONE PORTABLE WITH +221 FIXED PRE-STYLING */}
        <div id="field-phone" className="bg-white rounded-2xl border border-indigo-100 p-4 shadow-sm">
          <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider mb-2">
            4. Numéro de téléphone <span className="text-red-500 font-bold">*</span>
          </label>
          <div className={`flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 transition-colors ${errors.phone ? 'border-red-500 bg-red-50/10' : 'focus-within:border-indigo-400 focus-within:bg-white'}`}>
            <Phone className="w-4.5 h-4.5 text-slate-450 mr-1" />
            <span className="text-slate-550 text-sm font-extrabold select-none border-r border-slate-350 pr-2 mr-1">
              +221
            </span>
            <input 
              type="tel"
              pattern="[0-9 ]*"
              placeholder="70 987 65 43"
              value={phoneNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9 ]/g, '');
                setPhoneNumber(val);
                if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
              }}
              className="w-full bg-transparent focus:outline-none text-slate-800 text-sm font-mono font-bold tracking-wide"
            />
          </div>
          {errors.phone && (
            <p className="text-xs text-red-500 font-bold mt-1.5">{errors.phone}</p>
          )}
        </div>

        {/* FIELD 5: ADRESSE DE DEPART (SAISIE LIBRE) */}
        <div id="field-departureAddress" className="bg-white rounded-2xl border border-indigo-100 p-4 shadow-sm">
          <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider mb-2">
            5. Adresse de prise en charge <span className="text-red-500 font-bold">*</span>
          </label>
          <div className={`flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 transition-colors ${errors.departureAddress ? 'border-red-500 bg-red-50/10' : 'focus-within:border-indigo-400 focus-within:bg-white'}`}>
            <MapPin className="w-4.5 h-4.5 text-[#F4841C] mt-0.5" />
            <input 
              type="text"
              placeholder="Ex: Almadies, en face de la banque, Dakar"
              value={departureAddress}
              onChange={(e) => {
                setDepartureAddress(e.target.value);
                if (errors.departureAddress) setErrors(prev => ({ ...prev, departureAddress: undefined }));
              }}
              className="w-full bg-transparent focus:outline-none text-slate-800 text-sm font-semibold"
            />
          </div>
          <p className="text-[9px] text-slate-400 mt-1 font-medium italic">Saisissez l'adresse exacte pour la prise en charge par notre chauffeur.</p>
          {errors.departureAddress && (
            <p className="text-xs text-red-500 font-bold mt-1.5">{errors.departureAddress}</p>
          )}
        </div>

        {/* SECTION: OPTIONS SUPPLEMENTAIRES (CHECKBOXES CLIM & BAGAGES) */}
        <div className="bg-white rounded-2xl border border-indigo-100 p-4 shadow-sm">
          <span className="block text-slate-700 font-bold text-xs uppercase tracking-wider mb-3">
            Options supplémentaires
          </span>
          
          <div className="flex flex-col gap-3">
            {/* Bagages inclus options */}
            <div 
              onClick={() => setBaggage(!baggage)}
              className={`flex items-center justify-between rounded-xl px-4 py-3 transition-all cursor-pointer border ${
                baggage 
                  ? 'border-[#F4841C] bg-white text-slate-800 shadow-sm' 
                  : 'border-slate-200 bg-slate-50/50 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${baggage ? 'bg-orange-50 text-[#F4841C]' : 'bg-slate-150 text-slate-400'}`}>
                  <Briefcase className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="block text-xs font-bold font-sans">Bagages inclus</span>
                  <span className="block text-[10px] text-slate-400">Jusqu'à 23 kg de bagages en soute</span>
                </div>
              </div>
              
              <div className={`w-5.5 h-5.5 rounded-lg flex items-center justify-center transition-all border ${
                baggage ? 'bg-[#F4841C] border-[#F4841C]' : 'border-slate-350 bg-white'
              }`}>
                {baggage && <Check className="w-4 h-4 text-white stroke-[3px]" />}
              </div>
            </div>

            {/* Climatisation option */}
            <div 
              onClick={() => setAc(!ac)}
              className={`flex items-center justify-between rounded-xl px-4 py-3 transition-all cursor-pointer border ${
                ac 
                  ? 'border-[#F4841C] bg-white text-slate-800 shadow-sm' 
                  : 'border-slate-200 bg-slate-50/50 text-slate-550'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${ac ? 'bg-orange-50 text-[#F4841C]' : 'bg-slate-150 text-slate-400'}`}>
                  <Snowflake className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="block text-xs font-bold font-sans">Climatisation</span>
                  <span className="block text-[10px] text-slate-400">Véhicule climatisé haut de gamme</span>
                </div>
              </div>
              
              <div className={`w-5.5 h-5.5 rounded-lg flex items-center justify-center transition-all border ${
                ac ? 'bg-[#F4841C] border-[#F4841C]' : 'border-slate-300 bg-white'
              }`}>
                {ac && <Check className="w-4 h-4 text-white stroke-[3px]" />}
              </div>
            </div>
          </div>
        </div>

        {/* CTA SUBMISSION BUTTON */}
        <div className="mt-4 pt-2">
          <button
            type="submit"
            className="w-full bg-[#F4841C] text-white font-bold py-3.5 px-6 rounded-xl hover:bg-[#eb770f] active:scale-98 transition-all duration-150 shadow-md text-sm capitalize"
          >
            Confirmer · AIBD
          </button>
        </div>

      </form>
    </div>
  );
}
