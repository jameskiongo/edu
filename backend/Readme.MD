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

### Users & Profiles
| Method | Endpoint                        | Description                       |
|--------|---------------------------------|-----------------------------------|
| GET    | `/api/users/profile`            | Get current user profile          |
| PATCH  | `/api/users/profile`            | Update basic profile info         |
| PATCH  | `/api/users/profile/teacher`    | Update teacher-specific profile   |
| PATCH  | `/api/users/profile/student`    | Update student-specific profile   |
| GET    | `/api/users/teachers`           | List all teachers (Admin only)    |
| GET    | `/api/users/students`           | List all students (Admin only)    |
| PATCH  | `/api/users/role`               | Assign role to user (Admin only)  |
