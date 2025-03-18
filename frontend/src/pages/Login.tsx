// src/pages/Login.tsx
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "@mui/material";
import { CSSProperties } from "react";

import { fetchHello } from '../api/core';

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();

  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (auth?.token) {
      
      const fetchData = async () => {
        try {
          const { message } = await fetchHello();
          setMessage(message);
        } catch (error) {
          console.error("Error fetching hello message:", error);
        }
      };
  
      fetchData();
      console.log(message);
      navigate("/home");
    }
  }, [auth?.token, navigate, message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (auth) {
        const success = await auth.login(username, password);
        if (success) {
          navigate("/home");
        } else {
          navigate("/login");
        }
      }
    } catch (error) {
      alert("An error occurred while logging in.");
      console.error("Error logging in:", error);
    }
  };

  const handleLogout = () => {
    auth?.logout();
    navigate("/login");
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
    loginTitle: {
      fontSize: "28px",
      marginBottom: "30px",
      color: theme.palette.primary.main,
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
    recover: {
      textAlign: "right" as const,
      color: "#999",
      textDecoration: "none",
      fontSize: "12px",
      marginBottom: "20px",
    },
    button: {
      padding: "15px",
      borderRadius: "10px",
      border: "none",
      color: "#FFF",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      backgroundColor: theme.palette.primary.main,
    },
    buttonLogout: {
      padding: "15px",
      borderRadius: "10px",
      border: "none",
      color: "#FFFFFF",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      backgroundColor: "#ff5555",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginContainer}>
        <h2 style={styles.loginTitle}>LOGIN</h2>
        {!auth?.token ? (
          <form style={styles.form} onSubmit={handleSubmit}>
            <label style={styles.label}>Username</label>
            <input
              style={styles.input}
              type="text"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
            />
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />

            <Link to="/forgot-password" style={styles.recover}>
              Forgot password?
            </Link>

            <button style={styles.button}>Login</button>
          </form>
        ) : (
          <button style={styles.buttonLogout} onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default Login;