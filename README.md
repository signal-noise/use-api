# use-api

[![NPM version][npm-image]][npm-url]
[![Actions Status][ci-image]][ci-url]
[![PR Welcome][npm-downloads-image]][npm-downloads-url]

A simple react hook for loading data from an api with polling support.

## Introduction

If you need a simple way to load data quickly this is for you. It allows you to very easily request data from any endpoint and have it avaliable in your React application.

You can optionally specify a polling interval and manually trigger a refresh. It also gracefully cancels any open requests if you decide to change the URL and restarts timers if the polling interval changes.

```javascript
const { data, loading, error, refresh } = useApi("https://some-api.com", 10000);
```

## Installation

Install this package with `npm`.

```bash
npm i @signal-noise/use-api
```

## Usage

Here is an example of an api call to retrieve a list of people which polls every 10 seconds, with a manual refresh button.

```JSX
import React from 'react';
import useApi from '@signal-noise/use-api';
import PeopleList from './PeopleList';

const App = () = {
  const { data, loading, error, refresh } = useApi("https://some-api.com", 10000);

  return (
    {loading && <p>Loading...</p>}
    {error && <p>{error}</p>}
    <button onClick={refresh} disabled={loading}>Refresh</button>
    {!loading && <PeopleList people={data.people}>}
  );
}
```

## API

### Input

- `apiEndpoint` - A URL to request data from.
- `pollInterval` - How often to re-request updated data.

### Output

- `data`: The data returned from the API.
- `loading`: A boolean signifying if the data is currently being loaded.
- `error`: A string representation of an error if it occurred during loading.
- `refresh`: A function to call to re-request the data.

[npm-image]: https://img.shields.io/npm/v/@signal-noise/use-api.svg?style=flat-square&logo=react
[npm-url]: https://npmjs.org/package/@signal-noise/use-api
[npm-downloads-image]: https://img.shields.io/npm/dm/@signal-noise/use-api.svg
[npm-downloads-url]: https://npmcharts.com/compare/@signal-noise/use-api?minimal=true
[ci-image]: https://github.com/signal-noise/use-api/workflows/node-ci/badge.svg
[ci-url]: https://github.com/signal-noise/use-api/actions
