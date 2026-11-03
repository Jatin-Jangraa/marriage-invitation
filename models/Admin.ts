import mongoose,{Schema,models,model} from 'mongoose';
const AdminSchema=new Schema({name:{type:String,default:'Administrator'},email:{type:String,required:true,unique:true,lowercase:true,trim:true},passwordHash:{type:String,required:true},role:{type:String,enum:['admin'],default:'admin'}},{timestamps:true});
export default (models.Admin||model('Admin',AdminSchema)) as mongoose.Model<any>;
