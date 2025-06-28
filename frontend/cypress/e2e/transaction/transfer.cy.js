/* ==== Test Created with Cypress Studio ==== */
it('transfer', function() {
  /* ==== Generated with Cypress Studio ==== */
  cy.visit('https://www.pairxy.com/');
  cy.get(':nth-child(1) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').clear('z');
  cy.get(':nth-child(1) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').type('zhaokiko');
  cy.get(':nth-child(2) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').clear('1');
  cy.get(':nth-child(2) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').type('123');
  cy.get('.css-1nubpdq').click();
  cy.get('.transfer-button').click();
  cy.get('.css-1tk7ua4 > :nth-child(4)').click();
  cy.get('.css-13fj9z5').click();
  cy.get('.css-1nubpdq').click();
  cy.get(':nth-child(2) > .css-vgognf > .css-13fj9z5').clear('c');
  cy.get(':nth-child(2) > .css-vgognf > .css-13fj9z5').type('cashier1');
  cy.get('.css-10u371b').click();
  /* ==== End Cypress Studio ==== */
});