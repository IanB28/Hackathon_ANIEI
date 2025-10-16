import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonPage,
  IonButton,
  IonIcon,
  IonSpinner,
  IonToast,
  IonInput,
  IonItem,
} from "@ionic/react";
import { logoGoogle, eyeOffOutline, eyeOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import {
  loginConGoogle,
  loginConEmail,
  observarAuth,
  manejarRedirect,
} from "../services/authService";
import "./Login.css";

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const history = useHistory();

  useEffect(() => {
    manejarRedirect().catch((err) => {
      console.error("Error en redirect:", err);
    });

    const unsubscribe = observarAuth((user) => {
      if (user) {
        console.log("Usuario logueado:", user.email);
        history.replace("/home");
      }
    });

    return () => unsubscribe();
  }, [history]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await loginConGoogle();
      console.log("Login con Google iniciado correctamente");
    } catch (err: any) {
      console.error("Error en login:", err);
      setError(err.message || "Error al iniciar sesión con Google");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError("Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await loginConEmail(email, password);
      console.log("Login con email exitoso");
    } catch (err: any) {
      console.error("Error en login:", err);
      let errorMessage = "Error al iniciar sesión";

      if (err.code === "auth/user-not-found") {
        errorMessage = "Usuario no encontrado";
      } else if (err.code === "auth/wrong-password") {
        errorMessage = "Contraseña incorrecta";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Email inválido";
      } else if (err.code === "auth/invalid-credential") {
        errorMessage = "Credenciales inválidas";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="login-page" fullscreen>
        <div className="login-wrapper">
          <div className="logo-section">
            <img
              src="/brain_reading.png"
              alt="Brain reading"
              className="brain-logo"
            />
            <h2 className="app-title">Stud Health</h2>
          </div>

          <div className="login-form">
            <div className="input-container">
              <IonItem className="login-input" lines="none">
                <IonInput
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onIonChange={(e) => setEmail(e.detail.value!)}
                />
              </IonItem>

              <IonItem className="login-input" lines="none">
                <IonInput
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={password}
                  onIonChange={(e) => setPassword(e.detail.value!)}
                />
                <IonIcon
                  slot="end"
                  icon={showPassword ? eyeOutline : eyeOffOutline}
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                />
              </IonItem>
            </div>

            <IonButton
              expand="block"
              className="login-btn"
              onClick={handleEmailLogin}
              disabled={loading}
            >
              {loading ? <IonSpinner name="circular" /> : "Iniciar sesión"}
            </IonButton>

            <div className="divider">
              <span>o continuar con</span>
            </div>

            <IonButton
              expand="block"
              className="google-login-btn"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <IonIcon slot="start" icon={logoGoogle} />
              Google
            </IonButton>

            <p className="register-text">
              ¿No tienes cuenta?
              <br />
              <span
                className="register-link"
                onClick={() => history.push("/register")}
              >
                Regístrate aquí
              </span>
            </p>
          </div>
        </div>

        <IonToast
          isOpen={!!error}
          message={error}
          duration={3000}
          color="danger"
          onDidDismiss={() => setError("")}
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
