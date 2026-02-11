import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import ServerError from "../utils/ServerError";

// Upload single image
export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ServerError(400, "No file uploaded");
  }

  // Return the file URL
  const fileUrl = `/uploads/${req.file.filename}`;
  
  res.json({
    success: true,
    url: fileUrl,
    filename: req.file.filename,
  });
});

// Delete image
export const deleteImage = asyncHandler(async (req: Request, res: Response) => {
  const { filename } = req.params;
  
  if (!filename) {
    throw new ServerError(400, "Filename is required");
  }

  const fs = require("fs");
  const path = require("path");
  const filePath = path.join(__dirname, "../../uploads", filename);

  // Check if file exists
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ success: true, message: "Image deleted successfully" });
  } else {
    throw new ServerError(404, "Image not found");
  }
});
