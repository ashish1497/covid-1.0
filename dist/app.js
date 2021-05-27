"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var mongoose_1 = __importDefault(require("mongoose"));
var morgan_1 = __importDefault(require("morgan"));
var dotenv_1 = require("dotenv");
dotenv_1.config();
var app = express_1.default();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(morgan_1.default("dev"));
var PORT = process.env.PORT || 5000;
var MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/covid";
//Connect DB
mongoose_1.default.connect(MONGO_URI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
}, function () {
    console.log("Connected to DB");
});
//All uncalled endpooints
app.use("*", function (req, res) {
    return res.status(200).send("Server on but no routes!");
});
//Listen
app.listen(PORT, function () {
    console.log("Listening to server at " + PORT);
});
