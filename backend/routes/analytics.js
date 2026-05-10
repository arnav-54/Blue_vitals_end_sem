const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { prisma } = require('../db/config');
const router = express.Router();

router.get('/stats', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
  try {
    const [
      totalUsers, totalDoctors, totalPatients, totalHospitals,
      totalAppointments, pendingAppointments, confirmedAppointments, completedAppointments, cancelledAppointments,
      totalBedBookings, totalAmbulanceBookings, totalPayments,
      recentUsers, recentAppointments, usersByRole,
      allPayments, bedBookings, specialityGroups, ambulanceRevenue
    ] = await Promise.all([
      prisma.user.count(),
      prisma.doctor.count(),
      prisma.patient.count(),
      prisma.hospital.count(),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: 'PENDING' } }),
      prisma.appointment.count({ where: { status: 'CONFIRMED' } }),
      prisma.appointment.count({ where: { status: 'COMPLETED' } }),
      prisma.appointment.count({ where: { status: 'CANCELLED' } }),
      prisma.bedBooking.count(),
      prisma.ambulanceBooking.count(),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { paymentStatus: 'PAID' } }),
      prisma.user.findMany({
        orderBy: { id: 'desc' },
        take: 5,
        select: { id: true, name: true, email: true, role: true }
      }),
      prisma.appointment.findMany({
        orderBy: { appointmentDate: 'desc' },
        take: 5,
        include: {
          doctor: { include: { user: { select: { name: true } } } },
          patient: { include: { user: { select: { name: true } } } }
        }
      }),
      prisma.user.groupBy({ by: ['role'], _count: { role: true } }),
      // All payments (any status) with appointment for revenue estimation
      prisma.payment.findMany({
        select: { amount: true, createdAt: true, paymentStatus: true }
      }),
      // Bed bookings with totalAmount for bed revenue
      prisma.bedBooking.findMany({
        select: { totalAmount: true, bedType: true, createdAt: true }
      }),
      // Doctor speciality distribution
      prisma.doctor.groupBy({ by: ['speciality'], _count: { speciality: true } }),
      // Ambulance bookings revenue
      prisma.ambulanceBooking.aggregate({ _sum: { amount: true } })
    ]);

    // Monthly revenue trend (last 6 months)
    // Bed type → standard daily rate (used when totalAmount is null)
    const BED_RATES = { GENERAL: 2000, ICU: 8000, PRIVATE: 5000, SEMI_PRIVATE: 3500 };

    const monthlyMap = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
      monthlyMap[key] = { month: key, doctorRevenue: 0, bedRevenue: 0 };
    }
    allPayments.forEach(p => {
      const d = new Date(p.createdAt);
      const key = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
      if (monthlyMap[key]) monthlyMap[key].doctorRevenue += p.amount;
    });
    bedBookings.forEach(b => {
      const amount = b.totalAmount || BED_RATES[b.bedType] || 2000;
      const d = new Date(b.createdAt);
      const key = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
      if (monthlyMap[key]) monthlyMap[key].bedRevenue += amount;
    });
    const monthlyRevenue = Object.values(monthlyMap);

    // Revenue breakdown — use all payments + estimated bed revenue
    const doctorRevenue = allPayments.reduce((s, p) => s + p.amount, 0);
    const bedRevenue = bedBookings.reduce((s, b) => s + (b.totalAmount || BED_RATES[b.bedType] || 2000), 0);
    const ambulanceRev = ambulanceRevenue._sum.amount || 0;
    const revenueBreakdown = [
      { name: 'Doctor Consultations', value: Math.round(doctorRevenue) },
      { name: 'Bed Bookings', value: Math.round(bedRevenue) },
      { name: 'Ambulance Services', value: Math.round(ambulanceRev) },
    ];

    // Bed type distribution
    const bedTypeMap = {};
    bedBookings.forEach(b => { bedTypeMap[b.bedType] = (bedTypeMap[b.bedType] || 0) + 1; });
    const bedTypeDistribution = Object.entries(bedTypeMap).map(([name, value]) => ({ name, value }));

    // Top 5 specialities
    const topSpecialities = specialityGroups
      .sort((a, b) => b._count.speciality - a._count.speciality)
      .slice(0, 5)
      .map(s => ({ name: s.speciality, count: s._count.speciality }));

    res.json({
      overview: {
        totalUsers, totalDoctors, totalPatients, totalHospitals,
        totalAppointments, totalBedBookings, totalAmbulanceBookings,
        totalRevenue: Math.round(doctorRevenue + bedRevenue + ambulanceRev)
      },
      appointments: {
        pending: pendingAppointments,
        confirmed: confirmedAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments
      },
      recentUsers,
      recentAppointments,
      usersByRole,
      monthlyRevenue,
      revenueBreakdown,
      bedTypeDistribution,
      topSpecialities
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Paginated patients list for admin
router.get('/patients', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 10;
    const skip = (page - 1) * limit;

    const [total, patients] = await Promise.all([
      prisma.patient.count(),
      prisma.patient.findMany({
        skip,
        take: limit,
        orderBy: { userId: 'desc' },
        include: { user: { select: { id: true, name: true, email: true, phone: true } } }
      })
    ]);

    res.json({ patients, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Patients fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Paginated doctors list for admin
router.get('/doctors', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 10;
    const skip = (page - 1) * limit;

    const [total, doctors] = await Promise.all([
      prisma.doctor.count(),
      prisma.doctor.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          hospital: { select: { name: true, city: true } }
        }
      })
    ]);

    res.json({ doctors, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Doctors fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// Paginated bed bookings list for admin
router.get('/bed-bookings', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 10;
    const skip = (page - 1) * limit;

    const [total, bedBookings] = await Promise.all([
      prisma.bedBooking.count(),
      prisma.bedBooking.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { include: { user: { select: { name: true, phone: true } } } },
          hospital: { select: { name: true, city: true } }
        }
      })
    ]);

    res.json({ bedBookings, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Bed bookings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch bed bookings' });
  }
});

module.exports = router;
