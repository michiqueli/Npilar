import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import KScissorsIcon from '@/components/KScissorsIcon';
import { Fingerprint, Mail, Lock } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Estado para la carga
    const { login, webAuthnLogin } = useAuth();
    const navigate = useNavigate();

    // --- CORRECCIÓN: La función ahora es `async` y usa `await` ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // 1. Esperamos a que la función `login` termine y nos devuelva `true` o `false`.
        const success = await login(email, password, rememberMe);

        // 2. Solo navegamos al dashboard si el inicio de sesión fue exitoso.
        if (success) {
            navigate('/');
        }

        setIsLoading(false);
    };

    const handleFaceId = async () => {
        await webAuthnLogin();
    };

    return (
        <>
            <Helmet>
                <title>Iniciar Sesión - N - Pilar</title>
            </Helmet>
            <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-secondary">
                <div className="absolute inset-0 h-full w-full bg-cover bg-center z-0">
                    <img alt="Modern and stylish barbershop interior" className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1582483720544-4068701c073d" />
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
                                Bienvenido de nuevo
                            </h2>
                            <p className="mt-2 text-center text-sm text-muted-foreground">
                                ¿No tienes una cuenta?{' '}
                                <Link to="/register" className="font-medium text-primary hover:underline">
                                    Regístrate aquí
                                </Link>
                            </p>
                        </div>
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-4">
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
                                            autoComplete="current-password"
                                            required
                                            className="pl-10"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            {/*}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={setRememberMe} />
                                    <Label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
                                        Recuérdame
                                    </Label>
                                </div>
                            </div>
                            */}
                            <div>
                                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                                    {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
                                </Button>
                            </div>
                            {/*
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-card/80 px-2 text-muted-foreground backdrop-blur-lg">O continúa con</span>
                                </div>
                            </div>
                            
                            <div>
                                <Button type="button" variant="secondary" className="w-full" size="lg" onClick={handleFaceId}>
                                    <Fingerprint className="mr-2 h-5 w-5" />
                                    Face ID / Biometría
                                </Button>
                            </div>
                            */}
                        </form>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default LoginPage;
