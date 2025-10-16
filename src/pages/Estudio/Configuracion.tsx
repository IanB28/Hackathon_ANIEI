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
} from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import './Componentes/Modales.css';

// ============================================
// INTERFAZ - Props del componente
// ============================================
interface ConfiguracionProps {
  isOpen: boolean;
  onDismiss: () => void;
}

// ============================================
// COMPONENTE - Modal de configuración
// ============================================
const Configuracion: FC<ConfiguracionProps> = ({ isOpen, onDismiss }) => {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDismiss} className="modal-estudio">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Configuración</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onDismiss}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <h3>Configuración de Sesiones de Estudio</h3>
        <p>Aquí puedes agregar opciones de configuración en el futuro:</p>
        <ul>
          <li>🎵 Sonidos de notificación</li>
          <li>🌙 Modo oscuro/claro</li>
          <li>📊 Estadísticas de sesiones</li>
          <li>🔔 Recordatorios</li>
        </ul>
      </IonContent>
    </IonModal>
  );
};

export default Configuracion;