/* ==== Test Created with Cypress Studio ==== */
it('landingpage', function() {
  /* ==== Generated with Cypress Studio ==== */
  cy.visit('http://localhost:3000/');
  cy.get(':nth-child(6) > .flex > .text-lg').click();
  cy.get(':nth-child(5) > .flex > .text-lg').click();
  cy.get(':nth-child(4) > .flex > .text-lg').click();
  cy.get(':nth-child(3) > .flex > .text-lg').click();
  cy.get(':nth-child(2) > .flex > .text-lg').click();
  cy.get(':nth-child(1) > .flex > .text-lg').click();
  /* ==== End Cypress Studio ==== */
});