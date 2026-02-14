# Reusability economics for reusable first stages (Specialist Panel)

> **Scope:** first-stage reuse vs expendable. Goal is an **actionable, quantified** model that yields (i) **refurbishment cost** and **turnaround time** thresholds for reusability to win on **$/kg** and **schedule reliability**, and (ii) a ranked set of **design/ops levers** by economic ROI per added complexity.
>
> **Constraint note:** No external browsing. Numbers in the worked example are **illustrative**, chosen to be plausible and to show the math.

---

## 1-page executive summary

### What the model says (in one line)
A reusable first stage is economically superior when:
1) its **effective per-flight cost** (manufacturing amortization + recovery/refurb + common costs) divided by **reusable-mode payload** beats expendable, **and**
2) its **95th-percentile turnaround time** supports the target launch rate with slack after accounting for **attrition** (failed recoveries) and **maintenance downtime**.

### Key thresholds (closed-form)
Define:
- Payloads: `P_e` (expendable payload, kg), `P_r` (reusable payload, kg)
- Costs per launch (USD):
  - `C_common` = costs common to both modes (range + pad ops + propellants + 2nd stage + fairing + mission ops; or split as you prefer)
  - `C1_mfg` = cost to build a new first stage
  - `C_ref` = refurbishment + recovery + transport cost **per flight** (variable, includes labor/material/inspection and recovery operations)
- Reliability/attrition:
  - `p_rec` = probability the stage is recovered and returned in refurbishable condition
  - `N_design` = maximum allowed reuse count before retirement
  - `N_eff` = expected number of flights delivered per booster **including attrition** (formula below)

**(A) $/kg break-even condition**
Per-launch variable costs:
- Expendable: `C_e = C_common + C1_mfg`
- Reusable: `C_r = C_common + C_ref + C1_mfg / N_eff`

Reusable wins on $/kg if:

`C_r / P_r <= C_e / P_e`

Solving for the **maximum allowable refurbishment cost per flight**:

`C_ref <= C_e*(P_r/P_e) - C_common - C1_mfg/N_eff`

Interpretation:
- Higher payload penalty (lower `P_r/P_e`) tightens the refurb cost threshold.
- Lower recovery probability reduces `N_eff`, increasing amortized first-stage cost, also tightening the threshold.
- This formula is directly actionable: measure `C_ref`, `p_rec`, and `P_r/P_e` and you can see if reuse pencils out.

**(B) Schedule reliability / cadence feasibility threshold**
Let:
- `R` = required launch rate (launches/year)
- `B` = number of active boosters in the fleet
- `t_turn,95` = 95th-percentile turnaround time from landing to “ready for flight” (days)
- `d_down` = fraction of time a booster is unavailable due to heavy maintenance/overhaul (0–1)
- `S` = effective spares/coverage factor for attrition and unplanned removals (boosters)
- `u_target` = target utilization (0–1) for on-time performance (typical planning slack 0.6–0.8; higher makes schedule fragile)

A practical, conservative **on-time cadence feasibility** condition is:

`t_turn,95 <= 365 * u_target * (B*(1 - d_down) - S) / R`

Where a simple, measurable attrition-based spare estimate is:

`S ≈ 1 + R*(1 - p_rec)*(L_replace/365)`

- `L_replace` = calendar lead time to replace a lost booster (days) from decision-to-build through acceptance.

Interpretation:
- It’s not the median turnaround that matters for schedule promises; it’s the **tail** (`t_turn,95`) plus the slack you carry.
- Attrition can be small per flight but large per year at high cadence; spares must scale with `R*(1-p_rec)`.

### Dominant sensitivities (what most moves the needle)
Across a wide set of plausible inputs, the biggest drivers of reusability economics are typically:
1) **Refurbishment cost per flight** (`C_ref`) and its variance (tails hit `t_turn,95`).
2) **Recovery success probability** (`p_rec`) because it determines attrition and `N_eff` (amortization and spares).
3) **Payload penalty** (`P_r/P_e`) because it hits revenue potential and $/kg directly.
4) **Designed reuse life / wearout** (`N_design`, overhaul intervals) because it bounds `N_eff`.
5) **Replacement lead time** (`L_replace`) because it sets how many spares you must own to keep cadence.

### Highest-ROI levers per added complexity (ranked)
(“Complexity” here means added development + certification + operational risk.)
1) **Design-for-inspection & modular replacement** (reduce `C_ref` and `t_turn,95`): accessible components, quick-connects, built-in health monitoring that *replaces* manual NDE rather than adding steps.
2) **Refurb flow control: minimize work content and variability** (reduce `t_turn,95` more than median): standard work, part kitting, parallel bays, clear “no-findings” acceptance criteria.
3) **Increase recovery probability with low ops burden** (increase `p_rec`): robust landing margins, autonomous abort logic, contamination control; avoid solutions that add long tail rework.
4) **Raise reusable-mode payload** (increase `P_r`): mass and performance improvements that don’t increase refurb scope.
5) **Extend reuse life without heavy overhauls** (increase `N_design` and reduce `d_down`): materials/processes and operating limits that prevent “mandatory tear-down” intervals.

### Quick “go/no-go” checklist (what to compute tomorrow)
1) Measure/estimate `P_r/P_e` for your mission mix.
2) Estimate `N_eff` from recovery and wearout assumptions.
3) Plug into `C_ref,max` above; compare with a bottoms-up refurb cost estimate.
4) For a target cadence `R`, compute the required `t_turn,95` given your planned booster fleet size `B` and replacement lead time `L_replace`.

---

## Specialist 1 — Launch vehicle engineer (propulsion/structures)

### Assumptions
- First stage is the dominant reusable element; second stage and payload integration remain largely unchanged.
- Reuse introduces performance penalties: recovery propellant reserve, landing gear, TPS, structural reinforcement.
- Wearout is driven by **thermal cycles**, **dynamic loads**, and **engine life limits** (starts, duty cycle, transient margins).

### Key variables (engineering → economic coupling)
- `P_r/P_e`: payload penalty from recovery hardware and reserves.
- `N_design`: certified reuse life before retirement.
- `p_rec`: recovery probability (influenced by margins, guidance, structural robustness).
- `d_down`: heavy maintenance fraction (e.g., periodic engine swaps).
- Inspection burden drivers: number of critical joints, TPS acreage, engine count/complexity.

### High-impact design levers (3–5)
1) **Lower inspection complexity via architecture choices**
   - Fewer engines / simpler plumbing reduces leak checks, borescope count, sensor failure points.
   - Structural concepts that reduce hidden damage (e.g., avoid bonded hidden interfaces in critical load paths).
2) **Thermal and fatigue margining that avoids teardown**
   - Design operating points that prevent accumulated damage from becoming “inspect by disassembly.”
   - Use life models to set limits that are *operationally simple* (e.g., fixed throttle/entry constraints).
3) **Recovery system mass vs ops trade**
   - Landing legs/TPS that are slightly heavier but **dramatically faster to inspect/repair** often win economically.
   - Avoid fragile surfaces that create long-tail repair.
4) **Propellant and pressurant strategy to reduce contamination**
   - Contamination drives rework and component replacement; cleanliness is an ops cost amplifier.
5) **Quick-change subassemblies**
   - Engines, avionics bays, valves designed for fast swap with standardized interfaces (shifts cost from labor-hours to spares, often reducing `t_turn,95`).

---

## Specialist 2 — Ops/refurb/turnaround engineer

### Assumptions
- The economic winner is determined by the **work content** and especially the **variance** of refurb.
- Schedule promises are dictated by **95th-percentile** and **queueing**, not median performance.
- A refurb flow is a factory: bottlenecks, WIP, staffing, parts logistics dominate outcomes.

### Key variables
- `C_ref`: per-flight variable refurbishment + recovery cost.
- `t_turn,50`, `t_turn,95`: median and 95th-percentile turnaround time.
- `σ_turn`: variability; tail dominates schedule.
- `H_labor`: labor hours per refurb; `r_labor`: loaded labor rate.
- `p_no-find`: probability of “no findings” inspection (high `p_no-find` collapses tail).
- `B_bays`: number of parallel refurb bays; bottleneck station capacities.

### Highest-leverage operational levers (3–5)
1) **Reduce variability (attack the tail)**
   - “Fix the top 5 long-tail defects” program; design changes targeted at the most common findings.
   - Statistical process control on refurb time by station.
2) **Parallelize and de-bottleneck**
   - If one station (e.g., engine inspection) gates flow, add capacity or redesign to remove that station.
3) **Pre-position spares and kitting**
   - Waiting for parts creates tail risk; kit known replacement items; standardize consumables.
4) **Automate inspection where it replaces steps**
   - Embedded sensors/health monitoring is valuable only if it eliminates manual inspection, not if it’s additive.
5) **Transport and handling simplification**
   - Quick offload, minimal disassembly for transport, environmentally controlled storage reduces corrosion/contamination findings.

---

## Specialist 3 — Microeconomist / industrial organization

### Assumptions
- Firm chooses between two “production technologies”: expendable (unit production) vs reusable (capital + remanufacturing).
- Demand is cadence- and reliability-sensitive; penalties for late delivery can be substantial (liquidated damages, lost customers, price discounts).
- Fixed overhead exists (`F_annual`) and gets allocated across flights; higher cadence can reduce overhead per flight.

### Key variables
- `F_annual`: fixed annual cost (facilities, engineering, corporate overhead).
- `R`: realized launch rate (launches/year) and its variance.
- `π_delay`: expected schedule penalty cost per late launch (could proxy via discount in price).
- `P_on-time`: probability a launch occurs within a promised window.
- `Price/kg` or `Price/launch`: revenue side (not required for $/kg cost comparison, but crucial for business case).

### Economic levers (3–5)
1) **Capacity planning and slack**
   - Choose `B` and refurb capacity so utilization stays below the fragile region; slack is an insurance premium that improves `P_on-time`.
2) **Inventory vs capital trade**
   - Expendable uses inventory of stages; reusable uses capital (booster fleet + spares). Optimize for replacement lead time and financing cost.
3) **Standardization / product simplification**
   - Reduces both variable cost and variance; also enables learning curves.
4) **Contract design**
   - Pricing that shares schedule risk, and internal metrics that treat schedule reliability as a costed KPI.
5) **Learning curve management**
   - Refurb cost often falls with cumulative flights; invest early in measurement systems that accelerate learning.

---

## Specialist 4 — Safety / reliability engineer

### Assumptions
- Reuse changes the reliability problem: you exchange “new-build defects” for “wearout/latent damage/inspection escapes.”
- Schedule reliability is linked to safety processes: if safety demands teardown, `t_turn,95` increases.
- Certification and operational acceptance criteria can dominate costs.

### Key variables
- `p_mission_e`, `p_mission_r`: probability of mission success (including ascent + stage separation + reaching orbit) for expendable vs reusable.
- `p_rec`: recovery success probability.
- `p_escape`: probability an inspection misses a critical defect (drives risk).
- `C_fail`: expected cost of failure (vehicle loss, payload loss, stand-down time, reputational and regulatory impacts).
- `t_invest`: time spent in inspections/recertification.

### Safety/reliability levers (3–5)
1) **Risk-based inspection that is *less work*, not more**
   - Condition-based maintenance: only inspect what data says is at risk.
2) **Design to avoid latent damage**
   - Robustness to off-nominal loads reduces “hidden damage” cases that force teardown.
3) **Failure containment and rapid return-to-flight**
   - If an anomaly triggers a fleet stand-down, schedule reliability collapses. Build in diagnostic isolation.
4) **Reliability growth program**
   - Quantify and drive down both `p_rec` loss causes and “refurb findings” causes; each incident is also a schedule tail event.
5) **Clear acceptance criteria and configuration control**
   - Ambiguity creates rework and review delays; treat paperwork cycle time as part of `t_turn`.

---

## Synthesis: a simple, actionable model

### 1) Definitions (inputs you can measure)
**Performance**
- `P_e` = payload to orbit in expendable mode (kg)
- `P_r` = payload to orbit in reusable mode (kg)

**Costs (per launch unless noted)**
- `C_common` = all costs common to both modes (USD)
- `C1_mfg` = cost to produce a new first stage (USD)
- `C_ref` = variable cost to recover + refurbish a booster for next flight (USD)
- `F_annual` = annual fixed overhead (USD/year)

**Reliability / life**
- `p_rec` = probability booster is recovered and returns refurbishable
- `N_design` = maximum reuse count before retirement (hard cap)
- Optional wearout: `p_w` = probability a booster is retired per flight due to wear/limits even if recovered (can be folded into an effective attrition probability)

**Turnaround / capacity**
- `t_turn,50`, `t_turn,95` = turnaround time distribution stats (days)
- `R` = target launch rate (launches/year)
- `B` = number of boosters
- `d_down` = fraction of time boosters are down for major overhauls (0–1)
- `L_replace` = replacement lead time for a lost booster (days)
- `u_target` = target utilization to achieve promised on-time probability (0–1)

### 2) Effective reuse count (amortization)
If each flight ends with a recovered, reusable booster with probability `p_rec` and loss ends the booster’s life, the expected number of flights from a single booster **up to** the design cap `N_design` is:

`N_eff = (1 - p_rec^{N_design}) / (1 - p_rec)`

Notes:
- This assumes losses are independent and identically distributed and that a “non-recovered” event retires the booster.
- If there’s also wearout/retirement probability `p_w` per flight, replace `p_rec` with `p_survive = p_rec*(1 - p_w)`.

### 3) Cost per flight and $/kg
**Per-flight total cost including fixed overhead allocation** (optional but useful):

- Expendable:
  - `C_e,total = C_common + C1_mfg + F_annual/R`
- Reusable:
  - `C_r,total = C_common + C_ref + C1_mfg/N_eff + F_annual/R`

Because `F_annual/R` is the same form for both (if `R` is the same), the **mode choice** is often determined by the variable terms.

**$/kg**:

- `$/kg_e = C_e,total / P_e`
- `$/kg_r = C_r,total / P_r`

**Break-even refurbishment threshold** (re-stated):

`C_ref,max = C_e*(P_r/P_e) - C_common - C1_mfg/N_eff`

Where `C_e = C_common + C1_mfg` (variable part).

### 4) Schedule reliability model (capacity + slack)
A simple operations-planning rule that maps to “high on-time probability” is to keep effective utilization below `u_target` (e.g., 0.7).

**Effective booster capacity at the 95th percentile**:

`Cap_95 (launches/year) = 365 * (B*(1 - d_down) - S) / t_turn,95`

To meet a required rate `R` with slack:

`Cap_95 >= R / u_target`

Rearranging yields the turnaround threshold:

`t_turn,95 <= 365 * u_target * (B*(1 - d_down) - S) / R`

**Spare requirement `S`**
A practical spare term includes (i) one “operational spare” for unexpected removals plus (ii) coverage for expected attrition during replacement lead time:

`S ≈ 1 + R*(1 - p_rec)*(L_replace/365)`

If you do not have booster-level spares but instead keep a partially built booster pipeline, `S` can be replaced by an equivalent “time-to-replace” in the numerator.

### 5) Combining economics and schedule into one decision
A reusable first stage is superior under the dual criterion:

1. **Cost:** `$/kg_r <= $/kg_e`
2. **Schedule:** `t_turn,95 <= 365 * u_target * (B*(1 - d_down) - S) / R`

If (1) holds but (2) fails, reuse is “cheap but not dependable” at the intended cadence.
If (2) holds but (1) fails, reuse may still be viable if it increases achievable `R` (thus reducing `F_annual/R`) or if customers pay for responsiveness.

---

## Worked example (illustrative numbers)

### Inputs (illustrative)
Assume a medium-lift vehicle.

**Performance**
- `P_e = 16,000 kg`
- `P_r = 14,000 kg`  (12.5% payload penalty)

**Variable costs**
- `C_common = $20M` (2nd stage + fairing + propellant + pad/range/mission ops)
- `C1_mfg = $20M` (new first stage)

**Reuse/attrition**
- `N_design = 10`
- `p_rec = 0.95`

Compute effective reuse count:

`N_eff = (1 - 0.95^{10})/(1 - 0.95) ≈ (1 - 0.5987)/0.05 ≈ 8.03 flights`

Thus amortized first-stage cost per flight:

`C1_mfg/N_eff ≈ 20/8.03 ≈ $2.49M`

### $/kg break-even refurb threshold
Expendable variable cost:

`C_e = C_common + C1_mfg = 20 + 20 = $40M`

Reusable wins on $/kg if:

`C_r <= C_e*(P_r/P_e) = 40*(14/16) = $35M`

Reusable variable cost excluding refurb is:

`C_common + C1_mfg/N_eff = 20 + 2.49 = $22.49M`

So the maximum refurb+recovery cost per flight is:

`C_ref,max = 35 - 22.49 = $12.51M`

**Interpretation:** with these assumptions, **reuse still beats expendable on $/kg even if refurb costs up to about $12.5M per flight**.

If actual refurb is, say, `C_ref = $6M`, then:
- `C_r = 20 + 2.49 + 6 = $28.49M`
- `$/kg_r = 28.49/14,000 ≈ $2,035/kg`
- `$/kg_e = 40/16,000 = $2,500/kg`

Reuse is ~19% cheaper on $/kg in this illustrative case.

### Schedule reliability threshold (illustrative)
Suppose target `R = 20 launches/year`.
Plan a fleet of `B = 4` boosters.
Assume:
- `t_turn,95` is unknown (this is what we want to bound)
- `d_down = 0.10` (major maintenance consumes ~10% time)
- `L_replace = 180 days` to replace a lost booster
- `u_target = 0.70` (30% slack to hit on-time targets)

Compute spares coverage:

`S ≈ 1 + R*(1 - p_rec)*(L_replace/365)
   = 1 + 20*(0.05)*(180/365)
   ≈ 1 + 0.49
   ≈ 1.49 boosters`

Effective boosters available:

`B_eff = B*(1 - d_down) - S = 4*(0.9) - 1.49 = 3.6 - 1.49 = 2.11`

Turnaround threshold:

`t_turn,95 <= 365*u_target*B_eff/R
          = 365*0.70*2.11/20
          ≈ 26.9 days`

**Interpretation:** to reliably support **20 launches/year** with **4 boosters** under these assumptions, you need `t_turn,95` on the order of **~27 days or less**.

If your measured `t_turn,95` is 45 days, schedule reliability will likely suffer unless you (i) add boosters, (ii) reduce attrition (increase `p_rec`), (iii) reduce replacement lead time, or (iv) accept higher utilization and thus lower on-time probability.

---

## Sensitivity: what dominates the break-even
Below are simple “directional derivatives” you can compute quickly.

### 1) Refurbishment cost threshold sensitivity
From:

`C_ref,max = (C_common + C1_mfg)*(P_r/P_e) - C_common - C1_mfg/N_eff`

Key sensitivities:
- **Payload penalty:** `∂C_ref,max/∂(P_r/P_e) = C_e`.
  - In the example, +0.01 (1 percentage point) in `P_r/P_e` raises `C_ref,max` by **$0.40M**.
- **Recovery probability (via N_eff):** increasing `p_rec` increases `N_eff`, reducing `C1_mfg/N_eff`.
  - When `p_rec` is already high, improvements still matter because they also reduce spares and schedule risk.
- **First-stage manufacturing cost:** higher `C1_mfg` makes reuse more attractive *if* `N_eff` is decent.

### 2) Schedule threshold sensitivity
From:

`t_turn,95,max = 365*u_target*(B*(1-d_down) - S)/R`

Key sensitivities:
- `∂t_turn,95,max/∂B = 365*u_target*(1-d_down)/R` (linear benefit per booster).
- `∂t_turn,95,max/∂R` is inverse: doubling cadence halves allowed turnaround.
- Attrition hits twice: it increases `S` (more spares) and often increases variance (more anomalies).

Practical takeaway: if you’re targeting high cadence, the economics are often easy but **the tail of turnaround becomes the gating factor**.

---

## Ranked levers by economic ROI per complexity (with “why”)

1) **Cut `t_turn,95` by reducing findings and rework (highest ROI)**
   - Why: schedule feasibility scales linearly with `(B_eff / t_turn,95)`. Tails dominate.
   - How: design changes targeted at the top recurring refurb findings; clearer acceptance criteria; contamination and corrosion prevention.

2) **Lower `C_ref` by eliminating labor-hours, not by rate negotiation**
   - Why: `C_ref` enters cost per flight dollar-for-dollar; also correlates with turnaround tail.
   - How: access panels, standardized fasteners, modular swaps, minimize TPS repair, automate checks that replace manual steps.

3) **Increase `p_rec` (reduce attrition) with robust margins**
   - Why: raises `N_eff` (amortization) and reduces spares `S`; also prevents cadence collapse.
   - Beware: solutions that improve `p_rec` but add complex post-flight work can be net-negative.

4) **Increase `P_r/P_e` (reduce payload penalty)**
   - Why: threshold `C_ref,max` is proportional to `P_r/P_e`; payload penalty directly hits $/kg and revenue.
   - How: mass reduction in recovery hardware, higher-Isp improvements, better mass fraction; avoid increasing refurb scope.

5) **Reduce replacement lead time `L_replace`**
   - Why: reduces spares needed for reliability; improves resilience to anomalies.
   - How: keep a “warm” production line, partial builds, supplier agreements; standardization.

6) **Extend `N_design` only if it doesn’t increase `d_down`**
   - Why: higher reuse life helps amortization, but mandatory overhauls can increase downtime and tail.
   - Rule of thumb: “more cycles” is valuable only when it’s *operationally invisible*.

---

## Data needed to make this real (what to measure)

### Cost accounting (per flight, with distributions)
- `C_ref` broken down into:
  - labor-hours by station + rework fraction
  - materials/consumables
  - inspection/NDE time and equipment costs
  - recovery operations (fuel, ships/vehicles, personnel)
  - transport and storage
- `C_common` broken down to identify what truly scales with flights.

### Turnaround time distribution (not just averages)
- `t_turn` by process step; measure `t_turn,50`, `t_turn,90`, `t_turn,95`.
- Root-cause tags for delays (parts wait, engineering disposition, damage repair, weather recovery).
- WIP and queue times per station (to separate “work time” from “waiting time”).

### Reliability / attrition and their causes
- `p_rec` with categorical loss causes.
- “Recovered but not refurbishable” frequency (counts against `p_rec` economically).
- Anomaly rates that trigger stand-down or added inspection.

### Hardware life / wearout
- Engine and structure life consumption models vs observed post-flight measurements.
- Frequency and duration of major overhauls (`d_down`) and their triggers.

### Replacement pipeline
- `L_replace` distribution (supplier lead times, integration, acceptance).
- Cost and time to scale production (learning curve slopes).

### Customer-facing schedule reliability
- On-time performance vs promised windows; penalty costs (`π_delay`) and churn impact.
- Correlation between refurb findings and schedule slips.

---

*End of panel writeup.*
