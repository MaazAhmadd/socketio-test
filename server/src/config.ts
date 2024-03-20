export default {
  mongodb:
    process.env.NODE_ENV === "production"
      ? (process.env.MONGODB_CON_STRING as string)
      : "mongodb://localhost:27017/chatappAuth",
};
