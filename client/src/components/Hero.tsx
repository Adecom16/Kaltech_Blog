import { Link } from "react-router-dom";
import mmm from "../assets/mmm.png";

export default function Hero() {
  return (
    <div
      style={{
        width: "100%",
        height: "450px",
        background: "linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)",
        borderBottom: "3px solid var(--primary-gold)",
        position: "relative",
      }}
    >
      <div
        className="container_70"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        <div
          className="left_hero"
          style={{ display: "flex", flexDirection: "column", gap: "42px" }}
        >
          <p
            className="hero_title"
            style={{
              fontSize: "100px",
              fontFamily: "'Poppins', sans-serif",
              zIndex: 99,
              color: "var(--primary-white)",
              fontWeight: "800",
              lineHeight: "1.1",
            }}
          >
            <span style={{ color: "var(--primary-gold)" }}>Innovate.</span><br/>
            <span>Create.</span><br/>
            <span>Inspire.</span>
          </p>
          <p
            className="hero_desc"
            style={{ 
              fontSize: "24px", 
              width: "70%", 
              zIndex: 99,
              color: "var(--secondary-gold)",
              lineHeight: "1.5",
            }}
          >
            Discover cutting-edge insights, technology trends, and expert knowledge from innovators worldwide.
          </p>
          <Link
            to="/signin/new"
            style={{
              backgroundColor: "var(--primary-gold)",
              color: "var(--primary-black)",
              border: "none",
              outline: "none",
              borderRadius: "30px",
              padding: "16px 40px",
              fontSize: "18px",
              textDecoration: "none",
              width: "fit-content",
              fontWeight: "700",
              transition: "all 0.3s",
              boxShadow: "0 4px 15px rgba(212, 175, 55, 0.4)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(212, 175, 55, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(212, 175, 55, 0.4)";
            }}
          >
            Start Exploring
          </Link>
        </div>
        <div className="right_hero">
          <div
            style={{
              height: "95%",
              width: "400px",
              marginLeft: "auto",
              position: "absolute",
              right: "50px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "linear-gradient(135deg, var(--primary-gold) 0%, var(--secondary-gold) 100%)",
              borderRadius: "20px",
              opacity: "0.15",
            }}
          />
        </div>
      </div>
    </div>
  );
}
