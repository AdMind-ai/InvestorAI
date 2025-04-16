// routes.tsx
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Market from './pages/Market'
import Chat from './pages/Chat'
import CEO from './pages/CEO'
import ESG from './pages/ESG'
import Earnings from './pages/Earnings'
import Usage from './pages/Usage'
import Access from './pages/Access'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Route (login) */}
          <Route path="/login" element={<Login />} />

          {/* Rotas privadas */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/market-intelligence" element={<Market />} />
            <Route path="/chat-assistant" element={<Chat />} />
            <Route path="/ceo-perception" element={<CEO />} />
            <Route path="/earnings" element={<Earnings />} />
            <Route path="/esg" element={<ESG />} />
            <Route path="/usage" element={<Usage />} />
            <Route path="/access" element={<Access />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default AppRoutes
