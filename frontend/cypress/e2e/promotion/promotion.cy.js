/* ==== Test Created with Cypress Studio ==== */
it('promotions', function() {
  /* ==== Generated with Cypress Studio ==== */
  cy.visit('/');
  cy.get(':nth-child(1) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').clear('zh');
  cy.get(':nth-child(1) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').type('zhaokiko');
  cy.get(':nth-child(2) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').clear('12');
  cy.get(':nth-child(2) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').type('123');
  cy.get('.css-1nubpdq').click();
  cy.get('.css-ssy3vh > [href="/promotions"]').click();
  cy.get(':nth-child(2) > .css-f1uyzo > .css-1xv4mx6 > .css-19dnckm').select('automatic');
  cy.get(':nth-child(2) > .css-f1uyzo > .css-1xv4mx6 > .css-19dnckm').select('one-time');
  cy.get(':nth-child(1) > .css-ze8cku > .css-15bvm37 > .css-1a5xmne > :nth-child(1) > svg > path').click();
  cy.get(':nth-child(3) > :nth-child(1) > .css-f1uyzo > .css-vgognf > .css-1hfebay').clear('7');
  cy.get(':nth-child(3) > :nth-child(1) > .css-f1uyzo > .css-vgognf > .css-1hfebay').type('80');
  cy.get('.css-qa1fpz').click();
  cy.get('.css-1m6mhc1 > svg > path').click();
  cy.get(':nth-child(5) > .css-ze8cku > .css-15bvm37 > .css-1a5xmne > :nth-child(1)').click();
  cy.get(':nth-child(3) > :nth-child(1) > .css-f1uyzo > .css-vgognf > .css-1hfebay').clear('3');
  cy.get(':nth-child(3) > :nth-child(1) > .css-f1uyzo > .css-vgognf > .css-1hfebay').type('3');
  cy.get('.css-qa1fpz').click();
  /* ==== End Cypress Studio ==== */
});