import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface FormData {
    username: string;
    // email: string; // Commented out email field
    password: string;
    confirmPassword: string;
}

const initialFormData: FormData = {
    username: '',
    // email: '', // Commented out email field
    password: '',
    confirmPassword: '',
};

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }
    
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    
    componentDidCatch(error: any, errorInfo: any) {
        console.error('ErrorBoundary caught an error', error, errorInfo);
    }
    
    render() {
        if (this.state.hasError) {
            return (
                <div style={styles.errorMessage}>
                    Something went wrong. Please try again later.
                </div>
            );
        }
        return this.props.children;
    }
}

const Register: React.FC = () => {
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<Partial<FormData>>({});
    const [serverError, setServerError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [registrationSuccess, setRegistrationSuccess] = useState<boolean>(false);
    //const [showPassword, setShowPassword] = useState<boolean>(false); // Show/hide password toggle
    const [lastSubmitTime, setLastSubmitTime] = useState<number>(0); // Submission cooldown
    const navigate = useNavigate();

    const validate = (): boolean => {
        const newErrors: Partial<FormData> = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required.';
        }

        // if (!formData.email.trim()) {
        //     newErrors.email = 'Email is required.';
        // } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
        //     newErrors.email = 'Invalid email address.';
        // }

        if (!formData.password) {
            newErrors.password = 'Password is required.';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters.';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validate()) {
            return;
        }
        if (Date.now() - lastSubmitTime < 5000) { // Submission cooldown
            setServerError('Please wait before trying again');
            return;
        }
        setIsLoading(true);
        setServerError('');
        setLastSubmitTime(Date.now());
        try {
            const response = await axios.post('http://localhost:3001/auth/register', {
                username: formData.username,
                // email: formData.email, // Commented out email field
                password: formData.password,
            });
            console.log('User registered successfully', response.data);
            // Clear form or navigate to another route after successful registration
            setRegistrationSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setServerError(error.response?.data?.message || 'Registration failed');
            } else {
                setServerError('Registration failed. Please try again later.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ErrorBoundary>
            <div style={styles.container}>
                <h2>Register</h2>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.field}>
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            style={styles.input}
                            aria-invalid={!!errors.username}
                            aria-describedby="username-error"
                            required
                        />
                        {errors.username && (
                            <span id ="username-error" style={styles.errorText}>
                                {errors.username}
                            </span>
                        )}
                    </div>
                    {/* <div style={styles.field}>
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            style={styles.input}
                        />
                        {errors.email && <span style={styles.errorText}>{errors.email}</span>}
                    </div> */}
                    <div style={styles.field}>
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                        
                        
                        {errors.password && <span style={styles.errorText}>{errors.password}</span>}
                    </div>
                    <div style={styles.field}>
                        <label htmlFor="confirmPassword">Confirm Password:</label>
                        <input
                            //type = {showPassword?'text':'password'}
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                        {errors.confirmPassword && <span style={styles.errorText}>{errors.confirmPassword}</span>}
                    </div>
                    {serverError && <div style={styles.serverError}>{serverError}</div>}
                    {registrationSuccess && (
                        <div style={{ color: 'green', marginBottom: '10px' }}>
                                Registration successful! Redirecting to login…
                        </div>
                        )}
                    <button type="submit" style={styles.button} disabled={isLoading}>
                        {isLoading ? 'Registering...' : 'Register'}
                    </button>
                </form>
            </div>
        </ErrorBoundary>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        maxWidth: '400px',
        margin: '30px auto',
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        fontFamily: 'Arial, sans-serif',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    field: {
        marginBottom: '15px',
        display: 'flex',
        flexDirection: 'column',
    },
    input: {
        padding: '8px',
        fontSize: '16px',
        border: '1px solid #ccc',
        borderRadius: '4px',
    },
    button: {
        padding: '10px',
        fontSize: '16px',
        backgroundColor: '#007BFF',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    toggleButton: {
        marginTop: '5px',
        padding: '5px',
        fontSize: '14px',
        backgroundColor: '#007BFF',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    errorText: {
        color: 'red',
        fontSize: '14px',
        marginTop: '5px',
    },
    serverError: {
        color: 'red',
        fontSize: '16px',
        marginBottom: '10px',
    },
    errorMessage: {
        padding: '20px',
        color: '#fff',
        backgroundColor: '#ff4d4f',
        borderRadius: '4px',
        textAlign: 'center',
    },
};

export default Register;