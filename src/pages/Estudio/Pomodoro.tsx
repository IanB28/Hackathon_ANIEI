import React, { FC, useEffect, useState } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonProgressBar,
  IonChip,
} from '@ionic/react';
import {
  closeOutline,
  playOutline,
  pauseOutline,
  stopOutline,
  stopwatchOutline,
  pauseCircleOutline,
} from 'ionicons/icons';
import { SesionEstudio } from '../../services/sesionEstudioService';
import Timer from './Componentes/Timer';
import ModalSentimiento from './Componentes/ModalSentimiento';
import './Componentes/Modales.css';
import './Componentes/PomodoroStyles.css';

// ============================================
// CONSTANTE - Métodos de estudio disponibles
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
// INTERFAZ - Props del componente
// ============================================
interface PomodoroProps {
  isOpen: boolean;
  sesionActiva: SesionEstudio | null;
  onDismiss: () => void;
  onTerminarSesion: (sesionTerminada: SesionEstudio) => void;
}

// ============================================
// COMPONENTE - Pantalla de sesión activa (Pomodoro)
// ============================================
const Pomodoro: FC<PomodoroProps> = ({
  isOpen,
  sesionActiva,
  onDismiss,
  onTerminarSesion,
}) => {
  // ============================================
  // ESTADO - Control de sesión en curso
  // ============================================
  const [segundosRestantes, setSegundosRestantes] = useState(0);
  const [estoyEnPausa, setEstoyEnPausa] = useState(false);
  const [pausaActual, setPausaActual] = useState(0);
  const [sesionEnCurso, setSesionEnCurso] = useState(false);
  const [tiempoRealInicio, setTiempoRealInicio] = useState(0);
  const [totalSegundosTranscurridos, setTotalSegundosTranscurridos] = useState(0);
  const [recomendacionesAleatorias, setRecomendacionesAleatorias] = useState<string[]>([]);
  const [mostrarModalSentimiento, setMostrarModalSentimiento] = useState(false);
  const [modoActual, setModoActual] = useState<'pomodoro' | 'flowtime' | 'bloque'>('pomodoro');
  const [tiempoSinPausa, setTiempoSinPausa] = useState(0); // Para Flowtime
  const [tiempoPausaTranscurrido, setTiempoPausaTranscurrido] = useState(0); // Timer de pausa

  // ============================================
  // EFECTO - Inicializar sesión cuando se abre
  // ============================================
  useEffect(() => {
    if (isOpen && sesionActiva) {
      const segundosTotales = sesionActiva.tiempoTotal * 60;
      setSegundosRestantes(segundosTotales);
      setSesionEnCurso(true);
      setTiempoRealInicio(Date.now());
      setTotalSegundosTranscurridos(0);
      setPausaActual(0);
      setEstoyEnPausa(false);
      setTiempoSinPausa(0);
      
      // Determinar el modo según el método de estudio
      const metodoLower = sesionActiva.metodoEstudio.toLowerCase();
      if (metodoLower.includes('flowtime')) {
        setModoActual('flowtime');
      } else if (metodoLower.includes('bloque')) {
        setModoActual('bloque');
      } else {
        setModoActual('pomodoro');
      }
    } else if (!isOpen) {
      // Reiniciar estados al cerrar
      setSesionEnCurso(false);
      setSegundosRestantes(0);
      setTotalSegundosTranscurridos(0);
      setPausaActual(0);
      setEstoyEnPausa(false);
      setRecomendacionesAleatorias([]);
      setTiempoSinPausa(0);
      setTiempoPausaTranscurrido(0);
    }
  }, [isOpen, sesionActiva]);

  // ============================================
  // EFECTO - Timer de pausa (cuenta el tiempo de descanso)
  // ============================================
  useEffect(() => {
    if (!estoyEnPausa || !sesionActiva) {
      return;
    }

    // Reiniciar el contador cuando se inicia una pausa
    setTiempoPausaTranscurrido(0);

    const interval = setInterval(() => {
      setTiempoPausaTranscurrido((tiempo) => {
        const nuevoTiempo = tiempo + 1;
        const tiempoPausaSegundos = sesionActiva.tiempoPausa * 60;

        // Si se completa el tiempo de pausa, reanudar automáticamente
        if (nuevoTiempo >= tiempoPausaSegundos) {
          clearInterval(interval);
          // Esperar un momento y luego reanudar
          setTimeout(() => {
            terminarPausa();
          }, 100);
          return nuevoTiempo;
        }

        return nuevoTiempo;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [estoyEnPausa, sesionActiva]);

  // ============================================
  // EFECTO - Timer principal que cuenta hacia atrás
  // ============================================
  useEffect(() => {
    if (!sesionEnCurso || !sesionActiva || estoyEnPausa) {
      return;
    }

    const interval = setInterval(() => {
      setTotalSegundosTranscurridos((total) => total + 1);
      setTiempoSinPausa((tiempo) => tiempo + 1);

      // ============================================
      // MODO FLOWTIME - Sin límite de tiempo
      // ============================================
      if (modoActual === 'flowtime') {
        // En Flowtime, el usuario decide cuándo pausar
        // No hay límite automático
        return;
      }

      // ============================================
      // MODO POMODORO & BLOQUE - Con tiempo límite
      // ============================================
      setSegundosRestantes((seg) => {
        const nuevoTiempo = seg - 1;

        // ✅ Verificar si se completó la sesión
        if (nuevoTiempo <= 0) {
          setSesionEnCurso(false);
          clearInterval(interval);
          terminarSesion();
          return 0;
        }

        // ✅ Verificar si es momento de pausa (solo para Pomodoro y Bloque)
        if (sesionActiva && sesionActiva.pausasPomodoro > 0 && 
            (modoActual === 'pomodoro' || modoActual === 'bloque')) {
          const tiempoBloque = Math.floor((sesionActiva.tiempoTotal * 60) / sesionActiva.pausasPomodoro);
          const totalTranscurrido = totalSegundosTranscurridos + 1;
          
          // Verificar si llegamos al final de un bloque
          if (totalTranscurrido % tiempoBloque === 0 && pausaActual < sesionActiva.pausasPomodoro) {
            setEstoyEnPausa(true);
            setPausaActual((prev) => prev + 1);
            setSesionEnCurso(false);
            seleccionarRecomendacionesAleatorias(sesionActiva);
          }
        }

        return nuevoTiempo;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sesionEnCurso, estoyEnPausa, sesionActiva, pausaActual, totalSegundosTranscurridos, modoActual]);

  // ============================================
  // FUNCIÓN - Seleccionar recomendaciones aleatorias
  // ============================================
  const seleccionarRecomendacionesAleatorias = (sesion: SesionEstudio) => {
    const metodo =
      METODOS_ESTUDIO[
        sesion.metodoEstudio.toLowerCase().replace(/ /g, '') as keyof typeof METODOS_ESTUDIO
      ];

    if (!metodo) return;

    const recomendacionesMetodo = metodo.recomendacionesDefecto;
    const cantidad = Math.min(4, recomendacionesMetodo.length);

    const recomendacionesSeleccionadas: string[] = [];
    const indices = new Set<number>();

    while (indices.size < cantidad) {
      indices.add(Math.floor(Math.random() * recomendacionesMetodo.length));
    }

    indices.forEach((index) => {
      recomendacionesSeleccionadas.push(recomendacionesMetodo[index]);
    });

    setRecomendacionesAleatorias(recomendacionesSeleccionadas);
  };

  // ============================================
  // FUNCIÓN - Pausar sesión
  // ============================================
  const pausarSesion = () => {
    setSesionEnCurso(false);
  };

  // ============================================
  // FUNCIÓN - Reanudar sesión
  // ============================================
  const reanudarSesion = () => {
    setSesionEnCurso(true);
  };

  // ============================================
  // FUNCIÓN - Terminar pausa Pomodoro
  // ============================================
  const terminarPausa = () => {
    setEstoyEnPausa(false);
    setSesionEnCurso(true);
    setRecomendacionesAleatorias([]);
    setTiempoSinPausa(0); // Reiniciar contador de tiempo sin pausa
  };

  // ============================================
  // FUNCIÓN - Tomar pausa manual (para Flowtime)
  // ============================================
  const tomarPausaManual = () => {
    if (!sesionActiva) return;
    
    setEstoyEnPausa(true);
    setPausaActual((prev) => prev + 1);
    setSesionEnCurso(false);
    seleccionarRecomendacionesAleatorias(sesionActiva);
  };

  // ============================================
  // FUNCIÓN - Terminar sesión completamente
  // ============================================
  const terminarSesion = () => {
    const tiempoRealMs = Date.now() - tiempoRealInicio;
    const tiempoRealMinutos = Math.round(tiempoRealMs / 1000 / 60);

    if (sesionActiva) {
      sesionActiva.tiempoReal = tiempoRealMinutos;
    }

    setSesionEnCurso(false);
    setMostrarModalSentimiento(true);
  };

  // ============================================
  // FUNCIÓN - Guardar sentimiento y finalizar
  // ============================================
  const guardarSentimiento = async (sentimiento: string, color: string) => {
    if (!sesionActiva) return;

    const sesionTerminada: SesionEstudio = {
      ...sesionActiva,
      sentimientoFinal: sentimiento,
      colorSentimiento: color,
      estado: 'terminada',
    };

    onTerminarSesion(sesionTerminada);

    setSegundosRestantes(0);
    setPausaActual(0);
    setEstoyEnPausa(false);
    setRecomendacionesAleatorias([]);
    setMostrarModalSentimiento(false);
    onDismiss();

    alert('¡Sesión guardada! Bien hecho 🎉');
  };

  // ============================================
  // RETORNO - Pantalla de sesión activa
  // ============================================
  return (
    <>
      <IonModal
        isOpen={isOpen}
        onDidDismiss={() => {
          onDismiss();
          setSesionEnCurso(false);
        }}
        className={`modal-estudio pomodoro-modo-${modoActual}`}
      >
        <IonHeader className="pomodoro-header">
          <IonToolbar>
            <IonTitle>Sesión en Curso</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={onDismiss}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">
          {sesionActiva && (
            <>
              {/* ========== ENCABEZADO DE SESIÓN ========== */}
              <div className="sesion-header">
                <h2 className="sesion-titulo">{sesionActiva.titulo}</h2>
                <p className="sesion-tema">
                  <span className="tema-label">Tema:</span>
                  <span className="tema-value">{sesionActiva.tema}</span>
                </p>
              </div>

              {/* ========== BADGE DE MODO ========== */}
              <div className={`modo-badge modo-badge-${modoActual}`}>
                {modoActual === 'pomodoro' && '🍅 Pomodoro'}
                {modoActual === 'flowtime' && '⚡ Flowtime'}
                {modoActual === 'bloque' && '📦 Bloque de Tiempo'}
              </div>

              {/* ========== TIMER ========== */}
              <Timer
                segundosRestantes={segundosRestantes}
                estoyEnPausa={estoyEnPausa}
                tiempoPausa={sesionActiva.tiempoPausa}
                modo={modoActual}
                tiempoTranscurrido={totalSegundosTranscurridos}
              />

              {/* ========== BARRA DE PROGRESO ========== */}
              {modoActual !== 'flowtime' && (
                <IonProgressBar
                  value={
                    (totalSegundosTranscurridos /
                      (sesionActiva.tiempoTotal * 60)) *
                    0.9
                  }
                  style={{ marginTop: '20px' }}
                />
              )}

              {/* ========== INFORMACIÓN DE SESIÓN ========== */}
              <div className="info-sesion">
                <div className="info-item">
                  <IonIcon icon={stopwatchOutline} className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Método</span>
                    <span className="info-value">{sesionActiva.metodoEstudio}</span>
                  </div>
                </div>
                {modoActual !== 'flowtime' && (
                  <div className="info-item">
                    <IonIcon icon={stopwatchOutline} className="info-icon" />
                    <div className="info-content">
                      <span className="info-label">Tiempo Total</span>
                      <span className="info-value">{sesionActiva.tiempoTotal} minutos</span>
                    </div>
                  </div>
                )}
                {modoActual === 'flowtime' && (
                  <div className="info-item">
                    <IonIcon icon={stopwatchOutline} className="info-icon" />
                    <div className="info-content">
                      <span className="info-label">Tiempo sin pausa</span>
                      <span className="info-value">{Math.floor(tiempoSinPausa / 60)}:{(tiempoSinPausa % 60).toString().padStart(2, '0')} min</span>
                    </div>
                  </div>
                )}
                <div className="info-item">
                  <IonIcon icon={pauseCircleOutline} className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Pausas tomadas</span>
                    <span className="info-value">
                      {pausaActual}{modoActual !== 'flowtime' && ` / ${sesionActiva.pausasPomodoro}`}
                    </span>
                  </div>
                </div>
                <div className="info-item">
                  <IonIcon icon={stopwatchOutline} className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Duración Pausa</span>
                    <span className="info-value">{sesionActiva.tiempoPausa} min c/pausa</span>
                  </div>
                </div>
              </div>

              {/* ========== SECCIÓN DE PAUSA ========== */}
              {estoyEnPausa && (
                <div className="seccion-pausa">
                  <div className="pausa-header">
                    <IonIcon icon={pauseCircleOutline} className="pausa-icon" />
                    <h3 className="pausa-title">
                      {modoActual === 'flowtime' 
                        ? `Descanso #${pausaActual}` 
                        : modoActual === 'bloque'
                        ? `Pausa de Bloque ${pausaActual}/${sesionActiva.pausasPomodoro}`
                        : `Descanso #${pausaActual}`
                      }
                    </h3>
                    <p className="pausa-subtitle">¡Tómate un descanso!</p>
                  </div>

                  {/* Timer de pausa */}
                  <div className="timer-pausa-container">
                    <div className="timer-pausa-display">
                      <span className="timer-pausa-numero">
                        {Math.floor(tiempoPausaTranscurrido / 60)}:{(tiempoPausaTranscurrido % 60).toString().padStart(2, '0')}
                      </span>
                      <span className="timer-pausa-meta">
                        / {sesionActiva.tiempoPausa} min
                      </span>
                    </div>
                    
                    {/* Barra de progreso de pausa */}
                    <div className="progress-pausa-wrapper">
                      <div 
                        className="progress-pausa-fill"
                        style={{ 
                          width: `${Math.min((tiempoPausaTranscurrido / (sesionActiva.tiempoPausa * 60)) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>

                  {/* Recomendaciones */}
                  <div className="recomendaciones-pausa-card">
                    <div className="recomendaciones-header">
                      <span className="recomendaciones-label">Recomendaciones:</span>
                    </div>
                    <div className="recomendaciones-grid">
                      {recomendacionesAleatorias.map((rec, index) => (
                        <div key={index} className="recomendacion-item">
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Botón para continuar manualmente */}
                  <button className="btn-continuar-pausa" onClick={terminarPausa}>
                    <IonIcon icon={playOutline} className="btn-continuar-icon" />
                    <span>Continuar Estudiando Ahora</span>
                  </button>
                </div>
              )}

              {/* ========== BOTONES DE CONTROL ========== */}
              {!estoyEnPausa && (
                <div className="botones-control">
                  {/* Botón especial para Flowtime: Tomar Pausa Manual */}
                  {modoActual === 'flowtime' && sesionEnCurso && (
                    <IonButton
                      expand="block"
                      className="btn-control btn-pausar"
                      onClick={tomarPausaManual}
                    >
                      <IonIcon icon={pauseOutline} slot="start" />
                      Tomar un Descanso
                    </IonButton>
                  )}

                  {/* Botones de Pausar/Reanudar */}
                  {sesionEnCurso ? (
                    <IonButton
                      expand="block"
                      className="btn-control btn-pausar"
                      onClick={pausarSesion}
                    >
                      <IonIcon icon={pauseOutline} slot="start" />
                      {modoActual === 'flowtime' ? 'Pausar Timer' : 'Pausar Sesión'}
                    </IonButton>
                  ) : (
                    <IonButton
                      expand="block"
                      className="btn-control btn-reanudar"
                      onClick={reanudarSesion}
                    >
                      <IonIcon icon={playOutline} slot="start" />
                      Reanudar
                    </IonButton>
                  )}

                  {/* Botón Terminar Sesión */}
                  <IonButton
                    expand="block"
                    className="btn-control btn-terminar"
                    onClick={terminarSesion}
                  >
                    <IonIcon icon={stopOutline} slot="start" />
                    Terminar Sesión
                  </IonButton>
                </div>
              )}
            </>
          )}
        </IonContent>
      </IonModal>

      {/* ========== MODAL: SENTIMIENTO ========== */}
      <ModalSentimiento
        isOpen={mostrarModalSentimiento}
        onDismiss={() => setMostrarModalSentimiento(false)}
        onSentimientoSelected={guardarSentimiento}
      />
    </>
  );
};

export default Pomodoro;