import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton,
  IonIcon,
  IonAvatar,
} from "@ionic/react";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { settingsOutline, arrowForwardOutline } from "ionicons/icons";
import "./Home.css";

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
  const history = useHistory();

  const currentEmotion = emotionStates[sliderValue];

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
        emotionImage: currentEmotion.image
      }
    });
  };

  // ✅ Nueva función para navegar al perfil
  const handleNavigateToProfile = () => {
    history.push("/perfil");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="minimal-toolbar">
          <div className="header-content">
            <div className="user-section" onClick={handleNavigateToProfile} style={{ cursor: 'pointer' }}>
              <IonAvatar className="user-avatar">
                <img src="https://ionicframework.com/docs/img/demos/avatar.svg" alt="User" />
              </IonAvatar>
              <span className="user-name">User</span>
            </div>
            <IonButton fill="clear" className="settings-button">
              <IonIcon icon={settingsOutline} />
            </IonButton>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent className="main-content">
        <div className="content-wrapper">
          <div className="page-header">
            <h1 className="page-title">Estado emocional</h1>
            <p className="page-subtitle">¿Cómo te sientes el día de hoy?</p>
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
      </IonContent>
    </IonPage>
  );
}
