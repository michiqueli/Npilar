import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Calendario from '@/pages/Calendario';
import Clientes from '@/pages/Clientes';
import ClientProfile from '@/pages/ClientProfile';
import Analitica from '@/pages/Analitica';
import Productos from '@/pages/Productos';

function App() {
  return (
    <>
      <Helmet>
        <title>N - Pilar | El asistente del barbero</title>
        <meta name="description" content="Sistema de gestión profesional para barberías y negocios. Gestiona citas, clientes, analítica y contabilidad." />
      </Helmet>
      <Router>
        <TooltipProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/calendario" element={<Calendario />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/clientes/:id" element={<ClientProfile />} />
              <Route path="/analitica" element={<Analitica />} />
              <Route path="/productos" element={<Productos />} />
            </Routes>
          </Layout>
          <Toaster />
        </TooltipProvider>
      </Router>
    </>
  );
}

export default App;