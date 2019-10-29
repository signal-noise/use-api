const MockAdapter = require("axios-mock-adapter");
const axios = require("axios");
const useApi = require("./index");
const { renderHook, act } = require("@testing-library/react-hooks");

describe("performs requests", () => {
  let mock;
  const url = "http://mock";

  beforeEach(() => {
    mock = new MockAdapter(axios);
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    mock.restore();
  });

  it("should error if url is not set", async () => {
    mock.onGet().reply(200, "response");

    const { result } = renderHook(() => useApi({}));

    expect(result.error.message).toEqual("Url not specified");
  });

  it("should error when url is not string", async () => {
    const nonString = 123;
    mock.onGet(nonString).reply(200, "response");

    const { result } = renderHook(() => useApi({ url: nonString }));
    expect(result.error.message).toEqual("Url not a string");
  });

  it("should reject pollIntervals if NaN", async () => {
    mock.onGet(url).reply(200, "response");
    const pollValue = "foo";

    const { result } = renderHook(() =>
      useApi({ url, pollInterval: pollValue })
    );

    expect(result.error.message).toEqual(
      "Invalid poll interval type, must be number"
    );
  });

  it("should error if pollIntervals is less than zero", async () => {
    mock.onGet(url).reply(200, "response");

    const { result } = renderHook(() => useApi({ url, pollInterval: -1 }));

    expect(result.error.message).toEqual(
      "Negative value not valid poll interval"
    );
  });

  it("converts payload to querystring for GET request", async () => {
    const payload = { query: "hello" };
    mock
      .onGet(url)
      .reply(config =>
        config.params.query === "hello" ? [200, "response"] : [400, "error"]
      );

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi({ url, payload })
    );

    expect(result.current.data).toEqual({});
    expect(result.current.loading).toBeTruthy();

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();
  });

  it("sends payload as JSON for POST", async () => {
    const payload = { query: "hello" };
    mock.onPost(url, payload).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi({ url, payload, method: "POST" })
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();
  });

  it("allows variations of capitalised GET method param (GET / get / gEt)", async () => {
    const payload = { query: "hello" };
    mock.onGet(url).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi({ url, payload, method: "Get" })
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();
  });

  it("allows semi-capitalised GET method param (Get)", async () => {
    const payload = { query: "hello" };
    mock.onGet(url).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi({ url, payload, method: "gEt" })
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();
  });

  it("allows different formats of GET method param (gEt)", async () => {
    const payload = { query: "hello" };
    mock.onPost(url, payload).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi({ url, payload, method: "post" })
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();
  });

  it("allows different formats of POST method param (Post)", async () => {
    const payload = { query: "hello" };
    mock.onPost(url, payload).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi({ url, payload, method: "Post" })
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();
  });

  it("allows different formats of POST method param (POST)", async () => {
    const payload = { query: "hello" };
    mock.onPost(url, payload).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi({ url, payload, method: "POST" })
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();
  });

  it("allows different formats of POST method param (pOst)", async () => {
    const payload = { query: "hello" };
    mock.onPost(url, payload).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi({ url, payload, method: "pOst" })
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();
  });

  it("should error when finding a bad string in method type", async () => {
    const payload = { query: "hello" };

    const { result } = renderHook(() =>
      useApi({ url, payload, method: "POSTITNOTE" })
    );

    expect(result.error.message).toEqual(
      "Invalid request method type, must be either post or get."
    );
  });

  it("should error when garbage in method type", async () => {
    const payload = { query: "hello" };

    const { result } = renderHook(() =>
      useApi({ url, payload, method: { something: "wrong" } })
    );

    expect(result.error.message).toEqual(
      "Invalid request method type, must be either post or get."
    );
  });

  it("should error when changed is not function", async () => {
    mock.onGet(url).reply(200, "response");
    const mockChanged = {};

    const { result } = renderHook(() => useApi({ url, changed: mockChanged }));

    expect(result.error.message).toEqual(
      "Invalid changed type, must be function."
    );
  });

  // FUNCTIONAL TESTS

  it("loads data from a url using GET", async () => {
    mock.onGet(url).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() => useApi({ url }));

    expect(result.current.data).toEqual({});
    expect(result.current.loading).toBeTruthy();

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();
  });

  it("loads data from a url using POST", async () => {
    const payload = { query: "hello" };
    mock.onPost(url, payload).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi({ url, payload, method: "post" })
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
      .onGet(url)
      .reply(config =>
        config.params.query === "hello" ? [200, "response"] : [400, "error"]
      );

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi({ url, payload })
    );

    expect(result.current.data).toEqual({});
    expect(result.current.loading).toBeTruthy();

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();
  });

  it("loads and polls data from a url", async () => {
    mock.onGet(url).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi({ url, pollInterval: 1000 })
    );

    expect(result.current.data).toEqual({});
    expect(result.current.loading).toBeTruthy();

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();

    mock.onGet(url).reply(200, "response2");

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response2");
    expect(result.current.loading).toBeFalsy();

    mock.onGet(url).reply(200, "response3");

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response3");
    expect(result.current.loading).toBeFalsy();
  });

  it("can be manually refreshed", async () => {
    mock.onGet(url).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() => useApi({ url }));

    expect(result.current.data).toEqual({});
    expect(result.current.loading).toBeTruthy();

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();

    mock.onGet(url).reply(200, "response2");

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
    mock.onPost(url, payload).reply(200, "response");

    const { result, waitForNextUpdate, rerender } = renderHook(
      props => useApi(props),
      {
        initialProps: {
          url,
          payload: payload,
          method: "post"
        }
      }
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();

    mock.onPost(url, payload2).reply(200, "response2");

    rerender({
      url,
      payload: payload2,
      method: "post"
    });

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response2");
    expect(result.current.loading).toBeFalsy();
  });

  it("returns an error on request error", async () => {
    mock.onGet(url).reply(404, "response");

    const { result, waitForNextUpdate } = renderHook(() => useApi({ url }));

    expect(result.current.data).toEqual({});
    expect(result.current.loading).toBeTruthy();

    await waitForNextUpdate();

    expect(result.current.error).toEqual("Request failed with status code 404");
    expect(result.current.loading).toBeFalsy();
  });

  it("notified when data has changed", async () => {
    mock.onGet(url).reply(200, "response");
    const mockChanged = jest.fn();

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi({ url, changed: mockChanged })
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();

    mock.onGet(url).reply(200, "response2");

    act(() => {
      result.current.refresh();
    });

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response2");
    expect(result.current.loading).toBeFalsy();
    expect(mockChanged.mock.calls.length).toBe(2);
  });

  it("does not notify when data has not changed", async () => {
    mock.onGet(url).reply(200, "response");
    const mockChanged = jest.fn();

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi({ url, changed: mockChanged })
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
    mock.onGet(url).reply(() => new Promise(() => {}));
    mock.onGet(url + "2").reply(200, "response2");

    const { result, waitForNextUpdate, rerender } = renderHook(
      props => useApi(props),
      {
        initialProps: {
          url
        }
      }
    );

    rerender({
      url: url + "2"
    });

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response2");
    expect(result.current.loading).toBeFalsy();
  });

  it("allows complex object using GET", async () => {
    const payload = { query: ["hello", "world", ["abc"]] };
    mock
      .onGet(url)
      .reply(config =>
        config.params.query[2][0] === "abc" ? [200, "response"] : [400, "error"]
      );

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi({ url, payload })
    );

    expect(result.current.data).toEqual({});
    expect(result.current.loading).toBeTruthy();

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();
  });
});
