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
│   ├── schema.prisma
│   └── seed.ts
├── public
│   ├── banner.png
│   ├── file.svg
│   └── ...
├── src
│   ├── app
│   │   ├── api
│   │   │   ├── auth
│   │   │   │   ├── login.ts
│   │   │   │   ├── register.ts
│   │   │   │   └── ...
│   │   │   ├── chat
│   │   │   │   ├── createRoom.ts
│   │   │   │   ├── sendMessage.ts
│   │   │   │   └── ...
│   │   │   └── ...
│   │   ├── chat
│   │   │   ├── ChatRoom.tsx
│   │   │   ├── MessageList.tsx
│   │   │   └── ...
│   │   ├── fonts
│   │   ├── login
│   │   │   ├── LoginForm.tsx
│   │   │   └── ...
│   │   ├── register
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ...
│   │   └── ...
│   ├── components
│   │   ├── chat
│   │   │   ├── ChatInput.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   └── ...
│   │   ├── providers
│   │   ├── ui
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── ...
│   │   └── ...
│   ├── hooks
│   ├── lib
│   │   ├── auth.ts
│   │   ├── chat.ts
│   │   ├── utils.ts
│   │   └── ...
│   └── ...
├── docker-compose.yml
├── jest.config.js
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── ...
```

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
