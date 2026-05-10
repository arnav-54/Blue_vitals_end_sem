const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDoctors = async (req, res) => {
  try {
    const { speciality, city, hospitalId, limit, featured } = req.query;

    let where = {};
    if (speciality) where.speciality = { contains: speciality };
    if (hospitalId) where.hospitalId = hospitalId;
    if (city) where.city = { contains: city, mode: 'insensitive' };

    const doctors = await prisma.doctor.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        hospital: { select: { name: true, city: true, address: true } },
        reviews: {
          select: { rating: true },
          take: 10
        },
        _count: {
          select: { appointments: true, reviews: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : undefined
    });

    // Calculate average rating for each doctor
    const doctorsWithRating = doctors.map(doctor => {
      const avgRating = doctor.reviews.length > 0
        ? doctor.reviews.reduce((sum, review) => sum + review.rating, 0) / doctor.reviews.length
        : 0;

      return {
        ...doctor,
        averageRating: Math.round(avgRating * 10) / 10,
        totalAppointments: doctor._count.appointments,
        totalReviews: doctor._count.reviews,
        isAvailable: true // You can add logic for availability
      };
    });

    res.json(doctorsWithRating);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors', details: error.message });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        hospital: true,
        timings: true,
        reviews: { include: { patient: { include: { user: { select: { name: true } } } } } }
      }
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
};

const createDoctorProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { hospitalId, speciality, experience, fees, qualification, city } = req.body;

    const existingDoctor = await prisma.doctor.findUnique({ where: { userId } });
    if (existingDoctor) {
      return res.json(existingDoctor); // Return existing profile
    }

    if (!speciality || !experience || !fees || !qualification) {
      return res.status(400).json({ error: 'Speciality, experience, fees, and qualification are required' });
    }

    const doctor = await prisma.doctor.create({
      data: {
        userId,
        hospitalId: hospitalId || null,
        speciality,
        experience: parseInt(experience),
        fees: parseInt(fees),
        qualification,
        city: city || null
      },
      include: {
        user: { select: { name: true, email: true } },
        hospital: { select: { name: true, city: true } }
      }
    });

    res.status(201).json(doctor);
  } catch (error) {
    console.error('Error creating doctor profile:', error);
    res.status(500).json({ error: 'Failed to create doctor profile' });
  }
};

const updateDoctorProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { speciality, experience, fees, qualification } = req.body;

    const doctor = await prisma.doctor.update({
      where: { id },
      data: { speciality, experience, fees, qualification },
      include: { user: { select: { name: true, email: true } } }
    });

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

const getDoctorAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    // Get doctor's existing appointments for the date
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: id,
        appointmentDate: {
          gte: new Date(`${date}T00:00:00.000Z`),
          lt: new Date(`${date}T23:59:59.999Z`)
        },
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      },
      select: {
        appointmentDate: true
      }
    });

    // Generate all possible time slots
    const allSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];

    // Filter out booked slots
    const bookedTimes = existingAppointments.map(apt => {
      const time = new Date(apt.appointmentDate).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      return time;
    });

    const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

    res.json({ availableSlots });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
};

// Get doctor invitations
const getDoctorInvitations = async (req, res) => {
  try {
    const { userId } = req.user;

    const doctor = await prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    const invitations = await prisma.doctorInvitation.findMany({
      where: {
        doctorId: doctor.id,
        status: 'PENDING'
      },
      include: {
        hospital: { select: { name: true, city: true, address: true, phone: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(invitations);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
};

// Respond to hospital invitation
const respondToInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const { status } = req.body; // 'ACCEPTED' or 'REJECTED'
    const { userId } = req.user;

    const doctor = await prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    const invitation = await prisma.doctorInvitation.findFirst({
      where: {
        id: invitationId,
        doctorId: doctor.id,
        status: 'PENDING'
      },
      include: { hospital: true }
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    // Update invitation status
    const updatedInvitation = await prisma.doctorInvitation.update({
      where: { id: invitationId },
      data: { status }
    });

    // If accepted, update doctor's hospital
    if (status === 'ACCEPTED') {
      await prisma.doctor.update({
        where: { id: doctor.id },
        data: { hospitalId: invitation.hospitalId }
      });
    }

    res.json({
      message: `Invitation ${status.toLowerCase()} successfully`,
      invitation: updatedInvitation
    });
  } catch (error) {
    console.error('Error responding to invitation:', error);
    res.status(500).json({ error: 'Failed to respond to invitation' });
  }
};

// Get current doctor profile
const getCurrentDoctorProfile = async (req, res) => {
  try {
    const { userId } = req.user;

    const doctor = await prisma.doctor.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        hospital: true
      }
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    res.status(500).json({ error: 'Failed to fetch doctor profile' });
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  getDoctorAvailability,
  createDoctorProfile,
  updateDoctorProfile,
  getDoctorInvitations,
  respondToInvitation,
  getCurrentDoctorProfile
};