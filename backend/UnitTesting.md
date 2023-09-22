# Unit Testing

Testing is fundamental to the process of development. With this thought, Unit Testing is rightly touted as the foundation of any successful application.

To ensure this aspect never gets pushed to the backlog due to the effort required for initial setup, an extended framework has been setup over [Jest](https://jestjs.io/) (the core module used for Unit Testing).


## Setup steps

1. `npm install` - (to install all required dependencies as well. Use *--only=dev* if app dependencies are already installed)
2. Change dsn for DB in `mockConfig.json` (pointing both master and slave to the same) as needed. Note: **Never use dev/test DB. Use a local empty DB** )
3. Start `mysql` server

<br>

## Running Tests

Tests can be run using multiple options CLI arguments. For assistance, 3 of the most common have been added as scripts and can be run from CLI using:
- `npm run test` (or alternatively `npm test`) - Runs unit tests.
- `npm run test:coverage` - Runs unit tests and generates the coverage report along with printing a concise report to console.
- `npm run test:ci` - Runs unit tests and generates the coverage report assuming tests are being run in a CI environment.

**Note:** Details of individual test cases are not printed when multiple files are executed. Howerver,  all the necessary details are printed to console for all failed tests. If details are required for  passed cases as well, run `npm run test -- --verbose`

<br>
To run specific tests, use:

```
npm run test -- --testNamePattern=<regex>
```

<br>
Example:<br>

`npm run test -- --testNamePattern='test_name'` 

**or**

`npm run test -- --testNamePattern='test_suite_name test_name'`

<br>
There are quite a few CLI flags that might come in handy for specific use cases. e.g. `--watch` which detects files for changes and reruns tests related to the changed files. 

These can also be passed in CLI arguments to `npm test` as follows:
```
npm test -- <flag>
```
<br>

## Migrations and Seeds

Custom migration and seeding scripts are included in the DB utilities. These scripts have been extended in `package.json` to be utilised as npm commands (as mentioned below).
<br><br>

### **Generating a migration**

Migration for creating a table can be generated using:

```
npm run migration:create <tableName>
```

Migration for altering a table can be generated using:

```
npm run migration:alter <tableName>
```

The above command generates a migration file in the migrations directory following a common pattern (**yyyymmddHHMMSS-<action>-<tableName>.js**). All file names must follow this pattern.
<br><br>

### **Generating a seed**
Seeds can be generated using:

```
npm run seed:generate <tableName>
```

The above command generates a seed file in the seeders directory following a common pattern (**yyyymmddHHMMSS-seed-<tableName>.js**). All file names must follow this pattern.
<br><br>

### **Population in DB**
All migration and seed files are prefixed with a timestamp which determines the order in which they will be run (with the earliest migration/seed running the first).

All migrations and seeds are run in the environment setup and removed in teardown.
<br><br>

## Coverage

Coverage reports are generated via `istanbul` which is built into `Jest`. This allows for the flexibility to generate coverage in all possible formats.

Currently, `JSON` and `Text` coverage reports are enabled. 
JSON coverage reports are generated as files and stored in coverage directory (specified in jest.config.js). Text coverage reports are printed to console and are used to check current coverage status.

`jest-junit` is another reporter added to generate JUnit styled test report which can be viewed on the Gitlab pipeline UI.

The JSON and JUnit report(s) need not and should not be committed since Unit Testing is anyways part of the CI pipeline.

**Note**: To configure other formats including custom formats, update `coverageReporters` in jest.config.js.

## Environment setup

All setup files used for creating a test environment are present in the `/unitTestData` folder. 

`up` queries of all migrations and seeds are run in order of their creation at the beginning and 
`down` queries of all migrations and seeds are run in the reverse order of their creation at the end of the execution of tests.