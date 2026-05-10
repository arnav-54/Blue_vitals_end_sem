require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear all data except admin
  await prisma.doctorInvitation.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.doctorTiming.deleteMany({});
  await prisma.doctorLocation.deleteMany({});
  await prisma.doctorSchedule.deleteMany({});
  await prisma.bedBooking.deleteMany({});
  await prisma.ambulanceBooking.deleteMany({});
  await prisma.ambulance.deleteMany({});
  await prisma.doctor.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.hospital.deleteMany({});
  await prisma.user.deleteMany({ where: { role: { not: 'ADMIN' } } });
  console.log('✅ Cleared existing data (admin preserved)');

  // ── HOSPITALS ──────────────────────────────────────────────
  const hospitalData = [
    { name: 'Ruby Hall Clinic', city: 'Pune', address: '40, Sassoon Road, Pune 411001', phone: '+91-20-6645-5000' },
    { name: 'Jehangir Hospital', city: 'Pune', address: '32, Sassoon Road, Pune 411001', phone: '+91-20-6681-5000' },
    { name: 'KEM Hospital Pune', city: 'Pune', address: 'Rasta Peth, Pune 411011', phone: '+91-20-2612-6300' },
    { name: 'Sahyadri Super Speciality Hospital', city: 'Pune', address: '30-C, Erandwane, Karve Road, Pune 411004', phone: '+91-20-6721-3000' },
    { name: 'Deenanath Mangeshkar Hospital', city: 'Pune', address: 'Erandwane, Pune 411004', phone: '+91-20-4015-1000' },
    { name: 'Poona Hospital and Research Centre', city: 'Pune', address: '27, Sadashiv Peth, Pune 411030', phone: '+91-20-2445-2222' },
  ];

  const hospitals = [];
  for (const h of hospitalData) {
    hospitals.push(await prisma.hospital.create({ data: h }));
  }
  console.log(`✅ Created ${hospitals.length} hospitals`);

  // ── DOCTORS ────────────────────────────────────────────────
  const doctorData = [
    // Ruby Hall Clinic
    { name: 'Amit Kulkarni',      email: 'amit.kulkarni@rubyhall.com',    speciality: 'Cardiology',              experience: 18, fees: 1500, qualification: 'MBBS, MD, DM (Cardiology)',          hospital: 'Ruby Hall Clinic',                    phone: '+91-9823001001' },
    { name: 'Sneha Joshi',        email: 'sneha.joshi@rubyhall.com',      speciality: 'Neurology',               experience: 14, fees: 1400, qualification: 'MBBS, MD, DM (Neurology)',           hospital: 'Ruby Hall Clinic',                    phone: '+91-9823001002' },
    { name: 'Rahul Deshpande',    email: 'rahul.deshpande@rubyhall.com',  speciality: 'Orthopedic Surgery',      experience: 20, fees: 1600, qualification: 'MBBS, MS (Ortho), DNB',              hospital: 'Ruby Hall Clinic',                    phone: '+91-9823001003' },
    { name: 'Prachi Wagh',        email: 'prachi.wagh@rubyhall.com',      speciality: 'Gynecology & Obstetrics', experience: 12, fees: 1000, qualification: 'MBBS, MS (OBG)',                    hospital: 'Ruby Hall Clinic',                    phone: '+91-9823001004' },
    { name: 'Sunil Pawar',        email: 'sunil.pawar@rubyhall.com',      speciality: 'Oncology',                experience: 22, fees: 2000, qualification: 'MBBS, MD, DM (Oncology)',           hospital: 'Ruby Hall Clinic',                    phone: '+91-9823001005' },
    // Jehangir Hospital
    { name: 'Meghna Patil',       email: 'meghna.patil@jehangir.com',     speciality: 'Dermatology',             experience: 10, fees: 800,  qualification: 'MBBS, MD (Dermatology)',            hospital: 'Jehangir Hospital',                   phone: '+91-9823002001' },
    { name: 'Vikram Bhosale',     email: 'vikram.bhosale@jehangir.com',   speciality: 'Gastroenterology',        experience: 16, fees: 1200, qualification: 'MBBS, MD, DM (Gastro)',             hospital: 'Jehangir Hospital',                   phone: '+91-9823002002' },
    { name: 'Anita Shinde',       email: 'anita.shinde@jehangir.com',     speciality: 'Endocrinology',           experience: 13, fees: 1100, qualification: 'MBBS, MD, DM (Endocrinology)',      hospital: 'Jehangir Hospital',                   phone: '+91-9823002003' },
    { name: 'Rohan Gaikwad',      email: 'rohan.gaikwad@jehangir.com',    speciality: 'Pulmonology',             experience: 11, fees: 1000, qualification: 'MBBS, MD (Pulmonology)',            hospital: 'Jehangir Hospital',                   phone: '+91-9823002004' },
    { name: 'Kavita Mane',        email: 'kavita.mane@jehangir.com',      speciality: 'Psychiatry',              experience: 15, fees: 900,  qualification: 'MBBS, MD (Psychiatry)',             hospital: 'Jehangir Hospital',                   phone: '+91-9823002005' },
    // KEM Hospital Pune
    { name: 'Deepak Jadhav',      email: 'deepak.jadhav@kem.com',         speciality: 'General Surgery',         experience: 25, fees: 700,  qualification: 'MBBS, MS (General Surgery)',        hospital: 'KEM Hospital Pune',                   phone: '+91-9823003001' },
    { name: 'Sunita Kamble',      email: 'sunita.kamble@kem.com',         speciality: 'Pediatrics',              experience: 17, fees: 600,  qualification: 'MBBS, MD (Pediatrics), DCH',       hospital: 'KEM Hospital Pune',                   phone: '+91-9823003002' },
    { name: 'Nitin Salve',        email: 'nitin.salve@kem.com',           speciality: 'Nephrology',              experience: 19, fees: 1300, qualification: 'MBBS, MD, DM (Nephrology)',         hospital: 'KEM Hospital Pune',                   phone: '+91-9823003003' },
    { name: 'Pooja Thorat',       email: 'pooja.thorat@kem.com',          speciality: 'Ophthalmology',           experience: 9,  fees: 750,  qualification: 'MBBS, MS (Ophthalmology)',          hospital: 'KEM Hospital Pune',                   phone: '+91-9823003004' },
    { name: 'Sachin More',        email: 'sachin.more@kem.com',           speciality: 'ENT Specialist',          experience: 14, fees: 700,  qualification: 'MBBS, MS (ENT)',                    hospital: 'KEM Hospital Pune',                   phone: '+91-9823003005' },
    // Sahyadri Super Speciality Hospital
    { name: 'Aishwarya Desai',    email: 'aishwarya.desai@sahyadri.com',  speciality: 'Rheumatology',            experience: 12, fees: 1100, qualification: 'MBBS, MD, DM (Rheumatology)',       hospital: 'Sahyadri Super Speciality Hospital',  phone: '+91-9823004001' },
    { name: 'Prasad Kale',        email: 'prasad.kale@sahyadri.com',      speciality: 'Urology',                 experience: 21, fees: 1500, qualification: 'MBBS, MS, MCh (Urology)',           hospital: 'Sahyadri Super Speciality Hospital',  phone: '+91-9823004002' },
    { name: 'Rutuja Naik',        email: 'rutuja.naik@sahyadri.com',      speciality: 'Hematology',              experience: 16, fees: 1200, qualification: 'MBBS, MD, DM (Hematology)',         hospital: 'Sahyadri Super Speciality Hospital',  phone: '+91-9823004003' },
    { name: 'Omkar Chavan',       email: 'omkar.chavan@sahyadri.com',     speciality: 'Cardiothoracic Surgery',  experience: 24, fees: 2500, qualification: 'MBBS, MS, MCh (Cardiac Surgery)',   hospital: 'Sahyadri Super Speciality Hospital',  phone: '+91-9823004004' },
    { name: 'Shruti Parab',       email: 'shruti.parab@sahyadri.com',     speciality: 'Radiology',               experience: 13, fees: 900,  qualification: 'MBBS, MD (Radiology)',              hospital: 'Sahyadri Super Speciality Hospital',  phone: '+91-9823004005' },
    // Deenanath Mangeshkar Hospital
    { name: 'Ajay Gokhale',       email: 'ajay.gokhale@deenanath.com',    speciality: 'Neurosurgery',            experience: 20, fees: 2000, qualification: 'MBBS, MS, MCh (Neurosurgery)',      hospital: 'Deenanath Mangeshkar Hospital',       phone: '+91-9823005001' },
    { name: 'Nisha Kulkarni',     email: 'nisha.kulkarni@deenanath.com',  speciality: 'Neonatology',             experience: 15, fees: 1000, qualification: 'MBBS, MD (Pediatrics), Fellowship', hospital: 'Deenanath Mangeshkar Hospital',       phone: '+91-9823005002' },
    { name: 'Sanjay Phadke',      email: 'sanjay.phadke@deenanath.com',   speciality: 'Plastic Surgery',         experience: 18, fees: 1800, qualification: 'MBBS, MS, MCh (Plastic Surgery)',   hospital: 'Deenanath Mangeshkar Hospital',       phone: '+91-9823005003' },
    { name: 'Madhuri Jog',        email: 'madhuri.jog@deenanath.com',     speciality: 'Oncology',                experience: 17, fees: 1600, qualification: 'MBBS, MD, DM (Oncology)',           hospital: 'Deenanath Mangeshkar Hospital',       phone: '+91-9823005004' },
    { name: 'Kedar Pendse',       email: 'kedar.pendse@deenanath.com',    speciality: 'Interventional Cardiology', experience: 22, fees: 2200, qualification: 'MBBS, MD, DM, FSCAI',            hospital: 'Deenanath Mangeshkar Hospital',       phone: '+91-9823005005' },
    // Poona Hospital and Research Centre
    { name: 'Varsha Bhatt',       email: 'varsha.bhatt@poonahospital.com', speciality: 'Dermatology',            experience: 11, fees: 800,  qualification: 'MBBS, MD (Dermatology), DVD',       hospital: 'Poona Hospital and Research Centre',  phone: '+91-9823006001' },
    { name: 'Girish Sathe',       email: 'girish.sathe@poonahospital.com', speciality: 'Orthopedic Surgery',     experience: 23, fees: 1400, qualification: 'MBBS, MS (Ortho), FRCS',            hospital: 'Poona Hospital and Research Centre',  phone: '+91-9823006002' },
    { name: 'Pallavi Datar',      email: 'pallavi.datar@poonahospital.com', speciality: 'Gynecology & Obstetrics', experience: 14, fees: 950, qualification: 'MBBS, MS (OBG), DNB',             hospital: 'Poona Hospital and Research Centre',  phone: '+91-9823006003' },
    { name: 'Tushar Apte',        email: 'tushar.apte@poonahospital.com',  speciality: 'Gastroenterology',       experience: 18, fees: 1100, qualification: 'MBBS, MD, DM (Gastro)',             hospital: 'Poona Hospital and Research Centre',  phone: '+91-9823006004' },
    { name: 'Leena Marathe',      email: 'leena.marathe@poonahospital.com', speciality: 'Endocrinology',         experience: 16, fees: 1050, qualification: 'MBBS, MD, DM (Endocrinology)',      hospital: 'Poona Hospital and Research Centre',  phone: '+91-9823006005' },
  ];

  const doctorPassword = await bcrypt.hash('Doctor@123', 10);
  const timings = [
    { dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 'TUESDAY', startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 'THURSDAY', startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 'FRIDAY', startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 'SATURDAY', startTime: '09:00', endTime: '13:00' },
  ];

  for (const d of doctorData) {
    const hospital = hospitals.find(h => h.name === d.hospital);
    const user = await prisma.user.create({
      data: { name: `Dr. ${d.name}`, email: d.email, password: doctorPassword, phone: d.phone, role: 'DOCTOR' }
    });
    const doctor = await prisma.doctor.create({
      data: { userId: user.id, hospitalId: hospital?.id, speciality: d.speciality, experience: d.experience, fees: d.fees, qualification: d.qualification, city: 'Pune' }
    });
    for (const t of timings) {
      await prisma.doctorTiming.create({ data: { doctorId: doctor.id, ...t } });
    }
  }
  console.log(`✅ Created ${doctorData.length} doctors`);

  // ── 50 PATIENTS ────────────────────────────────────────────
  const patientData = [
    { name: 'Aarav Sharma', email: 'aarav.sharma@gmail.com', phone: '+91-9876501001', gender: 'Male', dob: '1995-03-15' },
    { name: 'Priya Patel', email: 'priya.patel@gmail.com', phone: '+91-9876501002', gender: 'Female', dob: '1992-07-22' },
    { name: 'Rahul Verma', email: 'rahul.verma@gmail.com', phone: '+91-9876501003', gender: 'Male', dob: '1988-11-08' },
    { name: 'Sneha Iyer', email: 'sneha.iyer@gmail.com', phone: '+91-9876501004', gender: 'Female', dob: '1998-01-30' },
    { name: 'Karan Malhotra', email: 'karan.malhotra@gmail.com', phone: '+91-9876501005', gender: 'Male', dob: '1990-05-14' },
    { name: 'Ananya Reddy', email: 'ananya.reddy@gmail.com', phone: '+91-9876501006', gender: 'Female', dob: '1996-09-03' },
    { name: 'Vikram Nair', email: 'vikram.nair@gmail.com', phone: '+91-9876501007', gender: 'Male', dob: '1985-12-19' },
    { name: 'Pooja Desai', email: 'pooja.desai@gmail.com', phone: '+91-9876501008', gender: 'Female', dob: '1993-04-27' },
    { name: 'Arjun Kulkarni', email: 'arjun.kulkarni@gmail.com', phone: '+91-9876501009', gender: 'Male', dob: '1997-08-11' },
    { name: 'Divya Menon', email: 'divya.menon@gmail.com', phone: '+91-9876501010', gender: 'Female', dob: '1991-02-06' },
    { name: 'Rohan Joshi', email: 'rohan.joshi@gmail.com', phone: '+91-9876501011', gender: 'Male', dob: '1994-06-23' },
    { name: 'Kavya Pillai', email: 'kavya.pillai@gmail.com', phone: '+91-9876501012', gender: 'Female', dob: '1999-10-17' },
    { name: 'Aditya Bose', email: 'aditya.bose@gmail.com', phone: '+91-9876501013', gender: 'Male', dob: '1987-03-29' },
    { name: 'Meghna Singh', email: 'meghna.singh@gmail.com', phone: '+91-9876501014', gender: 'Female', dob: '1995-07-05' },
    { name: 'Siddharth Rao', email: 'siddharth.rao@gmail.com', phone: '+91-9876501015', gender: 'Male', dob: '1989-11-21' },
    { name: 'Ishaan Khan', email: 'ishaan.khan@gmail.com', phone: '+91-9876501016', gender: 'Male', dob: '2000-01-14' },
    { name: 'Zara Ahmed', email: 'zara.ahmed@gmail.com', phone: '+91-9876501017', gender: 'Female', dob: '1996-05-08' },
    { name: 'Farhan Qureshi', email: 'farhan.qureshi@gmail.com', phone: '+91-9876501018', gender: 'Male', dob: '1992-09-25' },
    { name: 'Nadia Shaikh', email: 'nadia.shaikh@gmail.com', phone: '+91-9876501019', gender: 'Female', dob: '1998-02-12' },
    { name: 'Imran Siddiqui', email: 'imran.siddiqui@gmail.com', phone: '+91-9876501020', gender: 'Male', dob: '1986-06-30' },
    { name: 'Gurpreet Kaur', email: 'gurpreet.kaur@gmail.com', phone: '+91-9876501021', gender: 'Female', dob: '1993-10-16' },
    { name: 'Harjinder Singh', email: 'harjinder.singh@gmail.com', phone: '+91-9876501022', gender: 'Male', dob: '1990-03-04' },
    { name: 'Manpreet Bhatia', email: 'manpreet.bhatia@gmail.com', phone: '+91-9876501023', gender: 'Female', dob: '1997-07-20' },
    { name: 'Balvinder Dhaliwal', email: 'balvinder.dhaliwal@gmail.com', phone: '+91-9876501024', gender: 'Male', dob: '1984-11-07' },
    { name: 'Simran Grewal', email: 'simran.grewal@gmail.com', phone: '+91-9876501025', gender: 'Female', dob: '1999-04-24' },
    { name: 'Ravi Krishnan', email: 'ravi.krishnan@gmail.com', phone: '+91-9876501026', gender: 'Male', dob: '1988-08-10' },
    { name: 'Lakshmi Venkatesh', email: 'lakshmi.venkatesh@gmail.com', phone: '+91-9876501027', gender: 'Female', dob: '1994-12-28' },
    { name: 'Suresh Babu', email: 'suresh.babu@gmail.com', phone: '+91-9876501028', gender: 'Male', dob: '1982-05-15' },
    { name: 'Padma Sundaram', email: 'padma.sundaram@gmail.com', phone: '+91-9876501029', gender: 'Female', dob: '1991-09-02' },
    { name: 'Karthik Murugan', email: 'karthik.murugan@gmail.com', phone: '+91-9876501030', gender: 'Male', dob: '1996-01-19' },
    { name: 'Amitabh Chatterjee', email: 'amitabh.chatterjee@gmail.com', phone: '+91-9876501031', gender: 'Male', dob: '1980-06-07' },
    { name: 'Rituparna Das', email: 'rituparna.das@gmail.com', phone: '+91-9876501032', gender: 'Female', dob: '1993-10-23' },
    { name: 'Subhash Ghosh', email: 'subhash.ghosh@gmail.com', phone: '+91-9876501033', gender: 'Male', dob: '1987-02-09' },
    { name: 'Moumita Banerjee', email: 'moumita.banerjee@gmail.com', phone: '+91-9876501034', gender: 'Female', dob: '1998-07-26' },
    { name: 'Debashish Roy', email: 'debashish.roy@gmail.com', phone: '+91-9876501035', gender: 'Male', dob: '1985-11-13' },
    { name: 'Chirag Shah', email: 'chirag.shah@gmail.com', phone: '+91-9876501036', gender: 'Male', dob: '1992-04-01' },
    { name: 'Hetal Mehta', email: 'hetal.mehta@gmail.com', phone: '+91-9876501037', gender: 'Female', dob: '1995-08-18' },
    { name: 'Nirav Modi', email: 'nirav.modi2@gmail.com', phone: '+91-9876501038', gender: 'Male', dob: '1989-12-05' },
    { name: 'Foram Trivedi', email: 'foram.trivedi@gmail.com', phone: '+91-9876501039', gender: 'Female', dob: '1997-03-22' },
    { name: 'Dhruv Panchal', email: 'dhruv.panchal@gmail.com', phone: '+91-9876501040', gender: 'Male', dob: '2001-07-09' },
    { name: 'Tejasvi Reddy', email: 'tejasvi.reddy@gmail.com', phone: '+91-9876501041', gender: 'Female', dob: '1994-01-26' },
    { name: 'Venkat Naidu', email: 'venkat.naidu@gmail.com', phone: '+91-9876501042', gender: 'Male', dob: '1983-05-13' },
    { name: 'Swathi Varma', email: 'swathi.varma@gmail.com', phone: '+91-9876501043', gender: 'Female', dob: '1999-09-30' },
    { name: 'Prasad Rao', email: 'prasad.rao@gmail.com', phone: '+91-9876501044', gender: 'Male', dob: '1991-02-16' },
    { name: 'Madhuri Patil', email: 'madhuri.patil@gmail.com', phone: '+91-9876501045', gender: 'Female', dob: '1986-06-03' },
    { name: 'Sachin Wagh', email: 'sachin.wagh@gmail.com', phone: '+91-9876501046', gender: 'Male', dob: '1993-10-20' },
    { name: 'Rutuja Shinde', email: 'rutuja.shinde@gmail.com', phone: '+91-9876501047', gender: 'Female', dob: '2000-03-08' },
    { name: 'Omkar Jadhav', email: 'omkar.jadhav@gmail.com', phone: '+91-9876501048', gender: 'Male', dob: '1996-07-25' },
    { name: 'Shruti Deshpande', email: 'shruti.deshpande@gmail.com', phone: '+91-9876501049', gender: 'Female', dob: '1990-11-11' },
    { name: 'Nikhil Thakur', email: 'nikhil.thakur@gmail.com', phone: '+91-9876501050', gender: 'Male', dob: '1988-04-28' },
  ];

  const patientPassword = await bcrypt.hash('Patient@123', 10);
  for (const p of patientData) {
    const user = await prisma.user.create({
      data: { name: p.name, email: p.email, password: patientPassword, phone: p.phone, role: 'PATIENT' }
    });
    await prisma.patient.create({
      data: { userId: user.id, gender: p.gender, dob: new Date(p.dob) }
    });
  }
  console.log(`✅ Created ${patientData.length} patients`);

  // ── AMBULANCES ─────────────────────────────────────────────
  for (let i = 0; i < hospitals.length; i++) {
    await prisma.ambulance.createMany({
      data: [
        { vehicleNumber: `MH12-${String(i * 3 + 1).padStart(4, '0')}-AMB`, type: 'BASIC',    hospitalId: hospitals[i].id, isAvailable: true, location: 'Pune' },
        { vehicleNumber: `MH12-${String(i * 3 + 2).padStart(4, '0')}-AMB`, type: 'ADVANCED', hospitalId: hospitals[i].id, isAvailable: true, location: 'Pune' },
        { vehicleNumber: `MH12-${String(i * 3 + 3).padStart(4, '0')}-ICU`, type: 'ICU',      hospitalId: hospitals[i].id, isAvailable: true, location: 'Pune' },
      ]
    });
  }
  console.log(`✅ Created ${hospitals.length * 3} ambulances`);

  console.log('\n🎉 Seeding complete!');
  console.log(`   Hospitals : ${hospitals.length}`);
  console.log(`   Doctors   : ${doctorData.length}  (password: Doctor@123)`);
  console.log(`   Patients  : ${patientData.length}  (password: Patient@123)`);
  console.log(`   Admin     : preserved`);
}

main()
  .catch(e => { console.error('❌ Seeding failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
