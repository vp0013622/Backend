import express from 'express';
import { AuthMiddelware } from '../Middlewares/AuthMiddelware.js';
import { RoleAuthMiddleware } from '../Middlewares/RoleAuthMiddelware.js';
import { DashboardController } from '../Controllers/DashboardController.js';

const router = express.Router();

// Get overall dashboard statistics
router.get('/overview', AuthMiddelware, RoleAuthMiddleware("admin", "sales", "executive", "user", "saller"), DashboardController.getDashboardOverview);

// Get detailed property analytics
router.get('/properties/analytics', AuthMiddelware, RoleAuthMiddleware("admin", "sales", "executive", "user", "saller"), DashboardController.getPropertyAnalytics);

// Get detailed lead analytics
router.get('/leads/analytics', AuthMiddelware, RoleAuthMiddleware("admin", "sales", "executive", "user", "saller"), DashboardController.getLeadAnalytics);

// Get sales analytics
router.get('/sales/analytics', AuthMiddelware, RoleAuthMiddleware("admin", "sales", "executive", "user", "saller"), DashboardController.getSalesAnalytics);

// Get user performance analytics
router.get('/users/analytics', AuthMiddelware, RoleAuthMiddleware("admin", "sales", "executive", "user", "saller"), DashboardController.getUserAnalytics);

// Get recent activities
router.get('/activities', AuthMiddelware, RoleAuthMiddleware("admin", "sales", "executive", "user", "saller"), DashboardController.getRecentActivities);

// Get weekly performance data
router.get('/weekly-performance', AuthMiddelware, RoleAuthMiddleware("admin", "sales", "executive", "user", "saller"), DashboardController.getWeeklyPerformance);

// Get monthly trends
router.get('/monthly-trends', AuthMiddelware, RoleAuthMiddleware("admin", "sales", "executive", "user", "saller"), DashboardController.getMonthlyTrends);

// Get top performing properties
router.get('/top-properties', AuthMiddelware, RoleAuthMiddleware("admin", "sales", "executive", "user", "saller"), DashboardController.getTopProperties);

// Get lead conversion rates
router.get('/lead-conversion', AuthMiddelware, RoleAuthMiddleware("admin", "sales", "executive", "user", "saller"), DashboardController.getLeadConversionRates);

// Get financial summary
router.get('/financial-summary', AuthMiddelware, RoleAuthMiddleware("admin", "sales", "executive", "user", "saller"), DashboardController.getFinancialSummary);

export default router; 