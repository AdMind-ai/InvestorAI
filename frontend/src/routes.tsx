// routes.tsx
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Error404 from './pages/Error404'
import Login from './pages/Login'
import Market from './pages/Market'
import Chat from './pages/Chat'
import CEO from './pages/CEO'
import ESG from './pages/ESG'
import Earnings from './pages/Earnings'
import SmartScan from './pages/SmartScan'
import QuickDoc from './pages/QuickDoc'
import Usage from './pages/Usage'
import TeamManagement from './pages/TeamManagement'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import RestrictedRoute from './components/RestrictedRoute'

export const ALL_APP_ROUTES: string[] = [
  "/market-intelligence",
  "/chat-assistant",
  "/ceo-perception",
  "/earnings",
  "/esg",
  "/smart-scan",
  "/doc-creator",
  "/usage",
  "/access",
  // ...Add other routes as needed
];

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
            <Route path="/market-intelligence" 
              element={
                <RestrictedRoute routeName="/market-intelligence">
                  <Market />
                </RestrictedRoute>
              } 
            />
            <Route path="/chat-assistant" element={<Chat />} />
            <Route path="/ceo-perception" element={<CEO />} />
            <Route path="/earnings" element={<Earnings />} />
            <Route path="/esg" element={<ESG />} />
            <Route path="/smart-scan" element={<SmartScan />} />
            <Route path="/doc-creator" element={<QuickDoc />} />
            <Route path="/usage" element={<Usage />} />
            <Route path="/access" element={<TeamManagement />} />
            <Route path="*" element={<Error404 />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default AppRoutes
