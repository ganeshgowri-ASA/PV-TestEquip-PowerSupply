export type Technology =
  | 'PERC'
  | 'TOPCon'
  | 'HJT'
  | 'HBC'
  | 'Bifacial'
  | 'Monofacial'
  | 'Tandem'
  | 'CIGS'
  | 'CdTe'
  | 'n-type'
  | 'p-type';

export interface TestLimits {
  tc: { Vmax: number; Isc_TC: number };
  hf: { Vmax: number; frequency: number; Isc_HF: number };
  letid: { Iinject: number; Voc: number; cellTemp: number };
  pid: { Vbias: number; Imax_leak: number; duration: number };
}

export interface PVModule {
  id: string;
  manufacturer: string;
  model: string;
  technology: Technology;
  Pmax: number;
  Voc: number;
  Isc: number;
  Vmp: number;
  Imp: number;
  efficiency: number;
  testLimits: TestLimits;
}

function makeTestLimits(Voc: number, Isc: number, tech: Technology): TestLimits {
  const pidVbias = tech === 'HJT' || tech === 'HBC' || tech === 'Tandem' ? 4000 : tech === 'TOPCon' || tech === 'n-type' ? 2000 : 1000;
  return {
    tc: { Vmax: Voc * 1.1, Isc_TC: Isc },
    hf: { Vmax: Voc * 1.1, frequency: 1, Isc_HF: Isc },
    letid: { Iinject: Isc, Voc, cellTemp: 75 },
    pid: { Vbias: pidVbias, Imax_leak: 5, duration: 96 },
  };
}

function mod(
  id: string, manufacturer: string, model: string, technology: Technology,
  Pmax: number, Voc: number, Isc: number, Vmp: number, Imp: number, efficiency: number
): PVModule {
  return { id, manufacturer, model, technology, Pmax, Voc, Isc, Vmp, Imp, efficiency, testLimits: makeTestLimits(Voc, Isc, technology) };
}

export const MODULE_DATABASE: PVModule[] = [
  // --- LONGi ---
  mod('longi-1', 'LONGi', 'Hi-MO 7 LR5-72HGD 580M', 'PERC', 580, 49.65, 14.75, 41.70, 13.91, 22.45),
  mod('longi-2', 'LONGi', 'Hi-MO X6 LR5-72HTH 590M', 'HJT', 590, 51.20, 14.55, 43.10, 13.69, 22.80),
  mod('longi-3', 'LONGi', 'Hi-MO 9 LR7-72HBD 620M', 'HBC', 620, 52.80, 14.85, 44.30, 13.99, 23.30),
  mod('longi-4', 'LONGi', 'Hi-MO 6 LR5-54HPB 435M', 'PERC', 435, 37.20, 14.72, 31.30, 13.90, 21.80),
  mod('longi-5', 'LONGi', 'Hi-MO X6 LR5-54HTH 450M', 'HJT', 450, 38.50, 14.80, 32.40, 13.89, 22.50),
  mod('longi-6', 'LONGi', 'Hi-MO 7 LR7-72HGD 620M', 'TOPCon', 620, 52.50, 14.90, 44.00, 14.09, 23.00),

  // --- JA Solar ---
  mod('ja-1', 'JA Solar', 'DeepBlue 4.0 Pro JAM72D42-620/LB', 'TOPCon', 620, 52.34, 14.96, 43.86, 14.14, 22.80),
  mod('ja-2', 'JA Solar', 'DeepBlue 4.0 Pro JAM72S30-545/MR', 'PERC', 545, 49.62, 13.88, 41.64, 13.10, 21.30),
  mod('ja-3', 'JA Solar', 'DeepBlue 3.0 JAM60S20-385/MR', 'PERC', 385, 34.48, 14.08, 28.98, 13.28, 20.70),
  mod('ja-4', 'JA Solar', 'DeepBlue 4.0 JAM72D40-580/LB', 'TOPCon', 580, 51.80, 14.15, 43.50, 13.33, 22.40),
  mod('ja-5', 'JA Solar', 'JAM78D40-630/LB', 'TOPCon', 630, 53.20, 14.98, 44.60, 14.13, 22.90),
  mod('ja-6', 'JA Solar', 'JAM54D40-435/LB', 'n-type', 435, 37.80, 14.55, 31.80, 13.68, 22.30),

  // --- Trina Solar ---
  mod('trina-1', 'Trina Solar', 'Vertex S+ NEG9RC.27 445W', 'TOPCon', 445, 38.40, 14.65, 32.30, 13.78, 22.50),
  mod('trina-2', 'Trina Solar', 'Vertex N TSM-DE21 620W', 'TOPCon', 620, 52.60, 14.88, 44.20, 14.03, 22.80),
  mod('trina-3', 'Trina Solar', 'Vertex S TSM-DE09.08 400W', 'PERC', 400, 34.80, 14.50, 29.30, 13.65, 20.90),
  mod('trina-4', 'Trina Solar', 'Vertex N TSM-NEG19RC.27 585W', 'n-type', 585, 51.90, 14.25, 43.60, 13.42, 22.30),
  mod('trina-5', 'Trina Solar', 'Vertex S+ NEG9R.28 440W', 'TOPCon', 440, 38.20, 14.55, 32.10, 13.71, 22.40),
  mod('trina-6', 'Trina Solar', 'Vertex N TSM-NEG21C.20 700W', 'TOPCon', 700, 55.80, 15.85, 46.80, 14.96, 23.20),

  // --- Canadian Solar ---
  mod('cs-1', 'Canadian Solar', 'HiKu7 CS7N-665TB-AG', 'TOPCon', 665, 54.10, 15.52, 45.40, 14.65, 22.50),
  mod('cs-2', 'Canadian Solar', 'HiKu6 CS6W-560MS', 'PERC', 560, 49.20, 14.36, 41.30, 13.56, 21.60),
  mod('cs-3', 'Canadian Solar', 'HiHero CS-CH7N-690TB', 'HJT', 690, 55.60, 15.68, 46.70, 14.78, 23.10),
  mod('cs-4', 'Canadian Solar', 'HiKu6 CS6R-425H-AG', 'PERC', 425, 37.00, 14.50, 31.10, 13.67, 21.40),
  mod('cs-5', 'Canadian Solar', 'HiKu7 CS7L-590MS', 'Bifacial', 590, 51.40, 14.50, 43.20, 13.66, 22.10),
  mod('cs-6', 'Canadian Solar', 'TOPBiHiKu7 CS7N-720TB', 'TOPCon', 720, 56.30, 16.15, 47.30, 15.22, 23.30),

  // --- Jinko Solar ---
  mod('jinko-1', 'Jinko Solar', 'Tiger Neo N-type JKM620N-78HL4-BDV', 'TOPCon', 620, 52.68, 14.87, 44.24, 14.01, 22.60),
  mod('jinko-2', 'Jinko Solar', 'Tiger Pro JKM545M-72HL4-V', 'PERC', 545, 49.50, 13.90, 41.58, 13.11, 21.20),
  mod('jinko-3', 'Jinko Solar', 'Tiger Neo JKM445N-54HL4R-V', 'TOPCon', 445, 38.30, 14.67, 32.18, 13.83, 22.40),
  mod('jinko-4', 'Jinko Solar', 'Tiger Neo JKM585N-72HL4-BDV', 'n-type', 585, 51.70, 14.30, 43.40, 13.48, 22.20),
  mod('jinko-5', 'Jinko Solar', 'Tiger Neo JKM635N-78HL4-BDV', 'TOPCon', 635, 53.40, 15.02, 44.80, 14.17, 22.80),
  mod('jinko-6', 'Jinko Solar', 'Tiger Neo JKM700N-78HL4-BDV', 'TOPCon', 700, 56.00, 15.80, 47.00, 14.89, 23.10),

  // --- First Solar ---
  mod('fs-1', 'First Solar', 'Series 7 FS-7445A', 'CdTe', 445, 219.50, 2.56, 183.50, 2.43, 19.30),
  mod('fs-2', 'First Solar', 'Series 7 FS-7460A', 'CdTe', 460, 221.00, 2.63, 184.80, 2.49, 19.80),
  mod('fs-3', 'First Solar', 'Series 6 Plus FS-6475', 'CdTe', 475, 223.40, 2.69, 186.90, 2.54, 20.10),
  mod('fs-4', 'First Solar', 'Series 7 FS-7430A', 'CdTe', 430, 218.00, 2.50, 182.20, 2.36, 18.90),
  mod('fs-5', 'First Solar', 'Series 7 FS-7490A', 'CdTe', 490, 225.10, 2.75, 188.50, 2.60, 20.40),

  // --- Risen Energy ---
  mod('risen-1', 'Risen Energy', 'Titan S 110RSM40-8-410M', 'PERC', 410, 35.40, 14.62, 29.76, 13.78, 21.10),
  mod('risen-2', 'Risen Energy', 'Titan RSM144-10-600BHDG', 'TOPCon', 600, 51.90, 14.60, 43.60, 13.76, 22.40),
  mod('risen-3', 'Risen Energy', 'Titan 110HJT-450M', 'HJT', 450, 38.90, 14.62, 32.70, 13.76, 22.60),
  mod('risen-4', 'Risen Energy', 'Titan RSM132-8-660BMDG', 'TOPCon', 660, 54.00, 15.45, 45.30, 14.57, 22.70),
  mod('risen-5', 'Risen Energy', 'Titan RSM120-8-585BMDG', 'n-type', 585, 51.60, 14.32, 43.30, 13.51, 22.10),

  // --- CSUN ---
  mod('csun-1', 'CSUN', 'CSUN550-144M-HD', 'PERC', 550, 49.40, 14.06, 41.50, 13.25, 21.30),
  mod('csun-2', 'CSUN', 'CSUN-410-108M', 'PERC', 410, 37.20, 13.93, 31.30, 13.10, 21.00),
  mod('csun-3', 'CSUN', 'CSUN580-144N-TOPCon', 'TOPCon', 580, 51.50, 14.22, 43.30, 13.40, 22.10),
  mod('csun-4', 'CSUN', 'CSUN620-156N-TOPCon', 'TOPCon', 620, 53.00, 14.78, 44.50, 13.93, 22.50),
  mod('csun-5', 'CSUN', 'CSUN440-108N-TOPCon', 'n-type', 440, 38.00, 14.63, 31.90, 13.79, 22.20),

  // --- HT-SAAE ---
  mod('htsaae-1', 'HT-SAAE', 'HT72-18X-585', 'TOPCon', 585, 51.80, 14.28, 43.50, 13.45, 22.20),
  mod('htsaae-2', 'HT-SAAE', 'HT72-18X-560', 'PERC', 560, 49.60, 14.25, 41.60, 13.46, 21.50),
  mod('htsaae-3', 'HT-SAAE', 'HT72-18X-620', 'TOPCon', 620, 52.80, 14.83, 44.30, 13.99, 22.70),
  mod('htsaae-4', 'HT-SAAE', 'HT54-18X-440', 'TOPCon', 440, 38.10, 14.59, 32.00, 13.75, 22.30),
  mod('htsaae-5', 'HT-SAAE', 'HT78-18X-650', 'n-type', 650, 54.20, 15.15, 45.50, 14.29, 22.60),

  // --- REC Solar ---
  mod('rec-1', 'REC Solar', 'Alpha Pure-R REC430AA', 'HJT', 430, 38.70, 14.05, 32.50, 13.23, 22.30),
  mod('rec-2', 'REC Solar', 'TwinPeak 5 REC450TP5', 'PERC', 450, 38.20, 14.88, 32.10, 14.02, 21.50),
  mod('rec-3', 'REC Solar', 'Alpha HJT REC450AA-72', 'HJT', 450, 48.90, 11.62, 41.10, 10.95, 21.90),
  mod('rec-4', 'REC Solar', 'Alpha Pure-R REC410AA', 'HJT', 410, 37.80, 13.70, 31.80, 12.89, 21.70),
  mod('rec-5', 'REC Solar', 'TwinPeak 5 REC580TP5-72', 'Bifacial', 580, 49.80, 14.70, 41.80, 13.88, 21.80),

  // --- Panasonic/HIT ---
  mod('pana-1', 'Panasonic', 'EverVolt EVPV410H', 'HJT', 410, 37.60, 13.78, 31.60, 12.97, 22.20),
  mod('pana-2', 'Panasonic', 'EverVolt EVPV400H', 'HJT', 400, 37.20, 13.59, 31.30, 12.78, 21.80),
  mod('pana-3', 'Panasonic', 'HIT N340 VBHN340SA17', 'HJT', 340, 69.70, 6.17, 58.50, 5.81, 20.30),
  mod('pana-4', 'Panasonic', 'EverVolt EVPV430H', 'HJT', 430, 38.30, 14.18, 32.20, 13.35, 22.50),
  mod('pana-5', 'Panasonic', 'EverVolt EVPV370H', 'HJT', 370, 36.50, 12.81, 30.70, 12.05, 21.20),

  // --- SunPower ---
  mod('sp-1', 'SunPower', 'Maxeon 7 SPR-M440-H-AC', 'HBC', 440, 39.10, 14.22, 32.90, 13.37, 24.10),
  mod('sp-2', 'SunPower', 'Maxeon 6 SPR-MAX6-430-E-AC', 'HBC', 430, 38.80, 14.01, 32.60, 13.19, 23.50),
  mod('sp-3', 'SunPower', 'Maxeon 5 SPR-MAX5-415-E-AC', 'HBC', 415, 38.20, 13.72, 32.10, 12.93, 22.80),
  mod('sp-4', 'SunPower', 'Performance 6 SPR-P6-420-COM', 'PERC', 420, 37.30, 14.22, 31.30, 13.42, 21.40),
  mod('sp-5', 'SunPower', 'Maxeon 7 SPR-M450-H-AC', 'HBC', 450, 39.40, 14.44, 33.10, 13.60, 24.40),

  // --- Meyer Burger ---
  mod('mb-1', 'Meyer Burger', 'White 400W', 'HJT', 400, 37.80, 13.38, 31.80, 12.58, 21.80),
  mod('mb-2', 'Meyer Burger', 'Black 395W', 'HJT', 395, 37.50, 13.31, 31.50, 12.54, 21.50),
  mod('mb-3', 'Meyer Burger', 'Glass 380W', 'HJT', 380, 36.90, 13.01, 31.00, 12.26, 21.00),
  mod('mb-4', 'Meyer Burger', 'White 420W', 'HJT', 420, 38.40, 13.82, 32.30, 13.00, 22.30),
  mod('mb-5', 'Meyer Burger', 'White 440W', 'HJT', 440, 39.10, 14.22, 32.80, 13.41, 22.80),

  // --- Waaree ---
  mod('wa-1', 'Waaree', 'WS-545 Bifacial', 'PERC', 545, 49.60, 13.88, 41.60, 13.10, 21.10),
  mod('wa-2', 'Waaree', 'WS-440 Mono', 'PERC', 440, 37.90, 14.66, 31.80, 13.84, 21.60),
  mod('wa-3', 'Waaree', 'WS-580 TOPCon', 'TOPCon', 580, 51.60, 14.20, 43.30, 13.39, 22.10),
  mod('wa-4', 'Waaree', 'WS-620 TOPCon Bifacial', 'TOPCon', 620, 52.90, 14.80, 44.40, 13.96, 22.50),
  mod('wa-5', 'Waaree', 'WS-410 Mono PERC', 'Monofacial', 410, 37.10, 13.96, 31.20, 13.14, 20.80),
  mod('wa-6', 'Waaree', 'WS-660 TOPCon G12', 'TOPCon', 660, 54.20, 15.40, 45.50, 14.51, 22.70),

  // --- Adani Solar ---
  mod('adani-1', 'Adani Solar', 'ASP-7-AAA-545-M Bifacial', 'PERC', 545, 49.40, 13.94, 41.50, 13.13, 21.20),
  mod('adani-2', 'Adani Solar', 'ASP-7-AAA-440-M Mono', 'PERC', 440, 37.80, 14.70, 31.70, 13.88, 21.50),
  mod('adani-3', 'Adani Solar', 'ASP-N-580 TOPCon', 'TOPCon', 580, 51.50, 14.23, 43.20, 13.43, 22.00),
  mod('adani-4', 'Adani Solar', 'ASP-N-620 TOPCon Bifacial', 'TOPCon', 620, 52.70, 14.86, 44.20, 14.03, 22.40),
  mod('adani-5', 'Adani Solar', 'ASP-7-AAA-410-M', 'Monofacial', 410, 37.00, 14.00, 31.10, 13.18, 20.70),

  // --- Vikram Solar ---
  mod('vikram-1', 'Vikram Solar', 'Somera Grand 545 Bifacial', 'PERC', 545, 49.50, 13.90, 41.60, 13.10, 21.10),
  mod('vikram-2', 'Vikram Solar', 'Prexos 440', 'PERC', 440, 37.70, 14.72, 31.60, 13.92, 21.50),
  mod('vikram-3', 'Vikram Solar', 'Somera Grand 580 TOPCon', 'TOPCon', 580, 51.40, 14.25, 43.10, 13.46, 22.00),
  mod('vikram-4', 'Vikram Solar', 'Somera Grand 620 TOPCon', 'TOPCon', 620, 52.60, 14.88, 44.10, 14.06, 22.40),
  mod('vikram-5', 'Vikram Solar', 'Prexos 410 Mono', 'Monofacial', 410, 37.00, 14.00, 31.10, 13.18, 20.60),

  // --- Renewsys ---
  mod('renewsys-1', 'Renewsys', 'DESERV 545W Bifacial', 'PERC', 545, 49.30, 13.96, 41.40, 13.16, 21.00),
  mod('renewsys-2', 'Renewsys', 'DESERV 440W Mono', 'PERC', 440, 37.60, 14.76, 31.50, 13.97, 21.40),
  mod('renewsys-3', 'Renewsys', 'DESERV 410W', 'Monofacial', 410, 37.00, 14.00, 31.00, 13.23, 20.50),
  mod('renewsys-4', 'Renewsys', 'DESERV 580W TOPCon', 'TOPCon', 580, 51.30, 14.28, 43.00, 13.49, 21.90),
  mod('renewsys-5', 'Renewsys', 'DESERV 500W Bifacial', 'Bifacial', 500, 48.10, 13.13, 40.40, 12.38, 20.80),
];

export const ALL_TECHNOLOGIES: Technology[] = [
  'PERC', 'TOPCon', 'HJT', 'HBC', 'Bifacial', 'Monofacial', 'Tandem', 'CIGS', 'CdTe', 'n-type', 'p-type',
];

export const MANUFACTURERS = Array.from(new Set(MODULE_DATABASE.map(m => m.manufacturer))).sort();

export function getStandardsForTechnology(tech: Technology): string[] {
  const standards = ['IEC 61215:2021 (TC/HF)'];
  if (tech === 'HJT' || tech === 'HBC' || tech === 'Tandem') {
    standards.push('PVEL LETID Sensitivity Test Protocol');
    standards.push('IEC TS 62804-1:2025 (PID - HV up to +/-4000V)');
  } else if (tech === 'TOPCon' || tech === 'n-type') {
    standards.push('IEC 61215:2021 MQT19 (LETID)');
    standards.push('IEC TS 62804-1:2025 (PID - up to +/-2000V)');
  } else if (tech === 'CdTe' || tech === 'CIGS') {
    standards.push('IEC TS 62804-1:2025 (PID - +/-1000V)');
  } else {
    standards.push('IEC 61215:2021 MQT19 (LETID)');
    standards.push('IEC TS 62804-1:2025 (PID - +/-1000V)');
  }
  return standards;
}
