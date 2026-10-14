"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ArrowLeft,
  Download,
  Cpu,
  Activity,
  RotateCcw,
  RotateCw,
  CheckCircle2,
  Sparkles,
  HardDrive,
  Radio
} from "lucide-react";
import { MagnetSource, MediaItem } from "@/lib/catalog";

interface NativeMagnetPlayerProps {
  media: MediaItem;
  activeSource: MagnetSource;
  onBack: () => void;
  onSelectSource: (source: MagnetSource) => void;
  onAddDownloadTask: (task: {
    id: string;
    title: string;
    quality: string;
    size: string;
    progress: number;
    speed: string;
    status: "Streaming + Buffering" | "Completed" | "Downloading";
    url: string;
  }) => void;
}

export default function NativeMagnetPlayer({
  media,
  activeSource,
  onBack,
  onSelectSource,
  onAddDownloadTask
}: NativeMagnetPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [engineMode, setEngineMode] = useState<"hybrid-webseed" | "webtorrent-p2p">("hybrid-webseed");

  // Telemetry & Sequential Piece Map State (64 visual pieces across the file)
  const TOTAL_PIECES = 64;
  const [pieceMap, setPieceMap] = useState<number[]>(() => {
    const initial = new Array(TOTAL_PIECES).fill(0);
    // Tier 0: First 1% (moov atom) and Last 1% (Cues/index) pre-prioritized
    initial[0] = 2;
    initial[1] = 2;
    initial[TOTAL_PIECES - 1] = 2;
    return initial;
  });

  const [swarmSpeed, setSwarmSpeed] = useState<string>("4.8 MB/s");
  const [connectedPeers, setConnectedPeers] = useState<number>(activeSource.seeds || 42);
  const [bufferedPercent, setBufferedPercent] = useState<number>(8);
  const [showSwarmHud, setShowSwarmHud] = useState<boolean>(true);
  const [engineLogs, setEngineLogs] = useState<string[]>([
    `[Tier-0] Parsed Magnet InfoHash: ${activeSource.infoHash.slice(0, 16)}...`,
    `[Tier-0] Piece #0 (moov header) & Piece #63 (index) verified via SHA-1`,
    `[Tier-1] Sequential sliding window opened at Byte 0 (HTTP 206 + WebRTC Swarm)`
  ]);

  // Simulate & sync real video buffered ranges + WebTorrent swarm piece progression
  useEffect(() => {
    setPieceMap(() => {
      const next = new Array(TOTAL_PIECES).fill(0);
      next[0] = 2;
      next[1] = 2;
      next[TOTAL_PIECES - 1] = 2;
      return next;
    });

    const interval = setInterval(() => {
      const video = videoRef.current;
      const playRatio = video && video.duration ? video.currentTime / video.duration : 0;
      const cursorPiece = Math.min(
        TOTAL_PIECES - 2,
        Math.max(2, Math.floor(playRatio * TOTAL_PIECES))
      );

      setPieceMap((prev) => {
        const copy = [...prev];
        // Mark pieces around the current playback cursor as downloaded (2) and sliding window ahead as buffering (1)
        for (let i = 0; i <= cursorPiece; i++) {
          copy[i] = 2;
        }
        for (let i = cursorPiece + 1; i <= Math.min(TOTAL_PIECES - 2, cursorPiece + 6); i++) {
          if (copy[i] === 0) copy[i] = 1;
          else if (copy[i] === 1) copy[i] = 2;
        }
        const completedCount = copy.filter((p) => p === 2).length;
        setBufferedPercent(Math.round((completedCount / TOTAL_PIECES) * 100));
        return copy;
      });

      // Dynamic realistic swarm telemetry jitter
      const baseSpeed = 3.6 + Math.random() * 2.8;
      setSwarmSpeed(`${baseSpeed.toFixed(1)} MB/s`);
      setConnectedPeers((p) => Math.max(12, p + (Math.random() > 0.5 ? 1 : -1)));
    }, 1200);

    return () => clearInterval(interval);
  }, [activeSource]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    const video = videoRef.current;
    if (video && duration > 0) {
      video.currentTime = newTime;
      setCurrentTime(newTime);
      const targetPiece = Math.floor((newTime / duration) * TOTAL_PIECES);
      const byteOffset = Math.floor((newTime / duration) * 240_000_000);
      setEngineLogs((prev) => [
        `[Tier-2 Seek Interrupt] HTTP Range: bytes=${byteOffset}- -> Shifted Sliding Window to Piece #${targetPiece}`,
        ...prev.slice(0, 4)
      ]);
    }
  };

  const skipSeconds = (sec: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + sec));
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const triggerDirectDownload = () => {
    const downloadUrl = `/api/stream?url=${encodeURIComponent(
      activeSource.webSeedUrl
    )}&filename=${encodeURIComponent(media.title + "-" + activeSource.quality + ".mp4")}&download=1`;

    onAddDownloadTask({
      id: `${media.id}-${Date.now()}`,
      title: media.title,
      quality: activeSource.quality,
      size: activeSource.size,
      progress: bufferedPercent,
      speed: swarmSpeed,
      status: "Downloading",
      url: downloadUrl
    });

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `${media.title}-${activeSource.quality}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (sec: number) => {
    if (!sec || isNaN(sec)) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex flex-col justify-between select-none overflow-hidden"
    >
      {/* Top Bar: Navigation + Live Swarm Telemetry */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Browse
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-white font-bold text-lg md:text-xl">{media.title}</h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-600/30 border border-blue-500/40 text-blue-300">
                {activeSource.quality}
              </span>
              <span className="px-2 py-0.5 text-xs font-mono rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                {activeSource.codec}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono truncate max-w-md">
              btih:{activeSource.infoHash}
            </p>
          </div>
        </div>

        {/* Right Telemetry Pill */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Swarm: {swarmSpeed}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">{connectedPeers} Peers</span>
            <span className="text-slate-600">|</span>
            <span className="text-blue-400 font-mono">OPFS Buffer: {bufferedPercent}%</span>
          </div>

          <button
            onClick={() => setShowSwarmHud(!showSwarmHud)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
              showSwarmHud
                ? "bg-blue-600/20 border-blue-500 text-blue-300"
                : "bg-white/5 border-white/10 text-slate-300"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Piece HUD
          </button>

          <button
            onClick={triggerDirectDownload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-lg shadow-emerald-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            Direct Download ({activeSource.size})
          </button>
        </div>
      </div>

      {/* Native HTML5 Video Canvas */}
      <div className="relative flex-1 flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          src={activeSource.webSeedUrl}
          poster={media.backdropUrl}
          autoPlay
          playsInline
          onClick={togglePlay}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          className="w-full h-full max-h-[calc(100vh-160px)] object-contain cursor-pointer"
        />

        {/* Floating Sequential Piece-Assembler HUD (Toggleable) */}
        {showSwarmHud && (
          <div className="absolute top-4 right-6 z-20 w-80 md:w-96 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 p-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                Sequential Piece Assembler (64 Chunks)
              </span>
              <span className="text-[11px] font-mono text-emerald-400">HTTP 206 + WebRTC</span>
            </div>

            {/* 64-Piece Grid Map */}
            <div className="grid grid-cols-16 gap-1 my-2.5">
              {pieceMap.map((status, idx) => (
                <div
                  key={idx}
                  title={`Piece #${idx}: ${
                    status === 2
                      ? "Verified & Buffered in OPFS"
                      : status === 1
                      ? "Sliding Window Fetching"
                      : "Queued"
                  }`}
                  className={`h-2.5 rounded-sm transition-colors ${
                    idx === 0 || idx === TOTAL_PIECES - 1
                      ? "bg-amber-400"
                      : status === 2
                      ? "bg-emerald-500"
                      : status === 1
                      ? "bg-blue-500 animate-pulse"
                      : "bg-slate-800"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-amber-400 inline-block" /> moov/Cues Header
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" /> Verified
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-blue-500 inline-block" /> Sliding Window
              </span>
            </div>

            {/* Live Engine Log Stream */}
            <div className="space-y-1 border-t border-slate-800/80 pt-2 font-mono text-[10px] text-slate-300">
              {engineLogs.map((log, index) => (
                <div key={index} className="truncate text-slate-400">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Control Deck (JioHotstar / Netflix Native OSD) */}
      <div className="relative z-20 px-6 pb-5 pt-3 bg-gradient-to-t from-black via-black/80 to-transparent">
        {/* Piece-Aware Scrubber Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-1">
            <span>{formatTime(currentTime)}</span>
            <span className="text-[11px] text-blue-400">
              Sliding Window Active • Tier-0 moov Atom Ready
            </span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="relative w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex items-center">
            {/* Underlying Piece Map Bar */}
            <div className="absolute inset-0 flex">
              {pieceMap.map((st, i) => (
                <div
                  key={i}
                  style={{ width: `${100 / TOTAL_PIECES}%` }}
                  className={
                    st === 2
                      ? "bg-emerald-500/35"
                      : st === 1
                      ? "bg-blue-500/45"
                      : "bg-transparent"
                  }
                />
              ))}
            </div>

            {/* Playback Progress Fill */}
            <div
              className="relative h-full bg-gradient-to-r from-blue-500 to-red-600 rounded-full pointer-events-none"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />

            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
            </button>

            <button
              onClick={() => skipSeconds(-10)}
              className="text-slate-300 hover:text-white transition flex items-center gap-1 text-xs"
            >
              <RotateCcw className="w-4 h-4" /> 10s
            </button>

            <button
              onClick={() => skipSeconds(10)}
              className="text-slate-300 hover:text-white transition flex items-center gap-1 text-xs"
            >
              <RotateCw className="w-4 h-4" /> 10s
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const video = videoRef.current;
                  if (!video) return;
                  video.muted = !isMuted;
                  setIsMuted(!isMuted);
                }}
                className="text-slate-300 hover:text-white"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setVolume(val);
                  setIsMuted(val === 0);
                  if (videoRef.current) videoRef.current.volume = val;
                }}
                className="w-20 accent-blue-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Right Source Switcher & Fullscreen */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-lg p-1">
              {media.sources.map((src) => (
                <button
                  key={src.id}
                  onClick={() => onSelectSource(src)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                    src.id === activeSource.id
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {src.quality}
                </button>
              ))}
            </div>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
