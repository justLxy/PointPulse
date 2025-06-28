/* ==== Test Created with Cypress Studio ==== */
it('redemption', function() {
  /* ==== Generated with Cypress Studio ==== */
  cy.visit('https://www.pairxy.com/');
  cy.get(':nth-child(1) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').clear('z');
  cy.get(':nth-child(1) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').type('zhaokiko');
  cy.get(':nth-child(2) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').clear('12');
  cy.get(':nth-child(2) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').type('123');
  cy.get('.css-1nubpdq').click();
  cy.get('.css-rcyqap > svg > path').click();
  cy.get('.css-glkwdb').click();
  cy.get('.css-1uihrgz > :nth-child(2)').click();
  cy.get('.css-h9ik7y > [href="/transactions/process"]').click();
  /* ==== End Cypress Studio ==== */
});