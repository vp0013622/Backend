import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import multer from 'multer'
import bcrypt from 'bcrypt'
import {AuthMiddelware} from './Middlewares/AuthMiddelware.js'
import {RoleAuthMiddleware} from './Middlewares/RoleAuthMiddelware.js'
import { errorHandler } from './Middlewares/Handlers/ErrorHandler.js'
import UsersRouter from './Routes/usersRoutes.js'
import LoginRoute from './Routes/login.js'
import RegisterNormalUserRouter from './Routes/registerNormalUser.js'
import RolesRouter from './Routes/rolesRoutes.js'
import PropertyTypesRouter from './Routes/propertyTypesRoutes.js'
import UserAddressRouter from './Routes/userAddressRoutes.js'
import PropertyRouter from './Routes/propertyRoutes.js'
import { RolesModel } from './Models/RolesModel.js'
import { UsersModel } from './Models/UsersModel.js'
import { DocumentTypesModel } from './Models/DocumentTypesModel.js'

import path from 'path';
import { fileURLToPath } from 'url';
import UserProfilePictureRouter from './Routes/userProfilePictureRoutes.js'
import fs from 'fs';
import LeadsRouter from './Routes/leadsRoutes.js'
import FollowUpStatusRouter from './Routes/followUpStatusRoutes.js'
import LeadStatusRouter from './Routes/leadStatusRoutes.js'
import ReferenceSourceRouter from './Routes/referenceSourceRoutes.js'
import ContactUsRouter from './Routes/contactUsRoutes.js'
import DocumentRouter from './Routes/documentRoutes.js'
import DocumentTypesRouter from './Routes/documentTypesRoutes.js'

// Import environment configuration
import config from './config/environment.js'

const PORT = config.PORT
const DB_CONNECTION_STRING = config.DB_CONNECTION_STRING
const SALT = 10 // Added salt rounds for bcrypt

const app = express()

// For serving uploaded images statically - MOVED TO TOP PRIORITY
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//middle ware for parsing json request:
app.use(express.json())

//middle ware for cores policy: configured for environment
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true
}));

//defult route.
app.get('/', (req, res)=>{
    console.log("Welcome to API")
    return res.status(200).json({
        message: 'welcome to api'
    })
})
app.get('/api/', (req, res)=>{
    return res.status(200).json({
        message: 'welcome to api'
    })
})

const createAdminRole = async () => {
    try {
        // Check if ADMIN role already exists
        const existingRole = await RolesModel.findOne({ name: "ADMIN" });
        if (existingRole) {
            return existingRole;
        }

        const newRole = {
            name: "ADMIN",
            description: "Super admin role with all privileges",
            createdByUserId: new mongoose.Types.ObjectId(),
            updatedByUserId: new mongoose.Types.ObjectId(),
            published: true
        }
        return await RolesModel.create(newRole);
    } catch (error) {
        throw new Error(`Error creating admin role: ${error.message}`);
    }
}

app.post('/api/tempSetup', async(req, res, next) => {
    try {
        // First create or get admin role
        const adminRole = await createAdminRole();
        
        // Check if admin user already exists
        const existingAdmin = await UsersModel.findOne({ email: "admin@gmail.com" });
        if (existingAdmin) {
            return res.status(400).json({
                message: 'Admin user already exists',
                data: { email: existingAdmin.email }
            });
        }

        const adminData = {
            email: "admin@gmail.com",
            firstName: "Temp",
            lastName: "Admin",
            password: "admin@123",
            phoneNumber: "+919185867888",
            role: adminRole._id
        }

        const hashedPassword = await bcrypt.hash(adminData.password, SALT);
        const newUser = {
            email: adminData.email,
            password: hashedPassword,
            firstName: adminData.firstName,
            lastName: adminData.lastName,
            role: adminData.role,
            phoneNumber: adminData.phoneNumber,
            createdByUserId: new mongoose.Types.ObjectId(),
            updatedByUserId: new mongoose.Types.ObjectId(),
            published: true
        }

        const user = await UsersModel.create(newUser);
        
        // Don't send password in response
        const responseUser = { ...user.toObject() };
        delete responseUser.password;
        
        return res.status(200).json({
            message: 'Admin user created successfully',
            data: responseUser
        });

    } catch (error) {
        next(error); // Pass error to error handler
    }
});

app.get('/api/auth/check', AuthMiddelware, async(req, res)=>{
    res.status(200).json({
            message: 'Authenticated',
            data: true
    })
})

// Manual endpoint to create default document types
app.post('/api/setup/documenttypes', async(req, res, next) => {
    try {
        await createDefaultDocumentTypes();
        res.status(200).json({
            message: 'Default document types created successfully',
            data: 'Document types setup completed'
        });
    } catch (error) {
        next(error);
    }
});

const createDefaultDocumentTypes = async () => {
    try {
        const defaultTypes = [
            {
                name: "IDENTITY_PROOF",
                description: "Government issued ID proof (Aadhar, PAN, Passport, etc.)",
                allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
                maxFileSize: 5 * 1024 * 1024, // 5MB
                isRequired: true
            },
            {
                name: "ADDRESS_PROOF",
                description: "Address proof documents (Utility bills, Bank statements, etc.)",
                allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
                maxFileSize: 5 * 1024 * 1024, // 5MB
                isRequired: true
            },
            {
                name: "INCOME_PROOF",
                description: "Income proof documents (Salary slips, Bank statements, etc.)",
                allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
                maxFileSize: 10 * 1024 * 1024, // 10MB
                isRequired: false
            },
            {
                name: "PROPERTY_DOCUMENTS",
                description: "Property related documents (Sale deed, Registration, etc.)",
                allowedExtensions: ['pdf', 'doc', 'docx'],
                maxFileSize: 15 * 1024 * 1024, // 15MB
                isRequired: false
            },
            {
                name: "AGREEMENT_DOCUMENTS",
                description: "Legal agreements and contracts",
                allowedExtensions: ['pdf', 'doc', 'docx'],
                maxFileSize: 10 * 1024 * 1024, // 10MB
                isRequired: false
            }
        ];

        for (const docType of defaultTypes) {
            const existing = await DocumentTypesModel.findOne({ name: docType.name });
            if (!existing) {
                await DocumentTypesModel.create({
                    ...docType,
                    createdByUserId: new mongoose.Types.ObjectId(), // Create a new ObjectId
                    updatedByUserId: new mongoose.Types.ObjectId(), // Create a new ObjectId
                    published: true
                });
                //console.log(`Created default document type: ${docType.name}`);
            } else {
                //console.log(`Document type already exists: ${docType.name}`);
            }
        }
    } catch (error) {
        //console.error('Error creating default document types:', error);
    }
};

//file uploading
app.use('/api/file/userprofilepicture', AuthMiddelware, RoleAuthMiddleware("admin", "sales", "executive", "user", "saller"), UserProfilePictureRouter)
app.use('/api/contactus', ContactUsRouter)
app.use('/api/auth', LoginRoute)
app.use('/api/normaluser', RegisterNormalUserRouter)
app.use('/api/users',AuthMiddelware, UsersRouter)
app.use('/api/roles',AuthMiddelware, RolesRouter)
app.use('/api/useraddress',AuthMiddelware, UserAddressRouter)
app.use('/api/propertytypes',AuthMiddelware, PropertyTypesRouter)
app.use('/api/property',AuthMiddelware, PropertyRouter)
app.use('/api/followupstatus',AuthMiddelware, FollowUpStatusRouter)
app.use('/api/leadstatus',AuthMiddelware, LeadStatusRouter)
app.use('/api/referancesource',AuthMiddelware, ReferenceSourceRouter)
app.use('/api/leads',AuthMiddelware, LeadsRouter)
app.use('/api/documents',AuthMiddelware, DocumentRouter)
app.use('/api/documenttypes',AuthMiddelware, DocumentTypesRouter)


//document type and document updated in github 02_06_2025
// Error handling middleware should be LAST - after all routes
// app.use(errorHandler); // Temporarily disabled for debugging

//DB_CONNECTION_STRING = "mongodb+srv://devtechyugam:Rishi1234@insightwaveitcluster.k3nis1u.mongodb.net/?retryWrites=true&w=majority&appName=InsightwaveitCluster"
// DB Connection with error handling
mongoose.connect(DB_CONNECTION_STRING)
.then(async (response)=>{
    console.log(`DB CONNECTED: ${response.connection.host}, ${response.connection.name}`)
    
    // Create default document types
    //await createDefaultDocumentTypes();
    
    app.listen(PORT, (req, res)=>{
        console.log(`SERVER STARTED: ${PORT}`)
    })
})
.catch((error)=>{
    console.error('Database connection error:', error);
    process.exit(1);
});