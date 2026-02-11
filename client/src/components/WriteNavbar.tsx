import { Link } from "react-router-dom";
import { mediumLogo, moreIcon, NotificationIcon } from "../assets/icons";
import AvatarMenu from "./AvatarMenu";

type WriteNavType = {
  onClick(): void;
  onMoreClick(): void;
  onUndo?(): void;
  onRedo?(): void;
  canUndo?: boolean;
  canRedo?: boolean;
  disabled: boolean;
  buttonText: string;
};

export default function WriteNavbar({
  onClick,
  onMoreClick,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  disabled,
  buttonText,
}: WriteNavType) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        height: "70px",
      }}
    >
      <div className="left_write_nav">
        <Link to="/">{mediumLogo}</Link>
      </div>
      <div
        className="right_write_nav"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "18px",
        }}
      >
        {/* Undo/Redo buttons - Only show if handlers are provided */}
        {onUndo && onRedo && (
          <div style={{ display: "flex", gap: "8px", marginRight: "8px" }}>
            <button
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              style={{
                background: "none",
                border: "1px solid #e6e6e6",
                borderRadius: "4px",
                padding: "6px 10px",
                cursor: canUndo ? "pointer" : "not-allowed",
                opacity: canUndo ? 1 : 0.4,
                display: "flex",
                alignItems: "center",
                transition: "all 0.2s",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 7v6h6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              style={{
                background: "none",
                border: "1px solid #e6e6e6",
                borderRadius: "4px",
                padding: "6px 10px",
                cursor: canRedo ? "pointer" : "not-allowed",
                opacity: canRedo ? 1 : 0.4,
                display: "flex",
                alignItems: "center",
                transition: "all 0.2s",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 7v6h-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
        
        {/* cbe4ca */}
        <button
          disabled={disabled}
          onClick={() => {
            !disabled && onClick();
          }}
          style={{
            color: "white",
            backgroundColor: disabled ? "#cbe4ca" : "#1a8917",
            border: "none",
            outline: "none",
            padding: "6px 12px",
            borderRadius: "15px",
            letterSpacing: "0.2px",
            cursor: "pointer",
          }}
        >
          {buttonText}
        </button>
        <span
          onClick={onMoreClick}
          style={{ color: "gray", cursor: "pointer" }}
          title="Insert image"
        >
          {moreIcon}
        </span>
        <Link to="/notifications">
          <span style={{ color: "gray", cursor: "pointer" }}>
            {NotificationIcon}
          </span>
        </Link>
        <AvatarMenu />
      </div>
    </div>
  );
}
