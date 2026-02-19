import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { url } from "../baseUrl";
import Post from "../components/Post";
import SuggestionBar from "../components/SuggestionBar";
import Topics from "../components/Topics";
import TopPicks from "../components/TopPicks";
import WhoToFollow from "../components/WhoToFollow";
import { useAuth } from "../contexts/Auth";
import { httpRequest } from "../interceptor/axiosInterceptor";
import UnAuthHome from "./UnAuthHome";

export default function Home() {
  const { tag } = useParams();
  const { isAuthenticated, user } = useAuth();
  
  // Debug logging
  console.log('Home - isAuthenticated:', isAuthenticated);
  console.log('Home - user:', user);
  console.log('Home - tag:', tag);
  
  // Always show HomeContainer - it will fetch public or authenticated posts
  return <HomeContainer tag={tag as string} />;
}

function HomeContainer({ tag }: { tag: string }) {
  const { isAuthenticated } = useAuth();
  const [posts, setposts] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  document.title = "KALTECH";
  
  // Authenticated users - personalized feed
  useQuery({
    queryFn: () => {
      console.log('Fetching home posts (authenticated)...');
      console.log('Access token:', localStorage.getItem('access_token'));
      return httpRequest.get(`${url}/post/home`);
    },
    queryKey: ["home", "authenticated"],
    enabled: tag == undefined && isAuthenticated,
    onSuccess: (data) => {
      console.log('Home posts loaded:', data.data);
      setposts(data.data);
      setLoading(false);
    },
    onError: (err: any) => {
      console.error("Failed to fetch posts:", err);
      console.error("Error response:", err.response);
      setError(err.response?.data?.message || "Failed to load posts");
      setLoading(false);
    },
  });
  
  // Unauthenticated users - public feed
  useQuery({
    queryFn: () => {
      console.log('Fetching public posts (unauthenticated)...');
      return httpRequest.get(`${url}/post/public`);
    },
    queryKey: ["home", "public"],
    enabled: tag == undefined && !isAuthenticated,
    onSuccess: (data) => {
      console.log('Public posts loaded:', data.data);
      setposts(data.data);
      setLoading(false);
    },
    onError: (err: any) => {
      console.error("Failed to fetch public posts:", err);
      setError(err.response?.data?.message || "Failed to load posts");
      setLoading(false);
    },
  });
  
  useQuery({
    queryFn: () =>
      httpRequest.get(
        `${url}/post/${tag === "Following" ? "users" : "topic"}/${tag}`
      ),
    queryKey: ["home", "topic", tag],
    enabled: tag != undefined,
    onSuccess: (data) => {
      setposts(data.data);
      setLoading(false);
    },
    onError: (err: any) => {
      console.error("Failed to fetch posts:", err);
      setError(err.response?.data?.message || "Failed to load posts");
      setLoading(false);
    },
  });

  function filterPost(postId: string) {
    setposts((prev) => prev.filter((item) => item.post._id !== postId));
  }

  function filterAuthorPost(userId: string) {
    setposts((prev) => prev.filter((item) => item.user._id !== userId));
  }
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
        {isAuthenticated && <SuggestionBar activeTab={tag ?? "For you"} />}
        <div
          className="inner_container_main"
          style={{
            width: "90%",
            marginRight: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "30px",
            marginTop: !isAuthenticated ? "22px" : 0,
          }}
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#757575" }}>
              <p>Loading posts...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#d32f2f" }}>
              <p>{error}</p>
              <p style={{ fontSize: "14px", marginTop: "10px" }}>
                Please check your connection and try refreshing the page.
              </p>
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#757575" }}>
              <h3 style={{ marginBottom: "16px" }}>No posts yet</h3>
              <p style={{ fontSize: "15px", lineHeight: "1.6" }}>
                Be the first to share your story! Click the "Write" button to create your first post.
              </p>
            </div>
          ) : (
            posts.map((item) => {
              return (
                <Post
                  showUserList={true}
                  filterPost={filterPost}
                  filterAuthorPost={filterAuthorPost}
                  postId={item.post._id}
                  timestamp={item.post.createdAt}
                  title={item.post.title}
                  username={item.user.name}
                  userId={item.user._id}
                  image={item.post.image}
                  tag={item.post.tags.at(0)}
                  userImage={item.user.avatar}
                  key={item.post._id}
                  summary={item.post.summary}
                />
              );
            })
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
        {isAuthenticated && <TopPicks text="Top Picks" />}
        <Topics />
        {isAuthenticated && <WhoToFollow />}
      </div>
    </div>
  );
}
