/* ==== Test Created with Cypress Studio ==== */
it('1', function() {
  /* ==== Generated with Cypress Studio ==== */
  cy.visit('http://localhost:3000/');
  cy.get('.text-center > .group').click();
  cy.get(':nth-child(1) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').clear('z');
  cy.get(':nth-child(1) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').type('zhaokiko');
  cy.get(':nth-child(2) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').clear('12');
  cy.get(':nth-child(2) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').type('123');
  cy.get('[data-testid="login-submit"]').click();
  cy.get('.css-rcyqap > svg > path').click();
  cy.get('[href="/products"]').click();
  cy.get(':nth-child(1) > .css-1llr17s > .css-9solbw > select').select('3');
  cy.get(':nth-child(1) > .css-1llr17s > .css-9solbw > select').select('4');
  cy.get(':nth-child(8) > .css-1llr17s > .css-9solbw').click();
  cy.get(':nth-child(8) > .css-1llr17s > .css-9solbw > select').select('1');
  cy.get('.css-unihde > :nth-child(3)').click();
  cy.get('.css-69n1ck').click();
  cy.get('[title="Show only items you can afford"] > span').click();
  cy.get('.css-1xaq8xy > :nth-child(3) > span').click();
  cy.get('.css-1xaq8xy > :nth-child(4) > span').click();
  cy.get(':nth-child(5) > span').click();
  cy.get('[title="Show only items currently in stock"] > span').click();
  cy.get('.css-1xaq8xy > :nth-child(1) > span').click();
  cy.get('.css-13fj9z5').clear('o');
  cy.get('.css-13fj9z5').type('juice');
  /* ==== End Cypress Studio ==== */
});