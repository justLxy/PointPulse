'use strict';

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { validateUTORid, validateEmail, validatePassword } = require('../utils/validators');

const prisma = new PrismaClient();

/**
 * Create a new user
 */
const createUser = async (userData, creatorId) => {
    const { utorid, name, email } = userData;

    // Validate input
    if (!validateUTORid(utorid)) {
        throw new Error('UTORid must be 8 alphanumeric characters');
    }

    if (!name || name.length < 1 || name.length > 50) {
        throw new Error('Name must be between 1 and 50 characters');
    }

    if (!validateEmail(email)) {
        throw new Error('Email must be a valid University of Toronto email');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { utorid },
                { email }
            ]
        }
    });

    if (existingUser) {
        throw new Error('A user with this UTORid or email already exists');
    }

    // Generate reset token for account activation
    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create the user
    const user = await prisma.user.create({
        data: {
            utorid,
            name,
            email,
            resetToken,
            expiresAt,
            role: 'regular',
            points: 0,
            verified: false,
        }
    });

    return {
        id: user.id,
        utorid: user.utorid,
        name: user.name,
        email: user.email,
        verified: user.verified,
        expiresAt: user.expiresAt,
        resetToken: user.resetToken
    };
};

/**
 * Get all users with filtering and pagination
 */
const getUsers = async (filters = {}, page = 1, limit = 10) => {
    const { name, role, verified, activated } = filters;

    let parsedPage = parseInt(page);
    let parsedLimit = parseInt(limit);

    if (isNaN(parsedPage) || parsedPage < 1) {
        throw new Error('Invalid page number');
    }

    if (isNaN(parsedLimit) || parsedLimit < 1) {
        throw new Error('Invalid limit number');
    }

    // Build where clause
    const where = {};

    if (name) {
        where.OR = [
            { utorid: { contains: name } },
            { name: { contains: name } }
        ];
    }

    if (role) {
        where.role = role;
    }

    if (verified !== undefined) {
        where.verified = verified === 'true';
    }

    if (activated !== undefined) {
        if (activated === 'true') {
            where.lastLogin = { not: null };
        } else {
            where.lastLogin = null;
        }
    }

    // Calculate pagination
    const skip = (parsedPage - 1) * parsedLimit;

    // Get total count
    const count = await prisma.user.count({ where });

    // Get users
    const users = await prisma.user.findMany({
        where,
        skip,
        take: parsedLimit,
        select: {
            id: true,
            utorid: true,
            name: true,
            email: true,
            birthday: true,
            role: true,
            points: true,
            createdAt: true,
            lastLogin: true,
            verified: true,
            avatarUrl: true
        },
        orderBy: {
            id: 'asc'
        }
    });

    return { count, results: users };
};

/**
 * Get user by ID with limited fields (cashier view)
 */
const getUserByCashier = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        select: {
            id: true,
            utorid: true,
            name: true,
            points: true,
            verified: true
        }
    });

    if (!user) {
        throw new Error('User not found');
    }

    // Get unused one-time promotions for this user
    const promotions = await prisma.promotion.findMany({
        where: {
            type: 'one-time',
            startTime: { lte: new Date() },
            endTime: { gte: new Date() },
            NOT: {
                users: {
                    some: {
                        id: parseInt(userId)
                    }
                }
            }
        },
        select: {
            id: true,
            name: true,
            minSpending: true,
            rate: true,
            points: true
        }
    });

    return { ...user, promotions };
};

/**
 * Get user by ID with all fields (manager view)
 */
const getUserByManager = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        select: {
            id: true,
            utorid: true,
            name: true,
            email: true,
            birthday: true,
            role: true,
            points: true,
            createdAt: true,
            lastLogin: true,
            verified: true,
            avatarUrl: true
        }
    });

    if (!user) {
        throw new Error('User not found');
    }

    // Get unused one-time promotions for this user (same as cashier view)
    const promotions = await prisma.promotion.findMany({
        where: {
            type: 'one-time',
            startTime: { lte: new Date() },
            endTime: { gte: new Date() },
            NOT: {
                users: {
                    some: {
                        id: parseInt(userId)
                    }
                }
            }
        },
        select: {
            id: true,
            name: true,
            minSpending: true,
            rate: true,
            points: true
        }
    });

    return { ...user, promotions };
};

/**
 * Get current user profile
 */
const getCurrentUser = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            utorid: true,
            name: true,
            email: true,
            birthday: true,
            role: true,
            points: true,
            createdAt: true,
            lastLogin: true,
            verified: true,
            avatarUrl: true
        }
    });

    if (!user) {
        throw new Error('User not found');
    }

    // Ensure verified is a boolean
    user.verified = Boolean(user.verified);

    // Get available promotions for this user
    const promotions = await prisma.promotion.findMany({
        where: {
            type: 'one-time',
            startTime: { lte: new Date() },
            endTime: { gte: new Date() },
            NOT: {
                users: {
                    some: {
                        id: userId
                    }
                }
            }
        },
        select: {
            id: true,
            name: true,
            minSpending: true,
            rate: true,
            points: true
        }
    });

    return { ...user, promotions };
};

/**
 * Update user status by manager
 */
const updateUserByManager = async (userId, updateData) => {
    console.log('===== UPDATE USER BY MANAGER DEBUG =====');
    console.log('userId:', userId);
    console.log('updateData:', JSON.stringify(updateData, null, 2));
    
    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
        console.log('No fields provided for update');
        throw new Error('No fields provided for update');
    }

    const { email, verified, suspicious, role } = updateData;
    console.log('Extracted fields:', { email, verified, suspicious, role });
    
    const userData = {};

    if (role !== undefined) {
        // 转换为小写进行验证，确保不区分大小写
        const roleLower = role.toLowerCase();
        console.log('Role after lowercase:', roleLower);
        
        if (!['cashier', 'regular'].includes(roleLower)) {
            console.log('Invalid role:', roleLower);
            throw new Error('Role must be either "cashier" or "regular"');
        }
        userData.role = roleLower;
        console.log('Role set to:', userData.role);
    }

    if (email !== undefined) {
        console.log('Validating email:', email);
        if (!validateEmail(email)) {
            console.log('Invalid email format');
            throw new Error('Email must be a valid University of Toronto email');
        }

        // Check if email already exists for another user
        console.log('Checking if email exists for another user');
        try {
            const existingUser = await prisma.user.findFirst({
                where: {
                    email,
                    NOT: {
                        id: parseInt(userId)
                    }
                }
            });
            console.log('Existing user with same email:', existingUser);

            if (existingUser) {
                console.log('Email already in use');
                throw new Error('Email already in use by another user');
            }

            userData.email = email;
            console.log('Email set to:', userData.email);
        } catch (error) {
            console.log('Error checking existing email:', error);
            throw new Error('Failed to validate email: ' + error.message);
        }
    }

    if (verified !== undefined) {
        // 接受布尔值或字符串 'true'，确保只能设置为true
        if (verified !== true && verified !== 'true') {
            console.log('Invalid verified value - must be true');
            throw new Error('Verified must be true');
        }
        userData.verified = true;
        console.log('Verified set to:', userData.verified);
    }

    if (suspicious !== undefined) {
        // 接受布尔值或字符串 'true'/'false'
        if (typeof suspicious !== 'boolean' && suspicious !== 'true' && suspicious !== 'false') {
            console.log('Invalid suspicious value - must be boolean or string "true"/"false"');
            throw new Error('Suspicious must be a boolean or string "true"/"false"');
        }
        userData.suspicious = suspicious === true || suspicious === 'true';
        console.log('Suspicious set to:', userData.suspicious);
    }

    console.log('Final userData for update:', userData);
    console.log('Updating user with ID:', parseInt(userId));
    
    try {
        console.log('Calling prisma.user.update with:', {
            where: { id: parseInt(userId) },
            data: userData
        });
        const user = await prisma.user.update({
            where: { id: parseInt(userId) },
            data: userData
        });
        console.log('User updated successfully:', JSON.stringify(user, null, 2));

        // Build the response object with only the updated fields (plus id, utorid, name)
        const response = {
            id: user.id,
            utorid: user.utorid,
            name: user.name
        };

        if (email !== undefined) {
            response.email = user.email;
            console.log('Added email to response:', user.email);
        }
        if (verified !== undefined) {
            response.verified = user.verified;
            console.log('Added verified to response:', user.verified);
        }
        if (suspicious !== undefined) {
            response.suspicious = user.suspicious;
            console.log('Added suspicious to response:', user.suspicious);
        }
        if (role !== undefined) {
            response.role = user.role;
            console.log('Added role to response:', user.role);
        }

        console.log('Final response object:', JSON.stringify(response, null, 2));
        return response;
    } catch (error) {
        console.log('Error updating user:', error.message);
        console.log('Error stack:', error.stack);
        throw error;
    }
};

/**
 * Update user role by superuser
 */
const updateUserRoleBySuperuser = async (userId, role) => {
    console.log('===== UPDATE USER ROLE BY SUPERUSER DEBUG =====');
    console.log('userId:', userId);
    console.log('role:', role);
    
    // 转换为小写进行验证，确保不区分大小写
    const roleLower = role.toLowerCase();
    console.log('Role after lowercase:', roleLower);
    
    if (!['regular', 'cashier', 'manager', 'superuser'].includes(roleLower)) {
        console.log('Invalid role:', roleLower);
        throw new Error('Invalid role');
    }

    try {
        console.log('Calling prisma.user.update with:', {
            where: { id: parseInt(userId) },
            data: { role: roleLower }
        });
        
        const user = await prisma.user.update({
            where: { id: parseInt(userId) },
            data: { role: roleLower },
            select: {
                id: true,
                utorid: true,
                name: true,
                role: true
            }
        });
        
        console.log('User role updated successfully:', JSON.stringify(user, null, 2));
        return user;
    } catch (error) {
        console.log('Error updating user role:', error.message);
        console.log('Error stack:', error.stack);
        throw error;
    }
};

/**
 * Update current user profile
 */
const updateCurrentUser = async (userId, updateData, avatarUrl = null) => {
    console.log('\n===== USER SERVICE: UPDATE CURRENT USER =====');
    console.log('User ID:', userId);
    console.log('Update data:', JSON.stringify(updateData, null, 2));
    console.log('Avatar URL:', avatarUrl);

    // Create a clean copy of updateData
    const cleanUpdateData = { ...updateData };
    console.log('Clean update data (initial):', JSON.stringify(cleanUpdateData, null, 2));

    // Check if there's anything to update
    if (Object.keys(cleanUpdateData).length === 0 && !avatarUrl) {
        console.log('No fields provided for update');
        throw new Error('No fields provided for update');
    }

    // 过滤掉null值
    Object.keys(cleanUpdateData).forEach(key => {
        if (cleanUpdateData[key] === null) {
            console.log(`Removing null value for field: ${key}`);
            delete cleanUpdateData[key];
        }
    });
    
    console.log('Clean update data (after null filtering):', JSON.stringify(cleanUpdateData, null, 2));
    
    // 再次检查是否有字段需要更新
    if (Object.keys(cleanUpdateData).length === 0 && !avatarUrl) {
        console.log('No fields provided for update after null filtering');
        throw new Error('No fields provided for update');
    }

    // Validate name if present
    if (cleanUpdateData.name !== undefined) {
        console.log('Validating name:', cleanUpdateData.name);
        if (cleanUpdateData.name.trim() === '') {
            console.log('Name validation failed: Name cannot be empty');
            throw new Error('Name cannot be empty');
        }
        
        // 验证name长度是否在1-50个字符之间
        if (cleanUpdateData.name.length < 1 || cleanUpdateData.name.length > 50) {
            console.log('Name validation failed: Name must be between 1 and 50 characters');
            throw new Error('Name must be between 1 and 50 characters');
        }
    }

    // Validate email if present
    if (cleanUpdateData.email !== undefined) {
        console.log('Validating email:', cleanUpdateData.email);
        
        // Check if email is empty
        if (cleanUpdateData.email.trim() === '') {
            console.log('Email validation failed: Email cannot be empty');
            throw new Error('Email cannot be empty');
        }
        
        // Check if email is valid
        if (!validateEmail(cleanUpdateData.email)) {
            console.log('Email validation failed: Invalid email format');
            throw new Error('Invalid email format');
        }
        
        // Check if email is already in use by another user
        const existingUser = await prisma.user.findFirst({
            where: {
                email: cleanUpdateData.email,
                id: {
                    not: userId
                }
            }
        });
        
        console.log('Existing user with same email:', existingUser);
        
        if (existingUser) {
            console.log('Email validation failed: Email already in use');
            throw new Error('Email already in use');
        }
    }

    // Validate birthday if present
    if (cleanUpdateData.birthday !== undefined) {
        console.log('Validating birthday:', cleanUpdateData.birthday);
        
        // Check if birthday is empty
        if (cleanUpdateData.birthday.trim() === '') {
            console.log('Birthday validation failed: Birthday cannot be empty');
            throw new Error('Birthday cannot be empty');
        }
        
        // 严格验证日期格式为YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanUpdateData.birthday)) {
            console.log('Birthday validation failed: Birthday must be in YYYY-MM-DD format');
            throw new Error('Birthday must be in YYYY-MM-DD format');
        }
        
        // 检查日期是否有效
        const [year, month, day] = cleanUpdateData.birthday.split('-').map(Number);
        console.log('Parsed date components:', { year, month, day });
        
        // 创建日期对象并检查是否有效
        const birthdayDate = new Date(year, month - 1, day); // 月份从0开始，所以要减1
        console.log('Parsed birthday date:', birthdayDate);
        
        // 检查日期是否有效（通过比较输入的日和解析后的日是否相同）
        if (isNaN(birthdayDate.getTime()) || 
            birthdayDate.getFullYear() !== year || 
            birthdayDate.getMonth() !== month - 1 || 
            birthdayDate.getDate() !== day) {
            console.log('Birthday validation failed: Invalid date');
            throw new Error('Invalid date');
        }
        
        // 检查年份是否在合理范围内（只检查不超过当前年份）
        const currentYear = new Date().getFullYear();
        if (year > currentYear) {
            console.log('Birthday validation failed: Year cannot be in the future');
            throw new Error('Year cannot be in the future');
        }
        
        // Format birthday as ISO string (date part only)
        cleanUpdateData.birthday = birthdayDate.toISOString().split('T')[0];
        console.log('Formatted birthday:', cleanUpdateData.birthday);
    }

    // Add avatar URL if present
    if (avatarUrl) {
        cleanUpdateData.avatarUrl = avatarUrl;
        console.log('Added avatar URL to update data:', avatarUrl);
    }

    console.log('Final clean update data:', JSON.stringify(cleanUpdateData, null, 2));

    try {
        console.log('Updating user in database...');
        // 使用select明确指定要返回的字段，不包含password
        const updatedUser = await prisma.user.update({
            where: {
                id: userId
            },
            data: cleanUpdateData,
            select: {
                id: true,
                utorid: true,
                name: true,
                email: true,
                birthday: true,
                role: true,
                points: true,
                createdAt: true,
                lastLogin: true,
                verified: true,
                avatarUrl: true
                // 不包含password字段
            }
        });
        
        console.log('User updated successfully:', JSON.stringify(updatedUser, null, 2));
        
        // Ensure verified is a boolean
        if (updatedUser.verified !== undefined) {
            updatedUser.verified = Boolean(updatedUser.verified);
            console.log('Converted verified to boolean:', updatedUser.verified);
        }
        
        console.log('===== USER SERVICE: UPDATE CURRENT USER COMPLETED =====\n');
        return updatedUser;
    } catch (error) {
        console.log('Error updating user:', error.message);
        console.log('Error stack:', error.stack);
        console.log('===== USER SERVICE: UPDATE CURRENT USER FAILED =====\n');
        throw error;
    }
};

/**
 * Update user password
 */
const updatePassword = async (userId, oldPassword, newPassword) => {
    // Get the user with the password
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            password: true
        }
    });

    if (!user) {
        throw new Error('User not found');
    }

    // Validate old password
    if (!user.password || !(await bcrypt.compare(oldPassword, user.password))) {
        throw new Error('Current password is incorrect');
    }

    // Validate new password
    if (!validatePassword(newPassword)) {
        throw new Error('New password must be 8-20 characters with at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    await prisma.user.update({
        where: { id: userId },
        data: {
            password: hashedPassword
        }
    });

    return { success: true };
};

/**
 * Get user ID by UTORid
 */
const getUserIdByUtorid = async (utorid) => {
    const user = await prisma.user.findUnique({
        where: { utorid },
        select: { id: true }
    });

    if (!user) {
        throw new Error('User not found');
    }

    return user.id;
};

/**
 * Get user role by ID
 */
const getUserRole = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        select: {
            id: true,
            role: true
        }
    });

    return user;
};

module.exports = {
    createUser,
    getUsers,
    getUserByCashier,
    getUserByManager,
    getCurrentUser,
    updateUserByManager,
    updateUserRoleBySuperuser,
    updateCurrentUser,
    updatePassword,
    getUserIdByUtorid,
    getUserRole
};