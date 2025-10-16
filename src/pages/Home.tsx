import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonToast,
} from "@ionic/react";
import { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { arrowForwardOutline, personCircleOutline, calendarOutline } from "ionicons/icons";
import "./Home.css";

interface LocationState {
  selectedDate?: string;
  isHistoricalEntry?: boolean;
  year?: number;
  month?: number;
  day?: number;
}

export default function Home() {
  const emotionStates = [
    { 
      id: 0, 
      label: "Muy incómodo", 
      image: "/assets/emotions/muyincomodo.png",
      color: "#8B5CF6"
    },
    { 
      id: 1, 
      label: "Incómodo", 
      image: "/assets/emotions/incomodo.png",
      color: "#6366F1"
    },
    { 
      id: 2, 
      label: "Levemente incómodo", 
      image: "/assets/emotions/levementeincomodo.png",
      color: "#3B82F6"
    },
    { 
      id: 3, 
      label: "Neutral", 
      image: "/assets/emotions/neutral.png",
      color: "#10B981"
    },
    { 
      id: 4, 
      label: "Levemente positivo", 
      image: "/assets/emotions/levementepositivo.png",
      color: "#F59E0B"
    },
    { 
      id: 5, 
      label: "Positivo", 
      image: "/assets/emotions/positivo.png",
      color: "#F97316"
    },
    { 
      id: 6, 
      label: "Muy positivo", 
      image: "/assets/emotions/muypositivo.png",
      color: "#EF4444"
    }
  ];

  const [sliderValue, setSliderValue] = useState(3);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isHistoricalEntry, setIsHistoricalEntry] = useState(false);
  const [calendarContext, setCalendarContext] = useState<{
    year?: number;
    month?: number;
    day?: number;
  }>({});
  
  const history = useHistory();
  const location = useLocation<LocationState>();

  const currentEmotion = emotionStates[sliderValue];

  // Resetear estado cuando NO hay datos del calendario
  useEffect(() => {
    const hasCalendarData = location.state?.selectedDate || 
                           location.state?.year !== undefined || 
                           location.state?.month !== undefined;
    
    if (!hasCalendarData) {
      console.log('🔄 Reseteando estado - navegación desde tabs');
      setSelectedDate(new Date());
      setIsHistoricalEntry(false);
      setCalendarContext({});
    }
  }, [location.pathname]);

  // Cargar fecha seleccionada desde el calendario
  useEffect(() => {
    if (location.state?.selectedDate) {
      const date = new Date(location.state.selectedDate);
      setSelectedDate(date);
      setIsHistoricalEntry(location.state.isHistoricalEntry || false);
      
      if (location.state.year !== undefined && 
          location.state.month !== undefined && 
          location.state.day !== undefined) {
        setCalendarContext({
          year: location.state.year,
          month: location.state.month,
          day: location.state.day
        });
      }
      
      setShowToast(true);
    }
  }, [location.state?.selectedDate]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    if (newValue !== sliderValue) {
      setIsTransitioning(true);
      setTimeout(() => {
        setSliderValue(newValue);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const handleNavigateToMoodTracker = () => {
    history.push({
      pathname: "/moodtracker",
      state: {
        emotion: currentEmotion.label,
        emotionId: currentEmotion.id,
        emotionColor: currentEmotion.color,
        emotionImage: currentEmotion.image,
        selectedDate: selectedDate.toISOString(),
        isHistoricalEntry: isHistoricalEntry,
        calendarContext: calendarContext
      }
    });
  };

  const handleNavigateToProfile = () => {
    history.push("/perfil");
  };

  const formatSelectedDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(selectedDate);
    compareDate.setHours(0, 0, 0, 0);

    if (compareDate.getTime() === today.getTime()) {
      return "Hoy";
    }

    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    return `${dayNames[selectedDate.getDay()]}, ${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]}`;
  };

  return (
    <IonPage>
      <IonContent className="main-content">
        <div className="content-wrapper">
          <IonButton 
            fill="clear" 
            className="profile-button-floating"
            onClick={handleNavigateToProfile}
          >
            <IonIcon icon={personCircleOutline} slot="icon-only" />
          </IonButton>

          <div className="page-header">
            <h1 className="page-title">Estado emocional</h1>
            <p className="page-subtitle">
              {isHistoricalEntry 
                ? `¿Cómo te sentiste el ${formatSelectedDate()}?`
                : `¿Cómo te sientes el día de hoy?`
              }
            </p>
            
            {isHistoricalEntry && (
              <div className="date-indicator">
                <IonIcon icon={calendarOutline} />
                <span>{formatSelectedDate()}</span>
              </div>
            )}
          </div>

          <div className="emotion-card">
            <div className="brain-container">
              <img 
                src={currentEmotion.image}
                alt={currentEmotion.label}
                className={`brain-image ${isTransitioning ? 'fade-out' : 'fade-in'}`}
                key={currentEmotion.id}
              />
            </div>

            <div className="emotion-label-container">
              <p className="emotion-label" style={{ color: currentEmotion.color }}>
                {currentEmotion.label}
              </p>
            </div>

            <div className="slider-section">
              <input
                type="range"
                min="0"
                max="6"
                value={sliderValue}
                onChange={handleSliderChange}
                className="emotion-slider"
                style={{
                  background: `linear-gradient(90deg, 
                    #8B5CF6 0%, 
                    #6366F1 16.67%, 
                    #3B82F6 33.33%, 
                    #10B981 50%, 
                    #F59E0B 66.67%, 
                    #F97316 83.33%, 
                    #EF4444 100%)`
                }}
              />
              <div className="slider-labels">
                <span className="slider-label-start">Incómodo</span>
                <span className="slider-label-end">Positivo</span>
              </div>
            </div>

            <div className="button-section">
              <IonButton 
                expand="block" 
                className="journal-button"
                onClick={handleNavigateToMoodTracker}
              >
                <span>Siguiente</span>
                <IonIcon icon={arrowForwardOutline} slot="end" />
              </IonButton>
            </div>
          </div>
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={isHistoricalEntry 
            ? `Registrando estado para: ${formatSelectedDate()}`
            : "Registrando estado de hoy"
          }
          duration={2000}
          position="top"
          color="primary"
        />
      </IonContent>
    </IonPage>
  );
}
