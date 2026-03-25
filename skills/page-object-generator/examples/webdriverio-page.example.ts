class LoginPage {
  get emailInput() { return $('#email'); }
  get passwordInput() { return $('#password'); }
  get signInButton() { return $('button=Sign In'); }
  get errorMessage() { return $('.error-message'); }
  get welcomeMessage() { return $('.welcome-msg'); }

  async open() {
    await browser.url('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.setValue(email);
    await this.passwordInput.setValue(password);
    await this.signInButton.click();
  }

  async expectLoginSuccess(userName: string) {
    await expect(browser).toHaveUrl(expect.stringContaining('/dashboard'));
    await expect(this.welcomeMessage).toHaveTextContaining(userName);
  }

  async expectLoginError(message: string) {
    await expect(this.errorMessage).toHaveText(message);
    await expect(browser).toHaveUrl(expect.stringContaining('/login'));
  }
}

export default new LoginPage();
