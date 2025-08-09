# 🏦 Bank API

REST API developed in JavaScript with Express for basic banking operations. This API was created specifically for learning API-level testing and automation.

## 📋 Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Endpoints](#endpoints)
- [Business Rules](#business-rules)
- [Project Structure](#project-structure)
- [Usage Examples](#usage-examples)
- [Testing](#testing)
- [Documentation](#documentation)

## ✨ Features

- ✅ **JWT Authentication** - Secure login with tokens
- ✅ **User registration** - Create new accounts
- ✅ **User queries** - List and search users
- ✅ **Transfers** - Transfer system between accounts
- ✅ **Bank statement** - Transaction history
- ✅ **Favorites list** - Manage favorite contacts
- ✅ **Balance inquiry** - Check current balance
- ✅ **Swagger documentation** - Fully documented API
- ✅ **Data validation** - Robust input validation
- ✅ **Layered architecture** - Controller, Service, Repository
- ✅ **In-memory database** - Data stored in variables

## 🛠️ Technologies

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **JWT** - Token authentication
- **bcryptjs** - Password encryption
- **Swagger** - API documentation
- **express-validator** - Data validation
- **Mocha** - Testing framework
- **Chai** - Assertion library
- **Sinon** - Mocks and stubs
- **Supertest** - API testing

## 📋 Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

## 🚀 Installation

1. **Clone the repository or extract the files:**
   ```bash
   cd banco-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

4. **Access the API:**
   - Server: http://localhost:3000
   - Documentation: http://localhost:3000/api-docs
   - Status: http://localhost:3000/health

## ⚙️ Configuration

### Environment Variables (Optional)

Create a `.env` file in the project root:

```env
PORT=3000
JWT_SECRET=your-jwt-secret-here
```

### Initial Data

The API starts with two example users:

| Username | Password | Email | Balance | Favorites |
|----------|----------|-------|---------|-----------|
| admin | password | admin@example.com | $10,000.00 | [user1] |
| user1 | password | user1@example.com | $5,000.00 | [] |

## 📖 Usage

### 1. User Registration

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "password123",
    "email": "new@email.com"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password"
  }'
```

### 3. Use Authentication Token

```bash
curl -X GET http://localhost:3000/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 🛣️ Endpoints

### 🔐 Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | Login | ❌ |
| GET | `/auth/verify` | Verify token | ✅ |

### 👥 Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users` | List all users | ✅ |
| GET | `/users/me` | Logged user data | ✅ |
| GET | `/users/:id` | Find user by ID | ✅ |
| PUT | `/users/:id` | Update user data | ✅ |
| GET | `/users/saldo` | Check balance | ✅ |
| POST | `/users/favorecidos` | Add favorite | ✅ |
| DELETE | `/users/favorecidos/:id` | Remove favorite | ✅ |

### 💰 Transactions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/transactions/transfer` | Make transfer | ✅ |
| GET | `/transactions/extrato` | Check statement | ✅ |
| GET | `/transactions/:id` | Find transaction by ID | ✅ |
| GET | `/transactions` | List all transactions | ✅ |
| GET | `/transactions/stats` | Transaction statistics | ✅ |

### 📊 System

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/health` | API status | ❌ |
| GET | `/api-docs` | Swagger documentation | ❌ |
| GET | `/swagger.json` | Swagger JSON | ❌ |

## ⚖️ Business Rules

### 🔐 Authentication and Registration
1. **Mandatory login**: Username and password are required to login
2. **Unique users**: Cannot register users with duplicate username or email
3. **Secure password**: Passwords are encrypted with bcrypt
4. **JWT token**: Authentication via JWT token with 24-hour expiration

### 💸 Transfers
1. **Limit for non-favorites**: Transfers to users who are not marked as "favorites" are limited to **$5,000.00**
2. **Sufficient balance**: User must have sufficient balance to make the transfer
3. **Valid recipient**: Recipient must exist in the system
4. **Self-transfer**: Cannot transfer to yourself

### 👥 Users
1. **Initial balance**: New users start with $1,000.00
2. **Favorites**: Users can manage their favorites list
3. **Sensitive data**: Passwords are never returned in API responses

## 📁 Project Structure

```
banco-api/
├── 📁 config/
│   └── database.js          # In-memory database configuration
├── 📁 controllers/
│   ├── authController.js    # Authentication controller
│   ├── userController.js    # User controller
│   └── transactionController.js # Transaction controller
├── 📁 services/
│   ├── authService.js       # Authentication logic
│   ├── userService.js       # User logic
│   └── transactionService.js # Transaction logic
├── 📁 repositories/
│   ├── userRepository.js    # User data access
│   └── transactionRepository.js # Transaction data access
├── app.js                   # Express application configuration
├── server.js               # HTTP server
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## 💡 Usage Examples

### Complete Usage Flow

1. **Register a new user:**

```javascript
const response = await fetch('http://localhost:3000/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'testuser',
    password: 'test123',
    email: 'test@email.com'
  })
});
```

2. **Login:**

```javascript
const loginResponse = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'testuser',
    password: 'test123'
  })
});

const { token } = await loginResponse.json();
```

3. **Check balance:**

```javascript
const balanceResponse = await fetch('http://localhost:3000/users/saldo', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

4. **Make transfer:**

```javascript
const transferResponse = await fetch('http://localhost:3000/transactions/transfer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    destinatarioId: 2,
    valor: 100.50,
    descricao: 'Service payment'
  })
});
```

5. **Check statement:**

```javascript
const statementResponse = await fetch('http://localhost:3000/transactions/extrato?limit=5', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## 🧪 Testing

This API uses **Mocha** as testing framework, **Chai** for assertions, **Sinon** for mocks/stubs and **Supertest** for API testing. The `app.js` file exports the Express application without the `listen()` method, allowing isolated tests.

### Run Tests

```bash
# Run all tests
npm test

# Run specific tests
npm run test:controllers    # Controller tests
npm run test:services       # Service tests (with Sinon)
npm run test:integration   # Integration tests
npm run test:system        # System tests

# Generate beautiful HTML report
npm run test:report         # Creates report in test-results/test-report.html
```

### 📊 Online Reports (GitHub Pages)

Test reports are automatically published on **GitHub Pages** with each push to the `main` branch:

- 🏠 **Main Dashboard**: Page with statistics and links
- 📊 **HTML Report**: Interactive report with Mochawesome  
- 📈 **JSON Data**: Structured data for integration

**How to access:**
1. Push code to the `main` branch
2. Wait for workflow to complete (~2 minutes)
3. Access: `https://[your-username].github.io/[repo-name]/`

> 📋 See [GITHUB-PAGES.md](GITHUB-PAGES.md) for detailed configuration instructions

### Test Example

```javascript
const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
const app = require('./app');

describe('Auth Endpoints', () => {
  afterEach(() => {
    sinon.restore(); // Important: always clean mocks/stubs
  });

  it('should register a new user', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        username: 'testuser',
        password: 'test123',
        email: 'test@email.com'
      });

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('user');
  });
});
```

## 📚 Documentation

### Swagger UI

Access the interactive API documentation at: **http://localhost:3000/api-docs**

The Swagger documentation includes:
- ✅ All available endpoints
- ✅ Request/response schemas
- ✅ Usage examples
- ✅ HTTP status codes
- ✅ Data models
- ✅ Interface to test the API

### JSON Schema

The Swagger JSON schema is available at: **http://localhost:3000/swagger.json**

## 🚨 HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | ✅ Success |
| 201 | ✅ Resource created |
| 400 | ❌ Invalid data |
| 401 | ❌ Unauthorized |
| 403 | ❌ Access denied |
| 404 | ❌ Resource not found |
| 500 | ❌ Internal server error |

## 🔧 Troubleshooting

### Common Issues

1. **Port 3000 already in use:**
   ```bash
   # Use a different port
   PORT=3001 npm start
   ```

2. **Invalid JWT token:**
   - Check if token is being sent in the `Authorization: Bearer <token>` header
   - Tokens expire in 24 hours, login again

3. **Transfer denied:**
   - Check if recipient exists
   - Confirm sufficient balance
   - For amounts > $5,000.00, recipient must be in favorites list

4. **User already exists:**
   - Username and email must be unique in the system

## 🤝 Contributing

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## 📄 License

This project is under the MIT license. See the `LICENSE` file for more details.

## 👨‍💻 Author

Developed for educational purposes - Learning API testing and automation.

---

**🎯 Objective**: This API was created specifically to learn and practice automated testing at the API level, providing a controlled environment with well-defined business rules to exercise diverse testing scenarios.