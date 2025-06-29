/* ==== Test Created with Cypress Studio ==== */
/* ==== End Cypress Studio ==== */

/* eslint-disable no-undef */
/**
 * Inventory (Products) E2E Smoke Test
 *
 * 1. Logs in with a valid cashier account (superuser here for simplicity)
 * 2. Navigates to the products page
 * 3. Toggles the "Affordable Only" filter, switches between list/grid, etc.
 * 4. Searches for a keyword (e.g., "Chocolate") and asserts at least one matching
 *    product card is visible.
 *
 * NOTE: This test intentionally avoids querying Emotion/Styled-Components
 * generated class names because they are non-deterministic. Instead it relies
 * on semantic text, attributes (e.g., `.product-image` static className), and
 * route URLs which are stable across UI refactors.
 */

it('inventory – search & basic interactions work', () => {
  // Visit login page (root redirects to login when not authenticated)
  cy.visit('/');

  // --- Login ---
  cy.get('input[placeholder="UTORid"], input[type="text"]').first().type('zhaokiko');
  cy.get('input[placeholder="Password"], input[type="password"]').first().type('123');
  cy.contains('button', /login/i).click();

  // Wait for dashboard header (account avatar) to confirm successful login
  cy.get('header').should('be.visible');

  // --- Navigate to Products page ---
  cy.get('header').within(() => {
    // If nav link is visible (desktop), click directly; otherwise open hamburger menu first
    cy.contains('Products').then($link => {
      if ($link.is(':visible')) {
        cy.wrap($link).click();
      } else {
        // click the first visible button (hamburger)
        cy.get('button').filter(':visible').first().click({ force: true });
        cy.contains('Products').click({ force: true });
      }
    });
  });

  cy.url().should('include', '/products');

  // Toggle "Affordable Only" (if present) – use title attribute as in UI
  cy.get('[title="Show only items you can afford"]').click({ force: true });

  // --- Search for a keyword ---
  cy.get('input[placeholder="Search by name"], input[aria-label="Search"], input[placeholder*="Search"]')
    .type('Chocolate');

  // Assert at least one product card with "Chocolate" appears
  cy.contains('h3', /chocolate/i).should('be.visible');

  // Click on the first visible product image to open the detail modal/page (if any)
  cy.get('.product-image').first().click({ force: true });

  // Detail view might appear as modal or new route – just assert something renders
  cy.contains(/chocolate/i).should('exist');
});