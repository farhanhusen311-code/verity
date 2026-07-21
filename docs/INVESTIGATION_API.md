# Investigation API Documentation

Complete API reference for the Digital Investigation System backend.

## Base URL

```
http://localhost:3000/api
```

## API Endpoints

### 1. Create Investigation

**Endpoint:** `POST /investigations`

**Description:** Create a new investigation with at least one identifier.

**Request Body:**

```json
{
  "email": "john@example.com",
  "username": "johndoe",
  "phone": "+1234567890",
  "fullName": "John Doe",
  "website": "https://johndoe.com",
  "domain": "johndoe.com",
  "ipAddress": "192.168.1.1",
  "includeOsint": true,
  "includeLeakDetection": true,
  "includeDomainIntelligence": true,
  "includeSocialMedia": true,
  "notes": "Investigation notes"
}
```

**Required:** At least one of: email, username, phone, fullName, website, domain, ipAddress

**Optional Fields:** All identifier fields and search options default to true

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Investigation created successfully",
  "data": {
    "id": "clm9z5h4k0000qz088f8j9k4m",
    "email": "john@example.com",
    "username": "johndoe",
    "phone": "+1234567890",
    "fullName": "John Doe",
    "website": "https://johndoe.com",
    "domain": "johndoe.com",
    "ipAddress": "192.168.1.1",
    "status": "PENDING",
    "risk": "LOW",
    "findings": null,
    "notes": "Investigation notes",
    "includeOsint": true,
    "includeLeakDetection": true,
    "includeDomainIntelligence": true,
    "includeSocialMedia": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**

- **400 Bad Request:** Missing required fields or invalid data
- **500 Internal Server Error:** Database error

### 2. Get All Investigations

**Endpoint:** `GET /investigations?page=1&limit=10`

**Description:** Retrieve paginated list of all investigations.

**Query Parameters:**
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 10, max 100

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Investigations retrieved successfully",
  "data": {
    "data": [
      {
        "id": "clm9z5h4k0000qz088f8j9k4m",
        "email": "john@example.com",
        "username": null,
        "phone": null,
        "fullName": null,
        "website": null,
        "domain": "johndoe.com",
        "ipAddress": null,
        "status": "COMPLETED",
        "risk": "MEDIUM",
        "findings": null,
        "notes": null,
        "includeOsint": true,
        "includeLeakDetection": true,
        "includeDomainIntelligence": true,
        "includeSocialMedia": true,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T11:00:00.000Z"
      }
    ],
    "total": 42,
    "page": 1,
    "pages": 5
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**

- **400 Bad Request:** Invalid pagination parameters
- **500 Internal Server Error:** Database error

### 3. Get Investigation by ID

**Endpoint:** `GET /investigations/:id`

**Description:** Retrieve a specific investigation by ID.

**URL Parameters:**
- `id` (required): Investigation ID

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Investigation retrieved successfully",
  "data": {
    "id": "clm9z5h4k0000qz088f8j9k4m",
    "email": "john@example.com",
    "username": "johndoe",
    "phone": null,
    "fullName": "John Doe",
    "website": null,
    "domain": "johndoe.com",
    "ipAddress": null,
    "status": "PENDING",
    "risk": "LOW",
    "findings": null,
    "notes": "Investigation notes",
    "includeOsint": true,
    "includeLeakDetection": true,
    "includeDomainIntelligence": true,
    "includeSocialMedia": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**

- **404 Not Found:** Investigation not found
- **500 Internal Server Error:** Database error

### 4. Update Investigation

**Endpoint:** `PATCH /investigations/:id`

**Description:** Update investigation status, risk level, findings, or notes.

**URL Parameters:**
- `id` (required): Investigation ID

**Request Body:**

```json
{
  "status": "COMPLETED",
  "risk": "HIGH",
  "findings": "Found evidence of data breach",
  "notes": "Updated investigation notes"
}
```

**All fields are optional.** Only include fields you want to update.

**Valid Status Values:** PENDING, RUNNING, COMPLETED, FAILED

**Valid Risk Values:** LOW, MEDIUM, HIGH, CRITICAL

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Investigation updated successfully",
  "data": {
    "id": "clm9z5h4k0000qz088f8j9k4m",
    "email": "john@example.com",
    "username": "johndoe",
    "phone": null,
    "fullName": "John Doe",
    "website": null,
    "domain": "johndoe.com",
    "ipAddress": null,
    "status": "COMPLETED",
    "risk": "HIGH",
    "findings": "Found evidence of data breach",
    "notes": "Updated investigation notes",
    "includeOsint": true,
    "includeLeakDetection": true,
    "includeDomainIntelligence": true,
    "includeSocialMedia": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:30:00.000Z"
  },
  "timestamp": "2024-01-15T11:30:00.000Z"
}
```

**Error Responses:**

- **400 Bad Request:** Invalid status or risk value
- **404 Not Found:** Investigation not found
- **500 Internal Server Error:** Database error

### 5. Delete Investigation

**Endpoint:** `DELETE /investigations/:id`

**Description:** Delete an investigation permanently.

**URL Parameters:**
- `id` (required): Investigation ID

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Investigation deleted successfully",
  "data": null,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**

- **404 Not Found:** Investigation not found
- **500 Internal Server Error:** Database error

## Error Response Format

All errors follow this consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## HTTP Status Codes

- **200 OK:** Request successful
- **201 Created:** Investigation created successfully
- **400 Bad Request:** Validation error or invalid input
- **404 Not Found:** Resource not found
- **500 Internal Server Error:** Server error

## Validation Rules

### Email
- Must be valid email format: `user@example.com`

### Username
- 1-255 characters
- Can contain alphanumeric and special characters

### Phone
- Can contain digits, +, -, spaces, and parentheses
- Example: `+1 (234) 567-8900`

### Full Name
- 1-255 characters

### Website
- Must be valid URL format: `https://example.com`

### Domain
- 1-255 characters
- Example: `example.com`

### IP Address
- Must be valid IPv4 or IPv6 address
- Example: `192.168.1.1` or `2001:0db8:85a3::8a2e:0370:7334`

## Example Usage

### cURL Examples

**Create Investigation:**
```bash
curl -X POST http://localhost:3000/api/investigations \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "domain": "example.com",
    "notes": "Initial investigation"
  }'
```

**Get All Investigations:**
```bash
curl http://localhost:3000/api/investigations?page=1&limit=10
```

**Get Investigation by ID:**
```bash
curl http://localhost:3000/api/investigations/clm9z5h4k0000qz088f8j9k4m
```

**Update Investigation:**
```bash
curl -X PATCH http://localhost:3000/api/investigations/clm9z5h4k0000qz088f8j9k4m \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED",
    "risk": "HIGH"
  }'
```

**Delete Investigation:**
```bash
curl -X DELETE http://localhost:3000/api/investigations/clm9z5h4k0000qz088f8j9k4m
```

### JavaScript/Fetch Examples

**Create Investigation:**
```javascript
const response = await fetch('/api/investigations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    domain: 'example.com',
    notes: 'Initial investigation'
  })
});
const data = await response.json();
```

**Get All Investigations:**
```javascript
const response = await fetch('/api/investigations?page=1&limit=10');
const data = await response.json();
console.log(data.data); // Array of investigations
```

## Rate Limiting

Currently no rate limiting is implemented. This may be added in future versions.

## Authentication

Currently no authentication is required. This should be implemented before production deployment.
