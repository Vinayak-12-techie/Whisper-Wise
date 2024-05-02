import { kStringMaxLength } from "buffer";
import mongoose, { Schema, Document, mongo } from "mongoose";

//predefined  interface for UserDocument extends Document is created by default when we create a model using this schema.
export interface Message extends Document {
  content: string;
  createdAt: Date;
}

//message schema
const MessageSchema: Schema<Message> = new Schema({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export interface User extends Document {
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified: boolean;
  isAcceptingMessage: boolean;
  messages: Message[];
}

const UserSchema: Schema<User> = new Schema({
  username: {
    type: String,
    required: [true, "Username can not be empty."],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email can not be empty."],
    unique: true,
    match: [/.+\@.+\..+/, "Please fill a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Password can not be empty."],
  },
  verifyCode: {
    type: String,
    required: [true, "VerifyCode can not be empty."],
  },
  verifyCodeExpiry: {
    type: Date,
    required: [true, "Username can not be empty."],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAcceptingMessage: {
    type: Boolean,
    default: true,
  },
  messages: [MessageSchema],
});

//using typescript decorators to add some metadata to the schema fields
const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema);

export default UserModel;
