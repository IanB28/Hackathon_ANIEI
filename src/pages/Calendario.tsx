import React, { useState, useEffect } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonSegment, 
  IonSegmentButton, 
  IonLabel, 
  IonIcon, 
  IonCard, 
  IonCardContent, 
  IonButton, 
  IonModal, 
  IonHeader, 
  IonToolbar, 
  IonSpinner 
} from '@ionic/react';
import { 
  arrowBack, 
  arrowForward, 
  close, 
  barChartOutline, 
  calendarOutline  // ✅ Agregado import faltante
} from 'ionicons/icons';
import './Calendario.css';
import { 
  obtenerEntradasMes, 
  obtenerEntradaDia,
  obtenerEntradasSemana,
  obtenerEntradasUltimoMes,
  obtenerEntradasSemestre,
  CalendarEntry 
} from '../services/CalendarService';
import { MOOD_LEVELS } from '../services/moodService';
import { auth } from '../firebaseConfig';
import { useHistory, useLocation } from 'react-router-dom';

const Calendario: React.FC = () => {
  const history = useHistory();
  const location = useLocation<{ refreshCalendar?: boolean; year?: number; month?: number }>();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'W' | 'M' | 'P' | 'S'>('M');
  const [showChart, setShowChart] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null);
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [userReady, setUserReady] = useState(false);

  const viewModeLabels = {
    W: 'Semanal',
    M: 'Mensual',
    P: 'Parcial',
    S: 'Semestre'
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('👤 Auth state changed:', user?.uid || 'NO USER');
      setUserReady(!!user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userReady) {
      cargarEntradas();
    }
  }, [currentDate, viewMode, userReady]);

  useEffect(() => {
    if (location.state?.refreshCalendar && userReady) {
      console.log('🔄 Refrescando calendario después de registro');
      
      if (location.state.year !== undefined && location.state.month !== undefined) {
        setCurrentDate(new Date(location.state.year, location.state.month, 1));
      }
      
      cargarEntradas();
      
      history.replace({
        pathname: '/calendario',
        state: {}
      });
    }
  }, [location.state, userReady]);

  const cargarEntradas = async () => {
    if (!userReady) {
      console.log('⏳ Esperando autenticación...');
      return;
    }

    setLoading(true);
    try {
      let data: CalendarEntry[] = [];

      switch(viewMode) {
        case 'W':
          data = await obtenerEntradasSemana();
          break;
        case 'M':
          data = await obtenerEntradasMes(
            currentDate.getFullYear(),
            currentDate.getMonth()
          );
          break;
        case 'P':
          data = await obtenerEntradasUltimoMes();
          break;
        case 'S':
          data = await obtenerEntradasSemestre();
          break;
      }

      setEntries(data);
    } catch (error) {
      console.error('Error al cargar entradas:', error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const getEmotionImage = (moodLabel: string): string => {
    const imageMap: { [key: string]: string } = {
      'Muy incómodo': '/assets/emotions/muyincomodo.png',
      'Incómodo': '/assets/emotions/incomodo.png',
      'Levemente incómodo': '/assets/emotions/levementeincomodo.png',
      'Neutral': '/assets/emotions/neutral.png',
      'Levemente positivo': '/assets/emotions/levementepositivo.png',
      'Positivo': '/assets/emotions/positivo.png',
      'Muy positivo': '/assets/emotions/muypositivo.png'
    };

    return imageMap[moodLabel] || '/assets/emotions/neutral.png';
  };

  const getFilteredEntries = () => {
    return entries;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push({ day: 0, isEmpty: true });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ day, isEmpty: false });
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getCurrentMonthYear = () => {
    return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  const getEntryForDay = (day: number) => {
    return entries.find(e => e.fullDate.getDate() === day);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear();
  };

  const getSelectedDate = () => {
    if (!selectedDay) return '';
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay);
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handleDayClick = async (day: number) => {
    if (!userReady) {
      console.log('⏳ Usuario no autenticado aún');
      return;
    }

    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      console.log('❌ No se pueden registrar días futuros');
      return;
    }

    setSelectedDay(day);
    setLoading(true);
    
    try {
      const entry = await obtenerEntradaDia(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      
      if (entry) {
        console.log('✅ Día con registro, mostrando modal');
        setSelectedEntry(entry);
        setShowDayModal(true);
      } else {
        console.log('📝 Día sin registro, redirigiendo a Home');
        history.push({
          pathname: '/home',
          state: {
            selectedDate: selectedDate.toISOString(),
            isHistoricalEntry: selectedDate < today,
            year: currentDate.getFullYear(),
            month: currentDate.getMonth(),
            day: day
          }
        });
      }
    } catch (error) {
      console.error('Error al cargar entrada del día:', error);
      history.push({
        pathname: '/home',
        state: {
          selectedDate: selectedDate.toISOString(),
          isHistoricalEntry: selectedDate < today,
          year: currentDate.getFullYear(),
          month: currentDate.getMonth(),
          day: day
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const renderEmotionCircle = () => {
    if (!selectedEntry) return null;

    return (
      <div className="emotion-circle-container">
        <svg viewBox="0 0 200 200" className="emotion-circle-svg">
          <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
          <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />
          <circle cx="100" cy="100" r="50" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
          
          <defs>
            <radialGradient id="emotionGradient">
              <stop offset="0%" stopColor={selectedEntry.moodColor} stopOpacity="0.8" />
              <stop offset="50%" stopColor={selectedEntry.moodColor} stopOpacity="0.5" />
              <stop offset="100%" stopColor={selectedEntry.moodColor} stopOpacity="0.2" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="40" fill="url(#emotionGradient)" />
          <circle cx="100" cy="100" r="15" fill={selectedEntry.moodColor} />
          
          <image 
            href={getEmotionImage(selectedEntry.moodLabel)}
            x="50" 
            y="50" 
            width="100" 
            height="100"
            style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))' }}
          />
        </svg>
      </div>
    );
  };

  const renderChart = () => {
    const filteredEntries = getFilteredEntries();
    const chartHeight = 350;
    const chartWidth = 550;
    const padding = 60;

    if (filteredEntries.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.7)' }}>
          No hay datos para mostrar
        </div>
      );
    }

    return (
      <svg 
        viewBox={`0 0 ${chartWidth + padding * 2} ${chartHeight + padding * 2}`} 
        className="emotion-chart"
        preserveAspectRatio="xMidYMid meet"
      >
        <line 
          x1={padding} 
          y1={padding} 
          x2={padding} 
          y2={chartHeight + padding} 
          stroke="rgba(255, 255, 255, 0.3)" 
          strokeWidth="2"
        />
        
        {MOOD_LEVELS.slice().reverse().map((level, index) => {
          const y = padding + (chartHeight / 6) * index;
          return (
            <g key={level.value}>
              <line 
                x1={padding} 
                y1={y} 
                x2={chartWidth + padding} 
                y2={y} 
                stroke="rgba(255, 255, 255, 0.1)" 
                strokeWidth="1" 
                strokeDasharray="5,5"
              />
              <image 
                href={getEmotionImage(level.label)}
                x={padding - 35}
                y={y - 15}
                width="30"
                height="30"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}
              />
            </g>
          );
        })}
        
        <line 
          x1={padding} 
          y1={chartHeight + padding} 
          x2={chartWidth + padding} 
          y2={chartHeight + padding} 
          stroke="rgba(255, 255, 255, 0.3)" 
          strokeWidth="2"
        />

        {filteredEntries.length > 1 && (
          <polyline
            points={filteredEntries.map((entry, index) => {
              const x = padding + (chartWidth / (filteredEntries.length - 1 || 1)) * index;
              const y = padding + (chartHeight - (entry.moodValue * chartHeight / 6));
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        )}

        {filteredEntries.map((entry, index) => {
          const x = padding + (chartWidth / (filteredEntries.length - 1 || 1)) * index;
          const y = padding + (chartHeight - (entry.moodValue * chartHeight / 6));
          
          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r="10"
                fill={entry.moodColor}
                stroke="#fff"
                strokeWidth="3"
              />
              
              <text
                x={x}
                y={chartHeight + padding + 25}
                fill="rgba(255, 255, 255, 0.7)"
                fontSize="12"
                textAnchor="middle"
                fontWeight="600"
              >
                {entry.fullDate.getDate()}/{entry.fullDate.getMonth() + 1}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <IonPage>
      <IonContent fullscreen className="calendar-content">
        <div className="calendar-title">Calendario Emocional</div>

        <div className="calendar-header">
          <IonButton fill="clear" onClick={goToPreviousMonth} className="nav-button">
            <IonIcon icon={arrowBack} />
          </IonButton>
          <h2 className="current-month">{getCurrentMonthYear()}</h2>
          <IonButton fill="clear" onClick={goToNextMonth} className="nav-button">
            <IonIcon icon={arrowForward} />
          </IonButton>
        </div>

        <div className="view-selector">
          <IonSegment value={viewMode} onIonChange={(e) => setViewMode(e.detail.value as any)}>
            <IonSegmentButton value="W">
              <IonLabel>S</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="M">
              <IonLabel>M</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="P">
              <IonLabel>P</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="S">
              <IonLabel>S</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>
        <div className="view-mode-label">{viewModeLabels[viewMode]}</div>

        {/* ✅ Stats section ANTES del calendario */}
        <div className="stats-section">
          <div className="stat-item">
            <IonIcon icon={calendarOutline} className="stat-icon" />
            <div>
              <div className="stat-value">{entries.length}</div>
              <div className="stat-label">Días registrados</div>
            </div>
          </div>
          <IonButton 
            className="chart-button-circle"
            onClick={() => setShowChart(true)}
          >
            <IonIcon icon={barChartOutline} />
          </IonButton>
        </div>

        {/* ✅ Calendario DESPUÉS de stats */}
        <IonCard className="calendar-card">
          <IonCardContent>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <IonSpinner />
              </div>
            ) : (
              <>
                <div className="days-header">
                  <div>L</div>
                  <div>M</div>
                  <div>X</div>
                  <div>J</div>
                  <div>V</div>
                  <div>S</div>
                  <div>D</div>
                </div>

                <div className="calendar-grid">
                  {generateCalendarDays().map((dayData, index) => {
                    if (dayData.isEmpty) {
                      return <div key={index} />;
                    }

                    const entry = getEntryForDay(dayData.day);
                    const todayClass = isToday(dayData.day) ? 'today' : '';
                    const hasEntryClass = entry ? 'has-entry' : '';

                    return (
                      <div key={index} className="calendar-day-wrapper">
                        <div className="day-number-label">{dayData.day}</div>
                        <div
                          className={`calendar-day-circle ${todayClass} ${hasEntryClass}`}
                          style={{
                            backgroundColor: entry ? entry.moodColor : 'rgba(48, 73, 112, 0.3)',
                          }}
                          onClick={() => handleDayClick(dayData.day)}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="legend">
                  {MOOD_LEVELS.slice(0, 3).map(level => (
                    <div key={level.value} className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: level.color }} />
                      <span>{level.label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </IonCardContent>
        </IonCard>

        <div className="bottom-actions">
          <IonButton 
            expand="block" 
            className="register-button" 
            onClick={() => {
              const today = new Date();
              history.push({
                pathname: '/home',
                state: {
                  selectedDate: today.toISOString(),
                  isHistoricalEntry: false
                }
              });
            }}
          >
            📅 Registrar Hoy
          </IonButton>
        </div>

        {/* Modal de Día Seleccionado */}
        <IonModal isOpen={showDayModal} onDidDismiss={() => setShowDayModal(false)} className="day-modal">
          <IonHeader>
            <IonToolbar>
              <IonButton 
                slot="end" 
                fill="clear" 
                onClick={() => setShowDayModal(false)}
                className="day-modal-close-button"
              >
                <IonIcon slot="icon-only" icon={close} />
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="day-modal-content">
            <div className="day-modal-title-main">
              Calendario Emocional
            </div>

            <div className="day-modal-info-card">
              <h3>Registro Diario</h3>
              <p>{getSelectedDate()}</p>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <IonSpinner />
              </div>
            ) : selectedEntry ? (
              <>
                <div className="day-modal-emotion-container">
                  {renderEmotionCircle()}
                  <div className="day-modal-emotion-label">
                    {selectedEntry.moodLabel}
                  </div>
                </div>

                <div className="momentary-emotions-section">
                  <div className="momentary-emotions-title">EMOCIONES DEL DÍA</div>
                  <div className="momentary-emotions-list">
                    {selectedEntry.momentaryEmotions.length > 0 ? (
                      selectedEntry.momentaryEmotions.map((emotion, index) => (
                        <div key={index} className="momentary-emotion-chip">
                          {emotion}
                        </div>
                      ))
                    ) : (
                      <div className="no-entries-text">No hay emociones registradas</div>
                    )}
                  </div>
                </div>

                <div className="momentary-emotions-section">
                  <div className="momentary-emotions-title">REGISTROS DEL DÍA ({selectedEntry.moodEntries.length})</div>
                  {selectedEntry.moodEntries.map((moodEntry, index) => (
                    <div key={index} className="day-modal-stat-item">
                      <div className="day-modal-stat-icon" style={{ backgroundColor: moodEntry.moodColor }}>
                        <img 
                          src={getEmotionImage(moodEntry.moodLabel)}
                          alt={moodEntry.moodLabel}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
                          }}
                        />
                      </div>
                      <div className="day-modal-stat-info">
                        {moodEntry.esDiaActual && (
                          <div className="day-modal-stat-value">{moodEntry.hora}</div>
                        )}
                        <div className="day-modal-stat-label">
                          {moodEntry.moodLabel}
                          {moodEntry.esDiaActual && ` - ${moodEntry.momentoDia}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.7)' }}>
                No hay registros para este día
              </div>
            )}
          </IonContent>
        </IonModal>

        {/* Modal de Gráfica */}
        <IonModal isOpen={showChart} onDidDismiss={() => setShowChart(false)} className="chart-modal">
          <IonHeader>
            <IonToolbar>
              <IonButton 
                slot="end" 
                fill="clear" 
                onClick={() => setShowChart(false)}
                className="chart-modal-close-button"
              >
                <IonIcon slot="icon-only" icon={close} />
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="chart-content">
            <div className="chart-title">
              Gráfica de Emociones
            </div>

            <div className="chart-info">
              <h3>Tendencia Emocional - {viewModeLabels[viewMode]}</h3>
              <p>Mostrando {getFilteredEntries().length} registros</p>
            </div>
            
            <div className="chart-container">
              {renderChart()}
            </div>

            <div className="chart-stats">
              {MOOD_LEVELS.map(level => {
                const count = getFilteredEntries().filter(e => e.moodValue === level.value).length;
                if (count === 0) return null;
                
                return (
                  <div key={level.value} className="chart-stat-item">
                    <div className="chart-stat-icon" style={{ backgroundColor: level.color }}>
                      <img 
                        src={getEmotionImage(level.label)}
                        alt={level.label}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'contain',
                          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
                        }}
                      />
                    </div>
                    <div className="chart-stat-info">
                      <div className="chart-stat-value">{count}</div>
                      <div className="chart-stat-label">Días con estado: {level.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Calendario;
