import mongoose, { Document, Schema, Types } from "mongoose";
import jwt from "jsonwebtoken";

// user model
interface IMongooseArray<T> extends Types.Array<T> {
  pull(...args: any[]): this;
}
interface IUser extends Document {
  name: string;
  handle: string;
  pfp: string;
  profilePicId: string;
  password: string;
  friends: IMongooseArray<Types.ObjectId>;
  friendReqsSent: IMongooseArray<Types.ObjectId>;
  friendReqsReceived: IMongooseArray<Types.ObjectId>;
  toJSON(): any;
  comparePassword(password: string): Promise<boolean>;
  generateAuthToken(): string;
}
const UserSchema: Schema = new Schema({
  name: { type: String, index: true },
  handle: { type: String, required: true, unique: true, index: true },
  pfp: { type: String },
  profilePicId: { type: String },
  password: { type: String, required: true },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  friendReqsSent: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  friendReqsReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  recentsUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  recentsVideos: [{ type: String }],
});
UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};
UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
) {
  const user = this;
  return user.password === candidatePassword;
};
UserSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      // name: this.name,
      // pfp: this.pfp,
      // handle: this.handle,
    },
    process.env.JWT_PRIVATE_KEY || "",
  );
  return token;
};

const User = mongoose.model<IUser>("User", UserSchema);
export type { IUser };
export { User };
