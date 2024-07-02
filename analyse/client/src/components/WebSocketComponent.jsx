import React, { useContext } from 'react';
import { WebSocketContext } from '../context/WebSocketContext.js';

const WebSocketComponent = () => {
    const { messages } = useContext(WebSocketContext);

    // Filtrer les messages pour n'afficher que ceux liés aux prix des cryptomonnaies
    const priceMessages = messages.filter(message => message.topic === 'crypto-price');

    if (!priceMessages || priceMessages.length === 0) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {priceMessages.map((message, index) => (
                <div key={index}>
                    <h3>Prix pour {message.symbol} :</h3>
                    <p>{message.price}</p>
                </div>
            ))}
        </div>
    );
};

export default WebSocketComponent;