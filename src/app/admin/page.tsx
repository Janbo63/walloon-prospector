"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { 
  Compass, LogOut, Loader2, Footprints, Gem, RotateCw, BookOpen, 
  Plus, Calendar, Thermometer, Dog, CheckCircle, Info, Scan, AlertTriangle, Printer,
  Camera
} from "lucide-react";

interface Walk {
  id: string;
  routeName: string;
  date: string;
  startTime?: string;
  endTime?: string;
  weather?: string;
  dogCompanion?: string;
  notes?: string;
}

interface Specimen {
  id: string;
  bagNumber: string;
  nameEn: string;
  namePl: string;
  nameCs: string;
  rockType: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  rawPhotoUrl?: string;
  cleanPhotoUrl?: string;
  status: string; // ROUGH, IN_TUMBLE, CABINET, READY_FOR_SHOP, SOLD
  estHardness?: number;
  pricePln?: number;
  storyEn?: string;
  storyPl?: string;
  storyCs?: string;
}

interface TumbleRun {
  id: string;
  barrelSize: string;
  tumblerModel: string;
  startDate: string;
  endDate?: string;
  status: string;
  currentStage: string;
  specimens: Specimen[];
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<"walks" | "specimens" | "tumbles" | "provenance">("specimens");

  // Data states
  const [walks, setWalks] = useState<Walk[]>([]);
  const [specimens, setSpecimens] = useState<Specimen[]>([]);
  const [tumbles, setTumbles] = useState<TumbleRun[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form modals open states
  const [showWalkModal, setShowWalkModal] = useState(false);
  const [showSpecimenModal, setShowSpecimenModal] = useState(false);
  const [showTumbleModal, setShowTumbleModal] = useState(false);

  // Form input states
  const [walkForm, setWalkForm] = useState({
    routeName: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    weather: "",
    dogCompanion: "",
    notes: "",
  });

  // Specimen scanner states
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [specimenForm, setSpecimenForm] = useState({
    bagNumber: "",
    nameEn: "",
    namePl: "",
    nameCs: "",
    rockType: "",
    locationName: "",
    latitude: "",
    longitude: "",
    status: "ROUGH",
    estHardness: "",
    pricePln: "",
    storyEn: "",
    storyPl: "",
    storyCs: "",
    fieldWalkId: "",
  });

  // Tumble form states
  const [tumbleForm, setTumbleForm] = useState({
    barrelSize: "3lb",
    tumblerModel: "Lortone 3A",
    startDate: new Date().toISOString().split("T")[0],
    selectedSpecimenIds: [] as string[],
  });

  // Provenance selection state
  const [selectedSpecimenForCard, setSelectedSpecimenForCard] = useState<Specimen | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status]);

  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      const [walksRes, specimensRes, tumblesRes] = await Promise.all([
        fetch("/api/admin/walks"),
        fetch("/api/admin/specimens"),
        fetch("/api/admin/tumbles"),
      ]);

      if (walksRes.ok) setWalks(await walksRes.json());
      if (specimensRes.ok) setSpecimens(await specimensRes.json());
      if (tumblesRes.ok) setTumbles(await tumblesRes.json());
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  // Submit handlers
  const handleWalkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/walks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(walkForm),
      });
      if (res.ok) {
        setShowWalkModal(false);
        setWalkForm({
          routeName: "",
          date: new Date().toISOString().split("T")[0],
          startTime: "",
          endTime: "",
          weather: "",
          dogCompanion: "",
          notes: "",
        });
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSpecimenPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScanFile(file);
      setScanPreview(URL.createObjectURL(file));
    }
  };

  const handleAIScanSpecimen = async () => {
    if (!scanFile) return;
    setScanning(true);
    const formData = new FormData();
    formData.append("image", scanFile);
    formData.append("mode", "admin");

    try {
      const res = await fetch("/api/identify", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();

      setSpecimenForm((prev) => ({
        ...prev,
        nameEn: data.nameEn || "",
        namePl: data.namePl || "",
        nameCs: data.nameCs || "",
        rockType: data.rockType || "",
        estHardness: data.estHardness?.toString() || "",
        storyEn: data.storyEn || "",
        storyPl: data.storyPl || "",
        storyCs: data.storyCs || "",
      }));
    } catch (err) {
      console.error("Scan Error:", err);
      alert("Failed to analyze rock with AI. Please fill details manually.");
    } finally {
      setScanning(false);
    }
  };

  const handleSpecimenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create Specimen record
      const res = await fetch("/api/admin/specimens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(specimenForm),
      });

      if (res.ok) {
        setShowSpecimenModal(false);
        setScanFile(null);
        setScanPreview(null);
        setSpecimenForm({
          bagNumber: "",
          nameEn: "",
          namePl: "",
          nameCs: "",
          rockType: "",
          locationName: "",
          latitude: "",
          longitude: "",
          status: "ROUGH",
          estHardness: "",
          pricePln: "",
          storyEn: "",
          storyPl: "",
          storyCs: "",
          fieldWalkId: "",
        });
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTumbleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/tumbles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barrelSize: tumbleForm.barrelSize,
          tumblerModel: tumbleForm.tumblerModel,
          startDate: tumbleForm.startDate,
          specimenIds: tumbleForm.selectedSpecimenIds,
        }),
      });

      if (res.ok) {
        setShowTumbleModal(false);
        setTumbleForm({
          barrelSize: "3lb",
          tumblerModel: "Lortone 3A",
          startDate: new Date().toISOString().split("T")[0],
          selectedSpecimenIds: [],
        });
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProgressTumble = async (runId: string, currentStage: string) => {
    let nextStage = "";
    let gritUsed = "";
    let details = "";

    if (currentStage === "STAGE_1") {
      nextStage = "STAGE_2";
      gritUsed = "120/220 Silicon Carbide";
      details = "Moved to Medium/Fine grit barrel run.";
    } else if (currentStage === "STAGE_2") {
      nextStage = "STAGE_3";
      gritUsed = "500/600 Aluminum Oxide (Pre-Polish)";
      details = "Moved to Pre-polish stage.";
    } else if (currentStage === "STAGE_3") {
      nextStage = "STAGE_4";
      gritUsed = "Aluminum Oxide (Polish)";
      details = "Final polishing stage started.";
    } else if (currentStage === "STAGE_4") {
      nextStage = "BURNISHING";
      gritUsed = "Ivory Soap Flakes / Water";
      details = "Burnishing run to remove polish residue.";
    } else if (currentStage === "BURNISHING") {
      nextStage = "COMPLETED";
      gritUsed = "None";
      details = "Run complete. Stones washed, dried, and set to cabinet.";
    }

    try {
      const res = await fetch("/api/admin/tumbles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: runId,
          nextStage,
          gritUsed,
          details,
        }),
      });

      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrintCard = () => {
    window.print();
  };

  // Auth loading states
  if (status === "loading") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-gold animate-spin mb-3" />
        <p className="font-serif italic text-gold">Opening the Codex...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen text-center p-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-xl font-serif font-bold text-white mb-2">Access Denied</h1>
        <p className="text-xs text-gray-400 mb-4 max-w-xs">
          You must be logged in with an authorized Google account to view the Prospector's Portal.
        </p>
        <Link href="/login" className="px-4 py-2 bg-gold text-black font-semibold text-xs rounded transition font-serif">
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between min-h-screen">
      {/* Header */}
      <header className="border-b border-gold/15 bg-black/40 backdrop-blur-md sticky top-0 z-50 print:hidden">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-gold" />
            <span className="font-serif font-bold text-lg text-gold tracking-wide">
              Waloński Portal <span className="text-[10px] text-gray-500 font-sans font-normal ml-1">Desk</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 hidden sm:inline font-serif italic">
              Welcome, {session?.user?.name}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 border border-red-900/30 hover:border-red-900/60 px-2.5 py-1 rounded transition bg-red-950/10 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full print:p-0">
        {/* Navigation Tabs */}
        <div className="flex border-b border-white/5 gap-1 mb-8 print:hidden">
          {[
            { id: "specimens", label: "Specimens", icon: Gem },
            { id: "walks", label: "Walks Log", icon: Footprints },
            { id: "tumbles", label: "Tumble Forge", icon: RotateCw },
            { id: "provenance", label: "Provenance Scribe", icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-serif font-semibold border-t border-x rounded-t transition cursor-pointer -mb-[1px] ${
                  activeTab === tab.id
                    ? "bg-black/40 border-gold/20 text-gold border-b-black/10"
                    : "border-transparent text-gray-400 hover:text-gold hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        {loadingData ? (
          <div className="flex flex-col items-center py-16 print:hidden">
            <Loader2 className="w-8 h-8 text-gold animate-spin mb-2" />
            <p className="text-xs text-gold font-serif italic">Loading chronicles...</p>
          </div>
        ) : (
          <div className="w-full">
            {/* 1. SPECIMENS TAB */}
            {activeTab === "specimens" && (
              <div className="space-y-6 print:hidden">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-serif text-white">Specimen Inventory</h2>
                  <button
                    onClick={() => setShowSpecimenModal(true)}
                    className="flex items-center gap-1 bg-gold hover:bg-gold-light text-black px-3 py-1.5 rounded text-xs font-serif font-bold transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Log Find</span>
                  </button>
                </div>

                {specimens.length === 0 ? (
                  <div className="border border-gold/15 bg-black/40 rounded p-10 text-center text-xs text-gray-400 italic font-serif">
                    No specimens cataloged yet. Tap "Log Find" to analyze and log your first stone.
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {specimens.map((spec) => (
                      <div key={spec.id} className="codex-card p-4 rounded flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start border-b border-white/5 pb-2 mb-3">
                            <span className="text-[10px] bg-gold/10 text-gold px-1.5 py-0.5 rounded font-mono">
                              Bag #{spec.bagNumber}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-serif ${
                              spec.status === "ROUGH" ? "bg-orange-950/30 text-orange-400 border border-orange-900/20" :
                              spec.status === "IN_TUMBLE" ? "bg-blue-950/30 text-blue-400 border border-blue-900/20 animate-pulse" :
                              spec.status === "CABINET" ? "bg-purple-950/30 text-purple-400 border border-purple-900/20" :
                              spec.status === "READY_FOR_SHOP" ? "bg-green-950/30 text-green-400 border border-green-900/20" :
                              "bg-gray-900 text-gray-500"
                            }`}>
                              {spec.status}
                            </span>
                          </div>
                          <h3 className="font-serif font-bold text-sm text-white">{spec.nameEn}</h3>
                          <p className="text-[10px] text-gray-400 font-serif italic mb-2">{spec.rockType}</p>
                          {spec.estHardness && (
                            <p className="text-[10px] text-gold/70">
                              Hardness: <span className="font-bold">{spec.estHardness} Mohs</span>
                            </p>
                          )}
                          {spec.locationName && (
                            <p className="text-[10px] text-gray-400 mt-1 truncate">Loc: {spec.locationName}</p>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/5 flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedSpecimenForCard(spec);
                              setActiveTab("provenance");
                            }}
                            className="flex-1 text-center py-1 border border-gold/30 hover:border-gold text-gold hover:bg-gold/5 rounded text-[10px] font-serif transition cursor-pointer"
                          >
                            Print Card
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. WALKS TAB */}
            {activeTab === "walks" && (
              <div className="space-y-6 print:hidden">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-serif text-white">Dog Walk Logs</h2>
                  <button
                    onClick={() => setShowWalkModal(true)}
                    className="flex items-center gap-1 bg-gold hover:bg-gold-light text-black px-3 py-1.5 rounded text-xs font-serif font-bold transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Log Walk</span>
                  </button>
                </div>

                {walks.length === 0 ? (
                  <div className="border border-gold/15 bg-black/40 rounded p-10 text-center text-xs text-gray-400 italic font-serif">
                    No dog walks logged yet. Track your trails to feed your exploration map.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {walks.map((walk) => (
                      <div key={walk.id} className="codex-card p-5 rounded border border-white/5 flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-[10px] text-gold font-serif border border-gold/20 px-2 py-0.5 rounded bg-gold/5">
                              <Calendar className="w-3 h-3" />
                              {new Date(walk.date).toLocaleDateString()}
                            </span>
                            <h3 className="font-serif font-bold text-sm text-white">{walk.routeName}</h3>
                          </div>
                          {walk.notes && <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">{walk.notes}</p>}
                          <div className="flex gap-4 text-[10px] text-gray-500">
                            {walk.weather && <span className="flex items-center gap-1"><Thermometer className="w-3.5 h-3.5" /> Weather: {walk.weather}</span>}
                            {walk.dogCompanion && <span className="flex items-center gap-1"><Dog className="w-3.5 h-3.5" /> Companion: {walk.dogCompanion}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. TUMBLE FORGE TAB */}
            {activeTab === "tumbles" && (
              <div className="space-y-6 print:hidden">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-serif text-white">Alchemist's Forge (Tumbling Runs)</h2>
                  <button
                    onClick={() => setShowTumbleModal(true)}
                    className="flex items-center gap-1 bg-gold hover:bg-gold-light text-black px-3 py-1.5 rounded text-xs font-serif font-bold transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Batch</span>
                  </button>
                </div>

                {tumbles.length === 0 ? (
                  <div className="border border-gold/15 bg-black/40 rounded p-10 text-center text-xs text-gray-400 italic font-serif">
                    No active tumbling runs. Select cataloged rough stones and start a barrel batch!
                  </div>
                ) : (
                  <div className="space-y-6">
                    {tumbles.map((run) => (
                      <div key={run.id} className="codex-card p-5 rounded border border-white/5 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-white/5 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-serif font-bold text-sm text-white">
                                {run.tumblerModel} ({run.barrelSize})
                              </h3>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                                run.status === "RUNNING" ? "bg-blue-950/40 text-blue-400 animate-pulse border border-blue-900/30" : "bg-green-950/40 text-green-400 border border-green-900/30"
                              }`}>
                                {run.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1">
                              Started: {new Date(run.startDate).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gold font-serif bg-gold/5 border border-gold/20 px-3 py-1 rounded">
                              Current Stage: <span className="font-bold">{run.currentStage.replace("_", " ")}</span>
                            </span>
                            {run.status === "RUNNING" && (
                              <button
                                onClick={() => handleProgressTumble(run.id, run.currentStage)}
                                className="bg-gold hover:bg-gold-light text-black px-2.5 py-1 rounded text-[10px] font-bold font-serif transition cursor-pointer"
                              >
                                {run.currentStage === "BURNISHING" ? "Complete Batch" : "Next Stage"}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Stones in batch */}
                        <div>
                          <h4 className="text-[10px] text-gray-400 font-serif uppercase tracking-wider mb-2">Stones in this run:</h4>
                          <div className="flex flex-wrap gap-2">
                            {run.specimens.map((spec) => (
                              <span key={spec.id} className="text-[10px] bg-white/5 border border-white/10 px-2.5 py-1 rounded text-white font-mono">
                                Bag #{spec.bagNumber} — {spec.nameEn}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. PROVENANCE SCRIBE TAB */}
            {activeTab === "provenance" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center print:hidden">
                  <h2 className="text-xl font-serif text-white">Provenance Scribe</h2>
                  <div className="flex gap-2">
                    <select
                      onChange={(e) => {
                        const spec = specimens.find((s) => s.id === e.target.value);
                        setSelectedSpecimenForCard(spec || null);
                      }}
                      value={selectedSpecimenForCard?.id || ""}
                      className="bg-black/60 border border-gold/30 rounded text-xs text-gold font-serif px-3 py-1.5 focus:outline-none"
                    >
                      <option value="">Select Specimen...</option>
                      {specimens.map((spec) => (
                        <option key={spec.id} value={spec.id}>
                          Bag #{spec.bagNumber} - {spec.nameEn}
                        </option>
                      ))}
                    </select>
                    {selectedSpecimenForCard && (
                      <button
                        onClick={handlePrintCard}
                        className="flex items-center gap-1.5 bg-gold hover:bg-gold-light text-black px-3 py-1.5 rounded text-xs font-serif font-bold transition cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print Card</span>
                      </button>
                    )}
                  </div>
                </div>

                {selectedSpecimenForCard ? (
                  <div className="w-full flex justify-center">
                    {/* The Printable Provenance Card */}
                    <div className="parchment-card p-8 rounded-lg max-w-lg w-full relative overflow-hidden shadow-2xl print:shadow-none print:border-none print:m-0">
                      {/* Corner details */}
                      <div className="absolute top-2 left-2 border-t border-l border-gold-dark/40 w-4 h-4"></div>
                      <div className="absolute top-2 right-2 border-t border-r border-gold-dark/40 w-4 h-4"></div>
                      <div className="absolute bottom-2 left-2 border-b border-l border-gold-dark/40 w-4 h-4"></div>
                      <div className="absolute bottom-2 right-2 border-b border-r border-gold-dark/40 w-4 h-4"></div>

                      <div className="text-center border-b border-gold-dark/20 pb-4 mb-5">
                        <span className="text-[9px] text-gold-dark font-serif uppercase tracking-widest mb-1 block">
                          Zagroda Alpakoterapii — Provenance Card
                        </span>
                        <h2 className="text-2xl font-serif font-black tracking-wide text-gold-dark">
                          {selectedSpecimenForCard.nameEn}
                        </h2>
                        <p className="text-[10px] text-[#42351f] font-serif italic mt-0.5">
                          {selectedSpecimenForCard.rockType}
                        </p>
                      </div>

                      <div className="space-y-4 text-xs text-[#3b301c]">
                        <div className="grid grid-cols-2 gap-4 border-b border-gold-dark/10 pb-3">
                          <div>
                            <span className="text-[9px] text-gold-dark uppercase font-serif font-bold block mb-0.5">Location Found</span>
                            <span className="font-semibold">{selectedSpecimenForCard.locationName || "Izera Foothills, Mirsk, Poland"}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-gold-dark uppercase font-serif font-bold block mb-0.5">Estimated Hardness</span>
                            <span className="font-semibold">{selectedSpecimenForCard.estHardness || "N/A"} Mohs</span>
                          </div>
                        </div>

                        {/* Tri-lingual Stories */}
                        <div className="space-y-4 border-t border-gold-dark/10 pt-3">
                          <div>
                            <h4 className="text-[9px] text-gold-dark uppercase font-serif font-bold mb-1 tracking-wider border-b border-gold-dark/5">English</h4>
                            <p className="font-serif italic leading-relaxed text-[#42351f]">
                              "{selectedSpecimenForCard.storyEn || "No story logged."}"
                            </p>
                          </div>

                          <div>
                            <h4 className="text-[9px] text-gold-dark uppercase font-serif font-bold mb-1 tracking-wider border-b border-gold-dark/5">Polski (PL)</h4>
                            <p className="font-serif italic leading-relaxed text-[#42351f]">
                              "{selectedSpecimenForCard.storyPl || "Brak historii w bazie."}"
                            </p>
                          </div>

                          <div>
                            <h4 className="text-[9px] text-gold-dark uppercase font-serif font-bold mb-1 tracking-wider border-b border-gold-dark/5">Čeština (CS)</h4>
                            <p className="font-serif italic leading-relaxed text-[#42351f]">
                              "{selectedSpecimenForCard.storyCs || "Příběh nebyl nalezen."}"
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-gold/15 bg-black/40 rounded p-10 text-center text-xs text-gray-400 italic font-serif print:hidden">
                    Select a specimen from the dropdown above to view and print its custom provenance cards.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODALS */}

      {/* 1. WALK MODAL */}
      {showWalkModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="codex-card max-w-md w-full p-6 rounded-lg relative">
            <h3 className="text-lg font-serif text-white mb-4">Log Prospecting Walk</h3>
            <form onSubmit={handleWalkSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-gold uppercase font-serif mb-1">Route Name</label>
                <input
                  type="text"
                  required
                  value={walkForm.routeName}
                  onChange={(e) => setWalkForm({ ...walkForm, routeName: e.target.value })}
                  className="w-full bg-black/60 border border-gold/30 rounded p-2 text-xs text-white focus:border-gold focus:outline-none"
                  placeholder="e.g. Gierczyn Stream Bend"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gold uppercase font-serif mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={walkForm.date}
                    onChange={(e) => setWalkForm({ ...walkForm, date: e.target.value })}
                    className="w-full bg-black/60 border border-gold/30 rounded p-2 text-xs text-white focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gold uppercase font-serif mb-1">Companion (Dog)</label>
                  <input
                    type="text"
                    value={walkForm.dogCompanion}
                    onChange={(e) => setWalkForm({ ...walkForm, dogCompanion: e.target.value })}
                    className="w-full bg-black/60 border border-gold/30 rounded p-2 text-xs text-white focus:border-gold focus:outline-none"
                    placeholder="e.g. Luna"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gold uppercase font-serif mb-1">Weather</label>
                <input
                  type="text"
                  value={walkForm.weather}
                  onChange={(e) => setWalkForm({ ...walkForm, weather: e.target.value })}
                  className="w-full bg-black/60 border border-gold/30 rounded p-2 text-xs text-white focus:border-gold focus:outline-none"
                  placeholder="e.g. Sunny, muddy path"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gold uppercase font-serif mb-1">Notes</label>
                <textarea
                  value={walkForm.notes}
                  onChange={(e) => setWalkForm({ ...walkForm, notes: e.target.value })}
                  className="w-full h-24 bg-black/60 border border-gold/30 rounded p-2 text-xs text-white focus:border-gold focus:outline-none resize-none"
                  placeholder="Outcrop details..."
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowWalkModal(false)}
                  className="px-4 py-2 border border-gold/30 text-gold text-xs font-serif rounded hover:bg-gold/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gold text-black font-semibold text-xs font-serif rounded hover:bg-gold-light cursor-pointer"
                >
                  Save Walk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. SPECIMEN MODAL */}
      {showSpecimenModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="codex-card max-w-xl w-full p-6 rounded-lg relative my-8">
            <h3 className="text-lg font-serif text-white mb-4">Log Specimen Find</h3>
            <form onSubmit={handleSpecimenSubmit} className="space-y-4">
              
              {/* Photo Upload & AI Scan Section */}
              <div className="border border-gold/20 bg-black/40 p-4 rounded-lg flex flex-col items-center">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleSpecimenPhotoChange}
                />
                
                {scanPreview ? (
                  <div className="relative w-full aspect-video rounded overflow-hidden mb-3 border border-gold/30 bg-black">
                    <img src={scanPreview} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-video rounded border border-dashed border-gold/30 flex flex-col items-center justify-center text-xs text-gold/70 hover:border-gold cursor-pointer transition mb-3"
                  >
                    <Camera className="w-8 h-8 mb-2" />
                    <span>Upload Raw Specimen Photo</span>
                  </div>
                )}

                {scanPreview && !scanning && (
                  <button
                    type="button"
                    onClick={handleAIScanSpecimen}
                    className="flex items-center gap-1.5 bg-gold hover:bg-gold-light text-black px-4 py-2 rounded text-xs font-serif font-bold shadow-lg transition cursor-pointer"
                  >
                    <Scan className="w-4 h-4 animate-pulse" />
                    <span>Scan with AI Alchemist</span>
                  </button>
                )}

                {scanning && (
                  <div className="flex items-center gap-2 text-xs text-gold font-serif">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deciphering coordinates and alchemical properties...</span>
                  </div>
                )}
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gold uppercase font-serif mb-0.5">Bag Number</label>
                  <input
                    type="text"
                    required
                    value={specimenForm.bagNumber}
                    onChange={(e) => setSpecimenForm({ ...specimenForm, bagNumber: e.target.value })}
                    className="w-full bg-black/60 border border-gold/30 rounded p-2 text-xs text-white focus:outline-none"
                    placeholder="e.g. 001"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gold uppercase font-serif mb-0.5">Rock Type / Family</label>
                  <input
                    type="text"
                    required
                    value={specimenForm.rockType}
                    onChange={(e) => setSpecimenForm({ ...specimenForm, rockType: e.target.value })}
                    className="w-full bg-black/60 border border-gold/30 rounded p-2 text-xs text-white focus:outline-none"
                    placeholder="e.g. Quartz"
                  />
                </div>
              </div>

              {/* Names */}
              <div className="space-y-2 border-t border-white/5 pt-2">
                <span className="text-[9px] text-gray-500 uppercase font-serif block">Localized Names (AI Generated)</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[8px] text-gold uppercase font-serif mb-0.5">English</label>
                    <input
                      type="text"
                      required
                      value={specimenForm.nameEn}
                      onChange={(e) => setSpecimenForm({ ...specimenForm, nameEn: e.target.value })}
                      className="w-full bg-black/60 border border-gold/30 rounded p-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] text-gold uppercase font-serif mb-0.5">Polski</label>
                    <input
                      type="text"
                      required
                      value={specimenForm.namePl}
                      onChange={(e) => setSpecimenForm({ ...specimenForm, namePl: e.target.value })}
                      className="w-full bg-black/60 border border-gold/30 rounded p-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] text-gold uppercase font-serif mb-0.5">Čeština</label>
                    <input
                      type="text"
                      required
                      value={specimenForm.nameCs}
                      onChange={(e) => setSpecimenForm({ ...specimenForm, nameCs: e.target.value })}
                      className="w-full bg-black/60 border border-gold/30 rounded p-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Hardness & Location */}
              <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-2">
                <div>
                  <label className="block text-[10px] text-gold uppercase font-serif mb-0.5">Est Hardness (Mohs)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={specimenForm.estHardness}
                    onChange={(e) => setSpecimenForm({ ...specimenForm, estHardness: e.target.value })}
                    className="w-full bg-black/60 border border-gold/30 rounded p-2 text-xs text-white focus:outline-none"
                    placeholder="7.0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gold uppercase font-serif mb-0.5">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={specimenForm.latitude}
                    onChange={(e) => setSpecimenForm({ ...specimenForm, latitude: e.target.value })}
                    className="w-full bg-black/60 border border-gold/30 rounded p-2 text-xs text-white focus:outline-none"
                    placeholder="50.912"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gold uppercase font-serif mb-0.5">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={specimenForm.longitude}
                    onChange={(e) => setSpecimenForm({ ...specimenForm, longitude: e.target.value })}
                    className="w-full bg-black/60 border border-gold/30 rounded p-2 text-xs text-white focus:outline-none"
                    placeholder="15.387"
                  />
                </div>
              </div>

              {/* Location Name */}
              <div>
                <label className="block text-[10px] text-gold uppercase font-serif mb-0.5">Location Name</label>
                <input
                  type="text"
                  value={specimenForm.locationName}
                  onChange={(e) => setSpecimenForm({ ...specimenForm, locationName: e.target.value })}
                  className="w-full bg-black/60 border border-gold/30 rounded p-2 text-xs text-white focus:outline-none"
                  placeholder="e.g. Stara Kamienica stream bank"
                />
              </div>

              {/* Linked Walk */}
              <div>
                <label className="block text-[10px] text-gold uppercase font-serif mb-0.5">Linked Walk Trail</label>
                <select
                  value={specimenForm.fieldWalkId}
                  onChange={(e) => setSpecimenForm({ ...specimenForm, fieldWalkId: e.target.value })}
                  className="w-full bg-black/60 border border-gold/30 rounded p-2 text-xs text-white focus:outline-none"
                >
                  <option value="">Select Walk...</option>
                  {walks.map((w) => (
                    <option key={w.id} value={w.id}>
                      {new Date(w.date).toLocaleDateString()} - {w.routeName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSpecimenModal(false);
                    setScanFile(null);
                    setScanPreview(null);
                  }}
                  className="px-4 py-2 border border-gold/30 text-gold text-xs font-serif rounded hover:bg-gold/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gold text-black font-semibold text-xs font-serif rounded hover:bg-gold-light cursor-pointer"
                >
                  Save Specimen
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 3. TUMBLE MODAL */}
      {showTumbleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="codex-card max-w-md w-full p-6 rounded-lg relative">
            <h3 className="text-lg font-serif text-white mb-4">Start Tumbling Run</h3>
            <form onSubmit={handleTumbleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gold uppercase font-serif mb-1">Tumbler Model</label>
                  <input
                    type="text"
                    required
                    value={tumbleForm.tumblerModel}
                    onChange={(e) => setTumbleForm({ ...tumbleForm, tumblerModel: e.target.value })}
                    className="w-full bg-black/60 border border-gold/30 rounded p-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gold uppercase font-serif mb-1">Barrel Size</label>
                  <input
                    type="text"
                    required
                    value={tumbleForm.barrelSize}
                    onChange={(e) => setTumbleForm({ ...tumbleForm, barrelSize: e.target.value })}
                    className="w-full bg-black/60 border border-gold/30 rounded p-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gold uppercase font-serif mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={tumbleForm.startDate}
                  onChange={(e) => setTumbleForm({ ...tumbleForm, startDate: e.target.value })}
                  className="w-full bg-black/60 border border-gold/30 rounded p-2 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Select rough stones */}
              <div>
                <label className="block text-[10px] text-gold uppercase font-serif mb-1">Select Rough Specimens</label>
                <div className="border border-gold/20 rounded p-2 bg-black/55 h-32 overflow-y-auto space-y-1.5">
                  {specimens.filter(s => s.status === "ROUGH").map((spec) => (
                    <label key={spec.id} className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={tumbleForm.selectedSpecimenIds.includes(spec.id)}
                        onChange={(e) => {
                          const ids = e.target.checked
                            ? [...tumbleForm.selectedSpecimenIds, spec.id]
                            : tumbleForm.selectedSpecimenIds.filter(id => id !== spec.id);
                          setTumbleForm({ ...tumbleForm, selectedSpecimenIds: ids });
                        }}
                        className="accent-gold"
                      />
                      <span>Bag #{spec.bagNumber} — {spec.nameEn} ({spec.rockType})</span>
                    </label>
                  ))}
                  {specimens.filter(s => s.status === "ROUGH").length === 0 && (
                    <p className="text-[10px] text-gray-500 italic p-2">No rough specimens on hand.</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowTumbleModal(false)}
                  className="px-4 py-2 border border-gold/30 text-gold text-xs font-serif rounded hover:bg-gold/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={tumbleForm.selectedSpecimenIds.length === 0}
                  className="px-4 py-2 bg-gold disabled:bg-gold/30 disabled:text-black/50 text-black font-semibold text-xs font-serif rounded hover:bg-gold-light cursor-pointer"
                >
                  Forge Batch
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/50 py-4 text-center text-[10px] text-gray-500 font-sans mt-auto print:hidden">
        <p>© 2026 Zagroda Alpakoterapii — Project Prospector. All rights reserved.</p>
      </footer>
    </div>
  );
}
