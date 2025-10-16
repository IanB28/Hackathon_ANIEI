import { IonApp, IonRouterOutlet, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route } from 'react-router-dom';
import { homeOutline, home, calendarOutline, calendar, bookOutline, book } from 'ionicons/icons';
import { useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Calendario from './pages/Calendario';
import Estudio from './pages/Estudio';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact({
  mode: 'ios' // Forzar modo iOS globalmente
});

const TabBarContent: React.FC = () => {
  const location = useLocation();
  
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

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/home">
            <Home />
          </Route>
          <Route exact path="/calendario">
            <Calendario />
          </Route>
          <Route exact path="/estudio">
            <Estudio />
          </Route>
          <Route exact path="/">
            <Home />
          </Route>
        </IonRouterOutlet>
        <TabBarContent />
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);

export default App;
