// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Custom login command
Cypress.Commands.add('login', (utorid, password) => {
  cy.visit('/login')
  
  cy.get('input[placeholder="UTORid"]')
    .should('be.visible')
    .type(utorid)
  
  cy.get('input[placeholder="Password"]')
    .should('be.visible')
    .type(password)
  
  cy.get('button[type="submit"]')
    .should('be.visible')
    .click()
  
  // Wait for successful login and redirect
  cy.url().should('eq', Cypress.config().baseUrl + '/')
  cy.contains('Welcome,', { timeout: 10000 }).should('be.visible')
})

// Superuser login shortcut
Cypress.Commands.add('loginAsSuperuser', () => {
  cy.login('zhaokiko', '123')
})

// Wait for API response with proper status check
Cypress.Commands.add('waitForApi', (alias) => {
  cy.wait(alias).then((interception) => {
    expect(interception.response.statusCode).to.be.oneOf([200, 201])
  })
})