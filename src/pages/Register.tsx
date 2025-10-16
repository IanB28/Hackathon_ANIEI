import React, { useState } from "react";
import {
  IonContent,
  IonPage,
  IonButton,
  IonIcon,
  IonSpinner,
  IonToast,
  IonInput,
  IonItem,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
} from "@ionic/react";
import { eyeOffOutline, eyeOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { registrarConEmail } from "../services/authService";
import "./Register.css";

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const history = useHistory();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await registrarConEmail(email, password);
      setSuccess("Cuenta creada exitosamente");
      setTimeout(() => {
        history.replace("/home");
      }, 1500);
    } catch (err: any) {
      console.error("Error en registro:", err);
      let errorMessage = "Error al crear la cuenta";

      if (err.code === "auth/email-already-in-use") {
        errorMessage = "Este email ya está registrado";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Email inválido";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "La contraseña es muy débil";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" />
          </IonButtons>
          <IonTitle>Registro</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="register-page" fullscreen>
        <div className="register-wrapper">
          <div className="register-header">
            <h2>Crear cuenta</h2>
            <p>Completa tus datos para registrarte</p>
          </div>

          <div className="register-form">
            <IonItem className="register-input" lines="none">
              <IonInput
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onIonChange={(e) => setEmail(e.detail.value!)}
              />
            </IonItem>

            <IonItem className="register-input" lines="none">
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

            <IonItem className="register-input" lines="none">
              <IonInput
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onIonChange={(e) => setConfirmPassword(e.detail.value!)}
              />
              <IonIcon
                slot="end"
                icon={showConfirmPassword ? eyeOutline : eyeOffOutline}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle"
              />
            </IonItem>

            <IonButton
              expand="block"
              className="register-btn"
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? <IonSpinner name="circular" /> : "Crear cuenta"}
            </IonButton>

            <p className="login-text">
              ¿Ya tienes cuenta?
              <br />
              <span
                className="login-link"
                onClick={() => history.push("/login")}
              >
                Inicia sesión aquí
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

        <IonToast
          isOpen={!!success}
          message={success}
          duration={1500}
          color="success"
          onDidDismiss={() => setSuccess("")}
        />
      </IonContent>
    </IonPage>
  );
};

export default Register;
