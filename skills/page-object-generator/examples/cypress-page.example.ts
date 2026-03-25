export class LoginPage {
  goto() {
    cy.visit('/login');
  }

  login(email: string, password: string) {
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('button').contains('Sign In').click();
  }

  expectLoginSuccess(userName: string) {
    cy.url().should('include', '/dashboard');
    cy.get('.welcome-msg').should('contain', userName);
  }

  expectLoginError(message: string) {
    cy.get('.error-message').should('have.text', message);
    cy.url().should('include', '/login');
  }
}
