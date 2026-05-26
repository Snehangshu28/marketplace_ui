import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from '../context/AuthContext';
import SocketInitializer from './components/SocketInitializer';

export default function App() {
  return (
    <AuthProvider>
      <SocketInitializer />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
