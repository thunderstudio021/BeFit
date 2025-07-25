"use server";

import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

webpush.setVapidDetails(
  "mailto:contato@seudominio.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  const { data: subs, error } = await supabase.from("push_subscriptions").select("*");
  if (error) return NextResponse.json({ error }, { status: 500 });

  const payload = JSON.stringify({
    title: "Nova Mensagem",
    body: "Você recebeu uma notificação push!",
  });

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys_p256dh,
            auth: sub.keys_auth,
          },
        },
        payload
      );
    } catch (err) {
      console.error("Erro ao enviar push:", err);
    }
  }

  return NextResponse.json({ enviado: subs.length });
}
