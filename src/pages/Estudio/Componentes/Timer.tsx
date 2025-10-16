import React, { FC } from 'react';

// ============================================
// INTERFAZ - Props del componente Timer
// ============================================
interface TimerProps {
  segundosRestantes: number;
  estoyEnPausa: boolean;
  tiempoPausa: number;
  modo?: 'pomodoro' | 'flowtime' | 'bloque';
  tiempoTranscurrido?: number;
}

// ============================================
// COMPONENTE - Timer reutilizable
// ============================================
const Timer: FC<TimerProps> = ({ 
  segundosRestantes, 
  estoyEnPausa, 
  tiempoPausa,
  modo = 'pomodoro',
  tiempoTranscurrido = 0
}) => {
  // ============================================
  // FUNCIÓN - Formatear segundos a HH:MM:SS
  // ============================================
  const formatearTiempo = (segundos: number) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    
    if (horas > 0) {
      return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    }
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  // ============================================
  // RETORNO - Mostrar timer según modo
  // ============================================
  if (estoyEnPausa) {
    return (
      <div className="timer-grande" style={{ 
        background: 'rgba(48, 73, 112, 0.3)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
      }}>
        <h1 className="timer-display" style={{ 
          color: '#FFFFFF',
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
        }}>⏸️ PAUSA</h1>
        <p className="timer-label">Tiempo para descansar: {tiempoPausa} minutos</p>
      </div>
    );
  }

  // ============================================
  // MODO FLOWTIME - Muestra tiempo transcurrido
  // ============================================
  if (modo === 'flowtime') {
    return (
      <div className="timer-grande" style={{ 
        background: 'rgba(48, 73, 112, 0.3)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '8px', fontWeight: 'bold', letterSpacing: '1px' }}>
          🌊 MODO FLOWTIME
        </div>
        <h1 className="timer-display" style={{ 
          color: '#FFFFFF',
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
        }}>
          {formatearTiempo(tiempoTranscurrido)}
        </h1>
        <p className="timer-label">Tiempo de Estudio Transcurrido</p>
        <p style={{ fontSize: '12px', marginTop: '8px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500 }}>
          Toma una pausa cuando lo necesites
        </p>
      </div>
    );
  }

  // ============================================
  // MODO BLOQUE - Similar a Pomodoro
  // ============================================
  if (modo === 'bloque') {
    return (
      <div className="timer-grande" style={{ 
        background: 'rgba(48, 73, 112, 0.3)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '8px', fontWeight: 'bold', letterSpacing: '1px' }}>
          📦 BLOQUE DE TIEMPO
        </div>
        <h1 className="timer-display" style={{ 
          color: '#FFFFFF',
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
        }}>
          {formatearTiempo(segundosRestantes)}
        </h1>
        <p className="timer-label">Tiempo Restante del Bloque</p>
      </div>
    );
  }

  // ============================================
  // MODO POMODORO - Por defecto
  // ============================================
  return (
    <div className="timer-grande" style={{ 
      background: 'rgba(48, 73, 112, 0.3)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
    }}>
      <div style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '8px', fontWeight: 'bold', letterSpacing: '1px' }}>
        🍅 MODO POMODORO
      </div>
      <h1 className="timer-display" style={{ 
        color: '#FFFFFF',
        textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
      }}>
        {formatearTiempo(segundosRestantes)}
      </h1>
      <p className="timer-label">Tiempo Restante</p>
    </div>
  );
};

export default Timer;