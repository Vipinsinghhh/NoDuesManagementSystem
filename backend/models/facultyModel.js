import mongoose from "mongoose";

// Teaching details schema (each faculty can have multiple subjects)
const TeachingDetailSchema = new mongoose.Schema({
    semester: { type: Number, required: true },
    section: { type: String, required: true },
    subject: { type: String, required: true }
});

// Faculty schema
const FacultySchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    department: { type: String, required: true },
    employeeId: { type: String, required: true, unique: true },
    experience: { type: Number, min: 0 },
    specialization: { type: String },
    contactNumber: { type: String },
    address: { type: String },
    photo: { type: String },
    teachingDetails:{ type:[TeachingDetailSchema] , default: [] }
}, { timestamps: true });

const Faculty = mongoose.model("Faculty", FacultySchema);
export default Faculty;
