
import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';

const ServiceForm = ({ service, onSave, onClose }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    price: service?.price || '',
    duration: service?.duration || '',
    cost: service?.cost || '',
    category: service?.category || 'Cortes',
    badge: service?.badge || 'Ninguno',
    active: service?.active !== undefined ? service.active : true,
    imageUrl: service?.imageUrl || '',
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSwitchChange = (checked) => {
    setFormData(prev => ({ ...prev, active: checked }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price || !formData.duration) {
      toast({
        variant: "destructive",
        title: "Datos incompletos",
        description: "Nombre, precio y duración son campos obligatorios para crear un servicio.",
      });
      return;
    }
    
    const icon = formData.category === 'Cejas' ? 'eye' : 
                 formData.category === 'Combos' ? 'package' :
                 formData.category === 'Adicionales' ? 'sparkles' : 'scissors';
    
    onSave({ 
      ...service, 
      ...formData, 
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
      cost: parseFloat(formData.cost) || 0,
      badge: formData.badge === 'Ninguno' ? null : formData.badge,
      icon,
      popular: service?.popular || false
    });
  };

  const handleImageUploadFeature = () => {
    toast({
      title: "🚧 Función no disponible",
      description: "La subida de imágenes desde tu dispositivo estará disponible pronto. Por ahora, puedes usar una URL externa.",
    });
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{service ? 'Editar Servicio' : 'Nuevo Servicio'}</DialogTitle>
        <DialogDescription>
          Completa los detalles para gestionar este servicio en tu catálogo.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 py-4">
        
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="name">Nombre del Servicio</Label>
          <Input id="name" value={formData.name} onChange={handleChange} required placeholder="Ej: Corte Fade Premium" />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea 
            id="description" 
            value={formData.description} 
            onChange={handleChange} 
            rows="3" 
            placeholder="Describe qué incluye el servicio, técnicas, productos, etc."
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Precio de Venta ($)</Label>
          <Input id="price" type="number" value={formData.price} onChange={handleChange} required min="0" placeholder="Ej: 25" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cost">Costo del Servicio ($)</Label>
          <Input id="cost" type="number" value={formData.cost} onChange={handleChange} min="0" placeholder="Ej: 5 (opcional)" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duración (min)</Label>
          <Input id="duration" type="number" value={formData.duration} onChange={handleChange} required min="5" step="5" placeholder="Ej: 45" />
        </div>

        <div className="space-y-2">
          <Label>Categoría</Label>
          <Select onValueChange={(value) => handleSelectChange('category', value)} value={formData.category}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cortes">Cortes de Pelo</SelectItem>
              <SelectItem value="Barba">Corte y Arreglo de Barba</SelectItem>
              <SelectItem value="Cejas">Diseño y Arreglo de Cejas</SelectItem>
              <SelectItem value="Combos">Combos</SelectItem>
              <SelectItem value="Adicionales">Servicios Adicionales</SelectItem>
              <SelectItem value="Otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Etiqueta Especial</Label>
          <Select onValueChange={(value) => handleSelectChange('badge', value)} value={formData.badge}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar etiqueta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ninguno">Ninguna</SelectItem>
              <SelectItem value="NUEVO">Nuevo</SelectItem>
              <SelectItem value="MEJOR VALOR">Mejor Valor</SelectItem>
              <SelectItem value="OFERTA">Oferta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label>Imagen del Servicio</Label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
              {formData.imageUrl ? (
                <img-replace src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <Input 
                id="imageUrl" 
                value={formData.imageUrl} 
                onChange={handleChange} 
                placeholder="https://ejemplo.com/imagen.jpg"
                className="mb-2"
              />
              <Button type="button" variant="secondary" className="w-full" onClick={handleImageUploadFeature}>
                <UploadCloud className="w-4 h-4 mr-2" />
                Subir Imagen
              </Button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 flex items-center justify-between rounded-lg border p-4">
            <div>
                <Label htmlFor="active-mode">Servicio Activo</Label>
                <p className="text-xs text-muted-foreground">
                    Desactívalo para ocultarlo temporalmente del catálogo.
                </p>
            </div>
            <Switch
                id="active-mode"
                checked={formData.active}
                onCheckedChange={handleSwitchChange}
            />
        </div>

        <DialogFooter className="md:col-span-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary">Guardar Cambios</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default ServiceForm;
