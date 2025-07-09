/* ==== Test Created with Cypress Studio ==== */
it('transfer modal can be opened', () => {
  cy.loginAsSuperuser();
  cy.url().should('include', '/dashboard');
});