# Node.js User Authentication API

Simple REST API for user authentication using Node.js, Express and MySQL.

## Features

- User signup
- User login
- JWT authentication
- Password hashing with salt
- Get user profile
- Get all users
- Get user by id
- Update user
- Delete user

## Technologies

- Node.js
- Express.js
- MySQL
- JWT
- Zod validation

## Installation

Install dependencies:

npm install

Run server:

npm run dev

## Environment variables

Create `.env` file:

PORT=8000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=nodejs_projekat
JWT_SECRET=supersecretkey

## API Routes

POST /users/signup  
POST /users/login  
GET /users/profile  
GET /users  
GET /users/:id  
PUT /users/:id  
DELETE /users/:id

## Authentication

Protected routes require header:

Authorization: Bearer TOKEN
