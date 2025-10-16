import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton,
  IonTextarea,
  IonIcon,
  IonAvatar,
} from "@ionic/react";
import { useState, useRef, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { settingsOutline, sendOutline, happyOutline } from "ionicons/icons";
import "./Journaling.css";
import { askAI } from '../services/aiService';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface LocationState {
  entryId?: string;
  emotion?: string;
  emotionColor?: string;
  palabrasSeleccionadas?: string[];
  areasSeleccionadas?: string[];
}

export default function Journaling() {
  const history = useHistory();
  const location = useLocation<LocationState>();
  const { entryId, emotion, emotionColor, palabrasSeleccionadas, areasSeleccionadas } = location.state || {};

  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const contentRef = useRef<HTMLIonContentElement>(null);

  useEffect(() => {
    // ✅ Inicializar conversación con contexto personalizado
    if (palabrasSeleccionadas && palabrasSeleccionadas.length > 0) {
      iniciarConversacionPersonalizada();
    } else {
      // Mensaje genérico si no hay contexto
      setMessages([
        {
          id: 0,
          text: "¡Hola! Soy Stud-IA, tu asistente de bienestar. Estoy aquí para escucharte y apoyarte. ¿Cómo te sientes hoy?",
          sender: 'ai',
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  const iniciarConversacionPersonalizada = () => {
    const palabrasTexto = palabrasSeleccionadas?.slice(0, 5).join(', ') || '';
    const areasTexto = areasSeleccionadas?.slice(0, 3).join(', ') || '';
    
    let mensajeInicial = `¡Hola! Veo que te sientes "${emotion}" y has identificado estas emociones: ${palabrasTexto}.`;
    
    if (areasTexto) {
      mensajeInicial += ` También mencionaste que te están impactando: ${areasTexto}.`;
    }
    
    mensajeInicial += `\n\n¿Podrías contarme más sobre qué te llevó a sentirte así? Me gustaría entender mejor tu situación.`;

    setMessages([
      {
        id: 0,
        text: mensajeInicial,
        sender: 'ai',
        timestamp: new Date()
      }
    ]);
  };

  const handleInputChange = (event: CustomEvent) => {
    setUserInput(event.detail.value);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      contentRef.current?.scrollToBottom(300);
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNavigateToProfile = () => {
    history.push("/perfil");
  };

  const handleSendClick = async () => {
    if (userInput.trim() === "") return;

    const userMessage: Message = {
      id: messages.length,
      text: userInput,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = userInput;
    setUserInput("");
    setIsLoading(true);
    
    try {
      const conversationHistory = messages
        .slice(-6)
        .map(msg => `${msg.sender === 'user' ? 'Usuario' : 'Stud-IA'}: ${msg.text}`)
        .join('\n');

      // ✅ Contexto personalizado basado en el registro de mood
      let contextoEmocional = '';
      if (palabrasSeleccionadas && palabrasSeleccionadas.length > 0) {
        const palabrasTexto = palabrasSeleccionadas.join(', ');
        const areasTexto = areasSeleccionadas?.join(', ') || 'ninguna especificada';
        
        contextoEmocional = `CONTEXTO EMOCIONAL DEL USUARIO:
- Estado actual: ${emotion}
- Emociones identificadas: ${palabrasTexto}
- Áreas de impacto: ${areasTexto}

`;
      }

      const prompt = `Eres Stud-IA, un asistente virtual empático especializado en apoyo emocional y salud mental para estudiantes universitarios. 

${contextoEmocional}Historial reciente de conversación:
${conversationHistory}

Usuario: ${currentInput}

INSTRUCCIONES:
- Responde con 2-3 oraciones máximo (40-60 palabras)
- Sé empático, comprensivo y cercano
- ${messages.length <= 2 ? 'Profundiza en por qué seleccionó esas emociones específicas' : 'Continúa la conversación de manera natural'}
- Haz UNA pregunta reflexiva específica relacionada con sus emociones
- Valida sus sentimientos genuinamente
- Usa un tono amigable y motivador
- Conecta tus preguntas con las emociones que identificó (${palabrasSeleccionadas?.slice(0, 3).join(', ') || ''})
- NO des soluciones inmediatas, primero escucha y comprende

Stud-IA:`;

      const respuesta = await askAI(prompt);
      
      let respuestaFinal = respuesta.trim();
      
      // Limitar longitud
      if (respuestaFinal.length > 200) {
        const sentences = respuestaFinal.split(/[.!?]+/).filter(s => s.trim());
        if (sentences.length > 3) {
          respuestaFinal = sentences.slice(0, 3).join('. ') + '.';
        }
      }
      
      const aiMessage: Message = {
        id: messages.length + 1,
        text: respuestaFinal,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error("Error al consultar la IA:", err);
      
      const errorMessage: Message = {
        id: messages.length + 1,
        text: "Disculpa, tuve un problema. ¿Podrías repetirlo?",
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
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
      <IonContent ref={contentRef} className="journaling-content">
        <div className="chat-container">
          <div className="chat-header">
            <div className="assistant-info">
              <div className="assistant-avatar">
                <span className="avatar-icon">🧠</span>
              </div>
              <div className="assistant-details">
                <h2 className="assistant-name">Stud-IA</h2>
                <p className="assistant-status">
                  <span className="status-dot"></span>
                  Asistente de bienestar activo
                </p>
              </div>
            </div>
          </div>

          {/* ✅ Mostrar resumen del estado emocional si existe */}
          {palabrasSeleccionadas && palabrasSeleccionadas.length > 0 && (
            <div className="emotion-context-card">
              <div className="context-header">
                <span className="context-icon">💭</span>
                <span className="context-title">Tu estado emocional</span>
              </div>
              <div className="context-content">
                <div className="context-row">
                  <span className="context-label">Estado:</span>
                  <span className="context-value" style={{ color: emotionColor }}>{emotion}</span>
                </div>
                <div className="context-row">
                  <span className="context-label">Emociones:</span>
                  <span className="context-value">{palabrasSeleccionadas.slice(0, 4).join(', ')}</span>
                </div>
                {areasSeleccionadas && areasSeleccionadas.length > 0 && (
                  <div className="context-row">
                    <span className="context-label">Áreas:</span>
                    <span className="context-value">{areasSeleccionadas.slice(0, 3).join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="messages-container">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message-wrapper ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
              >
                <div className="message-bubble">
                  <p className="message-text">{message.text}</p>
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message-wrapper ai-message">
                <div className="message-bubble typing-indicator">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="input-container">
            <div className="input-wrapper-enhanced">
              <IonButton fill="clear" className="emoji-button">
                <IonIcon icon={happyOutline} />
              </IonButton>
              <IonTextarea
                placeholder="Escribe cómo te sientes..."
                value={userInput}
                onIonChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="chat-input-enhanced"
                rows={1}
                autoGrow={true}
                maxlength={500}
              />
              <IonButton
                className="send-button-enhanced"
                onClick={handleSendClick}
                disabled={isLoading || userInput.trim() === ""}
              >
                <IonIcon icon={sendOutline} />
              </IonButton>
            </div>
            <div className="input-helper">
              <span className="char-counter">{userInput.length}/500</span>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
