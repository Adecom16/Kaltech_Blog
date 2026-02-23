import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import ServerError from "../utils/ServerError";
import { cloudinary } from "../config/upload";

// Upload single image
export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ServerError(400, "No file uploaded");
  }

  // Cloudinary automatically uploads the file and provides the URL
  const fileUrl = (req.file as any).path; // Cloudinary URL
  
  res.json({
    success: true,
    url: fileUrl,
    public_id: (req.file as any).filename, // Cloudinary public_id
  });
});

// Delete image from Cloudinary
export const deleteImage = asyncHandler(async (req: Request, res: Response) => {
  const { public_id } = req.params;
  
  if (!public_id) {
    throw new ServerError(400, "Public ID is required");
  }

  try {
    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(public_id);
    
    if (result.result === "ok") {
      res.json({ success: true, message: "Image deleted successfully" });
    } else {
      throw new ServerError(404, "Image not found or already deleted");
    }
  } catch (error) {
    throw new ServerError(500, "Failed to delete image from Cloudinary");
  }
});
