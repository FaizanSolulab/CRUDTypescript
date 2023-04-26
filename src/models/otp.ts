import mongoose, {Schema, Document} from "mongoose";

export interface IOtp extends Document{
    email: string;
    code: string;
}

const otpSchema: Schema = new Schema(
    {

        eemail: {
            type: String,
            required: true
        },

        code: {
            type: String,
            required: true,
        },

        createdAt: {
            type: Date,
            default: Date.now(),
        }
    },

    {
        timestamps: true
    }
);

export default mongoose.model<IOtp>('Otp', otpSchema);