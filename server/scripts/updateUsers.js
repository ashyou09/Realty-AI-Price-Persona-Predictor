// Script to update existing users with name field
// Run this once: node server/scripts/updateUsers.js

import mongoose from 'mongoose';
import 'dotenv/config';
import userModel from '../models/userModel.js';

const updateUsers = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/Authentication`);
        console.log('Connected to database');

        // Find all users without name field
        const usersWithoutName = await userModel.find({ name: { $exists: false } });
        console.log(`Found ${usersWithoutName.length} users without name field`);

        // Update each user with a default name based on email
        for (const user of usersWithoutName) {
            const defaultName = user.email.split('@')[0]; // Use email prefix as default name
            user.name = defaultName;
            await user.save();
            console.log(`Updated user ${user.email} with name: ${defaultName}`);
        }

        // Also check for users with empty name
        const usersWithEmptyName = await userModel.find({ $or: [{ name: '' }, { name: null }] });
        console.log(`Found ${usersWithEmptyName.length} users with empty name`);

        for (const user of usersWithEmptyName) {
            const defaultName = user.email.split('@')[0];
            user.name = defaultName;
            await user.save();
            console.log(`Updated user ${user.email} with name: ${defaultName}`);
        }

        console.log('Update completed!');
        process.exit(0);
    } catch (error) {
        console.error('Error updating users:', error);
        process.exit(1);
    }
};

updateUsers();

