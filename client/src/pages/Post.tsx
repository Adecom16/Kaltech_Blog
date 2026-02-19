import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { httpRequest } from "../interceptor/axiosInterceptor";
import { url } from "../baseUrl";
import Markdown from "../components/Markdown";
import Chip from "../components/Chip";
import {
  clapIcon,
  commentIcon,
  moreIcon,
  savePost,
  shareicon,
} from "../assets/icons";
import TopPicks from "../components/TopPicks";
import UserPostCard from "../components/UserPostCard";
import PostAuthor from "../components/PostAuthor";
import useShare from "../hooks/useShare";
import { useMemo, useState } from "react";
import { useAuth } from "../contexts/Auth";
import MoreFrom from "../components/MoreFrom";
import { GetStarted } from "../components/AvatarMenu";
import { useAppContext } from "../App";
import PostMenu from "../components/PostMenu";
import { calculateReadingTime, formatReadingTime } from "../utils/readingTime";

export default function Post() {
  const { webShare } = useShare();
  const { user, isAuthenticated } = useAuth();
  const { id } = useParams();
  const postUrl = useMemo(() => window.location.href, [id]);
  const [votes, setVotes] = useState(0);
  const [turnBlack, setTurnBlack] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const { socket } = useAppContext();
  const navigate = useNavigate();
  const { handleToast } = useAppContext();

  const { isLoading, error, data } = useQuery({
    queryFn: () => httpRequest.get(`${url}/post/${id}`),
    queryKey: ["blog", id],
    onSuccess: (data) => {
      document.title = data.data.post.title + " - KALTECH";
      setVotes(data.data.post.votes.length ?? 0);
      setTurnBlack(data.data.post.votes.includes(user?._id));
    },
  });

  // Calculate reading time - moved after data is available
  const readingTime = useMemo(() => {
    if (data?.data?.post?.markdown) {
      const minutes = calculateReadingTime(data.data.post.markdown);
      return formatReadingTime(minutes);
    }
    return "4 min read";
  }, [data]);

  const { refetch: clap } = useQuery({
    queryFn: () => httpRequest.patch(`${url}/post/vote/${id}`),
    queryKey: ["vote", id],
    enabled: false,
    onSuccess: (res) => {
      if (res.data.success) {
        socket.emit("notify", { userId: data?.data.user._id });
        setVotes((prev) => prev + 1);
      }
    },
  });

  const { refetch: savePostCall } = useQuery({
    queryFn: () => httpRequest.patch(`${url}/post/save/${id}`, {}),
    queryKey: ["save", id],
    enabled: false,
    onSuccess() {
      handleToast("Story saved to Reading list");
    },
  });

  const { refetch: fetchComments } = useQuery({
    queryFn: () => httpRequest.get(`${url}/post/comments/${id}`),
    queryKey: ["comments", id],
    enabled: false,
    onSuccess: (res) => {
      setComments(res.data);
    },
    onError: (err) => {
      console.error("Failed to fetch comments:", err);
      // Don't show error to user, just log it
    },
  });

  const { refetch: postComment } = useQuery({
    queryFn: () =>
      httpRequest.patch(`${url}/post/comment/${id}`, { comment: commentText }),
    queryKey: ["postComment", id, commentText],
    enabled: false,
    onSuccess: () => {
      handleToast("Comment posted successfully");
      setCommentText("");
      fetchComments();
    },
  });

  function handleSavePost() {
    if (!isAuthenticated) {
      navigate("/signin/in");
      return;
    }
    savePostCall();
  }

  function handleShowComments() {
    if (!isAuthenticated) {
      navigate("/signin/in");
      return;
    }
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
      fetchComments();
    }
  }

  function handlePostComment() {
    if (!commentText.trim()) {
      handleToast("Comment cannot be empty");
      return;
    }
    postComment();
  }
  function votePost() {
    setTurnBlack(true);
    clap();
  }

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { refetch: ignoreAuthorCall } = useQuery({
    queryFn: () =>
      httpRequest.patch(`${url}/post/ignoreAuthor/${data?.data.user._id}`),
    queryKey: ["ignoreAuthor", data?.data.user._id],
    enabled: false,
  });

  const { refetch: deleteStory } = useQuery({
    queryFn: () => httpRequest.delete(`${url}/post/${id}`),
    queryKey: ["delete", "page", id],
    enabled: false,
    onSuccess() {
      handleToast("Story deleted successfully");
      handleClose();
      navigate(-1);
    },
  });

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  function deletePost() {
    deleteStory();
  }

  function editPost() {
    navigate(`/write/${id}`);
  }

  function ignoreAuthor() {
    ignoreAuthorCall();
    handleToast("Got it. You will not see this author's story again");
    handleClose();
  }

  if (error) return <p>Something went wrong ...</p>;
  if (isLoading) return <p>Loading ...</p>;

  // Check if user needs to sign in to read full article
  const needsAuth = !isAuthenticated;
  const showPaywall = needsAuth && data?.data?.post?.markdown?.length > 500;

  return (
    <div
      className="container"
      style={{ display: "flex", flexDirection: "row" }}
    >
      <div
        className="postsList"
        style={{
          borderRight: "solid 1px rgba(242, 242, 242, 1)",
          width: "69%",
          paddingTop: "3vh",
          minHeight: "97vh",
          display: "flex",
          flexDirection: "column",
          gap: "38px",
          marginRight: "auto",
        }}
      >
        <div
          className="post_content"
          style={{
            width: "90%",
            marginRight: "auto",
            position: "relative",
          }}
        >
          {data?.data && (
            <PostAuthor
              title={data.data.post.title}
              avatar={data.data.user.avatar}
              postId={data.data.post._id}
              timestamp={data.data.post.createdAt}
              username={data.data.user.name}
              userId={data.data.user._id}
              postUrl={postUrl}
              anchorEl={anchorEl}
              deletePost={deletePost}
              open={open}
              handleClose={handleClose}
              editPost={editPost}
              ignoreAuthor={ignoreAuthor}
              handleClick={handleClick}
            />
          )}
          <h1
            style={{
              fontWeight: "bolder",
              fontFamily: "Poppins",
              fontSize: "32px",
              marginBottom: "18px",
            }}
          >
            {data?.data?.post.title}
          </h1>
          <div className="markdown" style={{ position: "relative" }}>
            <Markdown>
              {showPaywall
                ? data?.data?.post?.markdown.substring(0, 500) + "..."
                : data?.data?.post?.markdown}
            </Markdown>
            
            {/* Paywall Overlay */}
            {showPaywall && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "300px",
                  background:
                    "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 40%, rgba(255,255,255,1) 70%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingBottom: "40px",
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    maxWidth: "400px",
                    padding: "20px",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "Poppins",
                      fontSize: "24px",
                      marginBottom: "12px",
                      color: "#292929",
                    }}
                  >
                    Sign in to read the full story
                  </h3>
                  <p
                    style={{
                      fontFamily: "Roboto",
                      fontSize: "15px",
                      color: "#757575",
                      marginBottom: "24px",
                      lineHeight: "1.5",
                    }}
                  >
                    Become a member to get unlimited access to all stories on KALTECH
                  </p>
                  <button
                    onClick={() => navigate("/signin/in")}
                    style={{
                      padding: "12px 32px",
                      backgroundColor: "var(--primary-gold)",
                      color: "var(--primary-black)",
                      border: "none",
                      borderRadius: "24px",
                      fontSize: "15px",
                      fontWeight: "500",
                      cursor: "pointer",
                      fontFamily: "Roboto",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#168714";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--primary-gold)";
                    }}
                  >
                    Sign in
                  </button>
                  <p
                    style={{
                      fontFamily: "Roboto",
                      fontSize: "13px",
                      color: "#757575",
                      marginTop: "16px",
                    }}
                  >
                    Not a member?{" "}
                    <span
                      onClick={() => navigate("/signin/new")}
                      style={{
                        color: "var(--primary-gold)",
                        cursor: "pointer",
                        fontWeight: "500",
                      }}
                    >
                      Sign up
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
          <div
            className="bottomScreen"
            style={{
              marginTop: "60px",
            }}
          >
            <div className="relatedTags">
              {data?.data?.post.tags.map((item: string) => {
                return (
                  <Chip
                    key={item}
                    style={{
                      backgroundColor: "rgb(242, 242, 242)",
                      fontFamily: "Questrial",
                      padding: "10px 18px",
                      margin: "4.5px 3px",
                      fontSize: "13.8px",
                    }}
                    text={item}
                  />
                );
              })}
            </div>
            <div
              className="post_reach"
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                margin: "5vh 0",
              }}
            >
              <div
                className="left_tile"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "25px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "8px",
                    alignItems: "center",
                  }}
                >
                  <span
                    onClick={() =>
                      data?.data.post.userId !== user?._id && votePost()
                    }
                    style={{
                      ...iconColor,
                      color: turnBlack ? "black" : "rgb(171 169 169)",
                      cursor:
                        data?.data.post.userId == user?._id
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    {clapIcon}
                  </span>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "gray",
                      fontFamily: "Roboto",
                    }}
                  >
                    {votes || ""}
                  </p>
                </div>
                <span onClick={handleShowComments} style={iconColor}>
                  {commentIcon}
                </span>
              </div>
              <div
                className="right_tile"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "25px",
                }}
              >
                <span
                  onClick={() =>
                    webShare({
                      title: data?.data.post.title,
                      text: "Check out this KALTECH article",
                      url: postUrl,
                    })
                  }
                  style={iconColor}
                >
                  {shareicon}
                </span>
                <span onClick={handleSavePost} style={iconColor}>
                  {savePost}
                </span>
                <span onClick={handleClick} style={iconColor}>
                  {moreIcon}
                </span>
                <PostMenu
                  anchorEl={anchorEl}
                  deletePost={deletePost}
                  open={open}
                  handleClose={handleClose}
                  editPost={editPost}
                  ignoreAuthor={ignoreAuthor}
                  userId={data?.data.user._id}
                />
              </div>
            </div>

            {/* Comments Section */}
            <div
              className="comments_section"
              style={{
                marginTop: "40px",
                borderTop: "1px solid rgb(242, 242, 242)",
                paddingTop: "30px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h3
                  style={{
                    fontFamily: "Poppins",
                    fontSize: "20px",
                    fontWeight: "600",
                  }}
                >
                  Responses ({comments.length})
                </h3>
                <button
                  onClick={handleShowComments}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgb(26, 137, 23)",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontFamily: "Roboto",
                  }}
                >
                  {showComments ? "Hide" : "Show"} Comments
                </button>
              </div>

              {showComments && (
                <>
                  {/* Comment Input */}
                  <div
                    style={{
                      marginBottom: "30px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="What are your thoughts?"
                      style={{
                        width: "100%",
                        minHeight: "80px",
                        padding: "12px",
                        border: "1px solid rgb(242, 242, 242)",
                        borderRadius: "4px",
                        fontFamily: "Roboto",
                        fontSize: "14px",
                        resize: "vertical",
                      }}
                    />
                    <button
                      onClick={handlePostComment}
                      disabled={!commentText.trim()}
                      style={{
                        alignSelf: "flex-end",
                        padding: "8px 20px",
                        backgroundColor: commentText.trim()
                          ? "rgb(26, 137, 23)"
                          : "rgb(200, 200, 200)",
                        color: "white",
                        border: "none",
                        borderRadius: "20px",
                        cursor: commentText.trim() ? "pointer" : "not-allowed",
                        fontFamily: "Roboto",
                        fontSize: "14px",
                      }}
                    >
                      Respond
                    </button>
                  </div>

                  {/* Comments List */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "20px",
                    }}
                  >
                    {comments.length === 0 ? (
                      <p
                        style={{
                          color: "gray",
                          fontFamily: "Roboto",
                          fontSize: "14px",
                          textAlign: "center",
                          padding: "20px",
                        }}
                      >
                        No comments yet. Be the first to respond!
                      </p>
                    ) : (
                      comments.map((item: any, index: number) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            gap: "12px",
                            padding: "15px",
                            backgroundColor: "rgb(250, 250, 250)",
                            borderRadius: "8px",
                          }}
                        >
                          <img
                            src={item.user?.avatar}
                            alt={item.user?.name}
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginBottom: "8px",
                              }}
                            >
                              <Link
                                to={`/user/${item.user?._id}`}
                                style={{
                                  fontFamily: "Roboto",
                                  fontSize: "14px",
                                  fontWeight: "600",
                                  color: "inherit",
                                  textDecoration: "none",
                                }}
                              >
                                {item.user?.name}
                              </Link>
                            </div>
                            <p
                              style={{
                                fontFamily: "Roboto",
                                fontSize: "14px",
                                lineHeight: "1.6",
                                color: "rgb(41, 41, 41)",
                              }}
                            >
                              {item.comment}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          {id && data?.data?.user._id && (
            <MoreFrom
              userId={data?.data?.user._id}
              postId={id}
              avatar={data?.data?.user.avatar}
              username={data?.data?.user.name}
              bio={data.data?.user?.bio}
              followers={data.data?.user?.followers}
            />
          )}
        </div>
      </div>
      <div
        className="rightbar"
        style={{
          width: "31%",
          paddingTop: "3vh",
          display: "flex",
          flexDirection: "column",
          gap: "38px",
        }}
      >
        {data?.data.user && (
          <UserPostCard
            followers={data.data.user.followers}
            userId={data.data.user._id}
            username={data.data.user.name}
            bio={data.data.user.bio}
            image={data.data.user.avatar}
          />
        )}
        {isAuthenticated ? (
          <TopPicks text="More from KALTECH" showImg={true} />
        ) : (
          <GetStarted
            style={{ width: "83%", marginLeft: "20px" }}
            topStyle={{ marginTop: "22px" }}
          />
        )}
      </div>
    </div>
  );
}

const iconColor = {
  color: "rgba(117, 117, 117, 1)",
  cursor: "pointer",
};
