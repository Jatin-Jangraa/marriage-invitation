import mongoose, { Schema, models, model } from 'mongoose';

const UserSchema = new Schema(
  {
    googleId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    image: String,
    role: { type: String, enum: ['admin', 'user'], default: 'user', required: true },
  },
  { timestamps: true },
);

export default (models.User || model('User', UserSchema)) as mongoose.Model<any>;
