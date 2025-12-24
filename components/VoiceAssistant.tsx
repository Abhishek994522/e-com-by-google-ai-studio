
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { startLiveAssistant, decodeBase64, decodeAudioData } from '../services/geminiService';

const VoiceAssistant: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsActive(false);
    setIsConnecting(false);
  }, []);

  const handleToggle = async () => {
    if (isActive) {
      stopSession();
      return;
    }

    try {
      setIsConnecting(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const outCtx = audioContextRef.current;

      const sessionPromise = startLiveAssistant({
        onopen: () => {
          setIsConnecting(false);
          setIsActive(true);
          console.log('Voice session opened');
          
          const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
          const source = inCtx.createMediaStreamSource(stream);
          const scriptProcessor = inCtx.createScriptProcessor(4096, 1, 1);
          
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) {
              int16[i] = inputData[i] * 32768;
            }
            const base64 = btoa(String.fromCharCode(...new Uint8Array(int16.buffer)));
            
            sessionPromise.then(session => {
              session.sendRealtimeInput({
                media: { data: base64, mimeType: 'audio/pcm;rate=16000' }
              });
            });
          };

          source.connect(scriptProcessor);
          scriptProcessor.connect(inCtx.destination);
        },
        onmessage: async (msg: any) => {
          const audioBase64 = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audioBase64) {
            const bytes = decodeBase64(audioBase64);
            const buffer = await decodeAudioData(bytes, outCtx, 24000, 1);
            
            const source = outCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(outCtx.destination);
            
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            
            sourcesRef.current.add(source);
            source.onended = () => sourcesRef.current.delete(source);
          }

          if (msg.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        },
        onerror: (e: any) => {
          console.error('Voice error:', e);
          stopSession();
        },
        onclose: () => {
          console.log('Voice session closed');
          stopSession();
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to start voice assistant:', err);
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      <button
        onClick={handleToggle}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
          isActive ? 'bg-red-500 scale-110' : 'bg-indigo-600 hover:bg-indigo-700'
        } text-white`}
      >
        {isConnecting ? (
          <i className="fas fa-spinner fa-spin"></i>
        ) : isActive ? (
          <i className="fas fa-stop"></i>
        ) : (
          <i className="fas fa-microphone"></i>
        )}
      </button>
      {isActive && (
        <div className="absolute bottom-16 right-0 bg-white p-3 rounded-lg shadow-lg border border-indigo-100 min-w-[200px] text-center">
          <p className="text-xs font-semibold text-indigo-600 animate-pulse">Assistant Active</p>
          <p className="text-[10px] text-gray-500 mt-1">Listening for your request...</p>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;
