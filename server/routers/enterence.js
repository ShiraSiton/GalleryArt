import express from 'express';
import EnterceController from '../controllers/enterence.js'

const enterenceRouter=express.Router()

enterenceRouter.post('/',EnterceController.login)

export default enterenceRouter