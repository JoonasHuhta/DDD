import React, { useState } from 'react';
import { Settings, Volume2, VolumeX, Save, Download, Upload, Trash2, Power, HelpCircle } from 'lucide-react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import { useAudio } from '../lib/stores/useAudio';
import AdaptivePanel from './AdaptivePanel';

interface OptionsPanelProps {
  onClose: () => void;
}

export default function OptionsPanel({ onClose }: OptionsPanelProps) {
  const { performHardReset, gameSettings, updateGameSettings } = useMetamanGame();
  const { isMuted, toggleMute, currentTrack, setTrack } = useAudio();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');

  const handleHardReset = () => {
    if (resetConfirmText.toLowerCase() === 'reset everything') {
      performHardReset();
      alert('Game has been reset!');
      window.location.reload();
    }
  };

  const toggleSetting = (key: string) => {
    updateGameSettings({ [key]: !((gameSettings as any)[key]) });
  };

  return (
    <AdaptivePanel title="OPTIONS" onClose={onClose} position="left">
      <div className="space-y-4 px-1">
        {/* Audio */}
        <div className="p-4 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="text-sm font-black text-black uppercase">Audio</span>
            </div>
            <button
              onClick={toggleMute}
              className={`px-4 py-1 border-4 border-black rounded-xl font-black uppercase italic transition-all ${
                isMuted ? 'bg-[#FF1744] text-white' : 'bg-[#4ECDC4] text-black'
              }`}
            >
              {isMuted ? 'MUTED' : 'ON'}
            </button>
          </div>

          <div className="space-y-2 border-t-2 border-dashed border-gray-200 pt-3">
            <span className="text-[10px] font-black uppercase text-gray-500 block mb-2">Select Track</span>
            <div className="grid grid-cols-2 gap-2">
              {['Forgo1.mp3', 'Forgo2.mp3', 'Forgo3.mp3', 'Forgo4.mp3'].map((track) => (
                <button
                  key={track}
                  onClick={() => setTrack(track)}
                  className={`text-[8px] font-black py-1.5 px-2 rounded-lg border-2 border-black truncate uppercase transition-all ${
                    currentTrack === track 
                      ? 'bg-black text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {track.replace('.mp3', '')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Gameplay Settings */}
        <div className="p-4 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <h3 className="text-xs font-black uppercase text-gray-500 mb-3 ml-1">Gameplay</h3>
          <div className="space-y-3">
            {/* Show Particles */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-black uppercase">Visual Effects</span>
              <button
                onClick={() => toggleSetting('showParticles')}
                className={`px-3 py-1 border-2 border-black rounded-lg text-[10px] font-black uppercase ${
                  gameSettings.showParticles ? 'bg-[#4ECDC4]' : 'bg-gray-200'
                }`}
              >
                {gameSettings.showParticles ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Contextual Help */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-3 h-3" />
                <span className="text-xs font-black text-black uppercase">Help Tips</span>
              </div>
              <button
                onClick={() => toggleSetting('showContextualHelp')}
                className={`px-3 py-1 border-2 border-black rounded-lg text-[10px] font-black uppercase ${
                  (gameSettings as any).showContextualHelp ? 'bg-[#4ECDC4]' : 'bg-gray-200'
                }`}
              >
                {(gameSettings as any).showContextualHelp ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Developer / Simulation Settings */}
        <div className="p-4 bg-gray-100 border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <h3 className="text-xs font-black uppercase text-blue-600 mb-3 ml-1 flex items-center gap-2">
            <Settings className="w-3 h-3" /> Developer Tools
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-black uppercase">Safe Area Simulator</span>
                <span className="text-[8px] text-gray-500 font-bold uppercase">Visualizes mobile nav bars</span>
              </div>
              <button
                onClick={() => toggleSetting('simulateSafeArea')}
                className={`px-3 py-1 border-2 border-black rounded-lg text-[10px] font-black uppercase ${
                  (gameSettings as any).simulateSafeArea ? 'bg-[#4ECDC4]' : 'bg-gray-200'
                }`}
              >
                {(gameSettings as any).simulateSafeArea ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Hard Reset */}
        <div className="p-4 bg-[#FF1744] border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-white">
          <h3 className="text-sm font-black uppercase mb-3 flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Danger Zone
          </h3>
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-2 bg-black border-2 border-white rounded-xl font-black uppercase italic"
            >
              RESET PROGRESS
            </button>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                className="w-full px-2 py-1 bg-white text-black border-2 border-black rounded-lg text-xs"
                placeholder="type 'reset everything'"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-1 bg-gray-500 rounded-lg font-black text-xs"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleHardReset}
                  disabled={resetConfirmText.toLowerCase() !== 'reset everything'}
                  className="flex-1 py-1 bg-black rounded-lg font-black text-xs disabled:opacity-50"
                >
                  CONFIRM
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdaptivePanel>
  );
}