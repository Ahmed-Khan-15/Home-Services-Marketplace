import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Login from "./pages/login";
import Signup from "./pages/Signup";

import "./App.css";

function Home() {
    const user = JSON.parse(
        localStorage.getItem("user")
    );

    return (
        <div className="home-page">

            <h1>
                Home Services Marketplace
            </h1>

            {user ? (
                <>
                    <p>
                        Welcome, {user.name}
                    </p>

                    <p>
                        You are logged in as a{" "}
                        <strong>{user.role}</strong>.
                    </p>
                </>
            ) : (
                <>
                    <p>
                        Find trusted professionals for your
                        home service needs.
                    </p>

                    <div className="home-links">
                        <Link to="/login">
                            Log In
                        </Link>

                        <Link to="/signup">
                            Create Account
                        </Link>
                    </div>
                </>
            )}

        </div>
    );
}


function App() {
    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/signup"
                    element={<Signup />}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;