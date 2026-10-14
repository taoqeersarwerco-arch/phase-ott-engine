"use client";

import React, { useState, useMemo } from "react";
import {
  Play,
  Download,
  Search,
  Sparkles,
  Magnet,
  Film,
  Tv,
  Flame,
  HardDrive,
  CheckCircle2,
  X,
  Plus,
  ExternalLink,
  Layers,
  ShieldCheck,
  Cpu,
  Radio,
  Copy,
  Check
} from "lucide-react";
import {
  INITIAL_CATALOG,
  MediaItem,
  MagnetSource,
  buildMagnetUri
} from "@/lib/catalog";
import NativeMagnetPlayer from "@/components/NativeMagnetPlayer";

interface DownloadTask {
  id: string;
  title: string;
  quality: string;
  size: string;
  progress: number;
  speed: string;
  status: "Streaming + Buffering" | "Completed" | "Downloading";
  url: string;
}

export default function PhaseOttApp() {
  const [catalog, setCatalog] = useState<MediaItem[]>(INITIAL_CATALOG);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchingArchive, setIsSearchingArchive] = useState<boolean>(false);

  // Active Modal & Player States
  const [detailModalMedia, setDetailModalMedia] = useState<MediaItem | null>(null);
  const [selectedSource, setSelectedSource] = useState<MagnetSource | null>(null);
  const [activePlayerMedia, setActivePlayerMedia] = useState<MediaItem | null>(null);

  // Custom Magnet / InfoHash Input State
  const [showMagnetLab, setShowMagnetLab] = useState<boolean>(false);
  const [customMagnetInput, setCustomMagnetInput] = useState<string>("");
  const [customWebSeedInput, setCustomWebSeedInput] = useState<string>("");
  const [customTitleInput, setCustomTitleInput] = useState<string>("");
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Built-in OPFS & Direct Download Drawer
  const [showDownloadDrawer, setShowDownloadDrawer] = useState<boolean>(false);
  const [downloadTasks, setDownloadTasks] = useState<DownloadTask[]>([
    {
      id: "demo-task-1",
      title: "Sintel: The Dragon Blade",
      quality: "1080p",
      size: "129 MB",
      progress: 100,
      speed: "0 KB/s (Cached in OPFS)",
      status: "Completed",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
    }
  ]);

  const featuredMedia = useMemo(
    () => catalog.find((item) => item.featured) || catalog[0],
    [catalog]
  );

  const filteredCatalog = useMemo(() => {
    return catalog.filter((item) => {
      const matchesCat =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.sources.some((s) =>
          s.infoHash.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesCat && matchesSearch;
    });
  }, [catalog, selectedCategory, searchQuery]);

  // Query live Internet Archive movies & synthesize Magnet + WebSeed streams on the fly
  const handleLiveArchiveSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchingArchive(true);
    try {
      const res = await fetch(`/api/resolve?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        const newItems: MediaItem[] = data.results.map((r: any) => ({
          id: r.id,
          imdbId: r.archiveId,
          title: r.title,
          year: r.year,
          rating: "7.9",
          maturity: "U/A 13+",
          duration: "Full Feature",
          genres: ["Open Source", "Archive.org", "P2P Swarm"],
          synopsis: r.synopsis,
          backdropUrl: r.backdropUrl,
          posterUrl: r.posterUrl,
          category: "classics",
          sources: [
            {
              id: `${r.id}-src`,
              label: `Archive.org Swarm • H.264 MP4 (${r.size})`,
              quality: "1080p",
              codec: "H.264 / AAC",
              size: r.size,
              seeds: r.seeds,
              peers: Math.max(5, Math.floor(r.seeds / 4)),
              infoHash: r.infoHash,
              webSeedUrl: r.webSeedUrl,
              magnetUri: r.magnetUri,
              archiveId: r.archiveId
            }
          ]
        }));

        setCatalog((prev) => {
          const existingIds = new Set(prev.map((i) => i.id));
          const uniqueNew = newItems.filter((i) => !existingIds.has(i.id));
          return [...uniqueNew, ...prev];
        });
      }
    } catch {
      // Ignore network error
    } finally {
      setIsSearchingArchive(false);
    }
  };

  // Launch Custom Magnet or InfoHash in Native Player
  const handleLaunchCustomMagnet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMagnetInput.trim() && !customWebSeedInput.trim()) return;

    const matchHash = customMagnetInput.match(/btih:([a-fA-F0-9]{40})/);
    const extractedHash = matchHash
      ? matchHash[1].toLowerCase()
      : customMagnetInput.trim().length === 40
      ? customMagnetInput.trim().toLowerCase()
      : "209c8226b299b308beaf2b9cd3fb49212dbd13ec";

    const matchWs = customMagnetInput.match(/[?&]ws=([^&]+)/);
    const resolvedWebSeed =
      customWebSeedInput.trim() ||
      (matchWs ? decodeURIComponent(matchWs[1]) : "") ||
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4";

    const title = customTitleInput.trim() || `Custom Magnet Stream (${extractedHash.slice(0, 8)})`;

    const customMedia: MediaItem = {
      id: `custom-${Date.now()}`,
      imdbId: "custom",
      title,
      year: 2026,
      rating: "9.0",
      maturity: "Custom Swarm",
      duration: "Live Stream",
      genres: ["Custom Magnet", "Sequential P2P"],
      synopsis: `Custom Magnet / InfoHash stream assembled sequentially inside the native HTML5 player.`,
      backdropUrl:
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80",
      posterUrl:
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
      category: "trending",
      sources: [
        {
          id: `custom-src-${Date.now()}`,
          label: "Custom Magnet Swarm • Sequential Piece Stream",
          quality: "1080p",
          codec: "H.264 / AAC",
          size: "Dynamic",
          seeds: 64,
          peers: 18,
          infoHash: extractedHash,
          webSeedUrl: resolvedWebSeed,
          magnetUri:
            customMagnetInput.startsWith("magnet:?")
              ? customMagnetInput
              : buildMagnetUri(extractedHash, title, resolvedWebSeed)
        }
      ]
    };

    setCatalog((prev) => [customMedia, ...prev]);
    setShowMagnetLab(false);
    setSelectedSource(customMedia.sources[0]);
    setActivePlayerMedia(customMedia);
  };

  const openMediaModal = (item: MediaItem) => {
    setDetailModalMedia(item);
    setSelectedSource(item.sources[0]);
  };

  const startNativePlayback = (item: MediaItem, source?: MagnetSource) => {
    const chosen = source || item.sources[0];
    setSelectedSource(chosen);
    setDetailModalMedia(null);
    setActivePlayerMedia(item);
  };

  const triggerDirectDownloadFromCard = (item: MediaItem, source?: MagnetSource) => {
    const chosen = source || item.sources[0];
    const proxyUrl = `/api/stream?url=${encodeURIComponent(
      chosen.webSeedUrl
    )}&filename=${encodeURIComponent(item.title + "-" + chosen.quality + ".mp4")}&download=1`;

    setDownloadTasks((prev) => [
      {
        id: `${item.id}-${Date.now()}`,
        title: item.title,
        quality: chosen.quality,
        size: chosen.size,
        progress: 100,
        speed: "4.9 MB/s",
        status: "Downloading",
        url: proxyUrl
      },
      ...prev
    ]);
    setShowDownloadDrawer(true);

    const a = document.createElement("a");
    a.href = proxyUrl;
    a.download = `${item.title}-${chosen.quality}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100">
      {/* Fullscreen Native Magnet Player Overlay */}
      {activePlayerMedia && selectedSource && (
        <NativeMagnetPlayer
          media={activePlayerMedia}
          activeSource={selectedSource}
          onBack={() => setActivePlayerMedia(null)}
          onSelectSource={(src) => setSelectedSource(src)}
          onAddDownloadTask={(task) => {
            setDownloadTasks((prev) => [task, ...prev]);
          }}
        />
      )}

      {/* Top Navigation Header (JioHotstar + Netflix Hybrid) */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#07090e]/85 border-b border-white/10 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Brand Logo & Nav Links */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-red-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              </div>
              <div>
                <span className="font-black tracking-tight text-xl bg-gradient-to-r from-white via-blue-200 to-red-400 bg-clip-text text-transparent">
                  PHASE
                </span>
                <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded">
                  Magnet Engine v2.0
                </span>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
              {[
                { id: "all", label: "Home" },
                { id: "trending", label: "Trending Swarms" },
                { id: "scifi", label: "Sci-Fi & Cyberpunk" },
                { id: "classics", label: "Public Domain Cinema" },
                { id: "animation", label: "Open Animation" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg transition ${
                    selectedCategory === tab.id
                      ? "bg-white/10 text-white font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Search Bar + Custom Magnet Button + Download Drawer Button */}
          <div className="flex items-center gap-3 flex-1 sm:flex-initial justify-end">
            <form onSubmit={handleLiveArchiveSearch} className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, InfoHash, or Archive.org..."
                className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-blue-500 rounded-full pl-9 pr-16 py-1.5 text-xs text-white placeholder-slate-400 outline-none transition"
              />
              {searchQuery && (
                <button
                  type="submit"
                  disabled={isSearchingArchive}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-[10px] font-semibold text-white transition"
                >
                  {isSearchingArchive ? "Syncing..." : "Deep Find"}
                </button>
              )}
            </form>

            <button
              onClick={() => setShowMagnetLab(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold transition shadow-lg shadow-blue-600/20 shrink-0"
            >
              <Magnet className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Paste Magnet / Hash</span>
            </button>

            <button
              onClick={() => setShowDownloadDrawer(true)}
              className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 transition shrink-0"
            >
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Swarm & Downloads</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                {downloadTasks.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 pb-20">
        {/* Featured Hero Banner (JioHotstar / Netflix Full-Bleed Card) */}
        <section className="relative mt-6 rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950">
          <div className="relative h-[440px] md:h-[500px] w-full">
            <img
              src={featuredMedia.backdropUrl}
              alt={featuredMedia.title}
              className="w-full h-full object-cover object-center opacity-65"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#07090e] via-[#07090e]/85 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-black/30" />

            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider">
                  Featured Swarm Stream
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {featuredMedia.sources[0]?.seeds} Seeders Online
                </span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-xs font-semibold text-white">
                  {featuredMedia.sources[0]?.quality}
                </span>
                <span className="text-xs text-slate-300">
                  {featuredMedia.year} • {featuredMedia.maturity} • {featuredMedia.duration}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-3">
                {featuredMedia.title}
              </h1>

              <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-6 line-clamp-3">
                {featuredMedia.synopsis}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => startNativePlayback(featuredMedia)}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white hover:bg-slate-200 text-black font-bold text-sm transition shadow-xl"
                >
                  <Play className="w-4 h-4 fill-black" />
                  Play in Native UI
                </button>

                <button
                  onClick={() => triggerDirectDownloadFromCard(featuredMedia)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition shadow-lg shadow-blue-600/30"
                >
                  <Download className="w-4 h-4" />
                  Direct Download ({featuredMedia.sources[0]?.size})
                </button>

                <button
                  onClick={() => openMediaModal(featuredMedia)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-medium text-sm transition"
                >
                  <Magnet className="w-4 h-4 text-blue-400" />
                  Swarm Sources ({featuredMedia.sources.length})
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Architecture Telemetry Banner (Explains how Magnet-to-Native Stream works on Vercel) */}
        <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/90 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Tier-0 moov Atom Priority</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pre-fetches the first 1% and last 1% of every Magnet file so the native HTML5 video player initializes immediately without waiting for 100% download.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/90 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">WebRTC P2P + Archive.org WebSeeds</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Combines browser WebTorrent P2P swarms with HTTP 206 byte-range WebSeeds (`ws=`) so streams never stall even on serverless Vercel deployments.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/90 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Zero-RAM Direct Disk Downloads</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Streams verified chunks through `/api/stream` with `Content-Disposition: attachment` and `Accept-Ranges: bytes` for instant timeline scrubbing & saving.
              </p>
            </div>
          </div>
        </section>

        {/* Catalog Grid */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-500" />
                Instant Magnet & Open-Source Streams ({filteredCatalog.length})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any card to inspect its BitTorrent InfoHash (`btih`), active seeders, or stream directly inside the custom player.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredCatalog.map((item) => {
              const primarySource = item.sources[0];
              return (
                <div
                  key={item.id}
                  className="group relative rounded-2xl overflow-hidden bg-[#111520] border border-slate-800/80 hover:border-blue-500/60 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-blue-900/20"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                      <img
                        src={item.backdropUrl || item.posterUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111520] via-transparent to-black/40" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-[11px] font-bold text-white border border-white/10">
                          {primarySource?.quality || "1080p"}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {primarySource?.seeds || 50} Seeds
                        </span>
                      </div>

                      {/* Center Hover Play Button */}
                      <button
                        onClick={() => startNativePlayback(item)}
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40 backdrop-blur-[2px]"
                      >
                        <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition">
                          <Play className="w-5 h-5 fill-black ml-0.5" />
                        </div>
                      </button>
                    </div>

                    {/* Card Body */}
                    <div className="p-4">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span>
                          {item.year} • {item.duration}
                        </span>
                        <span className="text-amber-400 font-semibold">★ {item.rating}</span>
                      </div>
                      <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {item.synopsis}
                      </p>

                      {/* InfoHash Pill */}
                      <div className="mt-3 px-2.5 py-1.5 rounded-lg bg-slate-950/90 border border-slate-800/90 flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span className="truncate">
                          btih:{primarySource?.infoHash.slice(0, 14)}...
                        </span>
                        <span className="text-slate-300 shrink-0 ml-2">{primarySource?.size}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Buttons */}
                  <div className="px-4 pb-4 pt-1 flex items-center gap-2">
                    <button
                      onClick={() => startNativePlayback(item)}
                      className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      Stream
                    </button>
                    <button
                      onClick={() => triggerDirectDownloadFromCard(item)}
                      title="Direct File Download"
                      className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 transition"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openMediaModal(item)}
                      title="Inspect Magnet Swarm"
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition"
                    >
                      <Magnet className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Modal 1: Title Details & Magnet Swarm Selector (From Wireframe #2) */}
      {detailModalMedia && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl bg-[#111520] border border-slate-700/80 shadow-2xl overflow-hidden my-8">
            <button
              onClick={() => setDetailModalMedia(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black text-slate-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <img
                  src={detailModalMedia.posterUrl}
                  alt={detailModalMedia.title}
                  className="w-36 h-52 object-cover rounded-2xl border border-white/10 shrink-0 hidden sm:block"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-1">
                    <span className="text-amber-400 font-bold">★ {detailModalMedia.rating} IMDb</span>
                    <span>•</span>
                    <span>{detailModalMedia.year}</span>
                    <span>•</span>
                    <span>{detailModalMedia.duration}</span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded bg-white/10 text-white">
                      {detailModalMedia.maturity}
                    </span>
                  </div>

                  <h2 className="text-2xl font-black text-white mb-2">
                    {detailModalMedia.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                    {detailModalMedia.synopsis}
                  </p>

                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Select Magnet Swarm / Resolution Source:
                  </h3>

                  <div className="space-y-2.5">
                    {detailModalMedia.sources.map((src) => {
                      const isSelected = selectedSource?.id === src.id;
                      return (
                        <div
                          key={src.id}
                          onClick={() => setSelectedSource(src)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                            isSelected
                              ? "bg-blue-600/15 border-blue-500"
                              : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs sm:text-sm font-bold text-white">
                              {src.label}
                            </span>
                            <span className="text-xs font-mono text-emerald-400 shrink-0">
                              🟢 {src.seeds} Seeds / {src.peers} Peers
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                            <span className="truncate max-w-md">
                              magnet:?xt=urn:btih:{src.infoHash}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(src.magnetUri);
                                  setCopiedHash(src.id);
                                  setTimeout(() => setCopiedHash(null), 1800);
                                }}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1"
                              >
                                {copiedHash === src.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" /> Copied Magnet
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" /> Copy Magnet URI
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() =>
                        startNativePlayback(
                          detailModalMedia,
                          selectedSource || detailModalMedia.sources[0]
                        )
                      }
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-200 text-black font-bold text-xs sm:text-sm transition"
                    >
                      <Play className="w-4 h-4 fill-black" />
                      Stream Now in Native Player
                    </button>

                    <button
                      onClick={() =>
                        triggerDirectDownloadFromCard(
                          detailModalMedia,
                          selectedSource || detailModalMedia.sources[0]
                        )
                      }
                      className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition"
                    >
                      <Download className="w-4 h-4" />
                      Direct Download ({(selectedSource || detailModalMedia.sources[0])?.size})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Custom Magnet URI / InfoHash Stream Lab */}
      {showMagnetLab && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl rounded-3xl bg-[#111520] border border-slate-700 p-6 md:p-8 shadow-2xl">
            <button
              onClick={() => setShowMagnetLab(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
                <Magnet className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Custom Magnet / InfoHash Native Streamer
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Paste any Magnet link (`magnet:?xt=urn:btih:...`), a 40-char SHA-1 InfoHash, or a direct WebSeed MP4 URL to assemble and stream it inside the custom player.
            </p>

            <form onSubmit={handleLaunchCustomMagnet} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Stream Title (Optional)
                </label>
                <input
                  type="text"
                  value={customTitleInput}
                  onChange={(e) => setCustomTitleInput(e.target.value)}
                  placeholder="e.g., Blender Open Movie 1080p"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Magnet URI or 40-Character BitTorrent InfoHash (`btih`)
                </label>
                <input
                  type="text"
                  value={customMagnetInput}
                  onChange={(e) => setCustomMagnetInput(e.target.value)}
                  placeholder="magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs font-mono text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  HTTP WebSeed / Direct MP4 Fallback URL (`ws=`)
                </label>
                <input
                  type="url"
                  value={customWebSeedInput}
                  onChange={(e) => setCustomWebSeedInput(e.target.value)}
                  placeholder="https://archive.org/download/..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs font-mono text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMagnetLab(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-xs font-medium text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-600/30"
                >
                  Assemble & Stream Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer: Built-in Torrent Download & Local OPFS Storage Manager (From Wireframe #4) */}
      {showDownloadDrawer && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-[#0d111a] border-l border-slate-800 h-full p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-bold text-white">
                    Swarm & OPFS Download Manager
                  </h2>
                </div>
                <button
                  onClick={() => setShowDownloadDrawer(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {downloadTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{task.title}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                        {task.quality} • {task.size}
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-400"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Status: {task.status}</span>
                      <span className="font-mono text-emerald-400">{task.speed}</span>
                    </div>

                    <div className="pt-1 flex items-center gap-2">
                      <a
                        href={task.url}
                        download
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Save .mp4 to Disk
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400">
              <p className="font-semibold text-slate-200 mb-1">
                How Local OPFS & Edge Proxy Downloads Work:
              </p>
              <p>
                Verified torrent pieces and WebSeed byte-ranges are piped directly to your disk via HTTP 206 streams without exhausting browser tab RAM.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
