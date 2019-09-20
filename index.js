const { useEffect, useState } = require("react");

const useApi = (apiEndpoint, pollInterval) => {
  const [data, setData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [poll, setPoll] = useState(0);

  useEffect(() => {
    let timeout;

    setLoading(true);

    // Make call to the API
    fetch(apiEndpoint)
      .then(response => response.json())
      .then(json => {
        setError(null);
        setData(json);
      })
      .catch(thrown => {
        setError(thrown.message);
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
    };
  }, [poll, apiEndpoint, pollInterval]);

  // Function to force a refresh
  const refresh = () => setPoll(poll + 1);

  return { data, loading, error, refresh };
};

module.exports = useApi;
