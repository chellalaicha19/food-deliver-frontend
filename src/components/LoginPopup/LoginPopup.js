import React, { useState, useContext } from "react";
import "./LoginPopup.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import { API_BASE_URL } from "../../config/api";


const LoginPopup = ({ setShowLogin }) => {
  const [currState, setCurrState] = useState("Sign Up");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { loginUser } = useContext(StoreContext);

  const { fetchCart } = useContext(StoreContext); // Get fetchCart from StoreContext

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const apiUrl =
        currState === "Sign Up"
          ? `${API_BASE_URL}/auth/users/` // Registration endpoint
          : `${API_BASE_URL}/auth/jwt/create/`; // Login endpoint

      const userData =
        currState === "Sign Up"
          ? {
              username: formData.username,
              email: formData.email,
              password: formData.password,
            }
          : {
              username: formData.username, // Login with username instead of email
              password: formData.password,
            };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        if (currState === "Sign Up") {
          setSuccess("Account created successfully! You can now log in.");
          setCurrState("Login");
        } else {
          setSuccess("Login successful!");
          localStorage.setItem("accessToken", data.access);
          localStorage.setItem("refreshToken", data.refresh);
      
          loginUser(data.access, {
            username: formData.username,
            email: formData.email
          });
      
          try {
            await fetchCart(); // if it fails, don't overwrite the success message
          } catch (cartError) {
            console.error("Cart fetch failed after login:", cartError);
          }
      
          setTimeout(() => setShowLogin(false), 2000);
        }
      } else {
        setError(
          data.username?.[0] || data.email?.[0] || data.password?.[0] || data.detail || "Something went wrong."
        );
      }
      
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="login-popup">
      <form className="login-popup-container" onSubmit={handleSubmit}>
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="Close" />
        </div>
        <div className="login-popup-inputs">
          <input
            type="text"
            name="username"
            placeholder="Username"
            required
            value={formData.username}
            onChange={handleChange}
          />
          {currState === "Sign Up" && (
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={handleChange}
            />
          )}
          <input
            type="password"
              name="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
          <button type="submit">{currState === "Sign Up" ? "Create Account" : "Login"}</button>
          <div className="login-popup-condition">
            <input type="checkbox" required />
            <p>By continuing, I agree to the terms of use & privacy policy.</p>
          </div>
          {currState === "Login" ? (
            <p>
              Create a new account? <span onClick={() => setCurrState("Sign Up")}>Click here</span>
            </p>
          ) : (
            <p>
              Already have an account? <span onClick={() => setCurrState("Login")}>Login here</span>
            </p>
          )}
        </form>
      </div>
    );
  };

  export default LoginPopup;