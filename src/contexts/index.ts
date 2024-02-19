import { Router } from "express";
import authController from "./auth/auth.controller";
import boardsController from "./board/board.controller";
import usersController from "./users/users.controller";

const controllers = Router();

controllers.use("/boards", boardsController);
controllers.use("/users", usersController);
controllers.use("/auth", authController);

export default controllers;
