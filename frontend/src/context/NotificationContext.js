import React, { createContext, useState, useContext, useCallback } from "react";

const NotificationContext = createContext();
export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  //  Add a new notification dynamically
  const addNotification = useCallback((text, type = "unread") => {
    const newNotif = {
      id: Date.now(), // Unique ID based on timestamp
      text,
      time: "Just now",
      type, // 'unread', 'mention', or 'read'
    };
    setNotifications((prev) => [newNotif, ...prev]); // Newest first
  }, []);

  //  Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  //  Mark single notification as read (optional future feature)
  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, type: "read" } : n)),
    );
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        clearNotifications,
        markAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
