import React, { FC } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
} from '@ionic/react';
import { happyOutline, sadOutline, removeCircleOutline, sparklesOutline, bodyOutline } from 'ionicons/icons';
import './Modales.css';
import './SentimientoStyles.css';

// ============================================
// CONSTANTE - Sentimientos disponibles
// ============================================
const SENTIMIENTOS = [
  { icono: happyOutline, label: 'Bien', color: '#6BCB77' },
  { icono: removeCircleOutline, label: 'Normal', color: '#FFD93D' },
  { icono: sadOutline, label: 'Mal', color: '#FF6B6B' },
];

// ============================================
// INTERFAZ - Props del componente
// ============================================
interface ModalSentimientoProps {
  isOpen: boolean;
  onDismiss: () => void;
  onSentimientoSelected: (sentimiento: string, color: string) => void;
}

// ============================================
// COMPONENTE - Modal para elegir sentimiento
// ============================================
const ModalSentimiento: FC<ModalSentimientoProps> = ({
  isOpen,
  onDismiss,
  onSentimientoSelected,
}) => {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDismiss} className="modal-estudio">
      <IonHeader className="sentimiento-header">
        <IonToolbar>
          <IonTitle>
            <IonIcon icon={sparklesOutline} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            ¿Cómo te sentiste?
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <p className="texto-intro">
          <IonIcon icon={bodyOutline} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Evaluá cómo te sentiste durante la sesión de estudio
        </p>

        {/* ========== BOTONES DE SENTIMIENTOS ========== */}
        <div className="opciones-sentimientos">
          {SENTIMIENTOS.map((sentimiento) => (
            <button
              key={sentimiento.label}
              className="sentimiento-btn"
              style={{
                borderColor: sentimiento.color,
                color: sentimiento.color,
              }}
              onClick={() =>
                onSentimientoSelected(
                  sentimiento.label,
                  sentimiento.color
                )
              }
            >
              <IonIcon icon={sentimiento.icono} className="emoji-grande" />
              <div className="label-sentimiento">{sentimiento.label}</div>
            </button>
          ))}
        </div>

        <p className="texto-ayuda">
          Tu feedback nos ayuda a mejorar tu experiencia de estudio
        </p>
      </IonContent>
    </IonModal>
  );
};

export default ModalSentimiento;