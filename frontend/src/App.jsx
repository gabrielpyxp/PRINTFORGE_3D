import { useEffect, useMemo, useState } from 'react';
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
  Cube,
  Download,
  Edit3,
  Filter,
  Grid2X2,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
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
  UserRound,
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
  {
    id: 'p1',
    sku: 'PF-DRG-001',
    nome: 'Dragão articulado',
    categoria: 'Decoração',
    filamento_nome: 'PLA Silk',
    filamento_tipo: 'PLA',
    peso_g: 184,
    tempo_impressao_h: 9.5,
    custo_producao: 19.68,
    preco_venda: 69.9,
    estoque: 4,
    imagem_url: productImages[0],
    criado_em: '2026-08-18T13:00:00.000Z'
  },
  {
    id: 'p2',
    sku: 'PF-ORG-021',
    nome: 'Organizador modular',
    categoria: 'Organização',
    filamento_nome: 'PETG Preto',
    filamento_tipo: 'PETG',
    peso_g: 310,
    tempo_impressao_h: 12,
    custo_producao: 27.9,
    preco_venda: 94.9,
    estoque: 12,
    imagem_url: productImages[1],
    criado_em: '2026-08-15T13:00:00.000Z'
  },
  {
    id: 'p3',
    sku: 'PF-COS-014',
    nome: 'Capacete sci-fi mini',
    categoria: 'Colecionáveis',
    filamento_nome: 'PLA Vermelho',
    filamento_tipo: 'PLA',
    peso_g: 126,
    tempo_impressao_h: 7.3,
    custo_producao: 13.45,
    preco_venda: 54.9,
    estoque: 2,
    imagem_url: productImages[2],
    criado_em: '2026-08-12T13:00:00.000Z'
  },
  {
    id: 'p4',
    sku: 'PF-GAM-037',
    nome: 'Suporte para headset',
    categoria: 'Games',
    filamento_nome: 'PLA Preto',
    filamento_tipo: 'PLA',
    peso_g: 91,
    tempo_impressao_h: 5.1,
    custo_producao: 9.7,
    preco_venda: 39.9,
    estoque: 7,
    imagem_url: productImages[3],
    criado_em: '2026-08-10T13:00:00.000Z'
  },
  {
    id: 'p5',
    sku: 'PF-DEC-055',
    nome: 'Vaso geométrico',
    categoria: 'Decoração',
    filamento_nome: 'PLA Marble',
    filamento_tipo: 'PLA',
    peso_g: 154,
    tempo_impressao_h: 8.2,
    custo_producao: 16.44,
    preco_venda: 59.9,
    estoque: 3,
    imagem_url: productImages[4],
    criado_em: '2026-08-08T13:00:00.000Z'
  },
  {
    id: 'p6',
    sku: 'PF-UTL-007',
    nome: 'Gancho multiuso',
    categoria: 'Utilidades',
    filamento_nome: 'PETG Azul',
    filamento_tipo: 'PETG',
    peso_g: 42,
    tempo_impressao_h: 2.4,
    custo_producao: 4.55,
    preco_venda: 19.9,
    estoque: 24,
    imagem_url: productImages[5],
    criado_em: '2026-08-02T13:00:00.000Z'
  }
];

const demoSales = [
  { id: 'v1', produto_id: 'p1', produto_nome: 'Dragão articulado', quantidade: 2, preco_unitario: 69.9, margem_lucro_aplicada: 255.2, data_venda: '2026-08-22T15:43:00.000Z' },
  { id: 'v2', produto_id: 'p2', produto_nome: 'Organizador modular', quantidade: 1, preco_unitario: 94.9, margem_lucro_aplicada: 240.1, data_venda: '2026-08-22T10:12:00.000Z' },
  { id: 'v3', produto_id: 'p4', produto_nome: 'Suporte para headset', quantidade: 3, preco_unitario: 39.9, margem_lucro_aplicada: 230.7, data_venda: '2026-08-21T18:02:00.000Z' },
  { id: 'v4', produto_id: 'p5', produto_nome: 'Vaso geométrico', quantidade: 1, preco_unitario: 59.9, margem_lucro_aplicada: 264.3, data_venda: '2026-08-20T09:30:00.000Z' }
];

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
  { id: 'catalog', label: 'Catálogo', icon: Grid2X2 },
  { id: 'calculator', label: 'Precificação', icon: Calculator },
  { id: 'settings', label: 'Configurações', icon: Settings }
];

const emptyProduct = {
  nome: '',
  sku: '',
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
  return new Date(value).toISOString().slice(0, 10);
}

function productImage(product, index = 0) {
  return product.imagem_url || product.image_url || productImages[index % productImages.length];
}

function getItems(response) {
  if (Array.isArray(response)) return response;
  return response?.items || response?.produtos || response?.vendas || response?.data || [];
}

function calculatePrice(input) {
  const weight = Number(input.peso_g) || 0;
  const filament = Number(input.custo_kg) || 0;
  const time = Number(input.tempo_impressao_h) || 0;
  const power = Number(input.potencia_w) || 0;
  const kwh = Number(input.custo_kwh) || 0;
  const margin = Number(input.margem_lucro) || 0;
  const filamentCost = (weight / 1000) * filament;
  const energyCost = time * (power / 1000) * kwh;
  const total = filamentCost + energyCost;
  const profit = total * (margin / 100);
  return {
    custo_filamento: filamentCost,
    custo_energia: energyCost,
    custo_total: total,
    lucro: profit,
    preco_final: total + profit
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
      const [dashboardResponse, productsResponse, salesResponse, settingsResponse] = await Promise.all([
        api.dashboard(token),
        api.products({}, token),
        api.sales({}, token),
        api.settings(token)
      ]);
      setDashboard(dashboardResponse);
      setProducts(getItems(productsResponse));
      setSales(getItems(salesResponse));
      setSettings(settingsResponse || demoSettings);
    } catch (error) {
      notify('Não foi possível atualizar os dados agora. Exibindo o último estado disponível.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, [token]);

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
      peso_g: Number(form.peso_g),
      tempo_impressao_h: Number(form.tempo_impressao_h),
      custo_producao: Number(form.custo_producao),
      preco_venda: Number(form.preco_venda),
      estoque: Number(form.estoque)
    };
    if (demo) {
      setProducts((current) => [{ ...payload, id: 'p-' + Date.now(), criado_em: new Date().toISOString() }, ...current]);
      notify('Produto cadastrado no modo demonstração.');
      return;
    }
    const created = await api.createProduct(payload, token);
    setProducts((current) => [created, ...current]);
    notify('Produto cadastrado com sucesso.');
  };

  const updateProduct = async (id, form) => {
    const payload = {
      ...form,
      peso_g: Number(form.peso_g),
      tempo_impressao_h: Number(form.tempo_impressao_h),
      custo_producao: Number(form.custo_producao),
      preco_venda: Number(form.preco_venda),
      estoque: Number(form.estoque)
    };
    if (demo) {
      setProducts((current) => current.map((item) => item.id === id ? { ...item, ...payload } : item));
      notify('Produto atualizado no modo demonstração.');
      return;
    }
    const updated = await api.updateProduct(id, payload, token);
    setProducts((current) => current.map((item) => item.id === id ? updated : item));
    notify('Produto atualizado com sucesso.');
  };

  const removeProduct = async (product) => {
    if (!window.confirm('Excluir "' + product.nome + '"? Esta ação não pode ser desfeita.')) return;
    if (demo) {
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
      quantidade: Number(form.quantidade),
      preco_unitario: Number(form.preco_unitario),
      data_venda: form.data_venda ? new Date(form.data_venda).toISOString() : new Date().toISOString()
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
    const created = await api.createSale(payload, token);
    setSales((current) => [created, ...current]);
    await loadWorkspace();
    notify(created.produto_criado ? 'Venda registrada e produto criado automaticamente.' : 'Venda registrada e estoque atualizado.');
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

  const saveCalculation = async (payload) => {
    if (demo) {
      notify('Cálculo salvo no modo demonstração.');
      return;
    }
    await api.saveCalculation(payload, token);
    notify('Cálculo salvo no histórico.');
  };

  if (!session) {
    return <LoginScreen onLogin={login} onDemo={enterDemo} />;
  }

  const pageProps = {
    products,
    sales,
    settings,
    dashboard,
    loading,
    onCreateProduct: createProduct,
    onUpdateProduct: updateProduct,
    onDeleteProduct: removeProduct,
    onCreateSale: createSale,
    onSaveSettings: saveSettings,
    onSaveCalculation: saveCalculation,
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
          {active === 'catalog' && <Catalog {...pageProps} />}
          {active === 'calculator' && <CalculatorView {...pageProps} />}
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

function Topbar({ active, user, demo, loading, onMenu, onRefresh }) {
  const page = navigation.find((item) => item.id === active);
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
        <button className="notification-button" aria-label="Notificações"><Bell size={19} /><i /></button>
        <div className="user-menu">
          <div className="avatar">{(user?.nome || 'A').slice(0, 1).toUpperCase()}</div>
          <div className="user-label"><strong>{user?.nome || 'Administrador'}</strong><small>{demo ? 'Demonstração' : 'Administrador'}</small></div>
          <ChevronDown size={16} />
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
  const monthly = [38, 52, 47, 67, 58, 82, 74, 93, 64, 80, 86, 100];

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
        <MetricCard icon={CircleDollarSign} label="Faturamento no período" value={money(revenue)} change="+12,4%" up />
        <MetricCard icon={ShoppingBag} label="Peças vendidas" value={number.format(orderCount)} change="+8,2%" up tone="orange" />
        <MetricCard icon={TrendingUp} label="Lucro estimado" value={money(profit)} change="+17,9%" up tone="pink" />
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
          <div className="card-title-row"><div><h3>Meta do mês</h3><p>Agosto de 2026</p></div><button className="dots">•••</button></div>
          <div className="goal-ring"><div><strong>78%</strong><small>concluído</small></div></div>
          <div className="goal-footer"><div><span>Faturado</span><strong>{money(revenue)}</strong></div><div><span>Meta</span><strong>{money(2500)}</strong></div></div>
        </article>
        <article className="card sales-card">
          <div className="card-title-row"><div><h3>Vendas recentes</h3><p>Movimentações mais recentes</p></div><button className="text-button" onClick={() => onNavigate('sales')}>Ver todas <ArrowUpRight size={14} /></button></div>
          <div className="sales-list">
            {sales.slice(0, 5).map((sale, index) => {
              const product = products.find((item) => item.id === sale.produto_id);
              return <div className="sale-row" key={sale.id || index}>
                <img src={productImage(product || {}, index)} alt="" />
                <div><strong>{sale.produto_nome || product?.nome || 'Produto personalizado'}</strong><small>{dateTime(sale.data_venda)} · {sale.quantidade} {Number(sale.quantidade) === 1 ? 'unidade' : 'unidades'}</small></div>
                <b>{money(Number(sale.preco_unitario) * Number(sale.quantidade))}</b>
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
              <img src={productImage(product, index)} alt="" />
              <div><strong>{product.nome}</strong><small>{product.sold} vendidas</small></div>
              <div className="rank-progress"><i style={{ width: Math.max(8, product.sold / Math.max(1, ranked[0]?.sold) * 100) + '%' }} /></div>
            </div>)}
          </div>
        </article>
        <article className="card stock-card">
          <div className="card-title-row"><div><h3>Atenção ao estoque</h3><p>Itens que precisam de produção</p></div><span className="alert-count">{lowStock.length}</span></div>
          <div className="stock-list">
            {lowStock.slice(0, 4).map((product, index) => <div className="stock-row" key={product.id}>
              <img src={productImage(product, index + 2)} alt="" />
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
              <div className="product-cell"><img src={productImage(product, index)} alt="" /><div><strong>{product.nome}</strong><small>{product.sku || 'Sem SKU'} · {product.filamento_nome || product.filamento_tipo || 'Filamento'}</small></div></div>
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
  const field = (name, value) => setForm((current) => ({ ...current, [name]: value }));
  const submit = (event) => {
    event.preventDefault();
    onSave(form);
  };
  return (
    <Modal title={product.id ? 'Editar produto' : 'Novo produto'} subtitle="Defina os dados de produção e venda da peça." onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        <div className="form-grid">
          <label className="field field-wide"><span>Nome do produto</span><input value={form.nome} onChange={(event) => field('nome', event.target.value)} placeholder="Ex.: Dragão articulado" required /></label>
          <label className="field"><span>SKU</span><input value={form.sku || ''} onChange={(event) => field('sku', event.target.value)} placeholder="PF-0001" /></label>
          <label className="field"><span>Categoria</span><select value={form.categoria} onChange={(event) => field('categoria', event.target.value)}><option>Decoração</option><option>Organização</option><option>Colecionáveis</option><option>Games</option><option>Utilidades</option><option>Personalizados</option></select></label>
          <label className="field"><span>Filamento</span><input value={form.filamento_nome || ''} onChange={(event) => field('filamento_nome', event.target.value)} placeholder="PLA Silk vermelho" /></label>
          <label className="field"><span>Tipo de filamento</span><select value={form.filamento_tipo || 'PLA'} onChange={(event) => field('filamento_tipo', event.target.value)}><option>PLA</option><option>ABS</option><option>PETG</option><option>TPU</option><option>Resina</option></select></label>
          <label className="field"><span>Peso usado (g)</span><input type="number" min="0" step="0.1" value={form.peso_g} onChange={(event) => field('peso_g', event.target.value)} required /></label>
          <label className="field"><span>Tempo de impressão (h)</span><input type="number" min="0" step="0.1" value={form.tempo_impressao_h} onChange={(event) => field('tempo_impressao_h', event.target.value)} required /></label>
          <label className="field"><span>Custo de produção</span><input type="number" min="0" step="0.01" value={form.custo_producao} onChange={(event) => field('custo_producao', event.target.value)} required /></label>
          <label className="field"><span>Preço de venda</span><input type="number" min="0" step="0.01" value={form.preco_venda} onChange={(event) => field('preco_venda', event.target.value)} required /></label>
          <label className="field"><span>Estoque inicial</span><input type="number" min="0" step="1" value={form.estoque} onChange={(event) => field('estoque', event.target.value)} required /></label>
          <label className="field field-wide"><span>URL da imagem <em>opcional</em></span><input value={form.imagem_url || ''} onChange={(event) => field('imagem_url', event.target.value)} placeholder="https://…" /></label>
        </div>
        <div className="modal-actions"><button type="button" className="button button-ghost" onClick={onClose}>Cancelar</button><button className="button button-primary" disabled={busy}>{busy ? 'Salvando…' : 'Salvar produto'} <Check size={16} /></button></div>
      </form>
    </Modal>
  );
}

function Sales({ products, sales, onCreateSale, notify }) {
  const [form, setForm] = useState({
    produto_id: products[0]?.id || '',
    nome_produto: '',
    sku: '',
    quantidade: 1,
    preco_unitario: products[0]?.preco_venda || '',
    data_venda: dateValue(new Date())
  });
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [busy, setBusy] = useState(false);
  const selected = products.find((product) => product.id === form.produto_id);
  const filtered = sales.filter((sale) => {
    const matchesText = (sale.produto_nome || '').toLowerCase().includes(search.toLowerCase());
    const soldAt = dateValue(sale.data_venda);
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
            {selected && <div className="sale-product-preview"><img src={productImage(selected)} alt="" /><div><strong>{selected.nome}</strong><span>{selected.estoque} un. disponíveis · {selected.sku}</span></div><b>{money(selected.preco_venda)}</b></div>}
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
              const product = products.find((item) => item.id === sale.produto_id);
              const value = Number(sale.preco_unitario) * Number(sale.quantidade);
              return <div className="history-row" key={sale.id || index}>
                <img src={productImage(product || {}, index)} alt="" />
                <div><strong>{sale.produto_nome || product?.nome || 'Produto personalizado'}</strong><small>{dateTime(sale.data_venda)} · {sale.quantidade} un. × {money(sale.preco_unitario)}</small></div>
                <div><b>{money(value)}</b><span className="status-pill status-ok"><i />Concluída</span></div>
              </div>;
            })}
            {!filtered.length && <EmptyState icon={ClipboardList} title="Sem vendas neste filtro" text="Altere os filtros ou registre uma nova venda." />}
          </div>
        </article>
      </div>
    </section>
  );
}

function Catalog({ products }) {
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
      <div className="catalog-tools">
        <label className="catalog-search"><Search size={19} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="O que você está procurando?" /></label>
        <label className="filter-select"><SlidersHorizontal size={16} /><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">Categoria</option>{categories.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={15} /></label>
        <label className="filter-select"><select value={material} onChange={(event) => setMaterial(event.target.value)}><option value="">Material</option>{materials.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={15} /></label>
        <label className="filter-select"><select value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)}><option value="">Até qualquer preço</option><option value="30">Até R$ 30</option><option value="60">Até R$ 60</option><option value="100">Até R$ 100</option></select><ChevronDown size={15} /></label>
      </div>
      <div className="catalog-meta"><span>{filtered.length} {filtered.length === 1 ? 'peça encontrada' : 'peças encontradas'}</span><span>Ordenar: <strong>Mais recentes</strong> <ChevronDown size={14} /></span></div>
      <div className="catalog-grid">
        {filtered.map((product, index) => <article className="catalog-card" key={product.id}>
          <div className="catalog-image"><img src={productImage(product, index)} alt={product.nome} /><span>{product.filamento_tipo || '3D'}</span></div>
          <div className="catalog-info"><small>{product.categoria || 'Personalizados'}</small><h3>{product.nome}</h3><div><strong>{money(product.preco_venda)}</strong><span>{Number(product.estoque) > 0 ? 'Em estoque' : 'Sob encomenda'}</span></div></div>
        </article>)}
      </div>
      {!filtered.length && <EmptyState icon={Search} title="Nenhuma peça encontrada" text="Tente outra busca ou remova um dos filtros." />}
    </section>
  );
}

function CalculatorView({ products, settings, onSaveCalculation, notify }) {
  const [form, setForm] = useState({
    produto_id: '',
    peso_g: 140,
    custo_kg: 92,
    tempo_impressao_h: 6.5,
    potencia_w: settings?.potencia_impressora_w || 220,
    custo_kwh: settings?.custo_kwh || 0.98,
    margem_lucro: settings?.margem_lucro_padrao || 180
  });
  const [saved, setSaved] = useState(false);
  const calculated = useMemo(() => calculatePrice(form), [form]);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      potencia_w: current.potencia_w || settings?.potencia_impressora_w || 220,
      custo_kwh: current.custo_kwh || settings?.custo_kwh || 0.98
    }));
  }, [settings]);

  const update = (key, value) => {
    setSaved(false);
    setForm((current) => ({ ...current, [key]: value }));
  };
  const selectProduct = (id) => {
    const product = products.find((item) => item.id === id);
    setForm((current) => ({
      ...current,
      produto_id: id,
      peso_g: product?.peso_g || current.peso_g,
      tempo_impressao_h: product?.tempo_impressao_h || current.tempo_impressao_h,
      margem_lucro: product?.custo_producao && product?.preco_venda
        ? Math.max(0, ((product.preco_venda - product.custo_producao) / product.custo_producao) * 100).toFixed(1)
        : current.margem_lucro
    }));
  };
  const save = async () => {
    try {
      await onSaveCalculation({ ...form, ...calculated });
      setSaved(true);
    } catch (error) {
      notify(error.message || 'Não foi possível salvar o cálculo.', 'error');
    }
  };
  return (
    <section className="page calculator-page">
      <div className="page-heading"><div><span className="eyebrow">MOTOR DE CUSTOS</span><h1>Precificação inteligente</h1><p>Descubra o preço justo em segundos, sem adivinhações.</p></div><span className="java-badge"><Cube size={14} /> Serviço de cálculo ativo</span></div>
      <div className="calculator-layout">
        <article className="card calc-input-card">
          <div className="section-heading"><span className="section-icon"><Calculator size={18} /></span><div><h3>Dados da impressão</h3><p>Preencha os insumos para calcular.</p></div></div>
          <div className="calc-form">
            <label className="field"><span>Vincular a um produto <em>opcional</em></span><select value={form.produto_id} onChange={(event) => selectProduct(event.target.value)}><option value="">Cálculo avulso</option>{products.map((product) => <option value={product.id} key={product.id}>{product.nome}</option>)}</select></label>
            <div className="input-section-label">MATERIAL</div>
            <div className="form-grid">
              <label className="field"><span>Peso utilizado</span><div className="input-unit"><input type="number" min="0" step="0.1" value={form.peso_g} onChange={(event) => update('peso_g', event.target.value)} /><b>g</b></div></label>
              <label className="field"><span>Filamento por kg</span><div className="input-unit money-unit"><b>R$</b><input type="number" min="0" step="0.01" value={form.custo_kg} onChange={(event) => update('custo_kg', event.target.value)} /></div></label>
            </div>
            <div className="input-section-label">ENERGIA</div>
            <div className="form-grid">
              <label className="field"><span>Tempo de impressão</span><div className="input-unit"><input type="number" min="0" step="0.1" value={form.tempo_impressao_h} onChange={(event) => update('tempo_impressao_h', event.target.value)} /><b>h</b></div></label>
              <label className="field"><span>Potência da impressora</span><div className="input-unit"><input type="number" min="0" step="1" value={form.potencia_w} onChange={(event) => update('potencia_w', event.target.value)} /><b>W</b></div></label>
              <label className="field field-wide"><span>Tarifa de energia</span><div className="input-unit money-unit"><b>R$</b><input type="number" min="0" step="0.01" value={form.custo_kwh} onChange={(event) => update('custo_kwh', event.target.value)} /><b>/ kWh</b></div></label>
            </div>
          </div>
        </article>
        <article className="card calc-result-card">
          <div className="result-top"><div><span className="eyebrow">RESULTADO AO VIVO</span><h3>Preço sugerido</h3></div><span className="live-dot"><i />Atualizando</span></div>
          <div className="price-display"><small>Valor para venda</small><strong>{money(calculated.preco_final)}</strong><span>por unidade</span></div>
          <div className="margin-control">
            <div><span>Margem de lucro</span><strong>{Number(form.margem_lucro || 0).toLocaleString('pt-BR')}%</strong></div>
            <input type="range" min="0" max="500" step="5" value={form.margem_lucro} onChange={(event) => update('margem_lucro', event.target.value)} />
            <div className="range-labels"><span>0%</span><span>250%</span><span>500%</span></div>
          </div>
          <div className="cost-breakdown">
            <div><span>Filamento <small>{Number(form.peso_g || 0)}g × {money(form.custo_kg)}/kg</small></span><strong>{money(calculated.custo_filamento)}</strong></div>
            <div><span>Energia elétrica <small>{Number(form.tempo_impressao_h || 0)}h de impressão</small></span><strong>{money(calculated.custo_energia)}</strong></div>
            <div><span>Custo de produção</span><strong>{money(calculated.custo_total)}</strong></div>
            <div className="profit-row"><span>Seu lucro</span><strong>+ {money(calculated.lucro)}</strong></div>
          </div>
          <button className={'button button-primary button-full ' + (saved ? 'button-saved' : '')} onClick={save}>{saved ? <><Check size={17} /> Cálculo salvo</> : <><Plus size={17} /> Salvar no histórico</>}</button>
        </article>
      </div>
      <div className="formula-note"><Sparkles size={16} /><span>O cálculo considera <strong>filamento + consumo de energia + margem desejada</strong>. Ajuste a margem livremente e veja o resultado na hora.</span></div>
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

export default App;
