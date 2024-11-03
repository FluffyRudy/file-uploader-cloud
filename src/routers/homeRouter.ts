import { Router } from "express";
import { HomepageGet } from "../controllers/homeController";

const homeRouter = Router();

homeRouter.get("/", HomepageGet);

export { homeRouter };