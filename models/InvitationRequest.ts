import mongoose, { Schema, models, model } from 'mongoose';

const InvitationRequestSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    customerName: { type: String, required: true },
    groomName: { type: String, required: true, trim: true },
    brideName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, maxlength: 40 },
    weddingDate: Date,
    venue: { type: String, trim: true, maxlength: 200 },
    city: { type: String, trim: true, maxlength: 120 },
    style: { type: String, trim: true, maxlength: 120 },
    notes: { type: String, trim: true, maxlength: 3000 },
    status: { type: String, enum: ['pending', 'reviewing', 'completed', 'declined'], default: 'pending', index: true },
  },
  { timestamps: true },
);

InvitationRequestSchema.index({ customer: 1, createdAt: -1 });

export default (models.InvitationRequest || model('InvitationRequest', InvitationRequestSchema)) as mongoose.Model<any>;
