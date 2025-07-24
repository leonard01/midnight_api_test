# midnight_api_test

### Bugs

 Post request is not respecting parameters provided in request body. It is returning a lot more data. 
 When subjects and properties are both empty, the API returns HTTP 200 and an empty subjects array — this is valid behavior but should be documented
 Duplicate subject should usually mean data returned twice on post request




### 🌟 Stretch Goals (Beyond Scope)
- add test retry for flakey tests
- Parameterize environments to run against local, dev, or staging.
- Add structured request/response logging with verbosity levels.
- add test wrapper for error logging with logging levels.
- Generate and publish test coverage metrics to CI dashboards.
- Mock upstream dependencies for isolated negative-path testing.
- Move most of the tests to unit test level as less expensive to run (not worth doing for mocked data)
- performance test
- stress test with very large amounts of data on post
- validate all fields returned for correct types and structural integrity ie { value: string | number, sequenceNumber: number, signatures: [{ signature, publicKey }] }. An example of schema validation provided. 
- create more helper functions to cut down in duplication
✅ Subjects returned in correct order (matches request order)	Optional
✅ Duplicate subjects (e.g., same subject twice → should appear once or twice?)	Optional
✅ Case sensitivity of property names ("Name" vs "name") — do they silently fail?	Optional
✅ Max-length strings in properties (e.g. very long description)	Optional
✅ Valid but uncommon characters in returned values (Unicode, emoji, etc.)	Optional