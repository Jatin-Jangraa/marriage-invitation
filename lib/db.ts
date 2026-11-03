import mongoose from 'mongoose';
type Cache={conn:typeof mongoose|null;promise:Promise<typeof mongoose>|null};
const g=globalThis as typeof globalThis&{mongooseCache?:Cache};
const cache=g.mongooseCache??(g.mongooseCache={conn:null,promise:null});
export async function connectDB(){if(cache.conn)return cache.conn;const uri=process.env.MONGODB_URI;if(!uri)throw new Error('Set MONGODB_URI in the environment');if(!cache.promise)cache.promise=mongoose.connect(uri,{bufferCommands:false});cache.conn=await cache.promise;return cache.conn}
