declare module 'mongoose-findorcreate' {
  import { Schema } from 'mongoose';
  
  function findOrCreate(schema: Schema, options?: any): void;
  
  export = findOrCreate;
}
