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
// add fuzzy tests - use fuzzy lib
// are the post requests returning duplicate responses

test.describe('Post API tests', () => {
  let apiContext;

  test.beforeAll(async () => {
    apiContext = await request.newContext({ baseURL });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

test.describe('POST /metadata/query', () => {
  test('should return metadata for multiple subjects and multiple properties', async () => {
    const response = await apiContext.post('/metadata/query', {
        data: {
          subjects: subjects.map(s => s.subject),
          properties: ['name', 'description', 'url']
        }
      });
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      for (const returned of body.subjects) {
        const expected = subjects.find(s => s.subject === returned.subject);
        expect(expected).toBeTruthy();

        for (const [key, value] of Object.entries(expected!.expectedProperties)) {
          expect(returned).toHaveProperty(key);
          expect(returned[key]).toHaveProperty('value');
          expect(returned[key].value).toBe(value);
        }
      }
    });

test('should return metadata for a single subject and single property', async () => {
  const subject = subjects[0]; // HappyCoin
  const requestedProperty = 'name';

  const response = await apiContext.post('/metadata/query', {
    data: {
      subjects: [subject.subject],
      properties: [requestedProperty]
    }
  });

  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body).toHaveProperty('subjects');
  expect(Array.isArray(body.subjects)).toBe(true);
  expect(body.subjects.length).toBe(1);
  const returned = body.subjects[0];
  expect(returned.subject).toBe(subject.subject);
  expect(returned).toHaveProperty(requestedProperty);
  expect(returned[requestedProperty]).toHaveProperty('value');
  expect(returned[requestedProperty].value).toBe(subject.expectedProperties[requestedProperty]);
  expect(returned).not.toHaveProperty('description');
  expect(returned).not.toHaveProperty('url');
  });


test('should return metadata for a single subject with name and url only', async () => {
  const subject = subjects[0]; // HappyCoin
  const requestedProperties = ['name', 'url'];

  const response = await apiContext.post('/metadata/query', {
    data: {
      subjects: [subject.subject],
      properties: requestedProperties
    }
  });

  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body).toHaveProperty('subjects');
  expect(Array.isArray(body.subjects)).toBe(true);
  expect(body.subjects.length).toBe(1);
  const returned = body.subjects[0];
  expect(returned.subject).toBe(subject.subject);

  for (const prop of requestedProperties) {
    expect(returned).toHaveProperty(prop);
    expect(returned[prop]).toHaveProperty('value');
    expect(returned[prop].value).toBe(subject.expectedProperties[prop]);
  }
  expect(returned).not.toHaveProperty('description');
});

test('should return only the url for multiple subjects', async () => {
  const requestedProperty = 'url';
  const excludedProperties = ['name', 'description'];

  const response = await apiContext.post('/metadata/query', {
    data: {
      subjects: subjects.map(s => s.subject),
      properties: [requestedProperty]
    }
  });

  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body).toHaveProperty('subjects');
  expect(Array.isArray(body.subjects)).toBe(true);
  expect(body.subjects.length).toBe(subjects.length);

  for (const returned of body.subjects) {
    const expected = subjects.find(s => s.subject === returned.subject);
    expect(expected).toBeTruthy();

    expect(returned).toHaveProperty(requestedProperty);
    expect(returned[requestedProperty]).toHaveProperty('value');
    expect(returned[requestedProperty].value).toBe(expected!.expectedProperties[requestedProperty]);

    for (const excluded of excludedProperties) {
      expect(returned).not.toHaveProperty(excluded);
    }
  }
});


// needs fixed - this is filtering out name, description and url but like all 200 post requests it is returning a bunch of other unasked for data
test('should handle a valid subject with empty properties array', async () => {
  const subject = subjects[0]; // HappyCoin

  const response = await apiContext.post('/metadata/query', {
    data: {
      subjects: [subject.subject],
      properties: [] // intentionally empty
    }
  });

  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  expect(body).toHaveProperty('subjects');
  expect(Array.isArray(body.subjects)).toBe(true);
  expect(body.subjects.length).toBe(1);

  const returned = body.subjects[0];
  expect(returned.subject).toBe(subject.subject);

  const foundProps = Object.keys(returned).filter(key => key !== 'subject');
  expect(foundProps.length).toBe(0); // strict: should return no properties

  if (foundProps.length > 0) {
    console.warn(`⚠️ Unexpected properties returned: ${foundProps.join(', ')}`);
  }
});

test('should return 200 and empty result when both subjects and properties are empty', async () => {
  const response = await apiContext.post('/metadata/query', {
    data: {
      subjects: [],
      properties: []
    }
  });

  expect(response.ok()).toBeTruthy();

  const body = await response.json();

  expect(body).toHaveProperty('subjects');
  expect(Array.isArray(body.subjects)).toBe(true);
  expect(body.subjects.length).toBe(0); // nothing returned, nothing requested
});

test('should return full metadata if properties field is omitted', async () => {
  const subject = subjects[0];

  const response = await apiContext.post('/metadata/query', {
    data: {
      subjects: [subject.subject]
      // properties intentionally omitted
    }
  });

  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  const returned = body.subjects[0];

  expect(returned).toHaveProperty('name');
  expect(returned).toHaveProperty('description');
  expect(returned).toHaveProperty('url');
});

// possible defect - duplicate subject should usually mean data returned twice
test('should handle duplicate subjects in request', async () => {
  const subject = subjects[0].subject;

  const response = await apiContext.post('/metadata/query', {
    data: {
      subjects: [subject, subject],
      properties: ['name']
    }
  });

  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.subjects.length).toBe(2); // or 1 depending on deduping behavior
});

test('should ignore extra unexpected fields in request body', async () => {
  const response = await apiContext.post('/metadata/query', {
    data: {
      subjects: [subjects[0].subject],
      properties: ['name'],
      extra: 'should be ignored'
    }
  });

  expect(response.ok()).toBeTruthy();
  const body = await response.json();

  expect(body).toHaveProperty('subjects');
  expect(Array.isArray(body.subjects)).toBe(true);
  expect(body.subjects.length).toBe(1);

  const returned = body.subjects[0];
  expect(returned.subject).toBe(subjects[0].subject);
  expect(returned).toHaveProperty('name');
  expect(returned.name).toHaveProperty('value');
  expect(returned.name.value).toBe(subjects[0].expectedProperties.name);

  // ✅ Assert the unexpected key is not in response
  expect(Object.keys(body)).not.toContain('extra');
});


// non happy path

// test failing - should return 400 
test('should return 400 Bad Request for invalid subject format', async () => {
  const invalidSubject = 'invalid-not-a-hex-string';

  const response = await apiContext.post('/metadata/query', {
    data: {
      subjects: [invalidSubject],
      properties: ['name']
    }
  });

  expect(response.status()).toBe(400);
});

test('should return empty subjects array for non-existent subject', async () => {
  const fakeSubject = 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'; // well-formed but doesn't exist

  const response = await apiContext.post('/metadata/query', {
    data: {
      subjects: [fakeSubject],
      properties: ['name']
    }
  });

  expect(response.ok()).toBeTruthy(); // Still a 200 response
  const body = await response.json();

  expect(body).toHaveProperty('subjects');
  expect(Array.isArray(body.subjects)).toBe(true);
  expect(body.subjects.length).toBe(0); // ← expect empty result
});

// test failing - should return 400 
test('should return 400 when subjects field is missing', async () => {
  const response = await apiContext.post('/metadata/query', {
    data: {
      // subjects intentionally omitted
      properties: ['name']
    }
  });

  expect(response.status()).toBe(400); 
});

// test failing - should return 400 
test('should return 400 when request body is empty', async () => {
  const response = await apiContext.post('/metadata/query', {
    data: {} // No subjects, no properties
  });

  expect(response.status()).toBe(400); // or appropriate status if API handles it differently
});

// test failing - should return 400  
test('should return 400 when subjects is null', async () => {
  const response = await apiContext.post('/metadata/query', {
    data: {
      subjects: null,
      properties: ['name']
    }
  });

  expect(response.status()).toBe(400);
});

// test failing - should return 400? 200 returned, behaviour maybe correct
test('should return 400 when properties is null', async () => {
  const response = await apiContext.post('/metadata/query', {
    data: {
      subjects: [subjects[0].subject],
      properties: null
    }
  });

  expect(response.status()).toBe(400);  
});

// test failing - should return 400  
test('should return 400 when subjects is a string instead of array', async () => {
  const response = await apiContext.post('/metadata/query', {
    data: {
      subjects: 'not-an-array',
      properties: ['name']
    }
  });

  expect(response.status()).toBe(400);
});

// test failing - should return 400  
test('should return 400 when properties is a string instead of array', async () => {
  const response = await apiContext.post('/metadata/query', {
    data: {
      subjects: [subjects[0].subject],
      properties: 'name'
    }
  });

  expect(response.status()).toBe(400);
});

// test failing - should return 400? 200 returned, behaviour maybe correct
test('should return 400 when subjects array contains null', async () => {
  const response = await apiContext.post('/metadata/query', {
    data: {
      subjects: [null],
      properties: ['name']
    }
  });

  expect(response.status()).toBe(400);
});

// test failing 
 test('should return 405 or 404 when GET is used instead of POST', async () => {
  const response = await apiContext.get('/metadata/query');

  // Accept either 405 or 404
  expect([404, 405]).toContain(response.status());
});

// test failing 
test('should return 400 when properties contain non string values', async () => {
  const response = await apiContext.post('/metadata/query', {
    data: {
      subjects: [subjects[0].subject],
      properties: [123, true, null]
    }
  });

  expect(response.status()).toBe(400);
});

// test failing 
test('should return 400 when subjects contain non string values', async () => {
  const response = await apiContext.post('/metadata/query', {
    data: {
      subjects: [null, 42, { foo: 'bar' }],
      properties: ['name']
    }
  });

  expect(response.status()).toBe(400);
});

// test failing 
test('should return 400 for empty string in subjects array', async () => {
  const response = await apiContext.post('/metadata/query', {
    data: {
      subjects: [''],
      properties: ['name']
    }
  });

  expect(response.status()).toBe(400);
});

// test failing 
test('should return 400 for empty string in properties array', async () => {
  const response = await apiContext.post('/metadata/query', {
    data: {
      subjects: [subjects[0].subject],
      properties: ['']
    }
  });

  expect(response.status()).toBe(400);
});

// test failing 
test('should return 400 for overly long subject string', async () => {
  const longSubject = 'a'.repeat(500);
  const response = await apiContext.post('/metadata/query', {
    data: {
      subjects: [longSubject],
      properties: ['name']
    }
  });

  expect(response.status()).toBe(400);
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
    expect([400]).toContain(response.status());
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
