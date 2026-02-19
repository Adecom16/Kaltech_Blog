import { Link } from "react-router-dom";
import completeLogo from "../assets/logo.png";

export default function YellowNavbar() {
  return (
    <div
      style={{
        width: "100%",
        height: "80px",
        background: "linear-gradient(90deg, var(--primary-black) 0%, var(--text-dark) 100%)",
        borderBottom: "2px solid var(--primary-gold)",
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
        <div className="left_cont_nav_un">
          <Link to="/">
            <img className="logo_img" src={completeLogo} alt="" />
          </Link>
        </div>
        <div
          className="right_cont_nav_un"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Link
            to="/signin/write"
            className="writeBtn"
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              color: "black",
              gap: "8px",
              textDecoration: "none",
            }}
          >
            Write
          </Link>
          <Link
            to="/signin/in"
            style={{
              border: "none",
              outline: "transparent",
              background: "transparent",
              borderRadius: "17px",
              padding: "8px 12px",
              color: "black",
              marginRight: "-5px",
              fontSize: "14px",
              textDecoration: "none",
            }}
          >
            Sign In
          </Link>
          <Link
            to="/signin/new"
            style={{
              backgroundColor: "black",
              color: "white",
              border: "none",
              outline: "none",
              borderRadius: "17px",
              padding: "8px 12px",
              fontSize: "14px",
              textDecoration: "none",
            }}
          >
            Get started
          </Link>
        </div>
      </div>
    </div>
  );
}
