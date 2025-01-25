# Projekt PK

Projekt PK is a modern web application built with Next.js, TypeScript, and
Tailwind CSS. It includes features such as user authentication, real-time chat,
and various UI components.

## Features

- **User Authentication**: Secure login, registration, and logout
  functionalities.
- **Real-time Chat**: Create and join chat rooms, send and receive messages in
  real-time.
- **UI Components**: Reusable UI components such as buttons, cards, inputs, and
  more.
- **API Routes**: RESTful API endpoints for user and chat management.
- **Database Integration**: Prisma ORM for database management and migrations.
- **Testing**: Unit and integration tests using Jest and Vitest.

## Project Structure

```text
├── prisma
│   ├── migrations
│   │   ├── 20241219172426_init
│   │   │   └── migration.sql
│   │   ├── 20241219183630_add_user_password_to_entity
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   ├── schema.prisma
│   └── seed.ts
├── public
│   ├── banner.png
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src
│   ├── app
│   │   ├── api
│   │   │   ├── auth
│   │   │   │   ├── login.ts
│   │   │   │   ├── register.ts
│   │   │   │   ├── logout.ts
│   │   │   │   ├── user.ts
│   │   │   │   └── __tests__
│   │   │   │       └── auth.test.ts
│   │   │   ├── chats
│   │   │   │   ├── create.ts
│   │   │   │   ├── [chatId]
│   │   │   │   │   ├── messages.ts
│   │   │   │   └── __tests__
│   │   │   │       └── chats.test.ts
│   │   │   └── users
│   │   │       └── route.ts
│   │   ├── chat
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── [chatId]
│   │   │   │   └── page.tsx
│   │   ├── fonts
│   │   │   ├── GeistMonoVF.woff
│   │   │   └── GeistVF.woff
│   │   ├── login
│   │   │   └── page.tsx
│   │   ├── register
│   │   │   └── page.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components
│   │   ├── chat
│   │   │   ├── ChatContent.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   └── NewChatButton.tsx
│   │   ├── providers
│   │   │   └── SWRProvider.tsx
│   │   ├── ui
│   │   │   ├── avatar.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   └── scroll-area.tsx
│   ├── hooks
│   │   ├── useAuth.ts
│   │   ├── useChats.ts
│   │   ├── useMessages.ts
│   │   ├── useSocket.ts
│   │   ├── useUsers.ts
│   │   └── __tests__
│   │       └── useAuth.test.tsx
│   ├── lib
│   │   ├── auth
│   │   │   ├── auth.ts
│   │   │   ├── redis.ts
│   │   │   └── __tests__
│   │   │       ├── auth.test.ts
│   │   │       └── redis.test.ts
│   │   ├── prisma.ts
│   │   ├── utils.ts
│   │   └── __mocks__
│   │       └── @prisma
│   │           └── client.ts
│   └── middleware.ts
├── docker-compose.yml
├── jest.config.js
├── jest.setup.js
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── server.ts
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.server.json
└── vitest.config.ts
```

### Folder and File Descriptions

- **prisma**: Contains Prisma ORM configuration and migration files.
  - `migrations`: Directory for database migration files.
  - `schema.prisma`: Prisma schema definition.
  - `seed.ts`: Script for seeding the database.

- **public**: Static assets such as images and icons.
  - `banner.png`, `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`,
    `window.svg`: Various image files used in the application.

- **src**: Main source code directory.
  - **app**: Application-specific code.
    - `api`: API route handlers.
      - `auth`: Authentication-related API routes.
        - `login.ts`, `register.ts`, `logout.ts`, `user.ts`: Handlers for
          authentication endpoints.
        - `__tests__`: Tests for authentication API routes.
      - `chats`: Chat-related API routes.
        - `create.ts`: Handler for creating chat rooms.
        - `[chatId]`: Dynamic route for chat messages.
          - `messages.ts`: Handler for chat messages.
        - `__tests__`: Tests for chat API routes.
      - `users`: User-related API routes.
        - `route.ts`: Handler for user endpoints.
    - `chat`: Chat-related pages and components.
      - `layout.tsx`, `page.tsx`: Layout and main page for chat.
      - `[chatId]`: Dynamic route for individual chat rooms.
        - `page.tsx`: Page for individual chat rooms.
    - `fonts`: Custom fonts used in the application.
      - `GeistMonoVF.woff`, `GeistVF.woff`: Font files.
    - `login`: Login page.
      - `page.tsx`: Login page component.
    - `register`: Registration page.
      - `page.tsx`: Registration page component.
    - `favicon.ico`: Favicon for the application.
    - `globals.css`: Global CSS styles.
    - `layout.tsx`: Main layout component.
    - `page.tsx`: Main page component.
  - **components**: Reusable UI components.
    - `chat`: Components related to chat functionality.
      - `ChatContent.tsx`, `ChatInput.tsx`, `ChatMessage.tsx`,
        `NewChatButton.tsx`: Chat components.
    - `providers`: Context providers.
      - `SWRProvider.tsx`: SWR context provider.
    - `ui`: General UI components.
      - `avatar.tsx`, `button.tsx`, `card.tsx`, `input.tsx`, `label.tsx`,
        `scroll-area.tsx`: UI components.
  - **hooks**: Custom React hooks.
    - `useAuth.ts`, `useChats.ts`, `useMessages.ts`, `useSocket.ts`,
      `useUsers.ts`: Custom hooks.
    - `__tests__`: Tests for custom hooks.
      - `useAuth.test.tsx`: Tests for `useAuth` hook.
  - **lib**: Library code and utilities.
    - `auth`: Authentication-related utilities.
      - `auth.ts`, `redis.ts`: Authentication utilities.
      - `__tests__`: Tests for authentication utilities.
        - `auth.test.ts`, `redis.test.ts`: Tests for authentication utilities.
    - `prisma.ts`: Prisma client instance.
    - `utils.ts`: General utility functions.
    - `__mocks__`: Mock implementations for testing.
      - `@prisma`: Mock Prisma client.
        - `client.ts`: Mock Prisma client implementation.
  - `middleware.ts`: Middleware configuration.

- **docker-compose.yml**: Docker Compose configuration file.
- **jest.config.js**: Jest configuration file.
- **jest.setup.js**: Jest setup file.
- **next.config.ts**: Next.js configuration file.
- **package-lock.json**: NPM package lock file.
- **package.json**: NPM package configuration file.
- **postcss.config.mjs**: PostCSS configuration file.
- **server.ts**: Server configuration file.
- **tailwind.config.ts**: Tailwind CSS configuration file.
- **tsconfig.json**: TypeScript configuration file.
- **tsconfig.server.json**: TypeScript configuration file for the server.
- **vitest.config.ts**: Vitest configuration file.

## Getting Started

### Prerequisites

- Node.js

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/projekt-pk.git
   cd projekt-pk
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Run the development server:
   ```sh
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

## Running Tests

To run the tests, use the following command:

```sh
npm test
```

## Usage

### Authentication

- **Register**: Navigate to `/register` and fill out the registration form.
- **Login**: Navigate to `/login` and fill out the login form.
- **Logout**: Click the logout button in the user menu.

### Chat

- **Create a Chat Room**: Navigate to the chat section and click on "Create
  Room".
- **Join a Chat Room**: Select an existing chat room from the list.
- **Send a Message**: Type your message in the input field and press enter.

## License

This project is licensed under the MIT License.
