import { useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import AdvancedSummary from '../components/AdvancedSummary'
import AppHeader from '../components/AppHeader'
import ContractHeader from '../components/ContractHeader'
import DemoBar from '../components/DemoBar'
import LedgerTable from '../components/LedgerTable'
import StatusLine from '../components/StatusLine'
import Timeline from '../components/Timeline'
import { getFolyoszamla } from '../data/ledger'
import { osszesito } from '../domain/account'
import { ugyintezoOsszesito } from '../domain/advancedSummary'
import { fokonyv } from '../domain/ledgerTable'
import { ugyfelAllapotsor } from '../domain/statusLine'
import { idovonal } from '../domain/timeline'
import type { Role } from '../domain/types'
import './FeeData.css'

function FeeData() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const role: Role = params.get('szerep') === 'advanced' ? 'advanced' : 'ugyfel'
  const fsz = getFolyoszamla(id)
  const contract = fsz?.szerzodes
  const osz = fsz && osszesito(fsz)

  // Másik szerződésre lépve (demósáv vagy átkönyvelés link) a lap tetejéről induljon; szerepkörváltáskor nem.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  return (
    <>
      <DemoBar szerzodesszam={contract?.szerzodesszam ?? ''} role={role} />
      <AppHeader />
      <main className="page">
        {contract && osz ? (
          <>
            <nav className="breadcrumb" aria-label="Elérési út">
              <span>Szerződéseim</span>
              <span aria-hidden="true">›</span>
              <span>
                {contract.termekNev} – {contract.szerzodesszam}
              </span>
              <span aria-hidden="true">›</span>
              <span aria-current="page">Díjadatok</span>
            </nav>
            <h1 className="fee-data__title">Díjadatok</h1>

            {/* Ügyfél: az állapot az első, amit lát – a fejléc mobilon már a hajtás alá kerülne */}
            {role === 'ugyfel' && <StatusLine allapot={ugyfelAllapotsor(osz)} />}

            <ContractHeader contract={contract} role={role} />

            {role === 'ugyfel' ? (
              <Timeline idovonal={idovonal(fsz, osz, role)} role={role} />
            ) : (
              <>
                {/* Ügyintéző: a fejléc után (azonosítás), majd egy pillantásra a díjhelyzet */}
                <AdvancedSummary adat={ugyintezoOsszesito(contract, osz)} />
                <LedgerTable adat={fokonyv(fsz, osz)} />
                {/* Helyőrző: szűrés, párosítás, speciális könyvelések, gyors válaszok (D3–D6) */}
                <section className="fee-data__placeholder">
                  Itt jelenik meg a szűrés, a párosítás és a gyors válaszok (D3–D6 lépések).
                </section>
              </>
            )}
          </>
        ) : (
          <p>Nem található szerződés: {id}</p>
        )}
      </main>
    </>
  )
}

export default FeeData
