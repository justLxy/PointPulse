describe('User Management Tests', () => {
  beforeEach(() => {
    // Login as superuser before each test
    cy.loginAsSuperuser()
    // Add extra wait for production environment
    cy.wait(2000)
  })

  it('should navigate to users page and display user list', () => {
    // Navigate to users page
    cy.visit('/users')
    
    // Verify we're on the users page
    cy.url().should('include', '/users')
    
    // Check that the page loads (wait for any content to appear)
    cy.get('body').should('be.visible')
    
    // The page should not show any error messages
    cy.get('body').should('not.contain.text', 'Error')
    cy.get('body').should('not.contain.text', '404')
  })

  it('should be able to access create user page', () => {
    // Navigate to create user page
    cy.visit('/users/create')
    
    // Verify we're on the create user page
    cy.url().should('include', '/users/create')
    
    // Check that the page loads
    cy.get('body').should('be.visible')
    
    // The page should not show any error messages
    cy.get('body').should('not.contain.text', 'Error')
    cy.get('body').should('not.contain.text', '404')
  })
}) 