const MockAdapter = require("axios-mock-adapter");
const axios = require("axios");
const useApi = require("./index");
const { renderHook, act } = require("@testing-library/react-hooks");

describe("performs requests", () => {
  let mock;
  const apiEndpoint = "http://mock";

  beforeEach(() => {
    mock = new MockAdapter(axios);
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    mock.restore();
  });


  it("should fail if apiEndpoint is not set", async () => {
    mock.onGet().reply(200, "response");

    const { result } = renderHook(() =>
      useApi({ })
    );

    expect(result.error.message).toEqual('API endpoint not specified');

  });

  it("should error when apiEndpoint is not string", async () => {
    const nonString = 123; 
    mock.onGet(nonString).reply(200, "response");

    const { result } = renderHook(() =>
      useApi({ apiEndpoint: nonString })
    );
    expect(result.error.message).toEqual('API endpoint not a string');
  });

  it("should error when apiEndpoint is not a URL", async () => {
    mock.onGet().reply(200, "response");
    const badURL = 'google.com';

    const { result } = renderHook(() =>
      useApi({ apiEndpoint: badURL})
    );

    expect(result.error.message).toEqual('API endpoint not valid url, check protocol');
  });

  it("should reject pollIntervals if NaN", async () => {
    mock.onGet(apiEndpoint).reply(200, "response");
    const pollValue = "foo";

    const { result } = renderHook(() =>
      useApi({ apiEndpoint, pollInterval: pollValue })
    );

    expect(result.error.message).toEqual('Invalid poll interval type, must be number');

  });

  it("should fail if pollIntervals is less than zero", async () => {
    mock.onGet(apiEndpoint).reply(200, "response");

    const { result } = renderHook(() => 
      useApi({apiEndpoint, pollInterval: -1})
    );
    
    expect(result.error.message).toEqual('Negative value not valid poll interval');
  });

  it("converts payload to querystring for GET request", async () => {
    expect(1).toBeFalsy();
  });

  it("sends payload as JSON for POST", async () => {
    expect(1).toBeFalsy();
  });

  it("allows variations of capitalised GET method param (GET / get / gEt)", async () => {
    const payload = { query: "hello" };
    mock.onGet(apiEndpoint).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi({ apiEndpoint, payload, method: "GET" })
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();
  });

  it("allows semi-capitalised GET method param (Get)", async () => {
    const payload = { query: "hello" };
    mock.onGet(apiEndpoint).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi({ apiEndpoint, payload, method: "Get" })
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();
  });

  it("allows different formats of GET method param (gEt)", async () => {
    const payload = { query: "hello" };
    mock.onGet(apiEndpoint).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi({ apiEndpoint, payload, method: "gEt" })
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();
  });

  it("allows different formats of POST method param (Post)", async () => {
    const payload = { query: "hello" };
    mock.onPost(apiEndpoint, payload).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi({ apiEndpoint, payload, method: "Post" })
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();
  });

  it("allows different formats of POST method param (POST)", async () => {
    const payload = { query: "hello" };
    mock.onPost(apiEndpoint, payload).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi({ apiEndpoint, payload, method: "POST" })
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();
  });

  it("allows different formats of POST method param (pOst)", async () => {
    const payload = { query: "hello" };
    mock.onPost(apiEndpoint, payload).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi({ apiEndpoint, payload, method: "pOst" })
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();
  });

  it("warns about finding a bad string in method type", async () => {
    const payload = { query: "hello" };

    const { result } = renderHook(() =>
      useApi({ apiEndpoint, payload, method: "POSTITNOTE" })
    );

    expect(result.current.error).toBeTruthy();
    expect(result.current.loading).toBeFalsy();
  });

  it("warns about garbage in method type", async () => {
    const payload = { query: "hello" };
    // mock.onGet(url).reply(200, "response");

    const { result } = renderHook(() =>
      useApi({ apiEndpoint, payload, method: { something: "wrong" } })
    );

    expect(result.current.error).toBeTruthy();
    expect(result.current.loading).toBeFalsy();
  });

  it("error when changed is not function", async () => {
    mock.onGet(apiEndpoint).reply(200, "response");
    const mockChanged = {};

    const { result } = renderHook(() =>
      useApi({ apiEndpoint, changed: mockChanged })
    );

    expect(result.current.error).toBeTruthy();

  });

  // FUNCTIONAL TESTS

  it("loads data from a url using GET", async () => {
    mock.onGet(apiEndpoint).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi({ apiEndpoint })
    );

    expect(result.current.data).toEqual({});
    expect(result.current.loading).toBeTruthy();

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();
  });

  it("loads data from a url using POST", async () => {
    const payload = { query: "hello" };
    mock.onPost(apiEndpoint, payload).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi({ apiEndpoint, payload, method: "post" })
    );

    expect(result.current.data).toEqual({});
    expect(result.current.loading).toBeTruthy();

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();
  });

  it("loads data from a url using GET with a payload", async () => {
    const payload = { query: "hello" };
    mock
      .onGet(apiEndpoint)
      .reply(config =>
        config.params.query === "hello" ? [200, "response"] : [400, "error"]
      );

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi({ apiEndpoint, payload })
    );

    expect(result.current.data).toEqual({});
    expect(result.current.loading).toBeTruthy();

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();
  });

  it("loads and polls data from a url", async () => {
    mock.onGet(apiEndpoint).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi({ apiEndpoint, pollInterval: 1000 })
    );

    expect(result.current.data).toEqual({});
    expect(result.current.loading).toBeTruthy();

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();

    mock.onGet(apiEndpoint).reply(200, "response2");

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response2");
    expect(result.current.loading).toBeFalsy();

    mock.onGet(apiEndpoint).reply(200, "response3");

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response3");
    expect(result.current.loading).toBeFalsy();
  });

  it("can be manually refreshed", async () => {
    mock.onGet(apiEndpoint).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi({ apiEndpoint })
    );

    expect(result.current.data).toEqual({});
    expect(result.current.loading).toBeTruthy();

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();

    mock.onGet(apiEndpoint).reply(200, "response2");

    act(() => {
      result.current.refresh();
    });

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response2");
    expect(result.current.loading).toBeFalsy();
  });

  it("refreshes when payload changes", async () => {
    const payload = { query: "hello" };
    const payload2 = { query: "world" };
    mock.onPost(apiEndpoint, payload).reply(200, "response");

    const { result, waitForNextUpdate, rerender } = renderHook(
      props => useApi(props),
      {
        initialProps: {
          apiEndpoint,
          payload: payload,
          method: "post"
        }
      }
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();

    mock.onPost(apiEndpoint, payload2).reply(200, "response2");

    rerender({
      apiEndpoint,
      payload: payload2,
      method: "post"
    });

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response2");
    expect(result.current.loading).toBeFalsy();
  });

  it("returns an error on request error", async () => {
    mock.onGet(apiEndpoint).reply(404, "response");

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi({ apiEndpoint })
    );

    expect(result.current.data).toEqual({});
    expect(result.current.loading).toBeTruthy();

    await waitForNextUpdate();

    expect(result.current.error).toEqual("Request failed with status code 404");
    expect(result.current.loading).toBeFalsy();
  });

  it("should error when the request times out", async () => {
    expect(1).toBeFalsy();
  });

  it("notifies when data has changed", async () => {
    mock.onGet(apiEndpoint).reply(200, "response");
    const mockChanged = jest.fn();

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi({ apiEndpoint, changed: mockChanged })
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();

    mock.onGet(apiEndpoint).reply(200, "response2");

    act(() => {
      result.current.refresh();
    });

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response2");
    expect(result.current.loading).toBeFalsy();
    expect(mockChanged.mock.calls.length).toBe(2);
  });

  it("does not notify when data has not changed", async () => {
    mock.onGet(apiEndpoint).reply(200, "response");
    const mockChanged = jest.fn();

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi({ apiEndpoint, changed: mockChanged })
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();

    act(() => {
      result.current.refresh();
    });

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();
    expect(mockChanged.mock.calls.length).toBe(1);
  });

  it("request can be aborted mid-request", async () => {
    mock.onGet(apiEndpoint).reply(() => new Promise(() => {}));
    mock.onGet(apiEndpoint + "2").reply(200, "response2");

    const { result, waitForNextUpdate, rerender } = renderHook(
      props => useApi(props),
      {
        initialProps: {
          apiEndpoint
        }
      }
    );

    rerender({
      apiEndpoint: apiEndpoint + "2"
    });

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response2");
    expect(result.current.loading).toBeFalsy();
  });

  it("allows complex object using GET", async () => {
    const payload = { query: ["hello", 'world', ['abc']] };
    mock
      .onGet(apiEndpoint)
      .reply(config =>
        config.params.query[2][0] === "abc" ? [200, "response"] : [400, "error"]
      );

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi({ apiEndpoint, payload })
    );

    expect(result.current.data).toEqual({});
    expect(result.current.loading).toBeTruthy();

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();
  });

  
});
