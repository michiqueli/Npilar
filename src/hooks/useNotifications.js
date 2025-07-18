import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

export const useNotifications = () => {
  const [permission, setPermission] = useState('default');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Inicializar permisos de notificación
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Cargar notificaciones del localStorage
  useEffect(() => {
    const storedNotifications = localStorage.getItem('nehue-notifications');
    if (storedNotifications) {
      const parsed = JSON.parse(storedNotifications);
      setNotifications(parsed);
      setUnreadCount(parsed.filter(n => !n.read).length);
    }
  }, []);

  // Guardar notificaciones en localStorage
  useEffect(() => {
    localStorage.setItem('nehue-notifications', JSON.stringify(notifications));
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Solicitar permisos de notificación
  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }
    return false;
  }, []);

  // Reproducir sonido de notificación
  const playNotificationSound = useCallback(() => {
    try {
      // Crear un sonido usando Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('No se pudo reproducir el sonido de notificación');
    }
  }, []);

  // Enviar notificación del navegador
  const sendBrowserNotification = useCallback((title, body, icon = '/favicon.ico') => {
    if (permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon,
        badge: '/favicon.ico',
        tag: 'nehue-appointment',
        requireInteraction: true,
        actions: [
          { action: 'view', title: 'Ver Cita' },
          { action: 'dismiss', title: 'Cerrar' }
        ]
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    }
    return null;
  }, [permission]);

  // Crear nueva notificación
  const createNotification = useCallback((type, title, message, data = {}) => {
    const notification = {
      id: Date.now(),
      type,
      title,
      message,
      data,
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Mantener solo 50 notificaciones

    // Mostrar toast
    toast({
      title: `🔔 ${title}`,
      description: message,
      duration: 5000
    });

    // Reproducir sonido
    playNotificationSound();

    // Enviar notificación del navegador
    if (type === 'appointment') {
      sendBrowserNotification(
        `Nueva Cita - ${title}`,
        message,
        '/favicon.ico'
      );
    }

    return notification;
  }, [playNotificationSound, sendBrowserNotification]);

  // Marcar notificación como leída
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Eliminar notificación
  const deleteNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  // Limpiar todas las notificaciones
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Notificar nueva cita
  const notifyNewAppointment = useCallback((appointmentData) => {
    const { clientName, service, date, time } = appointmentData;
    return createNotification(
      'appointment',
      'Nueva Cita Agendada',
      `${clientName} - ${service} el ${date} a las ${time}`,
      appointmentData
    );
  }, [createNotification]);

  // Notificar cita cancelada
  const notifyCancelledAppointment = useCallback((appointmentData) => {
    const { clientName, service } = appointmentData;
    return createNotification(
      'cancellation',
      'Cita Cancelada',
      `Se canceló la cita de ${clientName} - ${service}`,
      appointmentData
    );
  }, [createNotification]);

  // Notificar recordatorio enviado
  const notifyReminderSent = useCallback((appointmentData) => {
    const { clientName } = appointmentData;
    return createNotification(
      'reminder',
      'Recordatorio Enviado',
      `Se envió recordatorio a ${clientName}`,
      appointmentData
    );
  }, [createNotification]);

  return {
    // Estado
    permission,
    notifications,
    unreadCount,
    
    // Acciones
    requestPermission,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    
    // Notificaciones específicas
    notifyNewAppointment,
    notifyCancelledAppointment,
    notifyReminderSent
  };
};