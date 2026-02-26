import express from "express";
import hodController from "../controller/hodController.js"; 
import { Router } from "express";
import uploadImage from "../middleware/uploadImage.js";

const HodRouter = Router();


HodRouter.post("/register", hodController.register);
HodRouter.post("/login", hodController.login);
HodRouter.get("/profile/:id", hodController.getProfile);
HodRouter.put("/update/:id", hodController.updateUser);
HodRouter.put("/updatePhoto/:id", uploadImage.single("photo"), hodController.updatePhoto);
HodRouter.delete("/delete/:id", hodController.deleteUser);

export default HodRouter;
