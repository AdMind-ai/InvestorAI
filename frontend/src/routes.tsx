import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Market from './pages/Market'
import Chat from './pages/Chat'
import CEO from './pages/CEO'
import Earnings from './pages/Earnings'

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/market-intelligence" element={<Market />} />
        <Route path="/chat-assistant" element={<Chat />} />
        <Route path="/ceo-perception" element={<CEO />} />
        <Route path="/earnings" element={<Earnings />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
