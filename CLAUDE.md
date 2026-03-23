# CLAUDE.md — PV-TestEquip-PowerSupply

## Project Overview
End-to-end power supply design and sourcing platform for PV module reliability testing:
- TC/HF (Thermal Cycling / Humidity Freeze) — Bidirectional, Regenerative, 60V/30A
- LETID (Light & Elevated Temperature Induced Degradation) — Precision 60V/2A
- PID (Potential Induced Degradation) — High Voltage ±4000V DC, nA–mA range

## Target Module (HJT Bifacial)
- Voc: 60V, Isc: 27A, Pmax: 1100W
- ABSI current injection per IEC 61215:2021
- 4-wire Kelvin voltage sensing
- 10 channels per rack

## Standards
- IEC 61215:2021 (TC/HF/LETID)
- IEC TS 62804-1:2025 (PID)
- PVEL LETID Sensitivity Test Protocol

## Nexar API
- Key: stored in .env as NEXAR_API_KEY
- GraphQL endpoint: https://api.nexar.com/graphql
- Use for: BOM sourcing, pricing, availability, vendor comparison

## Tech Stack
- Frontend: Next.js 14 App Router, TypeScript, TailwindCSS, Shadcn/ui
- Backend: Next.js API routes, Prisma ORM
- Database: PostgreSQL (Railway)
- Deployment: Vercel (frontend) + Railway (DB)
- CAD: FreeCAD Python scripts (output: PDF, STEP, DXF, PNG)
- PCB: KiCAD (output: Gerber, PDF schematics)

## Repository Structure
See agents.md for full folder map and session orchestration.

## Core Principles
- Test before declaring success
- All components must have Indian vendor alternatives
- Every power supply must support Modbus RTU/TCP
- Safety interlocks required for PID (trip at 5mA leakage)
- Regenerative mode preferred for TC/HF (green initiative)
- All outputs exportable: PDF, PNG, CSV, Excel, STEP, DXF
- Company: Antaryami Solar Analytics
