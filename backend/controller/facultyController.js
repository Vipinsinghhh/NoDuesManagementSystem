import Faculty from "../models/facultyModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { deleteImageByPublicId, uploadImageBuffer } from "../utils/cloudinaryUpload.js";

const facultyController = {
    register: async (req, res) => {
        try {
            const { firstName, lastName, email, password, department, employeeId } = req.body;
            
            // Check if user already exists
            const existingFaculty = await Faculty.findOne({ email });
            if (existingFaculty) return res.status(400).json({ error: "User already exists" });
            
            const hashedPassword = await bcrypt.hash(password, 10);
            const newFaculty = new Faculty({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                department,
                employeeId
            });
            
            const savedFaculty = await newFaculty.save();
            const token = jwt.sign({ id: savedFaculty._id }, process.env.SECRET_KEY, { expiresIn: "30d" });
            
            res.status(201).json({ token, faculty: savedFaculty });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
    login: async (req, res) => {
        try {
            const { employeeId, password } = req.body;
            const faculty = await Faculty.findOne({ employeeId });
            
            if (!faculty) return res.status(400).json({ error: "User not found" });
            
            const isMatch = await bcrypt.compare(password, faculty.password);
            if (!isMatch) return res.status(400).json({ error: "Invalid password" });
            
            const token = jwt.sign({ id: faculty._id }, process.env.SECRET_KEY, { expiresIn: "30d" });
            
            res.json({ token, faculty });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
    getProfile: async (req, res) => {
        try {
            const faculty = await Faculty.findById(req.params.id).select("-password");
            if (!faculty) return res.status(404).json({ error: "User not found" });
            
            res.json(faculty);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
    updateUser: async (req, res) => {
        try {
            const { firstName, lastName, password, department, experience, specialization, contactNumber, address, teachingDetails } = req.body;
    
            let updateData = { firstName, lastName, department, experience, specialization, contactNumber, address, teachingDetails };
    
            if (password) {
                updateData.password = await bcrypt.hash(password, 10);
            }
    
            const faculty = await Faculty.findByIdAndUpdate(req.params.id, updateData, { new: true }).select("-password");
            
            if (!faculty) {
                return res.status(404).json({ error: "User not found" });
            }
    
            res.json(faculty);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
    
    
    
    deleteUser: async (req, res) => {
        try {
            const faculty = await Faculty.findByIdAndDelete(req.params.id);
            if (!faculty) return res.status(404).json({ error: "User not found" });
            
            res.json({ message: "User deleted successfully" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    addTeachingDetail: async (req, res) => {
        try {
            const { id } = req.params; // Use 'id' instead of 'facultyId'
            const { semester, section, subject } = req.body;
    
            const faculty = await Faculty.findById(id);
            if (!faculty) return res.status(404).json({ error: "Faculty not found" });
    
            // Add new teaching details
            faculty.teachingDetails.push({ semester, section, subject });
            await faculty.save();
    
            res.json({ message: "Teaching details added successfully", faculty });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
,    

    
    getTeachingDetails: async (req, res) => {
        try {
            const { id } = req.params;
            const faculty = await Faculty.findById(id);
            if (!faculty) return res.status(404).json({ error: "Faculty not found" });

            res.json(faculty.teachingDetails);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    deleteTeachingDetail: async (req, res) => {
        try {
            const { id, detailId } = req.params; // Changed from teachingDetailId to detailId
            const faculty = await Faculty.findById(id);
            
            if (!faculty) return res.status(404).json({ error: "Faculty not found" });
            
            // Find and remove the teaching detail
            const updatedTeachingDetails = faculty.teachingDetails.filter(
                (detail) => detail._id.toString() !== detailId.toString()
            );
            
            faculty.teachingDetails = updatedTeachingDetails;
            await faculty.save();
            
            res.json({
                message: "Teaching detail deleted successfully",
                faculty,
                updatedTeachingDetails // Return this so the client can update state if needed
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    updatePhoto: async (req, res) => {
        try {
            const { id } = req.params;
            const existingFaculty = await Faculty.findById(id);
            if (!existingFaculty) return res.status(404).json({ error: "User not found" });
            if (!req.file) return res.status(400).json({ error: "Photo file is required" });

            const uploadedImage = await uploadImageBuffer(req.file, "no-dues/faculty");

            if (existingFaculty.photoPublicId) {
                await deleteImageByPublicId(existingFaculty.photoPublicId);
            }

            const faculty = await Faculty.findByIdAndUpdate(
                id,
                {
                    photo: uploadedImage.url,
                    photoPublicId: uploadedImage.publicId,
                },
                { new: true }
            ).select("-password");
            
            if (!faculty) return res.status(404).json({ error: "User not found" });
    
            res.json({ message: "Photo updated successfully", faculty, photo: uploadedImage.url });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    getAllFaculty: async (req, res) => {
        try {
            // Optional query parameters for filtering
            const { department } = req.query;
            
            // Build query object
            const query = {};
            if (department) {
                query.department = department;
            }
            
            // Fetch faculty members based on query
            const facultyList = await Faculty.find(query)
                .select("-password") // Exclude sensitive data
                .sort({ lastName: 1, firstName: 1 }); // Sort by name
                
            res.json(facultyList);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
    // New function to get faculty by subjects they teach
    getFacultyBySubject: async (req, res) => {
        try {
            const { subject } = req.params;
            
            // Find faculty members who teach this subject
            const facultyList = await Faculty.find({
                "teachingDetails.subject": subject
            }).select("-password");
            
            res.json(facultyList);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
    // New function to get faculty by semester and section they teach
    getFacultyBySemesterSection: async (req, res) => {
        try {
            const { semester, section } = req.params;
            
            // Find faculty members who teach this semester and section
            const facultyList = await Faculty.find({
                $and: [
                    { "teachingDetails.semester": semester },
                    { "teachingDetails.section": section }
                ]
            }).select("-password");
            
            // For each faculty, filter their teachingDetails to only include 
            // those matching the semester and section
            const filteredFacultyList = facultyList.map(faculty => {
                const matchingDetails = faculty.teachingDetails.filter(
                    detail => detail.semester === semester && detail.section === section
                );
                
                // Return a modified faculty object with only matching teaching details
                return {
                    ...faculty.toObject(),
                    teachingDetails: matchingDetails
                };
            });
            
            res.json(filteredFacultyList);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    

};

export default facultyController;
