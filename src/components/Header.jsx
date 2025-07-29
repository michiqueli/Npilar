import React from 'react';
import { motion } from 'framer-motion';
import { Menu, User, Search, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import NotificationCenter from '@/components/NotificationCenter';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Header = ({ toggleSidebar, isMobile }) => {
  const { toast } = useToast();
  const { user, logout } = useAuth();

  const handleProfile = () => {
    toast({
      title: "👤 Perfil",
      description: "🚧 Esta función no está implementada aún—¡pero no te preocupes! ¡Puedes solicitarla en tu próximo prompt! 🚀",
    });
  };

  const handleSearch = () => {
    toast({
      title: "🔍 Búsqueda Global",
      description: "🚧 Esta función no está implementada aún—¡pero no te preocupes! ¡Puedes solicitarla en tu próximo prompt! 🚀",
    });
  };

  return (
    <motion.header 
      className="bg-background/80 backdrop-blur-sm border-b px-4 md:px-6 py-3 flex-shrink-0"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              "text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 flex-shrink-0",
              !isMobile && "hidden"
            )}
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="hidden sm:block">
            <h2 className="text-lg font-bold text-foreground tracking-tight">Panel de Control</h2>
            <p className="text-sm text-muted-foreground">Gestión de tu negocio</p>
          </div>
          
          <div className="block sm:hidden">
            <h2 className="text-lg font-bold text-foreground tracking-tight">N - Pilar</h2>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSearch}
            className="text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 hidden sm:flex"
            aria-label="Buscar"
          >
            <Search className="w-5 h-5" />
          </Button>

          <NotificationCenter />
          
          <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 hidden sm:flex"
                          aria-label="Perfil de usuario"
                        >
                          <User className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                          <p className="font-bold">{user?.user_metadata.name}</p>
                          <p className="text-xs text-muted-foreground font-normal">{user?.email}</p>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleProfile}>
                          <User className="mr-2 h-4 w-4" />
                          <span>Perfil</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Cerrar sesión</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-sm font-bold text-primary-foreground">{user?.user_metadata.name?.charAt(0) || 'N'}</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;