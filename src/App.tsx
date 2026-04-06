import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index";
import PesosRegras from "./pages/PesosRegras";
import Integracoes from "./pages/Integracoes";
import ApiDados from "./pages/ApiDados";
import DashboardExecutivo from "./pages/DashboardExecutivo";
import Fornecedores from "./pages/Fornecedores";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import { SRMConfigProvider, useSRMConfig } from '@/context/SRMConfigContext';
import { SuppliersProvider, useSuppliers } from '@/context/SuppliersContext';

const queryClient = new QueryClient();

// Wrapper temporário para passar estado para Fornecedores.
const FornecedoresWrapper = () => {
  const { computed, addSupplier } = useSuppliers();
  const { weights } = useSRMConfig();
  return (
    <Fornecedores
      suppliers={computed}
      weights={weights}
      onSelectSupplier={() => {}}
      onAddSupplier={addSupplier}
      existingCnpjs={computed.map((s) => s.cnpj)}
    />
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <LoginPage onLogin={() => setIsAuthenticated(true)} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SRMConfigProvider>
          <SuppliersProvider>
            <BrowserRouter>
              <AppLayout onLogout={() => setIsAuthenticated(false)}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/executivo" element={<DashboardExecutivo />} />
                  <Route path="/fornecedores" element={<FornecedoresWrapper />} />
                  <Route path="/pesos-regras" element={<PesosRegras />} />
                  <Route path="/integracoes" element={<Integracoes />} />
                  <Route path="/api-dados" element={<ApiDados />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>
            </BrowserRouter>
          </SuppliersProvider>
        </SRMConfigProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
