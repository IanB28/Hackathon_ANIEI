import { Route, Redirect } from "react-router-dom";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { homeOutline, home, calendarOutline, calendar, bookOutline, book } from "ionicons/icons";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Calendario from "./pages/Calendario";
import Estudio from "./pages/Estudio";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Perfil from "./pages/Perfil";
import Journaling from "./pages/Journaling";
import MoodTracker from "./pages/MoodTracker";
import { cerrarSesion } from "./services/authService";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";

setupIonicReact({
  mode: 'ios'
});

const TabBarContent: React.FC = () => {
  const location = useLocation();
  
  // ✅ Rutas donde NO se debe mostrar el TabBar
  const rutasSinTabBar = ['/login', '/register', '/journaling', '/moodtracker'];
  const ocultarTabBar = rutasSinTabBar.includes(location.pathname);

  if (ocultarTabBar) {
    return null;
  }
  
  return (
    <IonTabBar slot="bottom">
      <IonTabButton tab="home" href="/home">
        <IonIcon 
          ios={homeOutline} 
          md={homeOutline}
          icon={location.pathname === '/home' || location.pathname === '/' ? home : homeOutline} 
        />
        <IonLabel>Inicio</IonLabel>
      </IonTabButton>
      <IonTabButton tab="calendario" href="/calendario">
        <IonIcon 
          ios={calendarOutline}
          md={calendarOutline}
          icon={location.pathname === '/calendario' ? calendar : calendarOutline} 
        />
        <IonLabel>Calendario</IonLabel>
      </IonTabButton>
      <IonTabButton tab="estudio" href="/estudio">
        <IonIcon 
          ios={bookOutline}
          md={bookOutline}
          icon={location.pathname === '/estudio' ? book : bookOutline} 
        />
        <IonLabel>Estudio</IonLabel>
      </IonTabButton>
    </IonTabBar>
  );
};

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const inicializarApp = async () => {
      try {
        console.log('🔄 Cerrando sesión al iniciar la app...');
        await cerrarSesion();
        console.log('✅ Sesión cerrada correctamente');
      } catch (error) {
        console.error('❌ Error al cerrar sesión:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    inicializarApp();
  }, []);

  if (isInitializing) {
    return (
      <IonApp>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(180deg, #1a2332 0%, #2d3e54 100%)',
          color: 'white'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</div>
            <p>Iniciando Stud-IA...</p>
          </div>
        </div>
      </IonApp>
    );
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/login">
              <Login />
            </Route>
            <Route exact path="/register">
              <Register />
            </Route>
            <Route exact path="/home">
              <Home />
            </Route>
            <Route exact path="/perfil">
              <Perfil />
            </Route>
            <Route exact path="/calendario">
              <Calendario />
            </Route>
            <Route exact path="/estudio">
              <Estudio />
            </Route>
            <Route exact path="/moodtracker">
              <MoodTracker />
            </Route>
            <Route exact path="/journaling">
              <Journaling />
            </Route>
            <Route exact path="/">
              <Redirect to="/login" />
            </Route>
          </IonRouterOutlet>
          <TabBarContent />
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
