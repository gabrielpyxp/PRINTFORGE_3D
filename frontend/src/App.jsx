import { useEffect, useMemo, useState, useRef } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Boxes,
  Calculator,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  Package,
  Download,
  Edit3,
  Filter,
  Grid2X2,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Trash2,
  Upload,
  UserRound,
  Store,
  X
} from 'lucide-react';
import { api } from './api';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

const number = new Intl.NumberFormat('pt-BR');

const productImages = [
  'https://images.unsplash.com/photo-1631553124520-3c3f1c0d7f8d?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1592833159155-c62df1b65634?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1612809077245-b9e6e2fc5141?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1623693506262-7b4c7a4d93f1?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=900&q=80'
];

const demoProducts = [
  { id: 'p1', sku: 'PF-DRG-001', nome: 'Dragão articulado', categoria: 'Decoração', filamento_nome: 'PLA Silk', filamento_tipo: 'PLA', peso_g: 184, tempo_impressao_h: 9.5, custo_producao: 19.68, preco_venda: 69.9, estoque: 4, imagem_url: productImages[0], criado_em: '2026-08-18T13:00:00.000Z' },
  { id: 'p2', sku: 'PF-ORG-021', nome: 'Organizador modular', categoria: 'Organização', filamento_nome: 'PETG Preto', filamento_tipo: 'PETG', peso_g: 310, tempo_impressao_h: 12, custo_producao: 27.9, preco_venda: 94.9, estoque: 12, imagem_url: productImages[1], criado_em: '2026-08-15T13:00:00.000Z' }
];
const demoSales = [
  { id: 'v1', produto_id: 'p1', produto_nome: 'Dragão articulado', quantidade: 2, preco_unitario: 69.9, margem_lucro_aplicada: 255.2, data_venda: '2026-08-22T15:43:00.000Z' }
];
const demoSettings = { custo_kwh: 0.98, margem_lucro_padrao: 180, potencia_impressora_w: 220, estoque_baixo_limite: 5 };

const navigation = [
  { id: 'dashboard', label: 'Visão geral', icon: LayoutDashboard },
  { id: 'products', label: 'Produtos', icon: Package },
  { id: 'sales', label: 'Vendas', icon: ShoppingBag },
  { id: 'consignments', label: 'Consignados', icon: Store },
  { id: 'catalog', label: 'Catálogo', icon: Grid2X2 },
  { id: 'calculator', label: 'Precificação', icon: Calculator },
  { id: 'ativos', label: 'Ativos & Insumos', icon: Boxes },
  { id: 'settings', label: 'Configurações', icon: Settings }
];

const emptyProduct = { nome: '', categoria: 'Decoração', filamento_nome: 'PLA', filamento_tipo: 'PLA', peso_g: '', tempo_impressao_h: '', custo_producao: '', preco_venda: '', estoque: '', imagem_url: '' };

function parseBRL(value) {
  if (value === '' || value == null) return 0;
  const s = String(value).trim().replace(/\s/g, '').replace(/R\$/gi, '').replace(/\./g, '').replace(',', '.').replace(/[^0-9.\-]/g, '');
  const parts = s.split('.');
  const normalized = parts.length > 2 ? parts.slice(0, -1).join('') + '.' + parts.slice(-1)[0] : s;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

function money(value) { return currency.format(Number(value || 0)); }
function dateTime(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}
function dateValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}
function productImage(product, index = 0) { return product.imagem_url || product.image_url || ''; }
function productImageFallback(e) { e.target.src = productImages[e.target.dataset.fallbackIndex || 0]; e.target.onerror = null; }
function getItems(response) {
  if (Array.isArray(response)) return response;
  return response?.items || response?.produtos || response?.vendas || response?.data || [];
}
function calculatePrice(input) {
  const peso_g = Number(input.peso_g) || 0;
  const custo_kg = Number(input.custo_kg) || 0;
  const tempo_impressao_h = Number(input.tempo_impressao_h) || 0;
  const potencia_w = Number(input.potencia_w) || 0;
  const custo_kwh = Number(input.custo_kwh) || 0;
  const hora_trabalho = Number(input.hora_trabalho) || 0;
  const horas_manuais = Number(input.horas_manuais) || 0;
  const quantidade = Math.max(1, Number(input.quantidade) || 1);
  const margem_lucro = Number(input.margem_lucro) || 0;
  const risco_falha = Number(input.risco_falha) || 0;

  const custo_filamento = (peso_g / 1000) * custo_kg;
  const custo_energia = tempo_impressao_h * (potencia_w / 1000) * custo_kwh;
  const custo_trabalho = horas_manuais * hora_trabalho;
  const subtotal = custo_filamento + custo_energia + custo_trabalho;
  const custo_falhas = subtotal * (risco_falha / 100);
  const custo_unitario = subtotal + custo_falhas;
  const lucro_unitario = custo_unitario * (margem_lucro / 100);
  const preco_sugerido_unitario = custo_unitario + lucro_unitario;
  const preco_total = preco_sugerido_unitario * quantidade;

  return { custo_filamento, custo_energia, custo_trabalho, subtotal, custo_falhas, custo_unitario, lucro_unitario, preco_sugerido_unitario, preco_sugerido: preco_sugerido_unitario, preco_total, lucro_total: lucro_unitario * quantidade, tempo_total: tempo_impressao_h * quantidade, quantidade, custo_total: custo_unitario, lucro: lucro_unitario, preco_final: preco_sugerido_unitario };
}

function App() {
  const [session, setSession] = useState(() => { try { return JSON.parse(sessionStorage.getItem('printforge-session') || 'null'); } catch { return null; } });
  const [active, setActive] = useState('dashboard');
  const [products, setProducts] = useState(demoProducts);
  const [sales, setSales] = useState(demoSales);
  const [settings, setSettings] = useState(demoSettings);
  const [dashboard, setDashboard] = useState(null);
  const [ativos, setAtivos] = useState([]);
  const [suprimentos, setSuprimentos] = useState([]);
  const [consignados, setConsignados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const demo = !session?.token;
  const token = session?.token;

  const notify = (message, tone = 'success') => { setNotice({ message, tone }); window.setTimeout(() => setNotice(null), 3600); };

  const loadWorkspace = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [dashboardResponse, productsResponse, salesResponse, settingsResponse, ativosResponse, suprimentosResponse, consignadosResponse] = await Promise.all([
        api.dashboard(token),
        api.products({}, token),
        api.sales({}, token),
        api.settings(token),
        api.ativos({}, token).catch(() => ({ items: [] })),
        api.suprimentos({}, token).catch(() => ({ items: [] })),
        api.getConsignados(token).catch(() => [])
      ]);
      setDashboard(dashboardResponse);
      setProducts(getItems(productsResponse));
      setSales(getItems(salesResponse));
      setSettings(settingsResponse || demoSettings);
      setAtivos(getItems(ativosResponse));
      setSuprimentos(getItems(suprimentosResponse));
      setConsignados(getItems(consignadosResponse));
    } catch (error) {
      notify('Não foi possível atualizar os dados agora. Exibindo o último estado disponível.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWorkspace(); }, [token]);
  useEffect(() => { if (active === 'dashboard' && token) loadWorkspace(); }, [active]);

  const login = async (credentials) => {
    const result = await api.login(credentials);
    const nextSession = { token: result.token || result.accessToken, user: result.user || { nome: 'Administrador', email: credentials.email, papel: 'admin' } };
    sessionStorage.setItem('printforge-session', JSON.stringify(nextSession));
    setSession(nextSession);
  };
  const enterDemo = () => {
    const nextSession = { user: { nome: 'Studio PrintForge', email: 'demo@printforge.local', papel: 'admin' } };
    sessionStorage.setItem('printforge-session', JSON.stringify(nextSession));
    setSession(nextSession);
    notify('Modo demonstração ativado. As alterações ficam apenas neste navegador.', 'warning');
  };
  const logout = () => { sessionStorage.removeItem('printforge-session'); setSession(null); setActive('dashboard'); };

  const createProduct = async (form) => {
    const payload = { ...form, peso_g: Number(String(form.peso_g).replace(',', '.')) || 0, tempo_impressao_h: Number(String(form.tempo_impressao_h).replace(',', '.')) || 0, custo_producao: parseBRL(form.custo_producao), preco_venda: parseBRL(form.preco_venda), estoque: Number(form.estoque) || 0 };
    if (demo) { setProducts((c) => [{ ...payload, id: 'p-' + Date.now(), criado_em: new Date().toISOString() }, ...c]); notify('Produto cadastrado (demo).'); return; }
    try { const created = await api.createProduct(payload, token); setProducts((c) => [created, ...c]); notify('Produto cadastrado.'); } catch (e) { notify(e.message, 'error'); throw e; }
  };
  const updateProduct = async (id, form) => {
    const payload = { ...form, peso_g: Number(String(form.peso_g).replace(',', '.')) || 0, tempo_impressao_h: Number(String(form.tempo_impressao_h).replace(',', '.')) || 0, custo_producao: parseBRL(form.custo_producao), preco_venda: parseBRL(form.preco_venda), estoque: Number(form.estoque) || 0 };
    if (demo) { setProducts((c) => c.map((i) => i.id === id ? { ...i, ...payload } : i)); notify('Produto atualizado (demo).'); return; }
    try { const updated = await api.updateProduct(id, payload, token); setProducts((c) => c.map((i) => i.id === id ? updated : i)); notify('Produto atualizado.'); } catch (e) { notify(e.message, 'error'); throw e; }
  };
  const removeProduct = async (product) => {
    if (!window.confirm(`Excluir "${product.nome}"?`)) return;
    if (demo || String(product.id).startsWith('p-')) { setProducts((c) => c.filter((i) => i.id !== product.id)); notify('Produto removido (demo).'); return; }
    await api.deleteProduct(product.id, token); setProducts((c) => c.filter((i) => i.id !== product.id)); notify('Produto excluído.');
  };

  const createSale = async (form) => {
    const chosen = products.find((item) => item.id === form.produto_id);
    const payload = { ...form, quantidade: Number(String(form.quantidade).replace(',', '.')) || 0, preco_unitario: parseBRL(form.preco_unitario), data_venda: form.data_venda ? new Date(form.data_venda + 'T12:00:00').toISOString() : new Date().toISOString() };
    if (demo) {
      setSales((c) => [{ ...payload, id: 'v-' + Date.now(), produto_nome: chosen?.nome || form.nome_produto }, ...c]);
      if (chosen) setProducts((c) => c.map((i) => i.id === chosen.id ? { ...i, estoque: Math.max(0, Number(i.estoque) - payload.quantidade) } : i));
      notify('Venda registrada (demo).'); return;
    }
    try { const created = await api.createSale(payload, token); setSales((c) => [created, ...c]); await loadWorkspace(); notify('Venda registrada.'); } catch (e) { notify(e.message, 'error'); throw e; }
  };
  const removeSale = async (sale) => {
    if (!window.confirm('Excluir esta venda? O estoque será restaurado.')) return;
    if (demo || String(sale.id).startsWith('v-')) { setSales((c) => c.filter((i) => i.id !== sale.id)); notify('Venda removida (demo).'); return; }
    try { await api.deleteSale(sale.id, token); setSales((c) => c.filter((v) => v.id !== sale.id)); await loadWorkspace(); notify('Venda excluída.'); } catch (e) { notify(e.message, 'error'); }
  };

  const saveSettings = async (nextSettings) => {
    const payload = { custo_kwh: Number(nextSettings.custo_kwh), margem_lucro_padrao: Number(nextSettings.margem_lucro_padrao), potencia_impressora_w: Number(nextSettings.potencia_impressora_w), estoque_baixo_limite: Number(nextSettings.estoque_baixo_limite || 5) };
    if (demo) { setSettings(payload); notify('Configurações salvas (demo).'); return; }
    const saved = await api.saveSettings(payload, token); setSettings(saved); notify('Configurações atualizadas.');
  };
  const saveCalculation = async (payload) => { if (demo) return; await api.saveCalculation(payload, token); notify('Cálculo salvo.'); };

  const createAtivo = async (form) => { if (demo) return; await api.createAtivo({ ...form, valorPago: Number(form.valorPago) }, token); loadWorkspace(); notify('Ativo cadastrado.'); };
  const updateAtivo = async (id, form) => { if (demo) return; await api.updateAtivo(id, { ...form, valorPago: Number(form.valorPago) }, token); loadWorkspace(); };
  const deleteAtivo = async (ativo) => { if (demo || !window.confirm(`Excluir "${ativo.nome}"?`)) return; await api.deleteAtivo(ativo.id, token); loadWorkspace(); };
  
  const createSuprimento = async (form) => { if (demo) return; await api.createSuprimento({ ...form, pesoTotalG: Number(form.pesoTotalG), valorPago: Number(form.valorPago) }, token); loadWorkspace(); notify('Suprimento cadastrado.'); };
  const updateSuprimento = async (id, form) => { if (demo) return; await api.updateSuprimento(id, form, token); loadWorkspace(); };
  const deleteSuprimento = async (sup) => { if (demo || !window.confirm(`Excluir "${sup.nome}"?`)) return; await api.deleteSuprimento(sup.id, token); loadWorkspace(); };

  // Funções de Consignados
  const createParceiro = async (form) => {
    if (demo) { notify('Loja cadastrada (demo).'); return; }
    try { await api.createParceiro(form, token); await loadWorkspace(); notify('Loja parceira cadastrada!'); } 
    catch (e) { notify(e.message, 'error'); }
  };
  const createLote = async (form) => {
    if (demo) { notify('Lote registrado (demo).'); return; }
    try { await api.createLote(form, token); await loadWorkspace(); notify('Lote registrado com sucesso!'); } 
    catch (e) { notify(e.message, 'error'); }
  };
  const fecharAcerto = async (id, form) => {
    if (demo) { notify('Acerto realizado (demo).'); return; }
    try { await api.fecharAcerto(id, form, token); await loadWorkspace(); notify('Acerto finalizado e vendas computadas!'); } 
    catch (e) { notify(e.message, 'error'); }
  };

  if (!session) return <LoginScreen onLogin={login} onDemo={enterDemo} />;

  const pageProps = {
    products, sales, settings, dashboard, ativos, suprimentos, consignados, loading,
    onCreateProduct: createProduct, onUpdateProduct: updateProduct, onDeleteProduct: removeProduct,
    onCreateSale: createSale, onDeleteSale: removeSale, onSaveSettings: saveSettings, onSaveCalculation: saveCalculation,
    onCreateAtivo: createAtivo, onUpdateAtivo: updateAtivo, onDeleteAtivo: deleteAtivo,
    onCreateSuprimento: createSuprimento, onUpdateSuprimento: updateSuprimento, onDeleteSuprimento: deleteSuprimento,
    onCreateParceiro: createParceiro, onCreateLote: createLote, onFecharAcerto: fecharAcerto,
    demo, notify
  };

  return (
    <div className="app-shell">
      <Sidebar active={active} onNavigate={(view) => { setActive(view); setMobileOpen(false); }} open={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={logout} />
      {mobileOpen && <button className="mobile-backdrop" onClick={() => setMobileOpen(false)} aria-label="Fechar menu" />}
      <main className="main-content">
        <Topbar active={active} user={session.user} demo={demo} loading={loading} onMenu={() => setMobileOpen(true)} onRefresh={loadWorkspace} onLogout={logout} />
        <div className="page-content">
          {demo && (
            <div className="demo-banner">
              <Sparkles size={16} /><span>Você está explorando dados de demonstração. Configure a API para salvar alterações de verdade.</span>
            </div>
          )}
          {active === 'dashboard' && <Dashboard {...pageProps} onNavigate={setActive} />}
          {active === 'products' && <Products {...pageProps} />}
          {active === 'sales' && <Sales {...pageProps} />}
          {active === 'consignments' && <Consignments {...pageProps} />}
          {active === 'catalog' && <Catalog {...pageProps} onNavigate={setActive} />}
          {active === 'calculator' && <CalculatorView {...pageProps} />}
          {active === 'ativos' && <AtivosView {...pageProps} />}
          {active === 'settings' && <SettingsView {...pageProps} />}
        </div>
      </main>
      {notice && <Toast tone={notice.tone} message={notice.message} />}
    </div>
  );
}

function LoginScreen({ onLogin, onDemo }) { /* ... código mantido ... */ return ( <div className="auth-page"> <div className="auth-glow auth-glow-one" /> <div className="auth-glow auth-glow-two" /> <section className="auth-brand"> <Brand large /> <div className="auth-copy"> <span className="eyebrow">GESTÃO INTELIGENTE PARA MAKERS</span> <h1>De cada camada, um negócio mais forte.</h1> <p>Centralize pedidos, custos e estoque em um painel feito para quem transforma ideias em peças.</p> </div> <div className="auth-features"> <Feature icon={Calculator} title="Precificação precisa" text="Custos, energia e margem em um cálculo vivo." /> <Feature icon={Boxes} title="Estoque sob controle" text="Saiba o que produzir antes que falte." /> <Feature icon={TrendingUp} title="Decisões com clareza" text="Acompanhe vendas e lucro sem planilhas." /> </div> </section> <section className="login-panel"> <form className="login-card" onSubmit={async (e) => { e.preventDefault(); try { await onLogin({ email: e.target.elements[0].value, senha: e.target.elements[1].value }); } catch {} }}> <div className="login-heading"> <span className="login-symbol"><Printer size={24} /></span> <div> <h2>Bem-vindo de volta</h2> <p>Acesse o painel da sua operação.</p> </div> </div> <label className="field"> <span>E-mail</span> <input type="email" placeholder="voce@sualoja.com" required /> </label> <label className="field"> <span>Senha</span> <input type="password" placeholder="Sua senha" required /> </label> <button className="button button-primary button-full"> Entrar no painel <ArrowUpRight size={17} /> </button> <div className="login-divider"><span>ou</span></div> <button className="button button-secondary button-full" type="button" onClick={onDemo}> <Sparkles size={16} /> Explorar demonstração </button> </form> </section> </div> ); }
function Feature({ icon: Icon, title, text }) { return <div className="auth-feature"><span><Icon size={19} /></span><div><strong>{title}</strong><small>{text}</small></div></div>; }
function Brand({ large = false }) { return <div className={'brand ' + (large ? 'brand-large' : '')}><span className="brand-mark"><span /><span /><span /></span><span>PRINT<span>FORGE</span></span></div>; }
function Sidebar({ active, onNavigate, open, onClose, onLogout }) { return <aside className={'sidebar ' + (open ? 'sidebar-open' : '')}><div className="sidebar-head"><Brand /><button className="icon-button sidebar-close" onClick={onClose}><X size={20} /></button></div><nav className="nav-list"><span className="nav-caption">OPERAÇÃO</span>{navigation.slice(0, 4).map((item) => <NavItem key={item.id} {...item} active={active} onNavigate={onNavigate} />)}<span className="nav-caption nav-caption-spaced">FERRAMENTAS</span>{navigation.slice(4).map((item) => <NavItem key={item.id} {...item} active={active} onNavigate={onNavigate} />)}</nav><div className="sidebar-bottom"><div className="plan-card"><span className="plan-icon"><Sparkles size={15} /></span><div><strong>PrintForge Pro</strong><small>Seu negócio em movimento</small></div></div><button className="logout-button" onClick={onLogout}><LogOut size={18} /> Sair da conta</button></div></aside>; }
function NavItem({ id, label, icon: Icon, active, onNavigate }) { return <button className={'nav-item ' + (active === id ? 'nav-active' : '')} onClick={() => onNavigate(id)}><Icon size={19} /><span>{label}</span>{id === 'sales' && <span className="nav-dot" />}</button>; }
function Topbar({ active, user, demo, loading, onMenu, onRefresh, onLogout }) { const page = navigation.find((item) => item.id === active); return <header className="topbar"><button className="icon-button menu-button" onClick={onMenu}><Menu size={22} /></button><div className="topbar-title"><span className="breadcrumb">PrintForge <span>/</span></span><h2>{page?.label}</h2></div><div className="topbar-actions"><button className="icon-button refresh-button" onClick={onRefresh}><RefreshCw size={18} className={loading ? 'spin' : ''} /></button><div className="dropdown-wrapper"><button className="icon-button user-menu"><div className="avatar">{(user?.nome || 'A').slice(0, 1).toUpperCase()}</div><div className="user-label"><strong>{user?.nome || 'Administrador'}</strong><small>{demo ? 'Demonstração' : 'Admin'}</small></div></button></div></div></header>; }
function Dashboard({ products, sales, settings, dashboard, onNavigate }) { return <section className="page dashboard-page"><div className="page-heading"><div><span className="eyebrow">VISÃO GERAL</span><h1>Bom dia, maker <span>✦</span></h1></div><button className="button button-primary" onClick={() => onNavigate('sales')}><Plus size={17} /> Registrar venda</button></div><EmptyState icon={LayoutDashboard} title="Dashboard" text="Resumo da sua operação." /></section>; }
function Products() { return <section className="page"><EmptyState icon={Package} title="Produtos" text="Carregando produtos..." /></section>; }
function Sales() { return <section className="page"><EmptyState icon={ShoppingBag} title="Vendas" text="Carregando vendas..." /></section>; }
function Catalog() { return <section className="page"><EmptyState icon={Grid2X2} title="Catálogo" text="Carregando catálogo..." /></section>; }
function CalculatorView() { return <section className="page"><EmptyState icon={Calculator} title="Calculadora" text="Carregando calculadora..." /></section>; }
function AtivosView() { return <section className="page"><EmptyState icon={Boxes} title="Ativos" text="Carregando ativos..." /></section>; }
function SettingsView() { return <section className="page"><EmptyState icon={Settings} title="Configurações" text="Carregando configurações..." /></section>; }
function Modal({ title, subtitle, children, onClose }) { return <div className="modal-layer"><button className="modal-backdrop" onClick={onClose} /><div className="modal-card"><div className="modal-head"><div><h2>{title}</h2><p>{subtitle}</p></div><button className="icon-button" onClick={onClose}><X size={20} /></button></div>{children}</div></div>; }
function EmptyState({ icon: Icon, title, text, compact = false }) { return <div className={'empty-state ' + (compact ? 'empty-compact' : '')}><span><Icon size={compact ? 19 : 26} /></span><div><strong>{title}</strong><p>{text}</p></div></div>; }
function Toast({ tone, message }) { return <div className={'toast toast-' + tone}><span>{tone === 'error' ? <X size={18} /> : <Check size={18} />}</span>{message}</div>; }
function StatusPill({ stock, limit }) { if (stock <= 0) return <span className="status-pill status-out"><i />Esgotado</span>; if (stock <= limit) return <span className="status-pill status-low"><i />Estoque baixo</span>; return <span className="status-pill status-ok"><i />Disponível</span>; }

// --- TELA DE CONSIGNADOS FINAL COM CORREÇÃO DE FORMULÁRIO ---
function Consignments({ consignados, products, onCreateParceiro, onCreateLote, onFecharAcerto, notify }) {
  const [modalLoja, setModalLoja] = useState(false);
  const [modalLote, setModalLote] = useState(null); 
  const [modalAcerto, setModalAcerto] = useState(null); 

  const [formLoja, setFormLoja] = useState({ nome: '', telefone: '', comissao_padrao: 30, frequencia_acerto: 'Mensal' });
  const [formLote, setFormLote] = useState({ tipo_negociacao: 'Consignacao', descricao: '', quantidade_enviada: 1, preco_unitario: '', comissao_aplicada_perc: 30 });
  const [formAcerto, setFormAcerto] = useState({ quantidade_vendida: 0 });

  const handleCreateLoja = (e) => {
    e.preventDefault(); // Impede recarregamento da página
    
    if (!onCreateParceiro) {
      alert("Aviso: Função de criar parceiro não conectada.");
      return;
    }
    onCreateParceiro(formLoja);
    setModalLoja(false);
    setFormLoja({ nome: '', telefone: '', comissao_padrao: 30, frequencia_acerto: 'Mensal' });
  };

  const handleCreateLote = (e) => {
    e.preventDefault();
    if (!onCreateLote) return;
    onCreateLote({ ...formLote, parceiro_id: modalLote });
    setModalLote(null);
    setFormLote({ tipo_negociacao: 'Consignacao', descricao: '', quantidade_enviada: 1, preco_unitario: '', comissao_aplicada_perc: 30 });
  };

  const handleAcerto = (e) => {
    e.preventDefault();
    if (!onFecharAcerto) return;
    onFecharAcerto(modalAcerto.id, formAcerto);
    setModalAcerto(null);
  };

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">B2B E PONTOS DE VENDA</span>
          <h1>Consignados & Atacado</h1>
          <p>Gerencie seus expositores, acertos financeiros e vendas diretas para lojistas.</p>
        </div>
        <button className="button button-primary" onClick={() => setModalLoja(true)}><Plus size={17} /> Nova Loja Parceira</button>
      </div>

      <div className="table-card">
        <div className="data-table">
          <div className="table-row table-head">
            <span>Loja Parceira</span>
            <span>Tipo de Acerto</span>
            <span>Estoque na Loja</span>
            <span>Lucro Líquido Estimado</span>
            <span>Cargas / Lotes</span>
            <span />
          </div>
          
          {!consignados?.length && <EmptyState compact icon={Store} title="Nenhuma loja parceira" text="Cadastre a primeira papelaria ou loja para enviar seus chaveiros." />}
          
          {consignados?.map((p) => {
            const lotesAtivos = p.lotes?.filter(l => l.status === 'Ativo') || [];
            const pecasNaRua = lotesAtivos.reduce((sum, l) => sum + (l.quantidade_enviada - l.quantidade_vendida), 0);
            
            const valorLiquido = lotesAtivos.reduce((sum, l) => {
              const pecasRestantes = l.quantidade_enviada - l.quantidade_vendida;
              const fatorComissao = 1 - (l.comissao_aplicada_perc / 100);
              return sum + (pecasRestantes * l.preco_unitario * fatorComissao);
            }, 0);

            return (
              <div className="table-row" key={p.parceiro_id}>
                <div><strong>{p.loja}</strong><small>{p.telefone || 'Sem telefone'} • {p.comissao_padrao}% base</small></div>
                <span>{p.frequencia_acerto}</span>
                <span>{pecasNaRua} un. em {lotesAtivos.length} {lotesAtivos.length === 1 ? 'expositor' : 'expositores'}</span>
                <strong>{money(valorLiquido)}</strong>
                <div className="row-actions" style={{ justifyContent: 'flex-start' }}>
                  <button className="button button-ghost" style={{ padding: '4px 10px', height: 'auto' }} onClick={() => {
                    setFormLote(prev => ({ ...prev, comissao_aplicada_perc: p.comissao_padrao }));
                    setModalLote(p.parceiro_id);
                  }}>
                    <Plus size={14} /> Enviar Carga
                  </button>
                </div>
                <div className="row-actions">
                  {lotesAtivos.length > 0 && (
                    <button className="button button-primary" style={{ padding: '4px 10px', height: 'auto' }} onClick={() => setModalAcerto(lotesAtivos[0])}>
                      <Check size={14} /> Fazer Acerto
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {modalLoja && (
        <Modal title="Nova Loja Parceira" subtitle="Cadastre o ponto de venda (Ex: Papelaria Master)." onClose={() => setModalLoja(false)}>
          <form className="modal-form" onSubmit={handleCreateLoja}>
            <div className="form-grid">
              <label className="field field-wide"><span>Nome da Loja</span><input value={formLoja.nome} onChange={e => setFormLoja({...formLoja, nome: e.target.value})} required /></label>
              <label className="field"><span>Comissão Padrão da Loja (%)</span><input type="number" min="0" max="100" value={formLoja.comissao_padrao} onChange={e => setFormLoja({...formLoja, comissao_padrao: e.target.value})} required /></label>
              <label className="field"><span>Acertos</span><select value={formLoja.frequencia_acerto} onChange={e => setFormLoja({...formLoja, frequencia_acerto: e.target.value})}><option>Semanal</option><option>Quinzenal</option><option>Mensal</option></select></label>
            </div>
            {/* O type="submit" garante que ao pressionar Enter ou clicar, o formulário seja disparado */}
            <div className="modal-actions"><button type="button" className="button button-ghost" onClick={() => setModalLoja(false)}>Cancelar</button><button type="submit" className="button button-primary">Cadastrar Loja</button></div>
          </form>
        </Modal>
      )}

      {modalLote && (
        <Modal title="Nova Carga de Produtos" subtitle="Envie um expositor consignado ou faça uma venda B2B direta." onClose={() => setModalLote(null)}>
          <form className="modal-form" onSubmit={handleCreateLote}>
            <div className="form-grid">
              <label className="field field-wide"><span>Modalidade do Negócio</span>
                <select value={formLote.tipo_negociacao} onChange={e => setFormLote({...formLote, tipo_negociacao: e.target.value, comissao_aplicada_perc: e.target.value === 'Venda Direta' ? 0 : formLote.comissao_aplicada_perc})}>
                  <option value="Consignacao">Expositor Consignado (Acerto futuro)</option>
                  <option value="Venda Direta">Venda Direta / Atacado (Recebe na hora)</option>
                </select>
              </label>
              <label className="field field-wide"><span>Descrição do Lote / Mix</span><input placeholder="Ex: 10 Chaveiros Bike, 15 Letras" value={formLote.descricao} onChange={e => setFormLote({...formLote, descricao: e.target.value})} required /></label>
              <label className="field"><span>Qtd de Peças</span><input type="number" min="1" value={formLote.quantidade_enviada} onChange={e => setFormLote({...formLote, quantidade_enviada: e.target.value})} required /></label>
              <label className="field"><span>Preço Unitário (Final na loja)</span><div className="input-unit money-unit"><b>R$</b><input type="number" step="0.01" value={formLote.preco_unitario} onChange={e => setFormLote({...formLote, preco_unitario: e.target.value})} required /></div></label>
              {formLote.tipo_negociacao === 'Consignacao' && (
                <label className="field field-wide"><span>Comissão desta carga (%)</span><input type="number" min="0" max="100" value={formLote.comissao_aplicada_perc} onChange={e => setFormLote({...formLote, comissao_aplicada_perc: e.target.value})} required /></label>
              )}
            </div>
            <div className="sale-total" style={{ marginTop: '16px', background: 'var(--bg-card)' }}>
              {formLote.tipo_negociacao === 'Consignacao' ? (
                <>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:'13px', color:'var(--text-dim)'}}><span>Valor bruto na vitrine:</span><span>{money(formLote.quantidade_enviada * formLote.preco_unitario)}</span></div>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:'13px', color:'var(--text-dim)', marginBottom:'8px'}}><span>Fatia da loja ({formLote.comissao_aplicada_perc}%):</span><span>{money((formLote.quantidade_enviada * formLote.preco_unitario) * (formLote.comissao_aplicada_perc/100))}</span></div>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:'15px'}}><span>SEU LÍQUIDO ESTIMADO:</span><strong style={{color:'var(--accent)'}}>{money((formLote.quantidade_enviada * formLote.preco_unitario) * (1 - (formLote.comissao_aplicada_perc/100)))}</strong></div>
                </>
              ) : (
                <div style={{display:'flex', justifyContent:'space-between', fontSize:'15px'}}><span>VALOR TOTAL A RECEBER:</span><strong style={{color:'var(--accent)'}}>{money(formLote.quantidade_enviada * formLote.preco_unitario)}</strong></div>
              )}
            </div>
            <div className="modal-actions"><button type="button" className="button button-ghost" onClick={() => setModalLote(null)}>Cancelar</button><button type="submit" className="button button-primary">Registrar Carga</button></div>
          </form>
        </Modal>
      )}

      {modalAcerto && (
        <Modal title="Acerto de Consignação" subtitle={`Lote: ${modalAcerto.descricao}`} onClose={() => setModalAcerto(null)}>
          <form className="modal-form" onSubmit={handleAcerto}>
            <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--bg-base)', borderRadius: '6px', fontSize: '14px' }}>
              Foram enviadas <strong>{modalAcerto.quantidade_enviada} unidades</strong> a {money(modalAcerto.preco_unitario)} cada.<br/>
              A comissão da loja é de <strong>{modalAcerto.comissao_aplicada_perc}%</strong>.
            </div>
            <div className="form-grid">
              <label className="field field-wide"><span>Quantas peças a loja vendeu?</span><input type="number" min="0" max={modalAcerto.quantidade_enviada} value={formAcerto.quantidade_vendida} onChange={e => setFormAcerto({quantidade_vendida: e.target.value})} required /></label>
            </div>
            <div className="sale-total" style={{ marginTop: '16px', background: 'var(--bg-card)' }}>
               <div style={{display:'flex', justifyContent:'space-between', fontSize:'13px', color:'var(--text-dim)', marginBottom:'8px'}}><span>Peças devolvidas para você:</span><span>{modalAcerto.quantidade_enviada - formAcerto.quantidade_vendida} un.</span></div>
               <div style={{display:'flex', justifyContent:'space-between', fontSize:'15px'}}><span>VOCÊ RECEBE HOJE:</span><strong style={{color:'var(--accent)'}}>{money((formAcerto.quantidade_vendida * modalAcerto.preco_unitario) * (1 - (modalAcerto.comissao_aplicada_perc/100)))}</strong></div>
            </div>
            <div className="modal-actions"><button type="button" className="button button-ghost" onClick={() => setModalAcerto(null)}>Cancelar</button><button type="submit" className="button button-primary">Confirmar e Fechar Lote <Check size={16}/></button></div>
          </form>
        </Modal>
      )}
    </section>
  );
}

export default App;