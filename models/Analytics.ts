import mongoose,{Schema,models,model} from 'mongoose';
const AnalyticsSchema=new Schema({invitationId:{type:Schema.Types.ObjectId,ref:'WeddingInvitation',required:true,index:true},visitDate:{type:Date,required:true,index:true},referralSource:{type:String,enum:['whatsapp','qr','direct','other'],default:'other'},deviceCategory:{type:String,enum:['mobile','tablet','desktop','unknown'],default:'unknown'}},{timestamps:true});
AnalyticsSchema.index({invitationId:1,visitDate:1});
export default (models.Analytics||model('Analytics',AnalyticsSchema)) as mongoose.Model<any>;
