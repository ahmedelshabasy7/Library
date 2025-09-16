import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import api from "@utils/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const login = useCallback(async ({ email, password, admin = false }) => {
    setLoading(true);
    try {
      const tryLogin = async (url) => {
        const { data } = await api.post(url, { email, password });
        if (data.token) {
          setToken(data.token);
          const payload = JSON.parse(atob(data.token.split(".")[1]));
          let baseUser = {
            id: payload.id,
            email: payload.email,
            role: payload.role,
            username: payload.username,
          };
          try {
            const me = await api.get(
              baseUser.role === "admin" ? "/admin" : "/users/me"
            );
            if (baseUser.role === "admin") {
              baseUser.username =
                me.data?.admin?.username ||
                me.data?.admin?.name ||
                baseUser.username;
            } else {
              baseUser.username =
                me.data?.user?.username ||
                me.data?.user?.name ||
                baseUser.username;
            }
          } catch (err) {
            console.error("[AuthContext] Error fetching name:", err);
          }
          setUser(baseUser);
        }
        return data;
      };
      if (admin) return await tryLogin("/auth/admin/login");
      return await tryLogin("/auth/user/login");
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async ({ username, email, password }) => {
    const { data } = await api.post("/auth/user/register", {
      username,
      email,
      password,
    });
    return data;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    token,
    user,
    login,
    register,
    logout,
    loading,
    isAuthed: !!token,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
