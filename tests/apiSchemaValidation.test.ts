import { test, expect, request } from '@playwright/test';
import Ajv from 'ajv';
import metadataSchema from './schemas/metadata.schema';

const testSubject = '919e8a1922aaa764b1d66407c6f62244e77081215f385b60a62091494861707079436f696e';


test.describe('Schema Validation Test', () => {
  let apiContext;

  test.beforeAll(async () => {
    apiContext = await request.newContext({ baseURL: 'https://metadata-server-mock.onrender.com' });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('should return a response conforming to the metadata schema', async () => {
    const response = await apiContext.get(`/metadata/${testSubject}`);
    expect(response.ok()).toBeTruthy();

    const body = await response.json();

    const ajv = new Ajv({ allErrors: true });
    const validate = ajv.compile(metadataSchema);
    const valid = validate(body);

    expect(valid).toBe(true);

    if (!valid && validate.errors) {
      console.error('Schema validation errors:', validate.errors);
    }
  });

});
