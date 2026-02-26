import React, { useState, useEffect } from 'react';
import { User, Book, Users, Clock, CalendarRange, CheckCircle, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'; // ✅ import


export default function CompleteFacultyProfile() {
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        department: '',
        employeeId: '',
        experience: '',
        photo: '',
        specialization: '',
        contactNumber: '',
        address: '',
    });
    const navigate = useNavigate();

    const [teachingDetails, setTeachingDetails] = useState([]);

    const [newTeachingDetail, setNewTeachingDetail] = useState({
        semester: '',
        section: '',
        subject: ''
    });

    const [completionPercentage, setCompletionPercentage] = useState(0);
    const [completionStatus, setCompletionStatus] = useState({
        basicInfo: true,
        photo: false,
        teachingDetails: false
    });
      const baseUrl = useSelector((state) => state.api.baseUrl); // ✅ get baseUrl from Redux
    

    // Calculate profile completion percentage
    useEffect(() => {
        const totalSections = Object.keys(completionStatus).length;
        const completedSections = Object.values(completionStatus).filter(status => status).length;
        const percentage = Math.round((completedSections / totalSections) * 100);
        setCompletionPercentage(percentage);
    }, [completionStatus]);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const facultyDataString = localStorage.getItem('facultyData');
                if (!facultyDataString) {
                    toast.error("No faculty data found in localStorage");
                    return;
                }

                const facultyData = JSON.parse(facultyDataString);
                if (!facultyData || !facultyData._id) {
                    toast.error("Invalid faculty data in localStorage");
                    return;
                }
            
                // Fetch profile data
                const profileResponse = await axios.get(`${baseUrl}Faculty/getProfile/${facultyData._id}`);
                setProfileData(prevData => ({
                    ...prevData, 
                    ...profileResponse.data 
                }));
                
                // Update photo completion status
                const hasPhoto = !!profileResponse.data.photo;
                setCompletionStatus(prev => ({
                    ...prev,
                    photo: hasPhoto
                }));

                // Fetch teaching details
                const teachingResponse = await axios.get(`${baseUrl}Faculty/${facultyData._id}/getTeachingDetails`);
                if (teachingResponse.data && teachingResponse.data.length > 0) {
                    setTeachingDetails(teachingResponse.data);
                    setCompletionStatus(prev => ({
                        ...prev,
                        teachingDetails: true
                    }));
                }
            } catch (error) {
                console.error("Error fetching profile data:", error);
                toast.error("Failed to load profile data");
            }
        };

        fetchProfileData();
    }, [baseUrl]);

    const handleTeachingInputChange = (e) => {
        const { name, value } = e.target;
        setNewTeachingDetail({
            ...newTeachingDetail,
            [name]: value
        });
    };

    const handleAddTeachingDetail = async () => {
        if (!newTeachingDetail.semester || !newTeachingDetail.section || !newTeachingDetail.subject) {
            toast.warning("Please fill all teaching detail fields");
            return;
        }
        
        try {
            const facultyDataString = localStorage.getItem('facultyData');
            if (!facultyDataString) {
                toast.error("Faculty data not found");
                return;
            }
            
            const facultyData = JSON.parse(facultyDataString);
            if (!facultyData || !facultyData._id) {
                toast.error("Invalid faculty data");
                return;
            }

            // Send new teaching details to backend
            const response = await axios.post(
                `${baseUrl}Faculty/${facultyData._id}/addTeachingDetail`,
                newTeachingDetail
            );
            
            // If backend returns the specific teaching detail
            if (response.data) {
                // Update teaching details state
                setTeachingDetails(prev => [...prev, response.data]);
                
                // Reset the input fields
                setNewTeachingDetail({ semester: '', section: '', subject: '' });
        
                // Update completion status
                setCompletionStatus(prev => ({
                    ...prev,
                    teachingDetails: true
                }));
        
                toast.success("Teaching details added successfully!");
            } else {
                toast.error("Received invalid response from server");
            }
        } catch (error) {
            console.error("Error adding teaching details:", error);
            toast.error("Failed to add teaching details. Please try again.");
        }
    };
    
    // Remove entire teaching detail
    const handleRemoveTeachingDetail = async (detailId) => {
        try {
            const facultyDataString = localStorage.getItem('facultyData');
            if (!facultyDataString) {
                toast.error("Faculty data not found");
                return;
            }
            
            const facultyData = JSON.parse(facultyDataString);
            if (!facultyData || !facultyData._id) {
                toast.error("Invalid faculty data");
                return;
            }
            
            // Call API to remove teaching detail
            await axios.delete(
                `${baseUrl}Faculty/${facultyData._id}/deleteTeachingDetail/${detailId}`
            );
            
            // Update local state
            const updatedDetails = teachingDetails.filter(detail => detail._id !== detailId);
            setTeachingDetails(updatedDetails);
            
            // Update completion status
            setCompletionStatus(prev => ({
                ...prev,
                teachingDetails: updatedDetails.length > 0
            }));
            
            toast.success("Teaching detail removed successfully");
        } catch (error) {
            console.error("Error removing teaching detail:", error);
            toast.error("Failed to remove teaching detail. Please try again.");
        }
    };
    
    // Handle photo upload
    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const facultyDataString = localStorage.getItem('facultyData');
                if (!facultyDataString) {
                    toast.error("Faculty data not found");
                    return;
                }

                const facultyData = JSON.parse(facultyDataString);
                if (!facultyData || !facultyData._id) {
                    toast.error("Invalid faculty data");
                    return;
                }

                const formData = new FormData();
                formData.append('photo', file);

                const response = await axios.put(
                    `${baseUrl}Faculty/updatePhoto/${facultyData._id}`,
                    formData,
                    {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    }
                );

                const uploadedPhotoUrl = response?.data?.photo || response?.data?.faculty?.photo;
                if (!uploadedPhotoUrl) {
                    toast.error("Photo upload failed. Invalid response from server.");
                    return;
                }

                setProfileData(prev => ({
                    ...prev,
                    photo: uploadedPhotoUrl
                }));

                setCompletionStatus(prev => ({
                    ...prev,
                    photo: true
                }));

                toast.success("Photo updated successfully!");
            } catch (error) {
                console.error("Error processing photo:", error);
                toast.error("Failed to process photo. Please try again.");
            }
        }
    };
    
    // Validate profile data
    const validateProfileData = () => {
        const requiredFields = [
            'firstName', 
            'lastName', 
            'email', 
            'department', 
            'employeeId', 
            'experience',
            'specialization', 
            'contactNumber', 
            'address'
        ];
        
        const emptyFields = requiredFields.filter(field => !profileData[field]);
        
        if (emptyFields.length > 0) {
            toast.warning(`Please fill in all required fields: ${emptyFields.join(', ')}`, {
                autoClose: 5000
            });
            return false;
        }
        
        if (!profileData.photo) {
            toast.warning("Please upload your photo");
            return false;
        }
        
        if (teachingDetails.length === 0) {
            toast.warning("Please add at least one teaching detail");
            return false;
        }
        
        return true;
    };

    // Handle save profile
    const handleSaveProfile = async (e) => {
        e.preventDefault();

        
        if (!validateProfileData()) {
            return;
        }
        
        try {
            const facultyDataString = localStorage.getItem('facultyData');
            if (!facultyDataString) {
                toast.error("Faculty data not found");
                return;
            }
            
            const facultyData = JSON.parse(facultyDataString);
            if (!facultyData || !facultyData._id) {
                toast.error("Invalid faculty data");
                return;
            }
            
            await axios.put(`${baseUrl}Faculty/update/${facultyData._id}`, profileData);
            toast.success("Profile details successfully updated!");
       
            
            if (completionPercentage === 100) {
                navigate("/facultyapproval");
            } else {
                toast.warning("Please complete your profile details before proceeding");
            }
        } catch (error) {
            console.error("Error saving profile:", error);
            toast.error("Failed to save profile. Please try again.");
        }
    };

    // Semester options
    const semesterOptions = [1,2,3,4,5,6,7,8];

    // Section options
    const sectionOptions = ['A', 'B', 'C', 'D', 'E'];
    
    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Complete Your Faculty Profile</h1>
                    <p className="text-gray-600 mt-2">Please provide your teaching details to complete your profile</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                            <div className="p-6">
                                <div className="flex justify-center mb-4">
                                    {profileData.photo ? (
                                        <img
                                            src={profileData.photo}
                                            alt="Profile"
                                            className="h-32 w-32 rounded-full object-cover border-4 border-indigo-100"
                                        />
                                    ) : (
                                        <div className="h-32 w-32 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <User size={48} className="text-indigo-600" />
                                        </div>
                                    )}
                                </div>
                                <div className="text-center mb-4">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {profileData.firstName || 'First'} {profileData.lastName || 'Last'}
                                    </h2>
                                    <p className="text-gray-600">{profileData.designation || 'Faculty'}</p>
                                    <p className="text-sm text-gray-500">{profileData.department || 'Department'}</p>
                                </div>

                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <div className="flex items-center mb-2">
                                        <CalendarRange className="h-5 w-5 text-indigo-500 mr-2" />
                                        <span className="text-sm text-gray-600">
                                            Joined: {profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center mb-2">
                                        <Book className="h-5 w-5 text-indigo-500 mr-2" />
                                        <span className="text-sm text-gray-600">ID: {profileData.employeeId || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="h-5 w-5 text-indigo-500 mr-2" />
                                        <span className="text-sm text-gray-600">Experience: {profileData.experience || 'N/A'}</span>
                                    </div>
                                </div>

                                {/* Profile Completion Circle */}
                                <div className="mt-6 flex flex-col items-center">
                                    <div className="relative h-40 w-40">
                                        <svg className="h-full w-full" viewBox="0 0 100 100">
                                            {/* Background circle */}
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="45"
                                                fill="none"
                                                stroke="#e6e6e6"
                                                strokeWidth="10"
                                            />
                                            {/* Progress circle */}
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="45"
                                                fill="none"
                                                stroke="#4f46e5"
                                                strokeWidth="10"
                                                strokeDasharray="283"
                                                strokeDashoffset={283 - (283 * completionPercentage) / 100}
                                                transform="rotate(-90 50 50)"
                                            />
                                            {/* Percentage text */}
                                            <text
                                                x="50"
                                                y="50"
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                fontSize="20"
                                                fontWeight="bold"
                                                fill="#4f46e5"
                                            >
                                                {completionPercentage}%
                                            </text>
                                        </svg>
                                    </div>

                                    <h3 className="mt-4 text-lg font-medium text-gray-900">Profile Completion</h3>

                                    <div className="w-full mt-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center">
                                                <CheckCircle className={`h-5 w-5 ${completionStatus.basicInfo ? 'text-green-500' : 'text-gray-400'} mr-2`} />
                                                <span className="text-sm text-gray-700">Basic Information</span>
                                            </div>
                                            <span className="text-xs font-medium text-gray-500">{completionStatus.basicInfo ? 'Complete' : 'Incomplete'}</span>
                                        </div>

                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center">
                                                <CheckCircle className={`h-5 w-5 ${completionStatus.photo ? 'text-green-500' : 'text-gray-400'} mr-2`} />
                                                <span className="text-sm text-gray-700">Profile Photo</span>
                                            </div>
                                            <span className="text-xs font-medium text-gray-500">{completionStatus.photo ? 'Complete' : 'Incomplete'}</span>
                                        </div>

                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center">
                                                <CheckCircle className={`h-5 w-5 ${completionStatus.teachingDetails ? 'text-green-500' : 'text-gray-400'} mr-2`} />
                                                <span className="text-sm text-gray-700">Teaching Details</span>
                                            </div>
                                            <span className="text-xs font-medium text-gray-500">{completionStatus.teachingDetails ? 'Complete' : 'Incomplete'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Photo Upload Section */}
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Photo</h3>
                                <div className="flex flex-col items-center">
                                    <div className="mb-4">
                                        {profileData.photo ? (
                                            <img
                                                src={profileData.photo}
                                                alt="Profile"
                                                className="h-32 w-32 rounded-full object-cover border-2 border-indigo-200"
                                            />
                                        ) : (
                                            <div className="h-32 w-32 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <User size={48} className="text-indigo-600" />
                                            </div>
                                        )}
                                    </div>
                                    <label className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:border-indigo-900 focus:ring focus:ring-indigo-300 cursor-pointer transition">
                                        {profileData.photo ? 'Change Photo' : 'Upload Photo'}
                                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                    </label>
                                    <p className="mt-2 text-xs text-gray-500">Recommended: Square JPG or PNG, at least 300x300px</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Teaching Details */}
                    <div className="lg:col-span-2">
                        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Teaching Details</h3>
                                <p className="text-gray-600 mb-6">Please specify which semesters, sections, and subjects you teach</p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                                        <select
                                            name="semester"
                                            value={newTeachingDetail.semester}
                                            onChange={handleTeachingInputChange}
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                        >
                                            <option value="">Select Semester</option>
                                            {semesterOptions.map((sem) => (
                                                <option key={sem} value={sem}>Semester {sem}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                                        <select
                                            name="section"
                                            value={newTeachingDetail.section}
                                            onChange={handleTeachingInputChange}
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                        >
                                            <option value="">Select Section</option>
                                            {sectionOptions.map((sec) => (
                                                <option key={sec} value={sec}>Section {sec}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                        <div className="flex">
                                            <input
                                                type="text"
                                                name="subject"
                                                value={newTeachingDetail.subject}
                                                onChange={handleTeachingInputChange}
                                                placeholder="Enter subject name"
                                                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-l-md"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddTeachingDetail}
                                                className="mt-1 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                <Plus className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Teaching Details List */}
                                <div className="mt-6">
                                    <h4 className="text-md font-medium text-gray-900 mb-2">Added Teaching Assignments</h4>

                                    {teachingDetails.length === 0 ? (
                                        <div className="py-4 text-center text-sm text-gray-500 bg-gray-50 rounded-md">
                                            No teaching details added yet. Please add your teaching assignments.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {teachingDetails.map((detail) => (
                                                <div key={detail.id} className="border border-gray-200 rounded-md p-4">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <div className="flex items-center">
                                                            <Users className="h-5 w-5 text-indigo-500 mr-2" />
                                                            <h5 className="text-sm font-medium text-gray-900">
                                                                Semester {detail.semester} - Section {detail.section}
                                                            </h5>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveTeachingDetail(detail._id)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </button>
                                                    </div>

                                                    <div className="pl-7">
                                                        <p className="text-xs text-gray-600 mb-2">Subjects:</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {Array.isArray(detail.subjects) ? (
                                                                detail.subjects.map((subject, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                                                                    >
                                                                        {subject}
                                                                    </div>
                                                                ))
                                                            ) : detail.subject ? (
                                                                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                                    {detail.subject}
                                                                
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-500">No subjects</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Additional Information Form */}
                        <div className="bg-gradient-to-br from-white to-indigo-50 rounded-xl shadow-lg overflow-hidden border border-indigo-100">
                            <div className="p-8">
                                <h3 className="text-xl font-semibold text-indigo-800 mb-6 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Personal Information
                                </h3>

                                <form onSubmit={handleSaveProfile}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        <div className="group">
                                            <label className="block text-sm font-medium text-indigo-700 mb-2 transition-all group-focus-within:text-indigo-500">Area of Specialization</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={profileData.specialization || ''}
                                                    onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                                                    className="mt-1 block w-full pl-10 pr-3 py-2.5 bg-white text-gray-900 border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg shadow-sm transition-all"
                                                    placeholder="e.g. Software Development"
                                                />
                                            </div>
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-medium text-indigo-700 mb-2 transition-all group-focus-within:text-indigo-500">Experience (Years)</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={profileData.experience || ''}
                                                    onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                                                    className="mt-1 block w-full pl-10 pr-3 py-2.5 bg-white text-gray-900 border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg shadow-sm transition-all"
                                                    placeholder="e.g. 5"
                                                />
                                            </div>
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-medium text-indigo-700 mb-2 transition-all group-focus-within:text-indigo-500">Contact Number</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={profileData.contactNumber}
                                                    onChange={(e) => setProfileData({ ...profileData, contactNumber: e.target.value })}
                                                    className="mt-1 block w-full pl-10 pr-3 py-2.5 bg-white text-gray-900 border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg shadow-sm transition-all"
                                                    placeholder=" +91 123-456-7890"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-medium text-indigo-700 mb-2 transition-all group-focus-within:text-indigo-500">Email Address</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <input
                                                    type="email"
                                                    value={profileData.email}
                                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                    className="mt-1 block w-full pl-10 pr-3 py-2.5 bg-white text-gray-900 border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg shadow-sm transition-all"
                                                    placeholder="e.g. your.email@example.com"
                                                />
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 group">
                                            <label className="block text-sm font-medium text-indigo-700 mb-2 transition-all group-focus-within:text-indigo-500">Address</label>
                                            <div className="relative">
                                                <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </div>
                                                <textarea
                                                    rows="3"
                                                    value={profileData.address}
                                                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                                    className="mt-1 block w-full pl-10 pr-3 py-2.5 bg-white text-gray-900 border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg shadow-sm transition-all"
                                                    placeholder="Enter your full address"
                                                    required
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-4 mt-8">
                                        <button
                                            type="button"
                                            className="px-5 py-2.5 rounded-lg text-sm font-medium text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md flex items-center"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Save Profile
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
