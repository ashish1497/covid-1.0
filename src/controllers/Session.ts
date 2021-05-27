import { Request, RequestHandler, Response } from "express";
import Session, { ISession } from "../models/Session";

export const getAllSessionController: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    Session.find({}).then((sessions) => {
      return res.status(200).json(sessions);
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error!",
    });
  }
};

export const postSessionController: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, phoneNumber, pinCode, forDose, ageLimit } = req.body;

    const sess: ISession = new Session({
      name: name,
      phoneNumber: phoneNumber,
      pinCode: pinCode,
      forDose: forDose,
      ageLimit: ageLimit,
    });

    sess.save((err, session) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: "Server Error!",
        });
      } else {
        return res.status(200).json({
          success: true,
          message: "Added to DB",
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error!",
    });
  }
};
