import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import BubbleMenu from '@tiptap/extension-bubble-menu';
import { useEffect, useState } from 'react';

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageClick: () => void;
}

export default function TipTapEditor({ content, onChange, onImageClick }: TipTapEditorProps) {
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [formatMenuPosition, setFormatMenuPosition] = useState({ top: 0, left: 0 });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: 'Tell your story...',
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      BubbleMenu.configure({
        element: document.createElement('div'),
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        // Text is selected
        setShowFormatMenu(true);
      } else {
        setShowFormatMenu(false);
      }
    },
  });

  // Update editor content when prop changes (for loading drafts)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Function to insert image
  useEffect(() => {
    if (editor) {
      (window as any).insertImageToEditor = (url: string) => {
        editor.chain().focus().setImage({ src: url }).run();
      };
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div style={{ width: "100%", position: "relative" }}>
      {/* Floating Format Menu - Shows when text is selected */}
      {showFormatMenu && editor && (
        <div
          style={{
            position: "fixed",
            zIndex: 1000,
            display: "flex",
            gap: "4px",
            padding: "8px",
            background: "#1a1a1a",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            transform: "translateX(-50%)",
            left: "50%",
            top: "100px",
          }}
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            style={{
              padding: "6px 10px",
              border: "none",
              background: editor.isActive('bold') ? "#4a4a4a" : "transparent",
              color: "white",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
            }}
            title="Bold (Ctrl+B)"
          >
            B
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            style={{
              padding: "6px 10px",
              border: "none",
              background: editor.isActive('italic') ? "#4a4a4a" : "transparent",
              color: "white",
              borderRadius: "4px",
              cursor: "pointer",
              fontStyle: "italic",
              fontSize: "14px",
            }}
            title="Italic (Ctrl+I)"
          >
            I
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            style={{
              padding: "6px 10px",
              border: "none",
              background: editor.isActive('underline') ? "#4a4a4a" : "transparent",
              color: "white",
              borderRadius: "4px",
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: "14px",
            }}
            title="Underline (Ctrl+U)"
          >
            U
          </button>

          <div style={{ width: "1px", background: "#4a4a4a", margin: "0 4px" }} />
          
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            style={{
              padding: "6px 10px",
              border: "none",
              background: editor.isActive('heading', { level: 1 }) ? "#4a4a4a" : "transparent",
              color: "white",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
            title="Heading 1"
          >
            H1
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            style={{
              padding: "6px 10px",
              border: "none",
              background: editor.isActive('heading', { level: 2 }) ? "#4a4a4a" : "transparent",
              color: "white",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
            title="Heading 2"
          >
            H2
          </button>

          <div style={{ width: "1px", background: "#4a4a4a", margin: "0 4px" }} />
          
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            style={{
              padding: "6px 10px",
              border: "none",
              background: editor.isActive('bulletList') ? "#4a4a4a" : "transparent",
              color: "white",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
            title="Bullet List"
          >
            •
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            style={{
              padding: "6px 10px",
              border: "none",
              background: editor.isActive('orderedList') ? "#4a4a4a" : "transparent",
              color: "white",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
            title="Numbered List"
          >
            1.
          </button>

          <div style={{ width: "1px", background: "#4a4a4a", margin: "0 4px" }} />
          
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            style={{
              padding: "6px 10px",
              border: "none",
              background: editor.isActive('blockquote') ? "#4a4a4a" : "transparent",
              color: "white",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
            title="Quote"
          >
            "
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            style={{
              padding: "6px 10px",
              border: "none",
              background: editor.isActive('codeBlock') ? "#4a4a4a" : "transparent",
              color: "white",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontFamily: "monospace",
            }}
            title="Code Block"
          >
            {'<>'}
          </button>

          <div style={{ width: "1px", background: "#4a4a4a", margin: "0 4px" }} />
          
          <button
            onClick={onImageClick}
            style={{
              padding: "6px 10px",
              border: "none",
              background: "transparent",
              color: "white",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
            title="Insert Image"
          >
            🖼️
          </button>
        </div>
      )}

      {/* Floating Plus Button on Left Side */}
      <div
        className="floating-plus-button"
        style={{
          position: "absolute",
          top: "10px",
          left: "-50px",
          zIndex: 10,
        }}
      >
        <button
          onClick={onImageClick}
          title="Insert Image"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "1px solid #e6e6e6",
            background: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            transition: "all 0.2s",
            fontSize: "20px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f7f7f7";
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "white";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          +
        </button>
      </div>

      <EditorContent editor={editor} />

      <style>{`
        .tiptap-editor {
          width: 100%;
          font-size: 20px;
          border: none;
          outline: transparent;
          font-family: inherit;
          line-height: 1.8;
          color: #292929;
          min-height: 400px;
        }

        .tiptap-editor:focus {
          outline: none;
        }

        .tiptap-editor p {
          margin: 0.5em 0;
          line-height: 1.8;
        }

        .tiptap-editor p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }

        .tiptap-editor img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 20px 0;
          border-radius: 4px;
          cursor: pointer;
        }

        .tiptap-editor img:hover {
          opacity: 0.9;
        }

        .tiptap-editor img.ProseMirror-selectednode {
          outline: 3px solid var(--primary-gold);
          outline-offset: 2px;
        }

        .tiptap-editor h1 {
          font-size: 2.5em;
          font-weight: 700;
          margin: 0.8em 0 0.4em 0;
          line-height: 1.2;
        }

        .tiptap-editor h2 {
          font-size: 2em;
          font-weight: 600;
          margin: 0.7em 0 0.3em 0;
          line-height: 1.3;
        }

        .tiptap-editor h3 {
          font-size: 1.5em;
          font-weight: 600;
          margin: 0.6em 0 0.3em 0;
          line-height: 1.4;
        }

        .tiptap-editor ul,
        .tiptap-editor ol {
          padding-left: 1.5em;
          margin: 1em 0;
        }

        .tiptap-editor li {
          margin: 0.3em 0;
        }

        .tiptap-editor code {
          background-color: #f5f5f5;
          padding: 3px 6px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          color: #e83e8c;
        }

        .tiptap-editor pre {
          background-color: #1e1e1e;
          color: #d4d4d4;
          padding: 16px;
          border-radius: 6px;
          overflow-x: auto;
          margin: 1.5em 0;
        }

        .tiptap-editor pre code {
          background: none;
          padding: 0;
          color: inherit;
          font-size: 0.9em;
        }

        .tiptap-editor blockquote {
          border-left: 4px solid #e6e6e6;
          padding-left: 1.2em;
          margin: 1.5em 0;
          color: #666;
          font-style: italic;
        }

        .tiptap-editor strong {
          font-weight: 700;
        }

        .tiptap-editor em {
          font-style: italic;
        }

        .tiptap-editor u {
          text-decoration: underline;
        }

        /* Selection styles */
        .tiptap-editor ::selection {
          background-color: #b4d5fe;
        }
      `}</style>
    </div>
  );
}
