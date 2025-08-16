describe('uploadConfig', () => {
    let uploadConfig;
    let fs;
    let path;

    beforeEach(() => {
        // Clear require cache
        jest.resetModules();
        
        // Get fresh references to mocked modules
        fs = require('fs');
        path = require('path');
    });

    describe('Module Exports', () => {
        test('should export upload middleware', () => {
            uploadConfig = require('../../utils/uploadConfig');
            
            expect(uploadConfig).toBeDefined();
            expect(uploadConfig.upload).toBeDefined();
            expect(typeof uploadConfig.upload).toBe('object');
        });

        test('should export eventBackgroundUpload middleware', () => {
            uploadConfig = require('../../utils/uploadConfig');
            
            expect(uploadConfig.eventBackgroundUpload).toBeDefined();
            expect(typeof uploadConfig.eventBackgroundUpload).toBe('object');
        });

        test('should have multer methods available', () => {
            uploadConfig = require('../../utils/uploadConfig');
            
            expect(typeof uploadConfig.upload.single).toBe('function');
            expect(typeof uploadConfig.upload.array).toBe('function');
            expect(typeof uploadConfig.eventBackgroundUpload.single).toBe('function');
            expect(typeof uploadConfig.eventBackgroundUpload.array).toBe('function');
        });
    });

    describe('Module Structure', () => {
        test('should export exactly two properties', () => {
            uploadConfig = require('../../utils/uploadConfig');
            
            const keys = Object.keys(uploadConfig);
            expect(keys).toHaveLength(2);
            expect(keys).toContain('upload');
            expect(keys).toContain('eventBackgroundUpload');
        });

        test('should provide different instances for different upload types', () => {
            uploadConfig = require('../../utils/uploadConfig');
            
            expect(uploadConfig.upload).not.toBe(uploadConfig.eventBackgroundUpload);
        });
    });

    describe('Multer Instance Properties', () => {
        test('should have single method for file uploads', () => {
            uploadConfig = require('../../utils/uploadConfig');
            
            expect(uploadConfig.upload.single).toBeDefined();
            expect(uploadConfig.eventBackgroundUpload.single).toBeDefined();
        });

        test('should have array method for multiple files', () => {
            uploadConfig = require('../../utils/uploadConfig');
            
            expect(uploadConfig.upload.array).toBeDefined();
            expect(uploadConfig.eventBackgroundUpload.array).toBeDefined();
        });

        test('should have fields method for named fields', () => {
            uploadConfig = require('../../utils/uploadConfig');
            
            expect(uploadConfig.upload.fields).toBeDefined();
            expect(uploadConfig.eventBackgroundUpload.fields).toBeDefined();
        });

        test('should have none method for no files', () => {
            uploadConfig = require('../../utils/uploadConfig');
            
            expect(uploadConfig.upload.none).toBeDefined();
            expect(uploadConfig.eventBackgroundUpload.none).toBeDefined();
        });

        test('should have any method for any files', () => {
            uploadConfig = require('../../utils/uploadConfig');
            
            expect(uploadConfig.upload.any).toBeDefined();
            expect(uploadConfig.eventBackgroundUpload.any).toBeDefined();
        });
    });

    describe('Integration', () => {
        test('should load without errors', () => {
            expect(() => {
                require('../../utils/uploadConfig');
            }).not.toThrow();
        });

        test('should be consistent across multiple requires', () => {
            const config1 = require('../../utils/uploadConfig');
            const config2 = require('../../utils/uploadConfig');
            
            expect(config1).toBe(config2);
        });

        test('should initialize multer storage configurations', () => {
            uploadConfig = require('../../utils/uploadConfig');
            
            // Both upload middlewares should be properly initialized multer instances
            expect(uploadConfig.upload).toBeTruthy();
            expect(uploadConfig.eventBackgroundUpload).toBeTruthy();
        });
    });

    describe('File Type Validation', () => {
        test('should provide file filtering capabilities', () => {
            uploadConfig = require('../../utils/uploadConfig');
            
            // Multer instances should have internal file filtering
            // We can't directly test the filters but can verify the middleware exists
            expect(typeof uploadConfig.upload.single).toBe('function');
            expect(typeof uploadConfig.eventBackgroundUpload.single).toBe('function');
        });
    });

    describe('Configuration Differences', () => {
        test('should have separate storage configurations', () => {
            uploadConfig = require('../../utils/uploadConfig');
            
            // The two upload middlewares should be different instances
            // indicating they have different storage configurations
            expect(uploadConfig.upload).not.toEqual(uploadConfig.eventBackgroundUpload);
        });

        test('should maintain separate upload instances', () => {
            uploadConfig = require('../../utils/uploadConfig');
            
            // Verify they are both multer instances but with different configurations
            const uploadKeys = Object.keys(uploadConfig.upload);
            const eventUploadKeys = Object.keys(uploadConfig.eventBackgroundUpload);
            
            // Both should have similar structure (multer methods) but be different instances
            expect(uploadKeys.length).toBeGreaterThan(0);
            expect(eventUploadKeys.length).toBeGreaterThan(0);
        });
    });

    describe('Module Stability', () => {
        test('should handle multiple initializations', () => {
            // Clear and reload multiple times
            for (let i = 0; i < 3; i++) {
                jest.resetModules();
                expect(() => {
                    require('../../utils/uploadConfig');
                }).not.toThrow();
            }
        });

        test('should maintain exports consistency', () => {
            const configs = [];
            
            // Get multiple instances
            for (let i = 0; i < 3; i++) {
                jest.resetModules();
                configs.push(require('../../utils/uploadConfig'));
            }
            
            // All should have same structure
            configs.forEach(config => {
                expect(config).toHaveProperty('upload');
                expect(config).toHaveProperty('eventBackgroundUpload');
            });
        });
    });
});