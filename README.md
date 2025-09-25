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

1. **Database Setup**
   ```bash
   mysql -u root -p < backend/setup_database.sql
   ```

2. **Configure Database**
   Edit `backend/config/database.php` with your database credentials:
   ```php
   private $host = 'localhost';
   private $db_name = 'react_php_login';
   private $username = 'your_username';
   private $password = 'your_password';
   ```

3. **Web Server Configuration**
   - Place the `backend` folder in your web server document root
   - Or configure your web server to serve the backend from the project directory
   - Ensure PHP has permission to access the files

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure API Endpoint**
   Edit `frontend/src/services/api.ts` to match your backend URL:
   ```typescript
   const API_BASE_URL = 'http://your-domain.com/backend/api';
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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).