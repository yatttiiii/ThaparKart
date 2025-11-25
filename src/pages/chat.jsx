// src/pages/chat.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import BackButton from "../assets/icons/BackButton.svg";
import avatarImg from "../assets/icons/avatar.svg";

import "../styles/Chat.css";

export const Chat = () => {
  const navigate = useNavigate();

  // Conversations (sellers) state
  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: "Ananya Sharma",
      preview: "Is the book still available?",
      time: "10:42 AM",
      unread: 2,
      messages: [
        {
          from: "other",
          text: "Hey! I saw your listing for the Engineering Graphics textbook.",
          time: "10:42 AM",
        },
        {
          from: "other",
          text: "Is the book still available?",
          time: "10:42 AM",
        },
        {
          from: "me",
          text: "Hi Ananya! Yes, it's still available. It's in great condition, almost like new.",
          time: "10:43 AM",
        },
        {
          from: "other",
          text: "Perfect! When and where can we meet?",
          time: "10:44 AM",
        },
      ],
    },
    {
      id: 2,
      name: "Rohan Verma",
      preview: "Can you reduce the price a bit?",
      time: "09:15 AM",
      unread: 1,
      messages: [
        {
          from: "other",
          text: "Hi! I'm interested in your calculator listing.",
          time: "09:05 AM",
        },
        {
          from: "other",
          text: "Can you reduce the price a bit?",
          time: "09:15 AM",
        },
      ],
    },
    {
      id: 3,
      name: "Simran Kaur",
      preview: "Thanks! See you at LT-1.",
      time: "Yesterday",
      unread: 0,
      messages: [
        {
          from: "me",
          text: "We can meet near LT-1 at 5 PM today.",
          time: "Yesterday",
        },
        {
          from: "other",
          text: "Thanks! See you at LT-1.",
          time: "Yesterday",
        },
      ],
    },
  ]);

  const [selectedId, setSelectedId] = useState(conversations[0]?.id || null);
  const [messageInput, setMessageInput] = useState("");

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  // Open conversation → clear unread like WhatsApp
  const handleSelectConversation = (id) => {
    setSelectedId(id);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              unread: 0,
            }
          : c
      )
    );
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation) return;

    const newMsg = {
      from: "me",
      text: messageInput.trim(),
      time: "Now",
    };

    setConversations((prev) => {
      const updated = prev.map((c) => {
        if (c.id === selectedId) {
          return {
            ...c,
            messages: [...c.messages, newMsg],
            preview: newMsg.text,
            time: "Now",
          };
        }
        return c;
      });

      const activeConv = updated.find((c) => c.id === selectedId);
      const others = updated.filter((c) => c.id !== selectedId);
      return [activeConv, ...others];
    });

    setMessageInput("");
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* UPDATED HEADER WITH LOGO & BACK TOGETHER (LEFT) */}
      <div className="w-full flex items-center justify-between px-6 py-4 border-b border-[#0000001a]">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img src={BackButton} alt="Back" className="w-6 h-6" />
          </button>

          <div
            className="flex items-baseline gap-0 cursor-pointer select-none"
            onClick={() => navigate("/landing-login")}
          >
            <span className="text-[#c90202] font-subheading">Thapar</span>
            <span className="text-black font-subheading">Kart</span>
          </div>
        </div>

        {/* Right side spacer for symmetry */}
        <div className="w-6" />
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 flex min-h-0">
        {/* LEFT LIST */}
        <aside className="w-[30%] min-w-[260px] border-r border-[#0000001a] bg-[#f7f7f7] flex flex-col">
          <div className="px-4 py-3 border-b border-[#0000001a]">
            <h2 className="font-semibold text-sm">Chats</h2>
            <p className="text-[11px] text-[#777] mt-1">
              Select a seller to view messages
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => {
              const isActive = conv.id === selectedId;
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-[#0000000d] transition-colors ${
                    isActive ? "bg-white" : "bg-[#f7f7f7] hover:bg-[#ececec]"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#e0e0e0] overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src={avatarImg}
                      alt={conv.name}
                      className="w-8 h-8 object-cover"
                    />
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm truncate">
                        {conv.name}
                      </span>
                      <span className="text-[10px] text-[#888] ml-2 shrink-0">
                        {conv.time}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[11px] text-[#666] truncate">
                        {conv.preview}
                      </span>
                      {conv.unread > 0 && (
                        <span className="ml-2 min-w-[18px] h-[18px] rounded-full bg-[#c90202] text-[10px] text-white flex items-center justify-center shrink-0">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* RIGHT CHAT WINDOW */}
        <section className="flex-1 flex flex-col bg-[#fafafa]">
          {!selectedConversation ? (
            <div className="flex-1 flex items-center justify-center text-sm text-[#777]">
              Select a chat on the left to start messaging.
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="px-6 py-3 border-b border-[#0000001a] bg-white flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#e0e0e0] overflow-hidden flex items-center justify-center">
                  <img
                    src={avatarImg}
                    alt={selectedConversation.name}
                    className="w-7 h-7 object-cover"
                  />
                </div>
                <div className="font-medium text-sm">
                  {selectedConversation.name}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 px-6 py-4 overflow-y-auto space-y-4">
                {selectedConversation.messages.map((msg, idx) => {
                  const isMe = msg.from === "me";
                  return (
                    <div
                      key={idx}
                      className={`flex ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] flex flex-col ${
                          isMe ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                            isMe
                              ? "bg-black text-white rounded-br-none"
                              : "bg-white text-black rounded-bl-none border border-[#00000010]"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="mt-1 text-[10px] text-[#777]">
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input */}
              <form
                onSubmit={handleSend}
                className="px-4 py-3 border-t border-[#0000001a] bg-white"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message…"
                    className="flex-1 px-4 py-2 rounded-full border border-[#0000001a] text-sm outline-none bg-[#fdfdfd]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black text-white text-sm rounded-full shadow-button-shadow hover:bg-[#1a1a1a] hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Chat;
