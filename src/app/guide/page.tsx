"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/translations/context";
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Download, 
  CheckCircle, 
  Compass, 
  ArrowLeft, 
  HelpCircle,
  Music,
  DownloadCloud,
  Loader2
} from "lucide-react";

// Web Audio API Cave Synthesizer for 100% Offline Ambient Sound
class CaveAmbientSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;
  private isRunning: boolean = false;
  private dripInterval: any = null;
  private hammerInterval: any = null;
  private rumbleNodes: any[] = [];
  private windNodes: any[] = [];

  constructor() {}

  public start() {
    if (this.isRunning) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Force resume to bypass browser autoplay restrictions (crucial for iOS Safari)
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.08, this.ctx.currentTime); // keep ambient low and subtle
      this.masterGain.connect(this.ctx.destination);
      this.isRunning = true;

      this.startRumble();
      this.startWind();
      this.startDrips();
    } catch (e) {
      console.error("Web Audio API not supported or blocked:", e);
    }
  }

  public setStop(stopIndex: number) {
    if (!this.isRunning || !this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Dynamically adjust parameters based on stop selection
    if (this.filter && this.lfo && this.masterGain) {
      if (stopIndex === 0 || stopIndex === 7) { // Stop 1 (Entrance) or Stop 8 (Exit)
        // High wind, low rumble
        this.filter.frequency.exponentialRampToValueAtTime(350, now + 2);
        this.masterGain.gain.exponentialRampToValueAtTime(0.12, now + 2);
      } else if (stopIndex === 4) { // Stop 5 (27m Depth)
        // High rumble, deep low frequencies
        this.filter.frequency.exponentialRampToValueAtTime(75, now + 2);
        this.masterGain.gain.exponentialRampToValueAtTime(0.06, now + 2);
      } else { // Intermediate corridor stops
        this.filter.frequency.exponentialRampToValueAtTime(140, now + 2);
        this.masterGain.gain.exponentialRampToValueAtTime(0.07, now + 2);
      }
    }
    
    // Hammer sound trigger only for Stop 3 (Hand carvings)
    if (stopIndex === 2) {
      this.startHammering();
    } else {
      this.stopHammering();
    }
  }

  private startRumble() {
    if (!this.ctx || !this.masterGain) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const rumbleGain = this.ctx.createGain();
    
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(45, this.ctx.currentTime);
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(47.5, this.ctx.currentTime);
    
    rumbleGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    
    osc1.connect(rumbleGain);
    osc2.connect(rumbleGain);
    
    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(55, this.ctx.currentTime);
    
    rumbleGain.connect(lowpass);
    lowpass.connect(this.masterGain);
    
    osc1.start();
    osc2.start();
    
    this.rumbleNodes = [osc1, osc2, rumbleGain, lowpass];
  }

  private startWind() {
    if (!this.ctx || !this.masterGain) return;
    
    const bufferSize = 4096;
    const noise = this.ctx.createScriptProcessor(bufferSize, 1, 1);
    noise.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    };
    
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = "bandpass";
    this.filter.Q.setValueAtTime(1.8, this.ctx.currentTime);
    this.filter.frequency.setValueAtTime(180, this.ctx.currentTime);
    
    this.lfo = this.ctx.createOscillator();
    this.lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime); // 12s sweep
    
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(90, this.ctx.currentTime);
    
    this.lfo.connect(lfoGain);
    lfoGain.connect(this.filter.frequency);
    
    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    
    noise.connect(this.filter);
    this.filter.connect(windGain);
    windGain.connect(this.masterGain);
    
    this.lfo.start();
    this.windNodes = [noise, this.filter, this.lfo, lfoGain, windGain];
  }

  private startDrips() {
    if (!this.ctx) return;
    const triggerDrip = () => {
      if (!this.ctx || !this.masterGain || !this.isRunning) return;
      
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(900 + Math.random() * 300, now);
      osc.frequency.exponentialRampToValueAtTime(140 + Math.random() * 40, now + 0.07);
      
      gain.gain.setValueAtTime(0.03 + Math.random() * 0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(750, now);
      filter.Q.setValueAtTime(1.2, now);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(now);
      osc.stop(now + 0.12);
      
      const nextTime = 2000 + Math.random() * 4000;
      this.dripInterval = setTimeout(triggerDrip, nextTime);
    };
    
    triggerDrip();
  }

  private startHammering() {
    if (!this.ctx || this.hammerInterval) return;
    
    const triggerHammer = () => {
      if (!this.ctx || !this.masterGain || !this.isRunning) return;
      const now = this.ctx.currentTime;
      
      this.playChiselStrike(now);
      this.playChiselStrike(now + 1.2 + Math.random() * 0.15);
      this.playChiselStrike(now + 2.5 + Math.random() * 0.15);
      
      this.hammerInterval = setTimeout(triggerHammer, 7000 + Math.random() * 5000);
    };
    
    this.hammerInterval = setTimeout(triggerHammer, 1500);
  }

  private playChiselStrike(time: number) {
    if (!this.ctx || !this.masterGain) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(2100, time);
    osc.frequency.exponentialRampToValueAtTime(1600, time + 0.03);
    
    gain.gain.setValueAtTime(0.02, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);
    
    const bufferSize = 512;
    const noise = this.ctx.createScriptProcessor(bufferSize, 1, 1);
    const noiseGain = this.ctx.createGain();
    
    noise.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    };
    
    noiseGain.gain.setValueAtTime(0.015, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.02);
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(1200, time);
    
    noise.connect(filter);
    filter.connect(noiseGain);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    noiseGain.connect(this.masterGain);
    
    osc.start(time);
    osc.stop(time + 0.05);
    
    setTimeout(() => {
      try {
        noise.disconnect();
        filter.disconnect();
        noiseGain.disconnect();
        osc.disconnect();
        gain.disconnect();
      } catch (err) {}
    }, (time - this.ctx.currentTime + 0.25) * 1000);
  }

  private stopHammering() {
    if (this.hammerInterval) {
      clearTimeout(this.hammerInterval);
      this.hammerInterval = null;
    }
  }

  public stop() {
    this.isRunning = false;
    if (this.dripInterval) {
      clearTimeout(this.dripInterval);
      this.dripInterval = null;
    }
    this.stopHammering();
    
    this.rumbleNodes.forEach(node => {
      try { node.stop(); } catch(e){}
      try { node.disconnect(); } catch(e){}
    });
    this.rumbleNodes = [];
    
    this.windNodes.forEach(node => {
      try { node.stop(); } catch(e){}
      try { node.disconnect(); } catch(e){}
    });
    this.windNodes = [];
    
    if (this.masterGain) {
      try { this.masterGain.disconnect(); } catch(e){}
    }
    if (this.ctx) {
      try { this.ctx.close(); } catch(e){}
    }
    this.ctx = null;
    this.masterGain = null;
  }
}

// 8 Tour Stops Data (Multilingual)
const STOPS = [
  {
    number: 1,
    title: {
      en: "Stop 1: Introduction, Safety, & The Treasure Hunters",
      pl: "Przystanek 1: Wstęp, Bezpieczeństwo i Poszukiwacze Skarbów",
      cs: "Zastávka 1: Úvod, bezpečnost a lovci pokladů"
    },
    desc: {
      en: "Learn safety rules, check your gear, and discover the legend of the cassiterite discovery.",
      pl: "Poznaj zasady bezpieczeństwa, sprawdź sprzęt i odkryj legendę o znalezieniu kasyterytu.",
      cs: "Seznamte se s bezpečnostními pravidly a objevte legendu o nalezení kasiteritu."
    },
    scripts: {
      en: `Welcome, everyone, to our historic tin and cobalt mine! Before we venture into the darkness, let's make sure we are properly equipped. Everyone needs to have their helmet securely on and a lantern in hand.

Today, we will be walking a 350-meter route underground. It is a completely different reality down here; time behaves differently, and it will feel as though we’ve been beneath the earth for much longer than we actually have. Please note that the temperature inside is a constant 7 degrees Celsius, so you will feel a chill! Also, a quick warning for the taller members of our group: while I stand at a comfortable 156 centimeters and can walk freely, our lowest point is 160 centimeters. Some of you will need to do a bit of gymnastics, so watch your heads!

Before we enter, look at this map. Our journey begins in a 15th-century adit. You’ll notice it’s very straight and vertical, which is because the miners blasted through it using black powder. On our way back, we will return through a 16th-century adit. That one was carved entirely by hand, and you’ll see how the miners followed the natural geological structure of the rock.

The history of this place began in the 15th century. A group of treasure-hunting brothers arrived here, searching for minerals to bring them fortune. They didn't intend to start a mine; they simply stopped to rest, lit a campfire, and noticed something metallic melting in the embers. They had discovered cassiterite—tin oxide!

This is cassiterite. If you hold these two pieces, you can feel that one is much heavier because of its higher tin content. The brothers realized they had a lucrative business opportunity. However, this land belonged to the extremely wealthy, noble German family, the Schaffgotschs. When the Schaffgotschs heard of the discovery, they promptly expelled the brothers and took over the extraction themselves.

Let's head inside and see where the magic happened.`,
      pl: `Witam wszystkich w naszej historycznej kopalni cyny i kobaltu! Zanim wyruszymy w ciemność, upewnijmy się, że jesteśmy odpowiednio wyposażeni. Każdy musi mieć bezpiecznie założony kask i latarnię w dłoni.

Dzisiaj przejdziemy 350-metrową trasę pod ziemią. Tutaj na dole panuje zupełnie inna rzeczywistość; czas płynie inaczej i będziemy mieli wrażenie, jakbyśmy byli pod ziemią znacznie dłużej niż w rzeczywistości. Zwróćcie uwagę, że temperatura wewnątrz wynosi stałe 7 stopni Celsjusza, więc odczujecie chłód! Szybkie ostrzeżenie dla wyższych osób z naszej grupy: podczas gdy ja, mierząc skromne 156 centymetrów, mogę chodzić swobodnie, nasz najniższy punkt to zaledwie 160 centymetrów. Niektórzy z was będą musieli zrobić małą gimnastykę, więc uważajcie na głowy!

Zanim wejdziemy, spójrzcie na tę mapę. Nasza podróż zaczyna się w XV-wiecznej sztolni. Zauważycie, że jest ona bardzo prosta i pionowa, a to dlatego, że górnicy przebijali się przez nią przy użyciu czarnego prochu. W drodze powrotnej wrócimy sztolnią XVI-wieczną. Ta z kolei została wydrążona całkowicie ręcznie i zobaczycie, jak dawni hawiarze podążali za naturalną strukturą geologiczną skały.

Historia tego miejsca rozpoczęła się w XV wieku. Przybyła tu grupa braci poszukiwaczy skarbów w poszukiwaniu minerałów, które miały przynieść im fortunę. Nie mieli zamiaru zakładać kopalni; po prostu zatrzymali się na odpoczynek, rozpalili ognisko i zauważyli coś metalicznego topiącego się w żarze. Odkryli kasyteryt – tlenek cyny!

To jest kasyteryt. Jeśli trzymacie te dwa kawałki, możecie wyczuć, że jeden jest znacznie cięższy ze względu na wyższą zawartość cyny. Bracia zdali sobie sprawę, że to świetna okazja do zarobku. Ziemia ta należała jednak do niezwykle bogatego, szlacheckiego rodu niemieckiego – Schaffgotschów. Gdy Schaffgotschowie dowiedzieli się o odkryciu, natychmiast przepędzili braci i sami przejęli wydobycie.

Wejdźmy do środka i zobaczmy, gdzie działa się magia.`,
      cs: `Vítejte, všichni, v našem historickém dole na cín a kobalt! Než se vydáme do temnoty, ujistěte se, že jsme správně vybaveni. Každý musí mít bezpečně nasazenou helmu a v ruce svítilnu.

Dnes projdeme 350 metrů dlouhou trasu v podzemí. Je to tu úplně jiná realita; čas zde plyne jinak a budete mít pocit, jako bychom byli pod zemí mnohem déle, než tomu ve skutečnosti je. Upozorňuji, že teplota uvnitř je stálých 7 stupňů Celsia, takže ucítíte chlad! Také rychlé varování pro vyšší členy naší skupiny: zatímco já se svými 156 centimetry mohu procházet volně, nejnižší bod naší trasy má pouhých 160 centimetrů. Někteří z vás si budou muset trochu zacvičit, takže si chraňte hlavy!

Než vstoupíme, podívejte se na tuto mapu. Naše cesta začíná ve štole z 15. století. Všimnete si, že je velmi rovná a vertikální, což je způsobeno tím, že ji těžaři proráželi pomocí černého prachu. Cestou zpět se vrátíme štolou ze 16. století. Ta byla vytesána celá ručně a uvidíte, jak havíři sledovali přirozenou geologickou strukturu skály.

Historie tohoto místa začala v 15. století. Dorazila sem skupina bratrů hledajících poklady a minerály, které by jim přinesly jmění. Nezamýšleli vybudovat důl; jednoduše se zastavili, aby si odpočinuli, rozdělali oheň a všimli si, že se v žhavém popelu taví něco kovového. Objevili kasiterit – oxid cíničitý!

Tohle je kasiterit. Pokud podržíte tyto dva kusy, ucítíte, že jeden je mnohem těžší kvůli vyššímu obsahu cínu. Bratři si uvědomili, že se jim nabízí výnosný obchod. Tato půda však patřila nesmírně bohatému, šlechtickému německému rodu Schaffgotschů. Jakmile se Schaffgotschové o objevu dozvěděli, bratry okamžitě vyhnali a těžbu převzali sami.

Pojďme dovnitř a podívejme se, kde se to kouzlo odehrávalo.`
    }
  },
  {
    number: 2,
    title: {
      en: "Stop 2: The Blasting Zone & 350-Year-Old Timber",
      pl: "Przystanek 2: Strefa Odstrzałów i 350-Letnie Drewno",
      cs: "Zastávka 2: Odstřelová zóna a 350 let staré dřevo"
    },
    desc: {
      en: "Experience total darkness and discover how radon gas preserved ancient wood.",
      pl: "Doświadcz całkowitej ciemności i dowiedz się, jak radon zakonserwował starożytne drewno.",
      cs: "Zažijte úplnou tmu a zjistěte, jak radon zachoval prastaré dřevo."
    },
    scripts: {
      en: `Now we are truly in the dark. Turn off your lanterns for just a second. Do you feel that? In this total darkness, after a short while, your brain starts searching for stimuli and can begin to hallucinate—you might think you see shapes or glowing objects. I once walked at the very back of a group in the dark and felt absolutely certain a man was walking right in front of me, only to turn on my lantern and find he was actually 10 meters ahead!

Let's turn the lanterns back on. Let's shine our lights right here on the rock wall. Do you see this small, hand-carved groove? This is where miners drilled holes by hand to insert black powder. Because black powder blasting was incredibly volatile and dangerous, the Schaffgotsch family didn't want to risk their highly valuable, skilled miners. Instead, they forced convicts, prisoners, and people they deemed 'expendable' to do this dangerous blasting work.

Look up at the wooden timbering above us. Except for this one new plank which we had to replace, the rest of this wood is completely original and 350 years old!

You might wonder how wood survives so long underground without rotting. The secret lies right below us: the water flowing under our feet is rich in radon, a radioactive element that comes from the decay of uranium. Before we opened the ventilation of the Saint Leopold adit, there was no airflow here. The radiation from the radon was so high that it completely sterilized the area—no bacteria or fungi could grow, perfectly preserving this wood for over three centuries!

Don't worry, you are perfectly safe on this path, but further down this corridor is blocked off with concrete because the radon levels there remain far too high for public access.`,
      pl: `Teraz jesteśmy już naprawdę w ciemności. Zgaście na chwilę latarnie. Czujecie to? W tej absolutnej ciemności, po krótkiej chwili, mózg zaczyna szukać bodźców i może zacząć halucynować – możecie mieć wrażenie, że widzicie kształty lub świecące obiekty. Kiedyś szedłem na samym końcu grupy w ciemności i byłem absolutnie pewien, że tuż przede mną idzie jakiś mężczyzna, tylko po to, by włączyć latarkę i przekonać się, że był on w rzeczywistości 10 metrów przede mną!

Włączmy latarnie z powrotem. Oświetlmy to miejsce na skalnej ścianie. Widzicie ten mały, ręcznie wycięty rowek? To tutaj górnicy ręcznie wiercili otwory, aby wsypać czarny proch. Ponieważ odstrzały czarnym prochem były niezwykle nieprzewidywalne i niebezpieczne, rodzina Schaffgotschów nie chciała ryzykować życia swoich bardzo cennych i wykwalifikowanych górników. Zamiast tego zmuszali do tej niebezpiecznej pracy skazańców, więźniów i ludzi, których uważali za 'zbędnych'.

Spójrzcie w górę na drewniane stemplowanie nad nami. Z wyjątkiem tej jednej nowej deski, którą musieliśmy wymienić, reszta tego drewna jest całkowicie oryginalna i ma 350 lat!

Możecie się zastanawiać, jak drewno przetrwało tak długo pod ziemią bez gnicia. Tajemnica kryje się tuż pod nami: woda płynąca pod naszymi stopami jest bogata w radon, radioaktywny pierwiastek pochodzący z rozpadu uranu. Zanim otworzyliśmy wentylację sztolni 'Święty Leopold', nie było tu żadnego przepływu powietrza. Promieniowanie z radonu było tak wysokie, że całkowicie wysterylizowało ten obszar – nie mogły tu rosnąć żadne bakterie ani grzyby, co pozwoliło doskonale zachować to drewno przez ponad trzy stulecia!

Nie martwcie się, na tej ścieżce jesteście całkowicie bezpieczni, ale dalsza część tego korytarza jest zablokowana betonem, ponieważ poziom radonu pozostaje tam zbyt wysoki dla zwiedzających.`,
      cs: `Teď už jsme opravdu ve tmě. Zhasněte na okamžik své svítilny. Cítíte to? V této naprosté tmě začne váš mozek po chvíli hledat podněty a může začít halucinovat – možná se vám bude zdát, že vidíte různé tvary nebo zářící předměty. Kdysi jsem šel na samém konci skupiny ve tmě a byl jsem si naprosto jistý, že přímo přede mnou jde nějaký muž, ale když jsem rozsvítil svítilnu, zjistil jsem, že je ve skutečnosti 10 metrů přede mnou!

Znovu rozsvítíme svítilny. Posviťme si přímo sem na skalní stěnu. Vidíte tuto malou, ručně vytesanou drážku? Sem havíři ručně vrtali otvory pro nasypání černého prachu. Protože odstřely černým prachem byly neuvěřitelně nestálé a nebezpečné, rodina Schaffgotschů nechtěla riskovat své vysoce ceněné a zkušené horníky. Místo toho k této nebezpečné práci nutili odsouzence, vězně a lidi, které považovali za postradatelné.

Podívejte se na dřevěnou výdřevu nad námi. Kromě tohoto jednoho nového prkna, které jsme museli vyměnit, je zbytek tohoto dřeva zcela původní a starý 350 let!

Možná se divíte, jak dřevo přežije pod zemí tak dlouho, aniž by shnilo. Tajemství leží přímo pod námi: voda proudící pod našima nohama je bohatá na radon, radioaktivní prvek, který vzniká rozpadem uranu. Než jsme otevřeli ventilaci štoly svatého Leopolda, nebylo zde žádné proudění vzduchu. Radiace z radonu byla tak vysoká, že oblast zcela sterilizovala – nemohly zde růst žádné bakterie ani plísně, což toto dřevo dokonale uchovalo po více než tři staletí!

Nebojte se, na této stezce jste v naprostém bezpečí, ale dále je tato chodba zabetonována, protože hladina radonu tam zůstává pro veřejnost příliš vysoká.`
    }
  },
  {
    number: 3,
    title: {
      en: "Stop 3: Hand-Carvings, Workings, & Miner Life",
      pl: "Przystanek 3: Ręczne Wyrobiska i Życie Górników",
      cs: "Zastávka 3: Ruční práce, dobývání a život havířů"
    },
    desc: {
      en: "Listen to the tool sounds and learn about the daily grind of carving rock by hand.",
      pl: "Wsłuchaj się w dźwięki narzędzi i dowiedz się o trudzie ręcznego kucia skały.",
      cs: "Zaposlouchejte se do zvuků nástrojů a poznejte těžký život havířů."
    },
    scripts: {
      en: `Have a look into this incredibly narrow crevice on the side. This is a working face. When we think of mining, we often picture miners swinging large pickaxes. But in a space as tight as this, there was absolutely no room to swing a pickaxe.

Instead, miners used these primitive iron tools: the chisel, known as the 'żelazko', and the hammer, called the 'pyrlik'. Originally, these didn't even have wooden handles. A miner had to lie on his belly in these wet, cramped spaces, working entirely from his elbows. The only sounds in the pitch black would be the rhythmic dripping of water and the constant clack-clack-clack of hammer hitting chisel.

Can you guess how much progress a miner made in a single, grueling 8-to-12-hour shift? In soft rock, they might clear 10 to 20 centimeters. But in hard rock? A mere 2 to 5 centimeters a day! You can imagine the immense frustration of working for months in one spot, only to realize you had hit a dead end or that the ore vein had completely run out.

To protect their high wages and stop outsiders from interfering with their work, the miners deliberately shrouded their settlement in mystery, spreading terrifying legends. The locals from the Izera Mountains were terrified of these steep, inaccessible slopes. When they heard the roaring of the water-powered ore-crushing machines from a distance, they believed giants lived in the mountains. When they saw glowing lights over the lakes, which were just fireflies in the fog, they believed they were seeing magic spirits.`,
      pl: `Spójrzcie na tę niezwykle wąską szczelinę z boku. To jest wyrobisko. Kiedy myślimy o górnictwie, często wyobrażamy sobie górników wymachujących dużymi kilofami. Ale w tak ciasnej przestrzeni nie było na to absolutnie miejsca.

Zamiast tego górnicy używali prymitywnych żelaznych narzędzi: dłuta, zwanego 'żelazkiem', oraz młotka, zwanego 'pyrlikiem'. Pierwotnie nie miały one nawet drewnianych trzonków. Górnik musiał leżeć na brzuchu w tych mokrych, ciasnych wnękach, pracując wyłącznie z łokci. Jedynymi dźwiękami w tej głębokiej ciemności było rytmiczne kapanie wody i nieustanny dźwięk metalu uderzającego o dłuto.

Jak myślicie, jak duży postęp robił górnik podczas jednej wyczerpującej, 8- do 12-godzinnej szychty? W miękkiej skale mógł wykuć od 10 do 20 centymetrów. Ale w twardej? Zaledwie 2 do 5 centymetrów dziennie! Możecie sobie wyobrazić ogromną frustrację związaną z pracą przez miesiące w jednym miejscu, by na koniec odkryć, że trafili na ślepy zaułek lub że żyła rudy całkowicie się skończyła.

Aby chronić swoje wysokie zarobki i powstrzymać obcych przed wtrącaniem się w ich pracę, górnicy celowo otaczali swoją osadę tajemnicą, szerząc przerażające legendy. Mieszkańcy Gór Izerskich bali się tych stromych, niedostępnych zboczy. Gdy z oddali słyszeli ryk kruszarek rudy napędzanych wodą, wierzyli, że w górach mieszkają olbrzymy. Kiedy widzieli błyszczące światła nad jeziorami – które były tylko świetlikami w mgle – wierzyli, że widzą magiczne duchy.`,
      cs: `Podívejte se do této neuvěřitelně úzké štěrbiny po straně. Jedná se o dobývací chodbu. Když si představíme těžbu, často vidíme havíře, jak se ohánějí velkými krumpáči. Ale v tak stísněném prostoru jako je tento, nebylo pro krumpáč vůbec žádné místo.

Místo toho horníci používali tyto primitivní železné nástroje: klín, známý jako ‚želízko‘, a kladivo, zvané ‚mlátek‘. Původně tyto nástroje neměly ani dřevěné rukojeti. Havíř musel v těchto mokrých, stísněných prostorách ležet na břiše a pracovat pouze z loktů. Jediným zvukem v té černočerné tmě bylo rytmické kapání vody a neustálé klepání kladiva narážejícího na klín.

Dokážete odhadnout, jaký pokrok udělal havíř za jedinou, vyčerpávající 8 až 12hodinovou šichtu? V měkké skále mohli vyčistit 10 až 20 centimetrů. Ale v tvrdé skále? Pouhých 2 až 5 centimetrů za den! Dokážete si představit tu obrovskou frustraci z měsíců práce na jednom místě, jen abyste zjistili, že jste narazili na slepou uličku nebo že rudná žíla úplně vyhasla.

Aby si havíři ochránili své vysoké mzdy a zabránili cizincům zasahovat do jejich práce, záměrně halili svou osadu do tajemství a šířili děsivé legendy. Místní lidé z Jizerských hor se těchto strmých, nepřístupných svahů děsili. Když z dálky slyšeli hukot vodou poháněných strojů na drcení rudy, věřili, že v horách žijí obři. Když viděli zářící světla nad jezery, což byly jen světlušky v mlze, věřili, že vidí kouzelné duchy.`
    }
  },
  {
    number: 4,
    title: {
      en: "Stop 4: The Salon, Arsenic Path, & Light Demo",
      pl: "Przystanek 4: Salon, Chodnik Arsenowy i Próba Światła",
      cs: "Zastávka 4: Salon, Arsenová stezka a ukázka světla"
    },
    desc: {
      en: "Visit the wider chamber, hear about arsenic hazard, and feel the darkness of fat lamps.",
      pl: "Odwiedź najszerszą komorę, usłysz o zagrożeniu arsenem i poznaj ciemność lamp łojowych.",
      cs: "Navštivte nejširší komoru, poslechněte si o nebezpečí arsenu a zažijte šero lojových lamp."
    },
    scripts: {
      en: `Welcome to the Salon of our mine! It's not a very hospitable living room, but it's one of the few places wide enough for us to all stand together. This space was created thanks to the use of black powder blasting.

Over here, we have a dark, eerie corridor known as the Arsenic Path. This is where arsenic was first extracted. Arsenic was actually a geological indicator for us, as tin and cobalt ores are typically found nearby.

Ironically, arsenic led to a famous historical saying: 'Tin kills.' In the past, only the very wealthy could afford fine tin tableware. However, the tin used to make these dishes was often contaminated with arsenic. When the rich ate acidic foods—like pickled cabbage or tomatoes—off these plates, the acid reacted with the metal, oxidizing the arsenic and creating highly toxic white arsenic. It was quite the dark irony: the tableware that was a symbol of wealth was slowly poisoning the rich who used it.

Let's look closely at the walls around us. This white rock is milky quartz, which is where tin and cobalt ores gather. The vibrant orange coating is ochre, often called the 'blood of the earth' because when wet, it looks just like blood. It is a natural mixture of oxidized iron ore, quartz, and clay. And see these shiny, glittering silver flakes? This is mica. It is a natural glitter, still used in cosmetics today as a highlighter!

Originally, miners used these primitive lamps, called kaganki. They burned sheep fat and horse hair. If you've ever accidentally burnt your hair, you know how terrible it smells—it is thick with sulfur. It produced thick black smoke and rapidly consumed the precious oxygen in the mine. To save air, miners only lit them when they reached their working face.

Let's experience what they felt. Blow out your lanterns, and I will extinguish this lamp.

This is the exact reality of the miners. They spent up to 12 hours a day in this silent, heavy blackness. To cope with the isolation, they developed deep superstitions and beliefs in mountain spirits. They believed in the Skarbnik, a benevolent old spirit with a long white beard and glowing eyes who carried a lantern to protect good, honest miners. But they also feared the Kobolds. These were mischievous, troublesome spirits whom they blamed for cave-ins, equipment failures, and accidents. In reality, these Kobolds were just the natural, shifting movements of the mountain's rock layers.

Now, we are going to do something special. We are going to walk the next straight stretch of the tunnel in complete darkness. Keep your hands on the walls, feel your way forward, and let your senses adjust. If anyone feels uncomfortable, please stay at the back with a lantern lit.`,
      pl: `Witamy w Salonie naszej kopalni! Nie jest to zbyt gościnny pokój, ale to jedno z nielicznych miejsc wystarczająco szerokich, byśmy mogli stanąć wszyscy razem. Przestrzeń ta powstała dzięki zastosowaniu odstrzałów czarnym prochem.

Tutaj mamy ciemny, upiorny korytarz znany jako Chodnik Arsenowy. To właśnie tutaj po raz pierwszy wydobywano arsen. Arsen był w rzeczywistości naszym wskaźnikiem geologicznym, ponieważ w pobliżu zazwyczaj znajdują się rudy cyny i kobaltu.

Ironicznie, arsen doprowadził do słynnego historycznego powiedzenia: 'Cyna zabija'. W przeszłości tylko bardzo bogaci mogli sobie pozwolić na szlachetne naczynia cynowe. Jednak cyna używana do ich produkcji była często zanieczyszczona arsenem. Kiedy bogaci jedli z tych talerzy kwaśne potrawy – na przykład kiszoną kapustę lub pomidory – kwas wchodził w reakcję z metalem, utleniając arsen i tworząc wysoce toksyczny arszenik. To była ciemna ironia: naczynia będące symbolem bogactwa powoli truły elity, które ich używały.

Przyjrzyjmy się ścianom wokół nas. Ta biała skała to kwarc mleczny, w którym gromadzą się rudy cyny i kobaltu. Żywa pomarańczowa powłoka to ochra, często nazywana 'krwią ziemi', ponieważ gdy jest mokra, wygląda jak prawdziwa krew. To naturalna mieszanina utlenionej rudy żelaza, kwarcu i gliny. A widoczne tu błyszczące, srebrne płatki? To mika. To naturalny brokat, do dziś stosowany w kosmetykach jako rozświetlacz!

Górnicy używali prymitywnych lampek zrobionych z gliny, zwanych kagankami. Spalano w nich tłuszcz owczy i końskie włosie. Jeśli kiedyś przypadkowo przypaliliście włosy, wiecie jak okropnie to pachnie – zapach jest gęsty od siarki. Dawał on gęsty czarny dym i szybko zużywał cenny tlen. Aby oszczędzać powietrze, górnicy zapalali je dopiero po dotarciu do wyrobiska.

Doświadczmy tego, co oni czuli. Zgaście latarnie, a ja zgłaszam ten kaganek.

To jest prawdziwa rzeczywistość dawnych górników. Spędzali do 12 godzin na dobę w tej cichej, ciężkiej ciemności. Aby radzić sobie z izolacją, rozwinęli silne wierzenia w duchy górskie. Wierzyli w Skarbnika – opiekuńczego starca z długą białą brodą i świecącymi oczami, który nosił latarnię, chroniąc uczciwych górników. Ale bali się też Koboldów. Były to złośliwe, dokuczliwe stwory, które obwiniano o zawały, awarie sprzętu i wypadki. W rzeczywistości te 'Koboldy' były tylko naturalnymi przesunięciami warstw skalnych.

Teraz zrobimy coś wyjątkowego. Kolejny prosty odcinek tunelu przejdziemy w całkowitej ciemności. Trzymajcie ręce na ścianach, wyczuwajcie drogę przed sobą i dajcie zmysłom czas na adaptację. Jeśli ktoś poczuje się niekomfortowo, proszę pozostać z tyłu z włączoną latarką.`,
      cs: `Vítejte v Salonu našeho dolu! Není to příliš pohostinný obývací pokoj, ale je to jedno z mála míst, které je dostatečně široké, abychom se tu všichni shromáždili. Tento prostor vznikl díky odstřelům černým prachem.

Zde máme temnou, strašidelnou chodbu známou jako Arsenová stezka. Právě zde se poprvé těžil arsen. Arsen pro nás byl vlastně geologickým ukazatelem, protože rudy cínu a kobaltu se obvykle nacházejí v jeho blízkosti.

Arsen ironicky vedl k slavnému historickému rčení: ‚Cín zabíjí.‘ V minulosti si jemné cínové nádobí mohli dovolit jen ti nejbohatší. Cín používaný k výrobě těchto talířů byl však často kontaminován arsenem. Když bohatí jedli z těchto talířů kyselá jídla – například kysané zelí nebo rajčata –, kyselina reagovala s kovem, oxidovala arsen a vytvářela vysoce toxický oxid arsenitý. Byla to temná ironie: nádobí, které bylo symbolem bohatství, pomalu trávilo ty, kteří ho používali.

Podívejme se pozorně na stěny kolem nás. Tato bílá skála je mléčný křemen, ve kterém se hromadí cínové a kobaltové rudy. Zářivě oranžový povlak je okr, často nazývaný ‚krev země‘, protože za mokra vypadá jako krev. Je to přírodní směs zoxidované železné rudy, křemene a jílu. A vidíte ty lesklé, třpytivé stříbrné vločky? To je slída. Je to přírodní třpyt, který se v kosmetice dodnes používá jako rozjasňovač!

Původně horníci používali tyto primitivní lampy, zvané kagánky. Pálili v nich ovčí lůj a koňské žíně. Pokud se vám někdy omylem připálily vlasy, víte, jak strašně to zapáchá – je to plné síry. Produkovalo to hustý černý kouř a rychle spotřebovávalo vzácný kyslík v dole. Aby ušetřili vzduch, horníci je zapalovali, až když dorazili k pracovní stěně.

Pojďme zažít to, co cítili oni. Zhasněte svítilny a já zhasnu tuto lampu.

Tohle je přesná realita tehdejších havířů. V této tiché, těžké černotě trávili až 12 hodin denně. Aby se vyrovnali s izolací, vyvinuli si hluboké pověry a víru v horské duchy. Věřili v Permoníka, laskavého starého ducha s dlouhým bílým vousem a zářícíma očima, který nosil svítilnu, aby chránil dobré a poctivé horníky. Obávali se však také koboldů. To byli zlomyslní, potížističtí duchové, které obviňovali ze záavalů, selhání vybavení a nehod. Ve skutečnosti byli tito koboldi jen přirozeným, posunujícím se pohybem skalních vrstev hory.

Nyní uděláme PCIe speciálního. Další rovný úsek tunelu projdeme v naprosté tmě. Držte ruce na stěnách, hmatejte před sebou a nechte své smysly, aby se přizpůsobily. Pokud se někdo necítí dobře, zůstaňte prosím vzadu s rozsvícenou svítilnou.`
    }
  },
  {
    number: 5,
    title: {
      en: "Stop 5: Bottom of the Stairs & 27m Depth",
      pl: "Przystanek 5: Dół Schodów i Głębokość 27 metrów",
      cs: "Zastávka 5: Spodní část schodů a hloubka 27 metrů"
    },
    desc: {
      en: "Uncover why tunnels slope upwards and hear about the extreme radon gas danger.",
      pl: "Dowiedz się, dlaczego tunele wznoszą się w górę i usłysz o ekstremalnym zagrożeniu radonem.",
      cs: "Zjistěte, proč tunely stoupají nahoru, a poslechněte si o nebezpečí radonu."
    },
    scripts: {
      en: `Excellent job, everyone! We have successfully reached the deepest point of our tour—we are currently 27 meters below the surface.

Now, a quick mind-bender: did you feel like we were walking downhill to get here? Actually, we didn't! We were walking slightly uphill the entire time. Water is the greatest enemy of a miner; if it pools, the mine floods. To solve this, the miners dug their tunnels with a slight upward incline so that any water would naturally drain out behind them using gravity. But because the mountain rises so steeply above us, we are now deep underground.

Look to my right. This blocked corridor continues for another 34 meters into the Saint Leopold adit. When this section was first excavated, scientists tested the air here. They discovered that the radon gas levels are so extreme that standing in that tunnel is equivalent to standing right next to an active nuclear reactor! Because it is impossible to safely ventilate a tunnel going that deep into the mountain, it remains permanently sealed.

We are now going to climb these stairs. As we climb, we are going to step 200 years back in time, leaving the 18th century behind and entering our 16th-century hand-carved adit.`,
      pl: `Dobra robota, wszyscy! Pomyślnie dotarliśmy do najgłębszego punktu naszej wycieczki – znajdujemy się obecnie 27 metrów pod powierzchnią ziemi.

A teraz mała zagadka: czy mieliście wrażenie, że idziemy cały czas w dół? Otóż nie! Przez cały czas szliśmy lekko pod górę. Woda to największy wróg górnika; gdy się zbierze, kopalnia zostaje zalana. Aby temu zapobiec, sztolnie drążono z lekkim wznosem, by woda odpływała grawitacyjnie za plecy pracujących. Ponieważ jednak góra nad nami gwałtownie rośnie, jesteśmy teraz głęboko pod ziemią.

Spójrzcie na prawo. Ten zablokowany korytarz biegnie kolejne 34 metry w głąb sztolni 'Święty Leopold'. Kiedy ten odcinek został po raz pierwszy zbadany, naukowcy przetestowali tam powietrze. Odkryli, że stężenie radonu jest tam tak ekstremalne, że stanie w tym korytarzu odpowiada staniu tuż obok czynnego reaktora jądrowego! Ponieważ niemożliwe jest bezpieczne przewietrzenie korytarza wchodzącego tak głęboko w górę, pozostaje on na stałe zaplombowany.

Teraz wejdziemy po tych schodach. Wchodząc, cofniemy się w czasie o 200 lat, zostawiając za sobą wiek XVIII i wkraczając do naszej XVI-wiecznej, w całości ręcznie kutej sztolni.`,
      cs: `Skvělá práce, všichni! Úspěšně jsme dosáhli nejhlubšího bodu naší prohlídky – momentálně se nacházíme 27 metrů pod povrchem.

A teď jedna hádanka: měli jste pocit, že jdeme celou dobu z kopce? Ve skutečnosti ne! Celou dobu jsme šli mírně do kopce. Voda je největším nepřítelem havíře; pokud se nahromadí, důl se zatopí. Aby to vyřešili, těžaři kopali své tunely s mírným stoupáním, takže voda přirozeně odtékala za ně díky gravitaci. Ale protože hora nad námi tak strmě stoupá, jsme nyní hluboko pod zemí.

Podívejte se po mé pravici. Tento zablokovaný koridor pokračuje dalších 34 metrů do štoly svatého Leopolda. Když byl tento úsek poprvé prozkoumán, vědci zde testovali vzduch. Zgrosili, že hladina radonu je zde tak extrémní, že stát v tomto tunelu je stejné jako stát těsně vedle aktivního jaderného reaktoru! Protože je nemožné bezpečně odvětrat tunel vedoucí tak hluboko do hory, zůstává trvale uzavřen.

Nyní vystoupáme po těchto schodech. Během výstupu se vrátíme o 200 let zpět v čase, necháme 18. století za sebou a vstoupíme do naší ručně vytesané štoly ze 16. století.`
    }
  },
  {
    number: 6,
    title: {
      en: "Stop 6: The Geological Fault",
      pl: "Przystanek 6: Uskok Geologiczny",
      cs: "Zastávka 6: Geologický zlom"
    },
    desc: {
      en: "Stand inside a natural mountain fault and hear why miners prayed for a quick death.",
      pl: "Stań wewnątrz naturalnego pęknięcia górotworu i usłysz, dlaczego górnicy modlili się o szybką śmierć.",
      cs: "Stanete uvnitř geologického zlomu a zjistíte, proč se havíři modlili za rychlou smrt."
    },
    scripts: {
      en: `We are now standing directly inside a geological fault. Unlike the tunnels we've walked through, this chamber was not created by miners—it was formed entirely by nature.

Look at the ceiling above us. Do you see this distinct white and grey line running across the rock? That is a geological fracture that cuts through the entire height of the mountain above us. Under the immense pressure of the shifting tectonic plates, the solid rock was ground down into this soft, powdery clay.

This was easily the most dangerous section of the mine. Without modern engineering, a sudden shift in the mountain meant everything could collapse instantly onto the miners' heads.

Because of this constant danger, miners were deeply religious and superstitious. They would stop right here to pray to Saint Barbara, their patron saint. Interestingly, in the 15th to 18th centuries, miners didn't pray to her for protection or a long life. They knew the risks of their trade, so they prayed to Saint Barbara specifically for a quick and painless death in the event of a cave-in. They asked that if they were to be buried alive, she would make their end swift.`,
      pl: `Stoimy teraz bezpośrednio wewnątrz uskoku geologicznego. W przeciwieństwie do korytarzy, którymi szliśmy, ta komora nie została wykuta przez górników – stworzyła ją w całości natura.

Spójrzcie na strop nad nami. Widzicie tę wyraźną biało-szarą linię biegnącą w poprzek skały? To pęknięcie geologiczne, które przecina całą wysokość góry nad nami. Pod ogromnym ciśnieniem napierających na siebie płyt tektonicznych, lita skała została zmielona na miękką, gliniastą mączkę.

To była zdecydowanie najniebezpieczniejsza sekcja kopalni. Bez nowoczesnej inżynierii, nagłe tąpnięcie w górze oznaczało, że wszystko mogło zwinąć się w ułamku sekundy prosto na głowy hawiarzy.

Ze względu na to ciągłe zagrożenie, górnicy byli głęboko wierzący i przesądni. Zatrzymywali się dokładnie tutaj, aby pomodlić się do Świętej Barbary, swojej patronki. Co ciekawe, w XV-XVIII wieku górnicy wcale nie modlili się do niej o ocalenie czy długie życie. Znali ryzyko swojego zawodu, więc modlili się konkretnie o szybką i bezbolesną śmierć w razie zawału. Prosili, by w razie zasypania żywcem, skróciła ich cierpienie.`,
      cs: `Nyní stojíme přímo uvnitř geologického zlomu. Na rozdíl od tunelů, kterými jsme procházeli, tato komora nebyla vytvořena těžaři – zformovala ji výhradně příroda.

Podívejte se na strop nad námi. Vidíte tu zřetelnou bílou a šedou čáru procházející skálou? To je geologická trhlina, která protíná celou výšku hory nad námi. Pod obrovským tlakem pohybujících se tektonických desek byla pevná skála rozemleta na tento měkký, práškovitý jíl.

To byla bezpochyby nejnebezpečnější část dolu. Bez moderního inženýrství znamenal náhlý posun v hoře to, že se mohlo všechno okamžitě zřítit horníkům na hlavy.

Kvůli tomuto neustálému nebezpečí byli havíři hluboce věřící a pověrčiví. Zastavovali se přímo zde, aby se pomodlili ke svaté Barboře, své patronce. Zajímavé je, že v 15. až 18. století se k ní havíři nemodlili za ochranu nebo dlouhý život. Znali rizika svého řemesla, a tak se ke svaté Barboře modlili konkrétně za rychlou a bezbolestnou smrt v případě závalu. Žádali ji, aby v případě, že budou pohřbeni zaživa, byl jejich konec rychlý.`
    }
  },
  {
    number: 7,
    title: {
      en: "Stop 7: The Ventilation Shaft & 40 Tons of Trash",
      pl: "Przystanek 7: Szyb Wentylacyjny i 40 Ton Śmieci",
      cs: "Zastávka 7: Větrací šachta a 40 tun odpadků"
    },
    desc: {
      en: "Peer up the shaft, hear how it was used as a trash dump, and learn about the original clothing find.",
      pl: "Spójrz w górę szybu, dowiedz się, jak służył za wysypisko śmieci i poznaj historię odnalezionych ubrań.",
      cs: "Podívejte se nahoru do šachty, která sloužila jako skládka, a poznejte nález starých oděvů."
    },
    scripts: {
      en: `Watch your heads and look straight up! That vertical opening is our ventilation shaft, now protected by a steel pipe.

This shaft was constructed during the peak of this adit's operation, which ran from 1576 to 1633. It served two vital purposes: it allowed fresh air to reach the deep tunnels, and it functioned as a drainage system. You can feel the natural draft of air here.

Just to the side, you can see two distinct workings—an upper and a lower one. Originally, they were separated by a solid wall of rock, but a miner working the upper level accidentally broke through the floor into the lower level, creating this large combined space. The miners had to navigate between these steep levels using nothing but basic ladders in the pitch dark.

For centuries after the mine closed, this ventilation shaft was just an open, unmarked hole in the ground from the surface. Local residents had no idea a historic mine lay beneath them, so they used the hole as a convenient rubbish dump!

When we began restoring this mine to create this tour, do you know what we found blocking this shaft? We had to excavate and haul out a staggering 40 tons of rubbish! The trash had completely blocked the airflow, which actually helped conserve the lower sections. Amazingly, at the very bottom of the rubbish pile, we discovered organic materials and clothing dating back to the 16th century—likely the discarded work clothes of the original miners, known as gwarkowie. Unfortunately, they were too badly damaged by the centuries of trash to be properly preserved.

Over its active lifespan, this 16th-century adit yielded about 40 tons of valuable tin and cobalt ore. The mine was officially closed and the entrance buried in 1816 when resources were thought to be depleted. During the Second World War, the Germans re-excavated these tunnels in search of uranium, and they hid the entrance so masterfully that it took our modern excavation team years of hard work just to find it again!

Now, we are going to walk through the most challenging part of our tour. This 16th-century hand-cut tunnel has no modern wooden floorboards. It is extremely narrow, low, uneven, and slopes sharply. Watch your step, watch your head, and let's go!`,
      pl: `Uważajcie na głowy i spójrzcie prosto w górę! Ten pionowy otwór to nasz szyb wentylacyjny, obecnie zabezpieczony stalową rurą.

Szyb ten wybudowano w okresie największej świetności tej sztolni, który przypadał na lata 1576-1633. Służył dwóm ważnym celom: dostarczał świeże powietrze do głębszych chodników oraz odprowadzał nadmiar wody. Możecie poczuć tu naturalny ciąg powietrza.

Tuż obok widać dwa odrębne wyrobiska – górne i dolne. Początkowo dzieliła je gruba ściana skalna, ale górnik pracujący na wyższym poziomie przypadkowo przebił się przez dno do dolnej komory, tworząc tę ogromną, połączoną przestrzeń. Górnicy musieli poruszać się między tymi poziomami wyłącznie za pomocą prymitywnych drabin w kompletnej ciemności.

Przez stulecia po zamknięciu kopalni szyb ten był tylko niezabezpieczoną dziurą w ziemi na powierzchni. Miejscowi nie mieli pojęcia, co kryje się pod nimi, więc używali dziury jako poręcznego śmietnika!

Kiedy zaczęliśmy oczyszczać kopalnię, by przygotować tę trasę, wiecie co blokowało ten szyb? Musieliśmy odkopać i wywieźć aż 40 ton śmieci! Odpady całkowicie odcięły dopływ tlenu, co paradoksalnie zakonserwowało niższe korytarze. Na samym dnie składowiska odnaleźliśmy tekstylia i elementy ubrań pochodzące z XVI wieku – najpewniej stare stroje robocze gwarków. Niestety, były zbyt mocno zniszczone, by dało się je w pełni zakonserwować.

W czasie swojej działalności ta XVI-wieczna sztolnia dała około 40 ton cennej rudy cyny i kobaltu. Kopalnię ostatecznie zamknięto, a wejście zasypano w 1816 roku. Podczas II wojny światowej Niemcy ponownie rozkopali te sztolnie w poszukiwaniu uranu, a wejście zamaskowali tak dobrze, że naszej ekipie znalezienie go zajęło długie lata!

Teraz przejdziemy przez najtrudniejszą część wycieczki. Ten fragment sztolni nie ma drewnianej podłogi. Jest niesamowicie wąsko, nisko, wilgotno i stromo. Krok za krokiem, głowy w dół i ruszamy!`,
      cs: `Pozor na hlavu a podívejte se přímo nahoru! Ten vertikální otvor je naše větrací šachta, nyní chráněná ocelovou trubkou.

Tato šachta byla vybudována na vrcholu provozu této štoly, který trval od roku 1576 do roku 1633. Sloužila ke dvěma životně důležitým účelům: umožňovala přísun čerstvého vzduchu do hlubokých tunelů a fungovala jako odvodňovací systém. Cítíte zde přirozený závan vzduchu.

Hned vedle můžete vidět dvě odlišná dobývací komory – horní a dolní. Původně byla oddělena pevnou skalní stěnou, ale havíř pracující v horním patře se omylem probořil podlahou do dolního patra, čímž vznikl tento velký spojený prostor. Havíři se museli mezi těmito strmými úrovněmi pohybovat pouze s pomocí jednoduchých žebříků v naprosté tmě.

Po staletí po uzavření dolu byla tato větrací šachta pouhou otevřenou, neoznačenou dírou v zemi na povrchu. Místní obyvatelé neměli tušení, že se pod nimi nachází historický důl, a tak díru využívali jako pohodlnou skládku odpadu!

Když jsme začali tento důl obnovovat, abychom vytvořili tuto trasu, víte, co jsme v této šachtě našli? Museli jsme vykopat a vyvézt neuvěřitelných 40 tun odpadků! Odpad zcela zablokoval proudění vzduchu, což vlastně pomohlo uchovat spodní části dolu. Na samotném dně hromady odpadků jsme překvapivě objevili organické materiály a oděvy pocházející ze 16. století – pravděpodobně vyhozené pracovní oděvy původních horníků, tehdy nazývaných havíři. Bohužel byly staletími pod odpadky příliš poškozeny, než aby se daly zachránit.

Během své aktivní životnosti vynesla tato štola ze 16. století asi 40 tun cenné cínové a kobaltové rudy. Důl byl oficiálně uzavřen a jeho vchod zasypán v roce 1816, kdy se mělo za to, že zdroje jsou vyčerpány. Během druhé světové války Němci tyto tunely znovu vykopali při hledání uranu a vchod ukryli tak mistrovsky, že našemu modernímu týmu trvalo roky usilovné práce, než jej vůbec našel!

Nyní projdeme nejnáročnější částí naší prohlídky. Tento ručně vytesaný tunel ze 16. století nemá žádné moderní dřevěné podlahy. Je extrémně úzký, nízký, nerovný a strmě se svažuje. Sledujte své kroky, chraňte si hlavu a jdeme!`
    }
  },
  {
    number: 8,
    title: {
      en: "Stop 8: Wages, Child Labour, & Farewell",
      pl: "Przystanek 8: Płace, Praca Dzieci i Pożegnanie",
      cs: "Zastávka 8: Mzdy havířů, dětská práce a rozloučení"
    },
    desc: {
      en: "Return to daylight, hear about miner lifespan, child labor, and complete the tour.",
      pl: "Powrót na światło, opowieść o długości życia górników, pracy dzieci i pożegnanie.",
      cs: "Návrat na světlo, životní podmínky horníků, dětská práce a rozloučení."
    },
    scripts: {
      en: `We have successfully made it back to the surface! Let's take a moment to appreciate the fresh air and the light.

To wrap up our journey, let's talk about the reality of the people who built this place. Miners were actually incredibly well-paid. When fresh, rich ore veins were discovered, a miner could earn an astronomical sum, even after paying a heavy 40% tax to the land-owning Schaffgotsch family! Many miners owned large estates, farms, and local taverns.

But on what did they spend this wealth? Their working conditions were brutal, and their lives were incredibly short. The average life expectancy of a miner was just 30 years old. Reaching the age of 35 was considered a highly fortunate, happy old age!

This short lifespan meant that families had to work fast. Boys as young as six years old would enter these dark tunnels for the first time. They didn't dig yet; they assisted their fathers by carrying food, alcohol, and clearing out the ore. They also had to carry out the chamber pot, because once a miner entered in the morning, he stayed inside for up to 12 hours straight. By the age of 10, a boy was handed his own hammer and chisel, assigned his own section of the rock wall, and began active mining. By 14 to 16, he was expected to be married and have his own children—hopefully a son—to continue the family trade.

It was a hard, dangerous life, but it built the very foundations of the towns and communities we see around us today.

Thank you so much for exploring our historic mine with me today! I hope you enjoyed the adventure. Please return your helmets and lanterns to me here, and I will guide you back to the main cash desk and reception. Have a wonderful rest of your day!`,
      pl: `Udało nam się szczęśliwie powrócić na powierzchnię! Doceniajmy świeże powietrze i słońce.

Podsumowując naszą wyprawę, powiedzmy o realiach życia ludzi, którzy wznieśli to miejsce. Górnicy byli wbrew pozorom bardzo zamożni. Gdy natrafiano na bogate złoża, zarobki potrafiły być astronomiczne, nawet po oddaniu 40% podatku rodzinie Schaffgotschów! Wielu posiadało własne domostwa, pola uprawne, a nawet okoliczne karczmy.

Ale na co wydawali te pieniądze? Warunki pracy były niszczące, a życie wyjątkowo krótkie. Średnia wieku górnika wynosiła zaledwie 30 lat. Dożycie 35. roku uchodziło za radosną, sędziwą starość!

Ten krótki żywot sprawiał, że rodziny musiały działać ekspresowo. Chłopcy w wieku zaledwie sześciu lat schodzili po raz pierwszy pod ziemię. Nie drążyli skał; pomagali ojcom, nosząc jedzenie, alkohol i sprzątając urobek. Wynosili także naczynie sanitarne, bo raz wpuszczony górnik pracował bez przerwy do 12 godzin. W wieku 10 lat chłopiec dostawał swój własný młot i dłuto i rozpoczynał kucie. W wieku 14-16 lat zakładał już rodzinę, licząc na narodziny syna, który przejąłby rzemiosło.

To było okrutne i niebezpieczne życie, ale wzniosło fundamenty pod miasta i społeczności, które dziś nas otaczají.

Ogromnie dziękuję za odkrywanie historii naszej kopalni! Mam nadzieję, że wycieczka była niezapomnianą przygodą. Proszę o zwrot kasków i latarek, a ja wskażę drogę do kasy i recepcji. Życzę udanego dnia!`,
      cs: `Úspěšně jsme se vrátili na povrch! Vychutnejme si chvíli čerstvý vzduch a světlo.

Na závěr naší cesty si povězme o realitě lidí, kteří toto místo vybudovali. Havíři byli ve skutečnosti neuvěřitelně dobře placeni. Když byly objeveny nové, bohaté rudné žíly, mohl si havíř vydělat astronomickou sumu, a to i po zaplacení vysoké 40% daně rodině Schaffgotschů, která půdu vlastnila! Mnoho horníků vlastnilo velká panství, statky a místní taverny.

Na co ale toto bohatství utráceli? Jejich pracovní podmínky byly brutální a jejich životy neuvěřitelně krátké. Průměrná délka života havíře byla pouhých 30 let. Dosažení věku 35 let bylo považováno za velké štěstí a požehnané stáří!

Tento krátký život znamenal, že rodiny musely pracovat rychle. Chlapci ve věku pouhých šesti let poprvé vstupovali do těchto temných chodeb. Ještě nekopali; pomáhali svým otcům s nošením jídla, alkoholu a odklízením rudy. Museli také vynášet nočník, protože jakmile havíř ráno vstoupil dovnitř, zůstával v podzemí až 12 hodin v kuse. V 10 letech dostal chlapec vlastní kladivo a klín, byl mu přidělen jeho úsek skalní stěny a začal sám těžit. V 14 až 16 letech se očekávalo, že se ožení a bude mít vlastní děti – doufejme syna –, aby pokračoval v rodinném řemesle.

Byl to těžký, nebezpečný život, ale vybudoval samotné základy měst a komunit, které dnes kolem sebe vidíme.

Moc vám děkuji, že jste dnes se mnou prozkoumali náš historický důl! Doufám, že se vám dobrodružství líbilo. Vraťte mi prosím helmy a svítilny a já vás doprovodím zpět k pokladně a recepci. Přeji vám krásný zbytek dne!`
    }
  }
];

export default function GuidePage() {
  const { language: currentLang } = useTranslation();
  const [lang, setLang] = useState<"en" | "pl" | "cs">("en");
  const [activeStopIndex, setActiveStopIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  // Offline caching state
  const [isCached, setIsCached] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  
  // Ambient Sound State
  const [isAmbientOn, setIsAmbientOn] = useState(false);
  const synthRef = useRef<CaveAmbientSynthesizer | null>(null);
  
  // Audio playback elements
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioError, setAudioError] = useState(false);

  // Sync translation context language code initially
  useEffect(() => {
    if (currentLang === "pl" || currentLang === "cs" || currentLang === "en") {
      setLang(currentLang);
    }
  }, [currentLang]);

  // Handle ambient sound synthesis initialization
  useEffect(() => {
    const handleControllerChange = () => {
      window.location.reload();
    };

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      }).catch((err) => {
        console.error('Service Worker registration failed:', err);
      });
      
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    }

    synthRef.current = new CaveAmbientSynthesizer();
    
    // Check if the current route files are cached
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      caches.match(window.location.pathname).then((res) => {
        if (res) setIsCached(true);
      });
    }

    // Set up message listener for service worker progress
    const handleProgressMessage = (event: MessageEvent) => {
      if (event.data) {
        if (event.data.type === 'DOWNLOAD_PROGRESS') {
          const progress = Math.round((event.data.completed / event.data.total) * 100);
          setDownloadProgress(progress);
        } else if (event.data.type === 'DOWNLOAD_COMPLETE') {
          setIsDownloading(false);
          setIsCached(true);
        }
      }
    };
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.onmessage = handleProgressMessage;
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.stop();
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
        navigator.serviceWorker.onmessage = null;
      }
    };
  }, []);

  // Update synth configuration whenever stop index or ambient switch changes
  useEffect(() => {
    if (synthRef.current) {
      if (isAmbientOn) {
        synthRef.current.start();
        synthRef.current.setStop(activeStopIndex);
      } else {
        synthRef.current.stop();
      }
    }
  }, [activeStopIndex, isAmbientOn]);

  // Audio loading & tracking
  const currentAudioUrl = `/audio/${lang}/stop-${activeStopIndex + 1}.mp3`;
  
  useEffect(() => {
    // Reset audio state when stop or language changes
    setAudioError(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [activeStopIndex, lang]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setAudioError(false);
      }).catch((e) => {
        console.warn("Audio file not available:", e);
        setAudioError(true);
        // Fallback: If voice file isn't uploaded, we still let user "simulate" playback with a timer
        setIsPlaying(true);
      });
    }
  };

  // Simulate audio playback timing if file is missing (for testing/prototyping)
  useEffect(() => {
    let interval: any;
    if (isPlaying && audioError) {
      setDuration(90); // 1.5 mins fallback length
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= 90) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, audioError]);

  const handleTimeUpdate = () => {
    if (audioRef.current && !audioError) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && !audioError) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current && !audioError) {
      audioRef.current.currentTime = val;
    }
  };

  // Skip stop functions
  const handleNext = () => {
    if (activeStopIndex < STOPS.length - 1) {
      setActiveStopIndex(activeStopIndex + 1);
    }
  };

  const handlePrev = () => {
    if (activeStopIndex > 0) {
      setActiveStopIndex(activeStopIndex - 1);
    }
  };

  // Offline pre-download trigger
  const triggerOfflineDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    
    // Generate full list of paths to download for offline use
    const audioUrls = Array.from({ length: STOPS.length }, (_, i) => [
      `/audio/en/stop-${i + 1}.mp3`,
      `/audio/cs/stop-${i + 1}.mp3`
    ]).flat();

    const assetsToCache = [
      window.location.pathname,
      '/',
      '/manifest.webmanifest',
      '/favicon.ico',
      '/walloon_parchment_bg.png',
      ...audioUrls
    ];

    try {
      if (!('caches' in window)) {
        alert("Cache Storage is not supported on this browser.");
        setIsDownloading(false);
        return;
      }

      const cache = await window.caches.open('walloon-guide-v1');
      let completed = 0;
      const total = assetsToCache.length;
      
      for (const url of assetsToCache) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response);
          } else {
            console.warn(`Failed to fetch ${url} (status: ${response.status})`);
          }
        } catch (err) {
          console.error(`Error caching ${url}:`, err);
        }
        completed++;
        setDownloadProgress(Math.round((completed / total) * 100));
      }
      
      setIsDownloading(false);
      setIsCached(true);
    } catch (err) {
      console.error("Local caching failed:", err);
      alert("Local caching failed. If you are in Private/Incognito browsing mode, please switch to a normal tab to enable offline downloads.");
      setIsDownloading(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Localized UI helper
  const uiTexts = {
    title: { en: "Underground Audio Guide", pl: "Podziemny Przewodnik", cs: "Podzemní Průvodce" },
    subtitle: { en: "100% Offline Tour of Krobica Mine", pl: "W 100% offline trasa Kopalni Krobica", cs: "100% offline trasa dolů Krobica" },
    backBtn: { en: "Exit Guide", pl: "Wyjdź z przewodnika", cs: "Ukončit průvodce" },
    ambientTitle: { en: "Synthesized Cave Atmosphere", pl: "Syntetyczna atmosfera jaskini", cs: "Syntetická jeskynní atmosféra" },
    ambientDesc: { en: "Real-time synthesized ambient sounds of Krobica mine (wind, water drips, hammering echoes).", pl: "Generowane w czasie rzeczywistym dźwięki kopalni (wiatr, kapaniu wody, echo kucia).", cs: "Syntetizované zvuky dolu v reálném čase (vítr, kapání vody, ozvěny kování)." },
    ambientToggleOn: { en: "Atmosphere Active", pl: "Atmosfera włączona", cs: "Atmosféra zapnuta" },
    ambientToggleOff: { en: "Turn On Atmosphere", pl: "Włącz atmosferę", cs: "Zapnout atmosféru" },
    voiceSelector: { en: "Narration Language", pl: "Język lektora", cs: "Jazyk lektora" },
    narratorDemo: { en: "Simulating narration track (using text script fallback)", pl: "Symulacja lektora (brak pliku MP3, odczyt tekstu)", cs: "Simulace lektora (chybí soubor MP3, čtení textu)" },
    readScript: { en: "Read Spoken Script", pl: "Przeczytaj transkrypcję", cs: "Přečíst scénář" },
    downloadBtn: { en: "Download Guide Offline", pl: "Pobierz przewodnik offline", cs: "Stáhnout průvodce offline" },
    readyOffline: { en: "Downloaded & Offline Ready", pl: "Pobrano i Gotowe do pracy offline", cs: "Staženo a připraveno offline" },
    downloading: { en: "Caching guide data...", pl: "Zapisywanie w pamięci...", cs: "Ukládání průvodce..." },
    stopsLabel: { en: "Tour Stops", pl: "Etapy Trasy", cs: "Zastávky na trase" }
  };

  const activeStop = STOPS[activeStopIndex];

  return (
    <div className="flex-1 flex flex-col justify-between max-w-md mx-auto bg-black min-h-screen text-[#ededed] shadow-2xl relative">
      {/* Hidden Audio Player */}
      <audio 
        ref={audioRef}
        src={currentAudioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
        className="hidden"
      />

      {/* Top Header */}
      <header className="border-b border-gold/15 bg-black/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1 text-gold/80 hover:text-gold text-xs transition">
          <ArrowLeft className="w-4 h-4" />
          <span>{uiTexts.backBtn[lang]}</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <Compass className="w-5 h-5 text-gold animate-spin-slow" />
          <span className="font-serif font-bold text-sm text-gold tracking-wider uppercase">
            {uiTexts.title[lang]}
          </span>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        
        {/* Offline Caching Panel */}
        <div className="codex-card p-4 rounded-lg flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DownloadCloud className="w-5 h-5 text-gold" />
              <div>
                <h3 className="font-serif font-semibold text-xs text-white">
                  {isCached ? uiTexts.readyOffline[lang] : uiTexts.downloadBtn[lang]}
                </h3>
                <p className="text-[10px] text-gray-400">
                  {uiTexts.subtitle[lang]}
                </p>
              </div>
            </div>
            
            {!isCached && !isDownloading && (
              <button 
                onClick={triggerOfflineDownload}
                className="bg-gold hover:bg-gold-light text-black text-xs font-semibold px-3 py-1.5 rounded transition flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{lang === "en" ? "Cache" : lang === "pl" ? "Pobierz" : "Stáhnout"}</span>
              </button>
            )}

            {isDownloading && (
              <div className="flex items-center gap-1.5 text-gold text-xs font-serif">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{downloadProgress}%</span>
              </div>
            )}

            {isCached && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>

          {isDownloading && (
            <div className="w-full bg-white/5 rounded-full h-1">
              <div 
                className="bg-gold h-1 rounded-full transition-all duration-300" 
                style={{ width: `${downloadProgress}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* Ambient Synthesizer Card */}
        <div className="codex-card p-4 rounded-lg flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-gold" />
              <div>
                <h3 className="font-serif font-semibold text-xs text-white">
                  {uiTexts.ambientTitle[lang]}
                </h3>
                <p className="text-[9px] text-gray-400">
                  {uiTexts.ambientDesc[lang]}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsAmbientOn(!isAmbientOn)}
              className={`text-xs font-serif font-semibold px-3 py-1.5 rounded border transition flex items-center gap-1 ${
                isAmbientOn 
                  ? "bg-gold/15 border-gold text-gold" 
                  : "border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              {isAmbientOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{isAmbientOn ? uiTexts.ambientToggleOn[lang] : uiTexts.ambientToggleOff[lang]}</span>
            </button>
          </div>
        </div>

        {/* Stop Detail Card */}
        <div className="codex-card p-5 rounded-lg border-gold/30">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gold/40 bg-gold/10 text-gold font-serif text-sm font-semibold mb-2">
              {activeStop.number}
            </div>
            <h2 className="font-serif font-bold text-lg text-white leading-snug">
              {activeStop.title[lang]}
            </h2>
            <p className="text-xs text-gray-400 mt-1 italic">
              {activeStop.desc[lang]}
            </p>
          </div>

          {/* Simple Visual Placeholder representing the stop */}
          <div className="w-full h-36 bg-gradient-to-b from-stone-900 to-black rounded border border-white/5 flex items-center justify-center overflow-hidden mb-6 relative group">
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/80 z-10"></div>
            <div className="text-center p-4 z-20">
              <Compass className={`w-8 h-8 text-gold/30 mx-auto mb-2 ${isPlaying ? 'animate-spin-slow' : ''}`} />
              <p className="font-serif text-[10px] text-gold/50 tracking-wider uppercase">
                {lang === "en" ? "Stop Visual Component" : lang === "pl" ? "Komponent Wizualny" : "Vizuální komponenta zastávky"}
              </p>
              <p className="text-[9px] text-gray-500 max-w-xs mt-1">
                {lang === "en" ? "Swap with your recorded photo on stop" : lang === "pl" ? "Możliwość zamiany na zdjęcie zrobione na miejscu" : "Možnost výměny za fotografii pořízenou na místě"}
              </p>
            </div>
            {/* Ambient noise indicator */}
            {isAmbientOn && (
              <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 border border-gold/20 px-2 py-0.5 rounded text-[8px] text-gold font-serif">
                <Music className="w-2.5 h-2.5 animate-pulse" />
                <span>Ambient Synth Active</span>
              </div>
            )}
          </div>

          {/* Voice Language Selector */}
          <div className="flex items-center justify-between border-t border-white/5 pt-4 mb-4">
            <span className="text-[10px] text-gray-400 font-sans">
              {uiTexts.voiceSelector[lang]}:
            </span>
            <div className="flex gap-1.5 border border-white/10 bg-black/40 px-1.5 py-0.5 rounded text-[10px] font-semibold">
              {(["en", "pl", "cs"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-1.5 py-0.5 rounded uppercase transition ${
                    lang === l ? "bg-gold text-black" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Audio Player Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            
            <input 
              type="range" 
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full accent-gold bg-stone-800 rounded-lg appearance-none h-1 cursor-pointer"
            />

            {audioError && (
              <div className="bg-gold/5 border border-gold/20 text-gold text-[9px] px-2.5 py-1.5 rounded text-center">
                ⚠️ {uiTexts.narratorDemo[lang]}
              </div>
            )}

            <div className="flex items-center justify-center gap-6 pt-2">
              <button 
                onClick={handlePrev}
                disabled={activeStopIndex === 0}
                className="p-2 rounded-full hover:bg-white/5 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition"
              >
                <SkipBack className="w-5 h-5 text-white" />
              </button>

              <button 
                onClick={handlePlayPause}
                className="w-12 h-12 rounded-full bg-gold hover:bg-gold-light text-black flex items-center justify-center shadow-lg active:scale-95 transition"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current translate-x-0.5" />}
              </button>

              <button 
                onClick={handleNext}
                disabled={activeStopIndex === STOPS.length - 1}
                className="p-2 rounded-full hover:bg-white/5 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition"
              >
                <SkipForward className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Written Spoken Script (Collapsible) */}
        <div className="codex-card p-4 rounded-lg">
          <h3 className="font-serif font-semibold text-xs text-gold flex items-center gap-1.5 mb-2.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{uiTexts.readScript[lang]}</span>
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed font-sans whitespace-pre-line text-justify max-h-48 overflow-y-auto pr-1">
            {activeStop.scripts[lang]}
          </p>
        </div>

        {/* Stop Index Selector */}
        <div className="space-y-2">
          <h3 className="font-serif font-semibold text-xs text-white">
            {uiTexts.stopsLabel[lang]}
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {STOPS.map((stop, idx) => (
              <button
                key={stop.number}
                onClick={() => setActiveStopIndex(idx)}
                className={`py-2 px-1 rounded font-serif text-xs font-semibold text-center border transition ${
                  activeStopIndex === idx 
                    ? "bg-gold border-gold text-black font-bold" 
                    : "bg-black/40 border-white/10 text-gray-400 hover:border-gold/30 hover:text-white"
                }`}
              >
                Stop {stop.number}
              </button>
            ))}
          </div>
        </div>

      </main>

      {/* Footer copyright */}
      <footer className="border-t border-white/5 bg-black/80 py-3 text-center text-[9px] text-gray-500">
        <p>© 2026 Future Solutions AI — Krobica Mine</p>
      </footer>
    </div>
  );
}
