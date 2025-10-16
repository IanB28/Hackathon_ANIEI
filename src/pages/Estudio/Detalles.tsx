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
  IonChip,
} from '@ionic/react';
import { 
  closeOutline,
  timeOutline,
  waterOutline,
  cubeOutline,
  bookOutline,
  checkmarkCircleOutline,
  stopwatchOutline,
  calendarOutline,
  helpCircleOutline,
  trophyOutline,
  thumbsUpOutline,
  barbellOutline,
  documentTextOutline,
  bulbOutline,
  happyOutline
} from 'ionicons/icons';
import { SesionEstudio } from '../../services/sesionEstudioService';
import './Componentes/Modales.css';
import './Componentes/DetallesStyles.css';

// ============================================
// INTERFAZ - Props del componente
// ============================================
interface DetallesProps {
  isOpen: boolean;
  onDismiss: () => void;
  sesion: SesionEstudio | null;
}

// ============================================
// COMPONENTE - Modal de detalles de sesión
// ============================================
const Detalles: FC<DetallesProps> = ({ isOpen, onDismiss, sesion }) => {
  // Determinar color según tema
  const obtenerColorTema = () => {
    if (!sesion) return { primary: '#8B5CF6', secondary: 'rgba(139, 92, 246, 0.1)' };
    const tema = sesion.tema?.toLowerCase() || sesion.titulo?.toLowerCase() || '';
    if (tema.includes('mat')) return { primary: '#8B5CF6', secondary: 'rgba(139, 92, 246, 0.1)' };
    if (tema.includes('hist')) return { primary: '#F59E0B', secondary: 'rgba(245, 158, 11, 0.1)' };
    if (tema.includes('dist') || tema.includes('sist')) return { primary: '#F97316', secondary: 'rgba(249, 115, 22, 0.1)' };
    if (tema.includes('fis')) return { primary: '#3B82F6', secondary: 'rgba(59, 130, 246, 0.1)' };
    if (tema.includes('quim')) return { primary: '#10B981', secondary: 'rgba(16, 185, 129, 0.1)' };
    if (tema.includes('ing')) return { primary: '#6366F1', secondary: 'rgba(99, 102, 241, 0.1)' };
    return { primary: '#8B5CF6', secondary: 'rgba(139, 92, 246, 0.1)' };
  };

  const colorTema = obtenerColorTema();

  // Obtener icono según método
  const obtenerIconoMetodo = (metodo: string) => {
    const metodoLower = metodo.toLowerCase();
    if (metodoLower.includes('pomodoro')) return timeOutline;
    if (metodoLower.includes('flowtime')) return waterOutline;
    if (metodoLower.includes('bloque')) return cubeOutline;
    return bookOutline;
  };

  // Obtener badge de estado
  const obtenerBadgeEstado = (estado: string) => {
    switch (estado) {
      case 'terminada':
        return { text: 'Completada', color: '#10B981', icono: checkmarkCircleOutline };
      case 'en-curso':
        return { text: 'En Curso', color: '#F59E0B', icono: stopwatchOutline };
      case 'planificada':
        return { text: 'Planificada', color: '#8B5CF6', icono: calendarOutline };
      default:
        return { text: 'Desconocido', color: '#6b7280', icono: helpCircleOutline };
    }
  };

  // Calcular desempeño
  const obtenerDesempeno = () => {
    if (!sesion || sesion.estado !== 'terminada' || !sesion.tiempoReal || !sesion.tiempoTotal) return null;
    
    const porcentajeDesempeno = (sesion.tiempoReal / sesion.tiempoTotal) * 100;
    
    if (porcentajeDesempeno >= 80) {
      return {
        texto: '¡Excelente Desempeño!',
        icono: trophyOutline,
        porcentaje: Math.round(porcentajeDesempeno),
        color: '#10b981'
      };
    }
    
    if (porcentajeDesempeno >= 50) {
      return {
        texto: 'Buen Desempeño',
        icono: thumbsUpOutline,
        porcentaje: Math.round(porcentajeDesempeno),
        color: '#F59E0B'
      };
    }
    
    return {
      texto: 'Puedes Mejorar',
      icono: barbellOutline,
      porcentaje: Math.round(porcentajeDesempeno),
      color: '#EF4444'
    };
  };

  const estadoBadge = sesion ? obtenerBadgeEstado(sesion.estado) : null;
  const desempeno = obtenerDesempeno();

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDismiss} className="modal-estudio modal-detalles">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Detalles de Sesión</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onDismiss}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {sesion && (
          <div className="detalles-container">
            {/* ========== ENCABEZADO HERO ========== */}
            <div className="hero-header" style={{
              background: `linear-gradient(135deg, ${colorTema.primary} 0%, ${colorTema.primary}dd 100%)`
            }}>
              {/* Badge de estado */}
              <div className="estado-badge">
                <IonIcon icon={estadoBadge?.icono} />
                <span>{estadoBadge?.text}</span>
              </div>

              <h2 className="hero-title">
                {sesion.titulo}
              </h2>
              <p className="hero-subtitle">
                <IonIcon icon={bookOutline} />
                <span>{sesion.tema}</span>
              </p>
            </div>

            {/* ========== GRID DE INFORMACIÓN PRINCIPAL ========== */}
            <div className="info-grid">
              {/* Método */}
              <div className="info-card" style={{ borderLeftColor: colorTema.primary }}>
                <IonIcon 
                  icon={obtenerIconoMetodo(sesion.metodoEstudio)} 
                  className="info-icon"
                  style={{ color: colorTema.primary }}
                />
                <p className="info-label">MÉTODO</p>
                <p className="info-value">{sesion.metodoEstudio}</p>
              </div>

              {/* Tiempo Planeado */}
              <div className="info-card" style={{ borderLeftColor: colorTema.primary }}>
                <IonIcon icon={timeOutline} className="info-icon" style={{ color: colorTema.primary }} />
                <p className="info-label">TIEMPO PLANEADO</p>
                <p className="info-value">
                  {sesion.tiempoTotal} <span className="info-unit">min</span>
                </p>
              </div>

              {/* Pausas */}
              <div className="info-card" style={{ borderLeftColor: colorTema.primary }}>
                <IonIcon icon={stopwatchOutline} className="info-icon" style={{ color: colorTema.primary }} />
                <p className="info-label">PAUSAS</p>
                <p className="info-value">{sesion.pausasPomodoro}</p>
              </div>

              {/* Duración Pausa */}
              <div className="info-card" style={{ borderLeftColor: colorTema.primary }}>
                <IonIcon icon={timeOutline} className="info-icon" style={{ color: colorTema.primary }} />
                <p className="info-label">DURACIÓN PAUSA</p>
                <p className="info-value">
                  {sesion.tiempoPausa} <span className="info-unit">min</span>
                </p>
              </div>

              {/* Tiempo Real (si existe) */}
              {sesion.tiempoReal && (
                <div className="info-card info-card-full" style={{ borderLeftColor: '#10b981' }}>
                  <IonIcon icon={checkmarkCircleOutline} className="info-icon" style={{ color: '#10b981' }} />
                  <p className="info-label">TIEMPO REAL</p>
                  <p className="info-value" style={{ color: '#10b981' }}>
                    {sesion.tiempoReal} <span className="info-unit">min</span>
                  </p>
                </div>
              )}
            </div>

            {/* ========== BADGE DE DESEMPEÑO ========== */}
            {desempeno && (
              <div 
                className="desempeno-badge"
                style={{
                  background: `linear-gradient(135deg, ${desempeno.color}25 0%, ${desempeno.color}12 100%)`,
                  border: `3px solid ${desempeno.color}70`,
                  boxShadow: `0 8px 24px ${desempeno.color}20`
                }}
              >
                <div className="desempeno-title">
                  Desempeño en la Sesión
                </div>
                <IonIcon 
                  icon={desempeno.icono}
                  className="desempeno-icon"
                  style={{
                    filter: `drop-shadow(0 4px 8px ${desempeno.color}40)`,
                    color: desempeno.color
                  }}
                />
                <div 
                  className="desempeno-text"
                  style={{
                    color: desempeno.color,
                    textShadow: `0 2px 8px ${desempeno.color}40`
                  }}
                >
                  {desempeno.texto}
                </div>
                <div className="desempeno-description">
                  Completaste el {desempeno.porcentaje}% del tiempo planeado
                </div>
              </div>
            )}

            {/* ========== DESCRIPCIÓN DEL MÉTODO ========== */}
            <div 
              className="section-card"
              style={{
                background: `linear-gradient(135deg, ${colorTema.primary}15 0%, ${colorTema.primary}08 100%)`,
                border: `2px solid ${colorTema.primary}40`,
                borderLeft: `6px solid ${colorTema.primary}`
              }}
            >
              <h3 className="section-title" style={{ color: colorTema.primary }}>
                <IonIcon icon={bookOutline} />
                <span>Descripción del Método</span>
              </h3>
              <p className="section-content">
                {sesion.descripcionMetodo}
              </p>
            </div>

            {/* ========== RECOMENDACIONES ========== */}
            {sesion.recomendacionesPausa && sesion.recomendacionesPausa.length > 0 && (
              <div className="section-card">
                <h3 className="section-title">
                  <IonIcon icon={bulbOutline} />
                  <span>Recomendaciones en Pausas</span>
                </h3>
                <div className="recomendaciones-container">
                  {sesion.recomendacionesPausa.map((rec: string, index: number) => (
                    <div
                      key={index}
                      className="recomendacion-chip"
                      style={{
                        background: `${colorTema.primary}20`,
                        borderColor: `${colorTema.primary}50`
                      }}
                    >
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========== SENTIMIENTO FINAL ========== */}
            {sesion.estado === 'terminada' && sesion.sentimientoFinal && (
              <div 
                className="sentimiento-card"
                style={{
                  background: `linear-gradient(135deg, ${sesion.colorSentimiento}25 0%, ${sesion.colorSentimiento}12 100%)`,
                  border: `2px solid ${sesion.colorSentimiento}60`,
                  boxShadow: `0 12px 40px ${sesion.colorSentimiento}25`
                }}
              >
                <div className="sentimiento-label">
                  ¿Cómo te sentiste?
                </div>
                <div 
                  className="sentimiento-emoji"
                  style={{
                    filter: `drop-shadow(0 6px 24px ${sesion.colorSentimiento}50)`
                  }}
                >
                  <div className="sentimiento-texto" style={{ color: sesion.colorSentimiento }}>
                    {sesion.sentimientoFinal}
                  </div>
                </div>
              </div>
            )}

            {/* ========== NIVEL DE EMOCIÓN ========== */}
            {sesion.nivelEmocion !== undefined && (
              <div className="section-card">
                <h3 className="section-title">
                  <IonIcon icon={happyOutline} />
                  <span>Nivel de Emoción</span>
                </h3>
                <div className="progress-wrapper">
                  <div className="progress-header">
                    <span className="progress-label">
                      {sesion.nivelEmocion < 33 ? '😞 Bajo' : sesion.nivelEmocion < 66 ? '😐 Medio' : '😊 Alto'}
                    </span>
                    <span className="progress-percentage" style={{ color: colorTema.primary }}>
                      {sesion.nivelEmocion}%
                    </span>
                  </div>
                  <div className="progress-bar-custom">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${sesion.nivelEmocion}%`,
                        background: `linear-gradient(90deg, ${colorTema.primary}, ${colorTema.primary}dd)`,
                        boxShadow: `0 0 12px ${colorTema.primary}60`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* ========== NOTAS ========== */}
            {sesion.notas && (
              <div className="section-card" style={{ marginBottom: '20px' }}>
                <h3 className="section-title">
                  <IonIcon icon={documentTextOutline} />
                  <span>Notas</span>
                </h3>
                <p className="section-content" style={{ whiteSpace: 'pre-wrap' }}>
                  {sesion.notas}
                </p>
              </div>
            )}
          </div>
        )}
      </IonContent>
    </IonModal>
  );
};

export default Detalles;