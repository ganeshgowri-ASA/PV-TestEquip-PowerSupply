# agents.md — Claude Code Session Orchestration Map

## Session 1: Next.js App Scaffold
Folder: /app /components /lib /prisma
Tasks: Setup Next.js 14, routing, Shadcn UI, Railway DB, env config, Prisma schema

## Session 2: Nexar API Integration
Folder: /app/api/nexar /lib/nexar-client.ts
Tasks: GraphQL queries, pricing, availability, BOM export, Indian vendor alternatives

## Session 3: Dashboard & KPI Pages
Folder: /app/dashboard /components/charts
Tasks: Sourcing dashboard, price trends, vendor KPIs, BOM manager, recipe cards

## Session 4: Power Supply Configurator
Folder: /app/configurator /lib/calculations.ts
Tasks: TC/HF/LETID/PID recipe builder, module profiles, ABSI calculator, export PDF/JSON

## Session 5: CAD Generation (FreeCAD Python)
Folder: /cad /scripts/freecad
Tasks: 19-inch rack assembly, front/side/rear/isometric views, BOM PDF, cable routing DXF

## Session 6: PCB Schematics (KiCAD)
Folder: /pcb /schematics
Tasks: TC-HF bidirectional board, LETID precision board, PID HV board, Gerber/BOM export

## Session 7: Documentation & PDF Generator
Folder: /docs /public/exports
Tasks: Engineering report, wiring diagrams, Modbus register map, safety interlocks, BOM/BOQ

## Session 8: PV Test Equipment Skill Template
Folder: /skills /templates
Tasks: Reusable skill for future test equipment (chambers, loaders, IV tracers, EL/PL)

## Execution Order
- Phase 1 (Parallel): Sessions 1 + 2 + 5 + 6
- Phase 2 (After Session 1): Sessions 3 + 4
- Phase 3 (After Sessions 5+6): Session 7
- Phase 4 (Final): Session 8
