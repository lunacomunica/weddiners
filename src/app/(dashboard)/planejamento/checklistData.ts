export type ChecklistItem = {
  id: string;
  title: string;
  category: string;
  monthsBefore: number; // 12, 9, 6, 3, 1, 0
  done: boolean;
  tip?: string;
};

export const CATEGORIES = [
  { id: "local",      label: "Local & Cerimônia",  color: "#7A8C6A", bg: "#F0F4ED" },
  { id: "buffet",     label: "Buffet & Bebidas",    color: "#C4704A", bg: "#FAF0EA" },
  { id: "foto",       label: "Foto & Vídeo",        color: "#1B3A5C", bg: "#EEF3F8" },
  { id: "musica",     label: "Música",              color: "#7B6BA8", bg: "#F5F3FB" },
  { id: "vestuario",  label: "Vestuário",           color: "#C4707A", bg: "#FDF3F4" },
  { id: "convites",   label: "Convites & Papelaria",color: "#5A7A6A", bg: "#EDF4F0" },
  { id: "beleza",     label: "Beleza",              color: "#A0729A", bg: "#F8F3F8" },
  { id: "viagem",     label: "Lua de Mel",          color: "#2A6A8C", bg: "#EAF4FA" },
  { id: "outros",     label: "Outros",              color: "#8C8C8C", bg: "#F5F5F5" },
];

export const PHASE_LABELS: Record<number, string> = {
  12: "12+ meses antes",
  9:  "9–12 meses antes",
  6:  "6–9 meses antes",
  3:  "3–6 meses antes",
  1:  "1–3 meses antes",
  0:  "Últimas semanas",
};

export const DEFAULT_ITEMS: ChecklistItem[] = [
  // 12+ meses antes
  { id: "1",  title: "Definir data e tipo de cerimônia", category: "local",     monthsBefore: 12, done: true,  tip: "Civil, religiosa ou ambas?" },
  { id: "2",  title: "Estimar número de convidados",     category: "outros",    monthsBefore: 12, done: true },
  { id: "3",  title: "Definir orçamento total",          category: "outros",    monthsBefore: 12, done: false, tip: "Inclua uma reserva de 10–15% para imprevistos" },
  { id: "4",  title: "Visitar e reservar o espaço",      category: "local",     monthsBefore: 12, done: false, tip: "Os melhores locais esgotam com 1–2 anos de antecedência" },
  { id: "5",  title: "Contratar fotógrafo",              category: "foto",      monthsBefore: 12, done: false },
  { id: "6",  title: "Contratar cinegrafista",           category: "foto",      monthsBefore: 12, done: false },
  { id: "7",  title: "Criar perfil no Weddiners",        category: "outros",    monthsBefore: 12, done: true },

  // 9–12 meses antes
  { id: "8",  title: "Contratar buffet",                 category: "buffet",    monthsBefore: 9,  done: false, tip: "Faça degustação antes de fechar" },
  { id: "9",  title: "Contratar DJ ou banda",            category: "musica",    monthsBefore: 9,  done: false },
  { id: "10", title: "Começar a buscar o vestido",       category: "vestuario", monthsBefore: 9,  done: false, tip: "Vestidos sob medida levam 6–9 meses" },
  { id: "11", title: "Definir traje do noivo",           category: "vestuario", monthsBefore: 9,  done: false },
  { id: "12", title: "Escolher padrinhos e madrinhas",   category: "outros",    monthsBefore: 9,  done: false },
  { id: "13", title: "Planejar lua de mel",              category: "viagem",    monthsBefore: 9,  done: false, tip: "Reserve voos e hotéis com antecedência para melhores preços" },

  // 6–9 meses antes
  { id: "14", title: "Encomendar vestido",               category: "vestuario", monthsBefore: 6,  done: false },
  { id: "15", title: "Comprar alianças",                 category: "outros",    monthsBefore: 6,  done: false },
  { id: "16", title: "Contratar decorador floral",       category: "local",     monthsBefore: 6,  done: false },
  { id: "17", title: "Definir lista de presentes",       category: "outros",    monthsBefore: 6,  done: false },
  { id: "18", title: "Contratar assessor de casamento",  category: "outros",    monthsBefore: 6,  done: false },
  { id: "19", title: "Reservar hotéis para convidados",  category: "viagem",    monthsBefore: 6,  done: false },
  { id: "20", title: "Planejar a cerimônia religiosa",   category: "local",     monthsBefore: 6,  done: false },

  // 3–6 meses antes
  { id: "21", title: "Enviar convites",                  category: "convites",  monthsBefore: 3,  done: false, tip: "Envie com 3–4 meses de antecedência" },
  { id: "22", title: "Contratar maquiadora e cabeleireira", category: "beleza", monthsBefore: 3,  done: false },
  { id: "23", title: "Fazer prova do vestido",           category: "vestuario", monthsBefore: 3,  done: false },
  { id: "24", title: "Definir cardápio com o buffet",    category: "buffet",    monthsBefore: 3,  done: false },
  { id: "25", title: "Escolher música da cerimônia",     category: "musica",    monthsBefore: 3,  done: false },
  { id: "26", title: "Organizar transporte dos noivos",  category: "outros",    monthsBefore: 3,  done: false },
  { id: "27", title: "Fazer teste de maquiagem",         category: "beleza",    monthsBefore: 3,  done: false },

  // 1–3 meses antes
  { id: "28", title: "Confirmar todos os fornecedores",  category: "outros",    monthsBefore: 1,  done: false, tip: "Ligue para cada um e confirme data, horário e endereço" },
  { id: "29", title: "Finalizar lista de convidados",    category: "outros",    monthsBefore: 1,  done: false },
  { id: "30", title: "Organizar mesas dos convidados",   category: "outros",    monthsBefore: 1,  done: false },
  { id: "31", title: "Segunda prova do vestido",         category: "vestuario", monthsBefore: 1,  done: false },
  { id: "32", title: "Comprar acessórios (véu, sapatos)", category: "vestuario",monthsBefore: 1,  done: false },
  { id: "33", title: "Preparar roteiro da festa",        category: "musica",    monthsBefore: 1,  done: false },
  { id: "34", title: "Reservar passagens da lua de mel", category: "viagem",    monthsBefore: 1,  done: false },

  // Últimas semanas
  { id: "35", title: "Confirmar horários com fotógrafo", category: "foto",      monthsBefore: 0,  done: false },
  { id: "36", title: "Preparar envelopes de pagamento",  category: "outros",    monthsBefore: 0,  done: false, tip: "Separe o dinheiro de cada fornecedor com antecedência" },
  { id: "37", title: "Fazer manicure e pedicure",        category: "beleza",    monthsBefore: 0,  done: false },
  { id: "38", title: "Ensaio na cerimônia",              category: "local",     monthsBefore: 0,  done: false },
  { id: "39", title: "Descansar e aproveitar!",          category: "outros",    monthsBefore: 0,  done: false, tip: "Delegue o máximo possível nessa semana" },
];
