import { createContext, useState, useEffect } from 'react';

const AuthContext=createContext();


function AuthProvider({ children }){
    const[ user, setUser] = useState(null);
    const[ token, setToken] = useState(null);

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if(savedToken){
            setToken(savedToken);
        }
        if(savedUser){
            setUser(JSON.parse(savedUser));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("token", token);
    }, [token]);

    useEffect(() => {
        if(user){
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
        }
    }, [user]);

    return(
        <AuthContext.Provider value={{ user, setUser, token, setToken }}>
            { children }
        </AuthContext.Provider>
    );
}

export default AuthContext;
export { AuthProvider };