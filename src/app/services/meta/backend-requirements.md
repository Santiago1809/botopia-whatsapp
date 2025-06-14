# Meta Business API Backend Requirements

## Overview
This document outlines the backend requirements for the Meta Business API integration in Botopia. The frontend has been set up with multiple views for managing WhatsApp Business, Facebook, and Instagram integrations through the Meta Business API.

## Architecture

### Core Components
1. **Authentication & Authorization**
   - Integration with Meta Business API authentication flow
   - Secure storage of API tokens and credentials
   - Permission management for different Meta platforms

2. **WhatsApp Business API**
   - Connection to WhatsApp Cloud API
   - Template message management
   - Message sending and receiving
   - Analytics and metrics collection

3. **Facebook & Instagram Integration**
   - Page management and authentication
   - Post creation and scheduling
   - Comment and message monitoring
   - Metrics collection

4. **Webhook Management**
   - Setup and configuration of Meta webhooks
   - Event processing for incoming messages
   - Notification system for important events

## API Endpoints

### Authentication
- `POST /api/meta/auth/connect` - Connect Meta Business account
- `GET /api/meta/auth/status` - Get connection status
- `POST /api/meta/auth/refresh-token` - Refresh access token

### WhatsApp Business
- `GET /api/meta/whatsapp/account` - Get WhatsApp Business account details
- `GET /api/meta/whatsapp/templates` - Get list of templates
- `POST /api/meta/whatsapp/templates` - Create new template
- `PUT /api/meta/whatsapp/templates/:id` - Update template
- `GET /api/meta/whatsapp/metrics` - Get WhatsApp messaging metrics

### Facebook
- `GET /api/meta/facebook/pages` - Get connected Facebook pages
- `POST /api/meta/facebook/pages/:id/connect` - Connect Facebook page
- `GET /api/meta/facebook/posts` - Get page posts
- `POST /api/meta/facebook/posts` - Create new post

### Instagram
- `GET /api/meta/instagram/accounts` - Get connected Instagram accounts
- `POST /api/meta/instagram/accounts/:id/connect` - Connect Instagram account
- `GET /api/meta/instagram/media` - Get Instagram media

### Webhook
- `GET /api/meta/webhook` - Get webhook configuration
- `POST /api/meta/webhook/configure` - Configure webhook settings
- `POST /api/meta/webhook/events` - Endpoint for receiving Meta webhook events

## Database Schema

### MetaAccount
- `id`: UUID (primary key)
- `userId`: UUID (foreign key to User)
- `metaAppId`: String
- `accessToken`: String
- `refreshToken`: String
- `tokenExpiry`: Date
- `status`: String (active, expired, revoked)
- `createdAt`: Date
- `updatedAt`: Date

### WhatsAppBusinessAccount
- `id`: UUID (primary key)
- `metaAccountId`: UUID (foreign key to MetaAccount)
- `wabaId`: String
- `phoneNumberId`: String
- `phoneNumber`: String
- `displayName`: String
- `businessProfile`: JSON
- `status`: String
- `createdAt`: Date
- `updatedAt`: Date

### WhatsAppTemplate
- `id`: UUID (primary key)
- `wabaId`: UUID (foreign key to WhatsAppBusinessAccount)
- `templateId`: String
- `name`: String
- `language`: String
- `category`: String
- `components`: JSON
- `status`: String (approved, in_review, rejected)
- `createdAt`: Date
- `updatedAt`: Date

### FacebookPage
- `id`: UUID (primary key)
- `metaAccountId`: UUID (foreign key to MetaAccount)
- `pageId`: String
- `name`: String
- `accessToken`: String
- `category`: String
- `status`: String
- `createdAt`: Date
- `updatedAt`: Date

### InstagramAccount
- `id`: UUID (primary key)
- `metaAccountId`: UUID (foreign key to MetaAccount)
- `igAccountId`: String
- `username`: String
- `status`: String
- `createdAt`: Date
- `updatedAt`: Date

### WebhookConfig
- `id`: UUID (primary key)
- `metaAccountId`: UUID (foreign key to MetaAccount)
- `verifyToken`: String
- `targetUrl`: String
- `fields`: JSON
- `status`: String
- `createdAt`: Date
- `updatedAt`: Date

## Integration Services

### Meta Graph API Service
- Handles all direct interactions with the Meta Graph API
- Manages API rate limits and quotas
- Provides error handling and retry logic

### Webhook Processor
- Processes incoming webhook events
- Routes events to appropriate handlers
- Validates webhook signatures

### Messaging Service
- Manages sending and receiving messages
- Handles template substitutions
- Provides queuing for high-volume messaging

### Analytics Service
- Collects and processes metrics data
- Generates reports and insights
- Tracks KPIs like message delivery rates and engagement

## Security Requirements
- All API tokens must be encrypted at rest
- Webhook endpoints must validate Meta signatures
- User permissions should be enforced for all operations
- Rate limiting should be implemented for all API endpoints

## Implementation Phases
1. **Phase 1: WhatsApp Business Integration**
   - Account connection and authentication
   - Template management
   - Basic messaging functionality

2. **Phase 2: Webhook Management**
   - Set up webhook infrastructure
   - Message reception and processing
   - Event notification system

3. **Phase 3: Facebook & Instagram Integration**
   - Page and account connections
   - Content management features
   - Cross-platform messaging

4. **Phase 4: Analytics & Reporting**
   - Metrics collection and processing
   - Dashboard data APIs
   - Reporting features

## Dependencies
- Meta Graph API SDK or compatible HTTP client
- Secure token storage solution
- Message queue system for high-volume processing
- Database with JSON support for storing complex Meta data structures
