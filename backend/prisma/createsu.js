// prisma/createsu.js
'use strict';

/*
 * This script creates a superuser in the database
 * Usage example:
 *   node prisma/createsu.js clive123 clive.su@mail.utoronto.ca SuperUser123!
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createSuperUser() {
    try {
        // Get command line arguments
        const args = process.argv.slice(2);

        if (args.length !== 3) {
            console.error('Usage: node prisma/createsu.js utorid email password');
            process.exit(1);
        }

        const [utorid, email, password] = args;

        // Validate email format for UofT email
        if (!email.endsWith('@mail.utoronto.ca') && !email.endsWith('@utoronto.ca')) {
            console.error('Error: Email must be a valid University of Toronto email address');
            process.exit(1);
        }

        // Validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
        if (!passwordRegex.test(password)) {
            console.error('Error: Password must be 8-20 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character');
            process.exit(1);
        }

        // Check if user with this utorid already exists
        const existingUser = await prisma.user.findUnique({
            where: { utorid },
        });

        if (existingUser) {
            console.error(`Error: User with utorid "${utorid}" already exists`);
            process.exit(1);
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the superuser
        const superUser = await prisma.user.create({
            data: {
                utorid,
                name: `Superuser ${utorid}`,
                email,
                password: hashedPassword,
                role: 'superuser',
                verified: true,
                suspicious: false,
            },
        });

        console.log(`Superuser created successfully:`);
        console.log(`- ID: ${superUser.id}`);
        console.log(`- UTORid: ${superUser.utorid}`);
        console.log(`- Email: ${superUser.email}`);
        console.log(`- Role: ${superUser.role}`);

    } catch (error) {
        console.error('Error creating superuser:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Execute the function
createSuperUser();