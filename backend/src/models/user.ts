import mongoose, { Schema, Model } from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

// Define the saved university interface
interface ISavedUniversity {
    university_id: number;
    name: string;
    program_name: string;
    program_type: string;
    location_city?: string;
    location_country?: string;
    ranking?: number;
    acceptance_rate?: number;
    median_gmat?: number;
    median_gre?: number;
    median_gpa?: number;
    tuition_usd?: number;
    savedAt: Date;
}

// Define the user interface
interface IUser {
    name?: string;
    email: string;
    role?: string;
    permissions?: string[];
    googleId?: string;
    githubId?: string;
    provider?: string;
    data?: any;
    resetPasswordOTP?: string;
    resetPasswordOTPExpires?: Date;
    savedUniversities?: ISavedUniversity[];
}

// Create a schema to define the structure of the user data
const userSchema = new Schema({
    name: { type: String },
    email: {
        type: String,
        unique: true
    },
    role: { type: String },
    permissions: { type: [String] },
    googleId: { type: String },
    githubId: { type: String },
    provider: { type: String }, //where did the user data come from 
    // password: { // Password field not required as it is being handled by passport-local-mongoose
    //     type: String,
    //     required: true
    // },
    data: { type: Schema.Types.Mixed },
    // Password reset OTP fields
    resetPasswordOTP: { type: String },
    resetPasswordOTPExpires: { type: Date },
    // Saved universities
    savedUniversities: [{
        university_id: { type: Number, required: true },
        name: { type: String, required: true },
        program_name: { type: String, required: true },
        program_type: { type: String, required: true },
        location_city: { type: String },
        location_country: { type: String },
        ranking: { type: Number },
        acceptance_rate: { type: Number },
        median_gmat: { type: Number },
        median_gre: { type: Number },
        median_gpa: { type: Number },
        tuition_usd: { type: Number },
        savedAt: { type: Date, default: Date.now }
    }]
});

// Add passport-local-mongoose plugin to handle username and password fields
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

// Create a model using the user schema
// @ts-ignore - Bypass TypeScript's complex type inference issue with passport-local-mongoose
const User = mongoose.model('User', userSchema);

export default User;