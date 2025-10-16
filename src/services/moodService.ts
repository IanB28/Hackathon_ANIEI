import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { obtenerUsuarioActual } from "./authService";

export interface MoodEntry {
  id?: string;
  userId: string;
  fecha: Date;
  dia: string;
  hora: string;
  momentoDia: 'mañana' | 'tarde' | 'noche';
  esDiaActual?: boolean; // ✅ Nuevo campo
  createdAt?: Date;
  
  moodValue: number;
  moodLabel: string;
  moodColor: string;
  
  palabrasSeleccionadas: string[];
  
  areasImpacto: {
    vidaDiaria: string[];
    relaciones: string[];
    desempeno: string[];
  };
  
  completado: boolean;
}

export interface AreasImpacto {
  vidaDiaria: string[];
  relaciones: string[];
  desempeno: string[];
}

export const MOOD_LEVELS = [
  { value: 0, label: 'Muy incómodo', color: '#8B5CF6', emoji: '😫' },
  { value: 1, label: 'Incómodo', color: '#6366F1', emoji: '😕' },
  { value: 2, label: 'Levemente incómodo', color: '#3B82F6', emoji: '😐' },
  { value: 3, label: 'Neutral', color: '#10B981', emoji: '😊' },
  { value: 4, label: 'Levemente positivo', color: '#F59E0B', emoji: '🙂' },
  { value: 5, label: 'Positivo', color: '#F97316', emoji: '😄' },
  { value: 6, label: 'Muy positivo', color: '#EF4444', emoji: '🤩' },
];

export const CATEGORIAS_IMPACTO = {
  vidaDiaria: ["Salud", "Ejercicio", "Autocuidado", "Pasatiempos", "Identidad", "Espiritualidad", "Clima"],
  relaciones: ["Comunidad", "Familia", "Amigos", "Pareja", "Citas"],
  desempeno: ["Tareas", "Trabajo", "Educación", "Viajes", "Noticias", "Dinero"]
};

// Determinar momento del día
const obtenerMomentoDia = (fecha: Date = new Date()): 'mañana' | 'tarde' | 'noche' => {
  const hora = fecha.getHours();
  if (hora >= 6 && hora < 12) return 'mañana';
  if (hora >= 12 && hora < 18) return 'tarde';
  return 'noche';
};

// Verificar si puede registrar mood (máximo 7 al día)
export const puedeRegistrarMood = async (): Promise<{ puede: boolean; registrosHoy: number; momentosPendientes: string[] }> => {
  const user = obtenerUsuarioActual();
  if (!user) throw new Error("Usuario no autenticado");

  try {
    const hoy = new Date().toISOString().split('T')[0];
    
    const q = query(
      collection(db, "moodEntries"),
      where("userId", "==", user.uid),
      where("dia", "==", hoy),
      where("completado", "==", true)
    );

    const querySnapshot = await getDocs(q);
    const registrosHoy = querySnapshot.size;
    
    const momentosRegistrados: string[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      momentosRegistrados.push(data.momentoDia);
    });

    const todosMomentos = ['mañana', 'tarde', 'noche'];
    const momentosPendientes = todosMomentos.filter(m => !momentosRegistrados.includes(m));

    return {
      puede: registrosHoy < 7,
      registrosHoy,
      momentosPendientes,
    };
  } catch (error) {
    console.error("Error al verificar registros:", error);
    throw error;
  }
};

// Generar palabras predefinidas (30 palabras en español)
export const generarPalabrasFallback = (moodLabel: string): string[] => {
  const palabrasPorMood: { [key: string]: string[] } = {
    'Muy incómodo': [
      'Enojado', 'Furioso', 'Ansioso', 'Angustiado', 'Asustado', 'Aterrado',
      'Abrumado', 'Agobiado', 'Avergonzado', 'Humillado', 'Disgustado', 'Repugnado',
      'Frustrado', 'Irritado', 'Molesto', 'Enfadado', 'Celoso', 'Envidioso',
      'Estresado', 'Tenso', 'Preocupado', 'Inquieto', 'Culpable', 'Arrepentido',
      'Desesperado', 'Desolado', 'Triste', 'Deprimido', 'Vulnerable', 'Indefenso'
    ],
    'Incómodo': [
      'Incómodo', 'Molesto', 'Ansioso', 'Nervioso', 'Asustado', 'Temeroso',
      'Abrumado', 'Saturado', 'Avergonzado', 'Apenado', 'Disgustado', 'Descontento',
      'Frustrado', 'Contrariado', 'Irritado', 'Fastidiado', 'Celoso', 'Resentido',
      'Estresado', 'Agitado', 'Preocupado', 'Intranquilo', 'Culpable', 'Arrepentido',
      'Desanimado', 'Decaído', 'Triste', 'Melancólico', 'Inseguro', 'Dudoso'
    ],
    'Levemente incómodo': [
      'Inquieto', 'Intranquilo', 'Pensativo', 'Reflexivo', 'Dudoso', 'Indeciso',
      'Preocupado', 'Cauteloso', 'Inseguro', 'Vacilante', 'Tenso', 'Nervioso',
      'Cansado', 'Agotado', 'Confundido', 'Perdido', 'Distraído', 'Disperso',
      'Nostálgico', 'Melancólico', 'Sensible', 'Susceptible', 'Vulnerable', 'Frágil',
      'Desconcentrado', 'Despistado', 'Apático', 'Indiferente', 'Distante', 'Ausente'
    ],
    'Neutral': [
      'Tranquilo', 'Calmado', 'Sereno', 'Apacible', 'Equilibrado', 'Estable',
      'Relajado', 'Descansado', 'Neutral', 'Indiferente', 'Pensativo', 'Contemplativo',
      'Centrado', 'Enfocado', 'Pacífico', 'Sosegado', 'Moderado', 'Templado',
      'Reflexivo', 'Meditativo', 'Observador', 'Atento', 'Consciente', 'Presente',
      'Imparcial', 'Objetivo', 'Compuesto', 'Controlado', 'Reservado', 'Comedido'
    ],
    'Levemente positivo': [
      'Contento', 'Satisfecho', 'Agradecido', 'Reconfortado', 'Esperanzado', 'Ilusionado',
      'Animado', 'Vivaz', 'Cómodo', 'A gusto', 'Aliviado', 'Tranquilo',
      'Optimista', 'Positivo', 'Motivado', 'Inspirado', 'Interesado', 'Curioso',
      'Confiado', 'Seguro', 'Alegre', 'Jovial', 'Complacido', 'Satisfecho',
      'Relajado', 'Calmado', 'Agradecido', 'Apreciativo', 'Aceptado', 'Valorado'
    ],
    'Positivo': [
      'Feliz', 'Alegre', 'Contento', 'Dichoso', 'Orgulloso', 'Satisfecho',
      'Emocionado', 'Entusiasmado', 'Esperanzado', 'Ilusionado', 'Inspirado', 'Motivado',
      'Radiante', 'Brillante', 'Energético', 'Dinámico', 'Confiado', 'Seguro',
      'Optimista', 'Positivo', 'Animado', 'Vivaz', 'Complacido', 'Encantado',
      'Agradecido', 'Reconocido', 'Amado', 'Querido', 'Apoyado', 'Respaldado'
    ],
    'Muy positivo': [
      'Eufórico', 'Extasiado', 'Emocionado', 'Entusiasmado', 'Radiante', 'Resplandeciente',
      'Exultante', 'Jubiloso', 'Extático', 'Arrebatado', 'Apasionado', 'Ferviente',
      'Maravillado', 'Asombrado', 'Agradecido', 'Bendecido', 'Triunfante', 'Victorioso',
      'Amoroso', 'Cariñoso', 'Pleno', 'Completo', 'Realizado', 'Satisfecho',
      'Vibrante', 'Energizado', 'Fantástico', 'Maravilloso', 'Espléndido', 'Magnífico'
    ]
  };

  return palabrasPorMood[moodLabel] || palabrasPorMood['Neutral'];
};

// Nueva función para crear entry con fecha personalizada
export const crearMoodEntryConFecha = async (
  moodValue: number,
  moodLabel: string,
  moodColor: string,
  customDate?: Date
): Promise<string> => {
  const user = obtenerUsuarioActual();
  if (!user) throw new Error("Usuario no autenticado");

  try {
    console.log('🔧 crearMoodEntryConFecha - INICIO');
    console.log('   - Fecha personalizada:', customDate?.toISOString());
    
    const fechaRegistro = customDate || new Date();
    const diaString = fechaRegistro.toISOString().split('T')[0];
    
    // Determinar si es día actual
    const hoy = new Date().toISOString().split('T')[0];
    const esDiaActual = diaString === hoy;
    
    // Si es día actual, guardar hora exacta; si no, guardar "00:00"
    const horaString = esDiaActual 
      ? fechaRegistro.toLocaleTimeString('es-MX', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false
        })
      : '00:00';

    // Si es día actual, guardar momento del día; si no, guardar vacío
    const momentoDia = esDiaActual ? obtenerMomentoDia(fechaRegistro) : 'mañana'; // Por defecto mañana para mantener tipo

    const newEntry = {
      userId: user.uid,
      fecha: Timestamp.fromDate(fechaRegistro),
      dia: diaString,
      hora: horaString,
      momentoDia: momentoDia,
      esDiaActual: esDiaActual, // ✅ Nuevo campo para identificar si es día actual
      moodValue,
      moodLabel,
      moodColor,
      palabrasSeleccionadas: [],
      areasImpacto: {
        vidaDiaria: [],
        relaciones: [],
        desempeno: [],
      },
      completado: false,
      createdAt: serverTimestamp(),
    };

    console.log('   - Creando documento en Firebase para:', diaString);
    console.log('   - Es día actual:', esDiaActual);
    console.log('   - Hora:', horaString);
    const docRef = await addDoc(collection(db, "moodEntries"), newEntry);
    console.log('✅ Mood entry creada con ID:', docRef.id);
    console.log('🔧 crearMoodEntryConFecha - FIN');
    return docRef.id;
  } catch (error) {
    console.error("❌ Error al crear mood entry:", error);
    throw error;
  }
};

// Función original mantenida para compatibilidad
export const crearMoodEntry = async (
  moodValue: number,
  moodLabel: string,
  moodColor: string
): Promise<string> => {
  return crearMoodEntryConFecha(moodValue, moodLabel, moodColor);
};

// Actualizar SOLO con palabras seleccionadas
export const actualizarPalabrasSeleccionadas = async (
  entryId: string,
  palabrasSeleccionadas: string[]
): Promise<void> => {
  const user = obtenerUsuarioActual();
  if (!user) throw new Error("Usuario no autenticado");

  try {
    console.log('🔧 actualizarPalabrasSeleccionadas - INICIO');
    console.log('   - Entry ID:', entryId);
    console.log('   - Palabras recibidas:', palabrasSeleccionadas);
    console.log('   - Cantidad:', palabrasSeleccionadas.length);
    
    const entryRef = doc(db, "moodEntries", entryId);
    
    const docSnap = await getDoc(entryRef);
    if (!docSnap.exists()) {
      throw new Error('El documento no existe');
    }
    
    const data = docSnap.data();
    if (data.userId !== user.uid) {
      throw new Error('No tienes permiso para modificar este registro');
    }
    
    await updateDoc(entryRef, {
      palabrasSeleccionadas: palabrasSeleccionadas,
    });
    
    console.log('✅ Palabras actualizadas en el documento:', entryId);
    console.log('🔧 actualizarPalabrasSeleccionadas - FIN');
  } catch (error) {
    console.error("❌ Error al actualizar palabras:", error);
    throw error;
  }
};

// Actualizar áreas de impacto
export const actualizarAreasImpacto = async (
  entryId: string,
  areasSeleccionadas: string[]
): Promise<void> => {
  const user = obtenerUsuarioActual();
  if (!user) throw new Error("Usuario no autenticado");

  try {
    console.log('🔧 actualizarAreasImpacto - INICIO');
    console.log('   - Entry ID:', entryId);
    console.log('   - Áreas recibidas:', areasSeleccionadas);
    
    const categorizado = {
      vidaDiaria: areasSeleccionadas.filter(area => 
        CATEGORIAS_IMPACTO.vidaDiaria.includes(area)
      ),
      relaciones: areasSeleccionadas.filter(area => 
        CATEGORIAS_IMPACTO.relaciones.includes(area)
      ),
      desempeno: areasSeleccionadas.filter(area => 
        CATEGORIAS_IMPACTO.desempeno.includes(area)
      ),
    };

    const entryRef = doc(db, "moodEntries", entryId);
    
    const docSnap = await getDoc(entryRef);
    if (!docSnap.exists()) {
      throw new Error('El documento no existe');
    }
    
    const data = docSnap.data();
    if (data.userId !== user.uid) {
      throw new Error('No tienes permiso para modificar este registro');
    }
    
    await updateDoc(entryRef, {
      areasImpacto: categorizado,
      completado: true,
    });
    
    console.log('✅ Áreas actualizadas en el documento:', entryId);
    console.log('🔧 actualizarAreasImpacto - FIN');
  } catch (error) {
    console.error("❌ Error al actualizar áreas de impacto:", error);
    throw error;
  }
};

// Obtener mood entries del usuario
export const obtenerMoodEntries = async (): Promise<MoodEntry[]> => {
  const user = obtenerUsuarioActual();
  if (!user) throw new Error("Usuario no autenticado");

  try {
    const q = query(
      collection(db, "moodEntries"),
      where("userId", "==", user.uid),
      orderBy("fecha", "desc")
    );

    const querySnapshot = await getDocs(q);
    const entries: MoodEntry[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      entries.push({
        id: doc.id,
        userId: data.userId,
        fecha: data.fecha.toDate(),
        dia: data.dia,
        hora: data.hora || '00:00',
        momentoDia: data.momentoDia || 'mañana',
        moodValue: data.moodValue,
        moodLabel: data.moodLabel,
        moodColor: data.moodColor,
        palabrasSeleccionadas: data.palabrasSeleccionadas || [],
        areasImpacto: data.areasImpacto || {
          vidaDiaria: [],
          relaciones: [],
          desempeno: [],
        },
        completado: data.completado || false,
        createdAt: data.createdAt?.toDate(),
      });
    });

    return entries;
  } catch (error) {
    console.error("Error al obtener mood entries:", error);
    throw error;
  }
};

// Obtener mood entries de hoy
export const obtenerMoodsHoy = async (): Promise<MoodEntry[]> => {
  const user = obtenerUsuarioActual();
  if (!user) throw new Error("Usuario no autenticado");

  try {
    const hoy = new Date().toISOString().split('T')[0];
    
    const q = query(
      collection(db, "moodEntries"),
      where("userId", "==", user.uid),
      where("dia", "==", hoy),
      where("completado", "==", true),
      orderBy("fecha", "asc")
    );

    const querySnapshot = await getDocs(q);
    const entries: MoodEntry[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      entries.push({
        id: doc.id,
        userId: data.userId,
        fecha: data.fecha.toDate(),
        dia: data.dia,
        hora: data.hora || '00:00',
        momentoDia: data.momentoDia || 'mañana',
        moodValue: data.moodValue,
        moodLabel: data.moodLabel,
        moodColor: data.moodColor,
        palabrasSeleccionadas: data.palabrasSeleccionadas || [],
        areasImpacto: data.areasImpacto || {
          vidaDiaria: [],
          relaciones: [],
          desempeno: [],
        },
        completado: data.completado || false,
        createdAt: data.createdAt?.toDate(),
      });
    });

    return entries;
  } catch (error) {
    console.error("Error al obtener moods de hoy:", error);
    throw error;
  }
};

// Obtener estadísticas de mood
export const obtenerEstadisticasMood = async (dias: number = 7) => {
  const entries = await obtenerMoodEntries();
  
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() - dias);
  
  const entriesRecientes = entries.filter(e => e.fecha >= fechaLimite);
  
  const promedioMood = entriesRecientes.reduce((acc, e) => acc + e.moodValue, 0) / entriesRecientes.length;
  
  const palabrasMasComunes: { [key: string]: number } = {};
  entriesRecientes.forEach(e => {
    e.palabrasSeleccionadas.forEach(palabra => {
      palabrasMasComunes[palabra] = (palabrasMasComunes[palabra] || 0) + 1;
    });
  });
  
  const areasMasImpactadas: { [key: string]: number } = {};
  entriesRecientes.forEach(e => {
    const todasLasAreas = [
      ...e.areasImpacto.vidaDiaria,
      ...e.areasImpacto.relaciones,
      ...e.areasImpacto.desempeno,
    ];
    todasLasAreas.forEach(area => {
      areasMasImpactadas[area] = (areasMasImpactadas[area] || 0) + 1;
    });
  });
  
  return {
    totalEntries: entriesRecientes.length,
    promedioMood: isNaN(promedioMood) ? 0 : promedioMood,
    palabrasMasComunes: Object.entries(palabrasMasComunes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
    areasMasImpactadas: Object.entries(areasMasImpactadas)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
  };
};