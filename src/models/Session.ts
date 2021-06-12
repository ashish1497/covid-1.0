import { model, Schema, Document } from "mongoose";

export interface ISession extends Document {
  name: String;
  pinCode: Number;
  phoneNumber: String;
  forDose: Number;
  ageLimit: Number;
  vaccine: String;
  activeCronJob: Boolean;
}

const SessionSchema: Schema = new Schema({
  name: { type: String, required: true },
  pinCode: { type: Number, required: true },
  phoneNumber: { type: String, required: true },
  forDose: { type: Number, required: true },
  ageLimit: { type: Number, required: true },
  vaccine: { type: String },
  activeCronJob: { type: Boolean, required: true, default: true },
});

export default model<ISession>("Session", SessionSchema);
