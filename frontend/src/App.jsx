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

// Arrays de demonstração zerados para forçar o uso do banco de dados real
const productImages = [];
const demoProducts = [];
const demoSales = [];

const demoSettings = {
  custo_kwh: 0.98,
  margem_lucro_padrao: 180,
  potencia_impressora_w: 220,
  estoque_baixo_limite: 5
};

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

const emptyProduct = {
  nome: '',
  categoria: 'Decoração',
  filamento_nome: 'PLA',
  filamento_tipo: 'PLA',
  peso_g: '',
  tempo_impressao_h: '',
  custo_producao: '',
  preco_venda: '',
  estoque: '',
  imagem_url: ''
};

function parseBRL(value) {
  if (value === '' || value == null) return 0;
  const s = String(value).trim().replace(/\s/g, '').replace(/R\$/gi, '').replace(/\./g, '').replace(',', '.').replace(/[^0-9.\-]/g, '');
  const parts = s.split('.');
  const normalized = parts.length > 2 ? parts.slice(0, -1).join('') + '.' + parts.slice(-1)[0] : s;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

function money(value) {
  return currency.format(Number(value || 0));
}

function dateTime(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function dateValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

// Configuração do Placeholder "3D"
const placeholder3D = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%2327272a" width="100" height="100"/%3E%3Ctext fill="%2371717a" font-family="sans-serif" font-size="24" font-weight="bold" x="50" y="58" text-anchor="middle"%3E3D%3C/text%3E%3C/svg%3E';

function productImage(product, index = 0) {
  const url = product?.imagem_url || product?.image_url;
  return url ? url : placeholder3D;
}

function productImageFallback(e) {
  e.target.onerror = null;
  e.target.src = placeholder3D;
}

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
  const lucro_total = lucro_unitario * quantidade;
  const tempo_total = tempo_impressao_h * quantidade;

  return {
    custo_filamento,
    custo_energia,
    custo_trabalho,
    subtotal,
    custo_falhas,
    custo_unitario,
    lucro_unitario,
    preco_sugerido_unitario,
    preco_sugerido: preco_sugerido_unitario,
    preco_total,
    lucro_total,
    tempo_total,
    quantidade,
    custo_total: custo_unitario,
    lucro: lucro_unitario,
    preco_final: preco_sugerido_unitario,
    custo_filamento_unit: custo_filamento,
    custo_energia_unit: custo_energia,
    custo_trabalho_unit: custo_trabalho,
    custo_falhas_unit: custo_falhas,
  };
}

function App() {
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('printforge-session') || 'null');
    } catch {
      return null;
    }
  });
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

  const notify = (message, tone = 'success') => {
    setNotice({ message, tone });
    window.setTimeout(() => setNotice(null), 3600);
  };

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

  useEffect(() => {
    loadWorkspace();
  }, [token]);

  useEffect(() => {
    if (active === 'dashboard' && token) loadWorkspace();
  }, [active]);

  const login = async (credentials) => {
    const result = await api.login(credentials);
    const nextSession = {
      token: result.token || result.accessToken,
      user: result.user || { nome: 'Administrador', email: credentials.email, papel: 'admin' }
    };
    sessionStorage.setItem('printforge-session', JSON.stringify(nextSession));
    setSession(nextSession);
  };

  const enterDemo = () => {
    const nextSession = { user: { nome: 'Studio PrintForge', email: 'demo@printforge.local', papel: 'admin' } };
    sessionStorage.setItem('printforge-session', JSON.stringify(nextSession));
    setSession(nextSession);
    notify('Modo demonstração ativado. As alterações ficam apenas neste navegador.', 'warning');
  };

  const logout = () => {
    sessionStorage.removeItem('printforge-session');
    setSession(null);
    setActive('dashboard');
  };

  const createProduct = async (form) => {
    const payload = {
      ...form,
      peso_g: Number(String(form.peso_g).replace(',', '.')) || 0,
      tempo_impressao_h: Number(String(form.tempo_impressao_h).replace(',', '.')) || 0,
      custo_producao: parseBRL(form.custo_producao),
      preco_venda: parseBRL(form.preco_venda),
      estoque: Number(form.estoque) || 0,
    };
    if (demo) {
      setProducts((current) => [{ ...payload, id: 'p-' + Date.now(), criado_em: new Date().toISOString() }, ...current]);
      notify('Produto cadastrado no modo demonstração.');
      return;
    }
    try {
      const created = await api.createProduct(payload, token);
      setProducts((current) => [created, ...current]);
      notify('Produto cadastrado com sucesso.');
    } catch (e) {
      notify(e.message || 'Erro ao criar produto (verifique preço com vírgula).', 'error');
      throw e;
    }
  };

  const updateProduct = async (id, form) => {
    const payload = {
      ...form,
      peso_g: Number(String(form.peso_g).replace(',', '.')) || 0,
      tempo_impressao_h: Number(String(form.tempo_impressao_h).replace(',', '.')) || 0,
      custo_producao: parseBRL(form.custo_producao),
      preco_venda: parseBRL(form.preco_venda),
      estoque: Number(form.estoque) || 0,
    };
    if (demo) {
      setProducts((current) => current.map((item) => item.id === id ? { ...item, ...payload } : item));
      notify('Produto atualizado no modo demonstração.');
      return;
    }
    try {
      const updated = await api.updateProduct(id, payload, token);
      setProducts((current) => current.map((item) => item.id === id ? updated : item));
      notify('Produto atualizado com sucesso.');
    } catch (e) {
      notify(e.message || 'Erro ao atualizar produto.', 'error');
      throw e;
    }
  };

  const isDemoId = (id) => typeof id === 'string' && (id.startsWith('p-') || /^p\d+$/.test(id));

  const removeProduct = async (product) => {
    if (!window.confirm('Excluir "' + product.nome + '"? Esta ação não pode ser desfeita.')) return;
    if (demo || isDemoId(product.id)) {
      setProducts((current) => current.filter((item) => item.id !== product.id));
      notify('Produto removido no modo demonstração.');
      return;
    }
    await api.deleteProduct(product.id, token);
    setProducts((current) => current.filter((item) => item.id !== product.id));
    notify('Produto excluído.');
  };

  const createSale = async (form) => {
    const chosen = products.find((item) => item.id === form.produto_id);
    const payload = {
      ...form,
      quantidade: Number(String(form.quantidade).replace(',', '.')) || 0,
      preco_unitario: parseBRL(form.preco_unitario),
      data_venda: form.data_venda ? new Date(form.data_venda + 'T12:00:00').toISOString() : new Date().toISOString()
    };
    if (demo) {
      const productName = chosen?.nome || form.nome_produto;
      const sale = {
        ...payload,
        id: 'v-' + Date.now(),
        produto_nome: productName,
        margem_lucro_aplicada: chosen?.custo_producao
          ? ((payload.preco_unitario - chosen.custo_producao) / chosen.custo_producao) * 100
          : 0
      };
      setSales((current) => [sale, ...current]);
      if (chosen) {
        setProducts((current) => current.map((item) => item.id === chosen.id ? { ...item, estoque: Math.max(0, Number(item.estoque) - payload.quantidade) } : item));
      } else if (form.nome_produto) {
        setProducts((current) => [{
          ...emptyProduct,
          id: 'p-' + Date.now(),
          nome: form.nome_produto,
          sku: form.sku || 'AUTO-' + Date.now().toString().slice(-5),
          preco_venda: payload.preco_unitario,
          estoque: 0,
          custo_producao: payload.preco_unitario * 0.35,
          criado_em: new Date().toISOString()
        }, ...current]);
      }
      notify(chosen ? 'Venda registrada e estoque atualizado.' : 'Venda registrada e produto criado automaticamente.');
      return;
    }
    try {
      const created = await api.createSale(payload, token);
      setSales((current) => [created, ...current]);
      await loadWorkspace();
      notify(created.produto_criado ? 'Venda registrada e produto criado automaticamente.' : 'Venda registrada e estoque atualizado.');
    } catch (e) {
      notify(e.message || 'Falha ao registrar venda (verifique preço e estoque).', 'error');
      throw e;
    }
  };

  const saveSettings = async (nextSettings) => {
    const payload = {
      custo_kwh: Number(nextSettings.custo_kwh),
      margem_lucro_padrao: Number(nextSettings.margem_lucro_padrao),
      potencia_impressora_w: Number(nextSettings.potencia_impressora_w),
      estoque_baixo_limite: Number(nextSettings.estoque_baixo_limite || 5)
    };
    if (demo) {
      setSettings(payload);
      notify('Configurações salvas no modo demonstração.');
      return;
    }
    const saved = await api.saveSettings(payload, token);
    setSettings(saved);
    notify('Configurações atualizadas.');
  };

  const removeSale = async (sale) => {
    if (!window.confirm('Excluir esta venda? Esta ação não pode ser desfeita e o estoque será restaurado.')) return;
    const pid = sale.produto_id || sale.produtoId;
    const qtd = Number(sale.quantidade) || 0;
    if (demo || isDemoId(sale.id)) {
      setSales((current) => current.filter((item) => item.id !== sale.id));
      if (pid && !isDemoId(pid)) {
        setProducts((current) => current.map((item) => item.id === pid ? { ...item, estoque: Number(item.estoque) + qtd } : item));
      }
      notify('Venda removida no modo demonstração.');
      return;
    }
    try {
      await api.deleteSale(sale.id, token);
      setSales((prev) => prev.filter((v) => v.id !== sale.id));
      setProducts((current) => current.map((item) => item.id === pid ? { ...item, estoque: Number(item.estoque) + qtd } : item));
      notify('Venda excluída e estoque restaurado.');
    } catch (e) {
      notify(e.message || 'Falha ao excluir venda.', 'error');
    }
  };

  const saveCalculation = async (payload) => {
    if (demo) {
      notify('Cálculo salvo no modo demonstração.');
      return;
    }
    await api.saveCalculation(payload, token);
    notify('Cálculo salvo no histórico.');
  };

  const createAtivo = async (form) => {
    const payload = { nome: form.nome, tipo: form.tipo, valorPago: Number(form.valorPago), dataAquisicao: form.dataAquisicao || null };
    if (demo) { setAtivos((c) => [{ ...payload, id: 'a-' + Date.now(), criadoEm: new Date().toISOString() }, ...c]); notify('Ativo criado (demo).'); return; }
    const created = await api.createAtivo(payload, token);
    setAtivos((c) => [created, ...c]); notify('Ativo cadastrado.');
  };
  const updateAtivo = async (id, form) => {
    const payload = { nome: form.nome, tipo: form.tipo, valorPago: form.valorPago !== '' ? Number(form.valorPago) : undefined, dataAquisicao: form.dataAquisicao || null };
    if (demo) { setAtivos((c) => c.map((a) => a.id === id ? { ...a, ...payload } : a)); notify('Ativo atualizado (demo).'); return; }
    const updated = await api.updateAtivo(id, payload, token);
    setAtivos((c) => c.map((a) => a.id === id ? updated : a)); notify('Ativo atualizado.');
  };
  const deleteAtivo = async (ativo) => {
    if (!window.confirm(`Excluir ativo "${ativo.nome}"?`)) return;
    if (demo || String(ativo.id).startsWith('a-')) { setAtivos((c) => c.filter((a) => a.id !== ativo.id)); notify('Ativo removido (demo).'); return; }
    await api.deleteAtivo(ativo.id, token); setAtivos((c) => c.filter((a) => a.id !== ativo.id)); notify('Ativo excluído.');
  };
  const createSuprimento = async (form) => {
    const payload = { nome: form.nome, tipo: form.tipo, cor: form.cor, pesoTotalG: Number(form.pesoTotalG), valorPago: Number(form.valorPago) };
    if (demo) { setSuprimentos((c) => [{ ...payload, id: 's-' + Date.now(), pesoRestanteG: payload.pesoTotalG, criadoEm: new Date().toISOString() }, ...c]); notify('Suprimento criado (demo).'); return; }
    const created = await api.createSuprimento(payload, token);
    setSuprimentos((c) => [created, ...c]); notify('Suprimento cadastrado.');
  };
  const updateSuprimento = async (id, form) => {
    const payload = { nome: form.nome, tipo: form.tipo, cor: form.cor, pesoTotalG: form.pesoTotalG !== '' ? Number(form.pesoTotalG) : undefined, pesoRestanteG: form.pesoRestanteG !== '' ? Number(form.pesoRestanteG) : undefined, valorPago: form.valorPago !== '' ? Number(form.valorPago) : undefined };
    if (demo) { setSuprimentos((c) => c.map((s) => s.id === id ? { ...s, ...payload } : s)); notify('Suprimento atualizado (demo).'); return; }
    const updated = await api.updateSuprimento(id, payload, token);
    setSuprimentos((c) => c.map((s) => s.id === id ? updated : s)); notify('Suprimento atualizado.');
  };
  const deleteSuprimento = async (sup) => {
    if (!window.confirm(`Excluir suprimento "${sup.nome}"?`)) return;
    if (demo || String(sup.id).startsWith('s-')) { setSuprimentos((c) => c.filter((s) => s.id !== sup.id)); notify('Suprimento removido (demo).'); return; }
    await api.deleteSuprimento(sup.id, token); setSuprimentos((c) => c.filter((s) => s.id !== sup.id)); notify('Suprimento excluído.');
  };

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

  if (!session) {
    return <LoginScreen onLogin={login} onDemo={enterDemo} />;
  }

  const pageProps = {
    products,
    sales,
    settings,
    dashboard,
    ativos,
    suprimentos,
    consignados,
    loading,
    onCreateProduct: createProduct,
    onUpdateProduct: updateProduct,
    onDeleteProduct: removeProduct,
    onCreateSale: createSale,
    onDeleteSale: removeSale,
    onSaveSettings: saveSettings,
    onSaveCalculation: saveCalculation,
    onCreateAtivo: createAtivo,
    onUpdateAtivo: updateAtivo,
    onDeleteAtivo: deleteAtivo,
    onCreateSuprimento: createSuprimento,
    onUpdateSuprimento: updateSuprimento,
    onDeleteSuprimento: deleteSuprimento,
    onCreateParceiro: createParceiro,
    onCreateLote: createLote,
    onFecharAcerto: fecharAcerto,
    demo,
    notify
  };

  return (
    <div className="app-shell">
      <Sidebar
        active={active}
        onNavigate={(view) => {
          setActive(view);
          setMobileOpen(false);
        }}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onLogout={logout}
      />
      {mobileOpen && <button className="mobile-backdrop" onClick={() => setMobileOpen(false)} aria-label="Fechar menu" />}
      <main className="main-content">
        <Topbar
          active={active}
          user={session.user}
          demo={demo}
          loading={loading}
          onMenu={() => setMobileOpen(true)}
          onRefresh={loadWorkspace}
          onLogout={logout}
        />
        <div className="page-content">
          {demo && (
            <div className="demo-banner">
              <Sparkles size={16} />
              <span>Você está explorando dados de demonstração. Configure a API para salvar alterações de verdade.</span>
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

function LoginScreen({ onLogin, onDemo }) {
  const [form, setForm] = useState({ email: '', senha: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onLogin(form);
    } catch (loginError) {
      setError(loginError.message || 'Confira suas credenciais e tente novamente.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow auth-glow-one" />
      <div className="auth-glow auth-glow-two" />
      <section className="auth-brand">
        <Brand large />
        <div className="auth-copy">
          <span className="eyebrow">GESTÃO INTELIGENTE PARA MAKERS</span>
          <h1>De cada camada, um negócio mais forte.</h1>
          <p>Centralize pedidos, custos e estoque em um painel feito para quem transforma ideias em peças.</p>
        </div>
        <div className="auth-features">
          <Feature icon={Calculator} title="Precificação precisa" text="Custos, energia e margem em um cálculo vivo." />
          <Feature icon={Boxes} title="Estoque sob controle" text="Saiba o que produzir antes que falte." />
          <Feature icon={TrendingUp} title="Decisões com clareza" text="Acompanhe vendas e lucro sem planilhas." />
        </div>
      </section>
      <section className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <div className="login-heading">
            <span className="login-symbol"><Printer size={24} /></span>
            <div>
              <h2>Bem-vindo de volta</h2>
              <p>Acesse o painel da sua operação.</p>
            </div>
          </div>
          {error && <div className="form-error">{error}</div>}
          <label className="field">
            <span>E-mail</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="voce@sualoja.com"
              required
            />
          </label>
          <label className="field">
            <span>Senha</span>
            <input
              type="password"
              value={form.senha}
              onChange={(event) => setForm({ ...form, senha: event.target.value })}
              placeholder="Sua senha"
              required
            />
          </label>
          <button className="button button-primary button-full" disabled={busy}>
            {busy ? 'Entrando…' : 'Entrar no painel'}
            <ArrowUpRight size={17} />
          </button>
          <div className="login-divider"><span>ou</span></div>
          <button className="button button-secondary button-full" type="button" onClick={onDemo}>
            <Sparkles size={16} />
            Explorar demonstração
          </button>
          <p className="login-help">Use as credenciais configuradas no ambiente da API para acessar dados reais.</p>
        </form>
      </section>
    </div>
  );
}

function Feature({ icon: Icon, title, text }) {
  return (
    <div className="auth-feature">
      <span><Icon size={19} /></span>
      <div><strong>{title}</strong><small>{text}</small></div>
    </div>
  );
}

function Brand({ large = false }) {
  return (
    <div className={'brand ' + (large ? 'brand-large' : '')}>
      <span className="brand-mark"><span /><span /><span /></span>
      <span>PRINT<span>FORGE</span></span>
    </div>
  );
}

function Sidebar({ active, onNavigate, open, onClose, onLogout }) {
  return (
    <aside className={'sidebar ' + (open ? 'sidebar-open' : '')}>
      <div className="sidebar-head">
        <Brand />
        <button className="icon-button sidebar-close" onClick={onClose} aria-label="Fechar menu"><X size={20} /></button>
      </div>
      <nav className="nav-list">
        <span className="nav-caption">OPERAÇÃO</span>
        {navigation.slice(0, 4).map((item) => <NavItem key={item.id} {...item} active={active} onNavigate={onNavigate} />)}
        <span className="nav-caption nav-caption-spaced">FERRAMENTAS</span>
        {navigation.slice(4).map((item) => <NavItem key={item.id} {...item} active={active} onNavigate={onNavigate} />)}
      </nav>
      <div className="sidebar-bottom">
        <div className="plan-card">
          <span className="plan-icon"><Sparkles size={15} /></span>
          <div><strong>PrintForge Pro</strong><small>Seu negócio em movimento</small></div>
        </div>
        <button className="logout-button" onClick={onLogout}><LogOut size={18} /> Sair da conta</button>
      </div>
    </aside>
  );
}

function NavItem({ id, label, icon: Icon, active, onNavigate }) {
  return (
    <button className={'nav-item ' + (active === id ? 'nav-active' : '')} onClick={() => onNavigate(id)}>
      <Icon size={19} />
      <span>{label}</span>
      {id === 'sales' && <span className="nav-dot" />}
    </button>
  );
}

function Topbar({ active, user, demo, loading, onMenu, onRefresh, onLogout }) {
  const page = navigation.find((item) => item.id === active);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  return (
    <header className="topbar">
      <button className="icon-button menu-button" onClick={onMenu} aria-label="Abrir menu"><Menu size={22} /></button>
      <div className="topbar-title">
        <span className="breadcrumb">PrintForge <span>/</span></span>
        <h2>{page?.label}</h2>
      </div>
      <div className="topbar-actions">
        <button className="icon-button refresh-button" onClick={onRefresh} aria-label="Atualizar dados">
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
        </button>
        <div className="dropdown-wrapper">
          <button className="icon-button notification-button" onClick={() => setNotifOpen(!notifOpen)} aria-label="Notificações" aria-expanded={notifOpen}>
            <Bell size={19} />
            <i />
          </button>
          {notifOpen && (
            <div className="dropdown-menu notif-dropdown">
              <div className="dropdown-header"><strong>Notificações</strong></div>
              <div className="dropdown-empty">Nenhuma notificação por enquanto</div>
            </div>
          )}
        </div>
        <div className="dropdown-wrapper">
          <button className="icon-button user-menu" onClick={() => setUserMenuOpen(!userMenuOpen)} aria-label="Menu do usuário" aria-expanded={userMenuOpen}>
            <div className="avatar">{(user?.nome || 'A').slice(0, 1).toUpperCase()}</div>
            <div className="user-label"><strong>{user?.nome || 'Administrador'}</strong><small>{demo ? 'Demonstração' : 'Administrador'}</small></div>
            <ChevronDown size={16} />
          </button>
          {userMenuOpen && (
            <div className="dropdown-menu user-dropdown">
              <div className="dropdown-header">
                <strong>{user?.nome || 'Administrador'}</strong>
                <small>{user?.email}</small>
              </div>
              <div className="dropdown-divider" />
              <button className="dropdown-item" onClick={onLogout}><LogOut size={16} /> Sair da conta</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function Dashboard({ products, sales, settings, dashboard, onNavigate }) {
  const grossRevenue = sales.reduce((total, sale) => total + Number(sale.preco_unitario || 0) * Number(sale.quantidade || 0), 0);
  const totalOrders = sales.reduce((total, sale) => total + Number(sale.quantidade || 0), 0);
  const estimatedProfit = sales.reduce((total, sale) => {
    const product = products.find((item) => item.id === sale.produto_id);
    const unitCost = Number(product?.custo_producao || 0);
    return total + ((Number(sale.preco_unitario || 0) - unitCost) * Number(sale.quantidade || 0));
  }, 0);
  const revenue = Number(dashboard?.faturamento ?? dashboard?.faturamento_total ?? grossRevenue);
  const orderCount = Number(dashboard?.total_vendas ?? dashboard?.quantidade_vendas ?? totalOrders);
  const profit = Number(dashboard?.lucro_acumulado ?? dashboard?.lucro_total ?? estimatedProfit);
  const limit = Number(settings?.estoque_baixo_limite || 5);
  const lowStock = products.filter((product) => Number(product.estoque) <= limit);
  const ranked = [...products].map((product) => ({
    ...product,
    sold: sales.filter((sale) => sale.produto_id === product.id).reduce((total, sale) => total + Number(sale.quantidade), 0)
  })).sort((left, right) => right.sold - left.sold).slice(0, 4);
  
  const monthlyRevenue = sales.reduce((acc, sale) => {
    const month = new Date(sale.data_venda).getMonth();
    acc[month] = (acc[month] || 0) + Number(sale.preco_unitario) * Number(sale.quantidade);
    return acc;
  }, {});
  const currentMonth = new Date().getMonth();
  const lastMonth = (currentMonth - 1 + 12) % 12;
  const currentMonthRevenue = monthlyRevenue[currentMonth] || 0;
  const lastMonthRevenue = monthlyRevenue[lastMonth] || 0;
  const revenueChange = lastMonthRevenue > 0 
    ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
    : (currentMonthRevenue > 0 ? 100 : 0);
  
  const profitLastMonth = sales
    .filter(s => new Date(s.data_venda).getMonth() === lastMonth)
    .reduce((sum, s) => {
      const p = products.find(p => p.id === s.produto_id);
      return sum + ((Number(s.preco_unitario) - Number(p?.custo_producao || 0)) * Number(s.quantidade));
    }, 0);
  const profitChange = profitLastMonth !== 0 
    ? ((profit - profitLastMonth) / Math.abs(profitLastMonth) * 100).toFixed(1)
    : (profit > 0 ? 100 : 0);
  
  const orderChange = sales.filter(s => new Date(s.data_venda).getMonth() === currentMonth).length > 0 ? 100 : 0;

  const monthly = [38, 52, 47, 67, 58, 82, 74, 93, 64, 80, 86, 100];
  const metaMensal = Number(settings?.meta_mensal ?? 2500);
  const metaProgress = metaMensal > 0 ? Math.min(100, (revenue / metaMensal) * 100).toFixed(0) : 0;

  return (
    <section className="page dashboard-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">VISÃO GERAL</span>
          <h1>Bom dia, maker <span>✦</span></h1>
          <p>Veja como a sua operação está performando hoje.</p>
        </div>
        <button className="button button-primary" onClick={() => onNavigate('sales')}><Plus size={17} /> Registrar venda</button>
      </div>
      <div className="metrics-grid">
        <MetricCard icon={CircleDollarSign} label="Faturamento no período" value={money(revenue)} change={(revenueChange >= 0 ? '+' : '') + revenueChange + '%'} up />
        <MetricCard icon={ShoppingBag} label="Peças vendidas" value={number.format(orderCount)} change={orderChange > 0 ? '+100%' : '0%'} up tone="orange" />
        <MetricCard icon={TrendingUp} label="Lucro estimado" value={money(profit)} change={(profitChange >= 0 ? '+' : '') + profitChange + '%'} up tone="pink" />
        <MetricCard icon={Package} label="Estoque baixo" value={number.format(lowStock.length)} change={lowStock.length ? 'Atenção necessária' : 'Tudo em ordem'} tone={lowStock.length ? 'yellow' : 'green'} />
      </div>
      <div className="dashboard-grid">
        <article className="card revenue-card">
          <div className="card-title-row">
            <div><h3>Faturamento</h3><p>Vendas dos últimos 12 meses</p></div>
            <button className="select-button">Este ano <ChevronDown size={15} /></button>
          </div>
          <div className="chart-summary"><strong>{money(revenue)}</strong><span><ArrowUpRight size={14} /> 12,4% <small>vs. período anterior</small></span></div>
          <div className="bar-chart">
            {monthly.map((height, index) => <div className="bar-wrap" key={index}><i className={index === 11 ? 'bar-active' : ''} style={{ height: height + '%' }} /><span>{['Set', 'Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago'][index]}</span></div>)}
          </div>
        </article>
        <article className="card goal-card">
          <div className="card-title-row"><div><h3>Meta do mês</h3><p>{new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p></div><button className="dots">•••</button></div>
          <div className="goal-ring">
            <svg viewBox="0 0 120 120">
              <circle className="bg" cx="60" cy="60" r="54" />
              <circle className="progress" cx="60" cy="60" r="54" 
                style={{ strokeDashoffset: 339 - (339 * metaProgress / 100) }} />
            </svg>
            <div className="progress-text"><strong>{metaProgress}%</strong><small>concluído</small></div>
          </div>
          <div className="goal-footer"><div><span>Faturado</span><strong>{money(revenue)}</strong></div><div><span>Meta</span><strong>{money(metaMensal)}</strong></div></div>
        </article>
        <article className="card sales-card">
          <div className="card-title-row"><div><h3>Vendas recentes</h3><p>Movimentações mais recentes</p></div><button className="text-button" onClick={() => onNavigate('sales')}>Ver todas <ArrowUpRight size={14} /></button></div>
          <div className="sales-list">
            {sales.slice(0, 5).map((sale, index) => {
              const pid = sale.produto_id || sale.produtoId;
              const preco = sale.preco_unitario ?? sale.precoUnitario ?? 0;
              const rawDate = sale.data_venda || sale.dataVenda;
              const pNome = sale.produto_nome || sale.produtoNome;
              const product = products.find((item) => item.id === pid);
              return <div className="sale-row" key={sale.id || index}>
                <img src={productImage(product || {}, index)} alt="" onError={(e) => productImageFallback(e)} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong>{pNome || product?.nome || 'Produto personalizado'}</strong>
                  <small style={{ color: 'var(--text-dim)' }}>{dateTime(rawDate)} · {sale.quantidade} {Number(sale.quantidade) === 1 ? 'unidade' : 'unidades'}</small>
                </div>
                <b>{money(Number(preco) * Number(sale.quantidade))}</b>
              </div>;
            })}
            {!sales.length && <EmptyState compact icon={ShoppingBag} title="Nenhuma venda ainda" text="Registre sua primeira venda para acompanhar o desempenho." />}
          </div>
        </article>
        <article className="card top-products-card">
          <div className="card-title-row"><div><h3>Mais vendidos</h3><p>Por unidades no período</p></div><button className="text-button" onClick={() => onNavigate('catalog')}>Catálogo <ArrowUpRight size={14} /></button></div>
          <div className="rank-list">
            {ranked.map((product, index) => <div className="rank-row" key={product.id}>
              <span className="rank-number">0{index + 1}</span>
              <img src={productImage(product, index)} alt="" onError={(e) => productImageFallback(e)} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong>{product.nome}</strong>
                <small style={{ color: 'var(--text-dim)' }}>{product.sold} vendidas</small>
              </div>
              <div className="rank-progress"><i style={{ width: Math.max(8, product.sold / Math.max(1, ranked[0]?.sold) * 100) + '%' }} /></div>
            </div>)}
          </div>
        </article>
        <article className="card stock-card">
          <div className="card-title-row"><div><h3>Atenção ao estoque</h3><p>Itens que precisam de produção</p></div><span className="alert-count">{lowStock.length}</span></div>
          <div className="stock-list">
            {lowStock.slice(0, 4).map((product, index) => <div className="stock-row" key={product.id}>
              <img src={productImage(product, index + 2)} alt="" onError={(e) => productImageFallback(e)} />
              <div><strong>{product.nome}</strong><small>{product.estoque} em estoque</small></div>
              <button className="small-action" onClick={() => onNavigate('products')}>Produzir</button>
            </div>)}
            {!lowStock.length && <EmptyState compact icon={Check} title="Estoque saudável" text="Todos os produtos estão acima do limite configurado." />}
          </div>
        </article>
      </div>
    </section>
  );
}

function MetricCard({ icon: Icon, label, value, change, up, tone = 'red' }) {
  return (
    <article className={'metric-card metric-' + tone}>
      <div className="metric-icon"><Icon size={20} /></div>
      <div className="metric-copy"><span>{label}</span><strong>{value}</strong></div>
      <small className={up ? 'metric-up' : ''}>{up && <ArrowUpRight size={13} />}{change}</small>
    </article>
  );
}

function Products({ products, settings, onCreateProduct, onUpdateProduct, onDeleteProduct, notify }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);
  const categories = [...new Set(products.map((product) => product.categoria).filter(Boolean))];
  const lowLimit = Number(settings?.estoque_baixo_limite || 5);
  const visible = products.filter((product) => {
    const content = [product.nome, product.sku, product.filamento_nome].join(' ').toLowerCase();
    return content.includes(search.toLowerCase()) && (!category || product.categoria === category);
  });

  const save = async (form) => {
    setBusy(true);
    try {
      if (modal?.id) await onUpdateProduct(modal.id, form);
      else await onCreateProduct(form);
      setModal(null);
    } catch (error) {
      notify(error.message || 'Não foi possível salvar o produto.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="page">
      <div className="page-heading">
        <div><span className="eyebrow">INVENTÁRIO</span><h1>Produtos</h1><p>Gerencie suas peças, preços e disponibilidade.</p></div>
        <button className="button button-primary" onClick={() => setModal(emptyProduct)}><Plus size={17} /> Novo produto</button>
      </div>
      <div className="toolbar">
        <label className="search-box"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome ou SKU…" /></label>
        <label className="filter-select"><Filter size={16} /><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">Todas as categorias</option>{categories.map((item) => <option value={item} key={item}>{item}</option>)}</select><ChevronDown size={15} /></label>
        <button className="button button-ghost"><Download size={16} /> Exportar</button>
      </div>
      <div className="table-card">
        <div className="data-table product-table">
          <div className="table-row table-head"><span>Produto</span><span>Categoria</span><span>Preço</span><span>Estoque</span><span>Status</span><span /></div>
          {visible.map((product, index) => {
            const stock = Number(product.estoque || 0);
            return <div className="table-row" key={product.id}>
              <div className="product-cell"><div className="product-thumb"><img src={productImage(product, index)} alt={product.nome} onError={(e)=>{productImageFallback(e);}} /></div><div><strong>{product.nome}</strong><small>{product.sku || 'Sem SKU'} · {product.filamento_nome || product.filamento_tipo || 'Filamento'}</small></div></div>
              <span className="table-muted">{product.categoria || 'Sem categoria'}</span>
              <strong>{money(product.preco_venda)}</strong>
              <span>{stock} un.</span>
              <span><StatusPill stock={stock} limit={lowLimit} /></span>
              <div className="row-actions"><button aria-label="Editar produto" onClick={() => setModal(product)}><Edit3 size={16} /></button><button className="danger" aria-label="Excluir produto" onClick={() => onDeleteProduct(product)}><Trash2 size={16} /></button></div>
            </div>;
          })}
        </div>
        {!visible.length && <EmptyState icon={Package} title="Nenhum produto encontrado" text="Ajuste os filtros ou cadastre uma nova peça." />}
      </div>
      {modal && <ProductModal product={modal} onClose={() => setModal(null)} onSave={save} busy={busy} />}
    </section>
  );
}

function StatusPill({ stock, limit }) {
  if (stock <= 0) return <span className="status-pill status-out"><i />Esgotado</span>;
  if (stock <= limit) return <span className="status-pill status-low"><i />Estoque baixo</span>;
  return <span className="status-pill status-ok"><i />Disponível</span>;
}

function ProductModal({ product, onClose, onSave, busy }) {
  const [form, setForm] = useState({ ...emptyProduct, ...product });
  const [imagePreview, setImagePreview] = useState(product?.imagem_url || product?.image_url || '');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);
  const field = (name, value) => {
    setForm((c) => ({ ...c, [name]: value }));
    if (name === 'imagem_url') setImagePreview(value);
  };

  useEffect(() => {
    setForm({ ...emptyProduct, ...product });
    setImagePreview(product?.imagem_url || product?.image_url || '');
  }, [product]);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Apenas imagens são permitidas');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Imagem deve ter até 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      setImagePreview(base64);
      field('imagem_url', base64);
    };
    reader.readAsDataURL(file);
  };

  const submit = (event) => {
    event.preventDefault();
    onSave(form);
  };
  return (
    <Modal title={product.id ? 'Editar produto' : 'Novo produto'} subtitle="Defina os dados de produção e venda da peça." onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        <div className="form-grid">
          <label className="field field-wide"><span>Nome do produto</span><input value={form.nome} onChange={(event) => field('nome', event.target.value)} placeholder="Ex.: Dragão articulado" required /></label>
          <label className="field"><span>Categoria</span><select value={form.categoria} onChange={(event) => field('categoria', event.target.value)}><option>Decoração</option><option>Organização</option><option>Colecionáveis</option><option>Games</option><option>Utilidades</option><option>Personalizados</option></select></label>
          <label className="field"><span>Filamento</span><input value={form.filamento_nome || ''} onChange={(event) => field('filamento_nome', event.target.value)} placeholder="PLA Silk vermelho" /></label>
          <label className="field"><span>Tipo de filamento</span><select value={form.filamento_tipo || 'PLA'} onChange={(event) => field('filamento_tipo', event.target.value)}><option>PLA</option><option>ABS</option><option>PETG</option><option>TPU</option><option>Resina</option></select></label>
          <label className="field"><span>Peso usado (g)</span><input type="number" min="0" step="0.1" value={form.peso_g} onChange={(event) => field('peso_g', event.target.value)} required /></label>
          <label className="field"><span>Tempo de impressão (h)</span><input type="number" min="0" step="0.1" value={form.tempo_impressao_h} onChange={(event) => field('tempo_impressao_h', event.target.value)} required /></label>
          <label className="field"><span>Custo de produção <em>(calcule na Precificação)</em></span><input type="number" min="0" step="0.01" value={form.custo_producao} onChange={(event) => field('custo_producao', event.target.value)} /></label>
          <label className="field"><span>Preço de venda</span><input type="number" min="0" step="0.01" value={form.preco_venda} onChange={(event) => field('preco_venda', event.target.value)} required /></label>
          <label className="field"><span>Estoque inicial</span><input type="number" min="0" step="1" value={form.estoque} onChange={(event) => field('estoque', event.target.value)} required /></label>
          <div className="field field-wide">
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: '#a1a1aa', display: 'flex', gap: '6px' }}>Imagem do produto <em style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--text-dim)' }}>opcional</em></span>
            <div
              className={'dropzone' + (dragOver ? ' dropzone-over' : '') + (imagePreview ? ' dropzone-has-image' : '')}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') fileRef.current?.click(); }}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="dropzone-thumb" onError={(e) => { e.target.style.display='none'; }} />
                  <button type="button" className="image-remove" onClick={(e) => { e.stopPropagation(); field('imagem_url', ''); setImagePreview(''); }} title="Remover imagem"><X size={14} /></button>
                  <span className="dropzone-change">Clique ou arraste para trocar</span>
                </>
              ) : (
                <>
                  <div className="dropzone-icon"><Package size={28} /></div>
                  <div className="dropzone-text"><strong>Arraste uma imagem ou clique para selecionar</strong><small>PNG, JPG, WEBP até 5MB — será salva em Base64 no campo imagem_url</small></div>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={(e) => handleFile(e.target.files[0])} style={{ display: 'none' }} />
          </div>
        </div>
        <div className="modal-actions"><button type="button" className="button button-ghost" onClick={onClose}>Cancelar</button><button className="button button-primary" disabled={busy}>{busy ? 'Salvando…' : 'Salvar produto'} <Check size={16} /></button></div>
      </form>
    </Modal>
  );
}

function getFirstDayOfMonth() {
  const d = new Date();
  d.setDate(1);
  return dateValue(d);
}

function getToday() {
  return dateValue(new Date());
}

function Sales({ products, sales, onCreateSale, onDeleteSale, notify }) {
  const [form, setForm] = useState({
    produto_id: products[0]?.id || '',
    nome_produto: '',
    sku: '',
    quantidade: 1,
    preco_unitario: products[0]?.preco_venda || '',
    data_venda: dateValue(new Date())
  });
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState(getFirstDayOfMonth());
  const [to, setTo] = useState(getToday());
  const [busy, setBusy] = useState(false);
  const selected = products.find((product) => product.id === form.produto_id);
  const filtered = sales.filter((sale) => {
    const nome = sale.produto_nome || sale.produtoNome || '';
    const matchesText = nome.toLowerCase().includes(search.toLowerCase());
    const rawDate = sale.data_venda || sale.dataVenda;
    const soldAt = dateValue(rawDate);
    if (!soldAt) return matchesText;
    return matchesText && (!from || soldAt >= from) && (!to || soldAt <= to);
  });

  useEffect(() => {
    if (products.length && !products.find((product) => product.id === form.produto_id)) {
      setForm((current) => ({ ...current, produto_id: products[0].id, preco_unitario: products[0].preco_venda }));
    }
  }, [products]);

  const chooseProduct = (id) => {
    const product = products.find((item) => item.id === id);
    setForm((current) => ({ ...current, produto_id: id, preco_unitario: product?.preco_venda || '', nome_produto: '', sku: '' }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.produto_id && !form.nome_produto.trim()) {
      notify('Selecione um produto ou informe o nome de uma nova peça.', 'error');
      return;
    }
    setBusy(true);
    try {
      await onCreateSale(form);
      setForm((current) => ({ ...current, quantidade: 1, nome_produto: '', sku: '' }));
    } catch (error) {
      notify(error.message || 'Não foi possível registrar a venda.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="page sales-page">
      <div className="page-heading"><div><span className="eyebrow">PEDIDOS</span><h1>Vendas</h1><p>Registre pedidos e acompanhe cada saída do estoque.</p></div></div>
      <div className="sales-layout">
        <article className="card sale-form-card">
          <div className="section-heading"><span className="section-icon"><ShoppingBag size={18} /></span><div><h3>Registrar venda</h3><p>O estoque é atualizado automaticamente.</p></div></div>
          <form className="sale-form" onSubmit={submit}>
            <label className="field"><span>Produto cadastrado</span><select value={form.produto_id} onChange={(event) => chooseProduct(event.target.value)}><option value="">Cadastrar pela venda</option>{products.map((product) => <option key={product.id} value={product.id}>{product.nome} · {money(product.preco_venda)}</option>)}</select></label>
            {!form.produto_id && <div className="form-grid">
              <label className="field"><span>Nome do novo produto</span><input value={form.nome_produto} onChange={(event) => setForm({ ...form, nome_produto: event.target.value })} placeholder="Peça personalizada" /></label>
              <label className="field"><span>SKU <em>opcional</em></span><input value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} placeholder="AUTO-001" /></label>
            </div>}
            {selected && <div className="sale-product-preview"><img src={productImage(selected)} alt="" onError={(e) => productImageFallback(e)} /><div><strong>{selected.nome}</strong><span>{selected.estoque} un. disponíveis · {selected.sku}</span></div><b>{money(selected.preco_venda)}</b></div>}
            <div className="form-grid">
              <label className="field"><span>Quantidade</span><input type="number" min="1" value={form.quantidade} onChange={(event) => setForm({ ...form, quantidade: event.target.value })} required /></label>
              <label className="field"><span>Preço unitário</span><input type="number" min="0" step="0.01" value={form.preco_unitario} onChange={(event) => setForm({ ...form, preco_unitario: event.target.value })} required /></label>
              <label className="field field-wide"><span>Data da venda</span><input type="date" value={form.data_venda} onChange={(event) => setForm({ ...form, data_venda: event.target.value })} required /></label>
            </div>
            <div className="sale-total"><span>Total da venda</span><strong>{money(Number(form.quantidade || 0) * Number(form.preco_unitario || 0))}</strong></div>
            <button className="button button-primary button-full" disabled={busy}>{busy ? 'Registrando…' : 'Confirmar venda'} <ArrowUpRight size={16} /></button>
          </form>
        </article>
        <article className="card sales-history-card">
          <div className="card-title-row"><div><h3>Histórico de vendas</h3><p>{filtered.length} registros encontrados</p></div><button className="button button-ghost"><Download size={16} /> CSV</button></div>
          <div className="history-filters"><label className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar produto…" /></label><input type="date" value={from} onChange={(event) => setFrom(event.target.value)} aria-label="De" /><input type="date" value={to} onChange={(event) => setTo(event.target.value)} aria-label="Até" /></div>
          <div className="history-list">
            {filtered.map((sale, index) => {
              const pid = sale.produto_id || sale.produtoId;
              const pNome = sale.produto_nome || sale.produtoNome;
              const preco = sale.preco_unitario ?? sale.precoUnitario ?? 0;
              const qtd = sale.quantidade ?? 0;
              const rawDate = sale.data_venda || sale.dataVenda;
              const product = products.find((item) => item.id === pid);
              const value = Number(preco) * Number(qtd);
              return <div className="history-row" key={sale.id || index}>
                <img src={productImage(product || {}, index)} alt="" onError={(e) => productImageFallback(e)} />
                <div><strong>{pNome || product?.nome || 'Produto personalizado'}</strong><small>{dateTime(rawDate)} · {qtd} un. × {money(preco)}</small></div>
                <div><b>{money(value)}</b><span className="status-pill status-ok"><i />Concluída</span></div>
                <button className="danger" aria-label="Excluir venda" onClick={() => onDeleteSale(sale)}><Trash2 size={16} /></button>
              </div>;
            })}
            {!filtered.length && <EmptyState icon={ClipboardList} title="Sem vendas neste filtro" text="Altere os filtros ou registre uma nova venda." />}
          </div>
        </article>
      </div>
    </section>
  );
}

function Catalog({ products, onNavigate, onDeleteProduct }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [material, setMaterial] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const categories = [...new Set(products.map((product) => product.categoria).filter(Boolean))];
  const materials = [...new Set(products.map((product) => product.filamento_tipo || product.filamento_nome).filter(Boolean))];
  const filtered = products.filter((product) => {
    const matchesSearch = [product.nome, product.categoria, product.filamento_nome].join(' ').toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (!category || product.categoria === category) && (!material || (product.filamento_tipo || product.filamento_nome) === material) && (!maxPrice || Number(product.preco_venda) <= Number(maxPrice));
  });
  return (
    <section className="page catalog-page">
      <div className="catalog-hero">
        <span className="eyebrow">VITRINE DIGITAL</span>
        <h1>Catálogo de peças <span>3D</span></h1>
        <p>Uma seleção de objetos impressos com cuidado, camada por camada.</p>
      </div>
      <div className="catalog-toolbar-v2">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="O que você está procurando?" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <div className="filters-group">
          <div className="select-wrapper">
            <SlidersHorizontal size={16} className="select-icon-left" />
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">Categoria</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <ChevronDown size={14} className="select-chevron" />
          </div>
          <div className="select-wrapper">
            <select value={material} onChange={(event) => setMaterial(event.target.value)}>
              <option value="">Material</option>
              {materials.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <ChevronDown size={14} className="select-chevron" />
          </div>
          <div className="select-wrapper">
            <select value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)}>
              <option value="">Até qualquer preço</option>
              <option value="30">Até R$ 30</option>
              <option value="60">Até R$ 60</option>
              <option value="100">Até R$ 100</option>
            </select>
            <ChevronDown size={14} className="select-chevron" />
          </div>
        </div>
      </div>
      <div className="catalog-meta"><span>{filtered.length} {filtered.length === 1 ? 'peça encontrada' : 'peças encontradas'}</span><span>Ordenar: <strong>Mais recentes</strong> <ChevronDown size={14} /></span></div>
      <div className="catalog-grid">
        {filtered.map((product, index) => <article className="catalog-card" key={product.id}>
          <div className="catalog-image"><img src={productImage(product, index)} alt={product.nome} onError={(e) => productImageFallback(e)} /><span>{product.filamento_tipo || '3D'}</span></div>
          <div className="catalog-info"><small>{product.categoria || 'Personalizados'}</small><h3>{product.nome}</h3><div><strong>{money(product.preco_venda)}</strong><span>{Number(product.estoque) > 0 ? 'Em estoque' : 'Sob encomenda'}</span></div></div>
          <div className="catalog-actions">
            <button className="icon-button" onClick={() => onNavigate?.('products')} aria-label="Editar produto" title="Editar"><Edit3 size={16} /></button>
            <button className="icon-button danger" onClick={() => { if (window.confirm(`Excluir "${product.nome}"?`)) onDeleteProduct?.({id: product.id, nome: product.nome}); }} aria-label="Excluir produto" title="Excluir"><Trash2 size={16} /></button>
          </div>
        </article>)}
      </div>
      {!filtered.length && <EmptyState icon={Search} title="Nenhuma peça encontrada" text="Tente outra busca ou remova um dos filtros." />}
    </section>
  );
}

function CalculatorView({ products, settings, onSaveCalculation, notify }) {
  const presets = [
    { id: 'chaveiro', label: 'Chaveiro', icon: '🔑', peso_g: 18, custo_kg: 95, tempo_impressao_h: 1.1, potencia_w: 220, custo_kwh: 0.98, hora_trabalho: 20, horas_manuais: 0.15, quantidade: 10, margem_lucro: 140, risco_falha: 4 },
    { id: 'tecnica', label: 'Peça técnica', icon: '⚙️', peso_g: 85, custo_kg: 125, tempo_impressao_h: 5.2, potencia_w: 280, custo_kwh: 0.98, hora_trabalho: 35, horas_manuais: 0.6, quantidade: 2, margem_lucro: 90, risco_falha: 8 },
    { id: 'suporte', label: 'Suporte', icon: '🎧', peso_g: 90, custo_kg: 95, tempo_impressao_h: 4.8, potencia_w: 250, custo_kwh: 0.98, hora_trabalho: 20, horas_manuais: 0.25, quantidade: 5, margem_lucro: 110, risco_falha: 5 },
    { id: 'mini', label: 'Miniatura', icon: '🧙', peso_g: 42, custo_kg: 110, tempo_impressao_h: 3.4, potencia_w: 220, custo_kwh: 0.98, hora_trabalho: 20, horas_manuais: 0.4, quantidade: 6, margem_lucro: 160, risco_falha: 10 },
    { id: 'vaso', label: 'Vaso', icon: '🏺', peso_g: 155, custo_kg: 95, tempo_impressao_h: 8.2, potencia_w: 220, custo_kwh: 0.98, hora_trabalho: 15, horas_manuais: 0.2, quantidade: 1, margem_lucro: 130, risco_falha: 6 },
  ];

  const [form, setForm] = useState({
    produto_id: '',
    peso_g: 140,
    custo_kg: 92,
    tempo_impressao_h: 6.5,
    potencia_w: settings?.potencia_impressora_w || 220,
    custo_kwh: settings?.custo_kwh || 0.98,
    hora_trabalho: 20,
    horas_manuais: 0.3,
    quantidade: 1,
    margem_lucro: settings?.margem_lucro_padrao || 120,
    risco_falha: 5,
  });
  const [activePreset, setActivePreset] = useState(null);
  const [saved, setSaved] = useState(false);
  const calculated = useMemo(() => calculatePrice(form), [form]);
  const maxAnatomy = Math.max(calculated.custo_filamento, calculated.custo_energia, calculated.custo_trabalho, calculated.custo_falhas, 0.01);
  const custoPct = (calculated.custo_unitario / (calculated.preco_sugerido_unitario || 1)) * 100;
  const lucroPct = 100 - custoPct;

  useEffect(() => {
    setForm((c) => ({
      ...c,
      potencia_w: c.potencia_w || settings?.potencia_impressora_w || 220,
      custo_kwh: c.custo_kwh || settings?.custo_kwh || 0.98,
      margem_lucro: c.margem_lucro || settings?.margem_lucro_padrao || 120,
    }));
  }, [settings]);

  const update = (key, value) => {
    setSaved(false);
    setActivePreset(null);
    setForm((c) => ({ ...c, [key]: value }));
  };

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setSaved(false);
    setForm((c) => ({
      ...c,
      peso_g: p.peso_g,
      custo_kg: p.custo_kg,
      tempo_impressao_h: p.tempo_impressao_h,
      potencia_w: p.potencia_w,
      custo_kwh: p.custo_kwh,
      hora_trabalho: p.hora_trabalho,
      horas_manuais: p.horas_manuais,
      quantidade: p.quantidade,
      margem_lucro: p.margem_lucro,
      risco_falha: p.risco_falha,
    }));
  };

  const selectProduct = (id) => {
    const product = products.find((item) => item.id === id);
    setForm((c) => ({
      ...c,
      produto_id: id,
      peso_g: product?.peso_g || c.peso_g,
      tempo_impressao_h: product?.tempo_impressao_h || c.tempo_impressao_h,
      margem_lucro: product?.custo_producao && product?.preco_venda
        ? Math.max(0, ((product.preco_venda - product.custo_producao) / product.custo_producao) * 100).toFixed(1)
        : c.margem_lucro,
    }));
  };

  const save = async () => {
    try {
      await onSaveCalculation({ ...form, ...calculated, custo_producao: calculated.custo_unitario, preco_venda: calculated.preco_sugerido_unitario });
      setSaved(true);
    } catch (error) {
      notify(error.message || 'Não foi possível salvar o cálculo.', 'error');
    }
  };

  return (
    <section className="page calculator-page-v2">
      <div className="page-heading">
        <div>
          <span className="eyebrow">MOTOR DE CUSTOS</span>
          <h1>Precificação inteligente</h1>
          <p>Simule cenários, ajuste margem e risco para achar o preço justo.</p>
        </div>
        <span className="java-badge"><Package size={14} /> Serviço de cálculo ativo</span>
      </div>

      <div className="calc-presets">
        <span className="calc-presets-label">Cenários</span>
        <div className="calc-presets-list">
          {presets.map((p) => (
            <button key={p.id} className={'calc-preset ' + (activePreset === p.id ? 'calc-preset-active' : '')} onClick={() => applyPreset(p)}>
              <span>{p.icon}</span> {p.label}
            </button>
          ))}
        </div>
        <label className="field calc-preset-select"><select value={form.produto_id} onChange={(e) => selectProduct(e.target.value)}><option value="">Vincular produto...</option>{products.map((pr) => <option key={pr.id} value={pr.id}>{pr.nome}</option>)}</select></label>
      </div>

      <div className="calculator-layout-v2">
        <div className="calc-left">
          <article className="card calc-panel">
            <div className="calc-section-title"><span className="calc-section-icon"><Package size={16} /></span> MATERIAL E TEMPO</div>
            <div className="calc-grid-2">
              <label className="field"><span>Peso utilizado</span><div className="input-unit"><input type="number" min="0" step="0.1" value={form.peso_g} onChange={(e) => update('peso_g', e.target.value)} /><b>g</b></div></label>
              <label className="field"><span>Preço do filamento</span><div className="input-unit money-unit"><b>R$</b><input type="number" min="0" step="0.01" value={form.custo_kg} onChange={(e) => update('custo_kg', e.target.value)} /><b>/ KG</b></div></label>
              <label className="field"><span>Tempo de impressão</span><div className="input-unit"><input type="number" min="0" step="0.1" value={form.tempo_impressao_h} onChange={(e) => update('tempo_impressao_h', e.target.value)} /><b>H</b></div></label>
              <label className="field"><span>Potência da impressora</span><div className="input-unit"><input type="number" min="0" step="1" value={form.potencia_w} onChange={(e) => update('potencia_w', e.target.value)} /><b>W</b></div></label>
              <label className="field"><span>Tarifa de energia</span><div className="input-unit money-unit"><b>R$</b><input type="number" min="0" step="0.01" value={form.custo_kwh} onChange={(e) => update('custo_kwh', e.target.value)} /><b>/ kWh</b></div></label>
              <label className="field"><span>Quantidade</span><div className="input-unit"><input type="number" min="1" step="1" value={form.quantidade} onChange={(e) => update('quantidade', e.target.value)} /><b>un</b></div></label>
            </div>
          </article>

          <article className="card calc-panel">
            <div className="calc-section-title"><span className="calc-section-icon"><Settings size={16} /></span> OPERAÇÃO E TRABALHO</div>
            <div className="calc-grid-2">
              <label className="field"><span>Hora de trabalho</span><div className="input-unit money-unit"><b>R$</b><input type="number" min="0" step="1" value={form.hora_trabalho} onChange={(e) => update('hora_trabalho', e.target.value)} /><b>/ H</b></div></label>
              <label className="field"><span>Horas manuais</span><div className="input-unit"><input type="number" min="0" step="0.1" value={form.horas_manuais} onChange={(e) => update('horas_manuais', e.target.value)} /><b>H</b></div></label>
            </div>
          </article>

          <article className="card calc-margin-card">
            <div className="calc-margin-head">
              <div><span className="calc-margin-label">Margem de lucro</span><strong className="calc-margin-value">{Number(form.margem_lucro || 0).toLocaleString('pt-BR')}%</strong></div>
              <span className="calc-margin-hint">arraste para ajustar</span>
            </div>
            <input type="range" min="0" max="500" step="5" value={form.margem_lucro} onChange={(e) => update('margem_lucro', e.target.value)} className="calc-range" />
            <div className="range-labels"><span>0%</span><span>250%</span><span>500%</span></div>
            <label className="field" style={{marginTop:'14px'}}><span>Risco de falha <em>buffer para retrabalho</em></span><div className="input-unit"><input type="number" min="0" max="100" step="1" value={form.risco_falha} onChange={(e) => update('risco_falha', e.target.value)} /><b>%</b></div></label>
          </article>
        </div>

        <div className="calc-right">
          <article className="card calc-result-dark">
            <div className="calc-right-head"><span className="eyebrow">PREÇO SUGERIDO</span><span className="live-dot"><i />ao vivo</span></div>
            <div className="calc-price-hero"><strong>{money(calculated.preco_sugerido_unitario)}</strong><span>por unidade • total {money(calculated.preco_total)} ({form.quantidade} un)</span></div>

            <div className="calc-cost-lucro-bar">
              <div className="calc-bar-track"><i className="calc-bar-cost" style={{ width: `${custoPct}%` }} /><i className="calc-bar-lucro" style={{ width: `${lucroPct}%` }} /></div>
              <div className="calc-bar-legend"><span><i className="dot-cost" /> Custo {money(calculated.custo_unitario)}</span><span><i className="dot-lucro" /> Lucro {money(calculated.lucro_unitario)}</span></div>
            </div>

            <div className="calc-mini-grid">
              <div className="calc-mini"><small>Custo unitário</small><strong>{money(calculated.custo_unitario)}</strong></div>
              <div className="calc-mini"><small>Lucro unitário</small><strong className="accent">{money(calculated.lucro_unitario)}</strong></div>
              <div className="calc-mini"><small>Tempo total</small><strong>{(calculated.tempo_total || 0).toFixed(1)} h</strong></div>
              <div className="calc-mini"><small>Só filamento</small><strong>{money(calculated.custo_filamento)}</strong></div>
            </div>

            <div className="calc-anatomy">
              <span className="calc-anatomy-title">ANATOMIA DO CUSTO</span>
              {[
                { label: 'Filamento', value: calculated.custo_filamento },
                { label: 'Energia', value: calculated.custo_energia },
                { label: 'Mão de obra', value: calculated.custo_trabalho },
                { label: 'Falhas', value: calculated.custo_falhas },
              ].map((item) => (
                <div key={item.label} className="calc-anatomy-row">
                  <div><span>{item.label}</span><strong>{money(item.value)}</strong></div>
                  <div className="calc-anatomy-track"><i style={{ width: `${(item.value / maxAnatomy) * 100}%` }} /></div>
                </div>
              ))}
              <div className="calc-anatomy-row calc-anatomy-total"><div><span>Lucro</span><strong>{money(calculated.lucro_unitario)}</strong></div><div className="calc-anatomy-track"><i className="track-lucro" style={{ width: `${(calculated.lucro_unitario / maxAnatomy) * 100}%` }} /></div></div>
            </div>

            <div className="calc-actions">
              <button className={'button button-primary button-full ' + (saved ? 'button-saved' : '')} onClick={save}>{saved ? <><Check size={17} /> Salvo</> : <><Plus size={17} /> Salvar preço no produto</>}</button>
              <button className="button button-ghost button-full" onClick={() => setForm((c)=> ({...c, quantidade: Math.max(1, c.quantidade)}))}>Duplicar quantidade</button>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function AtivosView({ ativos, suprimentos, sales, products, onCreateAtivo, onDeleteAtivo, onCreateSuprimento, onDeleteSuprimento, notify }) {
  const [ativoForm, setAtivoForm] = useState({ nome: '', tipo: 'Impressora 3D', valorPago: '', dataAquisicao: dateValue(new Date()) });
  const [supForm, setSupForm] = useState({ nome: '', tipo: 'PLA', cor: '', pesoTotalG: '', valorPago: '' });
  const [busyA, setBusyA] = useState(false);
  const [busyS, setBusyS] = useState(false);

  const totalLucro = sales.reduce((sum, s) => {
    const p = products.find((pr) => pr.id === (s.produto_id || s.produtoId));
    const custo = Number(p?.custo_producao ?? p?.custoProducao ?? 0);
    const preco = Number(s.preco_unitario ?? s.precoUnitario ?? 0);
    return sum + (preco - custo) * Number(s.quantidade || 0);
  }, 0);

  const submitAtivo = async (e) => {
    e.preventDefault();
    if (!ativoForm.nome.trim() || !ativoForm.valorPago) { notify('Informe nome e valor pago do ativo.', 'error'); return; }
    setBusyA(true);
    try { await onCreateAtivo(ativoForm); setAtivoForm({ nome: '', tipo: 'Impressora 3D', valorPago: '', dataAquisicao: dateValue(new Date()) }); } catch (err) { notify(err.message, 'error'); } finally { setBusyA(false); }
  };
  const submitSup = async (e) => {
    e.preventDefault();
    if (!supForm.nome.trim() || !supForm.pesoTotalG || !supForm.valorPago) { notify('Informe nome, peso total e valor pago.', 'error'); return; }
    setBusyS(true);
    try { await onCreateSuprimento(supForm); setSupForm({ nome: '', tipo: 'PLA', cor: '', pesoTotalG: '', valorPago: '' }); } catch (err) { notify(err.message, 'error'); } finally { setBusyS(false); }
  };

  return (
    <section className="page ativos-page">
      <div className="page-heading"><div><span className="eyebrow">FINANCEIRO</span><h1>Ativos & Insumos</h1><p>Controle máquinas, filamentos e ROI.</p></div></div>

      <div className="ativos-grid">
        <article className="card ativos-roi-card">
          <div className="card-title-row"><div><h3>Retorno sobre máquinas (ROI)</h3><p>Lucro acumulado vs valor investido</p></div><span className="alert-count">{ativos.length}</span></div>
          <div className="ativos-list">
            {!ativos.length && <EmptyState compact icon={Boxes} title="Nenhum ativo cadastrado" text="Cadastre sua impressora para acompanhar o payback." />}
            {ativos.map((ativo) => {
              const invest = Number(ativo.valorPago || ativo.valor_pago || 0);
              const recuperado = Math.min(totalLucro, invest);
              const pct = invest > 0 ? Math.min(100, (totalLucro / invest) * 100) : 0;
              const falta = Math.max(0, invest - totalLucro);
              return (
                <div key={ativo.id} className="ativo-row">
                  <div className="ativo-head"><strong>{ativo.nome}</strong><small>{ativo.tipo} • {money(invest)}</small></div>
                  <div className="roi-track"><i style={{ width: `${pct}%` }} /></div>
                  <div className="roi-legend"><span>{money(recuperado)} de {money(invest)} recuperados</span><strong className={pct >= 100 ? 'roi-done' : ''}>{pct.toFixed(1)}% pago</strong></div>
                  {pct >= 100 ? <span className="status-pill status-ok"><i />Máquina paga</span> : <small style={{ color: 'var(--text-dim)' }}>Faltam {money(falta)} para payback</small>}
                  <button className="icon-button danger" onClick={() => onDeleteAtivo(ativo)} style={{ marginLeft: 'auto' }}><Trash2 size={16} /></button>
                </div>
              );
            })}
          </div>
          <form className="ativos-form" onSubmit={submitAtivo}>
            <div className="form-grid">
              <label className="field"><span>Nome da máquina</span><input value={ativoForm.nome} onChange={(e) => setAtivoForm({ ...ativoForm, nome: e.target.value })} placeholder="Ex: Ender 3 Pro" required /></label>
              <label className="field"><span>Tipo</span><select value={ativoForm.tipo} onChange={(e) => setAtivoForm({ ...ativoForm, tipo: e.target.value })}><option>Impressora 3D</option><option>Outra</option></select></label>
              <label className="field"><span>Valor pago</span><div className="input-unit money-unit"><b>R$</b><input type="number" min="0" step="0.01" value={ativoForm.valorPago} onChange={(e) => setAtivoForm({ ...ativoForm, valorPago: e.target.value })} required /></div></label>
              <label className="field"><span>Data aquisição</span><input type="date" value={ativoForm.dataAquisicao} onChange={(e) => setAtivoForm({ ...ativoForm, dataAquisicao: e.target.value })} /></label>
            </div>
            <button className="button button-primary" disabled={busyA}>{busyA ? 'Salvando...' : 'Adicionar máquina'} <Plus size={16} /></button>
          </form>
        </article>

        <article className="card suprimentos-card">
          <div className="card-title-row"><div><h3>Suprimentos — filamento em gramas</h3><p>Abate automático a cada venda</p></div><span className="alert-count">{suprimentos.length}</span></div>
          <div className="suprimentos-list">
            {!suprimentos.length && <EmptyState compact icon={Package} title="Nenhum suprimento" text="Cadastre o rolo comprado para controlar estoque em gramas." />}
            {suprimentos.map((s) => {
              const pct = s.pesoTotalG > 0 ? (s.pesoRestanteG / s.pesoTotalG) * 100 : 0;
              const alerta = pct < 15 || s.pesoRestanteG < 300;
              return (
                <div key={s.id} className={`sup-row ${alerta ? 'sup-alert' : ''}`}>
                  <div className="sup-head"><strong>{s.nome}</strong><small>{s.tipo} {s.cor ? `• ${s.cor}` : ''} • {s.pesoRestanteG.toFixed(0)}g / {s.pesoTotalG.toFixed(0)}g</small></div>
                  <div className="sup-track"><i style={{ width: `${pct}%` }} className={alerta ? 'track-alert' : ''} /></div>
                  <div className="sup-legend"><span>{pct.toFixed(0)}% restante</span>{alerta && <span className="status-pill status-low"><i />Repor</span>}<span>{money(s.valorPago)}</span></div>
                  <button className="icon-button danger" onClick={() => onDeleteSuprimento(s)}><Trash2 size={16} /></button>
                </div>
              );
            })}
          </div>
          <form className="suprimentos-form" onSubmit={submitSup}>
            <div className="form-grid">
              <label className="field"><span>Nome do suprimento</span><input value={supForm.nome} onChange={(e) => setSupForm({ ...supForm, nome: e.target.value })} placeholder="Rolo PLA Vermelho 1kg" required /></label>
              <label className="field"><span>Tipo</span><select value={supForm.tipo} onChange={(e) => setSupForm({ ...supForm, tipo: e.target.value })}><option>PLA</option><option>ABS</option><option>PETG</option><option>TPU</option><option>Resina</option></select></label>
              <label className="field"><span>Cor</span><input value={supForm.cor} onChange={(e) => setSupForm({ ...supForm, cor: e.target.value })} placeholder="Vermelho" /></label>
              <label className="field"><span>Peso total (g)</span><input type="number" min="0" value={supForm.pesoTotalG} onChange={(e) => setSupForm({ ...supForm, pesoTotalG: e.target.value })} required /></label>
              <label className="field"><span>Valor pago</span><div className="input-unit money-unit"><b>R$</b><input type="number" min="0" step="0.01" value={supForm.valorPago} onChange={(e) => setSupForm({ ...supForm, valorPago: e.target.value })} required /></div></label>
            </div>
            <button className="button button-primary" disabled={busyS}>{busyS ? 'Salvando...' : 'Adicionar suprimento'} <Plus size={16} /></button>
          </form>
          <div className="formula-note" style={{ margin: '16px' }}><Boxes size={16} /><span> A cada venda o peso da peça (<strong>peso_g</strong> × quantidade) é abatido automaticamente do suprimento do mesmo tipo.</span></div>
        </article>
      </div>
    </section>
  );
}

function SettingsView({ settings, onSaveSettings, notify }) {
  const [form, setForm] = useState({ ...demoSettings, ...settings });
  const [busy, setBusy] = useState(false);
  useEffect(() => setForm({ ...demoSettings, ...settings }), [settings]);
  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await onSaveSettings(form);
    } catch (error) {
      notify(error.message || 'Não foi possível salvar as configurações.', 'error');
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="page settings-page">
      <div className="page-heading"><div><span className="eyebrow">PREFERÊNCIAS</span><h1>Configurações</h1><p>Defina os valores padrão da sua operação.</p></div></div>
      <form className="settings-grid" onSubmit={save}>
        <article className="card settings-card">
          <div className="section-heading"><span className="section-icon"><Printer size={18} /></span><div><h3>Impressora e energia</h3><p>Usados como base para os novos cálculos.</p></div></div>
          <label className="field"><span>Potência da impressora (W)</span><input type="number" min="0" value={form.potencia_impressora_w} onChange={(event) => setForm({ ...form, potencia_impressora_w: event.target.value })} /></label>
          <label className="field"><span>Custo do kWh (R$)</span><input type="number" min="0" step="0.01" value={form.custo_kwh} onChange={(event) => setForm({ ...form, custo_kwh: event.target.value })} /></label>
        </article>
        <article className="card settings-card">
          <div className="section-heading"><span className="section-icon"><TrendingUp size={18} /></span><div><h3>Margem e estoque</h3><p>Regras de alerta e preço sugerido.</p></div></div>
          <label className="field"><span>Margem de lucro padrão (%)</span><input type="number" min="0" value={form.margem_lucro_padrao} onChange={(event) => setForm({ ...form, margem_lucro_padrao: event.target.value })} /></label>
          <label className="field"><span>Alerta de estoque baixo (un.)</span><input type="number" min="0" value={form.estoque_baixo_limite} onChange={(event) => setForm({ ...form, estoque_baixo_limite: event.target.value })} /></label>
        </article>
        <div className="settings-actions"><button className="button button-primary" disabled={busy}>{busy ? 'Salvando…' : 'Salvar configurações'} <Check size={16} /></button></div>
      </form>
    </section>
  );
}

function Modal({ title, subtitle, children, onClose }) {
  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-label={title}>
      <button className="modal-backdrop" onClick={onClose} aria-label="Fechar" />
      <div className="modal-card">
        <div className="modal-head"><div><h2>{title}</h2><p>{subtitle}</p></div><button className="icon-button" onClick={onClose} aria-label="Fechar"><X size={20} /></button></div>
        {children}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, text, compact = false }) {
  return <div className={'empty-state ' + (compact ? 'empty-compact' : '')}><span><Icon size={compact ? 19 : 26} /></span><div><strong>{title}</strong><p>{text}</p></div></div>;
}

function Toast({ tone, message }) {
  return <div className={'toast toast-' + tone}><span>{tone === 'error' ? <X size={18} /> : <Check size={18} />}</span>{message}</div>;
}

function Consignments({ consignados, products, onCreateParceiro, onCreateLote, onFecharAcerto, notify }) {
  const [modalLoja, setModalLoja] = useState(false);
  const [modalLote, setModalLote] = useState(null); 
  const [modalAcerto, setModalAcerto] = useState(null); 

  const [formLoja, setFormLoja] = useState({ nome: '', telefone: '', comissao_padrao: 30, frequencia_acerto: 'Mensal' });
  const [formLote, setFormLote] = useState({ tipo_negociacao: 'Consignacao', descricao: '', quantidade_enviada: 1, preco_unitario: '', comissao_aplicada_perc: 30 });
  const [formAcerto, setFormAcerto] = useState({ quantidade_vendida: 0 });

  const handleCreateLoja = (e) => {
    e.preventDefault(); 
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