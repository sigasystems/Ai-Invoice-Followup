
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
} = require('./runtime/edge.js')


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
  "inlineSchema": "Z2VuZXJhdG9yIGNsaWVudCB7DQogIHByb3ZpZGVyID0gInByaXNtYS1jbGllbnQtanMiDQogIG91dHB1dCAgID0gIi4uL3NyYy9nZW5lcmF0ZWQtcHJpc21hIg0KfQ0KDQpkYXRhc291cmNlIGRiIHsNCiAgcHJvdmlkZXIgID0gInBvc3RncmVzcWwiDQogIHVybCAgICAgICA9IGVudigiREFUQUJBU0VfVVJMIikNCiAgZGlyZWN0VXJsID0gZW52KCJESVJFQ1RfVVJMIikNCn0NCg0KZW51bSBJbnZvaWNlU3RhdHVzIHsNCiAgUEVORElORw0KICBQQUlEDQogIE9WRVJEVUUNCn0NCg0KbW9kZWwgQ3VzdG9tZXIgew0KICBpZCAgICAgICAgU3RyaW5nICAgIEBpZCBAZGVmYXVsdCh1dWlkKCkpDQogIG5hbWUgICAgICBTdHJpbmcNCiAgZW1haWwgICAgIFN0cmluZyAgICBAdW5pcXVlDQogIHBob25lICAgICBTdHJpbmc/DQogIG5vdGVzICAgICBTdHJpbmc/DQogIGludm9pY2VzICBJbnZvaWNlW10NCiAgY3JlYXRlZEF0IERhdGVUaW1lICBAZGVmYXVsdChub3coKSkNCiAgdXBkYXRlZEF0IERhdGVUaW1lICBAdXBkYXRlZEF0DQp9DQoNCm1vZGVsIEludm9pY2Ugew0KICBpZCAgICAgICAgICAgICBTdHJpbmcgQGlkIEBkZWZhdWx0KHV1aWQoKSkNCiAgaW52b2ljZV9udW1iZXIgU3RyaW5nIEB1bmlxdWUNCiAgYW1vdW50ICAgICAgICAgRmxvYXQNCg0KICAvLyDimqDvuI8gZHVlRGF0ZSBrZXB0IG9ubHkgZm9yIGRpc3BsYXkvcmVmZXJlbmNlIChOT1QgdXNlZCBpbiBsb2dpYykNCiAgZHVlRGF0ZSBEYXRlVGltZT8NCg0KICAvLyDinIUgTWFpbiBkcml2ZXIgZm9yIGZvbGxvdy11cCBsb2dpYw0KICBpc3N1ZURhdGUgRGF0ZVRpbWUNCg0KICBzdGF0dXMgSW52b2ljZVN0YXR1cyBAZGVmYXVsdChQRU5ESU5HKQ0KDQogIC8vIEZvbGxvdy11cCBjb25maWcgKGRheXMgQUZURVIgaXNzdWVEYXRlKQ0KICAvLyBOdWxsIG1lYW5zIHVzZSBHbG9iYWxTZXR0aW5nLmZvbGxvd3VwU3RhcnREZWxheURheXMNCiAgc3RhcnRGb2xsb3d1cHMgSW50Pw0KDQogIC8vIENvbXB1dGVkIGZpZWxkcw0KICBmb2xsb3d1cFN0YXJ0RGF0ZSBEYXRlVGltZT8NCg0KICAvLyBFeGVjdXRpb24gY29udHJvbCAoYXV0b21hdGlvbiBlbmdpbmUpDQogIGN1cnJlbnRTdGFnZSAgSW50DQogIG5leHRBY3Rpb25BdCAgRGF0ZVRpbWU/DQogIGxhc3RTZW50QXQgICAgRGF0ZVRpbWU/DQogIGxhc3RTZW50U3RhZ2UgSW50Pw0KDQogIG5vdGVzIFN0cmluZz8NCg0KICAvLyBIaXN0b3J5IChhdWRpdCB0cmFpbCkNCiAgcmVtaW5kZXJfc3RhZ2VzIEludFtdDQogIHJlbWluZGVyX2RhdGVzICBEYXRlVGltZVtdDQogIHRvbmVzICAgICAgICAgICBTdHJpbmdbXQ0KDQogIGhhc1BlbmRpbmdEcmFmdCBCb29sZWFuIEBkZWZhdWx0KGZhbHNlKQ0KICBnbWFpbERyYWZ0SWQgICAgU3RyaW5nPw0KDQogIGN1c3RvbWVySWQgU3RyaW5nDQogIGN1c3RvbWVyICAgQ3VzdG9tZXIgQHJlbGF0aW9uKGZpZWxkczogW2N1c3RvbWVySWRdLCByZWZlcmVuY2VzOiBbaWRdKQ0KDQogIHJlcGxpZXMgUmVwbHlbXQ0KDQogIGNyZWF0ZWRBdCBEYXRlVGltZSBAZGVmYXVsdChub3coKSkNCiAgdXBkYXRlZEF0IERhdGVUaW1lIEB1cGRhdGVkQXQNCn0NCg0KbW9kZWwgUmVwbHkgew0KICBpZCAgICAgICAgIFN0cmluZyAgIEBpZCBAZGVmYXVsdCh1dWlkKCkpDQogIGludm9pY2VJZCAgU3RyaW5nDQogIGludm9pY2UgICAgSW52b2ljZSAgQHJlbGF0aW9uKGZpZWxkczogW2ludm9pY2VJZF0sIHJlZmVyZW5jZXM6IFtpZF0pDQogIGNvbnRlbnQgICAgU3RyaW5nDQogIHJlY2VpdmVkQXQgRGF0ZVRpbWUgQGRlZmF1bHQobm93KCkpDQogIHNlbnRpbWVudCAgU3RyaW5nPw0KDQogIGNyZWF0ZWRBdCBEYXRlVGltZSBAZGVmYXVsdChub3coKSkNCiAgdXBkYXRlZEF0IERhdGVUaW1lIEB1cGRhdGVkQXQNCn0NCg0KbW9kZWwgR2xvYmFsU2V0dGluZyB7DQogIGlkICAgICAgICAgICAgICAgICAgICAgU3RyaW5nICBAaWQgQGRlZmF1bHQoImdsb2JhbF9jb25maWciKQ0KICBiZWZvcmVEdWVSZW1pbmRlciAgICAgIEJvb2xlYW4gQGRlZmF1bHQodHJ1ZSkNCiAgY3JlYXRlRHJhZnRzT25seSAgICAgICBCb29sZWFuIEBkZWZhdWx0KGZhbHNlKQ0KICBlc2NhbGF0aW9uTGFkZGVyICAgICAgIEpzb24/IC8vIEFycmF5IG9mIHsgZGVsYXlEYXlzOiBudW1iZXIsIHRvbmU6IHN0cmluZywgbGFiZWw6IHN0cmluZyB9DQogIHNtYXJ0RXNjYWxhdGlvbiAgICAgICAgQm9vbGVhbiBAZGVmYXVsdCh0cnVlKQ0KICBjb25zZW50VmVyaWZpZWQgICAgICAgIEJvb2xlYW4gQGRlZmF1bHQodHJ1ZSkNCiAgZGF0YURlbGV0aW9uICAgICAgICAgICBCb29sZWFuIEBkZWZhdWx0KHRydWUpDQogIHJlYWRXZWJob29rICAgICAgICAgICAgU3RyaW5nPyBAZGVmYXVsdCgiaHR0cHM6Ly9uOG4ueW91ci1zaXRlLmNvbS93ZWJob29rL3JlYWQtc2hlZXQiKQ0KICB3cml0ZVdlYmhvb2sgICAgICAgICAgIFN0cmluZz8gQGRlZmF1bHQoImh0dHBzOi8vbjhuLnlvdXItc2l0ZS5jb20vd2ViaG9vay9zZW5kLXJlbWluZGVyIikNCiAgZm9sbG93dXBTdGFydERlbGF5RGF5cyBJbnQgICAgIEBkZWZhdWx0KDApDQogIHN5bmNBY3Rpdml0eSAgICAgICAgICAgQm9vbGVhbiBAZGVmYXVsdCh0cnVlKQ0KICBtYW5hZ2VyRW1haWxzICAgICAgICAgIFN0cmluZz8gQGRlZmF1bHQoIm1hbmFnZXJAY29tcGFueS5jb20sIGZpbmFuY2VAY29tcGFueS5jb20iKQ0KICBsb2dTZW50aW1lbnQgICAgICAgICAgIEJvb2xlYW4gQGRlZmF1bHQodHJ1ZSkNCg0KICB1cGRhdGVkQXQgRGF0ZVRpbWUgQHVwZGF0ZWRBdA0KfQ0KDQptb2RlbCBBY3Rpdml0eSB7DQogIGlkICAgICAgICAgICBTdHJpbmcgICBAaWQgQGRlZmF1bHQodXVpZCgpKQ0KICBjdXN0b21lck5hbWUgU3RyaW5nDQogIGNoYW5uZWwgICAgICBTdHJpbmcgLy8gZS5nLiwgJ0VtYWlsJywgJ0RyYWZ0IENyZWF0ZWQnLCAnV2hhdHNBcHAnDQogIHN0YXR1cyAgICAgICBTdHJpbmcgLy8gZS5nLiwgJ0F3YWl0aW5nIFJldmlldycsICdEZWxpdmVyZWQnLCAnU2VudCcNCiAgbWVzc2FnZSAgICAgIFN0cmluZw0KICBkcmFmdF91cmwgICAgU3RyaW5nPw0KICB0aW1lc3RhbXAgICAgRGF0ZVRpbWUgQGRlZmF1bHQobm93KCkpDQoNCiAgY3VzdG9tZXJJZCBTdHJpbmc/DQogIGludm9pY2VJZCAgU3RyaW5nPw0KDQogIGNyZWF0ZWRBdCBEYXRlVGltZSBAZGVmYXVsdChub3coKSkNCiAgdXBkYXRlZEF0IERhdGVUaW1lIEB1cGRhdGVkQXQNCn0NCg==",
  "inlineSchemaHash": "0ac76a2a2438a25a9255c2a094ee2a8519875b1ee43d559ce9823be5841e576a",
  "noEngine": false
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"Customer\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"invoices\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Invoice\",\"relationName\":\"CustomerToInvoice\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Invoice\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"invoice_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dueDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"issueDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"InvoiceStatus\",\"default\":\"PENDING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"startFollowups\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"followupStartDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currentStage\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nextActionAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastSentAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastSentStage\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reminder_stages\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reminder_dates\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tones\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"hasPendingDraft\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gmailDraftId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customer\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Customer\",\"relationName\":\"CustomerToInvoice\",\"relationFromFields\":[\"customerId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"replies\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Reply\",\"relationName\":\"InvoiceToReply\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Reply\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"invoiceId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"invoice\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Invoice\",\"relationName\":\"InvoiceToReply\",\"relationFromFields\":[\"invoiceId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"content\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"receivedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sentiment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"GlobalSetting\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"global_config\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"beforeDueReminder\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createDraftsOnly\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"escalationLadder\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"smartEscalation\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"consentVerified\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dataDeletion\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"readWebhook\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"https://n8n.your-site.com/webhook/read-sheet\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"writeWebhook\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"https://n8n.your-site.com/webhook/send-reminder\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"followupStartDelayDays\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"syncActivity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"managerEmails\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"manager@company.com, finance@company.com\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"logSentiment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Activity\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customerName\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"channel\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"message\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"draft_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"invoiceId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{\"InvoiceStatus\":{\"values\":[{\"name\":\"PENDING\",\"dbName\":null},{\"name\":\"PAID\",\"dbName\":null},{\"name\":\"OVERDUE\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.getQueryEngineWasmModule = undefined

config.injectableEdgeEnv = () => ({
  parsed: {
    DATABASE_URL: typeof globalThis !== 'undefined' && globalThis['DATABASE_URL'] || typeof process !== 'undefined' && process.env && process.env.DATABASE_URL || undefined
  }
})

if (typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined) {
  Debug.enable(typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined)
}

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

