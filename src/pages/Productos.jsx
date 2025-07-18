import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Plus, Package, Scissors, Eye, Sparkles, Star, Search, X as XIcon, SlidersHorizontal, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import ServiceCard from '@/components/products/ServiceCard';
import ServiceForm from '@/components/products/ServiceForm';
import CategoryFilter from '@/components/products/CategoryFilter';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const initialServices = [
  { id: 1, name: 'Corte Clásico', description: 'Corte tradicional con tijera y máquina. Estilo atemporal que nunca pasa de moda.', price: 20, duration: 30, cost: 2, category: 'Cortes', icon: 'scissors', popular: false, timesBooked: 120, revenueGenerated: 2400, badge: null, active: true, imageUrl: 'https://images.unsplash.com/photo-1599334436482-265c1f33a254' },
  { id: 2, name: 'Corte Moderno', description: 'Fade, undercut y estilos actuales. Técnicas modernas para looks contemporáneos.', price: 25, duration: 45, cost: 3, category: 'Cortes', icon: 'scissors', popular: true, timesBooked: 250, revenueGenerated: 6250, badge: 'MEJOR VALOR', active: true, imageUrl: 'https://images.unsplash.com/photo-1622288432453-24161a143583' },
  { id: 3, name: 'Corte Degradado', description: 'Degradado profesional con transiciones suaves. Perfecto para un look elegante.', price: 28, duration: 40, cost: 3, category: 'Cortes', icon: 'scissors', popular: false, timesBooked: 180, revenueGenerated: 5040, badge: null, active: true, imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc54a118f78' },
  { id: 4, name: 'Arreglo de Barba Básico', description: 'Perfilado y arreglo básico de barba. Mantén tu barba siempre perfecta.', price: 15, duration: 20, cost: 1, category: 'Barba', icon: 'scissors', popular: false, timesBooked: 90, revenueGenerated: 1350, badge: null, active: true, imageUrl: 'https://images.unsplash.com/photo-1632345031435-8727f669d281' },
  { id: 5, name: 'Arreglo de Barba Premium', description: 'Perfilado completo con aceites y bálsamos. Tratamiento completo para tu barba.', price: 22, duration: 30, cost: 4, category: 'Barba', icon: 'scissors', popular: false, timesBooked: 75, revenueGenerated: 1650, badge: null, active: true, imageUrl: 'https://images.unsplash.com/photo-1615182544323-11b65153b81a' },
  { id: 6, name: 'Corte + Barba', description: 'Servicio completo de corte y arreglo de barba. La combinación perfecta.', price: 35, duration: 50, cost: 5, category: 'Combos', icon: 'package', popular: true, timesBooked: 310, revenueGenerated: 10850, badge: null, active: true, imageUrl: 'https://images.unsplash.com/photo-1595476108599-2713f1145852' },
  { id: 7, name: 'Diseño de Cejas', description: 'Perfilado y arreglo de cejas masculinas. Detalles que marcan la diferencia.', price: 12, duration: 15, cost: 0.5, category: 'Cejas', icon: 'eye', popular: false, timesBooked: 50, revenueGenerated: 600, badge: null, active: true, imageUrl: '' },
  { id: 9, name: 'Servicio Completo', description: 'Corte + Barba + Cejas. El paquete completo para lucir impecable.', price: 45, duration: 70, cost: 6, category: 'Combos', icon: 'sparkles', popular: true, timesBooked: 150, revenueGenerated: 6750, badge: null, active: false, imageUrl: '' },
  { id: 10, name: 'Tratamiento Capilar', description: 'Lavado, masaje y tratamiento nutritivo para el cabello. Cuida tu cabello.', price: 20, duration: 30, cost: 5, category: 'Adicionales', icon: 'sparkles', popular: false, timesBooked: 40, revenueGenerated: 800, badge: 'NUEVO', active: true, imageUrl: '' },
];

const Productos = () => {
  const { toast } = useToast();
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState('grid');

  const categories = useMemo(() => {
    const allCategories = new Set(['Todos', 'Cortes', 'Barba', 'Cejas', 'Combos', 'Adicionales']);
    services.forEach(s => s.active && allCategories.add(s.category));
    return Array.from(allCategories);
  }, [services]);

  useEffect(() => {
    try {
      const storedServices = localStorage.getItem('nehue-services');
      if (storedServices) {
        setServices(JSON.parse(storedServices));
      } else {
        setServices(initialServices);
      }
    } catch (error) {
      console.error("Failed to parse services from localStorage", error);
      setServices(initialServices);
    }
  }, []);

  useEffect(() => {
    if (services.length > 0) {
      localStorage.setItem('nehue-services', JSON.stringify(services));
    }
  }, [services]);

  const serviceCounts = useMemo(() => services.reduce((acc, service) => {
    if(service.active) {
      acc[service.category] = (acc[service.category] || 0) + 1;
      acc['Todos'] = (acc['Todos'] || 0) + 1;
    }
    return acc;
  }, {}), [services]);

  const filteredServices = useMemo(() => {
    return services
      .filter(service => service.active)
      .filter(service => selectedCategory === 'Todos' || service.category === selectedCategory)
      .filter(service => service.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        switch (sortBy) {
          case 'price_asc': return a.price - b.price;
          case 'price_desc': return b.price - a.price;
          case 'duration_asc': return a.duration - b.duration;
          case 'duration_desc': return b.duration - a.duration;
          case 'name_asc': return a.name.localeCompare(b.name);
          default: return b.popular - a.popular || b.revenueGenerated - a.revenueGenerated;
        }
      });
  }, [services, selectedCategory, searchTerm, sortBy]);

  const handleOpenModal = (service = null) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  const handleSaveService = (serviceData) => {
    if (serviceData.id) {
      setServices(services.map(s => s.id === serviceData.id ? serviceData : s));
      toast({ title: "✅ Servicio Actualizado", description: "Los datos del servicio han sido guardados." });
    } else {
      const newService = { ...serviceData, id: Date.now(), timesBooked: 0, revenueGenerated: 0 };
      setServices([...services, newService]);
      toast({ title: "🎉 Servicio Agregado", description: "El nuevo servicio ha sido añadido al catálogo." });
    }
    handleCloseModal();
  };

  const togglePopular = (serviceId) => {
    setServices(services.map(service => 
      service.id === serviceId 
        ? { ...service, popular: !service.popular }
        : service
    ));
    toast({ title: "⭐ Estado Actualizado", description: "La popularidad del servicio ha sido actualizada." });
  };

  const handleDeleteService = (serviceId) => {
    setServices(services.filter(s => s.id !== serviceId));
    toast({ variant: "destructive", title: "🗑️ Servicio Eliminado", description: "El servicio ha sido eliminado del catálogo." });
  };

  const EmptyState = () => (
    <motion.div 
      className="text-center py-20 text-muted-foreground"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Scissors className="w-24 h-24 mx-auto mb-6 opacity-30" />
      <h3 className="text-2xl font-semibold text-foreground mb-2">Tu catálogo está vacío</h3>
      <p className="mb-6 max-w-md mx-auto">
        {searchTerm || selectedCategory !== 'Todos' 
          ? "No se encontraron servicios que coincidan con tu búsqueda. Intenta ajustar los filtros."
          : "¡Es hora de empezar! Agrega tu primer servicio para que tus clientes puedan reservarlo."
        }
      </p>
      <Button onClick={() => handleOpenModal()} variant="primary" size="lg">
        <Plus className="w-5 h-5 mr-2" />
        Crear mi Primer Servicio
      </Button>
    </motion.div>
  );

  return (
    <>
      <Helmet>
        <title>Servicios - N - Pilar</title>
        <meta name="description" content="Catálogo completo de servicios y precios de la barbería" />
      </Helmet>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {isModalOpen && <ServiceForm service={selectedService} onSave={handleSaveService} onClose={handleCloseModal} />}
      </Dialog>

      <div className="space-y-8">
        <motion.div
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Catálogo de Servicios</h1>
            <p className="text-muted-foreground text-lg">Gestiona tu oferta de servicios profesionales.</p>
          </div>
          
          <Button onClick={() => handleOpenModal()} variant="primary" size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Servicio
          </Button>
        </motion.div>

        <motion.div
          className="premium-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <CategoryFilter 
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            serviceCounts={serviceCounts}
          />

          <div className="flex flex-col md:flex-row gap-4 mb-6 border-t pt-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nombre..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && <XIcon onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground cursor-pointer hover:text-foreground" />}
            </div>
            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SlidersHorizontal className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Ordenar por..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Más Populares</SelectItem>
                  <SelectItem value="price_asc">Precio (menor a mayor)</SelectItem>
                  <SelectItem value="price_desc">Precio (mayor a menor)</SelectItem>
                  <SelectItem value="duration_asc">Duración (corta a larga)</SelectItem>
                  <SelectItem value="duration_desc">Duración (larga a corta)</SelectItem>
                  <SelectItem value="name_asc">Nombre (A-Z)</SelectItem>
                </SelectContent>
              </Select>
              <div className="hidden md:flex items-center gap-1 bg-muted p-1 rounded-lg">
                  <Button variant={viewMode === 'grid' ? 'primary' : 'ghost'} size="icon" className="h-9 w-9" onClick={() => setViewMode('grid')}>
                      <LayoutGrid className="h-5 w-5"/>
                  </Button>
                   <Button variant={viewMode === 'list' ? 'primary' : 'ghost'} size="icon" className="h-9 w-9" onClick={() => setViewMode('list')}>
                      <List className="h-5 w-5"/>
                  </Button>
              </div>
            </div>
          </div>

          {filteredServices.length > 0 ? (
            <div className={cn("grid gap-6", viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1")}>
              <AnimatePresence>
                {filteredServices.map((service, index) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    index={index}
                    onEdit={handleOpenModal}
                    onTogglePopular={togglePopular}
                    onDelete={handleDeleteService}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <EmptyState />
          )}
        </motion.div>
      </div>
    </>
  );
};

export default Productos;