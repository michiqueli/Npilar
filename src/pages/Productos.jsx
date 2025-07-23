import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Plus, Scissors, Search, X as XIcon, SlidersHorizontal, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import ServiceCard from '@/components/products/ServiceCard';
import ServiceForm from '@/components/products/ServiceForm';
import CategoryFilter from '@/components/products/CategoryFilter';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';

const Productos = () => {
    const { toast } = useToast();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('popular');
    const [viewMode, setViewMode] = useState('grid');

    const categories = useMemo(() => {
        const allCategories = new Set(['Todos']);
        services.forEach(s => s.active && allCategories.add(s.category));
        return Array.from(allCategories);
    }, [services]);

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('services')
                    .select('*');

                if (error) throw error;
                setServices(data || []);
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error al cargar servicios",
                    description: "No se pudo obtener el catálogo de servicios."
                });
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, [toast]);

    const serviceCounts = useMemo(() => services.reduce((acc, service) => {
        if(service.active) {
            const category = service.category || 'Sin Categoría';
            acc[category] = (acc[category] || 0) + 1;
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
                    case 'price_asc': return a.sale_price - b.sale_price;
                    case 'price_desc': return b.sale_price - a.sale_price;
                    case 'duration_asc': return a.duration_min - b.duration_min;
                    case 'duration_desc': return b.duration_min - a.duration_min;
                    case 'name_asc': return a.name.localeCompare(b.name);
                    default: return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
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

    const handleSaveService = async (serviceData) => {
        try {
            const { id, ...dataToSave } = serviceData;

            if (id) {
                const { data, error } = await supabase
                    .from('services')
                    .update(dataToSave)
                    .eq('id', id)
                    .select()
                    .single();
                
                if (error) throw error;

                setServices(services.map(s => s.id === data.id ? data : s));
                toast({ title: "✅ Servicio Actualizado", description: "Los datos del servicio han sido guardados." });
            } else {
                const { data, error } = await supabase
                    .from('services')
                    .insert(dataToSave)
                    .select()
                    .single();

                if (error) throw error;

                setServices([...services, data]);
                toast({ title: "🎉 Servicio Agregado", description: "El nuevo servicio ha sido añadido al catálogo." });
            }
            handleCloseModal();
        } catch (error) {
            toast({ variant: "destructive", title: "Error al guardar", description: error.message });
        }
    };

    const togglePopular = async (serviceId) => {
        const service = services.find(s => s.id === serviceId);
        if (!service) return;

        try {
            const { data, error } = await supabase
                .from('services')
                .update({ popular: !service.popular })
                .eq('id', serviceId)
                .select()
                .single();

            if (error) throw error;

            setServices(services.map(s => s.id === serviceId ? data : s));
            toast({ title: "⭐ Estado Actualizado", description: "La popularidad del servicio ha sido actualizada." });
        } catch (error) {
            toast({ variant: "destructive", title: "Error al actualizar", description: error.message });
        }
    };

    const handleDeleteService = async (serviceId) => {
        try {
            const { data, error } = await supabase
                .from('services')
                .update({ active: false })
                .eq('id', serviceId)
                .select()
                .single();

            if (error) throw error;

            setServices(services.map(s => s.id === serviceId ? data : s));
            toast({ title: "🗑️ Servicio Desactivado", description: "El servicio ha sido desactivado y no aparecerá en la lista." });
        } catch (error) {
            toast({ variant: "destructive", title: "Error al eliminar", description: error.message });
        }
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

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Cargando servicios...</div>;
    }

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