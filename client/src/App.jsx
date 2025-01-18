import { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:5003");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  const joinRoom = () => {
    if (username && room) {
      socket.emit("join_room", room);
      setIsJoined(true);
    }
  };

  const sendMessage = () => {
    if (message) {
      const messageData = {
        room,
        username,
        message,
        time: new Date().toLocaleTimeString(),
      };
      socket.emit("send_message", messageData);
      setMessages((prev) => [...prev, messageData]);
      setMessage("");
    }
  };

  return (
    <div className="app">
      <div className="chat-container">
        <h1 className="chat-title">Real-Time Chat</h1>

        {!isJoined ? (
          <div className="join-container">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
            />
            <input
              type="text"
              placeholder="Room ID"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="input"
            />
            <button onClick={joinRoom} className="button">
              Join Room
            </button>
          </div>
        ) : (
          <div className="chat-box">
            <div className="messages">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${
                    msg.username === username
                      ? "message-sent"
                      : "message-received"
                  }`}
                >
                  <div className="message-header">
                    <span className="username">{msg.username}</span>
                    <span className="time">{msg.time}</span>
                  </div>
                  <p className="message-content">{msg.message}</p>
                </div>
              ))}
            </div>
            <div className="input-container">
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                className="input"
              />
              <button onClick={sendMessage} className="button">
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
