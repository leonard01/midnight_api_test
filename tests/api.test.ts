import { test, expect, request } from '@playwright/test';

const baseURL = 'https://metadata-server-mock.onrender.com';

// Known working subjects
const subjects = [
  '919e8a1922aaa764b1d66407c6f62244e77081215f385b60a62091494861707079436f696e', // HappyCoin
  '2048c7e09308f9138cef8f1a81733b72e601d016eea5eef759ff2933416d617a696e67436f696e' // AmazingCoin
];

test.describe('Metadata API', () => {
  let apiContext;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await request.newContext({ baseURL });
  });

  test('POST /metadata/query with valid subjects returns metadata', async () => {
    const response = await apiContext.post('/metadata/query', {
      data: {
        subjects: [subjects[0], subjects[1]],
        properties: ['name', 'description']
      }
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty('subjects');
    expect(Array.isArray(body.subjects)).toBeTruthy();
    expect(body.subjects.length).toBeGreaterThan(0);
  });

  test('GET /metadata/:subject returns full metadata', async () => {
    const response = await apiContext.get(`/metadata/${subjects[0]}`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    console.log('Response:', body);
    expect(body).toHaveProperty('subject');
    expect(body).toHaveProperty('name');
    expect(body).toHaveProperty('description');
  });

  test('GET /metadata/:subject/properties/:property returns property details', async () => {
    const response = await apiContext.get(`/metadata/${subjects[0]}/properties/name`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    console.log('Response:', body);
    expect(body).toHaveProperty('value');
    expect(body.value).toBeDefined();
  });

  test('GET /metadata/:invalidSubject returns not found', async () => {
    const response = await apiContext.get(`/metadata/invalidsubject123`);
    expect(response.status()).toBe(404);
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });
});
