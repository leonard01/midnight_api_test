import { test, expect, request } from '@playwright/test';

const baseURL = 'https://metadata-server-mock.onrender.com';

// Known working subjects
const subjects = [
  '919e8a1922aaa764b1d66407c6f62244e77081215f385b60a62091494861707079436f696e', // HappyCoin
  '2048c7e09308f9138cef8f1a81733b72e601d016eea5eef759ff2933416d617a696e67436f696e' // AmazingCoin
];

// to do

// Add logging for all requests and responses - see email

test.describe('Metadata API', () => {
  let apiContext;

  test.beforeAll(async () => {
    apiContext = await request.newContext({ baseURL });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  // ------------------------------------------
  // 🟢 POST /metadata/query
  // ------------------------------------------
test.describe('POST /metadata/query', () => {
  test.only('should return metadata for multiple subjects and multiple properties', async () => {
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

  test('should return metadata for a single subject and single property', async () => {
    const response = await apiContext.post('/metadata/query', {
      data: {
        subjects: [subjects[0]],
        properties: ['name']
      }
    });
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body).toHaveProperty('subjects');
    expect(Array.isArray(body.subjects)).toBeTruthy();
    expect(body.subjects.length).toBe(1);
    expect(body.subjects[0]).toHaveProperty('name');
    expect(body.subjects[0].name).toHaveProperty('value');
  });

  // test failing
   test('should reject GET requests with an appropriate error', async () => {
    const response = await apiContext.get('/metadata/query');
    expect([405]).toContain(response.status());
  });

  // test failing
    test('should handle missing request body gracefully', async () => {
    const response = await apiContext.post('/metadata/query'); // No body sent
    console.log('POST /metadata/query (no body) status:', response.status());
    const body = await response.text();
    console.log('Response body:', body);
    // Expecting 400 Bad Request but mock API might not handle this
    expect([400]).toContain(response.status());
  });

  // test failing
  test('should handle payload with subjects but no properties without failing', async () => {
    const response = await apiContext.post('/metadata/query', {
      data: {
        subjects: [subjects[0]]
        // properties omitted
      }
    });

    // test failing
    console.log('POST /metadata/query (no properties) status:', response.status());
    const body = await response.json();
    console.log('Response body:', body);

    // Depending on API design, it may return all properties or error
    expect([200]).toContain(response.status());
  });

  // test failing
  test('should fail with payload with properties but no subjects', async () => {
    const response = await apiContext.post('/metadata/query', {
      data: {
        // subjects omitted
        properties: ['name']
      }
    });
    console.log('POST /metadata/query (no subjects) status:', response.status());
    const body = await response.text();
    console.log('Response body:', body);
    expect([400]).toContain(response.status());
  });
});


  // ------------------------------------------
  // 🟢 GET /metadata/:subject
  // ------------------------------------------
  test.describe('GET /metadata/:subject', () => {
    test('should return full metadata for a valid subject', async () => {
      const response = await apiContext.get(`/metadata/${subjects[0]}`);
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(body).toHaveProperty('subject');
      expect(body).toHaveProperty('name');
      expect(body).toHaveProperty('description');
    });

    test('should return 404 for an invalid subject', async () => {
      const response = await apiContext.get(`/metadata/invalidsubject123`);
      expect(response.status()).toBe(404); // 🛑 Known API bug: Currently returns 200
    });
  });

  // ------------------------------------------
  // 🟢 GET /metadata/:subject/properties/:property
  // ------------------------------------------
  test.describe('GET /metadata/:subject/properties/:property', () => {
    test('should return specific property details for a valid subject', async () => {
      const response = await apiContext.get(`/metadata/${subjects[0]}/properties/name`);
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(body).toHaveProperty('value');
      expect(body.value).toBeDefined();
    });
  });
});


/**
 * Runs an expectation and logs details only if it fails
 * @param expectationFn - Function containing the assertion
 * @param errorMessage - Optional custom message to log on failure
 */
async function assertWithLog(expectationFn: () => void | Promise<void>, errorMessage?: string) {
  try {
    await expectationFn();
  } catch (err: any) {
    console.error('❌ Assertion failed:', errorMessage ?? '', '\n', err?.message ?? err);
    throw err; // rethrow to mark test as failed
  }
}
