/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, Square, Music, Link } from 'lucide-react';

interface Preset {
  name: string;
  vid: string;
  emoji: string;
}

const PRESETS: Preset[] = [
  { name: "Wood Cabin Lo-Fi Beats", vid: "jfKfPfyJRdk", emoji: "🍂" },
  { name: "Rain-washed Café Jazz", vid: "neV3EPgvZ3g", emoji: "☕" },
  { name: "Vintage Library Classics", vid: "4Tr0otuiQuU", emoji: "🎻" },
  { name: "Mossy Greenhouse Rain", vid: "mPZkdNFkNps", emoji: "🌧️" },
  { name: "Whispering Meadow Birds", vid: "eKFTSSKCzWA", emoji: "🌿" },
  { name: "Cozy Candlelit Study", vid: "WPni755-Krg", emoji: "🕯️" }
];

export default function MusicPlayer() {
  const [customUrl, setCustomUrl] = useState("");
  const [currentVid, setCurrentVid] = useState<string | null>(null);
  const [currentName, setCurrentName] = useState<string | null>(null);

  const parseYoutubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handlePlayPreset = (preset: Preset) => {
    if (currentVid === preset.vid) {
      // Toggle play off
      setCurrentVid(null);
      setCurrentName(null);
    } else {
      setCurrentVid(preset.vid);
      setCurrentName(preset.name);
    }
  };

  const handlePlayCustom = () => {
    if (!customUrl.trim()) return;
    const vid = parseYoutubeId(customUrl);
    if (vid) {
      setCurrentVid(vid);
      setCurrentName("Custom Stream");
    } else {
      alert("Invalid YouTube URL. Please check and try again.");
    }
  };

  const handleStop = () => {
    setCurrentVid(null);
    setCurrentName(null);
    setCustomUrl("");
  };

  return (
    <div className="bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-[var(--text)] flex items-center gap-2">
            <Music className="w-4 h-4 text-[var(--accent)]" />
            <span>Study Music Room</span>
          </h4>
          <p className="text-xs text-[var(--muted)] mt-1">Play background ambience to assist dynamic concentration</p>
        </div>
        
        {/* Custom Input */}
        <div className="flex gap-2 w-full sm:w-auto shrink-0">
          <input
            type="text"
            placeholder="Paste YouTube Video URL..."
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="inp py-1.5 px-3 text-xs w-full sm:w-[220px]"
          />
          <button 
            onClick={handlePlayCustom}
            className="btn btn-ghost py-1.5 px-3 text-xs flex items-center gap-1.5 border-[var(--border-strong)]"
          >
            <Link className="w-3.5 h-3.5" />
            <span>Load</span>
          </button>
          {currentVid && (
            <button 
              onClick={handleStop}
              className="btn py-1.5 px-3 text-xs bg-rose-500 hover:bg-rose-600 text-white flex items-center gap-1.5 shadow-sm"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop</span>
            </button>
          )}
        </div>
      </div>

      {/* Preset List */}
      <div className="flex flex-wrap gap-2 mt-4">
        {PRESETS.map((preset) => {
          const isPlaying = currentVid === preset.vid;
          return (
            <button
              key={preset.vid}
              onClick={() => handlePlayPreset(preset)}
              className={`
                px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 cursor-pointer transition-all duration-150
                ${isPlaying 
                  ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-sm' 
                  : 'bg-[var(--surface)] border-[var(--border)] text-[var(--muted-dark)] hover:border-[var(--border-strong)] hover:text-[var(--text)]'}
              `}
            >
              <span>{preset.emoji}</span>
              <span>{preset.name}</span>
            </button>
          );
        })}
      </div>

      {/* Hidden/Mini Embedded Player Box */}
      {currentVid && (
        <div className="mt-4 bg-black rounded-lg overflow-hidden relative shadow-md">
          <div className="absolute top-0 left-0 right-0 px-3 py-1 bg-black/60 backdrop-blur-xs text-[10px] text-white font-mono flex items-center justify-between z-10">
            <span className="truncate">🎵 Now Playing: {currentName}</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Streaming Loop
            </span>
          </div>
          <iframe
            width="100%"
            height="80"
            src={`https://www.youtube.com/embed/${currentVid}?autoplay=1&loop=1&playlist=${currentVid}&controls=0`}
            title="Eternity Concentration Radio Player"
            allow="autoplay; encrypted-media"
            referrerPolicy="no-referrer"
            className="border-none"
          />
        </div>
      )}
    </div>
  );
}
