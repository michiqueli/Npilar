import React, { createContext, useState, useContext, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient"; // Usamos la ruta correcta

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // useEffect para escuchar cambios de autenticación en Supabase ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // onAuthStateChange es un "oyente" que se activa cada vez que el usuario
    // inicia sesión, cierra sesión, o su token se refresca.
    // Es la forma moderna y en tiempo real de manejar la autenticación.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      // No necesitamos setLoading(false) aquí, porque la carga inicial ya se hizo.
    });

    // Es muy importante desuscribirse del "oyente" cuando el componente se desmonta
    // para evitar fugas de memoria.
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // login ahora es una función asíncrona que habla con Supabase ---
  const login = async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      toast({
        title: `👋 ¡Hola de nuevo!`,
        description: "Has iniciado sesión correctamente.",
      });
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de inicio de sesión",
        description:
          error.message || "El correo o la contraseña son incorrectos.",
      });
      return false;
    }
  };

  // register ahora es una función asíncrona que habla con Supabase ---
  const register = async (name, email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        // Usamos la opción 'data' para guardar información adicional como el nombre.
        // Esto se almacenará en la columna `user_metadata` de la tabla `auth.users`.
        options: {
          data: {
            name: name,
          },
        },
      });

      if (error) throw error;

      // Si el registro es exitoso pero el usuario no está en la sesión (email confirmation),
      // mostramos un mensaje para que revise su correo.
      if (data.user) {
        toast({
          title: "🎉 ¡Cuenta creada con éxito!",
          description: `Bienvenido a N-Pilar, ${name}.`,
        });
      } else {
        toast({
          title: "✉️ Revisa tu correo",
          description: `Hemos enviado un enlace de confirmación a ${email}.`,
          duration: 10000,
        });
      }
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de registro",
        description: error.message || "No se pudo completar el registro.",
      });
      return false;
    }
  };

  // --- MODIFICADO: logout ahora es una función asíncrona que habla con Supabase ---
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null); // Actualizamos el estado local inmediatamente
    toast({
      title: "🔒 Sesión cerrada",
      description: "Has cerrado sesión de forma segura.",
    });
  };

  const webAuthnRegister = async () => {
    try {
      // 1. Pedir las opciones de registro a nuestra Edge Function
      const resp = await supabase.functions.invoke(
        "generate-registration-options"
      );
      if (resp.error) throw resp.error;

      // 2. Usar la librería del navegador para mostrar el diálogo de Face ID / Huella
      const attestationResponse = await startRegistration(resp.data);

      // 3. Enviar la respuesta del dispositivo a nuestra Edge Function para verificación
      const verificationResp = await supabase.functions.invoke(
        "verify-registration",
        {
          body: attestationResponse,
        }
      );
      if (verificationResp.error) throw verificationResp.error;

      if (verificationResp.data.verified) {
        toast({
          title: "✅ Dispositivo Registrado",
          description: "Ahora puedes iniciar sesión con tu huella o Face ID.",
        });
      } else {
        throw new Error("La verificación falló.");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de Registro Biométrico",
        description: error.message,
      });
    }
  };

  const webAuthnLogin = async () => {
    try {
      // 1. Pedir las opciones de autenticación
      const resp = await supabase.functions.invoke(
        "generate-authentication-options"
      );
      if (resp.error) throw resp.error;

      // 2. Mostrar el diálogo de Face ID / Huella
      const assertionResponse = await startAuthentication(resp.data);

      // 3. Enviar la respuesta para verificación
      const verificationResp = await supabase.functions.invoke(
        "verify-authentication",
        {
          body: assertionResponse,
        }
      );
      if (verificationResp.error) throw verificationResp.error;

      // 4. Si la verificación es exitosa, la función nos devuelve una sesión de Supabase
      const { data, error } = await supabase.auth.setSession(
        verificationResp.data.session
      );
      if (error) throw error;

      toast({ title: `👋 ¡Hola de nuevo, ${data.user.email}!` });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de Inicio de Sesión Biométrico",
        description: error.message,
      });
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    webAuthnRegister,
    webAuthnLogin,
  };

  // Si aún está cargando la sesión inicial, podemos mostrar un loader o nada.
  // Esto evita que los componentes hijos intenten acceder a `user` antes de tiempo.
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
