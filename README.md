# 📝 MERN Form Builder

A full-stack **Form Builder and Management System** built with the **MERN Stack**. Users can create customizable forms, add sections and questions, collaborate with other users using role-based permissions, publish forms publicly, and collect responses.

## 🚀 Features

### 🔐 Authentication
- User registration and login
- JWT-based authentication
- Secure HTTP-only cookies
- Protected API routes
- Password hashing

### 📋 Form Management
- Create forms
- Edit form title and description
- Delete forms
- Add multiple sections
- Add multiple questions
- Mark questions as required
- Support different question types
- Auto-save/update form data

### 👥 Collaboration & Permissions

Form owners can share forms with other registered users.

| Role | Permissions |
|------|-------------|
| **Owner** | Full control |
| **Editor** | View and edit forms |
| **Viewer** | View forms only |

Owners can:
- Share forms with users by email
- Assign Editor or Viewer roles
- Change permissions
- Remove users from a form

### 🌐 Public Forms
- Publish forms publicly
- Generate a unique share ID
- Allow anyone with the public link to access the form
- Unpublish forms when required

### 📊 Responses
- Submit responses to published forms
- Store responses in MongoDB
- Associate authenticated respondents with responses
- Form owners and editors can view responses

---

# 🛠️ Tech Stack

## Frontend

- React
- Vite
- React Router
- Axios
- JavaScript
- CSS

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Cookie Parser
- CORS

## Database

- MongoDB Atlas

---

# 📁 Project Structure

```text
form/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── FormEditor.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── PublicForm.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Responses.jsx
│   │   │
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   │
│   ├── package.json
│   └── package-lock.json
│
├── server/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   └── formController.js
│   │
│   ├── middleware/
│   │   └── auth.js
│   │
│   ├── models/
│   │   ├── Form.js
│   │   ├── FormPermission.js
│   │   ├── Response.js
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── formRoutes.js
│   │
│   ├── utils/
│   │   └── access.js
│   │
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
```

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone https://github.com/SakshamRijal1/Form.git
cd Form
```

---

## 2. Install Frontend Dependencies

```bash
cd client
npm install
```

---

## 3. Install Backend Dependencies

Open another terminal:

```bash
cd server
npm install
```

---

# 🔑 Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secure_jwt_secret

CLIENT_URL=http://localhost:5173
```

### Example

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/formdb
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173
```

> ⚠️ Never commit your `.env` file to GitHub.

Make sure `.gitignore` contains:

```gitignore
node_modules/
.env
```

---

# ▶️ Running the Project

## Start Backend

From the `server` directory:

```bash
npm run dev
```

or:

```bash
npm start
```

The backend will run on:

```text
http://localhost:5000
```

---

## Start Frontend

From the `client` directory:

```bash
npm run dev
```

The frontend will normally run on:

```text
http://localhost:5173
```

---

# 🔄 Application Flow

```text
User
 │
 ▼
Register / Login
 │
 ▼
Dashboard
 │
 ├── Create Form
 │      │
 │      ├── Add Sections
 │      ├── Add Questions
 │      └── Edit Form
 │
 ├── Share Form
 │      │
 │      ├── Editor
 │      └── Viewer
 │
 ├── Publish Form
 │      │
 │      ▼
 │   Public Link
 │
 └── View Responses
```

---

# 🔐 Authorization Flow

The application uses JWT authentication with HTTP-only cookies.

```text
Login
  ↓
Server verifies credentials
  ↓
JWT generated
  ↓
JWT stored in HTTP-only cookie
  ↓
Protected request
  ↓
Authentication middleware
  ↓
User identified
  ↓
Role/permission checked
  ↓
Request allowed or rejected
```

---

# 📡 API Endpoints

## Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

## Forms

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/forms` | Create a form |
| GET | `/api/forms` | Get user's forms |
| GET | `/api/forms/:id` | Get a form |
| PUT | `/api/forms/:id` | Update a form |
| DELETE | `/api/forms/:id` | Delete a form |
| POST | `/api/forms/:id/publish` | Publish form |
| POST | `/api/forms/:id/unpublish` | Unpublish form |
| GET | `/api/forms/public/:shareId` | Get public form |
| POST | `/api/forms/public/:shareId/respond` | Submit response |

---

# 👥 Permission System

The application uses role-based access control.

### Owner

The owner can:

- Edit the form
- Delete the form
- Publish/unpublish
- Manage permissions
- View responses

### Editor

Editors can:

- View the form
- Edit the form
- View responses

Editors cannot:

- Delete the form
- Publish/unpublish
- Manage permissions

### Viewer

Viewers can:

- View the form

Viewers cannot:

- Edit
- Delete
- Publish
- Manage permissions
- View responses

---

# 🗄️ Database Models

## User

Stores user authentication information.

```text
User
├── name
├── email
└── password
```

## Form

Stores form information.

```text
Form
├── title
├── description
├── owner
├── sections
├── published
└── shareId
```

## FormPermission

Stores collaboration permissions.

```text
FormPermission
├── form
├── user
└── role
```

## Response

Stores submitted form responses.

```text
Response
├── form
├── respondent
└── answers
```

---

# 🧩 Question Types

The form system is designed to support different question types such as:

- Short Answer
- Long Answer
- Multiple Choice
- Checkbox
- Dropdown

Additional question types can be added easily through the form schema and frontend editor.

---

# 🔒 Security

The application implements several security practices:

- Password hashing with bcrypt
- JWT authentication
- HTTP-only authentication cookies
- Protected backend routes
- Role-based authorization
- Environment variables for secrets
- CORS configuration
- MongoDB validation

---

# 📱 Future Improvements

Possible future features include:

- Drag-and-drop form builder
- More question types
- Form templates
- Form analytics
- Response charts
- Export responses to CSV/Excel
- Email notifications
- Real-time collaboration
- Form duplication
- Custom themes
- File upload questions
- Form submission limits
- Advanced admin dashboard

---

# 🎯 Project Goals

The main goal of this project is to build a flexible alternative to traditional online form systems while learning and implementing real-world full-stack concepts.

The project focuses on:

- Full-stack development
- REST API development
- Authentication
- Authorization
- Database design
- Role-based access control
- React state management
- API integration
- Secure application architecture

---

# 👨‍💻 Author

**Samit Chedi Jaal**

Computer Engineering Student  
MERN Stack Developer • Backend Enthusiast • Problem Solver

---

# ⭐ Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create a new branch

```bash
git checkout -b feature/new-feature
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push the branch

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

# 📄 License

This project is open source and available for educational and development purposes.