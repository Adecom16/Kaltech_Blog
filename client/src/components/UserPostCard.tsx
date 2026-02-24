import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../App";
import { url } from "../baseUrl";
import { useAuth } from "../contexts/Auth";
import { httpRequest } from "../interceptor/axiosInterceptor";
import Dialog from "@mui/material/Dialog";
import { cancelIcon } from "../assets/icons";

type UserPostCardProps = {
  image?: string;
  username: string;
  followers: Array<string>;
  bio?: string;
  userId: string;
};

export default function UserPostCard({
  followers,
  userId,
  username,
  bio,
  image,
}: UserPostCardProps) {
  const { user, handleUser } = useAuth();
  const { socket, handleToast } = useAppContext();
  const [iFollow, setIFollow] = useState<boolean>(
    () => followers.includes(user?._id ?? "") ?? false
  );
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editName, setEditName] = useState(username);
  const [editBio, setEditBio] = useState(bio || "");
  const [editAvatar, setEditAvatar] = useState(image || "");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useState<HTMLInputElement | null>(null)[0];

  const { refetch: follow } = useQuery({
    queryFn: () => httpRequest.put(`${url}/user/follow/${userId}`),
    queryKey: ["handle", "follow", userId],
    enabled: false,
  });
  const { refetch: unfollow } = useQuery({
    queryFn: () => httpRequest.put(`${url}/user/unfollow/${userId}`),
    queryKey: ["handle", "unfollow", userId],
    enabled: false,
  });

  function handleFollowUnfollow() {
    if (iFollow) {
      setIFollow(false);
      unfollow();
    } else {
      setIFollow(true);
      socket.emit("notify", { userId });
      follow();
    }
  }

  async function handleSaveProfile() {
    setSaving(true);
    try {
      const response = await httpRequest.put(`${url}/user/myprofile`, {
        name: editName,
        bio: editBio,
        avatar: editAvatar,
      });

      if (response.data.success) {
        // Update user in context
        const updatedUser = {
          ...user!,
          name: editName,
          bio: editBio,
          avatar: editAvatar,
        };
        handleUser(updatedUser);
        handleToast && handleToast("Profile updated successfully!");
        setShowEditDialog(false);
        // Refresh page to show updated data
        window.location.reload();
      }
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      handleToast && handleToast(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      handleToast && handleToast("Please select an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      handleToast && handleToast("Image size should be less than 5MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await httpRequest.post(`${url}/upload/image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        // Cloudinary returns full URL, don't prepend base URL
        const imageUrl = response.data.url;
        setEditAvatar(imageUrl);
        handleToast && handleToast("Image uploaded successfully!");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      handleToast && handleToast(error.response?.data?.message || "Failed to upload image");
    } finally {
      setUploadingAvatar(false);
    }
  }

  return (
    <>
      <div
        style={{
          width: "90%",
          marginLeft: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginTop: "12px",
        }}
      >
        <Link to={`/user/${userId}`}>
          <img
            style={{
              width: "90px",
              borderRadius: "50%",
              marginBottom: "8px",
              marginLeft: "8px",
            }}
            src={image}
            alt=""
          />
        </Link>
        <Link
          to={`/user/${userId}`}
          style={{
            marginLeft: "8px",
            fontFamily: "Roboto Slab",
            fontSize: "15px",
            color: "inherit",
            textDecoration: "none",
          }}
        >
          {username}
        </Link>
        <Link
          to={`/user/${userId}/followers`}
          style={{
            marginLeft: "8px",
            marginTop: "-4px",
            fontSize: "14px",
            fontFamily: "Roboto",
            color: "#4b4a4a",
            textDecoration: "none",
          }}
        >
          {followers.length > 0 ? followers.length + " Followers" : ""}
        </Link>
        {bio && (
          <p
            style={{
              color: "gray",
              marginLeft: "8px",
              fontSize: "15px",
              lineHeight: "21px",
            }}
          >
            {bio}
          </p>
        )}
        {user?._id !== userId ? (
          <button
            onClick={() => handleFollowUnfollow()}
            style={{
              width: "fit-content",
              padding: "10px 18px",
              marginLeft: "6px",
              borderRadius: "17px",
              border: iFollow ? "1px solid gray" : "none",
              backgroundColor: iFollow ? "transparent" : "rgba(26, 137, 23, 1)",
              color: iFollow ? "black" : "white",
              marginTop: "16px",
              cursor: "pointer",
            }}
          >
            {iFollow ? "Unfollow" : "Follow"}
          </button>
        ) : (
          <p
            onClick={() => setShowEditDialog(true)}
            style={{
              color: "rgba(26, 137, 23, 1)",
              marginLeft: "8px",
              marginTop: !bio ? "5px" : "12px",
              fontSize: "13.4px",
              cursor: "pointer",
            }}
          >
            Edit profile
          </p>
        )}
      </div>

      {/* Edit Profile Dialog */}
      <Dialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          },
        }}
      >
        <div style={{ padding: "24px 32px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontFamily: "Poppins",
                fontSize: "20px",
                fontWeight: "600",
                color: "#292929",
              }}
            >
              Edit Profile
            </h2>
            <span
              onClick={() => setShowEditDialog(false)}
              style={{ cursor: "pointer", color: "#757575" }}
            >
              {cancelIcon}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Avatar Upload with Camera Icon */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "12px",
                  fontFamily: "Roboto",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#292929",
                }}
              >
                Profile Picture
              </label>
              
              {/* Avatar with Camera Icon Overlay */}
              <div style={{ position: "relative", width: "120px", height: "120px", margin: "0 auto" }}>
                <img
                  src={editAvatar || "https://via.placeholder.com/120"}
                  alt="Profile"
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid #e6e6e6",
                  }}
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/120";
                  }}
                />
                
                {/* Camera Icon Button */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  style={{ display: "none" }}
                  id="avatar-upload"
                  disabled={uploadingAvatar}
                />
                <label
                  htmlFor="avatar-upload"
                  style={{
                    position: "absolute",
                    bottom: "0",
                    right: "0",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: uploadingAvatar ? "#ccc" : "var(--primary-gold)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: uploadingAvatar ? "not-allowed" : "pointer",
                    border: "3px solid white",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!uploadingAvatar) {
                      e.currentTarget.style.backgroundColor = "#168714";
                      e.currentTarget.style.transform = "scale(1.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!uploadingAvatar) {
                      e.currentTarget.style.backgroundColor = "var(--primary-gold)";
                      e.currentTarget.style.transform = "scale(1)";
                    }
                  }}
                >
                  {uploadingAvatar ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      style={{ animation: "spin 1s linear infinite" }}
                    >
                      <circle cx="12" cy="12" r="10" opacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  )}
                </label>
              </div>
              
              {uploadingAvatar && (
                <p
                  style={{
                    textAlign: "center",
                    marginTop: "12px",
                    fontSize: "13px",
                    color: "var(--primary-gold)",
                    fontFamily: "Roboto",
                  }}
                >
                  Uploading...
                </p>
              )}
            </div>
            
            {/* Add spinning animation */}
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>

            {/* Name */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontFamily: "Roboto",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#292929",
                }}
              >
                Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #e6e6e6",
                  borderRadius: "4px",
                  fontSize: "15px",
                  fontFamily: "Roboto",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Bio */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontFamily: "Roboto",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#292929",
                }}
              >
                Bio
              </label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #e6e6e6",
                  borderRadius: "4px",
                  fontSize: "15px",
                  fontFamily: "Roboto",
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
              marginTop: "24px",
            }}
          >
            <button
              onClick={() => setShowEditDialog(false)}
              style={{
                padding: "10px 24px",
                border: "1px solid #e6e6e6",
                borderRadius: "24px",
                background: "white",
                cursor: "pointer",
                fontFamily: "Roboto",
                fontSize: "14px",
                color: "#292929",
                fontWeight: "500",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={saving || !editName.trim()}
              style={{
                padding: "10px 24px",
                border: "none",
                borderRadius: "24px",
                background: saving || !editName.trim() ? "#e6e6e6" : "var(--primary-gold)",
                color: saving || !editName.trim() ? "#999" : "var(--primary-black)",
                cursor: saving || !editName.trim() ? "not-allowed" : "pointer",
                fontFamily: "Roboto",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
