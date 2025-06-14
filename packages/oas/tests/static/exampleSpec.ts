// Pulling an OpenAPI spec from https://apis.guru/

export default
{
  openapi: '3.0.0',
  servers: [
    {
      url: 'https://www.googleapis.com/siteVerification/v1',
    },
  ],
  info: {
    'contact': {
      'name': 'Google',
      'url': 'https://google.com',
      'x-twitter': 'youtube',
    },
    'description': 'Verifies ownership of websites or domains with Google.',
    'license': {
      name: 'Creative Commons Attribution 3.0',
      url: 'http://creativecommons.org/licenses/by/3.0/',
    },
    'termsOfService': 'https://developers.google.com/terms/',
    'title': 'Google Site Verification API',
    'version': 'v1',
    'x-apiClientRegistration': {
      url: 'https://console.developers.google.com',
    },
    'x-apisguru-categories': [
      'analytics',
      'media',
    ],
    'x-logo': {
      url: 'https://api.apis.guru/v2/cache/logo/https_www.google.com_images_branding_googlelogo_2x_googlelogo_color_272x92dp.png',
    },
    'x-origin': [
      {
        format: 'google',
        url: 'https://siteverification.googleapis.com/$discovery/rest?version=v1',
        version: 'v1',
      },
    ],
    'x-providerName': 'googleapis.com',
    'x-serviceName': 'siteVerification',
  },
  externalDocs: {
    url: 'https://developers.google.com/site-verification/',
  },
  tags: [
    {
      name: 'webResource',
    },
  ],
  paths: {
    '/token': {
      parameters: [
        {
          $ref: '#/components/parameters/alt',
        },
        {
          $ref: '#/components/parameters/fields',
        },
        {
          $ref: '#/components/parameters/key',
        },
        {
          $ref: '#/components/parameters/oauth_token',
        },
        {
          $ref: '#/components/parameters/prettyPrint',
        },
        {
          $ref: '#/components/parameters/quotaUser',
        },
        {
          $ref: '#/components/parameters/userIp',
        },
      ],
      post: {
        description: 'Get a verification token for placing on a website or domain.',
        operationId: 'siteVerification.webResource.getToken',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SiteVerificationWebResourceGettokenRequest',
              },
            },
          },
        },
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SiteVerificationWebResourceGettokenResponse',
                },
              },
            },
            description: 'Successful response',
          },
        },
        security: [
          {
            Oauth2: [
              'https://www.googleapis.com/auth/siteverification',
            ],
            Oauth2c: [
              'https://www.googleapis.com/auth/siteverification',
            ],
          },
          {
            Oauth2: [
              'https://www.googleapis.com/auth/siteverification.verify_only',
            ],
            Oauth2c: [
              'https://www.googleapis.com/auth/siteverification.verify_only',
            ],
          },
        ],
        tags: [
          'webResource',
        ],
      },
    },
    '/webResource': {
      get: {
        description: 'Get the list of your verified websites and domains.',
        operationId: 'siteVerification.webResource.list',
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SiteVerificationWebResourceListResponse',
                },
              },
            },
            description: 'Successful response',
          },
        },
        security: [
          {
            Oauth2: [
              'https://www.googleapis.com/auth/siteverification',
            ],
            Oauth2c: [
              'https://www.googleapis.com/auth/siteverification',
            ],
          },
        ],
        tags: [
          'webResource',
        ],
      },
      parameters: [
        {
          $ref: '#/components/parameters/alt',
        },
        {
          $ref: '#/components/parameters/fields',
        },
        {
          $ref: '#/components/parameters/key',
        },
        {
          $ref: '#/components/parameters/oauth_token',
        },
        {
          $ref: '#/components/parameters/prettyPrint',
        },
        {
          $ref: '#/components/parameters/quotaUser',
        },
        {
          $ref: '#/components/parameters/userIp',
        },
      ],
      post: {
        description: 'Attempt verification of a website or domain.',
        operationId: 'siteVerification.webResource.insert',
        parameters: [
          {
            description: 'The method to use for verifying a site or domain.',
            in: 'query',
            name: 'verificationMethod',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SiteVerificationWebResourceResource',
              },
            },
          },
        },
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SiteVerificationWebResourceResource',
                },
              },
            },
            description: 'Successful response',
          },
        },
        security: [
          {
            Oauth2: [
              'https://www.googleapis.com/auth/siteverification',
            ],
            Oauth2c: [
              'https://www.googleapis.com/auth/siteverification',
            ],
          },
          {
            Oauth2: [
              'https://www.googleapis.com/auth/siteverification.verify_only',
            ],
            Oauth2c: [
              'https://www.googleapis.com/auth/siteverification.verify_only',
            ],
          },
        ],
        tags: [
          'webResource',
        ],
      },
    },
    '/webResource/{id}': {
      delete: {
        description: 'Relinquish ownership of a website or domain.',
        operationId: 'siteVerification.webResource.delete',
        parameters: [
          {
            description: 'The id of a verified site or domain.',
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          200: {
            description: 'Successful response',
          },
        },
        security: [
          {
            Oauth2: [
              'https://www.googleapis.com/auth/siteverification',
            ],
            Oauth2c: [
              'https://www.googleapis.com/auth/siteverification',
            ],
          },
        ],
        tags: [
          'webResource',
        ],
      },
      get: {
        description: 'Get the most current data for a website or domain.',
        operationId: 'siteVerification.webResource.get',
        parameters: [
          {
            description: 'The id of a verified site or domain.',
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SiteVerificationWebResourceResource',
                },
              },
            },
            description: 'Successful response',
          },
        },
        security: [
          {
            Oauth2: [
              'https://www.googleapis.com/auth/siteverification',
            ],
            Oauth2c: [
              'https://www.googleapis.com/auth/siteverification',
            ],
          },
        ],
        tags: [
          'webResource',
        ],
      },
      parameters: [
        {
          $ref: '#/components/parameters/alt',
        },
        {
          $ref: '#/components/parameters/fields',
        },
        {
          $ref: '#/components/parameters/key',
        },
        {
          $ref: '#/components/parameters/oauth_token',
        },
        {
          $ref: '#/components/parameters/prettyPrint',
        },
        {
          $ref: '#/components/parameters/quotaUser',
        },
        {
          $ref: '#/components/parameters/userIp',
        },
      ],
      patch: {
        description: 'Modify the list of owners for your website or domain. This method supports patch semantics.',
        operationId: 'siteVerification.webResource.patch',
        parameters: [
          {
            description: 'The id of a verified site or domain.',
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SiteVerificationWebResourceResource',
              },
            },
          },
        },
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SiteVerificationWebResourceResource',
                },
              },
            },
            description: 'Successful response',
          },
        },
        security: [
          {
            Oauth2: [
              'https://www.googleapis.com/auth/siteverification',
            ],
            Oauth2c: [
              'https://www.googleapis.com/auth/siteverification',
            ],
          },
        ],
        tags: [
          'webResource',
        ],
      },
      put: {
        description: 'Modify the list of owners for your website or domain.',
        operationId: 'siteVerification.webResource.update',
        parameters: [
          {
            description: 'The id of a verified site or domain.',
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SiteVerificationWebResourceResource',
              },
            },
          },
        },
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SiteVerificationWebResourceResource',
                },
              },
            },
            description: 'Successful response',
          },
        },
        security: [
          {
            Oauth2: [
              'https://www.googleapis.com/auth/siteverification',
            ],
            Oauth2c: [
              'https://www.googleapis.com/auth/siteverification',
            ],
          },
        ],
        tags: [
          'webResource',
        ],
      },
    },
  },
  components: {
    user: {
      description: 'User model',
      type: 'object',
      properties: {
        id: { type: 'string', required: true },
        name: { type: 'string' },
        age: { type: 'integer' },
      },
    },
    parameters: {
      alt: {
        description: 'Data format for the response.',
        in: 'query',
        name: 'alt',
        schema: {
          enum: [
            'json',
          ],
          type: 'string',
        },
      },
      fields: {
        description: 'Selector specifying which fields to include in a partial response.',
        in: 'query',
        name: 'fields',
        schema: {
          type: 'string',
        },
      },
      key: {
        description: 'API key. Your API key identifies your project and provides you with API access, quota, and reports. Required unless you provide an OAuth 2.0 token.',
        in: 'query',
        name: 'key',
        schema: {
          type: 'string',
        },
      },
      oauth_token: {
        description: 'OAuth 2.0 token for the current user.',
        in: 'query',
        name: 'oauth_token',
        schema: {
          type: 'string',
        },
      },
      prettyPrint: {
        description: 'Returns response with indentations and line breaks.',
        in: 'query',
        name: 'prettyPrint',
        schema: {
          type: 'boolean',
        },
      },
      quotaUser: {
        description: 'An opaque string that represents a user for quota purposes. Must not exceed 40 characters.',
        in: 'query',
        name: 'quotaUser',
        schema: {
          type: 'string',
        },
      },
      userIp: {
        description: 'Deprecated. Please use quotaUser instead.',
        in: 'query',
        name: 'userIp',
        schema: {
          type: 'string',
        },
      },
    },
    schemas: {
      SiteVerificationWebResourceGettokenRequest: {
        properties: {
          site: {
            description: 'The site for which a verification token will be generated.',
            properties: {
              identifier: {
                description: 'The site identifier. If the type is set to SITE, the identifier is a URL. If the type is set to INET_DOMAIN, the site identifier is a domain name.',
                type: 'string',
              },
              type: {
                description: 'The type of resource to be verified. Can be SITE or INET_DOMAIN (domain name).',
                type: 'string',
              },
            },
            type: 'object',
          },
          verificationMethod: {
            description: 'The verification method that will be used to verify this site. For sites, \'FILE\' or \'META\' methods may be used. For domains, only \'DNS\' may be used.',
            type: 'string',
          },
        },
        type: 'object',
      },
      SiteVerificationWebResourceGettokenResponse: {
        properties: {
          method: {
            description: 'The verification method to use in conjunction with this token. For FILE, the token should be placed in the top-level directory of the site, stored inside a file of the same name. For META, the token should be placed in the HEAD tag of the default page that is loaded for the site. For DNS, the token should be placed in a TXT record of the domain.',
            type: 'string',
          },
          token: {
            description: 'The verification token. The token must be placed appropriately in order for verification to succeed.',
            type: 'string',
          },
        },
        type: 'object',
      },
      SiteVerificationWebResourceListResponse: {
        properties: {
          items: {
            description: 'The list of sites that are owned by the authenticated user.',
            items: {
              $ref: '#/components/schemas/SiteVerificationWebResourceResource',
            },
            type: 'array',
          },
        },
        type: 'object',
      },
      SiteVerificationWebResourceResource: {
        properties: {
          id: {
            description: 'The string used to identify this site. This value should be used in the "id" portion of the REST URL for the Get, Update, and Delete operations.',
            type: 'string',
          },
          owners: {
            description: 'The email addresses of all verified owners.',
            items: {
              type: 'string',
            },
            type: 'array',
          },
          site: {
            description: 'The address and type of a site that is verified or will be verified.',
            properties: {
              identifier: {
                description: 'The site identifier. If the type is set to SITE, the identifier is a URL. If the type is set to INET_DOMAIN, the site identifier is a domain name.',
                type: 'string',
              },
              type: {
                description: 'The site type. Can be SITE or INET_DOMAIN (domain name).',
                type: 'string',
              },
            },
            type: 'object',
          },
        },
        type: 'object',
      },
    },
    securitySchemes: {
      Oauth2: {
        description: 'Oauth 2.0 implicit authentication',
        flows: {
          implicit: {
            authorizationUrl: 'https://accounts.google.com/o/oauth2/auth',
            scopes: {
              'https://www.googleapis.com/auth/siteverification': 'Manage the list of sites and domains you control',
              'https://www.googleapis.com/auth/siteverification.verify_only': 'Manage your new site verifications with Google',
            },
          },
        },
        type: 'oauth2',
      },
      Oauth2c: {
        description: 'Oauth 2.0 authorizationCode authentication',
        flows: {
          authorizationCode: {
            authorizationUrl: 'https://accounts.google.com/o/oauth2/auth',
            scopes: {
              'https://www.googleapis.com/auth/siteverification': 'Manage the list of sites and domains you control',
              'https://www.googleapis.com/auth/siteverification.verify_only': 'Manage your new site verifications with Google',
            },
            tokenUrl: 'https://accounts.google.com/o/oauth2/token',
          },
        },
        type: 'oauth2',
      },
    },
  },
};
