exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Metodo nao permitido' });
  }

  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) {
    return json(500, { error: 'Variavel MERCADO_PAGO_ACCESS_TOKEN nao configurada no Netlify.' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (err) {
    return json(400, { error: 'JSON invalido.' });
  }

  const { pedidoId, cliente, itens } = body;
  if (!pedidoId || !Array.isArray(itens) || itens.length === 0) {
    return json(400, { error: 'Pedido ou itens invalidos.' });
  }

  const origin = event.headers.origin || event.headers.referer?.replace(/\/$/, '') || 'https://example.com';

  const preference = {
    items: itens.map(item => ({
      id: String(item.id || ''),
      title: String(item.nome || 'Produto'),
      quantity: Number(item.quantidade || 1),
      unit_price: Number(item.preco || 0),
      currency_id: 'BRL'
    })).filter(item => item.unit_price > 0 && item.quantity > 0),
    payer: {
      name: cliente?.nome || undefined,
      email: cliente?.email || undefined,
      phone: cliente?.telefone ? { number: String(cliente.telefone) } : undefined
    },
    external_reference: String(pedidoId),
    statement_descriptor: 'FABIO STORE',
    back_urls: {
      success: `${origin}/pedido-retorno.html?status=success&pedido=${pedidoId}`,
      failure: `${origin}/pedido-retorno.html?status=failure&pedido=${pedidoId}`,
      pending: `${origin}/pedido-retorno.html?status=pending&pedido=${pedidoId}`
    },
    auto_return: 'approved',
    metadata: {
      pedido_id: String(pedidoId)
    }
  };

  if (!preference.items.length) {
    return json(400, { error: 'Nenhum item valido para pagamento.' });
  }

  try {
    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preference)
    });

    const mpData = await mpRes.json();
    if (!mpRes.ok) {
      return json(mpRes.status, { error: 'Erro Mercado Pago', details: mpData });
    }

    return json(200, {
      id: mpData.id,
      init_point: mpData.init_point,
      sandbox_init_point: mpData.sandbox_init_point
    });
  } catch (err) {
    return json(500, { error: err.message || 'Erro inesperado.' });
  }
};

function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(payload)
  };
}
