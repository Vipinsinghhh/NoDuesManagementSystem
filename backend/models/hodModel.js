import mongoose from "mongoose";

const HodSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Full name is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
    },
    department: {
        type: String,
        required: [true, "Department is required"]
    },
    employeeId: {
        type: String,
        required: [true, "Employee ID is required"],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters long"]
    },
    phonenumber: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true
    }
}, { timestamps: true });

const Hod = mongoose.model("Hod", HodSchema);

export default Hod;