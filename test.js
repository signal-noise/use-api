const useApi = require("./index");
const { renderHook, act } = require("@testing-library/react-hooks");

global.fetch = require("jest-fetch-mock");

describe("performs GET requests", () => {
  const url = "http://mock";

  beforeAll(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("loads data from a url", async () => {
    const response = { data: "1" };
    fetch.mockResponseOnce(JSON.stringify(response));

    const { result, waitForNextUpdate } = renderHook(() => useApi(url));

    expect(result.current.data).toEqual({});
    expect(result.current.error).toEqual(null);
    expect(result.current.refresh).toBeInstanceOf(Function);
    expect(result.current.loading).toBeTruthy();

    await waitForNextUpdate();

    expect(result.current.data).toEqual(response);
    expect(result.current.loading).toBeFalsy();
  });

  it("loads and polls data from a url", async () => {
    const response = { data: "1" };
    fetch.mockResponseOnce(JSON.stringify(response));

    const { result, waitForNextUpdate } = renderHook(() => useApi(url, 1000));

    expect(result.current.data).toEqual({});
    expect(result.current.loading).toBeTruthy();

    await waitForNextUpdate();

    expect(result.current.data).toEqual(response);
    expect(result.current.loading).toBeFalsy();

    const response2 = { data: "2" };
    fetch.mockResponseOnce(JSON.stringify(response2));

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitForNextUpdate();

    expect(result.current.data).toEqual(response2);
    expect(result.current.loading).toBeFalsy();

    const response3 = { data: "3" };
    fetch.mockResponseOnce(JSON.stringify(response3));

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitForNextUpdate();

    expect(result.current.data).toEqual(response3);
    expect(result.current.loading).toBeFalsy();
  });

  it("can be manually refreshed", async () => {
    const response = { data: "1" };
    fetch.mockResponseOnce(JSON.stringify(response));

    const { result, waitForNextUpdate } = renderHook(() => useApi(url, 0));

    expect(result.current.data).toEqual({});
    expect(result.current.loading).toBeTruthy();

    await waitForNextUpdate();

    expect(result.current.data).toEqual(response);
    expect(result.current.loading).toBeFalsy();

    const response2 = { data: "2" };
    fetch.mockResponseOnce(JSON.stringify(response2));

    act(() => {
      result.current.refresh();
    });

    await waitForNextUpdate();

    expect(result.current.data).toEqual(response2);
    expect(result.current.loading).toBeFalsy();
  });

  it("returns an error on request error", async () => {
    const errorMessage = "Some API Error";
    fetch.mockReject(new Error(errorMessage));

    const { result, waitForNextUpdate } = renderHook(() => useApi(url, 0));

    expect(result.current.data).toEqual({});
    expect(result.current.loading).toBeTruthy();

    await waitForNextUpdate();

    expect(result.current.error).toEqual(errorMessage);
    expect(result.current.loading).toBeFalsy();
  });
});
