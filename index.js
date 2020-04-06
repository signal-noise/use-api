const { useEffect, useState, useRef } = require("react");
const axios = require("axios");
const isEqual = require("lodash.isequal");

const { CancelToken } = axios;

const useApi = ({
  url,
  pollInterval = 0,
  payload,
  method = "get",
  headers,
  changed
}) => {
  const [data, setData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [poll, setPoll] = useState(0);
  const lastData = useRef(data);
  const changedRef = useRef(changed);
  const payloadRef = useRef(payload);
  const headersRef = useRef(headers);
  changedRef.current = changed;

  if (!url) {
    throw Error("Url not specified");
  } else if (typeof url !== "string") {
    throw Error("Url not a string");
  }

  if (pollInterval < 0) {
    throw Error("Negative value not valid poll interval");
  } else if (isNaN(pollInterval)) {
    throw Error("Invalid poll interval type, must be number");
  }

  // Only apply the new payload if its really changed
  if (!isEqual(payload, payloadRef.current)) {
    payloadRef.current = payload;
  }
  const currentPayload = payloadRef.current;

  // Only apply the new headers if its really changed
  if (!isEqual(headers, headersRef.current)) {
    headersRef.current = headers;
  }
  const currentHeaders = headersRef.current;

  if (method.toLowerCase) method = method.toLowerCase();

  if (!["get", "post"].includes(method)) {
    throw Error("Invalid request method type, must be either post or get.");
  }

  if (changedRef.current && typeof changedRef.current !== "function") {
    throw Error("Invalid changed type, must be function.");
  }

  useEffect(() => {
    let timeout;

    // Create a token that we sign the request with so it can be cancelled if need be
    const source = CancelToken.source();

    // Set loading to be true
    setLoading(true);

    // Make call to the API
    axios(url, {
      method,
      cancelToken: source.token,
      ...(currentPayload &&
        (method === "get"
          ? { params: currentPayload }
          : { data: currentPayload })),
      ...(currentHeaders && { headers: currentHeaders })
    })
      .then(response => {
        // Make sure there are no errors reported
        setError(null);

        // Only do change detection if change is defined.
        if (changedRef.current) {
          if (!isEqual(response.data, lastData.current)) {
            // Set the received data ONLY IF its changed, redraw performance gain!
            lastData.current = response.data;
            setData(response.data);
            changedRef.current(response.data);
          }
        } else {
          setData(response.data);
        }
      })
      .catch(thrown => {
        // Only error on genuine errors, not cancellations
        if (!axios.isCancel(thrown)) setError(thrown.message);
      })
      .finally(() => {
        // Clear the loading flag
        setLoading(false);

        // Poll if specified to do so
        if (pollInterval)
          timeout = setTimeout(() => setPoll(poll + 1), pollInterval);
      });

    // Cleanup, clear a timeout and cancel the request.
    return () => {
      if (timeout) clearTimeout(timeout);
      source.cancel();
    };
  }, [
    poll,
    setPoll,
    url,
    pollInterval,
    currentPayload,
    currentHeaders,
    method,
    lastData,
    changedRef
  ]);

  return { data, loading, changed, error, refresh: () => setPoll(poll + 1) };
};

module.exports = useApi;
