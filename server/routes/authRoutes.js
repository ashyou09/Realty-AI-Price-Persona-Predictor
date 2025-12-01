import express from 'express';
import {register,login,logout,verify,getUsers,deleteUser} from '../controllers/authController.js';
import { authenticate, isAdmin } from '../middleware/authMiddleware.js';

const authRouter = express.Router();    

authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',logout);
authRouter.get('/verify',verify);
authRouter.get('/users', authenticate, isAdmin, getUsers);
authRouter.delete('/users/:id', authenticate, isAdmin, deleteUser);

export default authRouter;