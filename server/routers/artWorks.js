import express from 'express'
import ArtWorksController from '../controllers/artWorks.js'
import upload from "../middleware/multer.js";
import { verifyToken } from "../middleware/outh.js";
const artWorksRouter=express.Router()
artWorksRouter.get("/", ArtWorksController.getAll);
artWorksRouter.put('/:id', verifyToken, ArtWorksController.update)
artWorksRouter.post('/', verifyToken, upload.single('image'), ArtWorksController.add);
artWorksRouter.delete('/:id', verifyToken, ArtWorksController.delete)
artWorksRouter.get("/getByEmail", ArtWorksController.getByEmail);
export default artWorksRouter

