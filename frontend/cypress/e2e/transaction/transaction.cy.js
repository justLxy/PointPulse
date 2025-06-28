/* ==== Test Created with Cypress Studio ==== */
it('createtransaction', function() {
  /* ==== Generated with Cypress Studio ==== */
  cy.visit('https://www.pairxy.com/transactions/create');
  cy.get(':nth-child(1) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').clear('z');
  cy.get(':nth-child(1) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').type('zhaokiko');
  cy.get(':nth-child(2) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').clear('12');
  cy.get(':nth-child(2) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').type('123');
  cy.get('.css-1nubpdq').click();
  cy.get('.css-570ay0 > .css-f1uyzo > .css-vgognf > .css-f40xyy').clear('zh');
  cy.get('.css-570ay0 > .css-f1uyzo > .css-vgognf > .css-f40xyy').type('zhaokiko');
  cy.get('.css-10u371b').click();
  cy.get('.css-7zhfhb > :nth-child(1) > .css-vgognf > .css-f40xyy').clear('1');
  cy.get('.css-7zhfhb > :nth-child(1) > .css-vgognf > .css-f40xyy').type('100');
  cy.get('.css-1nubpdq').click();
  cy.get('.css-c47540').click();
  /* ==== End Cypress Studio ==== */
});