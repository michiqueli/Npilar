import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Users, BarChart3, Scissors, LogOut, Fingerprint, X } from 'lucide-react';
import KScissorsIcon from '@/components/KScissorsIcon';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import config from '@/config';

const Sidebar = ({
    isOpen,
    setIsOpen,
    isMobile
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, webAuthnRegister } = useAuth();
    const menuItems = [{
        icon: LayoutDashboard,
        label: 'Panel del Día',
        path: '/'
    }, {
        icon: CalendarDays,
        label: 'Agenda',
        path: '/calendario'
    }, {
        icon: Users,
        label: 'Mis Clientes',
        path: '/clientes'
    }, {
        icon: BarChart3,
        label: 'Análisis del Negocio',
        path: '/analitica'
    }, {
        icon: Scissors,
        label: 'Servicios Ofrecidos',
        path: '/productos'
    }];

    const handleNavigation = path => {
        navigate(path);
        if (isMobile) {
            setIsOpen(false);
        }
    };

    const sidebarVariants = {
        open: { width: 270, transition: { type: 'spring', stiffness: 300, damping: 30 } },
        closed: { width: 0, padding: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
        mobileOpen: { x: 0, width: 250, transition: { type: 'spring', stiffness: 500, damping: 40, duration: 0.3, ease: 'easeOut' } },
        mobileClosed: { x: '-100%', width: 250, transition: { type: 'spring', stiffness: 500, damping: 40, duration: 0.3, ease: 'easeIn' } }
    };

    const contentVariants = {
        open: { opacity: 1, x: 0, transition: { delay: 0.1, duration: 0.2 } },
        closed: { opacity: 0, x: -20, transition: { duration: 0.2 } }
    };

    const displayName = user?.user_metadata?.name || user?.user_metadata?.full_name || user?.user_metadata?.username || "Usuario Anónimo";
    const displayInitial = displayName?.charAt(0).toUpperCase() || "U";
    const displayEmail = user?.email || "No email provided";
    
    if (!isOpen && !isMobile) {
        return null;
    }

    return (
        <motion.div
            className={cn("bg-background flex flex-col h-full border-r overflow-hidden", isMobile ? "fixed z-50" : "relative flex-shrink-0")}
            variants={sidebarVariants}
            animate={isMobile ? (isOpen ? 'mobileOpen' : 'mobileClosed') : (isOpen ? 'open' : 'closed')}
            initial={false}
        >
            <div className="p-6 flex-shrink-0 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                        <KScissorsIcon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div variants={contentVariants} initial="closed" animate="open" exit="closed" className="overflow-hidden">
                                <h1 className="text-xl font-semibold text-foreground tracking-tight whitespace-nowrap">{config.appName}</h1>
                                <p className="text-xs text-muted-foreground font-medium whitespace-nowrap">PILAR</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                {isMobile && (
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                        <X className="w-5 h-5" />
                    </Button>
                )}
            </div>

            <nav className="px-4 flex-1 overflow-y-auto flex flex-col gap-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Button
                            key={item.path}
                            variant={isActive ? 'primary' : 'ghost'}
                            className={cn('w-full flex items-center justify-start text-base')}
                            onClick={() => handleNavigation(item.path)}
                            title={item.label}
                            aria-label={item.label}
                        >
                            <Icon className={cn("w-5 h-5 flex-shrink-0 mr-3")} />
                            <AnimatePresence>
                                <motion.span variants={contentVariants} initial="closed" animate="open" exit="closed" className="font-medium tracking-wide whitespace-nowrap overflow-hidden">
                                    {item.label}
                                </motion.span>
                            </AnimatePresence>
                        </Button>
                    );
                })}
            </nav>

            {/* --- 3. SECCIÓN DE PERFIL DE USUARIO (REEMPLAZA A "VERSIÓN PREMIUM") --- */}
            <div className="p-4 flex-shrink-0 border-t">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            variants={contentVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                                    <span className="text-sm font-bold text-primary-foreground">
                                        {displayInitial}
                                    </span>
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-bold text-sm truncate">{displayName}</p>
                                    <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {/* <Button variant="ghost" className="w-full justify-start" onClick={webAuthnRegister}>
                                    <Fingerprint className="mr-2 h-4 w-4" />
                                    Asociar Dispositivo
                                </Button> 
                                */}
                                <Button variant="ghost" className="w-full justify-start text-primary hover:text-destructive bg-red-300" onClick={logout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Cerrar sesión
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default Sidebar;