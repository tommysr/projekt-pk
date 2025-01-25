const { mockReset } = require('jest-mock-extended')
const { prismaMock } = require('./src/lib/__mocks__/@prisma/client')

require('@testing-library/jest-dom')
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
global.Request = require('node-fetch').Request
global.Response = require('node-fetch').Response
global.Headers = require('node-fetch').Headers
global.fetch = require('node-fetch')
global.NextRequest = require('next/server').NextRequest
beforeEach(() => {
  mockReset(prismaMock)
})
