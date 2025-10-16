import { IonPage, IonHeader, IonTitle, IonContent, IonButton } from "@ionic/react";
import "./Home.css"; // 🔹 Importas su CSS local

export default function Home() {
  return (
    <IonPage>
      <IonHeader>
        <IonTitle>Inicio</IonTitle>
      </IonHeader>
      <IonContent className="ion-padding home-content">
        <h2>¿Cómo te sientes hoy?</h2>
        <IonButton expand="block" color="primary">
          Registrar emoción
        </IonButton>
      </IonContent>
    </IonPage>
  );
}
