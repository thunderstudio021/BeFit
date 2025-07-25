"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function PushManager() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    )
      return;

    const registerPush = async () => {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
          ),
        });
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const endpoint = subscription.endpoint;
      const p256dh = subscription.getKey("p256dh");
      const auth = subscription.getKey("auth");

      const keys_p256dh = p256dh
        ? btoa(String.fromCharCode(...new Uint8Array(p256dh)))
        : null;
      const keys_auth = auth
        ? btoa(String.fromCharCode(...new Uint8Array(auth)))
        : null;

      await supabase.from("push_subscriptions").upsert({
        user_id: user.id,
        endpoint,
        keys_p256dh,
        keys_auth,
      });
    };

    registerPush().catch(console.error);
  }, []);

  return null;
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64String = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64String);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}
