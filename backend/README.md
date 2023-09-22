# Node Boilerplate

Complete boilerplate for fast and effective set up of new **Node.js** web applications based on **Express**.  

>It is highly recommended that you go through the documentation before starting. However, in the interest of time, if you wish to jump to the steps to start-up, click [here](#Steps%20for%20start-up).  

## Overview

For a boilerplate, there are a host of basic components that should be inculcated along with a number of others that make the development journey more enjoyable.  

Keeping this in mind, the following subset of functionalities has been implemented based on internal developer experience(s).

- [Node Boilerplate](#node-boilerplate)
  - [Overview](#overview)
    - [Modules used](#modules-used)
      - [**MVC**](#mvc)
      - [**HTTP Client**](#http-client)
      - [**Code Quality**](#code-quality)
      - [**Monitoring**](#monitoring)
    - [Versioning](#versioning)
  - [Steps for start-up](#steps-for-start-up)
    - [Prerequisites](#prerequisites)
  - [Logging](#logging)
    - [**Disabling Tracking logs**](#disabling-tracking-logs)
    - [**Log params (App and Tracking)**](#log-params-app-and-tracking)
    - [**Logging to console (DEV environment)**](#logging-to-console-dev-environment)
  - [Database](#database)
  - [Redis](#redis)
    - [**TTL**](#ttl)
    - [**Retry Strategy**](#retry-strategy)
    - [**Key prefix**](#key-prefix)
  - [HTTP Client](#http-client-1)
  - [Custom Router](#custom-router)
  - [API Validations](#api-validations)
  - [Encryption Utility](#encryption-utility)
  - [Unit Tests](#unit-tests)
  - [Prometheus Client](#prometheus-client)
  - [CI Pipeline](#ci-pipeline)
  - [Canonical log lines](#canonical-log-lines)
  - [Health Check](#health-check)
  - [FAQs](#faqs)
  - [Stay tuned :gem](#stay-tuned-gem)

### Modules used

The setup has a number of core dependencies used for the features mentioned hereafter. All modules selected have been handpicked after careful evaluations based on internal POCs, reviews, and community support, and thus, should support all application use-cases.  

#### **MVC**

| feature       | module                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------- |
| App Framework | [Express](https://www.npmjs.com/package/express)                                                                    |
| Database      | [MySQL 2](https://www.npmjs.com/package/mysql2)                                                                     |
| Logging       | Application: [log4js](https://www.npmjs.com/package/log4js), Access: [Morgan](https://www.npmjs.com/package/morgan) |
| Redis         | [Node Redis](https://www.npmjs.com/package/redis)                                                                   |
| UI            | [Pug](https://www.npmjs.com/package/pug)                                                                            |

#### **HTTP Client**

| feature        | module                                                   |
| -------------- | -------------------------------------------------------- |
| Core Framework | [Axios](https://www.npmjs.com/package/axios)             |
| Custom Retry   | [Axios Retry](https://www.npmjs.com/package/axios-retry) |

#### **Code Quality**

| feature                      | module                                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Unit Tests and Code coverage | [Jest](https://www.npmjs.com/package/express)                                                                |
| Coverage reporting           | [Jest JUnit](https://www.npmjs.com/package/jest-junit) for JUnit styled coverage reports (used in Gitlab CI) |

#### **Monitoring**

| feature            | module                                                         |
| ------------------ | -------------------------------------------------------------- |
| Custom App Metrics | [Prometheus Client](https://www.npmjs.com/package/prom-client) |

### Versioning

The boilerplate follows [Semantic Versioning](http://semver.org/). For the current version, check the [package.json](./package.json).

## Steps for start-up

### Prerequisites

Node (for application) and npm (for managing modules)
>**Note**: Tested for Node version 14.17.0 (LTS) and npm version 6.14.13

Follow the steps below to be up and running with the application:

1. Install required dependencies: `npm install`
2. Create a copy of `config.example.json` in the same (config) folder and name it as `config.json`.
3. Update the configuration in `config.json` as required (especially **logSettings**, **db** and **redisSettings** configurations).

    > **Note**: If DB is not required, simply remove the `db` from the config file and it won't be initialized. Same goes for the `redisSettings`.

4. Ensure that the `logsPath` configured in `config.json` exists and is accessible by the application.
5. Start the application using `npm start`. This would run the start command specified in `package.json` (which is by default `node bin/server.js`).  

>### Deployment in Cluster mode
>
>Node operates on a single-threaded event loop but can support tens of thousands of concurrent connections. However, this might lead to inefficient usage of CPU since only a single core would be used by the application.
>
>In order to utilise CPU efficiently on such multi-core systems, Node provides the ability to launch a cluster of application processes.
>
>To utilise this cluster deployment, follow all the above setup steps point 1 through 4 and start the application using:
>
>```sh
>   npm run cluster
>```
>
>This launches worker processes equal to the number of total number of CPU cores. In order to restrict the number of spawned workers, set the `instanceCount` to the required number in `clusterSettings` in `config.json`.
>
>
>**Note:**
>
>1. The cluster deployment expects the application to be **_stateless_** (i.e. the application should work fine even if 2 consecutive requests from the same user are served by different worker processes).
>2. There might be other services, which the application depends on, running on the same machine and using the available CPU cores. Evaluating these requirements should be a prerequisite before switching to cluster mode and setting the required **_instanceCount_**.
>3. The number of instances will always be the **_minimum_** of the _number of available CPU cores_ and _the instanceCount set in config._

>### Deployment using PM2 (process manager)

>---
>
>To start the application using PM2:
>
>1. Install `pm2` (using `npm install -g pm2`).
>2. Follow the above setup steps 1 to 3.
>3. Create a copy of `ecosystem.config.example.json` in the project root and name it as `ecosystem.config.json`.
>4. Start the application using `pm2 start` from the project directory or `pm2 start /path/to/ecosystem.config.js` from anywhere else.
><br><br>
>
>Launching using the ecosystem file generates a pm2 log folder in the application's logs folder (`path` in `logSettings` in config.json) with 2 types of log files:
>
>1. **out.log** - Containing all stdout messages (e.g. App launch commands, Listener logs).
>2. **error.log** - Containing all stderror messages (e.g. Connection failures, Unhandled promises, App crash)
><br><br>
>
>For **production environments**, it is highly recommended to use log rotation with pm2 and set an appropriate retention policy for the required use case.
Follow the links for more details:
>
>1. [pm2](https://github.com/Unitech/pm2)
>2. [pm2 log rotation](https://github.com/keymetrics/pm2-logrotate)

<br>

## Logging

3 log folders are created at the **path** provided in **logSettings** in the `config.json` file, each containing a separate set of logs each having a specific function.

| Type     | Description                                                                                                                                   |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| App      | Created in the `appLogs` directory, they are used for logging across application.                                                             |
| Access   | Created in the `accessLogs` directory, they are used for logging a brief about all requests landing on the application                        |
| Tracking | Created in the `trackLogs` directory, they are used for logging data intended for tracking/monitoring such as HTTP requests and API latencies |

<br>
Both app and tracking logs are catered to in the `logger.js` module under `lib` and any changes required such as **log format** and **log rotation** can and should be handled in the same.

>**Note:** For the sake of ease, the code for _size-based_ rotation has been added to the `logger.js` module as comments (titled Size-based rotation), with _time based (**hourly**) rotation enabled by default_. To switch to size-based rotation, simply uncomment the same and comment the time-based rotation configuration for the required logs (in `getAppLogAppender` for app logs and `getTrackingLogAppender` for tracking logs). For more reference on aspects such as rotation frequency, number of backup files to persist, file name for latest log file, etc., please refer to inline comments in `logger.js` followed by official documentation for [log4js](https://log4js-node.github.io/log4js-node/).

Tracking of HTTP requests (via `httpClient.js`) and API Latencies (via **logResponseBody** middleware in `serverUtility.js`) are handled already and need not be handled again. However, any modifications (such as additional data) can be done as required.

Access logs are logged via **accessLogger** middleware in `serverUtility.js` in standard **Apache** common format. Any changes such as **log format** and **log rotation** can be included there.
<br>

### **Disabling Tracking logs**

There might be cases where the application is already tracked using third-party tools/services or needs to be tracked externally. For such cases, the user can disable tracking logs from the `config.json` file.

To opt-out, set `enableTrackingLogs` to **false** in the `logSettings` and remove all calls to logger's `latencyLog` and `httpLog`.

>**Note:** Calling any log function pertaining to tracking logs will result in error if disabled.

<br>

### **Log params (App and Tracking)**

<br>
By default, each app log line is a JSON containing the following parameters:
<br><br>

| Param   | Description                                          |
| ------- | ---------------------------------------------------- |
| **ts**  | Log timestamp in **yyyy-mm-dd HH:MM:ss.l**           |
| **lv**  | Log level indicator (e.g. INFO/ERROR/WARN)           |
| **id**  | Request UUID (32 digits)                             |
| **sIp** | IP of the system on which the application is running |
| **fl**  | Name of the file from which the log is created       |
| **fn**  | Name of the function from which the log is created   |
| **ln**  | Line number of the file at which the log is created  |
| **msg** | Stringified log message                              |

<br>
Similarly, each tracking log line is a JSON containing the following parameters:
<br>

| Param    | Description                                                 |
| -------- | ----------------------------------------------------------- |
| **ts**   | Log timestamp in **yyyy-mm-dd HH:MM:ss.l**                  |
| **id**   | Request UUID (32 digits)                                    |
| **sIp**  | IP of the system on which the application is running        |
| **type** | Type of the tracking log. Possible values: `http`/`latency` |
| **data** | Log data required for the type of tracking log              |

<br>

### **Logging to console (DEV environment)**

For _**development**_ environment, there is an additional capability to write application logs to the _console_ (STDOUT). To enable, just set the **LOG_TO_CONSOLE** environment variable to **true** and start the application server.

```sh
LOG_TO_CONSOLE=true npm start
```

If enabled, application logs will be written to console and not the log file.

<br>

## Database

If initialized, database connection is exposed globally via a `db` object.
<br>
Every query type has a dedicated method which should be used at all times to ensure better tracking.
<br>
If a new type of query is required by the application, a new method should be exposed with the required default values instead of exporting the `doQuery` base method.

**Currently available type-specific functions**

- doSelect
- doInsert
- doUpdate
- doDelete
<br>

>**Note:** There is a function called `executeOnMaster` that executes the query on master but it is not tracked and used only for development stages. Caution must be exercised before using it.

All queries are logged in the application logs for better tracking with the exception of `select` queries which are logged only when they are enabled in the `config.json` (**enableSelectQueryLogs: true** in the `db.settings`).

>Behind the scenes, **a pool of connection is maintained for both MASTER and SLAVE databases** and queries are routed to one of the pools basis the query type (default behaviour) or as specified.

To update the number of connections required in a pool, update the `maxConnections`  in the corresponding DSN in `db.connections` to a suitable number.

<br>

## Redis

If initialized, Redis client is exposed globally via a `redis` object.
<br>
Major Redis commands (`get`, `set`, `del`) are available as 1 to 1 mapping via `redis` object. Other commands if needed must be created in and exported from `redis.js`

### **TTL**

Every key added should have a TTL assigned to it in order to prevent stray data in the Redis server. To ensure this, every `redis.set` call must have an associated TTL. If not specified, a default TTL (set as `defaultTtl` in `redisSettings`) is associated with the key.

### **Retry Strategy**

There are scenarios where the connection to a Redis server might drop and a reconnection is required for the application to continue working. For this, the `retryStrategy` config must be utilised.

There are 2 available configurations for now:

1. **retryCount** - Specifies the number of retry attempts to be made to establish a connection, once dropped. Expects a positive number. `0` indicates connection should be re-attempted till successful.
2. **retryDelayInMs** - Specifies the delay (in milliseconds) between each successive retry attempt.

If `retryStrategy` is not specified, a connection would not be attempted once failed.

### **Key prefix**

To allow usage for common Redis server(s), it is often required to keep application specific keys in a separate namespace. To achieve this, a prefix to the key is prepended for all Redis commands made via the client in `redis` module.

This prefix or namespace can be set as `keyPrefix` in the `redisSettings` in the config file itself.

>**Note:** The above namespace is prefixed for all commands except for **KEYS** command since it expects a pattern rather than a key as argument. For reference, follow this [link](https://github.com/NodeRedis/node-redis#options-object-properties#prefix).

<br>

## HTTP Client

All HTTP requests must be performed using `httpClient.js`.
Inherently, it uses `axios` client along with a retry setup which can be configured per request with the `config` argument.
<br>

If config is not passed, the client uses global `httpClientSettings` (from `config.json`) by default for request **timeout** and **retries**.
<br>

Logging for request, response and tracking have already been handled and do not need to be handled again.
<br>

>**Note:** Request `headers` are not logged by default. If needed, these can be enabled by setting `logRequestHeaders` as **true** in the `httpClientSettings` in `config.json` file.

<br>

## Custom Router

The original express router has been extended to create a custom router with additional capabilities. Each router method (**post**, **get**, **all** etc.) is passed a context bound `logger` for the request passed as the third argument (after `req` and `res`) since `next` is seldom used across handlers especially request controllers (shown below).

```js
//In the router module
router.post("/endpoint", controller.requestHandler);
...
...
//In the controller module
function requestHandler(req, res, logger, next) {
    ...
    logger.info("A sample log");
}
```

Every handler must use this to log any and all application logs

>**Note:** Only lowercase router methods have been overridden since uppercase methods are simply alias of the lowercase methods. If needed, this can be extended to uppercase methods in the `routerUtility`.

In addition, new router methods have been added corresponding to the original ones to cater to error handling for async handlers. Each `async` router method is mapped to original method and named with the prefix **async** followed by capitalized original method's name.
<br>
e.g. `async` method for GET requests (or `get` method) is named `asyncGet`.
<br>
Parameters for the async router methods remain the same as for original methods.
<br><br>

## API Validations

Data validations for requests can and should be done using `validatorUtility.js`. All specifications for the API are kept in `apiSpecs.js` segregated basis the type (internal/external).

Every request specification may have one or more of the following components mapped directly to the request components:

- query
- body
- headers

Each component specification consists of some mandatory params and 1 optional param, all of which are listed below:

| Param            | Description                                                                                           | Mandatory |
| ---------------- | ----------------------------------------------------------------------------------------------------- | --------- |
| **requiredKeys** | Array of mandatory keys for the request component                                                     | Yes       |
| **optionalKeys** | Array of non-mandatory keys for the request component                                                 | No        |
| **validations**  | JSON for the required validations in the following format: { *keyForValidation*: *validationObject* } | Yes       |

<br>

Each **validationObject**, in turn, has an associated `type` and optional constraints which are evaluated against the value of the required field.

**type** is a string indicating the data type of the field to be validated. The list of supported types along with the list of associated constraints for validations can be found in `validatorUtility.js` under `typeValidator`.

The constraint validation logic can in turn be found (and tweaked or extended as per requirement) under `constraintValidator`.

<br>

## Encryption Utility

In the current age, there is hardly any application that does not have a use case for encrypting and/or decrypting data, especially while interacting with other parties. Keeping this in mind, an `encryptionUtility` module has been added for abstraction of frequently-used encryption/decryption and hashing algorithms.

Supported encryption (decryption) algorithms:

1. **AES** - 128, 192, 256 bits for both ECB and CBC modes using `aesEncrypt` and `aesDecrypt` methods.
2. **RSA** - Any bit size using `rsaEncrypt` and `rsaDecrypt` methods.

Supported hashing algorithms:

1. **Keyed hashing** - HMAC using `generateHmac` method.
2. **Plain hashing** - Using `generateHash` method.

<br>

## Unit Tests

To ensure extensive Unit Test from the get-go, the core setup has been included in the kit itself.

What to expect:

1. DB migrations and seeds (auto load at setup and unload at teardown)
2. Mocks for globals and node modules and mock factories for Express request and response, logger etc.
3. Custom matchers and utilities for in-test assertions
4. Easily extensible coverage reporting
5. 100% coverage of all shipped files :relaxed:

Intrigued enough! Follow the link to know [more](./UnitTesting.md).

<br>

## Prometheus Client

To allow for tracking of various metrics, a Prometheus client has been integrated in the setup. However, to enable this, `enablePrometheusClient` must be set as **true** in the `config.json` file.
<br>

When enabled, client instance(s) can be created using the global `prometheus` object.
<br>

All client instances created using the global object will publish a common label `appName` in addition to specified labels for each instance. The appName can and should be configured (using `appName` in `config.json` file) different for each application using a common Prometheus server to maintain exclusive namespaces.
<br>

A sample method for creating a Histogram client (`getHistogramClient`) has been included for demonstration. Client generators for other metric types can be created and exported from `prometheusUtility.js`.

By default, all registered metrics would be exposed on `/metrics` endpoint. To change this, edit the endpoint in `app.js` against the Prometheus client's **requestHandler**.

>**Note:** Do ensure that the endpoint is updated in the corresponding `scrape_config` on the Prometheus server.

<br>

## CI Pipeline

To ensure all builds meet the required quality standards, it is pertinent that all changes are thoroughly tested. Since this is quite an extensive task, if done manually, it is only logical to automate aspects such as build audits, unit tests, etc. via a pipeline and evaluate the generated report(s) as and when required.

For this, the easiest way to get started is to employ Gitlab CI to run these pipeline jobs. The only requirements for this would be to configure a runner for the Gitlab project and add a Gitlab CI YAML to the project root.

>**Note:** The runner configuration is to be done by a project Maintainer (preferably DevOps).

For CI YAML, a sample (`example.gitlab-ci.yml`) has been included with 3 stages - build, audit and test. To get started, create a copy of the sample in the project root itself, rename it as `.gitlab-ci.yml` and update the same as required.

>For Gitlab CI reference, follow this [link](https://docs.gitlab.com/ce/ci/yaml/gitlab_ci_yaml.html). Do ensure that you are viewing the documentation for the correct Gitlab version.
<br>

## Canonical log lines

In order evaluate the application, monitoring system resources and performance along with tracking incidents (and their frequency) is a key. These tasks are often achieved via various third-party tools/services which monitor the application externally.

Canonical log lines aim to accomplish all this while being within the application so that these important aspects are covered for the application from the word go.
In addition, it serves to provide enhanced operational visibility which greatly improves issue tracking and resolution TAT.

At the core, canonical log lines are just like application logs, logged to the same log files. However, each line encapsulates the entire journey of the corresponding request along with the resources utilized, network calls, and much more (which is left to the developer's imagination).

Tracking of all I/O (DB queries, Redis calls, network calls, log writes) as well as request/response metrics (response time, response status codes, etc.) have been handled already.

For tracking request journey, a utility `addData` has been exposed to the global `canonicalLog` object which can and should be called at every important decision point in the program flow to ensure complete tracking.

Usage:

1. To add a single key-value pair to the log line

```js
canonicalLog.addData(logger, "key", "value");
```

2. To add multiple key-value pairs to the log line

```js
canonicalLog.addData(logger, { 
    "key1": "value1", 
    "key2": "value2" 
});
```

It is highly recommended to use canonical logs seeing the numerous advantages. Nonetheless, to disable canonical logs, set `enableCanonicalLog` to **false** in the `logSettings`.

<br>

## Health Check

In order to ensure all application components are up and running, an endpoint `/internal/health` has been exposed which will respond with individual connection status. Since this should be used internally and not be available to the end-user, this has been segregated to the `internal` API.

If any component is not connected (Redis and DB for now), the endpoint responds with `500` HTTP status code along with the connection status and error for all components.

On introduction of any new component, a health check (e.g.`validateConnection`) function should be exported from the client module and called from the `healthCheck` service module to publish the connection status, similar to the Redis and DB connections.

<br>

## FAQs

- How does **require** work in Node.js? - [Module loading in Node.js](https://nodejs.org/docs/v0.4.2/api/modules.html)
- How does **cluster** mode work in NodeJs? - [Cluster in NodeJs](https://nodejs.org/api/cluster.html#cluster_cluster)

<br>

## Stay tuned :gem

Coming up:

- Utility for cloud integrations for AWS and Azure
- Deployment container support with Dockerfile(s))
- Cluster mode support
