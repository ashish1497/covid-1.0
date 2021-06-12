import express, { Request, Response } from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import * as cron from "node-cron";
import { config } from "dotenv";
import fs from "fs";
import path from "path";

import { dateFormat, sendCowinRequest, sendSms } from "./helpers/index";
import Session from "./models/Session";
import Sent from "./models/Sent";
import { logToFile } from "./logger";

config();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));
app.use(morgan("combined", { stream: accessLogStream }));

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

//Connect DB
mongoose
  .connect(MONGO_URI as string, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => logToFile(`Connected to DB`, "common.log"))
  .catch((err) => {
    logToFile(`Not connected to DB ${err}`, "common.log");
  });

// sendSms("Ashish", 854326, "+918240037041", "HELL");
//Cronjob here for Covid
cron.schedule("* * * * *", async () => {
  const dumToday = new Date(Date.now());
  const dumtomorrow = new Date(new Date().setDate(new Date().getDate() + 1));
  const dumOvermorrow = new Date(new Date().setDate(new Date().getDate() + 2));
  const dumThirdmorrow = new Date(new Date().setDate(new Date().getDate() + 3));
  const dumFourthmorrow = new Date(
    new Date().setDate(new Date().getDate() + 4)
  );
  const dumFifthmorrow = new Date(new Date().setDate(new Date().getDate() + 5));

  const today = dateFormat(dumToday);
  const tomorrow = dateFormat(dumtomorrow);
  const overmorrow = dateFormat(dumOvermorrow);
  const thirdmorrow = dateFormat(dumThirdmorrow);
  const fourthmorrow = dateFormat(dumFourthmorrow);
  const fifthmorrow = dateFormat(dumFifthmorrow);

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
        const resultThirdmorrow = await sendCowinRequest(
          userFromCron.pinCode,
          thirdmorrow
        );
        const resultFourthmorrow = await sendCowinRequest(
          userFromCron.pinCode,
          fourthmorrow
        );
        const resultFifthmorrow = await sendCowinRequest(
          userFromCron.pinCode,
          fifthmorrow
        );

        const allData = [
          ...resultToday,
          ...resultTomorrow,
          ...resultOvermorrow,
          ...resultThirdmorrow,
          ...resultFourthmorrow,
          ...resultFifthmorrow,
        ];

        if (!allData.length) return null;

        // logToFile(
        //   `condition check for ${userFromCron.name} ${userFromCron.pinCode}`,
        //   "common.log"
        // );

        if (userFromCron.forDose === 1) {
          const doseData = allData.filter((el) => {
            return (
              el.ageLimit === userFromCron.ageLimit &&
              el.forDoseOne > 3 &&
              el.vaccine === userFromCron.vaccine
            );
          });

          if (!doseData.length) return;

          const message = `Hey ${userFromCron.name}, ${doseData[0].forDoseOne} ${userFromCron.vaccine} Vaccine Slots are available for Dose ${userFromCron.forDose} on ${doseData[0].date} at ${doseData[0].where}, ${userFromCron.pinCode}. Go now at https://cowin.gov.in.`;
          sendSms(
            userFromCron.name,
            userFromCron.pinCode,
            userFromCron.phoneNumber,
            message
          );

          Session.findByIdAndUpdate(userFromCron._id, {
            $set: { activeCronJob: false },
          })
            .then(() => {
              return logToFile(
                `${userFromCron.name}-${userFromCron.pinCode} cron is now false!`,
                "sessions.log"
              );
            })
            .catch(() => {
              return logToFile(
                `${userFromCron.name}-${userFromCron.pinCode} cron could not be changed!`,
                "sessions.log"
              );
            });
        } else if (userFromCron.forDose === 2) {
          const doseData = allData.filter((el) => {
            return (
              el.ageLimit === userFromCron.ageLimit &&
              el.forDoseTwo > 3 &&
              el.vaccine === userFromCron.vaccine
            );
          });

          if (!doseData.length) return;

          const message = `Hey ${userFromCron.name}, ${doseData[0].forDoseTwo} ${userFromCron.vaccine} Vaccine Slots are available for Dose ${userFromCron.forDose} on ${doseData[0].date} at ${doseData[0].where}, ${userFromCron.pinCode}. Go now at https://cowin.gov.in.`;
          sendSms(
            userFromCron.name,
            userFromCron.pinCode,
            userFromCron.phoneNumber,
            message
          );

          Session.findByIdAndUpdate(userFromCron._id, {
            $set: { activeCronJob: false },
          })
            .then(() => {
              return logToFile(
                `${userFromCron.name}-${userFromCron.pinCode} cron is now false!`,
                "sessions.log"
              );
            })
            .catch(() => {
              return logToFile(
                `${userFromCron.name}-${userFromCron.pinCode} cron could not be changed!`,
                "sessions.log"
              );
            });
        } else return null;
      });
    })
    .catch((err) => {
      return logToFile(`${err}`, "common.log");
    });
});

//Cronjob here for Reupdating the session to be back, 30 minutes after message sent
cron.schedule("*/10 * * * *", async () => {
  Sent.find({ activeCronJob: true })
    .lean()
    .exec()
    .then((data) => {
      if (!data) return;
      data.forEach(async (sentData) => {
        const h = Date.now() - 60000 * 30; // Current time - 30 minutes
        if (sentData.sentAt > h) {
          return;
        }

        Session.findOneAndUpdate(
          {
            name: sentData.name,
            pinCode: sentData.pinCode,
            phoneNumber: sentData.phoneNumber,
          },
          { $set: { activeCronJob: true } }
        )
          .then(() => {
            Sent.findOneAndUpdate(
              { _id: sentData._id },
              { $set: { activeCronJob: false } }
            )
              .then(() => {
                return logToFile(
                  `${sentData.name}-${sentData.pinCode} now back to work`,
                  "sent.log"
                );
              })
              .catch((err) => {
                return logToFile(
                  `${sentData.name}-${sentData.pinCode} db err: ${err}`,
                  "sent.log"
                );
              });
          })
          .catch((err) => {
            return logToFile(
              `${sentData.name}-${sentData.pinCode} update failed: ${err}`,
              "session.log"
            );
          });
      });
    })
    .catch((err) => {
      return logToFile(`Sent find error!: ${err}`, "sent.log");
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
  logToFile(`Listening to server at ${PORT}`, "common.log");
});
