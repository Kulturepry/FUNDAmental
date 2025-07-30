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
    
    // No demo data - clean database setup
    console.log('✅ Database setup completed with clean slate');
    
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