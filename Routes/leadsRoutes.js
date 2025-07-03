import express from 'express'
import { GetAllLeads, GetAllNotPublishedLeads, GetLeadById, Edit, DeleteById, GetAllLeadsWithParams, Create, GetAssignedLeadsForCurrentUser } from '../Controllers/LeadsController.js'
import { RoleAuthMiddleware } from '../Middlewares/RoleAuthMiddelware.js'

const LeadsRouter = express.Router()
LeadsRouter.post('/create',  RoleAuthMiddleware("admin", "executive"), Create)
LeadsRouter.get('/',  RoleAuthMiddleware("admin", "executive"), GetAllLeads)
LeadsRouter.get('/notpublishedusers',  RoleAuthMiddleware("admin", "executive"), GetAllNotPublishedLeads)
LeadsRouter.get('/assigned-to-me',  RoleAuthMiddleware("admin", "executive", "sales"), GetAssignedLeadsForCurrentUser)
LeadsRouter.post('/withparams',  RoleAuthMiddleware("admin", "executive", "sales"), GetAllLeadsWithParams)
LeadsRouter.get('/:id',  RoleAuthMiddleware("admin", "executive", "sales"), GetLeadById)
LeadsRouter.put('/edit/:id',  RoleAuthMiddleware("admin", "executive", "sales"), Edit)
LeadsRouter.delete('/delete/:id',  RoleAuthMiddleware("admin", "executive"), DeleteById)
export default LeadsRouter