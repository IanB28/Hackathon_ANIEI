import { auth, googleProvider } from "../firebaseConfig";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { Capacitor } from "@capacitor/core";

export const loginConGoogle = async () => {
  try {
    if (Capacitor.isNativePlatform()) {
      await signInWithRedirect(auth, googleProvider);
    } else {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    }
  } catch (error: any) {
    console.error("Error en login:", error);
    throw error;
  }
};

export const registrarConEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    console.error("Error en registro:", error);
    throw error;
  }
};

export const loginConEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    console.error("Error en login con email:", error);
    throw error;
  }
};

export const recuperarPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error("Error al enviar email de recuperación:", error);
    throw error;
  }
};

export const manejarRedirect = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      console.log("Usuario autenticado:", result.user.email);
      return result.user;
    }
    return null;
  } catch (error) {
    console.error("Error al obtener resultado:", error);
    throw error;
  }
};

export const cerrarSesion = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    throw error;
  }
};

export const observarAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const obtenerUsuarioActual = () => {
  return auth.currentUser;
};
