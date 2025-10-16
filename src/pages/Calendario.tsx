import React, { useState } from 'react';
import { IonContent, IonPage, IonSegment, IonSegmentButton, IonLabel, IonIcon, IonCard, IonCardContent, IonButton, IonModal, IonHeader, IonToolbar } from '@ionic/react';
import { arrowBack, arrowForward, calendarOutline, close, barChartOutline } from 'ionicons/icons';
import './Calendario.css';

interface EmotionEntry {
  date: string;
  emotion: 'bien' | 'neutral' | 'mal';
  fullDate: Date;
}

const Calendario: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'W' | 'M' | 'P' | 'S'>('M');
  const [showChart, setShowChart] = useState(false);
  const [entries, setEntries] = useState<EmotionEntry[]>([
    { date: '1', emotion: 'bien', fullDate: new Date(2025, 9, 1) },
    { date: '2', emotion: 'neutral', fullDate: new Date(2025, 9, 2) },
    { date: '5', emotion: 'mal', fullDate: new Date(2025, 9, 5) },
    { date: '8', emotion: 'bien', fullDate: new Date(2025, 9, 8) },
    { date: '12', emotion: 'neutral', fullDate: new Date(2025, 9, 12) },
    { date: '15', emotion: 'bien', fullDate: new Date(2025, 9, 15) },
    { date: '18', emotion: 'mal', fullDate: new Date(2025, 9, 18) },
    { date: '22', emotion: 'neutral', fullDate: new Date(2025, 9, 22) },
    { date: '25', emotion: 'bien', fullDate: new Date(2025, 9, 25) },
    { date: '28', emotion: 'mal', fullDate: new Date(2025, 9, 28) },
  ]);

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

  const getEmotionColor = (emotion: string) => {
    switch(emotion) {
      case 'bien': return '#4CAF50';
      case 'neutral': return '#FFC107';
      case 'mal': return '#F44336';
      default: return '#555';
    }
  };

  const getEmotionValue = (emotion: string) => {
    switch(emotion) {
      case 'bien': return 3;
      case 'neutral': return 2;
      case 'mal': return 1;
      default: return 0;
    }
  };

  const getFilteredEntries = () => {
    const now = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    switch(viewMode) {
      case 'W':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return entries.filter(e => e.fullDate >= weekAgo && e.fullDate <= now);
      case 'M':
        return entries.filter(e => 
          e.fullDate.getMonth() === currentMonth && 
          e.fullDate.getFullYear() === currentYear
        );
      case 'P':
        const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        return entries.filter(e => e.fullDate >= twoMonthsAgo && e.fullDate <= now);
      case 'S':
        const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        return entries.filter(e => e.fullDate >= sixMonthsAgo && e.fullDate <= now);
      default:
        return entries;
    }
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
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return entries.find(e => {
      const entryDate = e.fullDate;
      return entryDate.getDate() === day &&
             entryDate.getMonth() === month &&
             entryDate.getFullYear() === year;
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear();
  };

  const renderChart = () => {
    const filteredEntries = getFilteredEntries();
    const chartHeight = 350;
    const chartWidth = 550;
    const padding = 60;

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
        
        <text x={padding - 40} y={padding + 10} fill="#4CAF50" fontSize="14" fontWeight="bold">Bien</text>
        <text x={padding - 50} y={chartHeight / 2 + padding + 5} fill="#FFC107" fontSize="14" fontWeight="bold">Neutral</text>
        <text x={padding - 30} y={chartHeight + padding + 5} fill="#F44336" fontSize="14" fontWeight="bold">Mal</text>
        
        <line x1={padding} y1={padding} x2={chartWidth + padding} y2={padding} stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" strokeDasharray="5,5"/>
        <line x1={padding} y1={chartHeight / 2 + padding} x2={chartWidth + padding} y2={chartHeight / 2 + padding} stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" strokeDasharray="5,5"/>
        <line x1={padding} y1={chartHeight + padding} x2={chartWidth + padding} y2={chartHeight + padding} stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" strokeDasharray="5,5"/>
        
        <line 
          x1={padding} 
          y1={chartHeight + padding} 
          x2={chartWidth + padding} 
          y2={chartHeight + padding} 
          stroke="rgba(255, 255, 255, 0.3)" 
          strokeWidth="2"
        />

        {filteredEntries.map((entry, index) => {
          const x = padding + (chartWidth / (filteredEntries.length - 1 || 1)) * index;
          const emotionValue = getEmotionValue(entry.emotion);
          const y = chartHeight + padding - ((emotionValue - 1) * chartHeight / 2);
          
          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r="10"
                fill={getEmotionColor(entry.emotion)}
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
        <div className="calendar-title">
          Calendario Emocional
        </div>

        <div className="calendar-header">
          <IonButton fill="clear" className="nav-button" onClick={goToPreviousMonth}>
            <IonIcon icon={arrowBack} />
          </IonButton>
          <h2 className="current-month">{getCurrentMonthYear()}</h2>
          <IonButton fill="clear" className="nav-button" onClick={goToNextMonth}>
            <IonIcon icon={arrowForward} />
          </IonButton>
        </div>

        <IonSegment value={viewMode} onIonChange={e => setViewMode(e.detail.value as any)} className="view-selector">
          <IonSegmentButton value="W">
            <IonLabel>W</IonLabel>
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

        <div className="view-mode-label">
          {viewModeLabels[viewMode]}
        </div>

        <div className="stats-section">
          <div className="stat-item">
            <IonIcon icon={calendarOutline} className="stat-icon" />
            <div>
              <div className="stat-value">{getFilteredEntries().length}</div>
              <div className="stat-label">Entradas totales</div>
            </div>
          </div>
          <IonButton 
            fill="solid" 
            shape="round"
            className="chart-button-circle" 
            onClick={() => setShowChart(true)}
          >
            <IonIcon slot="icon-only" icon={barChartOutline} />
          </IonButton>
        </div>

        <IonCard className="calendar-card">
          <IonCardContent>
            <div className="days-header">
              <div>L</div>
              <div>M</div>
              <div>M</div>
              <div>J</div>
              <div>V</div>
              <div>S</div>
              <div>D</div>
            </div>
            
            <div className="calendar-grid">
              {generateCalendarDays().map((dayObj, index) => {
                if (dayObj.isEmpty) {
                  return <div key={`empty-${index}`} className="calendar-day-wrapper"></div>;
                }
                
                const entry = getEntryForDay(dayObj.day);
                const today = isToday(dayObj.day);
                
                return (
                  <div key={`day-${dayObj.day}`} className="calendar-day-wrapper">
                    <div className="day-number-label">{dayObj.day}</div>
                    <div 
                      className={`calendar-day-circle ${today ? 'today' : ''} ${entry ? 'has-entry' : ''}`}
                      style={{ 
                        backgroundColor: entry ? getEmotionColor(entry.emotion) : 'rgba(58, 63, 68, 0.3)',
                        border: today ? '3px solid #00A8FC' : 'none'
                      }}
                    >
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="legend">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#4CAF50' }}></div>
                <span>Bien</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#FFC107' }}></div>
                <span>Neutral</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#F44336' }}></div>
                <span>Mal</span>
              </div>
            </div>
          </IonCardContent>
        </IonCard>

        <div className="bottom-actions">
          <IonButton expand="block" className="register-button">
            📅 Registrar Día
          </IonButton>
        </div>

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
              <div className="chart-stat-item">
                <div className="chart-stat-icon" style={{ backgroundColor: '#4CAF50' }}>😊</div>
                <div className="chart-stat-info">
                  <div className="chart-stat-value">
                    {getFilteredEntries().filter(e => e.emotion === 'bien').length}
                  </div>
                  <div className="chart-stat-label">Días te sentiste bien</div>
                </div>
              </div>
              <div className="chart-stat-item">
                <div className="chart-stat-icon" style={{ backgroundColor: '#FFC107' }}>😐</div>
                <div className="chart-stat-info">
                  <div className="chart-stat-value">
                    {getFilteredEntries().filter(e => e.emotion === 'neutral').length}
                  </div>
                  <div className="chart-stat-label">Días te sentiste neutral</div>
                </div>
              </div>
              <div className="chart-stat-item">
                <div className="chart-stat-icon" style={{ backgroundColor: '#F44336' }}>😢</div>
                <div className="chart-stat-info">
                  <div className="chart-stat-value">
                    {getFilteredEntries().filter(e => e.emotion === 'mal').length}
                  </div>
                  <div className="chart-stat-label">Días te sentiste mal</div>
                </div>
              </div>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Calendario;
