# Meta Business API Technical Specification

## API Endpoints Specification

### Authentication

#### Connect Meta Business Account
```
POST /api/meta/auth/connect
```

**Request Body:**
```json
{
  "code": "string",  // Authorization code from Meta OAuth flow
  "redirectUri": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accountId": "uuid",
    "status": "connected",
    "permissions": ["whatsapp_business_messaging", "pages_read", "instagram_basic"]
  }
}
```

#### Get Connection Status
```
GET /api/meta/auth/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "connected": true,
    "accountId": "string",
    "expiresAt": "ISO-date",
    "permissions": ["whatsapp_business_messaging", "pages_read", "instagram_basic"],
    "platforms": {
      "whatsapp": true,
      "facebook": true,
      "instagram": false
    }
  }
}
```

#### Refresh Access Token
```
POST /api/meta/auth/refresh-token
```

**Request Body:**
```json
{
  "accountId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "expiresAt": "ISO-date"
  }
}
```

### WhatsApp Business API

#### Get Account Details
```
GET /api/meta/whatsapp/account
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "wabaId": "string",
    "phoneNumberId": "string",
    "phoneNumber": "string",
    "displayName": "string",
    "status": "string",
    "businessProfile": {
      "about": "string",
      "address": "string",
      "description": "string",
      "email": "string",
      "websites": ["string"],
      "profilePictureUrl": "string"
    },
    "qualityRating": "string",
    "createdAt": "ISO-date"
  }
}
```

#### Get Templates
```
GET /api/meta/whatsapp/templates
```

**Query Parameters:**
- `status` (optional): Filter templates by status (approved, in_review, rejected)
- `category` (optional): Filter templates by category
- `limit` (optional): Number of results to return
- `offset` (optional): Offset for pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "uuid",
        "templateId": "string",
        "name": "string",
        "language": "string",
        "category": "string",
        "status": "string",
        "components": [
          {
            "type": "HEADER|BODY|FOOTER|BUTTONS",
            "text": "string",
            "format": "TEXT|IMAGE|VIDEO|DOCUMENT|LOCATION",
            "example": {}
          }
        ],
        "createdAt": "ISO-date",
        "updatedAt": "ISO-date"
      }
    ],
    "pagination": {
      "total": 100,
      "limit": 10,
      "offset": 0,
      "nextOffset": 10
    }
  }
}
```

#### Create Template
```
POST /api/meta/whatsapp/templates
```

**Request Body:**
```json
{
  "name": "string",
  "language": "string",
  "category": "string",
  "components": [
    {
      "type": "HEADER|BODY|FOOTER|BUTTONS",
      "text": "string",
      "format": "TEXT|IMAGE|VIDEO|DOCUMENT|LOCATION",
      "example": {}
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "templateId": "string",
    "name": "string",
    "status": "PENDING",
    "createdAt": "ISO-date"
  }
}
```

#### Update Template
```
PUT /api/meta/whatsapp/templates/:id
```

**Request Body:**
```json
{
  "name": "string",
  "language": "string",
  "category": "string",
  "components": [
    {
      "type": "HEADER|BODY|FOOTER|BUTTONS",
      "text": "string",
      "format": "TEXT|IMAGE|VIDEO|DOCUMENT|LOCATION",
      "example": {}
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "PENDING"
  }
}
```

#### Get Metrics
```
GET /api/meta/whatsapp/metrics
```

**Query Parameters:**
- `startDate`: ISO date string
- `endDate`: ISO date string
- `granularity`: "day" | "hour"
- `metrics`: Array of metric names (e.g., "sent", "delivered", "read")

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "sent": [
        {
          "timestamp": "ISO-date",
          "value": 100
        }
      ],
      "delivered": [
        {
          "timestamp": "ISO-date",
          "value": 98
        }
      ]
    },
    "totals": {
      "sent": 1000,
      "delivered": 980,
      "deliveryRate": 0.98
    }
  }
}
```

### Facebook API

#### Get Connected Pages
```
GET /api/meta/facebook/pages
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pages": [
      {
        "id": "uuid",
        "pageId": "string",
        "name": "string",
        "category": "string",
        "pictureUrl": "string",
        "status": "string",
        "createdAt": "ISO-date"
      }
    ]
  }
}
```

#### Connect Facebook Page
```
POST /api/meta/facebook/pages/:pageId/connect
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "pageId": "string",
    "status": "connected"
  }
}
```

#### Get Page Posts
```
GET /api/meta/facebook/posts
```

**Query Parameters:**
- `pageId`: ID of the Facebook page
- `limit` (optional): Number of results to return
- `before` (optional): Cursor for pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "string",
        "message": "string",
        "createdTime": "ISO-date",
        "type": "string",
        "permalinkUrl": "string",
        "picture": "string",
        "likes": 42,
        "comments": 7
      }
    ],
    "pagination": {
      "before": "string",
      "after": "string"
    }
  }
}
```

#### Create Post
```
POST /api/meta/facebook/posts
```

**Request Body:**
```json
{
  "pageId": "string",
  "message": "string",
  "link": "string",
  "published": true,
  "scheduledPublishTime": "ISO-date"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "permalinkUrl": "string"
  }
}
```

### Instagram API

#### Get Connected Accounts
```
GET /api/meta/instagram/accounts
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accounts": [
      {
        "id": "uuid",
        "igAccountId": "string",
        "username": "string",
        "profilePicture": "string",
        "status": "string",
        "createdAt": "ISO-date"
      }
    ]
  }
}
```

#### Connect Instagram Account
```
POST /api/meta/instagram/accounts/:accountId/connect
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "igAccountId": "string",
    "status": "connected"
  }
}
```

#### Get Instagram Media
```
GET /api/meta/instagram/media
```

**Query Parameters:**
- `accountId`: ID of the Instagram account
- `limit` (optional): Number of results to return
- `before` (optional): Cursor for pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "media": [
      {
        "id": "string",
        "mediaType": "IMAGE|VIDEO|CAROUSEL_ALBUM",
        "mediaUrl": "string",
        "permalink": "string",
        "caption": "string",
        "timestamp": "ISO-date",
        "likes": 42,
        "comments": 7
      }
    ],
    "pagination": {
      "before": "string",
      "after": "string"
    }
  }
}
```

### Webhook Management

#### Get Webhook Configuration
```
GET /api/meta/webhook
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "verifyToken": "string",
    "targetUrl": "string",
    "fields": {
      "messages": true,
      "message_deliveries": true,
      "messaging_postbacks": false
    },
    "status": "string",
    "createdAt": "ISO-date",
    "updatedAt": "ISO-date"
  }
}
```

#### Configure Webhook
```
POST /api/meta/webhook/configure
```

**Request Body:**
```json
{
  "verifyToken": "string",
  "fields": {
    "messages": true,
    "message_deliveries": true,
    "messaging_postbacks": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "active",
    "fields": {
      "messages": true,
      "message_deliveries": true,
      "messaging_postbacks": false
    }
  }
}
```

#### Webhook Event Endpoint
```
POST /api/meta/webhook/events
```

This endpoint is called by Meta to deliver webhook events. It should implement verification and handle various event types.

**Request Body (from Meta):**
```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "PHONE_NUMBER",
              "phone_number_id": "PHONE_NUMBER_ID"
            },
            "contacts": [
              {
                "profile": {
                  "name": "CONTACT_NAME"
                },
                "wa_id": "CONTACT_WHATSAPP_ID"
              }
            ],
            "messages": [
              {
                "from": "CONTACT_WHATSAPP_ID",
                "id": "MESSAGE_ID",
                "timestamp": "TIMESTAMP",
                "text": {
                  "body": "MESSAGE_BODY"
                },
                "type": "text"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

**Response:**
Should return HTTP 200 OK for successful verification or event processing.

## Implementation Notes

### Authentication Flow
1. Implement OAuth 2.0 flow for Meta integration
2. Store access tokens securely with encryption
3. Implement automatic token refresh before expiration
4. Track permission scopes and handle permission changes

### Error Handling
1. Implement standardized error responses:
   ```json
   {
     "success": false,
     "error": {
       "code": "ERROR_CODE",
       "message": "Human readable error message",
       "details": {}
     }
   }
   ```
2. Handle rate limiting with exponential backoff
3. Implement circuit breakers for Meta API calls
4. Log detailed errors for debugging

### Security Requirements
1. All API endpoints must require authentication
2. Webhook endpoints must validate Meta signatures
3. Encrypt sensitive data at rest, especially tokens
4. Implement proper CORS configuration for API endpoints

### Database Considerations
1. Use transactions for operations that modify multiple tables
2. Implement soft deletes for important resources
3. Create indexes for frequently queried fields
4. Consider sharding for high-volume message storage

### Performance Optimization
1. Cache frequently accessed Meta data
2. Use queue workers for processing webhook events
3. Implement batch operations where possible
4. Use connection pooling for database access

## Testing Strategy
1. Unit tests for service layer logic
2. Integration tests for API endpoints
3. Mock Meta API responses for testing
4. End-to-end tests for critical flows
5. Load testing for webhook handling
