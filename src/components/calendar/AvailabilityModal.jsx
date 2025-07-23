import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { PlusCircle, Trash2 } from "lucide-react";

const weekDays = [
  { key: "1", label: "Lunes" },
  { key: "2", label: "Martes" },
  { key: "3", label: "Miércoles" },
  { key: "4", label: "Jueves" },
  { key: "5", label: "Viernes" },
  { key: "6", label: "Sábado" },
  { key: "0", label: "Domingo" },
];

const timeToMinutes = (time) => {
  if (!time) return 0;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const AvailabilityModal = ({ isOpen, onClose, availability, onSave }) => {
  const { toast } = useToast();
  const [defaultHours, setDefaultHours] = useState({});
  const [exceptions, setExceptions] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tab, setTab] = useState("default");

  useEffect(() => {
    if (isOpen) {
      // Hacemos una copia profunda para evitar mutaciones del estado original
      setDefaultHours(JSON.parse(JSON.stringify(availability.default)));
      setExceptions(JSON.parse(JSON.stringify(availability.exceptions)));
    }
  }, [availability, isOpen]);

  const handleDefaultHoursChange = (
    day,
    field,
    value,
    rangeType,
    rangeIndex
  ) => {
    setDefaultHours((prev) => {
      const newDayConfig = { ...prev[day] };
      if (field === "available") {
        newDayConfig.available = value;
      } else {
        newDayConfig[rangeType][rangeIndex][field] = value;
      }
      return { ...prev, [day]: newDayConfig };
    });
  };

  const addDefaultRange = (day, rangeType) => {
    setDefaultHours((prev) => {
      const newDayConfig = { ...prev[day] };
      const newRange =
        rangeType === "breaks"
          ? { start: "13:00", end: "14:00" }
          : { start: "15:00", end: "20:00" };
      newDayConfig[rangeType].push(newRange);
      return { ...prev, [day]: newDayConfig };
    });
  };

  const removeDefaultRange = (day, rangeType, rangeIndex) => {
    setDefaultHours((prev) => {
      const newDayConfig = { ...prev[day] };
      newDayConfig[rangeType].splice(rangeIndex, 1);
      return { ...prev, [day]: newDayConfig };
    });
  };

  const handleExceptionChange = (field, value) => {
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    setExceptions((prev) => {
      const newExceptions = { ...prev };
      if (newExceptions[dateKey]) {
        // Si ya existe una excepción para este día, la eliminamos (habilitando el día).
        delete newExceptions[dateKey];
      } else {
        // Si no existe, creamos una nueva excepción (deshabilitando el día).
        newExceptions[dateKey] = { available: false, ranges: [], breaks: [] };
      }
      return newExceptions;
    });
  };

  const handleSave = () => {
    // Validación de rangos (simplificada por ahora)
    // ... puedes añadir validaciones más complejas si lo necesitas ...

    const newAvailability = { default: defaultHours, exceptions };
    onSave(newAvailability);
  };

  const selectedException = exceptions[format(selectedDate, "yyyy-MM-dd")] || {
    available:
      defaultHours[selectedDate.getDay().toString()]?.available ?? true,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl top-12 left-[30vw]" style={{ maxWidth: '40rem' }}>
        <DialogHeader>
          <DialogTitle>Editar Horarios de Disponibilidad</DialogTitle>
          <DialogDescription>
            Define tu horario de trabajo estándar, añade descansos y gestiona
            excepciones para días específicos.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-4">
          <TabsList>
            <TabsTrigger value="default">Horario Predeterminado</TabsTrigger>
            <TabsTrigger value="exceptions">Excepciones por Día</TabsTrigger>
          </TabsList>

          <TabsContent
            value="default"
            className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2"
          >
            {weekDays.map(({ key, label }) => {
              const dayConfig = defaultHours[key];
              if (!dayConfig) return null; // Renderiza solo si la configuración del día existe

              return (
                <div
                  key={key}
                  className="flex items-start justify-between p-3 rounded-lg bg-muted/50"
                >
                  <span className="font-semibold w-28 pt-2">{label}</span>
                  <div className="flex-1 flex items-start gap-4">
                    <Switch
                      checked={dayConfig.available}
                      onCheckedChange={(checked) =>
                        handleDefaultHoursChange(key, "available", checked)
                      }
                      aria-label={`Disponibilidad para ${label}`}
                    />
                    {dayConfig.available ? (
                      <div className="flex-1 space-y-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Horarios de Trabajo
                          </Label>
                          {dayConfig.ranges.map((range, index) => (
                            <div
                              key={`range-${index}`}
                              className="flex items-center gap-2 mt-1"
                            >
                              <Input
                                type="time"
                                step="900"
                                value={range.start}
                                onChange={(e) =>
                                  handleDefaultHoursChange(
                                    key,
                                    "start",
                                    e.target.value,
                                    "ranges",
                                    index
                                  )
                                }
                                className="w-32"
                              />
                              <span>-</span>
                              <Input
                                type="time"
                                step="900"
                                value={range.end}
                                onChange={(e) =>
                                  handleDefaultHoursChange(
                                    key,
                                    "end",
                                    e.target.value,
                                    "ranges",
                                    index
                                  )
                                }
                                className="w-32"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  removeDefaultRange(key, "ranges", index)
                                }
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => addDefaultRange(key, "ranges")}
                            className="p-0 h-auto mt-1"
                          >
                            <PlusCircle className="w-4 h-4 mr-1" /> Agregar
                            Horario
                          </Button>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Descansos
                          </Label>
                          {dayConfig.breaks.map((range, index) => (
                            <div
                              key={`break-${index}`}
                              className="flex items-center gap-2 mt-1"
                            >
                              <Input
                                type="time"
                                step="900"
                                value={range.start}
                                onChange={(e) =>
                                  handleDefaultHoursChange(
                                    key,
                                    "start",
                                    e.target.value,
                                    "breaks",
                                    index
                                  )
                                }
                                className="w-32"
                              />
                              <span>-</span>
                              <Input
                                type="time"
                                step="900"
                                value={range.end}
                                onChange={(e) =>
                                  handleDefaultHoursChange(
                                    key,
                                    "end",
                                    e.target.value,
                                    "breaks",
                                    index
                                  )
                                }
                                className="w-32"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  removeDefaultRange(key, "breaks", index)
                                }
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => addDefaultRange(key, "breaks")}
                            className="p-0 h-auto mt-1"
                          >
                            <PlusCircle className="w-4 h-4 mr-1" /> Agregar
                            Descanso
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground flex-1 text-center self-center">
                        No disponible
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent
            value="exceptions"
            className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div>
              <Label>Selecciona una fecha</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border mt-2"
                locale={es}
              />
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">
                Excepción para {format(selectedDate, "PPP", { locale: es })}
              </h3>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="font-semibold">Día no laborable</span>
                <Switch
                  checked={!selectedException.available}
                  onCheckedChange={(checked) =>
                    handleExceptionChange("available", !checked)
                  }
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AvailabilityModal;
