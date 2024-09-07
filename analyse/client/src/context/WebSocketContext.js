import React, { createContext, useEffect, useState } from 'react';

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const [data, setData] = useState([]); 
    const [socket, setSocket] = useState(null);
    const [symbol, setSymbol] = useState('');
    const [isSocketOpen, setIsSocketOpen] = useState(false);

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8000`); 

        ws.onopen = () => {
            console.log('WebSocket connection established');
        };

        ws.onmessage = (event) => {
            const receivedData = JSON.parse(event.data);

            if (receivedData.type === 'priceUpdate') {
                const newPrice = receivedData.price;
                const timestamp = new Date().toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                });

                setData(prevData => {
                    const seriesId = symbol; 
                    const color = "hsl(117, 70%, 50%)"; 

                    const seriesIndex = prevData.findIndex(series => series.id === seriesId);
                    
                    if (seriesIndex >= 0) {
                        // Met à jour la série existante
                        const updatedSeries = {
                            ...prevData[seriesIndex],
                            data: [
                                ...prevData[seriesIndex].data,
                                { x: timestamp, y: newPrice }
                            ]
                        };

                        return [
                            ...prevData.slice(0, seriesIndex),
                            updatedSeries,
                            ...prevData.slice(seriesIndex + 1)
                        ];
                    } else {
                        // Ajoute une nouvelle série
                        return [
                            ...prevData,
                            {
                                id: seriesId,
                                color: color,
                                data: [{ x: timestamp, y: newPrice }]
                            }
                        ];
                    }
                });
            }
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
            setIsSocketOpen(false); 
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        setSocket(ws);

        return () => {
            ws.close();
        };
    }, [symbol]); 

    useEffect(() => {
        if (socket && symbol) {
            const message = {
                action: 'subscribe',
                symbol,
            };
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(message));
            } else {
                socket.onopen = () => {
                    socket.send(JSON.stringify(message));
                };
            }
        }
    }, [symbol, socket, isSocketOpen]);
    console.log('Data sent:', data);
    return (
        <WebSocketContext.Provider value={{ data, setSymbol }}>
            {children}
        </WebSocketContext.Provider>
    );
};