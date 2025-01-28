# MERN-Advanced_backend_template

This is the backend of a MERN authentication application, developed with Express.js and TypeScript. It provides robust user authentication, secure session handling, and various advanced features such as IP tracking, email validation, and cron jobs.

## Features

- **User Authentication**:
  - Secure login with JWT.
  - Password hashing using `bcryptjs`.
  - Refresh tokens stored in cookies for secure session management.
- **Data Validation**:
  - Input validation using `zod` schemas.
- **Database**:
  - MongoDB integration using `mongoose`.
  - IP tracking with history management (limited to 5 most recent IPs).
- **Email Handling**:
  - Email sending and verification using `resend`.
- **Scheduled Tasks**:
  - Cron jobs powered by `node-cron` for automated tasks (e.g., cleaning expired sessions).
- **Security Features**:
  - CORS enabled for secure cross-origin requests.
  - Environment variable management with `dotenv`.

## Requirements

- Node.js (v16 or higher recommended)
- npm or yarn
- MongoDB instance

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/shuntps/MERN-Advanced_backend_template.git
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:

   - Copy the `.env.example` file to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update the `.env` file with your configuration (e.g., database URL, JWT secret, etc.).

4. Run the development server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev`: Start the development server with hot-reloading.
- `npm run build`: Compile TypeScript to JavaScript and copy `package.json` to the `dist` folder.
- `npm start`: Start the production server.

## Project Structure

```
backend/
├── src/
│   └── 0.0.2/
│       ├── index.ts          # Entry point of the application
│       ├── controllers/      # Contains route logic (e.g., auth.controller.ts)
│       ├── middlewares/      # Custom middlewares (e.g., errorHandler.ts)
│       ├── models/           # Mongoose models (e.g., user.models.ts)
│       ├── schemas/          # Zod validation schemas (e.g., auth.schema.ts)
│       ├── services/         # Business logic (e.g., auth.service.ts)
│       └── constants/        # App constants (e.g., error codes)
├── .env.example              # Example environment variables
├── package.json              # Project dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # Project documentation
```

## Dependencies

### Main Dependencies

- **bcryptjs**: For password hashing.
- **cookie-parser**: Parse cookies for session management.
- **cors**: Enable Cross-Origin Resource Sharing.
- **dotenv**: Manage environment variables.
- **express**: Web framework for building APIs.
- **jsonwebtoken**: Handle JWT creation and verification.
- **mongoose**: MongoDB object modeling tool.
- **node-cron**: Schedule recurring tasks.
- **resend**: Send and handle email operations.
- **uuid**: Generate unique identifiers.
- **zod**: Perform schema-based data validation.

### Development Dependencies

- **TypeScript**: A strongly typed programming language for JavaScript.
- **ts-node-dev**: Run TypeScript with hot-reloading for development.
- **@types/...**: TypeScript type definitions for various dependencies.

## License

This project is licensed under the Apache-2.0 License. See the [LICENSE](LICENSE) file for details.

## Author

Developed by **SHT Labs**.
