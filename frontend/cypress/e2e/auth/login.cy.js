describe('Login Tests', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('should successfully login with superuser credentials', () => {
    cy.loginAsSuperuser()
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })
}) 