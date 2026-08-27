import {
    BrowserRouter,
    Routes,
    Route,
    Link
} from "react-router-dom";

import Login from "./pages/login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

import "./App.css";

function Home() {
    const { user, logout } = useAuth();

    return (
        <div className="home-page">

            <h1>
                Home Services Marketplace
            </h1>

            <p>
                Welcome, {user.name}
            </p>

            <p>
                You are logged in as a{" "}
                <strong>{user.role}</strong>.
            </p>

            <button onClick={logout}>
                Logout
            </button>

        </div>
    );
}

function App() {
    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/signup"
                    element={<Signup />}
                />

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;