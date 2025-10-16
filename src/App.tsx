import { IonApp, IonRouterOutlet, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, useHistory } from 'react-router-dom';
import { homeOutline, home, calendarOutline, calendar, bookOutline, book } from 'ionicons/icons';
import { useLocation } from 'react-router-dom';

import Home from "./pages/Home";
import Calendario from "./pages/Calendario";
import Estudio from "./pages/Estudio";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Perfil from "./pages/Perfil";
import Journaling from "./pages/Journaling"; 
import MoodTracker from "./pages/MoodTracker";

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
  mode: 'ios' // Forzar modo iOS globalmente
});

const TabBarContent: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  
  // ✅ Función para navegar a Home y resetear estado
  const navigateToHome = (e: CustomEvent) => {
    e.preventDefault();
    console.log('🏠 Navegando a Home desde TabBar - Reseteando estado');
    history.push({
      pathname: '/home',
      state: {
        fromNavigation: true
      }
    });
  };

  // ✅ Función para navegar a Calendario
  const navigateToCalendario = (e: CustomEvent) => {
    e.preventDefault();
    console.log('📅 Navegando a Calendario desde TabBar');
    history.push('/calendario');
  };

  // ✅ Función para navegar a Estudio
  const navigateToEstudio = (e: CustomEvent) => {
    e.preventDefault();
    console.log('📚 Navegando a Estudio desde TabBar');
    history.push('/estudio');
  };

  return (
    <IonTabBar slot="bottom">
      {/* ✅ Home con reseteo de estado */}
      <IonTabButton tab="home" onClick={navigateToHome}>
        <IonIcon 
          icon={location.pathname === '/home' ? home : homeOutline} 
        />
        <IonLabel>Inicio</IonLabel>
      </IonTabButton>
      
      {/* ✅ Calendario con navegación programática */}
      <IonTabButton tab="calendario" onClick={navigateToCalendario}>
        <IonIcon 
          icon={location.pathname === '/calendario' ? calendar : calendarOutline} 
        />
        <IonLabel>Calendario</IonLabel>
      </IonTabButton>
      
      {/* ✅ Estudio con navegación programática */}
      <IonTabButton tab="estudio" onClick={navigateToEstudio}>
        <IonIcon 
          icon={location.pathname === '/estudio' ? book : bookOutline} 
        />
        <IonLabel>Estudio</IonLabel>
      </IonTabButton>
    </IonTabBar>
  );
};

const App: React.FC = () => (
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
          <Route exact path="/home" key="home">
            <Home />
          </Route>
          <Route exact path="/perfil">
            <Perfil />
          </Route>
          <Route exact path="/calendario" key="calendario">
            <Calendario />
          </Route>
          <Route exact path="/estudio" key="estudio">
            <Estudio />
          </Route>
          <Route exact path="/moodtracker">
            <MoodTracker />
          </Route>
          <Route exact path="/">
            <Home />
          </Route>
          <Route exact path="/journaling">
            <Journaling />
          </Route>
        </IonRouterOutlet>
        <TabBarContent />
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);

export default App;
