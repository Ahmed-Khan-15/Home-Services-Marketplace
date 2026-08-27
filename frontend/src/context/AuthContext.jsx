import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            setLoading(false);
            return;
        }

        const fetchCurrentUser = async () => {
            try {
                const response = await api.get("/auth/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setUser(response.data.user);

                localStorage.setItem(
                    "user",
                    JSON.stringify(response.data.user)
                );

            } catch (error) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setUser(null);

            } finally {
                setLoading(false);
            }
        };

        fetchCurrentUser();
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    const value = {
        user,
        setUser,
        loading,
        isAuthenticated: !!user,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}