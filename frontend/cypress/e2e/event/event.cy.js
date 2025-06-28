/* ==== Test Created with Cypress Studio ==== */
it('events', function() {
  /* ==== Generated with Cypress Studio ==== */
  cy.visit('/transactions/create');
  cy.get(':nth-child(1) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').clear('zh');
  cy.get(':nth-child(1) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').type('zhaokiko');
  cy.get(':nth-child(2) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').clear('12');
  cy.get(':nth-child(2) > .css-f1uyzo > .css-vgognf > .css-1jbx84z').type('123');
  cy.get('.css-1nubpdq').click();
  cy.get('.css-p2gd4c').click();
  cy.get('[href="/events"] > span').click();
  cy.get(':nth-child(3) > .css-f1uyzo > .css-1xv4mx6 > .css-19dnckm').select('upcoming');
  cy.get(':nth-child(4) > .css-f1uyzo > .css-1xv4mx6 > .css-19dnckm').select('published');
  cy.get(':nth-child(4) > .css-f1uyzo > .css-1xv4mx6 > .css-19dnckm').select('unpublished');
  cy.get(':nth-child(1) > .css-1x6djnn > .css-10vwgv4 > .css-1gnzu2s > [style="display: flex; gap: 0.5rem;"] > [color="error"]').click();
  cy.get('.css-10u371b').click();
  /* ==== End Cypress Studio ==== */
});