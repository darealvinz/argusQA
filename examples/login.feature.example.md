---
id: login
tags: [auth, entry-point]
depends_on: []
next: [dashboard, add-to-cart, order-history]
scenarios:
  - id: login-success
    type: happy
  - id: login-invalid-credentials
    type: negative
  - id: login-empty-fields
    type: negative
  - id: login-sql-injection
    type: security
  - id: login-brute-force
    type: security
  - id: login-spaces-in-username
    type: edge
---

# Login Feature

## Requirements
- User can log in with email and password
- Successful login redirects to /dashboard
- Failed login shows error message "Invalid credentials"
- Account locks after 5 failed attempts
- Password field must be masked
- Login endpoint must use HTTPS

## Scenario: login-success

### Description
Verify that a user with valid credentials can log in successfully.

### Preconditions
- User account exists with known credentials
- User is not currently logged in

### Steps
1. Navigate to /login
2. Enter valid email in email field
3. Enter valid password in password field
4. Click "Sign In" button

### Expected Results
- URL changes to /dashboard
- Welcome message displays user's name
- Auth token is stored in localStorage/cookie
- Token is valid JWT format

## Scenario: login-invalid-credentials

### Description
Verify that invalid credentials show an appropriate error.

### Preconditions
- User is on the login page

### Steps
1. Enter valid email in email field
2. Enter incorrect password in password field
3. Click "Sign In" button

### Expected Results
- Error message "Invalid credentials" is displayed
- URL remains on /login
- No auth token is stored
- Password field is cleared

## Scenario: login-empty-fields

### Description
Verify that empty fields show validation messages.

### Preconditions
- User is on the login page

### Steps
1. Leave email field empty
2. Leave password field empty
3. Click "Sign In" button

### Expected Results
- Validation message "Email is required" appears
- Validation message "Password is required" appears
- No API call is made

## Scenario: login-sql-injection

### Description
Verify that SQL injection attempts are handled safely.

### Preconditions
- User is on the login page

### Steps
1. Enter `' OR 1=1--` in email field
2. Enter any value in password field
3. Click "Sign In" button

### Expected Results
- Error message is displayed (not a SQL error)
- No authentication bypass occurs
- No auth token is stored
- Input is sanitized

## Scenario: login-brute-force

### Description
Verify that repeated failed attempts trigger account protection.

### Preconditions
- User account exists
- No previous failed attempts

### Steps
1. Enter valid email
2. Enter wrong password
3. Click "Sign In"
4. Repeat steps 2-3 four more times (5 total attempts)

### Expected Results
- After 5th failed attempt, account is locked or CAPTCHA is shown
- Subsequent attempts with correct password are blocked
- Failed attempts are logged in audit log

## Scenario: login-spaces-in-username

### Description
Verify that leading/trailing spaces in email are handled.

### Preconditions
- User is on the login page
- User account exists for "user@test.com"

### Steps
1. Enter " user@test.com " (with leading/trailing spaces) in email field
2. Enter valid password
3. Click "Sign In"

### Expected Results
- Email is trimmed and login succeeds, OR
- Validation error indicates invalid email format
- Behavior matches the spec (check with team if not specified)
