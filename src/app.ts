import express, { Request, Response } from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import * as cron from "node-cron";
import { config } from "dotenv";

import { dateFormat, sendCowinRequest, sendSms } from "./helpers/index";
import Session from "./models/Session";

config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/covid";

//Connect DB
mongoose.connect(
  MONGO_URI as string,
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log("Connected to DB");
  }
);

//Cronjob here
cron.schedule("* * * * *", async () => {
  console.log("Running this piece every 10th minute");

  const dumToday = new Date(Date.now());
  const dumtomorrow = new Date(new Date().setDate(new Date().getDate() + 1));
  const dumOvermorrow = new Date(new Date().setDate(new Date().getDate() + 2));

  const today = dateFormat(dumToday);
  const tomorrow = dateFormat(dumtomorrow);
  const overmorrow = dateFormat(dumOvermorrow);

  // console.log(resultOvermorrow);
  Session.find({ activeCronJob: true })
    .lean()
    .exec()
    .then((data) => {
      if (!data) return null;
      data.forEach(async (userFromCron) => {
        const resultToday = await sendCowinRequest(userFromCron.pinCode, today);
        const resultTomorrow = await sendCowinRequest(
          userFromCron.pinCode,
          tomorrow
        );
        const resultOvermorrow = await sendCowinRequest(
          userFromCron.pinCode,
          overmorrow
        );

        const allData = [
          ...resultToday,
          ...resultTomorrow,
          ...resultOvermorrow,
        ];

        if (!allData.length) return null;

        if (userFromCron.forDose === 1) {
          const doseData = allData.filter((el) => {
            return el.ageLimit === userFromCron.ageLimit && el.forDoseOne > 5;
          });

          if (!doseData.length) return null;

          const message = `Hey ${userFromCron.name}, ${doseData[0].forDoseOne} Vaccine Slots are available for Dose ${userFromCron.forDose} on ${doseData[0].date} at ${doseData[0].where}. Go now at https://cowin.gov.in immediately. No message from now, contact Ashish.`;
          sendSms(userFromCron.phoneNumber, message);

          Session.findByIdAndUpdate(userFromCron._id, {
            $set: { activeCronJob: false },
          })
            .then((done) => {
              return console.log(`${userFromCron.name} cron is now false!`);
            })
            .catch((err) => {
              return console.log(
                `${userFromCron.name} cron could not be changed!`
              );
            });
        } else if (userFromCron.forDose === 2) {
          const doseData = allData.filter((el) => {
            return el.ageLimit === userFromCron.ageLimit && el.forDoseTwo > 5;
          });

          if (!doseData.length) return null;

          const message = `Hey ${userFromCron.name}, ${doseData[0].forDoseTwo} Vaccine Slots are available for Dose ${userFromCron.forDose} on ${doseData[0].date} at ${doseData[0].where}. Go now at https://cowin.gov.in immediately. No message from now, contact Ashish.`;
          sendSms(userFromCron.phoneNumber, message);

          Session.findByIdAndUpdate(userFromCron._id, {
            $set: { activeCronJob: false },
          })
            .then((done) => {
              return console.log(`${userFromCron.name} cron is now false!`);
            })
            .catch((err) => {
              return console.log(
                `${userFromCron.name} cron could not be changed!`
              );
            });
        } else return null;
      });
    });
});

const sessionRoute = require("./routes/Session");

app.use("/v1", sessionRoute);

//All uncalled endpooints
app.use("*", (req: Request, res: Response) => {
  return res.status(200).send("Server on but no routes!");
});

//Listen
app.listen(PORT, () => {
  console.log(`Listening to server at ${PORT}`);
});
