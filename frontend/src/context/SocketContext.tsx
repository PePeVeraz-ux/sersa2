'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_BASE } from '../lib/api';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, connected: false });

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    console.log('[SocketContext] Connecting socket to:', API_BASE, 'with token:', token ? token.substring(0, 20) + '...' : 'NONE');
    const newSocket = io(API_BASE, {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('[SocketContext] Socket connected! ID:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('[SocketContext] Socket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('[SocketContext] Socket connection error:', err.message);
    });

    newSocket.on('notification', (data) => {
      console.log('[SocketContext] Received notification event:', data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
