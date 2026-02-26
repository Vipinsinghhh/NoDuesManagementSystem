import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux'; // ✅ import


const FacultyApproval = () => {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const baseUrl = useSelector((state) => state.api.baseUrl); // ✅ get baseUrl from Redux
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const facultyDataString = localStorage.getItem("facultyData");
        // Fix: Parse the JSON data and ensure it's an array
        const facultyData = JSON.parse(facultyDataString);
        
        // Fix: Check if facultyData is an array, otherwise use an empty array
        const facultyArray = Array.isArray(facultyData) ? facultyData : [facultyData];
        
        // 2. Fetch student list from API
        const response = await axios.get(`${baseUrl}Student/getList`);
        const studentList = response.data;
        
        // 3. Extract subjects taught by the faculty
        const subjectsSet = new Set();
        const eligibleCombinations = new Set();
        
        facultyArray.forEach(faculty => {
          if (faculty.teachingDetails && Array.isArray(faculty.teachingDetails)) {
            faculty.teachingDetails.forEach(detail => {
              if (detail.semester && detail.section) {
                // Store as a string like "3-A" for semester 3, section A
                eligibleCombinations.add(`${detail.semester}-${detail.section}`);
                
                // Add subject to the set
                if (detail.subject) {
                  subjectsSet.add(detail.subject);
                }
              }
            });
          }
        });
        
        // Convert set to array and set state
        const subjectsArray = Array.from(subjectsSet);
        setSubjects(subjectsArray);
        // Set the first subject as default selected subject if available
        if (subjectsArray.length > 0) {
          setSelectedSubject(subjectsArray[0]);
        }
        
        // 4. Filter students by semester-section match
        const filteredStudents = studentList.filter(student => {
          // Only include students where semester-section matches faculty's assigned classes
          return eligibleCombinations.has(`${student.semester}-${student.section}`);
        });
        
        // 5. Map students to all matching subjects taught by the faculty
        const transformedData = [];
        
        filteredStudents.forEach(student => {
          // Find all subjects that this faculty teaches to this student's semester-section
          const studentSubjects = [];
          
          facultyArray.forEach(faculty => {
            if (faculty.teachingDetails && Array.isArray(faculty.teachingDetails)) {
              faculty.teachingDetails.forEach(detail => {
                if (detail.semester === student.semester && 
                    detail.section === student.section && 
                    detail.subject) {
                  studentSubjects.push(detail.subject);
                }
              });
            }
          });
          
          // Create an entry for each subject
          studentSubjects.forEach(subject => {
            const submissionId = `${student._id}-${subject}`;
            
            // Create the base submission object
            const submissionObj = {
              id: submissionId,
              studentId: student._id,
              studentName: `${student.firstname} ${student.lastname}`,
              rollNumber: student.rollNumber,
              semester: student.semester, 
              section: student.section,
              subject: subject,
              submissionDate: student.submissionDate || new Date().toLocaleDateString(),
              assignment: {
                status: 'Pending',
                activeButton: null
              },
              labManual: {
                status: 'Pending',
                activeButton: null
              },
              presentation: {
                status: 'Pending',
                activeButton: null
              }
            };
            
            // Check if we have saved status data in localStorage
            const savedStatusKey = `submission_${submissionId}`;
            const savedStatus = localStorage.getItem(savedStatusKey);
            
            if (savedStatus) {
              const parsedStatus = JSON.parse(savedStatus);
              
              // Update the submission with saved status data
              if (parsedStatus.assignment) {
                submissionObj.assignment = parsedStatus.assignment;
              }
              if (parsedStatus.labManual) {
                submissionObj.labManual = parsedStatus.labManual;
              }
              if (parsedStatus.presentation) {
                submissionObj.presentation = parsedStatus.presentation;
              }
            }
            
            transformedData.push(submissionObj);
          });
        });
        
        setSubmissions(transformedData);
      } catch (error) {
        console.error("Error fetching or filtering submissions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [baseUrl]);

  const handleStatusChange = async (submissionId, type, newStatus, buttonType) => {
    // Update the local state first
    const updatedSubmissions = submissions.map(submission =>
      submission.id === submissionId
        ? {
            ...submission,
            [type]: {
              ...submission[type],
              status: newStatus,
              activeButton: buttonType
            }
          }
        : submission
    );

    setSubmissions(updatedSubmissions);

    // Find the updated submission to save to localStorage and API
    const updatedSubmission = updatedSubmissions.find(sub => sub.id === submissionId);

    // Save the updated status to localStorage
    const savedStatusKey = `submission_${submissionId}`;
    const statusToSave = {
      assignment: updatedSubmission.assignment,
      labManual: updatedSubmission.labManual,
      presentation: updatedSubmission.presentation
    };
    localStorage.setItem(savedStatusKey, JSON.stringify(statusToSave));

    // Format data for API
    const formattedData = {
      studentId: updatedSubmission.studentId,
      subject: updatedSubmission.subject,
      assignment: updatedSubmission.assignment.status,
      labManual: updatedSubmission.labManual.status,
      presentation: updatedSubmission.presentation.status
    };

    try {
      const response = await axios.post(`${baseUrl}Student/updateStatus`, formattedData);
      if (response.data.success) {
        console.log("Submission status updated successfully!");
      } else {
        alert("Failed to update submission status.");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("An error occurred while submitting the data.");
    }
  };

  const resetActiveButton = (submissionId, type) => {
    // Update local state
    const updatedSubmissions = submissions.map(submission => 
      submission.id === submissionId 
        ? { 
            ...submission, 
            [type]: {
              ...submission[type],
              status: 'Pending',
              activeButton: null
            }
          }
        : submission
    );
    
    setSubmissions(updatedSubmissions);
    
    // Find the updated submission to save to localStorage
    const updatedSubmission = updatedSubmissions.find(sub => sub.id === submissionId);
    
    // Save the updated status to localStorage
    const savedStatusKey = `submission_${submissionId}`;
    const statusToSave = {
      assignment: updatedSubmission.assignment,
      labManual: updatedSubmission.labManual,
      presentation: updatedSubmission.presentation
    };
    localStorage.setItem(savedStatusKey, JSON.stringify(statusToSave));
    
    // Format data for API
    const formattedData = {
      studentId: updatedSubmission.studentId,
      subject: updatedSubmission.subject,
      assignment: updatedSubmission.assignment.status,
      labManual: updatedSubmission.labManual.status,
      presentation: updatedSubmission.presentation.status
    };
    
    // Update status in the backend
    axios.post(`${baseUrl}Student/updateStatus`, formattedData)
      .catch(error => {
        console.error("Error submitting reset data:", error);
      });
  };

 

  const StatusButtons = ({ submission, type }) => {
    const currentItem = submission[type] || { status: 'Pending', activeButton: null };

    return (
      <div className="flex flex-col space-y-2">
        <div className="h-10">
          {currentItem.activeButton === null ? (
            <div className="flex space-x-2">
              <button
                onClick={() => handleStatusChange(
                  submission.id, 
                  type, 
                  'Approved', 
                  'Approve'
                )}
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
                onClick={() => handleStatusChange(
                  submission.id, 
                  type, 
                  'Rejected', 
                  'Reject'
                )}
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
          ) : (
            <div className="flex items-center space-x-2">
              <span 
                className={`
                  px-2 
                  py-1 
                  rounded-full 
                  text-xs 
                  font-semibold
                  ${currentItem.status === 'Approved' ? 'bg-green-200 text-green-800' : 
                    'bg-red-200 text-red-800'}
                `}
              >
                {currentItem.status}
              </span>
              <button 
                onClick={() => resetActiveButton(submission.id, type)}
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Filter submissions based on selected subject
  const filteredSubmissions = submissions.filter(
    submission => submission.subject === selectedSubject
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8 pt-20">
      <div className="container mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-wide">
              Faculty Approval Dashboard
            </h1>
            <p className="text-blue-100 mt-2">
              Review and manage student submissions in your assigned classes
            </p>
          </div>
        
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <label htmlFor="subject-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Select Subject:
            </label>
            <select
              id="subject-filter"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="mt-1 block w-full md:w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              <p>Loading submissions...</p>
            </div>
          ) : filteredSubmissions.length > 0 ? (
            <div className="overflow-x-auto">
              <h2 className="text-xl font-bold text-blue-800 mb-4 bg-blue-50 p-3 rounded-lg">
                Subject: {selectedSubject}
              </h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="border-b p-4 text-left text-blue-800">Student Name</th>
                    <th className="border-b p-4 text-left text-blue-800">Roll Number</th>
                    <th className="border-b p-4 text-left text-blue-800">Semester</th>
                    <th className="border-b p-4 text-left text-blue-800">Section</th>
                    <th className="border-b p-4 text-left text-blue-800">Assignment</th>
                    <th className="border-b p-4 text-left text-blue-800">Lab Manual</th>
                    <th className="border-b p-4 text-left text-blue-800">Presentation</th>
                    <th className="border-b p-4 text-left text-blue-800">Submission Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((submission) => (
                    <tr 
                      key={submission.id} 
                      className="hover:bg-blue-50 transition duration-150 ease-in-out"
                    >
                      <td className="border-b p-4">{submission.studentName}</td>
                      <td className="border-b p-4">{submission.rollNumber}</td>
                      <td className="border-b p-4">{submission.semester}</td>
                      <td className="border-b p-4">{submission.section}</td>
                      <td className="border-b p-4">
                        <StatusButtons 
                          submission={submission} 
                          type="assignment" 
                        />
                      </td>
                      <td className="border-b p-4">
                        <StatusButtons 
                          submission={submission} 
                          type="labManual" 
                        />
                      </td>
                      <td className="border-b p-4">
                        <StatusButtons 
                          submission={submission} 
                          type="presentation" 
                        />
                      </td>
                      <td className="border-b p-4">{submission.submissionDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No student submissions found for the selected subject.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyApproval;
