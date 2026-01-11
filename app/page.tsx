'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const MagTheory = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="mt-8 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
      <span className="text-xl">📚</span>
      <span>{title}</span>
    </h3>
    <div className="text-sm text-slate-300 leading-relaxed space-y-2">
      {children}
    </div>
  </div>
);

export default function YeeetHub() {
  const [view, setView] = useState('home');

  // --- SIMPLE SIMULATION STATE (KVL / Energy Conservation) ---
  const [kvlV, setKvlV] = useState(12);
  const [kvlR1, setKvlR1] = useState(10);
  const [kvlR2, setKvlR2] = useState(20);

  // --- KCL SIMULATION STATE ---
  const [kclR_in, setKclR_in] = useState(10);
  const [kclR_out1, setKclR_out1] = useState(20);
  const [kclR_out2, setKclR_out2] = useState(30);

  // --- ELECTRONICS & SAFETY FUSE SIMULATION STATE ---
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [simActive, setSimActive] = useState(false);
  const [fuseInstalled, setFuseInstalled] = useState(false);
  const [fuseRating, setFuseRating] = useState(10);
  const [supplyVoltage, setSupplyVoltage] = useState(230);

  // --- SATELLITE MISSION STATE ---
  const [satShowManual, setSatShowManual] = useState(false);
  const [satMissionActive, setSatMissionActive] = useState(true);
  const [satTimeLeft, setSatTimeLeft] = useState(600);
  const [satDistance, setSatDistance] = useState(0);
  const [satBattery, setSatBattery] = useState(100);
  const [satTemp, setSatTemp] = useState(20);
  const [satIsEclipse, setSatIsEclipse] = useState(false);
  const [satTmrActive, setSatTmrActive] = useState(false);
  const [satThrusterActive, setSatThrusterActive] = useState(false);
  const [satCommsActive, setSatCommsActive] = useState(true);
  const [satRadiatorActive, setSatRadiatorActive] = useState(false);
  const [satHeaterActive, setSatHeaterActive] = useState(false);
  const [satSolarPanelActive, setSatSolarPanelActive] = useState(false);
  const [satSolarFlare, setSatSolarFlare] = useState(false);
  const [satRadiationStorm, setSatRadiationStorm] = useState(false);
  const [satStationKeeping, setSatStationKeeping] = useState(false);
  const [satDebrisEvent, setSatDebrisEvent] = useState(false);
  const [satEvasiveActive, setSatEvasiveActive] = useState(false);
  const [satAltitude, setSatAltitude] = useState(140);
  const [satScore, setSatScore] = useState(0);
  const [satMissedSignals, setSatMissedSignals] = useState(0);
  const [satMiniSats, setSatMiniSats] = useState<{distance: number, altitude: number, id: number, speed: number, createdAt: number}[]>([]);
  const [satSpaceHazards, setSatSpaceHazards] = useState<{distance: number, altitude: number, type: 'comet' | 'meteor', id: number, spawnTime: number, active: boolean, speed: number}[]>([]);
  const [satIncomingSignal, setSatIncomingSignal] = useState<{x: number, y: number, createdAt: number, timeoutDuration: number} | null>(null);
  const [satOutgoingSignal, setSatOutgoingSignal] = useState<{active: boolean, startX: number, startY: number} | null>(null);
  const [satStatusMsg, setSatStatusMsg] = useState("SYSTEMS NOMINAL - ORBIT STABLE");
  const [satFailureReason, setSatFailureReason] = useState<string | null>(null);
  const [satMissionSuccess, setSatMissionSuccess] = useState(false);
  const [satMissionLevel, setSatMissionLevel] = useState(1);
  const SAT_TARGET_DISTANCE = satMissionLevel === 1 ? 5000 : satMissionLevel === 2 ? 10000 : 20000;
  const [satBriefingActive, setSatBriefingActive] = useState(false);

  // --- ELECTROMAGNETISM STATE ---
  const [magSubView, setMagSubView] = useState('menu'); // menu, transformer, lefthand
  
  // Transformer State
  const [transVp, setTransVp] = useState('');
  const [transVs, setTransVs] = useState('');
  const [transNp, setTransNp] = useState('');
  const [transNs, setTransNs] = useState('');
  const [transResult, setTransResult] = useState('');
  const [transType, setTransType] = useState('Transformer');

  // Left Hand Rule State
  const [lhrB, setLhrB] = useState<'N-S' | 'S-N'>('N-S'); // Field Direction
  const [lhrI, setLhrI] = useState<'in' | 'out'>('in');   // Current Direction
  const [handRuleMode, setHandRuleMode] = useState<'left' | 'right'>('left'); // Mode Toggle
  const [lhrMotion, setLhrMotion] = useState<'up' | 'down'>('up'); // Motion Input for RHR
  const [rhgI, setRhgI] = useState<'up' | 'down'>('up'); // Right Hand Grip Rule State
  // Faraday's Law State
  const [faradayPos, setFaradayPos] = useState(0); // 0 = Outside, 100 = Inside
  const [faradayMove, setFaradayMove] = useState<'in' | 'out' | 'idle'>('idle');
  const [faradayPole, setFaradayPole] = useState<'N' | 'S'>('N'); // Pole facing coil

  // --- REF FOR SIMULATION LOOP (Prevents interval reset on state change) ---
  const simStateRef = useRef({
    satCommsActive, satThrusterActive, satTmrActive, satRadiatorActive, 
    satHeaterActive, satStationKeeping, satEvasiveActive, satIsEclipse,
    satBattery, satSolarFlare, satRadiationStorm, satDebrisEvent, satDistance, 
    satTimeLeft, satTemp, satMiniSats, satSpaceHazards, satMissionLevel, satSolarPanelActive,
    satIncomingSignal, satAltitude
  });

  useEffect(() => {
    simStateRef.current = {
      satCommsActive, satThrusterActive, satTmrActive, satRadiatorActive, 
      satHeaterActive, satStationKeeping, satEvasiveActive, satIsEclipse,
      satBattery, satSolarFlare, satRadiationStorm, satDebrisEvent, satDistance, 
      satTimeLeft, satTemp, satMiniSats, satSpaceHazards, satMissionLevel, satSolarPanelActive,
      satIncomingSignal, satAltitude
    };
  });

  const calculateTransformer = () => {
    const Vp = parseFloat(transVp);
    const Vs = parseFloat(transVs);
    const Np = parseFloat(transNp);
    const Ns = parseFloat(transNs);
    
    // Count empty fields
    const inputs = [transVp, transVs, transNp, transNs];
    const emptyCount = inputs.filter(i => i === '').length;

    if (emptyCount !== 1) {
      setTransResult("⚠️ Leave exactly ONE value empty to calculate it.");
      return;
    }

    let calcNp = Np, calcNs = Ns;

    if (transVs === '') {
      setTransResult(`Secondary Voltage, Vs = ${(Vp * Ns / Np).toFixed(2)} V`);
      setTransVs((Vp * Ns / Np).toFixed(2));
    } else if (transVp === '') {
      setTransResult(`Primary Voltage, Vp = ${(Vs * Np / Ns).toFixed(2)} V`);
      setTransVp((Vs * Np / Ns).toFixed(2));
    } else if (transNs === '') {
      calcNs = (Vs * Np / Vp);
      setTransResult(`Secondary Turns, Ns = ${calcNs.toFixed(2)}`);
      setTransNs(calcNs.toFixed(2));
    } else if (transNp === '') {
      calcNp = (Vp * Ns / Vs);
      setTransResult(`Primary Turns, Np = ${calcNp.toFixed(2)}`);
      setTransNp(calcNp.toFixed(2));
    }

    if (calcNp > calcNs) setTransType("Step-down Transformer");
    else if (calcNs > calcNp) setTransType("Step-up Transformer");
    else setTransType("Transformer");
  };

  useEffect(() => {
    if (view !== 'satellite-mission' || !satMissionActive || satMissionSuccess) return;
    const timer = setInterval(() => {
      const state = simStateRef.current;
      const SAT_TARGET_DISTANCE = state.satMissionLevel === 1 ? 5000 : state.satMissionLevel === 2 ? 10000 : 20000;

      let powerDraw = (state.satCommsActive ? 56 : 5);
      if (state.satThrusterActive) powerDraw += 560;
      if (state.satTmrActive) powerDraw += 150; // Increased load for TMR
      if (state.satRadiatorActive) powerDraw += 30;
      if (state.satHeaterActive) powerDraw += 45;
      if (state.satStationKeeping) powerDraw += 20;
      if (state.satEvasiveActive) powerDraw += 200;

      const solarIn = (state.satSolarPanelActive && !state.satIsEclipse) ? 2000 : 0;
      const netPower = solarIn - powerDraw;
      
      setSatBattery(prev => Math.max(0, Math.min(100, prev + (netPower / 3600))));
      
      // Distance Physics: Thruster (+65.0) - Gravity Drop (-12.0) + Station Keeping (+12.0)
      let distChange = -12.0; 
      if (state.satStationKeeping && state.satBattery > 0) distChange += 12.0;
      if (state.satThrusterActive && state.satBattery > 0) distChange += 65.0;
      setSatDistance(d => Math.max(0, d + distChange));

      // Altitude Physics (Visual Gravity Pull)
      setSatAltitude(prev => {
        if (state.satStationKeeping && state.satBattery > 0) return prev;
        let change = -1.5;
        if (state.satThrusterActive && state.satBattery > 0) change += 3.5;
        return prev + change;
      });
      
      // Temp Physics: Base cooling (-0.08) + Active Radiator (-1.2) vs Power Heating
      let tempChange = (powerDraw * 0.005) - 0.08 - (state.satRadiatorActive ? 3.5 : 0);

      // Umbra Cooling & Heater Logic
      if (state.satIsEclipse && state.satTemp > -20) tempChange -= 0.5;
      if (state.satHeaterActive) tempChange += 1.0;

      setSatTemp(prev => prev + tempChange);
      
      // Orbit Decay (Time) Physics
      setSatTimeLeft(t => {
        let decay = 1;
        if (state.satStationKeeping && state.satBattery > 0) decay = 0; // Station keeping maintains orbit (pauses timer)
        if (state.satThrusterActive && state.satBattery > 0) decay = -2; // Thruster boosts altitude (adds time)
        return Math.max(0, t - decay);
      });
      
      // Random Events (Solar Flare / Bit Flips)
      if (!state.satSolarFlare && !state.satRadiationStorm && Math.random() < 0.02) {
        setSatSolarFlare(true);
        setSatStatusMsg("⚠️ WARNING: SOLAR FLARE DETECTED! ENABLE TMR!");
      } else if (state.satSolarFlare && Math.random() < 0.1) {
        setSatSolarFlare(false);
        setSatStatusMsg("SOLAR FLARE PASSED - SYSTEMS NOMINAL");
      }
      
      // Radiation Storm Event
      if (!state.satRadiationStorm && !state.satSolarFlare && !state.satDebrisEvent && Math.random() < 0.015) {
        setSatRadiationStorm(true);
        setSatStatusMsg("⚠️ CRITICAL: RADIATION STORM! ENABLE TMR SHIELDING!");
      } else if (state.satRadiationStorm && Math.random() < 0.08) {
        setSatRadiationStorm(false);
        setSatStatusMsg("RADIATION STORM SUBSIDED");
      }

      // Space Debris Events
      if (!state.satDebrisEvent && !state.satSolarFlare && !state.satRadiationStorm && Math.random() < 0.015) {
        setSatDebrisEvent(true);
        setSatStatusMsg("⚠️ ALERT: SPACE DEBRIS FIELD DETECTED! ENGAGE EVASIVE PROPULSION!");
      } else if (state.satDebrisEvent && Math.random() < 0.08) {
        setSatDebrisEvent(false);
        setSatStatusMsg("DEBRIS FIELD CLEARED");
      }

      // Temperature Warning
      if (state.satTemp <= -10 && !state.satHeaterActive && !state.satSolarFlare && !state.satRadiationStorm && !state.satDebrisEvent) {
        setSatStatusMsg("⚠️ WARNING: BATTERY TEMPERATURE HAS REACHED ITS FAILURE THRESHOLD, ACTIVATE HEATER");
      }

      // Failure Conditions
      if ((state.satSolarFlare || state.satRadiationStorm) && !state.satTmrActive && Math.random() < 0.1) {
        setSatMissionActive(false);
        setSatFailureReason("CRITICAL LOGIC FAILURE: BIT-FLIP DETECTED (C&DH ERROR)");
      } else if (state.satBattery <= 0) {
        setSatMissionActive(false);
        setSatFailureReason("CRITICAL POWER LOSS: BATTERY DEPLETED (DoD LIMIT EXCEEDED)");
      } else if (state.satTemp > 110) {
        setSatMissionActive(false);
        setSatFailureReason("THERMAL RUNAWAY: RADIATORS OVERWHELMED");
      } else if (state.satTemp <= -20) {
        setSatMissionActive(false);
        setSatFailureReason("MISSION FAILED: BATTERY MALFUNCTIONED UNDER EXTREME INTERNAL TEMPERATURE");
      } else if (state.satTemp < -40) {
        setSatMissionActive(false);
        setSatFailureReason("CRITICAL FAILURE: HYDRAZINE FROZEN (LOW TEMP)");
      } else if (state.satTimeLeft <= 0) {
        setSatMissionActive(false);
        setSatFailureReason("MISSION TIMEOUT: ORBIT DECAYED");
      } else if (state.satDebrisEvent && !state.satEvasiveActive && Math.random() < 0.15) {
        setSatMissionActive(false);
        setSatFailureReason("CATASTROPHIC IMPACT: COLLISION WITH SPACE JUNK");
      } else if (state.satDistance >= SAT_TARGET_DISTANCE) {
        setSatMissionSuccess(true);
        setSatMissionActive(false);
      }

      // Orbit Deviation Check
      const safeAltMin = 90;
      const safeAltMax = 160;
      let deviation = 0;
      if (state.satAltitude < safeAltMin) deviation = safeAltMin - state.satAltitude;
      if (state.satAltitude > safeAltMax) deviation = state.satAltitude - safeAltMax;

      if (deviation >= 100) {
         setSatMissionActive(false);
         setSatFailureReason(`MISSION FAILED: SATELLITE DERAILED (${Math.round(deviation)}km)`);
      } else if (deviation > 0) {
         setSatStatusMsg(`⚠️ WARNING: SATELLITE DERAILED ORBIT FOR ${Math.round(deviation)}km`);
      }

      // Mini Satellite Logic (Phase 2 & 3)
      if (state.satMissionLevel >= 2 && satMissionActive) {
         let localMiniSats = [...state.satMiniSats];

         // Spawn Logic
         if (localMiniSats.length === 0 && state.satSpaceHazards.length === 0 && Math.random() < (state.satMissionLevel === 3 ? 0.8 : 0.8)) {
             const spawnOffset = 1500;
             const frontAlt = 90 + Math.random() * 50;
             const backAlt = 90 + Math.random() * 50;
             
             localMiniSats = [
               { distance: state.satDistance + spawnOffset, altitude: frontAlt, id: Date.now(), speed: -10, createdAt: Date.now() }, // Front (moves to player)
               { distance: state.satDistance + spawnOffset + 1000, altitude: backAlt, id: Date.now() + 1, speed: -15, createdAt: Date.now() }  // 2nd Front (independent orbit)
             ];
         }

         // Movement & Collision
         const movedSats = localMiniSats.map(ms => ({ ...ms, distance: ms.distance + ms.speed }));
         const currentSatAngle = ((state.satDistance / SAT_TARGET_DISTANCE) * 360 - 90) * (Math.PI / 180);
         const currentSatX = 200 + state.satAltitude * Math.cos(currentSatAngle);
         const currentSatY = 200 + state.satAltitude * Math.sin(currentSatAngle);

         movedSats.forEach(ms => {
             const msAngle = ((ms.distance / SAT_TARGET_DISTANCE) * 360 - 90) * (Math.PI / 180);
             const msX = 200 + ms.altitude * Math.cos(msAngle);
             const msY = 200 + ms.altitude * Math.sin(msAngle);
             
             const dist = Math.sqrt(Math.pow(msX - currentSatX, 2) + Math.pow(msY - currentSatY, 2));
             if (dist < 20) { 
                 setSatMissionActive(false);
                 setSatFailureReason("MISSION FAILED: CATASTROPHIC COLLISION WITH MINI SATELLITES");
             }
         });
         // Cleanup passed satellites
         setSatMiniSats(movedSats.filter(ms => Math.abs(ms.distance - state.satDistance) < 2000 && Date.now() - ms.createdAt < 20000));
      }

      // Space Hazards Logic (Phase 3: Comets & Meteors)
      if (state.satMissionLevel === 3 && satMissionActive) {
        let localHazards = [...state.satSpaceHazards];

        // Spawn Logic (Only 1 at a time)
        if (localHazards.length === 0 && Math.random() < 0.08) {
           const isComet = Math.random() < 0.15; // Rare (15% chance if spawning)
           const type = isComet ? 'comet' : 'meteor';
           const spawnDist = state.satDistance + 4000; // Spawn far ahead
           const spawnAlt = 70 + Math.random() * 120; // Random altitude 70-190 (Inside & Outside orbit)
           const speed = isComet ? -209 : -252; // Move backwards (intercept)
           localHazards = [{ 
             distance: spawnDist, 
             altitude: spawnAlt, 
             type, 
             id: Date.now(),
             spawnTime: Date.now(),
             active: false,
             speed 
           }];
        }

        // Update Hazards (Activation & Movement)
        const updatedHazards = localHazards.map(hz => {
            const newHz = { ...hz };
            if (!newHz.active && Date.now() > newHz.spawnTime + 2000) newHz.active = true;
            if (newHz.active) newHz.distance += newHz.speed;
            return newHz;
        });

        // Collision Logic
        const currentSatAngle = ((state.satDistance / SAT_TARGET_DISTANCE) * 360 - 90) * (Math.PI / 180);
        const currentSatX = 200 + state.satAltitude * Math.cos(currentSatAngle);
        const currentSatY = 200 + state.satAltitude * Math.sin(currentSatAngle);

        updatedHazards.forEach(hz => {
            if (!hz.active) return;
            const hzAngle = ((hz.distance / SAT_TARGET_DISTANCE) * 360 - 90) * (Math.PI / 180);
            const hzX = 200 + hz.altitude * Math.cos(hzAngle);
            const hzY = 200 + hz.altitude * Math.sin(hzAngle);
            
            const dist = Math.sqrt(Math.pow(hzX - currentSatX, 2) + Math.pow(hzY - currentSatY, 2));
            if (dist < (hz.type === 'comet' ? 45 : 15)) { // Larger collision radius for large objects
                setSatMissionActive(false);
                setSatFailureReason("MISSION FAILED: COLLISION WITH LARGE COMETS OR METEORS");
            }
        });
        setSatSpaceHazards(updatedHazards.filter(hz => hz.distance > state.satDistance - 1000));
      }

      // Signal Mission Logic (Collision & Timeout)
      if (state.satIncomingSignal) {
        // Calculate current satellite position (visual coordinates)
        const currentAngleRad = ((state.satDistance / SAT_TARGET_DISTANCE) * 360 - 90) * (Math.PI / 180);
        const satX = 200 + state.satAltitude * Math.cos(currentAngleRad);
        const satY = 200 + state.satAltitude * Math.sin(currentAngleRad);

        const dx = satX - state.satIncomingSignal.x;
        const dy = satY - state.satIncomingSignal.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (dist < 40 && state.satCommsActive) {
           setSatScore(s => s + 1);
           setSatOutgoingSignal({ active: true, startX: satX, startY: satY });
           setSatIncomingSignal(null);
        } else if (Date.now() - state.satIncomingSignal.createdAt > state.satIncomingSignal.timeoutDuration) {
           setSatIncomingSignal(null); // Timeout
           setSatMissedSignals(prev => prev + 1);
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [view, satMissionActive, satMissionSuccess]);

  // --- AUTOMATIC ECLIPSE CYCLE ---
  useEffect(() => {
    if (view !== 'satellite-mission' || !satMissionActive || satMissionSuccess) return;

    const cycleTime = Math.floor(Math.random() * (360000 - 120000 + 1)) + 120000; // 2 to 6 minutes
    const timer = setTimeout(() => {
      setSatIsEclipse(prev => !prev);
    }, cycleTime);

    return () => clearTimeout(timer);
  }, [view, satMissionActive, satMissionSuccess, satIsEclipse]);

  // --- MISSION FAILURE CHECK (MISSED SIGNALS) ---
  useEffect(() => {
    const maxMissed = satMissionLevel === 1 ? 5 : 10;
    if (satMissedSignals >= maxMissed && satMissionActive) {
      setSatMissionActive(false);
      setSatFailureReason("INSUFFICIENT DATA COLLECTED: WEATHER FORECAST FAILED");
    }
  }, [satMissedSignals, satMissionLevel, satMissionActive]);

  // --- FARADAY ANIMATION LOOP ---
  useEffect(() => {
    if (view !== 'electromagnetism' || magSubView !== 'faraday' || faradayMove === 'idle') return;

    const interval = setInterval(() => {
      setFaradayPos(prev => {
        if (faradayMove === 'in') {
          if (prev >= 90) { setFaradayMove('idle'); return 90; }
          return prev + 1.5;
        } else {
          if (prev <= 0) { setFaradayMove('idle'); return 0; }
          return prev - 1.5;
        }
      });
    }, 10);

    return () => clearInterval(interval);
  }, [view, magSubView, faradayMove]);

  // --- SIDE MISSION: DATA COLLECTION ---
  useEffect(() => {
    if (view !== 'satellite-mission' || !satMissionActive || satMissionSuccess) return;

    // Spawn Incoming Signal if none exists
    if (!satIncomingSignal) {
      const timer = setTimeout(() => {
        const currentDist = simStateRef.current.satDistance; // Use ref to avoid dependency loop
        const SAT_TARGET_DISTANCE = simStateRef.current.satMissionLevel === 1 ? 5000 : simStateRef.current.satMissionLevel === 2 ? 10000 : 20000;
        
        const currentAngleDeg = (currentDist / SAT_TARGET_DISTANCE) * 360 - 90;
        
        // Determine spawn type: 10% Low Altitude (Behind), 90% High Altitude (Front)
        const isLowAlt = Math.random() < 0.1; 
        
        let spawnAlt, angleOffset;
        if (isLowAlt) {
           spawnAlt = 90 + Math.random() * 30; // Low altitude (90-120)
           angleOffset = -(10 + Math.random() * 20); // Spawn behind
        } else {
           spawnAlt = 120 + Math.random() * 40; // High altitude (120-160)
           angleOffset = 10 + Math.random() * 20; // Spawn ahead
        }

        const spawnAngleDeg = currentAngleDeg + angleOffset;
        const spawnAngleRad = spawnAngleDeg * (Math.PI / 180);
        
        setSatIncomingSignal({
          x: 200 + spawnAlt * Math.cos(spawnAngleRad),
          y: 200 + spawnAlt * Math.sin(spawnAngleRad),
          createdAt: Date.now(),
          timeoutDuration: Math.abs(angleOffset) > 20 ? 55000 : 25000
        });
      }, Math.random() * 4000 + 2000); // Random delay
      return () => clearTimeout(timer);
    }
  }, [view, satMissionActive, satMissionSuccess, satIncomingSignal]);

  useEffect(() => {
    if (satOutgoingSignal?.active) {
      const timer = setTimeout(() => setSatOutgoingSignal(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [satOutgoingSignal]);

  const resetSatelliteMission = (newLevel?: number) => {
    if (newLevel) setSatMissionLevel(newLevel);
    setSatBriefingActive(true);
    setSatMissionActive(false);
    setSatRadiatorActive(false);
    setSatHeaterActive(false);
    setSatStationKeeping(false);
    setSatDebrisEvent(false);
    setSatEvasiveActive(false);
    setSatScore(0);
    setSatMissedSignals(0);
    setSatMiniSats([]);
    setSatSpaceHazards([]);
    setSatIncomingSignal(null);
    setSatOutgoingSignal(null);
    setSatMissionSuccess(false);
    setSatFailureReason(null);
    setSatSolarFlare(false);
    setSatRadiationStorm(false);
    setSatStatusMsg("SYSTEMS NOMINAL - ORBIT STABLE");
    setSatTimeLeft(600);
    setSatDistance(0);
    setSatBattery(100);
    setSatTemp(20);
    setSatIsEclipse(false);
    setSatTmrActive(false);
    setSatThrusterActive(false);
    setSatCommsActive(true);
    setSatSolarPanelActive(false);
  };

  const devices: Record<string, { name: string; power: number; svg: React.ReactNode }> = {
    lightbulb: { 
      name: 'Light Bulb', 
      power: 60,
      svg: <svg viewBox="0 0 100 100" className="w-full h-full"><circle cx="50" cy="35" r="20" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2"/><path d="M 35 55 Q 35 65 40 70 L 60 70 Q 65 65 65 55 Z" fill="#d97706" stroke="#d97706" strokeWidth="2"/><rect x="42" y="70" width="16" height="12" fill="#94a3b8" stroke="#64748b" strokeWidth="1"/></svg>
    },
    heater: { 
      name: 'Heater', 
      power: 2000,
      svg: <svg viewBox="0 0 100 100" className="w-full h-full"><rect x="20" y="20" width="60" height="60" rx="8" fill="none" stroke="#ef4444" strokeWidth="2"/><path d="M 30 70 Q 30 60 40 50 Q 50 40 60 50 Q 70 60 70 70" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round"/><circle cx="50" cy="35" r="8" fill="#fbbf24" opacity="0.7"/></svg>
    },
    microwave: { 
      name: 'Microwave', 
      power: 1000,
      svg: <svg viewBox="0 0 100 100" className="w-full h-full"><rect x="15" y="20" width="70" height="60" rx="4" fill="none" stroke="#06b6d4" strokeWidth="2"/><rect x="25" y="30" width="50" height="30" fill="#1e293b" stroke="#06b6d4" strokeWidth="1"/><circle cx="35" cy="50" r="3" fill="#06b6d4"/><circle cx="50" cy="50" r="3" fill="#06b6d4"/><circle cx="65" cy="50" r="3" fill="#06b6d4"/><rect x="25" y="65" width="15" height="8" fill="#64748b" stroke="#475569" strokeWidth="1" rx="2"/></svg>
    },
    fan: { 
      name: 'Fan', 
      power: 75,
      svg: <svg viewBox="0 0 100 100" className="w-full h-full"><circle cx="50" cy="50" r="5" fill="#94a3b8" stroke="#64748b" strokeWidth="1"/><circle cx="50" cy="50" r="25" fill="none" stroke="#3b82f6" strokeWidth="2"/><path d="M 50 25 L 48 35 L 52 35 Z" fill="#3b82f6"/><path d="M 75 50 L 65 52 L 65 48 Z" fill="#3b82f6"/><path d="M 50 75 L 52 65 L 48 65 Z" fill="#3b82f6"/><path d="M 25 50 L 35 48 L 35 52 Z" fill="#3b82f6"/></svg>
    },
    television: { 
      name: 'Television', 
      power: 150,
      svg: <svg viewBox="0 0 100 100" className="w-full h-full"><rect x="15" y="15" width="70" height="50" rx="4" fill="none" stroke="#8b5cf6" strokeWidth="2"/><rect x="20" y="20" width="60" height="40" fill="#0f172a" stroke="#8b5cf6" strokeWidth="1"/><circle cx="30" cy="32" r="2" fill="#06b6d4"/><circle cx="45" cy="32" r="2" fill="#06b6d4"/><circle cx="60" cy="32" r="2" fill="#06b6d4"/><polygon points="35,70 40,78 60,78 65,70" fill="#64748b" stroke="#475569" strokeWidth="1"/></svg>
    },
    boiler: { 
      name: 'Boiler', 
      power: 3000,
      svg: <svg viewBox="0 0 100 100" className="w-full h-full"><ellipse cx="50" cy="40" rx="28" ry="32" fill="none" stroke="#ef4444" strokeWidth="2"/><path d="M 22 40 L 20 60 Q 20 75 30 80 L 70 80 Q 80 75 80 60 L 78 40" fill="none" stroke="#ef4444" strokeWidth="2"/><circle cx="50" cy="40" r="4" fill="#fbbf24" opacity="0.7"/><line x1="30" y1="25" x2="35" y2="20" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/><line x1="50" y1="20" x2="50" y2="12" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/><line x1="70" y1="25" x2="65" y2="20" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/></svg>
    },
  };

  const currentNeeded = selectedDevice ? devices[selectedDevice].power / supplyVoltage : 0;
  const thermalIntensity = Math.min(100, (currentNeeded / 15) * 100);
  const status = !selectedDevice ? 'Standby' : !simActive ? 'Inactive' : 
    fuseInstalled && currentNeeded > fuseRating ? 'Fuse Burned - Cut Off' :
    !fuseInstalled && thermalIntensity >= 100 ? 'Device Burnt' :
    simActive ? 'Activated' : 'Ready';

  // Simple Sim Calculations (Source Logic)
  const rTotal = kvlR1 + kvlR2;
  const iSeries = kvlV / rTotal;
  const v1 = iSeries * kvlR1;
  const v2 = iSeries * kvlR2;
  const sLoop = Math.max(0.2, 8 / (iSeries || 1)); // Prevent division by zero

  // --- ADVANCED SIMULATION STATE (Parallel/Series & Flow Type) ---
  const [circuitMode, setCircuitMode] = useState('series');
  const [advV, setAdvV] = useState(12);
  const [switchOn, setSwitchOn] = useState(false);
  const [flowType, setFlowType] = useState('current'); 
  
  // New State Structure for Main + Branches
  const [mainBulbs, setMainBulbs] = useState<number[]>([10]);
  const [branches, setBranches] = useState<number[][]>([[10], [10]]); // Start with 2 branches

  const getAdvancedResults = () => {
    if (!switchOn) return null;
    
    // 1. Calculate Resistance of Main Loop
    const rMain = circuitMode === 'parallel' ? 0 : mainBulbs.reduce((a, b) => a + b, 0);

    // 2. Calculate Resistance of Parallel Bank
    let rBank = 0;
    let branchResistances: number[] = [];
    let hasShort = false;
    
    if (circuitMode === 'series') {
      rBank = 0;
      branchResistances = [];
    } else {
      branchResistances = branches.map(b => b.reduce((sum, r) => sum + r, 0));
      hasShort = branchResistances.some(r => r === 0);
      if (branches.length === 0) {
        rBank = Infinity; 
      } else if (hasShort) {
        rBank = 0;
      } else {
        const invSum = branchResistances.reduce((sum, r) => sum + (1 / r), 0);
        rBank = invSum === 0 ? 0 : 1 / invSum;
      }
    }

    const totalR = rMain + rBank;
    const totalCurrent = (totalR === 0) ? 999 : (totalR === Infinity ? 0 : advV / totalR);
    const vBank = rBank === Infinity ? advV : totalCurrent * rBank;
    
    let branchCurrents: number[];
    if (hasShort) {
      const shortCount = branchResistances.filter(r => r === 0).length;
      branchCurrents = branchResistances.map(r => r === 0 ? totalCurrent / shortCount : 0);
    } else {
      branchCurrents = branchResistances.map(r => r === 0 ? 0 : vBank / r);
    }

    return {
      totalResistance: totalR === Infinity ? "∞" : totalR.toFixed(2),
      totalCurrent: totalCurrent.toFixed(2),
      branchCurrents: branchCurrents,
      vBank: vBank,
      isShort: hasShort && (circuitMode === 'parallel' || circuitMode === 'mixed')
    };
  };
  const results = getAdvancedResults();

  // Calculate Satellite Absolute Position for Signal Drawing
  const satAngleRad = ((satDistance / SAT_TARGET_DISTANCE) * 360 - 90) * (Math.PI / 180);
  const satAbsX = 200 + satAltitude * Math.cos(satAngleRad);
  const satAbsY = 200 + satAltitude * Math.sin(satAngleRad);

  // Helper to get Y positions for branches based on count
  const getBranchY = (index: number, total: number) => {
    const startY = 80;
    const gap = 50;
    return startY + (index * gap);
  };

  return (
    <main className="min-h-screen relative text-slate-200 overflow-hidden bg-[#02040a]">
      
      {/* 1. BACKGROUND */}
      <div className="fixed inset-0 z-[-5] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#02040a]/50 to-[#02040a]" />
      </div>

      <section className="max-w-6xl mx-auto pt-24 px-6 relative z-10">
      <div className="text-center mb-12">
        <h1 onClick={() => setView('home')} className="text-8xl font-black text-white tracking-tighter drop-shadow-[0_0_30px_rgba(59,130,246,0.8)] cursor-pointer">
          YEEET HUB
        </h1>
        <p className="mt-6 text-cyan-400 font-bold tracking-[0.4em] uppercase text-[10px] md:text-xs">
          {view === 'home' ? (
            <>
              Yielding Electricity, Electronics and Electromagnetism Tutoring Hub.
              <span className="block mt-4 tracking-normal normal-case">Interactive physics curriculum powered by AI, personalized learning and interesting interaction.</span>
            </>
          ) : `MODULE: ${view.toUpperCase()}`}
        </p>
        {/* 2. DYNAMIC CONTENT SWITCHER */}
        
        {view === 'home' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
            <Link href="/modules/ai-tutor" className="relative p-8 h-full rounded-3xl border border-blue-500/40 bg-black/60 backdrop-blur-2xl transition-all hover:-translate-y-2 cursor-pointer block">
              <div className="text-5xl mb-6">🤖</div>
              <h3 className="text-2xl font-black text-white">AI PROFESSOR and LABORATORY</h3>
              <p className="text-slate-300 mt-3 text-sm leading-relaxed font-medium">Interactive electronics theory and deep-dive EEE analysis.</p>
            </Link>

            <div onClick={() => setView('sim-menu')} className="group relative p-8 h-full rounded-3xl border border-emerald-500/40 bg-black/60 backdrop-blur-2xl transition-all hover:-translate-y-2 cursor-pointer">
              <div className="text-5xl mb-6">⚡</div>
              <h3 className="text-2xl font-black text-white">THEORY SIMULATION</h3>
              <p className="text-slate-300 mt-3 text-sm leading-relaxed font-medium">Real-time simulation of electricities working mechanism.</p>
            </div>

            <div onClick={() => setView('electromagnetism')} className="group relative p-8 h-full rounded-3xl border border-purple-500/40 bg-black/60 backdrop-blur-2xl transition-all hover:-translate-y-2 cursor-pointer">
              <div className="text-5xl mb-6">🧲</div>
              <h3 className="text-2xl font-black text-white">ELECTROMAGNETISM</h3>
              <p className="text-slate-300 mt-3 text-sm leading-relaxed font-medium">Instant lookup for electromagnetic field theories.</p>
            </div>

            <div onClick={() => setView('scenarios')} className="group relative p-8 h-full rounded-3xl border border-orange-500/40 bg-black/60 backdrop-blur-2xl transition-all hover:-translate-y-2 cursor-pointer">
              <div className="text-5xl mb-6">🧩</div>
              <h3 className="text-2xl font-black text-white">EEE ENGINEERING SCENARIOS CHALLENGE</h3>
              <p className="text-slate-300 mt-3 text-sm leading-relaxed font-medium">Solve complex, real-world engineering problems of EEE.</p>
            </div>
          </div>
        )}

        {view === 'sim-menu' && (
          <div className="grid grid-cols-1 gap-8 animate-in fade-in max-w-2xl mx-auto">
            <div onClick={() => setView('theory-levels')} className="p-12 rounded-3xl border border-emerald-400 bg-black/80 text-center hover:scale-105 cursor-pointer transition-all shadow-[0_0_30px_rgba(52,211,153,0.3)]">
               <h3 className="text-3xl font-black text-emerald-400 mb-4">Electricity Theories</h3>
            </div>
          </div>
        )}

        {view === 'scenarios' && (
          <div className="max-w-4xl mx-auto animate-in fade-in">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-orange-400 mb-4">Engineering Scenarios</h2>
              <p className="text-slate-400">Select a challenge to begin your engineering assessment.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group relative p-8 h-full rounded-3xl border border-pink-500/40 bg-black/60 backdrop-blur-2xl transition-all hover:-translate-y-2 hover:border-pink-500 hover:shadow-[0_0_30px_rgba(236,72,153,0.3)]">
                <div className="text-5xl mb-6">🛰️</div>
                <h3 className="text-2xl font-black text-white">Aerospace Satellite Power Planning <span className="block text-sm font-normal text-pink-300 mt-1">(application of electronics in aerospace field)</span></h3>
                <p className="text-slate-300 mt-3 text-sm leading-relaxed font-medium">Power on satellites is limited. Balance solar generation with subsystem loads to keep the mission alive.</p>
                
                <div className="mt-6">
                  <div className="text-[10px] font-bold text-pink-400 mb-2 uppercase tracking-widest">Select Mission Phase</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((phase) => (
                      <button key={phase} onClick={() => { setView('satellite-mission'); resetSatelliteMission(phase); }} className="py-2 rounded bg-pink-900/30 border border-pink-500/50 text-pink-200 text-xs font-bold hover:bg-pink-500 hover:text-white transition-all">
                        PHASE {phase}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="group relative p-8 h-full rounded-3xl border border-cyan-500/40 bg-black/60 backdrop-blur-2xl transition-all hover:-translate-y-2 cursor-pointer hover:border-cyan-500 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                <div className="mb-6 text-cyan-400 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-white">Grid network solution</h3>
                <p className="text-slate-300 mt-3 text-sm leading-relaxed font-medium">Design a Electricity sending system to keep functionality of a city (application of electronics in power sector), COMING SOON!</p>
                <div className="mt-6 inline-block px-4 py-2 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/50">DIFFICULTY: HARD</div>
              </div>
            </div>
          </div>
        )}

        {view === 'satellite-mission' && (
          <div className="flex h-[80vh] bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden font-mono relative z-10 animate-in fade-in">
            
            {/* LEFT: COMMAND PANEL */}
            <section className="w-80 border-r border-slate-800 bg-slate-900/90 flex flex-col shadow-2xl z-10 overflow-y-auto custom-scrollbar">
              
              {/* MANUAL HEADER */}
              <div className="p-4 bg-cyan-950/30 border-b border-cyan-800">
                <button 
                  onClick={() => setSatShowManual(!satShowManual)}
                  className="w-full text-left flex justify-between items-center text-cyan-400 font-black text-xs uppercase"
                >
                  <span>{satShowManual ? '▼ Hide Manual' : '▶ Show Operations Manual'}</span>
                  <span className="animate-pulse">HELP</span>
                </button>
                
                {satShowManual && (
                  <div className="mt-4 text-[10px] space-y-3 text-slate-300 leading-relaxed border-t border-cyan-900 pt-4">
                    <div>
                      <b className="text-white block underline">1. PROPULSION (Solenoid Valve)</b>
                      Uses 20A of current to eject mass. High current through copper traces causes rapid Joule Heating ($P=I^2R$).
                    </div>
                    <div>
                      <b className="text-white block underline">2. COMMS ARRAY (RF Transceiver)</b>
                      Maintains the data link, so you can transmit signals back to earth. If Logic is 0(deactivated), the satellite is silent but saves 50W of power.
                    </div>
                    <div>
                      <b className="text-white block underline">3. TMR (Radiation Hardening)</b>
                      Triple Modular Redundancy. Uses 3 microprocessors to "vote" on calculations. Essential during solar flares but draws 1A of constant current.
                    </div>
                    <div>
                      <b className="text-white block underline">4. UMBRA/ECLIPSE</b>
                      Spacecraft enters Earth's shadow. Solar Panels must be DEPLOYED to charge in daylight. In Umbra, systems rely on Battery.
                    </div>
                    <div>
                      <b className="text-white block underline">5. THERMAL CONTROL</b>
                      Radiators dissipate heat (-3.5°C/s) but draw power. Heaters prevent freezing (&lt; -40°C).
                    </div>
                    <div>
                      <b className="text-white block underline">6. HAZARDS & ORBIT</b>
                      Gravity causes orbit decay (Time Loss) and drag (Distance Loss). 
                      <br/>• <b>Station Keeping:</b> Pauses decay.
                      <br/>• <b>Thrusters:</b> Boosts orbit (+Time).
                    </div>
                  </div>
                )}
              </div>

              {/* CONTROLS */}
              <div className="p-6 space-y-8 flex-1">
                <div>
                  <h2 className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Main Thruster</h2>
                  <button 
                    onMouseDown={() => setSatThrusterActive(true)}
                    onMouseUp={() => setSatThrusterActive(false)}
                    onTouchStart={() => setSatThrusterActive(true)}
                    onTouchEnd={() => setSatThrusterActive(false)}
                    disabled={!satMissionActive}
                    className={`w-full py-8 rounded-lg font-black transition-all border-2 ${
                      satThrusterActive ? 'bg-red-600 border-red-400' : 'bg-slate-800 border-slate-700 text-slate-500'
                    }`}
                  >
                    ENGAGE THRUSTER
                  </button>
                </div>

                <div className="space-y-4">
                  <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subsystems</h2>
                  <div className="grid grid-cols-1 gap-2">
                    <button onClick={() => setSatSolarPanelActive(!satSolarPanelActive)} disabled={!satMissionActive} className="flex justify-between p-3 border border-slate-700 rounded text-xs bg-black/20 hover:bg-slate-800 transition-colors">
                      <span>SOLAR ARRAYS</span>
                      <span className={satSolarPanelActive ? "text-yellow-400" : "text-slate-600"}>{satSolarPanelActive ? "DEPLOYED" : "RETRACTED"}</span>
                    </button>
                    <button onClick={() => setSatCommsActive(!satCommsActive)} disabled={!satMissionActive} className="flex justify-between p-3 border border-slate-700 rounded text-xs bg-black/20 hover:bg-slate-800 transition-colors">
                      <span>COMMS TRANSCEIVER</span>
                      <span className={satCommsActive ? "text-cyan-400" : "text-slate-600"}>{satCommsActive ? "ENABLED" : "DISABLED"}</span>
                    </button>
                    <button onClick={() => setSatTmrActive(!satTmrActive)} disabled={!satMissionActive} className="flex justify-between p-3 border border-slate-700 rounded text-xs bg-black/20 hover:bg-slate-800 transition-colors">
                      <span>TMR (VOTE LOGIC)</span>
                      <span className={satTmrActive ? "text-purple-400" : "text-slate-600"}>{satTmrActive ? "SHIELDED" : "BYPASS"}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thermal Control</h2>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setSatRadiatorActive(!satRadiatorActive)} disabled={!satMissionActive} className="flex flex-col items-center justify-center p-3 border border-slate-700 rounded text-xs bg-black/20 hover:bg-slate-800 transition-colors">
                      <span className="mb-1">RADIATORS</span>
                      <span className={satRadiatorActive ? "text-blue-400 font-bold" : "text-slate-600"}>{satRadiatorActive ? "EXTENDED" : "RETRACTED"}</span>
                    </button>
                    <button onClick={() => setSatHeaterActive(!satHeaterActive)} disabled={!satMissionActive} className="flex flex-col items-center justify-center p-3 border border-slate-700 rounded text-xs bg-black/20 hover:bg-slate-800 transition-colors">
                      <span className="mb-1">HEATERS</span>
                      <span className={satHeaterActive ? "text-orange-400 font-bold" : "text-slate-600"}>{satHeaterActive ? "ACTIVE" : "OFF"}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Navigation & Safety</h2>
                  <div className="grid grid-cols-1 gap-2">
                    <button onClick={() => setSatStationKeeping(!satStationKeeping)} disabled={!satMissionActive} className="flex justify-between p-3 border border-slate-700 rounded text-xs bg-black/20 hover:bg-slate-800 transition-colors">
                      <span>STATION KEEPING (GRAVITY)</span>
                      <span className={satStationKeeping ? "text-emerald-400" : "text-slate-600"}>{satStationKeeping ? "ACTIVE" : "OFF"}</span>
                    </button>
                    <button onClick={() => setSatEvasiveActive(!satEvasiveActive)} disabled={!satMissionActive} className={`flex justify-between p-3 border rounded text-xs transition-colors ${satEvasiveActive ? 'bg-red-900/30 border-red-500' : 'bg-black/20 border-slate-700 hover:bg-slate-800'}`}>
                      <span>EVASIVE PROPULSION</span>
                      <span className={satEvasiveActive ? "text-red-400 animate-pulse" : "text-slate-600"}>{satEvasiveActive ? "ENGAGED" : "STANDBY"}</span>
                    </button>
                  </div>
                </div>

                <button disabled className={`w-full py-4 text-[10px] font-bold rounded uppercase transition-all cursor-not-allowed opacity-90 ${satIsEclipse ? 'bg-indigo-900 border border-indigo-500 text-white' : 'bg-yellow-600 text-black'}`}>
                  {satIsEclipse ? "Orbit: Umbra (Discharging)" : "Orbit: Daylight (Charging)"}
                  <span className="block text-[8px] opacity-70 mt-1">AUTOMATIC CYCLE ACTIVE</span>
                </button>
              </div>
            </section>

            {/* RIGHT: SYSTEM VISUALIZER */}
            <section className="flex-1 relative bg-black p-10 flex flex-col justify-between">
              {/* STATUS BAR */}
              <div className={`absolute top-0 left-0 right-0 p-2 text-center text-xs font-bold tracking-widest uppercase transition-colors duration-500 ${
                satSolarFlare || satDebrisEvent || satRadiationStorm ? 'bg-red-600 text-white animate-pulse' : 
                satMissionSuccess ? 'bg-emerald-500 text-black' :
                'bg-slate-900 text-slate-400'
              }`}>
                {satMissionSuccess ? "MISSION ACCOMPLISHED: ORBIT ESTABLISHED" : satBriefingActive ? "MISSION BRIEFING - STANDBY" : satStatusMsg}
              </div>

              {(!satMissionActive || satMissionSuccess) && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                  <div className={`text-center p-8 border rounded-2xl relative overflow-hidden ${satMissionSuccess ? 'border-emerald-500/50 bg-emerald-950/30' : 'border-red-500/50 bg-red-950/30'}`}>
                    {!satMissionSuccess && <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-1 bg-red-500 shadow-[0_0_20px_rgba(239,68,68,1)] animate-pulse" />}
                    {!satMissionSuccess && (
                      <>
                        {satBriefingActive ? (
                          <div className="max-w-md mx-auto">
                            <h2 className="text-3xl font-black text-cyan-400 mb-4 uppercase tracking-widest">Mission Phase {satMissionLevel}</h2>
                            <div className="text-left bg-black/40 p-6 rounded-xl border border-cyan-500/30 mb-6 space-y-4">
                              <div>
                                <strong className="text-white block text-sm uppercase mb-1">Objective</strong>
                                <p className="text-slate-300 text-xs">Reach orbital distance of <span className="text-cyan-400 font-bold">{SAT_TARGET_DISTANCE}km</span> while maintaining system integrity.</p>
                              </div>
                              <div>
                                <strong className="text-white block text-sm uppercase mb-1">Hazards & Obstacles</strong>
                                <ul className="text-slate-300 text-xs list-disc pl-4 space-y-1">
                                  {satMissionLevel === 1 && <li>Basic orbital decay and thermal management.</li>}
                                  {satMissionLevel === 2 && <li><span className="text-red-400">Mini-Satellites:</span> Congested orbit. Avoid collisions with rogue satellites.</li>}
                                  {satMissionLevel === 3 && <li><span className="text-orange-400">Meteor Shower:</span> High-velocity comets and meteors detected. Extreme caution required.</li>}
                                  <li>Solar Flares & Radiation Storms possible.</li>
                                </ul>
                              </div>
                            </div>
                            <button 
                              onClick={() => { setSatBriefingActive(false); setSatMissionActive(true); }}
                              className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase rounded-xl tracking-widest transition-all shadow-[0_0_20px_rgba(8,145,178,0.4)]"
                            >
                              Initiate Launch Sequence
                            </button>
                          </div>
                        ) : (
                          // FAILURE SCREEN
                          <>
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                        <div className="w-32 h-32 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
                      </div>
                    <h2 className={`text-4xl font-black mb-4 ${satMissionSuccess ? 'text-emerald-500' : 'text-red-500'}`}>
                      {satMissionSuccess ? (satMissionLevel === 3 ? "CAMPAIGN COMPLETE" : "MISSION SUCCESS") : "MISSION FAILED"}
                    </h2>
                    <p className={`mb-6 font-mono ${satMissionSuccess ? 'text-emerald-200' : 'text-red-200'}`}>
                      {satMissionSuccess ? `Orbit ${satMissionLevel} Established. ${satMissionLevel < 3 ? "Preparing next phase..." : "All objectives met."}` : satFailureReason}
                    </p>

                  {/* Score Display */}
                  <div className="mb-6 bg-black/40 p-4 rounded-xl border border-white/10 inline-block min-w-[200px]">
                     <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Signals Intercepted</p>
                     <p className="text-3xl font-black text-white">{satScore} <span className="text-sm text-slate-500">MARKS</span></p>
                  </div>

                    {/* Bit Flip Explanation */}
                    {!satMissionSuccess && satFailureReason?.includes("BIT-FLIP") && (
                      <div className="mb-6 text-xs text-left bg-black/40 p-4 rounded border border-red-500/30 text-red-100 max-w-md mx-auto">
                        <strong className="block mb-1 text-red-400">ANALYSIS: Single Event Upset (SEU)</strong>
                        High-energy cosmic rays struck a memory transistor, flipping a binary '0' to '1'. This corrupted the flight computer's instruction set. 
                        <br/><br/>
                        <span className="text-slate-400">PREVENTION: Enable TMR (Triple Modular Redundancy) to have three processors "vote" on calculations and ignore errors.</span>
                      </div>
                    )}

                    {/* Orbit Decay / Re-entry Explanation */}
                    {!satMissionSuccess && satFailureReason?.includes("ORBIT DECAYED") && (
                      <div className="mb-6 text-xs text-left bg-black/40 p-4 rounded border border-orange-500/30 text-orange-100 max-w-md mx-auto">
                        <strong className="block mb-1 text-orange-400">ANALYSIS: Atmospheric Disintegration</strong>
                        Orbital decay caused the satellite to enter the dense atmosphere. Extreme friction generated plasma temperatures exceeding 3000°C, vaporizing the spacecraft.
                        <br/><br/>
                        <span className="text-slate-400">PREVENTION: Complete mission objectives before orbital decay timer expires.</span>
                      </div>
                    )}

                    <button 
                      onClick={() => {
                        if (satMissionSuccess) {
                          if (satMissionLevel < 3) resetSatelliteMission(satMissionLevel + 1);
                          else setView('scenarios');
                        } else resetSatelliteMission();
                      }} 
                      className={`px-6 py-3 font-bold rounded-xl uppercase tracking-widest text-white ${satMissionSuccess ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'}`}>
                      {satMissionSuccess ? (satMissionLevel < 3 ? `Start Phase ${satMissionLevel + 1}` : "Return to Base") : "Reboot System"}
                    </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-start mt-6">
                  <div className="bg-slate-900/50 p-4 border border-slate-800 rounded">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Time to Re-entry</span>
                      <span className="text-4xl font-black">{Math.floor(satTimeLeft / 60)}:{(satTimeLeft % 60).toString().padStart(2, '0')}</span>
                  </div>
                  <div className="bg-slate-900/50 p-4 border border-slate-800 rounded text-center">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Failed Attempts</span>
                      <span className="text-xs text-slate-400 font-bold block">Max: {satMissionLevel === 1 ? 5 : 10}</span>
                      <span className={`text-3xl font-black ${satMissedSignals > 0 ? 'text-red-400' : 'text-white'}`}>{satMissedSignals}</span>
                  </div>
                  <div className="bg-slate-900/50 p-4 border border-slate-800 rounded text-right">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Internal Temp</span>
                      <span className={`text-xl font-bold ${satTemp > 80 ? 'text-red-500' : satTemp < 0 ? 'text-cyan-400' : 'text-orange-500'}`}>{satTemp.toFixed(1)}°C</span>
                  </div>
              </div>

              <div className="flex flex-col items-center justify-center flex-1 relative">
                  {/* ORBIT VISUALIZATION */}
                  <div className="relative w-[300px] h-[300px]">
                    <svg viewBox="0 0 400 400" className="w-full h-full">
                      <defs>
                        <radialGradient id="umbraGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                        </radialGradient>
                        <filter id="blueGlow" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                        <filter id="orangeGlow" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      {/* Orbit Path */}
                      <circle cx="200" cy="200" r="140" fill="none" stroke="#1e293b" strokeWidth="2" strokeDasharray="10,5" className="animate-spin-slow" style={{transformOrigin: '200px 200px'}} />
                      
                      {/* Gravity Lines (Millions of blue lines pulling) */}
                      <g className="animate-spin-slow" style={{transformOrigin: '200px 200px'}}>
                        {[...Array(24)].map((_, i) => (
                          <line 
                            key={`grav-${i}`}
                            x1={200 + 200 * Math.cos(i * 15 * Math.PI / 180)} 
                            y1={200 + 200 * Math.sin(i * 15 * Math.PI / 180)}
                            x2="200" y2="200"
                            stroke="#3b82f6" strokeWidth="1" opacity="0.2" strokeDasharray="10,20" 
                            className="animate-gravity-flow"
                          />
                        ))}
                      </g>

                      {/* Earth */}
                      <circle cx="200" cy="200" r="60" fill="#1d4ed8" stroke="#3b82f6" strokeWidth="4" />
                      <path d="M 180 180 Q 200 160 220 180 T 240 200" fill="none" stroke="#60a5fa" strokeWidth="3" opacity="0.5" />

                      {/* Incoming Signal (Red Curly Line) */}
                      {satIncomingSignal && (
                        <g transform={`translate(${satIncomingSignal.x}, ${satIncomingSignal.y})`}>
                          {/* Propagate from Earth Visual (Line from Earth Center) */}
                          <line x1={200 - satIncomingSignal.x} y1={200 - satIncomingSignal.y} x2="0" y2="0" stroke="#ef4444" strokeWidth="1" strokeDasharray="4,4" opacity="0.3" />
                          
                          {/* The Signal Wave */}
                          <path 
                            d="M -15 0 Q -7 -10 0 0 T 15 0" 
                            fill="none" 
                            stroke="#ef4444" 
                            strokeWidth="3" 
                            strokeLinecap="round"
                            className="animate-pulse"
                          />
                          <circle r="20" fill="#ef4444" opacity="0.1" className="animate-ping" />
                          <text y="20" fill="#ef4444" fontSize="8" textAnchor="middle" fontWeight="bold">SIGNAL</text>
                        </g>
                      )}
                      
                      {/* Mini Satellites (Obstacles) */}
                      {satMiniSats.map(ms => {
                        const angle = (ms.distance / SAT_TARGET_DISTANCE) * 360 - 90;
                        return (
                          <g key={ms.id} transform={`rotate(${angle}, 200, 200)`}>
                            <g transform={`translate(${200 + ms.altitude}, 200)`}>
                              <rect x="-6" y="-6" width="12" height="12" fill="#475569" stroke="#ef4444" strokeWidth="1" transform="rotate(45)" />
                              <line x1="-8" y1="0" x2="8" y2="0" stroke="#94a3b8" strokeWidth="1" />
                            </g>
                          </g>
                        );
                      })}

                      {/* Space Hazards (Comets & Meteors) */}
                      {satSpaceHazards.map(hz => {
                        const angle = (hz.distance / SAT_TARGET_DISTANCE) * 360 - 90;
                        return (
                          <g key={hz.id}>
                            {/* Orbit Line (Always visible) */}
                            {hz.type === 'comet' ? (
                              <circle cx="200" cy="200" r={hz.altitude} fill="none" stroke="#1e3a8a" strokeWidth="1" strokeDasharray="5,5" opacity="0.5" className="animate-pulse" />
                            ) : (
                              // Meteor Orbit: Slight curve intersecting visual
                              <path 
                                d={`M ${200 + hz.altitude * Math.cos(angle * Math.PI / 180 - 1)} ${200 + hz.altitude * Math.sin(angle * Math.PI / 180 - 1)} A ${hz.altitude} ${hz.altitude} 0 0 1 ${200 + hz.altitude * Math.cos(angle * Math.PI / 180 + 1)} ${200 + hz.altitude * Math.sin(angle * Math.PI / 180 + 1)}`}
                                fill="none" stroke="#fb923c" strokeWidth="1" strokeDasharray="10,10" opacity="0.6" 
                              />
                            )}
                            {/* Active Object */}
                            {hz.active && (
                              <g transform={`rotate(${angle}, 200, 200)`}>
                            <g transform={`translate(${200 + hz.altitude}, 200)`}>
                              {/* Tail: Apex at tail (end), Base at front (head). Points +Y (CW) as motion is -Y (CCW) */}
                              {hz.type === 'comet' ? (
                                <g>
                                  <path d="M -15 0 L 15 0 L 0 80 Z" fill="#3b82f6" opacity="0.6" filter="url(#blueGlow)" />
                                  {/* Blue Particles */}
                                  {[...Array(6)].map((_, i) => (
                                    <circle key={i} cx={(Math.random()-0.5)*15} cy={20 + Math.random()*50} r={1+Math.random()*3} fill="#60a5fa" className="animate-fire-particle" style={{animationDelay: `-${Math.random()}s`}} />
                                  ))}
                                </g>
                              ) : (
                                <g>
                                  <path d="M -5 0 L 5 0 L 0 40 Z" fill="#f97316" opacity="0.7" filter="url(#orangeGlow)" />
                                  {/* Orange Particles */}
                                  {[...Array(5)].map((_, i) => (
                                    <circle key={i} cx={(Math.random()-0.5)*10} cy={10 + Math.random()*30} r={1+Math.random()*2} fill="#fbbf24" className="animate-fire-particle" style={{animationDelay: `-${Math.random()}s`}} />
                                  ))}
                                </g>
                              )}
                              
                              {/* Body */}
                              {hz.type === 'comet' ? (
                                <circle r="18" fill="#a5f3fc" filter="url(#blueGlow)" />
                              ) : (
                                // Meteor Head: Oval
                                <ellipse cx="0" cy="0" rx="4" ry="7" fill="#475569" stroke="#fb923c" strokeWidth="1" />
                              )}
                            </g>
                          </g>
                            )}
                          </g>
                        );
                      })}

                      {/* Satellite Group (Rotates) */}
                      <g transform={`rotate(${(satDistance / SAT_TARGET_DISTANCE) * 360 - 90}, 200, 200)`}>
                        {/* Satellite Icon with Variable Altitude */}
                        <g transform={`translate(${200 + satAltitude}, 200)`}>
                           {/* Ambient Hue (Umbra/Daylight) */}
                           <circle cx="0" cy="0" r="50" fill={`url(#${satIsEclipse ? 'umbraGlow' : 'sunGlow'})`} className="transition-all duration-1000" />
                           <rect x="-10" y="-6" width="20" height="12" fill="#94a3b8" stroke="white" strokeWidth="1" />
                           
                           {/* Left Solar Panel */}
                           <g className="transition-all duration-1000" style={{ transform: `translateX(${satSolarPanelActive ? -34 : -12}px)` }}>
                             <rect 
                               y="-8" 
                               width={satSolarPanelActive ? 24 : 2} 
                               height="16" 
                               fill="#0ea5e9" stroke="#0284c7" strokeWidth="1" 
                             />
                             {satSolarPanelActive && (
                               <path d="M 6 -8 L 6 8 M 12 -8 L 12 8 M 18 -8 L 18 8 M 0 -4 L 24 -4 M 0 0 L 24 0 M 0 4 L 24 4" stroke="white" strokeWidth="0.5" opacity="0.5" />
                             )}
                           </g>

                           {/* Right Solar Panel */}
                           <g className="transition-all duration-1000" style={{ transform: `translateX(10px)` }}>
                             <rect 
                               y="-8" 
                               width={satSolarPanelActive ? 24 : 2} 
                               height="16" 
                               fill="#0ea5e9" stroke="#0284c7" strokeWidth="1" 
                             />
                             {satSolarPanelActive && (
                               <path d="M 6 -8 L 6 8 M 12 -8 L 12 8 M 18 -8 L 18 8 M 0 -4 L 24 -4 M 0 0 L 24 0 M 0 4 L 24 4" stroke="white" strokeWidth="0.5" opacity="0.5" />
                             )}
                           </g>

                           {/* Thruster Flame */}
                           {satThrusterActive && (
                             <path d="M -5 6 L 0 15 L 5 6 Z" fill="#ef4444" className="animate-pulse" />
                           )}
                           {/* Failure Red Light Beacon */}
                           {!satMissionActive && !satMissionSuccess && (
                             <g>
                               <circle cx="0" cy="0" r="20" fill="#ef4444" opacity="0.3" className="animate-ping" />
                               <circle cx="0" cy="0" r="4" fill="#ef4444" className="animate-pulse" />
                             </g>
                           )}
                           {/* Solar Flare Animation */}
                           {satSolarFlare && (
                             <g>
                               {[...Array(12)].map((_, i) => (
                                 <line 
                                   key={i}
                                   x1={-300} y1={-150 + i * 25} 
                                   x2={300} y2={-150 + i * 25 + 20} 
                                   stroke="#ef4444" 
                                   strokeWidth="1" 
                                   strokeDasharray="50,100"
                                   className="animate-flare-flow opacity-60"
                                   style={{ animationDuration: `${0.2 + Math.random() * 0.3}s`, animationDelay: `-${Math.random()}s` }}
                                 />
                               ))}
                             </g>
                           )}
                           {/* Radiation Storm Animation (Purple Lines) */}
                           {satRadiationStorm && (
                             <g>
                               {[...Array(20)].map((_, i) => (
                                 <line 
                                   key={`rad-${i}`}
                                   x1={-300} y1={-200 + i * 20} 
                                   x2={300} y2={-200 + i * 20 + 50} 
                                   stroke="#a855f7" 
                                   strokeWidth="2" 
                                   strokeDasharray="10,30"
                                   className="animate-flare-flow opacity-80"
                                   style={{ animationDuration: `${0.1 + Math.random() * 0.2}s`, animationDelay: `-${Math.random()}s` }}
                                 />
                               ))}
                             </g>
                           )}
                           {/* Re-entry Burn Up Animation */}
                           {!satMissionActive && satFailureReason === "MISSION TIMEOUT: ORBIT DECAYED" && (
                             <g>
                               <circle cx="0" cy="0" r="22" fill="#f97316" opacity="0.4" className="animate-pulse" />
                               <circle cx="0" cy="0" r="18" fill="#ef4444" opacity="0.6" className="animate-ping" />
                               {[...Array(8)].map((_, i) => (
                                  <circle key={`fire-${i}`} cx={(Math.random()-0.5)*20} cy={(Math.random()-0.5)*20} r={2+Math.random()*3} fill="#fbbf24" className="animate-fire-particle" style={{animationDelay: `-${Math.random()}s`}} />
                               ))}
                             </g>
                           )}
                           {/* Space Debris Animation */}
                           {satDebrisEvent && (
                             <g>
                               {[...Array(5)].map((_, i) => (
                                 <g key={`debris-${i}`} className="animate-debris-fly" style={{ animationDuration: `${1 + Math.random()}s`, animationDelay: `-${Math.random()}s` }}>
                                    {i % 2 === 0 ? (
                                      <rect x={-300} y={-100 + i * 40} width="12" height="12" fill="#9ca3af" stroke="#475569" strokeWidth="1" />
                                    ) : (
                                      <polygon points="-300,0 -290,10 -310,10" transform={`translate(0, ${-100 + i * 40})`} fill="#64748b" stroke="#475569" strokeWidth="1" />
                                    )}
                                 </g>
                               ))}
                             </g>
                           )}
                        </g>
                      </g>

                      {/* Outgoing Signal (Blue Curly Line) */}
                      {satOutgoingSignal && satOutgoingSignal.active && (
                        <g>
                          <path 
                            d={`M ${satOutgoingSignal.startX} ${satOutgoingSignal.startY} Q ${(satOutgoingSignal.startX + 200)/2 + 20} ${(satOutgoingSignal.startY + 200)/2 - 20} 200 200`}
                            fill="none"
                            stroke="#3b82f6" 
                            strokeWidth="3" 
                            strokeDasharray="5,5"
                            className="animate-signal-flow"
                          />
                          <circle cx="200" cy="200" r="65" stroke="#3b82f6" strokeWidth="2" fill="none" className="animate-ping" />
                        </g>
                      )}
                    </svg>
                    
                    {/* Center Info Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center bg-black/50 backdrop-blur-sm p-2 rounded-lg">
                        <span className={`text-2xl font-black block ${satBattery < 20 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{Math.round(satBattery)}%</span>
                        <span className="text-[8px] text-slate-400 uppercase tracking-widest">BATTERY</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 w-full max-w-xl">
                      <div className="flex justify-between text-[10px] uppercase mb-2">
                          <span>Displacement</span>
                          <span>{Math.round(satDistance)} / {SAT_TARGET_DISTANCE} KM (PHASE {satMissionLevel}/3)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-900 rounded-full border border-slate-800 overflow-hidden">
                          <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${Math.min(100, (satDistance / SAT_TARGET_DISTANCE) * 100)}%` }} />
                      </div>
                  </div>
              </div>

              <footer className="bg-cyan-950/20 border border-cyan-900/50 p-4 rounded text-center">
                  <p className="text-[10px] text-cyan-300 uppercase tracking-widest">
                    Eng Data: I = P/V | Signal Marks: {satScore} | Data Loss: {satMissedSignals}/{satMissionLevel === 1 ? 5 : 10}
                  </p>
              </footer>
            </section>
          </div>
        )}

        {view === 'electromagnetism' && (
          <div className="max-w-5xl mx-auto animate-in fade-in">
            
            {/* SUB-MENU */}
            {magSubView === 'menu' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div onClick={() => setMagSubView('transformer')} className="p-12 rounded-3xl border border-green-500/40 bg-black/60 hover:bg-green-900/20 cursor-pointer transition-all text-center group">
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">⚡</div>
                  <h3 className="text-2xl font-black text-green-400">Transformer Calculator</h3>
                  <p className="text-slate-400 mt-2">Calculate Voltage and Turns ratio for Step-up/Step-down transformers.</p>
                </div>
                <div onClick={() => setMagSubView('lefthand')} className="p-12 rounded-3xl border border-blue-500/40 bg-black/60 hover:bg-blue-900/20 cursor-pointer transition-all text-center group">
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">✋</div>
                  <h3 className="text-2xl font-black text-blue-400">Fleming's Hand Rules</h3>
                  <p className="text-slate-400 mt-2">Interactive simulation of Motor (Left) and Generator (Right) rules.</p>
                </div>
                <div onClick={() => setMagSubView('grip')} className="p-12 rounded-3xl border border-orange-500/40 bg-black/60 hover:bg-orange-900/20 cursor-pointer transition-all text-center group">
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">✊</div>
                  <h3 className="text-2xl font-black text-orange-400">Right Hand Grip Rule</h3>
                  <p className="text-slate-400 mt-2">Visualize magnetic field direction around a current-carrying wire.</p>
                </div>
                <div onClick={() => setMagSubView('faraday')} className="p-12 rounded-3xl border border-pink-500/40 bg-black/60 hover:bg-pink-900/20 cursor-pointer transition-all text-center group">
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">🧲</div>
                  <h3 className="text-2xl font-black text-pink-400">Faraday & Lenz's Law</h3>
                  <p className="text-slate-400 mt-2">Experiment with electromagnetic induction and opposing forces.</p>
                </div>
              </div>
            )}

            {/* TRANSFORMER CALCULATOR */}
            {magSubView === 'transformer' && (
              <div className="flex flex-col gap-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* LEFT: CALCULATOR */}
                <div className="flex-1 bg-white text-slate-900 p-8 rounded-3xl shadow-2xl">
                  <h2 className="text-2xl font-black text-slate-800 mb-6 border-b pb-4">Transformer Calculator</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Primary Voltage, Vp (V)</label>
                      <input type="number" value={transVp} onChange={(e)=>setTransVp(e.target.value)} placeholder="e.g. 240" className="w-full p-3 bg-slate-100 rounded-lg border border-slate-300 focus:border-blue-500 outline-none font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Secondary Voltage, Vs (V)</label>
                      <input type="number" value={transVs} onChange={(e)=>setTransVs(e.target.value)} placeholder="e.g. 120" className="w-full p-3 bg-slate-100 rounded-lg border border-slate-300 focus:border-blue-500 outline-none font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Primary Turns, Np</label>
                      <input type="number" value={transNp} onChange={(e)=>setTransNp(e.target.value)} placeholder="e.g. 1000" className="w-full p-3 bg-slate-100 rounded-lg border border-slate-300 focus:border-blue-500 outline-none font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Secondary Turns, Ns</label>
                      <input type="number" value={transNs} onChange={(e)=>setTransNs(e.target.value)} placeholder="e.g. 500" className="w-full p-3 bg-slate-100 rounded-lg border border-slate-300 focus:border-blue-500 outline-none font-mono" />
                    </div>
                  </div>

                  <button onClick={calculateTransformer} className="w-full mt-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg">
                    Calculate
                  </button>

                  {transResult && (
                    <div className="mt-6 p-4 bg-blue-50 text-blue-900 rounded-xl font-bold text-center border border-blue-100">
                      {transResult}
                    </div>
                  )}
                </div>

                {/* RIGHT: DIAGRAM */}
                <div className="flex-[1.5] bg-slate-900 p-8 rounded-3xl border border-slate-800 flex flex-col items-center min-h-[550px] justify-center">
                  <div className="bg-green-600 text-white px-6 py-2 rounded-full font-bold mb-8 shadow-lg shadow-green-900/50">
                    {transType}
                  </div>
                  
                  <div className="w-full aspect-square bg-black/50 rounded-2xl border border-slate-800 p-8 flex items-center justify-center relative overflow-hidden">
                    {/* Dynamic Transformer SVG */}
                    <svg viewBox="0 0 300 300" className="w-full h-full">
                      {/* Core */}
                      <rect x="80" y="50" width="140" height="200" rx="10" fill="none" stroke="#475569" strokeWidth="20" />
                      
                      {/* Primary Coil (Left) */}
                      <g>
                        <text x="40" y="40" fill="#ef4444" fontSize="12" fontWeight="bold">Primary (Np)</text>
                        {[...Array(transType === 'Step-down Transformer' ? 12 : 6)].map((_, i) => (
                          <path key={`p-${i}`} d={`M 60 ${70 + i * 15} C 40 ${70 + i * 15}, 40 ${80 + i * 15}, 60 ${80 + i * 15}`} fill="none" stroke="#ef4444" strokeWidth="3" />
                        ))}
                        <line x1="60" y1="70" x2="60" y2="40" stroke="#ef4444" strokeWidth="3" />
                        <line x1="60" y1={transType === 'Step-down Transformer' ? 245 : 155} x2="60" y2="260" stroke="#ef4444" strokeWidth="3" />
                      </g>

                      {/* Secondary Coil (Right) */}
                      <g>
                        <text x="200" y="40" fill="#3b82f6" fontSize="12" fontWeight="bold">Secondary (Ns)</text>
                        {[...Array(transType === 'Step-up Transformer' ? 12 : 6)].map((_, i) => (
                          <path key={`s-${i}`} d={`M 240 ${70 + i * 15} C 260 ${70 + i * 15}, 260 ${80 + i * 15}, 240 ${80 + i * 15}`} fill="none" stroke="#3b82f6" strokeWidth="3" />
                        ))}
                        <line x1="240" y1="70" x2="240" y2="40" stroke="#3b82f6" strokeWidth="3" />
                        <line x1="240" y1={transType === 'Step-up Transformer' ? 245 : 155} x2="240" y2="260" stroke="#3b82f6" strokeWidth="3" />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
              
              <MagTheory title="Theory: Transformer Principle">
                <p>A transformer changes the voltage of an alternating current (AC) supply. It consists of two coils (primary and secondary) wrapped around a soft iron core.</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li><strong className="text-white">Turns Ratio Equation:</strong> <span className="font-mono text-green-400">Vp / Vs = Np / Ns</span>. The ratio of voltages equals the ratio of turns.</li>
                  <li><strong className="text-white">Step-up Transformer:</strong> Increases voltage (Ns &gt; Np). Used in power transmission lines.</li>
                  <li><strong className="text-white">Step-down Transformer:</strong> Decreases voltage (Np &gt; Ns). Used in phone chargers and home appliances.</li>
                  <li><strong className="text-white">Ideal Power:</strong> Assuming 100% efficiency, Input Power = Output Power (<span className="font-mono text-green-400">Vp × Ip = Vs × Is</span>).</li>
                </ul>
              </MagTheory>
              </div>
            )}

            {/* LEFT HAND RULE SIMULATION */}
            {magSubView === 'lefthand' && (
              <div className="flex flex-col gap-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* CONTROLS */}
                <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 h-fit">
                  <h2 className="text-2xl font-black text-blue-400 mb-6">Simulation Controls</h2>
                  
                  {/* MODE TOGGLE */}
                  <div className="flex bg-slate-800 p-1 rounded-xl mb-6">
                    <button onClick={() => setHandRuleMode('left')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${handRuleMode === 'left' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>LEFT HAND (MOTOR)</button>
                    <button onClick={() => setHandRuleMode('right')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${handRuleMode === 'right' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>RIGHT HAND (GENERATOR)</button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Magnetic Field (B)</label>
                      <div className="flex gap-2">
                        <button onClick={() => setLhrB('N-S')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${lhrB === 'N-S' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>N ➔ S (Right)</button>
                        <button onClick={() => setLhrB('S-N')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${lhrB === 'S-N' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>S ➔ N (Left)</button>
                      </div>
                    </div>

                    {handRuleMode === 'left' ? (
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Current Direction (I)</label>
                        <div className="flex gap-2">
                          <button onClick={() => setLhrI('in')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${lhrI === 'in' ? 'bg-yellow-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Into Page (⊗)</button>
                          <button onClick={() => setLhrI('out')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${lhrI === 'out' ? 'bg-yellow-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Out of Page (⊙)</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Motion / Thrust (F)</label>
                        <div className="flex gap-2">
                          <button onClick={() => setLhrMotion('up')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${lhrMotion === 'up' ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400'}`}>UP ↑</button>
                          <button onClick={() => setLhrMotion('down')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${lhrMotion === 'down' ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400'}`}>DOWN ↓</button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 p-4 bg-slate-800 rounded-xl border border-slate-700">
                    {handRuleMode === 'left' ? (
                      <>
                        <h3 className="text-white font-bold mb-2">Resulting Force (F)</h3>
                        <div className="text-3xl font-black text-green-400">
                          {(lhrB === 'N-S' && lhrI === 'in') || (lhrB === 'S-N' && lhrI === 'out') ? 'DOWN ↓' : 'UP ↑'}
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="text-white font-bold mb-2">Induced Current (I)</h3>
                        <div className="text-3xl font-black text-yellow-400">
                          {/* RHR Logic: N-S & Up -> In | N-S & Down -> Out | S-N & Up -> Out | S-N & Down -> In */}
                          {((lhrB === 'N-S' && lhrMotion === 'up') || (lhrB === 'S-N' && lhrMotion === 'down')) ? 'INTO PAGE (⊗)' : 'OUT OF PAGE (⊙)'}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* VISUALIZER */}
                <div className="lg:col-span-2 bg-black rounded-3xl border border-slate-800 relative overflow-hidden flex items-center justify-center min-h-[550px]">
                  <svg viewBox="0 0 400 300" className="w-full h-full">
                    <defs>
                      <marker id="arrowHead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L9,3 z" fill="#60a5fa" />
                      </marker>
                    </defs>

                    {/* Magnets */}
                    <rect x="20" y="50" width="60" height="200" fill={lhrB === 'N-S' ? '#ef4444' : '#3b82f6'} />
                    <text x="50" y="155" fill="white" fontSize="24" fontWeight="bold" textAnchor="middle">{lhrB === 'N-S' ? 'N' : 'S'}</text>
                    
                    <rect x="320" y="50" width="60" height="200" fill={lhrB === 'N-S' ? '#3b82f6' : '#ef4444'} />
                    <text x="350" y="155" fill="white" fontSize="24" fontWeight="bold" textAnchor="middle">{lhrB === 'N-S' ? 'S' : 'N'}</text>

                    {/* Field Lines */}
                    {[80, 120, 160, 200, 240].map(y => (
                      <line key={y} x1="90" y1={y} x2="310" y2={y} stroke="#60a5fa" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowHead)" transform={lhrB === 'S-N' ? `rotate(180, 200, ${y})` : ''} opacity="0.5" className="animate-gravity-flow" />
                    ))}

                    {/* Wire & Current */}
                    <circle cx="200" cy="150" r="30" fill="#fbbf24" stroke="#d97706" strokeWidth="4" />
                    {/* Determine Current Direction to Display */}
                    {(() => {
                      const displayCurrent = handRuleMode === 'left' ? lhrI : ((lhrB === 'N-S' && lhrMotion === 'up') || (lhrB === 'S-N' && lhrMotion === 'down') ? 'in' : 'out');
                      return displayCurrent === 'in' ? (
                      <path d="M 185 135 L 215 165 M 215 135 L 185 165" stroke="#78350f" strokeWidth="4" />
                    ) : (
                      <circle cx="200" cy="150" r="8" fill="#78350f" />
                    );
                    })()}

                    {/* Force/Motion Vector */}
                    <g className="transition-all duration-500" transform={`translate(200, 150) ${(handRuleMode === 'left' ? ((lhrB === 'N-S' && lhrI === 'in') || (lhrB === 'S-N' && lhrI === 'out')) : (lhrMotion === 'down')) ? '' : 'rotate(180)'}`}>
                      <line x1="0" y1="40" x2="0" y2="120" stroke="#4ade80" strokeWidth="8" markerEnd="url(#arrowHead)" />
                      <text x="15" y="100" fill="#4ade80" fontSize="20" fontWeight="bold">{handRuleMode === 'left' ? 'FORCE (F)' : 'MOTION (M)'}</text>
                    </g>
                  </svg>
                </div>
              </div>

              <MagTheory title="Theory: Fleming's Hand Rules">
                <p>These rules help determine the direction of motion or induced current in electromagnetic systems.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30">
                    <strong className="text-blue-400 block mb-1">Left Hand Rule (Motors)</strong>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-300">
                      <li>Used when <b>Current</b> + <b>Field</b> creates <b>Motion</b>.</li>
                      <li><b>Thumb:</b> Force / Motion (Thrust)</li>
                      <li><b>First Finger:</b> Magnetic Field (N to S)</li>
                      <li><b>Second Finger:</b> Current (+ to -)</li>
                    </ul>
                  </div>
                  <div className="bg-emerald-900/20 p-3 rounded border border-emerald-500/30">
                    <strong className="text-emerald-400 block mb-1">Right Hand Rule (Generators)</strong>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-300">
                      <li>Used when <b>Motion</b> + <b>Field</b> creates <b>Current</b>.</li>
                      <li><b>Thumb:</b> Motion (Force applied)</li>
                      <li><b>First Finger:</b> Magnetic Field (N to S)</li>
                      <li><b>Second Finger:</b> Induced Current</li>
                    </ul>
                  </div>
                </div>
              </MagTheory>
              </div>
            )}

            {/* RIGHT HAND GRIP RULE */}
            {magSubView === 'grip' && (
              <div className="flex flex-col gap-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* CONTROLS */}
                <div className="flex-1 bg-slate-900 p-8 rounded-3xl border border-slate-800 h-fit">
                  <h2 className="text-2xl font-black text-orange-400 mb-6">Simulation Controls</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Current Direction (I)</label>
                      <div className="flex gap-2">
                        <button onClick={() => setRhgI('up')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${rhgI === 'up' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400'}`}>UP ↑</button>
                        <button onClick={() => setRhgI('down')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${rhgI === 'down' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400'}`}>DOWN ↓</button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-slate-800 rounded-xl border border-slate-700">
                    <h3 className="text-white font-bold mb-2">Magnetic Field (B)</h3>
                    <div className="text-xl font-bold text-blue-400">
                      {rhgI === 'up' ? 'COUNTER-CLOCKWISE ↺' : 'CLOCKWISE ↻'}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Viewed from above the wire.</p>
                  </div>
                </div>

                {/* VISUALIZER */}
                <div className="flex-[2] bg-black rounded-3xl border border-slate-800 relative overflow-hidden flex items-center justify-center min-h-[550px]">
                  <svg viewBox="0 0 400 400" className="w-full h-full">
                    <defs>
                      <marker id="arrowHead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L9,3 z" fill="#fbbf24" />
                      </marker>
                      <marker id="blueArrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L9,3 z" fill="#60a5fa" />
                      </marker>
                    </defs>

                    {/* Wire */}
                    <line x1="200" y1="20" x2="200" y2="380" stroke="#475569" strokeWidth="12" strokeLinecap="round" />
                    
                    {/* Animated Current Flow */}
                    <line 
                      x1="200" y1={rhgI === 'up' ? 380 : 20} 
                      x2="200" y2={rhgI === 'up' ? 20 : 380} 
                      stroke="#fbbf24" 
                      strokeWidth="2" 
                      strokeDasharray="10,20" 
                      className="animate-gravity-flow"
                      opacity="0.8"
                    />
                    
                    {/* Current Vector (Thumb) */}
                    <line 
                      x1="200" y1={rhgI === 'up' ? 280 : 120} 
                      x2="200" y2={rhgI === 'up' ? 120 : 280} 
                      stroke="#fbbf24" strokeWidth="6" markerEnd="url(#arrowHead)" 
                      className="transition-all duration-500"
                    />
                    <text x="220" y="200" fill="#fbbf24" fontSize="20" fontWeight="bold">I</text>

                    {/* Magnetic Field Loops (Fingers) */}
                    {[100, 200, 300].map((y, i) => (
                      <g key={i} className="transition-all duration-500">
                        {/* Back of loop */}
                        <path 
                          d={`M 120 ${y} A 80 20 0 0 1 280 ${y}`} 
                          fill="none" 
                          stroke="#3b82f6" 
                          strokeWidth="2" 
                          strokeDasharray="5,5" 
                          opacity="0.5" 
                          className="animate-gravity-flow"
                          style={{ animationDirection: rhgI === 'up' ? 'normal' : 'reverse' }}
                        />
                        {/* Front of loop */}
                        <path 
                          d={`M 280 ${y} A 80 20 0 0 1 120 ${y}`} 
                          fill="none" 
                          stroke="#3b82f6" 
                          strokeWidth="3" 
                          strokeDasharray="5,5"
                          className="animate-gravity-flow"
                          style={{ animationDirection: rhgI === 'up' ? 'normal' : 'reverse' }}
                        />
                        {/* Direction Arrows on Front Loop */}
                        <path 
                          d={rhgI === 'up' ? `M 210 ${y+20} A 80 20 0 0 1 190 ${y+20}` : `M 190 ${y+20} A 80 20 0 0 0 210 ${y+20}`}
                          fill="none" stroke="#60a5fa" strokeWidth="3" markerEnd="url(#blueArrow)"
                        />
                      </g>
                    ))}
                    
                    <text x="300" y="100" fill="#60a5fa" fontSize="16" fontWeight="bold">B Field</text>
                  </svg>
                </div>
              </div>

              <MagTheory title="Theory: Right Hand Grip Rule">
                <p>This rule predicts the direction of the magnetic field created by a current flowing through a wire.</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Imagine gripping the wire with your <strong>Right Hand</strong>.</li>
                  <li>Point your <strong>Thumb</strong> in the direction of the conventional current (Positive to Negative).</li>
                  <li>Your <strong>Curled Fingers</strong> point in the direction of the magnetic field lines circling the wire.</li>
                </ul>
                <p className="mt-2 italic text-slate-400">Note: If current flows UP, field is Counter-Clockwise. If current flows DOWN, field is Clockwise.</p>
              </MagTheory>
              </div>
            )}

            {/* FARADAY'S LAW & LENZ'S LAW */}
            {magSubView === 'faraday' && (
              <div className="flex flex-col gap-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* CONTROLS */}
                <div className="flex-1 bg-slate-900 p-8 rounded-3xl border border-slate-800 h-fit">
                  <h2 className="text-2xl font-black text-pink-400 mb-6">Experiment Controls</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Magnet Polarity (Facing Coil)</label>
                      <div className="flex gap-2">
                        <button onClick={() => setFaradayPole('N')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${faradayPole === 'N' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}>NORTH (N)</button>
                        <button onClick={() => setFaradayPole('S')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${faradayPole === 'S' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>SOUTH (S)</button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Motion</label>
                      <div className="flex gap-2">
                        <button onClick={() => setFaradayMove('in')} disabled={faradayPos >= 90} className="flex-1 py-4 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700">
                          INSERT MAGNET ➡
                        </button>
                        <button onClick={() => setFaradayMove('out')} disabled={faradayPos <= 0} className="flex-1 py-4 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700">
                          ⬅ WITHDRAW MAGNET
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-slate-800 rounded-xl border border-slate-700">
                    <h3 className="text-white font-bold mb-2">Lenz's Law Status</h3>
                    {faradayMove === 'idle' ? (
                      <p className="text-slate-500 italic">No motion = No induced current.</p>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Motion:</span>
                          <span className="font-bold text-white">{faradayMove === 'in' ? 'Approaching' : 'Receding'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Coil Face Becomes:</span>
                          <span className={`font-bold ${faradayMove === 'in' ? (faradayPole === 'N' ? 'text-red-400' : 'text-blue-400') : (faradayPole === 'N' ? 'text-blue-400' : 'text-red-400')}`}>
                            {/* Lenz Logic: In+N->N(Repel), In+S->S(Repel), Out+N->S(Attract), Out+S->N(Attract) */}
                            {faradayMove === 'in' ? faradayPole : (faradayPole === 'N' ? 'S' : 'N')}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Force:</span>
                          <span className="font-bold text-yellow-400">{faradayMove === 'in' ? 'REPULSION (Opposes Motion)' : 'ATTRACTION (Opposes Motion)'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* VISUALIZER */}
                <div className="flex-[2] bg-black rounded-3xl border border-slate-800 relative overflow-hidden flex items-center justify-center min-h-[550px]">
                  <svg viewBox="0 0 500 300" className="w-full h-full">
                    <defs>
                      <linearGradient id="coilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#b45309" />
                        <stop offset="50%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#b45309" />
                      </linearGradient>
                    </defs>

                    {/* Galvanometer */}
                    <g transform="translate(250, 50)">
                      <circle cx="0" cy="0" r="40" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                      <path d="M -30 0 A 30 30 0 0 1 30 0" fill="none" stroke="#475569" strokeWidth="2" />
                      <text x="0" y="-15" fill="#94a3b8" fontSize="10" textAnchor="middle">GALVANOMETER</text>
                      <text x="0" y="25" fill="#94a3b8" fontSize="10" textAnchor="middle">0</text>
                      {/* Needle */}
                      <line x1="0" y1="10" x2="0" y2="-30" stroke="#ef4444" strokeWidth="2" 
                        transform={`rotate(${faradayMove === 'idle' ? 0 : (faradayMove === 'in' ? (faradayPole === 'N' ? 45 : -45) : (faradayPole === 'N' ? -45 : 45))})`} 
                        className="transition-transform duration-300"
                      />
                    </g>

                    {/* Solenoid / Coil */}
                    <g transform="translate(300, 150)">
                      {/* Back of loops */}
                      {[0, 20, 40, 60, 80, 100].map(x => (
                        <ellipse key={`b${x}`} cx={x} cy="0" rx="15" ry="40" fill="none" stroke="url(#coilGrad)" strokeWidth="4" opacity="0.5" />
                      ))}
                      {/* Connection to Galvanometer */}
                      <path d="M 0 -40 L 0 -80 L -50 -80" fill="none" stroke="#fbbf24" strokeWidth="2" />
                      <path d="M 100 -40 L 100 -80 L -50 -80" fill="none" stroke="#fbbf24" strokeWidth="2" />
                    </g>

                    {/* Magnet */}
                    <g transform={`translate(${50 + faradayPos * 2}, 150)`}>
                      <rect x="0" y="-25" width="100" height="50" fill={faradayPole === 'N' ? '#ef4444' : '#3b82f6'} />
                      <rect x="100" y="-25" width="100" height="50" fill={faradayPole === 'N' ? '#3b82f6' : '#ef4444'} />
                      <text x="50" y="5" fill="white" fontSize="20" fontWeight="bold" textAnchor="middle">{faradayPole}</text>
                      <text x="150" y="5" fill="white" fontSize="20" fontWeight="bold" textAnchor="middle">{faradayPole === 'N' ? 'S' : 'N'}</text>
                    </g>

                    {/* Front of Coil Loops (drawn after magnet so magnet appears inside) */}
                    <g transform="translate(300, 150)">
                      {[0, 20, 40, 60, 80, 100].map(x => (
                        <path key={`f${x}`} d={`M ${x} -40 A 15 40 0 0 0 ${x} 40`} fill="none" stroke="url(#coilGrad)" strokeWidth="4" />
                      ))}
                    </g>
                  </svg>
                </div>
              </div>

              <MagTheory title="Theory: Electromagnetic Induction">
                <p>Moving a magnet near a coil changes the magnetic flux passing through the coil, inducing an Electromotive Force (EMF) or voltage.</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li><strong className="text-white">Faraday's Law:</strong> The magnitude of induced EMF is proportional to the rate of change of magnetic flux. Faster motion = Higher Voltage.</li>
                  <li><strong className="text-white">Lenz's Law:</strong> The direction of the induced current always opposes the change that produced it.</li>
                </ul>
                <div className="mt-3 bg-pink-900/20 p-3 rounded border border-pink-500/30 text-xs">
                  <strong>Example:</strong> Pushing a North pole INTO a coil induces a North pole on the coil's face to repel the magnet (Resistance to motion). Pulling it OUT induces a South pole to attract it back.
                </div>
              </MagTheory>
              </div>
            )}
          </div>
        )}

        {view === 'theory-levels' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-5">
            <div onClick={() => setView('advanced-sim')} className="p-12 rounded-3xl border border-yellow-400 bg-black/80 text-center hover:scale-105 cursor-pointer transition-all">
               <h3 className="text-3xl font-black text-yellow-400 mb-4">Simple Circuit</h3>
            </div>
            <div onClick={() => setView('simple-sim')} className="p-12 rounded-3xl border border-purple-400 bg-black/80 text-center hover:scale-105 cursor-pointer transition-all">
               <h3 className="text-3xl font-black text-purple-400 mb-4">Advanced Theory</h3>
            </div>
          </div>
        )}

        {/* 3. SIMPLE CIRCUIT SIMULATION */}
        {view === 'simple-sim' && (
          <div className="space-y-8 animate-in zoom-in-95 duration-500 pb-20">
            {/* KVL SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-black/80 p-8 rounded-3xl border border-yellow-500/50">
                <h4 className="text-xl font-bold text-yellow-400 mb-6 uppercase">1. KVL: Closed Loop Potential</h4>
                <div className="bg-black border border-slate-800 rounded-xl p-6">
                  <svg viewBox="0 0 500 250" className="w-full">
                    <rect x="50" y="50" width="400" height="150" stroke="#444" strokeWidth="3" fill="none" strokeDasharray="8,4"/>
                    <rect x="180" y="40" width="60" height="20" fill="#222" stroke="#00d4ff" strokeWidth="2"/>
                    <rect x="340" y="40" width="60" height="20" fill="#222" stroke="#39ff14" strokeWidth="2"/>
                    <circle r="7" fill="#ffcc00">
                      <animateMotion dur={`${sLoop}s`} repeatCount="indefinite" path="M 50 50 L 450 50 L 450 200 L 50 200 Z"/>
                    </circle>
                    <text x="60" y="35" fill="#ffcc00" fontSize="16" fontWeight="bold">Vs: {kvlV}V</text>
                    <text x="185" y="35" fill="#00d4ff" fontSize="12">R1: -{v1.toFixed(1)}V</text>
                    <text x="345" y="35" fill="#39ff14" fontSize="12">R2: -{v2.toFixed(1)}V</text>
                  </svg>
                </div>
                <div className="mt-8 grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-slate-300 font-bold block mb-1 uppercase">Source (V)</label>
                    <input type="number" value={kvlV} onChange={(e)=>setKvlV(Number(e.target.value))} className="w-full bg-slate-900 p-2 rounded border border-slate-700" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-bold block mb-1 uppercase">R1 (Ω)</label>
                    <input type="number" value={kvlR1} onChange={(e)=>setKvlR1(Number(e.target.value))} className="w-full bg-slate-900 p-2 rounded border border-slate-700" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-bold block mb-1 uppercase">R2 (Ω)</label>
                    <input type="number" value={kvlR2} onChange={(e)=>setKvlR2(Number(e.target.value))} className="w-full bg-slate-900 p-2 rounded border border-slate-700" />
                  </div>
                </div>
              </div>

              <div className="bg-black/80 p-8 rounded-3xl border border-yellow-500/50">
                <h4 className="text-xl font-bold text-yellow-400 mb-4">Energy Conservation</h4>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-cyan-400 font-mono mb-4 text-center">Σ V_loop = 0</div>
                <div className="p-4 bg-black border border-slate-700 rounded-lg space-y-2">
                  <div className="flex justify-between text-yellow-400"><span>Source:</span><span>{kvlV}V</span></div>
                  <div className="flex justify-between text-red-500"><span>Total Loss:</span><span>-{(v1+v2).toFixed(1)}V</span></div>
                  <hr className="border-slate-800" />
                  <div className="flex justify-between text-emerald-400 font-black"><span>Net Energy:</span><span>0.0V</span></div>
                </div>
              </div>
            </div>

            {/* KCL & POWER LAW SECTION */}
            <div className="bg-black/80 p-8 rounded-3xl border border-cyan-500/50 lg:col-span-3">
              <h4 className="text-xl font-bold text-cyan-400 mb-6 uppercase tracking-wider">2. KCL: Resistor Junction</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-slate-950 rounded-xl p-6 border border-slate-800 relative">
                  <svg viewBox="0 0 400 200" className="w-full">
                    {/* Wires */}
                    <line x1="20" y1="100" x2="200" y2="100" stroke="#333" strokeWidth="4" />
                    <line x1="200" y1="100" x2="350" y2="50" stroke="#333" strokeWidth="4" />
                    <line x1="200" y1="100" x2="350" y2="150" stroke="#333" strokeWidth="4" />
                    
                    {/* Animated Current (Left to Right) */}
                    <circle r="4" fill="#00d4ff">
                      <animateMotion dur="2s" repeatCount="indefinite" path="M 20 100 L 180 100" />
                    </circle>
                    <circle r="3" fill="#ff4b4b">
                      <animateMotion dur="1s" repeatCount="indefinite" path="M 200 100 L 350 50" />
                    </circle>
                    <circle r="3" fill="#ff4b4b">
                      <animateMotion dur="1.5s" repeatCount="indefinite" path="M 200 100 L 350 150" />
                    </circle>

                    {/* Resistor Symbols (Visual placeholders) */}
                    <defs>
                      <pattern id="stripes" x="0" y="0" width="4" height="20" patternUnits="userSpaceOnUse">
                        <rect x="0" y="0" width="2" height="20" fill="#fff" />
                        <rect x="2" y="0" width="2" height="20" fill="#333" />
                      </pattern>
                    </defs>
                    <rect x="80" y="90" width="30" height="20" fill="url(#stripes)" rx="2" stroke="#333" strokeWidth="1" />
                    <rect x="250" y="65" width="30" height="20" fill="url(#stripes)" rx="2" stroke="#333" strokeWidth="1" transform="rotate(-20, 275, 70)" />
                    <rect x="250" y="125" width="30" height="20" fill="url(#stripes)" rx="2" stroke="#333" strokeWidth="1" transform="rotate(20, 300, 130)" />
                  </svg>
                  
                  <div className="flex gap-4 mt-4">
                    <div className="flex-1">
                      <label className="text-[10px] text-cyan-500">R_IN (Ω)</label>
                      <input type="number" value={kclR_in} onChange={(e)=>setKclR_in(Number(e.target.value))} className="w-full bg-slate-900 p-1 rounded text-xs" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-red-400">R_OUT1 (Ω)</label>
                      <input type="number" value={kclR_out1} onChange={(e)=>setKclR_out1(Number(e.target.value))} className="w-full bg-slate-900 p-1 rounded text-xs" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-red-400">R_OUT2 (Ω)</label>
                      <input type="number" value={kclR_out2} onChange={(e)=>setKclR_out2(Number(e.target.value))} className="w-full bg-slate-900 p-1 rounded text-xs" />
                    </div>
                  </div>
                </div>

                {/* DATA TABLE */}
                <div className="bg-black border border-slate-800 rounded-xl p-4">
                  <h5 className="text-xs font-bold text-slate-400 mb-4 uppercase">Current Registry</h5>
                  <table className="w-full text-left text-xs">
                    <thead><tr className="border-b border-slate-800 text-slate-300"><th>Wire</th><th>Amps</th></tr></thead>
                    <tbody className="font-mono">
                      <tr><td className="py-2">Input</td><td className="text-cyan-400">{iSeries.toFixed(2)}A</td></tr>
                      <tr><td className="py-2">Branch 1</td><td className="text-red-400">{(iSeries * (kclR_out2 / (kclR_out1 + kclR_out2))).toFixed(2)}A</td></tr>
                      <tr><td className="py-2">Branch 2</td><td className="text-red-400">{(iSeries * (kclR_out1 / (kclR_out1 + kclR_out2))).toFixed(2)}A</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ELECTRONICS & SAFETY FUSE SIMULATION */}
            <div className="bg-black/80 p-2 rounded-3xl border border-emerald-500/50 space-y-2">
              <h4 className="text-xl font-bold text-emerald-400 mb-2 uppercase tracking-wider">3. Electronics and Safety Fuse Simulation </h4>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                
                {/* DEVICE VIEWPORT WITH THERMAL HEATMAP & WIRE CONNECTION */}
                <div className="lg:col-span-2 bg-slate-950 rounded-3xl p-4 border-2 border-dashed border-slate-800 relative min-h-[400px]">
                  {/* Red Glow Behind Device when Burnt */}
                  {(status === 'Device Burnt' || status === 'Fuse Burned - Cut Off') && selectedDevice && (
                    <div className="absolute top-36 right-[20%] transform -translate-x-1/2 w-40 h-40 bg-red-600 rounded-full blur-3xl pointer-events-none z-5 animate-glow-pulse" />
                  )}
                  {/* Smoking Animation - Positioned outside main content */}
                  {(status === 'Device Burnt' || status === 'Fuse Burned - Cut Off') && selectedDevice && (
                    <div className="absolute top-36 right-[20%] transform -translate-x-1/2 w-32 h-40 pointer-events-none z-50">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <g opacity="0.7">
                          <circle cx="50" cy="30" r="8" fill="#9ca3af" className="animate-smoke-1" />
                          <circle cx="40" cy="45" r="10" fill="#9ca3af" className="animate-smoke-2" />
                          <circle cx="60" cy="50" r="9" fill="#9ca3af" className="animate-smoke-3" />
                          <circle cx="50" cy="65" r="11" fill="#9ca3af" className="animate-smoke-4" />
                          <circle cx="35" cy="30" r="7" fill="#d1d5db" className="animate-smoke-5" />
                          <circle cx="65" cy="35" r="8" fill="#d1d5db" className="animate-smoke-6" />
                        </g>
                      </svg>
                    </div>
                  )}
                  
                  {selectedDevice ? (
                    <div className="w-full h-full flex flex-col items-center justify-between relative">
                      {/* SVG Wire Connection System */}
                      <svg viewBox="0 0 500 350" className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                        {/* Filter and Gradient Definitions */}
                        <defs>
                          <filter id="electronGlow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                            <feMerge>
                              <feMergeNode in="coloredBlur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                          <linearGradient id="wireGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.8" />
                            <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.8" />
                          </linearGradient>
                        </defs>

                        {/* Socket (Left side) */}
                        <g>
                          {/* Socket body */}
                          <rect x="10" y="140" width="60" height="100" rx="8" fill="#64748b" stroke="#475569" strokeWidth="2" />
                          {/* Positive hole */}
                          <circle cx="30" cy="170" r="6" fill="#1e293b" stroke="#fbbf24" strokeWidth="1" />
                          {/* Negative hole */}
                          <circle cx="50" cy="170" r="6" fill="#1e293b" stroke="#00d4ff" strokeWidth="1" />
                          {/* Earth hole */}
                          <circle cx="40" cy="210" r="4" fill="#1e293b" stroke="#10b981" strokeWidth="1" />
                        </g>

                        {/* Animated Wire/Cord */}
                        <g>
                          {/* Wire path - curved connection from socket to plug on right */}
                          <path 
                            d="M 70 190 Q 150 200 280 250" 
                            fill="none" 
                            stroke="#334155" 
                            strokeWidth="8"
                            strokeLinecap="round"
                          />
                          {/* Wire overlay with gradient */}
                          <path 
                            d="M 70 190 Q 150 200 280 250" 
                            fill="none" 
                            stroke="url(#wireGradient)" 
                            strokeWidth="4"
                            strokeLinecap="round"
                            opacity={simActive && status === 'Activated' ? 1 : 0.3}
                            className="transition-opacity duration-300"
                          />
                          
                          {/* Current flow animation circles - Electrons */}
                          {simActive && status === 'Activated' && (
                            <>
                              {/* Primary electron - Blue with glow */}
                              <circle r="6" fill="#00d4ff" opacity="0.9" filter="url(#electronGlow)">
                                <animateMotion dur="1.2s" repeatCount="indefinite" path="M 70 190 Q 150 200 280 250" />
                              </circle>
                              
                              {/* Secondary electrons - Yellow */}
                              <circle r="5" fill="#fbbf24" opacity="0.7" filter="url(#electronGlow)">
                                <animateMotion dur="1.4s" repeatCount="indefinite" path="M 70 190 Q 150 200 280 250" startOffset="0.3s" />
                              </circle>
                              <circle r="5" fill="#fbbf24" opacity="0.6">
                                <animateMotion dur="1.5s" repeatCount="indefinite" path="M 70 190 Q 150 200 280 250" startOffset="0.6s" />
                              </circle>
                              
                              {/* Tertiary electrons - Cyan */}
                              <circle r="4" fill="#00d4ff" opacity="0.5" filter="url(#electronGlow)">
                                <animateMotion dur="1.6s" repeatCount="indefinite" path="M 70 190 Q 150 200 280 250" startOffset="0.9s" />
                              </circle>
                              <circle r="4" fill="#06b6d4" opacity="0.4">
                                <animateMotion dur="1.7s" repeatCount="indefinite" path="M 70 190 Q 150 200 280 250" startOffset="1.2s" />
                              </circle>
                              
                              {/* Additional micro electrons for density */}
                              <circle r="2" fill="#00d4ff" opacity="0.6">
                                <animateMotion dur="1.3s" repeatCount="indefinite" path="M 70 190 Q 150 200 280 250" startOffset="0.15s" />
                              </circle>
                              <circle r="2" fill="#fbbf24" opacity="0.5">
                                <animateMotion dur="1.45s" repeatCount="indefinite" path="M 70 190 Q 150 200 280 250" startOffset="0.45s" />
                              </circle>
                            </>
                          )}
                        </g>

                        {/* Plug (Right side - attached to device) */}
                        <g>
                          {/* Plug body */}
                          <rect x="280" y="230" width="50" height="40" rx="4" fill="#475569" stroke="#334155" strokeWidth="2" />
                          {/* Positive pin */}
                          <rect x="290" y="235" width="5" height="15" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
                          {/* Negative pin */}
                          <rect x="305" y="235" width="5" height="15" fill="#00d4ff" stroke="#0891b2" strokeWidth="1" />
                        </g>

                      </svg>

                      {/* Device with thermal effects (positioned above plug) */}
                      <div className="relative z-10 flex flex-col items-center gap-0 mt-36 ml-36">
                        {/* Thermal Intensity - Above Bar */}
                        {simActive && status !== 'Fuse Burned - Cut Off' && (
                          <div className="text-[10px] font-mono text-slate-400 mb-2">
                            Thermal Intensity: {thermalIntensity.toFixed(0)}%
                          </div>
                        )}

                        {/* Thermal Bar - Above Device */}
                        <div className="h-2 w-32 bg-slate-900 rounded-full relative overflow-hidden border border-white/5 shadow-inner mb-3">
                          {/* Thermal Overlay Logic */}
                          {(() => {
                            let heatColor = '#1e293b';
                            if (simActive && status === 'Activated') {
                              if (thermalIntensity < 25) heatColor = '#00d4ff';
                              else if (thermalIntensity < 50) heatColor = '#fbbf24';
                              else if (thermalIntensity < 100) heatColor = '#f97316';
                              else heatColor = '#f97316';
                            } else if (status === 'Fuse Burned - Cut Off') {
                              heatColor = '#450a0a';
                            }

                            return (
                              <div 
                                className="absolute inset-0 transition-colors duration-1000" 
                                style={{ backgroundColor: heatColor }} 
                              >
                                {simActive && status === 'Activated' && (
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-heat-flow w-1/2" />
                                )}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Device Icon */}
                        <div className={`w-32 h-32 transition-all duration-500 ${
                            simActive && currentNeeded > (fuseInstalled ? fuseRating : 15) && status === 'Activated'
                            ? 'filter drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]' 
                            : 'filter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                          }`}>
                          {selectedDevice && devices[selectedDevice].svg}
                        </div>

                        {/* Dynamic Thermal Wire */}
                        <div className="flex flex-col items-center gap-2 w-full px-8">
                          {/* Thermal intensity moved above bar */}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-slate-600 font-black text-xl uppercase tracking-tighter">Select a device to test</p>
                    </div>
                  )}
                  
                  {/* Device Status - Bottom Right */}
                  {selectedDevice && (
                    <div className={`absolute bottom-4 right-4 flex justify-between text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg ${
                      (status === 'Device Burnt' || status === 'Fuse Burned - Cut Off') 
                        ? 'bg-red-900/50 text-red-400 border border-red-600' 
                        : 'text-slate-500'
                    }`}>
                      <span className="mr-4">Device Status: {status === 'Activated' ? 'Conducting' : 'Idle'}</span>
                    </div>
                  )}
                </div>

                {/* OPTIONS PANEL */}
                <div className="space-y-4 h-min">
                  <div className="flex items-center justify-between">
                    <h5 className="text-emerald-400 font-bold text-xs uppercase">Select Electronics</h5>
                    <p className="text-[10px] text-slate-400 italic">Click again to stop simulation</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(devices).map(([key, dev]) => (
                      <button 
                        key={key} 
                        onClick={() => {setSelectedDevice(key); setSimActive(false);}}
                        className={`p-3 rounded-xl border text-left transition-all ${selectedDevice === key ? 'border-emerald-500 bg-emerald-500/20' : 'border-slate-800 bg-slate-900/50 hover:border-slate-600'}`}
                      >
                        <div className="w-8 h-8 mb-2">{dev.svg}</div>
                        <span className="text-[10px] font-bold uppercase">{dev.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-800">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={fuseInstalled} onChange={(e)=>setFuseInstalled(e.target.checked)} className="w-5 h-5 accent-emerald-500" />
                      <span className="text-xs font-bold text-slate-300 group-hover:text-white">INSTALL SAFETY FUSE</span>
                    </label>
                    
                    <div className="mt-3 h-[80px]">
                      {fuseInstalled && (
                        <div className="p-3 bg-black rounded-lg border border-slate-800">
                          <label className="text-[10px] text-slate-400 font-bold block mb-1">FUSE RATING (AMPERES)</label>
                          <input type="range" min="1" max="100" value={fuseRating} onChange={(e)=>setFuseRating(Number(e.target.value))} className="w-full accent-emerald-400" />
                          <div className="text-right font-mono text-emerald-400 text-sm">{fuseRating}A</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* STATUS BLOCKS */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-black p-4 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-bold">CONSUMPTION</p>
                  <p className="text-xl font-black">{simActive && selectedDevice ? `${devices[selectedDevice].power.toLocaleString()}W` : '0W'}</p>
                </div>
                <div className="bg-black p-4 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-bold">SUPPLY VOLTAGE</p>
                  <input type="number" value={supplyVoltage} onChange={(e)=>setSupplyVoltage(Number(e.target.value))} className="bg-transparent text-xl font-black w-full" />
                </div>
                <div className="bg-black p-4 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-bold">LOAD CURRENT</p>
                  <p className="text-xl font-black text-cyan-400">{simActive ? `${currentNeeded.toFixed(2)}A` : '0.00A'}</p>
                </div>
                <div className={`p-4 rounded-xl border font-black flex flex-col justify-center ${
                  status === 'Activated' ? 'bg-emerald-900/50 border-emerald-500 text-emerald-200' : 'bg-slate-900 border-slate-700'
                }`}>
                  <p className="text-[10px] uppercase opacity-60">Status</p>
                  <p className="text-sm uppercase tracking-tighter">{status}</p>
                </div>
              </div>

              <button 
                onClick={() => setSimActive(true)}
                disabled={!selectedDevice}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-black font-black uppercase rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              >
                Start Simulation →
              </button>
            </div>
          </div>
        )}

        {/* 4. ADVANCED THEORIES */}
        {view === 'advanced-sim' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-black/80 p-8 rounded-3xl border border-purple-500/50">
              <h3 className="text-2xl font-black text-purple-400 mb-6">Visual Circuit Topology</h3>
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 overflow-hidden">
                <svg width="100%" height="350" viewBox="0 0 400 350">
                  {/* Short Circuit Glow Animation */}
                  {results?.isShort && (
                    <g>
                      <rect x="0" y="0" width="400" height="350" fill="url(#shortGlow)" className="animate-pulse" />
                      <defs>
                        <radialGradient id="shortGlow" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                    </g>
                  )}

                  <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                      <path d="M0,0 L10,5 L0,10" fill={flowType === 'current' ? '#ef4444' : '#3b82f6'} />
                    </marker>
                  </defs>

                  {/* --- STATIC WIRES --- */}
                  {/* Source & Left Vertical */}
                  <line x1="50" y1="280" x2="50" y2="50" stroke="#333" strokeWidth="4" />
                  {/* Source Symbol */}
                  <line x1="30" y1="165" x2="70" y2="165" stroke="white" strokeWidth="2" />
                  <line x1="20" y1="185" x2="80" y2="185" stroke="white" strokeWidth="4" />
                  
                  {/* Top Main Wire (Source to Split) */}
                  <line x1="50" y1="50" x2={circuitMode === 'series' ? "350" : "120"} y2="50" stroke="#333" strokeWidth="4" />
                  
                  {/* Bus Bars */}
                  {circuitMode !== 'series' && (
                    <>
                      <line x1="120" y1="50" x2="120" y2={getBranchY(branches.length - 1, branches.length)} stroke="#333" strokeWidth="4" />
                      <line x1="320" y1="50" x2="320" y2={getBranchY(branches.length - 1, branches.length)} stroke="#333" strokeWidth="4" />
                      <line x1="120" y1="50" x2="120" y2={getBranchY(branches.length - 1, branches.length)} stroke="#333" strokeWidth="6" />
                      <line x1="320" y1="50" x2="320" y2={getBranchY(branches.length - 1, branches.length)} stroke="#333" strokeWidth="6" />
                    </>
                  )}

                  {/* Return Wire (Join to Source) */}
                  <polyline points="320,50 350,50 350,280 50,280" fill="none" stroke="#333" strokeWidth="4" />

                  {/* --- DYNAMIC COMPONENTS --- */}
                  
                  {/* Main Bulbs */}
                  {circuitMode !== 'parallel' && mainBulbs.map((_, i) => {
                    const startX = 50;
                    const endX = circuitMode === 'series' ? 350 : 120;
                    const width = endX - startX;
                    const step = width / (mainBulbs.length + 1);
                    return (
                      <g key={`main-${i}`}>
                        <circle cx={startX + step * (i + 1)} cy="50" r="8" fill={switchOn && !results?.isShort ? "#fbbf24" : "#222"} stroke="#555" />
                        <text x={startX + step * (i + 1)} y="35" textAnchor="middle" fill="#666" fontSize="8">R{i+1}</text>
                      </g>
                    );
                  })}

                  {/* Branches */}
                  {circuitMode !== 'series' && branches.map((branch, bIdx) => {
                    const y = getBranchY(bIdx, branches.length);
                    return (
                      <g key={`branch-${bIdx}`}>
                        {/* Wire */}
                        <line x1="120" y1={y} x2="320" y2={y} stroke="#333" strokeWidth="4" />
                        {/* Bulbs */}
                        {branch.map((_, rIdx) => {
                          const xStep = 200 / (branch.length + 1);
                          return (
                            <circle 
                              key={`b${bIdx}-r${rIdx}`} 
                              cx={120 + xStep * (rIdx + 1)} 
                              cy={y} 
                              r="6" 
                              fill={switchOn && !results?.isShort ? "#fbbf24" : "#222"} 
                              stroke="#555"
                            />
                          );
                        })}
                      </g>
                    );
                  })}

                  {/* --- ANIMATIONS --- */}
                  {switchOn && (
                    <>
                      {circuitMode === 'series' ? (
                        <>
                          <path id="seriesLoop" d="M 50 280 L 50 50 L 350 50 L 350 280 L 50 280 Z" fill="none" />
                          <circle r="5" fill={flowType === 'current' ? '#ef4444' : '#3b82f6'}>
                            <animateMotion 
                              dur={`${Math.max(0.5, 5 / (Number(results?.totalCurrent) || 0.1))}s`} 
                              repeatCount="indefinite"
                              keyPoints={flowType === 'current' ? "0;1" : "1;0"} 
                              keyTimes="0;1"
                            >
                              <mpath href="#seriesLoop" />
                            </animateMotion>
                          </circle>
                        </>
                      ) : (
                        branches.map((_, bIdx) => {
                          const y = getBranchY(bIdx, branches.length);
                          const current = results?.branchCurrents[bIdx] || 0;
                          if (current < 0.01) return null;
                          
                          const pathId = `branchPath-${bIdx}`;
                          // Path follows the grey wires: Source -> Main -> Bus Down -> Branch -> Bus Up -> Return -> Source
                          const d = `M 50 280 L 50 50 L 120 50 L 120 ${y} L 320 ${y} L 320 50 L 350 50 L 350 280 L 50 280 Z`;

                          return (
                            <g key={`anim-group-${bIdx}`}>
                              <path id={pathId} d={d} fill="none" />
                              <circle r="4" fill={flowType === 'current' ? '#ef4444' : '#3b82f6'} opacity="0.9">
                                <animateMotion 
                                  dur={`${Math.max(0.5, 15 / current)}s`} 
                                  repeatCount="indefinite"
                                  keyPoints={flowType === 'current' ? "0;1" : "1;0"}
                                  keyTimes="0;1"
                                >
                                  <mpath href={`#${pathId}`} />
                                </animateMotion>
                              </circle>
                              <circle r="3" fill={flowType === 'current' ? '#ef4444' : '#3b82f6'} opacity="0.6">
                                <animateMotion 
                                  dur={`${Math.max(0.5, 15 / current)}s`} 
                                  begin={`${Math.max(0.5, 15 / current) / 2}s`}
                                  repeatCount="indefinite"
                              keyPoints={flowType === 'current' ? "0;1" : "1;0"}
                              keyTimes="0;1"
                                >
                                  <mpath href={`#${pathId}`} />
                                </animateMotion>
                              </circle>
                            </g>
                          );
                        })
                      )}
                    </>
                  )}
                </svg>
              </div>
              {results?.isShort && (
                <div className="text-center mt-2 animate-bounce">
                  <p className="text-red-500 font-black text-xl uppercase tracking-widest">Short Circuit!</p>
                </div>
              )}
              <div className="mt-4 flex gap-4">
                <select onChange={(e)=>setFlowType(e.target.value)} className="bg-slate-900 text-xs p-2 rounded flex-1">
                  <option value="current">Conventional Current (Red)</option>
                  <option value="electron">Electron Flow (Blue)</option>
                </select>
                <button onClick={() => setSwitchOn(!switchOn)} className={`px-4 py-2 rounded font-bold text-xs ${switchOn ? 'bg-emerald-500' : 'bg-red-500'}`}>
                  Switch {switchOn ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            <div className="bg-black/80 p-8 rounded-3xl border border-purple-500/50 space-y-6">
              <h3 className="text-2xl font-black text-white">Simulation Controls</h3>
              <div className="grid grid-cols-2 gap-4">
                <select value={circuitMode} onChange={(e) => setCircuitMode(e.target.value)} className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-sm font-bold text-white">
                  <option value="series">Series Mode</option>
                  <option value="parallel">Parallel Mode</option>
                  <option value="mixed">Mixed Mode</option>
                </select>
                <input type="number" value={advV} onChange={(e)=>setAdvV(Number(e.target.value))} className="bg-slate-900 p-3 rounded-lg" placeholder="Voltage" />
              </div>
              
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                
                {/* MAIN CIRCUIT CONTROLS */}
                {circuitMode !== 'parallel' && (
                  <div className="bg-slate-900/30 p-4 rounded-xl border border-blue-500/30">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-blue-400 font-bold text-xs uppercase">Main Circuit (Series)</h4>
                      <button onClick={() => setMainBulbs([...mainBulbs, 10])} className="text-xs bg-blue-500/20 hover:bg-blue-500/40 px-2 py-1 rounded text-blue-300 transition-colors">
                        + Add Bulb
                      </button>
                    </div>
                    <div className="space-y-2">
                      {mainBulbs.map((r, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-bold w-6">R{i+1}</span>
                          <input type="number" value={r} onChange={(e) => {
                            const newB = [...mainBulbs]; newB[i] = Number(e.target.value); setMainBulbs(newB);
                          }} className="flex-1 bg-black border border-slate-700 rounded px-2 py-1 text-xs" />
                          <button onClick={() => setMainBulbs(mainBulbs.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-400">×</button>
                        </div>
                      ))}
                      {mainBulbs.length === 0 && <p className="text-[10px] text-slate-600 italic">No resistors in main loop</p>}
                    </div>
                  </div>
                )}

                {/* PARALLEL BRANCHES CONTROLS */}
                {circuitMode !== 'series' && (
                  <div className="bg-slate-900/30 p-4 rounded-xl border border-purple-500/30">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-purple-400 font-bold text-xs uppercase">Parallel Branches (Max 4)</h4>
                      <button 
                        onClick={() => branches.length < 4 && setBranches([...branches, [10]])} 
                        disabled={branches.length >= 4}
                        className="text-xs bg-purple-500/20 hover:bg-purple-500/40 disabled:opacity-50 px-2 py-1 rounded text-purple-300 transition-colors"
                      >
                        + Add Branch
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {branches.map((branch, bIdx) => (
                        <div key={bIdx} className="bg-black/40 p-2 rounded border border-slate-800">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] text-slate-300 font-bold">Branch {bIdx + 1}</span>
                            <div className="flex gap-2">
                              <button onClick={() => {
                                if (branch.length >= 4) return;
                                const newBranches = [...branches];
                                newBranches[bIdx] = [...branch, 10];
                                setBranches(newBranches);
                              }} className="text-[10px] text-emerald-400 hover:text-emerald-300">+ Bulb</button>
                              <button onClick={() => setBranches(branches.filter((_, i) => i !== bIdx))} className="text-[10px] text-red-400 hover:text-red-300">Remove</button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {branch.map((r, rIdx) => (
                              <div key={rIdx} className="flex items-center gap-1">
                                <input 
                                  type="number" 
                                  value={r} 
                                  onChange={(e) => {
                                    const newBranches = [...branches];
                                    newBranches[bIdx] = [...newBranches[bIdx]];
                                    newBranches[bIdx][rIdx] = Number(e.target.value);
                                    setBranches(newBranches);
                                  }}
                                  className="w-full bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-[10px]" 
                                />
                                <button onClick={() => {
                                  const newBranches = [...branches];
                                  newBranches[bIdx] = branch.filter((_, i) => i !== rIdx);
                                  setBranches(newBranches);
                                }} className="text-red-500 text-xs">×</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-purple-500/10 rounded-2xl border border-purple-500/30">
                {results ? (
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div><p className="text-[10px] text-slate-400 font-bold">RESISTANCE</p><p className="text-2xl font-black">{results.totalResistance} Ω</p></div>
                    <div><p className="text-[10px] text-slate-400 font-bold">TOTAL CURRENT</p><p className="text-2xl font-black text-emerald-400">{results.totalCurrent} A</p></div>
                  </div>
                ) : <p className="text-center text-slate-500 py-4 italic">Switch is OFF</p>}
              </div>
            </div>
          </div>
        )}

        {/* 5. BACK NAVIGATION */}
        {view !== 'home' && (
          <div className="flex justify-center mt-12 pb-20">
            <button 
              onClick={() => {
                if(view === 'sim-menu') setView('home');
                else if(view === 'theory-levels') setView('sim-menu');
                else if(view === 'scenarios') setView('home');
                else if(view === 'satellite-mission') setView('scenarios');
                else if(view === 'flask-lab') setView('sim-menu');
                else if(view === 'electromagnetism') {
                  if (magSubView === 'menu') setView('home');
                  else setMagSubView('menu');
                }
                else setView('theory-levels');
              }}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-full font-bold transition-all"
            >
              ← Go Back
            </button>
          </div>
        )}
      </div>
    </section>

      {/* OVERHEATED ANIMATION LOGIC */}
      <style jsx>{`
        @keyframes heat-flow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        .animate-heat-flow {
          animation: heat-flow 1.5s linear infinite;
        }

        @keyframes smoke-rise-1 {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          15% { opacity: 0.8; }
          50% { opacity: 0.6; }
          80% { opacity: 0.2; }
          100% { transform: translateY(-80px) translateX(8px); opacity: 0; }
        }

        @keyframes smoke-rise-2 {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          15% { opacity: 0.8; }
          50% { opacity: 0.6; }
          80% { opacity: 0.2; }
          100% { transform: translateY(-90px) translateX(-12px); opacity: 0; }
        }

        @keyframes smoke-rise-3 {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          15% { opacity: 0.8; }
          50% { opacity: 0.6; }
          80% { opacity: 0.2; }
          100% { transform: translateY(-85px) translateX(15px); opacity: 0; }
        }

        @keyframes smoke-rise-4 {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          15% { opacity: 0.7; }
          50% { opacity: 0.5; }
          80% { opacity: 0.15; }
          100% { transform: translateY(-95px) translateX(-8px); opacity: 0; }
        }

        @keyframes smoke-rise-5 {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          15% { opacity: 0.7; }
          50% { opacity: 0.5; }
          80% { opacity: 0.15; }
          100% { transform: translateY(-75px) translateX(12px); opacity: 0; }
        }

        @keyframes smoke-rise-6 {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          15% { opacity: 0.7; }
          50% { opacity: 0.5; }
          80% { opacity: 0.15; }
          100% { transform: translateY(-88px) translateX(-15px); opacity: 0; }
        }

        .animate-smoke-1 { animation: smoke-rise-1 3s ease-out infinite; }
        .animate-smoke-2 { animation: smoke-rise-2 3.5s ease-out infinite 0.3s; }
        .animate-smoke-3 { animation: smoke-rise-3 3.2s ease-out infinite 0.6s; }
        .animate-smoke-4 { animation: smoke-rise-4 3.8s ease-out infinite 0.9s; }
        .animate-smoke-5 { animation: smoke-rise-5 3.1s ease-out infinite 0.2s; }
        .animate-smoke-6 { animation: smoke-rise-6 3.4s ease-out infinite 0.5s; }

        @keyframes glow-pulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.4; }
        }

        .animate-glow-pulse {
          animation: glow-pulse 2s ease-in-out infinite;
        }
        
        @keyframes flare-flow {
          0% { stroke-dashoffset: 150; }
          100% { stroke-dashoffset: -150; }
        }
        
        .animate-flare-flow {
          animation: flare-flow 0.3s linear infinite;
        }

        @keyframes debris-fly {
          0% { transform: translateX(-100px) translateY(-50px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(200px) translateY(50px); opacity: 0; }
        }
        .animate-debris-fly {
          animation: debris-fly 1.5s linear infinite;
        }
        
        @keyframes gravity-flow {
          0% { stroke-dashoffset: 30; }
          100% { stroke-dashoffset: 0; }
        }
        .animate-gravity-flow {
          animation: gravity-flow 1s linear infinite;
        }
        
        @keyframes fire-particle {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-20px) scale(0); opacity: 0; }
        }
        
        .animate-fire-particle {
          animation: fire-particle 0.5s linear infinite;
        }
        
        @keyframes signal-flow {
          from { stroke-dashoffset: 10; }
          to { stroke-dashoffset: 0; }
        }
        .animate-signal-flow {
          animation: signal-flow 0.5s linear infinite;
        }

        /* Missing Animation Polyfills for 'tailwindcss-animate' classes */
        .animate-in { animation-duration: 0.5s; animation-timing-function: ease-out; animation-fill-mode: both; }
        .fade-in { animation-name: fadeIn; }
        .zoom-in-95 { animation-name: zoomIn95; }
        .slide-in-from-bottom-5 { animation-name: slideInBottom; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn95 { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideInBottom { from { opacity: 0; transform: translateY(1.25rem); } to { opacity: 1; transform: translateY(0); } }

        /* Custom Scrollbar Styling */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.8);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 1);
        }
      `}</style>
    </main>
  );
}