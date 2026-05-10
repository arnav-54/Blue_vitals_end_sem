const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, city, address, speciality, experience, fees, qualification, hospitalId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, phone, role }
    });

    let extraData = {};

    if (role === 'HOSPITAL') {
      const hospital = await prisma.hospital.create({
        data: {
          name,
          city: city || 'Not specified',
          address: address || 'Not specified',
          phone: phone || null,
          userId: user.id
        }
      });
      extraData.hospital = hospital;
    }

    if (role === 'DOCTOR') {
      if (speciality && experience && fees && qualification) {
        const doctor = await prisma.doctor.create({
          data: {
            userId: user.id,
            hospitalId: hospitalId || null,
            speciality,
            experience: parseInt(experience),
            fees: parseInt(fees),
            qualification,
            city: city || null
          },
          include: { hospital: { select: { name: true, city: true } } }
        });
        extraData.doctor = doctor;
      }
    }

    const token = generateToken(user.id, user.role);
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, ...extraData }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: {
        doctor: {
          include: {
            hospital: { select: { name: true, city: true } }
          }
        },
        patient: true
      }
    });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.password) {
      return res.status(401).json({ error: 'Please sign in with Google' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.role);
    
    const response = {
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    };

    // Add profile IDs if they exist
    if (user.doctor) {
      response.user.doctor = user.doctor;
    }
    if (user.patient) {
      response.user.patient = user.patient;
    }

    if (user.role === 'HOSPITAL') {
      const hospitalData = await prisma.hospital.findFirst({
        where: { userId: user.id }
      });
      response.user.hospital = hospitalData;
    }
    
    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
};

module.exports = { register, login };