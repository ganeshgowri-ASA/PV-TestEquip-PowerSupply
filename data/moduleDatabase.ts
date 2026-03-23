// PV Module Database — Comprehensive manufacturer data for reliability testing
// Covers: LONGi, JA Solar, Trina Solar, Canadian Solar, Jinko Solar, First Solar,
// Risen Energy, CSUN, HT-SAAE, REC Solar, Panasonic/HIT, SunPower, Meyer Burger,
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

function makeTestLimits(Voc: number, Isc: number, tech: Technology): TestLimits {
  const isHV = tech === 'CdTe' || tech === 'CIGS';
  const pidVbias = isHV ? 1000 : (tech === 'HJT' || tech === 'HBC' || tech === 'Tandem') ? 4000 : 1500;
  return {
    tc: { Vmax: Voc * 1.15, Isc_TC: Isc },
    hf: { Vmax: Voc * 1.15, frequency: 1, Isc_HF: Isc },
    letid: { Iinject: Isc, Voc, cellTemp: 75 },
    pid: { Vbias: pidVbias, Imax_leak: 5, duration: 96 },
  };
}

function m(
  id: string, manufacturer: string, model: string, technology: Technology,
  Pmax: number, Voc: number, Isc: number, Vmp: number, Imp: number,
  efficiency: number, wafer: string
): PVModule {
  return { id, manufacturer, model, technology, Pmax, Voc, Isc, Vmp, Imp, efficiency, wafer, testLimits: makeTestLimits(Voc, Isc, technology) };
}

export const MODULE_DATABASE: PVModule[] = [
  // ─── LONGi ───
  m('longi-01', 'LONGi', 'Hi-MO 7 LR5-72HGD 580M', 'TOPCon', 580, 51.90, 14.18, 43.60, 13.30, 22.5, 'M10'),
  m('longi-02', 'LONGi', 'Hi-MO 6 LR5-72HPH 560M', 'PERC', 560, 49.80, 14.35, 41.80, 13.40, 21.6, 'M10'),
  m('longi-03', 'LONGi', 'Hi-MO X6 LR7-72HGD 620M', 'TOPCon', 620, 52.50, 14.98, 44.20, 14.03, 23.0, 'G12'),
  m('longi-04', 'LONGi', 'Hi-MO 5m LR5-54HPH 415M', 'PERC', 415, 37.20, 14.15, 31.20, 13.30, 21.3, 'M10'),
  m('longi-05', 'LONGi', 'Hi-MO 9 LR7-72HBD 700M', 'HBC', 700, 55.20, 16.10, 46.50, 15.05, 24.2, 'G12'),

  // ─── JA Solar ───
  m('ja-01', 'JA Solar', 'DeepBlue 4.0 Pro JAM72D42-585/LB', 'TOPCon', 585, 52.10, 14.25, 43.80, 13.36, 22.6, 'M10'),
  m('ja-02', 'JA Solar', 'DeepBlue 3.0 Pro JAM72S30-545/MR', 'PERC', 545, 49.60, 13.98, 41.30, 13.20, 21.1, 'M10'),
  m('ja-03', 'JA Solar', 'DeepBlue 4.0 Pro JAM78D42-620/LB', 'TOPCon', 620, 55.80, 14.10, 46.90, 13.22, 22.8, 'M10'),
  m('ja-04', 'JA Solar', 'DeepBlue 3.0 JAM60S20-385/MR', 'PERC', 385, 34.60, 14.10, 29.10, 13.23, 20.6, 'M10'),
  m('ja-05', 'JA Solar', 'DeepBlue 4.0 JAM72D41-575/GB', 'n-type', 575, 51.80, 14.10, 43.50, 13.22, 22.3, 'M10'),

  // ─── Trina Solar ───
  m('trina-01', 'Trina Solar', 'Vertex N TSM-DE21 700.7', 'TOPCon', 700, 55.30, 16.08, 46.40, 15.09, 23.6, 'G12'),
  m('trina-02', 'Trina Solar', 'Vertex S+ TSM-NEG9R.28 445W', 'TOPCon', 445, 38.20, 14.80, 32.10, 13.86, 22.5, 'M10'),
  m('trina-03', 'Trina Solar', 'Vertex TSM-DE19 545W', 'PERC', 545, 49.40, 14.00, 41.50, 13.13, 21.1, 'M10'),
  m('trina-04', 'Trina Solar', 'Vertex N TSM-DE21 635W', 'TOPCon', 635, 54.10, 14.90, 45.50, 13.96, 22.8, 'G12'),
  m('trina-05', 'Trina Solar', 'Vertex S TSM-DE09R.08 430W', 'PERC', 430, 37.00, 14.76, 31.10, 13.83, 22.0, 'M10'),

  // ─── Canadian Solar ───
  m('cs-01', 'Canadian Solar', 'HiKu7 CS7N-680TB-AG', 'TOPCon', 680, 54.80, 15.75, 46.00, 14.78, 23.2, 'G12'),
  m('cs-02', 'Canadian Solar', 'HiKu6 CS6R-425T', 'TOPCon', 425, 37.90, 14.25, 31.80, 13.36, 21.8, 'M10'),
  m('cs-03', 'Canadian Solar', 'HiKu6 CS6W-555MS', 'PERC', 555, 49.80, 14.15, 41.80, 13.28, 21.4, 'M10'),
  m('cs-04', 'Canadian Solar', 'HiKu7 CS7L-595MS', 'PERC', 595, 51.80, 14.60, 43.50, 13.68, 22.0, 'G12'),
  m('cs-05', 'Canadian Solar', 'HiHero CS-HD7-620TB', 'HJT', 620, 53.50, 14.72, 44.90, 13.81, 23.5, 'G12'),

  // ─── Jinko Solar ───
  m('jinko-01', 'Jinko Solar', 'Tiger Neo JKM580N-72HL4-BDV', 'TOPCon', 580, 51.80, 14.22, 43.50, 13.33, 22.5, 'M10'),
  m('jinko-02', 'Jinko Solar', 'Tiger Pro JKM545M-72HL4', 'PERC', 545, 49.60, 13.96, 41.60, 13.10, 21.1, 'M10'),
  m('jinko-03', 'Jinko Solar', 'Tiger Neo JKM625N-78HL4-BDV', 'TOPCon', 625, 55.90, 14.20, 46.90, 13.33, 22.8, 'M10'),
  m('jinko-04', 'Jinko Solar', 'Tiger Neo JKM700N-78HL4-BDV', 'TOPCon', 700, 55.40, 16.05, 46.50, 15.05, 23.5, 'G12'),
  m('jinko-05', 'Jinko Solar', 'Tiger Pro JKM415M-54HL4-V', 'PERC', 415, 37.00, 14.25, 31.10, 13.34, 21.3, 'M10'),

  // ─── First Solar ───
  m('fs-01', 'First Solar', 'Series 7 FS-7445A', 'CdTe', 445, 219.40, 2.57, 183.80, 2.42, 19.0, 'N/A'),
  m('fs-02', 'First Solar', 'Series 7 FS-7475A', 'CdTe', 475, 222.00, 2.72, 186.00, 2.55, 19.8, 'N/A'),
  m('fs-03', 'First Solar', 'Series 6 Plus FS-6465A', 'CdTe', 465, 218.50, 2.70, 183.20, 2.54, 19.4, 'N/A'),
  m('fs-04', 'First Solar', 'Series 7 FS-7430A', 'CdTe', 430, 217.80, 2.50, 182.50, 2.36, 18.5, 'N/A'),
  m('fs-05', 'First Solar', 'Series 7 FS-7500A', 'CdTe', 500, 224.00, 2.83, 188.00, 2.66, 20.2, 'N/A'),

  // ─── Risen Energy ───
  m('risen-01', 'Risen Energy', 'Hyper-ion RSM110-8-575BHDG', 'HJT', 575, 51.90, 14.08, 43.60, 13.19, 22.4, 'M10'),
  m('risen-02', 'Risen Energy', 'Titan RSM144-8-550BMDG', 'PERC', 550, 49.70, 14.05, 41.70, 13.19, 21.3, 'M10'),
  m('risen-03', 'Risen Energy', 'Hyper-ion RSM132-8-700BHDG', 'HJT', 700, 55.00, 16.16, 46.20, 15.15, 23.8, 'G12'),
  m('risen-04', 'Risen Energy', 'Titan RSM150-8-505BMDG', 'PERC', 505, 45.80, 14.00, 38.40, 13.15, 20.8, 'M10'),
  m('risen-05', 'Risen Energy', 'Hyper-ion RSM120-8-620BNDG', 'TOPCon', 620, 53.50, 14.72, 44.90, 13.81, 22.8, 'M10'),

  // ─── CSUN ───
  m('csun-01', 'CSUN', 'CSUN550-144M-HD', 'PERC', 550, 49.60, 14.08, 41.60, 13.22, 21.3, 'M10'),
  m('csun-02', 'CSUN', 'CSUN580-144N-HD', 'TOPCon', 580, 51.80, 14.22, 43.50, 13.33, 22.4, 'M10'),
  m('csun-03', 'CSUN', 'CSUN440-108M-HD', 'PERC', 440, 37.10, 15.06, 31.20, 14.10, 21.5, 'M10'),
  m('csun-04', 'CSUN', 'CSUN500-132M-HD', 'PERC', 500, 45.50, 13.96, 38.20, 13.09, 20.9, 'M10'),
  m('csun-05', 'CSUN', 'CSUN410-108N-HD', 'TOPCon', 410, 37.50, 13.90, 31.50, 13.02, 21.8, 'M10'),

  // ─── HT-SAAE ───
  m('htsaae-01', 'HT-SAAE', 'HTM550MH-72 PERC', 'PERC', 550, 49.80, 14.02, 41.80, 13.16, 21.2, 'M10'),
  m('htsaae-02', 'HT-SAAE', 'HTN580MH-72 TOPCon', 'TOPCon', 580, 51.60, 14.28, 43.30, 13.39, 22.4, 'M10'),
  m('htsaae-03', 'HT-SAAE', 'HTM420MH-54 PERC', 'PERC', 420, 37.00, 14.42, 31.00, 13.55, 21.5, 'M10'),
  m('htsaae-04', 'HT-SAAE', 'HTN700MH-78 TOPCon', 'TOPCon', 700, 55.20, 16.10, 46.40, 15.09, 23.4, 'G12'),
  m('htsaae-05', 'HT-SAAE', 'HTM475MH-60 PERC', 'PERC', 475, 41.80, 14.42, 35.10, 13.53, 21.0, 'M10'),

  // ─── REC Solar ───
  m('rec-01', 'REC Solar', 'Alpha Pure-R REC430AA', 'HJT', 430, 40.10, 13.61, 33.70, 12.76, 22.3, 'M6'),
  m('rec-02', 'REC Solar', 'TwinPeak 5 REC450TP5', 'PERC', 450, 41.60, 13.74, 34.90, 12.89, 21.4, 'M10'),
  m('rec-03', 'REC Solar', 'Alpha Pure-RX REC470AA', 'HJT', 470, 42.80, 13.95, 35.90, 13.09, 22.6, 'M10'),
  m('rec-04', 'REC Solar', 'TwinPeak 4 REC405TP4', 'PERC', 405, 37.40, 13.75, 31.40, 12.90, 20.9, 'M6'),
  m('rec-05', 'REC Solar', 'Alpha Pure-RX REC500AA', 'HJT', 500, 45.20, 14.05, 37.90, 13.19, 22.9, 'M10'),

  // ─── Panasonic/HIT ───
  m('pana-01', 'Panasonic', 'EverVolt EVPV410H', 'HJT', 410, 39.90, 13.05, 33.50, 12.24, 22.2, 'M6'),
  m('pana-02', 'Panasonic', 'EverVolt EVPV380H', 'HJT', 380, 37.80, 12.75, 31.80, 11.95, 21.7, 'M6'),
  m('pana-03', 'Panasonic', 'HIT N340 VBHN340SJ53', 'HJT', 340, 69.70, 6.19, 58.50, 5.81, 20.3, 'M2'),
  m('pana-04', 'Panasonic', 'EverVolt EVPV430H', 'HJT', 430, 40.60, 13.45, 34.10, 12.61, 22.5, 'M10'),
  m('pana-05', 'Panasonic', 'EverVolt EVPV370H', 'HJT', 370, 37.40, 12.55, 31.40, 11.78, 21.2, 'M6'),

  // ─── SunPower ───
  m('sp-01', 'SunPower', 'Maxeon 7 SPR-M440-H-AC', 'HBC', 440, 41.20, 13.56, 34.60, 12.72, 24.1, 'M6'),
  m('sp-02', 'SunPower', 'Maxeon 6 SPR-MAX6-430-E-AC', 'HBC', 430, 40.80, 13.38, 34.30, 12.54, 23.4, 'M6'),
  m('sp-03', 'SunPower', 'Performance 6 SPR-P6-420-COM', 'PERC', 420, 38.20, 13.96, 32.10, 13.08, 21.0, 'M10'),
  m('sp-04', 'SunPower', 'Maxeon 7 SPR-M460-H-AC', 'HBC', 460, 42.10, 13.87, 35.40, 13.00, 24.5, 'M10'),
  m('sp-05', 'SunPower', 'Maxeon 5 SPR-MAX5-400-E', 'HBC', 400, 39.50, 12.85, 33.20, 12.05, 22.8, 'M6'),

  // ─── Meyer Burger ───
  m('mb-01', 'Meyer Burger', 'White 400 MB-HJT400', 'HJT', 400, 39.20, 12.96, 32.90, 12.16, 21.9, 'M6'),
  m('mb-02', 'Meyer Burger', 'Black 395 MB-HJT395', 'HJT', 395, 38.90, 12.88, 32.70, 12.08, 21.7, 'M6'),
  m('mb-03', 'Meyer Burger', 'Glass 410 MB-HJT410', 'HJT', 410, 39.80, 13.08, 33.40, 12.28, 22.1, 'M6'),
  m('mb-04', 'Meyer Burger', 'White 420 MB-HJT420', 'HJT', 420, 40.50, 13.17, 34.00, 12.35, 22.4, 'M10'),
  m('mb-05', 'Meyer Burger', 'Black 385 MB-HJT385', 'HJT', 385, 38.40, 12.73, 32.20, 11.96, 21.3, 'M6'),

  // ─── Waaree (Indian) ───
  m('waaree-01', 'Waaree', 'WS-545 Merlin Series', 'PERC', 545, 49.50, 13.99, 41.50, 13.13, 21.1, 'M10'),
  m('waaree-02', 'Waaree', 'WS-585 TOPCon Merlin+', 'TOPCon', 585, 52.00, 14.28, 43.70, 13.39, 22.5, 'M10'),
  m('waaree-03', 'Waaree', 'WS-445 Monofacial', 'Monofacial', 445, 37.50, 15.07, 31.50, 14.13, 21.6, 'M10'),
  m('waaree-04', 'Waaree', 'WS-665 Bifacial G12', 'Bifacial', 665, 54.20, 15.58, 45.50, 14.62, 22.8, 'G12'),
  m('waaree-05', 'Waaree', 'WS-400 Residential', 'PERC', 400, 36.50, 13.92, 30.60, 13.07, 20.5, 'M10'),

  // ─── Adani Solar (Indian) ───
  m('adani-01', 'Adani Solar', 'ASP-7-AAA-580 TOPCon', 'TOPCon', 580, 51.80, 14.22, 43.50, 13.33, 22.4, 'M10'),
  m('adani-02', 'Adani Solar', 'ASP-7-AAA-550 Mono PERC', 'PERC', 550, 49.70, 14.06, 41.70, 13.19, 21.3, 'M10'),
  m('adani-03', 'Adani Solar', 'ASP-7-AAA-440 Bifacial', 'Bifacial', 440, 37.30, 14.98, 31.30, 14.06, 22.0, 'M10'),
  m('adani-04', 'Adani Solar', 'ASP-7-AAA-680 G12 TOPCon', 'TOPCon', 680, 54.60, 15.82, 45.80, 14.85, 23.1, 'G12'),
  m('adani-05', 'Adani Solar', 'ASP-7-AAA-410 Residential', 'PERC', 410, 36.80, 14.15, 30.90, 13.27, 20.8, 'M10'),

  // ─── Vikram Solar (Indian) ───
  m('vikram-01', 'Vikram Solar', 'Somera Grand 575 TOPCon', 'TOPCon', 575, 51.60, 14.15, 43.30, 13.28, 22.3, 'M10'),
  m('vikram-02', 'Vikram Solar', 'Somera Grand 545 PERC', 'PERC', 545, 49.50, 13.99, 41.50, 13.13, 21.1, 'M10'),
  m('vikram-03', 'Vikram Solar', 'Prexos 440 Bifacial', 'Bifacial', 440, 37.20, 15.02, 31.20, 14.10, 22.0, 'M10'),
  m('vikram-04', 'Vikram Solar', 'Somera Grand 660 G12', 'TOPCon', 660, 54.00, 15.52, 45.30, 14.57, 22.7, 'G12'),
  m('vikram-05', 'Vikram Solar', 'Eldora 405 Residential', 'PERC', 405, 36.60, 14.05, 30.70, 13.19, 20.7, 'M10'),

  // ─── Renewsys (Indian) ───
  m('renewsys-01', 'Renewsys', 'Deserv D8 545 PERC', 'PERC', 545, 49.50, 13.99, 41.50, 13.13, 21.1, 'M10'),
  m('renewsys-02', 'Renewsys', 'Deserv D8N 575 TOPCon', 'TOPCon', 575, 51.50, 14.18, 43.20, 13.31, 22.2, 'M10'),
  m('renewsys-03', 'Renewsys', 'Deserv D8 440 Bifacial', 'Bifacial', 440, 37.10, 15.06, 31.10, 14.15, 22.0, 'M10'),
  m('renewsys-04', 'Renewsys', 'Deserv D8 400 Mono', 'Monofacial', 400, 36.40, 13.96, 30.50, 13.11, 20.5, 'M10'),
  m('renewsys-05', 'Renewsys', 'Deserv D8N 660 G12', 'TOPCon', 660, 53.80, 15.58, 45.10, 14.63, 22.6, 'G12'),
];

export const MANUFACTURERS = [...new Set(MODULE_DATABASE.map(m => m.manufacturer))].sort();

export const TECHNOLOGIES: Technology[] = [
  'PERC', 'TOPCon', 'HJT', 'HBC', 'Bifacial', 'Monofacial', 'Tandem', 'CIGS', 'CdTe', 'n-type', 'p-type',
];

export function getModuleById(id: string): PVModule | undefined {
  return MODULE_DATABASE.find(m => m.id === id);
}

export function filterModules(opts: {
  search?: string;
  technology?: Technology | 'ALL';
  manufacturer?: string;
  wattageMin?: number;
  wattageMax?: number;
}): PVModule[] {
  return MODULE_DATABASE.filter(mod => {
    if (opts.search) {
      const q = opts.search.toLowerCase();
      if (!mod.manufacturer.toLowerCase().includes(q) && !mod.model.toLowerCase().includes(q)) return false;
    }
    if (opts.technology && opts.technology !== 'ALL' && mod.technology !== opts.technology) return false;
    if (opts.manufacturer && opts.manufacturer !== 'ALL' && mod.manufacturer !== opts.manufacturer) return false;
    if (opts.wattageMin && mod.Pmax < opts.wattageMin) return false;
    if (opts.wattageMax && mod.Pmax > opts.wattageMax) return false;
    return true;
  });
}
