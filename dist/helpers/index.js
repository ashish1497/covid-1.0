"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSms = exports.sendCowinRequest = exports.dateFormat = void 0;
var axios_1 = __importDefault(require("axios"));
var Vonage = require("@vonage/server-sdk");
var twilio = require("twilio");
var dateFormat = function (date) {
    var res = new Date(date)
        .toLocaleDateString("en-GB")
        .replace("/", "-")
        .replace("/", "-");
    return res;
};
exports.dateFormat = dateFormat;
var sendCowinRequest = function (pinCode, date) { return __awaiter(void 0, void 0, void 0, function () {
    var result, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, axios_1.default({
                    method: "GET",
                    url: "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=" + pinCode + "&date=" + date,
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.76 Safari/537.36",
                    },
                })];
            case 1:
                result = _a.sent();
                data = [];
                return [4 /*yield*/, result.data.centers.map(function (res) { return __awaiter(void 0, void 0, void 0, function () {
                        var allSession;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, res.sessions];
                                case 1:
                                    allSession = _a.sent();
                                    allSession.map(function (session) {
                                        if (session.available_capacity < 1 ||
                                            session.available_capacity === null ||
                                            session.available_capacity === undefined)
                                            return null;
                                        var obj = {
                                            where: res.name,
                                            date: date,
                                            vaccine: session.vaccine,
                                            ageLimit: session.min_age_limit,
                                            availableCapacity: session.available_capacity,
                                            forDoseOne: session.available_capacity_dose1,
                                            forDoseTwo: session.available_capacity_dose2,
                                        };
                                        data.push(obj);
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            case 2:
                _a.sent();
                // console.log(data);
                return [2 /*return*/, data];
        }
    });
}); };
exports.sendCowinRequest = sendCowinRequest;
//Twilio Setup
var accountSid = process.env.TWILIO_ACCOUNT_SID;
var authToken = process.env.TWILIO_ACCOUNT_AUTH;
var sendSms = function (phone, message) {
    if (accountSid.length > 1 && authToken.length > 1) {
        var client = twilio(accountSid, authToken);
        var promise = client.messages.create({
            from: process.env.TWILIO_PHONENUMBER,
            to: phone,
            body: message,
        });
        promise.then(function (mess) {
            console.log("Created message using promises");
            console.log(mess.sid);
        });
        promise.catch(function (err) {
            console.log("error from send SMS");
            console.log(err);
        });
    }
    else {
        throw Error("Tokens are invalid");
    }
    // client.messages.create({
    //   body: message,
    //   from: process.env.TWILIO_PHONENUMBER,
    //   to: phone,
    // });
};
exports.sendSms = sendSms;
//Vonage Setup
var vonage = new Vonage({
    apiKey: process.env.VONAGE_APIKEY,
    apiSecret: process.env.VONAGE_APISECRET,
});
var sendVonageSms = function (from, to, text) {
    vonage.message.senddSms(from, to, text, function (err, responseData) {
        if (err)
            return console.log(err);
        if (responseData.messages[0]["status"] === "0") {
            return console.log("Message sent successfully");
        }
        else {
            console.log("Message failed with error: " + responseData.messages[0]["error-text"]);
        }
    });
};
