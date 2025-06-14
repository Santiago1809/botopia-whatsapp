# Meta Business API Implementation Guide

This guide provides code samples and implementation details for building the Meta Business API integration backend. It follows the technical specifications outlined in the API specification document.

## Project Setup

### Directory Structure

```
backend/
├── src/
│   ├── controllers/     # API route handlers
│   │   ├── auth/        # Meta authentication controllers
│   │   ├── whatsapp/    # WhatsApp Business API controllers
│   │   ├── facebook/    # Facebook API controllers  
│   │   ├── instagram/   # Instagram API controllers
│   │   └── webhook/     # Webhook management controllers
│   ├── services/        # Business logic
│   │   ├── meta/        # Meta Graph API services
│   │   ├── messaging/   # Message processing services
│   │   └── analytics/   # Data analysis services
│   ├── models/          # Database models
│   ├── utils/           # Helper utilities
│   └── routes/          # API route definitions
└── tests/               # Test suite
```

### Dependencies

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "crypto": "^1.0.1",
    "dotenv": "^16.3.1",
    "winston": "^3.10.0",
    "joi": "^17.9.2",
    "jsonwebtoken": "^9.0.1",
    "redis": "^4.6.7"
  }
}
```

## Implementation Examples

### 1. Meta Authentication Service

**`src/services/meta/authService.js`**

```javascript
const axios = require('axios');
const crypto = require('crypto');
const { MetaAccount } = require('../../models/metaAccount');

class MetaAuthService {
  /**
   * Exchange authorization code for an access token
   * @param {string} code - Authorization code from Meta OAuth flow
   * @param {string} redirectUri - Redirect URI used in OAuth flow
   * @param {string} userId - User ID to associate with the Meta account
   */
  async exchangeCodeForToken(code, redirectUri, userId) {
    try {
      const response = await axios.get('https://graph.facebook.com/v17.0/oauth/access_token', {
        params: {
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          redirect_uri: redirectUri,
          code: code
        }
      });

      const { access_token, expires_in } = response.data;
      
      // Get long-lived token
      const longLivedTokenResponse = await axios.get('https://graph.facebook.com/v17.0/oauth/access_token', {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          fb_exchange_token: access_token
        }
      });
      
      const { access_token: longLivedToken, expires_in: longLivedExpiry } = longLivedTokenResponse.data;
      
      // Get account details and permissions
      const accountResponse = await axios.get('https://graph.facebook.com/v17.0/me', {
        params: {
          fields: 'id,name',
          access_token: longLivedToken
        }
      });
      
      const { id: metaUserId, name } = accountResponse.data;
      
      // Get permissions
      const permissionsResponse = await axios.get(`https://graph.facebook.com/v17.0/${metaUserId}/permissions`, {
        params: {
          access_token: longLivedToken
        }
      });
      
      const permissions = permissionsResponse.data.data
        .filter(p => p.status === 'granted')
        .map(p => p.permission);
      
      // Create or update account in database
      const expiryDate = new Date();
      expiryDate.setSeconds(expiryDate.getSeconds() + longLivedExpiry);
      
      // Encrypt token before saving
      const encryptedToken = this.encryptToken(longLivedToken);
      
      const metaAccount = await MetaAccount.findOneAndUpdate(
        { userId, metaUserId },
        {
          userId,
          metaUserId,
          metaUserName: name,
          accessToken: encryptedToken,
          tokenExpiry: expiryDate,
          permissions,
          status: 'active'
        },
        { upsert: true, new: true }
      );
      
      return {
        accountId: metaAccount._id,
        status: metaAccount.status,
        permissions: metaAccount.permissions
      };
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw new Error('Failed to connect to Meta account');
    }
  }
  
  /**
   * Encrypt token for secure storage
   * @param {string} token - Token to encrypt
   * @returns {string} Encrypted token
   */
  encryptToken(token) {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  }
  
  /**
   * Decrypt stored token
   * @param {string} encryptedToken - Encrypted token
   * @returns {string} Decrypted token
   */
  decryptToken(encryptedToken) {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    
    const [ivHex, encrypted] = encryptedToken.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  /**
   * Get account connection status
   * @param {string} userId - User ID
   * @returns {Object} Connection status
   */
  async getConnectionStatus(userId) {
    const metaAccount = await MetaAccount.findOne({ userId });
    
    if (!metaAccount) {
      return {
        connected: false
      };
    }
    
    // Check if token is expired
    const now = new Date();
    const isExpired = now > metaAccount.tokenExpiry;
    
    // Check connected platforms
    const platforms = {
      whatsapp: false,
      facebook: false,
      instagram: false
    };
    
    if (!isExpired) {
      // Check WhatsApp connection
      const whatsappAccount = await WhatsAppBusinessAccount.findOne({ 
        metaAccountId: metaAccount._id 
      });
      platforms.whatsapp = !!whatsappAccount;
      
      // Check Facebook connection
      const facebookPage = await FacebookPage.findOne({
        metaAccountId: metaAccount._id
      });
      platforms.facebook = !!facebookPage;
      
      // Check Instagram connection
      const instagramAccount = await InstagramAccount.findOne({
        metaAccountId: metaAccount._id
      });
      platforms.instagram = !!instagramAccount;
    }
    
    return {
      connected: !isExpired,
      accountId: metaAccount._id,
      expiresAt: metaAccount.tokenExpiry,
      permissions: metaAccount.permissions,
      platforms
    };
  }
  
  /**
   * Refresh access token before expiry
   * @param {string} accountId - Meta account ID
   */
  async refreshToken(accountId) {
    const metaAccount = await MetaAccount.findById(accountId);
    
    if (!metaAccount) {
      throw new Error('Meta account not found');
    }
    
    try {
      const token = this.decryptToken(metaAccount.accessToken);
      
      const response = await axios.get('https://graph.facebook.com/v17.0/oauth/access_token', {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          fb_exchange_token: token
        }
      });
      
      const { access_token, expires_in } = response.data;
      
      // Update token in database
      const expiryDate = new Date();
      expiryDate.setSeconds(expiryDate.getSeconds() + expires_in);
      
      const encryptedToken = this.encryptToken(access_token);
      
      metaAccount.accessToken = encryptedToken;
      metaAccount.tokenExpiry = expiryDate;
      await metaAccount.save();
      
      return {
        expiresAt: expiryDate
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      
      // Update account status if refresh fails
      metaAccount.status = 'expired';
      await metaAccount.save();
      
      throw new Error('Failed to refresh Meta access token');
    }
  }
}

module.exports = new MetaAuthService();
```

### 2. WhatsApp Template Management Service

**`src/services/meta/whatsappService.js`**

```javascript
const axios = require('axios');
const { MetaAccount } = require('../../models/metaAccount');
const { WhatsAppBusinessAccount } = require('../../models/whatsappBusinessAccount');
const { WhatsAppTemplate } = require('../../models/whatsappTemplate');
const authService = require('./authService');

class WhatsAppService {
  /**
   * Get WhatsApp Business Account details
   * @param {string} userId - User ID
   */
  async getAccountDetails(userId) {
    const metaAccount = await MetaAccount.findOne({ userId });
    
    if (!metaAccount) {
      throw new Error('Meta account not connected');
    }
    
    const whatsappAccount = await WhatsAppBusinessAccount.findOne({
      metaAccountId: metaAccount._id
    });
    
    if (!whatsappAccount) {
      // Fetch WhatsApp Business Accounts from Meta
      const token = authService.decryptToken(metaAccount.accessToken);
      
      try {
        const response = await axios.get('https://graph.facebook.com/v17.0/me/whatsapp_business_accounts', {
          params: {
            access_token: token
          }
        });
        
        if (response.data.data && response.data.data.length > 0) {
          const wabaData = response.data.data[0];
          
          // Get phone numbers for this WABA
          const phoneResponse = await axios.get(`https://graph.facebook.com/v17.0/${wabaData.id}/phone_numbers`, {
            params: {
              access_token: token
            }
          });
          
          let phoneNumberId = null;
          let phoneNumber = null;
          
          if (phoneResponse.data.data && phoneResponse.data.data.length > 0) {
            const phoneData = phoneResponse.data.data[0];
            phoneNumberId = phoneData.id;
            phoneNumber = phoneData.display_phone_number;
          }
          
          // Get business profile
          let businessProfile = {};
          
          if (phoneNumberId) {
            try {
              const profileResponse = await axios.get(`https://graph.facebook.com/v17.0/${phoneNumberId}/whatsapp_business_profile`, {
                params: {
                  fields: 'about,address,description,email,websites,profile_picture_url',
                  access_token: token
                }
              });
              
              businessProfile = profileResponse.data;
            } catch (error) {
              console.error('Error fetching business profile:', error);
              // Continue without business profile
            }
          }
          
          // Create new WhatsApp Business Account in database
          const newWhatsappAccount = await WhatsAppBusinessAccount.create({
            metaAccountId: metaAccount._id,
            wabaId: wabaData.id,
            phoneNumberId,
            phoneNumber,
            displayName: businessProfile.about || phoneNumber,
            businessProfile,
            status: 'active'
          });
          
          return {
            id: newWhatsappAccount._id,
            wabaId: newWhatsappAccount.wabaId,
            phoneNumberId: newWhatsappAccount.phoneNumberId,
            phoneNumber: newWhatsappAccount.phoneNumber,
            displayName: newWhatsappAccount.displayName,
            status: newWhatsappAccount.status,
            businessProfile: newWhatsappAccount.businessProfile,
            createdAt: newWhatsappAccount.createdAt
          };
        }
        
        throw new Error('No WhatsApp Business Account found for this Meta account');
      } catch (error) {
        console.error('Error fetching WhatsApp Business Account:', error);
        throw new Error('Failed to fetch WhatsApp Business Account details');
      }
    }
    
    return {
      id: whatsappAccount._id,
      wabaId: whatsappAccount.wabaId,
      phoneNumberId: whatsappAccount.phoneNumberId,
      phoneNumber: whatsappAccount.phoneNumber,
      displayName: whatsappAccount.displayName,
      status: whatsappAccount.status,
      businessProfile: whatsappAccount.businessProfile,
      createdAt: whatsappAccount.createdAt
    };
  }
  
  /**
   * Get WhatsApp message templates
   * @param {string} userId - User ID
   * @param {Object} options - Filter and pagination options
   */
  async getTemplates(userId, options = {}) {
    const { status, category, limit = 10, offset = 0 } = options;
    
    const metaAccount = await MetaAccount.findOne({ userId });
    if (!metaAccount) {
      throw new Error('Meta account not connected');
    }
    
    const whatsappAccount = await WhatsAppBusinessAccount.findOne({
      metaAccountId: metaAccount._id
    });
    
    if (!whatsappAccount) {
      throw new Error('WhatsApp Business Account not found');
    }
    
    // Build query
    const query = { wabaId: whatsappAccount._id };
    
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }
    
    // Fetch templates from database first
    const templates = await WhatsAppTemplate.find(query)
      .sort({ updatedAt: -1 })
      .skip(offset)
      .limit(limit);
      
    const total = await WhatsAppTemplate.countDocuments(query);
    
    // If we don't have any templates or it's been a while since last sync,
    // fetch from Meta API
    if (templates.length === 0 || this.shouldSyncTemplates(whatsappAccount)) {
      await this.syncTemplatesFromMeta(metaAccount, whatsappAccount);
      
      // Fetch again after sync
      const freshTemplates = await WhatsAppTemplate.find(query)
        .sort({ updatedAt: -1 })
        .skip(offset)
        .limit(limit);
        
      const freshTotal = await WhatsAppTemplate.countDocuments(query);
      
      return {
        templates: freshTemplates.map(this.formatTemplateResponse),
        pagination: {
          total: freshTotal,
          limit,
          offset,
          nextOffset: offset + limit < freshTotal ? offset + limit : null
        }
      };
    }
    
    return {
      templates: templates.map(this.formatTemplateResponse),
      pagination: {
        total,
        limit,
        offset,
        nextOffset: offset + limit < total ? offset + limit : null
      }
    };
  }
  
  /**
   * Create a new WhatsApp message template
   * @param {string} userId - User ID
   * @param {Object} templateData - Template data
   */
  async createTemplate(userId, templateData) {
    const { name, language, category, components } = templateData;
    
    const metaAccount = await MetaAccount.findOne({ userId });
    if (!metaAccount) {
      throw new Error('Meta account not connected');
    }
    
    const whatsappAccount = await WhatsAppBusinessAccount.findOne({
      metaAccountId: metaAccount._id
    });
    
    if (!whatsappAccount) {
      throw new Error('WhatsApp Business Account not found');
    }
    
    // Format template data for Meta API
    const metaTemplateData = {
      name,
      category,
      components,
      language
    };
    
    try {
      const token = authService.decryptToken(metaAccount.accessToken);
      
      // Submit template to Meta
      const response = await axios.post(
        `https://graph.facebook.com/v17.0/${whatsappAccount.wabaId}/message_templates`,
        metaTemplateData,
        {
          params: {
            access_token: token
          }
        }
      );
      
      // Store template in database
      const template = await WhatsAppTemplate.create({
        wabaId: whatsappAccount._id,
        templateId: response.data.id,
        name,
        language,
        category,
        components,
        status: 'PENDING'
      });
      
      return {
        id: template._id,
        templateId: template.templateId,
        name: template.name,
        status: template.status,
        createdAt: template.createdAt
      };
    } catch (error) {
      console.error('Error creating template:', error.response?.data || error);
      throw new Error(error.response?.data?.error?.message || 'Failed to create template');
    }
  }
  
  /**
   * Check if templates need to be synced
   * @param {Object} whatsappAccount - WhatsApp Business Account
   * @returns {boolean} Whether templates should be synced
   */
  shouldSyncTemplates(whatsappAccount) {
    // Check if last sync was more than 1 hour ago
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    return !whatsappAccount.lastTemplateSync || 
      whatsappAccount.lastTemplateSync < oneHourAgo;
  }
  
  /**
   * Sync templates from Meta API
   * @param {Object} metaAccount - Meta Account
   * @param {Object} whatsappAccount - WhatsApp Business Account
   */
  async syncTemplatesFromMeta(metaAccount, whatsappAccount) {
    try {
      const token = authService.decryptToken(metaAccount.accessToken);
      
      const response = await axios.get(
        `https://graph.facebook.com/v17.0/${whatsappAccount.wabaId}/message_templates`,
        {
          params: {
            access_token: token
          }
        }
      );
      
      if (response.data.data) {
        // Process each template
        for (const template of response.data.data) {
          await WhatsAppTemplate.findOneAndUpdate(
            { 
              wabaId: whatsappAccount._id,
              templateId: template.id
            },
            {
              wabaId: whatsappAccount._id,
              templateId: template.id,
              name: template.name,
              language: template.language,
              category: template.category,
              components: template.components,
              status: template.status
            },
            { upsert: true }
          );
        }
      }
      
      // Update last sync timestamp
      whatsappAccount.lastTemplateSync = new Date();
      await whatsappAccount.save();
    } catch (error) {
      console.error('Error syncing templates:', error);
      throw new Error('Failed to sync templates from Meta API');
    }
  }
  
  /**
   * Format template response
   * @param {Object} template - Template object from database
   * @returns {Object} Formatted template response
   */
  formatTemplateResponse(template) {
    return {
      id: template._id,
      templateId: template.templateId,
      name: template.name,
      language: template.language,
      category: template.category,
      status: template.status,
      components: template.components,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt
    };
  }
}

module.exports = new WhatsAppService();
```

### 3. Webhook Management Controller

**`src/controllers/webhook/webhookController.js`**

```javascript
const crypto = require('crypto');
const { WebhookConfig } = require('../../models/webhookConfig');
const { MetaAccount } = require('../../models/metaAccount');
const webhookService = require('../../services/meta/webhookService');
const messagingService = require('../../services/messaging/messagingService');

class WebhookController {
  /**
   * Get webhook configuration
   */
  async getWebhookConfig(req, res) {
    try {
      const { userId } = req.user;
      
      const metaAccount = await MetaAccount.findOne({ userId });
      if (!metaAccount) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'ACCOUNT_NOT_FOUND',
            message: 'Meta account not connected'
          }
        });
      }
      
      const webhookConfig = await WebhookConfig.findOne({
        metaAccountId: metaAccount._id
      });
      
      if (!webhookConfig) {
        return res.status(200).json({
          success: true,
          data: null
        });
      }
      
      return res.status(200).json({
        success: true,
        data: {
          id: webhookConfig._id,
          verifyToken: webhookConfig.verifyToken,
          targetUrl: webhookConfig.targetUrl,
          fields: webhookConfig.fields,
          status: webhookConfig.status,
          createdAt: webhookConfig.createdAt,
          updatedAt: webhookConfig.updatedAt
        }
      });
    } catch (error) {
      console.error('Error fetching webhook config:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to get webhook configuration'
        }
      });
    }
  }
  
  /**
   * Configure webhook
   */
  async configureWebhook(req, res) {
    try {
      const { userId } = req.user;
      const { verifyToken, fields } = req.body;
      
      const metaAccount = await MetaAccount.findOne({ userId });
      if (!metaAccount) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'ACCOUNT_NOT_FOUND',
            message: 'Meta account not connected'
          }
        });
      }
      
      // Generate target URL
      const targetUrl = `${process.env.API_BASE_URL}/api/meta/webhook/events`;
      
      // Create or update webhook config
      const webhookConfig = await WebhookConfig.findOneAndUpdate(
        { metaAccountId: metaAccount._id },
        {
          metaAccountId: metaAccount._id,
          verifyToken,
          targetUrl,
          fields,
          status: 'pending'
        },
        { upsert: true, new: true }
      );
      
      // Subscribe to webhook
      await webhookService.subscribeWebhook(metaAccount._id, webhookConfig);
      
      return res.status(200).json({
        success: true,
        data: {
          id: webhookConfig._id,
          status: webhookConfig.status,
          fields: webhookConfig.fields
        }
      });
    } catch (error) {
      console.error('Error configuring webhook:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to configure webhook'
        }
      });
    }
  }
  
  /**
   * Handle webhook verification request from Meta
   */
  async verifyWebhook(req, res) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    // Check if a token and mode were sent
    if (mode && token) {
      // Check the mode and token
      if (mode === 'subscribe') {
        // Find webhook config with this token
        const webhookConfig = await WebhookConfig.findOne({
          verifyToken: token
        });
        
        if (webhookConfig) {
          // Update webhook status
          webhookConfig.status = 'active';
          await webhookConfig.save();
          
          // Respond with challenge token
          console.log('WEBHOOK_VERIFIED');
          return res.status(200).send(challenge);
        }
      }
    }
    
    // Responds with '403 Forbidden' if verify tokens do not match
    return res.sendStatus(403);
  }
  
  /**
   * Handle webhook events from Meta
   */
  async handleWebhookEvent(req, res) {
    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');
    
    const signature = req.headers['x-hub-signature-256'];
    const body = req.body;
    
    // Verify signature
    if (!this.verifySignature(signature, body)) {
      console.error('Invalid signature');
      return;
    }
    
    // Process the webhook event
    try {
      if (body.object === 'whatsapp_business_account') {
        // Process WhatsApp events
        for (const entry of body.entry) {
          for (const change of entry.changes) {
            if (change.field === 'messages') {
              await messagingService.processWhatsAppMessage(change.value);
            } else if (change.field === 'message_deliveries') {
              await messagingService.processDeliveryStatus(change.value);
            }
          }
        }
      } else if (body.object === 'page') {
        // Process Facebook events
        for (const entry of body.entry) {
          if (entry.messaging) {
            for (const event of entry.messaging) {
              if (event.message) {
                console.log('Received Facebook message:', event);
                // Process Facebook message
              }
            }
          }
        }
      } else if (body.object === 'instagram') {
        // Process Instagram events
        console.log('Received Instagram event:', body);
      }
    } catch (error) {
      console.error('Error processing webhook event:', error);
    }
  }
  
  /**
   * Verify webhook signature
   * @param {string} signature - X-Hub-Signature-256 header
   * @param {Object} body - Request body
   * @returns {boolean} Whether signature is valid
   */
  verifySignature(signature, body) {
    if (!signature) {
      return false;
    }
    
    const expectedSignature = crypto
      .createHmac('sha256', process.env.META_APP_SECRET)
      .update(JSON.stringify(body))
      .digest('hex');
    
    return signature === `sha256=${expectedSignature}`;
  }
}

module.exports = new WebhookController();
```

### 4. API Routes

**`src/routes/meta/index.js`**

```javascript
const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth');

// Import controllers
const authController = require('../../controllers/meta/authController');
const whatsappController = require('../../controllers/meta/whatsappController');
const facebookController = require('../../controllers/meta/facebookController');
const instagramController = require('../../controllers/meta/instagramController');
const webhookController = require('../../controllers/meta/webhookController');

// Authentication routes
router.post('/auth/connect', authMiddleware, authController.connectAccount);
router.get('/auth/status', authMiddleware, authController.getConnectionStatus);
router.post('/auth/refresh-token', authMiddleware, authController.refreshToken);

// WhatsApp routes
router.get('/whatsapp/account', authMiddleware, whatsappController.getAccountDetails);
router.get('/whatsapp/templates', authMiddleware, whatsappController.getTemplates);
router.post('/whatsapp/templates', authMiddleware, whatsappController.createTemplate);
router.put('/whatsapp/templates/:id', authMiddleware, whatsappController.updateTemplate);
router.get('/whatsapp/metrics', authMiddleware, whatsappController.getMetrics);

// Facebook routes
router.get('/facebook/pages', authMiddleware, facebookController.getPages);
router.post('/facebook/pages/:id/connect', authMiddleware, facebookController.connectPage);
router.get('/facebook/posts', authMiddleware, facebookController.getPosts);
router.post('/facebook/posts', authMiddleware, facebookController.createPost);

// Instagram routes
router.get('/instagram/accounts', authMiddleware, instagramController.getAccounts);
router.post('/instagram/accounts/:id/connect', authMiddleware, instagramController.connectAccount);
router.get('/instagram/media', authMiddleware, instagramController.getMedia);

// Webhook routes
router.get('/webhook', authMiddleware, webhookController.getWebhookConfig);
router.post('/webhook/configure', authMiddleware, webhookController.configureWebhook);

// Public webhook endpoint (no auth)
router.get('/webhook/events', webhookController.verifyWebhook);
router.post('/webhook/events', webhookController.handleWebhookEvent);

module.exports = router;
```

### 5. Database Models

**`src/models/metaAccount.js`**

```javascript
const mongoose = require('mongoose');

const metaAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  metaUserId: {
    type: String,
    required: true
  },
  metaUserName: {
    type: String
  },
  accessToken: {
    type: String,
    required: true
  },
  tokenExpiry: {
    type: Date,
    required: true
  },
  permissions: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Indexes
metaAccountSchema.index({ userId: 1 });
metaAccountSchema.index({ metaUserId: 1 });

const MetaAccount = mongoose.model('MetaAccount', metaAccountSchema);

module.exports = { MetaAccount };
```

**`src/models/whatsappBusinessAccount.js`**

```javascript
const mongoose = require('mongoose');

const whatsappBusinessAccountSchema = new mongoose.Schema({
  metaAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'MetaAccount'
  },
  wabaId: {
    type: String,
    required: true
  },
  phoneNumberId: {
    type: String
  },
  phoneNumber: {
    type: String
  },
  displayName: {
    type: String
  },
  businessProfile: {
    type: Object,
    default: {}
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  lastTemplateSync: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Indexes
whatsappBusinessAccountSchema.index({ metaAccountId: 1 });
whatsappBusinessAccountSchema.index({ wabaId: 1 });

const WhatsAppBusinessAccount = mongoose.model('WhatsAppBusinessAccount', whatsappBusinessAccountSchema);

module.exports = { WhatsAppBusinessAccount };
```

## Integration Steps

### 1. Meta App Setup

1. Create a Meta app in the [Meta for Developers](https://developers.facebook.com/) portal
2. Configure app settings:
   - Privacy Policy URL
   - Terms of Service URL
   - App Icon
3. Add products:
   - WhatsApp
   - Facebook Login
   - Instagram Basic Display
4. Configure OAuth redirect URIs
5. Set up required permissions:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
   - `pages_manage_metadata`
   - `pages_read_engagement`
   - `instagram_basic`

### 2. OAuth Flow Implementation

1. Create login button in frontend to initiate login flow
2. Direct user to Meta authorization URL:

```javascript
const authUrl = `https://www.facebook.com/v17.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${REDIRECT_URI}&state=${CSRF_TOKEN}&scope=whatsapp_business_messaging,whatsapp_business_management,pages_manage_metadata,pages_read_engagement,instagram_basic`;
```

3. Handle OAuth callback in backend
4. Exchange code for access token using the `authService.exchangeCodeForToken` method
5. Store token securely in database

### 3. Webhook Setup

1. Create route for webhook verification
2. Implement signature verification
3. Handle webhook events for:
   - WhatsApp messages
   - Message delivery statuses
   - Template status updates
   - Facebook page events
   - Instagram content updates

### 4. Error Handling and Monitoring

1. Set up centralized error logging
2. Implement retry logic for failed API calls
3. Create monitoring for:
   - Token expiry
   - Webhook status
   - API rate limits
   - Message delivery failures

### 5. Testing

1. Create test Meta app for development
2. Set up mock responses for unit tests
3. Test OAuth flow with sandbox accounts
4. Verify webhook handling with sample events

## Additional Resources

- [Meta Graph API Documentation](https://developers.facebook.com/docs/graph-api/)
- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api/)
- [Meta Webhook Reference](https://developers.facebook.com/docs/graph-api/webhooks/reference/)
