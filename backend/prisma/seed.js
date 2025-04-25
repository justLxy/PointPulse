// prisma/seed.js
'use strict';

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

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
        console.log(`Total users: ${3 + 2 + users.cashiers.length + users.regularUsers.length} (3 superusers, 2 managers, ${users.cashiers.length} cashiers, ${users.regularUsers.length} regular users)`);
        console.log(`Total events: ${events.upcomingEvents.length + events.pastEvents.length + events.unpublishedEvents.length} (${events.upcomingEvents.length} upcoming, ${events.pastEvents.length} past, ${events.unpublishedEvents.length} unpublished)`);
        console.log(`Total promotions: ${Object.keys(promotions).length}`);
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
    const defaultPassword = await bcrypt.hash('123', 10);
    const manager1Password = await bcrypt.hash('20961', 10);

    // Create superuser
    const superuser1 = await prisma.user.create({
        data: {
            utorid: 'lyuxuany',
            name: 'Xuanyi Lyu',
            email: 'xuanyi.lyu@mail.utoronto.ca',
            password: defaultPassword,
            role: 'superuser',
            points: 5000,
            verified: true,
            lastLogin: new Date(),
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        }
    });

    // Create second superuser
    const superuser2 = await prisma.user.create({
        data: {
            utorid: 'liyuxin1',
            name: 'Yuxin Li',
            email: 'lyx.li@mail.utoronto.ca',
            password: defaultPassword,
            role: 'superuser',
            points: 5000,
            verified: true,
            lastLogin: new Date(),
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        }
    });

    // Create third superuser
    const superuser3 = await prisma.user.create({
        data: {
            utorid: 'zhaokiko',
            name: 'Kiko Zhao',
            email: 'kiko.zhao@mail.utoronto.ca',
            password: defaultPassword,
            role: 'superuser',
            points: 5000,
            verified: true,
            lastLogin: new Date(),
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        }
    });

    // Create managers
    const managers = [];
    for (let i = 1; i <= 2; i++) {
        const manager = await prisma.user.create({
            data: {
                utorid: `manager${i}`,
                name: `Manager User ${i}`,
                email: `manager.user${i}@mail.utoronto.ca`,
                password: manager1Password, // All managers get the special password
                role: 'manager',
                points: 3000 + (i * 500),
                verified: true,
                lastLogin: new Date(),
                createdAt: new Date(Date.now() - (50 - i) * 24 * 60 * 60 * 1000), // Staggered creation dates
            }
        });
        managers.push(manager);
    }

    // Create cashiers
    const cashiers = [];
    for (let i = 1; i <= 2; i++) {
        const cashier = await prisma.user.create({
            data: {
                utorid: `cashier${i}`,
                name: `Cashier User ${i}`,
                email: `cashier.user${i}@mail.utoronto.ca`,
                password: defaultPassword,
                role: 'cashier',
                points: 2000 + (i * 200),
                verified: true,
                lastLogin: new Date(),
                createdAt: new Date(Date.now() - (40 - i * 2) * 24 * 60 * 60 * 1000), // Staggered creation dates
            }
        });
        cashiers.push(cashier);
    }

    // Create regular users (for a total of 50+ users)
    const regularUsers = [];

    for (let i = 1; i <= 45; i++) {
        // Format utorid to be exactly 8 characters
        const utorid = i < 10 ? `regular${i}` : `regula${i}`;
        
        const user = await prisma.user.create({
            data: {
                utorid, // Ensure 8-character utorid
                name: `Regular User ${i}`,
                email: `regular.user${i}@mail.utoronto.ca`,
                password: defaultPassword,
                role: 'regular',
                points: Math.floor(500 + Math.random() * 5000), // Random points between 500 and 5500
                verified: i <= 40, // First 40 users are verified
                lastLogin: i <= 42 ? new Date(Date.now() - i % 10 * 24 * 60 * 60 * 1000) : null, // Most users have logged in
                createdAt: new Date(Date.now() - (30 + i % 30) * 24 * 60 * 60 * 1000),
                birthday: i % 3 === 0 ? `199${i % 10}-0${(i % 12) + 1}-${(i % 28) + 1}` : null, // Some users have birthdays
            }
        });
        regularUsers.push(user);
    }

    console.log(`Created users: 3 superusers, ${managers.length} managers, ${cashiers.length} cashiers, ${regularUsers.length} regular users`);

    return {
        superusers: [superuser1, superuser2, superuser3],
        managers,
        cashiers,
        regularUsers
    };
}

async function createEvents(users) {
    const now = new Date();
    const eventLocations = [
        'Bahen Centre, Room 1080',
        'Sidney Smith Hall, Room 2118',
        'Hart House Great Hall',
        'Myhal Centre, Room 150',
        'Convocation Hall',
        'Robarts Library, Room 4049',
        'Medical Sciences Building, Room 2170',
        'OISE Auditorium',
        'Fields Institute',
        'University College, Room 140'
    ];
    
    const eventNames = [
        'CS Hackathon',
        'Career Fair',
        'Year End Party',
        'Research Day',
        'Alumni Mixer',
        'Tech Talks',
        'Game Dev Workshop',
        'Data Sci Comp',
        'AI Ethics Panel',
        'Startup Pitch',
        'Prog Contest',
        'Web Dev Camp',
        'Blockchain Conf',
        'OSS Contrib Day',
        'WiT Meetup',
        'App Challenge',
        'Cyber Workshop',
        'UofT Tech Expo',
        'Orientation',
        'Semester Party'
    ];

    // Create 20 upcoming events
    const upcomingEvents = [];
    for (let i = 0; i < 20; i++) {
        const daysInFuture = 1 + i + Math.floor(Math.random() * 60); // Between 1 and 60 days in the future
        const eventDuration = 1 + Math.floor(Math.random() * 2); // 1-3 days
        const name = `${eventNames[i % eventNames.length]} ${Math.floor(i / eventNames.length) + 1}`;
        
        // Add random hours to start and end times
        const startHour = Math.floor(Math.random() * 12) + 9; // Random hour between 9 AM and 8 PM
        const startTime = new Date(now.getTime() + daysInFuture * 24 * 60 * 60 * 1000);
        startTime.setHours(startHour, 0, 0, 0); // Set specific hour, reset minutes/seconds
        
        const eventLengthHours = Math.floor(Math.random() * 4) + 2; // 2-5 hours for event length
        const endTime = new Date(now.getTime() + (daysInFuture + eventDuration) * 24 * 60 * 60 * 1000);
        endTime.setHours(startHour + eventLengthHours, 0, 0, 0); // End time is start time + event length
        
        const upcomingEvent = await prisma.event.create({
            data: {
                name,
                description: `Join us for ${name}, where students can engage with industry professionals and academic experts.`,
                location: eventLocations[i % eventLocations.length],
                startTime,
                endTime,
                capacity: 50 + i * 10,
                pointsRemain: 2000 + i * 500,
                pointsAwarded: 0,
                published: true,
                organizers: {
                    connect: [
                        { id: users.managers[i % users.managers.length].id },
                        { id: users.regularUsers[i % 5].id } // Some regular users are also organizers
                    ]
                },
                guests: {
                    connect: users.regularUsers
                        .slice(5, 5 + (5 + i % 20))
                        .map(user => ({ id: user.id }))
                }
            }
        });
        upcomingEvents.push(upcomingEvent);
    }

    // Create 20 past events
    const pastEvents = [];
    for (let i = 0; i < 20; i++) {
        const daysInPast = 5 + i + Math.floor(Math.random() * 90); // Between 5 and 90 days in the past
        const eventDuration = 1 + Math.floor(Math.random() * 2); // 1-3 days
        const name = `Past ${eventNames[i % eventNames.length]} ${Math.floor(i / eventNames.length) + 1}`;
        const pointsAwarded = 500 + i * 200;
        const totalPoints = 2000 + i * 500;
        
        // Add random hours to start and end times
        const startHour = Math.floor(Math.random() * 12) + 9; // Random hour between 9 AM and 8 PM
        const startTime = new Date(now.getTime() - daysInPast * 24 * 60 * 60 * 1000);
        startTime.setHours(startHour, 0, 0, 0); // Set specific hour, reset minutes/seconds
        
        const eventLengthHours = Math.floor(Math.random() * 4) + 2; // 2-5 hours for event length
        const endTime = new Date(now.getTime() - (daysInPast - eventDuration) * 24 * 60 * 60 * 1000);
        endTime.setHours(startHour + eventLengthHours, 0, 0, 0); // End time is start time + event length
        
        const pastEvent = await prisma.event.create({
            data: {
                name,
                description: `This event featured presentations, networking, and opportunities for professional development.`,
                location: eventLocations[(i + 5) % eventLocations.length],
                startTime,
                endTime,
                capacity: 50 + i * 10,
                pointsRemain: totalPoints - pointsAwarded,
                pointsAwarded,
                published: true,
                organizers: {
                    connect: [
                        { id: users.managers[i % users.managers.length].id },
                        { id: users.cashiers[i % users.cashiers.length].id }
                    ]
                },
                guests: {
                    connect: users.regularUsers
                        .slice(10, 10 + (10 + i % 15))
                        .map(user => ({ id: user.id }))
                }
            }
        });
        pastEvents.push(pastEvent);
    }

    // Create 10 unpublished events
    const unpublishedEvents = [];
    for (let i = 0; i < 10; i++) {
        const daysInFuture = 30 + i * 5 + Math.floor(Math.random() * 60); // Between 30 and 90 days in the future
        const eventDuration = 1 + Math.floor(Math.random() * 2); // 1-3 days
        const name = `Upcoming ${eventNames[(i + 10) % eventNames.length]} ${Math.floor(i / eventNames.length) + 1}`;
        
        // Add random hours to start and end times
        const startHour = Math.floor(Math.random() * 12) + 9; // Random hour between 9 AM and 8 PM
        const startTime = new Date(now.getTime() + daysInFuture * 24 * 60 * 60 * 1000);
        startTime.setHours(startHour, 0, 0, 0); // Set specific hour, reset minutes/seconds
        
        const eventLengthHours = Math.floor(Math.random() * 4) + 2; // 2-5 hours for event length
        const endTime = new Date(now.getTime() + (daysInFuture + eventDuration) * 24 * 60 * 60 * 1000);
        endTime.setHours(startHour + eventLengthHours, 0, 0, 0); // End time is start time + event length
        
        const unpublishedEvent = await prisma.event.create({
            data: {
                name,
                description: `Planning is underway for this exciting event. Stay tuned for more details.`,
                location: eventLocations[(i + 2) % eventLocations.length],
                startTime,
                endTime,
                capacity: 100 + i * 20,
                pointsRemain: 5000 + i * 1000,
                pointsAwarded: 0,
                published: false,
                organizers: {
                    connect: [
                        { id: users.managers[i % users.managers.length].id }
                    ]
                }
            }
        });
        unpublishedEvents.push(unpublishedEvent);
    }

    console.log(`Created events: ${upcomingEvents.length} upcoming, ${pastEvents.length} past, ${unpublishedEvents.length} unpublished`);

    return {
        upcomingEvents,
        pastEvents,
        unpublishedEvents
    };
}

async function createPromotions() {
    const now = new Date();
    const promotionTypes = ['automatic', 'one-time'];
    const promotionNames = [
        'Double Points Weekend',
        'Welcome Bonus',
        'Holiday Special',
        'Spring Break Special',
        'Summer Discount',
        'Fall Semester Kickoff',
        'Winter Study Break Bonus',
        'New User Bonus',
        'Referral Reward',
        'Course Material Discount',
        'Lunch Special',
        'Coffee Break Deal',
        'Midnight Snack Bonus',
        'Weekend Special',
        'Loyal Customer Reward'
    ];

    const promotions = {};

    // Create 5 active promotions
    for (let i = 0; i < 5; i++) {
        const type = promotionTypes[i % 2];
        const name = `Active ${promotionNames[i]}`;
        
        const promotion = await prisma.promotion.create({
            data: {
                name,
                description: `${name}: Earn extra points on qualifying purchases.`,
                type,
                startTime: new Date(now.getTime() - (10 + i) * 24 * 60 * 60 * 1000), // Started in the past
                endTime: new Date(now.getTime() + (10 + i) * 24 * 60 * 60 * 1000), // Ends in the future
                minSpending: type === 'automatic' ? 5.00 + i * 5 : 10.00 + i * 5,
                rate: type === 'automatic' ? (0.02 + i * 0.01) : null,
                points: type === 'one-time' ? (300 + i * 100) : null
            }
        });
        
        promotions[`activePromotion${i+1}`] = promotion;
    }

    // Create 3 upcoming promotions
    for (let i = 0; i < 3; i++) {
        const type = promotionTypes[(i + 1) % 2];
        const name = `Upcoming ${promotionNames[i + 5]}`;
        
        const promotion = await prisma.promotion.create({
            data: {
                name,
                description: `${name}: Coming soon! Get ready for great rewards.`,
                type,
                startTime: new Date(now.getTime() + (5 + i * 10) * 24 * 60 * 60 * 1000), // Starts in the future
                endTime: new Date(now.getTime() + (20 + i * 10) * 24 * 60 * 60 * 1000), // Ends further in the future
                minSpending: type === 'automatic' ? null : 15.00 + i * 5,
                rate: type === 'automatic' ? (0.04 + i * 0.02) : null,
                points: type === 'one-time' ? (500 + i * 100) : null
            }
        });
        
        promotions[`upcomingPromotion${i+1}`] = promotion;
    }

    // Create 3 past promotions
    for (let i = 0; i < 3; i++) {
        const type = promotionTypes[i % 2];
        const name = `Past ${promotionNames[i + 8]}`;
        
        const promotion = await prisma.promotion.create({
            data: {
                name,
                description: `${name}: This promotion has ended.`,
                type,
                startTime: new Date(now.getTime() - (60 + i * 10) * 24 * 60 * 60 * 1000), // Started in the past
                endTime: new Date(now.getTime() - (30 + i * 10) * 24 * 60 * 60 * 1000), // Ended in the past
                minSpending: 5.00 + i * 2.50,
                rate: type === 'automatic' ? (0.03 + i * 0.01) : null,
                points: type === 'one-time' ? (200 + i * 50) : null
            }
        });
        
        promotions[`pastPromotion${i+1}`] = promotion;
    }

    console.log(`Created promotions: 5 active, 3 upcoming, 3 past`);

    return promotions;
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

    // Helper function to choose random users
    const getRandomUser = (usersArray, exclude = []) => {
        const filteredUsers = usersArray.filter(user => !exclude.includes(user.id));
        return filteredUsers[Math.floor(Math.random() * filteredUsers.length)];
    };
    
    // Helper function to choose random promotions
    const getRandomActivePromotions = (count = 1) => {
        const activePromotions = [
            promotions.activePromotion1,
            promotions.activePromotion2,
            promotions.activePromotion3,
            promotions.activePromotion4,
            promotions.activePromotion5
        ];
        
        // Shuffle array and take the first n elements
        return activePromotions
            .sort(() => 0.5 - Math.random())
            .slice(0, Math.min(count, activePromotions.length));
    };

    // Create purchase transactions (at least 20)
    for (let i = 0; i < 25; i++) {
        const user = i < 20 
            ? users.regularUsers[i] 
            : getRandomUser([...users.regularUsers, ...users.managers, ...users.cashiers]);
        const cashier = users.cashiers[i % users.cashiers.length];
        
        const appliedPromotions = i % 4 === 0 
            ? getRandomActivePromotions(1 + Math.floor(Math.random() * 2))
            : [];
        
        const spent = 5 + Math.floor(Math.random() * 50); // $5 to $55
        let basePoints = Math.round(spent * 100 / 25); // 1 point per $0.25
        
        // Calculate additional points from promotions
        let promotionPoints = 0;
        if (appliedPromotions.length > 0) {
            for (const promo of appliedPromotions) {
                if (promo.type === 'automatic' && promo.rate && spent >= (promo.minSpending || 0)) {
                    promotionPoints += Math.round(spent * 100 * promo.rate);
                } else if (promo.type === 'one-time' && promo.points && spent >= (promo.minSpending || 0)) {
                    promotionPoints += promo.points;
                }
            }
        }
        
        const totalPoints = basePoints + promotionPoints;
        const suspicious = i % 15 === 0; // Some transactions are suspicious
        
        const purchase = await prisma.transaction.create({
            data: {
                type: 'purchase',
                amount: totalPoints,
                spent,
                remark: `Purchase #${i+1} - ${suspicious ? 'Flagged for verification' : 'Standard purchase'}`,
                suspicious,
                userId: user.id,
                createdBy: cashier.id,
                createdAt: new Date(now.getTime() - (i % 60) * 24 * 60 * 60 * 1000), // Spread out over time
                promotions: appliedPromotions.length > 0 ? {
                    create: appliedPromotions.map(promo => ({
                        promotion: {
                            connect: { id: promo.id }
                        }
                    }))
                } : undefined
            }
        });
        
        // If one-time promotion is used, mark it as used by the user
        for (const promo of appliedPromotions) {
            if (promo.type === 'one-time') {
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        usedPromotions: {
                            connect: { id: promo.id }
                        }
                    }
                });
            }
        }
        
        transactionCount.purchase++;
    }

    // Create adjustment transactions (at least 10)
    // First, get all purchase transactions
    const purchaseTransactions = await prisma.transaction.findMany({
        where: { type: 'purchase' },
        orderBy: { id: 'asc' }
    });
    
    console.log(`Found ${purchaseTransactions.length} purchase transactions for adjustments`);
    
    // Create adjustments for some of the purchase transactions
    const adjustmentsToCreate = Math.min(15, purchaseTransactions.length);
    for (let i = 0; i < adjustmentsToCreate; i++) {
        const purchaseTransaction = purchaseTransactions[i];
        const manager = users.managers[i % users.managers.length];
        const adjustmentAmount = (i % 3 === 0) 
            ? -Math.round(purchaseTransaction.amount * 0.2) // Negative adjustment (20% reduction)
            : Math.round(purchaseTransaction.amount * 0.1); // Positive adjustment (10% addition)
        
        try {
            await prisma.transaction.create({
                data: {
                    type: 'adjustment',
                    amount: adjustmentAmount,
                    relatedId: purchaseTransaction.id,
                    remark: adjustmentAmount > 0 ? 'Bonus adjustment' : 'Correction adjustment',
                    suspicious: false,
                    userId: purchaseTransaction.userId,
                    createdBy: manager.id,
                    createdAt: new Date(purchaseTransaction.createdAt.getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day after purchase
                }
            });
            
            transactionCount.adjustment++;
            console.log(`Created adjustment transaction for purchase #${purchaseTransaction.id}: ${adjustmentAmount} points`);
        } catch (error) {
            console.error(`Error creating adjustment transaction for purchase #${purchaseTransaction.id}:`, error.message);
        }
    }

    // Create redemption transactions (at least 10)
    for (let i = 0; i < 15; i++) {
        const user = users.regularUsers[i % users.regularUsers.length];
        const pointsToRedeem = 100 + i * 50; // 100 to 850 points
        const processed = i % 3 !== 0; // Some redemptions are not processed yet
        const cashier = processed ? users.cashiers[i % users.cashiers.length] : null;
        
        await prisma.transaction.create({
            data: {
                type: 'redemption',
                amount: -pointsToRedeem,
                redeemed: pointsToRedeem,
                remark: `Redemption #${i+1} - ${processed ? 'Processed' : 'Pending'}`,
                suspicious: false,
                userId: user.id,
                createdBy: user.id,
                processedBy: cashier?.id || null,
                relatedId: cashier?.id || null, // Store processedBy as relatedId
                createdAt: new Date(now.getTime() - (i % 30) * 24 * 60 * 60 * 1000),
            }
        });
        
        transactionCount.redemption++;
    }

    // Create transfer transactions (at least 10, which is 20 transactions total due to sender/receiver pairs)
    for (let i = 0; i < 10; i++) {
        const senderIndex = i % users.regularUsers.length;
        const sender = users.regularUsers[senderIndex];
        const receiver = getRandomUser(users.regularUsers, [sender.id]);
        const amount = 50 + i * 25; // 50 to 275 points
        const remark = `Transfer #${i+1} - Points transfer`;
        
        // Sender transaction
        const senderTx = await prisma.transaction.create({
            data: {
                type: 'transfer',
                amount: -amount,
                remark,
                suspicious: false,
                userId: sender.id,
                createdBy: sender.id,
                relatedId: receiver.id, // Recipient ID
                createdAt: new Date(now.getTime() - (i*3) * 24 * 60 * 60 * 1000),
            }
        });

        // Recipient transaction
        const receiverTx = await prisma.transaction.create({
            data: {
                type: 'transfer',
                amount: amount,
                remark,
                suspicious: false,
                userId: receiver.id,
                createdBy: sender.id,
                relatedId: sender.id, // Sender ID
                senderId: sender.id,
                createdAt: new Date(now.getTime() - (i*3) * 24 * 60 * 60 * 1000),
            }
        });
        
        transactionCount.transfer += 2;
    }

    // Create event transactions from past events (at least 10)
    for (let i = 0; i < events.pastEvents.length; i++) {
        const event = events.pastEvents[i];
        
        // Get all guests for this event
        const eventGuests = await prisma.user.findMany({
            where: {
                attendedEvents: {
                    some: {
                        id: event.id
                    }
                }
            }
        });
        
        // Award points to up to 3 guests per event
        const numGuests = Math.min(3, eventGuests.length);
        for (let j = 0; j < numGuests; j++) {
            const guest = eventGuests[j];
            const organizer = (await prisma.user.findMany({
                where: {
                    organizedEvents: {
                        some: {
                            id: event.id
                        }
                    }
                }
            }))[0];
            
            if (guest && organizer) {
                const pointAmount = 50 + Math.floor(Math.random() * 200); // 50 to 250 points
                
                await prisma.transaction.create({
                    data: {
                        type: 'event',
                        amount: pointAmount,
                        remark: `Event award for ${event.name}`,
                        suspicious: false,
                        userId: guest.id,
                        createdBy: organizer.id,
                        relatedId: event.id,
                        eventId: event.id,
                        createdAt: new Date(event.endTime.getTime() + 4 * 60 * 60 * 1000), // 4 hours after event
                    }
                });
                
                transactionCount.event++;
            }
        }
    }

    console.log('Created transactions:');
    console.log(`- Purchase: ${transactionCount.purchase}`);
    console.log(`- Adjustment: ${transactionCount.adjustment}`);
    console.log(`- Redemption: ${transactionCount.redemption}`);
    console.log(`- Transfer: ${transactionCount.transfer}`);
    console.log(`- Event: ${transactionCount.event}`);

    return transactionCount;
}