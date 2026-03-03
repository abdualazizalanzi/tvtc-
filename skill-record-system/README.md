# Skill Record System

## Overview

The Skill Record System is an integrated platform designed for managing student activities and training courses at the technical college. It allows students to add extracurricular activities, enroll in training courses, and obtain achievement certificates.

## Features

- User profile management with profile image upload.
- Course management with image support.
- Activity tracking with status updates.
- Certificate management with detailed views.
- CV generation based on user profile and activities.

## Technologies Used

- **Frontend**: React with TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Node.js with Express
- **Database**: SQLite with Drizzle ORM
- **Authentication**: Firebase/Replit Auth
- **File Storage**: Local filesystem (uploads directory)

## Project Structure

```
skill-record-system
├── client
│   ├── src
│   │   ├── pages
│   │   ├── components
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── tsconfig.json
├── server
│   ├── src
│   │   ├── routes.ts
│   │   ├── storage.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── shared
│   └── schema-sqlite.ts
├── uploads
├── package.json
└── tsconfig.json
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd skill-record-system
   ```

2. Install dependencies for the client:
   ```
   cd client
   npm install
   ```

3. Install dependencies for the server:
   ```
   cd ../server
   npm install
   ```

4. Run the server:
   ```
   npm start
   ```

5. Run the client:
   ```
   cd ../client
   npm start
   ```

## Usage

- Access the application through your web browser at `http://localhost:3000`.
- Users can create profiles, upload images, and manage their activities and courses.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.