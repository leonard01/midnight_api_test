export const metadataSchema = {
  type: 'object',
  required: ['subject'],
  properties: {
    subject: { type: 'string' },
    name: {
      type: 'object',
      required: ['value', 'signatures'],
      properties: {
        value: { type: 'string' },
        signatures: {
          type: 'array',
          items: {
            type: 'object',
            required: ['signature', 'publicKey'],
            properties: {
              signature: { type: 'string' },
              publicKey: { type: 'string' }
            }
          }
        }
      }
    },
    url: { $ref: '#/definitions/property' },
    description: { $ref: '#/definitions/property' },
    ticker: { $ref: '#/definitions/property' },
    decimals: {
      type: 'object',
      required: ['value'],
      properties: {
        value: { type: 'number' }
      }
    },
    logo: { $ref: '#/definitions/property' },
    policy: { type: 'string' }
  },
  definitions: {
    property: {
      type: 'object',
      required: ['value', 'signatures'],
      properties: {
        value: { type: ['string', 'number'] },
        signatures: {
          type: 'array',
          items: {
            type: 'object',
            required: ['signature', 'publicKey'],
            properties: {
              signature: { type: 'string' },
              publicKey: { type: 'string' }
            }
          }
        }
      }
    }
  }
};

export default metadataSchema