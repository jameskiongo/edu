| Method | Endpoint                        | Description                |
|--------|---------------------------------|----------------------------|
| POST   | `/api/auth/register`            | Register new user          |
| POST   | `/api/auth/login`               | Initiate login (sends OTP) |
| POST   | `/api/auth/verify-login`        | Complete login with OTP    |
| POST   | `/api/auth/verify-registration` | Verify account with OTP    |
| POST   | `/api/auth/refresh-token`       | Get new access token       |
| POST   | `/api/auth/logout`              | Logout current session     |
| POST   | `/api/auth/logout-all`          | Logout all devices         |
| POST   | `/api/auth/forgot-password`     | Request password reset     |
| POST   | `/api/auth/reset-password`      | Reset password with OTP    |
| POST   | `/api/auth/resend-otp`          | Resend OTP code            |
