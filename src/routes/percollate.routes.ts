import express from "express";
import PercollateController from "../controllers/percollate.controller.js";

const router = express.Router();

router.get("/load.:method", PercollateController.register);

export default router;
