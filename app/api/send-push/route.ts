"use server";

// app/api/send-pending-notifications/route.ts
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

export async function POST() {
  // 1. Buscar notificações não enviadas
  const { data: notifications, error: notifError } = await supabase
    .from("notifications")
    .select("*")
    .is("sentAt", null);

  if (notifError) {
    console.error("Erro ao buscar notificações:", notifError);
    return NextResponse.json({ error: notifError.message }, { status: 500 });
  }

  let enviados = 0;

  for (const notification of notifications) {
    let subscriptions = [];
    let subError = null;

    // Se tiver user_id, busca apenas as assinaturas daquele usuário
    if (notification.user_id) {
      const { data, error } = await supabase
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", notification.user_id);

      subscriptions = data || [];
      subError = error;
    } else {
      // Se não tiver user_id, busca todas as assinaturas
      const { data, error } = await supabase
        .from("push_subscriptions")
        .select("*");

      subscriptions = data || [];
      subError = error;
    }

    if (subError) {
      console.error("Erro ao buscar assinaturas:", subError);
      continue;
    }

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.message,
      actionText: notification.action_text,
      icon: "https://befitbrasil.app/icon-192x192.png",
      actionLink: notification.action_link,
    });

    let sucesso = false;

    for (const sub of subscriptions) {
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
        sucesso = true;
      } catch (err) {
        console.error("Erro ao enviar push:", err);
      }
    }

    // Atualiza o sentAt se pelo menos uma notificação foi enviada
    if (sucesso) {
      await supabase
        .from("notifications")
        .update({ sentAt: new Date().toISOString() })
        .eq("id", notification.id);
      enviados++;
    }
  }

  return NextResponse.json({ enviados });
}
