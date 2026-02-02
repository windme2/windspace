import swaggerJsdoc from 'swagger-jsdoc';

/**
 * Swagger/OpenAPI configuration for WindSpace API
 */
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WindSpace Blog API',
      version: '1.0.0',
      description: `
# WindSpace Blog API Documentation

A RESTful API for the WindSpace personal blog platform.

## Features
- 📝 **Articles** - Create, read, update, delete blog articles
- 📂 **Categories** - Organize articles by category
- 💬 **Comments** - User comments with moderation
- 📧 **Newsletter** - Email subscription management
- 🔐 **Authentication** - JWT-based admin authentication

## Authentication
Admin endpoints require JWT Bearer token authentication.
Obtain a token via \`POST /api/admin/login\`.

## Rate Limiting
- General API: 100 requests per minute
- Login: 5 attempts per 15 minutes
- Write operations: 30 requests per minute
      `,
      contact: {
        name: 'WindSpace Team',
        url: 'https://github.com/windme2/windspace',
        email: 'contact@windspace.dev',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Development server',
      },
      {
        url: 'https://api.windspace.dev',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Articles',
        description: 'Blog article operations',
      },
      {
        name: 'Categories',
        description: 'Category management',
      },
      {
        name: 'Comments',
        description: 'Comment operations',
      },
      {
        name: 'Newsletter',
        description: 'Newsletter subscription',
      },
      {
        name: 'Auth',
        description: 'Authentication endpoints',
      },
      {
        name: 'Upload',
        description: 'File upload operations',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from /api/admin/login',
        },
      },
      schemas: {
        Article: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Introduction to React' },
            slug: { type: 'string', example: 'introduction-to-react' },
            excerpt: { type: 'string', example: 'Learn the basics of React...' },
            content: { type: 'string', example: '<p>React is a JavaScript library...</p>' },
            image: { type: 'string', example: '/images/articles/react-intro.jpg' },
            published: { type: 'boolean', example: true },
            published_at: { type: 'string', format: 'date-time' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            tags: {
              type: 'array',
              items: { type: 'string' },
              example: ['react', 'javascript', 'frontend'],
            },
            views: { type: 'integer', example: 150 },
            category_id: { type: 'integer', example: 1 },
            category: { $ref: '#/components/schemas/Category' },
            author: { $ref: '#/components/schemas/Author' },
          },
        },
        ArticleInput: {
          type: 'object',
          required: ['title', 'content', 'excerpt', 'category_id'],
          properties: {
            title: { type: 'string', example: 'My New Article' },
            slug: { type: 'string', example: 'my-new-article' },
            excerpt: { type: 'string', example: 'A brief summary...' },
            content: { type: 'string', example: '<p>Full article content...</p>' },
            image: { type: 'string', example: '/images/articles/new.jpg' },
            published: { type: 'boolean', default: false },
            tags: {
              type: 'array',
              items: { type: 'string' },
            },
            category_id: { type: 'integer', example: 1 },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Technology' },
            slug: { type: 'string', example: 'technology' },
            description: { type: 'string', example: 'Tech-related articles' },
            color: { type: 'string', example: '#8B5CF6' },
            icon: { type: 'string', example: 'cpu' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        CategoryInput: {
          type: 'object',
          required: ['name', 'slug'],
          properties: {
            name: { type: 'string', example: 'Technology' },
            slug: { type: 'string', example: 'technology' },
            description: { type: 'string' },
            color: { type: 'string', example: '#8B5CF6' },
            icon: { type: 'string', example: 'cpu' },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            article_id: { type: 'integer', example: 1 },
            author_name: { type: 'string', example: 'John Doe' },
            author_email: { type: 'string', format: 'email', example: 'john@example.com' },
            content: { type: 'string', example: 'Great article!' },
            is_approved: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        CommentInput: {
          type: 'object',
          required: ['article_id', 'author_name', 'author_email', 'content'],
          properties: {
            article_id: { type: 'integer', example: 1 },
            author_name: { type: 'string', example: 'John Doe' },
            author_email: { type: 'string', format: 'email', example: 'john@example.com' },
            content: { type: 'string', minLength: 3, maxLength: 2000 },
          },
        },
        NewsletterSubscriber: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            is_active: { type: 'boolean', example: true },
            subscribed_at: { type: 'string', format: 'date-time' },
          },
        },
        Author: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Admin' },
            avatar_url: { type: 'string', example: '/images/profile/admin.jpg' },
            bio: { type: 'string' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['password'],
          properties: {
            password: { type: 'string', format: 'password' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Authentication successful' },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            expiresIn: { type: 'integer', example: 900 },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Error message' },
            message: { type: 'string' },
          },
        },
        PaginatedArticles: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Article' },
            },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'integer', example: 100 },
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 10 },
                hasMore: { type: 'boolean', example: true },
              },
            },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { error: 'Unauthorized', message: 'Invalid or missing token' },
            },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { error: 'Not found' },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { error: 'Validation failed', message: 'Title is required' },
            },
          },
        },
        RateLimited: {
          description: 'Too many requests',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { error: 'Too many requests, please try again later' },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
