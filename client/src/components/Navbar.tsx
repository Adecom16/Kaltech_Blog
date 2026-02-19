import { Link } from "react-router-dom";
import {
  carrotIcon,
  mediumLogo,
  NotificationIcon,
  writeBlogIcon,
} from "../assets/icons";
import { useAuth } from "../contexts/Auth";
import AvatarMenu from "./AvatarMenu";
import Search from "./Search";

export default function Navbar({
  notificationsCount,
}: {
  notificationsCount: number;
}) {
  console.log(notificationsCount);

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
          to="/write"
          className="writeBtn"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            color: "var(--text-gray)",
            gap: "8px",
            textDecoration: "none",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--primary-gold)"}
          onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-gray)"}
        >
          <span style={{ color: "inherit" }}>
            {writeBlogIcon}
          </span>
          <p style={{ fontSize: "14.5px", marginTop: "-4px" }}>Write</p>
        </Link>
        <div className="notifactionBtn">
          <Link
            to="/notifications"
            style={{
              color: "var(--text-gray)",
              textDecoration: "none",
              position: "relative",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--primary-gold)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-gray)"}
          >
            {NotificationIcon}
            {notificationsCount > 0 && (
              <span
                style={{
                  fontSize: "9.5px",
                  position: "absolute",
                  top: "-15px",
                  right: "-5px",
                  backgroundColor: "var(--primary-gold)",
                  color: "var(--primary-black)",
                  padding: "3px 3.75px",
                  borderRadius: "4px",
                  fontWeight: "600",
                }}
              >
                {notificationsCount}
              </span>
            )}
          </Link>
        </div>
        <AvatarMenu />
      </div>
    </nav>
  );
}
