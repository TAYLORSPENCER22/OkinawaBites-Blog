import { useState } from "react"

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    async function register(ev) {
        ev.preventDefault();
        setMessage('');
        const response = await fetch('http://localhost:4000/register', {
            method: 'POST',
            body: JSON.stringify({username, password}),
            headers: {'Content-Type':'application/json'},
        });
        if (response.status === 200) {
            setMessageType('success');
            setMessage('Registration successful — you can log in now.');
        } else {
            setMessageType('error');
            setMessage('Registration failed');
        }
    }

    return( 
    <div className="register-container">
    <form className="register" onSubmit={register}>
        <h1>Register</h1>
        <input type="text"
            placeholder="Username"
            value={username} 
            onChange={ev => setUsername(ev.target.value)}/>
        <input type="password"
            placeholder="Password"
            value={password}
            onChange={ev => setPassword(ev.target.value)}/>
        {message && <p className={messageType === 'success' ? 'form-success' : 'form-error'}>{message}</p>}
        <button>Register</button>
    </form>
    </div>
    )
}