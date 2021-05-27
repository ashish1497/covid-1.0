import { Router } from "express";

import {
  getAllSessionController,
  postSessionController,
} from "../controllers/Session";

const router = Router();

router.get("/session", getAllSessionController);

router.post("/session", postSessionController);

module.exports = router;
