import './AppHeader.css'

// Egyszerűsített portálfejléc – a teljes Ügyfél Portál nem része a prototípusnak.
function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__brand">
          <span className="app-header__mark" aria-hidden="true" />
          <span className="app-header__name">Groupama</span>
          <span className="app-header__sub">Biztosító</span>
        </div>
        <span className="app-header__portal">Ügyfél Portál</span>
      </div>
    </header>
  )
}

export default AppHeader
