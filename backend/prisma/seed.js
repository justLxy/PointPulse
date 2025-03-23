// prisma/seed.js
'use strict';

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Run the seed function
seed().catch(e => {
    console.error(e);
    process.exit(1);
});

async function seed() {
    try {
        console.log('Starting database seeding...');

        // Clear existing data
        console.log('Clearing existing data...');
        await clearData();

        // Create users
        console.log('Creating users...');
        const users = await createUsers();

        // Create events
        console.log('Creating events...');
        const events = await createEvents(users);

        // Create promotions
        console.log('Creating promotions...');
        const promotions = await createPromotions();

        // Create transactions
        console.log('Creating transactions...');
        const transactionCount = await createTransactions(users, events, promotions);

        console.log('Seeding completed successfully!');

        // Print summary
        console.log('\nDatabase seeding summary:');
        console.log(`Total users: 10 (1 superuser, 1 manager, 1 cashier, 7 regular users)`);
        console.log(`Total events: 3 (1 upcoming, 1 past, 1 unpublished)`);
        console.log(`Total promotions: 4 (2 active, 1 upcoming, 1 past)`);
        console.log(`Total transactions: ${Object.values(transactionCount).reduce((a, b) => a + b, 0)}`);
        console.log(`- Purchase: ${transactionCount.purchase}`);
        console.log(`- Adjustment: ${transactionCount.adjustment}`);
        console.log(`- Redemption: ${transactionCount.redemption}`);
        console.log(`- Transfer: ${transactionCount.transfer}`);
        console.log(`- Event: ${transactionCount.event}`);
    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

async function clearData() {
    // Delete data in a specific order to respect foreign key constraints
    await prisma.promotionTransaction.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.promotion.deleteMany({});
    await prisma.event.deleteMany({});
    await prisma.user.deleteMany({});
}

async function createUsers() {
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    // Create superuser
    const superuser = await prisma.user.create({
        data: {
            utorid: 'superusr1',
            name: 'Super User',
            email: 'super.user@mail.utoronto.ca',
            password: hashedPassword,
            role: 'superuser',
            points: 5000,
            verified: true,
            lastLogin: new Date(),
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        }
    });

    // Create manager
    const manager = await prisma.user.create({
        data: {
            utorid: 'manager1',
            name: 'Manager User',
            email: 'manager.user@mail.utoronto.ca',
            password: hashedPassword,
            role: 'manager',
            points: 3000,
            verified: true,
            lastLogin: new Date(),
            createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000), // 50 days ago
        }
    });

    // Create cashier
    const cashier = await prisma.user.create({
        data: {
            utorid: 'cashier1',
            name: 'Cashier User',
            email: 'cashier.user@mail.utoronto.ca',
            password: hashedPassword,
            role: 'cashier',
            points: 2000,
            verified: true,
            lastLogin: new Date(),
            createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), // 40 days ago
        }
    });

    // Create 7 regular users (for a total of 10 users)
    const regularUsers = [];

    for (let i = 1; i <= 7; i++) {
        const user = await prisma.user.create({
            data: {
                utorid: `regular${i}`,
                name: `Regular User ${i}`,
                email: `regular.user${i}@mail.utoronto.ca`,
                password: hashedPassword,
                role: 'regular',
                points: 1000 * i,
                verified: i <= 5, // First 5 users are verified
                lastLogin: i <= 6 ? new Date(Date.now() - i * 24 * 60 * 60 * 1000) : null, // First 6 users have logged in
                createdAt: new Date(Date.now() - (30 + i) * 24 * 60 * 60 * 1000),
                birthday: i % 2 === 0 ? `1990-0${i}-15` : null, // Even-numbered users have birthdays
            }
        });
        regularUsers.push(user);
    }

    console.log(`Created users: 1 superuser, 1 manager, 1 cashier, ${regularUsers.length} regular users`);

    return {
        superuser,
        manager,
        cashier,
        regularUsers
    };
}

async function createEvents(users) {
    const now = new Date();

    // Upcoming event
    const upcomingEvent = await prisma.event.create({
        data: {
            name: 'Annual CS Hackathon',
            description: 'Join us for a 24-hour coding challenge where teams compete to build innovative software solutions.',
            location: 'Bahen Centre, Room 1080',
            startTime: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days in the future
            endTime: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days in the future
            capacity: 50,
            pointsRemain: 5000,
            pointsAwarded: 0,
            published: true,
            organizers: {
                connect: [
                    { id: users.manager.id },
                    { id: users.regularUsers[0].id } // First regular user is also an organizer
                ]
            },
            guests: {
                connect: [
                    { id: users.regularUsers[1].id },
                    { id: users.regularUsers[2].id },
                    { id: users.regularUsers[3].id }
                ]
            }
        }
    });

    // Past event
    const pastEvent = await prisma.event.create({
        data: {
            name: 'CS Career Fair',
            description: 'Network with top tech companies and explore internship and full-time opportunities.',
            location: 'Sidney Smith Hall, Room 2118',
            startTime: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days in the past
            endTime: new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000), // 29 days in the past
            capacity: 100,
            pointsRemain: 3000,
            pointsAwarded: 2000,
            published: true,
            organizers: {
                connect: [
                    { id: users.manager.id },
                    { id: users.cashier.id }
                ]
            },
            guests: {
                connect: [
                    { id: users.regularUsers[2].id },
                    { id: users.regularUsers[3].id },
                    { id: users.regularUsers[4].id },
                    { id: users.regularUsers[5].id }
                ]
            }
        }
    });

    // Unpublished event
    const unpublishedEvent = await prisma.event.create({
        data: {
            name: 'End of Year Celebration',
            description: 'Celebrate the end of the academic year with food, games, and networking.',
            location: 'Hart House Great Hall',
            startTime: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000), // 60 days in the future
            endTime: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 60 days + 4 hours
            capacity: 200,
            pointsRemain: 10000,
            pointsAwarded: 0,
            published: false,
            organizers: {
                connect: [
                    { id: users.manager.id }
                ]
            }
        }
    });

    console.log(`Created events: 1 upcoming, 1 past, 1 unpublished`);

    return {
        upcomingEvent,
        pastEvent,
        unpublishedEvent
    };
}

async function createPromotions() {
    const now = new Date();

    // Active automatic promotion
    const activeAutomaticPromotion = await prisma.promotion.create({
        data: {
            name: 'Double Points Weekend',
            description: 'Earn double points on all purchases during the weekend.',
            type: 'automatic',
            startTime: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            endTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days in the future
            minSpending: 10.00,
            rate: 0.04, // 1 additional point per $0.25 spent (equal to standard rate)
            points: null
        }
    });

    // Active one-time promotion
    const activeOneTimePromotion = await prisma.promotion.create({
        data: {
            name: 'Welcome Bonus',
            description: 'Get 500 bonus points on your first purchase of $20 or more.',
            type: 'one-time',
            startTime: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
            endTime: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days in the future
            minSpending: 20.00,
            rate: null,
            points: 500
        }
    });

    // Upcoming promotion
    const upcomingPromotion = await prisma.promotion.create({
        data: {
            name: 'Holiday Special',
            description: 'Earn triple points on all purchases during the holiday season.',
            type: 'automatic',
            startTime: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days in the future
            endTime: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000), // 45 days in the future
            minSpending: null,
            rate: 0.08, // 2 additional points per $0.25 spent
            points: null
        }
    });

    // Past promotion
    const pastPromotion = await prisma.promotion.create({
        data: {
            name: 'Spring Break Special',
            description: 'Get 200 bonus points on all purchases during spring break.',
            type: 'automatic',
            startTime: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
            endTime: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
            minSpending: 5.00,
            rate: null,
            points: 200
        }
    });

    console.log(`Created promotions: 2 active, 1 upcoming, 1 past`);

    return {
        activeAutomaticPromotion,
        activeOneTimePromotion,
        upcomingPromotion,
        pastPromotion
    };
}

async function createTransactions(users, events, promotions) {
    const now = new Date();
    const transactionCount = {
        purchase: 0,
        adjustment: 0,
        redemption: 0,
        transfer: 0,
        event: 0
    };

    // Create purchase transactions
    // Purchase 1: Regular user with automatic promotion
    const purchase1 = await prisma.transaction.create({
        data: {
            type: 'purchase',
            amount: 200, // 50 base points + 50 promotion points (rate: 0.04)
            spent: 12.50, // 50 base points at 1 point per $0.25
            remark: 'Coffee and snacks',
            suspicious: false,
            userId: users.regularUsers[0].id,
            createdBy: users.cashier.id,
            createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
            promotions: {
                create: [
                    {
                        promotion: {
                            connect: { id: promotions.activeAutomaticPromotion.id }
                        }
                    }
                ]
            }
        }
    });
    transactionCount.purchase++;

    // Purchase 2: Regular user with one-time promotion
    const purchase2 = await prisma.transaction.create({
        data: {
            type: 'purchase',
            amount: 680, // 80 base points + 500 promotion points + 100 (rate: 0.04)
            spent: 20.00, // 80 base points at 1 point per $0.25
            remark: 'Textbooks',
            suspicious: false,
            userId: users.regularUsers[1].id,
            createdBy: users.cashier.id,
            createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            promotions: {
                create: [
                    {
                        promotion: {
                            connect: { id: promotions.activeOneTimePromotion.id }
                        }
                    },
                    {
                        promotion: {
                            connect: { id: promotions.activeAutomaticPromotion.id }
                        }
                    }
                ]
            }
        }
    });
    transactionCount.purchase++;

    // Link the one-time promotion to the user (marking it as used)
    await prisma.user.update({
        where: { id: users.regularUsers[1].id },
        data: {
            usedPromotions: {
                connect: { id: promotions.activeOneTimePromotion.id }
            }
        }
    });

    // Purchase 3: Regular user with past promotion
    const purchase3 = await prisma.transaction.create({
        data: {
            type: 'purchase',
            amount: 400, // 200 base points + 200 promotion points
            spent: 50.00, // 200 base points at 1 point per $0.25
            remark: 'Lab supplies',
            suspicious: false,
            userId: users.regularUsers[2].id,
            createdBy: users.cashier.id,
            createdAt: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000), // 50 days ago
            promotions: {
                create: [
                    {
                        promotion: {
                            connect: { id: promotions.pastPromotion.id }
                        }
                    }
                ]
            }
        }
    });
    transactionCount.purchase++;

    // Purchase 4: Regular user with no promotion
    const purchase4 = await prisma.transaction.create({
        data: {
            type: 'purchase',
            amount: 100, // 100 base points
            spent: 25.00, // 100 base points at 1 point per $0.25
            remark: 'Lunch',
            suspicious: false,
            userId: users.regularUsers[3].id,
            createdBy: users.cashier.id,
            createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        }
    });
    transactionCount.purchase++;

    // Purchase 5: Regular user with suspicious cashier
    const purchase5 = await prisma.transaction.create({
        data: {
            type: 'purchase',
            amount: 160, // 160 base points
            spent: 40.00, // 160 base points at 1 point per $0.25
            remark: 'Office supplies',
            suspicious: true, // Suspicious transaction
            userId: users.regularUsers[4].id,
            createdBy: users.cashier.id,
            createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // Yesterday
        }
    });
    transactionCount.purchase++;

    // Purchase 6: Manager with automatic promotion
    const purchase6 = await prisma.transaction.create({
        data: {
            type: 'purchase',
            amount: 60, // 30 base points + 30 promotion points
            spent: 7.50, // 30 base points at 1 point per $0.25
            remark: 'Coffee',
            suspicious: false,
            userId: users.manager.id,
            createdBy: users.cashier.id,
            createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            promotions: {
                create: [
                    {
                        promotion: {
                            connect: { id: promotions.activeAutomaticPromotion.id }
                        }
                    }
                ]
            }
        }
    });
    transactionCount.purchase++;

    // Create adjustment transactions
    // Adjustment 1: Correct purchase1
    const adjustment1 = await prisma.transaction.create({
        data: {
            type: 'adjustment',
            amount: 50, // Adding 50 more points
            relatedId: purchase1.id,
            remark: 'Missing promotional items',
            suspicious: false,
            userId: users.regularUsers[0].id,
            createdBy: users.manager.id,
            createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        }
    });
    transactionCount.adjustment++;

    // Adjustment 2: Correct purchase3
    const adjustment2 = await prisma.transaction.create({
        data: {
            type: 'adjustment',
            amount: -100, // Removing 100 points
            relatedId: purchase3.id,
            remark: 'Returned item',
            suspicious: false,
            userId: users.regularUsers[2].id,
            createdBy: users.manager.id,
            createdAt: new Date(now.getTime() - 48 * 24 * 60 * 60 * 1000), // 48 days ago
        }
    });
    transactionCount.adjustment++;

    // Adjustment 3: Correct for purchase5 (suspicious transaction)
    const adjustment3 = await prisma.transaction.create({
        data: {
            type: 'adjustment',
            amount: 160, // Adding back the points from the suspicious transaction
            relatedId: purchase5.id,
            remark: 'Transaction verified',
            suspicious: false,
            userId: users.regularUsers[4].id,
            createdBy: users.manager.id,
            createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
        }
    });
    transactionCount.adjustment++;

    // Create redemption transactions
    // Redemption 1: Regular user - already processed
    const redemption1 = await prisma.transaction.create({
        data: {
            type: 'redemption',
            amount: -200,
            redeemed: 200,
            remark: 'Discount on textbook',
            suspicious: false,
            userId: users.regularUsers[0].id,
            createdBy: users.regularUsers[0].id,
            processedBy: users.cashier.id,
            relatedId: users.cashier.id, // Store processedBy as relatedId
            createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        }
    });
    transactionCount.redemption++;

    // Redemption 2: Regular user - pending
    const redemption2 = await prisma.transaction.create({
        data: {
            type: 'redemption',
            amount: -500,
            redeemed: 500,
            remark: 'Discount on lab equipment',
            suspicious: false,
            userId: users.regularUsers[1].id,
            createdBy: users.regularUsers[1].id,
            processedBy: null, // Not processed yet
            createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
        }
    });
    transactionCount.redemption++;

    // Redemption 3: Regular user - processed
    const redemption3 = await prisma.transaction.create({
        data: {
            type: 'redemption',
            amount: -300,
            redeemed: 300,
            remark: 'Discount on coffee',
            suspicious: false,
            userId: users.regularUsers[2].id,
            createdBy: users.regularUsers[2].id,
            processedBy: users.cashier.id,
            relatedId: users.cashier.id, // Store processedBy as relatedId
            createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        }
    });
    transactionCount.redemption++;

    // Create transfer transactions
    // Transfer 1: From regular user to another
    const transfer1Sender = await prisma.transaction.create({
        data: {
            type: 'transfer',
            amount: -200,
            remark: 'Borrowed money repayment',
            suspicious: false,
            userId: users.regularUsers[0].id,
            createdBy: users.regularUsers[0].id,
            relatedId: users.regularUsers[3].id, // Recipient ID
            createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        }
    });

    const transfer1Recipient = await prisma.transaction.create({
        data: {
            type: 'transfer',
            amount: 200,
            remark: 'Borrowed money repayment',
            suspicious: false,
            userId: users.regularUsers[3].id,
            createdBy: users.regularUsers[0].id,
            relatedId: users.regularUsers[0].id, // Sender ID
            senderId: users.regularUsers[0].id,
            createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        }
    });
    transactionCount.transfer += 2;

    // Transfer 2: From manager to regular user
    const transfer2Sender = await prisma.transaction.create({
        data: {
            type: 'transfer',
            amount: -500,
            remark: 'Grading assistance',
            suspicious: false,
            userId: users.manager.id,
            createdBy: users.manager.id,
            relatedId: users.regularUsers[4].id, // Recipient ID
            createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        }
    });

    const transfer2Recipient = await prisma.transaction.create({
        data: {
            type: 'transfer',
            amount: 500,
            remark: 'Grading assistance',
            suspicious: false,
            userId: users.regularUsers[4].id,
            createdBy: users.manager.id,
            relatedId: users.manager.id, // Sender ID
            senderId: users.manager.id,
            createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        }
    });
    transactionCount.transfer += 2;

    // Create event transactions
    // Event 1: Award points to a specific guest
    const event1 = await prisma.transaction.create({
        data: {
            type: 'event',
            amount: 100,
            remark: 'Best presentation award',
            suspicious: false,
            userId: users.regularUsers[4].id, // Guest
            createdBy: users.cashier.id, // Organizer
            relatedId: events.pastEvent.id,
            eventId: events.pastEvent.id,
            createdAt: new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000), // Right after the event ended
        }
    });
    transactionCount.event++;

    // Event 2: Award points to another guest
    const event2 = await prisma.transaction.create({
        data: {
            type: 'event',
            amount: 150,
            remark: 'Participation award',
            suspicious: false,
            userId: users.regularUsers[3].id, // Guest
            createdBy: users.manager.id, // Organizer
            relatedId: events.pastEvent.id,
            eventId: events.pastEvent.id,
            createdAt: new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000), // Right after the event ended
        }
    });
    transactionCount.event++;

    // Update pointsAwarded in pastEvent
    await prisma.event.update({
        where: { id: events.pastEvent.id },
        data: {
            pointsAwarded: 250, // 100 + 150
            pointsRemain: 2750 // 3000 - 250
        }
    });

    // Create additional transactions to reach the minimum required
    // Additional purchase transactions
    for (let i = 0; i < 5; i++) {
        const purchaseAmount = 5 + i * 5; // 5, 10, 15, 20, 25
        const pointsEarned = Math.round(purchaseAmount * 100 / 25); // 20, 40, 60, 80, 100

        await prisma.transaction.create({
            data: {
                type: 'purchase',
                amount: pointsEarned,
                spent: purchaseAmount,
                remark: `Additional purchase ${i+1}`,
                suspicious: false,
                userId: users.regularUsers[i % 7].id,
                createdBy: users.cashier.id,
                createdAt: new Date(now.getTime() - (i+1) * 3 * 24 * 60 * 60 * 1000), // Spread out over time
            }
        });
        transactionCount.purchase++;
    }

    // Additional redemption transaction
    await prisma.transaction.create({
        data: {
            type: 'redemption',
            amount: -150,
            redeemed: 150,
            remark: 'Additional redemption',
            suspicious: false,
            userId: users.regularUsers[5].id,
            createdBy: users.regularUsers[5].id,
            processedBy: users.cashier.id,
            relatedId: users.cashier.id,
            createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
        }
    });
    transactionCount.redemption++;

    // Additional adjustment transaction
    await prisma.transaction.create({
        data: {
            type: 'adjustment',
            amount: 75,
            relatedId: purchase4.id,
            remark: 'Additional adjustment',
            suspicious: false,
            userId: users.regularUsers[3].id,
            createdBy: users.manager.id,
            createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        }
    });
    transactionCount.adjustment++;

    // Additional event transactions
    for (let i = 0; i < 6; i++) {
        const guestIndex = i % 4 + 2; // Use regularUsers[2] through regularUsers[5]

        await prisma.transaction.create({
            data: {
                type: 'event',
                amount: 100 + i * 50, // 100, 150, 200, 250, 300, 350
                remark: `Additional event award ${i+1}`,
                suspicious: false,
                userId: users.regularUsers[guestIndex].id,
                createdBy: i % 2 === 0 ? users.manager.id : users.cashier.id,
                relatedId: events.pastEvent.id,
                eventId: events.pastEvent.id,
                createdAt: new Date(now.getTime() - (28 - i) * 24 * 60 * 60 * 1000),
            }
        });
        transactionCount.event++;
    }

    // Additional transfer transactions
    for (let i = 0; i < 3; i++) {
        const senderIndex = i % 3; // 0, 1, 2
        const recipientIndex = (i + 3) % 7; // 3, 4, 5
        const amount = 100 + i * 50; // 100, 150, 200

        // Sender transaction
        await prisma.transaction.create({
            data: {
                type: 'transfer',
                amount: -amount,
                remark: `Additional transfer ${i+1}`,
                suspicious: false,
                userId: users.regularUsers[senderIndex].id,
                createdBy: users.regularUsers[senderIndex].id,
                relatedId: users.regularUsers[recipientIndex].id,
                createdAt: new Date(now.getTime() - (i+1) * 7 * 24 * 60 * 60 * 1000),
            }
        });

        // Recipient transaction
        await prisma.transaction.create({
            data: {
                type: 'transfer',
                amount: amount,
                remark: `Additional transfer ${i+1}`,
                suspicious: false,
                userId: users.regularUsers[recipientIndex].id,
                createdBy: users.regularUsers[senderIndex].id,
                relatedId: users.regularUsers[senderIndex].id,
                senderId: users.regularUsers[senderIndex].id,
                createdAt: new Date(now.getTime() - (i+1) * 7 * 24 * 60 * 60 * 1000),
            }
        });

        transactionCount.transfer += 2;
    }

    console.log('Created transactions:');
    console.log(`- Purchase: ${transactionCount.purchase}`);
    console.log(`- Adjustment: ${transactionCount.adjustment}`);
    console.log(`- Redemption: ${transactionCount.redemption}`);
    console.log(`- Transfer: ${transactionCount.transfer}`);
    console.log(`- Event: ${transactionCount.event}`);

    return transactionCount;
}