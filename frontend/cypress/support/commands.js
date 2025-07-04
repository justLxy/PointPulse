// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom login command
Cypress.Commands.add('login', (email, otpCode = '123456') => {
  cy.visit('/login')

  // Step 1: Enter email and request OTP
  cy.get('input[placeholder="Enter your UofT email"]')
    .type(email)

  cy.contains('button', 'Send Verification Code')
    .click()

  // Step 2: Enter OTP
  cy.get('#otp-input-0').type(otpCode[0])
  cy.get('#otp-input-1').type(otpCode[1])
  cy.get('#otp-input-2').type(otpCode[2])
  cy.get('#otp-input-3').type(otpCode[3])
  cy.get('#otp-input-4').type(otpCode[4])
  cy.get('#otp-input-5').type(otpCode[5])

  // Step 3: Verify & Login
  cy.contains('button', 'Verify & Login')
    .click()

  // Wait for login to complete and verify we're redirected
  cy.url().should('not.include', '/login')
})

// Custom superuser login command
Cypress.Commands.add('loginAsSuperuser', () => {
  cy.login('zhaokiko@mail.utoronto.ca', '123456') // Use a test email and default OTP
  
  // Verify we're logged in by checking we're at the root URL
  cy.url().should('eq', Cypress.config().baseUrl + '/')
}) 