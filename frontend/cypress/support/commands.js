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
Cypress.Commands.add('login', (username, password) => {
  cy.visit('/login')

  cy.get('input[placeholder="UTORid"]')
    .type(username)

  cy.get('input[placeholder="Password"]')
    .type(password)

  cy.contains('button', 'Login')
    .click()

  // Wait for login to complete and verify we're redirected
  cy.url().should('not.include', '/login')
})

// Custom superuser login command
Cypress.Commands.add('loginAsSuperuser', () => {
  cy.login('zhaokiko', '123')
  
  // Verify we're logged in by checking we're at the root URL
  cy.url().should('match', /https:\/\/www\.pairxy\.com\/?$/)
}) 