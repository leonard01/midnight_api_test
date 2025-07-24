import { test, expect, request } from '@playwright/test';

const baseURL = 'https://metadata-server-mock.onrender.com';

const subjects = [
  {
    subject: '919e8a1922aaa764b1d66407c6f62244e77081215f385b60a62091494861707079436f696e',
    expectedProperties: {
      name: 'HappyCoin',
      description: 'Coin with asset name - and everyone is happy!!!',
      url: 'https://happy.io'
    }
  },
  {
    subject: '2048c7e09308f9138cef8f1a81733b72e601d016eea5eef759ff2933416d617a696e67436f696e',
    expectedProperties: {
      name: 'Amazing Coin',
      description: '亜哀挨愛曖悪 АаБбВвГгДдЕеЁёЖжЗз  aąbcćdeęfghijklłmnoóprsś',
      url: 'https://amazing.io'
    }
  }
];

// to do

// Add logging for all requests and responses - see email
// add non existant subject test /get
// add fuzzy tests - use fuzzy lib
// are valid get requests returning duplicate responses?

test.describe('Get API Tests', () => {
    let apiContext;

    test.beforeAll(async () => {
        apiContext = await request.newContext({ baseURL });
    });

    test.afterAll(async () => {
        await apiContext.dispose();
    });


test.describe('GET /metadata/:subject', () => {

    test('should return metadata for a valid subject', async () => {
        const subject = subjects[0];
        const response = await apiContext.get(`/metadata/${subject.subject}`);
        expect(response.ok()).toBeTruthy();
        const body = await response.json();
        expect(body).toHaveProperty('subject', subject.subject);

        for (const [key, value] of Object.entries(subject.expectedProperties)) {
            expect(body).toHaveProperty(key);
            expect(body[key]).toHaveProperty('value');
            expect(body[key].value).toBe(value);
        }
    });

    test('should return correct metadata for second valid subject', async () => {
        const subject = subjects[1]; // Amazing Coin
        const response = await apiContext.get(`/metadata/${subject.subject}`);
        expect(response.ok()).toBeTruthy();
        const body = await response.json();
        expect(body).toHaveProperty('subject', subject.subject);

        for (const [key, value] of Object.entries(subject.expectedProperties)) {
            expect(body).toHaveProperty(key);
            expect(body[key]).toHaveProperty('value');
            expect(body[key].value).toBe(value);
        }
    });
  

    test('should return complete metadata for known subject', async () => {
        const subject = '919e8a1922aaa764b1d66407c6f62244e77081215f385b60a62091494861707079436f696e';

        const response = await apiContext.get(`/metadata/${subject}`);
        expect(response.ok()).toBeTruthy();

        const body = await response.json();

        expect(body.subject).toBe(subject);

        expect(body.name?.value).toBe('HappyCoin');
        expect(body.url?.value).toBe('https://happy.io');
        expect(body.ticker?.value).toBe('HAPPY3');
        expect(body.decimals?.value).toBe(6);
        expect(body.policy).toBe('82008201818200581c69303ce3536df260efddbc949ccb94e6993302b10b778d8b4d98bfb5');
        expect(body.logo?.value).toContain('iVBOR'); // Just check that it's a base64-encoded image
        expect(body.description?.value).toBe('Coin with asset name - and everyone is happy!!!');

        expect(Array.isArray(body.name?.signatures ?? body.name?.anSignatures)).toBeTruthy();
        expect(Array.isArray(body.description?.signatures ?? body.description?.anSignatures)).toBeTruthy();
        expect(Array.isArray(body.url?.signatures)).toBeTruthy();
    });



    // test failing - should return 400  
    test('should return 400 Bad Request for malformed subject', async () => {
        const malformedSubject = 'INVALID_SUBJECT';
        const response = await apiContext.get(`/metadata/${malformedSubject}`);
        expect(response.status()).toBe(400);
    });

    // test failing - should return 404 
    test('should handle non-existent subject gracefully and return 404', async () => {
        const fakeSubject = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
        const response = await apiContext.get(`/metadata/${fakeSubject}`);
        expect([404]).toContain(response.status());
        const body = await response.text();
        expect(body).toContain(`Requested subject '${fakeSubject}' not found`);
    });

    // test failing - should return 400
    test('should return 400  for subject with non-hex chars', async () => {
        const invalidSubject = 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz';
        const response = await apiContext.get(`/metadata/${invalidSubject}`);

        expect(response.ok()).toBeFalsy();
        expect([400]).toContain(response.status());
    });

    test('should return 404 for missing subject', async () => {
        const response = await apiContext.get(`/metadata/`);
        expect(response.status()).toBe(404);
    });

    // test failing 
    test('should return 405 for using POST', async () => {
        const subject = subjects[0].subject;
        const response = await apiContext.post(`/metadata/${subject}`);
        expect(response.status()).toBe(405);
    });

    // test failing 
    test('should return error for short subject', async () => {
        const shortHexSubject = 'abc123';
        const response = await apiContext.get(`/metadata/${shortHexSubject}`);
        expect(response.status()).toBeGreaterThanOrEqual(400);
    });

    // test failing 
    test('should return 404 or error for numeric subject', async () => {
        const numericSubject = '123456789';
        const response = await apiContext.get(`/metadata/${numericSubject}`);
        expect(response.status()).toBeGreaterThanOrEqual(400);
    });

    // test failing 
    test('should return 404 for subject with special characters', async () => {
        const specialCharSubject = '@#$%';
        const response = await apiContext.get(`/metadata/${specialCharSubject}`);
        expect(response.status()).toBe(400);
    });

    // test failing 
    test('should return 400 for extremely long subject string', async () => {
        const longHex = 'a'.repeat(1024); // 1024 characters of hex-like input
        const response = await apiContext.get(`/metadata/${longHex}`);
        expect(response.status()).toBeGreaterThanOrEqual(400);
    });

    // test failing 
    test('should return 404 for valid hex format but random data', async () => {
        const randomHex = [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        const response = await apiContext.get(`/metadata/${randomHex}`);
        expect(response.status()).toBe(404);
    });
  });

  });