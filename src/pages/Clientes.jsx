
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Plus, Download, UserPlus, LayoutGrid, Rows, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import ClientCard from '@/components/clients/ClientCard';
import ClientFilters from '@/components/clients/ClientFilters';
import ClientForm from '@/components/clients/ClientForm';
import EmptyState from '@/components/clients/EmptyState';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils';
import ClientListRow from '@/components/clients/ClientListRow';

const mockClients = [
  { id: 1, name: 'Juan Pérez', phone: '+34 123 456 789', email: 'juan@example.com', lastVisit: '2025-07-10', visits: 5, status: 'Frecuente', preferredService: 'Corte + Barba', notes: 'Le gusta el degradado bajo.', createdAt: '2025-01-15T10:00:00Z', totalSpent: 150 },
  { id: 2, name: 'Carlos López', phone: '+34 987 654 321', email: 'carlos@example.com', lastVisit: '2025-06-25', visits: 12, status: 'Frecuente', preferredService: 'Corte', notes: 'Siempre pide el mismo corte clásico.', createdAt: '2024-11-20T11:30:00Z', totalSpent: 240 },
  { id: 3, name: 'Ana García', phone: '+34 555 888 999', email: 'ana@example.com', lastVisit: '2025-03-12', visits: 2, status: 'Inactivo', preferredService: 'Servicio Completo', notes: 'Preguntar si quiere volver a probar el tratamiento de keratina.', createdAt: '2025-02-28T16:45:00Z', totalSpent: 80 },
  { id: 4, name: 'Luis Rodríguez', phone: '+34 111 222 333', email: 'luis@example.com', lastVisit: '2025-07-01', visits: 8, status: 'Regular', preferredService: 'Barba', notes: '', createdAt: '2025-04-10T09:00:00Z', totalSpent: 120 },
  { id: 5, name: 'Sofía Martínez', phone: '+34 444 555 666', email: 'sofia@example.com', lastVisit: '2025-07-08', visits: 1, status: 'Nuevo', preferredService: 'Corte', notes: 'Primera visita, muy contenta con el resultado.', createdAt: '2025-07-08T18:00:00Z', totalSpent: 20 },
];

const Clientes = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('lastVisit');
  const [filterBy, setFilterBy] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
    preferredService: 'Corte'
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setViewMode('mobile');
      } else if (viewMode === 'mobile') {
        setViewMode('grid');
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  useEffect(() => {
    try {
      const storedClients = localStorage.getItem('nehue-clients');
      if (storedClients) {
        const parsedClients = JSON.parse(storedClients);
        setClients(parsedClients.length > 0 ? parsedClients : mockClients);
      } else {
        setClients(mockClients);
        localStorage.setItem('nehue-clients', JSON.stringify(mockClients));
      }
    } catch(e) {
      toast({ variant: "destructive", title: "Error de datos locales", description: "No se pudieron cargar los datos de clientes. Se usarán datos de ejemplo."});
      setClients(mockClients);
    }
  }, [toast]);

  useEffect(() => {
    localStorage.setItem('nehue-clients', JSON.stringify(clients));
  }, [clients]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast({
        title: "Datos incompletos",
        description: "Nombre y teléfono son campos obligatorios.",
        variant: "destructive"
      });
      return;
    }

    const clientData = {
      ...formData,
      id: selectedClient?.id || Date.now(),
      visits: selectedClient?.visits || 0,
      lastVisit: selectedClient?.lastVisit || null,
      totalSpent: selectedClient?.totalSpent || 0,
      createdAt: selectedClient?.createdAt || new Date().toISOString()
    };

    if (selectedClient) {
      setClients(prev => prev.map(client => 
        client.id === selectedClient.id ? clientData : client
      ));
      toast({
        title: "✅ Cliente Actualizado",
        description: `Los datos de ${clientData.name} se guardaron correctamente.`,
      });
    } else {
      setClients(prev => [...prev, clientData]);
      toast({
        title: "🎉 Cliente Agregado",
        description: `${clientData.name} ahora forma parte de tu cartera.`,
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      notes: '',
      preferredService: 'Corte'
    });
    setSelectedClient(null);
    setIsModalOpen(false);
  };
  
  const openNewClientModal = () => {
    setSelectedClient(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      notes: '',
      preferredService: 'Corte'
    });
    setIsModalOpen(true);
  }

  const handleEdit = (client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      phone: client.phone,
      email: client.email || '',
      notes: client.notes || '',
      preferredService: client.preferredService || 'Corte'
    });
    setIsModalOpen(true);
  };

  const handleDelete = (clientId) => {
    setClients(prev => prev.filter(client => client.id !== clientId));
    toast({
      title: "🗑️ Cliente Eliminado",
      description: "El cliente ha sido removido de tu lista.",
    });
  };
  
  const handleFeatureNotImplemented = (featureName) => {
      toast({
          title: `🚧 ${featureName} no disponible`,
          description: "Esta función no está implementada aún. ¡Pídela en tu próximo prompt! 🚀",
      });
  };

  const handleViewProfile = (client) => {
    navigate(`/clientes/${client.id}`);
  };

  const handleScheduleAppointment = (client) => {
    navigate('/calendario', { state: { newAppointmentClient: client }});
  };

  const filteredAndSortedClients = clients
    .filter(client => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = client.name.toLowerCase().includes(searchLower) ||
                           client.phone.includes(searchTerm) ||
                           (client.email && client.email.toLowerCase().includes(searchLower)) ||
                           (client.preferredService && client.preferredService.toLowerCase().includes(searchLower));

      if (filterBy === 'all') return matchesSearch;
      if (filterBy === 'frequent') return matchesSearch && client.visits >= 10;
      if (filterBy === 'regular') return matchesSearch && client.visits >= 3 && client.visits < 10;
      if (filterBy === 'inactive') return matchesSearch && (!client.lastVisit || new Date() - new Date(client.lastVisit) > 90 * 24 * 60 * 60 * 1000);
      if (filterBy === 'new') return matchesSearch && client.createdAt && (new Date() - new Date(client.createdAt)) / (1000 * 60 * 60 * 24) <= 7;
      
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'lastVisit':
          return new Date(b.lastVisit || 0) - new Date(a.lastVisit || 0);
        case 'oldestVisit':
          return new Date(a.lastVisit || 0) - new Date(b.lastVisit || 0);
        case 'totalSpent':
            return (b.totalSpent || 0) - (a.totalSpent || 0);
        default:
          return 0;
      }
    });

  const viewClasses = {
    grid: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6",
    compact: "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4",
    list: "flex flex-col gap-2",
    mobile: "flex flex-col gap-3",
  };

  return (
    <>
      <Helmet>
        <title>Mis Clientes - N - Pilar</title>
        <meta name="description" content="Gestiona tu base de clientes, su historial de visitas, preferencias y más." />
      </Helmet>

      <div className="space-y-6">
        <motion.div
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">Mis Clientes</h1>
            <p className="text-muted-foreground mt-1">Tu base de datos para construir relaciones duraderas.</p>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="hidden md:flex">
                    <Download className="w-4 h-4 mr-2" />
                    Opciones
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleFeatureNotImplemented('Importar Contactos')}>
                    Importar desde Contactos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFeatureNotImplemented('Importar CSV')}>
                    Importar desde CSV
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={() => handleFeatureNotImplemented('Exportar CSV')}>
                    Exportar a CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={openNewClientModal} variant="primary" className="w-full md:w-auto" size="lg">
                <UserPlus className="w-4 h-4 mr-2" />
                Nuevo Cliente
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="premium-card p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <ClientFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortBy={sortBy}
            setSortBy={setSortBy}
            filterBy={filterBy}
            setFilterBy={setFilterBy}
            clients={clients}
            viewMode={viewMode}
            setViewMode={setViewMode}
            isMobile={isMobile}
          />
        </motion.div>
        
        <AnimatePresence mode="wait">
            {filteredAndSortedClients.length > 0 ? (
                <motion.div 
                    key={viewMode}
                    className={viewClasses[viewMode]}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                {filteredAndSortedClients.map((client, index) => {
                  if (viewMode === 'list') {
                    return <ClientListRow 
                      key={client.id}
                      client={client}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onScheduleAppointment={handleScheduleAppointment}
                      onViewProfile={handleViewProfile}
                    />
                  }
                  return <ClientCard
                      key={client.id}
                      client={client}
                      index={index}
                      viewMode={viewMode}
                      onViewProfile={handleViewProfile}
                      onEdit={handleEdit}
                      onScheduleAppointment={handleScheduleAppointment}
                      onDelete={handleDelete}
                  />
                })}
                </motion.div>
            ) : (
                <motion.div 
                    key="empty-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-8"
                >
                {searchTerm || filterBy !== 'all' ? (
                    <div className="text-center py-16">
                        <h3 className="text-xl font-bold text-foreground mb-3">
                            No se encontraron clientes
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            Intenta ajustar los filtros o el término de búsqueda.
                        </p>
                        <Button 
                            onClick={() => {
                            setSearchTerm('');
                            setFilterBy('all');
                            }} 
                            variant="secondary"
                        >
                            Limpiar filtros
                        </Button>
                    </div>
                ) : (
                    <EmptyState onAddClient={openNewClientModal} />
                )}
                </motion.div>
            )}
        </AnimatePresence>

      </div>

      <ClientForm
        isOpen={isModalOpen}
        onClose={resetForm}
        selectedClient={selectedClient}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default Clientes;
