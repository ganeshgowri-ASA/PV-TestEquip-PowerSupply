# PV Test Equipment — CLI Shortcuts

One-liner prompts for future Claude Code sessions. Copy-paste into any session working on PV test equipment.

---

## Power Supply Design

```
Design a TC/HF bidirectional regenerative power supply for HJT bifacial modules (60V/27A), 10 channels, 19-inch rack, with full BOM and Indian vendor alternatives.
```

```
Design a LETID precision power supply (60V/2A, ±0.1% regulation) with 16-bit DAC control, 10 channels, low-noise linear+switching hybrid topology.
```

```
Design a PID high-voltage power supply (±4000V DC, nA-mA measurement) with Cockcroft-Walton multiplier, 5mA leakage trip, arc detection, and HV safety interlocks.
```

## BOM & Sourcing

```
Generate a complete BOM for the TC/HF power supply using Nexar API. Include Mouser, Digi-Key, and Indian vendor alternatives (Moglix, Evelta). Flag items with >4 week lead time.
```

```
Run a vendor comparison matrix for SiC MOSFETs (650V, 30A) across Nexar, Mouser, Digi-Key, Element14, and TME. Output as Excel with price, MOQ, lead time columns.
```

```
Source all components for a 10-channel LETID power supply. Priority: precision DACs (16-bit), low-noise op-amps, precision shunt resistors. Must have Indian vendor backup.
```

## Test Chamber Integration

```
Configure chamber sync for TC200 test: chamber ramp -40°C to 85°C, current injection starts at 25°C rising, stops at 25°C falling. Generate Modbus register map and sync triggers.
```

```
Design a damp heat chamber interface (85°C/85%RH) synchronized with PID power supply. Include HV safety interlocks, door switch integration, and data logging config.
```

## Test Recipes

```
Generate a TC200 + HF10 test recipe per IEC 61215:2021 for PERC mono modules (Voc=49.5V, Isc=18.5A). Include ABSI current injection profile and pass/fail criteria.
```

```
Create a LETID sensitivity test recipe per PVEL protocol for TOPCon modules. 75°C, Isc×0.075 injection, 162 hours, with flash test intervals and degradation categories.
```

```
Create a PID-s test recipe per IEC 62804-1:2025 for p-type PERC modules. -1000V system voltage, 85°C/85%RH, 96 hours, with EL imaging at 0h and 96h.
```

## Flash Tester & IV Tracer

```
Design an IV curve tracer front-end (0-80V, 0-30A) with programmable sweep rate, 4-wire Kelvin sensing, and STC flash test integration for PV module characterization.
```

```
Spec an AAA solar simulator flash tester for STC measurements (1000 W/m², AM1.5G). Include xenon pulse driver, irradiance uniformity monitor, and automated IV sweep.
```

## EL/PL Imaging

```
Design an EL imaging power supply for forward-bias current injection at Isc (27A) with programmable exposure timing, camera trigger output, and dark environment interlock.
```

```
Spec a PL imaging system with 808nm laser excitation, InGaAs camera (>1MP), and integration with IV curve tracer for inline quality inspection.
```

## Electronic Loads

```
Design a 4-quadrant bidirectional electronic load (80V/33A) with regenerative energy recovery (>90% efficiency), MPPT tracking mode, and Modbus TCP control.
```

```
Design a 2-quadrant DC electronic load (80V/33A, 2.4kW) with CC/CV/CR/CP modes, >10 A/ms slew rate, for PV module characterization and burn-in testing.
```

## Mechanical Load Testing

```
Design a mechanical load tester control system per IEC 62782 for PV modules (up to 2.5m×1.4m). Pneumatic bladder, 0-8000 Pa range, LVDT deflection measurement, 1000 dynamic cycles.
```

## Insulation & Hipot Testing

```
Design a hipot/insulation tester for PV modules: dry test (1000V+2×Voc), wet leakage test (500V), with programmable ramp, dwell time, and µA-level leakage measurement.
```

## CAD & PCB

```
Generate FreeCAD Python scripts for a 19-inch rack layout (4U) housing a 10-channel TC/HF power supply. Output: front panel, rear panel, side view as PDF + STEP + DXF.
```

```
Generate KiCAD schematics for the LETID precision power supply control board: STM32G4 MCU, DAC8562, ADS1263 ADC, INA226 current sense, RS-485 Modbus, Kelvin sense input.
```

## Module Profiles

```
Load the HJT bifacial module profile (60V/27A/1100W) and calculate all derived test parameters: ABSI current, LETID injection current, insulation test voltage, power supply headroom.
```

```
Create a custom module profile for a new PERC bifacial module (Voc=50.2V, Isc=17.8A, Pmax=550W, 144 half-cut cells) and generate TC/HF + LETID + PID recipes.
```

## Full Session Bootstraps

```
Start a new PV test equipment session for designing a complete TC/HF testing station. Load skills/pv-test-equipment.md, module profile HJT bifacial, generate power supply specs, BOM, chamber sync config, and test recipe.
```

```
Start a complete PID testing station design session. Load PID recipe, HV power supply specs, chamber sync with 85/85 conditions, safety interlock chain, BOM with HV-rated components.
```

```
Start a LETID lab design session for 20-channel capacity. Load LETID recipe, precision power supply specs, hotplate/chamber sync, flash tester integration schedule, and full BOM.
```

---

## Usage Notes

- All shortcuts assume the `skills/` folder and templates are present in the repo
- Modify module parameters in the prompt to match your specific module under test
- For custom modules, provide Voc, Isc, Pmax, cell count, and cell type at minimum
- Indian vendor alternatives are always included by default per project requirements
- All equipment designs include Modbus RTU/TCP communication by default
