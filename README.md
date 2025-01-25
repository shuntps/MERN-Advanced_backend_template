`````markdown
# MERN-Advanced_backend_template

This is the backend of a MERN authentication application, developed with Express.js and TypeScript. It handles user authentication using JWT, password hashing, and other essential features for secure user management.

## Features

- User authentication with JWT.
- Password hashing using `bcryptjs`.
- Environment variable management with `dotenv`.
- CORS enabled for secure cross-origin requests.
- MongoDB integration with `mongoose`.
- Email handling with `resend`.
- Input validation using `zod`.
- Scheduled tasks with `node-cron`.
- Cookie management using `cookie-parser`.

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

````/

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
│       └── index.ts  # Entry point of the application
├── .env.example       # Example environment variables
├── package.json       # Project dependencies and scripts
├── tsconfig.json      # TypeScript configuration
└── README.md          # Project documentation
```

## Dependencies

### Main

- **bcryptjs**: Password hashing.
- **cookie-parser**: Parse cookies for session management.
- **cors**: Enable Cross-Origin Resource Sharing.
- **dotenv**: Manage environment variables.
- **express**: Web framework for the server.
- **jsonwebtoken**: Generate and verify JWTs.
- **mongoose**: MongoDB object modeling.
- **node-cron**: Schedule recurring tasks.
- **resend**: Handle email operations.
- **zod**: Schema-based validation.

### Dev

- **TypeScript**: Type-safe JavaScript.
- **ts-node-dev**: Run TypeScript with hot-reloading in development.
- **@types/...**: Type definitions for TypeScript.

## License

This project is licensed under the Apache-2.0 License. See the [LICENSE](LICENSE) file for details.

## Author

Developed by **SHT Labs**.
````
`````
