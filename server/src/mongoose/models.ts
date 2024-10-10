import mongoose, { Document, Schema, Types } from "mongoose";
import jwt from "jsonwebtoken";
import { MongooseUser, VideoInfo, WebVideo as WebVideoType } from "../types";

interface IUser extends Document, MongooseUser {
	toJSON(): any;
	comparePassword(password: string): Promise<boolean>;
	generateAuthToken(): string;
}
interface IYtVideo extends Document, VideoInfo {}
interface IWebVideo extends Document, WebVideoType {}

const UserSchema: Schema = new Schema({
	name: { type: String, index: true },
	handle: { type: String, required: true, unique: true, index: true },
	pfp: { type: String },
	profilePicId: { type: String },
	country: { type: String },
	socketId: { type: String },
	password: { type: String, required: true },
	friends: [{ type: Types.ObjectId, ref: "User" }],
	friendReqsSent: [{ type: Types.ObjectId, ref: "User" }],
	friendReqsReceived: [{ type: Types.ObjectId, ref: "User" }],
	recentUsers: [{ type: Types.ObjectId, ref: "User" }],
	recentVideos: {
		yt: [{ type: String }],
		web: [{ type: Types.ObjectId, ref: "WebVideo" }],
	},
	likedVideos: {
		yt: [{ type: String }],
		web: [{ type: Types.ObjectId, ref: "WebVideo" }],
	},
});
UserSchema.methods.toJSON = function () {
	const userObject = this.toObject();
	userObject.password = "";
	return userObject;
};
UserSchema.methods.comparePassword = function (candidatePassword: string) {
	return this.password === candidatePassword;
};
UserSchema.methods.generateAuthToken = function () {
	return jwt.sign({ _id: this._id }, process.env.JWT_PRIVATE_KEY || "");
};

const YtVideoSchema: Schema = new Schema({
	ytId: { type: String, required: true },
	thumbnail: { type: String },
	title: { type: String },
	duration: { type: String },
	updatedAt: { type: Date },
});

const WebVideoSchema: Schema = new Schema({
	url: { type: String, required: true, unique: true },
	t: { type: String },
	tn: { type: String },
	by: { type: Types.ObjectId, ref: "User" },
});

const User = mongoose.model<IUser>("User", UserSchema);
const YtVideo = mongoose.model<IYtVideo>("YtVideo", YtVideoSchema);
const WebVideo = mongoose.model<IWebVideo>("WebVideo", WebVideoSchema);

export default { User, YtVideo, WebVideo };
