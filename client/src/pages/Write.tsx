import { forwardRef, useEffect, useState, useRef } from "react";
import { useAppContext } from "../App";
import TextareaAutosize from "react-textarea-autosize";
import Dialog from "@mui/material/Dialog";
import { TransitionProps } from "@mui/material/transitions";
import Slide from "@mui/material/Slide";
import { cancelIcon } from "../assets/icons";
import WriteNavbar from "../components/WriteNavbar";
import { useAuth } from "../contexts/Auth";
import { useQuery } from "@tanstack/react-query";
import { httpRequest } from "../interceptor/axiosInterceptor";
import { url } from "../baseUrl";
import { useNavigate, useParams } from "react-router-dom";
import useLocalStorage from "../hooks/useLocalStorage";
import Markdown from "../components/Markdown";

const INITAIL_POST_DATA = { title: "", markdown: "", tags: "" };

export default function Write() {
  const { hideNavbar, handleToast } = useAppContext();
  const [post, setPost] = useState(INITAIL_POST_DATA);
  const navigate = useNavigate();
  const { postId } = useParams();
  const [hasPostId, setHasPostId] = useState(false);
  const [localDraft, setLocalDraft] = useLocalStorage(
    "draft",
    INITAIL_POST_DATA
  );
  const [showDraft, setShowDraft] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [showPreview, setShowPreview] = useState(true); // Show live preview
  
  // Undo/Redo state
  const [history, setHistory] = useState<string[]>([""]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isUndoRedo, setIsUndoRedo] = useState(false);

  useEffect(() => {
    if (postId) setHasPostId(true);
    setShowDraft(true);
    return () => setHasPostId(false);
  }, [postId]);

  useEffect(() => {
    hideNavbar(true);
    document.title = "New story -Medium";
    
    // Add keyboard shortcuts for undo/redo
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        handleRedo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      hideNavbar(false);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [historyIndex, history]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousContent = history[newIndex];
      setHistoryIndex(newIndex);
      setIsUndoRedo(true);
      setPost((prev) => ({ ...prev, markdown: previousContent }));
      setLocalDraft((prev) => ({ ...prev, markdown: previousContent }));
      handleToast && handleToast("Undo");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextContent = history[newIndex];
      setHistoryIndex(newIndex);
      setIsUndoRedo(true);
      setPost((prev) => ({ ...prev, markdown: nextContent }));
      setLocalDraft((prev) => ({ ...prev, markdown: nextContent }));
      handleToast && handleToast("Redo");
    }
  };

  const addToHistory = (content: string) => {
    if (isUndoRedo) {
      setIsUndoRedo(false);
      return;
    }
    
    // Don't add if content is the same as current
    if (history[historyIndex] === content) return;
    
    // Remove any history after current index (when typing after undo)
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(content);
    
    // Limit history to last 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }
    
    setHistory(newHistory);
  };

  useEffect(() => {
    setPost(localDraft);
  }, [showDraft]);

  const { refetch: makePost } = useQuery({
    queryFn: () => {
      const params = new URLSearchParams();
      params.append("title", post.title);
      params.append("tags", post.tags);
      params.append("markdown", post.markdown);
      return httpRequest.post(`${url}/post/write`, params);
    },
    queryKey: ["new", "blog", "post"],
    enabled: false,
    onSuccess(data) {
      navigate(`/blog/${data.data._id}`);
    },
  });

  useQuery({
    queryFn: () => httpRequest.get(`${url}/post/${postId}`),
    queryKey: ["edit", "blog", "post", postId],
    enabled: hasPostId,
    onSuccess: (data) => {
      setPost({
        title: data.data.post.title,
        markdown: data.data.post.markdown,
        tags: data.data.post.tags,
      });
    },
  });

  const { refetch: updatePost } = useQuery({
    queryFn: () => {
      const params = new URLSearchParams();
      params.append("title", post.title);
      params.append("tags", post.tags);
      params.append("markdown", post.markdown);
      return httpRequest.put(`${url}/post/${postId}`, params);
    },
    queryKey: ["blog", "post", "update", postId],
    enabled: false,
    onSuccess() {
      navigate(`/blog/${postId}`);
    },
  });

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handletags = (val: string) => {
    setLocalDraft((prev) => ({ ...prev, tags: val }));
    setPost((prev) => {
      return {
        ...prev,
        tags: val,
      };
    });
  };

  const handlePublish = () => {
    if (hasPostId) {
      updatePost();
    } else {
      makePost();
    }
  };

  const handleInsertImage = () => {
    if (imageUrl.trim()) {
      // Use markdown image syntax instead of HTML for better compatibility
      const imageMarkdown = `\n![image](${imageUrl})\n\n`;
      const textarea = textareaRef.current;
      if (textarea) {
        const cursorPos = textarea.selectionStart;
        const textBefore = post.markdown.substring(0, cursorPos);
        const textAfter = post.markdown.substring(cursorPos);
        const newMarkdown = textBefore + imageMarkdown + textAfter;
        
        setPost((prev) => ({ ...prev, markdown: newMarkdown }));
        setLocalDraft((prev) => ({ ...prev, markdown: newMarkdown }));
        
        // Set cursor after image
        setTimeout(() => {
          textarea.focus();
          textarea.selectionStart = textarea.selectionEnd = cursorPos + imageMarkdown.length;
        }, 0);
      } else {
        setPost((prev) => ({ ...prev, markdown: prev.markdown + imageMarkdown }));
        setLocalDraft((prev) => ({ ...prev, markdown: prev.markdown + imageMarkdown }));
      }
      setImageUrl("");
      setPreviewUrl("");
      setSelectedFile(null);
      setShowImageDialog(false);
      setShowToolbar(false);
      handleToast && handleToast("Image inserted successfully");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        handleToast && handleToast("Please select an image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        handleToast && handleToast("Image size should be less than 5MB");
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedFile) return;
    
    setUploadingImage(true);
    
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Url = reader.result as string;
        
        // Try to upload to free service (no API key needed)
        try {
          const formData = new FormData();
          formData.append('image', selectedFile);
          
          // Using freeimage.host (no API key required)
          const response = await fetch('https://freeimage.host/api/1/upload?key=6d207e02198a847aa98d0a2a901485a5', {
            method: 'POST',
            body: formData,
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.image?.url) {
              const imageUrl = data.image.url;
              handleToast && handleToast("Image uploaded successfully");
              insertImageAtCursor(imageUrl);
              return;
            }
          }
        } catch (uploadError) {
          console.log('External upload failed, using base64');
        }
        
        // Fallback: use base64 directly
        handleToast && handleToast("Using local image");
        insertImageAtCursor(base64Url);
        
        setUploadingImage(false);
      };
      
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Upload error:', error);
      handleToast && handleToast("Upload failed");
      setUploadingImage(false);
    }
  };

  const insertImageAtCursor = (imageUrl: string) => {
    // Ensure the URL is valid
    if (!imageUrl || imageUrl.trim() === '') {
      handleToast && handleToast("Invalid image URL");
      return;
    }
    
    const imageMarkdown = `\n![image](${imageUrl})\n\n`;
    const textarea = textareaRef.current;
    
    if (textarea) {
      const cursorPos = textarea.selectionStart;
      const textBefore = post.markdown.substring(0, cursorPos);
      const textAfter = post.markdown.substring(cursorPos);
      const newMarkdown = textBefore + imageMarkdown + textAfter;
      
      setPost((prev) => ({ ...prev, markdown: newMarkdown }));
      setLocalDraft((prev) => ({ ...prev, markdown: newMarkdown }));
      
      // Force preview mode to show the image
      setTimeout(() => {
        setShowPreview(true);
      }, 100);
    } else {
      setPost((prev) => ({ ...prev, markdown: prev.markdown + imageMarkdown }));
      setLocalDraft((prev) => ({ ...prev, markdown: prev.markdown + imageMarkdown }));
      
      // Force preview mode
      setTimeout(() => {
        setShowPreview(true);
      }, 100);
    }
    
    setImageUrl("");
    setPreviewUrl("");
    setSelectedFile(null);
    setShowImageDialog(false);
    setShowToolbar(false);
  };

  const handleMoreMenu = () => {
    setShowImageDialog(true);
  };

  const handleTextareaClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const rect = textarea.getBoundingClientRect();
    const clickY = e.clientY - rect.top + textarea.scrollTop;
    
    // Show toolbar on left side at click position
    setToolbarPosition({
      top: clickY - 20,
      left: -50,
    });
    setShowToolbar(true);
  };

  const handleTextareaFocus = () => {
    // Show toolbar when textarea is focused
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const rect = textarea.getBoundingClientRect();
      setToolbarPosition({
        top: 10,
        left: -50,
      });
      setShowToolbar(true);
    }
  };

  const handleTextareaBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    // Don't hide if clicking on toolbar
    setTimeout(() => {
      if (!document.activeElement?.closest('.floating-toolbar')) {
        setShowToolbar(false);
      }
    }, 200);
  };

  return (
    <>
      <WriteNavbar
        buttonText={hasPostId ? "Save" : "Publish"}
        onClick={handleClickOpen}
        onMoreClick={() => setShowImageDialog(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        disabled={!(post.title.length > 6 && post.markdown.length > 15)}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "80%",
          margin: "auto",
          marginTop: "3vh",
          gap: "22px",
          position: "relative",
        }}
      >
        <TextareaAutosize
          autoFocus={true}
          onChange={(e) => {
            setLocalDraft((prev) => ({ ...prev, title: e.target.value }));
            setPost((prev) => {
              return { ...prev, title: e.target.value };
            });
          }}
          value={post.title}
          placeholder="Title"
          style={{
            width: "100%",
            fontSize: "45px",
            border: "none",
            outline: "transparent",
            resize: "none",
          }}
        />
        
        {/* Content area with floating toolbar */}
        <div style={{ width: "100%", position: "relative" }}>
          {/* Floating Toolbar - Medium Style */}
          {showToolbar && (
            <div
              className="floating-toolbar"
              style={{
                position: "absolute",
                top: `${toolbarPosition.top}px`,
                left: `${toolbarPosition.left}px`,
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                zIndex: 1000,
              }}
            >
              <button
                onClick={() => setShowImageDialog(true)}
                title="Add an image"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  border: "1px solid #e6e6e6",
                  backgroundColor: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  color: "#757575",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f7f7f7";
                  e.currentTarget.style.borderColor = "#757575";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.borderColor = "#e6e6e6";
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M15 10H10V15H10C10 15 10 15 10 15C10 15 10 15 10 15H10V10H5V10C5 10 5 10 5 10C5 10 5 10 5 10H10V5H10C10 5 10 5 10 5C10 5 10 5 10 5H10V10H15Z"
                    fill="currentColor"
                  />
                  <path
                    d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </button>
            </div>
          )}
          
          {/* Live Preview - Shows rendered markdown with images */}
          {showPreview && post.markdown.trim() ? (
            <div
              onClick={(e) => {
                e.preventDefault();
                setShowPreview(false);
                setTimeout(() => {
                  if (textareaRef.current) {
                    textareaRef.current.focus();
                    // Set cursor to end
                    const length = textareaRef.current.value.length;
                    textareaRef.current.setSelectionRange(length, length);
                  }
                }, 50);
              }}
              style={{
                width: "100%",
                fontSize: "20px",
                minHeight: "200px",
                cursor: "text",
                fontFamily: "inherit",
                lineHeight: "1.6",
                padding: "4px 0",
              }}
            >
              <Markdown>{post.markdown}</Markdown>
              <div
                style={{
                  minHeight: "100px",
                  cursor: "text",
                  color: "#999",
                  fontStyle: "italic",
                  marginTop: "20px",
                }}
              >
                Click to continue writing...
              </div>
            </div>
          ) : (
            <TextareaAutosize
              ref={textareaRef}
              autoFocus
              onClick={handleTextareaClick}
              onFocus={() => {
                handleTextareaFocus();
                setShowPreview(false);
              }}
              onBlur={(e) => {
                handleTextareaBlur(e);
                // Don't auto-preview while typing - only when clicking away
              }}
              onChange={(e) => {
                setShowPreview(false); // Stay in edit mode while typing
                const newContent = e.target.value;
                setLocalDraft((prev) => ({ ...prev, markdown: newContent }));
                setPost((prev) => {
                  return { ...prev, markdown: newContent };
                });
                // Add to history with debounce
                addToHistory(newContent);
              }}
              value={post.markdown}
              className="hide_scroll"
              placeholder="Tell your story..."
              style={{
                width: "100%",
                fontSize: "20px",
                border: "none",
                outline: "transparent",
                resize: "none",
                paddingLeft: "0px",
                fontFamily: "inherit",
                lineHeight: "1.6",
              }}
            />
          )}
        </div>
        <Dialog
          fullScreen
          open={open}
          onClose={handleClose}
          TransitionComponent={Transition}
        >
          <DialogComponent
            handleClose={handleClose}
            title={post.title}
            markdown={post.markdown}
            handletags={handletags}
            handlePublish={handlePublish}
            tags={post.tags}
            buttonText={hasPostId ? "Save now" : "Publish now"}
          />
        </Dialog>

        {/* Image Insert Dialog - Medium Style with Upload */}
        <Dialog
          open={showImageDialog}
          onClose={() => {
            setShowImageDialog(false);
            setImageUrl("");
            setPreviewUrl("");
            setSelectedFile(null);
          }}
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
                Add an image
              </h2>
              <span
                onClick={() => {
                  setShowImageDialog(false);
                  setImageUrl("");
                  setPreviewUrl("");
                  setSelectedFile(null);
                }}
                style={{ cursor: "pointer", color: "#757575" }}
              >
                {cancelIcon}
              </span>
            </div>
            
            {/* File Upload Area */}
            <div style={{ marginBottom: "20px" }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
              
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: "2px dashed #e6e6e6",
                  borderRadius: "8px",
                  padding: "32px",
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: "#fafafa",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#1a8917";
                  e.currentTarget.style.backgroundColor = "#f0f9f0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e6e6e6";
                  e.currentTarget.style.backgroundColor = "#fafafa";
                }}
              >
                {previewUrl ? (
                  <div>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        borderRadius: "4px",
                        marginBottom: "12px",
                      }}
                    />
                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        color: "#1a8917",
                        fontFamily: "Roboto",
                        fontWeight: "500",
                      }}
                    >
                      {selectedFile?.name}
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0 0",
                        fontSize: "12px",
                        color: "#757575",
                        fontFamily: "Roboto",
                      }}
                    >
                      Click to change image
                    </p>
                  </div>
                ) : (
                  <div>
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      style={{ margin: "0 auto 12px" }}
                    >
                      <path
                        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
                        stroke="#757575"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "15px",
                        color: "#292929",
                        fontFamily: "Roboto",
                        fontWeight: "500",
                      }}
                    >
                      Click to upload an image
                    </p>
                    <p
                      style={{
                        margin: "8px 0 0 0",
                        fontSize: "13px",
                        color: "#757575",
                        fontFamily: "Roboto",
                      }}
                    >
                      JPEG, PNG, GIF up to 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                margin: "20px 0",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  backgroundColor: "#e6e6e6",
                }}
              />
              <span
                style={{
                  padding: "0 12px",
                  fontSize: "13px",
                  color: "#757575",
                  fontFamily: "Roboto",
                }}
              >
                or paste a link
              </span>
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  backgroundColor: "#e6e6e6",
                }}
              />
            </div>
            
            {/* URL Input */}
            <div style={{ marginBottom: "20px" }}>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste an image link..."
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #e6e6e6",
                  borderRadius: "4px",
                  fontSize: "15px",
                  fontFamily: "Roboto",
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#1a8917";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e6e6e6";
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && imageUrl.trim()) {
                    handleInsertImage();
                  }
                }}
              />
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
                onClick={() => {
                  setShowImageDialog(false);
                  setImageUrl("");
                  setPreviewUrl("");
                  setSelectedFile(null);
                }}
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
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f7f7f7";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                Cancel
              </button>
              
              {selectedFile && !imageUrl ? (
                <button
                  onClick={handleUploadImage}
                  disabled={uploadingImage}
                  style={{
                    padding: "10px 24px",
                    border: "none",
                    borderRadius: "24px",
                    background: uploadingImage ? "#e6e6e6" : "#1a8917",
                    color: uploadingImage ? "#999" : "white",
                    cursor: uploadingImage ? "not-allowed" : "pointer",
                    fontFamily: "Roboto",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.2s",
                  }}
                >
                  {uploadingImage ? "Uploading..." : "Upload & Insert"}
                </button>
              ) : (
                <button
                  onClick={handleInsertImage}
                  disabled={!imageUrl.trim()}
                  style={{
                    padding: "10px 24px",
                    border: "none",
                    borderRadius: "24px",
                    background: imageUrl.trim() ? "#1a8917" : "#e6e6e6",
                    color: imageUrl.trim() ? "white" : "#999",
                    cursor: imageUrl.trim() ? "pointer" : "not-allowed",
                    fontFamily: "Roboto",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (imageUrl.trim()) {
                      e.currentTarget.style.backgroundColor = "#168714";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (imageUrl.trim()) {
                      e.currentTarget.style.backgroundColor = "#1a8917";
                    }
                  }}
                >
                  Insert image
                </button>
              )}
            </div>
          </div>
        </Dialog>
      </div>
    </>
  );
}

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DialogComponent = ({
  handleClose,
  title,
  markdown,
  handletags,
  handlePublish,
  tags: tagsGiven,
  buttonText,
}: {
  handleClose(): void;
  title: string;
  markdown: string;
  handletags(val: string): void;
  handlePublish(): void;
  tags: string;
  buttonText: string;
}) => {
  const [tags, setTags] = useState(tagsGiven);
  const { user } = useAuth();
  const test: string = markdown ?? "";
  const codeRegex = /<code>(.*?)<\/code>/g;
  const withoutCode = markdown.replace(codeRegex, "");
  var imgRegex = /<img.*?src=['"](.*?)['"]/;
  const image = imgRegex.exec(test)?.at(1);
  const htmlRegexG = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g;
  const summary = withoutCode.replace(htmlRegexG, "");
  return (
    <>
      <div
        className="dialog_main"
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          height: "90vh",
          alignItems: "center",
        }}
      >
        <div
          className="wrapper_write_dialog"
          style={{
            width: "900px",
            height: "350px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <div
            className="left_write_dialog"
            style={{ width: "47%", display: "flex", flexDirection: "column" }}
          >
            <h4
              style={{
                marginTop: "0px",
                marginBottom: "22px",
                color: "rgb(61 61 61)",
              }}
            >
              Story Preview
            </h4>
            <div
              className="image_preview"
              style={{
                width: "100%",
                height: "200px",
                backgroundColor: "#fafafa",
                color: "rgb(153 153 153)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              {image ? (
                <img
                  src={image}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  alt="img"
                />
              ) : (
                <p
                  style={{ width: "70%", fontSize: "14px", lineHeight: "22px" }}
                >
                  Include a high-quality image in your story to make it more
                  inviting to readers.
                </p>
              )}
            </div>
            <h4
              style={{
                marginTop: "15pxpx",
                marginBottom: "4px",
                borderBottom: "2px solid #c1bdbd",
                color: "rgb(61 61 61)",
                paddingBottom: "5px",
              }}
            >
              {title}
            </h4>
            <p
              style={{
                borderBottom: "2px solid #c1bdbd",
                color: "rgb(153 153 153)",
                paddingBottom: "15px",
                marginTop: "5px",
              }}
            >
              {summary.length > 112 ? summary.slice(0, 112) + " ..." : summary}
            </p>
          </div>
          <div
            className="right_write_dialog"
            style={{
              width: "47%",
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            <span
              onClick={handleClose}
              style={{
                position: "absolute",
                top: "-150px",
                right: "-34px",
                cursor: "pointer",
              }}
            >
              {cancelIcon}
            </span>
            <p
              style={{
                fontWeight: "bold",
                color: "rgb(113 112 112)",
                fontSize: "15.8px",
                marginBottom: "18px",
              }}
            >
              Publishing to{" "}
              <span style={{ color: "rgb(61 61 61)" }}>{user?.name}</span>
            </p>
            <p style={{ margin: "12px 0", color: "gray" }}>
              Add or change topics (up to 5) so readers know what your story is
              about
            </p>
            <input
              value={tags}
              onChange={(e) => {
                setTags(e.target.value);
                handletags(e.target.value);
              }}
              style={{
                margin: "10px 0",
                height: "45px",
                border: "2px solid #eeecec",
                backgroundColor: "#fafafa",
                padding: "4px 8px",
                outline: "transparent",
              }}
              type="text"
              placeholder="Add topics followed by commas eg : Java,Typescript"
            />
            <button
              onClick={() => {
                tags.length > 0 && handlePublish();
              }}
              style={{
                marginTop: "18px",
                color: "white",
                backgroundColor: tags.length > 0 ? "#1a8917" : "#cbe4ca",
                border: "none",
                outline: "transparent",
                width: "fit-content",
                padding: "10px 12px",
                borderRadius: "17px",
                cursor: "pointer",
              }}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
