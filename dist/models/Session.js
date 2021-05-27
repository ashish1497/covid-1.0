"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var SessionSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    pinCode: { type: Number, required: true },
    phoneNumber: { type: String, required: true },
    forDose: { type: Number, required: true },
    ageLimit: { type: Number, required: true },
    activeCronJob: { type: Boolean, required: true, default: true },
});
exports.default = mongoose_1.model("Session", SessionSchema);
