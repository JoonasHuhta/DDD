import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gavel, 
  ShieldAlert, 
  UserCheck, 
  TrendingDown, 
  TrendingUp, 
  Camera, 
  Zap, 
  AlertTriangle,
  X 
} from 'lucide-react';
import { useMetamanGame } from '../../lib/stores/useMetamanGame';
import AdaptiveButton from '../AdaptiveButton';
import AdaptivePanel from '../AdaptivePanel';

interface Question {
  id: number;
  text: string;
  options: {
    text: string;
    impact: {
      composure: number;
      suspicion: number;
      heat: number;
    };
    feedback: string;
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Mr. Dan, our data suggests 'Dopamine Dealer' has been intentionally targeting minor cohorts. Do you admit the algorithm is designed for addiction?",
    options: [
      { 
        text: "Innovation requires deep engagement, Senator.", 
        impact: { composure: 10, suspicion: 5, heat: 5 },
        feedback: "The Senator narrows his eyes. 'Engagement or exploitation?'"
      },
      { 
        text: "We follow all safety guidelines. Always.", 
        impact: { composure: -5, suspicion: 15, heat: -10 },
        feedback: "A camera flashes. Public suspicion rises at the robotic response."
      },
      { 
        text: "I take full responsibility for our impact.", 
        impact: { composure: 20, suspicion: -10, heat: 10 },
        feedback: "Walsh looks surprised. Your honesty is disarming."
      },
      { 
        text: "This is a witch hunt against successful tech!", 
        impact: { composure: -15, suspicion: 10, heat: 20 },
        feedback: "The crowd murmurs. Your aggression is being noted."
      }
    ]
  },
  {
    id: 2,
    text: "Reports show your 'Luring Lab' collects biometric data without explicit consent. How do you justify this breach of privacy?",
    options: [
      { 
        text: "It's anonymized for user experience improvements.", 
        impact: { composure: 5, suspicion: 10, heat: 0 },
        feedback: "'Anonymized is a flexible term in your industry,' Walsh retorts."
      },
      { 
        text: "The terms of service are clear on this matter.", 
        impact: { composure: -10, suspicion: 20, heat: 5 },
        feedback: "A senator scoffs. 'A 500-page document no child can read?'"
      },
      { 
        text: "We are phasing out biometric tracking as we speak.", 
        impact: { composure: 15, suspicion: -5, heat: -15 },
        feedback: "A calculated lie. It buys you some room."
      },
      { 
        text: "Everyone does it. We just do it better.", 
        impact: { composure: -20, suspicion: 15, heat: 25 },
        feedback: "The 'Better' part generates a lot of negative press."
      }
    ]
  },
  {
    id: 3,
    text: "The 'Dopa Tower' recently released a shadow update that increased user anxiety by 30%. Was this an intentional loyalty test?",
    options: [
      { 
        text: "It was an unoptimized A/B test. A mistake.", 
        impact: { composure: 10, suspicion: 5, heat: -5 },
        feedback: "Incompetence is better than malice in this room."
      },
      { 
        text: "Anxiety is a side effect of meaningful connection.", 
        impact: { composure: -20, suspicion: 25, heat: 15 },
        feedback: "Walsh writes something down aggressively. You're in trouble."
      },
      { 
        text: "We prioritize user well-being above all metrics.", 
        impact: { composure: 0, suspicion: 10, heat: -10 },
        feedback: "Generic corporate speak. It's safe, but unconvincing."
      },
      { 
        text: "Users are free to leave the platform at any time.", 
        impact: { composure: -10, suspicion: 15, heat: 10 },
        feedback: "The 'Freedom' defense falls flat under these spotlights."
      }
    ]
  }
];

const SenateHearing: React.FC = () => {
  const { 
    setShowSenateHearing, 
    income, 
    updateCharacterState,
    formatNumber 
  } = useMetamanGame();
  
  const [currentRound, setCurrentRound] = useState(0);
  const [composure, setComposure] = useState(100);
  const [suspicion, setSuspicion] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isGameOver, setIsGameOver] = useState(false);
  const [flash, setFlash] = useState(false);

  const handleAnswer = (impact: any, fb: string) => {
    setComposure(prev => Math.max(0, Math.min(100, prev + impact.composure)));
    setSuspicion(prev => Math.max(0, Math.min(100, prev + impact.suspicion)));
    setFeedback(fb);
    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    if (currentRound < QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentRound(prev => prev + 1);
        setFeedback("");
      }, 2000);
    } else {
      setTimeout(() => {
        setIsGameOver(true);
      }, 2000);
    }
  };

  const getVerdict = () => {
    if (composure > 70 && suspicion < 30) return {
      title: "Vindicated",
      desc: "You successfully charmed the committee. Stocks are soaring!",
      award: "Regulatory heat decreased by 50%",
      color: "text-emerald-400"
    };
    if (composure < 30 || suspicion > 70) return {
      title: "CRUSHED",
      desc: "A public relations disaster. Fines are incoming.",
      award: "Loss of $500K and heat increased by 40",
      color: "text-red-500"
    };
    return {
      title: "Mixed Outcome",
      desc: "The investigation continues, but you survived the day.",
      award: "Slight heat increase",
      color: "text-amber-400"
    };
  };

  const verdict = getVerdict();

  const handleFinish = () => {
    // Apply consequences based on the verdict
    const state = useMetamanGame.getState();
    
    if (verdict.title === "CRUSHED") {
        // Severe penalty for failure
        state.decrementIncome(500000);
        state.setRegulatoryRisk(state.regulatoryRisk + 40);
        state.addVisualEffect?.('money', window.innerWidth / 2, window.innerHeight / 2, 'extreme', '-$500,000');
        console.log("🚫 SENATE HEARING FAILURE: -$500K, +40 HEAT");
    } else if (verdict.title === "Vindicated") {
        // Reward for success
        state.setRegulatoryRisk(state.regulatoryRisk * 0.5);
        state.addVisualEffect?.('achievement', window.innerWidth / 2, window.innerHeight / 2, 'high', 'VINDICATED: HEAT REDUCED');
        console.log("✅ SENATE HEARING SUCCESS: HEAT REDUCED BY 50%");
    } else {
        // Neutral outcome
        state.setRegulatoryRisk(state.regulatoryRisk + 10);
        console.log("⚠️ SENATE HEARING MIXED: +10 HEAT");
    }
    
    setShowSenateHearing(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md font-mono"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-full bg-gradient-to-b from-blue-900/10 to-transparent" />
        <AnimatePresence>
          {flash && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white"
            />
          )}
        </AnimatePresence>
      </div>

      <AdaptivePanel 
        title="SENATE JUDICIARY COMMITTEE - ROOM 216"
        icon={<Gavel size={20} />}
        onClose={() => setShowSenateHearing(false)}
        className="w-[900px] h-[650px] border-slate-700 bg-slate-900/80"
      >
        <div className="flex flex-col h-full gap-4 p-4 sm:p-6 overflow-y-auto scrollbar-thin">
          
          {/* Stats Header */}
          <div className="flex gap-4 p-4 border rounded-lg bg-black/40 border-slate-800">
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>COMPOSURE</span>
                <span>{composure}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800">
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: `${composure}%` }}
                  className={`h-full rounded-full ${composure < 30 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-blue-400'}`}
                />
              </div>
            </div>
            
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>PUBLIC SUSPICION</span>
                <span>{suspicion}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800">
                <motion.div 
                  initial={{ width: '0%' }}
                  animate={{ width: `${suspicion}%` }}
                  className={`h-full rounded-full ${suspicion > 70 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-amber-400'}`}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 border-l border-slate-700">
              <div className="text-right">
                <div className="text-[10px] text-slate-500">SESSION CREDIT</div>
                <div className="text-emerald-400 font-bold">${formatNumber(income)}</div>
              </div>
            </div>
          </div>

          {!isGameOver ? (
            <>
              {/* Question Area */}
              <div className="relative flex-1 p-4 sm:p-8 rounded-lg bg-black/60 border border-slate-800 flex flex-col items-center justify-center text-center">
                <div className="absolute top-4 left-4 text-[10px] text-slate-600 uppercase tracking-widest">
                  Round {currentRound + 1} of {QUESTIONS.length}
                </div>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentRound}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="text-lg sm:text-2xl font-bold text-slate-100 leading-tight max-w-2xl px-2">
                      "{QUESTIONS[currentRound].text}"
                    </div>
                    
                    {feedback && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-amber-400 italic text-sm"
                      >
                        {feedback}
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-2 gap-4">
                {QUESTIONS[currentRound].options.map((opt, idx) => (
                  <AdaptiveButton
                    key={idx}
                    disabled={!!feedback}
                    variant="ghost"
                    onClick={() => handleAnswer(opt.impact, opt.feedback)}
                    className="h-auto min-h-[5rem] text-left justify-start items-start p-3 sm:p-4 hover:bg-blue-900/10 border-slate-800"
                  >
                    <span className="text-xs sm:text-sm leading-snug">{opt.text}</span>
                  </AdaptiveButton>
                ))}
              </div>
            </>
          ) : (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
            >
              <div className="space-y-4">
                <div className="text-[10px] text-slate-500 tracking-[0.5em] uppercase font-bold">Hearing Verdict</div>
                <div className={`text-6xl font-black italic tracking-tighter ${verdict.color}`}>
                  {verdict.title}
                </div>
              </div>

              <div className="max-w-md space-y-2">
                <p className="text-slate-300">{verdict.desc}</p>
                <div className="inline-block px-4 py-2 border border-slate-700 bg-black/40 rounded italic text-white text-sm">
                  {verdict.award}
                </div>
              </div>

              <AdaptiveButton 
                variant="secondary" 
                onClick={handleFinish}
                className="w-64"
              >
                RETURN TO EMPIRE
              </AdaptiveButton>
            </motion.div>
          )}

          {/* Footer Detail */}
          <div className="flex justify-between items-center text-[10px] text-slate-600 border-t border-slate-800 pt-4">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Camera size={10} /> PRESS POOL: ACTIVE
              </span>
              <span className="flex items-center gap-1">
                <Zap size={10} /> PUBLIC BROADCAST: LIVE
              </span>
            </div>
            <div>
              HEARING ID: #216-TS-WALSH-DOM
            </div>
          </div>

        </div>
      </AdaptivePanel>
    </motion.div>
  );
};

export default SenateHearing;
