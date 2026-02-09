import { Request, Response, NextFunction } from "express";
import ServerError from "../utils/ServerError";

// Escape special regex characters to prevent ReDoS attacks
export function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
export function isValidPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  return password.length >= 8;
}

// Sanitize HTML to prevent XSS
export function sanitizeHtml(html: string): string {
  return html
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Validation middleware for registration
export const validateRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password, name } = req.body;

  if (!email || !isValidEmail(email)) {
    throw new ServerError(400, "Valid email is required");
  }

  if (!password || !isValidPassword(password)) {
    throw new ServerError(
      400,
      "Password must be at least 8 characters long"
    );
  }

  if (!name || name.trim().length < 2) {
    throw new ServerError(400, "Name must be at least 2 characters long");
  }

  next();
};

// Validation middleware for post creation
export const validatePost = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, markdown } = req.body;

  if (!title || title.trim().length < 3) {
    throw new ServerError(400, "Title must be at least 3 characters long");
  }

  if (!markdown || markdown.trim().length < 10) {
    throw new ServerError(400, "Content must be at least 10 characters long");
  }

  if (title.length > 200) {
    throw new ServerError(400, "Title must not exceed 200 characters");
  }

  next();
};

// Validation middleware for search queries
export const validateSearchQuery = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { query } = req.params;

  if (!query || query.trim().length < 1) {
    throw new ServerError(400, "Search query is required");
  }

  if (query.length > 100) {
    throw new ServerError(400, "Search query too long");
  }

  next();
};
