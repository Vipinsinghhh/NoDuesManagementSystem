import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import StudentModel from "../models/studentModel.js";

const studentController = {
    register: async (req, res) => {
        const {
            firstName,
            lastName,
            email,
            password,
            rollNumber,
            branch,
            year,
            section,
            semester,
            phoneNumber,
            dateOfBirth,
            userType // Added userType parameter
        } = req.body;

        try {
            // Check if student with roll number or email already exists
            const existingStudent = await StudentModel.findOne({
                $or: [{ rollNumber }, { email }]
            });

            if (existingStudent) {
                if (existingStudent.rollNumber === rollNumber) {
                    return res.status(400).json({ error: "Student with this roll number already exists" });
                }
                if (existingStudent.email === email) {
                    return res.status(400).json({ error: "Email is already registered" });
                }
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            // Create a new user instance
            const newUser = new StudentModel({
                firstname: firstName,
                lastname: lastName,
                email,
                password: hashedPassword,
                rollNumber,
                branch,
                year,
                section,
                semester,
                phonenumber: phoneNumber,
                dob: dateOfBirth,
                userType: userType || "student" // Default to "student" if not provided
            });

            // Save to DB
            const savedUser = await newUser.save();

            const response = {
                token: jwt.sign(
                    { id: savedUser._id, userType: savedUser.userType },
                    process.env.SECRET_KEY,
                    { expiresIn: "30d" }
                ),
                user: savedUser
            };

            res.status(201).json(response);
        } catch (error) {
            console.error("Registration error:", error);
            if (error.code === 11000) {
                if (error.keyPattern?.email) {
                    return res.status(400).json({ error: "Email is already registered" });
                }
                if (error.keyPattern?.rollNumber) {
                    return res.status(400).json({ error: "Student with this roll number already exists" });
                }
                return res.status(400).json({ error: "Duplicate value found. Please use different details." });
            }

            if (error.name === "ValidationError") {
                const firstValidationError = Object.values(error.errors || {})[0];
                const validationMessage = firstValidationError?.message || "Invalid registration details";
                return res.status(400).json({ error: validationMessage });
            }

            if (error.message?.includes("secretOrPrivateKey")) {
                return res.status(500).json({ error: "JWT secret key is missing in backend environment configuration" });
            }

            return res.status(500).json({ error: error.message || "Server error during registration" });
        }
    },

    login: async (req, res) => {
        const { rollNumber, password } = req.body;
        try {
            const user = await StudentModel.findOne({ rollNumber });
            if (!user) return res.status(400).json({ error: "User not found" });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ error: "Invalid password" });

            const token = jwt.sign(
                { id: user._id, userType: user.userType },
                process.env.SECRET_KEY,
                { expiresIn: "30d" }
            );
            res.status(200).json({ token, user });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getProfile: async (req, res) => {
        try {
            let oneUser = await StudentModel.findById(req.params.id).select("-password");
            if (!oneUser) return res.status(404).json({ error: "User not found" });

            res.json(oneUser);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    updateUser: async (req, res) => {
        try {
            let updatedUser = await StudentModel.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password");
            if (!updatedUser) return res.status(404).json({ error: "User not found" });

            res.json(updatedUser);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    deleteUser: async (req, res) => {
        try {
            let user = await StudentModel.findByIdAndDelete(req.params.id);
            if (!user) return res.status(404).json({ error: "User not found" });

            res.json({ message: "User deleted successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },
    getList: async (req, res) => {
        try {
            const students = await StudentModel.find().select("-password");
            res.json(students);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    updateStatus: async (req, res) => {
        const { studentId, subject, assignment, labManual, presentation } = req.body;
    
        try {
            // Find the student by ID
            const student = await StudentModel.findById(studentId);
    
            if (!student) {
                return res.status(404).json({ success: false, message: "Student not found" });
            }
    
            // Initialize submissions if empty
            if (!student.submissions) {
                student.submissions = new Map();
            }
    
            // Update the specific subject's submission status
            student.submissions.set(subject, { assignment, labManual, presentation });
    
            // Save changes to database
            await student.save();
    
            res.json({ success: true, message: "Status updated successfully", student });
        } catch (error) {
            console.error("Update error:", error);
            res.status(500).json({ success: false, message: "Server error while updating status" });
        }
    },
    updateHodApprovalStatus: async (req, res) => {
        const { studentId, status } = req.body;

        try {
            if (!studentId || !status) {
                return res.status(400).json({ success: false, message: "studentId and status are required" });
            }

            const allowedStatuses = ["Pending", "Approved", "Rejected"];
            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({ success: false, message: "Invalid status value" });
            }

            const updatedStudent = await StudentModel.findByIdAndUpdate(
                studentId,
                {
                    hodApprovalStatus: status,
                    hodApprovalUpdatedAt: new Date()
                },
                { new: true }
            ).select("-password");

            if (!updatedStudent) {
                return res.status(404).json({ success: false, message: "Student not found" });
            }

            return res.json({
                success: true,
                message: "HOD approval status updated successfully",
                student: updatedStudent
            });
        } catch (error) {
            console.error("HOD approval update error:", error);
            return res.status(500).json({ success: false, message: "Server error while updating HOD approval status" });
        }
    },
    getStudentProfile: async (req, res) => {
        try {
          // Get student ID from the authenticated request
          const studentId =  await StudentModel.findById(req.params.id).select("-password");
    
          // Find student by ID and exclude password field
          const student = await StudentModel.findById(studentId).select('-password');
    
          if (!student) {
            return res.status(404).json({ message: 'Student not found' });
          }
    
          // Convert Map to regular object for easier frontend consumption
          const submissionsObject = {};
          student.submissions.forEach((value, key) => {
            submissionsObject[key] = value;
          });
    
          // Create response object with submissions converted to plain object
          const responseData = student.toObject();
          responseData.submissions = submissionsObject;
    
          // Return student profile data
          res.status(200).json(responseData);
        } catch (error) {
          console.error('Error fetching student profile:', error);
          res.status(500).json({ message: 'Server error', error: error.message });
        }
      }
    
    

};

export default studentController;
