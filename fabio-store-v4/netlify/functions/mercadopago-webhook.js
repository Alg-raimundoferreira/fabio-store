exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Metodo nao permitido' });

  const mpToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!mpToken || !supabaseUrl || !serviceKey) {
    return json(200, { ok: true, warning: 'Webhook recebido, mas variaveis de ambiente incompletas.' });
  }

  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch {}

  const paymentId = body?.data?.id || body?.id || new URLSearchParams(event.rawQuery || '').get('id');
  const type = body?.type || body?.topic || new URLSearchParams(event.rawQuery || '').get('topic');

  if (!paymentId || (type && !String(type).includes('payment'))) {
    return json(200, { ok: true, ignored: true });
  }

  try {
    const payRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${mpToken}` }
    });
    const payment = await payRes.json();
    if (!payRes.ok) return json(200, { ok: false, details: payment });

    const pedidoId = payment.external_reference || payment.metadata?.pedido_id;
    if (!pedidoId) return json(200, { ok: true, warning: 'Pagamento sem pedido vinculado.' });

    let status = 'aguardando_pagamento';
    if (payment.status === 'approved') status = 'pago';
    if (payment.status === 'cancelled' || payment.status === 'rejected') status = 'cancelado';
    if (payment.status === 'pending' || payment.status === 'in_process') status = 'pendente';

    const updateRes = await fetch(`${supabaseUrl}/rest/v1/pedidos?id=eq.${pedidoId}`, {
      method: 'PATCH',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ status })
    });

    return json(200, { ok: true, pedidoId, status, updated: updateRes.ok });
  } catch (err) {
    return json(200, { ok: false, error: err.message });
  }
};

function json(statusCode, payload) {
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) };
}
