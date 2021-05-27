"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var Session_1 = require("../controllers/Session");
var router = express_1.Router();
router.get("/session", Session_1.getAllSessionController);
router.post("/session", Session_1.postSessionController);
module.exports = router;
