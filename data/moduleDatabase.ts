// PV Module Database — 80+ models across 15 manufacturers
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
  Pmax: number;
  Voc: number;
  Isc: number;
  Vmp: number;
  Imp: number;
  efficiency: number;
  testLimits: TestLimits;
}

function calcTestLimits(mod: {
  Voc: number;
  Isc: number;
  Pmax: number;
  technology: string;
}): TestLimits {
  const isThinFilm = ['CdTe', 'CIGS'].includes(mod.technology);
  return {
    tc: {
      Vmax: Math.ceil(mod.Voc * 1.1),
      Isc: mod.Isc,
    },
    hf: {
      Vmax: Math.ceil(mod.Voc * 1.1),
      freq: 10,
      Isc: mod.Isc,
    },
    letid: {
      Iinject: Math.round(mod.Isc * 100) / 100,
      Voc: mod.Voc,
      cellTemp: 75,
    },
    pid: {
      Vbias: isThinFilm ? 1000 : 1500,
      ImaxLeak: 5,
      duration: 96,
    },
  };
}

function m(
  manufacturer: string,
  model: string,
  technology: string,
  Pmax: number,
  Voc: number,
  Isc: number,
  Vmp: number,
  Imp: number,
  efficiency: number
): PVModule {
  return {
    manufacturer,
    model,
    technology,
    Pmax,
    Voc,
    Isc,
    Vmp,
    Imp,
    efficiency,
    testLimits: calcTestLimits({ Voc, Isc, Pmax, technology }),
  };
}

export const moduleDatabase: PVModule[] = [
  // ── LONGi (8 models) ──────────────────────────────────────────
  m('LONGi', 'LR5-72HBD-545M', 'PERC Bifacial', 545, 49.65, 13.85, 41.65, 13.09, 21.1),
  m('LONGi', 'LR5-72HPH-555M', 'PERC', 555, 49.95, 14.03, 41.80, 13.28, 21.3),
  m('LONGi', 'LR7-72HGD-620M', 'TOPCon Bifacial', 620, 51.50, 15.18, 43.30, 14.32, 22.5),
  m('LONGi', 'LR7-72HGD-580M', 'TOPCon Bifacial', 580, 50.80, 14.40, 42.60, 13.62, 22.0),
  m('LONGi', 'LR5-54HPB-410M', 'PERC', 410, 37.20, 13.92, 31.10, 13.18, 21.0),
  m('LONGi', 'LR7-54HGD-440M', 'TOPCon', 440, 38.50, 14.42, 32.20, 13.66, 22.3),
  m('LONGi', 'LR5-66HPH-505M', 'PERC', 505, 45.60, 13.98, 38.20, 13.22, 20.9),
  m('LONGi', 'LR7-66HGD-560M', 'TOPCon Bifacial', 560, 47.30, 14.94, 39.60, 14.14, 22.1),

  // ── JA Solar (8 models) ───────────────────────────────────────
  m('JA Solar', 'JAM72S30-545/MR', 'PERC', 545, 49.72, 13.83, 41.82, 13.03, 21.0),
  m('JA Solar', 'JAM72D40-580/MB', 'TOPCon Bifacial', 580, 51.28, 14.27, 43.08, 13.47, 22.4),
  m('JA Solar', 'JAM72D41-620/MB', 'TOPCon Bifacial', 620, 51.90, 15.06, 43.60, 14.22, 22.6),
  m('JA Solar', 'JAM54S31-410/MR', 'PERC', 410, 37.10, 13.95, 31.00, 13.23, 21.1),
  m('JA Solar', 'JAM54D40-440/MB', 'TOPCon Bifacial', 440, 38.60, 14.38, 32.30, 13.62, 22.2),
  m('JA Solar', 'JAM66S30-500/MR', 'PERC', 500, 45.50, 13.87, 38.10, 13.12, 20.8),
  m('JA Solar', 'JAM78D40-630/MB', 'TOPCon Bifacial', 630, 53.80, 14.76, 45.20, 13.94, 22.5),
  m('JA Solar', 'JAM60S20-380/MR', 'PERC', 380, 41.50, 11.56, 34.80, 10.92, 20.2),

  // ── Trina Solar (7 models) ────────────────────────────────────
  m('Trina Solar', 'TSM-DE21-600', 'TOPCon Bifacial', 600, 51.30, 14.74, 43.10, 13.92, 22.3),
  m('Trina Solar', 'TSM-DE20-545', 'PERC Bifacial', 545, 49.60, 13.88, 41.50, 13.13, 21.1),
  m('Trina Solar', 'TSM-NEG21C.20-620', 'TOPCon Bifacial', 620, 52.10, 15.02, 43.70, 14.19, 22.5),
  m('Trina Solar', 'TSM-DE09.08-410', 'PERC', 410, 37.30, 13.89, 31.20, 13.14, 21.0),
  m('Trina Solar', 'TSM-NEG9RC.27-440', 'TOPCon', 440, 38.70, 14.34, 32.40, 13.58, 22.1),
  m('Trina Solar', 'TSM-DE18M.08-500', 'PERC', 500, 45.40, 13.90, 38.00, 13.16, 20.7),
  m('Trina Solar', 'TSM-NEG19RC.20-580', 'TOPCon Bifacial', 580, 50.60, 14.47, 42.40, 13.68, 22.0),

  // ── Canadian Solar (7 models) ─────────────────────────────────
  m('Canadian Solar', 'CS7N-600TB-AG', 'TOPCon Bifacial', 600, 51.40, 14.71, 43.20, 13.89, 22.3),
  m('Canadian Solar', 'CS6W-545MS', 'PERC', 545, 49.80, 13.81, 41.70, 13.07, 21.0),
  m('Canadian Solar', 'CS7N-620TB-AG', 'TOPCon Bifacial', 620, 52.00, 15.04, 43.60, 14.22, 22.5),
  m('Canadian Solar', 'CS6R-410MS', 'PERC', 410, 37.40, 13.84, 31.30, 13.10, 20.9),
  m('Canadian Solar', 'CS7L-580TB-AG', 'TOPCon Bifacial', 580, 50.70, 14.44, 42.50, 13.65, 22.1),
  m('Canadian Solar', 'CS6W-500MS', 'PERC', 500, 45.30, 13.93, 37.90, 13.19, 20.8),
  m('Canadian Solar', 'CS7N-440TB-AG', 'TOPCon Bifacial', 440, 38.80, 14.30, 32.50, 13.54, 22.0),

  // ── Jinko Solar (7 models) ────────────────────────────────────
  m('Jinko Solar', 'JKM545M-72HL4-V', 'PERC', 545, 49.70, 13.86, 41.60, 13.10, 21.1),
  m('Jinko Solar', 'JKM620N-78HL4-BDV', 'TOPCon Bifacial', 620, 52.20, 14.98, 43.80, 14.16, 22.5),
  m('Jinko Solar', 'JKM580N-72HL4-BDV', 'TOPCon Bifacial', 580, 50.90, 14.38, 42.70, 13.58, 22.0),
  m('Jinko Solar', 'JKM410M-54HL4-V', 'PERC', 410, 37.50, 13.82, 31.40, 13.06, 20.9),
  m('Jinko Solar', 'JKM440N-54HL4-BDV', 'TOPCon Bifacial', 440, 38.90, 14.27, 32.60, 13.50, 22.1),
  m('Jinko Solar', 'JKM500M-66HL4-V', 'PERC', 500, 45.20, 13.96, 37.80, 13.23, 20.8),
  m('Jinko Solar', 'JKM600N-72HL4-BDV', 'TOPCon Bifacial', 600, 51.60, 14.66, 43.30, 13.86, 22.3),

  // ── First Solar (5 models) ────────────────────────────────────
  m('First Solar', 'FS-6445', 'CdTe', 445, 218.0, 2.58, 183.0, 2.43, 19.3),
  m('First Solar', 'FS-6460', 'CdTe', 460, 219.5, 2.65, 184.5, 2.49, 19.8),
  m('First Solar', 'FS-6475', 'CdTe', 475, 220.8, 2.72, 185.8, 2.56, 20.1),
  m('First Solar', 'FS-7490', 'CdTe', 490, 221.0, 2.80, 186.0, 2.63, 20.4),
  m('First Solar', 'FS-7510', 'CdTe', 510, 222.5, 2.90, 187.0, 2.73, 20.9),

  // ── Risen Energy (5 models) ───────────────────────────────────
  m('Risen Energy', 'RSM144-9-545M', 'PERC', 545, 49.50, 13.90, 41.40, 13.16, 21.0),
  m('Risen Energy', 'RSM144-10-580N', 'TOPCon Bifacial', 580, 50.80, 14.41, 42.60, 13.62, 22.0),
  m('Risen Energy', 'RSM144-10-620N', 'TOPCon Bifacial', 620, 51.70, 15.12, 43.40, 14.29, 22.4),
  m('Risen Energy', 'RSM108-9-410M', 'PERC', 410, 37.20, 13.91, 31.10, 13.18, 21.0),
  m('Risen Energy', 'RSM120-10-440N', 'TOPCon', 440, 38.40, 14.48, 32.10, 13.71, 22.2),

  // ── REC Group (5 models) ──────────────────────────────────────
  m('REC Group', 'REC Alpha Pure-R 430', 'HJT', 430, 51.70, 10.50, 43.40, 9.91, 22.3),
  m('REC Group', 'REC Alpha Pure-R 410', 'HJT', 410, 50.40, 10.28, 42.30, 9.69, 21.9),
  m('REC Group', 'REC TwinPeak 5-450', 'PERC', 450, 41.80, 13.58, 35.10, 12.82, 21.0),
  m('REC Group', 'REC Alpha 72 Series-580', 'HJT Bifacial', 580, 53.20, 13.76, 44.60, 13.00, 22.5),
  m('REC Group', 'REC N-Peak 3-375', 'TOPCon', 375, 40.80, 11.60, 34.20, 10.96, 20.7),

  // ── Panasonic HIT (4 models) ──────────────────────────────────
  m('Panasonic', 'EVPV410H', 'HJT', 410, 50.80, 10.18, 42.60, 9.62, 22.2),
  m('Panasonic', 'EVPV380H', 'HJT', 380, 49.50, 9.69, 41.50, 9.16, 21.7),
  m('Panasonic', 'EVPV370H', 'HJT', 370, 48.80, 9.57, 40.90, 9.05, 21.2),
  m('Panasonic', 'EVPV400HK', 'HJT Bifacial', 400, 50.20, 10.05, 42.10, 9.50, 22.0),

  // ── SunPower (4 models) ───────────────────────────────────────
  m('SunPower', 'SPR-M440-H-AC', 'HBC', 440, 51.80, 10.72, 43.50, 10.11, 22.8),
  m('SunPower', 'SPR-MAX6-430', 'HBC', 430, 51.20, 10.60, 43.00, 10.00, 22.6),
  m('SunPower', 'SPR-P6-420-UPP', 'PERC', 420, 42.10, 12.60, 35.30, 11.90, 20.4),
  m('SunPower', 'SPR-MAX3-400', 'HBC', 400, 49.80, 10.14, 41.80, 9.57, 22.1),

  // ── Meyer Burger (4 models) ───────────────────────────────────
  m('Meyer Burger', 'MB-400-HJT-G', 'HJT', 400, 50.20, 10.06, 42.10, 9.50, 21.8),
  m('Meyer Burger', 'MB-390-HJT-W', 'HJT', 390, 49.60, 9.92, 41.60, 9.38, 21.4),
  m('Meyer Burger', 'MB-380-HJT-B', 'HJT', 380, 48.90, 9.81, 41.00, 9.27, 21.0),
  m('Meyer Burger', 'MB-420-HJT-BF', 'HJT Bifacial', 420, 51.30, 10.33, 43.00, 9.77, 22.1),

  // ── Waaree (5 models) ─────────────────────────────────────────
  m('Waaree', 'WS-545', 'PERC', 545, 49.40, 13.93, 41.30, 13.20, 21.0),
  m('Waaree', 'WS-580N', 'TOPCon Bifacial', 580, 50.90, 14.38, 42.70, 13.58, 22.0),
  m('Waaree', 'WS-410', 'PERC', 410, 37.30, 13.88, 31.20, 13.15, 20.9),
  m('Waaree', 'WS-620N', 'TOPCon Bifacial', 620, 52.10, 15.02, 43.70, 14.19, 22.5),
  m('Waaree', 'WS-500', 'PERC', 500, 45.10, 13.99, 37.70, 13.26, 20.7),

  // ── Adani Solar (5 models) ────────────────────────────────────
  m('Adani Solar', 'ASP-7-545', 'PERC', 545, 49.55, 13.87, 41.50, 13.13, 21.0),
  m('Adani Solar', 'ASP-7-580N', 'TOPCon Bifacial', 580, 50.70, 14.44, 42.50, 13.65, 22.1),
  m('Adani Solar', 'ASP-7-620N', 'TOPCon Bifacial', 620, 51.80, 15.10, 43.50, 14.25, 22.4),
  m('Adani Solar', 'ASP-7-410', 'PERC', 410, 37.40, 13.83, 31.30, 13.10, 20.8),
  m('Adani Solar', 'ASP-7-440N', 'TOPCon', 440, 38.70, 14.34, 32.40, 13.58, 22.0),

  // ── Vikram Solar (4 models) ───────────────────────────────────
  m('Vikram Solar', 'SOMERA-545', 'PERC', 545, 49.45, 13.91, 41.40, 13.17, 21.0),
  m('Vikram Solar', 'PREXOS-580N', 'TOPCon Bifacial', 580, 50.60, 14.47, 42.40, 13.68, 22.0),
  m('Vikram Solar', 'PREXOS-620N', 'TOPCon Bifacial', 620, 51.90, 15.06, 43.60, 14.22, 22.5),
  m('Vikram Solar', 'SOMERA-410', 'PERC', 410, 37.10, 13.95, 31.00, 13.23, 21.0),

  // ── Renewsys (4 models) ───────────────────────────────────────
  m('Renewsys', 'DESERV-545', 'PERC', 545, 49.35, 13.94, 41.20, 13.22, 20.9),
  m('Renewsys', 'DESERV-410', 'PERC', 410, 37.00, 13.98, 30.90, 13.27, 20.8),
  m('Renewsys', 'DESERV-580N', 'TOPCon Bifacial', 580, 50.50, 14.50, 42.30, 13.71, 21.9),
  m('Renewsys', 'DESERV-500', 'PERC', 500, 45.00, 14.02, 37.60, 13.30, 20.6),

  // ── Oxford PV (Tandem) (2 models) ─────────────────────────────
  m('Oxford PV', 'OPV-430-T', 'Perovskite Tandem', 430, 52.80, 10.28, 44.30, 9.71, 26.8),
  m('Oxford PV', 'OPV-400-T', 'Perovskite Tandem', 400, 51.50, 9.81, 43.20, 9.26, 25.5),

  // ── Avancis (CIGS) (2 models) ─────────────────────────────────
  m('Avancis', 'PowerMax-175', 'CIGS', 175, 96.50, 2.42, 78.80, 2.22, 17.2),
  m('Avancis', 'PowerMax-195', 'CIGS', 195, 98.30, 2.65, 80.20, 2.43, 18.0),
];

// Derived lookup helpers
export const manufacturers = [...new Set(moduleDatabase.map((m) => m.manufacturer))].sort();
export const technologies = [...new Set(moduleDatabase.map((m) => m.technology))].sort();

export function findModulesByManufacturer(name: string): PVModule[] {
  return moduleDatabase.filter((m) => m.manufacturer === name);
}

export function findModulesByTechnology(tech: string): PVModule[] {
  return moduleDatabase.filter((m) => m.technology === tech);
}

export function searchModules(query: string): PVModule[] {
  const q = query.toLowerCase();
  return moduleDatabase.filter(
    (m) =>
      m.manufacturer.toLowerCase().includes(q) ||
      m.model.toLowerCase().includes(q) ||
      m.technology.toLowerCase().includes(q)
  );
}
