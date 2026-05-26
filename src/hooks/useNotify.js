import { useState } from "react";

export function useNotify() {
  const [notif, setNotif] = useState(null);
  const notify = (msg) => { setNotif(msg); setTimeout(() => setNotif(null), 2200); };
  return { notif, notify };
}