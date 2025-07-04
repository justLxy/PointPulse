describe('Login Page Basic Load Test', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('should load the login page and display the PointPulse logo/text', () => {
    cy.contains('PointPulse').should('be.visible')
    // You can add more basic checks here if needed, e.g., for the email input placeholder:
    // cy.get('input[placeholder="Enter your UofT email"]').should('be.visible')
  })
}) 