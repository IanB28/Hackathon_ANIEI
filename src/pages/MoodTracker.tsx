import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton,
  IonIcon,
  IonChip,
  IonSpinner,
  IonAlert,
} from '@ionic/react';
import { arrowBackOutline, closeOutline, informationCircleOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import {
  crearMoodEntry,
  crearMoodEntryConFecha,
  generarPalabrasFallback,
  actualizarPalabrasSeleccionadas,
  actualizarAreasImpacto,
  puedeRegistrarMood,
  guardarRegistroMood,  // ✅ Agregar esta importación
  CATEGORIAS_IMPACTO,
} from '../services/moodService';
import './MoodTracker.css';

interface LocationState {
  emotion: string;
  emotionId: number;
  emotionColor: string;
  emotionImage: string;
  selectedDate?: string;
  isHistoricalEntry?: boolean;
  calendarContext?: {
    year?: number;
    month?: number;
    day?: number;
  };
}

const MoodTracker: React.FC = () => {
  const location = useLocation<LocationState>();
  const history = useHistory();
  
  const { 
    emotion, 
    emotionId, 
    emotionColor, 
    emotionImage,
    selectedDate,
    isHistoricalEntry,
    calendarContext
  } = location.state || {};

  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);
  const [entryId, setEntryId] = useState<string>('');

  const [todasLasPalabras, setTodasLasPalabras] = useState<string[]>([]);
  const [palabrasSeleccionadas, setPalabrasSeleccionadas] = useState<string[]>([]);
  const [mostrarMasPalabras, setMostrarMasPalabras] = useState(false);

  const [areasSeleccionadas, setAreasSeleccionadas] = useState<string[]>([]);

  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState('');

  useEffect(() => {
    if (!emotion) {
      history.replace('/home');
      return;
    }
    inicializarMoodTracker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inicializarMoodTracker = async () => {
    setLoading(true);
    try {
      // Si es registro histórico, usar la fecha seleccionada
      const registrationDate = selectedDate ? new Date(selectedDate) : new Date();
      
      const { puede, registrosHoy } = await puedeRegistrarMood();
      
      if (!puede && !isHistoricalEntry) {
        setMensajeAlerta(`Ya completaste tus registros de hoy (${registrosHoy}/7). Vuelve mañana para registrar más.`);
        setMostrarAlerta(true);
        return;
      }

      // Crear entry con la fecha correcta
      const id = await crearMoodEntryConFecha(
        emotionId, 
        emotion, 
        emotionColor,
        registrationDate
      );
      
      setEntryId(id);
      console.log('📝 Entry creada con ID:', id, 'para fecha:', registrationDate.toISOString());

      const palabrasCargadas = generarPalabrasFallback(emotion);
      setTodasLasPalabras(palabrasCargadas);
      console.log('📚 Palabras cargadas para', emotion, ':', palabrasCargadas.length, 'palabras');

    } catch (error: any) {
      console.error('❌ Error:', error);
      
      if (error.message.includes('Ya registraste')) {
        setMensajeAlerta(error.message);
        setMostrarAlerta(true);
      } else {
        alert('Error al procesar. Intenta de nuevo.');
        history.goBack();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarAlerta = () => {
    setMostrarAlerta(false);
    history.replace('/home');
  };

  const handleIrAJournaling = () => {
    setMostrarAlerta(false);
    history.replace({
      pathname: '/journaling',
      state: {
        entryId: entryId,
        emotion: emotion,
        emotionColor: emotionColor,
        palabrasSeleccionadas: palabrasSeleccionadas,
        areasSeleccionadas: areasSeleccionadas,
      }
    });
  };

  const togglePalabra = (palabra: string) => {
    if (palabrasSeleccionadas.includes(palabra)) {
      const nuevasSeleccionadas = palabrasSeleccionadas.filter(p => p !== palabra);
      setPalabrasSeleccionadas(nuevasSeleccionadas);
      console.log('❌ Palabra deseleccionada:', palabra);
      console.log('📝 Total seleccionadas ahora:', nuevasSeleccionadas.length);
    } else {
      const nuevasSeleccionadas = [...palabrasSeleccionadas, palabra];
      setPalabrasSeleccionadas(nuevasSeleccionadas);
      console.log('✅ Palabra seleccionada:', palabra);
      console.log('📝 Total seleccionadas ahora:', nuevasSeleccionadas.length);
    }
  };

  const handleSiguientePaso = async () => {
    if (palabrasSeleccionadas.length === 0) {
      alert('Por favor selecciona al menos una palabra');
      return;
    }

    setLoading(true);
    try {
      console.log('💾 ENVIANDO A FIREBASE:');
      console.log('   - Entry ID:', entryId);
      console.log('   - Palabras seleccionadas:', palabrasSeleccionadas);
      console.log('   - Cantidad:', palabrasSeleccionadas.length);
      
      await actualizarPalabrasSeleccionadas(entryId, palabrasSeleccionadas);
      
      console.log('✅ Palabras guardadas exitosamente en Firebase');
      setPaso(2);
    } catch (error) {
      console.error('❌ Error al guardar palabras:', error);
      alert('Error al guardar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const toggleArea = (area: string) => {
    if (areasSeleccionadas.includes(area)) {
      const nuevasSeleccionadas = areasSeleccionadas.filter(a => a !== area);
      setAreasSeleccionadas(nuevasSeleccionadas);
      console.log('❌ Área deseleccionada:', area);
      console.log('📝 Total áreas seleccionadas:', nuevasSeleccionadas.length);
    } else {
      const nuevasSeleccionadas = [...areasSeleccionadas, area];
      setAreasSeleccionadas(nuevasSeleccionadas);
      console.log('✅ Área seleccionada:', area);
      console.log('📝 Total áreas seleccionadas:', nuevasSeleccionadas.length);
    }
  };

  const handleFinalizar = async () => {
    if (areasSeleccionadas.length === 0) {
      alert('Por favor selecciona al menos un área');
      return;
    }

    setLoading(true);
    
    try {
      console.log('💾 Finalizando registro...');
      console.log('   - Entry ID:', entryId);
      console.log('   - Áreas seleccionadas:', areasSeleccionadas);
      
      await actualizarAreasImpacto(entryId, areasSeleccionadas);
      
      console.log('✅ Registro completado exitosamente');
      
      // Si vino del calendario, regresar al calendario
      if (calendarContext && calendarContext.year !== undefined) {
        history.replace({
          pathname: '/calendario',
          state: {
            refreshCalendar: true,
            year: calendarContext.year,
            month: calendarContext.month
          }
        });
      } else {
        // Si no, ir a Journaling
        history.replace({
          pathname: '/journaling',
          state: {
            entryId: entryId,
            emotion: emotion,
            emotionColor: emotionColor,
            palabrasSeleccionadas: palabrasSeleccionadas,
            areasSeleccionadas: areasSeleccionadas,
          }
        });
      }
    } catch (error) {
      console.error('❌ Error al finalizar:', error);
      alert('Error al guardar el registro. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const todasLasAreas = [
    ...CATEGORIAS_IMPACTO.vidaDiaria,
    ...CATEGORIAS_IMPACTO.relaciones,
    ...CATEGORIAS_IMPACTO.desempeno,
  ];

  if (!emotion) {
    return null;
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="minimal-toolbar-mood">
          <div className="mood-tracker-header">
            {paso > 1 ? (
              <IonButton fill="clear" className="back-button-mood" onClick={() => setPaso(paso - 1)}>
                <IonIcon icon={arrowBackOutline} />
              </IonButton>
            ) : (
              <IonButton fill="clear" className="close-button-mood" onClick={() => history.replace('/home')}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            )}
            <div className="mood-header-center">
              <span className="mood-step-indicator">Paso {paso} de 2</span>
            </div>
            <div className="mood-header-spacer"></div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="mood-tracker-content">
        {loading && paso === 1 ? (
          <div className="loading-container">
            <IonSpinner name="crescent" color="primary" />
            <p>Cargando palabras...</p>
          </div>
        ) : (
          <>
            {/* PASO 1: Seleccionar palabras */}
            {paso === 1 && (
              <div className="mood-step">
                <div 
                  className="mood-icon" 
                  style={{ 
                    background: `radial-gradient(circle, ${emotionColor}40 0%, transparent 70%)`,
                    boxShadow: `0 0 50px ${emotionColor}66`
                  }}
                >
                  <img src={emotionImage} alt={emotion} className="mood-emoji-large" />
                </div>
                
                <h3 style={{ color: emotionColor }}>{emotion}</h3>

                <div className="mood-question">
                  <span>¿Qué describe mejor este sentimiento?</span>
                  <IonIcon icon={informationCircleOutline} />
                </div>

                <div className="palabras-count">
                  <small>{palabrasSeleccionadas.length} seleccionadas de {todasLasPalabras.length}</small>
                </div>

                <div className="palabras-grid">
                  {todasLasPalabras.slice(0, mostrarMasPalabras ? 30 : 15).map((palabra) => (
                    <IonChip
                      key={palabra}
                      onClick={() => togglePalabra(palabra)}
                      className={`palabra-chip ${palabrasSeleccionadas.includes(palabra) ? 'selected' : ''}`}
                    >
                      {palabra}
                    </IonChip>
                  ))}
                </div>

                {todasLasPalabras.length > 15 && (
                  <IonButton
                    fill="clear"
                    onClick={() => setMostrarMasPalabras(!mostrarMasPalabras)}
                    className="show-more-btn"
                  >
                    {mostrarMasPalabras ? 'Mostrar menos ∧' : `Mostrar más (${todasLasPalabras.length - 15} más) ∨`}
                  </IonButton>
                )}

                <IonButton
                  expand="block"
                  onClick={handleSiguientePaso}
                  disabled={loading || palabrasSeleccionadas.length === 0}
                  className="mood-next-btn"
                  style={{ '--background': `linear-gradient(135deg, ${emotionColor}, ${emotionColor}dd)` } as any}
                >
                  {loading ? <IonSpinner /> : 'Siguiente'}
                </IonButton>
              </div>
            )}

            {/* PASO 2: Áreas de impacto */}
            {paso === 2 && (
              <div className="mood-step">
                <div 
                  className="mood-icon" 
                  style={{ 
                    background: `radial-gradient(circle, ${emotionColor}40 0%, transparent 70%)`,
                    boxShadow: `0 0 50px ${emotionColor}66`
                  }}
                >
                  <img src={emotionImage} alt={emotion} className="mood-emoji-large" />
                </div>
                
                <h3 style={{ color: emotionColor }}>{emotion}</h3>

                <div className="mood-question">
                  <span>¿Qué está teniendo el mayor impacto en ti?</span>
                  <IonIcon icon={informationCircleOutline} />
                </div>

                <div className="palabras-count">
                  <small>{areasSeleccionadas.length} seleccionadas</small>
                </div>

                <div className="areas-grid">
                  {todasLasAreas.map((area) => (
                    <IonChip
                      key={area}
                      onClick={() => toggleArea(area)}
                      className={`area-chip ${areasSeleccionadas.includes(area) ? 'selected' : ''}`}
                    >
                      {area}
                    </IonChip>
                  ))}
                </div>

                <IonButton
                  expand="block"
                  onClick={handleFinalizar}
                  disabled={loading || areasSeleccionadas.length === 0}
                  className="mood-done-btn"
                  style={{ '--background': `linear-gradient(135deg, ${emotionColor}, ${emotionColor}dd)` } as any}
                >
                  {loading ? <IonSpinner /> : 'Finalizar'}
                </IonButton>
              </div>
            )}
          </>
        )}
      </IonContent>

      <IonAlert
        isOpen={mostrarAlerta}
        onDidDismiss={handleCerrarAlerta}
        header={mensajeAlerta.includes('✅') ? '¡Registro completado!' : 'Límite alcanzado'}
        message={mensajeAlerta.includes('✅') 
          ? `${mensajeAlerta}\n\n¿Quieres hablar con Stud-IA sobre cómo te sientes?`
          : mensajeAlerta
        }
        buttons={
          mensajeAlerta.includes('✅') 
            ? [
                {
                  text: 'Más tarde',
                  role: 'cancel',
                  cssClass: 'alert-button-cancel',
                  handler: handleCerrarAlerta
                },
                {
                  text: 'Hablar con Stud-IA',
                  cssClass: 'alert-button-confirm',
                  handler: handleIrAJournaling
                }
              ]
            : [
                {
                  text: 'OK',
                  handler: handleCerrarAlerta
                }
              ]
        }
      />
    </IonPage>
  );
};

export default MoodTracker;