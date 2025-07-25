"use server";
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const event = body.event;
    const payload = body.payload;

    const {
    user,
    status,
    plan,
    current_period_end,
    created_at,
    canceled_at,
    payment_method,
    amount,
    currency
  } = payload;

  const email = user?.email;

    if (!email) {
      return NextResponse.json({ error: 'Email ausente no payload' }, { status: 400 });
    }

    // Buscar o profile pelo e-mail
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    // Se não encontrar, criar um novo profile
    if (!profile) {
      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          email,
          is_premium: status === 'active',
          user_type: status === 'active' ? 'premium' : 'free',
          subscription_status: status || 'active',
          subscription_expires_at: current_period_end
        })
        .select('id')
        .single();

      if (createError || !createdProfile) {
        return NextResponse.json({ error: 'Erro ao criar novo profile' }, { status: 500 });
      }

      profile = createdProfile;
    }

    const userId = profile.id;

    switch (event) {
      case 'subscription.created':
        await supabase.from('subscriptions').insert([
          {
            user_id: userId,
            status: 'active',
            plan_type: 'premium',
            payment_method,
            amount,
            currency,
            started_at: created_at,
            expires_at: current_period_end
          }
        ]);

        await supabase
          .from('profiles')
          .update({
            is_premium: true,
            user_type: 'premium',
            subscription_status: 'active',
            subscription_expires_at: current_period_end
          })
          .eq('id', userId);
        break;

      case 'subscription.updated':
        await supabase
          .from('subscriptions')
          .update({
            status,
            plan_type: 'premium',
            expires_at: current_period_end,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        await supabase
          .from('profiles')
          .update({
            is_premium: status === 'active',
            user_type: status === 'active' ? 'premium' : 'free',
            subscription_status: status,
            subscription_expires_at: current_period_end
          })
          .eq('id', userId);
        break;

      case 'subscription.canceled':
        await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        await supabase
          .from('profiles')
          .update({
            is_premium: false,
            user_type: 'free',
            subscription_status: 'cancelled',
            subscription_expires_at: current_period_end || canceled_at || new Date().toISOString()
          })
          .eq('id', userId);
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
