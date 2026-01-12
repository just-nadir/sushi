import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
    id: string;
    username: string;
    fullName?: string;
    phone?: string;
    role: 'ADMIN' | 'CUSTOMER';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // Validate token or just decode user for now. 
            // In a real app, we would verify with /auth/profile
            // For MVP, we assume token is valid if present or decode it 
            // decoding JWT on client side is safe for reading data (but not verifying)
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                // We might need to fetch full profile if payload doesn't have phone
                // For now, let's assume payload has basic info or we fetch profile
                setUser({
                    id: payload.sub,
                    username: payload.username,
                    role: payload.role
                });
            } catch (e) {
                console.error("Invalid token", e);
                logout();
            }
        }
        setIsLoading(false);
    }, [token]);

    const login = (newToken: string) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
