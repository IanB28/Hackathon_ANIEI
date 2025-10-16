import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { MoodEntry, MOOD_LEVELS } from "./moodService";

export interface CalendarEntry {
  date: string;
  moodValue: number;
  moodLabel: string;
  moodColor: string;
  emoji: string;
  fullDate: Date;
  momentaryEmotions: string[];
  moodEntries: MoodEntry[];
}

const obtenerMoodLevel = (moodValue: number) => {
  return MOOD_LEVELS.find(m => m.value === moodValue) || MOOD_LEVELS[3];
};

const obtenerPalabrasDelDia = (entries: MoodEntry[]): string[] => {
  const palabras = new Set<string>();
  entries.forEach(entry => {
    entry.palabrasSeleccionadas.forEach(palabra => palabras.add(palabra));
  });
  return Array.from(palabras);
};

// Función mejorada para obtener usuario actual
const obtenerUsuarioActual = () => {
  const user = auth.currentUser;
  console.log('🔐 Usuario actual:', user?.uid || 'NO AUTENTICADO');
  return user;
};

// Query simplificada que funciona sin índices
export const obtenerEntradasCalendario = async (
  fechaInicio: Date,
  fechaFin: Date
): Promise<CalendarEntry[]> => {
  const user = obtenerUsuarioActual();
  
  if (!user) {
    console.error('❌ Usuario no autenticado en obtenerEntradasCalendario');
    throw new Error("Usuario no autenticado");
  }

  try {
    console.log('🔧 obtenerEntradasCalendario - INICIO');
    console.log('   - Usuario ID:', user.uid);
    console.log('   - Fecha inicio:', fechaInicio.toISOString());
    console.log('   - Fecha fin:', fechaFin.toISOString());

    const inicioString = fechaInicio.toISOString().split('T')[0];
    const finString = fechaFin.toISOString().split('T')[0];

    const q = query(
      collection(db, "moodEntries"),
      where("userId", "==", user.uid)
    );

    console.log('   - Ejecutando query...');
    const querySnapshot = await getDocs(q);
    console.log('   - Documentos encontrados (total):', querySnapshot.size);

    const entriesPorDia: { [key: string]: MoodEntry[] } = {};
    let documentosFiltrados = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      if (!data.dia) {
        console.log('   ⚠️ Documento sin campo "dia":', doc.id);
        return;
      }

      if (data.dia < inicioString || data.dia > finString) {
        return;
      }
      
      if (!data.completado) {
        return;
      }

      documentosFiltrados++;

      const moodEntry: MoodEntry = {
        id: doc.id,
        userId: data.userId,
        fecha: data.fecha?.toDate() || new Date(),
        dia: data.dia,
        hora: data.hora || '00:00',
        momentoDia: data.momentoDia || 'mañana',
        esDiaActual: data.esDiaActual || false, // ✅ Leer nuevo campo
        moodValue: data.moodValue ?? 3,
        moodLabel: data.moodLabel || 'Neutral',
        moodColor: data.moodColor || '#10B981',
        palabrasSeleccionadas: data.palabrasSeleccionadas || [],
        areasImpacto: data.areasImpacto || {
          vidaDiaria: [],
          relaciones: [],
          desempeno: [],
        },
        completado: data.completado || false,
        createdAt: data.createdAt?.toDate(),
      };

      if (!entriesPorDia[data.dia]) {
        entriesPorDia[data.dia] = [];
      }
      entriesPorDia[data.dia].push(moodEntry);
    });

    console.log('   - Documentos filtrados:', documentosFiltrados);

    const calendarEntries: CalendarEntry[] = Object.entries(entriesPorDia)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([dia, moodEntries]) => {
        const [year, month, day] = dia.split('-').map(Number);
        const fullDate = new Date(year, month - 1, day);

        moodEntries.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

        const promedioMood =
          moodEntries.reduce((acc, e) => acc + e.moodValue, 0) / moodEntries.length;
        const moodValuePromedio = Math.round(promedioMood);
        
        const moodLevel = obtenerMoodLevel(moodValuePromedio);

        return {
          date: day.toString(),
          moodValue: moodValuePromedio,
          moodLabel: moodLevel.label,
          moodColor: moodLevel.color,
          emoji: moodLevel.emoji,
          fullDate,
          momentaryEmotions: obtenerPalabrasDelDia(moodEntries),
          moodEntries,
        };
      });

    console.log('✅ Entradas del calendario obtenidas:', calendarEntries.length);
    return calendarEntries;
  } catch (error) {
    console.error("❌ Error al obtener entradas del calendario:", error);
    throw error;
  }
};

export const obtenerEntradasMes = async (
  year: number,
  month: number
): Promise<CalendarEntry[]> => {
  const fechaInicio = new Date(year, month, 1);
  const fechaFin = new Date(year, month + 1, 0, 23, 59, 59);

  return await obtenerEntradasCalendario(fechaInicio, fechaFin);
};

export const obtenerEntradaDia = async (
  year: number,
  month: number,
  day: number
): Promise<CalendarEntry | null> => {
  const user = obtenerUsuarioActual();
  
  if (!user) {
    console.error('❌ Usuario no autenticado en obtenerEntradaDia');
    throw new Error("Usuario no autenticado");
  }

  try {
    const diaString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    console.log('🔧 obtenerEntradaDia:', diaString);
    console.log('   - Usuario ID:', user.uid);

    const q = query(
      collection(db, "moodEntries"),
      where("userId", "==", user.uid)
    );

    const querySnapshot = await getDocs(q);
    console.log('   - Documentos encontrados (total):', querySnapshot.size);

    if (querySnapshot.empty) {
      console.log('   - No hay documentos para este usuario');
      return null;
    }

    const moodEntries: MoodEntry[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      if (data.dia !== diaString) return;
      if (!data.completado) return;

      moodEntries.push({
        id: doc.id,
        userId: data.userId,
        fecha: data.fecha?.toDate() || new Date(),
        dia: data.dia,
        hora: data.hora || '00:00',
        momentoDia: data.momentoDia || 'mañana',
        esDiaActual: data.esDiaActual || false, // ✅ Leer nuevo campo
        moodValue: data.moodValue ?? 3,
        moodLabel: data.moodLabel || 'Neutral',
        moodColor: data.moodColor || '#10B981',
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

    console.log('   - Entradas para este día:', moodEntries.length);

    if (moodEntries.length === 0) {
      console.log('   - No hay registros completados para este día');
      return null;
    }

    moodEntries.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

    const promedioMood =
      moodEntries.reduce((acc, e) => acc + e.moodValue, 0) / moodEntries.length;
    const moodValuePromedio = Math.round(promedioMood);
    
    const moodLevel = obtenerMoodLevel(moodValuePromedio);

    console.log('✅ Entrada del día obtenida:', moodEntries.length, 'registros');

    return {
      date: day.toString(),
      moodValue: moodValuePromedio,
      moodLabel: moodLevel.label,
      moodColor: moodLevel.color,
      emoji: moodLevel.emoji,
      fullDate: new Date(year, month, day),
      momentaryEmotions: obtenerPalabrasDelDia(moodEntries),
      moodEntries,
    };
  } catch (error) {
    console.error("❌ Error al obtener entrada del día:", error);
    throw error;
  }
};

export const obtenerEstadisticasCalendario = async (
  fechaInicio: Date,
  fechaFin: Date
) => {
  const entries = await obtenerEntradasCalendario(fechaInicio, fechaFin);

  const moodCounts = MOOD_LEVELS.map(level => ({
    ...level,
    count: entries.filter(e => e.moodValue === level.value).length
  }));

  const palabraCount: { [key: string]: number } = {};
  entries.forEach(entry => {
    entry.momentaryEmotions.forEach(palabra => {
      palabraCount[palabra] = (palabraCount[palabra] || 0) + 1;
    });
  });

  const palabrasMasComunes = Object.entries(palabraCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const areasCount: { [key: string]: number } = {};
  entries.forEach(entry => {
    entry.moodEntries.forEach(moodEntry => {
      const todasLasAreas = [
        ...moodEntry.areasImpacto.vidaDiaria,
        ...moodEntry.areasImpacto.relaciones,
        ...moodEntry.areasImpacto.desempeno,
      ];
      todasLasAreas.forEach(area => {
        areasCount[area] = (areasCount[area] || 0) + 1;
      });
    });
  });

  const areasMasImpactadas = Object.entries(areasCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const promedioGeneral = entries.length > 0
    ? entries.reduce((acc, e) => acc + e.moodValue, 0) / entries.length
    : 0;

  return {
    totalDias: entries.length,
    moodCounts,
    promedioGeneral,
    palabrasMasComunes,
    areasMasImpactadas,
  };
};

export const obtenerEntradasSemana = async (): Promise<CalendarEntry[]> => {
  const hoy = new Date();
  const hace7Dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
  return await obtenerEntradasCalendario(hace7Dias, hoy);
};

export const obtenerEntradasUltimoMes = async (): Promise<CalendarEntry[]> => {
  const hoy = new Date();
  const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
  return await obtenerEntradasCalendario(hace30Dias, hoy);
};

export const obtenerEntradasSemestre = async (): Promise<CalendarEntry[]> => {
  const hoy = new Date();
  const hace6Meses = new Date(hoy.getTime() - 180 * 24 * 60 * 60 * 1000);
  return await obtenerEntradasCalendario(hace6Meses, hoy);
};