"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Music, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX, Waves } from "lucide-react";

/* ── Station presets ─────────────────────────────────────────────── */
const STATIONS = [
  {
    id: "lofi",
    name: "Lo-fi Chill",
    genre: "Chillhop",
    color: "#a78bfa",
    url: "https://ice1.somafm.com/groovesalad-128-mp3",
  },
  {
    id: "jazz",
    name: "Jazz Lounge",
    genre: "Jazz",
    color: "#f59e0b",
    url: "https://ice1.somafm.com/secretagent-128-mp3",
  },
  {
    id: "ambient",
    name: "Ambient Drift",
    genre: "Ambient",
    color: "#22d3ee",
    url: "https://ice1.somafm.com/dronezone-128-mp3",
  },
  {
    id: "electronic",
    name: "Deep Space",
    genre: "Electronic",
    color: "#f472b6",
    url: "https://ice1.somafm.com/spacestation-128-mp3",
  },
];

const VOLUME_KEY = "radio-volume";
const STATION_KEY = "radio-station";

function readStoredVolume() {
  if (typeof window === "undefined") return 0.35;
  try {
    const v = parseFloat(localStorage.getItem(VOLUME_KEY));
    return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0.35;
  } catch {
    return 0.35;
  }
}

function readStoredStation() {
  if (typeof window === "undefined") return 0;
  try {
    const id = localStorage.getItem(STATION_KEY);
    const idx = STATIONS.findIndex((s) => s.id === id);
    return idx >= 0 ? idx : 0;
  } catch {
    return 0;
  }
}

/* ── Equalizer bars (animated when playing) ─────────────────────── */
function EqBars({ playing, color }) {
  return (
    <div className="radio-eq" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`radio-eq__bar ${playing ? "radio-eq__bar--active" : ""}`}
          style={{
            background: color,
            animationDelay: `${i * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Vinyl disc ─────────────────────────────────────────────────── */
function VinylDisc({ playing, color }) {
  return (
    <div className={`radio-vinyl ${playing ? "radio-vinyl--spinning" : ""}`}>
      <div className="radio-vinyl__outer" style={{ borderColor: `${color}44` }} />
      <div className="radio-vinyl__groove radio-vinyl__groove--1" />
      <div className="radio-vinyl__groove radio-vinyl__groove--2" />
      <div className="radio-vinyl__groove radio-vinyl__groove--3" />
      <div
        className="radio-vinyl__label"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}88)` }}
      />
      <div className="radio-vinyl__dot" />
    </div>
  );
}

/* ── Station chip (small selector) ──────────────────────────────── */
function StationChip({ station, active, onClick }) {
  return (
    <button
      className={`radio-station-chip ${active ? "radio-station-chip--active" : ""}`}
      onClick={onClick}
      type="button"
      style={{
        "--chip-color": station.color,
        borderColor: active ? station.color : undefined,
      }}
    >
      <span className="radio-station-chip__swatch">
        <span
          className="radio-station-chip__dot"
          style={{ background: station.color }}
        />
      </span>
      <span className="radio-station-chip__copy">
        <span className="radio-station-chip__name">{station.name}</span>
        <span className="radio-station-chip__genre">{station.genre}</span>
      </span>
    </button>
  );
}

/* ── Main RadioPlayer component ─────────────────────────────────── */
export default function RadioPlayer({ open, isDayMode }) {
  const audioRef = useRef(null);
  const [stationIndex, setStationIndex] = useState(readStoredStation);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(readStoredVolume);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(false);

  const station = STATIONS[stationIndex];

  /* Sync audio element volume */
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  /* Handle station changes */
  const switchStation = useCallback(
    (nextIndex) => {
      const idx = ((nextIndex % STATIONS.length) + STATIONS.length) % STATIONS.length;
      setStationIndex(idx);
      localStorage.setItem(STATION_KEY, STATIONS[idx].id);

      if (audioRef.current) {
        const wasPlaying = !audioRef.current.paused;
        audioRef.current.pause();
        audioRef.current.src = STATIONS[idx].url;
        if (wasPlaying) {
          setLoading(true);
          audioRef.current.play().catch(() => setPlaying(false));
        }
      }
    },
    [],
  );

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.src = station.url;
      setLoading(true);
      audioRef.current.play().then(() => {
        setPlaying(true);
      }).catch(() => {
        setPlaying(false);
        setLoading(false);
      });
    }
  }, [playing, station.url]);

  /* Audio events */
  const onCanPlay = useCallback(() => {
    setLoading(false);
    setPlaying(true);
  }, []);
  const onError = useCallback(() => {
    setLoading(false);
    setPlaying(false);
  }, []);

  const handleVolumeChange = useCallback((e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    setMuted(false);
    localStorage.setItem(VOLUME_KEY, String(v));
  }, []);

  if (!open) return null;

  return (
    <div
      className={`radio-player ${isDayMode ? "radio-player--day" : ""}`}
      style={{ "--radio-accent": station.color }}
    >
      <audio
        ref={audioRef}
        preload="none"
        onCanPlay={onCanPlay}
        onError={onError}
      />

      {/* Header / now playing */}
      <div className="radio-player__header">
        <div className="radio-player__now">
          <Music size={13} strokeWidth={2} style={{ opacity: 0.6 }} />
          <span className="radio-player__kicker">RADIO</span>
          {playing && <span className="radio-player__live">LIVE</span>}
        </div>
        <EqBars playing={playing && !loading} color={station.color} />
      </div>

      {/* Vinyl + station info */}
      <div className="radio-player__hero">
        <div className="radio-player__stage">
          <div className="radio-player__signal">
            <Waves size={14} strokeWidth={2} />
            <span>{loading ? "Tuning stream" : playing ? "Broadcasting now" : "Ready to play"}</span>
          </div>
          <div className="radio-player__info">
            <span className="radio-player__station-name" style={{ color: station.color }}>
              {station.name}
            </span>
            <span className="radio-player__genre">{station.genre}</span>
          </div>
        </div>
        <div className="radio-player__info">
          <VinylDisc playing={playing && !loading} color={station.color} />
        </div>
      </div>

      {/* Transport controls */}
      <div className="radio-player__controls">
        <button
          className="radio-player__btn radio-player__btn--skip"
          onClick={() => switchStation(stationIndex - 1)}
          aria-label="Previous station"
        >
          <SkipBack size={16} strokeWidth={2} />
        </button>

        <button
          className={`radio-player__btn radio-player__btn--play ${loading ? "radio-player__btn--loading" : ""}`}
          onClick={togglePlay}
          aria-label={playing ? "Pause" : "Play"}
          style={{ "--accent": station.color }}
        >
          {playing ? <Pause size={20} strokeWidth={2.2} /> : <Play size={20} strokeWidth={2.2} />}
        </button>

        <button
          className="radio-player__btn radio-player__btn--skip"
          onClick={() => switchStation(stationIndex + 1)}
          aria-label="Next station"
        >
          <SkipForward size={16} strokeWidth={2} />
        </button>
      </div>

      {/* Volume */}
      <div className="radio-player__volume">
        <button
          className="radio-player__btn radio-player__btn--vol"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted || volume === 0 ? (
            <VolumeX size={14} strokeWidth={2} />
          ) : (
            <Volume2 size={14} strokeWidth={2} />
          )}
        </button>
        <input
          type="range"
          className="radio-player__slider"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : volume}
          onChange={handleVolumeChange}
          style={{ "--fill": station.color }}
        />
      </div>

      {/* Station selector */}
      <div className="radio-player__stations">
        {STATIONS.map((s, i) => (
          <StationChip
            key={s.id}
            station={s}
            active={i === stationIndex}
            onClick={() => switchStation(i)}
          />
        ))}
      </div>
    </div>
  );
}

export { STATIONS };
