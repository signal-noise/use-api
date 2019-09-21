const { useEffect, useState } = require("react");
const axios = require("axios");

const { CancelToken } = axios;

const useApi = (apiEndpoint, pollInterval, payload, method = "get") => {
  const [data, setData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [poll, setPoll] = useState(0);

  useEffect(() => {
    let timeout;

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
        setError(null);
        // Set the recieved data
        setData(response.data);
      })
      .catch(thrown => {
        // Only error on genuine errors, not cancellations
        if (!axios.isCancel(thrown)) setError(thrown.message);
      })
      .finally(() => {
        // Clear the loading and refreshing flags
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
  }, [poll, apiEndpoint, pollInterval]);

  // Function to force a refresh
  const refresh = () => setPoll(poll + 1);

  return { data, loading, error, refresh };
};

module.exports = useApi;
