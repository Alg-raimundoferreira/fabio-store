const money = v => Number(v || 0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

async function requireAdmin(){
  const {data:{session}} = await supabaseClient.auth.getSession();

  if(!session){
    location.href='login.html';
    return null;
  }

  const {data,error}=await supabaseClient
    .from('profiles')
    .select('role,email')
    .eq('id',session.user.id)
    .single();

  if(error || !data || String(data.role).toLowerCase() !== 'admin'){
    alert('Acesso negado. Este usuário não é admin.');
    await supabaseClient.auth.signOut();
    location.href='login.html';
    return null;
  }

  const el=document.getElementById('adminEmail');
  if(el) el.textContent=data.email || session.user.email;

  return session;
}

async function login(e){
  e.preventDefault();

  const fd=new FormData(e.target);

  const {error}=await supabaseClient.auth.signInWithPassword({
    email:fd.get('email'),
    password:fd.get('senha')
  });

  if(error) return alert('Erro no login: '+error.message);

  location.href='dashboard.html';
}

async function logout(){
  await supabaseClient.auth.signOut();
  location.href='login.html';
}

async function uploadImage(file){
  if(!file || !file.size) return '';

  const ext=file.name.split('.').pop();
  const name=`${crypto.randomUUID()}.${ext}`;

  const {error}=await supabaseClient.storage
    .from('produtos')
    .upload(name,file,{upsert:false});

  if(error) throw error;

  return supabaseClient.storage
    .from('produtos')
    .getPublicUrl(name)
    .data
    .publicUrl;
}

async function saveProduct(e){
  e.preventDefault();

  const fd=new FormData(e.target);
  let imageUrl=fd.get('imagem_url') || '';

  try{
    const file=fd.get('imagem');
    if(file && file.size) imageUrl=await uploadImage(file);
  }catch(err){
    return alert('Erro no upload: '+err.message);
  }

  const product={
    nome:fd.get('nome'),
    descricao:fd.get('descricao'),
    preco:Number(fd.get('preco')),
    estoque:Number(fd.get('estoque')),
    categoria:fd.get('categoria'),
    imagem_url:imageUrl,
    ativo:fd.get('ativo')==='on'
  };

  const id=fd.get('id');

  const query=id
    ? supabaseClient.from('produtos').update(product).eq('id',id)
    : supabaseClient.from('produtos').insert(product);

  const {error}=await query;

  if(error) return alert('Erro ao salvar: '+error.message);

  alert('Produto salvo.');

  e.target.reset();

  const produtoId=document.getElementById('produtoId');
  if(produtoId) produtoId.value='';

  loadAdminProducts();
  loadDashboardStats();
}

async function loadDashboardStats(){
  const totalProdutosEl=document.getElementById('totalProdutos');
  const totalPedidosEl=document.getElementById('totalPedidos');
  const totalPendentesEl=document.getElementById('totalPendentes');
  const totalFaturamentoEl=document.getElementById('totalFaturamento');

  if(!totalProdutosEl && !totalPedidosEl && !totalPendentesEl && !totalFaturamentoEl) return;

  const {count: produtosCount} = await supabaseClient
    .from('produtos')
    .select('*',{count:'exact',head:true});

  const {data: pedidos, error: pedidosError} = await supabaseClient
    .from('pedidos')
    .select('valor_total,status');

  if(totalProdutosEl) totalProdutosEl.textContent = produtosCount || 0;

  if(pedidosError){
    if(totalPedidosEl) totalPedidosEl.textContent = '0';
    if(totalPendentesEl) totalPendentesEl.textContent = '0';
    if(totalFaturamentoEl) totalFaturamentoEl.textContent = money(0);
    return;
  }

  const pedidosLista = pedidos || [];

  const totalPedidos = pedidosLista.length;

  const totalPendentes = pedidosLista.filter(p =>
    ['pendente','aguardando_pagamento'].includes(String(p.status || '').toLowerCase())
  ).length;

  const faturamento = pedidosLista
    .filter(p => !['cancelado'].includes(String(p.status || '').toLowerCase()))
    .reduce((s,p)=>s+Number(p.valor_total || 0),0);

  if(totalPedidosEl) totalPedidosEl.textContent = totalPedidos;
  if(totalPendentesEl) totalPendentesEl.textContent = totalPendentes;
  if(totalFaturamentoEl) totalFaturamentoEl.textContent = money(faturamento);
}

async function loadAdminProducts(){
  const wrap=document.getElementById('adminProducts');
  if(!wrap) return;

  const {data,error}=await supabaseClient
    .from('produtos')
    .select('*')
    .order('created_at',{ascending:false});

  if(error){
    wrap.innerHTML='<div class="empty">Erro: '+error.message+'</div>';
    return;
  }

  wrap.innerHTML=`<table class="table">
    <thead>
      <tr>
        <th>Produto</th>
        <th>Preço</th>
        <th>Estoque</th>
        <th>Status</th>
        <th>Ações</th>
      </tr>
    </thead>
    <tbody>
      ${(data || []).map(p=>`
        <tr>
          <td>
            ${p.nome}
            <br>
            <small class="muted">${p.categoria||''}</small>
          </td>
          <td>${money(p.preco)}</td>
          <td>${p.estoque}</td>
          <td>${p.ativo?'Ativo':'Inativo'}</td>
          <td class="actions">
            <button class="btn ghost" onclick='editProduct(${JSON.stringify(p).replaceAll("'","&apos;")})'>Editar</button>
            <button class="btn danger" onclick="deleteProduct('${p.id}')">Excluir</button>
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>`;
}

function editProduct(p){
  const f=document.getElementById('productForm');
  if(!f) return;

  f.id.value=p.id;
  f.nome.value=p.nome||'';
  f.descricao.value=p.descricao||'';
  f.preco.value=p.preco||0;
  f.estoque.value=p.estoque||0;
  f.categoria.value=p.categoria||'';
  f.imagem_url.value=p.imagem_url||'';
  f.ativo.checked=!!p.ativo;

  scrollTo({top:0,behavior:'smooth'});
}

async function deleteProduct(id){
  if(!confirm('Excluir este produto?')) return;

  const {error}=await supabaseClient
    .from('produtos')
    .delete()
    .eq('id',id);

  if(error) return alert(error.message);

  loadAdminProducts();
  loadDashboardStats();
}

function statusBadge(status){
  const s=String(status || '').toLowerCase();

  const labels={
    pendente:'🔴 Pendente',
    aguardando_pagamento:'🟡 Aguardando pagamento',
    pago:'🟢 Pago',
    enviado:'🔵 Enviado',
    entregue:'⚫ Entregue',
    cancelado:'❌ Cancelado'
  };

  return labels[s] || status || 'Sem status';
}

async function loadOrders(){
  const wrap=document.getElementById('orders');
  if(!wrap) return;

  const {data,error}=await supabaseClient
    .from('pedidos')
    .select('*, itens_pedido(*)')
    .order('created_at',{ascending:false});

  if(error){
    wrap.innerHTML='<div class="empty">Erro: '+error.message+'</div>';
    return;
  }

  if(!data.length){
    wrap.innerHTML='<div class="empty">Nenhum pedido ainda.</div>';
    return;
  }

  wrap.innerHTML=data.map(p=>`<div class="panel" style="margin-bottom:14px">
    <h3>Pedido ${p.id.slice(0,8)} - ${money(p.valor_total)}</h3>
    <p class="muted">${p.cliente_nome} • ${p.cliente_telefone||''} • ${p.forma_pagamento||''}</p>
    <p>Status: <strong>${statusBadge(p.status)}</strong></p>
    <p>${p.cliente_endereco||''}</p>
    <ul>
      ${(p.itens_pedido||[]).map(i=>`<li>${i.quantidade}x ${i.produto_nome} - ${money(i.subtotal)}</li>`).join('')}
    </ul>
    <select onchange="updateOrderStatus('${p.id}',this.value)">
      <option value="${p.status}">${p.status}</option>
      <option value="pendente">pendente</option>
      <option value="aguardando_pagamento">aguardando_pagamento</option>
      <option value="pago">pago</option>
      <option value="enviado">enviado</option>
      <option value="entregue">entregue</option>
      <option value="cancelado">cancelado</option>
    </select>
  </div>`).join('');
}

async function updateOrderStatus(id,status){
  const {error}=await supabaseClient
    .from('pedidos')
    .update({status})
    .eq('id',id);

  if(error) alert(error.message);
  else {
    loadOrders();
    loadDashboardStats();
  }
}

document.addEventListener('DOMContentLoaded',async()=>{
  const loginForm=document.getElementById('loginForm');
  if(loginForm) loginForm.addEventListener('submit',login);

  if(document.body.dataset.admin==='true'){
    await requireAdmin();
    loadDashboardStats();
    loadAdminProducts();
    loadOrders();
  }

  const pf=document.getElementById('productForm');
  if(pf) pf.addEventListener('submit',saveProduct);
});
