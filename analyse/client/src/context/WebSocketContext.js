import React, { createContext, useEffect, useState } from 'react';

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children, symbol }) => {
    const [messages, setMessages] = useState([]);
    console.log('Symbol', symbol);

    useEffect(() => {
        if (!symbol) return;

        const socket = new WebSocket(`ws://localhost:5000?symbol=${symbol}`);

        socket.onopen = () => {
            console.log('WebSocket connected');
        };

        socket.onmessage = (event) => {
            console.log('Received message:', event);
            const data = JSON.parse(event.data);
            if (data.topic === 'crypto-price' && data.symbol === symbol) {
                setMessages((prevMessages) => [...prevMessages, data.value]);
            }
        };
        socket.onclose = () => {
            console.log('WebSocket disconnected');
        };
        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
        return () => {
            socket.close();
        };

    }, [symbol]);

    return (
        <WebSocketContext.Provider value={{ messages }}>
            {children}
        </WebSocketContext.Provider>
    );
};