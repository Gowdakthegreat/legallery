# LeGallery Design System & Architecture Specification

## 1. Product Strategy & Essence
- **Artifact:** High-end RWA (Real World Assets) physical fine art marketplace & bilateral escrow protocol.
- **Audience:** Contemporary Brazilian art collectors, galleries, artists, and institutional buyers seeking fraud-proof provenance and tax-compliant liquidation.
- **Aesthetic Essence:** *Sovereign Luxury, Museum-Grade Provenance, Cryptographic Certainty*.
- **Brand Adjectives:** Curated, Uncompromising, Authoritative, Fluid, Transparent.

---

## 2. Signature Move
**The Dual-Face Ricardiano Drawer with Live Tamper Radar**:
Every artwork connects an immutable physical specimen (tagged with an NTAG 424 DNA cryptographic chip) with a bilateral legal contract under Brazilian law ([Lei 9.610/98](http://www.planalto.gov.br/ccivil_03/leis/l9610.htm) and [Lei 14.063/20](http://www.planalto.gov.br/ccivil_03/_ato2019-2022/2020/lei/l14063.htm)). The interface exposes a live hash auditor where altering a single letter shows the instant SHA-256 mutation and blockchain anti-fraud rejection.

---

## 3. Typography Hierarchy
- **Display Serif (Headings & Luxury Emblems):** `Cinzel`, weight 600/700, letter-spacing 0.02em - 0.08em.
- **Interface Sans (Body, Actions & Navigation):** `Plus Jakarta Sans`, weight 400/500/600/700, line-height 1.6.
- **Cryptographic Monospace (Hashes, Tokens & Addresses):** `JetBrains Mono`, weight 500, tabular numerals.

---

## 4. Color Architecture & Roles
- **Primary Background (`--bg-primary`):** `#07080B` (Deep obsidian black with subtle radial ambient glow).
- **Surface Elevation (`--bg-secondary` / `--bg-tertiary`):** `#0D0F17` / `#131722`.
- **Luxury Gold Accent (`--gold-primary`):** `#D4AF37` / `#F3E5AB` (Used for value metrics, featured accents, and prestige indicators).
- **Ethereum / Base L2 Blue (`--base-blue`):** `#0052FF` / `#3375FF` (Used for smart contract actions, transactions, and Web3 states).
- **Gov.br & Cryptographic Security (`--gov-green`):** `#10B981` / `#34D399` (Used for authenticated state, tamper-proof NFC status, and validated SHA-256 hashes).
- **Text Hierarchy:** High-contrast white `#F8FAFC`, secondary muted `#94A3B8`, subtle hints `#64748B`.

---

## 5. Craft Layer & Interaction Rules
1. **Touch Targets:** Minimum 44×44px for all mobile interactive elements.
2. **Accessible Focus:** Visible `:focus-visible` dual-layer rings (2px gold/blue outline with 2px offset).
3. **Motion:** Purposeful, spatial continuity; micro-interactions under 250ms; gentle radar pulses on NFC hardware badges.
4. **Copywriting:** Clear, confident legal and financial terminology; avoiding speculative jargon in favor of institutional security.
