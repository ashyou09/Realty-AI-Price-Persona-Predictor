const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/database');
const User = require('./models/User');
require('dotenv').config();

async function seed() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    const email = 'test@gmail.com';
    const password = 'testemail';
    
    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      console.log('✅ Test user already exists:', normalizedEmail);
      
      // Update password in case it changed
      const hashedPassword = await bcrypt.hash(password, 10);
      existingUser.password = hashedPassword;
      await existingUser.save();
      
      console.log('✅ Test user password updated');
      console.log('\n📝 Login Credentials:');
      console.log('   Email:    test@gmail.com');
      console.log('   Password: testemail');
      console.log('\n⚠️  Make sure:');
      console.log('   - No extra spaces');
      console.log('   - All lowercase');
      console.log('   - Server is running: npm start');
      await mongoose.connection.close();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create test user
    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword
    });

    console.log('✅ Test user created successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('   Email:    test@gmail.com');
    console.log('   Password: testemail');
    console.log('\n⚠️  Make sure:');
    console.log('   - No extra spaces');
    console.log('   - All lowercase');
    console.log('   - Server is running: npm start');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error seeding user:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seed();

