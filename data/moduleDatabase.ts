/**
 * PV Module Database — 80+ models from 15 manufacturers
 * Technologies: PERC, TOPCon, HJT, HBC, Bifacial, Tandem, CIGS, CdTe
 * Test limits per IEC 61215:2021, IEC TS 62804-1:2025, PVEL LETID Protocol
 */

export interface TestLimits {
  tc: {
    Vmax: number;   // V — max voltage during thermal cycling
    Isc: number;    // A — short-circuit current for ABSI injection
  };
  hf: {
    Vmax: number;   // V — max voltage during humidity-freeze
    freq: number;   // Hz — cycling frequency
    Isc: number;    // A — short-circuit current for ABSI injection
  };
  letid: {
    Iinject: number; // A — current injection level
    Voc: number;     // V — open-circuit voltage at test
    cellTemp: number; // °C — cell temperature during LETID
  };
  pid: {
    Vbias: number;   // V — bias voltage (positive = system voltage stress)
    ImaxLeak: number; // mA — max leakage current before trip
    duration: number; // h — test duration
  };
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

function makeLimits(m: Pick<PVModule, 'Voc' | 'Isc' | 'Pmax' | 'technology'>): TestLimits {
  const isThinFilm = ['CdTe', 'CIGS'].includes(m.technology);
  return {
    tc: { Vmax: Math.ceil(m.Voc * 1.1), Isc: m.Isc },
    hf: { Vmax: Math.ceil(m.Voc * 1.1), freq: 0.01, Isc: m.Isc },
    letid: {
      Iinject: +(m.Isc * 1.0).toFixed(2),
      Voc: m.Voc,
      cellTemp: 75,
    },
    pid: {
      Vbias: isThinFilm ? 1000 : 1500,
      ImaxLeak: 5,
      duration: isThinFilm ? 96 : 96,
    },
  };
}

function mod(
  manufacturer: string,
  model: string,
  technology: string,
  Pmax: number,
  Voc: number,
  Isc: number,
  Vmp: number,
  Imp: number,
  efficiency: number,
): PVModule {
  const base = { manufacturer, model, technology, Pmax, Voc, Isc, Vmp, Imp, efficiency };
  return { ...base, testLimits: makeLimits(base) };
}

export const MODULE_DATABASE: PVModule[] = [
  // ─── LONGi (8 models) ────────────────────────────────────────────
  mod('LONGi', 'Hi-MO 7 LR5-72HGD 580M', 'HPDC PERC', 580, 49.85, 14.66, 42.10, 13.78, 22.5),
  mod('LONGi', 'Hi-MO 6 LR5-72HTH 575M', 'TOPCon', 575, 51.30, 14.15, 43.20, 13.31, 22.3),
  mod('LONGi', 'Hi-MO X6 LR7-72HGD 620M', 'HJT Bifacial', 620, 53.20, 14.72, 44.80, 13.84, 23.0),
  mod('LONGi', 'Hi-MO 5m LR5-54HPH 420M', 'PERC Mono', 420, 37.24, 14.25, 31.30, 13.42, 21.3),
  mod('LONGi', 'Hi-MO 6 LR5-54HTH 435M', 'TOPCon', 435, 38.10, 14.42, 32.20, 13.51, 22.0),
  mod('LONGi', 'Hi-MO 9 LR7-72HBD 640M', 'HBC Bifacial', 640, 54.80, 14.78, 46.20, 13.85, 23.8),
  mod('LONGi', 'Hi-MO 7 LR5-72HGD 560M', 'HPDC PERC', 560, 49.40, 14.29, 41.60, 13.46, 21.7),
  mod('LONGi', 'Hi-MO X6 LR7-54HGD 470M', 'HJT', 470, 40.50, 14.65, 34.10, 13.78, 22.8),

  // ─── JA Solar (8 models) ─────────────────────────────────────────
  mod('JA Solar', 'DeepBlue 4.0 Pro JAM72D42-605/LB', 'TOPCon Bifacial', 605, 52.10, 14.65, 43.80, 13.81, 22.6),
  mod('JA Solar', 'DeepBlue 4.0 JAM78D40-630/MB', 'TOPCon', 630, 53.80, 14.80, 45.20, 13.94, 22.8),
  mod('JA Solar', 'DeepBlue 3.0 JAM72S30-545/MR', 'PERC Mono', 545, 49.65, 13.86, 41.70, 13.07, 21.3),
  mod('JA Solar', 'JAM60S20-380/MR', 'PERC Mono', 380, 34.85, 13.76, 29.20, 13.01, 20.7),
  mod('JA Solar', 'DeepBlue 4.0 JAM54D40-440/LB', 'TOPCon Bifacial', 440, 38.50, 14.44, 32.40, 13.58, 22.2),
  mod('JA Solar', 'JAM72D40-585/MB', 'TOPCon', 585, 51.70, 14.28, 43.50, 13.45, 22.0),
  mod('JA Solar', 'DeepBlue 4.0 Pro JAM78D42-635/LB', 'TOPCon Bifacial', 635, 54.10, 14.82, 45.50, 13.96, 23.0),
  mod('JA Solar', 'JAM72S30-530/GR', 'PERC', 530, 49.20, 13.60, 41.30, 12.83, 20.9),

  // ─── Trina Solar (7 models) ──────────────────────────────────────
  mod('Trina Solar', 'Vertex S+ TSM-NEG9R.28 445W', 'TOPCon', 445, 38.80, 14.50, 32.70, 13.61, 22.5),
  mod('Trina Solar', 'Vertex N TSM-NEG21C.20 700W', 'TOPCon Bifacial', 700, 56.20, 15.72, 47.30, 14.80, 23.2),
  mod('Trina Solar', 'Vertex S TSM-DE09R.08 430W', 'PERC Mono', 430, 37.60, 14.45, 31.50, 13.65, 21.8),
  mod('Trina Solar', 'Vertex N TSM-NEG19RC.20 620W', 'TOPCon', 620, 52.80, 14.82, 44.40, 13.96, 22.7),
  mod('Trina Solar', 'Vertex TSM-DEG21C.20 665W', 'PERC Bifacial', 665, 55.40, 15.16, 46.60, 14.27, 21.5),
  mod('Trina Solar', 'Vertex S+ TSM-NEG9RC.27 450W', 'TOPCon Bifacial', 450, 39.10, 14.55, 32.90, 13.68, 22.7),
  mod('Trina Solar', 'Vertex N TSM-NEG18R.20 590W', 'TOPCon', 590, 51.50, 14.47, 43.30, 13.63, 22.3),

  // ─── Canadian Solar (7 models) ───────────────────────────────────
  mod('Canadian Solar', 'HiKu7 CS7N-690TB-AG', 'TOPCon Bifacial', 690, 55.80, 15.60, 47.00, 14.68, 23.0),
  mod('Canadian Solar', 'HiKu6 CS6W-580TB', 'TOPCon', 580, 50.40, 14.53, 42.40, 13.68, 22.1),
  mod('Canadian Solar', 'HiKu6 CS6R-435T', 'TOPCon', 435, 38.20, 14.40, 32.10, 13.55, 22.0),
  mod('Canadian Solar', 'HiKu CS3W-545MS', 'PERC Mono', 545, 49.50, 13.90, 41.60, 13.10, 21.1),
  mod('Canadian Solar', 'HiKu7 CS7L-600MS', 'PERC Bifacial', 600, 51.80, 14.62, 43.50, 13.79, 21.4),
  mod('Canadian Solar', 'TOPBiHiKu7 CS7N-720TB-AG', 'TOPCon Bifacial', 720, 57.50, 15.82, 48.40, 14.88, 23.3),
  mod('Canadian Solar', 'HiKu6 CS6R-425MS', 'PERC Mono', 425, 37.40, 14.35, 31.40, 13.54, 21.5),

  // ─── Jinko Solar (7 models) ──────────────────────────────────────
  mod('Jinko Solar', 'Tiger Neo N-type JKM625N-78HL4-BDV', 'TOPCon Bifacial', 625, 53.50, 14.76, 45.00, 13.89, 22.8),
  mod('Jinko Solar', 'Tiger Neo JKM445N-54HL4-V', 'TOPCon', 445, 38.90, 14.46, 32.80, 13.57, 22.3),
  mod('Jinko Solar', 'Tiger Pro JKM545M-72HL4-V', 'PERC Mono', 545, 49.60, 13.88, 41.70, 13.07, 21.2),
  mod('Jinko Solar', 'Tiger Neo JKM590N-72HL4', 'TOPCon', 590, 51.60, 14.44, 43.40, 13.59, 22.1),
  mod('Jinko Solar', 'Tiger Neo N-type JKM700N-78HL4-BDV', 'TOPCon Bifacial', 700, 56.40, 15.68, 47.50, 14.74, 23.1),
  mod('Jinko Solar', 'Tiger Pro JKM420M-54HL4-V', 'PERC Mono', 420, 37.10, 14.30, 31.10, 13.50, 21.3),
  mod('Jinko Solar', 'Tiger Neo JKM640N-78HL4-BDV', 'TOPCon Bifacial', 640, 54.20, 14.91, 45.60, 14.04, 22.9),

  // ─── First Solar (5 models) ──────────────────────────────────────
  mod('First Solar', 'Series 7 FS-7545A', 'CdTe', 545, 219.8, 3.13, 186.2, 2.93, 19.8),
  mod('First Solar', 'Series 6 Plus FS-6475A', 'CdTe', 475, 218.4, 2.75, 184.8, 2.57, 19.2),
  mod('First Solar', 'Series 7 FS-7560A', 'CdTe', 560, 220.5, 3.21, 187.0, 2.99, 20.1),
  mod('First Solar', 'Series 6 FS-6440A', 'CdTe', 440, 216.0, 2.57, 182.5, 2.41, 18.6),
  mod('First Solar', 'Series 7 FS-7530A', 'CdTe', 530, 219.0, 3.06, 185.5, 2.86, 19.5),

  // ─── Risen Energy (5 models) ─────────────────────────────────────
  mod('Risen Energy', 'Titan S RSM40-8-410M', 'PERC Mono', 410, 37.00, 14.00, 31.00, 13.23, 21.0),
  mod('Risen Energy', 'Hyper-ion RSM132-8-685BNDG', 'HJT Bifacial', 685, 55.60, 15.56, 46.80, 14.64, 23.2),
  mod('Risen Energy', 'Titan RSM110-8-545M', 'PERC Mono', 545, 49.50, 13.90, 41.60, 13.10, 21.1),
  mod('Risen Energy', 'Hyper-ion RSM120-8-600BNDG', 'HJT Bifacial', 600, 52.40, 14.47, 44.10, 13.61, 22.5),
  mod('Risen Energy', 'Titan N RSM144-10-640BNDG', 'TOPCon Bifacial', 640, 54.00, 14.96, 45.40, 14.10, 22.8),

  // ─── REC Group (5 models) ────────────────────────────────────────
  mod('REC Group', 'Alpha Pure-R Series 2 REC430AA', 'HJT', 430, 39.40, 13.78, 33.20, 12.95, 22.3),
  mod('REC Group', 'TwinPeak 5 Series REC-450TP5', 'PERC Split-Cell', 450, 41.20, 13.79, 34.60, 13.01, 21.6),
  mod('REC Group', 'Alpha HJT 72 REC-600AA', 'HJT Bifacial', 600, 52.60, 14.41, 44.20, 13.57, 22.6),
  mod('REC Group', 'TwinPeak 4 REC-375TP4', 'PERC', 375, 34.50, 13.72, 28.90, 12.98, 20.3),
  mod('REC Group', 'Alpha Pure-R REC-470AA', 'HJT', 470, 40.80, 14.56, 34.30, 13.70, 22.8),

  // ─── Panasonic HIT (4 models) ────────────────────────────────────
  mod('Panasonic', 'EverVolt EVPV-410HK', 'HJT', 410, 38.60, 13.42, 32.50, 12.62, 22.2),
  mod('Panasonic', 'EverVolt EVPV-380HK', 'HJT', 380, 36.90, 13.01, 31.00, 12.26, 21.7),
  mod('Panasonic', 'HIT N340 VBHN340SA17', 'HJT', 340, 35.20, 12.18, 29.60, 11.48, 20.3),
  mod('Panasonic', 'EverVolt EVPV-430HK', 'HJT Bifacial', 430, 39.20, 13.86, 33.00, 13.03, 22.6),

  // ─── SunPower (4 models) ─────────────────────────────────────────
  mod('SunPower', 'Maxeon 7 SPR-M440-H-AC', 'HBC', 440, 39.80, 13.96, 33.50, 13.13, 24.0),
  mod('SunPower', 'Maxeon 6 SPR-M420-G-AC', 'HBC', 420, 38.80, 13.67, 32.60, 12.88, 23.0),
  mod('SunPower', 'Maxeon 3 SPR-MAX400-COM', 'HBC', 400, 37.50, 13.48, 31.50, 12.70, 22.7),
  mod('SunPower', 'Performance 6 SPR-P6-425-COM', 'PERC', 425, 38.00, 14.12, 31.90, 13.32, 21.4),

  // ─── Meyer Burger (4 models) ─────────────────────────────────────
  mod('Meyer Burger', 'White 400W MB-HJT-400-W', 'HJT', 400, 38.20, 13.22, 32.10, 12.46, 21.7),
  mod('Meyer Burger', 'Black 395W MB-HJT-395-B', 'HJT', 395, 37.80, 13.20, 31.80, 12.42, 21.4),
  mod('Meyer Burger', 'Glass 420W MB-HJT-420-G', 'HJT Bifacial', 420, 38.90, 13.62, 32.70, 12.84, 22.0),
  mod('Meyer Burger', 'White 120HC 480W MB-HJT-480-W', 'HJT', 480, 41.60, 14.58, 35.00, 13.71, 22.5),

  // ─── Waaree Energies (5 models) ──────────────────────────────────
  mod('Waaree', 'WS-610 Bifacial', 'TOPCon Bifacial', 610, 52.40, 14.69, 44.10, 13.83, 22.4),
  mod('Waaree', 'WS-545 Mono PERC', 'PERC Mono', 545, 49.50, 13.90, 41.60, 13.10, 21.2),
  mod('Waaree', 'WS-440 TOPCon', 'TOPCon', 440, 38.40, 14.48, 32.30, 13.62, 22.1),
  mod('Waaree', 'WS-670 TOPCon Bifacial', 'TOPCon Bifacial', 670, 55.20, 15.32, 46.40, 14.44, 22.9),
  mod('Waaree', 'WS-400 Mono PERC', 'PERC Mono', 400, 37.10, 13.62, 31.10, 12.86, 20.5),

  // ─── Adani Solar (5 models) ──────────────────────────────────────
  mod('Adani Solar', 'ASE-7S-HCM-600 TOPCon', 'TOPCon Bifacial', 600, 51.80, 14.62, 43.50, 13.79, 22.2),
  mod('Adani Solar', 'ASE-6S-HCM-545', 'PERC Mono', 545, 49.50, 13.90, 41.60, 13.10, 21.1),
  mod('Adani Solar', 'ASE-7S-HCM-640 TOPCon', 'TOPCon Bifacial', 640, 54.10, 14.93, 45.50, 14.07, 22.7),
  mod('Adani Solar', 'ASE-6S-HCM-440', 'PERC Mono', 440, 38.60, 14.40, 32.40, 13.58, 21.5),
  mod('Adani Solar', 'ASE-7S-HCM-580 N-type', 'TOPCon', 580, 50.60, 14.49, 42.50, 13.65, 22.0),

  // ─── Vikram Solar (4 models) ─────────────────────────────────────
  mod('Vikram Solar', 'Prexos VSMD-144-580', 'TOPCon Bifacial', 580, 50.60, 14.49, 42.50, 13.65, 22.0),
  mod('Vikram Solar', 'Somera Grand VSMS-120-440', 'PERC Mono', 440, 38.50, 14.44, 32.30, 13.62, 21.5),
  mod('Vikram Solar', 'Prexos VSMD-156-620', 'TOPCon Bifacial', 620, 52.90, 14.80, 44.50, 13.93, 22.5),
  mod('Vikram Solar', 'Eldora Grand VSMS-144-545', 'PERC Mono', 545, 49.50, 13.90, 41.60, 13.10, 21.1),

  // ─── Renewsys (4 models) ─────────────────────────────────────────
  mod('Renewsys', 'DERA 545W Mono PERC', 'PERC Mono', 545, 49.60, 13.88, 41.70, 13.07, 21.0),
  mod('Renewsys', 'DERA 440W TOPCon', 'TOPCon', 440, 38.40, 14.48, 32.30, 13.62, 22.0),
  mod('Renewsys', 'DERA 600W TOPCon Bifacial', 'TOPCon Bifacial', 600, 51.80, 14.62, 43.50, 13.79, 22.2),
  mod('Renewsys', 'DERA 400W Mono PERC', 'PERC Mono', 400, 37.10, 13.62, 31.10, 12.86, 20.3),

  // ─── Additional diversity: Tandem & CIGS ─────────────────────────
  mod('LONGi', 'Hi-MO X Perovskite-Si Tandem 550W', 'Perovskite-Si Tandem', 550, 46.80, 14.82, 39.40, 13.96, 28.5),
  mod('Meyer Burger', 'Tandem Proto 500W', 'Perovskite-Si Tandem', 500, 44.60, 14.16, 37.50, 13.33, 27.2),
  mod('First Solar', 'CuRe Series FS-CIGS-420', 'CIGS', 420, 162.0, 3.27, 137.0, 3.07, 17.8),
];

// ─── Utility helpers ────────────────────────────────────────────────

export const ALL_MANUFACTURERS = [...new Set(MODULE_DATABASE.map((m) => m.manufacturer))].sort();
export const ALL_TECHNOLOGIES = [...new Set(MODULE_DATABASE.map((m) => m.technology))].sort();

export function filterModules(opts: {
  search?: string;
  manufacturer?: string;
  technology?: string;
}): PVModule[] {
  return MODULE_DATABASE.filter((m) => {
    if (opts.manufacturer && m.manufacturer !== opts.manufacturer) return false;
    if (opts.technology && m.technology !== opts.technology) return false;
    if (opts.search) {
      const q = opts.search.toLowerCase();
      const haystack = `${m.manufacturer} ${m.model} ${m.technology}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}
