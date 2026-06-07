import express from 'express'
import UserController from '../controllers/users.js'
import upload  from "../middleware/multer.js";
import { verifyToken } from "../middleware/outh.js";
const userRouter=express.Router()
userRouter.get('/',verifyToken,UserController.getByEmail)
userRouter.put('/', verifyToken, upload.single('profilePic'), UserController.update)
userRouter.post('/', upload.single('profilePic'), UserController.add)
userRouter.delete('/:email',verifyToken, UserController.delete)
export default userRouter

