import { useNavigate } from 'react-router-dom'
import { forgatokonyvek } from '../data/scenarios'
import { MA } from '../domain/dates'
import { formatDate } from '../domain/format'
import type { Role } from '../domain/types'
import './DemoBar.css'

const szerepek: { role: Role; label: string; reszlet?: string }[] = [
  { role: 'ugyfel', label: 'Ügyfél' },
  { role: 'advanced', label: 'Ügyintéző', reszlet: ' (CC, tanácsadó)' },
]

// Demó-vezérlő – nem része a terméknek. Az állapot az URL-ben van, így minden nézet linkelhető.
function DemoBar({ szerzodesszam, role }: { szerzodesszam: string; role: Role }) {
  const navigate = useNavigate()
  const ugras = (sz: string, r: Role) => navigate(`/szerzodes/${sz}/dijadatok?szerep=${r}`)

  return (
    <div className="demo-bar" role="region" aria-label="Prototípus vezérlő">
      <div className="demo-bar__inner">
        <span className="demo-bar__tag">Prototípus</span>

        <label className="demo-bar__field">
          <span>Forgatókönyv</span>
          <select value={szerzodesszam} onChange={(e) => ugras(e.target.value, role)}>
            {forgatokonyvek.map((f, i) => (
              <option key={f.szerzodesszam} value={f.szerzodesszam}>
                {i + 1}. {f.cim} – {f.leiras}
              </option>
            ))}
          </select>
        </label>

        <div className="demo-bar__field">
          <span id="demo-szerep">Nézet</span>
          <div className="demo-bar__toggle" role="group" aria-labelledby="demo-szerep">
            {szerepek.map((s) => (
              <button
                key={s.role}
                type="button"
                aria-pressed={role === s.role}
                onClick={() => ugras(szerzodesszam, s.role)}
              >
                {s.label}
                {s.reszlet && <span className="demo-bar__long">{s.reszlet}</span>}
              </button>
            ))}
          </div>
        </div>

        <span className="demo-bar__today">Mai nap: {formatDate(MA)}</span>
      </div>
    </div>
  )
}

export default DemoBar
