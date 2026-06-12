FABIO STORE - V4 NETLIFY + SUPABASE + MERCADO PAGO

O que esta versao tem:
- Loja publica carregando produtos do Supabase
- Carrinho
- Checkout com redirecionamento para Mercado Pago Checkout Pro
- Painel admin protegido por login Supabase
- Cadastro, edicao e exclusao de produto
- Upload de imagens no bucket produtos
- Pedidos no Supabase
- Netlify Functions prontas

IMPORTANTE:
Esta versao deve ser publicada via GitHub conectado ao Netlify.
Nao use apenas Netlify Drop se quiser Mercado Pago funcionando com Functions.

Arquivos novos:
- netlify/functions/create-preference.js
- netlify/functions/mercadopago-webhook.js
- netlify.toml
- package.json
- pedido-retorno.html

Variavel obrigatoria no Netlify:
MERCADO_PAGO_ACCESS_TOKEN = seu Access Token do Mercado Pago

Variaveis para webhook automatico de pagamento:
SUPABASE_URL = https://hxymxfdtitwnkwsseaah.supabase.co
SUPABASE_SERVICE_ROLE_KEY = sua service_role key do Supabase

ATENCAO:
Nunca coloque SUPABASE_SERVICE_ROLE_KEY no frontend.
Ela so pode ficar em Environment variables do Netlify.

Depois de subir no Netlify via GitHub:
1. Confira se MERCADO_PAGO_ACCESS_TOKEN esta configurado.
2. Abra a loja.
3. Adicione produto ao carrinho.
4. Finalize compra.
5. Deve redirecionar para Mercado Pago.

Webhook Mercado Pago:
No painel Mercado Pago Developers, configure a URL:
https://SEU-SITE.netlify.app/.netlify/functions/mercadopago-webhook

Eventos:
- payments

Status usados em pedidos:
- aguardando_pagamento
- pendente
- pago
- cancelado
- enviado

Admin:
/admin/login.html

O admin precisa existir em public.profiles com role = admin.
