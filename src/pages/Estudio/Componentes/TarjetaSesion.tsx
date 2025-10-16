import React, { FC, useState, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { 
  happyOutline, 
  sadOutline, 
  removeCircleOutline,
  trophyOutline,
  thumbsUpOutline,
  barbellOutline,
  playCircleOutline,
  trashOutline,
  bookOutline,
  documentTextOutline,
  chevronDownOutline,
  chevronForwardOutline
} from 'ionicons/icons';
import { SesionEstudio, actualizarSesionEstudio } from '../../../services/sesionEstudioService';

interface TarjetaSesionProps {
  sesion: SesionEstudio;
  onVerDetalles: (sesion: SesionEstudio) => void;
  onEliminar: (id: string) => void;
  onIniciar?: (sesion: SesionEstudio) => void;
  onActualizar?: () => void;
  expandido?: boolean;
  onToggleExpand?: (id: string) => void;
}

const TarjetaSesion: FC<TarjetaSesionProps> = ({
  sesion,
  onVerDetalles,
  onEliminar,
  onIniciar,
  onActualizar,
  expandido: expandidoProp = false,
  onToggleExpand,
}) => {
  const [nivelEmocion, setNivelEmocion] = useState(45);
  const expandido = expandidoProp;

  // Cargar el nivel de emoción guardado si existe
  useEffect(() => {
    if (sesion.nivelEmocion !== undefined) {
      setNivelEmocion(sesion.nivelEmocion);
    }
  }, [sesion]);

  const manejarClickSlider = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const nuevoValor = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setNivelEmocion(nuevoValor);

    // Guardar en Firestore
    if (sesion.id) {
      try {
        await actualizarSesionEstudio(sesion.id, {
          ...sesion,
          nivelEmocion: Math.round(nuevoValor)
        });
        if (onActualizar) onActualizar();
      } catch (error) {
        console.error('Error al actualizar nivel de emoción:', error);
      }
    }
  };

  const formatearTiempo = (minutos: number) => {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    const s = Math.floor((minutos - Math.floor(minutos)) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const mostrarDetalles =
    (sesion.notas ||
    sesion.estado === 'en-curso' ||
    sesion.estado === 'terminada') && expandido;

  // Determinar color según rendimiento (completación de la sesión)
  const claseTema = (() => {
    // Si está en curso, usar color especial
    if (sesion.estado === 'en-curso') return 'en-curso';
    
    // Si la sesión está terminada, usar el rendimiento basado en tiempo completado
    if (sesion.estado === 'terminada' && sesion.tiempoReal && sesion.tiempoTotal) {
      const porcentajeCompletado = (sesion.tiempoReal / sesion.tiempoTotal) * 100;
      
      // Excelente: completó 85% o más (verde)
      if (porcentajeCompletado >= 85) return 'sentimiento-bien';
      
      // Regular: completó entre 60% y 85% (amarillo/naranja)
      if (porcentajeCompletado >= 60) return 'sentimiento-normal';
      
      // Bajo rendimiento: completó menos del 60% (rojo)
      return 'sentimiento-mal';
    }
    
    // Para sesiones planificadas, usar color según tema
    const tema = sesion.tema?.toLowerCase() || sesion.titulo?.toLowerCase() || '';
    if (tema.includes('mat') || tema.includes('cálculo') || tema.includes('física') || tema.includes('química') || tema.includes('probabilidad')) return 'math';
    if (tema.includes('hist') || tema.includes('literatura') || tema.includes('english')) return 'history';
    if (tema.includes('dist') || tema.includes('sist') || tema.includes('datos') || tema.includes('redes') || tema.includes('estructuras')) return 'stats';
    return 'math';
  })();

  const manejarClick = (e: React.MouseEvent) => {
    // Si hicieron clic en un botón, no hacer nada
    if ((e.target as HTMLElement).closest('.btn-action')) {
      return;
    }
    
    // Toggle expandido usando la función del padre
    if (onToggleExpand && sesion.id) {
      onToggleExpand(sesion.id);
    }
  };

  // Obtener icono según nivel de emoción
  const obtenerIconoEmocion = (nivel: number) => {
    if (nivel < 33) return sadOutline;
    if (nivel < 66) return removeCircleOutline;
    return happyOutline;
  };

  // Calcular desempeño y obtener badge
  const obtenerBadgeDesempeno = () => {
    if (sesion.estado !== 'terminada' || !sesion.tiempoReal || !sesion.tiempoTotal) return null;
    
    const porcentajeDesempeno = (sesion.tiempoReal / sesion.tiempoTotal) * 100;
    
    if (porcentajeDesempeno >= 80) {
      return {
        texto: '¡Excelente!',
        icono: trophyOutline,
        porcentaje: Math.round(porcentajeDesempeno)
      };
    }
    
    if (porcentajeDesempeno >= 50) {
      return {
        texto: 'Bien',
        icono: thumbsUpOutline,
        porcentaje: Math.round(porcentajeDesempeno)
      };
    }
    
    return {
      texto: 'Puedes mejorar',
      icono: barbellOutline,
      porcentaje: Math.round(porcentajeDesempeno)
    };
  };

  const badgeDesempeno = obtenerBadgeDesempeno();

  return (
    <div
      className={`session-item ${claseTema} ${expandido ? 'expanded' : ''}`}
    >
      <div className="session-header">
        <div style={{ flex: 1 }} onClick={manejarClick}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="session-name">Sesión - {sesion.titulo}</div>
          </div>
          {badgeDesempeno && !expandido && (
            <div style={{
              fontSize: '12px',
              marginTop: '4px',
              opacity: 0.95,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <IonIcon icon={badgeDesempeno.icono} style={{ fontSize: '16px' }} />
              <span>{badgeDesempeno.texto} - {badgeDesempeno.porcentaje}% completado</span>
            </div>
          )}
        </div>
        <div className="session-actions">
          {sesion.estado === 'planificada' && onIniciar && (
            <button
              className="btn-action btn-start"
              onClick={(e) => {
                e.stopPropagation();
                onIniciar(sesion);
              }}
              title="Iniciar sesión"
            >
              <IonIcon icon={playCircleOutline} />
            </button>
          )}
          <button
            className="btn-action btn-delete"
            onClick={(e) => {
              e.stopPropagation();
              if (sesion.id) onEliminar(sesion.id);
            }}
            title="Eliminar sesión"
          >
            <IonIcon icon={trashOutline} />
          </button>
        </div>
      </div>

      {expandido && (
        <div className="session-detail" style={{
          animation: 'slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '2px solid rgba(255, 255, 255, 0.25)'
        }}>
          {/* Grid de información */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            marginBottom: '16px'
          }}>
            {/* Método */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '14px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                Método
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>
                {sesion.metodoEstudio}
              </div>
            </div>

            {/* Tiempo Planeado */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '14px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                Planeado
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>
                {sesion.tiempoTotal} <span style={{ fontSize: '12px', opacity: 0.8 }}>min</span>
              </div>
            </div>

            {/* Pausas */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '14px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                Pausas
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>
                {sesion.pausasPomodoro}
              </div>
            </div>

            {/* Duración Pausa */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '14px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                Duración
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>
                {sesion.tiempoPausa} <span style={{ fontSize: '12px', opacity: 0.8 }}>min</span>
              </div>
            </div>
          </div>

          {/* Tiempo Real (si existe) - ocupa todo el ancho */}
          {sesion.tiempoReal && badgeDesempeno && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)',
              backdropFilter: 'blur(10px)',
              padding: '16px',
              borderRadius: '14px',
              border: '2px solid rgba(255, 255, 255, 0.25)',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                    Tiempo Real
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 700 }}>
                    {sesion.tiempoReal} <span style={{ fontSize: '13px', opacity: 0.8 }}>min</span>
                  </div>
                </div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.25)',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '16px',
                fontWeight: 800,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <IonIcon icon={badgeDesempeno.icono} style={{ fontSize: '20px' }} />
                <span>{badgeDesempeno.porcentaje}%</span>
              </div>
            </div>
          )}

          {/* Descripción */}
          {(sesion.notas || sesion.descripcionMetodo) && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(10px)',
              padding: '16px',
              borderRadius: '14px',
              marginBottom: '16px',
              fontSize: '14px',
              lineHeight: '1.6',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ 
                fontWeight: 700, 
                marginBottom: '10px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                opacity: 0.9
              }}>
                <IonIcon icon={bookOutline} style={{ fontSize: '18px' }} />
                <span>Descripción</span>
              </div>
              <div style={{ opacity: 0.95 }}>
                {sesion.notas || sesion.descripcionMetodo}
              </div>
            </div>
          )}

          {/* Botón Ver más detalles */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onVerDetalles(sesion);
            }}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.15) 100%)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.25) 100%)';
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.15) 100%)';
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
            }}
          >
            <span>Ver Detalles Completos</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TarjetaSesion;
