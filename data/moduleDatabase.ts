// PV Module Database — comprehensive specs for reliability testing
// Covers: LONGi, JA Solar, Trina, Canadian Solar, Jinko, First Solar,
// Risen, CSUN, HT-SAAE, REC, Panasonic, SunPower, Meyer Burger,
// Waaree, Adani Solar, Vikram Solar, Renewsys

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
  wafer: string;
  testLimits: TestLimits;
}

function makeTestLimits(Voc: number, Isc: number, opts?: { pidVbias?: number }): TestLimits {
  const pidV = opts?.pidVbias ?? 1000;
  return {
    tc: { Vmax: Voc * 1.15, Isc_TC: Isc },
    hf: { Vmax: Voc * 1.15, frequency: 1, Isc_HF: Isc },
    letid: { Iinject: Isc, Voc, cellTemp: 75 },
    pid: { Vbias: pidV, Imax_leak: 5, duration: 96 },
  };
}

export const MODULE_DATABASE: PVModule[] = [
  // ==================== LONGi ====================
  { id: 'longi-1', manufacturer: 'LONGi', model: 'Hi-MO 7 LR5-72HGD 580M', technology: 'HJT', Pmax: 580, Voc: 51.50, Isc: 14.35, Vmp: 43.30, Imp: 13.40, efficiency: 22.5, wafer: 'M10', testLimits: makeTestLimits(51.50, 14.35) },
  { id: 'longi-2', manufacturer: 'LONGi', model: 'Hi-MO 6 LR5-72HPH 560M', technology: 'PERC', Pmax: 560, Voc: 49.95, Isc: 14.22, Vmp: 42.10, Imp: 13.30, efficiency: 21.8, wafer: 'M10', testLimits: makeTestLimits(49.95, 14.22) },
  { id: 'longi-3', manufacturer: 'LONGi', model: 'Hi-MO X6 LR7-72HBD 620M', technology: 'HBC', Pmax: 620, Voc: 53.80, Isc: 14.75, Vmp: 44.50, Imp: 13.93, efficiency: 23.3, wafer: 'G12', testLimits: makeTestLimits(53.80, 14.75) },
  { id: 'longi-4', manufacturer: 'LONGi', model: 'Hi-MO 5 LR5-54HPH 420M', technology: 'PERC', Pmax: 420, Voc: 37.25, Isc: 14.18, Vmp: 31.50, Imp: 13.33, efficiency: 21.3, wafer: 'M10', testLimits: makeTestLimits(37.25, 14.18) },
  { id: 'longi-5', manufacturer: 'LONGi', model: 'Hi-MO 9 LR7-72HBD 660M', technology: 'HBC', Pmax: 660, Voc: 55.20, Isc: 15.30, Vmp: 46.00, Imp: 14.35, efficiency: 24.0, wafer: 'G12', testLimits: makeTestLimits(55.20, 15.30) },

  // ==================== JA Solar ====================
  { id: 'ja-1', manufacturer: 'JA Solar', model: 'DeepBlue 4.0 Pro JAM72D42-585/LB', technology: 'TOPCon', Pmax: 585, Voc: 51.88, Isc: 14.45, Vmp: 43.62, Imp: 13.41, efficiency: 22.6, wafer: 'M10', testLimits: makeTestLimits(51.88, 14.45) },
  { id: 'ja-2', manufacturer: 'JA Solar', model: 'DeepBlue 3.0 JAM72S30-540/MR', technology: 'PERC', Pmax: 540, Voc: 49.42, Isc: 13.95, Vmp: 41.52, Imp: 13.01, efficiency: 21.0, wafer: 'M10', testLimits: makeTestLimits(49.42, 13.95) },
  { id: 'ja-3', manufacturer: 'JA Solar', model: 'DeepBlue 4.0 JAM54D40-440/LB', technology: 'TOPCon', Pmax: 440, Voc: 38.14, Isc: 14.55, Vmp: 32.55, Imp: 13.52, efficiency: 22.3, wafer: 'M10', testLimits: makeTestLimits(38.14, 14.55) },
  { id: 'ja-4', manufacturer: 'JA Solar', model: 'DeepBlue 4.0 JAM78D42-620/LB', technology: 'TOPCon', Pmax: 620, Voc: 54.35, Isc: 14.60, Vmp: 45.90, Imp: 13.51, efficiency: 22.8, wafer: 'M10', testLimits: makeTestLimits(54.35, 14.60) },
  { id: 'ja-5', manufacturer: 'JA Solar', model: 'DeepBlue 3.0 JAM60S20-380/MR', technology: 'PERC', Pmax: 380, Voc: 34.82, Isc: 13.88, Vmp: 29.36, Imp: 12.95, efficiency: 20.7, wafer: 'M10', testLimits: makeTestLimits(34.82, 13.88) },

  // ==================== Trina Solar ====================
  { id: 'trina-1', manufacturer: 'Trina Solar', model: 'Vertex N TSM-DE21 700W', technology: 'TOPCon', Pmax: 700, Voc: 48.80, Isc: 18.49, Vmp: 41.10, Imp: 17.03, efficiency: 22.5, wafer: 'G12', testLimits: makeTestLimits(48.80, 18.49) },
  { id: 'trina-2', manufacturer: 'Trina Solar', model: 'Vertex S+ TSM-NEG9R.28 445W', technology: 'TOPCon', Pmax: 445, Voc: 38.60, Isc: 14.68, Vmp: 32.40, Imp: 13.73, efficiency: 22.5, wafer: 'M10', testLimits: makeTestLimits(38.60, 14.68) },
  { id: 'trina-3', manufacturer: 'Trina Solar', model: 'Vertex S TSM-DE09.08 405W', technology: 'PERC', Pmax: 405, Voc: 36.86, Isc: 13.92, Vmp: 31.00, Imp: 13.06, efficiency: 21.1, wafer: 'M10', testLimits: makeTestLimits(36.86, 13.92) },
  { id: 'trina-4', manufacturer: 'Trina Solar', model: 'Vertex N TSM-NEG19RC.20 590W', technology: 'TOPCon', Pmax: 590, Voc: 52.10, Isc: 14.52, Vmp: 43.80, Imp: 13.47, efficiency: 22.7, wafer: 'M10', testLimits: makeTestLimits(52.10, 14.52) },
  { id: 'trina-5', manufacturer: 'Trina Solar', model: 'Vertex N TSM-DE21 750W', technology: 'TOPCon', Pmax: 750, Voc: 50.20, Isc: 19.25, Vmp: 42.30, Imp: 17.73, efficiency: 23.2, wafer: 'G12', testLimits: makeTestLimits(50.20, 19.25) },

  // ==================== Canadian Solar ====================
  { id: 'cs-1', manufacturer: 'Canadian Solar', model: 'HiKu7 CS7N-665TB-AG', technology: 'TOPCon', Pmax: 665, Voc: 47.20, Isc: 18.15, Vmp: 39.80, Imp: 16.71, efficiency: 22.3, wafer: 'G12', testLimits: makeTestLimits(47.20, 18.15) },
  { id: 'cs-2', manufacturer: 'Canadian Solar', model: 'HiKu6 CS6R-425H-AG', technology: 'PERC', Pmax: 425, Voc: 37.20, Isc: 14.42, Vmp: 31.40, Imp: 13.54, efficiency: 21.5, wafer: 'M10', testLimits: makeTestLimits(37.20, 14.42) },
  { id: 'cs-3', manufacturer: 'Canadian Solar', model: 'HiKu7 CS7L-595MS', technology: 'PERC', Pmax: 595, Voc: 52.30, Isc: 14.50, Vmp: 44.00, Imp: 13.52, efficiency: 21.4, wafer: 'G12', testLimits: makeTestLimits(52.30, 14.50) },
  { id: 'cs-4', manufacturer: 'Canadian Solar', model: 'TOPBiHiKu7 CS7N-720TB-AG', technology: 'TOPCon', Pmax: 720, Voc: 49.60, Isc: 18.72, Vmp: 41.80, Imp: 17.22, efficiency: 22.8, wafer: 'G12', testLimits: makeTestLimits(49.60, 18.72) },
  { id: 'cs-5', manufacturer: 'Canadian Solar', model: 'HiKu6 CS6W-545MS', technology: 'PERC', Pmax: 545, Voc: 49.20, Isc: 14.10, Vmp: 41.30, Imp: 13.20, efficiency: 21.2, wafer: 'M10', testLimits: makeTestLimits(49.20, 14.10) },

  // ==================== Jinko Solar ====================
  { id: 'jinko-1', manufacturer: 'Jinko Solar', model: 'Tiger Neo JKM580N-72HL4-BDV', technology: 'TOPCon', Pmax: 580, Voc: 51.72, Isc: 14.38, Vmp: 43.56, Imp: 13.32, efficiency: 22.53, wafer: 'M10', testLimits: makeTestLimits(51.72, 14.38) },
  { id: 'jinko-2', manufacturer: 'Jinko Solar', model: 'Tiger Neo JKM450N-54HL4-V', technology: 'TOPCon', Pmax: 450, Voc: 38.42, Isc: 14.84, Vmp: 33.72, Imp: 13.35, efficiency: 22.27, wafer: 'M10', testLimits: makeTestLimits(38.42, 14.84) },
  { id: 'jinko-3', manufacturer: 'Jinko Solar', model: 'Tiger Pro JKM545M-72HL4-V', technology: 'PERC', Pmax: 545, Voc: 49.62, Isc: 13.98, Vmp: 41.64, Imp: 13.09, efficiency: 21.21, wafer: 'M10', testLimits: makeTestLimits(49.62, 13.98) },
  { id: 'jinko-4', manufacturer: 'Jinko Solar', model: 'Tiger Neo JKM700N-78HL4-BDV', technology: 'TOPCon', Pmax: 700, Voc: 54.58, Isc: 16.50, Vmp: 45.95, Imp: 15.23, efficiency: 22.65, wafer: 'G12', testLimits: makeTestLimits(54.58, 16.50) },
  { id: 'jinko-5', manufacturer: 'Jinko Solar', model: 'Tiger Neo JKM620N-78HL4-BDV', technology: 'TOPCon', Pmax: 620, Voc: 52.10, Isc: 15.28, Vmp: 43.88, Imp: 14.13, efficiency: 22.02, wafer: 'M10', testLimits: makeTestLimits(52.10, 15.28) },

  // ==================== First Solar ====================
  { id: 'fs-1', manufacturer: 'First Solar', model: 'Series 7 FS-7445A', technology: 'CdTe', Pmax: 445, Voc: 219.2, Isc: 2.56, Vmp: 184.5, Imp: 2.41, efficiency: 18.5, wafer: 'Thin-Film', testLimits: makeTestLimits(219.2, 2.56, { pidVbias: 1000 }) },
  { id: 'fs-2', manufacturer: 'First Solar', model: 'Series 7 FS-7460A', technology: 'CdTe', Pmax: 460, Voc: 221.5, Isc: 2.62, Vmp: 186.8, Imp: 2.46, efficiency: 19.1, wafer: 'Thin-Film', testLimits: makeTestLimits(221.5, 2.62, { pidVbias: 1000 }) },
  { id: 'fs-3', manufacturer: 'First Solar', model: 'Series 6 Plus FS-6420A', technology: 'CdTe', Pmax: 420, Voc: 218.0, Isc: 2.44, Vmp: 182.0, Imp: 2.31, efficiency: 18.2, wafer: 'Thin-Film', testLimits: makeTestLimits(218.0, 2.44, { pidVbias: 1000 }) },
  { id: 'fs-4', manufacturer: 'First Solar', model: 'Series 7 FS-7475A', technology: 'CdTe', Pmax: 475, Voc: 223.0, Isc: 2.68, Vmp: 188.5, Imp: 2.52, efficiency: 19.5, wafer: 'Thin-Film', testLimits: makeTestLimits(223.0, 2.68, { pidVbias: 1000 }) },
  { id: 'fs-5', manufacturer: 'First Solar', model: 'Series 6 FS-6400', technology: 'CdTe', Pmax: 400, Voc: 216.0, Isc: 2.35, Vmp: 180.5, Imp: 2.22, efficiency: 17.7, wafer: 'Thin-Film', testLimits: makeTestLimits(216.0, 2.35, { pidVbias: 1000 }) },

  // ==================== Risen Energy ====================
  { id: 'risen-1', manufacturer: 'Risen Energy', model: 'Titan S RSM40-8-410M', technology: 'PERC', Pmax: 410, Voc: 37.04, Isc: 14.00, Vmp: 31.22, Imp: 13.13, efficiency: 21.1, wafer: 'M10', testLimits: makeTestLimits(37.04, 14.00) },
  { id: 'risen-2', manufacturer: 'Risen Energy', model: 'Hyper-ion RSM132-8-685BHDG', technology: 'HJT', Pmax: 685, Voc: 48.56, Isc: 18.20, Vmp: 40.80, Imp: 16.79, efficiency: 22.7, wafer: 'G12', testLimits: makeTestLimits(48.56, 18.20) },
  { id: 'risen-3', manufacturer: 'Risen Energy', model: 'Titan RSM110-8-545M', technology: 'PERC', Pmax: 545, Voc: 49.55, Isc: 14.00, Vmp: 41.60, Imp: 13.10, efficiency: 21.1, wafer: 'M10', testLimits: makeTestLimits(49.55, 14.00) },
  { id: 'risen-4', manufacturer: 'Risen Energy', model: 'Hyper-ion RSM110-8-580BHDG', technology: 'HJT', Pmax: 580, Voc: 51.20, Isc: 14.48, Vmp: 43.10, Imp: 13.46, efficiency: 22.5, wafer: 'M10', testLimits: makeTestLimits(51.20, 14.48) },
  { id: 'risen-5', manufacturer: 'Risen Energy', model: 'Titan S RSM40-8-430N', technology: 'TOPCon', Pmax: 430, Voc: 37.80, Isc: 14.42, Vmp: 31.90, Imp: 13.48, efficiency: 22.0, wafer: 'M10', testLimits: makeTestLimits(37.80, 14.42) },

  // ==================== CSUN ====================
  { id: 'csun-1', manufacturer: 'CSUN', model: 'CSUN550-144M-HE', technology: 'PERC', Pmax: 550, Voc: 49.80, Isc: 14.08, Vmp: 41.90, Imp: 13.13, efficiency: 21.3, wafer: 'M10', testLimits: makeTestLimits(49.80, 14.08) },
  { id: 'csun-2', manufacturer: 'CSUN', model: 'CSUN410-108M-HE', technology: 'PERC', Pmax: 410, Voc: 37.30, Isc: 13.98, Vmp: 31.40, Imp: 13.06, efficiency: 21.0, wafer: 'M10', testLimits: makeTestLimits(37.30, 13.98) },
  { id: 'csun-3', manufacturer: 'CSUN', model: 'CSUN580-144N-HE', technology: 'TOPCon', Pmax: 580, Voc: 51.60, Isc: 14.35, Vmp: 43.40, Imp: 13.36, efficiency: 22.4, wafer: 'M10', testLimits: makeTestLimits(51.60, 14.35) },
  { id: 'csun-4', manufacturer: 'CSUN', model: 'CSUN440-108N-HE', technology: 'TOPCon', Pmax: 440, Voc: 38.20, Isc: 14.60, Vmp: 32.30, Imp: 13.62, efficiency: 22.2, wafer: 'M10', testLimits: makeTestLimits(38.20, 14.60) },
  { id: 'csun-5', manufacturer: 'CSUN', model: 'CSUN670-132N-HE', technology: 'TOPCon', Pmax: 670, Voc: 47.40, Isc: 18.20, Vmp: 39.90, Imp: 16.79, efficiency: 22.5, wafer: 'G12', testLimits: makeTestLimits(47.40, 18.20) },

  // ==================== HT-SAAE ====================
  { id: 'htsaae-1', manufacturer: 'HT-SAAE', model: 'HTM545MH-72', technology: 'PERC', Pmax: 545, Voc: 49.60, Isc: 14.00, Vmp: 41.60, Imp: 13.10, efficiency: 21.1, wafer: 'M10', testLimits: makeTestLimits(49.60, 14.00) },
  { id: 'htsaae-2', manufacturer: 'HT-SAAE', model: 'HTN580MH-72', technology: 'TOPCon', Pmax: 580, Voc: 51.40, Isc: 14.40, Vmp: 43.20, Imp: 13.43, efficiency: 22.4, wafer: 'M10', testLimits: makeTestLimits(51.40, 14.40) },
  { id: 'htsaae-3', manufacturer: 'HT-SAAE', model: 'HTM410MH-54', technology: 'PERC', Pmax: 410, Voc: 37.10, Isc: 14.02, Vmp: 31.20, Imp: 13.14, efficiency: 21.0, wafer: 'M10', testLimits: makeTestLimits(37.10, 14.02) },
  { id: 'htsaae-4', manufacturer: 'HT-SAAE', model: 'HTN445MH-54', technology: 'TOPCon', Pmax: 445, Voc: 38.50, Isc: 14.62, Vmp: 32.50, Imp: 13.69, efficiency: 22.3, wafer: 'M10', testLimits: makeTestLimits(38.50, 14.62) },
  { id: 'htsaae-5', manufacturer: 'HT-SAAE', model: 'HTN700MH-78', technology: 'TOPCon', Pmax: 700, Voc: 54.80, Isc: 16.42, Vmp: 46.10, Imp: 15.18, efficiency: 22.6, wafer: 'G12', testLimits: makeTestLimits(54.80, 16.42) },

  // ==================== REC Solar ====================
  { id: 'rec-1', manufacturer: 'REC Solar', model: 'Alpha Pure-R REC430AA', technology: 'HJT', Pmax: 430, Voc: 48.80, Isc: 11.38, Vmp: 40.50, Imp: 10.62, efficiency: 22.3, wafer: 'M10', testLimits: makeTestLimits(48.80, 11.38) },
  { id: 'rec-2', manufacturer: 'REC Solar', model: 'TwinPeak 5 REC445TP5', technology: 'PERC', Pmax: 445, Voc: 41.90, Isc: 13.60, Vmp: 34.80, Imp: 12.79, efficiency: 21.6, wafer: 'M10', testLimits: makeTestLimits(41.90, 13.60) },
  { id: 'rec-3', manufacturer: 'REC Solar', model: 'Alpha Pure-R REC470AA', technology: 'HJT', Pmax: 470, Voc: 50.40, Isc: 12.05, Vmp: 42.00, Imp: 11.19, efficiency: 22.6, wafer: 'M10', testLimits: makeTestLimits(50.40, 12.05) },
  { id: 'rec-4', manufacturer: 'REC Solar', model: 'TwinPeak 4 REC370TP4', technology: 'PERC', Pmax: 370, Voc: 40.70, Isc: 11.55, Vmp: 34.20, Imp: 10.82, efficiency: 20.3, wafer: 'M10', testLimits: makeTestLimits(40.70, 11.55) },
  { id: 'rec-5', manufacturer: 'REC Solar', model: 'Alpha HJT REC410AA-72', technology: 'HJT', Pmax: 410, Voc: 47.60, Isc: 11.10, Vmp: 39.50, Imp: 10.38, efficiency: 21.7, wafer: 'M10', testLimits: makeTestLimits(47.60, 11.10) },

  // ==================== Panasonic / HIT ====================
  { id: 'pana-1', manufacturer: 'Panasonic', model: 'EverVolt EVPV410H', technology: 'HJT', Pmax: 410, Voc: 48.68, Isc: 10.86, Vmp: 40.20, Imp: 10.20, efficiency: 22.2, wafer: 'M10', testLimits: makeTestLimits(48.68, 10.86) },
  { id: 'pana-2', manufacturer: 'Panasonic', model: 'EverVolt EVPV380H', technology: 'HJT', Pmax: 380, Voc: 46.80, Isc: 10.48, Vmp: 38.90, Imp: 9.77, efficiency: 21.2, wafer: 'M10', testLimits: makeTestLimits(46.80, 10.48) },
  { id: 'pana-3', manufacturer: 'Panasonic', model: 'HIT N340 VBHN340SA17', technology: 'HJT', Pmax: 340, Voc: 69.70, Isc: 6.17, Vmp: 59.70, Imp: 5.70, efficiency: 20.3, wafer: 'M6', testLimits: makeTestLimits(69.70, 6.17) },
  { id: 'pana-4', manufacturer: 'Panasonic', model: 'EverVolt EVPV430H', technology: 'HJT', Pmax: 430, Voc: 50.10, Isc: 11.08, Vmp: 41.50, Imp: 10.36, efficiency: 22.6, wafer: 'M10', testLimits: makeTestLimits(50.10, 11.08) },
  { id: 'pana-5', manufacturer: 'Panasonic', model: 'HIT N330 VBHN330SA17', technology: 'HJT', Pmax: 330, Voc: 69.10, Isc: 6.08, Vmp: 58.60, Imp: 5.63, efficiency: 19.7, wafer: 'M6', testLimits: makeTestLimits(69.10, 6.08) },

  // ==================== SunPower ====================
  { id: 'sp-1', manufacturer: 'SunPower', model: 'Maxeon 6 SPR-MAX6-440', technology: 'HBC', Pmax: 440, Voc: 48.50, Isc: 11.60, Vmp: 40.20, Imp: 10.95, efficiency: 22.8, wafer: 'M10', testLimits: makeTestLimits(48.50, 11.60) },
  { id: 'sp-2', manufacturer: 'SunPower', model: 'Maxeon 3 SPR-MAX3-400', technology: 'HBC', Pmax: 400, Voc: 75.60, Isc: 6.65, Vmp: 65.00, Imp: 6.15, efficiency: 22.7, wafer: 'M6', testLimits: makeTestLimits(75.60, 6.65) },
  { id: 'sp-3', manufacturer: 'SunPower', model: 'Performance P3-375', technology: 'PERC', Pmax: 375, Voc: 40.10, Isc: 12.10, Vmp: 33.50, Imp: 11.19, efficiency: 20.4, wafer: 'M10', testLimits: makeTestLimits(40.10, 12.10) },
  { id: 'sp-4', manufacturer: 'SunPower', model: 'Maxeon 7 SPR-MAX7-470', technology: 'HBC', Pmax: 470, Voc: 49.80, Isc: 12.12, Vmp: 41.30, Imp: 11.38, efficiency: 24.0, wafer: 'M10', testLimits: makeTestLimits(49.80, 12.12) },
  { id: 'sp-5', manufacturer: 'SunPower', model: 'Maxeon 5 AC SPR-MAX5-415', technology: 'HBC', Pmax: 415, Voc: 47.20, Isc: 11.32, Vmp: 39.40, Imp: 10.53, efficiency: 22.2, wafer: 'M10', testLimits: makeTestLimits(47.20, 11.32) },

  // ==================== Meyer Burger ====================
  { id: 'mb-1', manufacturer: 'Meyer Burger', model: 'White HJT 400W', technology: 'HJT', Pmax: 400, Voc: 48.20, Isc: 10.72, Vmp: 40.50, Imp: 9.88, efficiency: 21.7, wafer: 'M10', testLimits: makeTestLimits(48.20, 10.72) },
  { id: 'mb-2', manufacturer: 'Meyer Burger', model: 'Glass HJT 380W', technology: 'HJT', Pmax: 380, Voc: 47.60, Isc: 10.32, Vmp: 39.80, Imp: 9.55, efficiency: 21.0, wafer: 'M10', testLimits: makeTestLimits(47.60, 10.32) },
  { id: 'mb-3', manufacturer: 'Meyer Burger', model: 'White HJT 420W', technology: 'HJT', Pmax: 420, Voc: 49.30, Isc: 11.00, Vmp: 41.20, Imp: 10.19, efficiency: 22.1, wafer: 'M10', testLimits: makeTestLimits(49.30, 11.00) },
  { id: 'mb-4', manufacturer: 'Meyer Burger', model: 'Black HJT 395W', technology: 'HJT', Pmax: 395, Voc: 47.90, Isc: 10.65, Vmp: 40.20, Imp: 9.83, efficiency: 21.5, wafer: 'M10', testLimits: makeTestLimits(47.90, 10.65) },
  { id: 'mb-5', manufacturer: 'Meyer Burger', model: 'White HJT 440W', technology: 'HJT', Pmax: 440, Voc: 50.50, Isc: 11.25, Vmp: 42.10, Imp: 10.45, efficiency: 22.5, wafer: 'M10', testLimits: makeTestLimits(50.50, 11.25) },

  // ==================== Waaree (India) ====================
  { id: 'waaree-1', manufacturer: 'Waaree', model: 'WS-545 Bifacial', technology: 'PERC', Pmax: 545, Voc: 49.60, Isc: 13.96, Vmp: 41.70, Imp: 13.07, efficiency: 21.1, wafer: 'M10', testLimits: makeTestLimits(49.60, 13.96) },
  { id: 'waaree-2', manufacturer: 'Waaree', model: 'WS-585N TOPCon', technology: 'TOPCon', Pmax: 585, Voc: 51.80, Isc: 14.45, Vmp: 43.60, Imp: 13.42, efficiency: 22.5, wafer: 'M10', testLimits: makeTestLimits(51.80, 14.45) },
  { id: 'waaree-3', manufacturer: 'Waaree', model: 'WS-410 Mono', technology: 'PERC', Pmax: 410, Voc: 37.20, Isc: 14.00, Vmp: 31.30, Imp: 13.10, efficiency: 21.0, wafer: 'M10', testLimits: makeTestLimits(37.20, 14.00) },
  { id: 'waaree-4', manufacturer: 'Waaree', model: 'WS-445N TOPCon', technology: 'TOPCon', Pmax: 445, Voc: 38.40, Isc: 14.65, Vmp: 32.40, Imp: 13.73, efficiency: 22.3, wafer: 'M10', testLimits: makeTestLimits(38.40, 14.65) },
  { id: 'waaree-5', manufacturer: 'Waaree', model: 'WS-670N G12', technology: 'TOPCon', Pmax: 670, Voc: 47.50, Isc: 18.18, Vmp: 39.90, Imp: 16.79, efficiency: 22.5, wafer: 'G12', testLimits: makeTestLimits(47.50, 18.18) },

  // ==================== Adani Solar (India) ====================
  { id: 'adani-1', manufacturer: 'Adani Solar', model: 'ASP-7-550W Bifacial', technology: 'PERC', Pmax: 550, Voc: 49.80, Isc: 14.05, Vmp: 41.80, Imp: 13.16, efficiency: 21.3, wafer: 'M10', testLimits: makeTestLimits(49.80, 14.05) },
  { id: 'adani-2', manufacturer: 'Adani Solar', model: 'ASP-7-585N TOPCon', technology: 'TOPCon', Pmax: 585, Voc: 51.70, Isc: 14.48, Vmp: 43.50, Imp: 13.45, efficiency: 22.5, wafer: 'M10', testLimits: makeTestLimits(51.70, 14.48) },
  { id: 'adani-3', manufacturer: 'Adani Solar', model: 'ASP-7-410W Mono', technology: 'PERC', Pmax: 410, Voc: 37.15, Isc: 14.02, Vmp: 31.25, Imp: 13.12, efficiency: 21.0, wafer: 'M10', testLimits: makeTestLimits(37.15, 14.02) },
  { id: 'adani-4', manufacturer: 'Adani Solar', model: 'ASP-7-445N TOPCon', technology: 'TOPCon', Pmax: 445, Voc: 38.35, Isc: 14.62, Vmp: 32.35, Imp: 13.76, efficiency: 22.2, wafer: 'M10', testLimits: makeTestLimits(38.35, 14.62) },
  { id: 'adani-5', manufacturer: 'Adani Solar', model: 'ASP-7-700N G12', technology: 'TOPCon', Pmax: 700, Voc: 49.50, Isc: 18.25, Vmp: 41.70, Imp: 16.79, efficiency: 22.6, wafer: 'G12', testLimits: makeTestLimits(49.50, 18.25) },

  // ==================== Vikram Solar (India) ====================
  { id: 'vikram-1', manufacturer: 'Vikram Solar', model: 'Somera Grand 545', technology: 'PERC', Pmax: 545, Voc: 49.50, Isc: 14.00, Vmp: 41.60, Imp: 13.10, efficiency: 21.1, wafer: 'M10', testLimits: makeTestLimits(49.50, 14.00) },
  { id: 'vikram-2', manufacturer: 'Vikram Solar', model: 'Prexos 585N', technology: 'TOPCon', Pmax: 585, Voc: 51.60, Isc: 14.50, Vmp: 43.40, Imp: 13.48, efficiency: 22.5, wafer: 'M10', testLimits: makeTestLimits(51.60, 14.50) },
  { id: 'vikram-3', manufacturer: 'Vikram Solar', model: 'Somera 410', technology: 'PERC', Pmax: 410, Voc: 37.10, Isc: 14.05, Vmp: 31.20, Imp: 13.14, efficiency: 21.0, wafer: 'M10', testLimits: makeTestLimits(37.10, 14.05) },
  { id: 'vikram-4', manufacturer: 'Vikram Solar', model: 'Prexos 445N', technology: 'TOPCon', Pmax: 445, Voc: 38.30, Isc: 14.68, Vmp: 32.30, Imp: 13.78, efficiency: 22.3, wafer: 'M10', testLimits: makeTestLimits(38.30, 14.68) },
  { id: 'vikram-5', manufacturer: 'Vikram Solar', model: 'Prexos 680N G12', technology: 'TOPCon', Pmax: 680, Voc: 47.60, Isc: 18.40, Vmp: 40.00, Imp: 17.00, efficiency: 22.6, wafer: 'G12', testLimits: makeTestLimits(47.60, 18.40) },

  // ==================== Renewsys (India) ====================
  { id: 'renewsys-1', manufacturer: 'Renewsys', model: 'DESERV 540 Bifacial', technology: 'PERC', Pmax: 540, Voc: 49.40, Isc: 13.92, Vmp: 41.50, Imp: 13.01, efficiency: 20.9, wafer: 'M10', testLimits: makeTestLimits(49.40, 13.92) },
  { id: 'renewsys-2', manufacturer: 'Renewsys', model: 'DESERV 580N TOPCon', technology: 'TOPCon', Pmax: 580, Voc: 51.40, Isc: 14.42, Vmp: 43.20, Imp: 13.43, efficiency: 22.3, wafer: 'M10', testLimits: makeTestLimits(51.40, 14.42) },
  { id: 'renewsys-3', manufacturer: 'Renewsys', model: 'DESERV 405 Mono', technology: 'PERC', Pmax: 405, Voc: 37.00, Isc: 13.90, Vmp: 31.10, Imp: 13.02, efficiency: 20.8, wafer: 'M10', testLimits: makeTestLimits(37.00, 13.90) },
  { id: 'renewsys-4', manufacturer: 'Renewsys', model: 'DESERV 440N TOPCon', technology: 'TOPCon', Pmax: 440, Voc: 38.10, Isc: 14.58, Vmp: 32.10, Imp: 13.71, efficiency: 22.0, wafer: 'M10', testLimits: makeTestLimits(38.10, 14.58) },
  { id: 'renewsys-5', manufacturer: 'Renewsys', model: 'DESERV 660N G12', technology: 'TOPCon', Pmax: 660, Voc: 47.20, Isc: 18.00, Vmp: 39.70, Imp: 16.62, efficiency: 22.2, wafer: 'G12', testLimits: makeTestLimits(47.20, 18.00) },
];

export const MANUFACTURERS = [...new Set(MODULE_DATABASE.map((m) => m.manufacturer))];
export const TECHNOLOGIES: Technology[] = ['PERC', 'TOPCon', 'HJT', 'HBC', 'Bifacial', 'Monofacial', 'Tandem', 'CIGS', 'CdTe', 'n-type', 'p-type'];
