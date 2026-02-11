import { Link, useNavigate } from "react-router-dom";
import { emailIcon, googleIcon } from "../assets/icons";
import { useState } from "react";
import { httpRequest } from "../interceptor/axiosInterceptor";
import { url } from "../baseUrl";
import { useAuth } from "../contexts/Auth";
import { useAppContext } from "../App";

type SignInBoxType = {
  message?: string;
  typeOfLogin: string;
};

const SIGNIN_OPTIONS = [
  {
    id: 1,
    title: "with Google",
    handler: "Google",
    image: googleIcon,
  },
  {
    id: 2,
    title: "with email",
    handler: "mail",
    image: emailIcon,
  },
];

export default function SignInBox({ message, typeOfLogin }: SignInBoxType) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { handleUser } = useAuth();
  const { handleToast } = useAppContext();

  function handleGoogleAuth() {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
      redirect_uri: import.meta.env.VITE_GOOGLE_OAUTH_REDIRECT_URL,
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
    };
    const qs = new URLSearchParams(options);
    window.location.assign(`${rootUrl}?${qs.toString()}`);
  }

  function handleEmailLogin() {
    setShowEmailForm(true);
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const isSignUp = typeOfLogin === "Sign up";
      const endpoint = isSignUp ? "/auth/register" : "/auth/login";
      
      const payload = isSignUp
        ? { email, password, name }
        : { email, password };

      const response = await httpRequest.post(`${url}${endpoint}`, payload);

      if (response.data) {
        // Store tokens (must be stringified to match axios interceptor expectations)
        localStorage.setItem("access_token", JSON.stringify(response.data.access_token));
        localStorage.setItem("refresh_token", JSON.stringify(response.data.refresh_token));
        localStorage.setItem("userId", response.data.userId);

        // Fetch user data
        try {
          const userResponse = await httpRequest.get(`${url}/user/${response.data.userId}`);
          
          if (userResponse.data) {
            // Store user in localStorage (stringified to match Auth context expectations)
            localStorage.setItem("user", JSON.stringify(userResponse.data));
            handleUser(userResponse.data);
            handleToast && handleToast(isSignUp ? "Account created successfully!" : "Welcome back!");
            navigate("/");
          }
        } catch (userErr) {
          // If user fetch fails, still navigate but show warning
          console.error("Failed to fetch user data:", userErr);
          handleToast && handleToast(isSignUp ? "Account created!" : "Logged in!");
          navigate("/");
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.response?.data?.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (showEmailForm) {
    return (
      <div
        style={{
          width: "650px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          padding: "8vh 0",
          boxShadow:
            "rgb(190, 190, 190) 2px 2px 12px, rgb(255, 255, 255) -20px -20px 60px",
        }}
      >
        <p
          style={{
            fontFamily: "Roboto Slab",
            fontSize: "28px",
            marginBottom: "30px",
          }}
        >
          {message}
        </p>

        <form
          onSubmit={handleEmailSubmit}
          style={{
            width: "80%",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {typeOfLogin === "Sign up" && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                padding: "12px 16px",
                border: "1px solid #c9c9c9",
                borderRadius: "4px",
                fontSize: "15px",
                outline: "none",
              }}
            />
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: "12px 16px",
              border: "1px solid #c9c9c9",
              borderRadius: "4px",
              fontSize: "15px",
              outline: "none",
            }}
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{
              padding: "12px 16px",
              border: "1px solid #c9c9c9",
              borderRadius: "4px",
              fontSize: "15px",
              outline: "none",
            }}
          />

          {error && (
            <p style={{ color: "#d32f2f", fontSize: "14px", margin: "0" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px 16px",
              backgroundColor: loading ? "#cbe4ca" : "#1a8917",
              color: "white",
              border: "none",
              borderRadius: "24px",
              fontSize: "15px",
              fontWeight: "500",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "8px",
            }}
          >
            {loading ? "Please wait..." : typeOfLogin}
          </button>

          <button
            type="button"
            onClick={() => setShowEmailForm(false)}
            style={{
              padding: "8px 16px",
              backgroundColor: "transparent",
              color: "#5c5c5c",
              border: "1px solid #c9c9c9",
              borderRadius: "24px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Back to options
          </button>
        </form>

        <p
          style={{
            fontSize: "13px",
            color: "gray",
            width: "78%",
            textAlign: "center",
            lineHeight: "22px",
            marginTop: "22px",
          }}
        >
          Click "{typeOfLogin}" to agree to Medium's Terms of Service and
          acknowledge that Medium's Privacy Policy applies to you.
        </p>
      </div>
    );
  }
  return (
    <div
      style={{
        width: "650px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        padding: "8vh 0",
        boxShadow:
          "rgb(190, 190, 190) 2px 2px 12px, rgb(255, 255, 255) -20px -20px 60px",
      }}
    >
      <p
        style={{
          fontFamily: "Roboto Slab",
          fontSize: "28px",
          marginBottom: "30px",
        }}
      >
        {message}
      </p>
      {SIGNIN_OPTIONS.map((item) => {
        return (
          <ButtonLoginWith
            image={item.image}
            key={item.id}
            onClick={
              item.handler == "Google" ? handleGoogleAuth : handleEmailLogin
            }
            text={typeOfLogin + " " + item.title}
          />
        );
      })}
      {typeOfLogin === "Sign in" ? (
        <p style={{ marginTop: "22px", color: "#5c5c5c" }}>
          No account?{" "}
          <Link
            style={{
              color: "#1a8917",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "14px",
            }}
            to="/signin/new"
          >
            Create one
          </Link>
        </p>
      ) : (
        <p style={{ marginTop: "22px", color: "#5c5c5c" }}>
          Already have an account?{" "}
          <Link
            style={{
              color: "#1a8917",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "14px",
            }}
            to="/signin/in"
          >
            Sign in
          </Link>
        </p>
      )}

      <p
        style={{
          fontSize: "13px",
          color: "gray",
          width: "78%",
          textAlign: "center",
          lineHeight: "22px",
          marginTop: "22px",
        }}
      >
        Click “{typeOfLogin}” to agree to Medium’s Terms of Service and
        acknowledge that Medium’s Privacy Policy applies to you.
      </p>
    </div>
  );
}

function ButtonLoginWith({
  image,
  onClick,
  text,
}: {
  onClick(): void;
  text: string;
  image: any;
}) {
  return (
    <button
      style={{
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: "6px 14px",
        borderRadius: "18px",
        width: "200px",
        border: "1px solid #c9c9c9",
        gap: "12px",
        cursor: "pointer",
        color: "#5c5c5c",
      }}
      onClick={() => {
        onClick();
      }}
    >
      {image}
      {text}
    </button>
  );
}
