
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  detectRuntime,
} = require('./runtime/library.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.9.1
 * Query Engine version: 23fdc5965b1e05fc54e5f26ed3de66776b93de64
 */
Prisma.prismaVersion = {
  client: "5.9.1",
  engine: "23fdc5965b1e05fc54e5f26ed3de66776b93de64"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}


  const path = require('path')

/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.CustomerScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  phone: 'phone',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InvoiceScalarFieldEnum = {
  id: 'id',
  invoice_number: 'invoice_number',
  amount: 'amount',
  dueDate: 'dueDate',
  issueDate: 'issueDate',
  status: 'status',
  startFollowups: 'startFollowups',
  followupStartDate: 'followupStartDate',
  currentStage: 'currentStage',
  nextActionAt: 'nextActionAt',
  lastSentAt: 'lastSentAt',
  lastSentStage: 'lastSentStage',
  notes: 'notes',
  reminder_stages: 'reminder_stages',
  reminder_dates: 'reminder_dates',
  tones: 'tones',
  hasPendingDraft: 'hasPendingDraft',
  gmailDraftId: 'gmailDraftId',
  customerId: 'customerId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ReplyScalarFieldEnum = {
  id: 'id',
  invoiceId: 'invoiceId',
  content: 'content',
  receivedAt: 'receivedAt',
  sentiment: 'sentiment',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GlobalSettingScalarFieldEnum = {
  id: 'id',
  beforeDueReminder: 'beforeDueReminder',
  createDraftsOnly: 'createDraftsOnly',
  escalationLadder: 'escalationLadder',
  smartEscalation: 'smartEscalation',
  consentVerified: 'consentVerified',
  dataDeletion: 'dataDeletion',
  readWebhook: 'readWebhook',
  writeWebhook: 'writeWebhook',
  followupStartDelayDays: 'followupStartDelayDays',
  syncActivity: 'syncActivity',
  managerEmails: 'managerEmails',
  logSentiment: 'logSentiment',
  updatedAt: 'updatedAt'
};

exports.Prisma.ActivityScalarFieldEnum = {
  id: 'id',
  customerName: 'customerName',
  channel: 'channel',
  status: 'status',
  message: 'message',
  draft_url: 'draft_url',
  timestamp: 'timestamp',
  customerId: 'customerId',
  invoiceId: 'invoiceId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.InvoiceStatus = exports.$Enums.InvoiceStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE'
};

exports.Prisma.ModelName = {
  Customer: 'Customer',
  Invoice: 'Invoice',
  Reply: 'Reply',
  GlobalSetting: 'GlobalSetting',
  Activity: 'Activity'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "C:\\Users\\admin1\\Desktop\\Ai Invoice Followup\\src\\generated-prisma",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "windows",
        "native": true
      }
    ],
    "previewFeatures": [],
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null,
    "schemaEnvPath": "../../.env"
  },
  "relativePath": "../../prisma",
  "clientVersion": "5.9.1",
  "engineVersion": "23fdc5965b1e05fc54e5f26ed3de66776b93de64",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "Z2VuZXJhdG9yIGNsaWVudCB7DQogIHByb3ZpZGVyID0gInByaXNtYS1jbGllbnQtanMiDQogIG91dHB1dCAgID0gIi4uL3NyYy9nZW5lcmF0ZWQtcHJpc21hIg0KfQ0KDQpkYXRhc291cmNlIGRiIHsNCiAgcHJvdmlkZXIgID0gInBvc3RncmVzcWwiDQogIHVybCAgICAgICA9IGVudigiREFUQUJBU0VfVVJMIikNCiAgZGlyZWN0VXJsID0gZW52KCJESVJFQ1RfVVJMIikNCn0NCg0KZW51bSBJbnZvaWNlU3RhdHVzIHsNCiAgUEVORElORw0KICBQQUlEDQogIE9WRVJEVUUNCn0NCg0KbW9kZWwgQ3VzdG9tZXIgeyAgDQogIGlkICAgICAgICBTdHJpbmcgICAgQGlkIEBkZWZhdWx0KHV1aWQoKSkNCiAgbmFtZSAgICAgIFN0cmluZw0KICBlbWFpbCAgICAgU3RyaW5nICAgIEB1bmlxdWUNCiAgcGhvbmUgICAgIFN0cmluZz8NCiAgbm90ZXMgICAgIFN0cmluZz8NCiAgaW52b2ljZXMgIEludm9pY2VbXQ0KICBjcmVhdGVkQXQgRGF0ZVRpbWUgIEBkZWZhdWx0KG5vdygpKQ0KICB1cGRhdGVkQXQgRGF0ZVRpbWUgIEB1cGRhdGVkQXQNCn0NCg0KbW9kZWwgSW52b2ljZSB7DQogIGlkICAgICAgICAgICAgICAgICBTdHJpbmcgICAgICAgIEBpZCBAZGVmYXVsdCh1dWlkKCkpDQogIGludm9pY2VfbnVtYmVyICAgICBTdHJpbmcgICAgICAgIEB1bmlxdWUNCiAgYW1vdW50ICAgICAgICAgICAgIEZsb2F0DQoNCiAgLy8g4pqg77iPIGR1ZURhdGUga2VwdCBvbmx5IGZvciBkaXNwbGF5L3JlZmVyZW5jZSAoTk9UIHVzZWQgaW4gbG9naWMpDQogIGR1ZURhdGUgICAgICAgICAgICBEYXRlVGltZT8NCg0KICAvLyDinIUgTWFpbiBkcml2ZXIgZm9yIGZvbGxvdy11cCBsb2dpYw0KICBpc3N1ZURhdGUgICAgICAgICAgRGF0ZVRpbWUNCg0KICBzdGF0dXMgICAgICAgICAgICAgSW52b2ljZVN0YXR1cyBAZGVmYXVsdChQRU5ESU5HKQ0KDQogIC8vIEZvbGxvdy11cCBjb25maWcgKGRheXMgQUZURVIgaXNzdWVEYXRlKQ0KICAvLyBOdWxsIG1lYW5zIHVzZSBHbG9iYWxTZXR0aW5nLmZvbGxvd3VwU3RhcnREZWxheURheXMNCiAgc3RhcnRGb2xsb3d1cHMgICAgIEludD8NCg0KICAvLyBDb21wdXRlZCBmaWVsZHMNCiAgZm9sbG93dXBTdGFydERhdGUgIERhdGVUaW1lPw0KDQogIC8vIEV4ZWN1dGlvbiBjb250cm9sIChhdXRvbWF0aW9uIGVuZ2luZSkNCiAgY3VycmVudFN0YWdlICAgICAgIEludCAgICAgICAgICAgQGRlZmF1bHQoMCkNCiAgbmV4dEFjdGlvbkF0ICAgICAgIERhdGVUaW1lPw0KICBsYXN0U2VudEF0ICAgICAgICAgRGF0ZVRpbWU/DQogIGxhc3RTZW50U3RhZ2UgICAgICBJbnQ/DQoNCiAgbm90ZXMgICAgICAgICAgICAgIFN0cmluZz8NCg0KICAvLyBIaXN0b3J5IChhdWRpdCB0cmFpbCkNCiAgcmVtaW5kZXJfc3RhZ2VzICAgIEludFtdDQogIHJlbWluZGVyX2RhdGVzICAgICBEYXRlVGltZVtdDQogIHRvbmVzICAgICAgICAgICAgICBTdHJpbmdbXQ0KDQogIGhhc1BlbmRpbmdEcmFmdCAgICBCb29sZWFuICAgICAgIEBkZWZhdWx0KGZhbHNlKQ0KICBnbWFpbERyYWZ0SWQgICAgICAgU3RyaW5nPw0KDQogIGN1c3RvbWVySWQgICAgICAgICBTdHJpbmcNCiAgY3VzdG9tZXIgICAgICAgICAgIEN1c3RvbWVyICAgICAgQHJlbGF0aW9uKGZpZWxkczogW2N1c3RvbWVySWRdLCByZWZlcmVuY2VzOiBbaWRdKQ0KDQogIHJlcGxpZXMgICAgICAgICAgICBSZXBseVtdDQoNCiAgY3JlYXRlZEF0ICAgICAgICAgIERhdGVUaW1lICAgICAgQGRlZmF1bHQobm93KCkpDQogIHVwZGF0ZWRBdCAgICAgICAgICBEYXRlVGltZSAgICAgIEB1cGRhdGVkQXQNCn0NCg0KbW9kZWwgUmVwbHkgew0KICBpZCAgICAgICAgIFN0cmluZyAgIEBpZCBAZGVmYXVsdCh1dWlkKCkpDQogIGludm9pY2VJZCAgU3RyaW5nDQogIGludm9pY2UgICAgSW52b2ljZSAgQHJlbGF0aW9uKGZpZWxkczogW2ludm9pY2VJZF0sIHJlZmVyZW5jZXM6IFtpZF0pDQogIGNvbnRlbnQgICAgU3RyaW5nDQogIHJlY2VpdmVkQXQgRGF0ZVRpbWUgQGRlZmF1bHQobm93KCkpDQogIHNlbnRpbWVudCAgU3RyaW5nPw0KDQogIGNyZWF0ZWRBdCBEYXRlVGltZSBAZGVmYXVsdChub3coKSkNCiAgdXBkYXRlZEF0IERhdGVUaW1lIEB1cGRhdGVkQXQNCn0NCg0KbW9kZWwgR2xvYmFsU2V0dGluZyB7DQogIGlkICAgICAgICAgICAgICAgIFN0cmluZyAgQGlkIEBkZWZhdWx0KCJnbG9iYWxfY29uZmlnIikNCiAgYmVmb3JlRHVlUmVtaW5kZXIgQm9vbGVhbiBAZGVmYXVsdCh0cnVlKQ0KICBjcmVhdGVEcmFmdHNPbmx5ICBCb29sZWFuIEBkZWZhdWx0KGZhbHNlKQ0KICBlc2NhbGF0aW9uTGFkZGVyICBKc29uPyAvLyBBcnJheSBvZiB7IGRlbGF5RGF5czogbnVtYmVyLCB0b25lOiBzdHJpbmcsIGxhYmVsOiBzdHJpbmcgfQ0KICBzbWFydEVzY2FsYXRpb24gICBCb29sZWFuIEBkZWZhdWx0KHRydWUpDQogIGNvbnNlbnRWZXJpZmllZCAgIEJvb2xlYW4gQGRlZmF1bHQodHJ1ZSkNCiAgZGF0YURlbGV0aW9uICAgICAgQm9vbGVhbiBAZGVmYXVsdCh0cnVlKQ0KICByZWFkV2ViaG9vayAgICAgICBTdHJpbmc/IEBkZWZhdWx0KCJodHRwczovL244bi55b3VyLXNpdGUuY29tL3dlYmhvb2svcmVhZC1zaGVldCIpDQogIHdyaXRlV2ViaG9vayAgICAgIFN0cmluZz8gQGRlZmF1bHQoImh0dHBzOi8vbjhuLnlvdXItc2l0ZS5jb20vd2ViaG9vay9zZW5kLXJlbWluZGVyIikNCiAgZm9sbG93dXBTdGFydERlbGF5RGF5cyBJbnQgQGRlZmF1bHQoMCkNCiAgc3luY0FjdGl2aXR5ICAgICAgQm9vbGVhbiBAZGVmYXVsdCh0cnVlKQ0KICBtYW5hZ2VyRW1haWxzICAgICBTdHJpbmc/IEBkZWZhdWx0KCJtYW5hZ2VyQGNvbXBhbnkuY29tLCBmaW5hbmNlQGNvbXBhbnkuY29tIikNCiAgbG9nU2VudGltZW50ICAgICAgQm9vbGVhbiBAZGVmYXVsdCh0cnVlKQ0KDQogIHVwZGF0ZWRBdCBEYXRlVGltZSBAdXBkYXRlZEF0DQp9DQoNCm1vZGVsIEFjdGl2aXR5IHsNCiAgaWQgICAgICAgICAgIFN0cmluZyAgIEBpZCBAZGVmYXVsdCh1dWlkKCkpDQogIGN1c3RvbWVyTmFtZSBTdHJpbmcNCiAgY2hhbm5lbCAgICAgIFN0cmluZyAgIC8vIGUuZy4sICdFbWFpbCcsICdEcmFmdCBDcmVhdGVkJywgJ1doYXRzQXBwJw0KICBzdGF0dXMgICAgICAgU3RyaW5nICAgLy8gZS5nLiwgJ0F3YWl0aW5nIFJldmlldycsICdEZWxpdmVyZWQnLCAnU2VudCcNCiAgbWVzc2FnZSAgICAgIFN0cmluZw0KICBkcmFmdF91cmwgICAgU3RyaW5nPw0KICB0aW1lc3RhbXAgICAgRGF0ZVRpbWUgQGRlZmF1bHQobm93KCkpDQogIA0KICBjdXN0b21lcklkICAgU3RyaW5nPw0KICBpbnZvaWNlSWQgICAgU3RyaW5nPw0KDQogIGNyZWF0ZWRBdCBEYXRlVGltZSBAZGVmYXVsdChub3coKSkNCiAgdXBkYXRlZEF0IERhdGVUaW1lIEB1cGRhdGVkQXQNCn0NCg==",
  "inlineSchemaHash": "58b50a1728140a2fd06ea5ad00dffe025c900de83581dc45d0e43b18289cb885",
  "noEngine": false
}

const fs = require('fs')

config.dirname = __dirname
if (!fs.existsSync(path.join(__dirname, 'schema.prisma'))) {
  const alternativePaths = [
    "src/generated-prisma",
    "generated-prisma",
  ]
  
  const alternativePath = alternativePaths.find((altPath) => {
    return fs.existsSync(path.join(process.cwd(), altPath, 'schema.prisma'))
  }) ?? alternativePaths[0]

  config.dirname = path.join(process.cwd(), alternativePath)
  config.isBundled = true
}

config.runtimeDataModel = JSON.parse("{\"models\":{\"Customer\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"invoices\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Invoice\",\"relationName\":\"CustomerToInvoice\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Invoice\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"invoice_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dueDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"issueDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"InvoiceStatus\",\"default\":\"PENDING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"startFollowups\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"followupStartDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currentStage\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nextActionAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastSentAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastSentStage\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reminder_stages\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reminder_dates\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tones\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"hasPendingDraft\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gmailDraftId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customer\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Customer\",\"relationName\":\"CustomerToInvoice\",\"relationFromFields\":[\"customerId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"replies\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Reply\",\"relationName\":\"InvoiceToReply\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Reply\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"invoiceId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"invoice\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Invoice\",\"relationName\":\"InvoiceToReply\",\"relationFromFields\":[\"invoiceId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"content\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"receivedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sentiment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"GlobalSetting\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"global_config\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"beforeDueReminder\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createDraftsOnly\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"escalationLadder\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"smartEscalation\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"consentVerified\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dataDeletion\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"readWebhook\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"https://n8n.your-site.com/webhook/read-sheet\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"writeWebhook\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"https://n8n.your-site.com/webhook/send-reminder\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"followupStartDelayDays\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"syncActivity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"managerEmails\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"manager@company.com, finance@company.com\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"logSentiment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Activity\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customerName\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"channel\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"message\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"draft_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"invoiceId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{\"InvoiceStatus\":{\"values\":[{\"name\":\"PENDING\",\"dbName\":null},{\"name\":\"PAID\",\"dbName\":null},{\"name\":\"OVERDUE\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.getQueryEngineWasmModule = undefined


const { warnEnvConflicts } = require('./runtime/library.js')

warnEnvConflicts({
    rootEnvPath: config.relativeEnvPaths.rootEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.rootEnvPath),
    schemaEnvPath: config.relativeEnvPaths.schemaEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.schemaEnvPath)
})

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

// file annotations for bundling tools to include these files
path.join(__dirname, "query_engine-windows.dll.node");
path.join(process.cwd(), "src/generated-prisma/query_engine-windows.dll.node")
// file annotations for bundling tools to include these files
path.join(__dirname, "schema.prisma");
path.join(process.cwd(), "src/generated-prisma/schema.prisma")
