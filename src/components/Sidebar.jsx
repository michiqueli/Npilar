import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Users, BarChart3, Scissors, Sparkles, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import KScissorsIcon from '@/components/KScissorsIcon';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
const Sidebar = ({
  isOpen,
  setIsOpen,
  isMobile
}) => {
  const location = useLocation();
  const navigate = useNavigate();
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
    open: {
      width: 250,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      width: 0,
      padding: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    mobileOpen: {
      x: 0,
      width: 250,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 40,
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    mobileClosed: {
      x: '-100%',
      width: 250,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 40,
        duration: 0.3,
        ease: 'easeIn'
      }
    }
  };
  const contentVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.1,
        duration: 0.2
      }
    },
    closed: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2
      }
    }
  };
  
  if (!isOpen && !isMobile) {
    return null;
  }

  return <motion.div className={cn("bg-background flex flex-col h-full border-r overflow-hidden", isMobile ? "fixed z-50" : "relative flex-shrink-0")} variants={sidebarVariants} animate={isMobile ? isOpen ? 'mobileOpen' : 'mobileClosed' : isOpen ? 'open' : 'closed'} initial={false}>
      <div className="p-6 flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
            <KScissorsIcon className="w-6 h-6 text-primary-foreground" />
          </div>
          <AnimatePresence>
            {isOpen && <motion.div variants={contentVariants} initial="closed" animate="open" exit="closed" className="overflow-hidden">
                <h1 className="text-xl font-semibold text-foreground tracking-tight whitespace-nowrap">Skin Hair Studio</h1>
                <p className="text-xs text-muted-foreground font-medium whitespace-nowrap">PILAR</p>
              </motion.div>}
          </AnimatePresence>
        </div>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      <nav className="px-4 flex-1 overflow-y-auto flex flex-col gap-1">
        {menuItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return <Button key={item.path} variant={isActive ? 'primary' : 'ghost'} className={cn('w-full flex items-center justify-start text-base')} onClick={() => handleNavigation(item.path)} title={item.label} aria-label={item.label}>
              <Icon className={cn("w-5 h-5 flex-shrink-0 mr-3")} />
              <AnimatePresence>
                <motion.span variants={contentVariants} initial="closed" animate="open" exit="closed" className="font-medium tracking-wide whitespace-nowrap overflow-hidden">
                    {item.label}
                  </motion.span>
              </AnimatePresence>
            </Button>;
      })}
      </nav>

      <div className="p-4 flex-shrink-0">
        <AnimatePresence>
          {isOpen && <Popover>
              <PopoverTrigger asChild>
                <motion.div className="bg-accent/50 p-4 rounded-lg text-center cursor-pointer border border-primary/10" variants={contentVariants} initial="closed" animate="open" exit="closed">
                  <div className="w-8 h-8 bg-primary rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">Versión Premium</p>
                  <div className="w-full bg-border rounded-full h-1">
                    <div className="bg-primary h-1 rounded-full w-full"></div>
                  </div>
                </motion.div>
              </PopoverTrigger>
              <PopoverContent side="top" align="center" className="w-auto">
                <div className="text-sm text-popover-foreground">
                  Versión premium activada — todo bajo control.
                </div>
              </PopoverContent>
            </Popover>}
        </AnimatePresence>
      </div>
    </motion.div>;
};
export default Sidebar;