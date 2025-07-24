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

let apiContext;

test.beforeAll(async () => {
  apiContext = await request.newContext({ baseURL });
});

test.afterAll(async () => {
  await apiContext.dispose();
});


test.describe('Get API Tests', () => {

test.describe('GET /metadata/:subject', () => {

    test('should return metadata for a valid subject', async () => {
        const subject = subjects[0];
        const response = await apiContext.get(`/metadata/${subject.subject}`);
        console.log('Response:', JSON.stringify(response, null, 2));
        expect(response.ok()).toBeTruthy();
        const body = await response.json();
        assertSubjectProperties(body, subject);
    });

    test('should return correct metadata for second valid subject', async () => {
        const subject = subjects[1]; // Amazing Coin
        const response = await apiContext.get(`/metadata/${subject.subject}`);
        console.log('Response:', JSON.stringify(response, null, 2));
        expect(response.ok()).toBeTruthy();
        const body = await response.json();
        expect(body).toHaveProperty('subject', subject.subject);
        assertSubjectProperties(body, subject);
    });
  

    test('should return complete metadata for known subject', async () => {
        const subject = '919e8a1922aaa764b1d66407c6f62244e77081215f385b60a62091494861707079436f696e';

        const response = await apiContext.get(`/metadata/${subject}`);
        console.log('Response:', JSON.stringify(response, null, 2));
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
        console.log('Response:', JSON.stringify(response, null, 2));
        expect(response.status()).toBe(400);
    });

    // test failing - should return 404 
    test('should handle non-existent subject gracefully and return 404', async () => {
        const fakeSubject = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
        const response = await apiContext.get(`/metadata/${fakeSubject}`);
        console.log('Response:', JSON.stringify(response, null, 2));
        expect([404]).toContain(response.status());
        const body = await response.text();
        expect(body).toContain(`Requested subject '${fakeSubject}' not found`);
    });

    // test failing - should return 400
    test('should return 400  for subject with non-hex chars', async () => {
        const invalidSubject = 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz';
        const response = await apiContext.get(`/metadata/${invalidSubject}`);
        console.log('Response:', JSON.stringify(response, null, 2));

        expect(response.ok()).toBeFalsy();
        expect([400]).toContain(response.status());
    });

    test('should return 404 for missing subject', async () => {
        const response = await apiContext.get(`/metadata/`);
        console.log('Response:', JSON.stringify(response, null, 2));
        expect(response.status()).toBe(404);
    });

    // test failing 
    test('should return 405 for using POST', async () => {
        const subject = subjects[0].subject;
        const response = await apiContext.post(`/metadata/${subject}`);
        console.log('Response:', JSON.stringify(response, null, 2));
        expect(response.status()).toBe(405);
    });

    // test failing 
    test('should return error for short subject', async () => {
        const shortHexSubject = 'abc123';
        const response = await apiContext.get(`/metadata/${shortHexSubject}`);
        console.log('Response:', JSON.stringify(response, null, 2));
        expect(response.status()).toBeGreaterThanOrEqual(400);
    });

    // test failing 
    test('should return 404 or error for numeric subject', async () => {
        const numericSubject = '123456789';
        const response = await apiContext.get(`/metadata/${numericSubject}`);
        console.log('Response:', JSON.stringify(response, null, 2));
        expect(response.status()).toBeGreaterThanOrEqual(400);
    });

    // test failing 
    test('should return 404 for subject with special characters', async () => {
        const specialCharSubject = '@#$%';
        const response = await apiContext.get(`/metadata/${specialCharSubject}`);
        console.log('Response:', JSON.stringify(response, null, 2));
        expect(response.status()).toBe(400);
    });

    // test failing 
    test('should return 400 for extremely long subject string', async () => {
        const longHex = 'a'.repeat(1024); // 1024 characters of hex-like input
        const response = await apiContext.get(`/metadata/${longHex}`);
        console.log('Response:', JSON.stringify(response, null, 2));
        expect(response.status()).toBeGreaterThanOrEqual(400);
    });

    // test failing 
    test('should return 404 for valid hex format but random data', async () => {
        const randomHex = [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        const response = await apiContext.get(`/metadata/${randomHex}`);
        console.log('Response:', JSON.stringify(response, null, 2));
        expect(response.status()).toBe(404);
    });
  });


test.describe('GET /metadata/:subject/properties/:property', () => {
  
  test('should return all properties for HappyCoin', async () => {
    const subject = subjects[0];

    for (const [property, expectedValue] of Object.entries(subject.expectedProperties)) {
      const response = await apiContext.get(`/metadata/${subject.subject}/properties/${property}`);
      console.log('Response:', JSON.stringify(response, null, 2));
      expect(response.ok()).toBeTruthy();

      const body = await response.json();

      expect(body).toHaveProperty('value', expectedValue);
      expect(Array.isArray(body.signatures)).toBeTruthy();
      expect(body.signatures.length).toBeGreaterThan(0);

      for (const sig of body.signatures) {
        expect(sig).toHaveProperty('signature');
        expect(sig).toHaveProperty('publicKey');
      }
    }
  });

  test('should return all properties for Amazing Coin', async () => {
    const subject = subjects[1];

    for (const [property, expectedValue] of Object.entries(subject.expectedProperties)) {
      const response = await apiContext.get(`/metadata/${subject.subject}/properties/${property}`);
      console.log('Response:', JSON.stringify(response, null, 2));
      expect(response.ok()).toBeTruthy();

      const body = await response.json();

      expect(body).toHaveProperty('value', expectedValue);
      expect(Array.isArray(body.signatures)).toBeTruthy();
      expect(body.signatures.length).toBeGreaterThan(0);

      for (const sig of body.signatures) {
        expect(sig).toHaveProperty('signature');
        expect(sig).toHaveProperty('publicKey');
      }
    }
  });

   test('should return exact full data for name property of HappyCoin', async () => {
    const subject = '919e8a1922aaa764b1d66407c6f62244e77081215f385b60a62091494861707079436f696e';
    const property = 'name';

    const expectedResponse = {
      sequenceNumber: 0,
      value: 'HappyCoin',
      signatures: [
        {
          signature: '10c0761f6992768208644451cfd8bf77c1a09f8346a2381c22d87107aef107dee3db29d826b7332f0181546d30ad49c6d3338c70ce7aa082ae2dd54e78e9cf01',
          publicKey: 'db2c42a7c5b70d7e635b95c5864439f22ccd6639cc7bc128a88a804f149a4448'
        }
      ]
    };

    const response = await apiContext.get(`/metadata/${subject}/properties/${property}`);
    console.log('Response:', JSON.stringify(response, null, 2));
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toEqual(expectedResponse);
  });

  test('should return correct `name` property for HappyCoin', async () => {
    const { subject, expectedProperties } = subjects[0];
    const response = await apiContext.get(`/metadata/${subject}/properties/name`);
    console.log('Response:', JSON.stringify(response, null, 2));

    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.value).toBe(expectedProperties.name);
    expect(body).toHaveProperty('sequenceNumber', 0);
    expect(Array.isArray(body.signatures)).toBeTruthy();
    expect(body.signatures[0]).toHaveProperty('signature');
    expect(body.signatures[0]).toHaveProperty('publicKey');
  });

test('should return correct `description` property for Amazing Coin', async () => {
  const { subject, expectedProperties } = subjects[1];
  const response = await apiContext.get(`/metadata/${subject}/properties/description`);
  console.log('Response:', JSON.stringify(response, null, 2));

  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  expect(body.value).toBe(expectedProperties.description);
  expect(body).toHaveProperty('sequenceNumber', 0); // or 1 if known
  expect(Array.isArray(body.signatures)).toBeTruthy();
  expect(body.signatures[0]).toHaveProperty('signature');
  expect(body.signatures[0]).toHaveProperty('publicKey');
});

test('should return correct `url` property for Amazing Coin', async () => {
  const { subject, expectedProperties } = subjects[1];
  const response = await apiContext.get(`/metadata/${subject}/properties/url`);
  console.log('Response:', JSON.stringify(response, null, 2));

  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  expect(body.value).toBe(expectedProperties.url);
  expect(body).toHaveProperty('sequenceNumber', 0);
  expect(Array.isArray(body.signatures)).toBeTruthy();
  expect(body.signatures[0]).toHaveProperty('signature');
  expect(body.signatures[0]).toHaveProperty('publicKey');
});

test('should return correct ticker for HappyCoin', async ({ request }) => {
    const { subject } = subjects[0]; // HappyCoin
    const expectedTicker = 'HAPPY3';

    const response = await request.get(`/metadata/${subject}/properties/ticker`);
    console.log('Response:', JSON.stringify(response, null, 2));
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body).toHaveProperty('value', expectedTicker);
    expect(typeof body.sequenceNumber).toBe('number');
    expect(Array.isArray(body.signatures)).toBeTruthy();
  });

// test failing
test('should return 400 for malformed subject (non-hex characters)', async () => {
  const malformedSubject = 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz';
  const response = await apiContext.get(`/metadata/${malformedSubject}/properties/name`);
  console.log('Response:', JSON.stringify(response, null, 2));
  expect(response.status()).toEqual(400);
});

// test failing
test('should return 404 for non-existent subject', async () => {
  const fakeSubject = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
  const response = await apiContext.get(`/metadata/${fakeSubject}/properties/name`);
  console.log('Response:', JSON.stringify(response, null, 2));
  expect(response.status()).toBe(404);
  const body = await response.text();
  expect(body).toContain(`Requested subject '${fakeSubject}' not found`);
});

// test failing
test('should return 404 for invalid property name', async () => {
  const subject = subjects[0].subject;
  const invalidProperty = 'ticker';
  const response = await apiContext.get(`/metadata/${subject}/properties/${invalidProperty}`);
  console.log('Response:', JSON.stringify(response, null, 2));
  expect(response.status()).toBe(404);

  const body = await response.text();
  expect(body).toContain(`Property '${invalidProperty}' not found for subject '${subject}'`);
});


test('should return 404 when property name is missing in the URL', async () => {
  const subject = subjects[0].subject;
  const response = await apiContext.get(`/metadata/${subject}/properties/`);
  console.log('Response:', JSON.stringify(response, null, 2));
  expect(response.status()).toBe(404);
});


// needs fixed
test('should return 400 for malformed subject format', async () => {
  const malformedSubject = 'not-a-valid-subject';
  const property = 'name';

  const response = await apiContext.get(`/metadata/${malformedSubject}/properties/${property}`);
  console.log('Response:', JSON.stringify(response, null, 2));
  expect(response.status()).toBe(400);
});

// needs fixed
test('should return 404 for unknown property name', async () => {
  const subject = subjects[0].subject;
  const invalidProperty = 'unknownProperty';
  const response = await apiContext.get(`/metadata/${subject}/properties/${invalidProperty}`);
  console.log('Response:', JSON.stringify(response, null, 2));
  expect(response.status()).toBe(404);
});

test('should return 404 for empty subject with valid property', async () => {
  const property = 'name';
  const response = await apiContext.get(`/metadata//properties/${property}`);
  console.log('Response:', JSON.stringify(response, null, 2));
  expect(response.status()).toBe(404);
});

test('should return 404 for valid subject but empty property', async () => {
  const { subject } = subjects[0];
  const response = await apiContext.get(`/metadata/${subject}/properties/`);
  console.log('Response:', JSON.stringify(response, null, 2));
  expect(response.status()).toBe(404);
});

test('should return 404 for empty subject and empty property', async () => {
  const response = await apiContext.get(`/metadata//properties/`);
  console.log('Response:', JSON.stringify(response, null, 2));
  expect(response.status()).toBe(404);
});

// test failing
test('should return 400 for excessively long subject', async () => {
  const longSubject = 'a'.repeat(2048);
  const response = await apiContext.get(`/metadata/${longSubject}/properties/name`);
  console.log('Response:', JSON.stringify(response, null, 2));
  expect(response.status()).toBe(400);
});

// test failing
test('should return 404 for property with special characters', async () => {
  const { subject } = subjects[0];
  const invalidProperty = '!@#$%^&*()';
  const response = await apiContext.get(`/metadata/${subject}/properties/${invalidProperty}`);
  console.log('Response:', JSON.stringify(response, null, 2));
  expect(response.status()).toBe(404);
});

// test failing
test('should return 404 for uppercase property name', async () => {
  const { subject } = subjects[0];
  const uppercaseProperty = 'Name';
  const response = await apiContext.get(`/metadata/${subject}/properties/${uppercaseProperty}`);
  console.log('Response:', JSON.stringify(response, null, 2));
  expect(response.status()).toBe(404);
});

// test failing
test('should return 404 when property name is empty', async () => {
  const { subject } = subjects[0];
  const response = await apiContext.get(`/metadata/${subject}/properties/`);
  console.log('Response:', JSON.stringify(response, null, 2));
  expect(response.status()).toBe(404); // Or adjust if should be 400
});

// test failing
test('should return 400 for property name with special characters', async () => {
  const { subject } = subjects[0];
  const invalidProperty = '@#$%';
  const response = await apiContext.get(`/metadata/${subject}/properties/${invalidProperty}`);
  console.log('Response:', JSON.stringify(response, null, 2));
  expect(response.status()).toBe(400);
});

// test failing
test('should return 404 when /properties/ segment is missing', async () => {
  const { subject } = subjects[0];
  const response = await apiContext.get(`/metadata/${subject}`);
  console.log('Response:', JSON.stringify(response, null, 2));
  expect(response.status()).toBe(404);
});


});
});


function assertValidSignatures(signatures: any[]) {
  expect(Array.isArray(signatures)).toBeTruthy();
  expect(signatures.length).toBeGreaterThan(0);
  for (const sig of signatures) {
    expect(sig).toHaveProperty('signature');
    expect(sig).toHaveProperty('publicKey');
  }
}

function assertSubjectProperties(body: any, subject: { subject: string; expectedProperties: Record<string, string> }) {
  expect(body).toHaveProperty('subject', subject.subject);

  for (const [key, value] of Object.entries(subject.expectedProperties)) {
    expect(body).toHaveProperty(key);
    expect(body[key]).toHaveProperty('value', value);
    assertValidSignatures(body[key].signatures ?? body[key].anSignatures ?? []);
  }
}
