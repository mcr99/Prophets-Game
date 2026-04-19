import { useState, useContext, createContext } from "react";

export const AuthContext = createContext();

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de un AuthProvider");
    }
    return context;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState({
        token: localStorage.getItem("token") || null,
        username: localStorage.getItem("username") || null,
        name: localStorage.getItem("user_name"),
        rol: localStorage.getItem("user_role") || null,
        color: localStorage.getItem("user_color") || "bg-slate-950"
    });

    function login(data) {
        const token = data.session?.access_token || null;
        const email = data.email || null;
        const role = data.user_role || null;
        const userColor = data.color || "bg-slate-950";
        const name = data.name || "Usuario";

        localStorage.setItem("token", token);
        localStorage.setItem("username", email);
        localStorage.setItem("user_role", role);
        localStorage.setItem("user_color", userColor);
        localStorage.setItem("user_name", name);

        setUser({
            token: token,
            username: email,
            rol: role,
            color: userColor,
            name: name,
        });
    }

    function logout() {
        localStorage.clear();

        setUser({
            token: null,
            username: null,
            name: null,
            rol: null,
            color: "bg-slate-950",
        });
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}