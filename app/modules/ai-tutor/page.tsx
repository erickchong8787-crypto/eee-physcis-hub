'use client';
import { useState, useEffect, useRef, ReactNode } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import Script from 'next/script';

// Declare global function from script_v2.js for TypeScript
declare global {
  interface Window {
    switchTab: (id: string) => void;
    initAllLabs?: () => void;
    changeMaterial?: () => void;
    changeDope?: () => void;
    resetRectTime?: () => void;
    resetTrans31?: () => void;
    update42Lab?: () => void;
    initScenario?: () => void;
    toggleAlarmInput?: (id: string) => void;
    initSwitchLab?: () => void;
    update51Lab?: () => void;
    toggleInput51?: (id: string) => void;
    initDebugLab?: () => void;
  }
}

const TheoryBox = ({ title, children }: { title: string, children: ReactNode }) => (
  <div className="mt-8 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm flex-shrink-0">
    <h3 className="text-base font-bold text-blue-400 mb-3 flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" /></svg>
      <span>{title}</span>
    </h3>
    <div className="prose prose-sm prose-invert max-w-none text-slate-300 leading-relaxed">
      {children}
    </div>
  </div>
);

export default function AiTutorPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Professor Online. What EEE topic are we analyzing today?" }
  ]);
  const [mode, setMode] = useState<'chat' | 'lab'>('chat');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugFault, setDebugFault] = useState('normal');
  const [rectMode, setRectMode] = useState('ac');
  const [loadRes, setLoadRes] = useState(10);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Re-initialize labs when switching to Lab mode
  useEffect(() => {
    if (mode === 'lab' && window.initAllLabs) {
      // Small delay to ensure DOM is fully rendered before script tries to find canvases
      setTimeout(() => {
        window.initAllLabs?.();
      }, 100);
    }
  }, [mode]);

  // Oscilloscope Animation Effect
  useEffect(() => {
    if (mode !== 'lab') return;

    const canvas = document.getElementById('canvas61') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      // Optimization: Only render if the section is visible
      if (canvas.offsetParent === null) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const width = canvas.width;
      const height = canvas.height;
      
      // Get controls (fallback to defaults if not found)
      const vDivInput = document.getElementById('vDiv61') as HTMLInputElement;
      const tDivInput = document.getElementById('tDiv61') as HTMLInputElement;
      
      const vScale = vDivInput ? parseFloat(vDivInput.value) : 2;
      const tScale = tDivInput ? parseFloat(tDivInput.value) : 5;

      // Update Display Values if elements exist
      const vDivVal = document.getElementById('vDivVal');
      const tDivVal = document.getElementById('tDivVal');
      if (vDivVal) vDivVal.innerText = vScale.toString();
      if (tDivVal) tDivVal.innerText = tScale.toString();

      // Clear
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Draw Grid
      ctx.strokeStyle = '#064e3b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = width/10; x < width; x += width/10) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
      for (let y = height/8; y < height; y += height/8) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
      ctx.stroke();

      // Center Axes
      ctx.strokeStyle = '#065f46';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width/2, 0); ctx.lineTo(width/2, height);
      ctx.moveTo(0, height/2); ctx.lineTo(width, height/2);
      ctx.stroke();

      // Draw Moving Sine Wave
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#34d399';
      ctx.beginPath();

      const freq = 60; // Hz
      const amp = 3.5; // Volts
      
      // Scale factors
      const pixelsPerVolt = (height / 8) / vScale;
      const pixelsPerSecond = (width / 10) / (tScale / 1000);

      for (let x = 0; x < width; x++) {
        const t = x / pixelsPerSecond;
        const y = (height / 2) - (amp * Math.sin(2 * Math.PI * freq * t - phase) * pixelsPerVolt);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      phase += 0.15; // Animation speed
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [mode]);

  // Circuit Debug Lab Effect
  useEffect(() => {
    if (mode !== 'lab') return;

    const canvas = document.getElementById('canvas62') as HTMLCanvasElement;
    const scenarioSelect = document.getElementById('debugScenario') as HTMLSelectElement;
    const meterDisplay = document.getElementById('meterDisplay');

    if (!canvas || !scenarioSelect || !meterDisplay) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let scale = 1;

    // --- SIMULATION LOGIC & DATA ---
    const VCC = 9.0;
    const R1 = 10000;
    const R2 = 2200;

    const probePoints = [
      { name: 'VCC', x: 200, y: 50, getVoltage: (s: string) => VCC },
      { name: 'BASE', x: 150, y: 150, getVoltage: (s: string) => {
          if (s === 'fault1') return VCC; // R2 is open, so Vb is pulled up to VCC via R1
          if (s === 'fault3') return 0.1; // Q1 Base-Emitter short
          if (s === 'fault2') return VCC * R2 / (R1 + R2); // C1 short has no DC effect here
          return VCC * R2 / (R1 + R2); // Normal voltage divider
        }
      },
      { name: 'COLLECTOR', x: 250, y: 150, getVoltage: (s: string) => {
          const Vb = probePoints.find(p => p.name === 'BASE')!.getVoltage(s);
          if (s === 'fault3' || Vb < 0.7) return VCC; // Q1 failed or is off, collector is pulled to VCC
          if (s === 'fault2') return 0; // C1 shorts collector to ground
          return 0.2; // Q1 is saturated
        }
      },
      { name: 'GND', x: 200, y: 250, getVoltage: (s: string) => 0.0 },
    ];

    const drawCircuit = () => {
      const { width, height } = canvas;
      
      // Calculate scale to fit circuit (approx 300x350 safe area) into canvas
      // Circuit center is roughly (200, 150)
      scale = Math.min(width / 300, height / 350, 1.5) * 0.75;

      ctx.clearRect(0, 0, width, height);
      
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(scale, scale);
      ctx.translate(-200, -150);

      ctx.strokeStyle = '#94a3b8';
      ctx.fillStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.font = '12px monospace';

      // Schematic components
      ctx.fillText('VCC', 190, 40);
      ctx.strokeRect(175, 50, 50, 20); ctx.fillText('R1', 230, 65);
      ctx.strokeRect(175, 200, 50, 20); ctx.fillText('R2', 230, 215);
      ctx.strokeRect(250, 140, 10, 20); ctx.fillText('C1', 265, 155);
      ctx.beginPath();
      ctx.arc(200, 150, 25, 0, 2 * Math.PI); ctx.fillText('Q1', 192, 155);
      ctx.stroke();

      // Connections
      ctx.beginPath();
      ctx.moveTo(200, 40); ctx.lineTo(200, 50);
      ctx.moveTo(200, 70); ctx.lineTo(200, 125);
      ctx.moveTo(200, 175); ctx.lineTo(200, 200);
      ctx.moveTo(200, 220); ctx.lineTo(200, 250);
      ctx.moveTo(150, 150); ctx.lineTo(175, 150);
      ctx.moveTo(225, 150); ctx.lineTo(250, 150);
      ctx.moveTo(200, 250); ctx.lineTo(180, 250); ctx.lineTo(220, 250); // GND
      ctx.stroke();
      
      // Probe points
      ctx.fillStyle = 'rgba(239, 68, 68, 0.6)'; // red-500 with transparency
      probePoints.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, 2 * Math.PI);
        ctx.fill();
      });
      ctx.restore();
    };

    // Animation State: Current Flow Particles
    const particles = Array.from({ length: 15 }, () => ({
      y: 40 + Math.random() * 210,
      speed: 0.5 + Math.random()
    }));

    const render = () => {
      // Handle Resize & Visibility
      if (!canvas.offsetParent) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      // Ensure canvas resolution matches display size for sharpness
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      drawCircuit();

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(scale, scale);
      ctx.translate(-200, -150);

      // Draw Current Flow (Conventional: + to -)
      const scenario = scenarioSelect.value;
      ctx.fillStyle = '#fbbf24'; // Amber dots
      
      particles.forEach(p => {
        let blocked = false;
        // Fault 1: R2 Open (Bottom Resistor)
        if (scenario === 'fault1' && p.y > 190) blocked = true;
        // Fault 3: Q1 Failure (Transistor)
        if (scenario === 'fault3' && p.y > 125 && p.y < 175) blocked = true;

        if (!blocked) {
          p.y += p.speed;
          if (p.y > 250) p.y = 40;
        }

        ctx.beginPath();
        ctx.arc(200, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    const handleCanvasClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      // Inverse transform to get logic coordinates
      const x = (event.clientX - rect.left - canvas.width / 2) / scale + 200;
      const y = (event.clientY - rect.top - canvas.height / 2) / scale + 150;
      
      for (const point of probePoints) {
        if (Math.sqrt((x - point.x)**2 + (y - point.y)**2) < 10) {
          meterDisplay.innerText = `${point.getVoltage(scenarioSelect.value).toFixed(2)} V`;
          return;
        }
      }
    };
    
    window.initDebugLab = () => {
      meterDisplay.innerText = '0.00 V';
    };

    render(); // Start Animation Loop
    canvas.addEventListener('click', handleCanvasClick);

    return () => {
      canvas.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(animationFrameId);
      delete window.initDebugLab;
    };
  }, [mode]);

  // Op-Amp Gain Lab Effect (Waveform Monitor Fix)
  useEffect(() => {
    if (mode !== 'lab') return;

    const canvas = document.getElementById('canvas42') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      if (!canvas.offsetParent) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
      const { width, height } = canvas;

      const modeSelect = document.getElementById('opampMode') as HTMLSelectElement;
      const rfInput = document.getElementById('rfSlider') as HTMLInputElement;
      const rinInput = document.getElementById('rinSlider') as HTMLInputElement;
      const vinInput = document.getElementById('vin42Slider') as HTMLInputElement;

      if (!modeSelect || !rfInput || !rinInput || !vinInput) {
         animationFrameId = requestAnimationFrame(render);
         return;
      }

      const opMode = modeSelect.value;
      const Rf = parseFloat(rfInput.value);
      const Rin = parseFloat(rinInput.value);
      const VinAmp = parseFloat(vinInput.value);

      const rfDisp = document.getElementById('rfDisp');
      const rinDisp = document.getElementById('rinDisp');
      const vinDisp = document.getElementById('vin42Disp');
      const gainDisp = document.getElementById('gainVal');
      const voutDisp = document.getElementById('vout42Val');

      if (rfDisp) rfDisp.innerText = Rf.toString();
      if (rinDisp) rinDisp.innerText = Rin.toString();
      if (vinDisp) vinDisp.innerText = VinAmp.toFixed(1);

      let gain = 0;
      let voutMax = 0;
      const Vsat = 12;

      if (opMode === 'inverting') {
        gain = -Rf / Rin;
        voutMax = Math.abs(gain * VinAmp);
      } else if (opMode === 'noninverting') {
        gain = 1 + (Rf / Rin);
        voutMax = Math.abs(gain * VinAmp);
      } else {
        gain = 100000; 
        voutMax = Vsat; 
      }

      const isSaturated = voutMax > Vsat;
      
      if (gainDisp) gainDisp.innerText = opMode === 'comparator' ? 'Open Loop' : gain.toFixed(2) + 'x';
      if (voutDisp) voutDisp.innerText = (isSaturated ? Vsat : voutMax).toFixed(1) + ' V' + (isSaturated ? ' (Clip)' : '');

      // DRAW
      ctx.clearRect(0, 0, width, height);

      // Schematic
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      const cx = width / 2;
      const cy = height / 3;
      
      // Op-Amp Triangle
      ctx.beginPath();
      ctx.moveTo(cx - 40, cy - 40);
      ctx.lineTo(cx - 40, cy + 40);
      ctx.lineTo(cx + 40, cy);
      ctx.closePath();
      ctx.stroke();
      
      ctx.font = '14px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('-', cx - 35, cy - 15);
      ctx.fillText('+', cx - 35, cy + 25);

      ctx.beginPath();
      if (opMode === 'inverting') {
        ctx.moveTo(cx - 100, cy - 20); ctx.lineTo(cx - 40, cy - 20); // Input to -
        ctx.moveTo(cx - 40, cy - 20); ctx.lineTo(cx - 40, cy - 60); ctx.lineTo(cx + 40, cy - 60); ctx.lineTo(cx + 40, cy); // Feedback
        ctx.moveTo(cx - 40, cy + 20); ctx.lineTo(cx - 40, cy + 50); ctx.lineTo(cx - 20, cy + 50); // + to GND
        ctx.fillText('Rin', cx - 80, cy - 25);
        ctx.fillText('Rf', cx, cy - 65);
      } else if (opMode === 'noninverting') {
        ctx.moveTo(cx - 100, cy + 20); ctx.lineTo(cx - 40, cy + 20); // Input to +
        ctx.moveTo(cx - 40, cy - 20); ctx.lineTo(cx - 40, cy - 60); ctx.lineTo(cx + 40, cy - 60); ctx.lineTo(cx + 40, cy); // Feedback
        ctx.moveTo(cx - 40, cy - 20); ctx.lineTo(cx - 80, cy - 20); ctx.lineTo(cx - 80, cy + 50); ctx.lineTo(cx - 60, cy + 50); // - to GND via Rin
        ctx.fillText('Rin', cx - 90, cy);
        ctx.fillText('Rf', cx, cy - 65);
      } else {
        ctx.moveTo(cx - 100, cy - 20); ctx.lineTo(cx - 40, cy - 20);
        ctx.moveTo(cx - 100, cy + 20); ctx.lineTo(cx - 40, cy + 20);
        ctx.fillText('Vref', cx - 90, cy + 35);
        ctx.fillText('Vin', cx - 90, cy - 25);
      }
      ctx.moveTo(cx + 40, cy); ctx.lineTo(cx + 100, cy);
      ctx.stroke();

      // Waveform Monitor
      const graphY = height * 0.75;
      const graphW = width - 40;
      const graphX = 20;

      ctx.strokeStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(graphX, graphY); ctx.lineTo(graphX + graphW, graphY);
      ctx.stroke();

      // Input (Yellow)
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < graphW; i++) {
        const t = i + time;
        const v = Math.sin(t * 0.05) * VinAmp * 10;
        ctx.lineTo(graphX + i, graphY - v);
      }
      ctx.stroke();

      // Output (Purple)
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < graphW; i++) {
        const t = i + time;
        const vin = Math.sin(t * 0.05) * VinAmp;
        let vout = 0;
        if (opMode === 'comparator') {
           vout = vin > 0 ? Vsat : -Vsat;
        } else {
           vout = vin * gain;
        }
        if (vout > Vsat) vout = Vsat;
        if (vout < -Vsat) vout = -Vsat;
        ctx.lineTo(graphX + i, graphY - (vout * 10));
      }
      ctx.stroke();

      ctx.fillStyle = '#fbbf24'; ctx.fillText('Vin', graphX, graphY - 40);
      ctx.fillStyle = '#c084fc'; ctx.fillText('Vout', graphX, graphY + 40);

      time += 2;
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    
    window.update42Lab = () => {}; // No-op

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.update42Lab;
    };
  }, [mode]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to get response from AI");
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (err: any) { 
      console.error("Connection Error:", err); 
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ **Error**: ${err.message || "Could not connect to the AI service."}` }]);
    } finally { 
      setIsLoading(false); 
    }
  };

  return (
    <main className="min-h-screen relative text-slate-200 overflow-hidden bg-[#050505]">
      
     {/* --- OBVIOUS SHARED CIRCUIT SYSTEM --- */}

{/* 1. Thicker Grid */}
<div className="fixed inset-0 z-[-3] pointer-events-none opacity-30 bg-[linear-gradient(to_right,#334155_1.5px,transparent_1.5px),linear-gradient(to_bottom,#334155_1.5px,transparent_1.5px)] bg-[size:50px_50px]"></div>

{/* 2. High-Contrast Circuit Trace */}
<div className="fixed inset-0 z-[-2] pointer-events-none opacity-50"
     style={{ 
       backgroundImage: `url("data:image/svg+xml,%3Csvg width='150' height='150' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 75h150M75 0v150' stroke='%233b82f6' stroke-width='2'/%3E%3Ccircle cx='75' cy='75' r='5' fill='%2300f2ff'/%3E%3C/svg%3E")`,
       backgroundSize: '300px 300px'
     }}>
</div>
      {/* --- 2. NAVIGATION --- */}
      <nav className="fixed top-0 left-0 w-full z-[100] border-b border-blue-900/50 bg-black/80 backdrop-blur-md p-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-blue-400 font-bold hover:text-blue-200 transition-colors">← Back to Hub</Link>
          
          <div className="flex bg-slate-900/80 rounded-full p-1 border border-slate-700">
            <button 
              onClick={() => setMode('chat')}
              className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${mode === 'chat' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              AI CHAT
            </button>
            <button 
              onClick={() => setMode('lab')}
              className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${mode === 'lab' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              LABORATORY
            </button>
          </div>
        </div>
      </nav>

      {/* --- 3. CHAT INTERFACE --- */}
      {mode === 'chat' && (
        <section className="max-w-4xl mx-auto pt-28 px-6 pb-10 relative z-10 animate-in fade-in">
        {/* Added the Glowing shadow to match your Hub's aesthetic */}
        <div className="h-[75vh] border border-blue-500/30 rounded-3xl bg-slate-900/30 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] flex flex-col overflow-hidden">
          
          <div ref={scrollRef} className="flex-1 p-6 space-y-6 overflow-y-auto">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-2xl max-w-[85%] ${
                  m.role === 'user' ? 'bg-blue-600 shadow-lg shadow-blue-900/20' : 'bg-slate-800 border border-slate-700'
                }`}>
                  <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800/50 p-4 rounded-2xl animate-pulse text-xs text-slate-500 italic">
                  Professor is analyzing...
                </div>
              </div>
            )}
          </div>

          {/* INPUT AREA */}
          <div className="p-6 border-t border-blue-900/20 bg-black/40 flex gap-4">
            <input 
              className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-1 ring-blue-500 transition-all" 
              value={input} 
              placeholder="Ask an EEE question..."
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()} 
            />
            <button 
              onClick={sendMessage} 
              className="bg-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-500 transition-all active:scale-95"
            >
              Send
            </button>
          </div>
        </div>
      </section>
      )}

      {/* --- 4. LABORATORY INTERFACE (HTML Structure for script_v2.js) --- */}
      {mode === 'lab' && (
        <section className="max-w-6xl mx-auto pt-28 px-6 pb-10 relative z-10 animate-in fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[80vh]">
            
            {/* SIDEBAR NAVIGATION */}
            <div className="lg:col-span-3 bg-slate-950/80 border border-slate-800 rounded-3xl p-4 overflow-y-auto custom-scrollbar">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 px-2">Experiments</h3>
              <div className="space-y-1">
                {[
                  {id: 'sec11', label: '1.1 Thermal Emission'},
                  {id: 'sec12', label: '1.2 Band Theory'},
                  {id: 'sec13', label: '1.3 Doping'},
                  {id: 'sec21', label: '2.1 PN Junction'},
                  {id: 'sec22', label: '2.2 Rectification'},
                  {id: 'sec23', label: '2.3 Filtering'},
                  {id: 'sec31', label: '3.1 Transistor Base'},
                  {id: 'sec32', label: '3.2 Auto Switch'},
                  {id: 'sec33', label: '3.3 Amplification'},
                  {id: 'sec41', label: '4.1 Op-Amp Follower'},
                  {id: 'sec42', label: '4.2 Op-Amp Gain'},
                  {id: 'sec51', label: '5.1 Logic Gates'},
                  {id: 'sec52', label: '5.2 Logic Application'},
                  {id: 'sec61', label: '6.1 Oscilloscope'},
                  {id: 'sec62', label: '6.2 Circuit Debug'}
                ].sort((a, b) => a.label.localeCompare(b.label)).map((item) => (
                  <button
                    key={item.id}
                    id={`nav${item.id.replace('sec','')}`}
                    onClick={() => window.switchTab?.(item.id)}
                    className="nav-item w-full text-left px-4 py-3 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all border border-transparent focus:border-slate-700"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* MAIN SIMULATION AREA */}
            <div className="lg:col-span-9 bg-black/60 border border-slate-800 rounded-3xl relative overflow-hidden backdrop-blur-xl">
              
              {/* 1.1 THERMAL EMISSION */}
              <div id="sec11" className="page-section active absolute inset-0 p-8 flex flex-col overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-yellow-400">Thermal Emission</h2>
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-bold">ELECTRON VELOCITY</div>
                    <div className="font-mono text-yellow-400" id="vDisplay">0.00e+0</div>
                  </div>
                </div>
                <div className="min-h-[400px] flex-1 bg-slate-900 rounded-2xl border border-slate-800 relative overflow-hidden mb-6">
                  <canvas id="mainCanvas" className="w-full h-full object-contain"></canvas>
                  <div id="malteseCross" className="hidden absolute top-1/2 left-2/3 w-4 h-16 bg-slate-700 transform -translate-y-1/2 rotate-45 border border-slate-500 shadow-xl"></div>
                </div>
                <div className="grid grid-cols-2 gap-8 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-2 block">FILAMENT TEMPERATURE</label>
                    <input type="range" id="tempSlider" min="0" max="100" defaultValue="50" className="w-full accent-yellow-500"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-2 block">ACCELERATING VOLTAGE</label>
                    <input type="range" id="voltSlider" min="0" max="500" defaultValue="200" className="w-full accent-blue-500"/>
                  </div>
                </div>
                <TheoryBox title="Theory: Thermionic Emission">
                  <p>Thermionic emission is the release of electrons from a heated surface (the cathode). The thermal energy gives electrons enough kinetic energy to overcome the material's work function—the energy barrier holding them within the material.</p>
                  <p>In this simulation, the heated filament acts as the cathode. The accelerating voltage creates a strong electric field that pulls the emitted electrons towards the anode, forming an electron beam. The higher the temperature, the more electrons are emitted. The higher the voltage, the faster they accelerate.</p>
                </TheoryBox>
              </div>

              {/* 1.2 BAND THEORY */}
              <div id="sec12" className="page-section absolute inset-0 p-8 flex flex-col opacity-0 pointer-events-none overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-blue-400">Band Theory & Conductivity</h2>
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-bold">ELECTRONS IN CB</div>
                    <div className="font-mono text-blue-400" id="cbCount">0</div>
                  </div>
                </div>
                <div className="min-h-[400px] flex-1 bg-slate-900 rounded-2xl border border-slate-800 mb-6">
                  <canvas id="bandCanvas" className="w-full h-full"></canvas>
                </div>
                <div className="flex gap-4">
                  <select id="matSelect" onChange={() => window.changeMaterial?.()} className="bg-slate-800 text-white p-3 rounded-xl border border-slate-700 text-sm">
                    <option value="metal">Conductor (Metal)</option>
                    <option value="semi">Semiconductor (Si)</option>
                    <option value="insulator">Insulator (Diamond)</option>
                  </select>
                  <div className="flex-1 bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-4">
                    <span className="text-xs font-bold text-red-400">HEAT ENERGY</span>
                    <input type="range" id="heatSlider" min="0" max="100" defaultValue="20" className="flex-1 accent-red-500"/>
                  </div>
                </div>
                <TheoryBox title="Theory: Energy Band Theory">
                  <p>In solids, electron energy levels form bands. The outermost filled band is the valence band (VB), and the one above it is the conduction band (CB).</p>
                  <ul>
                    <li><b>Conductors (Metals):</b> The VB and CB overlap, allowing electrons to move freely and conduct electricity easily.</li>
                    <li><b>Insulators:</b> A large energy gap separates the VB and CB, requiring a lot of energy for an electron to jump, hence poor conductivity.</li>
                    <li><b>Semiconductors:</b> A small energy gap exists. At 0K they are insulators, but thermal energy can excite electrons to the CB, allowing for controlled conductivity.</li>
                  </ul>
                </TheoryBox>
              </div>

              {/* 1.3 DOPING */}
              <div id="sec13" className="page-section absolute inset-0 p-8 flex flex-col opacity-0 pointer-events-none overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-emerald-400">Semiconductor Doping</h2>
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-bold">CARRIER TYPE</div>
                    <div className="font-mono text-emerald-400" id="carrierType">Intrinsic</div>
                  </div>
                </div>
                <div className="min-h-[400px] flex-1 bg-slate-900 rounded-2xl border border-slate-800 mb-6 relative overflow-hidden">
                  <canvas id="dopeCanvas" className="w-full h-full"></canvas>
                </div>
                <div className="flex gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                  <label className="text-xs font-bold text-slate-300 self-center">DOPANT:</label>
                  <select id="dopeSelect" onChange={() => window.changeDope?.()} className="bg-slate-800 text-white p-2 rounded-lg border border-slate-700 text-sm flex-1">
                    <option value="n">Phosphorus (N-Type / Donor)</option>
                    <option value="p">Boron (P-Type / Acceptor)</option>
                  </select>
                </div>
                <TheoryBox title="Theory: Semiconductor Doping">
                  <p>Doping is the process of intentionally introducing impurities into an intrinsic (pure) semiconductor to change its electrical properties.</p>
                  <ul>
                    <li><b>N-type:</b> Doping with a pentavalent atom (like Phosphorus) adds extra "donor" electrons, making electrons the majority charge carriers.</li>
                    <li><b>P-type:</b> Doping with a trivalent atom (like Boron) creates "holes" (absence of an electron) that act as positive charge carriers. These are "acceptor" atoms, and holes become the majority carriers.</li>
                  </ul>
                </TheoryBox>
              </div>

              {/* 2.1 PN JUNCTION */}
              <div id="sec21" className="page-section absolute inset-0 p-8 flex flex-col opacity-0 pointer-events-none overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-blue-400">PN Junction & Diode</h2>
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-bold">BIAS VOLTAGE</div>
                    <div className="font-mono text-blue-400" id="voltVal">0.00V</div>
                  </div>
                </div>
                
                {/* Top: Physical Junction View */}
                <div className="min-h-[300px] flex-1 bg-slate-900 rounded-2xl border border-slate-800 mb-4 relative overflow-hidden">
                  <canvas id="junctionCanvas" className="w-full h-full"></canvas>
                  <div id="junctionState" className="absolute top-4 left-4 text-xs font-bold bg-black/50 px-3 py-1 rounded-full border border-slate-700 text-slate-400">
                    Initializing...
                  </div>
                </div>

                {/* Bottom: IV Curve & Controls */}
                <div className="grid grid-cols-12 gap-6 min-h-[300px] h-1/2">
                  <div className="col-span-8 bg-slate-900 rounded-2xl border border-slate-800 relative">
                    <canvas id="ivCurveCanvas" className="w-full h-full"></canvas>
                  </div>
                  <div className="col-span-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col justify-center">
                    <label className="text-xs font-bold text-slate-300 mb-4 block">APPLIED BIAS (V)</label>
                    <input type="range" id="biasSlider" min="-100" max="100" defaultValue="0" className="w-full accent-blue-500 mb-2"/>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>-2.0V</span>
                      <span>+2.0V</span>
                    </div>
                  </div>
                </div>
                <TheoryBox title="Theory: The PN Junction Diode">
                  <p>A PN junction is formed by joining P-type and N-type semiconductor materials. At the interface, free carriers diffuse across—electrons from N to P, and holes from P to N—creating a "depletion region" devoid of mobile carriers. This region establishes a potential barrier.</p>
                  <p>Applying a voltage (biasing) changes the barrier. <b>Forward bias</b> reduces the barrier, allowing current to flow easily. <b>Reverse bias</b> increases the barrier, blocking current flow. This one-way conduction is the fundamental property of a diode.</p>
                </TheoryBox>
              </div>

              {/* 2.2 RECTIFICATION */}
              <div id="sec22" className="page-section absolute inset-0 p-8 flex flex-col opacity-0 pointer-events-none overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-blue-400">Waveform Rectification</h2>
                  <div id="rectStatus" className="text-lg font-black text-slate-500">AC INPUT</div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="lg:col-span-2 min-h-[400px] bg-slate-900 rounded-2xl border border-slate-800 relative">
                    <canvas id="rectCanvas" width="400" height="250" className="w-full h-full object-contain"></canvas>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                      <label className="text-xs font-bold text-slate-300 mb-2 block">CONFIGURATION</label>
                      <select id="rectMode" onChange={(e) => {
                        setRectMode(e.target.value);
                        window.resetRectTime?.();
                      }} className="w-full bg-slate-800 text-white p-3 rounded-lg border border-slate-700 text-sm font-bold">
                        <option value="ac">AC Input</option>
                        <option value="half">Half-Wave Rectifier</option>
                        <option value="full">Full-Wave Rectifier</option>
                      </select>
                    </div>

                    {/* Signal Analysis Card */}
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                      <h4 className="text-blue-400 font-bold text-sm mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                        Signal Analysis
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Efficiency (Max):</span>
                          <span className="text-white font-mono">{rectMode === 'full' ? '81.2%' : rectMode === 'half' ? '40.6%' : '0%'}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Ripple Factor:</span>
                          <span className="text-white font-mono">{rectMode === 'full' ? '0.48' : rectMode === 'half' ? '1.21' : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Output Freq:</span>
                          <span className="text-white font-mono">{rectMode === 'full' ? '120 Hz' : '60 Hz'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Circuit Diagram Visual */}
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-center h-32">
                      {rectMode === 'ac' && <div className="text-slate-500 text-xs font-bold">Direct Connection</div>}
                      {rectMode === 'half' && <div className="w-8 h-8 border-b-4 border-r-4 border-blue-500 transform rotate-45"></div>}
                      {rectMode === 'full' && <div className="w-12 h-12 border-4 border-blue-500 transform rotate-45 grid place-items-center"><div className="w-2 h-2 bg-blue-400 rounded-full"></div></div>}
                      <span className="ml-4 text-xs font-bold text-slate-400">{rectMode === 'half' ? '1 Diode' : rectMode === 'full' ? '4 Diodes (Bridge)' : 'No Diodes'}</span>
                    </div>
                  </div>
                </div>
                <TheoryBox title="Theory: Rectification">
                  <p>Rectification is the process of converting alternating current (AC), which periodically reverses direction, into direct current (DC), which flows in only one direction. It's a critical step in creating DC power supplies.</p>
                  <ul>
                    <li><b>Half-Wave Rectification:</b> A single diode blocks one half of the AC cycle, resulting in a pulsating DC output with significant gaps.</li>
                    <li><b>Full-Wave Rectification:</b> Using a bridge of four diodes, this method inverts the negative half of the AC cycle, producing a more continuous (but still pulsating) DC output.</li>
                  </ul>
                </TheoryBox>
              </div>

              {/* 2.3 FILTERING */}
              <div id="sec23" className="page-section absolute inset-0 p-8 flex flex-col opacity-0 pointer-events-none overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-yellow-400">Capacitor Smoothing</h2>
                  <div id="filterStatus" className="text-lg font-black text-slate-500">MEDIUM RIPPLE</div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="lg:col-span-2 min-h-[400px] bg-slate-900 rounded-2xl border border-slate-800 relative">
                    <canvas id="filterCanvas" width="400" height="250" className="w-full h-full object-contain"></canvas>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                      <label className="text-xs font-bold text-slate-300 mb-2 block">FILTER CAPACITANCE (C)</label>
                      <input type="range" id="filterCap" min="1" max="100" defaultValue="50" className="w-full accent-yellow-500"/>
                    </div>

                    {/* Load Effect Mini-Sim */}
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                      <h4 className="text-yellow-400 font-bold text-sm mb-3">Load Effect Simulator</h4>
                      <div className="h-24 bg-black/40 rounded-lg mb-3 relative overflow-hidden border border-slate-700">
                        {/* Simple SVG Graph of Decay */}
                        <svg className="w-full h-full" preserveAspectRatio="none">
                          <path d={`M0,10 Q${loadRes * 2},10 ${loadRes * 4},90`} fill="none" stroke="#fbbf24" strokeWidth="2" />
                          <line x1="0" y1="90" x2="100%" y2="90" stroke="#334155" strokeDasharray="4" />
                        </svg>
                        <div className="absolute bottom-1 right-2 text-[10px] text-slate-500">Discharge Slope</div>
                      </div>
                      
                      <label className="text-[10px] font-bold text-slate-400 mb-1 block flex justify-between">
                        <span>LOAD RESISTANCE (R)</span>
                        <span className="text-white">{loadRes} kΩ</span>
                      </label>
                      <input 
                        type="range" 
                        min="1" max="50" 
                        value={loadRes}
                        onChange={(e) => setLoadRes(parseInt(e.target.value))}
                        className="w-full accent-slate-400 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-400 mt-2 leading-tight">
                        Higher resistance = Slower discharge = Less Ripple. <br/>
                        <span className="font-mono text-yellow-500">τ = R × C</span>
                      </p>
                    </div>
                  </div>
                </div>
                <TheoryBox title="Theory: Capacitor Smoothing (Filtering)">
                  <p>After rectification, the DC output is still pulsating and not suitable for most electronics. A smoothing capacitor is placed in parallel with the load to filter this waveform.</p>
                  <p>The capacitor charges up during the rising edge of the rectified pulses and then slowly discharges into the load as the input voltage falls. This action "fills in the gaps," significantly reducing the voltage variation (ripple) and creating a much smoother DC voltage. A larger capacitance provides a longer discharge time, resulting in less ripple.</p>
                </TheoryBox>
              </div>

              {/* 3.1 TRANSISTOR BASE */}
              <div id="sec31" className="page-section absolute inset-0 p-8 flex flex-col opacity-0 pointer-events-none overflow-y-auto custom-scrollbar">
                <h2 className="text-2xl font-black text-emerald-400 mb-6">Transistor Fundamentals</h2>
                <div className="min-h-[400px] flex-1 bg-slate-900 rounded-2xl border border-slate-800 mb-6">
                  <canvas id="transistorCanvas" width="400" height="300"></canvas>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select id="transType" onChange={() => window.resetTrans31?.()} className="bg-slate-800 text-white p-3 rounded-xl border border-slate-700 font-bold">
                    <option value="npn">NPN</option>
                    <option value="pnp">PNP</option>
                  </select>
                  <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                    <label className="text-[10px] text-slate-400 font-bold">BASE CURRENT (Ib)</label>
                    <input type="range" id="baseSlider" min="0" max="100" defaultValue="20" className="w-full accent-emerald-500"/>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-xs font-mono text-slate-300">
                  <span>Base Current: <span id="ibVal" className="text-white">--</span></span>
                  <span>Collector Current: <span id="icVal" className="text-white">--</span></span>
                </div>
                <TheoryBox title="Theory: Bipolar Junction Transistor (BJT)">
                  <p>A Bipolar Junction Transistor (BJT) has three regions: Emitter, Base, and Collector. It acts as a current-controlled device where a small current flowing into the base (Ib) controls a much larger current flowing from the collector to the emitter (Ic).</p>
                  <p>The base region is very thin and lightly doped. For an NPN transistor to conduct, the base-emitter junction must be forward-biased (around 0.7V). This small base current allows a large collector current to flow. For a PNP transistor, the polarities are reversed.</p>
                </TheoryBox>
              </div>

              {/* 3.3 AMPLIFICATION */}
              <div id="sec33" className="page-section absolute inset-0 p-8 flex flex-col opacity-0 pointer-events-none overflow-y-auto custom-scrollbar">
                <h2 className="text-2xl font-black text-blue-400 mb-6">Current Amplification (β)</h2>
                <div className="min-h-[400px] flex-1 grid grid-cols-2 gap-8">
                  <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-300 mb-2 block">BASE CURRENT (Ib): <span id="ibDisp" className="font-mono text-blue-400">50</span> µA</label>
                      <input type="range" id="ibSlider" min="0" max="100" defaultValue="50" className="w-full accent-blue-500"/>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-300 mb-2 block">CURRENT GAIN (β): <span id="betaDisp" className="font-mono text-emerald-400">100</span></label>
                      <input type="range" id="betaSlider" min="10" max="300" defaultValue="100" className="w-full accent-emerald-500"/>
                    </div>
                  </div>
                  <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-end items-center relative">
                    <div id="amplifierVisual" className="w-2/3 rounded-t-lg bg-blue-500 transition-all duration-300" style={{height: '20px'}}></div>
                    <div id="regionStatus" className="absolute top-4 text-xs font-bold p-2 rounded-lg">ACTIVE REGION</div>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 text-center font-mono text-slate-300">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">Collector (Ic): <span id="icVal" className="block text-xl font-bold text-white">5.00 mA</span></div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">Emitter (Ie): <span id="ieVal" className="block text-xl font-bold text-white">5.05 mA</span></div>
                </div>
                <TheoryBox title="Theory: Transistor Amplification">
                  <p>Amplification is a primary function of a transistor. When operating in its "active region" (between fully off/cutoff and fully on/saturation), the collector current (Ic) is directly proportional to the base current (Ib).</p>
                  <p>This relationship is defined by the DC current gain, Beta (β), where <b>Ic = β * Ib</b>. A tiny change in the small base current results in a large, proportional change in the collector current, thus amplifying the signal. The emitter current (Ie) is the sum of the base and collector currents: <b>Ie = Ib + Ic</b>.</p>
                </TheoryBox>
              </div>

              {/* 4.1 OP-AMP FOLLOWER */}
              <div id="sec41" className="page-section absolute inset-0 p-8 flex flex-col opacity-0 pointer-events-none overflow-y-auto custom-scrollbar">
                <h2 className="text-2xl font-black text-purple-400 mb-6">Op-Amp Voltage Follower</h2>
                <div className="min-h-[400px] flex-1 bg-slate-900 rounded-2xl border border-slate-800 mb-6 flex items-center justify-center">
                  <canvas id="opampCanvas" width="400" height="300"></canvas>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                  <label className="text-xs font-bold text-slate-300 mb-2 block">INPUT VOLTAGE (Vin): <span id="vinDisp" className="font-mono text-purple-400">0.0</span> V</label>
                  <input type="range" id="opampVinSlider" min="-10" max="10" defaultValue="0" className="w-full accent-purple-500"/>
                </div>
                <div className="mt-4 text-center font-mono text-slate-300 bg-black/50 p-4 rounded-xl border border-slate-800">
                  OUTPUT VOLTAGE (Vout): <span id="voutVal" className="text-2xl font-bold text-white">0.00 V</span>
                </div>
                <TheoryBox title="Theory: Voltage Follower (Buffer)">
                  <p>A Voltage Follower is an operational amplifier (op-amp) circuit where the output is connected directly back to the inverting (-) input. The input signal is applied to the non-inverting (+) input. This configuration provides a voltage gain of exactly 1, meaning <b>Vout = Vin</b>.</p>
                  <p>Its purpose is not to amplify voltage, but to serve as a buffer. It has a very high input impedance (draws almost no current from the source) and a very low output impedance (can supply current to a load without its voltage dropping), effectively isolating the source from the load.</p>
                </TheoryBox>
              </div>

              {/* 4.2 OP-AMP GAIN */}
              <div id="sec42" className="page-section absolute inset-0 p-8 flex flex-col opacity-0 pointer-events-none overflow-y-auto custom-scrollbar">
                <h2 className="text-2xl font-black text-purple-400 mb-6">Op-Amp Gain Configurations</h2>
                <div className="min-h-[400px] flex-1 bg-slate-900 rounded-2xl border border-slate-800 mb-6">
                  <canvas id="canvas42" width="400" height="400"></canvas>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select id="opampMode" onChange={() => window.update42Lab?.()} className="col-span-2 bg-slate-800 text-white p-3 rounded-xl border border-slate-700 font-bold">
                    <option value="inverting">Inverting Amplifier</option>
                    <option value="noninverting">Non-Inverting Amplifier</option>
                    <option value="comparator">Comparator</option>
                  </select>
                  <div id="resistorControls" className="col-span-2 grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400">Rf: <span id="rfDisp">10</span> kΩ</label>
                      <input type="range" id="rfSlider" min="1" max="100" defaultValue="10" className="w-full accent-purple-400"/>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400">Rin: <span id="rinDisp">10</span> kΩ</label>
                      <input type="range" id="rinSlider" min="1" max="100" defaultValue="10" className="w-full accent-purple-400"/>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400">Vin (Amplitude): <span id="vin42Disp">1.0</span> V</label>
                    <input type="range" id="vin42Slider" min="0.1" max="5" step="0.1" defaultValue="1" className="w-full accent-yellow-400"/>
                  </div>
                  <div className="font-mono text-center bg-black/50 p-2 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400">Gain: <span id="gainVal">1.0x</span></div>
                    <div className="text-xs">Vout: <span id="vout42Val">1.0 V</span></div>
                  </div>
                </div>
                <TheoryBox title="Theory: Op-Amp Gain Configurations">
                  <p>By using external resistors in a feedback network, we can precisely control the voltage gain of an op-amp.</p>
                  <ul>
                    <li><b>Inverting Amplifier:</b> The input signal goes to the inverting (-) terminal. The output is 180° out of phase. Gain = <b>-Rf / Rin</b>.</li>
                    <li><b>Non-Inverting Amplifier:</b> The input signal goes to the non-inverting (+) terminal. The output is in phase. Gain = <b>1 + (Rf / Rin)</b>.</li>
                    <li><b>Comparator:</b> With no feedback (open-loop), the op-amp compares Vin to a reference voltage. The output swings to its maximum positive or negative supply voltage depending on which input is higher.</li>
                  </ul>
                </TheoryBox>
              </div>

              {/* 5.2 LOGIC APPLICATION */}
              <div id="sec52" className="page-section absolute inset-0 p-8 flex flex-col opacity-0 pointer-events-none overflow-y-auto custom-scrollbar">
                <h2 className="text-2xl font-black text-purple-400 mb-6">Logic Gate Applications</h2>
                <div className="min-h-[300px] flex-1 bg-slate-900 rounded-2xl border border-slate-800 mb-6 flex items-center justify-center">
                  <canvas id="canvas52" width="400" height="200"></canvas>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select id="scenarioSelect" onChange={() => window.initScenario?.()} className="col-span-2 bg-slate-800 text-white p-3 rounded-xl border border-slate-700 font-bold">
                    <option value="fire">Fire Alarm (AND)</option>
                    <option value="vault">Vault Lock (AND-NOT)</option>
                    <option value="cutter">Emergency Stop (OR)</option>
                  </select>
                  <button id="alarmA" onClick={() => window.toggleAlarmInput?.('A')} className="logic-btn bg-slate-800 border border-slate-600 text-slate-300 rounded-xl font-bold hover:bg-slate-700">Sensor A</button>
                  <button id="alarmB" onClick={() => window.toggleAlarmInput?.('B')} className="logic-btn bg-slate-800 border border-slate-600 text-slate-300 rounded-xl font-bold hover:bg-slate-700">Sensor B</button>
                </div>
                <div id="logicExpression" className="text-center font-mono text-xs text-slate-500 mt-2">Expression: Y = A · B</div>
                <div className="mt-4 p-4 rounded-xl border border-slate-700 bg-black/50 flex items-center justify-between">
                  <span id="alarmStatusText" className="font-bold text-lg text-slate-400">SYSTEM STANDBY</span>
                  <div id="alarmLight" className="w-8 h-8 rounded-full bg-slate-900 border-2 border-black transition-all"></div>
                </div>
                <TheoryBox title="Theory: Logic Gate Applications">
                  <p>By combining logic gates, complex decision-making circuits can be created to solve real-world problems.</p>
                  <p>For example, an <b>AND</b> gate is perfect for a safety system where a machine only operates if a safety guard is in place AND the start button is pressed. An <b>OR</b> gate can trigger an alarm if a smoke detector OR a heat detector is activated. These simple building blocks are the foundation of all digital computers and controllers.</p>
                </TheoryBox>
              </div>

              {/* 6.1 OSCILLOSCOPE */}
              <div id="sec61" className="page-section absolute inset-0 p-8 flex flex-col opacity-0 pointer-events-none overflow-y-auto custom-scrollbar">
                <h2 className="text-2xl font-black text-emerald-400 mb-6">CRO Display</h2>
                <div className="min-h-[400px] flex-1 bg-black rounded-2xl border-2 border-emerald-900 mb-6 flex items-center justify-center">
                  <canvas id="canvas61" width="400" height="300"></canvas>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400">Volts/Div: <span id="vDivVal">2</span>V</label>
                    <input type="range" id="vDiv61" min="0.5" max="5" step="0.5" defaultValue="2" className="w-full accent-emerald-400"/>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400">Time/Div: <span id="tDivVal">5</span>ms</label>
                    <input type="range" id="tDiv61" min="1" max="20" defaultValue="5" className="w-full accent-emerald-400"/>
                  </div>
                </div>
                <TheoryBox title="Theory: The Oscilloscope">
                  <p>An oscilloscope (or CRO) is a crucial piece of test equipment that displays a voltage signal as a function of time. The vertical (Y) axis represents voltage, and the horizontal (X) axis represents time.</p>
                  <p>The <b>Volts/Div</b> control scales the waveform's amplitude on the screen, while the <b>Time/Div</b> control adjusts the time period displayed across the horizontal axis. By using these controls and the on-screen grid (graticule), an engineer can measure key properties of a waveform like its amplitude (peak voltage), frequency, and period.</p>
                </TheoryBox>
              </div>

              {/* 3.2 AUTO SWITCH */}
              <div id="sec32" className="page-section absolute inset-0 p-8 flex flex-col opacity-0 pointer-events-none overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-emerald-400">Transistor Automatic Switch</h2>
                  <div id="switchStatusText" className="text-xl font-black text-slate-500">SYSTEM IDLE</div>
                </div>
                <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 mb-6 relative">
                  <canvas id="switchCanvas" className="w-full h-full"></canvas>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <select id="sensorMode" onChange={() => window.initSwitchLab?.()} className="bg-slate-800 text-white p-3 rounded-xl border border-slate-700 text-sm font-bold">
                    <option value="light">Light Sensor (LDR)</option>
                    <option value="heat">Heat Sensor (Thermistor)</option>
                  </select>
                  <div className="col-span-2 bg-slate-900/50 p-3 rounded-xl border border-slate-800 flex flex-col justify-center">
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                      <span id="lowLabel">LOW</span>
                      <span id="inputLabel">INPUT LEVEL</span>
                      <span id="highLabel">HIGH</span>
                    </div>
                    <input type="range" id="switchSlider" min="0" max="100" defaultValue="50" className="w-full accent-emerald-500"/>
                  </div>
                </div>
                <div className="mt-4 flex justify-between text-xs font-mono text-slate-300">
                  <span>Sensor R: <span id="rSensVal" className="text-white">--</span></span>
                  <span>Base V: <span id="vbVal" className="text-white">--</span></span>
                </div>
                <TheoryBox title="Theory: The Transistor as a Switch">
                  <p>Transistors are excellent electronic switches. In the "cutoff" state (no base current), they are 'off' and block current flow. In the "saturation" state (sufficient base current), they are 'on' and allow current to flow freely with minimal voltage drop.</p>
                  <p>This property can be used to create automatic circuits. A sensor like an LDR (Light Dependent Resistor) or a thermistor can be used in a voltage divider to control the base voltage. When the environmental condition (light/heat) changes, the sensor's resistance changes, altering the base voltage and automatically switching the transistor—and any connected load like an LED or motor—on or off.</p>
                </TheoryBox>
              </div>

              {/* 5.1 LOGIC GATES */}
              <div id="sec51" className="page-section absolute inset-0 p-8 flex flex-col opacity-0 pointer-events-none overflow-y-auto custom-scrollbar">
                <h2 className="text-2xl font-black text-purple-400 mb-6">Logic Gate Simulator</h2>
                <div className="min-h-[300px] flex-1 bg-slate-900 rounded-2xl border border-slate-800 mb-6 flex items-center justify-center">
                  <canvas id="canvas51" width="400" height="250"></canvas>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <select id="gateType" onChange={() => window.update51Lab?.()} className="col-span-1 bg-slate-800 text-white p-3 rounded-xl border border-slate-700 font-bold">
                    <option value="AND">AND Gate</option>
                    <option value="OR">OR Gate</option>
                    <option value="NOT">NOT Gate</option>
                    <option value="NAND">NAND Gate</option>
                    <option value="XOR">XOR Gate</option>
                  </select>
                  <button id="btnInA" onClick={() => window.toggleInput51?.('A')} className="bg-slate-800 border border-slate-600 text-slate-300 rounded-xl font-bold hover:bg-slate-700">Input A: 0</button>
                  <button id="btnInB" onClick={() => window.toggleInput51?.('B')} className="bg-slate-800 border border-slate-600 text-slate-300 rounded-xl font-bold hover:bg-slate-700">Input B: 0</button>
                  <div className="bg-black border border-slate-700 rounded-xl flex items-center justify-center">
                    <span className="text-xs text-slate-400 mr-2 font-bold">OUTPUT:</span>
                    <span id="logicOut" className="text-2xl font-black text-white">0</span>
                  </div>
                </div>
                <TheoryBox title="Theory: Digital Logic Gates">
                  <p>Logic gates are the fundamental building blocks of digital circuits. They perform a basic logical operation on one or more binary inputs (0 or 1) to produce a single binary output.</p>
                  <ul>
                    <li><b>AND:</b> Output is 1 only if ALL inputs are 1.</li>
                    <li><b>OR:</b> Output is 1 if AT LEAST ONE input is 1.</li>
                    <li><b>NOT:</b> Inverts the input (0 becomes 1, 1 becomes 0).</li>
                    <li><b>NAND:</b> The opposite of AND. Output is 0 only if ALL inputs are 1.</li>
                    <li><b>XOR (Exclusive OR):</b> Output is 1 if inputs are DIFFERENT.</li>
                  </ul>
                </TheoryBox>
              </div>

              {/* 6.2 CIRCUIT DEBUG */}
              <div id="sec62" className="page-section absolute inset-0 p-8 flex flex-col opacity-0 pointer-events-none overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-red-400">Circuit Debugging Challenge</h2>
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-bold">STATUS</div>
                    <div className="font-mono text-red-400">LIVE</div>
                  </div>
                </div>
                <div className="min-h-[400px] flex-1 bg-slate-900 rounded-2xl border border-slate-800 mb-6 relative">
                  <canvas id="canvas62" className="w-full h-full"></canvas>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <label className="text-xs font-bold text-slate-300 mb-2 block">FAULT SCENARIO</label>
                    <select id="debugScenario" onChange={(e) => {
                      setDebugFault(e.target.value);
                      window.initDebugLab?.();
                    }} className="w-full bg-slate-800 text-white p-3 rounded-lg border border-slate-700 text-sm font-bold">
                      <option value="normal">Normal Operation</option>
                      <option value="fault1">Fault 1: R2 Open</option>
                      <option value="fault2">Fault 2: C1 Short</option>
                      <option value="fault3">Fault 3: Q1 Failure</option>
                    </select>
                  </div>
                  <div className="bg-black border-2 border-slate-700 rounded-xl p-4 flex flex-col justify-center items-center relative">
                    <span className="absolute top-2 left-3 text-[10px] font-bold text-slate-500">MULTIMETER READING</span>
                    <span id="meterDisplay" className="font-mono text-3xl text-red-500 font-bold">0.00 V</span>
                    <div className="flex gap-2 mt-2 items-center">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                      <span className="text-[10px] text-slate-400">PROBE ACTIVE</span>
                    </div>
                  </div>
                </div>
                
                {/* Component Function Cards */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors">
                    <h4 className="text-blue-400 font-bold text-sm mb-2">VCC: Power Supply</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">The main 9V DC power source. It provides the energy required for the transistor to operate and amplify signals.</p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors">
                    <h4 className="text-blue-400 font-bold text-sm mb-2">R1 & R2: Voltage Divider</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">Establishes a stable DC bias voltage at the Base, ensuring the transistor stays in the active region to amplify signals without clipping.</p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:border-yellow-500 transition-colors">
                    <h4 className="text-yellow-400 font-bold text-sm mb-2">C1: Coupling Capacitor</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">Blocks DC voltage from the input source while allowing the AC audio/signal to pass through to the Base. This protects the bias point.</p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:border-emerald-500 transition-colors">
                    <h4 className="text-emerald-400 font-bold text-sm mb-2">Q1: NPN Transistor</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">The active component. It acts as a valve, using the small Base current to control the larger Collector-Emitter current, creating amplification.</p>
                  </div>
                </div>

                {/* Fault Diagnosis Display */}
                {debugFault !== 'normal' && (
                  <div className="mt-4 bg-red-900/20 border border-red-900/50 p-4 rounded-xl animate-in fade-in">
                    <h4 className="text-red-400 font-bold text-sm mb-1 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      DIAGNOSTIC REPORT
                    </h4>
                    <p className="text-sm text-red-200">
                      {debugFault === 'fault1' && "R2 is Open (Broken Connection). The emitter path to ground is severed, causing the circuit voltages to float towards VCC."}
                      {debugFault === 'fault2' && "C1 is Shorted. The capacitor has failed and is acting like a wire, shorting the collector signal directly to ground."}
                      {debugFault === 'fault3' && "Q1 Transistor Failure. The internal Base-Emitter junction has shorted, preventing the transistor from biasing correctly."}
                    </p>
                  </div>
                )}

                <TheoryBox title="Theory: Circuit Debugging">
                  <p>Circuit debugging is the systematic process of finding and resolving faults in a circuit. It involves using test equipment like multimeters and oscilloscopes to measure voltages, currents, and waveforms at various points.</p>
                  <p>By comparing these measurements to expected values from circuit diagrams and theory, an engineer can isolate the faulty component or connection. Common faults include open circuits (broken connections), short circuits, and failed components.</p>
                </TheoryBox>
              </div>

            </div>
          </div>
          
          {/* Load the Simulation Script */}
          <Script 
            src="/static/script_v2.js" 
            strategy="afterInteractive"
            onLoad={() => {
              console.log("Lab Script Loaded");
              // Force init if needed
              if (window.initAllLabs) window.initAllLabs();
            }}
          />
          <style dangerouslySetInnerHTML={{ __html: `
            .page-section { transition: opacity 0.3s ease; display: none !important; }
            .page-section.active { display: flex !important; opacity: 1; pointer-events: auto; }
            .nav-item.active { background-color: #3b82f6; color: white; border-color: #60a5fa; box-shadow: 0 0 15px rgba(59,130,246,0.5); }
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }

            /* Animation Polyfills */
            .animate-in { animation-duration: 0.5s; animation-timing-function: ease-out; animation-fill-mode: both; }
            .fade-in { animation-name: fadeIn; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          `}} />
        </section>
      )}

    </main>
  );
}