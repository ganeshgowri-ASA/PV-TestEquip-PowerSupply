// PV Module Database — 80+ models from major manufacturers
// Technologies: PERC, TOPCon, HJT, HBC, Bifacial, Tandem, CIGS, CdTe

export interface TestLimits {
  tc: { Vmax: number; Isc: number };
  hf: { Vmax: number; freq: number; Isc: number };
  letid: { Iinject: number; Voc: number; cellTemp: number };
  pid: { Vbias: number; ImaxLeak: number; duration: number };
}

export interface PVModule {
  manufacturer: string;
  model: string;
  technology: string;
  Pmax: number;      // W
  Voc: number;       // V
  Isc: number;       // A
  Vmp: number;       // V
  Imp: number;       // A
  efficiency: number; // %
  testLimits: TestLimits;
}

function limits(
  Voc: number,
  Isc: number,
  opts?: { pidVbias?: number; pidImaxLeak?: number; pidDuration?: number; letidTemp?: number }
): TestLimits {
  return {
    tc: { Vmax: Voc * 1.1, Isc },
    hf: { Vmax: Voc * 1.1, freq: 10, Isc },
    letid: { Iinject: Isc, Voc, cellTemp: opts?.letidTemp ?? 75 },
    pid: {
      Vbias: opts?.pidVbias ?? 1000,
      ImaxLeak: opts?.pidImaxLeak ?? 5,
      duration: opts?.pidDuration ?? 96,
    },
  };
}

export const moduleDatabase: PVModule[] = [
  // ─── LONGi ────────────────────────────────────────────────────────────
  {
    manufacturer: 'LONGi', model: 'Hi-MO 7 LR5-72HGD-580M', technology: 'PERC Bifacial',
    Pmax: 580, Voc: 51.90, Isc: 14.23, Vmp: 43.60, Imp: 13.30, efficiency: 22.50,
    testLimits: limits(51.90, 14.23),
  },
  {
    manufacturer: 'LONGi', model: 'Hi-MO X6 LR5-72HTH-590M', technology: 'HJT Bifacial',
    Pmax: 590, Voc: 52.40, Isc: 14.45, Vmp: 44.10, Imp: 13.38, efficiency: 22.80,
    testLimits: limits(52.40, 14.45),
  },
  {
    manufacturer: 'LONGi', model: 'Hi-MO 9 LR7-72HBD-620M', technology: 'HBC Bifacial',
    Pmax: 620, Voc: 54.20, Isc: 14.70, Vmp: 45.50, Imp: 13.63, efficiency: 24.00,
    testLimits: limits(54.20, 14.70),
  },
  {
    manufacturer: 'LONGi', model: 'Hi-MO 6 LR5-54HPH-430M', technology: 'PERC',
    Pmax: 430, Voc: 38.10, Isc: 14.32, Vmp: 32.00, Imp: 13.44, efficiency: 22.00,
    testLimits: limits(38.10, 14.32),
  },
  {
    manufacturer: 'LONGi', model: 'Hi-MO X6 LR5-54HTH-450M', technology: 'HJT',
    Pmax: 450, Voc: 39.50, Isc: 14.60, Vmp: 33.20, Imp: 13.55, efficiency: 23.00,
    testLimits: limits(39.50, 14.60),
  },
  {
    manufacturer: 'LONGi', model: 'Hi-MO 7 LR5-54HGD-440M', technology: 'TOPCon Bifacial',
    Pmax: 440, Voc: 38.80, Isc: 14.40, Vmp: 32.50, Imp: 13.54, efficiency: 22.30,
    testLimits: limits(38.80, 14.40),
  },

  // ─── JA Solar ─────────────────────────────────────────────────────────
  {
    manufacturer: 'JA Solar', model: 'DeepBlue 4.0 Pro JAM72D42-605/LB', technology: 'TOPCon Bifacial',
    Pmax: 605, Voc: 52.80, Isc: 14.72, Vmp: 44.30, Imp: 13.66, efficiency: 22.80,
    testLimits: limits(52.80, 14.72),
  },
  {
    manufacturer: 'JA Solar', model: 'DeepBlue 4.0 JAM72D40-580/MB', technology: 'PERC Bifacial',
    Pmax: 580, Voc: 51.50, Isc: 14.35, Vmp: 43.20, Imp: 13.43, efficiency: 22.40,
    testLimits: limits(51.50, 14.35),
  },
  {
    manufacturer: 'JA Solar', model: 'JAM54D40-435/LB', technology: 'TOPCon Bifacial',
    Pmax: 435, Voc: 38.50, Isc: 14.50, Vmp: 32.30, Imp: 13.47, efficiency: 22.50,
    testLimits: limits(38.50, 14.50),
  },
  {
    manufacturer: 'JA Solar', model: 'JAM78D40-630/LB', technology: 'TOPCon Bifacial',
    Pmax: 630, Voc: 55.00, Isc: 14.75, Vmp: 46.10, Imp: 13.67, efficiency: 22.90,
    testLimits: limits(55.00, 14.75),
  },
  {
    manufacturer: 'JA Solar', model: 'JAM60S20-380/MR', technology: 'PERC',
    Pmax: 380, Voc: 41.20, Isc: 11.78, Vmp: 34.50, Imp: 11.01, efficiency: 21.30,
    testLimits: limits(41.20, 11.78),
  },
  {
    manufacturer: 'JA Solar', model: 'JAM72S30-545/MR', technology: 'PERC',
    Pmax: 545, Voc: 49.80, Isc: 13.95, Vmp: 41.80, Imp: 13.04, efficiency: 21.30,
    testLimits: limits(49.80, 13.95),
  },

  // ─── Trina Solar ──────────────────────────────────────────────────────
  {
    manufacturer: 'Trina Solar', model: 'Vertex N TSM-DE21 700W', technology: 'TOPCon Bifacial',
    Pmax: 700, Voc: 58.10, Isc: 15.50, Vmp: 48.80, Imp: 14.34, efficiency: 23.20,
    testLimits: limits(58.10, 15.50),
  },
  {
    manufacturer: 'Trina Solar', model: 'Vertex S+ TSM-NEG9RC.27 445W', technology: 'TOPCon Bifacial',
    Pmax: 445, Voc: 39.20, Isc: 14.58, Vmp: 33.10, Imp: 13.44, efficiency: 22.70,
    testLimits: limits(39.20, 14.58),
  },
  {
    manufacturer: 'Trina Solar', model: 'Vertex S TSM-DE09.08 415W', technology: 'PERC',
    Pmax: 415, Voc: 37.60, Isc: 14.10, Vmp: 31.40, Imp: 13.22, efficiency: 21.80,
    testLimits: limits(37.60, 14.10),
  },
  {
    manufacturer: 'Trina Solar', model: 'Vertex N TSM-DE21 600W', technology: 'TOPCon Bifacial',
    Pmax: 600, Voc: 52.50, Isc: 14.68, Vmp: 44.00, Imp: 13.64, efficiency: 22.60,
    testLimits: limits(52.50, 14.68),
  },
  {
    manufacturer: 'Trina Solar', model: 'Vertex TSM-DEG21C.20 660W', technology: 'PERC Bifacial',
    Pmax: 660, Voc: 56.20, Isc: 15.10, Vmp: 47.10, Imp: 14.01, efficiency: 21.90,
    testLimits: limits(56.20, 15.10),
  },
  {
    manufacturer: 'Trina Solar', model: 'Vertex N+ Tandem 750W', technology: 'Tandem',
    Pmax: 750, Voc: 60.50, Isc: 15.80, Vmp: 51.20, Imp: 14.65, efficiency: 25.00,
    testLimits: limits(60.50, 15.80, { pidVbias: 1500 }),
  },

  // ─── Canadian Solar ───────────────────────────────────────────────────
  {
    manufacturer: 'Canadian Solar', model: 'HiKu7 CS7N-665TB-AG', technology: 'TOPCon Bifacial',
    Pmax: 665, Voc: 56.80, Isc: 15.05, Vmp: 47.50, Imp: 14.00, efficiency: 22.80,
    testLimits: limits(56.80, 15.05),
  },
  {
    manufacturer: 'Canadian Solar', model: 'HiKu6 CS6W-560MS', technology: 'PERC',
    Pmax: 560, Voc: 50.30, Isc: 14.18, Vmp: 42.10, Imp: 13.30, efficiency: 21.70,
    testLimits: limits(50.30, 14.18),
  },
  {
    manufacturer: 'Canadian Solar', model: 'HiKu7 CS7L-600TB-AG', technology: 'TOPCon Bifacial',
    Pmax: 600, Voc: 52.00, Isc: 14.82, Vmp: 43.60, Imp: 13.76, efficiency: 22.50,
    testLimits: limits(52.00, 14.82),
  },
  {
    manufacturer: 'Canadian Solar', model: 'HiHero CS-CH700-HJT', technology: 'HJT Bifacial',
    Pmax: 700, Voc: 57.50, Isc: 15.62, Vmp: 48.30, Imp: 14.49, efficiency: 23.50,
    testLimits: limits(57.50, 15.62),
  },
  {
    manufacturer: 'Canadian Solar', model: 'BiHiKu CS3W-445MB-AG', technology: 'PERC Bifacial',
    Pmax: 445, Voc: 39.80, Isc: 14.30, Vmp: 33.30, Imp: 13.36, efficiency: 21.50,
    testLimits: limits(39.80, 14.30),
  },
  {
    manufacturer: 'Canadian Solar', model: 'TOPBiHiKu7 CS7N-720TB-AG', technology: 'TOPCon Bifacial',
    Pmax: 720, Voc: 58.90, Isc: 15.70, Vmp: 49.50, Imp: 14.55, efficiency: 23.30,
    testLimits: limits(58.90, 15.70),
  },

  // ─── Jinko Solar ──────────────────────────────────────────────────────
  {
    manufacturer: 'Jinko Solar', model: 'Tiger Neo JKM620N-78HL4-BDV', technology: 'TOPCon Bifacial',
    Pmax: 620, Voc: 53.80, Isc: 14.80, Vmp: 45.10, Imp: 13.75, efficiency: 22.60,
    testLimits: limits(53.80, 14.80),
  },
  {
    manufacturer: 'Jinko Solar', model: 'Tiger Neo JKM585N-72HL4-V', technology: 'TOPCon',
    Pmax: 585, Voc: 51.60, Isc: 14.55, Vmp: 43.30, Imp: 13.51, efficiency: 22.30,
    testLimits: limits(51.60, 14.55),
  },
  {
    manufacturer: 'Jinko Solar', model: 'Tiger Pro JKM545M-72HL4-V', technology: 'PERC',
    Pmax: 545, Voc: 49.60, Isc: 14.00, Vmp: 41.60, Imp: 13.10, efficiency: 21.30,
    testLimits: limits(49.60, 14.00),
  },
  {
    manufacturer: 'Jinko Solar', model: 'Tiger Neo JKM440N-54HL4-B', technology: 'TOPCon Bifacial',
    Pmax: 440, Voc: 38.90, Isc: 14.52, Vmp: 32.70, Imp: 13.46, efficiency: 22.50,
    testLimits: limits(38.90, 14.52),
  },
  {
    manufacturer: 'Jinko Solar', model: 'Tiger Neo JKM700N-78HL4-BDV', technology: 'TOPCon Bifacial',
    Pmax: 700, Voc: 57.80, Isc: 15.55, Vmp: 48.60, Imp: 14.40, efficiency: 23.40,
    testLimits: limits(57.80, 15.55),
  },
  {
    manufacturer: 'Jinko Solar', model: 'Tiger Pro JKM420M-54HL4-V', technology: 'PERC',
    Pmax: 420, Voc: 37.80, Isc: 14.20, Vmp: 31.60, Imp: 13.29, efficiency: 21.50,
    testLimits: limits(37.80, 14.20),
  },

  // ─── First Solar ──────────────────────────────────────────────────────
  {
    manufacturer: 'First Solar', model: 'Series 7 FS-7445A', technology: 'CdTe',
    Pmax: 445, Voc: 219.60, Isc: 2.58, Vmp: 181.20, Imp: 2.46, efficiency: 19.30,
    testLimits: limits(219.60, 2.58, { pidVbias: 1500, pidImaxLeak: 2, pidDuration: 96 }),
  },
  {
    manufacturer: 'First Solar', model: 'Series 6 Plus FS-6475A', technology: 'CdTe',
    Pmax: 475, Voc: 224.50, Isc: 2.72, Vmp: 185.00, Imp: 2.57, efficiency: 19.80,
    testLimits: limits(224.50, 2.72, { pidVbias: 1500, pidImaxLeak: 2, pidDuration: 96 }),
  },
  {
    manufacturer: 'First Solar', model: 'Series 7 FS-7420', technology: 'CdTe',
    Pmax: 420, Voc: 216.00, Isc: 2.50, Vmp: 178.00, Imp: 2.36, efficiency: 18.50,
    testLimits: limits(216.00, 2.50, { pidVbias: 1500, pidImaxLeak: 2, pidDuration: 96 }),
  },

  // ─── Risen Energy ─────────────────────────────────────────────────────
  {
    manufacturer: 'Risen Energy', model: 'Titan S RSM40-8-410M', technology: 'PERC',
    Pmax: 410, Voc: 37.30, Isc: 14.05, Vmp: 31.20, Imp: 13.14, efficiency: 21.20,
    testLimits: limits(37.30, 14.05),
  },
  {
    manufacturer: 'Risen Energy', model: 'Titan RSM110-8-550M', technology: 'PERC',
    Pmax: 550, Voc: 49.90, Isc: 14.10, Vmp: 41.80, Imp: 13.16, efficiency: 21.40,
    testLimits: limits(49.90, 14.10),
  },
  {
    manufacturer: 'Risen Energy', model: 'Hyper-ion HJT RSM132-8-700M', technology: 'HJT Bifacial',
    Pmax: 700, Voc: 57.30, Isc: 15.68, Vmp: 48.10, Imp: 14.55, efficiency: 23.30,
    testLimits: limits(57.30, 15.68),
  },
  {
    manufacturer: 'Risen Energy', model: 'Titan N RSM108-10-430N', technology: 'TOPCon',
    Pmax: 430, Voc: 38.40, Isc: 14.38, Vmp: 32.20, Imp: 13.35, efficiency: 22.10,
    testLimits: limits(38.40, 14.38),
  },
  {
    manufacturer: 'Risen Energy', model: 'Titan N RSM144-10-620N-BD', technology: 'TOPCon Bifacial',
    Pmax: 620, Voc: 53.50, Isc: 14.88, Vmp: 44.80, Imp: 13.84, efficiency: 22.70,
    testLimits: limits(53.50, 14.88),
  },

  // ─── REC Group ────────────────────────────────────────────────────────
  {
    manufacturer: 'REC', model: 'Alpha Pure-R 430W', technology: 'HJT',
    Pmax: 430, Voc: 46.60, Isc: 11.85, Vmp: 39.10, Imp: 11.00, efficiency: 22.30,
    testLimits: limits(46.60, 11.85),
  },
  {
    manufacturer: 'REC', model: 'TwinPeak 5 REC440TP5', technology: 'PERC',
    Pmax: 440, Voc: 39.20, Isc: 14.32, Vmp: 32.90, Imp: 13.37, efficiency: 21.90,
    testLimits: limits(39.20, 14.32),
  },
  {
    manufacturer: 'REC', model: 'Alpha HJT 72 REC600AA', technology: 'HJT Bifacial',
    Pmax: 600, Voc: 52.10, Isc: 14.78, Vmp: 43.70, Imp: 13.73, efficiency: 23.00,
    testLimits: limits(52.10, 14.78),
  },
  {
    manufacturer: 'REC', model: 'TwinPeak 4 REC380TP4', technology: 'PERC',
    Pmax: 380, Voc: 41.10, Isc: 11.80, Vmp: 34.40, Imp: 11.05, efficiency: 21.10,
    testLimits: limits(41.10, 11.80),
  },

  // ─── Panasonic HIT ────────────────────────────────────────────────────
  {
    manufacturer: 'Panasonic', model: 'EverVolt EVPV-410HK', technology: 'HJT',
    Pmax: 410, Voc: 45.50, Isc: 11.58, Vmp: 38.20, Imp: 10.73, efficiency: 22.20,
    testLimits: limits(45.50, 11.58),
  },
  {
    manufacturer: 'Panasonic', model: 'HIT N340 VBHN340SJ53', technology: 'HJT',
    Pmax: 340, Voc: 69.70, Isc: 6.07, Vmp: 58.80, Imp: 5.78, efficiency: 20.30,
    testLimits: limits(69.70, 6.07),
  },
  {
    manufacturer: 'Panasonic', model: 'EverVolt EVPV-380HK', technology: 'HJT',
    Pmax: 380, Voc: 44.20, Isc: 11.05, Vmp: 37.10, Imp: 10.24, efficiency: 21.70,
    testLimits: limits(44.20, 11.05),
  },
  {
    manufacturer: 'Panasonic', model: 'HIT N330 VBHN330SJ47', technology: 'HJT',
    Pmax: 330, Voc: 69.00, Isc: 5.96, Vmp: 58.00, Imp: 5.69, efficiency: 19.70,
    testLimits: limits(69.00, 5.96),
  },

  // ─── SunPower ─────────────────────────────────────────────────────────
  {
    manufacturer: 'SunPower', model: 'Maxeon 7 SPR-M440-H-AC', technology: 'HBC',
    Pmax: 440, Voc: 48.00, Isc: 11.75, Vmp: 40.30, Imp: 10.92, efficiency: 24.10,
    testLimits: limits(48.00, 11.75),
  },
  {
    manufacturer: 'SunPower', model: 'Maxeon 6 SPR-M425-H-AC', technology: 'HBC',
    Pmax: 425, Voc: 47.20, Isc: 11.55, Vmp: 39.60, Imp: 10.73, efficiency: 23.00,
    testLimits: limits(47.20, 11.55),
  },
  {
    manufacturer: 'SunPower', model: 'Maxeon 3 SPR-MAX400-COM', technology: 'HBC',
    Pmax: 400, Voc: 75.60, Isc: 6.58, Vmp: 64.50, Imp: 6.20, efficiency: 22.80,
    testLimits: limits(75.60, 6.58),
  },
  {
    manufacturer: 'SunPower', model: 'Performance 3 SPR-P3-410-COM', technology: 'PERC',
    Pmax: 410, Voc: 37.50, Isc: 14.00, Vmp: 31.40, Imp: 13.06, efficiency: 21.20,
    testLimits: limits(37.50, 14.00),
  },

  // ─── Meyer Burger ─────────────────────────────────────────────────────
  {
    manufacturer: 'Meyer Burger', model: 'Glass 400W', technology: 'HJT',
    Pmax: 400, Voc: 44.80, Isc: 11.45, Vmp: 37.60, Imp: 10.64, efficiency: 21.90,
    testLimits: limits(44.80, 11.45),
  },
  {
    manufacturer: 'Meyer Burger', model: 'Black 395W', technology: 'HJT',
    Pmax: 395, Voc: 44.50, Isc: 11.40, Vmp: 37.30, Imp: 10.59, efficiency: 21.70,
    testLimits: limits(44.50, 11.40),
  },
  {
    manufacturer: 'Meyer Burger', model: 'White 390W', technology: 'HJT',
    Pmax: 390, Voc: 44.20, Isc: 11.32, Vmp: 37.00, Imp: 10.54, efficiency: 21.40,
    testLimits: limits(44.20, 11.32),
  },
  {
    manufacturer: 'Meyer Burger', model: 'Glass 420W HJT-Bi', technology: 'HJT Bifacial',
    Pmax: 420, Voc: 45.60, Isc: 11.80, Vmp: 38.30, Imp: 10.97, efficiency: 22.30,
    testLimits: limits(45.60, 11.80),
  },

  // ─── Waaree Energies ──────────────────────────────────────────────────
  {
    manufacturer: 'Waaree', model: 'WS-610 Bifacial TOPCon', technology: 'TOPCon Bifacial',
    Pmax: 610, Voc: 53.00, Isc: 14.78, Vmp: 44.50, Imp: 13.71, efficiency: 22.40,
    testLimits: limits(53.00, 14.78),
  },
  {
    manufacturer: 'Waaree', model: 'WS-545 Mono PERC', technology: 'PERC',
    Pmax: 545, Voc: 49.50, Isc: 14.05, Vmp: 41.50, Imp: 13.13, efficiency: 21.30,
    testLimits: limits(49.50, 14.05),
  },
  {
    manufacturer: 'Waaree', model: 'WS-440 Mono PERC', technology: 'PERC',
    Pmax: 440, Voc: 39.10, Isc: 14.36, Vmp: 32.80, Imp: 13.41, efficiency: 21.50,
    testLimits: limits(39.10, 14.36),
  },
  {
    manufacturer: 'Waaree', model: 'WS-665 TOPCon Bifacial', technology: 'TOPCon Bifacial',
    Pmax: 665, Voc: 56.50, Isc: 15.12, Vmp: 47.40, Imp: 14.03, efficiency: 22.80,
    testLimits: limits(56.50, 15.12),
  },
  {
    manufacturer: 'Waaree', model: 'WS-380 Poly', technology: 'PERC',
    Pmax: 380, Voc: 41.00, Isc: 11.85, Vmp: 34.20, Imp: 11.11, efficiency: 20.50,
    testLimits: limits(41.00, 11.85),
  },
  {
    manufacturer: 'Waaree', model: 'WS-700 HJT Bifacial', technology: 'HJT Bifacial',
    Pmax: 700, Voc: 57.80, Isc: 15.55, Vmp: 48.50, Imp: 14.43, efficiency: 23.30,
    testLimits: limits(57.80, 15.55),
  },

  // ─── Adani Solar ──────────────────────────────────────────────────────
  {
    manufacturer: 'Adani Solar', model: 'ASP-7-600 TOPCon', technology: 'TOPCon Bifacial',
    Pmax: 600, Voc: 52.30, Isc: 14.72, Vmp: 43.90, Imp: 13.67, efficiency: 22.30,
    testLimits: limits(52.30, 14.72),
  },
  {
    manufacturer: 'Adani Solar', model: 'ASP-7-545 Mono PERC', technology: 'PERC',
    Pmax: 545, Voc: 49.60, Isc: 14.02, Vmp: 41.60, Imp: 13.10, efficiency: 21.20,
    testLimits: limits(49.60, 14.02),
  },
  {
    manufacturer: 'Adani Solar', model: 'ASP-7-440 Mono PERC', technology: 'PERC',
    Pmax: 440, Voc: 39.00, Isc: 14.40, Vmp: 32.70, Imp: 13.46, efficiency: 21.60,
    testLimits: limits(39.00, 14.40),
  },
  {
    manufacturer: 'Adani Solar', model: 'ASP-7-665N TOPCon Bi', technology: 'TOPCon Bifacial',
    Pmax: 665, Voc: 56.40, Isc: 15.15, Vmp: 47.30, Imp: 14.06, efficiency: 22.70,
    testLimits: limits(56.40, 15.15),
  },
  {
    manufacturer: 'Adani Solar', model: 'ASP-7-700HJT', technology: 'HJT Bifacial',
    Pmax: 700, Voc: 57.60, Isc: 15.60, Vmp: 48.40, Imp: 14.46, efficiency: 23.40,
    testLimits: limits(57.60, 15.60),
  },

  // ─── Vikram Solar ─────────────────────────────────────────────────────
  {
    manufacturer: 'Vikram Solar', model: 'Somera Grand 600 TOPCon', technology: 'TOPCon Bifacial',
    Pmax: 600, Voc: 52.10, Isc: 14.78, Vmp: 43.70, Imp: 13.73, efficiency: 22.20,
    testLimits: limits(52.10, 14.78),
  },
  {
    manufacturer: 'Vikram Solar', model: 'Prexos 545 Mono PERC', technology: 'PERC',
    Pmax: 545, Voc: 49.80, Isc: 13.98, Vmp: 41.70, Imp: 13.07, efficiency: 21.10,
    testLimits: limits(49.80, 13.98),
  },
  {
    manufacturer: 'Vikram Solar', model: 'Somera 440 TOPCon', technology: 'TOPCon',
    Pmax: 440, Voc: 38.80, Isc: 14.45, Vmp: 32.50, Imp: 13.54, efficiency: 22.00,
    testLimits: limits(38.80, 14.45),
  },
  {
    manufacturer: 'Vikram Solar', model: 'Somera Grand 665N Bifacial', technology: 'TOPCon Bifacial',
    Pmax: 665, Voc: 56.30, Isc: 15.18, Vmp: 47.20, Imp: 14.09, efficiency: 22.60,
    testLimits: limits(56.30, 15.18),
  },

  // ─── Renewsys ─────────────────────────────────────────────────────────
  {
    manufacturer: 'Renewsys', model: 'Deserv 545W Mono PERC', technology: 'PERC',
    Pmax: 545, Voc: 49.70, Isc: 14.00, Vmp: 41.60, Imp: 13.10, efficiency: 21.00,
    testLimits: limits(49.70, 14.00),
  },
  {
    manufacturer: 'Renewsys', model: 'Deserv 440W Mono PERC', technology: 'PERC',
    Pmax: 440, Voc: 39.00, Isc: 14.38, Vmp: 32.70, Imp: 13.46, efficiency: 21.30,
    testLimits: limits(39.00, 14.38),
  },
  {
    manufacturer: 'Renewsys', model: 'Deserv 600N TOPCon Bi', technology: 'TOPCon Bifacial',
    Pmax: 600, Voc: 52.20, Isc: 14.75, Vmp: 43.80, Imp: 13.70, efficiency: 22.10,
    testLimits: limits(52.20, 14.75),
  },
  {
    manufacturer: 'Renewsys', model: 'Deserv 380W Poly', technology: 'PERC',
    Pmax: 380, Voc: 40.80, Isc: 11.90, Vmp: 34.10, Imp: 11.14, efficiency: 20.30,
    testLimits: limits(40.80, 11.90),
  },

  // ─── Additional LONGi/JA/Trina/Canadian/Jinko for 80+ ────────────────
  {
    manufacturer: 'LONGi', model: 'Hi-MO 5 LR5-72HPH-555M', technology: 'PERC',
    Pmax: 555, Voc: 50.50, Isc: 14.08, Vmp: 42.30, Imp: 13.12, efficiency: 21.60,
    testLimits: limits(50.50, 14.08),
  },
  {
    manufacturer: 'JA Solar', model: 'DeepBlue 3.0 JAM72S20-555/MR', technology: 'PERC',
    Pmax: 555, Voc: 50.40, Isc: 14.06, Vmp: 42.20, Imp: 13.15, efficiency: 21.50,
    testLimits: limits(50.40, 14.06),
  },
  {
    manufacturer: 'Trina Solar', model: 'Vertex TSM-DEG19RC.20 540W', technology: 'PERC Bifacial',
    Pmax: 540, Voc: 49.30, Isc: 14.00, Vmp: 41.30, Imp: 13.07, efficiency: 21.30,
    testLimits: limits(49.30, 14.00),
  },
  {
    manufacturer: 'Canadian Solar', model: 'HiKu CS3W-555MS', technology: 'PERC',
    Pmax: 555, Voc: 50.40, Isc: 14.07, Vmp: 42.20, Imp: 13.15, efficiency: 21.50,
    testLimits: limits(50.40, 14.07),
  },
  {
    manufacturer: 'Jinko Solar', model: 'Tiger JKM530M-72HL4-V', technology: 'PERC',
    Pmax: 530, Voc: 49.20, Isc: 13.78, Vmp: 41.20, Imp: 12.86, efficiency: 21.00,
    testLimits: limits(49.20, 13.78),
  },
  {
    manufacturer: 'LONGi', model: 'Hi-MO 7 LR7-72HGD-620M', technology: 'TOPCon Bifacial',
    Pmax: 620, Voc: 53.80, Isc: 14.80, Vmp: 45.10, Imp: 13.75, efficiency: 22.80,
    testLimits: limits(53.80, 14.80),
  },
  {
    manufacturer: 'JA Solar', model: 'DeepBlue 4.0 Pro JAM54D42-440/LB', technology: 'TOPCon Bifacial',
    Pmax: 440, Voc: 38.90, Isc: 14.52, Vmp: 32.60, Imp: 13.50, efficiency: 22.60,
    testLimits: limits(38.90, 14.52),
  },
  {
    manufacturer: 'Trina Solar', model: 'Vertex N+ TSM-NEG21C.20 680W', technology: 'TOPCon Bifacial',
    Pmax: 680, Voc: 57.00, Isc: 15.32, Vmp: 47.80, Imp: 14.23, efficiency: 23.00,
    testLimits: limits(57.00, 15.32),
  },
  {
    manufacturer: 'Risen Energy', model: 'Hyper-ion HJT RSM108-8-430M', technology: 'HJT',
    Pmax: 430, Voc: 46.80, Isc: 11.78, Vmp: 39.30, Imp: 10.94, efficiency: 22.50,
    testLimits: limits(46.80, 11.78),
  },
  {
    manufacturer: 'Waaree', model: 'WS-590 TOPCon', technology: 'TOPCon',
    Pmax: 590, Voc: 51.80, Isc: 14.62, Vmp: 43.40, Imp: 13.59, efficiency: 22.10,
    testLimits: limits(51.80, 14.62),
  },
  {
    manufacturer: 'Adani Solar', model: 'ASP-7-590N TOPCon', technology: 'TOPCon',
    Pmax: 590, Voc: 51.70, Isc: 14.65, Vmp: 43.30, Imp: 13.63, efficiency: 22.00,
    testLimits: limits(51.70, 14.65),
  },
  {
    manufacturer: 'Vikram Solar', model: 'Prexos 380 Mono PERC', technology: 'PERC',
    Pmax: 380, Voc: 40.90, Isc: 11.88, Vmp: 34.30, Imp: 11.08, efficiency: 20.60,
    testLimits: limits(40.90, 11.88),
  },
];

// ─── Helper utilities ───────────────────────────────────────────────────────

export const manufacturers = [...new Set(moduleDatabase.map((m) => m.manufacturer))].sort();

export const technologies = [...new Set(moduleDatabase.map((m) => m.technology))].sort();

export function findModule(manufacturer: string, model: string): PVModule | undefined {
  return moduleDatabase.find((m) => m.manufacturer === manufacturer && m.model === model);
}

export function filterModules(opts: {
  manufacturer?: string;
  technology?: string;
  search?: string;
  minPmax?: number;
  maxPmax?: number;
}): PVModule[] {
  return moduleDatabase.filter((m) => {
    if (opts.manufacturer && m.manufacturer !== opts.manufacturer) return false;
    if (opts.technology && m.technology !== opts.technology) return false;
    if (opts.minPmax && m.Pmax < opts.minPmax) return false;
    if (opts.maxPmax && m.Pmax > opts.maxPmax) return false;
    if (opts.search) {
      const q = opts.search.toLowerCase();
      return (
        m.manufacturer.toLowerCase().includes(q) ||
        m.model.toLowerCase().includes(q) ||
        m.technology.toLowerCase().includes(q)
      );
    }
    return true;
  });
}
