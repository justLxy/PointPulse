const {
    validateUTORid,
    validateEmail,
    validatePassword,
} = require('../../utils/validators');

describe('Validators', () => {
    describe('validateUTORid', () => {
        test('should validate valid 8-character alphanumeric UTORid', () => {
            expect(validateUTORid('testus01')).toBe(true);
            expect(validateUTORid('abc12345')).toBe(true);
            expect(validateUTORid('12345678')).toBe(true);
            expect(validateUTORid('ABCD1234')).toBe(true);
        });

        test('should reject invalid UTORid formats', () => {
            expect(validateUTORid('test')).toBe(false); // too short
            expect(validateUTORid('testuser1')).toBe(false); // too long
            expect(validateUTORid('test@123')).toBe(false); // special characters
            expect(validateUTORid('test 123')).toBe(false); // space
            expect(validateUTORid('')).toBe(false); // empty
            expect(validateUTORid(null)).toBe(false); // null
            expect(validateUTORid(undefined)).toBe(false); // undefined
        });
    });

    describe('validateEmail', () => {
        test('should validate valid UofT emails', () => {
            expect(validateEmail('test@mail.utoronto.ca')).toBe(true);
            expect(validateEmail('student@utoronto.ca')).toBe(true);
            expect(validateEmail('jane.doe@mail.utoronto.ca')).toBe(true);
            expect(validateEmail('user123@utoronto.ca')).toBe(true);
        });

        test('should reject invalid email formats', () => {
            expect(validateEmail('test@gmail.com')).toBe(false); // wrong domain
            expect(validateEmail('test@toronto.ca')).toBe(false); // wrong domain
            expect(validateEmail('test@mail.utoronto.com')).toBe(false); // wrong TLD
            expect(validateEmail('testmail.utoronto.ca')).toBe(false); // missing @
            expect(validateEmail('@mail.utoronto.ca')).toBe(false); // missing username
            expect(validateEmail('test@')).toBe(false); // incomplete
            expect(validateEmail('')).toBe(false); // empty
            expect(validateEmail(null)).toBe(false); // null
            expect(validateEmail(undefined)).toBe(false); // undefined
        });
    });

    describe('validatePassword', () => {
        test('should validate strong passwords', () => {
            expect(validatePassword('Test1234!')).toBe(true);
            expect(validatePassword('MyPass123@')).toBe(true);
            expect(validatePassword('Secure#Pass1')).toBe(true);
            expect(validatePassword('Another$123')).toBe(true);
        });

        test('should reject weak passwords', () => {
            expect(validatePassword('password')).toBe(false); // no uppercase, number, special
            expect(validatePassword('PASSWORD123!')).toBe(false); // no lowercase
            expect(validatePassword('Password!')).toBe(false); // no number
            expect(validatePassword('Password123')).toBe(false); // no special character
            expect(validatePassword('Pass1!')).toBe(false); // too short
            expect(validatePassword('VeryLongPasswordThatExceedsMaxLength123!')).toBe(false); // too long
            expect(validatePassword('')).toBe(false); // empty
            expect(validatePassword(null)).toBe(false); // null
            expect(validatePassword(undefined)).toBe(false); // undefined
        });
    });
}); 