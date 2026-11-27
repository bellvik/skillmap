const errorResponse = {
  description: 'Ошибка запроса',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/Error' },
    },
  },
};

const jsonRequest = (schema) => ({
  required: true,
  content: {
    'application/json': {
      schema: { $ref: `#/components/schemas/${schema}` },
    },
  },
});

const jsonResponse = (description, schema) => ({
  description,
  content: {
    'application/json': {
      schema: { $ref: `#/components/schemas/${schema}` },
    },
  },
});

const professionId = {
  name: 'professionId',
  in: 'path',
  required: true,
  schema: { type: 'integer', minimum: 1 },
};

const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'SkillMap API',
    description: 'API приложения SkillMap. Авторизация использует сессионную cookie.',
    version: '1.0.0',
  },
  servers: [{ url: '/' }],
  tags: [
    { name: 'Health' },
    { name: 'Auth' },
    { name: 'Professions' },
    { name: 'My maps' },
    { name: 'Admin' },
  ],
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Проверить состояние сервера',
        responses: {
          200: jsonResponse('Сервер работает', 'Health'),
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Создать аккаунт',
        requestBody: jsonRequest('RegisterRequest'),
        responses: {
          201: jsonResponse('Пользователь создан и авторизован', 'AuthResponse'),
          400: errorResponse,
          409: errorResponse,
          429: errorResponse,
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Войти',
        requestBody: jsonRequest('LoginRequest'),
        responses: {
          200: jsonResponse('Вход выполнен', 'AuthResponse'),
          401: errorResponse,
          429: errorResponse,
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Выйти и завершить сессию',
        responses: {
          204: { description: 'Сессия завершена' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Получить текущего пользователя',
        description: 'Если сессии нет, возвращает user: null.',
        responses: {
          200: jsonResponse('Текущий пользователь или null', 'CurrentUserResponse'),
        },
      },
    },
    '/api/professions': {
      get: {
        tags: ['Professions'],
        summary: 'Список активных профессий',
        responses: {
          200: jsonResponse('Профессии', 'Professions'),
        },
      },
    },
    '/api/professions/{professionId}': {
      get: {
        tags: ['Professions'],
        summary: 'Получить профессию',
        parameters: [professionId],
        responses: {
          200: jsonResponse('Профессия', 'Profession'),
          400: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/api/professions/{professionId}/skills': {
      get: {
        tags: ['Professions'],
        summary: 'Навыки профессии, предпосылки и ресурсы',
        parameters: [professionId],
        responses: {
          200: jsonResponse('Навыки', 'Skills'),
          400: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/api/me/maps': {
      get: {
        tags: ['My maps'],
        summary: 'Список моих карт с прогрессом',
        security: [{ sessionCookie: [] }],
        responses: {
          200: jsonResponse('Карты пользователя', 'UserMaps'),
          401: errorResponse,
        },
      },
    },
    '/api/me/maps/{professionId}': {
      put: {
        tags: ['My maps'],
        summary: 'Создать или заменить карту профессии',
        security: [{ sessionCookie: [] }],
        parameters: [professionId],
        requestBody: jsonRequest('SaveMapRequest'),
        responses: {
          200: jsonResponse('Сохранённая карта', 'UserMap'),
          400: errorResponse,
          401: errorResponse,
          404: errorResponse,
        },
      },
      delete: {
        tags: ['My maps'],
        summary: 'Удалить мою карту профессии',
        security: [{ sessionCookie: [] }],
        parameters: [professionId],
        responses: {
          204: { description: 'Карта удалена' },
          400: errorResponse,
          401: errorResponse,
        },
      },
    },
    '/api/me/maps/{professionId}/skills/{skillId}': {
      put: {
        tags: ['My maps'],
        summary: 'Обновить статус навыка в моей карте',
        security: [{ sessionCookie: [] }],
        parameters: [
          professionId,
          {
            name: 'skillId',
            in: 'path',
            required: true,
            schema: { type: 'integer', minimum: 1 },
          },
        ],
        requestBody: jsonRequest('UpdateSkillStatusRequest'),
        responses: {
          200: jsonResponse('Обновлённый статус', 'SkillStatus'),
          400: errorResponse,
          401: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/api/admin/summary': {
      get: {
        tags: ['Admin'],
        summary: 'Сводка для администратора',
        security: [{ sessionCookie: [] }],
        responses: {
          200: jsonResponse('Количество пользователей и профессий', 'AdminSummary'),
          401: errorResponse,
          403: errorResponse,
        },
      },
    },
  },
  components: {
    securitySchemes: {
      sessionCookie: {
        type: 'apiKey',
        in: 'cookie',
        name: 'skillmap_session',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        required: ['error'],
        properties: { error: { type: 'string' } },
      },
      Health: {
        type: 'object',
        properties: { status: { type: 'string', example: 'ok' } },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['user', 'admin'] },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'name', 'password'],
        properties: {
          email: { type: 'string', format: 'email', maxLength: 254 },
          name: { type: 'string', minLength: 1, maxLength: 80 },
          password: { type: 'string', minLength: 8, maxLength: 72 },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: { user: { $ref: '#/components/schemas/User' } },
      },
      CurrentUserResponse: {
        type: 'object',
        properties: {
          user: {
            allOf: [{ $ref: '#/components/schemas/User' }],
            nullable: true,
          },
        },
      },
      Profession: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string' },
          order: { type: 'integer' },
        },
      },
      Professions: {
        type: 'array',
        items: { $ref: '#/components/schemas/Profession' },
      },
      Resource: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          url: { type: 'string', format: 'uri' },
          type: { type: 'string' },
          language: { type: 'string' },
          duration: { type: 'string', nullable: true },
        },
      },
      Skill: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          categoryId: { type: 'integer' },
          categoryName: { type: 'string' },
          description: { type: 'string' },
          order: { type: 'integer' },
          professionId: { type: 'integer' },
          prerequisites: { type: 'array', items: { type: 'integer' } },
          resourceIds: { type: 'array', items: { type: 'integer' } },
          resources: { type: 'array', items: { $ref: '#/components/schemas/Resource' } },
        },
      },
      Skills: {
        type: 'array',
        items: { $ref: '#/components/schemas/Skill' },
      },
      SkillStatus: {
        type: 'object',
        properties: {
          skillId: { type: 'integer' },
          status: { type: 'string', enum: ['not_started', 'in_progress', 'mastered'] },
        },
      },
      UpdateSkillStatusRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['not_started', 'in_progress', 'mastered'] },
        },
      },
      SaveMapRequest: {
        type: 'object',
        required: ['level', 'skills'],
        properties: {
          level: { type: 'string', enum: ['beginner', 'junior', 'middle', 'senior'] },
          skills: { type: 'array', items: { $ref: '#/components/schemas/SkillStatus' } },
        },
      },
      UserMap: {
        type: 'object',
        properties: {
          professionId: { type: 'integer' },
          professionName: { type: 'string' },
          level: { type: 'string' },
          updatedAt: { type: 'string' },
          skills: { type: 'array', items: { $ref: '#/components/schemas/SkillStatus' } },
        },
      },
      UserMaps: {
        type: 'array',
        items: { $ref: '#/components/schemas/UserMap' },
      },
      AdminSummary: {
        type: 'object',
        properties: {
          users: { type: 'integer' },
          professions: { type: 'integer' },
        },
      },
    },
  },
};

export default openApiDocument;
