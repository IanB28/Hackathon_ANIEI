import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton,
  IonTextarea,
  IonText,
  IonIcon,
  IonAvatar,
} from "@ionic/react";
import { useState } from "react";
import { settingsOutline, checkmarkCircleOutline, sendOutline } from "ionicons/icons";
import "./Journaling.css";

export default function Journaling() {
  const [userInput, setUserInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (event: CustomEvent) => {
    setUserInput(event.detail.value);
  };

  const handleSendClick = () => {
    if (userInput.trim() === "") return;

    setIsLoading(true);
    
    setTimeout(() => {
      setAiResponse("Gracias por compartir cómo te sientes. Recuerda que cada día es una nueva oportunidad para crecer y ser feliz. Estoy aquí para apoyarte en tu camino.");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="minimal-toolbar">
          <div className="header-content">
            <div className="user-section">
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
      <IonContent className="journaling-content">
        <div className="content-wrapper">
          <div className="journaling-card">
            <div className="header-section">
              <h1 className="card-title">Diario Personal</h1>
              <p className="card-subtitle">
                Escribe tus pensamientos, este es tu espacio seguro
              </p>
            </div>

            <div className="input-section">
              <IonTextarea
                placeholder="Cuéntame cómo fue tu día..."
                value={userInput}
                onIonChange={handleInputChange}
                className="journaling-textarea"
                rows={8}
              />
              <div className="textarea-helper">
                <IonText className="char-count">
                  {userInput.length} caracteres
                </IonText>
              </div>
            </div>

            <div className="button-section">
              <IonButton 
                expand="block" 
                className="send-button" 
                onClick={handleSendClick}
                disabled={isLoading || userInput.trim() === ""}
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner"></div>
                    <span>Analizando...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar reflexión</span>
                    <IonIcon icon={sendOutline} slot="end" />
                  </>
                )}
              </IonButton>
            </div>

            {aiResponse && (
              <div className="ai-response-container">
                <div className="response-header">
                  <IonIcon icon={checkmarkCircleOutline} className="response-icon" />
                  <IonText className="response-title">Respuesta de apoyo</IonText>
                </div>
                <IonText className="ai-response">{aiResponse}</IonText>
              </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
