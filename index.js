const { useEffect, useState, useRef } = require("react");
const axios = require("axios");
const isEqual = require("lodash.isequal");

const { CancelToken } = axios;

const useApi = (
  apiEndpoint,
  pollInterval,
  payload,
  method = "get",
  changed
) => {
  const [data, setData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [poll, setPoll] = useState(0);
  const lastData = useRef(data);
  const changedRef = useRef(changed);
  changedRef.current = changed;

  if (method.toLowerCase) method = method.toLowerCase();

  useEffect(() => {
    let timeout;

    if (!["get", "post"].includes(method)) {
      setLoading(false);
      setError("Invalid request method type, must be either post or get.");
      return;
    }

    // Create a token that we sign the request with so it can be cancelled if need be
    const source = CancelToken.source();

    // Set loading to be true
    setLoading(true);

    // Make call to the API
    axios(apiEndpoint, {
      method,
      cancelToken: source.token,
      ...(payload &&
        (method === "get" ? { params: payload } : { data: payload }))
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
    apiEndpoint,
    pollInterval,
    payload,
    method,
    lastData,
    changedRef
  ]);

  return { data, loading, changed, error, refresh: () => setPoll(poll + 1) };
};

module.exports = useApi;
