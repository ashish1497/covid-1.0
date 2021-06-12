import { model, Schema, Document } from "mongoose";

export interface ISent extends Document {
  name: String;
  pinCode: Number;
  phoneNumber: String;
  message: String;
  sentAt: Number;
  activeCronJob: Boolean;
}

const SentSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    pinCode: { type: Number, required: true },
    phoneNumber: { type: String, required: true },
    message: { type: String, required: true },
    sentAt: { type: Date, default: new Date() },
    activeCronJob: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
  }
);

export default model<ISent>("Sent", SentSchema);
