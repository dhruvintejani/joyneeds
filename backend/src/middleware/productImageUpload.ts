import multer from "multer";
import type { RequestHandler } from "express";
import { AppError } from "../utils/AppError.js";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_PRODUCT_IMAGES = 8;
const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const uploader = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_BYTES,
    files: MAX_PRODUCT_IMAGES,
    fields: 4,
  },
  fileFilter(_req, file, callback) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new AppError(400, "UNSUPPORTED_IMAGE_TYPE", "Use JPG, PNG, WebP, or AVIF images only."));
      return;
    }
    callback(null, true);
  },
});

function runUpload(handler: RequestHandler): RequestHandler {
  return (req, res, next) => {
    handler(req, res, (error?: unknown) => {
      if (!error) {
        next();
        return;
      }
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          next(new AppError(413, "IMAGE_TOO_LARGE", "Each product image must be 8 MB or smaller."));
          return;
        }
        if (error.code === "LIMIT_FILE_COUNT") {
          next(new AppError(400, "TOO_MANY_IMAGES", `Upload at most ${MAX_PRODUCT_IMAGES} images at a time.`));
          return;
        }
        next(new AppError(400, "INVALID_IMAGE_UPLOAD", "The product image upload could not be processed."));
        return;
      }
      next(error);
    });
  };
}

export const uploadProductImages = runUpload(uploader.array("images", MAX_PRODUCT_IMAGES));
export const uploadReplacementImage = runUpload(uploader.single("image"));
export { MAX_PRODUCT_IMAGES };
