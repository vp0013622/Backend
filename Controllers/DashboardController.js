import { PropertyModel } from '../Models/PropertyModel.js';
import { LeadsModel } from '../Models/LeadsModel.js';
import { UsersModel } from '../Models/UsersModel.js';
import { FollowUpStatusModel } from '../Models/FollowUpStatusModel.js';
import { LeadStatusModel } from '../Models/LeadStatusModel.js';

export class DashboardController {
    // Get overall dashboard statistics
    static async getDashboardOverview(req, res) {
        try {
            const userId = req.user._id;
            const userRole = req.user.role;

            // Get all properties
            const allProperties = await PropertyModel.find({ published: true });
            const soldProperties = allProperties.filter(
                p => (p.propertyStatus || '').trim().toLowerCase() === 'sold'
            );
            const unsoldProperties = allProperties.filter(
                p => (p.propertyStatus || '').trim().toLowerCase() !== 'sold'
            );
            const totalSales = soldProperties.reduce((sum, prop) => sum + (prop.price || 0), 0);

            // Debugging logs
            console.log('--- DASHBOARD DEBUG ---');
            console.log('Total properties:', allProperties.length);
            console.log('Sold properties:', soldProperties.length);
            console.log('Unsold properties:', unsoldProperties.length);
            console.log('Total sales value:', totalSales);
            if (soldProperties.length > 0) {
                console.log('Sample sold property:', soldProperties[0]);
            }

            // Get counts
            const totalLeads = await LeadsModel.countDocuments({ published: true });
            const totalUsers = await UsersModel.countDocuments({ published: true });
            
            // Temporarily set these to 0 to avoid the ObjectId casting error
            const activeLeads = 0;
            const pendingFollowups = 0;

            // Calculate average rating (placeholder for now)
            const averageRating = 4.5;

            res.status(200).json({
                statusCode: 200,
                message: 'Dashboard overview retrieved successfully',
                data: {
                    totalProperties: allProperties.length,
                    soldProperties: soldProperties.length,
                    unsoldProperties: unsoldProperties.length,
                    totalSales,
                    totalLeads,
                    totalUsers,
                    activeLeads,
                    pendingFollowups,
                    averageRating
                }
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                message: 'Error retrieving dashboard overview',
                error: error.message
            });
        }
    }

    // Get detailed property analytics
    static async getPropertyAnalytics(req, res) {
        try {
            const properties = await PropertyModel.find({ published: true }).populate('propertyTypeId');
            
            // Property status distribution
            const statusDistribution = {};
            properties.forEach(prop => {
                const status = prop.propertyStatus || 'unknown';
                statusDistribution[status] = (statusDistribution[status] || 0) + 1;
            });

            // Property type distribution
            const typeDistribution = {};
            properties.forEach(prop => {
                const type = prop.propertyTypeId?.typeName || 'unknown';
                typeDistribution[type] = (typeDistribution[type] || 0) + 1;
                console.log('Property type debug:', prop.name, '->', prop.propertyTypeId, '->', type);
            });

            // Price range distribution
            const priceRanges = {
                '0-50L': 0,
                '50L-1Cr': 0,
                '1Cr-2Cr': 0,
                '2Cr-5Cr': 0,
                '5Cr+': 0
            };

            properties.forEach(prop => {
                const price = prop.price || 0;
                if (price <= 5000000) priceRanges['0-50L']++;
                else if (price <= 10000000) priceRanges['50L-1Cr']++;
                else if (price <= 20000000) priceRanges['1Cr-2Cr']++;
                else if (price <= 50000000) priceRanges['2Cr-5Cr']++;
                else priceRanges['5Cr+']++;
            });

            // Recent properties (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const recentProperties = properties.filter(prop => 
                new Date(prop.createdAt) >= thirtyDaysAgo
            );

            // Sold, active, and total value
            const soldProperties = properties.filter(
                p => (p.propertyStatus || '').trim().toLowerCase() === 'sold'
            ).length;
            const activeProperties = properties.filter(
                p => (p.propertyStatus || '').trim().toLowerCase() === 'active'
            ).length;
            const totalValue = properties.reduce((sum, prop) => sum + (prop.price || 0), 0);

            // Property type sales analysis
            const propertyTypeSales = {};
            properties.forEach(prop => {
                const type = prop.propertyTypeId?.typeName || 'unknown';
                if (!propertyTypeSales[type]) {
                    propertyTypeSales[type] = {
                        totalSales: 0,
                        count: 0,
                        averagePrice: 0
                    };
                }
                propertyTypeSales[type].totalSales += prop.price || 0;
                propertyTypeSales[type].count += 1;
            });

            // Calculate average price for each type
            Object.keys(propertyTypeSales).forEach(type => {
                if (propertyTypeSales[type].count > 0) {
                    propertyTypeSales[type].averagePrice = propertyTypeSales[type].totalSales / propertyTypeSales[type].count;
                }
            });

            // Sort by total sales (descending)
            const sortedPropertyTypeSales = Object.entries(propertyTypeSales)
                .sort(([,a], [,b]) => b.totalSales - a.totalSales)
                .reduce((obj, [key, value]) => {
                    obj[key] = value;
                    return obj;
                }, {});

            res.status(200).json({
                statusCode: 200,
                message: 'Property analytics retrieved successfully',
                data: {
                    totalProperties: properties.length,
                    soldProperties,
                    activeProperties,
                    totalValue,
                    statusDistribution,
                    typeDistribution,
                    priceRanges,
                    propertyTypeSales: sortedPropertyTypeSales,
                    averagePrice: properties.length > 0 ? 
                        properties.reduce((sum, prop) => sum + (prop.price || 0), 0) / properties.length : 0
                }
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                message: 'Error retrieving property analytics',
                error: error.message
            });
        }
    }

    // Get detailed lead analytics
    static async getLeadAnalytics(req, res) {
        try {
            const leads = await LeadsModel.find({ published: true });
            
            // Lead status distribution
            const statusDistribution = {};
            leads.forEach(lead => {
                let status = 'unknown';
                if (typeof lead.leadStatus === 'string') {
                    status = lead.leadStatus;
                } else if (lead.leadStatus && lead.leadStatus.name) {
                    status = lead.leadStatus.name;
                }
                statusDistribution[status] = (statusDistribution[status] || 0) + 1;
            });

            // Lead designation distribution
            const designationDistribution = {};
            leads.forEach(lead => {
                const designation = lead.leadDesignation || 'unknown';
                designationDistribution[designation] = (designationDistribution[designation] || 0) + 1;
            });

            // Follow-up status distribution
            const followUpDistribution = {};
            leads.forEach(lead => {
                let followUp = 'unknown';
                if (typeof lead.followUpStatus === 'string') {
                    followUp = lead.followUpStatus;
                } else if (lead.followUpStatus && lead.followUpStatus.name) {
                    followUp = lead.followUpStatus.name;
                }
                followUpDistribution[followUp] = (followUpDistribution[followUp] || 0) + 1;
            });

            // Recent leads (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const recentLeads = leads.filter(lead => 
                new Date(lead.createdAt) >= thirtyDaysAgo
            ).slice(0, 5); // Get only first 5 recent leads

            // Lead conversion rate (leads that became properties)
            const convertedLeads = leads.filter(lead => {
                let leadStatus = '';
                if (typeof lead.leadStatus === 'string') {
                    leadStatus = lead.leadStatus;
                } else if (lead.leadStatus && lead.leadStatus.name) {
                    leadStatus = lead.leadStatus.name;
                }
                return leadStatus === 'converted' || leadStatus === 'closed';
            }).length;

            res.status(200).json({
                statusCode: 200,
                message: 'Lead analytics retrieved successfully',
                data: {
                    totalLeads: leads.length,
                    statusDistribution,
                    designationDistribution,
                    followUpDistribution,
                    recentLeads: recentLeads.length,
                    recentLeadsList: recentLeads.map(lead => ({
                        id: lead._id,
                        name: `${lead.firstName} ${lead.lastName}`,
                        email: lead.email,
                        phone: lead.phone,
                        status: typeof lead.leadStatus === 'string' ? lead.leadStatus : (lead.leadStatus?.name || 'unknown'),
                        designation: lead.leadDesignation || 'unknown',
                        createdAt: lead.createdAt
                    })),
                    convertedLeads,
                    conversionRate: leads.length > 0 ? (convertedLeads / leads.length) * 100 : 0
                }
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                message: 'Error retrieving lead analytics',
                error: error.message
            });
        }
    }

    // Get sales analytics
    static async getSalesAnalytics(req, res) {
        try {
            const soldProperties = await PropertyModel.find({ 
                propertyStatus: 'SOLD', 
                published: true 
            });

            // Monthly sales for the last 12 months
            const monthlySales = {};
            const currentDate = new Date();
            
            for (let i = 0; i < 12; i++) {
                const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                const monthKey = month.toISOString().slice(0, 7); // YYYY-MM format
                monthlySales[monthKey] = {
                    count: 0,
                    revenue: 0
                };
            }

            soldProperties.forEach(prop => {
                const soldDate = new Date(prop.updatedAt || prop.createdAt);
                const monthKey = soldDate.toISOString().slice(0, 7);
                
                if (monthlySales[monthKey]) {
                    monthlySales[monthKey].count++;
                    monthlySales[monthKey].revenue += prop.price || 0;
                }
            });

            // Total revenue
            const totalRevenue = soldProperties.reduce((sum, prop) => sum + (prop.price || 0), 0);

            // Average sale price
            const averageSalePrice = soldProperties.length > 0 ? 
                totalRevenue / soldProperties.length : 0;

            res.status(200).json({
                statusCode: 200,
                message: 'Sales analytics retrieved successfully',
                data: {
                    totalSales: soldProperties.length,
                    totalRevenue,
                    averageSalePrice,
                    monthlySales
                }
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                message: 'Error retrieving sales analytics',
                error: error.message
            });
        }
    }

    // Get user performance analytics
    static async getUserAnalytics(req, res) {
        try {
            const users = await UsersModel.find({ published: true });
            const leads = await LeadsModel.find({ published: true });
            const properties = await PropertyModel.find({ published: true });

            // User role distribution
            const roleDistribution = {};
            users.forEach(user => {
                const role = user.role?.name || 'unknown';
                roleDistribution[role] = (roleDistribution[role] || 0) + 1;
            });

            // User performance (leads assigned to each user)
            const userPerformance = [];
            for (const user of users) {
                const userLeads = leads.filter(lead => 
                    lead.assignedTo === user._id.toString()
                );
                
                const userProperties = properties.filter(prop => 
                    prop.createdByUserId === user._id.toString()
                );

                userPerformance.push({
                    userId: user._id,
                    userName: `${user.firstName} ${user.lastName}`,
                    totalLeads: userLeads.length,
                    activeLeads: userLeads.filter(lead => {
                        // Handle both ObjectId and string cases for leadStatus
                        if (typeof lead.leadStatus === 'string') {
                            return lead.leadStatus === 'active';
                        } else if (lead.leadStatus && lead.leadStatus.name) {
                            return lead.leadStatus.name === 'active';
                        }
                        return false;
                    }).length,
                    totalProperties: userProperties.length,
                    soldProperties: userProperties.filter(prop => prop.propertyStatus === 'SOLD').length
                });
            }

            res.status(200).json({
                statusCode: 200,
                message: 'User analytics retrieved successfully',
                data: {
                    totalUsers: users.length,
                    roleDistribution,
                    userPerformance
                }
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                message: 'Error retrieving user analytics',
                error: error.message
            });
        }
    }

    // Get recent activities
    static async getRecentActivities(req, res) {
        try {
            const recentProperties = await PropertyModel.find({ published: true })
                .sort({ createdAt: -1 })
                .limit(10)
                .populate('propertyType');

            const recentLeads = await LeadsModel.find({ published: true })
                .sort({ createdAt: -1 })
                .limit(10);

            const activities = [];

            // Add property activities
            recentProperties.forEach(prop => {
                activities.push({
                    type: 'property',
                    title: `Property ${prop.propertyStatus === 'SOLD' ? 'Sold' : 'Listed'}`,
                    subtitle: prop.name,
                    description: `${prop.propertyType?.name || 'Property'} - ${prop.propertyStatus}`,
                    time: prop.createdAt,
                    data: prop
                });
            });

            // Add lead activities
            recentLeads.forEach(lead => {
                activities.push({
                    type: 'lead',
                    title: 'New Lead Added',
                    subtitle: `${lead.fullName} - ${lead.leadDesignation}`,
                    description: `Lead status: ${lead.leadStatus}`,
                    time: lead.createdAt,
                    data: lead
                });
            });

            // Sort by time (most recent first)
            activities.sort((a, b) => new Date(b.time) - new Date(a.time));

            res.status(200).json({
                statusCode: 200,
                message: 'Recent activities retrieved successfully',
                data: activities.slice(0, 15) // Return top 15 activities
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                message: 'Error retrieving recent activities',
                error: error.message
            });
        }
    }

    // Get weekly performance data
    static async getWeeklyPerformance(req, res) {
        try {
            const currentDate = new Date();
            const weekStart = new Date(currentDate);
            weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1);
            weekStart.setHours(0, 0, 0, 0);

            const weekData = [];
            for (let i = 0; i < 7; i++) {
                const dayStart = new Date(weekStart);
                dayStart.setDate(weekStart.getDate() + i);
                const dayEnd = new Date(dayStart);
                dayEnd.setDate(dayStart.getDate() + 1);

                // Count properties created on this day
                const propertiesCount = await PropertyModel.countDocuments({
                    createdAt: { $gte: dayStart, $lt: dayEnd },
                    published: true
                });

                // Count leads created on this day
                const leadsCount = await LeadsModel.countDocuments({
                    createdAt: { $gte: dayStart, $lt: dayEnd },
                    published: true
                });

                weekData.push({
                    day: dayStart.toISOString().slice(0, 10),
                    dayName: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
                    properties: propertiesCount,
                    leads: leadsCount,
                    total: propertiesCount + leadsCount
                });
            }

            res.status(200).json({
                statusCode: 200,
                message: 'Weekly performance data retrieved successfully',
                data: weekData
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                message: 'Error retrieving weekly performance data',
                error: error.message
            });
        }
    }

    // Get monthly trends
    static async getMonthlyTrends(req, res) {
        try {
            const currentDate = new Date();
            const trends = [];

            for (let i = 0; i < 6; i++) {
                const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);

                const propertiesCount = await PropertyModel.countDocuments({
                    createdAt: { $gte: monthStart, $lt: monthEnd },
                    published: true
                });

                const leadsCount = await LeadsModel.countDocuments({
                    createdAt: { $gte: monthStart, $lt: monthEnd },
                    published: true
                });

                const soldProperties = await PropertyModel.find({
                    propertyStatus: 'SOLD',
                    updatedAt: { $gte: monthStart, $lt: monthEnd },
                    published: true
                });

                const monthlyRevenue = soldProperties.reduce((sum, prop) => sum + (prop.price || 0), 0);

                trends.push({
                    month: monthStart.toISOString().slice(0, 7),
                    monthName: monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                    properties: propertiesCount,
                    leads: leadsCount,
                    soldProperties: soldProperties.length,
                    revenue: monthlyRevenue
                });
            }

            res.status(200).json({
                statusCode: 200,
                message: 'Monthly trends retrieved successfully',
                data: trends.reverse() // Return in chronological order
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                message: 'Error retrieving monthly trends',
                error: error.message
            });
        }
    }

    // Get top performing properties
    static async getTopProperties(req, res) {
        try {
            const topProperties = await PropertyModel.find({ published: true })
                .sort({ price: -1 })
                .limit(10)
                .populate('propertyType');

            const topViewedProperties = await PropertyModel.find({ published: true })
                .sort({ views: -1 })
                .limit(10)
                .populate('propertyType');

            res.status(200).json({
                statusCode: 200,
                message: 'Top properties retrieved successfully',
                data: {
                    topByPrice: topProperties,
                    topByViews: topViewedProperties
                }
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                message: 'Error retrieving top properties',
                error: error.message
            });
        }
    }

    // Get lead conversion rates
    static async getLeadConversionRates(req, res) {
        try {
            const leads = await LeadsModel.find({ published: true });
            
            const totalLeads = leads.length;
            const convertedLeads = leads.filter(lead => 
                lead.leadStatus === 'converted' || lead.leadStatus === 'closed'
            ).length;

            const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

            // Conversion by lead designation
            const designationConversion = {};
            const designations = [...new Set(leads.map(lead => lead.leadDesignation))];

            designations.forEach(designation => {
                const designationLeads = leads.filter(lead => lead.leadDesignation === designation);
                const converted = designationLeads.filter(lead => 
                    lead.leadStatus === 'converted' || lead.leadStatus === 'closed'
                ).length;
                
                designationConversion[designation] = {
                    total: designationLeads.length,
                    converted: converted,
                    rate: designationLeads.length > 0 ? (converted / designationLeads.length) * 100 : 0
                };
            });

            res.status(200).json({
                statusCode: 200,
                message: 'Lead conversion rates retrieved successfully',
                data: {
                    totalLeads,
                    convertedLeads,
                    conversionRate,
                    designationConversion
                }
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                message: 'Error retrieving lead conversion rates',
                error: error.message
            });
        }
    }

    // Get financial summary
    static async getFinancialSummary(req, res) {
        try {
            const soldProperties = await PropertyModel.find({ 
                propertyStatus: 'SOLD', 
                published: true 
            });

            const totalRevenue = soldProperties.reduce((sum, prop) => sum + (prop.price || 0), 0);
            const averageSalePrice = soldProperties.length > 0 ? 
                totalRevenue / soldProperties.length : 0;

            // Monthly revenue for current year
            const currentYear = new Date().getFullYear();
            const monthlyRevenue = {};
            
            for (let month = 1; month <= 12; month++) {
                const monthStart = new Date(currentYear, month - 1, 1);
                const monthEnd = new Date(currentYear, month, 1);
                
                const monthSales = soldProperties.filter(prop => {
                    const soldDate = new Date(prop.updatedAt || prop.createdAt);
                    return soldDate >= monthStart && soldDate < monthEnd;
                });

                monthlyRevenue[month] = monthSales.reduce((sum, prop) => sum + (prop.price || 0), 0);
            }

            res.status(200).json({
                statusCode: 200,
                message: 'Financial summary retrieved successfully',
                data: {
                    totalRevenue,
                    averageSalePrice,
                    totalSales: soldProperties.length,
                    monthlyRevenue
                }
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                message: 'Error retrieving financial summary',
                error: error.message
            });
        }
    }
} 