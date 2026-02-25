import { Router } from "express";
import facultyController from "../controller/facultyController.js";

const FacultyRouter = Router();


FacultyRouter.post("/register", facultyController.register);
FacultyRouter.post("/login", facultyController.login);
FacultyRouter.get("/getProfile/:id", facultyController.getProfile);
FacultyRouter.put("/update/:id", facultyController.updateUser);
FacultyRouter.delete("/delete/:id", facultyController.deleteUser);

FacultyRouter.post("/:id/addTeachingDetail", facultyController.addTeachingDetail);
FacultyRouter.get("/:id/getTeachingDetails", facultyController.getTeachingDetails);
FacultyRouter.delete("/:id/deleteTeachingDetail/:detailId", facultyController.deleteTeachingDetail);
FacultyRouter.put("/updatePhoto/:id", facultyController.updatePhoto);

FacultyRouter.get("/list", facultyController.getAllFaculty);
FacultyRouter.get("/bySubject/:subject", facultyController.getFacultyBySubject);
FacultyRouter.get("/bySemesterSection/:semester/:section", facultyController.getFacultyBySemesterSection);







export default FacultyRouter;