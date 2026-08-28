import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        phone: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();


    setError("");
    setLoading(true);

    try {
        

        await login(
            formData.phone,
            formData.password
        );


        navigate("/");

    } catch (error) {
        console.log("LOGIN ERROR:", error);

        setError(
            error.response?.data?.message ||
            "Something went wrong. Please try again."
        );
    } finally {
        setLoading(false);
    }
};
    return (
        <div className="auth-page">

            <div className="auth-card">

                <h1>Welcome Back</h1>

                <p className="auth-subtitle">
                    Log in to your account
                </p>

                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Phone</label>

                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="03XXXXXXXXX"
                            required
                        />
                    </div>


                    <div className="form-group">
                        <label>Password</label>

                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>


                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Log In"}
                    </button>

                </form>


                <p className="auth-switch">
                    Don't have an account?{" "}
                    <Link to="/signup">
                        Create one
                    </Link>
                </p>

            </div>

        </div>
    );
}

export default Login;