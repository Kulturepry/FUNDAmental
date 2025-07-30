const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('Setting up FUNDAmental database...');
    
    // Create default admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@fundamental.com' },
      update: {},
      create: {
        name: 'Admin User',
        email: 'admin@fundamental.com',
        password: 'admin123', // Change this in production!
        role: 'admin',
        gradeLevel: 'university_computer_science',
      },
    });
    
    console.log('✅ Default admin user created:', adminUser.email);
    
    // Create some sample courses
    const sampleCourses = [
      {
        title: 'Introduction to Computer Science',
        description: 'Learn the basics of programming and computer science',
        gradeLevel: 'university_computer_science',
        subject: 'Computer Science',
        teacherId: adminUser.id,
      },
      {
        title: 'Advanced Mathematics',
        description: 'Advanced mathematical concepts and problem solving',
        gradeLevel: 'university_mathematics',
        subject: 'Mathematics',
        teacherId: adminUser.id,
      },
      {
        title: 'English Literature',
        description: 'Study of classic and contemporary literature',
        gradeLevel: 'university_english',
        subject: 'English',
        teacherId: adminUser.id,
      },
    ];
    
    for (const courseData of sampleCourses) {
      const course = await prisma.course.upsert({
        where: { 
          title_teacherId: {
            title: courseData.title,
            teacherId: courseData.teacherId,
          }
        },
        update: {},
        create: courseData,
      });
      console.log('✅ Sample course created:', course.title);
    }
    
    // Create sample notifications
    const sampleNotifications = [
      {
        userId: adminUser.id,
        title: 'Welcome to FUNDAmental!',
        message: 'Thank you for joining our learning platform. Start exploring courses and resources.',
        read: false,
      },
      {
        userId: adminUser.id,
        title: 'New Course Available',
        message: 'Introduction to Computer Science is now available for enrollment.',
        read: false,
      },
    ];
    
    for (const notificationData of sampleNotifications) {
      const notification = await prisma.notification.create({
        data: notificationData,
      });
      console.log('✅ Sample notification created:', notification.title);
    }
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\nDefault admin credentials:');
    console.log('Email: admin@fundamental.com');
    console.log('Password: admin123');
    console.log('\n⚠️  Remember to change these credentials in production!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase(); 