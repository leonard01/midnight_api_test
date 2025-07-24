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
// delete expected properties??

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
  });

  });