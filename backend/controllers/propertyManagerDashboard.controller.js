const { Property, User, TenantPayment, Report, Complaint, Suggestion, MonthlyReport, PropertyManager } = require('../models');
const { Op, Sequelize } = require('sequelize');
const sequelize = require('../config/database').sequelize;

// Get comprehensive Property Manager dashboard data
exports.getPropertyManagerDashboardData = async (req, res) => {
  try {
    const property_manager_id = req.user.id;

    // Get all properties managed by this property manager using the junction table
    const propertyManagerRecords = await PropertyManager.findAll({
      where: { user_id: property_manager_id },
      attributes: ['property_id']
    });

    const propertyIds = propertyManagerRecords.map(pm => pm.property_id);

    // Get all properties with their details
    const properties = await Property.findAll({
      where: {
        id: { [Op.in]: propertyIds }
      }
    });

    // Get all tenants across managed properties
    const allTenants = await User.findAll({
      where: {
        role: 'tenant',
        property_ids: {
          [Op.overlap]: propertyIds
        }
      },
      attributes: ['id', 'name', 'surname', 'email', 'number', 'property_ids']
    });

    // Calculate total apartments and occupied apartments
    let totalApartments = 0;
    let occupiedApartments = 0;

    properties.forEach(property => {
      const floors = property.floors || [];
      floors.forEach(floor => {
        const apartments = floor.apartments || [];
        totalApartments += apartments.length;

        apartments.forEach(apt => {
          if (apt.tenant_id) {
            occupiedApartments++;
          }
        });
      });
    });

    // Get pending reports (maintenance requests)
    const pendingReports = await Report.findAll({
      where: {
        property_id: { [Op.in]: propertyIds },
        status: { [Op.in]: ['pending', 'in_progress'] }
      },
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'name', 'address']
        },
        {
          model: User,
          as: 'tenant',
          attributes: ['id', 'name', 'surname', 'email', 'number']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    // Get recent complaints
    const recentComplaints = await Complaint.findAll({
      where: {
        property_id: { [Op.in]: propertyIds },
        status: { [Op.in]: ['pending', 'in_progress'] }
      },
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'name', 'address']
        },
        {
          model: User,
          as: 'tenant',
          attributes: ['id', 'name', 'surname', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    // Get recent suggestions
    const recentSuggestions = await Suggestion.findAll({
      where: {
        property_id: { [Op.in]: propertyIds },
        status: 'pending'
      },
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'name', 'address']
        },
        {
          model: User,
          as: 'tenant',
          attributes: ['id', 'name', 'surname', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    // Get payment statistics for current month
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const currentMonthPayments = await TenantPayment.findAll({
      where: {
        property_id: { [Op.in]: propertyIds },
        payment_month: {
          [Op.gte]: firstDayOfMonth,
          [Op.lte]: lastDayOfMonth
        }
      }
    });

    const paidCount = currentMonthPayments.filter(p => p.status === 'paid').length;
    const unpaidCount = currentMonthPayments.filter(p => p.status === 'unpaid').length;
    const totalRevenue = currentMonthPayments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    // Get overdue payments
    const overduePayments = await TenantPayment.findAll({
      where: {
        property_id: { [Op.in]: propertyIds },
        status: 'unpaid',
        payment_month: {
          [Op.lt]: firstDayOfMonth
        }
      },
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'name', 'address']
        },
        {
          model: User,
          as: 'tenant',
          attributes: ['id', 'name', 'surname', 'email', 'number']
        }
      ],
      order: [['payment_month', 'ASC']],
      limit: 10
    });

    // Get recent monthly reports
    const recentMonthlyReports = await MonthlyReport.findAll({
      where: {
        property_id: { [Op.in]: propertyIds }
      },
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'name', 'address']
        }
      ],
      order: [['report_month', 'DESC']],
      limit: 5
    });

    // Calculate report statistics
    const reportStats = await Report.findAll({
      where: {
        property_id: { [Op.in]: propertyIds }
      },
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const reportStatusCounts = {
      pending: 0,
      in_progress: 0,
      resolved: 0
    };

    reportStats.forEach(stat => {
      reportStatusCounts[stat.status] = parseInt(stat.get('count'));
    });

    // Calculate complaint statistics
    const complaintStats = await Complaint.findAll({
      where: {
        property_id: { [Op.in]: propertyIds }
      },
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const complaintStatusCounts = {
      pending: 0,
      in_progress: 0,
      resolved: 0
    };

    complaintStats.forEach(stat => {
      complaintStatusCounts[stat.status] = parseInt(stat.get('count'));
    });

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = {
      newReports: await Report.count({
        where: {
          property_id: { [Op.in]: propertyIds },
          created_at: { [Op.gte]: sevenDaysAgo }
        }
      }),
      newComplaints: await Complaint.count({
        where: {
          property_id: { [Op.in]: propertyIds },
          created_at: { [Op.gte]: sevenDaysAgo }
        }
      }),
      newSuggestions: await Suggestion.count({
        where: {
          property_id: { [Op.in]: propertyIds },
          created_at: { [Op.gte]: sevenDaysAgo }
        }
      }),
      paymentsReceived: await TenantPayment.count({
        where: {
          property_id: { [Op.in]: propertyIds },
          status: 'paid',
          updated_at: { [Op.gte]: sevenDaysAgo }
        }
      })
    };

    // Calculate occupancy rate
    const occupancyRate = totalApartments > 0
      ? ((occupiedApartments / totalApartments) * 100).toFixed(1)
      : 0;

    // Return comprehensive dashboard data
    res.json({
      success: true,
      data: {
        overview: {
          totalProperties: properties.length,
          totalTenants: allTenants.length,
          totalApartments,
          occupiedApartments,
          vacantApartments: totalApartments - occupiedApartments,
          occupancyRate: parseFloat(occupancyRate)
        },
        payments: {
          currentMonth: {
            paid: paidCount,
            unpaid: unpaidCount,
            total: currentMonthPayments.length,
            revenue: parseFloat(totalRevenue.toFixed(2)),
            collectionRate: currentMonthPayments.length > 0
              ? ((paidCount / currentMonthPayments.length) * 100).toFixed(1)
              : 0
          },
          overdue: overduePayments.map(p => ({
            id: p.id,
            tenant: p.tenant ? {
              id: p.tenant.id,
              name: `${p.tenant.name} ${p.tenant.surname}`,
              email: p.tenant.email,
              number: p.tenant.number
            } : null,
            property: p.property ? {
              id: p.property.id,
              name: p.property.name,
              address: p.property.address
            } : null,
            amount: parseFloat(p.amount || 0),
            paymentMonth: p.payment_month,
            daysOverdue: Math.floor((currentDate - new Date(p.payment_month)) / (1000 * 60 * 60 * 24))
          }))
        },
        reports: {
          statistics: reportStatusCounts,
          pending: pendingReports.map(r => ({
            id: r.id,
            title: r.title,
            description: r.description,
            status: r.status,
            problemOptions: r.problem_options,
            urgency: r.urgency || 'medium',
            tenant: r.tenant ? {
              id: r.tenant.id,
              name: `${r.tenant.name} ${r.tenant.surname}`,
              email: r.tenant.email,
              number: r.tenant.number
            } : null,
            property: r.property ? {
              id: r.property.id,
              name: r.property.name,
              address: r.property.address
            } : null,
            createdAt: r.created_at
          }))
        },
        complaints: {
          statistics: complaintStatusCounts,
          recent: recentComplaints.map(c => ({
            id: c.id,
            title: c.title,
            description: c.description,
            status: c.status,
            tenant: c.tenant ? {
              id: c.tenant.id,
              name: `${c.tenant.name} ${c.tenant.surname}`,
              email: c.tenant.email
            } : null,
            property: c.property ? {
              id: c.property.id,
              name: c.property.name,
              address: c.property.address
            } : null,
            createdAt: c.created_at
          }))
        },
        suggestions: {
          recent: recentSuggestions.map(s => ({
            id: s.id,
            title: s.title,
            description: s.description,
            status: s.status,
            tenant: s.tenant ? {
              id: s.tenant.id,
              name: `${s.tenant.name} ${s.tenant.surname}`,
              email: s.tenant.email
            } : null,
            property: s.property ? {
              id: s.property.id,
              name: s.property.name,
              address: s.property.address
            } : null,
            createdAt: s.created_at
          }))
        },
        monthlyReports: {
          recent: recentMonthlyReports.map(mr => ({
            id: mr.id,
            reportMonth: mr.report_month,
            totalRevenue: parseFloat(mr.total_revenue || 0),
            totalExpenses: parseFloat(mr.total_expenses || 0),
            netIncome: parseFloat(mr.net_income || 0),
            property: mr.property ? {
              id: mr.property.id,
              name: mr.property.name,
              address: mr.property.address
            } : null,
            createdAt: mr.created_at
          }))
        },
        recentActivity,
        properties: properties.map(p => {
          // Calculate actual number of floors
          const floorsCount = (p.floors_from !== null && p.floors_to !== null)
            ? (p.floors_to - p.floors_from + 1)
            : null;

          // Count tenants for this property
          const propertyTenants = allTenants.filter(tenant =>
            tenant.property_ids && tenant.property_ids.includes(p.id)
          );

          return {
            id: p.id,
            name: p.name,
            address: p.address,
            city: p.city,
            floors: floorsCount,
            totalApartments: (p.floors || []).reduce((sum, floor) =>
              sum + (floor.apartments || []).length, 0),
            occupiedApartments: (p.floors || []).reduce((sum, floor) =>
              sum + (floor.apartments || []).filter(apt => apt.tenant_id).length, 0),
            tenantCount: propertyTenants.length
          };
        })
      }
    });

  } catch (error) {
    console.error('Error fetching property manager dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};

// Get sidebar badge counts for Property Manager
exports.getSidebarCounts = async (req, res) => {
  try {
    const property_manager_id = req.user.id;

    // Get all properties managed by this property manager using the junction table
    const propertyManagerRecords = await PropertyManager.findAll({
      where: { user_id: property_manager_id },
      attributes: ['property_id']
    });

    const propertyIds = propertyManagerRecords.map(pm => pm.property_id);

    if (propertyIds.length === 0) {
      return res.json({
        success: true,
        data: {
          pendingReports: 0,
          pendingComplaints: 0,
          pendingSuggestions: 0
        }
      });
    }

    // Count pending reports
    const pendingReports = await Report.count({
      where: {
        property_id: { [Op.in]: propertyIds },
        status: 'pending'
      }
    });

    // Count pending complaints
    const pendingComplaints = await Complaint.count({
      where: {
        property_id: { [Op.in]: propertyIds },
        status: 'pending'
      }
    });

    // Count pending suggestions
    const pendingSuggestions = await Suggestion.count({
      where: {
        property_id: { [Op.in]: propertyIds },
        status: 'pending'
      }
    });

    res.json({
      success: true,
      data: {
        pendingReports,
        pendingComplaints,
        pendingSuggestions
      }
    });

  } catch (error) {
    console.error('Error fetching sidebar counts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sidebar counts',
      error: error.message
    });
  }
};
