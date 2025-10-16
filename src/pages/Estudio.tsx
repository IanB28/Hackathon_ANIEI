import { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonSpinner,
  IonIcon,
} from '@ionic/react';
import { 
  libraryOutline,
  statsChartOutline,
  addCircleOutline,
  
} from 'ionicons/icons';
import { 
  crearSesionEstudio, 
  obtenerSesionesUsuario, 
  actualizarSesionEstudio, 
  eliminarSesion,
  SesionEstudio
} from '../services/sesionEstudioService';
import { observarAuth } from '../services/authService';
import TarjetaSesion from './Estudio/Componentes/TarjetaSesion';
import FormularioSesion from './Estudio/Componentes/FormularioSesion';
import Pomodoro from './Estudio/Pomodoro';
import EstadisticasComponent from './Estudio/Estadisticas';
import Detalles from './Estudio/Detalles';
import Configuracion from './Estudio/Configuracion';
import './Estudio.css';

// ============================================
// CONSTANTE - Métodos de estudio
// ============================================
const METODOS_ESTUDIO = {
  pomodoro: {
    nombre: 'Pomodoro',
    descripcion: '25 min de enfoque + pausas. Ideal para mantener concentración.',
    tiempoDefecto: 25,
    recomendacionesDefecto: [
      'Bebe agua',
      'Estira los brazos',
      'Respira profundo',
      'Mira a la distancia',
      'Camina un poco',
      'Toma aire fresco',
      'Relaja los ojos',
      'Come un snack saludable',
      'Estira las piernas',
      'Medita',
      'Escucha música',
      'Toma un café'
    ]
  },
  flowtime: {
    nombre: 'Flowtime',
    descripcion: 'Trabaja sin interrupciones hasta que sientas que necesitas una pausa.',
    tiempoDefecto: 50,
    recomendacionesDefecto: [
      'Camina un poco',
      'Toma aire fresco',
      'Relaja los ojos',
      'Estira las piernas',
      'Bebe agua',
      'Come algo ligero',
      'Salta un poco',
      'Mira por la ventana',
      'Respira profundo',
      'Muévete',
      'Toma un descanso visual',
      'Estira el cuello'
    ]
  },
  bloque: {
    nombre: 'Bloque de Tiempo',
    descripcion: 'Divide el tiempo en bloques de estudio intenso.',
    tiempoDefecto: 45,
    recomendacionesDefecto: [
      'Respira profundo',
      'Muévete un poco',
      'Toma un snack',
      'Relájate',
      'Bebe agua',
      'Camina alrededor',
      'Estira los brazos',
      'Mira a la distancia',
      'Toma aire fresco',
      'Come algo',
      'Medita',
      'Descansa los ojos'
    ]
  },
};

// ============================================
// COMPONENTE PRINCIPAL - Página de Estudio
// ============================================
const Estudio = () => {
  // ============================================
  // ESTADO - Control de modales
  // ============================================
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarPomodoro, setMostrarPomodoro] = useState(false);
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState(false);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false);

  // ============================================
  // ESTADO - Lista de sesiones
  // ============================================
  const [listaSesiones, setListaSesiones] = useState<SesionEstudio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(false);

  // ============================================
  // ESTADO - Sesión seleccionada
  // ============================================
  const [sesionSeleccionada, setSesionSeleccionada] = useState<SesionEstudio | null>(null);
  const [sesionActiva, setSesionActiva] = useState<SesionEstudio | null>(null);
  const [sesionExpandidaId, setSesionExpandidaId] = useState<string | null>(null);

  // ============================================
  // ESTADO - Formulario
  // ============================================
  const [formulario, setFormulario] = useState({
    titulo: '',
    tema: '',
    metodoEstudio: 'pomodoro',
    tiempoTotal: '',
    tiempoPausa: '',
    pausasPomodoro: '',
    notas: '',
  });

  // ============================================
  // EFECTO: Observar autenticación
  // ============================================
  useEffect(() => {
    const unsubscribe = observarAuth((user) => {
      if (user) {
        console.log('Usuario autenticado, cargando sesiones...');
        setUsuarioAutenticado(true);
        cargarSesiones();
      } else {
        console.log('Usuario no autenticado');
        setUsuarioAutenticado(false);
        setListaSesiones([]);
        setCargando(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ============================================
  // FUNCIÓN - Cargar sesiones desde Firestore
  // ============================================
  const cargarSesiones = async () => {
    try {
      setCargando(true);
      const sesiones = await obtenerSesionesUsuario();
      console.log('Sesiones cargadas:', sesiones.length);
      setListaSesiones(sesiones);
    } catch (error: any) {
      console.error('Error al cargar sesiones:', error);
      
      if (error.message === 'Usuario no autenticado') {
        console.log('Esperando autenticación...');
      } else {
        alert('Error al cargar las sesiones. Revisa la consola para más detalles.');
      }
    } finally {
      setCargando(false);
    }
  };

  // ============================================
  // FUNCIÓN - Cambiar campo del formulario
  // ============================================
  const manejarCambioFormulario = (campo: string, valor: string) => {
    setFormulario((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  // ============================================
  // FUNCIÓN - Crear sesiones de demostración
  // ============================================
  const crearSesionesDemo = async () => {
    if (!window.confirm('¿Crear sesiones de demostración para presentación?\n\nSe crearán 10 sesiones variadas con diferentes resultados.')) {
      return;
    }

    try {
      // Sesión 1: Matemáticas - EXCELENTE ✅ (96% completado)
      await crearSesionEstudio({
        titulo: 'Cálculo Diferencial',
        tema: 'Derivadas e Integrales',
        fecha: '15 oct, 09:00',
        duracion: '50 min',
        metodoEstudio: 'Pomodoro',
        descripcionMetodo: '25 min de enfoque + pausas. Ideal para mantener concentración.',
        tiempoTotal: 50,
        tiempoPausa: 5,
        pausasPomodoro: 2,
        recomendacionesPausa: METODOS_ESTUDIO.pomodoro.recomendacionesDefecto,
        notas: 'Repaso de teoremas fundamentales. Muy productivo.',
        estado: 'terminada' as const,
        sentimientoFinal: 'Bien',
        colorSentimiento: '#6BCB77',
        tiempoReal: 48,
      });

      // Sesión 2: Programación - REGULAR 😐 (71% completado)
      await crearSesionEstudio({
        titulo: 'Estructuras de Datos',
        tema: 'Árboles Binarios',
        fecha: '14 oct, 14:30',
        duracion: '35 min',
        metodoEstudio: 'Flowtime',
        descripcionMetodo: 'Trabaja sin interrupciones hasta que sientas que necesitas una pausa.',
        tiempoTotal: 35,
        tiempoPausa: 10,
        pausasPomodoro: 1,
        recomendacionesPausa: METODOS_ESTUDIO.flowtime.recomendacionesDefecto,
        notas: 'Implementación de AVL. Tuve algunas dudas, no terminé todo.',
        estado: 'terminada' as const,
        sentimientoFinal: 'Normal',
        colorSentimiento: '#FFD93D',
        tiempoReal: 25,
      });

      // Sesión 3: Historia - BAJO 😞 (48% completado)
      await crearSesionEstudio({
        titulo: 'Historia Universal',
        tema: 'Revolución Francesa',
        fecha: '14 oct, 18:00',
        duracion: '25 min',
        metodoEstudio: 'Bloque de Tiempo',
        descripcionMetodo: 'Divide el tiempo en bloques de estudio intenso.',
        tiempoTotal: 25,
        tiempoPausa: 5,
        pausasPomodoro: 1,
        recomendacionesPausa: METODOS_ESTUDIO.bloque.recomendacionesDefecto,
        notas: 'Muchas distracciones, abandoné la sesión temprano.',
        estado: 'terminada' as const,
        sentimientoFinal: 'Mal',
        colorSentimiento: '#FF6B6B',
        tiempoReal: 12,
      });

      // Sesión 4: Física - EXCELENTE ✅ (97% completado)
      await crearSesionEstudio({
        titulo: 'Física Cuántica',
        tema: 'Principio de Incertidumbre',
        fecha: '13 oct, 10:00',
        duracion: '60 min',
        metodoEstudio: 'Bloque de Tiempo',
        descripcionMetodo: 'Divide el tiempo en bloques de estudio intenso.',
        tiempoTotal: 60,
        tiempoPausa: 5,
        pausasPomodoro: 2,
        recomendacionesPausa: METODOS_ESTUDIO.bloque.recomendacionesDefecto,
        notas: 'Excelente sesión. Comprendí todos los conceptos.',
        estado: 'terminada' as const,
        sentimientoFinal: 'Bien',
        colorSentimiento: '#6BCB77',
        tiempoReal: 58,
      });

      // Sesión 5: Literatura - BAJO 😐 (55% completado)
      await crearSesionEstudio({
        titulo: 'Literatura Española',
        tema: 'Don Quijote de la Mancha',
        fecha: '13 oct, 16:00',
        duracion: '40 min',
        metodoEstudio: 'Flowtime',
        descripcionMetodo: 'Trabaja sin interrupciones hasta que sientas que necesitas una pausa.',
        tiempoTotal: 40,
        tiempoPausa: 5,
        pausasPomodoro: 1,
        recomendacionesPausa: METODOS_ESTUDIO.flowtime.recomendacionesDefecto,
        notas: 'Lectura y análisis. Me aburrí y no terminé.',
        estado: 'terminada' as const,
        sentimientoFinal: 'Normal',
        colorSentimiento: '#FFD93D',
        tiempoReal: 22,
      });

      // Sesión 6: Química - REGULAR ✅ (78% completado)
      await crearSesionEstudio({
        titulo: 'Química Orgánica',
        tema: 'Reacciones de Síntesis',
        fecha: '12 oct, 11:30',
        duracion: '55 min',
        metodoEstudio: 'Pomodoro',
        descripcionMetodo: '25 min de enfoque + pausas. Ideal para mantener concentración.',
        tiempoTotal: 55,
        tiempoPausa: 10,
        pausasPomodoro: 2,
        recomendacionesPausa: METODOS_ESTUDIO.pomodoro.recomendacionesDefecto,
        notas: 'Práctica de ejercicios. Me faltó completar algunos.',
        estado: 'terminada' as const,
        sentimientoFinal: 'Bien',
        colorSentimiento: '#6BCB77',
        tiempoReal: 43,
      });

      // Sesión 7: Inglés - EXCELENTE � (93% completado)
      await crearSesionEstudio({
        titulo: 'English Grammar',
        tema: 'Past Perfect Continuous',
        fecha: '12 oct, 19:00',
        duracion: '30 min',
        metodoEstudio: 'Flowtime',
        descripcionMetodo: 'Trabaja sin interrupciones hasta que sientas que necesitas una pausa.',
        tiempoTotal: 30,
        tiempoPausa: 5,
        pausasPomodoro: 1,
        recomendacionesPausa: METODOS_ESTUDIO.flowtime.recomendacionesDefecto,
        notas: 'Buena concentración. Casi terminé todo el temario.',
        estado: 'terminada' as const,
        sentimientoFinal: 'Bien',
        colorSentimiento: '#6BCB77',
        tiempoReal: 28,
      });

      // Sesión 8: Bases de Datos - BAJO 😐 (44% completado)
      await crearSesionEstudio({
        titulo: 'Bases de Datos',
        tema: 'Normalización y Formas Normales',
        fecha: '11 oct, 15:00',
        duracion: '45 min',
        metodoEstudio: 'Bloque de Tiempo',
        descripcionMetodo: 'Divide el tiempo en bloques de estudio intenso.',
        tiempoTotal: 45,
        tiempoPausa: 5,
        pausasPomodoro: 1,
        recomendacionesPausa: METODOS_ESTUDIO.bloque.recomendacionesDefecto,
        notas: 'Interrupciones constantes. No logré avanzar mucho.',
        estado: 'terminada' as const,
        sentimientoFinal: 'Mal',
        colorSentimiento: '#FF6B6B',
        tiempoReal: 20,
      });

      // Sesión 9: Estadística - REGULAR ✅ (67% completado)
      await crearSesionEstudio({
        titulo: 'Probabilidad',
        tema: 'Distribuciones de Probabilidad',
        fecha: '11 oct, 09:30',
        duracion: '70 min',
        metodoEstudio: 'Pomodoro',
        descripcionMetodo: '25 min de enfoque + pausas. Ideal para mantener concentración.',
        tiempoTotal: 70,
        tiempoPausa: 10,
        pausasPomodoro: 3,
        recomendacionesPausa: METODOS_ESTUDIO.pomodoro.recomendacionesDefecto,
        notas: 'Ejercicios resueltos. Me quedé a medio camino.',
        estado: 'terminada' as const,
        sentimientoFinal: 'Normal',
        colorSentimiento: '#FFD93D',
        tiempoReal: 47,
      });

      // Sesión 10: Redes - EXCELENTE � (100% completado)
      await crearSesionEstudio({
        titulo: 'Redes de Computadoras',
        tema: 'Protocolo TCP/IP',
        fecha: '10 oct, 20:00',
        duracion: '35 min',
        metodoEstudio: 'Flowtime',
        descripcionMetodo: 'Trabaja sin interrupciones hasta que sientas que necesitas una pausa.',
        tiempoTotal: 35,
        tiempoPausa: 5,
        pausasPomodoro: 1,
        recomendacionesPausa: METODOS_ESTUDIO.flowtime.recomendacionesDefecto,
        notas: '¡Perfecto! Completé todo el material planificado.',
        estado: 'terminada' as const,
        sentimientoFinal: 'Bien',
        colorSentimiento: '#6BCB77',
        tiempoReal: 35,
      });

      await cargarSesiones();
      alert('✅ ¡10 sesiones de demostración creadas!\n\n📊 Verde: ≥85% | Amarillo: 60-85% | Rojo: <60%');
    } catch (error) {
      console.error('Error al crear sesiones demo:', error);
      alert('❌ Error al crear las sesiones');
    }
  };

  // ============================================
  // FUNCIÓN - Guardar nueva sesión
  // ============================================
  const manejarGuardarSesion = async () => {
    if (!formulario.titulo || !formulario.tema) {
      alert('Por favor completa al menos el título y tema');
      return;
    }

    const tiempoTotalNum = parseInt(formulario.tiempoTotal);
    const tiempoPausaNum = parseInt(formulario.tiempoPausa);
    const pausasNum = parseInt(formulario.pausasPomodoro);

    if (!tiempoTotalNum || tiempoTotalNum < 15) {
      alert('El tiempo total debe ser mayor a 15 minutos');
      return;
    }

    // Para Flowtime, permitir pausas y duración en 0
    const esFlowtime = formulario.metodoEstudio === 'flowtime';
    
    if (!esFlowtime && (!tiempoPausaNum || tiempoPausaNum < 1)) {
      alert('El tiempo de pausa debe ser al menos 1 minuto');
      return;
    }

    if (!esFlowtime && (!pausasNum || pausasNum < 1)) {
      alert('Debe haber al menos 1 pausa');
      return;
    }

    // Para Flowtime, si no se especifican pausas, usar 0
    const pausasFinales = esFlowtime && !pausasNum ? 0 : pausasNum;
    const tiempoPausaFinal = esFlowtime && !tiempoPausaNum ? 0 : tiempoPausaNum;

    const metodo =
      METODOS_ESTUDIO[formulario.metodoEstudio as keyof typeof METODOS_ESTUDIO];

    try {
      const nuevaSesion = {
        titulo: formulario.titulo,
        tema: formulario.tema,
        fecha: new Date().toLocaleDateString('es-MX', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
        duracion: `${tiempoTotalNum} min`,
        metodoEstudio: metodo.nombre,
        descripcionMetodo: metodo.descripcion,
        tiempoTotal: tiempoTotalNum,
        tiempoPausa: tiempoPausaFinal,
        pausasPomodoro: pausasFinales,
        recomendacionesPausa: metodo.recomendacionesDefecto,
        notas: formulario.notas,
        estado: 'planificada' as const,
      };

      const sesionCreada = await crearSesionEstudio(nuevaSesion);
      await cargarSesiones();
      setMostrarFormulario(false);

      setFormulario({
        titulo: '',
        tema: '',
        metodoEstudio: 'pomodoro',
        tiempoTotal: '',
        tiempoPausa: '',
        pausasPomodoro: '',
        notas: '',
      });

      // Preguntar si quiere iniciar la sesión inmediatamente
      const iniciarAhora = window.confirm('✅ Sesión creada exitosamente\n\n¿Deseas iniciar la sesión de estudio ahora?');
      
      if (iniciarAhora) {
        // Buscar la sesión recién creada
        const sesionesActualizadas = await obtenerSesionesUsuario();
        const sesionNueva = sesionesActualizadas.find(s => s.id === sesionCreada);
        
        if (sesionNueva) {
          setSesionActiva(sesionNueva);
          setMostrarPomodoro(true);
        }
      }
    } catch (error) {
      console.error('Error al crear sesión:', error);
      alert('❌ Error al crear la sesión');
    }
  };

  // ============================================
  // FUNCIÓN - Eliminar sesión
  // ============================================
  const manejarEliminarSesion = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta sesión?')) {
      return;
    }

    try {
      await eliminarSesion(id);
      await cargarSesiones();
      alert('✅ Sesión eliminada');
    } catch (error) {
      console.error('Error al eliminar sesión:', error);
      alert('❌ Error al eliminar la sesión');
    }
  };

  // ============================================
  // FUNCIÓN - Ver detalles de sesión
  // ============================================
  const manejarVerDetalles = (sesion: SesionEstudio) => {
    setSesionSeleccionada(sesion);
    setMostrarDetalles(true);
  };

  // ============================================
  // FUNCIÓN - Iniciar sesión
  // ============================================
  const manejarIniciarSesion = (sesion: SesionEstudio) => {
    setSesionActiva(sesion);
    setMostrarPomodoro(true);
  };

  // ============================================
  // FUNCIÓN - Terminar sesión
  // ============================================
  const manejarTerminarSesion = async (sesionTerminada: SesionEstudio) => {
    if (!sesionTerminada.id) return;

    try {
      await actualizarSesionEstudio(sesionTerminada.id, {
        sentimientoFinal: sesionTerminada.sentimientoFinal,
        colorSentimiento: sesionTerminada.colorSentimiento,
        estado: sesionTerminada.estado,
        tiempoReal: sesionTerminada.tiempoReal,
      });

      await cargarSesiones();
    } catch (error) {
      console.error('Error al guardar sesión:', error);
      alert('❌ Error al guardar la sesión');
    }
  };

  // ============================================
  // VERIFICAR AUTENTICACIÓN
  // ============================================
  if (!usuarioAutenticado && !cargando) {
    return (
      <IonPage className="estudio-page">
        <IonContent className="estudio-content ion-padding ion-text-center">
          <div style={{ marginTop: '50px', color: 'white' }}>
            <h2>⚠️ No estás autenticado</h2>
            <p>Por favor inicia sesión para ver tus sesiones de estudio.</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // ============================================
  // RETORNO - Página principal
  // ============================================
  return (
    <IonPage className="estudio-page">
      <IonContent className="estudio-content" fullscreen>
        {/* ========== HEADER MEJORADO ========== */}
        <div className="header-section">
          <div className="header-left">
            <div className="app-logo">
              <IonIcon icon={libraryOutline} className="logo-icon" />
            </div>
            <div className="header-info">
              <h1 className="header-title">Sesiones de estudio</h1>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-icon-modern" onClick={() => setMostrarEstadisticas(true)} title="Ver estadísticas">
              <IonIcon icon={statsChartOutline} />
            </button>
            <button className="btn-icon-modern btn-primary" onClick={() => setMostrarFormulario(true)} title="Nueva sesión">
              <IonIcon icon={addCircleOutline} />
            </button>
          </div>
        </div>

        {/* ========== SESIONES ========== */}
        <div className="sessions-container">
          {cargando ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <IonSpinner name="crescent" color="light" />
              <p style={{ color: 'white', marginTop: '12px' }}>Cargando...</p>
            </div>
          ) : listaSesiones.length > 0 ? (
            listaSesiones.map((sesion) => (
              <TarjetaSesion
                key={sesion.id}
                sesion={sesion}
                onVerDetalles={manejarVerDetalles}
                onEliminar={manejarEliminarSesion}
                onIniciar={manejarIniciarSesion}
                onActualizar={cargarSesiones}
                expandido={sesionExpandidaId === sesion.id}
                onToggleExpand={(id: string) => {
                  setSesionExpandidaId(sesionExpandidaId === id ? null : id);
                }}
              />
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p style={{ color: 'white', marginBottom: '16px' }}>Aún no tienes sesiones</p>
              <button 
                className="btn-icon" 
                onClick={crearSesionesDemo}
                style={{ width: '48px', height: '48px', fontSize: '24px' }}
              >
                🎨
              </button>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginTop: '8px' }}>
                Crear sesiones de prueba
              </p>
            </div>
          )}
        </div>
      </IonContent>

      {/* ========== MODALES ========== */}
      <FormularioSesion
        isOpen={mostrarFormulario}
        onDismiss={() => setMostrarFormulario(false)}
        onGuardar={manejarGuardarSesion}
        formulario={formulario}
        onFormularioChange={manejarCambioFormulario}
      />

      <Pomodoro
        isOpen={mostrarPomodoro}
        sesionActiva={sesionActiva}
        onDismiss={() => setMostrarPomodoro(false)}
        onTerminarSesion={manejarTerminarSesion}
      />

      <EstadisticasComponent
        isOpen={mostrarEstadisticas}
        onDismiss={() => setMostrarEstadisticas(false)}
        sesiones={listaSesiones}
      />

      <Detalles
        isOpen={mostrarDetalles}
        onDismiss={() => setMostrarDetalles(false)}
        sesion={sesionSeleccionada}
      />

      <Configuracion
        isOpen={mostrarConfiguracion}
        onDismiss={() => setMostrarConfiguracion(false)}
      />
    </IonPage>
  );
};

export default Estudio;