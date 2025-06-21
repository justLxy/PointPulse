describe('Login Tests', () => {
  beforeEach(() => {
    cy.visit('/login')
    // Wait for the page to load completely
    cy.get('body').should('be.visible')
  })

  it('should display login page correctly', () => {
    // Check that the login form elements are present
    cy.get('input[placeholder="UTORid"]').should('be.visible')
    cy.get('input[placeholder="Password"]').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible').and('contain', 'Login')
    
    // Check for other page elements
    cy.contains('Forgot Password?').should('be.visible')
    cy.contains('Activate Account').should('be.visible')
  })

  it('should successfully login with superuser credentials', () => {
    // Intercept the login API call
    cy.intercept('POST', '**/auth/tokens').as('loginAPI')
    
    // Fill in the login form
    cy.get('input[placeholder="UTORid"]')
      .should('be.visible')
      .type('zhaokiko')
    
    cy.get('input[placeholder="Password"]')
      .should('be.visible')
      .type('123')
    
    // Submit the form
    cy.get('button[type="submit"]').click()
    
    // Wait for the API call and verify success
    cy.wait('@loginAPI').then((interception) => {
      expect(interception.response.statusCode).to.equal(200)
    })
    
    // Verify successful redirect to dashboard
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    
    // Verify dashboard content loads (user name might be different in production)
    cy.contains('Welcome,', { timeout: 15000 }).should('be.visible')
  })

  it('should handle invalid credentials', () => {
    // Intercept the login API call
    cy.intercept('POST', '**/auth/tokens').as('loginAPI')
    
    // Fill in invalid credentials
    cy.get('input[placeholder="UTORid"]')
      .should('be.visible')
      .type('invaliduser')
    
    cy.get('input[placeholder="Password"]')
      .should('be.visible')
      .type('wrongpassword')
    
    // Submit the form
    cy.get('button[type="submit"]').click()
    
    // Wait for the API call and verify it fails
    cy.wait('@loginAPI').then((interception) => {
      expect(interception.response.statusCode).to.equal(401)
    })
    
    // Just verify we're still on login page (error handling working)
    cy.url().should('include', '/login')
    
    // Wait a moment to see if any error appears
    cy.wait(2000)
  })

  it('should handle empty form submission', () => {
    // Try to submit empty form
    cy.get('button[type="submit"]').click()
    
    // Just verify we're still on login page (validation working)
    cy.url().should('include', '/login')
    
    // Wait a moment to see if any validation appears
    cy.wait(1000)
  })

  it('should toggle password visibility', () => {
    // Type password
    cy.get('input[placeholder="Password"]').type('testpassword')
    
    // Password should be hidden by default
    cy.get('input[placeholder="Password"]').should('have.attr', 'type', 'password')
    
    // Click the toggle button
    cy.get('button[aria-label="Show password"]').click()
    
    // Password should now be visible
    cy.get('input[placeholder="Password"]').should('have.attr', 'type', 'text')
    
    // Click again to hide
    cy.get('button[aria-label="Hide password"]').click()
    
    // Password should be hidden again
    cy.get('input[placeholder="Password"]').should('have.attr', 'type', 'password')
  })
}) 