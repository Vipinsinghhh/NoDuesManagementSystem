import express from "express";
import studentController from "../controller/studentController.js"; 
import { Router } from "express";

const StudentRouter = Router();


StudentRouter.post("/register", studentController.register);
StudentRouter.post("/login", studentController.login);
StudentRouter.get("/profile/:id", studentController.getProfile);
StudentRouter.put("/update/:id", studentController.updateUser);
StudentRouter.delete("/delete/:id", studentController.deleteUser);
StudentRouter.get("/getList", studentController.getList)
StudentRouter.post("/updateStatus",studentController.updateStatus)
StudentRouter.post("/updateHodApprovalStatus", studentController.updateHodApprovalStatus)
StudentRouter.get('/profile', studentController.getStudentProfile);



export default StudentRouter;
