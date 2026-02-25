import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const getDerivedHodStatusFromSubmissions = (submissions) => {
  let allApproved = true;
  let anyRejected = false;

  if (submissions) {
    const subjects = Object.keys(submissions);

    if (subjects.length === 0) {
      allApproved = false;
    } else {
      subjects.forEach(subject => {
        const subjectData = submissions[subject];
        if (
          subjectData.assignment !== 'Approved' ||
          subjectData.labManual !== 'Approved' ||
          subjectData.presentation !== 'Approved'
        ) {
          allApproved = false;
        }

        if (
          subjectData.assignment === 'Rejected' ||
          subjectData.labManual === 'Rejected' ||
          subjectData.presentation === 'Rejected'
        ) {
          anyRejected = true;
        }
      });
    }
  } else {
    allApproved = false;
  }

  if (allApproved) return 'Ready for Approval';
  if (anyRejected) return 'Has Rejected Items';
  return 'Incomplete';
};

const HodApproval = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pendingApproval', 'approved', 'rejected'
  const [hodBranch, setHodBranch] = useState('');

  const baseUrl = useSelector((state) => state.api.baseUrl);

  useEffect(() => {
    try {
      const hodDataString = localStorage.getItem('hodData');
      if (hodDataString) {
        const hodData = JSON.parse(hodDataString);
        if (hodData && (hodData.department || hodData.branch)) {
          setHodBranch(hodData.department || hodData.branch);
        }
      }
    } catch (error) {
      console.error('Error parsing HOD data from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('hodToken');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        const response = await axios.get(`${baseUrl}Student/getList`, config);
        
        if (Array.isArray(response.data)) {
          // Process students with submission status
          const processedStudents = response.data.map(student => {
            let hodStatus = 'Pending';
            const derivedStatus = getDerivedHodStatusFromSubmissions(student.submissions);
            
            // Determine HOD status based on submission statuses unless explicit HOD decision is stored
            if (student.hodApprovalStatus && ['Approved', 'Rejected', 'Pending'].includes(student.hodApprovalStatus)) {
              hodStatus = student.hodApprovalStatus === 'Pending'
                ? derivedStatus
                : student.hodApprovalStatus;
            } else {
              hodStatus = derivedStatus;
            }
            
            return {
              ...student,
              hodStatus,
              submissionDate: student.updatedAt ? new Date(student.updatedAt).toLocaleDateString() : 'N/A'
            };
          });
          
          // Filter students to only include those from the HOD's branch
          const filteredByBranch = hodBranch ? 
            processedStudents.filter(student => student.branch === hodBranch) : 
            processedStudents;
          
          setStudents(filteredByBranch);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching students:', error);
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, [hodBranch, baseUrl]);

  const handleStatusChange = async (studentId, status) => {
    try {
      const response = await axios.post(`${baseUrl}Student/updateHodApprovalStatus`, {
        studentId,
        status
      });

      if (!response.data?.success) {
        alert('Failed to update HOD decision.');
        return;
      }

      setStudents(prevStudents => prevStudents.map(student =>
        student._id === studentId
          ? {
              ...student,
              hodStatus: status === 'Pending'
                ? getDerivedHodStatusFromSubmissions(student.submissions)
                : status
            }
          : student
      ));
    } catch (error) {
      console.error('Error updating HOD decision:', error);
      alert('An error occurred while updating HOD decision.');
    }
  };

  const openStudentProfile = (student) => {
    setSelectedStudent(student);
  };

  const closeStudentProfile = () => {
    setSelectedStudent(null);
  };

  const getFilteredStudents = () => {
    switch(filter) {
      case 'pendingApproval':
        return students.filter(student => student.hodStatus === 'Ready for Approval');
      case 'approved':
        return students.filter(student => student.hodStatus === 'Approved');
      case 'rejected':
        return students.filter(student => student.hodStatus === 'Rejected');
      case 'incomplete':
        return students.filter(student => student.hodStatus === 'Incomplete' || student.hodStatus === 'Has Rejected Items');
      default:
        return students;
    }
  };

  const StudentProfileModal = ({ student, onClose }) => {
    if (!student) return null;
    
    // Get all subjects
    const subjects = student.submissions ? Object.keys(student.submissions) : [];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-xl shadow-2xl w-3/4 max-w-2xl p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
          <div>
            <h2 className="text-2xl font-bold mb-4 text-blue-700 border-b pb-2">
              Student Profile
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p><strong>Name:</strong> {student.firstname} {student.lastname}</p>
                <p><strong>Roll Number:</strong> {student.rollNumber}</p>
                <p><strong>Branch:</strong> {student.branch}</p>
              </div>
              <div>
                <p><strong>Email:</strong> {student.email}</p>
                <p><strong>Contact:</strong> {student.phonenumber}</p>
                <p><strong>Semester:</strong> {student.semester}, Section: {student.section}</p>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mb-3 text-blue-600 border-b pb-2">
              Submission Status by Subject
            </h3>
            
            {subjects.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="border p-2 text-left">Subject</th>
                      <th className="border p-2 text-left">Assignment</th>
                      <th className="border p-2 text-left">Lab Manual</th>
                      <th className="border p-2 text-left">Presentation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map(subject => (
                      <tr key={subject}>
                        <td className="border p-2 font-medium">{subject}</td>
                        <td className="border p-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            student.submissions[subject].assignment === 'Approved' ? 'bg-green-100 text-green-800' :
                            student.submissions[subject].assignment === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {student.submissions[subject].assignment}
                          </span>
                        </td>
                        <td className="border p-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            student.submissions[subject].labManual === 'Approved' ? 'bg-green-100 text-green-800' :
                            student.submissions[subject].labManual === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {student.submissions[subject].labManual}
                          </span>
                        </td>
                        <td className="border p-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            student.submissions[subject].presentation === 'Approved' ? 'bg-green-100 text-green-800' :
                            student.submissions[subject].presentation === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {student.submissions[subject].presentation}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No submissions found for this student.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8 pt-20">
      <div className="container mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
          <h1 className="text-3xl font-bold tracking-wide">
            HOD Final Approval Dashboard
          </h1>
          <p className="text-blue-100 mt-2">
            Review and approve student submissions {hodBranch && `- ${hodBranch} Department`}
          </p>
        </div>
        
        <div className="bg-blue-50 p-4 border-b flex justify-between items-center">
          <div className="text-lg font-semibold text-blue-800">
            Students: {getFilteredStudents().length}
          </div>
          <div className="flex space-x-2">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-blue-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Students</option>
              <option value="pendingApproval">Ready for Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="incomplete">Incomplete</option>
            </select>
          </div>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
          ) : getFilteredStudents().length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="border-b p-4 text-left text-blue-800">Student Name</th>
                    <th className="border-b p-4 text-left text-blue-800">Roll Number</th>
                    <th className="border-b p-4 text-left text-blue-800">Branch</th>
                    <th className="border-b p-4 text-left text-blue-800">Semester</th>
                    <th className="border-b p-4 text-left text-blue-800">Status</th>
                    <th className="border-b p-4 text-left text-blue-800">Last Updated</th>
                    <th className="border-b p-4 text-left text-blue-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredStudents().map((student) => (
                    <tr 
                      key={student._id} 
                      className="hover:bg-blue-50 transition duration-150 ease-in-out"
                    >
                      <td className="border-b p-4">
                        <button 
                          onClick={() => openStudentProfile(student)}
                          className="text-blue-600 hover:underline"
                        >
                          {student.firstname} {student.lastname}
                        </button>
                      </td>
                      <td className="border-b p-4">{student.rollNumber}</td>
                      <td className="border-b p-4">{student.branch}</td>
                      <td className="border-b p-4">Sem {student.semester}, Sec {student.section}</td>
                      <td className="border-b p-4">
                        <span 
                          className={`
                            px-2 
                            py-1 
                            rounded-full 
                            text-xs 
                            font-semibold
                            ${student.hodStatus === 'Approved' ? 'bg-green-200 text-green-800' : 
                              student.hodStatus === 'Rejected' ? 'bg-red-200 text-red-800' :
                              student.hodStatus === 'Ready for Approval' ? 'bg-blue-200 text-blue-800' :
                              'bg-yellow-200 text-yellow-800'}
                          `}
                        >
                          {student.hodStatus}
                        </span>
                      </td>
                      <td className="border-b p-4">{student.submissionDate}</td>
                      <td className="border-b p-4">
                        {(student.hodStatus === 'Ready for Approval' || student.hodStatus === 'Has Rejected Items') && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleStatusChange(student._id, 'Approved')}
                              className="
                                bg-green-500 
                                text-white 
                                px-3 
                                py-1 
                                rounded 
                                text-sm 
                                transition
                                transform
                                hover:scale-105
                              "
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(student._id, 'Rejected')}
                              className="
                                bg-red-500 
                                text-white 
                                px-3 
                                py-1 
                                rounded 
                                text-sm 
                                transition
                                transform
                                hover:scale-105
                              "
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {(student.hodStatus === 'Approved' || student.hodStatus === 'Rejected') && (
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${student.hodStatus === 'Approved' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                              {student.hodStatus}
                            </span>
                            <button
                              onClick={() => handleStatusChange(student._id, 'Pending')}
                              className="text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                              Reset
                            </button>
                          </div>
                        )}
                        <button
                          onClick={() => openStudentProfile(student)}
                          className="
                            bg-blue-500 
                            text-white 
                            px-3 
                            py-1 
                            rounded 
                            text-sm 
                            transition
                            transform
                            hover:scale-105
                            mt-1
                          "
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20a8 8 0 100-16 8 8 0 000 16z"></path>
              </svg>
              <p className="text-gray-500 mt-4">No students found matching the selected filter.</p>
            </div>
          )}
        </div>
      </div>

      {selectedStudent && (
        <StudentProfileModal 
          student={selectedStudent} 
          onClose={closeStudentProfile} 
        />
      )}
    </div>
  );
};

export default HodApproval;
