const MockAdapter = require("axios-mock-adapter");
const axios = require("axios");
const useApi = require("./index");
const { renderHook, act } = require("@testing-library/react-hooks");

describe("performs GET requests", () => {
  let mock;
  const url = "http://mock";

  beforeAll(() => {
    mock = new MockAdapter(axios);
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
    mock.restore();
  });

  it("loads data from a url", async () => {
    mock.onGet(url).reply(200, "response");

    const { result, waitForNextUpdate } = renderHook(() => useApi(url));

    expect(result.current.data).toEqual({});
    expect(result.current.loading).toBeTruthy();

    await waitForNextUpdate();

    expect(result.current.data).toEqual("response");
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

  it("returns an error on request error", async () => {
    mock.onGet(url).reply(404, "response");

    const { result, waitForNextUpdate } = renderHook(() => useApi(url, 0));

    expect(result.current.data).toEqual({});
    expect(result.current.loading).toBeTruthy();

    await waitForNextUpdate();

    expect(result.current.error).toEqual("Request failed with status code 404");
    expect(result.current.loading).toBeFalsy();
  });
});
