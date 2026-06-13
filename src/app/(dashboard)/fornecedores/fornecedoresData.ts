export type StatusFornecedor = "avaliando" | "contratado" | "descartado";

export type Orcamento = {
  id: string;
  titulo: string;
  valor: number;
  inclui: string;
  validade: string; // "2025-03-15"
  escolhido: boolean;
  arquivo?: string;
};

export type Fornecedor = {
  id: string;
  nome: string;
  categoria: string;
  status: StatusFornecedor;
  contato: string;
  telefone: string;
  site?: string;
  notas?: string;
  valorContratado?: number;
  contratoUrl?: string;
  orcamentos: Orcamento[];
};

export const CATEGORIAS_FORNECEDOR = [
  { id: "local",      label: "Local & Cerimônia",   color: "#7A8C6A", bg: "#F0F4ED", icon: "🏛️" },
  { id: "buffet",     label: "Buffet & Bebidas",     color: "#C4704A", bg: "#FAF0EA", icon: "🍽️" },
  { id: "foto",       label: "Foto & Vídeo",         color: "#1B3A5C", bg: "#EEF3F8", icon: "📸" },
  { id: "musica",     label: "Música",               color: "#7B6BA8", bg: "#F5F3FB", icon: "🎵" },
  { id: "vestuario",  label: "Vestuário",            color: "#C4707A", bg: "#FDF3F4", icon: "👗" },
  { id: "floricultura", label: "Flores & Decoração", color: "#5A7A6A", bg: "#EDF4F0", icon: "💐" },
  { id: "beleza",     label: "Beleza",               color: "#A0729A", bg: "#F8F3F8", icon: "💄" },
  { id: "convites",   label: "Convites & Papelaria", color: "#5A7A6A", bg: "#EDF4F0", icon: "✉️" },
  { id: "transporte", label: "Transporte",           color: "#2A6A8C", bg: "#EAF4FA", icon: "🚗" },
  { id: "outros",     label: "Outros",               color: "#8C8C8C", bg: "#F5F5F5", icon: "📋" },
];

export const STATUS_CONFIG: Record<StatusFornecedor, { label: string; color: string; bg: string }> = {
  avaliando:  { label: "Em avaliação", color: "#B07A20", bg: "#FEF9EE" },
  contratado: { label: "Contratado",   color: "#3A7A4A", bg: "#EDF7F0" },
  descartado: { label: "Descartado",   color: "#9A4A4A", bg: "#FDF0F0" },
};

export const FAKE_FORNECEDORES: Fornecedor[] = [
  {
    id: "1",
    nome: "Espaço Vila Verde",
    categoria: "local",
    status: "contratado",
    contato: "Renata Souza",
    telefone: "(41) 99811-2233",
    site: "espacovilaverde.com.br",
    notas: "Capacidade para 250 pessoas. Inclui estacionamento e área externa.",
    valorContratado: 28000,
    contratoUrl: "contrato-vila-verde.pdf",
    orcamentos: [
      { id: "o1", titulo: "Pacote Básico (sáb)", valor: 28000, inclui: "Salão principal, mesas, cadeiras, estacionamento", validade: "2025-06-01", escolhido: true },
      { id: "o2", titulo: "Pacote Completo (sáb)", valor: 35000, inclui: "Tudo no básico + iluminação cênica + gerador", validade: "2025-06-01", escolhido: false },
    ],
  },
  {
    id: "2",
    nome: "Buffet Sabor & Arte",
    categoria: "buffet",
    status: "avaliando",
    contato: "Carlos Menezes",
    telefone: "(41) 3344-5566",
    notas: "Degustação agendada para 15/03",
    orcamentos: [
      { id: "o3", titulo: "Menu Jantar 200 pessoas", valor: 42000, inclui: "Entrada, prato principal, sobremesa, open bar 6h", validade: "2025-04-15", escolhido: false },
    ],
  },
  {
    id: "3",
    nome: "Fernanda Luz Fotografia",
    categoria: "foto",
    status: "contratado",
    contato: "Fernanda Luz",
    telefone: "(41) 99712-8844",
    site: "fernandaluz.com.br",
    valorContratado: 8500,
    orcamentos: [
      { id: "o4", titulo: "Pacote Completo", valor: 8500, inclui: "12h de cobertura, álbum 30 fotos, entrega em 90 dias", validade: "2025-05-01", escolhido: true },
    ],
  },
  {
    id: "4",
    nome: "DJ Marco Beats",
    categoria: "musica",
    status: "avaliando",
    contato: "Marco Antônio",
    telefone: "(41) 99523-1177",
    orcamentos: [
      { id: "o5", titulo: "Cerimônia + Festa", valor: 3200, inclui: "Cerimônia acústica + DJ 5h na festa + equipamento", validade: "2025-04-30", escolhido: false },
    ],
  },
  {
    id: "5",
    nome: "Ateliê Floral Girassol",
    categoria: "floricultura",
    status: "descartado",
    contato: "Ana Lima",
    telefone: "(41) 3211-4422",
    notas: "Valor acima do orçamento. Verificar outras opções.",
    orcamentos: [
      { id: "o6", titulo: "Decoração Completa", valor: 18000, inclui: "Altar, mesas, entrada e buquê", validade: "2025-03-01", escolhido: false },
    ],
  },
];
