/* ==== Test Created with Cypress Studio ==== */
it('inventory', function() {
  /* ==== Generated with Cypress Studio ==== */
  cy.visit('/');
  cy.get(':nth-child(1) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').clear('zh');
  cy.get(':nth-child(1) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').type('zhaokiko');
  cy.get(':nth-child(2) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').clear('1');
  cy.get(':nth-child(2) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').type('123');
  cy.get('.css-1nubpdq').click();
  cy.get('.css-rcyqap > svg').click();
  cy.get('[href="/products"]').click();
  cy.get('[title="Show only items you can afford"] > span').click();
  cy.get('.css-1xaq8xy > :nth-child(3) > span').click();
  cy.get('.css-1xaq8xy > :nth-child(4) > span').click();
  cy.get('[title="Show only items you can afford"] > span').click();
  cy.get('.css-1xaq8xy > :nth-child(1)').click();
  cy.get('.css-13fj9z5').clear('C');
  cy.get('.css-13fj9z5').type('Chocolate');
  cy.get(':nth-child(5) > .css-s7e4de > .css-9solbw > .css-qfmhi4').click();
  cy.get(':nth-child(5) > .css-s7e4de > .css-9solbw > .css-2xbs02 > .css-a15jit > .css-14fxvxt > span').click();
  cy.get(':nth-child(4) > .css-xwxvkj > .css-9solbw').click();
  cy.get(':nth-child(4) > .css-xwxvkj > .css-1drutf6 > .css-1q6faxh').click();
  cy.get(':nth-child(5) > .css-s7e4de > .css-1drutf6 > .product-image').click();
  cy.get(':nth-child(5) > .css-s7e4de > .css-1drutf6 > .css-y2hgrh').click();
  cy.get(':nth-child(6) > .css-xwxvkj > .css-9solbw').click();
  cy.get(':nth-child(7) > .css-s7e4de > .css-1drutf6 > .product-image').click();
  cy.get(':nth-child(10) > .css-xwxvkj > .css-9solbw').click();
  cy.get(':nth-child(6) > .css-xwxvkj > .css-1drutf6 > .css-1q6faxh > svg').click();
  cy.get(':nth-child(2) > .css-xwxvkj > .css-1drutf6 > .css-1q6faxh').click();
  cy.get(':nth-child(3) > .css-xwxvkj > .css-1drutf6 > .css-1q6faxh > .placeholder-text').click();
  /* ==== End Cypress Studio ==== */
});