import { LeadsModel } from "../Models/LeadsModel.js"
import { UsersModel } from "../Models/UsersModel.js"

const Create = async (req, res) => {
    try {
        const {
            userId,
            leadDesignation,
            leadInterestedPropertyId,
            leadStatus,
            referanceFrom,
            followUpStatus,
            referredByUserId,
            referredByUserFirstName,
            referredByUserLastName,
            referredByUserEmail,
            referredByUserPhoneNumber,
            referredByUserDesignation,
            assignedByUserId,
            assignedToUserId,
            leadAltEmail,
            leadAltPhoneNumber,
            leadLandLineNumber,
            leadWebsite,
            note
        } = req.body

        if (!userId || !leadInterestedPropertyId || !leadStatus || !followUpStatus) {
            return res.status(400).json({
                message: 'Required fields are missing',
                data: req.body
            })
        }

        // Clean up empty strings for optional ObjectId fields
        const cleanedData = {
            ...req.body,
            // Convert empty strings to null for ObjectId fields
            referredByUserId: referredByUserId && referredByUserId.trim() !== "" ? referredByUserId : null,
            assignedByUserId: assignedByUserId && assignedByUserId.trim() !== "" ? assignedByUserId : null,
            assignedToUserId: assignedToUserId && assignedToUserId.trim() !== "" ? assignedToUserId : null,
            referanceFrom: referanceFrom && referanceFrom.trim() !== "" ? referanceFrom : null,
            // Convert empty strings to null for string fields
            referredByUserFirstName: referredByUserFirstName && referredByUserFirstName.trim() !== "" ? referredByUserFirstName.trim() : null,
            referredByUserLastName: referredByUserLastName && referredByUserLastName.trim() !== "" ? referredByUserLastName.trim() : null,
            referredByUserEmail: referredByUserEmail && referredByUserEmail.trim() !== "" ? referredByUserEmail.trim() : null,
            referredByUserPhoneNumber: referredByUserPhoneNumber && referredByUserPhoneNumber.trim() !== "" ? referredByUserPhoneNumber.trim() : null,
            referredByUserDesignation: referredByUserDesignation && referredByUserDesignation.trim() !== "" ? referredByUserDesignation.trim() : null,
            leadAltEmail: leadAltEmail && leadAltEmail.trim() !== "" ? leadAltEmail.trim() : null,
            leadAltPhoneNumber: leadAltPhoneNumber && leadAltPhoneNumber.trim() !== "" ? leadAltPhoneNumber.trim() : null,
            leadLandLineNumber: leadLandLineNumber && leadLandLineNumber.trim() !== "" ? leadLandLineNumber.trim() : null,
            leadWebsite: leadWebsite && leadWebsite.trim() !== "" ? leadWebsite.trim() : null,
            note: note && note.trim() !== "" ? note.trim() : null,
            createdByUserId: req.user.id,
            updatedByUserId: req.user.id,
            published: true
        }

        const lead = await LeadsModel.create(cleanedData)
        return res.status(200).json({
            message: 'Lead created successfully',
            data: lead
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

const GetAllLeads = async (req, res) => {
    try {
        const leads = await LeadsModel.find({ published: true })
            .populate('userId')
            .populate('leadStatus')
            .populate('referanceFrom')
            .populate('followUpStatus')
            .populate('referredByUserId')
            .populate('assignedByUserId')
            .populate('assignedToUserId')

        return res.status(200).json({
            message: 'All leads',
            count: leads.length,
            data: leads
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

const GetAllNotPublishedLeads = async (req, res) => {
    try {
        const leads = await LeadsModel.find({ published: false })
            .populate('userId')
            .populate('leadStatus')
            .populate('referanceFrom')
            .populate('followUpStatus')
            .populate('referredByUserId')
            .populate('assignedByUserId')
            .populate('assignedToUserId')

        return res.status(200).json({
            message: 'All not published leads',
            count: leads.length,
            data: leads
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

const GetAllLeadsWithParams = async (req, res) => {
    try {
        const {
            userId = null,
            leadStatus = null,
            referanceFrom = null,
            followUpStatus = null,
            assignedToUserId = null,
            published = null
        } = req.body

        let filter = {}

        if (userId !== null) {
            filter.userId = userId
        }
        if (leadStatus !== null) {
            filter.leadStatus = leadStatus
        }
        if (referanceFrom !== null) {
            filter.referanceFrom = referanceFrom
        }
        if (followUpStatus !== null) {
            filter.followUpStatus = followUpStatus
        }
        if (assignedToUserId !== null) {
            filter.assignedToUserId = assignedToUserId
        }
        if (published !== null) {
            filter.published = published
        }

        const leads = await LeadsModel.find(filter)
            .populate('userId')
            .populate('leadStatus')
            .populate('referanceFrom')
            .populate('followUpStatus')
            .populate('referredByUserId')
            .populate('assignedByUserId')
            .populate('assignedToUserId')

        return res.status(200).json({
            message: 'Filtered leads',
            count: leads.length,
            data: leads
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

const GetLeadById = async (req, res) => {
    try {
        const { id } = req.params
        const lead = await LeadsModel.findById(id)
            .populate('userId')
            .populate('leadStatus')
            .populate('referanceFrom')
            .populate('followUpStatus')
            .populate('referredByUserId')
            .populate('assignedByUserId')
            .populate('assignedToUserId')

        if (!lead) {
            return res.status(404).json({
                message: 'Lead not found',
                data: null
            })
        }

        return res.status(200).json({
            message: 'Lead found',
            data: lead
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

const Edit = async (req, res) => {
    try {
        const { id } = req.params
        const lead = await LeadsModel.findById(id)

        if (!lead) {
            return res.status(404).json({
                message: 'Lead not found'
            })
        }

        // Clean up empty strings for optional fields
        const cleanedData = {
            ...req.body,
            // Convert empty strings to null for ObjectId fields
            referredByUserId: req.body.referredByUserId && req.body.referredByUserId.trim() !== "" ? req.body.referredByUserId : null,
            assignedByUserId: req.body.assignedByUserId && req.body.assignedByUserId.trim() !== "" ? req.body.assignedByUserId : null,
            assignedToUserId: req.body.assignedToUserId && req.body.assignedToUserId.trim() !== "" ? req.body.assignedToUserId : null,
            referanceFrom: req.body.referanceFrom && req.body.referanceFrom.trim() !== "" ? req.body.referanceFrom : null,
            // Convert empty strings to null for string fields
            referredByUserFirstName: req.body.referredByUserFirstName && req.body.referredByUserFirstName.trim() !== "" ? req.body.referredByUserFirstName.trim() : null,
            referredByUserLastName: req.body.referredByUserLastName && req.body.referredByUserLastName.trim() !== "" ? req.body.referredByUserLastName.trim() : null,
            referredByUserEmail: req.body.referredByUserEmail && req.body.referredByUserEmail.trim() !== "" ? req.body.referredByUserEmail.trim() : null,
            referredByUserPhoneNumber: req.body.referredByUserPhoneNumber && req.body.referredByUserPhoneNumber.trim() !== "" ? req.body.referredByUserPhoneNumber.trim() : null,
            referredByUserDesignation: req.body.referredByUserDesignation && req.body.referredByUserDesignation.trim() !== "" ? req.body.referredByUserDesignation.trim() : null,
            leadAltEmail: req.body.leadAltEmail && req.body.leadAltEmail.trim() !== "" ? req.body.leadAltEmail.trim() : null,
            leadAltPhoneNumber: req.body.leadAltPhoneNumber && req.body.leadAltPhoneNumber.trim() !== "" ? req.body.leadAltPhoneNumber.trim() : null,
            leadLandLineNumber: req.body.leadLandLineNumber && req.body.leadLandLineNumber.trim() !== "" ? req.body.leadLandLineNumber.trim() : null,
            leadWebsite: req.body.leadWebsite && req.body.leadWebsite.trim() !== "" ? req.body.leadWebsite.trim() : null,
            note: req.body.note && req.body.note.trim() !== "" ? req.body.note.trim() : null,
            createdByUserId: lead.createdByUserId,
            updatedByUserId: req.user.id
        }

        const result = await LeadsModel.findByIdAndUpdate(id, cleanedData)
        if (!result) {
            return res.status(404).json({
                message: 'Lead not found'
            })
        }

        return res.status(201).json({
            message: 'Lead updated successfully'
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

const DeleteById = async (req, res) => {
    try {
        const { id } = req.params
        const lead = await LeadsModel.findById(id)

        if (!lead) {
            return res.status(404).json({
                message: 'Lead not found',
                data: null
            })
        }

        lead.updatedByUserId = req.user.id
        lead.published = false

        const result = await LeadsModel.findByIdAndUpdate(id, lead)
        if (!result) {
            return res.status(404).json({
                message: 'Lead not found'
            })
        }

        return res.status(201).json({
            message: 'Lead deleted successfully'
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

const GetAssignedLeadsForCurrentUser = async (req, res) => {
    try {
        const currentUserId = req.user.id
        
        const leads = await LeadsModel.find({ 
            assignedToUserId: currentUserId,
            published: true 
        })
            .populate('userId')
            .populate('leadStatus')
            .populate('referanceFrom')
            .populate('followUpStatus')
            .populate('referredByUserId')
            .populate('assignedByUserId')
            .populate('assignedToUserId')

        return res.status(200).json({
            message: 'Assigned leads for current user',
            count: leads.length,
            data: leads
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

export {
    Create,
    GetAllLeads,
    GetAllNotPublishedLeads,
    GetAllLeadsWithParams,
    GetLeadById,
    Edit,
    DeleteById,
    GetAssignedLeadsForCurrentUser
}