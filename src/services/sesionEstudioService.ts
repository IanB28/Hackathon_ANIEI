import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { obtenerUsuarioActual } from "./authService";

export interface SesionEstudio {
  id: string;
  userId?: string;
  titulo: string;
  tema: string;
  fecha: string;
  duracion: string;
  notas: string;
  metodoEstudio: string;
  descripcionMetodo: string;
  tiempoTotal: number;
  tiempoReal?: number;
  pausasPomodoro: number;
  tiempoPausa: number;
  recomendacionesPausa: string[];
  sentimientoFinal?: string;
  colorSentimiento?: string;
  nivelEmocion?: number; // Nivel de emoción de 0 a 100
  estado: 'planificada' | 'en-curso' | 'terminada';
  createdAt?: Date;
  updatedAt?: Date;
}

export const crearSesionEstudio = async (
  sesionData: Omit<SesionEstudio, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const user = obtenerUsuarioActual();

  if (!user) {
    throw new Error("Usuario no autenticado");
  }

  try {
    const newSession = {
      ...sesionData,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "studySessions"), newSession);
    console.log("Sesión creada con ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error al crear sesión:", error);
    throw error;
  }
};

export const obtenerSesionesUsuario = async (): Promise<SesionEstudio[]> => {
  const user = obtenerUsuarioActual();

  if (!user) {
    throw new Error("Usuario no autenticado");
  }

  try {
    const q = query(
      collection(db, "studySessions"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const sessions: SesionEstudio[] = [];

    querySnapshot.forEach((docSnap: any) => {
      const data = docSnap.data();
      sessions.push({
        id: docSnap.id,
        userId: data.userId,
        titulo: data.titulo,
        tema: data.tema,
        fecha: data.fecha,
        duracion: data.duracion,
        notas: data.notas,
        metodoEstudio: data.metodoEstudio,
        descripcionMetodo: data.descripcionMetodo,
        tiempoTotal: data.tiempoTotal,
        tiempoReal: data.tiempoReal,
        pausasPomodoro: data.pausasPomodoro,
        tiempoPausa: data.tiempoPausa,
        recomendacionesPausa: data.recomendacionesPausa || [],
        sentimientoFinal: data.sentimientoFinal,
        colorSentimiento: data.colorSentimiento,
        nivelEmocion: data.nivelEmocion || 45, // Valor por defecto
        estado: data.estado,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      });
    });

    return sessions;
  } catch (error) {
    console.error("Error al obtener sesiones:", error);
    throw error;
  }
};

export const actualizarSesionEstudio = async (
  sessionId: string,
  updates: Partial<SesionEstudio>
): Promise<void> => {
  const user = obtenerUsuarioActual();

  if (!user) {
    throw new Error("Usuario no autenticado");
  }

  try {
    const sessionRef = doc(db, "studySessions", sessionId);
    const sessionDoc = await getDoc(sessionRef);

    if (!sessionDoc.exists()) {
      throw new Error("Sesión no encontrada");
    }

    if (sessionDoc.data().userId !== user.uid) {
      throw new Error("No tienes permiso para modificar esta sesión");
    }

    await updateDoc(sessionRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    console.log("Sesión actualizada");
  } catch (error) {
    console.error("Error al actualizar sesión:", error);
    throw error;
  }
};

export const eliminarSesion = async (sessionId: string): Promise<void> => {
  const user = obtenerUsuarioActual();

  if (!user) {
    throw new Error("Usuario no autenticado");
  }

  try {
    const sessionRef = doc(db, "studySessions", sessionId);
    const sessionDoc = await getDoc(sessionRef);

    if (!sessionDoc.exists()) {
      throw new Error("Sesión no encontrada");
    }

    if (sessionDoc.data().userId !== user.uid) {
      throw new Error("No tienes permiso para eliminar esta sesión");
    }

    await deleteDoc(sessionRef);
    console.log("Sesión eliminada");
  } catch (error) {
    console.error("Error al eliminar sesión:", error);
    throw error;
  }
};