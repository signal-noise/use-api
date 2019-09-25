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

  it("loads data from a url using GET", async () => {
    mock.onGet(url).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() => useApi(url));

    expect(result.current.data).toEqual({});
    expect(result.current.loading).toBeTruthy();

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();
  });

  it("sends querystring data and loads data from a url using GET", async () => {
    const params = { query: "hello" };
    mock
      .onGet(url)
      .reply(config =>
        config.params.query === "hello" ? [200, "response"] : [400, "error"]
      );

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi(url, 0, params)
    );

    expect(result.current.data).toEqual({});
    expect(result.current.loading).toBeTruthy();

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();
  });

  it("allows different formats of GET method param (GET)", async () => {
    mock.onGet(url).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi(url, 0, { query: "hello" }, "GET")
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();
  });

  it("allows different formats of GET method param (Get)", async () => {
    mock.onGet(url).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi(url, 0, { query: "hello" }, "Get")
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();
  });

  it("allows different formats of GET method param (gEt)", async () => {
    mock.onGet(url).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi(url, 0, { query: "hello" }, "gEt")
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();
  });

  it("loads data from a url using POST", async () => {
    const postData = { query: "hello" };
    mock.onPost(url, postData).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi(url, 0, postData, "post")
    );

    expect(result.current.data).toEqual({});
    expect(result.current.loading).toBeTruthy();

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();
  });

  it("allows different formats of POST method param (Post)", async () => {
    const postData = { query: "hello" };
    mock.onPost(url, postData).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi(url, 0, postData, "Post")
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();
  });

  it("allows different formats of POST method param (POST)", async () => {
    const postData = { query: "hello" };
    mock.onPost(url, postData).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi(url, 0, postData, "POST")
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();
  });

  it("allows different formats of POST method param (pOst)", async () => {
    const postData = { query: "hello" };
    mock.onPost(url, postData).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() =>
      useApi(url, 0, postData, "pOst")
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();
  });

  it("warns about bad finding a bad string in method type", async () => {
    mock.onGet(url).reply(200, "response");

    const { result } = renderHook(() =>
      useApi(url, 0, { query: "hello" }, "POSTITNOIE")
    );

    expect(result.current.error).toBeTruthy();
    expect(result.current.loading).toBeFalsy();
  });

  it("warns about garbage in method type", async () => {
    mock.onGet(url).reply(200, "response");

    const { result } = renderHook(() =>
      useApi(url, 0, { query: "hello" }, { something: "wrong" })
    );

    expect(result.current.error).toBeTruthy();
    expect(result.current.loading).toBeFalsy();
  });

  it("loads and polls data from a url", async () => {
    mock.onGet(url).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() => useApi(url, 1000));

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

    const { result, waitForNextUpdate } = renderHook(() => useApi(url, 0));

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
    const postData = { query: "hello" };
    const postData2 = { query: "hello2" };
    mock.onPost(url, postData).reply(200, "response");
    mock.onPost(url, postData2).reply(200, "response2");

    const { result, waitForNextUpdate, rerender } = renderHook(() =>
      useApi(url, 0, postData, "post")
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();

    rerender(url, 0, postData2, "post");

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response2");
    expect(result.current.loading).toBeFalsy();
  });

  it("returns an error on request error", async () => {
    mock.onGet(url).reply(404, "response");

    const { result, waitForNextUpdate } = renderHook(() => useApi(url, 0));

    expect(result.current.data).toEqual({});
    expect(result.current.loading).toBeTruthy();

    await waitForNextUpdate();

    expect(result.current.error).toEqual("Request failed with status code 404");
    expect(result.current.loading).toBeFalsy();
  });

  it("notified when data has changed", async () => {
    mock.onGet(url).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() => useApi(url, 0));

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();

    mock.onGet(url).reply(200, "response2");

    act(() => {
      result.current.refresh();
    });

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response2");
    expect(result.current.changed).toBeTruthy();
    expect(result.current.loading).toBeFalsy();
  });

  it("does not notify when data has not changed", async () => {
    mock.onGet(url).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() => useApi(url, 0));

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.loading).toBeFalsy();

    mock.onGet(url).reply(200, "response");

    act(() => {
      result.current.refresh();
    });

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
    expect(result.current.changed).toBeFalsy();
    expect(result.current.loading).toBeFalsy();
  });
});
