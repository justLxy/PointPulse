// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore certain errors that don't affect tests
  return false
})

// Clean up before each test
beforeEach(() => {
  // Clear localStorage
  cy.clearLocalStorage()
  // Clear cookies
  cy.clearCookies()
})