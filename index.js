const { useEffect, useState } = require("react");
const axios = require("axios");
const isEqual = require("lodash.isequal");

const { CancelToken } = axios;

const useApi = (apiEndpoint, pollInterval, payload, method = "get") => {
  const [changed, setChanged] = useState(false);
  const [data, setData] = useState({});
  const [lastData, setLastData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [poll, setPoll] = useState(0);

  if (method.toLowerCase) method = method.toLowerCase();

  // Function to force a refresh
  const refresh = () => setPoll(poll + 1);

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

    setChanged(false);

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
        // Set the received data ONLY IF its changed, redraw performance gain!
        if (!isEqual(response.data, lastData)) {
          setChanged(true);
          setLastData(response.data);
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
        if (pollInterval) timeout = setTimeout(refresh, pollInterval);
      });

    // Cleanup, clear a timeout and cancel the request.
    return () => {
      if (timeout) clearTimeout(timeout);
      source.cancel();
    };
  }, [poll, apiEndpoint, pollInterval, payload, method]);

  return { data, loading, changed, error, refresh };
};

module.exports = useApi;
