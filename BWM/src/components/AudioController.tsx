import { useEffect, useRef } from 'react';
import { useStoryStore } from '../stores/useStoryStore';

export const AudioController = () => {
  const soundOn = useStoryStore((state) => state.soundOn);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    if (soundOn && !audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      playAmbience();
    } else if (!soundOn && audioCtxRef.current) {
      sourceRef.current?.stop();
      sourceRef.current = null;
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }

    return () => {
      sourceRef.current?.stop();
      audioCtxRef.current?.close();
    };
  }, [soundOn]);

  const playAmbience = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generative soft white noise for wind/forest hum
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.015;
    }
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 200;
    filter.Q.value = 0.3;
    
    const gain = ctx.createGain();
    gain.gain.value = 0.4;
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    source.start();
    sourceRef.current = source;
  };

  return null;
};
