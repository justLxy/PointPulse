/* ==== Test Created with Cypress Studio ==== */
it('user', function() {
  /* ==== Generated with Cypress Studio ==== */
  cy.visit('https://www.pairxy.com/login');
  cy.get(':nth-child(1) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').clear('z');
  cy.get(':nth-child(1) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').type('zhaokiko');
  cy.get(':nth-child(2) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').clear('1');
  cy.get(':nth-child(2) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').type('123');
  cy.get('.css-1nubpdq').click();
  cy.get('[href="/users"] > span').click();
  cy.get('.css-rdwbnw').clear('K');
  cy.get('.css-rdwbnw').type('Kiko Zhao');
  cy.get('.css-p2gd4c').click();
  cy.get('.css-ssy3vh > [href="/users"]').click();
  cy.get(':nth-child(2) > .css-1qcrhzx > .css-44eo8z').click();
  cy.get('.css-10u371b').click();
  cy.get('.css-13fj9z5').clear('xxuanyi.lyu@mail.utoronto.ca');
  cy.get('.css-13fj9z5').type('xxuanyi.lyu@mail.utoronto.ca');
  cy.get('.css-13fj9z5').click();
  cy.get('.css-10u371b').click();
  cy.get(':nth-child(2) > .css-1qcrhzx > .css-44eo8z').click();
  cy.get('.css-10u371b').click();
  cy.get('.css-13fj9z5').clear('xuanyi.lyu@mail.utoronto.ca');
  cy.get('.css-13fj9z5').type('xuanyi.lyu@mail.utoronto.ca');
  cy.get('.css-10u371b').click();
  cy.get('.css-295ct5 > :nth-child(1)').click();
  /* ==== End Cypress Studio ==== */
});