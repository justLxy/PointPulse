'use strict';

/**
 * Validate UTORid format (8 alphanumeric characters)
 */
const validateUTORid = (utorid) => {
    return /^[a-zA-Z0-9]{8}$/.test(utorid);
};

/**
 * Validate UofT email (must end with @mail.utoronto.ca or @utoronto.ca)
 */
const validateEmail = (email) => {
    console.log('===== VALIDATE EMAIL DEBUG =====');
    console.log('Email to validate:', email);
    
    // 如果email为null或undefined，直接返回false
    if (email === null || email === undefined) {
        console.log('Email is null or undefined, validation failed');
        return false;
    }
    
    // 支持 @mail.utoronto.ca, @utoronto.ca, 以及 @toronto.edu 三种格式
    const regex = /^([^\s@]+@(mail\.)?utoronto\.ca|[^\s@]+@toronto\.edu)$/i;
    const isValid = regex.test(email);
    console.log('Regex pattern:', regex);
    console.log('Is valid email?', isValid);
    
    // 额外检查，确保邮箱格式正确
    if (!isValid) {
        console.log('Email validation failed with regex');
        // 检查是否是其他常见错误
        if (!email.includes('@')) {
            console.log('Email missing @ symbol');
        } else if (!email.endsWith('utoronto.ca') && !email.endsWith('mail.utoronto.ca')) {
            console.log('Email has invalid domain, must end with utoronto.ca or mail.utoronto.ca');
        }
    }
    
    return isValid;
};

/**
 * Validate password (8-20 chars with at least one uppercase, one lowercase, one number, one special char)
 */
const validatePassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/.test(password);
};

module.exports = {
    validateUTORid,
    validateEmail,
    validatePassword,
};