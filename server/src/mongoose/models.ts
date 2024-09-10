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
	country: string;
	socketId?: string;
	password?: string;
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
	country: { type: String },
	socketId: { type: String },
	password: { type: String, required: true },
	friends: [{ type: Types.ObjectId, ref: "User", unique: true }],
	friendReqsSent: [{ type: Types.ObjectId, ref: "User", unique: true }],
	friendReqsReceived: [{ type: Types.ObjectId, ref: "User", unique: true }],
	recentsUsers: [{ type: Types.ObjectId, ref: "User", unique: true }],
	recentsVideos: [{ type: String, unique: true }],
});
UserSchema.methods.toJSON = function () {
	const userObject = this.toObject(); // this refers to user
	userObject.password = "";
	return userObject;
};
UserSchema.methods.comparePassword = async function (
	candidatePassword: string,
) {
	return this.password === candidatePassword; // this refers to user
};
UserSchema.methods.generateAuthToken = function () {
	const token = jwt.sign(
		{
			_id: this._id,
			// country: this.country,
			// pfp: this.pfp,
			// handle: this.handle,
		},
		process.env.JWT_PRIVATE_KEY || "",
	);
	return token;
};

interface YtVideoType {
	ytId: string;
	thumbnail: string;
	title: string;
	duration: string;
	updatedAt: Date;
}
interface IYtVideo extends Document, YtVideoType {}
const YtVideoSchema: Schema = new Schema({
	ytId: { type: String, required: true },
	thumbnail: { type: String },
	title: { type: String },
	duration: { type: String },
	updatedAt: { type: Date },
});

const User = mongoose.model<IUser>("User", UserSchema);
const YtVideo = mongoose.model<IYtVideo>("YtVideo", YtVideoSchema);

export type { IUser, YtVideoType };
const mongooseModels = { User, YtVideo };
export default mongooseModels;
