import {Schema, model, Document} from "mongoose";

export interface IUser extends Document {
    email: string;
    password: string;
    verified: boolean;
    accessToken: string;
}

const userSchema = new Schema<IUser>({

    email:{
      type: String,
      required: true,
      unique: true,
    },

    password: {
        type: String,
        required: true,
        minlength: 6
      },
      
      verified: {
        type: Boolean,
        default: false,
      },
},
{
    timestamps: true
  }
);

export default model<IUser>('User', userSchema);