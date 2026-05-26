// import { useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { Toaster } from 'sonner';

export default function SocketInitializer() {
  // Just calling the hook initializes the connection and listeners
  useSocket();
  
  return <Toaster position="top-right" richColors />;
}
