import express from "express";
import * as userController from "../controllers/userController.js"; // 2 çeşit yazımı vardı burayı farklı pageRouteu farklı yazdım.
import * as authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/register").post(userController.createUser); //localhost:3000/users/register
router.route("/login").post(userController.loginUser); //localhost:3000/users/login
router.route("/dashboard").get(authMiddleware.authenticateToken ,userController.getDashboardPage); //localhost:3000/users/dashboard
router.route("/").get(authMiddleware.authenticateToken,userController.getAllUsers); //localhost:3000/users
router.route("/:id").get(authMiddleware.authenticateToken,userController.getAUser); //localhost:3000/users
router.route("/:id/follow").put(authMiddleware.authenticateToken,userController.follow);
router.route("/:id/unfollow").put(authMiddleware.authenticateToken, userController.unfollow);


export default router;