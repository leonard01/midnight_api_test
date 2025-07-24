# midnight_api_test


This project is an automated test suite for verifying the behavior of a Metadata API with endpoints like:

- `GET /metadata/:subject`
- `GET /metadata/:subject/properties/:property`
- `POST /metadata/query`

The tests cover both **happy paths** and **edge cases** using [Playwright Test](https://playwright.dev/test) and include optional schema validation via `ajv`.

---

## Usage

```bash # 

# Install dependencies
npm install

# Run all tests
npm run test

# Docker options
npm run test:docker:build      # Build Docker container to run tests
npm run test:docker:run        # Run tests inside container
npm run test:docker:build-run  # Build + run tests
npm run test:docker:shell      # Build and open shell inside container

```


### Bugs

    tests/apiPost.test.ts - all successful posts are returning all metadata even when a subset is requested
    tests/apiPost.test.ts:171:5 › Post API tests › POST /metadata/query › should handle a valid subject with empty properties array
    tests/apiPost.test.ts:243:5 › Post API tests › POST /metadata/query › should handle duplicate subjects in request
    tests/apiPost.test.ts:293:5 › Post API tests › POST /metadata/query › should return 400 Bad Request for invalid subject format
    tests/apiPost.test.ts:325:5 › Post API tests › POST /metadata/query › should return 400 when subjects field is missing
    tests/apiPost.test.ts:337:5 › Post API tests › POST /metadata/query › should return 400 when request body is empty
    tests/apiPost.test.ts:346:5 › Post API tests › POST /metadata/query › should return 400 when subjects is null
    tests/apiPost.test.ts:358:5 › Post API tests › POST /metadata/query › should return 400 when properties is null
    tests/apiPost.test.ts:370:5 › Post API tests › POST /metadata/query › should return 400 when subjects is a string instead of array
    tests/apiPost.test.ts:382:5 › Post API tests › POST /metadata/query › should return 400 when properties is a string instead of array
    tests/apiPost.test.ts:394:5 › Post API tests › POST /metadata/query › should return 400 when subjects array contains null
    tests/apiPost.test.ts:406:6 › Post API tests › POST /metadata/query › should return 405 when GET is used instead of POST
    tests/apiPost.test.ts:414:5 › Post API tests › POST /metadata/query › should return 400 when properties contain non string values
    tests/apiPost.test.ts:426:5 › Post API tests › POST /metadata/query › should return 400 when subjects contain non string values
    tests/apiPost.test.ts:438:5 › Post API tests › POST /metadata/query › should return 400 for empty string in subjects array
    tests/apiPost.test.ts:450:5 › Post API tests › POST /metadata/query › should return 400 for empty string in properties array
    tests/apiPost.test.ts:462:5 › Post API tests › POST /metadata/query › should return 400 for overly long subject string
    tests/apiGet.test.ts:92:9 › Get API Tests › GET /metadata/:subject › should return 400 Bad Request for malformed subject
    tests/apiGet.test.ts:100:9 › Get API Tests › GET /metadata/:subject › should handle non-existent subject gracefully and return 404
    tests/apiGet.test.ts:110:9 › Get API Tests › GET /metadata/:subject › should return 400  for subject with non-hex chars
    tests/apiGet.test.ts:126:9 › Get API Tests › GET /metadata/:subject › should return 405 for using POST
    tests/apiGet.test.ts:134:9 › Get API Tests › GET /metadata/:subject › should return error for short subject
    tests/apiGet.test.ts:142:9 › Get API Tests › GET /metadata/:subject › should return 404 or error for numeric subject
    tests/apiGet.test.ts:150:9 › Get API Tests › GET /metadata/:subject › should return 404 for subject with special characters
    tests/apiGet.test.ts:158:9 › Get API Tests › GET /metadata/:subject › should return 400 for extremely long subject string
    tests/apiGet.test.ts:166:9 › Get API Tests › GET /metadata/:subject › should return 404 for valid hex format but random data
    tests/apiGet.test.ts:286:5 › Get API Tests › GET /metadata/:subject/properties/:property › should return correct ticker for HappyCoin
    tests/apiGet.test.ts:301:5 › Get API Tests › GET /metadata/:subject/properties/:property › should return 400 for malformed subject (non-hex characters)
    tests/apiGet.test.ts:309:5 › Get API Tests › GET /metadata/:subject/properties/:property › should return 404 for non-existent subject
    tests/apiGet.test.ts:319:5 › Get API Tests › GET /metadata/:subject/properties/:property › should return 404 for invalid property name
    tests/apiGet.test.ts:340:5 › Get API Tests › GET /metadata/:subject/properties/:property › should return 400 for malformed subject format
    tests/apiGet.test.ts:350:5 › Get API Tests › GET /metadata/:subject/properties/:property › should return 404 for unknown property name
    tests/apiGet.test.ts:379:5 › Get API Tests › GET /metadata/:subject/properties/:property › should return 400 for excessively long subject
    tests/apiGet.test.ts:387:5 › Get API Tests › GET /metadata/:subject/properties/:property › should return 404 for property with special characters
    tests/apiGet.test.ts:396:5 › Get API Tests › GET /metadata/:subject/properties/:property › should return 404 for uppercase property name
    tests/apiGet.test.ts:413:5 › Get API Tests › GET /metadata/:subject/properties/:property › should return 400 for property name with special characters
    tests/apiGet.test.ts:422:5 › Get API Tests › GET /metadata/:subject/properties/:property › should return 404 when /properties/ segment is missing




### Future Improvements
- add test retry for flakey tests
- Parameterize environments to run against local, dev, or staging.
- Add structured request/response logging with verbosity levels.
- add test wrapper for error logging with logging levels.
- Generate and publish test coverage metrics to CI dashboards.
- Mock upstream dependencies for isolated negative-path testing.
- Move most of the tests to unit test level as less expensive to run (not worth doing for mocked data)
- performance testing
- stress test with very large amounts of data on post
- validate all fields returned for correct types and structural integrity ie { value: string | number, sequenceNumber: number, signatures: [{ signature, publicKey }] }. An example of schema validation provided. 
- create more helper functions to cut down on duplication
-  Subjects returned in correct order (matches request order)	
 - Case sensitivity of property names ("Name" vs "name")
