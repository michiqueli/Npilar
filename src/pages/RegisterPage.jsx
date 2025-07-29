import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import KScissorsIcon from '@/components/KScissorsIcon';
import { User, Mail, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Estado para la carga
    const { register } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast({
                variant: "destructive",
                title: "Error de validación",
                description: "Las contraseñas no coinciden.",
            });
            return;
        }

        setIsLoading(true);

        // 1. Esperamos a que la función `register` termine y nos devuelva `true` o `false`.
        const success = await register(name, email, password);

        // 2. Solo navegamos al dashboard si el registro fue exitoso.
        if (success) {
            navigate('/');
        }

        setIsLoading(false);
    };

    return (
        <>
            <Helmet>
                <title>Crear Cuenta - N - Pilar</title>
            </Helmet>
            <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-secondary">
                <div className="absolute inset-0 h-full w-full bg-cover bg-center z-0">
                    <img alt="Close-up of barber tools on a wooden table" className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1678356163587-6bb3afb89679" />
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="relative z-10 w-full max-w-md"
                >
                    <div className="bg-card/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/10">
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg mb-4">
                                <KScissorsIcon className="w-8 h-8 text-primary-foreground" />
                            </div>
                            <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
                                Crea tu cuenta
                            </h2>
                            <p className="mt-2 text-center text-sm text-muted-foreground">
                                ¿Ya tienes una cuenta?{' '}
                                <Link to="/login" className="font-medium text-primary hover:underline">
                                    Inicia sesión aquí
                                </Link>
                            </p>
                        </div>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <Label htmlFor="name">Nombre completo</Label>
                                <div className="relative mt-2">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        required
                                        className="pl-10"
                                        placeholder="Tu nombre y apellido"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="email-address">Correo electrónico</Label>
                                <div className="relative mt-2">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        id="email-address"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="pl-10"
                                        placeholder="tu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="password">Contraseña</Label>
                                <div className="relative mt-2">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        className="pl-10"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                                <div className="relative mt-2">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        id="confirm-password"
                                        name="confirm-password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        className="pl-10"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                                    {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default RegisterPage;