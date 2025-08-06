import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const Header = ({ toggleSidebar, isMobile }) => {
    const { toast } = useToast();

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
                        <h2 className="text-lg font-bold text-foreground tracking-tight">
                            Panel de Control
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Gestión de tu negocio
                        </p>
                    </div>

                    <div className="block sm:hidden">
                        <h2 className="text-lg font-bold text-foreground tracking-tight">
                            N - Pilar
                        </h2>
                    </div>
                </div>
            </div>
        </motion.header>
    );
};

export default Header;