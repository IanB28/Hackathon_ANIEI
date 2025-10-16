import React, { FC } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonProgressBar,
} from '@ionic/react';
import { 
  closeOutline, 
  statsChartOutline, 
  libraryOutline, 
  checkmarkCircleOutline, 
  timeOutline, 
  pauseCircleOutline,
  trophyOutline,
  rocketOutline
} from 'ionicons/icons';
import { SesionEstudio } from '../../services/sesionEstudioService';
import './Componentes/Modales.css';
import './Componentes/EstadisticasStyles.css';

// ============================================
// INTERFAZ - Estadísticas del usuario
// ============================================
interface Estadisticas {
  sesionesTotales: number;
  sesionesCompletadas: number;
  tiempoTotalEstudio: number;
  pausasTotales: number;
  sentimientoPorcentajes: {
    bien: number;
    normal: number;
    mal: number;
  };
  metodoFavorito: string;
}

// ============================================
// INTERFAZ - Props del componente
// ============================================
interface EstadisticasProps {
  isOpen: boolean;
  onDismiss: () => void;
  sesiones: SesionEstudio[];
}

// ============================================
// COMPONENTE - Modal de estadísticas
// ============================================
const Estadisticas: FC<EstadisticasProps> = ({
  isOpen,
  onDismiss,
  sesiones,
}) => {
  // ============================================
  // FUNCIÓN - Calcular estadísticas
  // ============================================
  const calcularEstadisticas = (): Estadisticas => {
    const sesionesCompletadas = sesiones.filter(s => s.estado === 'terminada');
    
    const tiempoTotalEstudio = sesionesCompletadas.reduce(
      (acc, s) => acc + (s.tiempoReal || 0),
      0
    );
    
    const pausasTotales = sesionesCompletadas.reduce(
      (acc, s) => acc + s.pausasPomodoro,
      0
    );

    let bien = 0, normal = 0, mal = 0;
    sesionesCompletadas.forEach((s) => {
      if (s.sentimientoFinal?.includes('Bien')) bien++;
      else if (s.sentimientoFinal?.includes('Normal')) normal++;
      else if (s.sentimientoFinal?.includes('Mal')) mal++;
    });

    const total = sesionesCompletadas.length;
    const metodoFavorito = obtenerMetodoFavorito(sesionesCompletadas);

    return {
      sesionesTotales: sesiones.length,
      sesionesCompletadas: total,
      tiempoTotalEstudio,
      pausasTotales,
      sentimientoPorcentajes: {
        bien: total > 0 ? (bien / total) * 100 : 0,
        normal: total > 0 ? (normal / total) * 100 : 0,
        mal: total > 0 ? (mal / total) * 100 : 0,
      },
      metodoFavorito,
    };
  };

  // ============================================
  // FUNCIÓN - Obtener método favorito
  // ============================================
  const obtenerMetodoFavorito = (sesionesCompletadas: SesionEstudio[]): string => {
    const contageo: { [key: string]: number } = {};
    sesionesCompletadas.forEach((s) => {
      contageo[s.metodoEstudio] = (contageo[s.metodoEstudio] || 0) + 1;
    });
    return Object.keys(contageo).length > 0
      ? Object.keys(contageo).reduce((a, b) =>
          contageo[a] > contageo[b] ? a : b
        )
      : 'N/A';
  };

  const stats = calcularEstadisticas();

  // ============================================
  // RETORNO - Modal de estadísticas con diseño mejorado
  // ============================================
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDismiss} className="modal-estudio modal-estadisticas">
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <IonIcon icon={statsChartOutline} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Estadísticas de Estudio
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onDismiss}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* ========== GRID DE ESTADÍSTICAS PRINCIPALES ========== */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <IonIcon icon={libraryOutline} />
            </div>
            <p className="stat-label">Sesiones Totales</p>
            <p className="stat-value">{stats.sesionesTotales}</p>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <IonIcon icon={checkmarkCircleOutline} />
            </div>
            <p className="stat-label">Completadas</p>
            <p className="stat-value">{stats.sesionesCompletadas}</p>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <IonIcon icon={timeOutline} />
            </div>
            <p className="stat-label">Minutos Totales</p>
            <p className="stat-value">{stats.tiempoTotalEstudio}</p>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <IonIcon icon={pauseCircleOutline} />
            </div>
            <p className="stat-label">Pausas Totales</p>
            <p className="stat-value">{stats.pausasTotales}</p>
          </div>
        </div>

        {/* ========== MÉTODO FAVORITO ========== */}
        <div className="metodo-favorito-card">
          <div className="metodo-subtitle">Tu Método Favorito</div>
          <div className="metodo-icon">
            <IonIcon icon={trophyOutline} />
          </div>
          <div className="metodo-nombre">{stats.metodoFavorito}</div>
          <p style={{ fontSize: '14px', marginTop: '8px', opacity: 0.8 }}>
            Este es el método que más utilizas para estudiar
          </p>
        </div>

        {/* ========== DISTRIBUCIÓN DE SENTIMIENTOS VISUAL ========== */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>¿Cómo te has sentido?</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="sentimientos-visual">
              {/* Bien */}
              <div className="sentimiento-bar">
                <div className="sentimiento-emoji">😊</div>
                <div className="sentimiento-barra">
                  <div 
                    className="sentimiento-fill bien" 
                    style={{ height: `${stats.sentimientoPorcentajes.bien}%` }}
                  ></div>
                </div>
                <div className="sentimiento-porcentaje">
                  {Math.round(stats.sentimientoPorcentajes.bien)}%
                </div>
                <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.7 }}>
                  Bien
                </div>
              </div>

              {/* Normal */}
              <div className="sentimiento-bar">
                <div className="sentimiento-emoji">😐</div>
                <div className="sentimiento-barra">
                  <div 
                    className="sentimiento-fill normal" 
                    style={{ height: `${stats.sentimientoPorcentajes.normal}%` }}
                  ></div>
                </div>
                <div className="sentimiento-porcentaje">
                  {Math.round(stats.sentimientoPorcentajes.normal)}%
                </div>
                <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.7 }}>
                  Normal
                </div>
              </div>

              {/* Mal */}
              <div className="sentimiento-bar">
                <div className="sentimiento-emoji">😞</div>
                <div className="sentimiento-barra">
                  <div 
                    className="sentimiento-fill mal" 
                    style={{ height: `${stats.sentimientoPorcentajes.mal}%` }}
                  ></div>
                </div>
                <div className="sentimiento-porcentaje">
                  {Math.round(stats.sentimientoPorcentajes.mal)}%
                </div>
                <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.7 }}>
                  Mal
                </div>
              </div>
            </div>
          </IonCardContent>
        </IonCard>

        {/* ========== PROGRESO DE COMPLETACIÓN ========== */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Progreso General</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="progress-wrapper">
              <div className="progress-header">
                <span className="progress-label">Tasa de Completación</span>
                <span className="progress-percentage">
                  {stats.sesionesTotales > 0 
                    ? Math.round((stats.sesionesCompletadas / stats.sesionesTotales) * 100)
                    : 0}%
                </span>
              </div>
              <div className="progress-bar-custom">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: stats.sesionesTotales > 0 
                      ? `${(stats.sesionesCompletadas / stats.sesionesTotales) * 100}%`
                      : '0%'
                  }}
                ></div>
              </div>
            </div>

            <div className="progress-wrapper">
              <div className="progress-header">
                <span className="progress-label">Promedio por Sesión</span>
                <span className="progress-percentage">
                  {stats.sesionesCompletadas > 0
                    ? Math.round(stats.tiempoTotalEstudio / stats.sesionesCompletadas)
                    : 0} min
                </span>
              </div>
              <div className="progress-bar-custom">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${Math.min(100, (stats.sesionesCompletadas > 0
                      ? Math.round(stats.tiempoTotalEstudio / stats.sesionesCompletadas)
                      : 0) / 60 * 100)}%`
                  }}
                ></div>
              </div>
            </div>
          </IonCardContent>
        </IonCard>

        {/* ========== MENSAJE MOTIVACIONAL ========== */}
        {stats.sesionesCompletadas >= 5 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(107, 203, 119, 0.2) 0%, rgba(76, 175, 80, 0.1) 100%)',
            border: '1px solid rgba(107, 203, 119, 0.3)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
            marginTop: '20px'
          }}>
            <IonIcon icon={rocketOutline} style={{ fontSize: '48px', marginBottom: '12px', color: '#6BCB77' }} />
            <h3 style={{ color: '#6BCB77', marginBottom: '8px' }}>¡Excelente Trabajo!</h3>
            <p style={{ fontSize: '14px', opacity: 0.9 }}>
              Has completado {stats.sesionesCompletadas} sesiones. ¡Sigue así!
            </p>
          </div>
        )}
      </IonContent>
    </IonModal>
  );
};

export default Estadisticas;