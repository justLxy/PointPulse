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
        console.log(`Total events: ${events.upcomingEvents.length + events.ongoingEvents.length + events.pastEvents.length + events.unpublishedEvents.length} (${events.upcomingEvents.length} upcoming, ${events.ongoingEvents.length} ongoing, ${events.pastEvents.length} past, ${events.unpublishedEvents.length} unpublished)`);
        console.log(`Total promotions: ${Object.keys(promotions).length}`);
        console.log(`Total transactions: ${Object.values(transactionCount).reduce((a, b) => a + b, 0)}`);
        console.log(`- Purchase: ${transactionCount.purchase}`);
        console.log(`- Adjustment: ${transactionCount.adjustment}`);
        console.log(`- Redemption: ${transactionCount.redemption}`);
        console.log(`- Transfer: ${transactionCount.transfer}`);
        console.log(`- Event: ${transactionCount.event}`);

        // Attendance summary
        const attendanceTotal = await prisma.eventAttendance.count();
        console.log(`Total attendances recorded: ${attendanceTotal}`);
    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

async function clearData() {
    // New: clear attendance before events/users (composite FK)
    await prisma.eventAttendance?.deleteMany({});

    await prisma.promotionTransaction.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.promotion.deleteMany({});
    await prisma.event.deleteMany({});
    await prisma.user.deleteMany({});
}

async function createUsers() {
    const defaultPassword = await bcrypt.hash('123', 10);
    const manager1Password = await bcrypt.hash('20961', 10);
    
    // Avatar URL collections for users
    const avatarUrls = [
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&h=150&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&h=150&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&h=150&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150&h=150&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=150&h=150&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=150&h=150&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&h=150&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&h=150&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=150&h=150&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&h=150&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&h=150&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&h=150&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=150&h=150&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&h=150&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=150&h=150&auto=format&fit=crop",
    ];

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
            avatarUrl: avatarUrls[0]
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
            avatarUrl: avatarUrls[1]
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
            avatarUrl: avatarUrls[2]
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
                avatarUrl: avatarUrls[2 + i]
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
                avatarUrl: avatarUrls[4 + i]
            }
        });
        cashiers.push(cashier);
    }

    // Create regular users (for a total of 50+ users)
    const regularUsers = [];

    for (let i = 1; i <= 45; i++) {
        // Format utorid to be exactly 8 characters
        const utorid = i < 10 ? `regular${i}` : `regula${i}`;
        
        // Add avatar to ~80% of regular users
        const shouldHaveAvatar = Math.random() < 0.8;
        const avatarUrl = shouldHaveAvatar ? avatarUrls[i % avatarUrls.length] : null;
        
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
                avatarUrl
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

    // Create 5 ongoing events (started in the past, ends in the future)
    const ongoingEvents = [];
    for (let i = 0; i < 5; i++) {
        const hoursInPast = 2 + Math.floor(Math.random() * 10); // Started 2-12 hours ago
        const daysInFuture = 3 + Math.floor(Math.random() * 4); // Ends 3-7 days in the future
        const name = `Ongoing ${eventNames[i]} ${Math.floor(i / eventNames.length) + 1}`;
        
        // Create start time in the past (today, but few hours ago)
        const startTime = new Date(now.getTime() - hoursInPast * 60 * 60 * 1000);
        
        // Create end time in the future (several days from now)
        const endTime = new Date(now.getTime() + daysInFuture * 24 * 60 * 60 * 1000);
        
        const ongoingEvent = await prisma.event.create({
            data: {
                name,
                description: `This event is currently in progress! ${name} features interactive sessions and networking opportunities over multiple days.`,
                location: eventLocations[(i + 7) % eventLocations.length],
                startTime,
                endTime,
                capacity: 80 + i * 15,
                pointsRemain: 3000 + i * 500,
                pointsAwarded: 200 * i,
                published: true,
                organizers: {
                    connect: [
                        { id: users.managers[i % users.managers.length].id },
                        { id: users.regularUsers[(i + 15) % users.regularUsers.length].id }
                    ]
                },
                guests: {
                    connect: users.regularUsers
                        .slice(20, 20 + (5 + i * 3))
                        .map(user => ({ id: user.id }))
                }
            }
        });
        
        // Mark ~40% of guests as checked in for these ongoing events
        const guestIdsForAttendance = users.regularUsers
            .slice(20, 20 + (5 + i * 3))
            .filter(() => Math.random() < 0.4)
            .map(user => user.id);

        if (guestIdsForAttendance.length) {
            await prisma.eventAttendance.createMany({
                data: guestIdsForAttendance.map(uid => ({
                    eventId: ongoingEvent.id,
                    userId: uid,
                    checkedInAt: new Date(startTime.getTime() + 30 * 60 * 1000) // 30 minutes after start
                }))
            });
        }
        
        ongoingEvents.push(ongoingEvent);
    }

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

        // For past events, assume ~70% of guests attended
        const pastGuestIds = users.regularUsers
            .slice(10, 10 + (10 + i % 15))
            .filter(() => Math.random() < 0.7)
            .map(user => user.id);

        if (pastGuestIds.length) {
            await prisma.eventAttendance.createMany({
                data: pastGuestIds.map(uid => ({
                    eventId: pastEvent.id,
                    userId: uid,
                    checkedInAt: new Date(pastEvent.startTime.getTime() + 30 * 60 * 1000)
                }))
            });
        }

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

    console.log(`Created events: ${upcomingEvents.length} upcoming, ${ongoingEvents.length} ongoing, ${pastEvents.length} past, ${unpublishedEvents.length} unpublished`);

    return {
        upcomingEvents,
        ongoingEvents,
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

    // Create future transactions specifically for lyuxuany for testing purposes
    console.log('Creating future transactions for lyuxuany (testing purposes)...');
    const lyuxuanyUser = await prisma.user.findUnique({
        where: { utorid: 'lyuxuany' }
    });
    
    if (lyuxuanyUser) {
        const cashier = users.cashiers[0]; // Use first cashier for future transactions
        
        // Create transactions for different future dates to test tier upgrade/downgrade scenarios
        const futureTransactions = [
            // === 2025 cycle (Sept 2024 - Aug 2025): ULTRA HIGH SPENDING = DIAMOND TIER ===
            { date: new Date('2024-10-15'), spent: 1000, points: 4000, remark: 'Big purchase - Diamond tier earning' },
            { date: new Date('2024-12-20'), spent: 800, points: 3200, remark: 'Holiday shopping - Diamond tier earning' },
            { date: new Date('2025-02-14'), spent: 1200, points: 4800, remark: 'Valentine splurge - Diamond tier earning' },
            { date: new Date('2025-05-10'), spent: 900, points: 3600, remark: 'Spring purchase - Diamond tier earning' },
            { date: new Date('2025-07-20'), spent: 1500, points: 6000, remark: 'Summer vacation - Diamond tier earning' },
            // Total 2025 cycle: 21,600 points = DIAMOND tier (20000+)
            
            // === 2026 cycle (Sept 2025 - Aug 2026): NO SPENDING = 0 POINTS (but carried over from Diamond) ===
            // No transactions in this cycle - testing pure Diamond carryover with zero earned points
            // Total 2026 cycle: 0 points = BRONZE tier (but should carry over DIAMOND from 2025)
            
            // === 2027 cycle (Sept 2026 - Aug 2027): MEDIUM SPENDING = GOLD TIER ===
            { date: new Date('2026-10-05'), spent: 300, points: 1200, remark: 'Fall purchase - building to Gold' },
            { date: new Date('2027-01-15'), spent: 400, points: 1600, remark: 'New year purchase - Gold tier earning' },
            { date: new Date('2027-04-20'), spent: 500, points: 2000, remark: 'Spring purchase - Gold tier earning' },
            { date: new Date('2027-07-30'), spent: 300, points: 1200, remark: 'Summer purchase - Gold tier earning' },
            // Total 2027 cycle: 6,000 points = GOLD tier (5000-9999)
            
            // === 2028 cycle (Sept 2027 - Aug 2028): VERY LOW SPENDING = BRONZE TIER (real downgrade) ===
            { date: new Date('2028-01-08'), spent: 50, points: 200, remark: 'New year small purchase - downgrade scenario' },
            { date: new Date('2028-05-12'), spent: 75, points: 300, remark: 'Small purchase - true Bronze tier' },
            // Total 2028 cycle: 500 points = BRONZE tier (真正降级到Bronze)
            
            // === 2029 cycle (Sept 2028 - Aug 2029): RECOVERY TO PLATINUM ===
            { date: new Date('2028-11-10'), spent: 600, points: 2400, remark: 'Recovery spending - back to Platinum' },
            { date: new Date('2029-02-15'), spent: 800, points: 3200, remark: 'Big purchase - Platinum tier' },
            { date: new Date('2029-05-20'), spent: 700, points: 2800, remark: 'Spring splurge - Platinum tier' },
            { date: new Date('2029-08-10'), spent: 400, points: 1600, remark: 'Summer purchase - Platinum tier' },
            // Total 2029 cycle: 10,000 points = PLATINUM tier (10000-19999)
        ];
        
        for (const [index, txData] of futureTransactions.entries()) {
            await prisma.transaction.create({
                data: {
                    type: 'purchase',
                    amount: txData.points,
                    spent: txData.spent,
                    remark: txData.remark || `Future test transaction #${index + 1} for tier testing`,
                    suspicious: false,
                    userId: lyuxuanyUser.id,
                    createdBy: cashier.id,
                    createdAt: txData.date,
                }
            });
            
            transactionCount.purchase++;
        }
        
        console.log(`Created ${futureTransactions.length} future transactions for lyuxuany`);
    }

    console.log('Created transactions:');
    console.log(`- Purchase: ${transactionCount.purchase}`);
    console.log(`- Adjustment: ${transactionCount.adjustment}`);
    console.log(`- Redemption: ${transactionCount.redemption}`);
    console.log(`- Transfer: ${transactionCount.transfer}`);
    console.log(`- Event: ${transactionCount.event}`);

    return transactionCount;
}