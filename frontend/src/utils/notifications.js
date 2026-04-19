export const getNotifications = () => {
  return JSON.parse(localStorage.getItem("userNotifications") || "[]");
};

export const addNotification = (type, title, message) => {
  const notifications = getNotifications();
  const newNotification = {
    id: Date.now(),
    type, // 'success', 'info', 'warning'
    title,
    message,
    time: new Date().toISOString(),
    read: false,
  };
  
  // Keep only last 20 notifications
  const updated = [newNotification, ...notifications].slice(0, 20);
  localStorage.setItem("userNotifications", JSON.stringify(updated));
  
  // Dispatch a custom event to notify components (like Navbar) cross-tab or within the same page
  window.dispatchEvent(new Event("notificationsUpdated"));
  
  return newNotification;
};

export const markAsRead = (id) => {
  const notifications = getNotifications();
  const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
  localStorage.setItem("userNotifications", JSON.stringify(updated));
  window.dispatchEvent(new Event("notificationsUpdated"));
};

export const clearNotifications = () => {
  localStorage.removeItem("userNotifications");
  window.dispatchEvent(new Event("notificationsUpdated"));
};
