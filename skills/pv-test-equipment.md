# PV Test Equipment Skill — Antaryami Solar Analytics

## Skill Identity
- **Name:** pv-test-equipment
- **Version:** 1.0.0
- **Company:** Antaryami Solar Analytics
- **Purpose:** Design, source, and configure power supplies and test equipment for PV module reliability testing
- **Standards:** IEC 61215:2021, IEC TS 62804-1:2025, PVEL LETID Protocol

---

## Trigger Patterns

This skill activates when the user's request matches any of:

### Power Supply Design
- `design * power supply for *`
- `TC/HF power supply`, `LETID power supply`, `PID power supply`
- `bidirectional power supply`, `regenerative power supply`
- `current injection * solar`, `ABSI current injection`
- `60V * 30A`, `60V * 2A`, `4000V * DC`

### Test Chamber Integration
- `thermal cycling chamber`, `damp heat chamber`, `humidity freeze`
- `UV exposure chamber`, `UV preconditioning`
- `chamber sync`, `chamber profile`, `temperature ramp`
- `-40°C to 85°C cycle`, `85°C/85%RH`

### Flash Testing & IV Curve Tracing
- `flash tester`, `solar simulator`, `sun simulator`
- `IV curve tracer`, `I-V characterization`
- `Pmax measurement`, `fill factor`, `STC conditions`
- `1000 W/m² flash`, `AAA solar simulator`

### EL/PL Imaging
- `electroluminescence`, `EL imaging`, `EL camera`
- `photoluminescence`, `PL imaging`
- `cell crack detection`, `micro-crack inspection`
- `EL forward bias`, `EL current injection`

### Electronic Loads
- `electronic load`, `DC electronic load`
- `2-quadrant load`, `4-quadrant load`, `bidirectional load`
- `regenerative load`, `sink/source`
- `MPPT tracking load`

### Mechanical Load Testing
- `mechanical load tester`, `IEC 62782`
- `static load test`, `dynamic load test`
- `5400 Pa load`, `2400 Pa load`, `snow load`
- `wind load simulation`

### Insulation & Hipot Testing
- `hipot tester`, `hi-pot test`, `insulation resistance`
- `dielectric withstand`, `leakage current`
- `wet leakage test`, `dry insulation test`
- `1000V + 2×Voc insulation`

### BOM & Sourcing
- `source components for *`, `BOM for * test equipment`
- `Indian vendor alternative`, `Nexar search`
- `component pricing`, `vendor comparison`

---

## Input Schema

```json
{
  "equipment_type": {
    "type": "string",
    "enum": [
      "tc_hf_power_supply",
      "letid_power_supply",
      "pid_power_supply",
      "thermal_cycling_chamber",
      "damp_heat_chamber",
      "uv_chamber",
      "flash_tester",
      "iv_curve_tracer",
      "el_imaging",
      "pl_imaging",
      "electronic_load_2q",
      "electronic_load_4q",
      "mechanical_load_tester",
      "insulation_tester",
      "hipot_tester"
    ],
    "required": true
  },
  "module_profile": {
    "type": "string",
    "enum": ["hjt_bifacial", "perc_mono", "topcon", "custom"],
    "default": "hjt_bifacial"
  },
  "module_params": {
    "type": "object",
    "properties": {
      "voc": { "type": "number", "unit": "V" },
      "isc": { "type": "number", "unit": "A" },
      "pmax": { "type": "number", "unit": "W" },
      "vmpp": { "type": "number", "unit": "V" },
      "impp": { "type": "number", "unit": "A" },
      "cells": { "type": "integer" },
      "cell_type": { "type": "string" }
    }
  },
  "channels": {
    "type": "integer",
    "default": 10,
    "description": "Number of independent test channels per rack"
  },
  "test_standard": {
    "type": "string",
    "enum": ["IEC_61215_2021", "IEC_62804_1_2025", "PVEL_LETID", "IEC_62782", "custom"]
  },
  "output_formats": {
    "type": "array",
    "items": { "enum": ["pdf", "png", "csv", "excel", "step", "dxf", "json", "gerber"] },
    "default": ["pdf", "json"]
  },
  "indian_vendors_required": {
    "type": "boolean",
    "default": true
  }
}
```

---

## Workflow Steps

### Phase 1: Requirements Gathering

1. **Identify Equipment Type** — Match user request to `equipment_type` enum
2. **Load Module Profile** — From `skills/templates/module_profiles.json` or user-supplied params
3. **Select Test Standard** — Map equipment type to applicable IEC/PVEL standard
4. **Determine Channel Count** — Default 10 channels per rack unless specified

### Phase 2: Electrical Design

5. **Calculate Specifications**
   - TC/HF: V_max = Voc × 1.2, I_max = Isc × 1.1, P = V × I × channels
   - LETID: V = Voc, I = Isc × 0.075 (7.5% injection), precision ±0.1%
   - PID: V = ±4000V DC, I = nA–mA range, leakage trip at 5mA
   - Electronic Load: P_sink = Pmax × channels, regenerative efficiency >90%
   - Hipot: V_test = 1000V + 2 × Voc, leakage threshold per standard

6. **Select Topology**
   - TC/HF → Full-bridge LLC with bidirectional capability, GaN/SiC MOSFETs
   - LETID → Linear + switching hybrid for low noise, 16-bit DAC control
   - PID → Cockcroft-Walton multiplier or resonant converter, nA-precision ammeter
   - Electronic Load → Buck-boost with energy recovery to DC bus
   - Flash Tester → Xenon pulse driver with programmable pulse width

7. **Design Control System**
   - Modbus RTU/TCP interface (mandatory)
   - 4-wire Kelvin sensing for voltage measurement
   - Safety interlocks: OVP, OCP, OTP, ground fault, emergency stop
   - PID-specific: 5mA leakage current trip, HV discharge circuit
   - Data logging: voltage, current, temperature, timestamps at ≥1 Hz

### Phase 3: Component Selection & BOM

8. **Query Marketplace APIs** — Use `skills/marketplace_apis.json` for endpoints
   - Primary: Nexar/Octopart GraphQL
   - Secondary: Mouser, Digi-Key, Element14, TME
   - Aggregator: Sourcengine
   - Indian: Moglix, Evelta, Sunrom

9. **Generate BOM** — Using `skills/templates/bom_template.json`
   - Each line item: MPN, description, qty, unit price, vendor, lead time
   - Must include at least one Indian vendor alternative per component
   - Flag long-lead-time items (>4 weeks)

10. **Vendor Comparison Matrix** — Price, availability, MOQ, lead time across all sources

### Phase 4: Mechanical & PCB Design

11. **Rack Layout** — 19-inch standard rack, FreeCAD Python scripts
    - Front panel: displays, controls, connectors
    - Rear panel: power input, communication ports, safety terminals
    - Output: STEP, DXF, PDF drawings

12. **PCB Design** — KiCAD schematics and layout
    - Power stage, control board, interface board
    - Output: Gerber files, PDF schematics, BOM

### Phase 5: Test Recipe Configuration

13. **Load Test Recipe** — From `skills/templates/` JSON files
    - TC/HF: `tc_hf_recipe.json` — 200/50 cycles, -40°C to 85°C, ABSI profiles
    - LETID: `letid_recipe.json` — 75°C, Isc injection, 162-hour duration
    - PID: `pid_recipe.json` — 85°C/85%RH, -1000V system voltage, 96 hours

14. **Chamber Synchronization** — Using `chamber_sync_config.json`
    - Temperature profile synchronization between chamber and power supply
    - Current injection start/stop triggers based on temperature stability
    - Data handshake: chamber controller ↔ power supply ↔ data logger

### Phase 6: Documentation & Export

15. **Generate Engineering Report** — PDF with:
    - Specifications summary, block diagram, schematic excerpts
    - BOM with pricing, test recipe parameters
    - Safety analysis, Modbus register map

16. **Export Deliverables** — All requested formats from `output_formats`

---

## Equipment-Specific Reference Data

### Power Supplies

| Parameter | TC/HF | LETID | PID |
|-----------|-------|-------|-----|
| Voltage Range | 0–72V | 0–72V | 0–±4000V |
| Current Range | 0–33A | 0–2.5A | 0–10mA |
| Power/Channel | 2.4kW | 180W | 40W |
| Channels | 10 | 10 | 10 |
| Topology | Full-bridge LLC | Linear hybrid | Cockcroft-Walton |
| Regulation | ±0.5% | ±0.1% | ±1% |
| Sensing | 4-wire Kelvin | 4-wire Kelvin | HV probe + nA meter |
| Communication | Modbus RTU/TCP | Modbus RTU/TCP | Modbus RTU/TCP |
| Safety | OVP/OCP/OTP | OVP/OCP/OTP | 5mA trip, HV discharge |
| Bidirectional | Yes (regenerative) | No | No |

### Test Chambers

| Parameter | Thermal Cycling | Damp Heat | UV |
|-----------|----------------|-----------|-----|
| Temp Range | -40°C to +85°C | +85°C ±2°C | +60°C ±5°C |
| Humidity | Not controlled | 85% ±5% RH | Not controlled |
| Ramp Rate | ≤100°C/hr | N/A | N/A |
| Duration | 200 cycles (TC) / 10 cycles (HF) | 1000 hrs | 15 kWh/m² UVA |
| Volume | ≥1.5m³ per module | ≥1.5m³ per module | ≥1m² exposure |
| Standard | IEC 61215 10.11/10.12 | IEC 61215 10.13 | IEC 61215 10.10 |

### Flash Testers & IV Tracers

| Parameter | Flash Tester | IV Curve Tracer |
|-----------|-------------|-----------------|
| Irradiance | 1000 W/m² (STC) | N/A (outdoor/indoor) |
| Spectrum | AM1.5G | N/A |
| Class | AAA (uniformity, stability, spectrum) | N/A |
| Sweep Time | <10ms to 100ms | 1ms–1s programmable |
| V Range | 0–80V | 0–80V |
| I Range | 0–30A | 0–30A |
| Accuracy | ±1% Pmax | ±0.5% V, ±0.5% I |

### EL/PL Imaging

| Parameter | EL | PL |
|-----------|-----|-----|
| Excitation | Forward bias current (Isc) | Laser/LED (808nm/940nm) |
| Camera | InGaAs or cooled Si CCD | InGaAs or cooled Si CCD |
| Resolution | ≥1 megapixel | ≥1 megapixel |
| Wavelength | 950–1200nm (Si cells) | 950–1200nm (Si cells) |
| Exposure | 1–30s | 0.1–5s |
| Application | Cell cracks, inactive areas, shunts | Lifetime mapping, process QC |

### Electronic Loads

| Parameter | 2-Quadrant | 4-Quadrant |
|-----------|-----------|-----------|
| Modes | CC, CV, CR, CP | CC, CV, CR, CP + Source |
| V Range | 0–80V | ±80V |
| I Range | 0–33A | ±33A |
| Power | 2.4kW sink | 2.4kW sink/source |
| Slew Rate | >10 A/ms | >10 A/ms |
| Regenerative | No | Yes (>90% efficiency) |
| Use Case | Module characterization | MPPT simulation, grid-tie test |

### Mechanical Load Tester

| Parameter | Value |
|-----------|-------|
| Load Range | 0–8000 Pa |
| Standard Loads | 2400 Pa (front), 2400 Pa (rear), 5400 Pa (front) |
| Cycles (Dynamic) | 1000 cycles per IEC 62782 |
| Area | Up to 2.5m × 1.4m module |
| Load Type | Pneumatic bladder or hydraulic |
| Measurement | Deflection via LVDT, strain gauges |

### Insulation / Hipot Tester

| Parameter | Value |
|-----------|-------|
| Test Voltage | 1000V + 2 × Voc (dry), 500V (wet) |
| Leakage Limit | <50µA/m² (wet), per standard |
| Insulation Resistance | >400 MΩ·m² |
| Ramp Time | 1–5 seconds |
| Dwell Time | 1 minute |
| Standard | IEC 61215 10.3 (dry), 10.15 (wet) |

---

## Safety Requirements (All Equipment)

1. **Emergency Stop** — Hardware e-stop on front panel, latching type
2. **Ground Fault Detection** — <30mA RCD on AC input
3. **Over-Voltage Protection** — Hardware comparator, <1µs response
4. **Over-Current Protection** — Cycle-by-cycle current limiting
5. **Over-Temperature Protection** — NTC on heatsinks, PCB, and transformer
6. **Interlock Chain** — Door switch, cover switch, ground continuity
7. **PID-Specific** — 5mA leakage trip, HV bleeder resistor (discharge <5s)
8. **Lockout/Tagout** — Isolator switch on rear panel
9. **Creepage/Clearance** — Per IEC 60664-1 for rated voltage
10. **Modbus Safety Register** — Remote e-stop via register write

---

## File References

- Module profiles: `skills/templates/module_profiles.json`
- Test recipes: `skills/templates/tc_hf_recipe.json`, `letid_recipe.json`, `pid_recipe.json`
- BOM template: `skills/templates/bom_template.json`
- Chamber sync: `skills/templates/chamber_sync_config.json`
- Marketplace APIs: `skills/marketplace_apis.json`
- CLI shortcuts: `skills/shortcuts.md`

---

## Integration Points

- **Prisma/DB:** Store BOM, recipes, test results in PostgreSQL
- **Nexar API:** Primary component sourcing via GraphQL
- **FreeCAD:** Mechanical design automation via Python scripts
- **KiCAD:** PCB schematic and layout generation
- **Modbus:** All equipment communicates via RTU (RS-485) or TCP (Ethernet)
- **Data Logger:** CSV/Excel export of all test data with timestamps
- **Dashboard:** Next.js pages for real-time monitoring and recipe management
