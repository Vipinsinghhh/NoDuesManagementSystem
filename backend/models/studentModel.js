import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema({
    assignment: { type: String, default: "Not Submitted" },
    labManual: { type: String, default: "Not Submitted" },
    presentation: { type: String, default: "Not Submitted" }
}, { _id: false });

const StudentSchema = new mongoose.Schema({
    firstname: { 
        type: String, 
        required: true,
        trim: true 
    },
    lastname: { 
        type: String, 
        required: true,
        trim: true 
    },
    email: { 
        type: String, 
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Invalid email format']
    },
    password: { 
        type: String, 
        required: true,
        minlength: 8
    },
    rollNumber: { 
        type: String, 
        required: true,
        unique: true,
        uppercase: true
    },
    branch: { 
        type: String, 
        required: true,
        trim: true 
    },
    year: { 
        type: String, 
        required: true
    },
    section: { 
        type: String, 
        required: true,
        enum: ['A', 'B', 'C', 'D', 'E']
    },
    semester: { 
        type: Number, 
        required: true,
        min: 1,
        max: 8
    },
    phonenumber: { 
        type: String, 
        required: true,
        match: [/^\d{10}$/, 'Invalid phone number']
    },
    dob: { 
        type: Date, 
        required: true
    },
    submissions: {
        type: Map,
        of: SubmissionSchema,
        default: {}
    },
    hodApprovalStatus: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending"
    },
    hodApprovalUpdatedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

const StudentModel = mongoose.model("Student", StudentSchema);

export default StudentModel;
