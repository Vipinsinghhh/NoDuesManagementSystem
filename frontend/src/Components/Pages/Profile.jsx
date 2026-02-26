import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const getUserStorageKey = (userType) => {
  if (userType === "faculty") return "facultyData";
  if (userType === "hod") return "hodData";
  return "studentData";
};

const getDisplayName = (user, userType) => {
  if (!user) return "User";
  if (userType === "faculty") return `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Faculty";
  if (userType === "hod") return user.fullName || user.hodName || "HOD";
  return `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Student";
};

const getTokenKey = (userType) => {
  if (userType === "faculty") return "facultyToken";
  if (userType === "hod") return "hodToken";
  return "studentToken";
};

const getProfileEndpoint = (baseUrl, userType, userId) => {
  if (!baseUrl || !userId) return null;
  if (userType === "faculty") return `${baseUrl}Faculty/getProfile/${userId}`;
  if (userType === "hod") return `${baseUrl}Hod/profile/${userId}`;
  return `${baseUrl}Student/profile/${userId}`;
};

const getPhotoUploadEndpoint = (baseUrl, userType, userId) => {
  if (!baseUrl || !userId) return null;
  if (userType === "faculty") return `${baseUrl}Faculty/updatePhoto/${userId}`;
  if (userType === "hod") return `${baseUrl}Hod/updatePhoto/${userId}`;
  return `${baseUrl}Student/updatePhoto/${userId}`;
};

const getUserMeta = (user, userType) => {
  return {
    id: user.rollNumber || user.employeeId || "N/A",
    department: user.department || user.branch || "N/A",
    semester: user.semester || "N/A",
    section: user.section || "N/A",
    year: user.year || "N/A",
    phone: user.phonenumber || user.phoneNumber || user.contactNumber || "N/A",
    dob: user.dob ? new Date(user.dob).toLocaleDateString() : user.dateOfBirth || "N/A",
    role: userType.toUpperCase(),
  };
};

const FieldCard = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-1 text-sm font-semibold text-slate-900 break-words">{value || "N/A"}</p>
  </div>
);

export default function Profile() {
  const baseUrl = useSelector((state) => state.api.baseUrl);
  const userType = localStorage.getItem("userType") || "student";
  const userKey = getUserStorageKey(userType);
  const [user, setUser] = useState(() => {
    const rawData = localStorage.getItem(userKey);
    if (!rawData || rawData === "undefined") return null;
    try {
      return JSON.parse(rawData);
    } catch {
      return null;
    }
  });
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const userId = user?._id || user?.id;

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;

    const token = localStorage.getItem(getTokenKey(userType));
    const endpoint = getPhotoUploadEndpoint(baseUrl, userType, userId);

    if (!token || !endpoint) return;

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await axios.put(endpoint, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const uploadedUrl =
        response?.data?.photo ||
        response?.data?.faculty?.photo ||
        response?.data?.student?.photo ||
        response?.data?.hod?.photo;

      if (!uploadedUrl) return;

      const updatedUser = { ...user, photo: uploadedUrl };
      setUser(updatedUser);
      localStorage.setItem(userKey, JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Photo upload failed:", error);
    } finally {
      setIsUploadingPhoto(false);
      event.target.value = "";
    }
  };

  useEffect(() => {
    const fetchLatestProfile = async () => {
      if (!userId) return;
      const token = localStorage.getItem(getTokenKey(userType));
      const endpoint = getProfileEndpoint(baseUrl, userType, userId);

      if (!endpoint || !token) return;

      try {
        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response?.data) {
          setUser(response.data);
          localStorage.setItem(userKey, JSON.stringify(response.data));
        }
      } catch (error) {
        console.error("Failed to refresh profile data:", error);
      }
    };

    fetchLatestProfile();
  }, [baseUrl, userId, userKey, userType]);

  const joinedDate = useMemo(() => {
    if (!user?.createdAt) return "N/A";
    try {
      return new Date(user.createdAt).toLocaleDateString();
    } catch {
      return "N/A";
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 pt-24 px-4 pb-10">
        <div className="max-w-4xl mx-auto rounded-2xl border border-red-200 bg-white p-6 shadow-md">
          <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
          <p className="mt-2 text-red-600">Profile data not found. Please login again.</p>
        </div>
      </div>
    );
  }

  const name = getDisplayName(user, userType);
  const initials = name?.charAt(0)?.toUpperCase() || "U";
  const meta = getUserMeta(user, userType);

  const isStudent = userType === "student";
  const isHod = userType === "hod";

  return (
    <div className="min-h-screen bg-slate-100 pt-24 px-4 pb-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-sky-700 via-cyan-700 to-emerald-700 p-[1px] shadow-lg">
          <div className="rounded-2xl bg-white/95 p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {user?.photo ? (
                  <img
                    src={user.photo}
                    alt="Profile"
                    className="h-16 w-16 rounded-2xl object-cover border border-slate-200"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-2xl font-bold text-white">
                    {initials}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
                  <p className="text-sm text-slate-600">{name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold tracking-wide text-sky-700">
                  {meta.role}
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                  ID: {meta.id}
                </span>
                <label className="cursor-pointer rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                  {isUploadingPhoto ? "Uploading..." : "Upload Photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={isUploadingPhoto}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-md">
          <h2 className="text-lg font-bold text-slate-900">
            {isHod ? "HOD Account Details" : "Account Details"}
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldCard label="Full Name" value={name} />
            <FieldCard label="Email Address" value={user.email} />
            <FieldCard label="Department / Branch" value={meta.department} />
            <FieldCard label="Role" value={meta.role} />
          </div>
        </div>

        {isStudent && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-md">
            <h2 className="text-lg font-bold text-slate-900">Academic Details</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FieldCard label="Year" value={meta.year} />
              <FieldCard label="Semester" value={meta.semester} />
              <FieldCard label="Section" value={meta.section} />
            </div>
          </div>
        )}

        {isHod && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-md">
            <h2 className="text-lg font-bold text-slate-900">Administrative Details</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FieldCard label="Employee ID" value={user.employeeId || "N/A"} />
              <FieldCard label="Department Head" value={user.department || "N/A"} />
              <FieldCard label="Joined On" value={joinedDate} />
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-md">
          <h2 className="text-lg font-bold text-slate-900">
            {isHod ? "Official Contact" : "Contact Details"}
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldCard label="Phone Number" value={meta.phone} />
            <FieldCard label={isHod ? "Official Email" : "Date of Birth"} value={isHod ? (user.email || "N/A") : meta.dob} />
          </div>
        </div>
      </div>
    </div>
  );
}
