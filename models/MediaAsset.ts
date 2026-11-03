import mongoose,{Schema,models,model} from 'mongoose';
const MediaAssetSchema=new Schema({url:{type:String,required:true},assetId:{type:String,required:true},label:String,resourceType:{type:String,default:'image'},createdBy:{type:Schema.Types.ObjectId,ref:'Admin'}},{timestamps:true});
MediaAssetSchema.index({assetId:1},{unique:true});
export default (models.MediaAsset||model('MediaAsset',MediaAssetSchema)) as mongoose.Model<any>;
