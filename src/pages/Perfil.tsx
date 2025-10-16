import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonAvatar,
  IonButton,
  IonIcon,
  IonCard,
} from "@ionic/react";
import { settingsOutline, logOutOutline, personCircleOutline, cameraOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { obtenerPerfilUsuario, cerrarSesion } from "../services/authService";
import "./Perfil.css";

const Perfil: React.FC = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const history = useHistory();

  useEffect(() => {
    const profile = obtenerPerfilUsuario();
    setUserProfile(profile);
  }, []);

  const handleLogout = async () => {
    try {
      await cerrarSesion();
      history.replace("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (!userProfile) {
    return null;
  }

  return (
    <IonPage>
      <IonHeader className="perfil-header">
        <IonToolbar className="perfil-toolbar">
          <div className="header-content">
            <img src="/brain_reading.png" alt="Logo" className="header-logo" />
            <span className="header-title">StudHealth</span>
            <IonButton fill="clear" className="settings-btn">
              <IonIcon icon={settingsOutline} color="light" />
            </IonButton>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="perfil-content" fullscreen>
        <div className="perfil-wrapper">
          <div className="avatar-section">
            <div className="avatar-container">
              <IonAvatar className="perfil-avatar">
                {userProfile.photoURL ? (
                  <img src={userProfile.photoURL} alt="Foto de perfil" />
                ) : (
                  <div className="avatar-placeholder">
                    <IonIcon icon={personCircleOutline} className="avatar-icon" />
                  </div>
                )}
              </IonAvatar>
              <button className="avatar-edit-btn">
                <IonIcon icon={cameraOutline} />
              </button>
            </div>

            <h2 className="perfil-nombre">
              {userProfile.displayName ||
                userProfile.email?.split("@")[0] ||
                "Usuario"}
            </h2>

            <p className="perfil-email">{userProfile.email}</p>

            <div className="perfil-stats">
              <div className="stat-item">
                <img src="/mx-flag.png" alt="MX" className="flag-icon" />
                <span>MX</span>
              </div>
              <div className="stat-item">
                <span>21 años</span>
              </div>
              <div className="stat-item">
                <span>3 sesiones</span>
              </div>
            </div>
          </div>

          <IonCard className="rachas-card">
            <h3>RACHAS</h3>
            <div className="rachas-container">
              <img src="/fire-active.png" alt="Racha" className="racha-icon" />
              <img src="/fire-active.png" alt="Racha" className="racha-icon" />
              <img src="/fire-active.png" alt="Racha" className="racha-icon" />
              <img
                src="/fire-inactive.png"
                alt="Sin racha"
                className="racha-icon inactive"
              />
              <img
                src="/fire-inactive.png"
                alt="Sin racha"
                className="racha-icon inactive"
              />
              <img
                src="/fire-inactive.png"
                alt="Sin racha"
                className="racha-icon inactive"
              />
              <img
                src="/fire-inactive.png"
                alt="Sin racha"
                className="racha-icon inactive"
              />
            </div>
          </IonCard>

          <IonCard className="logros-card">
            <h3>LOGROS</h3>
            <div className="logros-container">
              <img
                src="/medal-bronze.png"
                alt="Bronce"
                className="medal-icon"
              />
              <img src="/medal-silver.png" alt="Plata" className="medal-icon" />
              <img src="/medal-gold.png" alt="Oro" className="medal-icon" />
              <img
                src="/medal-inactive.png"
                alt="Bloqueada"
                className="medal-icon inactive"
              />
              <img
                src="/medal-inactive.png"
                alt="Bloqueada"
                className="medal-icon inactive"
              />
              <img
                src="/medal-inactive.png"
                alt="Bloqueada"
                className="medal-icon inactive"
              />
            </div>
          </IonCard>

          <IonButton
            expand="block"
            color="danger"
            fill="outline"
            onClick={handleLogout}
            className="logout-btn"
          >
            <IonIcon slot="start" icon={logOutOutline} />
            Cerrar Sesión
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Perfil;
