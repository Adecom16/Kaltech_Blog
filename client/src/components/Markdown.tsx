import MarkdownCompiler from "markdown-to-jsx";
import Syntax from "./Syntax";

type MarkdownProps = {
  children: string;
};

// Custom image component with error handling
const ImageWithFallback = ({ src, alt, ...props }: any) => {
  const handleError = (e: any) => {
    e.target.style.display = 'none';
    const parent = e.target.parentElement;
    if (parent) {
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = 'padding: 20px; background: #f5f5f5; border: 1px dashed #ccc; border-radius: 4px; text-align: center; color: #666;';
      errorDiv.innerHTML = `
        <p style="margin: 0; font-size: 14px;">⚠️ Image failed to load</p>
        <p style="margin: 8px 0 0 0; font-size: 12px; word-break: break-all;">${alt || 'image'}</p>
      `;
      parent.appendChild(errorDiv);
    }
  };

  return (
    <img
      src={src}
      alt={alt || 'image'}
      onError={handleError}
      loading="lazy"
      {...props}
    />
  );
};

export default function Markdown({ children }: MarkdownProps) {
  return (
    <div className="markdown-content">
      <style>{`
        .markdown-content img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 20px 0;
          border-radius: 4px;
        }
        .markdown-content p {
          margin: 16px 0;
          line-height: 1.6;
        }
      `}</style>
      <MarkdownCompiler
        options={{
          forceBlock: true,
          overrides: {
            code: {
              component: Syntax,
              props: {
                className: "code",
              },
            },
            img: {
              component: ImageWithFallback,
            },
          },
        }}
      >
        {children}
      </MarkdownCompiler>
    </div>
  );
}
