import e from "express";
import { logIn, logOut, signUp } from "../controllers/auth.controller.js";

const authRouter = e.Router()

authRouter.post('/signup', signUp);
authRouter.post('/signin', logIn);
authRouter.get('/logout', logOut);

export default authRouter;