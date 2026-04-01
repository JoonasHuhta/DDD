import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Zap, Target, Users, Brain, Star, Crown } from 'lucide-react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import AdaptivePanel from './AdaptivePanel';

const TutorialPanel: React.FC = () => {
  const { setShowTutorial } = useMetamanGame();
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: "WELCOME TO DAN'S WORLD!",
      content: (
        <div className="space-y-4">
          <p className="text-black font-bold uppercase italic">Build your social media empire from your corporate tower!</p>
          <div className="bg-[#4ECDC4] p-4 border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <h4 className="text-black font-black mb-2 uppercase italic">🎯 YOUR GOAL:</h4>
            <p className="text-xs font-bold text-black uppercase">Attract users, generate income, and dodge lawsuits to become the ultimate social media mogul.</p>
          </div>
        </div>
      )
    },
    {
      title: "CLICK & COLLECT!",
      content: (
        <div className="space-y-4">
          <div className="bg-[#FFD700] p-4 border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <h4 className="text-black font-black mb-2 uppercase italic">🖱️ CLICK TO EARN</h4>
            <p className="text-xs font-bold text-black uppercase">Click anywhere to earn money instantly. Buy upgrades to grow faster!</p>
          </div>
          <div className="bg-[#4ECDC4] p-4 border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <h4 className="text-black font-black mb-2 uppercase italic">👥 LURE CITIZENS</h4>
            <p className="text-xs font-bold text-black uppercase">Click on walking citizens to lure them to your tower for big user gains!</p>
          </div>
        </div>
      )
    },
    {
      title: "ELITE COLLECTION & MANSION",
      content: (
        <div className="space-y-4">
          <div className="bg-[#FF1744] text-white p-4 border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <h4 className="font-black mb-2 uppercase italic flex items-center gap-2 text-sm">
              <Crown className="w-5 h-5" /> CAPTURE VIPS
            </h4>
            <p className="text-[10px] font-bold uppercase mb-1">Look for purple-tier and gold-tier Elites in the city. Capture them to unlock massive permanent boosts!</p>
          </div>
          <div className="bg-white p-4 border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <h4 className="text-black font-black mb-2 uppercase italic flex items-center gap-2 text-sm">
              <Star className="w-5 h-5 text-yellow-500" /> UPGRADE DAN'S SUITE
            </h4>
            <p className="text-[10px] font-bold text-black uppercase">Collect Orbs in the basement to buy upgrades in Dan's Mansion. Better desks, better clothes, better bonuses!</p>
          </div>
        </div>
      )
    },
    {
      title: "WATCH THE HEAT!",
      content: (
        <div className="space-y-4">
          <div className="bg-[#FF6B35] text-white p-4 border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <h4 className="font-black mb-2 uppercase italic flex items-center gap-2 text-sm">
              <Zap className="w-5 h-5" /> REGULATORY HEAT
            </h4>
            <p className="text-[10px] font-bold uppercase mb-1">High user growth attracts unwanted attention. If your 'HEAT' hits 100%, a SHITSTORM crisis begins!</p>
          </div>
          <div className="bg-white p-4 border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <h4 className="text-black font-black mb-2 uppercase italic flex items-center gap-2 text-sm">
              <Brain className="w-5 h-5 text-[#4ECDC4]" /> LEGAL DEFENSE
            </h4>
            <p className="text-[10px] font-bold text-black uppercase">Expand your Legal Department to lower Heat and prevent lawsuits from tanking your empire.</p>
          </div>
        </div>
      )
    },
    {
      title: "READY TO RULE!",
      content: (
        <div className="space-y-4">
          <div className="bg-[#FFD700] p-6 border-4 border-black rounded-2xl shadow-[6px_6px_0_0_rgba(0,0,0,1)] text-black">
            <h4 className="font-black mb-3 text-center uppercase italic text-2xl">🎮 MISSION START!</h4>
            <ul className="space-y-2 text-[10px] font-black uppercase italic">
              <li className="flex items-center gap-2"><div className="w-2 h-2 bg-black rounded-full" /> 1. Click to earn cash / department</li>
              <li className="flex items-center gap-2"><div className="w-2 h-2 bg-black rounded-full" /> 2. Collect Citizens for user gains</li>
              <li className="flex items-center gap-2"><div className="w-2 h-2 bg-black rounded-full" /> 3. Harvest orbs in the Basement</li>
              <li className="flex items-center gap-2"><div className="w-2 h-2 bg-black rounded-full" /> 4. Capture Elites for major bonuses</li>
              <li className="flex items-center gap-2"><div className="w-2 h-2 bg-black rounded-full" /> 5. Manage Heat via Legal Dept</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const closeTutorial = () => {
    localStorage.setItem('metaman_tutorial_seen', 'true');
    setShowTutorial(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] p-4">
      <div className="bg-[#FFD700] border-4 border-black rounded-3xl max-w-lg w-full shadow-[12px_12px_0_0_rgba(0,0,0,1)] overflow-hidden">
        <div className="px-6 py-4 border-b-4 border-black flex justify-between items-center bg-white">
          <h2 className="text-xl font-black text-black uppercase italic tracking-tighter">
            {tutorialSteps[currentStep].title}
          </h2>
          <button onClick={closeTutorial} className="p-1 hover:rotate-90 transition-transform">
            <X className="w-8 h-8 text-black" />
          </button>
        </div>

        <div className="px-6 py-8">
          {tutorialSteps[currentStep].content}
        </div>

        <div className="px-6 py-4 border-t-4 border-black flex justify-between items-center bg-white">
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="bg-gray-200 border-4 border-black px-4 py-2 rounded-xl font-black uppercase italic active:translate-y-1 disabled:opacity-50"
            >
              BACK
            </button>
            {currentStep < tutorialSteps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="bg-[#4ECDC4] border-4 border-black px-4 py-2 rounded-xl font-black uppercase italic active:translate-y-1 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
              >
                NEXT
              </button>
            ) : (
              <button
                onClick={closeTutorial}
                className="bg-[#FF1744] text-white border-4 border-black px-6 py-2 rounded-xl font-black uppercase italic active:translate-y-1 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
              >
                LET'S GO!
              </button>
            )}
          </div>
          <div className="text-xs font-black uppercase italic">{currentStep + 1}/{tutorialSteps.length}</div>
        </div>
      </div>
    </div>
  );
};

export default TutorialPanel;