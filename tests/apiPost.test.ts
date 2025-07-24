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
  const requestBody = {
    subjects: subjects.map(s => s.subject),
    properties: ['name', 'description', 'url']
  };

  console.log('Request:', JSON.stringify(requestBody, null, 2));
  const response = await apiContext.post('/metadata/query', { data: requestBody });
  const body = await response.json();
  console.log('Response:', JSON.stringify(body, null, 2));
  expect(response.ok()).toBeTruthy();

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

  const requestBody = {
    subjects: [subject.subject],
    properties: [requestedProperty]
  };

  console.log('Request:', JSON.stringify(requestBody, null, 2));
  const response = await apiContext.post('/metadata/query', { data: requestBody });
  const body = await response.json();
  console.log('Response:', JSON.stringify(body, null, 2));

  expect(response.ok()).toBeTruthy();
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

  const requestBody = {
    subjects: [subject.subject],
    properties: requestedProperties
  };

  console.log('Request:', JSON.stringify(requestBody, null, 2));

  const response = await apiContext.post('/metadata/query', {
    data: requestBody
  });

  const body = await response.json();
  console.log('Response:', JSON.stringify(body, null, 2));

  expect(response.ok()).toBeTruthy();
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

  const requestBody = {
    subjects: subjects.map(s => s.subject),
    properties: [requestedProperty]
  };

  console.log('Request:', JSON.stringify(requestBody, null, 2));
  const response = await apiContext.post('/metadata/query', {
    data: requestBody
  });

  const body = await response.json();
  console.log('Response:', JSON.stringify(body, null, 2));

  expect(response.ok()).toBeTruthy();
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

  const requestBody = {
    subjects: [subject.subject],
    properties: []
  };
  console.log('Request:', JSON.stringify(requestBody, null, 2));

  const response = await apiContext.post('/metadata/query', { data: requestBody });

  const body = await response.json();
  console.log('Response:', JSON.stringify(body, null, 2));

  expect(response.ok()).toBeTruthy();
  expect(body).toHaveProperty('subjects');
  expect(Array.isArray(body.subjects)).toBe(true);
  expect(body.subjects.length).toBe(1);

  const returned = body.subjects[0];
  expect(returned.subject).toBe(subject.subject);

  const foundProps = Object.keys(returned).filter(key => key !== 'subject');
  expect(foundProps.length).toBe(0); // strict: should return no properties

  if (foundProps.length > 0) {
    console.warn(`Unexpected properties returned: ${foundProps.join(', ')}`);
  }
});


test('should return 200 and empty result when both subjects and properties are empty', async () => {
  const requestBody = {
    subjects: [],
    properties: []
  };
  console.log('Request:', JSON.stringify(requestBody, null, 2));

  const response = await apiContext.post('/metadata/query', { data: requestBody });

  const body = await response.json();
  console.log('Response:', JSON.stringify(body, null, 2));

  expect(response.ok()).toBeTruthy();
  expect(body).toHaveProperty('subjects');
  expect(Array.isArray(body.subjects)).toBe(true);
  expect(body.subjects.length).toBe(0); // nothing returned, nothing requested
});


test('should return full metadata if properties field is omitted', async () => {
  const requestBody = {
    subjects: [subjects[0].subject]
    // properties intentionally omitted
  };
  console.log('Request:', JSON.stringify(requestBody, null, 2));

  const response = await apiContext.post('/metadata/query', { data: requestBody });

  const body = await response.json();
  console.log('Response:', JSON.stringify(body, null, 2));

  expect(response.ok()).toBeTruthy();
  const returned = body.subjects[0];

  expect(returned).toHaveProperty('name');
  expect(returned).toHaveProperty('description');
  expect(returned).toHaveProperty('url');
});


// possible defect - duplicate subject should usually mean data returned twice
test('should handle duplicate subjects in request', async () => {
  const subject = subjects[0].subject;

  const requestBody = {
    subjects: [subject, subject],
    properties: ['name']
  };
  console.log('Request:', JSON.stringify(requestBody, null, 2));

  const response = await apiContext.post('/metadata/query', { data: requestBody });

  const body = await response.json();
  console.log('Response:', JSON.stringify(body, null, 2));

  expect(response.ok()).toBeTruthy();
  expect(body.subjects.length).toBe(2); // or 1 depending on deduping behavior
});


test('should ignore extra unexpected fields in request body', async () => {
  const requestBody = {
    subjects: [subjects[0].subject],
    properties: ['name'],
    extra: 'should be ignored'
  };
  console.log('Request:', JSON.stringify(requestBody, null, 2));

  const response = await apiContext.post('/metadata/query', { data: requestBody });

  const body = await response.json();
  console.log('Response:', JSON.stringify(body, null, 2));

  expect(response.ok()).toBeTruthy();
  expect(body).toHaveProperty('subjects');
  expect(Array.isArray(body.subjects)).toBe(true);
  expect(body.subjects.length).toBe(1);

  const returned = body.subjects[0];
  expect(returned.subject).toBe(subjects[0].subject);
  expect(returned).toHaveProperty('name');
  expect(returned.name).toHaveProperty('value');
  expect(returned.name.value).toBe(subjects[0].expectedProperties.name);
  expect(Object.keys(body)).not.toContain('extra');
});



// non happy path

// test failing - should return 400 
test('should return 400 Bad Request for invalid subject format', async () => {
  const requestBody = {
    subjects: ['invalid-not-a-hex-string'],
    properties: ['name']
  };
  console.log('Request:', JSON.stringify(requestBody, null, 2));

  const response = await apiContext.post('/metadata/query', { data: requestBody });
  const body = await response.text();
  console.log(`Status: ${response.status()}\n Body: ${body}`);

  expect(response.status()).toBe(400);
});

test('should return empty subjects array for non-existent subject', async () => {
  const requestBody = {
    subjects: ['deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'],
    properties: ['name']
  };
  console.log('➡️ Request:', JSON.stringify(requestBody, null, 2));

  const response = await apiContext.post('/metadata/query', { data: requestBody });
  const body = await response.json();
  console.log(`Status: ${response.status()}\nBody: ${JSON.stringify(body, null, 2)}`);

  expect(response.ok()).toBeTruthy();
  expect(body).toHaveProperty('subjects');
  expect(Array.isArray(body.subjects)).toBe(true);
  expect(body.subjects.length).toBe(0);
});

// test failing - should return 400 
test('should return 400 when subjects field is missing', async () => {
  const requestBody = {
    properties: ['name']
  };
  console.log('Request:', JSON.stringify(requestBody, null, 2));

  const response = await apiContext.post('/metadata/query', { data: requestBody });
  const body = await response.text();
  console.log(`Status: ${response.status()}\n Body: ${body}`);

  expect(response.status()).toBe(400);
});

// test failing - should return 400 
test('should return 400 when request body is empty', async () => {
  const requestBody = {};
  console.log('Request:', JSON.stringify(requestBody, null, 2));

  const response = await apiContext.post('/metadata/query', { data: requestBody });
  const body = await response.text();
  console.log(`Status: ${response.status()}\nBody: ${body}`);

  expect(response.status()).toBe(400);
});

// test failing - should return 400  
test('should return 400 when subjects is null', async () => {
  const requestBody = {
    subjects: null,
    properties: ['name']
  };
  console.log('Request:', JSON.stringify(requestBody, null, 2));

  const response = await apiContext.post('/metadata/query', { data: requestBody });
  const body = await response.text();
  console.log(`Status: ${response.status()}\nBody: ${body}`);

  expect(response.status()).toBe(400);
});

// test failing - should return 400? 200 returned, behaviour maybe correct
test('should return 400 when properties is null', async () => {
  const requestBody = {
    subjects: [subjects[0].subject],
    properties: null
  };
  console.log('Request:', JSON.stringify(requestBody, null, 2));

  const response = await apiContext.post('/metadata/query', { data: requestBody });
  const body = await response.text();
  console.log(`Status: ${response.status()}\nBody: ${body}`);

  expect(response.status()).toBe(400);
});

// test failing - should return 400  
test('should return 400 when subjects is a string instead of array', async () => {
  const requestBody = {
    subjects: 'not-an-array',
    properties: ['name']
  };
  console.log('Request:', JSON.stringify(requestBody, null, 2));

  const response = await apiContext.post('/metadata/query', { data: requestBody });
  const body = await response.text();
  console.log(`Status: ${response.status()}\nBody: ${body}`);

  expect(response.status()).toBe(400);
});

// test failing - should return 400  
test('should return 400 when properties is a string instead of array', async () => {
  const requestBody = {
    subjects: [subjects[0].subject],
    properties: 'name'
  };
  console.log('Request:', JSON.stringify(requestBody, null, 2));

  const response = await apiContext.post('/metadata/query', { data: requestBody });
  const body = await response.text();
  console.log(`Status: ${response.status()}\nBody: ${body}`);

  expect(response.status()).toBe(400);
});

// test failing - should return 400? 200 returned, behaviour maybe correct
test('should return 400 when subjects array contains null', async () => {
  const requestBody = {
    subjects: [null],
    properties: ['name']
  };
  console.log('Request:', JSON.stringify(requestBody, null, 2));

  const response = await apiContext.post('/metadata/query', { data: requestBody });
  const body = await response.text();
  console.log(`Status: ${response.status()}\nBody: ${body}`);

  expect(response.status()).toBe(400);
});

// test failing 
test('should return 405 when GET is used instead of POST', async () => {
  console.log('GET /metadata/query');

  const response = await apiContext.get('/metadata/query');
  const body = await response.text();
  console.log(`Status: ${response.status()}\nBody: ${body}`);

  expect([405]).toContain(response.status());
});

// test failing 
test('should return 400 when properties contain non string values', async () => {
  const requestBody = {
    subjects: [subjects[0].subject],
    properties: [123, true, null]
  };
  console.log('Request:', JSON.stringify(requestBody, null, 2));

  const response = await apiContext.post('/metadata/query', { data: requestBody });
  const body = await response.text();
  console.log(`Status: ${response.status()}\nBody: ${body}`);

  expect(response.status()).toBe(400);
});

// test failing 
test('should return 400 when subjects contain non string values', async () => {
  const requestBody = {
    subjects: [null, 42, { foo: 'bar' }],
    properties: ['name']
  };
  console.log('Request:', JSON.stringify(requestBody, null, 2));

  const response = await apiContext.post('/metadata/query', { data: requestBody });
  const body = await response.text();
  console.log(`Status: ${response.status()}\nBody: ${body}`);

  expect(response.status()).toBe(400);
});

// test failing 
test('should return 400 for empty string in subjects array', async () => {
  const requestBody = {
    subjects: [''],
    properties: ['name']
  };
  console.log('Request:', JSON.stringify(requestBody, null, 2));

  const response = await apiContext.post('/metadata/query', { data: requestBody });
  const body = await response.text();
  console.log(`Status: ${response.status()}\nBody: ${body}`);

  expect(response.status()).toBe(400);
});

// test failing 
test('should return 400 for empty string in properties array', async () => {
  const requestBody = {
    subjects: [subjects[0].subject],
    properties: ['']
  };
  console.log('Request:', JSON.stringify(requestBody, null, 2));

  const response = await apiContext.post('/metadata/query', { data: requestBody });
  const body = await response.text();
  console.log(`Status: ${response.status()}\n Body: ${body}`);

  expect(response.status()).toBe(400);
});

// test failing 
test('should return 400 for overly long subject string', async () => {
  const requestBody = {
    subjects: ['a'.repeat(500)],
    properties: ['name']
  };
  console.log('➡️ Request:', JSON.stringify(requestBody, null, 2));

  const response = await apiContext.post('/metadata/query', { data: requestBody });
  const body = await response.text();
  console.log(`Status: ${response.status()}\nBody: ${body}`);

  expect(response.status()).toBe(400);
});
});
});


// example log functioning assertion 
// async function assertWithLog(expectationFn: () => void | Promise<void>, errorMessage?: string) {
//   try {
//     await expectationFn();
//   } catch (err: any) {
//     console.error('❌ Assertion failed:', errorMessage ?? '', '\n', err?.message ?? err);
//     throw err; // rethrow to mark test as failed
//   }
// }
