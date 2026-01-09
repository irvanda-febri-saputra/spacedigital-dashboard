import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import VerifyResetOtp from './pages/VerifyResetOtp'
import NewPassword from './pages/NewPassword'
import VerifyEmail from './pages/VerifyEmail'
import Dashboard from './pages/Dashboard'
import Bots from './pages/Bots'
import BotCreate from './pages/BotCreate'
import BotEdit from './pages/BotEdit'
import Transactions from './pages/Transactions'
import CreateTransaction from './pages/CreateTransaction'
import Products from './pages/Products'
import BotProducts from './pages/BotProducts'
import OrderKuota from './pages/OrderKuota'
import PaymentGateways from './pages/PaymentGateways'
import PaymentGatewaysConfigure from './pages/PaymentGatewaysConfigure'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import AtlanticWithdraw from './pages/AtlanticWithdraw'
import Notifications from './pages/Notifications'
import AdminUsers from './pages/AdminUsers'
import AdminBots from './pages/AdminBots'
import Stocks from './pages/Stocks'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/forgot-password/verify" element={<VerifyResetOtp />} />
        <Route path="/forgot-password/new-password" element={<NewPassword />} />
        
        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="bots" element={<Bots />} />
          <Route path="bots/create" element={<BotCreate />} />
          <Route path="bots/:id/edit" element={<BotEdit />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="transactions/create" element={<CreateTransaction />} />
          <Route path="products" element={<Products />} />
          <Route path="bot-products" element={<BotProducts />} />
          <Route path="stocks" element={<Stocks />} />
          <Route path="order-kuota" element={<OrderKuota />} />
          <Route path="payment-gateways" element={<PaymentGateways />} />
          <Route path="payment-gateways/:id/configure" element={<PaymentGatewaysConfigure />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="atlantic-withdraw" element={<AtlanticWithdraw />} />
          <Route path="notifications" element={<Notifications />} />
          
          {/* Admin Routes */}
          <Route path="admin/users" element={<AdminUsers />} />
          <Route path="admin/bots" element={<AdminBots />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
