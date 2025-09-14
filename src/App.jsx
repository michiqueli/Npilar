import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Helmet } from "react-helmet";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Calendario from "@/pages/Calendario";
import Clientes from "@/pages/Clientes";
import ClientProfile from "@/pages/ClientProfile";
import Analitica from "@/pages/Analitica";
import Productos from "@/pages/Productos";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import PublicBookingPage from './pages/public/PublicBookingPage';

function App() {
  const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }
    return user ? children : <Navigate to="/login" />;
  };

  return (
    <>
      <Helmet>
        <title>N - Pilar | El asistente del barbero</title>
        <meta
          name="description"
          content="Sistema de gestión profesional para barberías y negocios. Gestiona citas, clientes, analítica y contabilidad."
        />
      </Helmet>
      <Router>
        <AuthProvider>
          <TooltipProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/reservar" element={<PublicBookingPage />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/calendario" element={<Calendario />} />
                        <Route path="/clientes" element={<Clientes />} />
                        <Route
                          path="/clientes/:id"
                          element={<ClientProfile />}
                        />
                        <Route path="/analitica" element={<Analitica />} />
                        <Route path="/productos" element={<Productos />} />
                        <Route path="*" element={<Navigate to="/" />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Toaster />
            </LocalizationProvider>
          </TooltipProvider>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
