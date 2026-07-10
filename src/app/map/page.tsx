"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/translations/context";
import { Compass, ArrowLeft, Sparkles, MapPin, X } from "lucide-react";

interface MapLocation {
  id: string;
  nameKey: "mines" | "minerals" | "walks";
  name: { en: string; pl: string; cs: string };
  x: number; // percentage
  y: number; // percentage
  details: {
    en: string;
    pl: string;
    cs: string;
  };
  geology: {
    en: string;
    pl: string;
    cs: string;
  };
  lore: {
    en: string;
    pl: string;
    cs: string;
  };
}

export default function MapPage() {
  const { t, language, setLanguage } = useTranslation();
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);

  const locations: MapLocation[] = [
    {
      id: "krobica-mine",
      nameKey: "mines",
      name: {
        en: "St. John Mine & St. Leopold Adit (Krobica)",
        pl: "Kopalnia św. Jana i Sztolnia św. Leopolda (Krobica)",
        cs: "Důl sv. Jana a Štola sv. Leopolda (Krobica)",
      },
      x: 35,
      y: 40,
      details: {
        en: "A historic 16th-century tin mine and an 18th-century cobalt mine located just minutes from the farm.",
        pl: "Zabytkowa XVI-wieczna kopalnia cyny i XVIII-wieczna kopalnia kobaltu położona zaledwie kilka minut od gospodarstwa.",
        cs: "Historický cínový důl z 16. století a kobaltový důl z 18. století nacházející se jen několik minut od naší farmy.",
      },
      geology: {
        en: "Hosts cassiterite (tin) and cobaltite (cobalt) mineralizations embedded in chlorite-mica schists.",
        pl: "Miejsce występowania kasyterytu (cyna) i kobaltynu (kobalt) w obrębie łupków chlorytowo-łyszczykowych.",
        cs: "Naleziště kasiteritu (cín) a kobaltinu (kobalt) v chloriticko-muskovitických břidlicích.",
      },
      lore: {
        en: "Walloons mined cobalt here for blue paint pigments. The tunnels are said to be guarded by the Mountain Spirit (Liczyrzepa).",
        pl: "Walończycy wydobywali tu kobalt do produkcji niebieskiego barwnika. Podziemia były według legend strzeżone przez Ducha Gór (Liczyrzepę).",
        cs: "Vlaši zde těžili kobalt pro výrobu modré barvy. Štoly jsou podle pověstí střeženy krkonošským Duchem hor (Rýbrcoulem).",
      },
    },
    {
      id: "przecznica-mine",
      nameKey: "mines",
      name: {
        en: "Anna Maria Mine (Przecznica)",
        pl: "Kopalnia Anna Maria (Przecznica)",
        cs: "Důl Anna Maria (Przecznica)",
      },
      x: 55,
      y: 45,
      details: {
        en: "An abandoned, deep historical mining site famous for rich cobalt veins.",
        pl: "Opuszczony, głęboki historyczny rejon górniczy słynący z bogatych żył kobaltowych.",
        cs: "Opuštěný, hluboký historický důl proslulý bohatými kobaltovými žílami.",
      },
      geology: {
        en: "Associated with pyrrhotite, chalcopyrite, and gold (electrum) traces in quartz-chlorite layers.",
        pl: "Współwystępuje z pirotynem, chalkopirytem oraz śladami złota (elektrum) w warstwach kwarcowo-chlorytowych.",
        cs: "Spojeno s výskytem pyrrhotinu, chalkopyritu a stopami zlata (elektrum) v křemeno-chloritických polohách.",
      },
      lore: {
        en: "Mentioned in old Walloon books as a place of 'heavy gold.' Prospectors cast circles here to keep the demon Liczyrzepa asleep.",
        pl: "Wspomniane w starych księgach walońskich jako miejsce 'ciężkiego złota'. Poszukiwacze odprawiali tu rytuały ochronne.",
        cs: "Zmíněno ve starých vlašských knihách jako místo 'těžkého zlata'. Hledači zde prováděli ochranné rituály, aby udrželi Ducha hor v klidu.",
      },
    },
    {
      id: "chybotek-boulder",
      nameKey: "minerals",
      name: {
        en: "Chybotek Boulder & Evening Castle",
        pl: "Głaz Chybotek i Zamek Wieczorny",
        cs: "Viklan Chybotek a Večerní Zámek",
      },
      x: 75,
      y: 75,
      details: {
        en: "A legendary massive granite boulder that can be rocked. Nearby lies the high ridge of Evening Castle.",
        pl: "Legendarny, potężny głaz granitowy, który można rozkołysać. W pobliżu wznosi się grzbiet Zamku Wieczornego.",
        cs: "Legendární obří žulový balvan (viklan), který lze rozkývat. V blízkosti se nachází hřeben Večerního zámku.",
      },
      geology: {
        en: "Outcrops of massive Variscan granite and quartz veins bearing amethyst and rock crystal.",
        pl: "Wystąpienia masywnego granitu karkonoskiego i żył kwarcu z ametystem i kryształem górskim.",
        cs: "Výskyty variské žuly a křemenných žil nesoucích ametysty a křišťál.",
      },
      lore: {
        en: "Walloons believed Chybotek blocked the entrance to the Mountain Spirit's underground treasure chamber.",
        pl: "Walończycy wierzyli, że Chybotek blokuje wejście do podziemnych skarbców Ducha Gór.",
        cs: "Vlaši věřili, že Chybotek blokuje vstup do podzemní klenotnice Ducha hor.",
      },
    },
    {
      id: "izera-gneiss",
      nameKey: "minerals",
      name: {
        en: "Izera Gneiss Outcrop (Mirsk Foothills)",
        pl: "Wychodnia Gnejsów Izerskich (Pogórze Mirska)",
        cs: "Výchozy Jizerské Žuly (Podhůří Mirsku)",
      },
      x: 25,
      y: 20,
      details: {
        en: "Exposed rock faces along forest pathways near our farm.",
        pl: "Odsłonięcia skalne wzdłuż leśnych ścieżek w pobliżu naszego gospodarstwa.",
        cs: "Odkryté skalní stěny podél lesních stezek v blízkosti naší farmy.",
      },
      geology: {
        en: "Laminated gneiss rich in pink feldspar bands, studded with dark red almandine garnets and quartz lenses.",
        pl: "Laminowany gnejs bogaty w różowy skaleń, usiany ciemnoczerwonymi granatami i soczewkami kwarcu.",
        cs: "Laminovaná rula bohatá na růžový živec, usazená tmavě červenými almandinovými granáty a křemennými čočkami.",
      },
      lore: {
        en: "Called 'Dragon Scale' in local lore. Walloons searched these cliffs for quartz veins containing shiny iron sulfides.",
        pl: "W lokalnych legendach nazywane 'Smoczą Łuską'. Walończycy przeszukiwali te skały w poszukiwaniu złocistych siarczków.",
        cs: "V lidové tradici nazývaná 'Dračí Šupina'. Vlaši prohledávali tyto skály a hledali křemenné žíly se zlatavými sulfidy.",
      },
    },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between min-h-screen">
      {/* Header */}
      <header className="border-b border-gold/15 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-gold" />
            <span className="font-serif font-bold text-lg text-gold gold-text-glow tracking-wide">
              {t.common.title}
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="flex items-center gap-1.5 border border-gold/20 bg-black/50 px-2 py-1 rounded text-xs">
              {["en", "pl", "cs"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang as any)}
                  className={`px-1.5 py-0.5 rounded transition ${
                    language === lang ? "bg-gold text-black font-semibold" : "text-gray-400 hover:text-gold"
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full flex flex-col items-center">
        {/* Back Button */}
        <div className="w-full mb-6 flex justify-between items-center">
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-gold/80 hover:text-gold transition">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.common.back}</span>
          </Link>
          <span className="text-[10px] text-gray-500 font-serif italic uppercase tracking-wider">
            Mirsk & Izera Mountains Region
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2 text-center">
          {t.public.map.title}
        </h1>
        <p className="text-xs text-gray-400 text-center mb-8 max-w-md">
          {t.public.map.description}
        </p>

        {/* Map Container */}
        <div className="w-full grid md:grid-cols-3 gap-6 items-start">
          {/* SVG Map Card */}
          <div className="md:col-span-2 relative border border-[#cbbb9d] rounded-lg overflow-hidden bg-[#ebdcb9] shadow-2xl w-full aspect-[4/3]">
            {/* Background Parchment Map Grid */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-70 mix-blend-multiply"
              style={{ backgroundImage: "url('/walloon_parchment_bg.png')" }}
            ></div>

            {/* Simulated Hand-Drawn Map Markings */}
            <svg viewBox="0 0 400 300" className="w-full h-full absolute inset-0 select-none">
              {/* Grid Lines */}
              <line x1="100" y1="0" x2="100" y2="300" stroke="rgba(100, 75, 45, 0.12)" strokeWidth="0.5" />
              <line x1="200" y1="0" x2="200" y2="300" stroke="rgba(100, 75, 45, 0.12)" strokeWidth="0.5" />
              <line x1="300" y1="0" x2="300" y2="300" stroke="rgba(100, 75, 45, 0.12)" strokeWidth="0.5" />
              <line x1="0" y1="100" x2="400" y2="100" stroke="rgba(100, 75, 45, 0.12)" strokeWidth="0.5" />
              <line x1="0" y1="200" x2="400" y2="200" stroke="rgba(100, 75, 45, 0.12)" strokeWidth="0.5" />

              {/* Hand Drawn Rivers */}
              <path 
                d="M -10 100 Q 150 90 200 130 T 410 200" 
                fill="none" 
                stroke="rgba(75, 101, 132, 0.45)" 
                strokeWidth="2.5" 
                strokeDasharray="5 2"
              />
              <text x="310" y="195" fill="rgba(75, 101, 132, 0.65)" className="font-serif italic font-bold text-[7px]">Kwisa River</text>

              {/* Mountain ridge outlines */}
              <path d="M 50 250 L 100 210 L 130 230 L 190 180 L 250 210 L 320 160 L 390 220" fill="none" stroke="rgba(127, 100, 49, 0.35)" strokeWidth="1.5" />
              <text x="180" y="174" fill="rgba(127, 100, 49, 0.55)" className="font-serif italic font-black text-[7px] tracking-widest uppercase">Izera Foothills</text>
              
              {/* Town Labels for Context */}
              <text x="75" y="45" fill="#4a3b22" stroke="none" className="font-serif font-black text-[9px] uppercase tracking-wider">Mirsk</text>
              <text x="130" y="105" fill="#4a3b22" stroke="none" className="font-serif font-black text-[9px] uppercase tracking-wider">Krobica</text>
              <text x="200" y="155" fill="#4a3b22" stroke="none" className="font-serif font-black text-[9px] uppercase tracking-wider">Przecznica</text>
              <text x="50" y="200" fill="#4a3b22" stroke="none" className="font-serif font-black text-[9px] uppercase tracking-wider">Świeradów-Zdrój</text>
              <text x="275" y="245" fill="#4a3b22" stroke="none" className="font-serif font-black text-[9px] uppercase tracking-wider">Szklarska Poręba</text>

              {/* Map Scale Bar */}
              <g transform="translate(20, 265)" stroke="rgba(100, 75, 45, 0.7)" strokeWidth="0.75" fill="none">
                <line x1="0" y1="0" x2="60" y2="0" />
                <line x1="0" y1="-3" x2="0" y2="3" />
                <line x1="30" y1="-2" x2="30" y2="2" />
                <line x1="60" y1="-3" x2="60" y2="3" />
                <text x="0" y="-5" stroke="none" fill="#4a3b22" className="font-sans font-bold text-[6px]">0</text>
                <text x="27" y="-5" stroke="none" fill="#4a3b22" className="font-sans font-bold text-[6px]">2</text>
                <text x="56" y="-5" stroke="none" fill="#4a3b22" className="font-sans font-bold text-[6px]">4 km</text>
                <text x="0" y="9" stroke="none" fill="rgba(100, 75, 45, 0.8)" className="font-serif font-black text-[6px] tracking-wide uppercase">Stara Kamienica Schist Belt</text>
              </g>

              {/* Compass Rose */}
              <g transform="translate(50, 50)" stroke="rgba(127, 100, 49, 0.6)" strokeWidth="0.75" fill="none">
                <circle cx="0" cy="0" r="15" />
                <line x1="0" y1="-20" x2="0" y2="20" />
                <line x1="-20" y1="0" x2="20" y2="0" />
                <polygon points="0,-20 3,-5 0,0 -3,-5" fill="rgba(127, 100, 49, 0.25)" />
                <polygon points="0,20 3,5 0,0 -3,5" fill="rgba(127, 100, 49, 0.15)" />
                <text x="-2.5" y="-23" fill="#4a3b22" stroke="none" className="font-serif text-[8px] font-black">N</text>
              </g>
            </svg>

            {/* Interactive Pins */}
            {locations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => setSelectedLocation(loc)}
                style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full border shadow-xl group transition cursor-pointer ${
                  selectedLocation?.id === loc.id
                    ? "border-gold bg-black text-gold scale-120 ring-4 ring-gold/20"
                    : "border-gold-dark/40 bg-[#3b301c] text-[#f7ebd3] hover:border-gold hover:bg-black hover:text-gold"
                }`}
              >
                <MapPin className="w-4 h-4 group-hover:animate-bounce" />
              </button>
            ))}
          </div>

          {/* Details Panel */}
          <div className="w-full h-full flex flex-col">
            {selectedLocation ? (
              <div className="parchment-card p-5 rounded-lg relative overflow-hidden flex-1 flex flex-col justify-between aspect-square md:aspect-auto">
                {/* Corner details */}
                <div className="absolute top-2 left-2 border-t border-l border-gold-dark/30 w-3 h-3"></div>
                <div className="absolute top-2 right-2 border-t border-r border-gold-dark/30 w-3 h-3"></div>

                <div className="flex-1">
                  <div className="flex items-start justify-between border-b border-gold-dark/20 pb-2 mb-3">
                    <h3 className="font-serif font-black text-gold-dark text-base">
                      {selectedLocation.name[language]}
                    </h3>
                    <button
                      onClick={() => setSelectedLocation(null)}
                      className="text-gold-dark/60 hover:text-gold-dark p-0.5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs leading-relaxed text-[#3b301c]">
                    <div>
                      <h4 className="font-serif font-bold text-gold-dark text-[9px] uppercase tracking-wider mb-0.5">
                        Overview
                      </h4>
                      <p>{selectedLocation.details[language]}</p>
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-gold-dark text-[9px] uppercase tracking-wider mb-0.5">
                        Geology
                      </h4>
                      <p className="italic font-semibold">{selectedLocation.geology[language]}</p>
                    </div>

                    <div className="bg-[#f0e3c7]/60 p-3 rounded border border-[#cbbb9d] italic shadow-inner mt-2">
                      <h4 className="font-serif font-black text-gold-dark not-italic text-[9px] uppercase tracking-wider mb-0.5">
                        Walloon Legend
                      </h4>
                      <p className="font-serif text-[#42351f]">
                        "{selectedLocation.lore[language]}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="codex-card p-5 rounded-lg flex flex-col items-center justify-center text-center text-xs text-gray-400 aspect-square md:aspect-auto md:h-full border border-gold/15 py-12">
                <Compass className="w-8 h-8 text-gold/30 mb-2" />
                <p className="font-serif italic">
                  Select a marker on the map to read its secrets and geological profiles.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 bg-black/50 py-4 text-center text-[10px] text-gray-500 font-sans mt-auto">
        <p>© 2026 Future Solutions AI — Walloon. All rights reserved.</p>
      </footer>
    </div>
  );
}
