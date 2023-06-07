import { useEffect, useState } from 'react';
import Login from './pages/Login';
// import { ipcRenderer } from 'electron';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        API.onYandexAuthSuccess(() => {
            setIsAuthenticated(true);
        });
        (async () => setIsAuthenticated(await API.getAuthState()))();
    }, []);

    return <div>{isAuthenticated === false && <Login />}</div>;
}

export default App;
