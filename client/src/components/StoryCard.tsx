import { Link } from "react-router-dom";
import "./storyCard.css";
type StoryCardProps = {
  showImg: boolean;
  username: string;
  title: string;
  userId: string;
  postId: string;
  image: string;
  avatar: string;
};

export default function StoryCard({
  showImg,
  image,
  postId,
  title,
  userId,
  username,
  avatar,
}: StoryCardProps) {
  return (
    <div style={{ marginLeft: "8px", marginBottom: showImg ? "15px" : "0px" }}>
      <div
        className="firstLine"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Link to={`/user/${userId}`}>
          <img
            style={{ width: "22px", borderRadius: "50%" }}
            src={avatar}
            alt=""
          />
        </Link>
        <Link
          className="font"
          to={`/user/${userId}`}
          style={{
            fontFamily: "Roboto Slab",
            fontSize: "12.75px",
            letterSpacing: "0.25px",
            color: "rgb(29 29 29)",
            textDecoration: "none",
            marginTop: "-4px",
          }}
        >
          {username}
        </Link>
      </div>
      <div
        className="post_details"
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Link
          to={`/blog/${postId}`}
          style={{
            fontFamily: "Poppins",
            fontWeight: "bolder",
            fontSize: "14px",
            marginTop: "5px",
            marginRight: showImg ? "10px" : 0,
            color: "inherit",
            textDecoration: "none",
          }}
        >
          {title}
        </Link>
        {showImg && (
          <Link to={`/blog/${postId}`} className="img">
            <img
              style={{
                marginTop: "-12px",
                width: "55px",
                height: "55px",
                objectFit: "cover",
              }}
              src={image}
              alt=""
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=55&h=55&fit=crop";
              }}
            />
          </Link>
        )}
      </div>
    </div>
  );
}
