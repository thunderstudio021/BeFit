"use server";
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await fs.writeFile(
      `/tmp/webhook-${Date.now()}.json`,
      JSON.stringify(body, null, 2)
    );

    const event = body.Event;
    const data = body.Data;

    const email = data?.Buyer?.Email;
    const createdAt = body.CreatedAt;
    const amount = data?.Purchase?.Price?.Value || null;
    const currency = 'BRL'; // ou adaptar se necessário
    const payment_method = data?.Purchase?.Payment?.PaymentMethod || 'unknown';
    const subscriptionId = data?.Subscriptions?.[0]?.Id;
    const expiredAt = data?.Subscriptions?.[0]?.ExpiredDate || null;
    const canceledAt = data?.Subscriptions?.[0]?.CanceledDate || null;

    if (!email) {
      return NextResponse.json({ error: 'Email ausente no payload' }, { status: 400 });
    }

    // Buscar ou criar profile
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (!profile) {
      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          email,
          is_premium: (event === 'Recurrent_Payment' || event === 'Product_Access_Started' || event === 'Subscription_Product_Access' ),
          user_type: (event === 'Recurrent_Payment' || event === 'Product_Access_Started' || event === 'Subscription_Product_Access') ? 'premium' : 'free',
          subscription_status: (event === 'Recurrent_Payment' || event === 'Product_Access_Started' || event === 'Subscription_Product_Access') ? 'active' : event,
          subscription_expires_at: expiredAt || canceledAt || null
        })
        .select('id')
        .single();

      if (createError || !createdProfile) {
        return NextResponse.json({ error: 'Erro ao criar novo profile' }, { status: 500 });
      }

      profile = createdProfile;
    }

    const userId = profile.id;

    // Trata os diferentes eventos
    switch (event) {
      case 'Recurrent_Payment':
        await supabase.from('subscriptions').insert([{
          user_id: userId,
          status: 'active',
          plan_type: 'premium',
          payment_method,
          amount,
          currency,
          started_at: createdAt,
          expires_at: expiredAt
        }]);

        await supabase
          .from('profiles')
          .update({
            is_premium: true,
            user_type: 'premium',
            subscription_status: 'active',
            subscription_expires_at: expiredAt
          })
          .eq('id', userId);

        await supabase.from('notifications').insert([
          {
            user_id: userId, // ou null se for para todos
            type: 'info',
            title: 'Plano ativado com sucesso!',
            message: 'Seu plano foi ativado e está disponível para uso.',
            action_text: 'Ver benefícios',
            action_link: '/premium',
          },
        ]);
        break;

        

      case 'Subscription_Product_Access':
        await supabase.from('subscriptions').insert([{
          user_id: userId,
          status: 'active',
          plan_type: 'premium',
          payment_method,
          amount,
          currency,
          started_at: createdAt,
          expires_at: expiredAt
        }]);

        await supabase
          .from('profiles')
          .update({
            is_premium: true,
            user_type: 'premium',
            subscription_status: 'active',
            subscription_expires_at: expiredAt
          })
          .eq('id', userId);

        await supabase.from('notifications').insert([
          {
            user_id: userId, // ou null se for para todos
            type: 'info',
            title: 'Plano ativado com sucesso!',
            message: 'Seu plano foi ativado e está disponível para uso.',
            action_text: 'Ver benefícios',
            action_link: '/premium',
          },
        ]);
        break;  

      case 'Product_Access_Started':
        await supabase.from('subscriptions').insert([{
          user_id: userId,
          status: 'active',
          plan_type: 'premium',
          payment_method,
          amount,
          currency,
          started_at: createdAt,
          expires_at: expiredAt
        }]);

        await supabase
          .from('profiles')
          .update({
            is_premium: true,
            user_type: 'premium',
            subscription_status: 'active',
            subscription_expires_at: expiredAt
          })
          .eq('id', userId);

        await supabase.from('notifications').insert([
          {
            user_id: userId, // ou null se for para todos
            type: 'info',
            title: 'Plano ativado com sucesso!',
            message: 'Seu plano foi ativado e está disponível para uso.',
            action_text: 'Ver benefícios',
            action_link: '/premium',
          },
        ]);
        break;  

      case 'Refund_Period_Over':
        // Aqui você pode apenas registrar a info ou marcar como "não reembolsável"
        await supabase
          .from('subscriptions')
          .update({ refund_available: false })
          .eq('user_id', userId);
        break;

      case 'Subscription_Canceled':
        await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
            expires_at: canceledAt
          })
          .eq('user_id', userId);

        await supabase
          .from('profiles')
          .update({
            is_premium: false,
            user_type: 'free',
            subscription_status: 'cancelled',
            subscription_expires_at: canceledAt
          })
          .eq('id', userId);
        await supabase.from('notifications').insert([
          {
            user_id: userId, // ou null se for para todos
            type: 'info',
            title: 'Seu Plano foi cancelado!',
            message: 'Seu plano foi cancelado e está indisponível para uso.',
            action_text: 'Ver benefícios',
            action_link: '/',
          },
        ]);
        break;

      case 'Subscription_Expired':
        await supabase
          .from('subscriptions')
          .update({
            status: 'expired',
            updated_at: new Date().toISOString(),
            expires_at: expiredAt
          })
          .eq('user_id', userId);

        await supabase
          .from('profiles')
          .update({
            is_premium: false,
            user_type: 'free',
            subscription_status: 'expired',
            subscription_expires_at: expiredAt
          })
          .eq('id', userId);
        await supabase.from('notifications').insert([
          {
            user_id: userId, // ou null se for para todos
            type: 'info',
            title: 'Seu Plano foi cancelado!',
            message: 'Seu plano foi cancelado e está indisponível para uso.',
            action_text: 'Ver benefícios',
            action_link: '/',
          },
        ]);
        break;

        case 'Product_Access_Ended':
        await supabase
          .from('subscriptions')
          .update({
            status: 'expired',
            updated_at: new Date().toISOString(),
            expires_at: expiredAt
          })
          .eq('user_id', userId);

        await supabase
          .from('profiles')
          .update({
            is_premium: false,
            user_type: 'free',
            subscription_status: 'expired',
            subscription_expires_at: expiredAt
          })
          .eq('id', userId);
        await supabase.from('notifications').insert([
          {
            user_id: userId, // ou null se for para todos
            type: 'info',
            title: 'Seu Plano foi cancelado!',
            message: 'Seu plano foi cancelado e está indisponível para uso.',
            action_text: 'Ver benefícios',
            action_link: '/',
          },
        ]);
        break;

        

      default:
        console.warn('Evento não tratado:', event);
        return NextResponse.json({ message: `Evento ${event} ignorado.` });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Erro no webhook:', err);
    return NextResponse.json({ error: 'Erro interno no webhook' }, { status: 500 });
  }
}
