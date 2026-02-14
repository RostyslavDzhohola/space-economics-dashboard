import { useMemo, useState } from 'react'
import { BlockMath, InlineMath } from 'react-katex'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import HeroScene from './HeroScene'
import panelContent from './content/panel.md?raw'

const formatNumber = (value: number, digits = 2) => {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

const formatMoney = (value: number, digits = 2) => {
  if (!Number.isFinite(value)) return '—'
  return `$${formatNumber(value, digits)}M`
}

const formatPerKg = (value: number) => {
  if (!Number.isFinite(value)) return '—'
  return `$${Math.round(value).toLocaleString()}/kg`
}

const computeNEff = (pRec: number, nDesign: number) => {
  if (nDesign <= 0) return 0
  if (pRec >= 0.9999) return nDesign
  return (1 - Math.pow(pRec, nDesign)) / (1 - pRec)
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

type InputFieldProps = {
  label: string
  value: number
  onChange: (value: number) => void
  step?: number
  min?: number
  max?: number
  suffix?: string
  hint?: string
}

const InputField = ({ label, value, onChange, step, min, max, suffix, hint }: InputFieldProps) => (
  <label className="field">
    <span className="field-label">{label}</span>
    <div className="field-control">
      <input
        type="number"
        value={Number.isFinite(value) ? value : ''}
        onChange={(event) => {
          const nextValue = Number(event.target.value)
          onChange(Number.isNaN(nextValue) ? 0 : nextValue)
        }}
        step={step}
        min={min}
        max={max}
        inputMode="decimal"
      />
      {suffix && <span className="field-suffix">{suffix}</span>}
    </div>
    {hint && <span className="field-hint">{hint}</span>}
  </label>
)

type EquationCardProps = {
  title: string
  latex: string
  note?: string
}

const EquationCard = ({ title, latex, note }: EquationCardProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!navigator?.clipboard) return
    try {
      await navigator.clipboard.writeText(latex)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch (error) {
      setCopied(false)
    }
  }

  return (
    <div className="card equation-card">
      <div className="equation-header">
        <div>
          <span className="equation-tag">Equation</span>
          <div className="equation-title">{title}</div>
        </div>
        <button type="button" className="equation-copy" onClick={handleCopy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="equation-body">
        <BlockMath math={latex} />
      </div>
      {note && <p className="equation-note">{note}</p>}
    </div>
  )
}

const App = () => {
  const [breakEven, setBreakEven] = useState({
    Pe: 16000,
    Pr: 14000,
    C_common: 20,
    C1_mfg: 20,
    p_rec: 0.95,
    N_design: 10,
  })

  const [cadence, setCadence] = useState({
    R: 20,
    B: 4,
    d_down: 0.1,
    u_target: 0.7,
    L_replace: 180,
    p_rec: 0.95,
    t_turn95: 27,
  })

  const workedExample = {
    Pe: 16000,
    Pr: 14000,
    C_common: 20,
    C1_mfg: 20,
    p_rec: 0.95,
    N_design: 10,
    R: 20,
    B: 4,
    d_down: 0.1,
    u_target: 0.7,
    L_replace: 180,
    t_turn95: 27,
    C_ref_example: 6,
  }

  const breakEvenResults = useMemo(() => {
    const N_eff = computeNEff(breakEven.p_rec, breakEven.N_design)
    const C_e = breakEven.C_common + breakEven.C1_mfg
    const C_ref_max =
      C_e * (breakEven.Pr / breakEven.Pe) - breakEven.C_common - breakEven.C1_mfg / (N_eff || 1)
    const C_r_at_threshold = breakEven.C_common + breakEven.C1_mfg / (N_eff || 1) + C_ref_max
    const costPerKgE = (C_e * 1_000_000) / breakEven.Pe
    const costPerKgR = (C_r_at_threshold * 1_000_000) / breakEven.Pr

    return { N_eff, C_e, C_ref_max, C_r_at_threshold, costPerKgE, costPerKgR }
  }, [breakEven])

  const cadenceResults = useMemo(() => {
    const S = 1 + cadence.R * (1 - cadence.p_rec) * (cadence.L_replace / 365)
    const B_eff = cadence.B * (1 - cadence.d_down) - S
    const t_turn95_max = cadence.R > 0 ? (365 * cadence.u_target * B_eff) / cadence.R : 0
    const feasible = cadence.t_turn95 <= t_turn95_max

    return { S, B_eff, t_turn95_max, feasible }
  }, [cadence])

  const exampleResults = useMemo(() => {
    const N_eff = computeNEff(workedExample.p_rec, workedExample.N_design)
    const C_e = workedExample.C_common + workedExample.C1_mfg
    const C_ref_max =
      C_e * (workedExample.Pr / workedExample.Pe) -
      workedExample.C_common -
      workedExample.C1_mfg / N_eff
    const C_r = workedExample.C_common + workedExample.C1_mfg / N_eff + workedExample.C_ref_example
    const costPerKgE = (C_e * 1_000_000) / workedExample.Pe
    const costPerKgR = (C_r * 1_000_000) / workedExample.Pr
    const S = 1 + workedExample.R * (1 - workedExample.p_rec) * (workedExample.L_replace / 365)
    const B_eff = workedExample.B * (1 - workedExample.d_down) - S
    const t_turn95_max = (365 * workedExample.u_target * B_eff) / workedExample.R

    return { N_eff, C_ref_max, C_r, costPerKgE, costPerKgR, t_turn95_max, B_eff, S }
  }, [])

  const sensitivityData = useMemo(() => {
    const points: { ratio: number; value: number }[] = []
    const N_eff = computeNEff(workedExample.p_rec, workedExample.N_design)
    const C_e = workedExample.C_common + workedExample.C1_mfg
    for (let ratio = 0.75; ratio <= 1.0001; ratio += 0.05) {
      const C_ref_max = C_e * ratio - workedExample.C_common - workedExample.C1_mfg / N_eff
      points.push({ ratio: parseFloat(ratio.toFixed(2)), value: C_ref_max })
    }
    return points
  }, [])

  const chart = useMemo(() => {
    const values = sensitivityData.map((point) => point.value)
    const max = Math.max(...values, 0)
    const min = Math.min(...values, 0)
    const width = 560
    const height = 200
    const paddingX = 40
    const paddingY = 20

    const scaleX = (index: number) =>
      paddingX + (index / (sensitivityData.length - 1)) * (width - paddingX * 2)
    const scaleY = (value: number) => {
      if (max === min) return height / 2
      const t = (value - min) / (max - min)
      return height - paddingY - t * (height - paddingY * 2)
    }

    const line = sensitivityData
      .map((point, index) => `${scaleX(index)},${scaleY(point.value)}`)
      .join(' ')

    return { width, height, line, min, max, scaleX, scaleY }
  }, [sensitivityData])

  const leverageCards = [
    {
      title: 'Kill top refurb findings (hit the tail)',
      detail: (
        <>
          Fix the top defects to collapse <InlineMath math="t_{turn,95}" /> and improve on-time
          probability.
        </>
      ),
    },
    {
      title: 'Strip labor hours from refurb',
      detail: (
        <>
          Access panels, standardized fasteners, and modular swaps drop{' '}
          <InlineMath math="C_{ref}" /> fast.
        </>
      ),
    },
    {
      title: 'Raise recovery probability (p_rec)',
      detail: (
        <>
          Higher <InlineMath math="p_{rec}" /> improves amortization and reduces spares needed for
          cadence.
        </>
      ),
    },
    {
      title: 'Protect payload ratio (P_r/P_e)',
      detail: (
        <>
          Payload penalty drives $/kg. Shave recovery mass without growing refurb scope.
        </>
      ),
    },
    {
      title: 'Shorten replacement lead time',
      detail: (
        <>
          Faster <InlineMath math="L_{replace}" /> means fewer spares and stronger resilience to
          anomalies.
        </>
      ),
    },
  ]

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <div className="hero-tag">Reusable First-Stage Economics</div>
            <h1>First-Stage Reuse — Go/No-Go</h1>
            <p className="hero-sub">
              Plug in payload, refurb, and cadence. Clear the $/kg gate and the turnaround gate.
            </p>
          </div>
          <div className="hero-visual">
            <HeroScene />
            <div className="hero-glow" aria-hidden="true" />
          </div>
        </div>
        <div className="equation-grid">
          <EquationCard
            title="Refurb ceiling ($/kg gate)"
            latex="C_{ref,max} = C_e \\cdot \\frac{P_r}{P_e} - C_{common} - \\frac{C_{1,\\text{mfg}}}{N_{eff}}"
            note="Reuse closes if refurb + recovery stay under this ceiling."
          />
          <EquationCard
            title="Turnaround ceiling (cadence gate)"
            latex="t_{turn,95} \\le \\frac{365\\,u_{target}\\,(B(1-d_{down}) - S)}{R}"
            note="Tail turnaround must fit inside slack-adjusted capacity."
          />
        </div>
      </header>

      <main>
        <section id="summary" className="section">
          <div className="section-heading">
            <p className="section-kicker">Executive summary</p>
            <h2>Two gates decide reuse: $/kg + cadence.</h2>
          </div>
          <div className="summary-grid">
            <div className="card">
              <h3>Gate 1 — $/kg</h3>
              <p>
                Reuse wins when amortized stage cost plus refurb beats expendable $/kg after payload
                penalty.
              </p>
              <ul>
                <li>
                  Higher <InlineMath math="P_r/P_e" /> creates refurb headroom.
                </li>
                <li>
                  Higher <InlineMath math="p_{rec}" /> raises <InlineMath math="N_{eff}" /> and lowers
                  amortized cost.
                </li>
                <li>
                  Refurb cost <InlineMath math="C_{ref}" /> is dollar-for-dollar.
                </li>
              </ul>
            </div>
            <div className="card">
              <h3>Gate 2 — Cadence</h3>
              <p>
                Cadence lives in the tail. The 95th-percentile turnaround must clear the
                slack-adjusted threshold.
              </p>
              <ul>
                <li>
                  <InlineMath math="t_{turn,95}" /> must stay under the cap.
                </li>
                <li>
                  Attrition drives spares <InlineMath math="S" /> and shrinks capacity.
                </li>
                <li>
                  Higher <InlineMath math="R" /> tightens the window.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id="break-even" className="section">
          <div className="section-heading">
            <p className="section-kicker">Calculator 01</p>
            <h2>$/kg gate — refurb ceiling</h2>
          </div>
          <div className="calculator">
            <div className="card">
              <h3>Inputs</h3>
              <div className="field-grid">
                <InputField
                  label="Expendable payload (P_e)"
                  value={breakEven.Pe}
                  onChange={(value) => setBreakEven((prev) => ({ ...prev, Pe: value }))}
                  step={100}
                  suffix="kg"
                />
                <InputField
                  label="Reusable payload (P_r)"
                  value={breakEven.Pr}
                  onChange={(value) => setBreakEven((prev) => ({ ...prev, Pr: value }))}
                  step={100}
                  suffix="kg"
                />
                <InputField
                  label="Common costs (C_common)"
                  value={breakEven.C_common}
                  onChange={(value) => setBreakEven((prev) => ({ ...prev, C_common: value }))}
                  step={0.5}
                  suffix="$M"
                />
                <InputField
                  label="1st stage mfg (C1_mfg)"
                  value={breakEven.C1_mfg}
                  onChange={(value) => setBreakEven((prev) => ({ ...prev, C1_mfg: value }))}
                  step={0.5}
                  suffix="$M"
                />
                <InputField
                  label="Recovery probability (p_rec)"
                  value={breakEven.p_rec}
                  onChange={(value) =>
                    setBreakEven((prev) => ({ ...prev, p_rec: clamp(value, 0, 1) }))
                  }
                  step={0.01}
                  min={0}
                  max={1}
                />
                <InputField
                  label="Design reuse cap (N_design)"
                  value={breakEven.N_design}
                  onChange={(value) => setBreakEven((prev) => ({ ...prev, N_design: value }))}
                  step={1}
                  min={1}
                />
              </div>
            </div>
            <div className="card result-card">
              <h3>Outputs</h3>
              <div className="stat-grid">
                <div>
                  <span>N_eff</span>
                  <strong>{formatNumber(breakEvenResults.N_eff, 2)} flights</strong>
                </div>
                <div>
                  <span>Expendable cost / kg</span>
                  <strong>{formatPerKg(breakEvenResults.costPerKgE)}</strong>
                </div>
                <div>
                  <span>Refurb ceiling</span>
                  <strong>{formatMoney(breakEvenResults.C_ref_max, 2)}</strong>
                </div>
                <div>
                  <span>Reusable $/kg @ ceiling</span>
                  <strong>{formatPerKg(breakEvenResults.costPerKgR)}</strong>
                </div>
              </div>
              <div className="result-callout">
                <p>
                  Reuse wins if refurb + recovery stays below
                  <strong> {formatMoney(breakEvenResults.C_ref_max, 2)}</strong>.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="cadence" className="section">
          <div className="section-heading">
            <p className="section-kicker">Calculator 02</p>
            <h2>Cadence gate — turnaround ceiling</h2>
          </div>
          <div className="calculator">
            <div className="card">
              <h3>Inputs</h3>
              <div className="field-grid">
                <InputField
                  label="Required rate (R)"
                  value={cadence.R}
                  onChange={(value) => setCadence((prev) => ({ ...prev, R: value }))}
                  step={1}
                  suffix="/yr"
                />
                <InputField
                  label="Active boosters (B)"
                  value={cadence.B}
                  onChange={(value) => setCadence((prev) => ({ ...prev, B: value }))}
                  step={1}
                  min={1}
                />
                <InputField
                  label="Down time fraction (d_down)"
                  value={cadence.d_down}
                  onChange={(value) => setCadence((prev) => ({ ...prev, d_down: clamp(value, 0, 1) }))}
                  step={0.01}
                  min={0}
                  max={1}
                />
                <InputField
                  label="Utilization target (u_target)"
                  value={cadence.u_target}
                  onChange={(value) =>
                    setCadence((prev) => ({ ...prev, u_target: clamp(value, 0, 1) }))
                  }
                  step={0.01}
                  min={0}
                  max={1}
                />
                <InputField
                  label="Replacement lead time (L_replace)"
                  value={cadence.L_replace}
                  onChange={(value) => setCadence((prev) => ({ ...prev, L_replace: value }))}
                  step={10}
                  suffix="days"
                />
                <InputField
                  label="Recovery probability (p_rec)"
                  value={cadence.p_rec}
                  onChange={(value) => setCadence((prev) => ({ ...prev, p_rec: clamp(value, 0, 1) }))}
                  step={0.01}
                  min={0}
                  max={1}
                />
                <InputField
                  label="Observed t_turn,95"
                  value={cadence.t_turn95}
                  onChange={(value) => setCadence((prev) => ({ ...prev, t_turn95: value }))}
                  step={1}
                  suffix="days"
                />
              </div>
            </div>
            <div className="card result-card">
              <h3>Outputs</h3>
              <div className="stat-grid">
                <div>
                  <span>Spares required (S)</span>
                  <strong>{formatNumber(cadenceResults.S, 2)} boosters</strong>
                </div>
                <div>
                  <span>Effective boosters (B_eff)</span>
                  <strong>{formatNumber(cadenceResults.B_eff, 2)}</strong>
                </div>
                <div>
                  <span>Max t_turn,95</span>
                  <strong>{formatNumber(cadenceResults.t_turn95_max, 1)} days</strong>
                </div>
              </div>
              <div className={`status ${cadenceResults.feasible ? 'pass' : 'fail'}`}>
                {cadenceResults.feasible
                  ? 'Cadence green: tail turnaround clears threshold.'
                  : 'Cadence red: cut tail or add capacity.'}
              </div>
            </div>
          </div>
        </section>

        <section id="worked-example" className="section">
          <div className="section-heading">
            <p className="section-kicker">Worked example</p>
            <h2>Medium-lift example</h2>
          </div>
          <div className="example-grid">
            <div className="card">
              <h3>Inputs (from panel)</h3>
              <ul className="list">
                <li>
                  <InlineMath math="P_e = 16{,}000\\ \\text{kg},\\quad P_r = 14{,}000\\ \\text{kg}" />
                </li>
                <li>
                  <InlineMath math="C_{common} = \\$20\\text{M},\\quad C_{1,\\text{mfg}} = \\$20\\text{M}" />
                </li>
                <li>
                  <InlineMath math="p_{rec} = 0.95,\\quad N_{design} = 10" />
                </li>
                <li>
                  <InlineMath math="R = 20/\\text{yr},\\quad B = 4,\\quad d_{down} = 0.10" />
                </li>
                <li>
                  <InlineMath math="L_{replace} = 180\\ \\text{days},\\quad u_{target} = 0.70" />
                </li>
                <li>
                  Example refurb: <InlineMath math="C_{ref} = \\$6\\text{M}" />
                </li>
              </ul>
            </div>
            <div className="card">
              <h3>Outputs</h3>
              <div className="stat-grid">
                <div>
                  <span>N_eff</span>
                  <strong>{formatNumber(exampleResults.N_eff, 2)} flights</strong>
                </div>
                <div>
                  <span>C_ref,max</span>
                  <strong>{formatMoney(exampleResults.C_ref_max, 2)}</strong>
                </div>
                <div>
                  <span>Reusable $/kg</span>
                  <strong>{formatPerKg(exampleResults.costPerKgR)}</strong>
                </div>
                <div>
                  <span>Expendable $/kg</span>
                  <strong>{formatPerKg(exampleResults.costPerKgE)}</strong>
                </div>
                <div>
                  <span>Cadence t_turn,95 max</span>
                  <strong>{formatNumber(exampleResults.t_turn95_max, 1)} days</strong>
                </div>
              </div>
            </div>
            <div className="card chart-card">
              <h3>Sensitivity — refurb headroom vs payload ratio</h3>
              <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="line-chart">
                <defs>
                  <linearGradient id="lineGlow" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#7ef9ff" />
                    <stop offset="100%" stopColor="#b18cff" />
                  </linearGradient>
                </defs>
                <polyline points={chart.line} fill="none" stroke="url(#lineGlow)" strokeWidth="3" />
                {sensitivityData.map((point, index) => (
                  <g key={point.ratio}>
                    <circle
                      cx={chart.scaleX(index)}
                      cy={chart.scaleY(point.value)}
                      r={4}
                      fill="#ffb86b"
                    />
                  </g>
                ))}
              </svg>
              <div className="chart-legend">
                {sensitivityData.map((point) => (
                  <div key={point.ratio}>
                    <span>P_r/P_e {point.ratio}</span>
                    <strong>{formatMoney(point.value, 2)}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="levers" className="section">
          <div className="section-heading">
            <p className="section-kicker">Ranked levers</p>
            <h2>Top levers per complexity</h2>
          </div>
          <div className="lever-grid">
            {leverageCards.map((lever, index) => (
              <div className="card" key={lever.title}>
                <span className="lever-index">0{index + 1}</span>
                <h3>{lever.title}</h3>
                <p>{lever.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="full-research" className="section full-research">
          <div className="section-heading">
            <p className="section-kicker">Full research</p>
            <h2>Specialist panel notes and full model</h2>
            <p className="section-sub">
              Long-form writeup with formulas, assumptions, and the full lever stack. Skim or dive
              deep.
            </p>
          </div>
          <div className="card research-card">
            <div className="research-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{panelContent}</ReactMarkdown>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>Built for fast reuse go/no-go. Swap in real distributions once you have measured data.</p>
      </footer>
    </div>
  )
}

export default App
