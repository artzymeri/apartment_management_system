const db = require('../models');
const { Op, Sequelize } = require('sequelize');
const MonthlyReport = db.MonthlyReport;
const Property = db.Property;
const TenantPayment = db.TenantPayment;
const User = db.User;
const SpendingConfig = db.SpendingConfig;

// Generate or regenerate a monthly report for a property
exports.generateMonthlyReport = async (req, res) => {
  try {
    const { propertyId, month, year, notes, spendingAllocations } = req.body;
    const userId = req.user.id;

    // Validate inputs
    if (!propertyId || !month || !year) {
      return res.status(400).json({ message: 'Property ID, month, and year are required' });
    }

    // Verify user has access to this property
    const property = await Property.findOne({
      where: { id: propertyId },
      include: [{
        model: User,
        as: 'managers',
        where: { id: userId },
        required: true
      }]
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found or unauthorized' });
    }

    // Create report month date string directly to avoid timezone issues
    const monthNumber = parseInt(month);
    const yearNumber = parseInt(year);
    const reportMonthStr = `${yearNumber}-${String(monthNumber).padStart(2, '0')}-01`;

    console.log('Generate report - looking for payments with payment_month:', reportMonthStr);

    // Get all tenants for this property
    const allTenants = await User.findAll({
      where: {
        role: 'tenant',
        [Op.and]: [
          Sequelize.literal(`JSON_CONTAINS(property_ids, '${JSON.stringify([propertyId])}')`)
        ]
      }
    });

    // Get payment data for this month
    const payments = await TenantPayment.findAll({
      where: {
        property_id: propertyId,
        payment_month: reportMonthStr
      },
      include: [{
        model: User,
        as: 'tenant',
        attributes: ['id', 'name', 'surname', 'email']
      }]
    });

    // Calculate totals
    const totalTenants = allTenants.length;
    const paidPayments = payments.filter(p => p.status === 'paid');
    const paidTenants = paidPayments.length;
    const totalBudget = paidPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'overdue');
    const pendingAmount = pendingPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    // Get spending configs for this property
    const propertyWithConfigs = await Property.findByPk(propertyId, {
      include: [{
        model: SpendingConfig,
        as: 'spendingConfigs',
        attributes: ['id', 'title', 'description']
      }]
    });

    // Build spending breakdown
    let spendingBreakdown = [];
    if (spendingAllocations && Array.isArray(spendingAllocations)) {
      // Use provided allocations
      spendingBreakdown = spendingAllocations.map(allocation => ({
        config_id: allocation.config_id,
        config_title: allocation.config_title,
        allocated_amount: parseFloat(allocation.allocated_amount) || 0,
        percentage: totalBudget > 0 ? ((parseFloat(allocation.allocated_amount) / totalBudget) * 100).toFixed(2) : 0,
        description: allocation.description || null
      }));
    } else if (propertyWithConfigs.spendingConfigs.length > 0) {
      // Auto-distribute equally if no allocations provided
      const equalShare = totalBudget / propertyWithConfigs.spendingConfigs.length;
      spendingBreakdown = propertyWithConfigs.spendingConfigs.map(config => ({
        config_id: config.id,
        config_title: config.title,
        allocated_amount: equalShare.toFixed(2),
        percentage: (100 / propertyWithConfigs.spendingConfigs.length).toFixed(2),
        description: config.description
      }));
    }

    // Check if report already exists
    const existingReport = await MonthlyReport.findOne({
      where: {
        property_id: propertyId,
        report_month: reportMonthStr
      }
    });

    let report;
    if (existingReport) {
      // Update existing report
      await existingReport.update({
        generated_by_user_id: userId,
        total_budget: totalBudget.toFixed(2),
        total_tenants: totalTenants,
        paid_tenants: paidTenants,
        pending_amount: pendingAmount.toFixed(2),
        spending_breakdown: spendingBreakdown,
        notes: notes || existingReport.notes
      });
      report = existingReport;
    } else {
      // Create new report
      report = await MonthlyReport.create({
        property_id: propertyId,
        report_month: reportMonthStr,
        generated_by_user_id: userId,
        total_budget: totalBudget.toFixed(2),
        total_tenants: totalTenants,
        paid_tenants: paidTenants,
        pending_amount: pendingAmount.toFixed(2),
        spending_breakdown: spendingBreakdown,
        notes: notes || null
      });
    }

    // Fetch the complete report with relationships
    const completeReport = await MonthlyReport.findByPk(report.id, {
      include: [{
        model: Property,
        as: 'property',
        attributes: ['id', 'name', 'address']
      }]
    });

    res.status(existingReport ? 200 : 201).json({
      success: true,
      message: existingReport ? 'Report updated successfully' : 'Report generated successfully',
      report: completeReport
    });
  } catch (error) {
    console.error('Generate monthly report error:', error);
    res.status(500).json({ message: 'Error generating monthly report', error: error.message });
  }
};

// Get monthly reports for a property
exports.getPropertyReports = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { year } = req.query;
    const userId = req.user.id;

    // Verify user has access to this property
    const property = await Property.findOne({
      where: { id: propertyId },
      include: [{
        model: User,
        as: 'managers',
        where: { id: userId },
        required: true
      }]
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found or unauthorized' });
    }

    const whereClause = { property_id: propertyId };

    if (year) {
      const yearNum = parseInt(year);
      const startDate = new Date(yearNum, 0, 1);
      const endDate = new Date(yearNum, 11, 31);
      whereClause.report_month = {
        [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
      };
    }

    const reports = await MonthlyReport.findAll({
      where: whereClause,
      include: [{
        model: Property,
        as: 'property',
        attributes: ['id', 'name', 'address']
      }],
      order: [['report_month', 'DESC']]
    });

    res.status(200).json({
      success: true,
      reports
    });
  } catch (error) {
    console.error('Get property reports error:', error);
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
};

// Get a specific monthly report with detailed data
exports.getMonthlyReportDetail = async (req, res) => {
  try {
    const { reportId } = req.params;
    const userId = req.user.id;

    const report = await MonthlyReport.findOne({
      where: { id: reportId },
      include: [{
        model: Property,
        as: 'property',
        attributes: ['id', 'name', 'address'],
        include: [{
          model: User,
          as: 'managers',
          where: { id: userId },
          required: true,
          attributes: []
        }]
      }]
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found or unauthorized' });
    }

    // Get payment details for this month
    const payments = await TenantPayment.findAll({
      where: {
        property_id: report.property_id,
        payment_month: report.report_month
      },
      include: [{
        model: User,
        as: 'tenant',
        attributes: ['id', 'name', 'surname', 'email', 'floor_assigned']
      }],
      order: [['status', 'ASC'], ['tenant_id', 'ASC']]
    });

    res.status(200).json({
      success: true,
      report,
      payments
    });
  } catch (error) {
    console.error('Get monthly report detail error:', error);
    res.status(500).json({ message: 'Error fetching report details', error: error.message });
  }
};

// Get report data preview (without saving)
exports.getReportPreview = async (req, res) => {
  try {
    const { propertyId, month, year } = req.query;
    const userId = req.user.id;

    if (!propertyId || !month || !year) {
      return res.status(400).json({ message: 'Property ID, month, and year are required' });
    }

    // Verify user has access to this property
    const property = await Property.findOne({
      where: { id: propertyId },
      include: [{
        model: User,
        as: 'managers',
        where: { id: userId },
        required: true
      }, {
        model: SpendingConfig,
        as: 'spendingConfigs',
        attributes: ['id', 'title', 'description']
      }]
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found or unauthorized' });
    }

    // Create report month date string directly to avoid timezone issues
    const monthNumber = parseInt(month);
    const yearNumber = parseInt(year);
    const reportMonthStr = `${yearNumber}-${String(monthNumber).padStart(2, '0')}-01`;

    console.log('Report preview - looking for payments with payment_month:', reportMonthStr);

    // Get all tenants for this property
    const allTenants = await User.findAll({
      where: {
        role: 'tenant',
        [Op.and]: [
          Sequelize.literal(`JSON_CONTAINS(property_ids, '${JSON.stringify([parseInt(propertyId)])}')`)
        ]
      }
    });

    // Get payment data for this month
    const payments = await TenantPayment.findAll({
      where: {
        property_id: propertyId,
        payment_month: reportMonthStr
      },
      include: [{
        model: User,
        as: 'tenant',
        attributes: ['id', 'name', 'surname', 'email', 'floor_assigned']
      }]
    });

    // Calculate totals
    const totalTenants = allTenants.length;
    const paidPayments = payments.filter(p => p.status === 'paid');
    const paidTenants = paidPayments.length;
    const totalBudget = paidPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'overdue');
    const pendingAmount = pendingPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    res.status(200).json({
      success: true,
      preview: {
        property: {
          id: property.id,
          name: property.name,
          address: property.address
        },
        report_month: reportMonthStr,
        total_tenants: totalTenants,
        paid_tenants: paidTenants,
        total_budget: totalBudget.toFixed(2),
        pending_amount: pendingAmount.toFixed(2),
        spending_configs: property.spendingConfigs,
        payments: payments
      }
    });
  } catch (error) {
    console.error('Get report preview error:', error);
    res.status(500).json({ message: 'Error generating preview', error: error.message });
  }
};

// Delete a monthly report
exports.deleteMonthlyReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const userId = req.user.id;

    const report = await MonthlyReport.findOne({
      where: { id: reportId },
      include: [{
        model: Property,
        as: 'property',
        include: [{
          model: User,
          as: 'managers',
          where: { id: userId },
          required: true,
          attributes: []
        }]
      }]
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found or unauthorized' });
    }

    await report.destroy();

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Delete monthly report error:', error);
    res.status(500).json({ message: 'Error deleting report', error: error.message });
  }
};

// Update an existing monthly report
exports.updateMonthlyReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { notes, spendingAllocations } = req.body;
    const userId = req.user.id;

    // Find the report and verify access
    const report = await MonthlyReport.findOne({
      where: { id: reportId },
      include: [{
        model: Property,
        as: 'property',
        include: [{
          model: User,
          as: 'managers',
          where: { id: userId },
          required: true,
          attributes: []
        }]
      }]
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found or unauthorized' });
    }

    // Validate spending allocations if provided
    if (spendingAllocations && Array.isArray(spendingAllocations)) {
      const totalBudget = parseFloat(report.total_budget);
      const totalAllocated = spendingAllocations.reduce((sum, alloc) => sum + parseFloat(alloc.allocated_amount || 0), 0);

      // Allow small rounding differences
      if (Math.abs(totalAllocated - totalBudget) > 0.01) {
        return res.status(400).json({
          message: 'Total allocated amount must equal the total budget',
          totalBudget: totalBudget.toFixed(2),
          totalAllocated: totalAllocated.toFixed(2)
        });
      }

      // Build spending breakdown with percentages
      const spendingBreakdown = spendingAllocations.map(allocation => ({
        config_id: allocation.config_id,
        config_title: allocation.config_title,
        allocated_amount: parseFloat(allocation.allocated_amount) || 0,
        percentage: totalBudget > 0 ? ((parseFloat(allocation.allocated_amount) / totalBudget) * 100).toFixed(2) : 0,
        description: allocation.description || null
      }));

      await report.update({
        spending_breakdown: spendingBreakdown,
        notes: notes !== undefined ? notes : report.notes
      });
    } else {
      // Only update notes if no spending allocations provided
      await report.update({
        notes: notes !== undefined ? notes : report.notes
      });
    }

    // Fetch updated report with relationships
    const updatedReport = await MonthlyReport.findByPk(report.id, {
      include: [{
        model: Property,
        as: 'property',
        attributes: ['id', 'name', 'address']
      }]
    });

    res.status(200).json({
      success: true,
      message: 'Report updated successfully',
      report: updatedReport
    });
  } catch (error) {
    console.error('Update monthly report error:', error);
    res.status(500).json({ message: 'Error updating report', error: error.message });
  }
};

// Get all reports across all managed properties
exports.getAllMyReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year } = req.query;

    // Get all properties managed by this user
    const properties = await Property.findAll({
      include: [{
        model: User,
        as: 'managers',
        where: { id: userId },
        required: true,
        attributes: []
      }]
    });

    const propertyIds = properties.map(p => p.id);

    const whereClause = {
      property_id: {
        [Op.in]: propertyIds
      }
    };

    if (year) {
      const yearNum = parseInt(year);
      const startDate = new Date(yearNum, 0, 1);
      const endDate = new Date(yearNum, 11, 31);
      whereClause.report_month = {
        [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
      };
    }

    const reports = await MonthlyReport.findAll({
      where: whereClause,
      include: [{
        model: Property,
        as: 'property',
        attributes: ['id', 'name', 'address']
      }],
      order: [['report_month', 'DESC'], ['property_id', 'ASC']]
    });

    res.status(200).json({
      success: true,
      reports
    });
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
};

// Get monthly reports for tenant's property
exports.getTenantPropertyReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year } = req.query;

    // Get tenant's property_ids
    const tenant = await User.findByPk(userId, {
      attributes: ['id', 'property_ids']
    });

    if (!tenant || !tenant.property_ids || tenant.property_ids.length === 0) {
      return res.status(404).json({ message: 'No property assigned to this tenant' });
    }

    // Tenants typically have one property, but handle multiple
    const propertyIds = tenant.property_ids;

    const whereClause = {
      property_id: {
        [Op.in]: propertyIds
      }
    };

    if (year) {
      const yearNum = parseInt(year);
      const startDate = new Date(yearNum, 0, 1);
      const endDate = new Date(yearNum, 11, 31);
      whereClause.report_month = {
        [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
      };
    }

    const reports = await MonthlyReport.findAll({
      where: whereClause,
      include: [{
        model: Property,
        as: 'property',
        attributes: ['id', 'name', 'address']
      }],
      order: [['report_month', 'DESC']]
    });

    res.status(200).json({
      success: true,
      reports
    });
  } catch (error) {
    console.error('Get tenant property reports error:', error);
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
};

// Download monthly report as PDF (for both property managers and tenants)
exports.downloadMonthlyReportPdf = async (req, res) => {
  try {
    const { reportId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    let report;

    if (userRole === 'property_manager') {
      // Property manager access
      report = await MonthlyReport.findOne({
        where: { id: reportId },
        include: [{
          model: Property,
          as: 'property',
          attributes: ['id', 'name', 'address'],
          include: [{
            model: User,
            as: 'managers',
            where: { id: userId },
            required: true,
            attributes: []
          }]
        }]
      });
    } else if (userRole === 'tenant') {
      // Tenant access - verify they belong to the property
      report = await MonthlyReport.findOne({
        where: { id: reportId },
        include: [{
          model: Property,
          as: 'property',
          attributes: ['id', 'name', 'address']
        }]
      });

      if (report) {
        const tenant = await User.findByPk(userId, {
          attributes: ['property_ids']
        });

        if (!tenant.property_ids || !tenant.property_ids.includes(report.property_id)) {
          return res.status(403).json({ message: 'Unauthorized to access this report' });
        }
      }
    }

    if (!report) {
      return res.status(404).json({ message: 'Report not found or unauthorized' });
    }

    // Generate PDF data (simple JSON response for now, can be enhanced with actual PDF generation)
    const pdfData = {
      report_id: report.id,
      property: report.property,
      report_month: report.report_month,
      total_budget: report.total_budget,
      total_tenants: report.total_tenants,
      paid_tenants: report.paid_tenants,
      pending_amount: report.pending_amount,
      spending_breakdown: report.spending_breakdown,
      notes: report.notes,
      generated_at: new Date().toISOString()
    };

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="monthly-report-${report.property_id}-${report.report_month}.json"`);

    res.status(200).json({
      success: true,
      data: pdfData
    });
  } catch (error) {
    console.error('Download monthly report PDF error:', error);
    res.status(500).json({ message: 'Error downloading report', error: error.message });
  }
};
