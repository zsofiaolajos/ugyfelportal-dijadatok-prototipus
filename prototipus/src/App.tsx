import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import FeeData from './pages/FeeData'

const DEFAULT_CONTRACT = '30012345'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/szerzodes/:id/dijadatok" element={<FeeData />} />
        <Route
          path="*"
          element={<Navigate to={`/szerzodes/${DEFAULT_CONTRACT}/dijadatok?szerep=ugyfel`} replace />}
        />
      </Routes>
    </HashRouter>
  )
}

export default App
