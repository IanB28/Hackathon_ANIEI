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
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonText,
} from '@ionic/react';
import { 
  closeOutline, 
  bulbOutline, 
  documentTextOutline, 
  timeOutline, 
  cafeOutline, 
  clipboardOutline 
} from 'ionicons/icons';
import './Modales.css';
import './FormularioStyles.css';

// ============================================
// CONSTANTE - Métodos de estudio disponibles
// ============================================
const METODOS_ESTUDIO = {
  pomodoro: {
    nombre: 'Pomodoro',
    descripcion: '25 min de enfoque + pausas. Ideal para mantener concentración.',
    tiempoDefecto: 25,
    recomendacionesDefecto: [
      'Bebe agua',
      'Estira los brazos',
      'Respira profundo',
      'Mira a la distancia',
      'Camina un poco',
      'Toma aire fresco',
      'Relaja los ojos',
      'Come un snack saludable',
      'Estira las piernas',
      'Medita',
      'Escucha música',
      'Toma un café'
    ]
  },
  flowtime: {
    nombre: 'Flowtime',
    descripcion: 'Trabaja sin interrupciones hasta que sientas que necesitas una pausa.',
    tiempoDefecto: 50,
    recomendacionesDefecto: [
      'Camina un poco',
      'Toma aire fresco',
      'Relaja los ojos',
      'Estira las piernas',
      'Bebe agua',
      'Come algo ligero',
      'Salta un poco',
      'Mira por la ventana',
      'Respira profundo',
      'Muévete',
      'Toma un descanso visual',
      'Estira el cuello'
    ]
  },
  bloque: {
    nombre: 'Bloque de Tiempo',
    descripcion: 'Divide el tiempo en bloques de estudio intenso.',
    tiempoDefecto: 45,
    recomendacionesDefecto: [
      'Respira profundo',
      'Muévete un poco',
      'Toma un snack',
      'Relájate',
      'Bebe agua',
      'Camina alrededor',
      'Estira los brazos',
      'Mira a la distancia',
      'Toma aire fresco',
      'Come algo',
      'Medita',
      'Descansa los ojos'
    ]
  },
};

// ============================================
// INTERFAZ - Props del componente
// ============================================
interface FormularioSesionProps {
  isOpen: boolean;
  onDismiss: () => void;
  onGuardar: () => void;
  formulario: {
    titulo: string;
    tema: string;
    metodoEstudio: string;
    tiempoTotal: string;
    tiempoPausa: string;
    pausasPomodoro: string;
    notas: string;
  };
  onFormularioChange: (campo: string, valor: string) => void;
}

// ============================================
// COMPONENTE - Formulario para crear sesión
// ============================================
const FormularioSesion: FC<FormularioSesionProps> = ({
  isOpen,
  onDismiss,
  onGuardar,
  formulario,
  onFormularioChange,
}) => {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDismiss} className="modal-estudio formulario-modal">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Nueva Sesión de Estudio</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onDismiss}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ position: 'relative', zIndex: 1 }}>
        <div className="form-container">
          {/* ========== SECCIÓN: INFORMACIÓN BÁSICA ========== */}
          <div className="form-section">
            <h3 className="form-section-title">
              <IonIcon icon={documentTextOutline} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Información Básica
            </h3>
            
            <IonItem lines="none">
              <IonLabel position="stacked">Título *</IonLabel>
              <IonInput
                value={formulario.titulo}
                placeholder="Ej: Sesión de Matemáticas"
                onIonInput={(e) =>
                  onFormularioChange('titulo', e.detail.value || '')
                }
              />
            </IonItem>

            <IonItem lines="none">
              <IonLabel position="stacked">Tema *</IonLabel>
              <IonInput
                value={formulario.tema}
                placeholder="Ej: Derivadas e integrales"
                onIonInput={(e) => onFormularioChange('tema', e.detail.value || '')}
              />
            </IonItem>
          </div>

          {/* ========== SECCIÓN: MÉTODO Y TIEMPO ========== */}
          <div className="form-section">
            <h3 className="form-section-title">
              <IonIcon icon={timeOutline} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Configuración de Tiempo
            </h3>
            
            <IonItem lines="none">
              <IonLabel position="stacked">Método de Estudio *</IonLabel>
              <IonSelect
                value={formulario.metodoEstudio}
                onIonChange={(e) =>
                  onFormularioChange('metodoEstudio', e.detail.value)
                }
              >
                <IonSelectOption value="pomodoro">Pomodoro</IonSelectOption>
                <IonSelectOption value="flowtime">Flowtime</IonSelectOption>
                <IonSelectOption value="bloque">Bloque de Tiempo</IonSelectOption>
              </IonSelect>
            </IonItem>

            {/* ========== DESCRIPCIÓN DEL MÉTODO ========== */}
            <div className="metodo-descripcion-card">
              <div className="metodo-icon">
                <IonIcon icon={bulbOutline} />
              </div>
              <div>
                <strong>
                  {
                    METODOS_ESTUDIO[
                      formulario.metodoEstudio as keyof typeof METODOS_ESTUDIO
                    ].nombre
                  }
                </strong>
                <p>
                  {
                    METODOS_ESTUDIO[
                      formulario.metodoEstudio as keyof typeof METODOS_ESTUDIO
                    ].descripcion
                  }
                </p>
              </div>
            </div>

            <IonItem lines="none">
              <IonLabel position="stacked">Tiempo Total (minutos) *</IonLabel>
              <IonInput
                type="number"
                value={formulario.tiempoTotal}
                placeholder="Ej: 45"
                min="15"
                max="300"
                clearInput={true}
                onIonInput={(e) =>
                  onFormularioChange('tiempoTotal', e.detail.value || '')
                }
              />
            </IonItem>
          </div>

          {/* ========== SECCIÓN: PAUSAS ========== */}
          <div className="form-section">
            <h3 className="form-section-title">
              <IonIcon icon={cafeOutline} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Configuración de Pausas
            </h3>
            
            <div className="pausas-grid">
              <IonItem lines="none">
                <IonLabel position="stacked">
                  {formulario.metodoEstudio === 'flowtime' 
                    ? 'Pausas Sugeridas (opcional)' 
                    : 'Cantidad de Pausas *'}
                </IonLabel>
                <IonInput
                  type="number"
                  value={formulario.pausasPomodoro}
                  placeholder={formulario.metodoEstudio === 'flowtime' ? 'Ej: 0' : 'Ej: 5'}
                  min={formulario.metodoEstudio === 'flowtime' ? '0' : '1'}
                  max="10"
                  clearInput={true}
                  onIonInput={(e) =>
                    onFormularioChange('pausasPomodoro', e.detail.value || '')
                  }
                />
              </IonItem>

              <IonItem lines="none">
                <IonLabel position="stacked">
                  {formulario.metodoEstudio === 'flowtime' 
                    ? 'Duración (minutos, opcional)' 
                    : 'Duración (minutos) *'}
                </IonLabel>
                <IonInput
                  type="number"
                  value={formulario.tiempoPausa}
                  placeholder={formulario.metodoEstudio === 'flowtime' ? 'Ej: 0' : 'Ej: 5'}
                  min={formulario.metodoEstudio === 'flowtime' ? '0' : '1'}
                  max="30"
                  clearInput={true}
                  onIonInput={(e) =>
                    onFormularioChange('tiempoPausa', e.detail.value || '')
                  }
                />
              </IonItem>
            </div>

            {/* Explicación para Flowtime */}
            {formulario.metodoEstudio === 'flowtime' && (
              <div className="flowtime-alert">
                <IonIcon icon={bulbOutline} />
                <p>
                  <strong>Flowtime:</strong> Puedes dejar en 0 para estudiar sin pausas programadas. 
                  Tú decides cuándo descansar.
                </p>
              </div>
            )}
          </div>

          {/* ========== SECCIÓN: NOTAS ========== */}
          <div className="form-section">
            <h3 className="form-section-title">
              <IonIcon icon={clipboardOutline} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Notas Adicionales
            </h3>
            
            <IonItem lines="none">
              <IonLabel position="stacked">Notas (opcional)</IonLabel>
              <IonTextarea
                value={formulario.notas}
                placeholder="Agrega notas sobre tu sesión de estudio..."
                rows={4}
                onIonInput={(e) =>
                  onFormularioChange('notas', e.detail.value || '')
                }
              />
            </IonItem>
          </div>

          {/* ========== BOTÓN GUARDAR ========== */}
          <IonButton
            expand="block"
            onClick={onGuardar}
            className="btn-guardar"
          >
            Crear Sesión
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default FormularioSesion;