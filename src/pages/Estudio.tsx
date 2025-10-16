import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Estudio.css';

const Estudio: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Estudio</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Estudio</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer name="Estudio page" />
      </IonContent>
    </IonPage>
  );
};

export default Estudio;
