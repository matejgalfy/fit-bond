import { treaty } from '@elysiajs/eden';
import type { Backend } from '../../backend/src/index'; // Import the Backend type
import { useState } from 'react';

// Initialize the client with the Backend's type
const client = treaty<Backend>('localhost:3000');

function App() {
    const [message, setMessage] = useState('');

    const fetchGreet = async () => {
        const { data } = await client.greet.post({ name: 'Bun User' });
        if (data) setMessage(data);
    };

    return (
        <div>
            <h1>Fullstack Bun</h1>
            <button
                onClick={() => {
                    void fetchGreet();
                }}
            >
                Fetch Data
            </button>
            <p>Response: {message}</p>
        </div>
    );
}
export default App;
