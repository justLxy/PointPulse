/* ==== Test Created with Cypress Studio ==== */
it('process redemption page loads', () => {
  cy.loginAsSuperuser();
  cy.visit('/transactions/process');
  cy.contains('Process Redemption').should('be.visible');
});