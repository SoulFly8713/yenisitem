# API Contracts - Soulfly871 Portfolio

## Frontend-Backend Integration Protocol

### Current Mock Data (mock.js)
- mockProjects: Projects with video links, categories
- mockTestimonials: Customer testimonials
- mockUser: User authentication data
- mockAbout: About/bio information

### Backend Implementation Plan

---

## 1. AUTHENTICATION API

### POST /api/auth/register
**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```
**Response:**
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "role": "user|admin",
    "isCustomer": false
  },
  "message": "Kayıt başarılı"
}
```

### POST /api/auth/login
**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```
**Response:**
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "role": "user|admin",
    "isCustomer": boolean
  },
  "token": "jwt_token",
  "message": "Giriş başarılı"
}
```

### GET /api/auth/me
**Headers:** Authorization: Bearer {token}
**Response:**
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "role": "string",
    "isCustomer": boolean
  }
}
```

---

## 2. PROJECTS API

### GET /api/projects
**Response:**
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "videoUrl": "string",
    "videoId": "string",
    "category": "string",
    "featured": boolean,
    "isService": boolean,
    "createdAt": "date"
  }
]
```

### POST /api/projects (Admin Only)
**Headers:** Authorization: Bearer {token}
**Request:**
```json
{
  "title": "string",
  "description": "string",
  "videoUrl": "string",
  "videoId": "string",
  "category": "string",
  "featured": boolean,
  "isService": boolean
}
```

### PUT /api/projects/{id} (Admin Only)
**Headers:** Authorization: Bearer {token}
**Request:** Same as POST

### DELETE /api/projects/{id} (Admin Only)
**Headers:** Authorization: Bearer {token}

---

## 3. TESTIMONIALS API

### GET /api/testimonials
**Response:**
```json
[
  {
    "id": "string",
    "author": "string",
    "role": "string",
    "content": "string",
    "rating": number,
    "date": "date",
    "isCustomer": boolean,
    "userId": "string"
  }
]
```

### POST /api/testimonials (Customer Only)
**Headers:** Authorization: Bearer {token}
**Request:**
```json
{
  "content": "string",
  "rating": number
}
```

### DELETE /api/testimonials/{id} (Admin Only)
**Headers:** Authorization: Bearer {token}

---

## 4. USERS API (Admin Only)

### GET /api/users
**Headers:** Authorization: Bearer {token}
**Response:**
```json
[
  {
    "id": "string",
    "username": "string",
    "role": "string",
    "isCustomer": boolean,
    "createdAt": "date"
  }
]
```

### PUT /api/users/{id}/customer
**Headers:** Authorization: Bearer {token}
**Request:**
```json
{
  "isCustomer": boolean
}
```

---

## 5. SETTINGS API

### GET /api/settings
**Response:**
```json
{
  "title": "string",
  "bio": "string",
  "skills": ["string"],
  "discord": "string"
}
```

### PUT /api/settings (Admin Only)
**Headers:** Authorization: Bearer {token}
**Request:** Same as GET response

---

## MongoDB Models

### User Model
```javascript
{
  _id: ObjectId,
  username: String (unique),
  password: String (hashed),
  role: String (enum: ['user', 'admin']),
  isCustomer: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Project Model
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  videoUrl: String,
  videoId: String,
  category: String,
  featured: Boolean,
  isService: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Testimonial Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  author: String,
  role: String,
  content: String,
  rating: Number,
  isCustomer: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Settings Model
```javascript
{
  _id: ObjectId,
  title: String,
  bio: String,
  skills: [String],
  discord: String,
  updatedAt: Date
}
```

---

## Frontend Integration Steps

### 1. Remove Mock Data
- Delete mock.js imports from components
- Replace useState with API calls

### 2. Create API Service
- Create `/app/frontend/src/services/api.js`
- Implement axios instance with base URL
- Add auth interceptors

### 3. Update Components
- **Home.jsx**: Fetch projects from API
- **Testimonials.jsx**: Fetch/post testimonials via API
- **Admin.jsx**: All CRUD operations via API
- **Login.jsx**: Call auth endpoints
- **App.js**: Check auth status on mount

### 4. Authentication Flow
- Store JWT token in localStorage
- Add Authorization header to all requests
- Redirect to login if unauthorized

---

## Initial Data Seeding

On first run, seed database with:
- Admin user: soulfly871 / soul1453
- Mock projects from mock.js
- Mock testimonials from mock.js
- Default settings with bio and skills
