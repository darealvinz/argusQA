import { type Page, type Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly errorMessage: Locator;
  readonly welcomeMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.signInButton = page.locator('button:has-text("Sign In")');
    this.errorMessage = page.locator('.error-message');
    this.welcomeMessage = page.locator('.welcome-msg');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async expectLoginSuccess(userName: string) {
    await expect(this.page).toHaveURL('/dashboard');
    await expect(this.welcomeMessage).toContainText(userName);
  }

  async expectLoginError(message: string) {
    await expect(this.errorMessage).toHaveText(message);
    await expect(this.page).toHaveURL('/login');
  }
}
