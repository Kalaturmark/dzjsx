const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const React = require('react');
const { renderToString } = require('react-dom/server');
const { useState, useEffect } = require('react');


const app = express();
const server = http.createServer(app);
const io = socketIo(server);


const ChatApp = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const socket = io();

        socket.on('message', (newMessage) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        });

        return () => {
            socket.off('message'); // Очистка при размонтировании компонента
        };
    }, []);

    const sendMessage = () => {
        if (message) {
            socket.emit('message', message);
            setMessage('');
        }
    };

    return (
        <div>
            <h1>Socket.IO Chat</h1>
            <div>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
            <ul>
                {messages.map((msg, index) => (
                    <li key={index}>{msg}</li>
                ))}
            </ul>
        </div>
    );
};


app.get('/', (req, res) => {
    const html = renderToString(<ChatApp />);
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Socket.IO Chat</title>
        <script src="/socket.io/socket.io.js"></script>
        <script>
            const socket = io();
        </script>
    </head>
    <body>
        <div id="root">${html}</div>
        <script src="https://unpkg.com/react/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom/umd/react-dom.development.js"></script>
        <script>
            ReactDOM.hydrate(
                <ChatApp />,
                document.getElementById('root')
            );
        </script>
    </body>
    </html>
  `);
});


io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('message', (message) => {
        console.log('Message received:', message);
        io.emit('message', message); 
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});


server.listen(4000, () => {
    console.log('Server is running on http://localhost:4000');
});
