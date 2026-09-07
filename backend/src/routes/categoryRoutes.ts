import { Router } from "express";
import { listCategoriesController } from "../controllers/categoryController.js";

export const categoryRouter = Router();
categoryRouter.get("/", listCategoriesController);
