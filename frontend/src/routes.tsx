// routes.tsx
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Error404 from './pages/Error404'
import Login from './pages/Login'
import Market from './pages/Market'
import ChatAssistant from './pages/ChatAssistant'
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
import Avatar from './pages/Avatar'
export const ALL_APP_ROUTES: string[] = [
  "/market-intelligence",
  "/chat-assistant",
  "/ceo-perception",
  "/earnings",
  "/esg",
  "/smart-scan",
  "/doc-creator",
  "/avatar",
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
            <Route
              path="/chat-assistant"
              element={
                <RestrictedRoute routeName="/chat-assistant">
                  <ChatAssistant />
                </RestrictedRoute>
              }
            />
            <Route
              path="/ceo-perception"
              element={
                <RestrictedRoute routeName="/ceo-perception">
                  <CEO />
                </RestrictedRoute>
              }
            />
            <Route
              path="/earnings"
              element={
                <RestrictedRoute routeName="/earnings">
                  <Earnings />
                </RestrictedRoute>
              }
            />
            <Route
              path="/esg"
              element={
                <RestrictedRoute routeName="/esg">
                  <ESG />
                </RestrictedRoute>
              }
            />
            <Route
              path="/smart-scan"
              element={
                <RestrictedRoute routeName="/smart-scan">
                  <SmartScan />
                </RestrictedRoute>
              }
            />
            <Route
              path="/doc-creator"
              element={
                <RestrictedRoute routeName="/doc-creator">
                  <QuickDoc />
                </RestrictedRoute>
              }
            />
            <Route
              path="/avatar"
              element={
                <RestrictedRoute routeName="/avatar">
                  <Avatar />
                </RestrictedRoute>
              }
            />

            <Route
              path="/usage"
              element={
                <RestrictedRoute routeName="/usage">
                  <Usage />
                </RestrictedRoute>
              }
            />
            <Route
              path="/access"
              element={
                <RestrictedRoute routeName="/access">
                  <TeamManagement />
                </RestrictedRoute>
              }
            />
            <Route path="*" element={<Error404 />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default AppRoutes
