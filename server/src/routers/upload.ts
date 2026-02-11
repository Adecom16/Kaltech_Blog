import express from "express";
import { upload } from "../config/upload";
import { uploadImage, deleteImage } from "../controllers/upload.controller";
import isAuthenticated from "../middlewares/auth";

const router = express.Router();

// Upload single image (requires authentication)
router.post("/image", isAuthenticated, upload.single("image"), uploadImage);

// Delete image (requires authentication)
router.delete("/image/:filename", isAuthenticated, deleteImage);

export default router;
