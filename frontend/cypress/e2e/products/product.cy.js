/* ==== Test Created with Cypress Studio ==== */
it('1', function() {
  /* ==== Generated with Cypress Studio ==== */
  cy.visit('http://localhost:3000/');
  cy.get('.text-center > .group').click();
  cy.get(':nth-child(1) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').clear('z');
  cy.get(':nth-child(1) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').type('zhaokiko');
  cy.get(':nth-child(2) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').clear('1');
  cy.get(':nth-child(2) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').type('123');
  cy.get('[data-testid="login-submit"]').click();
  cy.get('.css-9abe7i').click();
  cy.get('.css-9abe7i').click();
  cy.get('.css-rcyqap > svg').click();
  cy.get('[href="/products"]').click();
  cy.get('.css-13fj9z5').clear('j');
  cy.get('.css-13fj9z5').type('juice');
  cy.get('.css-295ct5').click();
  cy.get('.css-1t0qpw4 > span').click();
  cy.get('[title="Show only items you can afford"] > span').click();
  cy.get(':nth-child(3) > span').click();
  cy.get(':nth-child(4) > span').click();
  cy.get(':nth-child(5) > span').click();
  cy.get('[title="Show only items currently in stock"] > span').click();
  /* ==== End Cypress Studio ==== */
});