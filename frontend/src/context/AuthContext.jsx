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

            } catch (error) {
                localStorage.removeItem("token");
                setUser(null);

            } finally {
                setLoading(false);
            }
        };

        fetchCurrentUser();
    }, []);

    const login = async (phone, password) => {
        const response = await api.post("/auth/login", {
            phone,
            password,
        });

        localStorage.setItem(
            "token",
            response.data.token
        );

        setUser(response.data.user);

        return response.data;
    };

    const signup = async (formData) => {
        const response = await api.post(
            "/auth/signup",
            formData
        );

        localStorage.setItem(
            "token",
            response.data.token
        );

        setUser(response.data.user);

        return response.data;
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
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