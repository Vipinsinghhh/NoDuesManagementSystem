import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config"; 
import Hod from "../models/hodModel.js";
import { deleteImageByPublicId, uploadImageBuffer } from "../utils/cloudinaryUpload.js";

const hodController = {
    register: async (req, res) => {
        const { fullName, email, department, employeeId, password, phonenumber } = req.body;
        
        try {
            // Check if user already exists
            const existingHod = await Hod.findOne({ email });
            if (existingHod) {
                return res.status(400).json({ error: "User already exists" });
            }
            
            // Check if employeeId already exists
            const existingEmployeeId = await Hod.findOne({ employeeId });
            if (existingEmployeeId) {
                return res.status(400).json({ error: "Employee ID already registered" });
            }
            
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Create new HOD
            const newHod = new Hod({
                fullName,
                email,
                department,
                employeeId,
                password: hashedPassword,
                phonenumber,
                userType: "hod" // Adding userType as hod
            });
            
            // Save HOD to database
            const savedHod = await newHod.save();
            
            // Generate JWT token
            const token = jwt.sign(
                { id: savedHod._id, userType: "hod" }, // Include userType in token
                process.env.SECRET_KEY,
                { expiresIn: "30d" }
            );
            
            // Return success response
            res.status(201).json({
                token,
                user: {
                    id: savedHod._id,
                    fullName: savedHod.fullName,
                    email: savedHod.email,
                    department: savedHod.department,
                    employeeId: savedHod.employeeId,
                    phonenumber: savedHod.phonenumber,
                    createdAt: savedHod.createdAt,
                    userType: savedHod.userType // Include userType in response
                }
            });
            
        } catch (error) {
            console.error("Registration error:", error);
            res.status(500).json({ error: "Server error" });
        }
    },
    login: async (req, res) => {
        const { employeeId, password } = req.body;
    
        try {
            // Find HOD by employee ID
            const hod = await Hod.findOne({ employeeId });
            
            // Return 404 if employee ID not found
            if (!hod) {
                return res.status(404).json({ error: "Employee ID not found" });
            }
    
            // Compare passwords
            const isMatch = await bcrypt.compare(password, hod.password);
            
            // Return 401 if password doesn't match
            if (!isMatch) {
                return res.status(401).json({ error: "Invalid password" });
            }
    
            // Create JWT token using MongoDB _id
            const token = jwt.sign(
                { id: hod._id, userType: hod.userType }, // Include userType in token
                process.env.SECRET_KEY,
                { expiresIn: "30d" }
            );
    
            // Return success with token and user info (excluding password)
            res.status(200).json({
                token,
                user: {
                    id: hod._id,
                    fullName: hod.fullName,
                    email: hod.email,
                    department: hod.department,
                    employeeId: hod.employeeId,
                    phonenumber: hod.phonenumber,
                    createdAt: hod.createdAt,
                    userType: hod.userType // Include userType in response
                }
            });
    
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ error: "Server error" });
        }
    },
    getProfile: async (req, res) => {
        try {
            const oneHod = await Hod.findById(req.params.id).select("-password");
            if (!oneHod) return res.status(404).json({ error: "User not found" });

            res.json(oneHod);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Server error" });
        }
    },
    updateUser: async (req, res) => {
        try {
            const updatePayload = { ...req.body };
            delete updatePayload.photo;
            delete updatePayload.photoPublicId;

            const updatedHod = await Hod.findByIdAndUpdate(req.params.id, updatePayload, { new: true }).select("-password");
            if (!updatedHod) return res.status(404).json({ error: "User not found" });

            res.json(updatedHod);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Server error" });
        }
    },
    updatePhoto: async (req, res) => {
        try {
            const { id } = req.params;
            const existingHod = await Hod.findById(id);

            if (!existingHod) {
                return res.status(404).json({ error: "User not found" });
            }

            if (!req.file) {
                return res.status(400).json({ error: "Photo file is required" });
            }

            const uploadedImage = await uploadImageBuffer(req.file, "no-dues/hod");

            if (existingHod.photoPublicId) {
                await deleteImageByPublicId(existingHod.photoPublicId);
            }

            const hod = await Hod.findByIdAndUpdate(
                id,
                {
                    photo: uploadedImage.url,
                    photoPublicId: uploadedImage.publicId,
                },
                { new: true }
            ).select("-password");

            return res.json({ message: "Photo updated successfully", hod, photo: uploadedImage.url });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },
    deleteUser: async (req, res) => {
        try {
            const deletedHod = await Hod.findByIdAndDelete(req.params.id);
            if (!deletedHod) return res.status(404).json({ error: "User not found" });

            res.json({ message: "User deleted successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Server error" });
        }
    }
};

export default hodController;
