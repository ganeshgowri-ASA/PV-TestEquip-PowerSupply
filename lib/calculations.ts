// IEC 61215:2021 & IEC TS 62804-1:2025 Power Supply Calculations
// For PV Module Reliability Testing: TC/HF/LETID/PID

// ─── Module Presets ─────────────────────────────────────────────────────────────

export interface ModuleProfile {
  name: string;
  technology: 'HJT' | 'PERC' | 'TOPCon';
  type: 'monofacial' | 'bifacial';
  voc: number;       // Open-circuit voltage (V)
  isc: number;       // Short-circuit current (A)
  pmax: number;      // Maximum power (W)
  bifacialityFactor: number; // 0 for monofacial, 0.7–0.9 typical for bifacial
}

export const MODULE_PRESETS: Record<string, ModuleProfile> = {
  HJT: {
    name: 'HJT Bifacial',
    technology: 'HJT',
    type: 'bifacial',
    voc: 60,
    isc: 27,
    pmax: 1100,
    bifacialityFactor: 0.85,
  },
  PERC: {
    name: 'PERC Monofacial',
    technology: 'PERC',
    type: 'monofacial',
    voc: 49.5,
    isc: 13.5,
    pmax: 540,
    bifacialityFactor: 0,
  },
  TOPCon: {
    name: 'TOPCon Bifacial',
    technology: 'TOPCon',
    type: 'bifacial',
    voc: 52.5,
    isc: 18.3,
    pmax: 700,
    bifacialityFactor: 0.80,
  },
};

// ─── Test Type Specifications ───────────────────────────────────────────────────

export type TestType = 'TC' | 'HF' | 'LETID' | 'PID';

export interface TestSpec {
  label: string;
  standard: string;
  tempMin: number;         // °C
  tempMax: number;         // °C
  rampRateDefault: number; // °C/min
  dwellTimeDefault: number;// minutes
  cyclesDefault: number;
  humidityRH: number | null; // %RH or null
  voltageRange: { min: number; max: number } | null; // V
  currentRange: { min: number; max: number } | null;  // A
  description: string;
}

export const TEST_SPECS: Record<TestType, TestSpec> = {
  TC: {
    label: 'Thermal Cycling',
    standard: 'IEC 61215:2021 MQT 11',
    tempMin: -40,
    tempMax: 85,
    rampRateDefault: 1.67,    // max 100°C/hr = 1.67°C/min per IEC 61215
    dwellTimeDefault: 15,     // 15 min dwell at extremes
    cyclesDefault: 200,       // TC200 standard, TC400/TC600 extended
    humidityRH: null,
    voltageRange: null,
    currentRange: { min: 0, max: 30 },  // bidirectional 60V/30A
    description: 'Bidirectional regenerative cycling -40°C to +85°C with ABSI current injection',
  },
  HF: {
    label: 'Humidity Freeze',
    standard: 'IEC 61215:2021 MQT 12',
    tempMin: -40,
    tempMax: 85,
    rampRateDefault: 1.67,
    dwellTimeDefault: 20,     // 20h at 85°C/85%RH per standard
    cyclesDefault: 10,
    humidityRH: 85,
    voltageRange: null,
    currentRange: { min: 0, max: 30 },
    description: 'Humidity freeze cycling with 85°C/85%RH dwell phase',
  },
  LETID: {
    label: 'LeTID',
    standard: 'IEC 61215:2021 MQT 19 / PVEL Protocol',
    tempMin: 25,
    tempMax: 75,              // 75°C per PVEL protocol
    rampRateDefault: 2.0,
    dwellTimeDefault: 162,    // 162h continuous per PVEL
    cyclesDefault: 1,
    humidityRH: null,
    voltageRange: null,
    currentRange: { min: 0, max: 2 },  // precision 60V/2A
    description: 'Precision current injection at 75°C for LeTID sensitivity assessment',
  },
  PID: {
    label: 'Potential Induced Degradation',
    standard: 'IEC TS 62804-1:2025',
    tempMin: 25,
    tempMax: 85,
    rampRateDefault: 2.0,
    dwellTimeDefault: 96,     // 96h per IEC 62804
    cyclesDefault: 1,
    humidityRH: 85,
    voltageRange: { min: -4000, max: 4000 },
    currentRange: { min: 0.000000001, max: 0.005 }, // nA to mA
    description: 'High voltage ±4000V DC stress with nA–mA leakage monitoring',
  },
};

// ─── ABSI Current Calculation (IEC 61215:2021 MQT 06) ───────────────────────────

/**
 * Calculate ABSI (Applied Bias Stress under Illumination) current
 * per IEC 61215:2021.
 *
 * For bifacial modules: I_absi = Isc_front + Isc_rear × bifaciality_factor
 * For monofacial modules: I_absi = Isc
 *
 * @param isc - Short-circuit current of front side (A)
 * @param bifacialityFactor - Ratio of rear to front Isc (0 for monofacial)
 * @returns ABSI current in Amps
 */
export function calculateABSICurrent(isc: number, bifacialityFactor: number): number {
  // Isc_rear is approximated as Isc_front × bifacialityFactor
  const iscRear = isc * bifacialityFactor;
  return isc + iscRear * bifacialityFactor;
}

/**
 * Calculate total ABSI current for bifacial module with explicit rear Isc.
 */
export function calculateABSICurrentExplicit(
  iscFront: number,
  iscRear: number,
  bifacialityFactor: number
): number {
  return iscFront + iscRear * bifacialityFactor;
}

// ─── Power Supply Sizing ────────────────────────────────────────────────────────

export interface PowerSupplySizing {
  voltageRequired: number;     // V
  currentRequired: number;     // A per channel
  powerPerChannel: number;     // W
  totalPower: number;          // W for all channels
  channelCount: number;
  safetyMargin: number;        // multiplier (e.g., 1.2 = 20%)
  ratedVoltage: number;        // V (with margin)
  ratedCurrent: number;        // A (with margin)
  ratedPowerTotal: number;     // W total (with margin)
}

export function calculatePowerSupplySizing(
  voc: number,
  absiCurrent: number,
  channelCount: number,
  safetyMargin: number = 1.2
): PowerSupplySizing {
  const powerPerChannel = voc * absiCurrent;
  return {
    voltageRequired: voc,
    currentRequired: absiCurrent,
    powerPerChannel,
    totalPower: powerPerChannel * channelCount,
    channelCount,
    safetyMargin,
    ratedVoltage: Math.ceil(voc * safetyMargin),
    ratedCurrent: Math.ceil(absiCurrent * safetyMargin * 10) / 10,
    ratedPowerTotal: Math.ceil(powerPerChannel * safetyMargin * channelCount),
  };
}

// ─── Thermal Cycle Timing ───────────────────────────────────────────────────────

export interface CycleTiming {
  rampUpTime: number;     // minutes (from tempMin to tempMax)
  rampDownTime: number;   // minutes (from tempMax to tempMin)
  dwellHot: number;       // minutes at tempMax
  dwellCold: number;      // minutes at tempMin
  singleCycleTime: number;// minutes
  totalTestTime: number;  // hours
  totalCycles: number;
}

export function calculateCycleTiming(
  tempMin: number,
  tempMax: number,
  rampRate: number,       // °C/min
  dwellTime: number,      // minutes at each extreme
  cycles: number
): CycleTiming {
  const deltaT = Math.abs(tempMax - tempMin);
  const rampTime = deltaT / rampRate;
  const singleCycleTime = 2 * rampTime + 2 * dwellTime;
  return {
    rampUpTime: rampTime,
    rampDownTime: rampTime,
    dwellHot: dwellTime,
    dwellCold: dwellTime,
    singleCycleTime,
    totalTestTime: (singleCycleTime * cycles) / 60,
    totalCycles: cycles,
  };
}

// ─── PID Leakage Interlock ──────────────────────────────────────────────────────

export const PID_LEAKAGE_THRESHOLD_MA = 5; // 5 mA interlock trip per CLAUDE.md

export interface PIDConfig {
  voltage: number;            // V (±4000V)
  polarity: 'positive' | 'negative';
  currentRangeMin: number;    // A (nA range)
  currentRangeMax: number;    // A (mA range)
  leakageThreshold: number;   // A (interlock trip)
  testDuration: number;       // hours
  temperature: number;        // °C
  humidity: number | null;    // %RH
}

export function createPIDConfig(
  voltage: number = 1000,
  polarity: 'positive' | 'negative' = 'negative',
  leakageThresholdMA: number = PID_LEAKAGE_THRESHOLD_MA,
  testDurationHours: number = 96,
  temperature: number = 85,
  humidity: number | null = 85
): PIDConfig {
  return {
    voltage: Math.abs(voltage),
    polarity,
    currentRangeMin: 1e-9,   // 1 nA
    currentRangeMax: 5e-3,   // 5 mA
    leakageThreshold: leakageThresholdMA / 1000,
    testDuration: testDurationHours,
    temperature,
    humidity,
  };
}

export function checkLeakageInterlock(
  measuredCurrentA: number,
  thresholdA: number = PID_LEAKAGE_THRESHOLD_MA / 1000
): { tripped: boolean; measuredMA: number; thresholdMA: number } {
  return {
    tripped: Math.abs(measuredCurrentA) >= thresholdA,
    measuredMA: measuredCurrentA * 1000,
    thresholdMA: thresholdA * 1000,
  };
}

// ─── Recipe Configuration ───────────────────────────────────────────────────────

export interface RecipeConfig {
  testType: TestType;
  moduleProfile: ModuleProfile;
  absiCurrent: number;
  tempMin: number;
  tempMax: number;
  rampRate: number;
  dwellTime: number;
  cycles: number;
  humidity: number | null;
  channelCount: number;
  pidConfig: PIDConfig | null;
  timing: CycleTiming;
  sizing: PowerSupplySizing;
}

export function buildRecipeConfig(
  testType: TestType,
  moduleProfile: ModuleProfile,
  overrides: {
    tempMin?: number;
    tempMax?: number;
    rampRate?: number;
    dwellTime?: number;
    cycles?: number;
    channelCount?: number;
    pidVoltage?: number;
    pidPolarity?: 'positive' | 'negative';
    pidLeakageThreshold?: number;
  } = {}
): RecipeConfig {
  const spec = TEST_SPECS[testType];
  const absiCurrent = calculateABSICurrent(moduleProfile.isc, moduleProfile.bifacialityFactor);

  const tempMin = overrides.tempMin ?? spec.tempMin;
  const tempMax = overrides.tempMax ?? spec.tempMax;
  const rampRate = overrides.rampRate ?? spec.rampRateDefault;
  const dwellTime = overrides.dwellTime ?? spec.dwellTimeDefault;
  const cycles = overrides.cycles ?? spec.cyclesDefault;
  const channelCount = overrides.channelCount ?? 10;

  const timing = calculateCycleTiming(tempMin, tempMax, rampRate, dwellTime, cycles);
  const sizing = calculatePowerSupplySizing(moduleProfile.voc, absiCurrent, channelCount);

  let pidConfig: PIDConfig | null = null;
  if (testType === 'PID') {
    pidConfig = createPIDConfig(
      overrides.pidVoltage ?? 1000,
      overrides.pidPolarity ?? 'negative',
      overrides.pidLeakageThreshold ?? PID_LEAKAGE_THRESHOLD_MA,
      dwellTime,
      tempMax,
      spec.humidityRH
    );
  }

  return {
    testType,
    moduleProfile,
    absiCurrent,
    tempMin,
    tempMax,
    rampRate,
    dwellTime,
    cycles,
    humidity: spec.humidityRH,
    channelCount,
    pidConfig,
    timing,
    sizing,
  };
}

// ─── Export Helpers ──────────────────────────────────────────────────────────────

export function recipeToJSON(recipe: RecipeConfig): string {
  return JSON.stringify(recipe, null, 2);
}

export function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 24) return `${hours.toFixed(1)} hr`;
  const days = Math.floor(hours / 24);
  const rem = hours % 24;
  return `${days}d ${rem.toFixed(0)}h`;
}

export function formatCurrent(amps: number): string {
  if (amps >= 1) return `${amps.toFixed(2)} A`;
  if (amps >= 0.001) return `${(amps * 1000).toFixed(2)} mA`;
  if (amps >= 0.000001) return `${(amps * 1e6).toFixed(2)} µA`;
  return `${(amps * 1e9).toFixed(2)} nA`;
}
