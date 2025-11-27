import {signUp, signIn} from "../controllers/clientController.js";
import { Router } from "express";

const clientRouter = Router()

clientRouter.post('/signup',signUp);
clientRouter.post('/signin',signIn);

export default clientRouter;