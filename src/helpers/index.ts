import axios from "axios";
const Vonage = require("@vonage/server-sdk");
const twilio = require("twilio");

import Sent, { ISent } from "../models/Sent";
import { TWILIO_ACCOUNT_AUTH, TWILIO_ACCOUNT_SID } from "../config";
import { logToFile } from "../logger";

export const dateFormat = (date: Date) => {
  const res = new Date(date)
    .toLocaleDateString("en-GB")
    .replace("/", "-")
    .replace("/", "-");
  return res;
};

export const sendCowinRequest = async (pinCode: Number, date: string) => {
  const result = await axios({
    method: "GET",
    url: `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${pinCode}&date=${date}`,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.76 Safari/537.36",
    },
  });

  let data: any = [];
  await result.data.centers.map(async (res: any) => {
    const allSession = await res.sessions;
    allSession.map((session: any) => {
      if (
        session.available_capacity < 1 ||
        session.available_capacity === null ||
        session.available_capacity === undefined
      )
        return null;
      const obj: Object = {
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
  });

  // console.log(data);
  return data;
};

//Twilio Setup
const accountSid = TWILIO_ACCOUNT_SID;
const authToken = TWILIO_ACCOUNT_AUTH;

export const sendSms = (
  name: String,
  pinCode: Number,
  phone: String,
  message: String
) => {
  if (accountSid!.length > 1 && authToken!.length > 1) {
    const client = twilio(accountSid, authToken);
    const promise = client.messages.create({
      from: process.env.TWILIO_PHONENUMBER,
      to: phone,
      body: message,
    });
    promise.then((mess: any) => {
      const msgSent: ISent = new Sent({
        name: name,
        pinCode: pinCode,
        phoneNumber: phone,
        message: mess.body,
      });
      msgSent.save((err, done) => {
        if (err) {
          return logToFile(`Error in saving sms details: ${err} `, "sent.log");
        }

        return logToFile(`Saved to Sent Collection`, "sent.log");
      });
    });
    promise.catch((err: any) => {
      return logToFile(`Error from send SMS: ${err}`, "twilio.log");
    });
  } else {
    return logToFile(`Tokens invalid`, "twilio.log");
  }
};

//Vonage Setup
const vonage = new Vonage({
  apiKey: process.env.VONAGE_APIKEY,
  apiSecret: process.env.VONAGE_APISECRET,
});

const sendVonageSms = (from: any, to: any, text: any) => {
  vonage.message.senddSms(from, to, text, (err: any, responseData: any) => {
    if (err) return console.log(err);

    if (responseData.messages[0]["status"] === "0") {
      return console.log("Message sent successfully");
    } else {
      console.log(
        `Message failed with error: ${responseData.messages[0]["error-text"]}`
      );
    }
  });
};
