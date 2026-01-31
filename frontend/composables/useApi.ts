export const useApi = () => {
  const token = useState<string | null>("auth-token", () => null);
  const role = useState<string | null>("auth-role", () => null);

  const setAuth = (newToken: string, newRole: string) => {
    token.value = newToken;
    role.value = newRole;
  };

  const clearAuth = () => {
    token.value = null;
    role.value = null;
  };

  const request = async <T>(url: string, options: any = {}) => {
    const headers: Record<string, string> = options.headers ?? {};
    if (token.value) {
      headers["x-user-id"] = token.value;
      if (role.value) {
        headers["x-user-role"] = role.value;
      }
    }
    return $fetch<T>(url, { ...options, headers });
  };

  return { request, setAuth, clearAuth, token, role };
};
