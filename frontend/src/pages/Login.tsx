// src/pages/Login.tsx
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material";
import { CSSProperties } from "react";
import { CircularProgress } from "@mui/material";
import eyeIcon from "../assets/eye.svg";
import eyeOffIcon from "../assets/eye-off.svg";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pwHovered, setPwHovered] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (auth) {
        const success = await auth.login(username, password);
        if (success) {
          navigate("/");
        } else {
          navigate("/login");
        }
      }
    } catch (error) {
      alert("An error occurred while logging in.");
      console.error("Error logging in:", error);
    } finally {
      setLoading(false);
    }
  };

  const styles: { [key: string]: CSSProperties } = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      fontFamily: "Arial, sans-serif",
      backgroundColor: theme.palette.background.paper,
    },
    loginContainer: {
      borderRadius: "16px",
      padding: "40px",
      boxShadow: "0px 2px 15px #00000040",
      textAlign: "center" as const,
      width: "340px",
      backgroundColor: theme.palette.background.default,
    },
    form: {
      display: "flex",
      flexDirection: "column",
    },
    label: {
      textAlign: "left" as const,
      marginBottom: "5px",
      color: "#777",
    },
    input: {
      marginBottom: "15px",
      padding: "12px",
      borderRadius: "10px",
      border: "1px solid #ddd",
      backgroundColor: "#f7f7f7",
      color: "#333",
      outline: "none",
    },
    passwordWrapper: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      marginBottom: "15px",
    },
    passwordInput: {
      marginBottom: 0,
      padding: "12px 40px 12px 12px", // leave space for the eye button
      borderRadius: "10px",
      border: "1px solid #ddd",
      backgroundColor: "#f7f7f7",
      color: "#333",
      outline: "none",
      width: "100%",
      boxSizing: "border-box" as const,
    },
    toggleButton: {
      position: "absolute" as const,
      right: "10px",
      top: "50%",
      transform: "translateY(-50%)",
      background: "transparent",
      border: "none",
      padding: 0,
      margin: 0,
      cursor: "pointer",
      opacity: (pwHovered || pwFocused) ? 1 : 0,
      transition: "opacity 120ms ease-in-out",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: theme.palette.text.secondary,
    },
    recover: {
      textAlign: "right" as const,
      color: "#999",
      textDecoration: "none",
      fontSize: "12px",
      marginBottom: "20px",
    },
    button: {
      padding: "12px",
      borderRadius: "10px",
      border: "none",
      color: "#FFF",
      fontSize: "22px",
      fontWeight: "bold",
      cursor: "pointer",
      backgroundColor: theme.palette.primary.main,
    },
    loginLogo: {
      width: "200px", 
      marginBottom: "20px",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginContainer}>
        <img
          src={`/logo_login.png`} 
          alt="Login Logo"
          style={styles.loginLogo}
        />
        <form style={styles.form} onSubmit={handleSubmit}>
          <label style={styles.label}>Username</label>
          <input
            style={styles.input}
            type="text"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />
          <label style={styles.label}>Password</label>
          <div
            style={styles.passwordWrapper}
            onMouseEnter={() => setPwHovered(true)}
            onMouseLeave={() => setPwHovered(false)}
          >
            <input
              style={styles.passwordInput}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPwFocused(true)}
              onBlur={() => setPwFocused(false)}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
              style={styles.toggleButton}
              onClick={() => setShowPassword((v) => !v)}
            >
              <img
                src={showPassword ? eyeOffIcon : eyeIcon}
                alt={showPassword ? "Hide password" : "Show password"}
                width={20}
                height={20}
                draggable={false}
                style={{ display: "block" }}
              />
            </button>
          </div>

          {/* <Link to="/forgot-password" style={styles.recover}>
            Forgot password?
          </Link> */}

          <button style={styles.button}>
            {loading ? <CircularProgress size={22} color="inherit" /> : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;