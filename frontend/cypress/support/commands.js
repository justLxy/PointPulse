// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom email login command
Cypress.Commands.add('emailLogin', (email, otp = '123456') => {
  cy.visit('/login')

  // Step 1: Enter email
  cy.get('input[placeholder="your.email@mail.utoronto.ca"]')
    .type(email)

  // Click send verification code button
  cy.contains('button', 'Send Verification Code')
    .click()

  // Wait for OTP step to appear
  cy.contains('Step 2: Enter verification code')
    .should('be.visible')

  // Step 2: Enter OTP
  cy.get('input[placeholder="000000"]')
    .type(otp)

  // Click verify & login button
  cy.contains('button', 'Verify & Login')
    .click()

  // Wait for login to complete and verify we're redirected
  cy.url().should('not.include', '/login')
})

// Custom superuser login command
Cypress.Commands.add('loginAsSuperuser', () => {
  // Mock the email login service to avoid sending real emails
  cy.intercept('POST', '/api/auth/email-login', {
    statusCode: 200,
    body: { message: 'Verification code sent successfully' }
  }).as('emailLogin')

  cy.intercept('POST', '/api/auth/verify-email', {
    statusCode: 200,
    body: { 
      success: true,
      token: 'mock-jwt-token',
      user: { 
        id: 1, 
        email: 'zhaokiko@mail.utoronto.ca',
        name: 'Zhao Kiko',
        role: 'superuser'
      }
    }
  }).as('verifyEmail')

  cy.emailLogin('zhaokiko@mail.utoronto.ca', '123456')
  
  // Verify we're logged in by checking we're at the root URL
  cy.url().should('eq', Cypress.config().baseUrl + '/')
})

// Simple command to just visit login page for display testing
Cypress.Commands.add('visitLogin', () => {
  cy.visit('/login')
  cy.contains('Step 1: Enter your University of Toronto email')
    .should('be.visible')
}) 