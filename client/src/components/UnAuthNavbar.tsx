import { Link } from "react-router-dom";
import { DEFAULT_IMG } from "../App";
import {
  carrotIcon,
  mediumLogo,
  NotificationIcon,
  writeBlogIcon,
} from "../assets/icons";
import AvatarMenu from "./AvatarMenu";
import Search from "./Search";

export default function UnAuthNavbar() {
  return (
    <nav
      style={{
        height: "56px",
        borderBottom: "solid 1px var(--border-light)",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "var(--primary-white)",
      }}
    >
      <div
        className="left"
        style={{
          marginLeft: "23px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "17px",
        }}
      >
        <Link to="/" style={{ textDecoration: "none" }}>{mediumLogo}</Link>
        <Search />
      </div>
      <div
        className="right"
        style={{
          marginRight: "25px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "30px",
          height: "100%",
        }}
      >
        <Link
          to="/signin/write"
          className="writeBtn"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            color: "gray",
            gap: "8px",
            textDecoration: "none",
          }}
        >
          <span style={{ color: "rgba(117, 117, 117, 1)" }}>
            {writeBlogIcon}
          </span>
          <p style={{ fontSize: "14.5px", marginTop: "-4px" }}>Write</p>
        </Link>
        <div
          className="btns"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Link
            to="/signin/new"
            style={{
              backgroundColor: "var(--primary-gold)",
              color: "var(--primary-black)",
              border: "none",
              outline: "none",
              borderRadius: "20px",
              padding: "10px 20px",
              fontSize: "14px",
              textDecoration: "none",
              fontWeight: "600",
              transition: "all 0.2s",
              boxShadow: "0 2px 8px rgba(212, 175, 55, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(212, 175, 55, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(212, 175, 55, 0.3)";
            }}
          >
            Sign up
          </Link>
          <Link
            to="/signin/in"
            style={{
              border: "1px solid var(--primary-gold)",
              outline: "transparent",
              background: "transparent",
              borderRadius: "20px",
              padding: "9px 20px",
              color: "var(--primary-black)",
              marginRight: "-5px",
              fontSize: "14px",
              textDecoration: "none",
              fontWeight: "600",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--secondary-gold)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Sign In
          </Link>
        </div>
        <AvatarMenu />
      </div>
    </nav>
  );
}
