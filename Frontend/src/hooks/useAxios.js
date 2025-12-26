import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useMemo } from "react";

const useAxios = () => {
  const { getAccessTokenSilently } = useAuth0();

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1", // Your Backend URL
    });

    // INTERCEPTOR: This runs before every request
    instance.interceptors.request.use(
      async (config) => {
        try {
          // 1. Get the token from Auth0
          const token = await getAccessTokenSilently({
            authorizationParams: {
              audience: "https://cyber-diary-api", // MUST match your Backend Audience
            },
          });

          // 2. Attach it to the header: "Authorization: Bearer <token>"
          config.headers.Authorization = `Bearer ${token}`;
        } catch (error) {
          console.error("Error getting token", error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return instance;
  }, [getAccessTokenSilently]);

  return api;
};

export default useAxios;