# React PHP Login Demo

A modern login system with React.js frontend and PHP backend featuring both regular authentication and Google OAuth integration.

## Features

- **Modern UI**: Stylish black, white, and gray theme with glassmorphism effects
- **Dual Authentication**: Regular email/password login and Google OAuth
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Secure Backend**: PHP API with token-based authentication
- **TypeScript**: Full TypeScript support for type safety

## Tech Stack

### Frontend
- React.js 19+ with TypeScript
- Axios for API communication
- Modern CSS with glassmorphism design

### Backend
- PHP with PDO for database operations
- MySQL database
- Token-based authentication
- CORS support for cross-origin requests

## Project Structure

```
react-php-login-demo/
├── frontend/                 # React.js frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # Authentication context
│   │   ├── services/        # API service layer
│   │   └── App.tsx          # Main app component
│   └── package.json
├── backend/                 # PHP backend
│   ├── api/                # API endpoints
│   ├── config/             # Database configuration
│   ├── models/             # Data models
│   └── setup_database.sql  # Database schema
└── README.md
```

## Database Schema

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    token VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- PHP 7.4+
- MySQL 5.7+
- Web server (Apache/Nginx)

### Backend Setup

1. **Environment Configuration**
   Create a `.env` file in the `backend` directory:
   ```env
   DB_NAME=react_php_db
   DB_USER=root
   DB_PASS=your_password
   TOKEN_LENGTH=64
   GOOGLE_CLIENT_ID=your-google-client-id
   JWT_SECRET=your-jwt-secret-key
   DEBUG_MODE=true
   ```

2. **Database Setup**
   ```bash
   mysql -u root -p < backend/setup_database.sql
   ```

3. **Web Server Configuration**
   - Place the `backend` folder in your web server document root
   - Or configure your web server to serve the backend from the project directory
   - Ensure PHP has permission to access the files
   - For development, you can use PHP's built-in server:
     ```bash
     cd backend
     php -S localhost:8000
     ```

### Frontend Setup

1. **Environment Configuration**
   Create a `.env` file in the `frontend` directory:
   ```env
   REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
   REACT_APP_API_BASE_URL=http://localhost:8000/api
   REACT_APP_APP_NAME=React PHP Login Demo
   ```

2. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

## API Endpoints

### Authentication API (`/backend/api/auth.php`)

- `POST ?action=register` - Register new user
- `POST ?action=login` - User login
- `POST ?action=google` - Google OAuth login
- `GET ?action=verify` - Verify token

## Usage

1. **Regular Registration/Login**
   - Users can register with name, email, and password
   - Login with email and password
   - Secure password hashing with PHP's `password_hash()`

2. **Google OAuth**
   - One-click Google authentication
   - Automatic user creation for new Google users
   - Seamless integration with existing users

3. **Token Management**
   - JWT-like token system for session management
   - Automatic token validation
   - Secure logout with token removal

## Security Features

- Password hashing with PHP's built-in functions
- Token-based authentication
- Input sanitization and validation
- CORS protection
- SQL injection prevention with prepared statements

## Development

### Frontend Development
```bash
cd frontend
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
```

### Testing the Application

1. Start your web server and ensure the backend is accessible
2. Start the React development server
3. Navigate to `http://localhost:3000`
4. Test registration, login, and Google authentication features

## Troubleshooting

### Google Login Issues in Chrome

If Google login is not working in Chrome, this is typically caused by browser security features blocking Google's authentication scripts. Here are the common causes and solutions:

#### Common Causes:
1. **Ad blockers** - Extensions like uBlock Origin, AdBlock Plus
2. **Privacy extensions** - Extensions that block tracking scripts
3. **Browser privacy settings** - Enhanced privacy protection
4. **Network filtering** - Corporate firewalls or DNS filtering

#### Solutions:
1. **Disable ad blockers** temporarily for your domain
2. **Check browser extensions** - Disable privacy/security extensions temporarily
3. **Try incognito mode** - This bypasses most extensions
4. **Check developer console** - Look for blocked resource errors
5. **Whitelist domains** - Add `accounts.google.com` to your ad blocker whitelist

#### Debug Information:
The application provides detailed console logging to help identify the issue:
- `Failed to load resource: net::ERR_BLOCKED_BY_CLIENT` - Ad blocker is blocking Google services
- `Google Sign-In script is loaded but API not available` - Script loaded but API blocked
- The app will automatically fall back to mock authentication for testing

#### For Development:
If you need to test without Google services, the application includes a fallback mechanism that uses mock data when Google Sign-In is not available.

### Database Connection Issues

If you see database connection errors:
1. **Check MySQL service** - Ensure MySQL is running
2. **Verify credentials** - Check your `.env` file configuration
3. **Database exists** - Run the setup SQL script
4. **Permissions** - Ensure the database user has proper permissions

For development without database, set `DEBUG_MODE=true` in backend `.env` to enable mock responses.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).