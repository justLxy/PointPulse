/* ==== Test Created with Cypress Studio ==== */
it('promotions page loads for manager', () => {
  cy.loginAsSuperuser();
  cy.visit('/promotions');
  cy.url().should('include', '/promotions');
  cy.contains('Promotions').should('exist');
});