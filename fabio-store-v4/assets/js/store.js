const money = v => Number(v || 0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const cartKey = 'fabio_store_cart';
let allProducts = [];
let activeCategory = '';

function escapeHtml(value){
  return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function getCart(){ return JSON.parse(localStorage.getItem(cartKey) || '[]'); }
function saveCart(cart){ localStorage.setItem(cartKey, JSON.stringify(cart)); updateCartCount(); }
function updateCartCount(){ document.querySelectorAll('[data-cart-count]').forEach(el => el.textContent = getCart().reduce((s,i)=>s+i.quantidade,0)); }

function addToCart(prod){
  const cart=getCart();
  const found=cart.find(i=>i.id===prod.id);
  if(found){
    if(found.quantidade >= Number(prod.estoque || 0)) return alert('Quantidade maior que o estoque disponível.');
    found.quantidade++;
  } else {
    cart.push({...prod,quantidade:1});
  }
  saveCart(cart);
  alert('Produto adicionado ao carrinho.');
}

async function loadProducts(){
  const wrap=document.getElementById('products');
  if(!wrap) return;
  wrap.innerHTML='<div class="empty">Carregando produtos...</div>';

  const { data, error } = await supabaseClient
    .from('produtos')
    .select('*')
    .eq('ativo', true)
    .order('created_at', { ascending: false });

  if(error){
    wrap.innerHTML='<div class="empty">Erro ao carregar produtos: '+escapeHtml(error.message)+'</div>';
    return;
  }

  allProducts = data || [];
  renderCategories();
  renderProducts();
}

function renderCategories(){
  const el=document.getElementById('categoryChips');
  if(!el) return;
  const categories=[...new Set(allProducts.map(p=>p.categoria).filter(Boolean))].sort();
  el.innerHTML = `<button class="chip ${!activeCategory?'active':''}" data-category="">Todos</button>` +
    categories.map(cat => `<button class="chip ${activeCategory===cat?'active':''}" data-category="${escapeHtml(cat)}">${escapeHtml(cat)}</button>`).join('');
  el.querySelectorAll('.chip').forEach(btn => btn.addEventListener('click', () => {
    activeCategory = btn.dataset.category || '';
    renderCategories();
    renderProducts();
  }));
}

function getFilteredProducts(){
  const q=(document.getElementById('searchInput')?.value || '').toLowerCase().trim();
  const sort=document.getElementById('sortSelect')?.value || 'recentes';
  let list=[...allProducts];

  if(activeCategory) list=list.filter(p => p.categoria === activeCategory);
  if(q){
    list=list.filter(p => [p.nome,p.descricao,p.categoria].some(v => String(v || '').toLowerCase().includes(q)));
  }

  if(sort === 'menor-preco') list.sort((a,b)=>Number(a.preco)-Number(b.preco));
  if(sort === 'maior-preco') list.sort((a,b)=>Number(b.preco)-Number(a.preco));
  if(sort === 'estoque') list.sort((a,b)=>Number(b.estoque)-Number(a.estoque));
  return list;
}

function renderProducts(){
  const wrap=document.getElementById('products');
  if(!wrap) return;
  const list=getFilteredProducts();

  if(!allProducts.length){
    wrap.innerHTML='<div class="empty">Nenhum produto cadastrado ainda. Cadastre no painel admin.</div>';
    return;
  }

  if(!list.length){
    wrap.innerHTML='<div class="empty">Nenhum produto encontrado com esse filtro.</div>';
    return;
  }

  wrap.innerHTML=list.map(p=>{
    const payload = JSON.stringify({
      id:p.id,
      nome:p.nome,
      preco:p.preco,
      imagem_url:p.imagem_url,
      estoque:p.estoque
    }).replaceAll("'","&apos;");

    return `<article class="card product-card">
      <div class="product-img">${p.imagem_url?`<img src="${escapeHtml(p.imagem_url)}" alt="${escapeHtml(p.nome)}">`:'<span class="muted">Sem imagem</span>'}</div>
      <div class="card-body">
        <div class="card-top">
          <span class="badge">${escapeHtml(p.categoria||'Produto')}</span>
          ${Number(p.estoque)<1?'<span class="stock out">Sem estoque</span>':'<span class="stock">Em estoque</span>'}
        </div>
        <h3>${escapeHtml(p.nome)}</h3>
        <p class="muted line-clamp">${escapeHtml(p.descricao||'')}</p>
        <div class="price">${money(p.preco)}</div>
        <p class="muted">Estoque: ${Number(p.estoque || 0)}</p>
        <button class="btn full" ${Number(p.estoque)<1?'disabled':''} onclick='addToCart(${payload})'>${Number(p.estoque)<1?'Indisponível':'Adicionar ao carrinho'}</button>
      </div>
    </article>`;
  }).join('');
}

function renderCart(){
  const wrap=document.getElementById('cartItems');
  if(!wrap) return;

  const cart=getCart();

  if(!cart.length){
    wrap.innerHTML='<div class="empty">Seu carrinho está vazio.</div>';
    document.getElementById('cartTotal').textContent=money(0);
    return;
  }

  let total=0;
  wrap.innerHTML=cart.map((i,idx)=>{
    total+=Number(i.preco)*Number(i.quantidade);
    return `<div class="panel cart-item">
      <strong>${escapeHtml(i.nome)}</strong>
      <p class="muted">${money(i.preco)} x ${i.quantidade}</p>
      <div class="actions">
        <button class="btn ghost" onclick="changeQty(${idx},-1)">-</button>
        <button class="btn ghost" onclick="changeQty(${idx},1)">+</button>
        <button class="btn danger" onclick="removeItem(${idx})">Remover</button>
      </div>
    </div>`;
  }).join('');

  document.getElementById('cartTotal').textContent=money(total);
}

function changeQty(idx,delta){
  const cart=getCart();
  cart[idx].quantidade+=delta;
  if(cart[idx].quantidade<1) cart.splice(idx,1);
  saveCart(cart);
  renderCart();
}

function removeItem(idx){
  const cart=getCart();
  cart.splice(idx,1);
  saveCart(cart);
  renderCart();
}

async function baixarEstoque(cart){
  for (const item of cart) {
    const { data: produto, error: produtoError } = await supabaseClient
      .from('produtos')
      .select('estoque')
      .eq('id', item.id)
      .single();

    if (produtoError || !produto) {
      console.warn('Não foi possível buscar estoque do produto:', item.id, produtoError);
      continue;
    }

    const novoEstoque = Math.max(
      0,
      Number(produto.estoque || 0) - Number(item.quantidade || 0)
    );

    const { error: updateError } = await supabaseClient
      .from('produtos')
      .update({
        estoque: novoEstoque,
        ativo: novoEstoque > 0
      })
      .eq('id', item.id);

    if (updateError) {
      console.warn('Não foi possível baixar estoque do produto:', item.id, updateError);
    }
  }
}

async function checkout(e){
  e.preventDefault();

  const button = e.target.querySelector('button[type=submit], button:not([type])');
  const cart=getCart();

  if(!cart.length) return alert('Carrinho vazio.');

  if(button){
    button.disabled = true;
    button.textContent = 'Gerando pagamento...';
  }

  try{
    const fd=new FormData(e.target);
    const total=cart.reduce((s,i)=>s+Number(i.preco)*Number(i.quantidade),0);

    const pedido={
      cliente_nome:fd.get('nome'),
      cliente_email:fd.get('email'),
      cliente_telefone:fd.get('telefone'),
      cliente_endereco:fd.get('endereco'),
      forma_pagamento:'Mercado Pago',
      valor_total:total,
      status:'aguardando_pagamento'
    };

    const {data,error}=await supabaseClient
      .from('pedidos')
      .insert(pedido)
      .select()
      .single();

    if(error) throw new Error('Erro ao criar pedido: '+error.message);

    const itens=cart.map(i=>({
      pedido_id:data.id,
      produto_id:i.id,
      produto_nome:i.nome,
      quantidade:i.quantidade,
      preco_unitario:i.preco,
      subtotal:Number(i.preco)*Number(i.quantidade)
    }));

    const res=await supabaseClient
      .from('itens_pedido')
      .insert(itens);

    if(res.error) throw new Error('Pedido criado, mas erro nos itens: '+res.error.message);

    await baixarEstoque(cart);

    const prefRes = await fetch('/.netlify/functions/create-preference', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        pedidoId: data.id,
        cliente: {
          nome: fd.get('nome'),
          email: fd.get('email'),
          telefone: fd.get('telefone')
        },
        itens: cart.map(i => ({
          id: i.id,
          nome: i.nome,
          quantidade: i.quantidade,
          preco: Number(i.preco)
        }))
      })
    });

    const pref = await prefRes.json();

    if(!prefRes.ok) {
      throw new Error(pref.error || 'Erro ao criar pagamento no Mercado Pago.');
    }

    localStorage.removeItem(cartKey);
    updateCartCount();

    window.location.href = pref.init_point || pref.sandbox_init_point;
  }catch(err){
    alert(err.message || 'Erro ao finalizar pedido.');

    if(button){
      button.disabled = false;
      button.textContent = 'Pagar com Pix ou Cartão';
    }
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  updateCartCount();
  loadProducts();
  renderCart();

  document.getElementById('searchInput')?.addEventListener('input', renderProducts);
  document.getElementById('sortSelect')?.addEventListener('change', renderProducts);

  const f=document.getElementById('checkoutForm');
  if(f) f.addEventListener('submit',checkout);
});
