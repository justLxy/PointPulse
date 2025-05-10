'use strict';

const userService = require('../services/userService');
const { checkRole } = require('../middlewares/authMiddleware');

/**
 * Register a new user (cashier or higher role required)
 */
const createUser = async (req, res) => {
    try {
        // Verify that the creator has at least a cashier role
        if (!checkRole(req.auth, 'cashier')) {
            return res.status(403).json({ error: 'Unauthorized to create users' });
        }

        const userData = {
            utorid: req.body.utorid?.toLowerCase(), 
            name: req.body.name,
            email: req.body.email
        };

        const newUser = await userService.createUser(userData, req.auth.id);
        res.status(201).json(newUser);
    } catch (error) {
        if (error.message.includes('already exists')) {
            return res.status(409).json({ error: error.message });
        }
        res.status(400).json({ error: error.message });
    }
};

/**
 * Get all users with filters (manager or higher role required)
 */
const getUsers = async (req, res) => {
    try {
        // Verify that the requester has at least a manager role
        if (!checkRole(req.auth, 'manager')) {
            return res.status(403).json({ error: 'Unauthorized to view all users' });
        }

        const { name, role, verified, activated, page, limit } = req.query;
        const filters = { name, role, verified, activated };

        try {
            const result = await userService.getUsers(filters, page || 1, limit || 10);
            res.status(200).json(result);
        } catch (error) {
            if (error.message.includes('Invalid page') || error.message.includes('Invalid limit')) {
                return res.status(400).json({ error: error.message });
            }
            throw error;
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get a specific user (cashier or higher role required)
 */
const getUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        // Check if user exists
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // 先获取目标用户的角色信息
        const targetUser = await userService.getUserRole(userId);
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // 如果目标用户是 manager 或 superuser，则需要相同或更高权限
        if (targetUser.role === 'manager' || targetUser.role === 'superuser') {
            if (!checkRole(req.auth, targetUser.role)) {
                return res.status(403).json({ error: 'Insufficient permissions to view this user' });
            }
        }

        // Different view based on role
        if (checkRole(req.auth, 'manager')) {
            const user = await userService.getUserByManager(userId);
            return res.status(200).json(user);
        } else if (checkRole(req.auth, 'cashier')) {
            const user = await userService.getUserByCashier(userId);
            return res.status(200).json(user);
        } else {
            return res.status(403).json({ error: 'Unauthorized to view user details' });
        }
    } catch (error) {
        if (error.message === 'User not found') {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(500).json({ error: error.message });
    }
};

/**
 * Update a user's status (manager or higher role required)
 */
const updateUser = async (req, res) => {
    console.log('\n\n===== UPDATE USER REQUEST START =====');
    console.log('Time:', new Date().toISOString());
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    
    try {
        console.log('===== UPDATE USER DEBUG =====');
        console.log('Request params:', req.params);
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('Auth user:', JSON.stringify(req.auth, null, 2));
        
        const userId = parseInt(req.params.userId);
        console.log('Parsed userId:', userId);

        // Check if user exists
        if (isNaN(userId)) {
            console.log('Invalid user ID');
            console.log('===== UPDATE USER REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Empty payload check
        if (!req.body || Object.keys(req.body).length === 0) {
            console.log('Empty payload');
            console.log('===== UPDATE USER REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'No fields provided for update' });
        }

        // Check for invalid fields
        const allowedFields = ['email', 'verified', 'suspicious', 'role'];
        const providedFields = Object.keys(req.body);
        console.log('Provided fields:', providedFields);

        const invalidFields = providedFields.filter(field => !allowedFields.includes(field));
        if (invalidFields.length > 0) {
            console.log('Invalid fields:', invalidFields);
            console.log('===== UPDATE USER REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: `Invalid fields: ${invalidFields.join(', ')}` });
        }

        // 检查字段类型
        if (req.body.email !== undefined) {
            console.log('Email value:', req.body.email, 'type:', typeof req.body.email);
            // 允许email为null，表示不更新
            if (req.body.email !== null && typeof req.body.email !== 'string') {
                console.log('Email is not a string or null');
                console.log('===== UPDATE USER REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Email must be a string or null' });
            }
            
            // 如果email不为null，验证格式
            if (req.body.email !== null) {
                // 验证邮箱格式在service层进行，这里只检查类型
                console.log('Email will be validated in service layer');
            }
        }
        
        // 允许布尔值或字符串 'true'/'false' 或 null
        if (req.body.verified !== undefined) {
            console.log('Verified value:', req.body.verified, 'type:', typeof req.body.verified);
            // 只允许true或"true"，或者null（表示不更新）
            if (req.body.verified !== null && 
                req.body.verified !== true && 
                req.body.verified !== 'true') {
                console.log('Invalid verified value - must be true or "true"');
                console.log('===== UPDATE USER REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Verified must be true or "true"' });
            }
            // 只有在非null的情况下才转换
            if (req.body.verified !== null) {
                req.body.verified = req.body.verified === true || req.body.verified === 'true';
                console.log('Verified after conversion:', req.body.verified);
            }
        }
        
        if (req.body.suspicious !== undefined) {
            console.log('Suspicious value:', req.body.suspicious, 'type:', typeof req.body.suspicious);
            if (req.body.suspicious !== null && 
                typeof req.body.suspicious !== 'boolean' && 
                req.body.suspicious !== 'true' && 
                req.body.suspicious !== 'false') {
                console.log('Invalid suspicious value');
                console.log('===== UPDATE USER REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Suspicious must be a boolean, string "true"/"false", or null' });
            }
            // 只有在非null的情况下才转换
            if (req.body.suspicious !== null) {
                req.body.suspicious = req.body.suspicious === true || req.body.suspicious === 'true';
                console.log('Suspicious after conversion:', req.body.suspicious);
            }
        }
        
        if (req.body.role !== undefined) {
            console.log('Role value:', req.body.role, 'type:', typeof req.body.role);
            // 允许role为null，表示不更新
            if (req.body.role !== null && typeof req.body.role !== 'string') {
                console.log('Role is not a string or null');
                console.log('===== UPDATE USER REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Role must be a string or null' });
            }
        }

        // Check role and update accordingly
        console.log('Checking auth role...');
        console.log('Is superuser?', checkRole(req.auth, 'superuser'));
        console.log('Is manager?', checkRole(req.auth, 'manager'));
        
        if (checkRole(req.auth, 'superuser')) {
            console.log('User is superuser');
            
            // 准备更新数据
            const updateData = {};
            // 只有在非null的情况下才更新
            if (req.body.email !== undefined && req.body.email !== null) updateData.email = req.body.email;
            if (req.body.verified !== undefined && req.body.verified !== null) updateData.verified = req.body.verified;
            if (req.body.suspicious !== undefined && req.body.suspicious !== null) updateData.suspicious = req.body.suspicious;
            if (req.body.role !== undefined && req.body.role !== null) updateData.role = req.body.role;
            
            console.log('Superuser update data:', updateData);
            
            if (Object.keys(updateData).length === 0) {
                console.log('No valid fields for superuser update');
                console.log('===== UPDATE USER REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'No valid fields provided for update' });
            }
            
            try {
                console.log('Updating user as superuser with data:', updateData);
                
                // 创建一个响应对象，只包含已更新的字段
                const responseData = {};
                
                // 如果包含角色更新，使用updateUserRoleBySuperuser函数
                if (updateData.role !== undefined) {
                    console.log('Update includes role change to:', updateData.role);
                    // 更新角色
                    const roleUpdateResult = await userService.updateUserRoleBySuperuser(userId, updateData.role);
                    // 添加角色到响应
                    responseData.id = roleUpdateResult.id;
                    responseData.utorid = roleUpdateResult.utorid;
                    responseData.name = roleUpdateResult.name;
                    responseData.role = roleUpdateResult.role;
                    // 删除role字段，避免重复更新
                    delete updateData.role;
                }
                
                // 如果还有其他字段需要更新
                if (Object.keys(updateData).length > 0) {
                    console.log('Updating other fields:', updateData);
                    const otherUpdateResult = await userService.updateUserByManager(userId, updateData);
                    console.log('Other fields update result:', otherUpdateResult);
                    
                    // 合并结果到响应
                    responseData.id = responseData.id || otherUpdateResult.id;
                    responseData.utorid = responseData.utorid || otherUpdateResult.utorid;
                    responseData.name = responseData.name || otherUpdateResult.name;
                    
                    // 添加其他已更新的字段
                    if (updateData.email !== undefined) responseData.email = otherUpdateResult.email;
                    if (updateData.verified !== undefined) responseData.verified = otherUpdateResult.verified;
                    if (updateData.suspicious !== undefined) responseData.suspicious = otherUpdateResult.suspicious;
                }
                
                console.log('Final response data:', responseData);
                console.log('===== UPDATE USER REQUEST END (200) =====\n\n');
                return res.status(200).json(responseData);
            } catch (error) {
                console.log('Update error:', error.message);
                console.log('===== UPDATE USER REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: error.message });
            }
        } else if (checkRole(req.auth, 'manager')) {
            console.log('User is manager');
            // Manager can update certain fields
            const updateData = {};

            // 只有在非null的情况下才更新
            if (req.body.email !== undefined && req.body.email !== null) updateData.email = req.body.email;
            if (req.body.verified !== undefined && req.body.verified !== null) updateData.verified = req.body.verified;
            if (req.body.suspicious !== undefined && req.body.suspicious !== null) updateData.suspicious = req.body.suspicious;
            if (req.body.role !== undefined && req.body.role !== null) {
                // 转换为小写进行比较，确保不区分大小写
                const roleLower = req.body.role.toLowerCase();
                console.log('Role after lowercase:', roleLower);
                if (roleLower === 'cashier' || roleLower === 'regular') {
                    updateData.role = roleLower;
                } else {
                    console.log('Invalid role for manager update:', roleLower);
                    console.log('===== UPDATE USER REQUEST END (403) =====\n\n');
                    return res.status(403).json({ error: 'Managers can only set roles to cashier or regular' });
                }
            }
            
            console.log('Manager update data:', updateData);
            
            if (Object.keys(updateData).length === 0) {
                console.log('No valid fields for manager update');
                console.log('===== UPDATE USER REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'No valid fields provided for update' });
            }

            try {
                console.log('Updating user as manager with data:', updateData);
                const updateResult = await userService.updateUserByManager(userId, updateData);
                console.log('Update result:', updateResult);
                
                // 只返回已更新的字段
                console.log('Final response data:', updateResult);
                console.log('===== UPDATE USER REQUEST END (200) =====\n\n');
                return res.status(200).json(updateResult);
            } catch (error) {
                console.log('Update error:', error.message);
                console.log('===== UPDATE USER REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: error.message });
            }
        } else {
            console.log('User has insufficient permissions');
            console.log('===== UPDATE USER REQUEST END (403) =====\n\n');
            return res.status(403).json({ error: 'Unauthorized to update user' });
        }
    } catch (error) {
        console.log('Caught error:', error.message);
        if (error.message === 'User not found') {
            console.log('===== UPDATE USER REQUEST END (404) =====\n\n');
            return res.status(404).json({ error: 'User not found' });
        }
        console.log('===== UPDATE USER REQUEST END (400) =====\n\n');
        res.status(400).json({ error: error.message });
    }
};

/**
 * Get current user profile
 */
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.auth.id;
        const user = await userService.getCurrentUser(userId);

        // Ensure the verified field is a boolean
        if (user.verified !== undefined) {
            user.verified = Boolean(user.verified);
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Update current user profile
 */
const updateCurrentUser = async (req, res) => {
    console.log('\n\n===== UPDATE CURRENT USER REQUEST START =====');
    console.log('Time:', new Date().toISOString());
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request file:', req.file);
    console.log('Auth user:', JSON.stringify(req.auth, null, 2));
    
    try {
        const userId = req.auth.id;
        console.log('User ID:', userId);

        // Check if there's anything to update
        if ((!req.body || Object.keys(req.body).length === 0) && !req.file) {
            console.log('No fields provided for update');
            console.log('===== UPDATE CURRENT USER REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'No fields provided for update' });
        }

        // Check for invalid fields
        const allowedFields = ['name', 'email', 'birthday', 'avatar'];
        const providedFields = Object.keys(req.body || {});
        console.log('Provided fields:', providedFields);

        const invalidFields = providedFields.filter(field => !allowedFields.includes(field));
        if (invalidFields.length > 0) {
            console.log('Invalid fields:', invalidFields);
            console.log('===== UPDATE CURRENT USER REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: `Invalid fields: ${invalidFields.join(', ')}` });
        }

        // Check field types
        if (req.body.name !== undefined && req.body.name !== null) {
            console.log('Name value:', req.body.name, 'type:', typeof req.body.name);
            if (typeof req.body.name !== 'string') {
                console.log('Name is not a string');
                console.log('===== UPDATE CURRENT USER REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Name must be a string' });
            }
        }

        if (req.body.email !== undefined && req.body.email !== null) {
            console.log('Email value:', req.body.email, 'type:', typeof req.body.email);
            if (typeof req.body.email !== 'string') {
                console.log('Email is not a string');
                console.log('===== UPDATE CURRENT USER REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Email must be a string' });
            }
        }

        if (req.body.birthday !== undefined && req.body.birthday !== null) {
            console.log('Birthday value:', req.body.birthday, 'type:', typeof req.body.birthday);
            if (typeof req.body.birthday !== 'string') {
                console.log('Birthday is not a string');
                console.log('===== UPDATE CURRENT USER REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Birthday must be a string' });
            }
        }

        const updateData = {};

        if (req.body.name !== undefined && req.body.name !== null) {
            updateData.name = req.body.name;
            console.log('Added name to updateData:', updateData.name);
        }
        if (req.body.email !== undefined && req.body.email !== null) {
            updateData.email = req.body.email;
            console.log('Added email to updateData:', updateData.email);
        }
        if (req.body.birthday !== undefined && req.body.birthday !== null) {
            updateData.birthday = req.body.birthday;
            console.log('Added birthday to updateData:', updateData.birthday);
        }

        // Handle avatar upload if present
        let avatarUrl = null;
        if (req.file) {
            const host = process.env.PUBLIC_HOST || `${req.protocol}://${req.get('host')}`;
            avatarUrl = `${host}/uploads/avatars/${req.file.filename}`;
            console.log('Avatar URL (absolute):', avatarUrl);
        }

        console.log('Final updateData:', updateData);
        console.log('Avatar URL:', avatarUrl);

        // 检查是否有实际需要更新的数据
        if (Object.keys(updateData).length === 0 && !avatarUrl) {
            console.log('No valid fields to update after null filtering');
            console.log('===== UPDATE CURRENT USER REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'No valid fields provided for update' });
        }

        try {
            console.log('Calling userService.updateCurrentUser');
            const updatedUser = await userService.updateCurrentUser(userId, updateData, avatarUrl);
            console.log('Update successful:', updatedUser);
            console.log('===== UPDATE CURRENT USER REQUEST END (200) =====\n\n');
            res.status(200).json(updatedUser);
        } catch (error) {
            console.log('Update error:', error.message);
            console.log('Error stack:', error.stack);
            console.log('===== UPDATE CURRENT USER REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: error.message });
        }
    } catch (error) {
        console.log('Caught error:', error.message);
        console.log('Error stack:', error.stack);
        console.log('===== UPDATE CURRENT USER REQUEST END (500) =====\n\n');
        res.status(500).json({ error: error.message });
    }
};

/**
 * Update current user password
 */
const updatePassword = async (req, res) => {
    try {
        const userId = req.auth.id;
        const { old, new: newPassword } = req.body;

        if (!old || !newPassword) {
            return res.status(400).json({ error: 'Both current and new passwords are required' });
        }

        try {
            await userService.updatePassword(userId, old, newPassword);
            res.status(200).json({ message: 'Password updated successfully' });
        } catch (error) {
            if (error.message === 'Current password is incorrect') {
                return res.status(403).json({ error: 'Current password is incorrect' });
            }
            throw error;
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Lookup a user by UTORid - specifically for cashiers to use in transactions
 */
const lookupUserByUtorid = async (req, res) => {
    try {
        // Verify that the requester has at least a cashier role
        if (!checkRole(req.auth, 'cashier')) {
            return res.status(403).json({ error: 'Unauthorized to lookup users' });
        }

        const { utorid } = req.params;
        
        if (!utorid) {
            return res.status(400).json({ error: 'UTORid is required' });
        }

        try {
            // Find the user ID first
            const userId = await userService.getUserIdByUtorid(utorid);
            
            // Get the user using the cashier view function
            const user = await userService.getUserByCashier(userId);
            
            return res.status(200).json(user);
        } catch (error) {
            if (error.message === 'User not found') {
                return res.status(404).json({ error: 'User not found' });
            }
            throw error;
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createUser,
    getUsers,
    getUser,
    updateUser,
    getCurrentUser,
    updateCurrentUser,
    updatePassword,
    lookupUserByUtorid
};