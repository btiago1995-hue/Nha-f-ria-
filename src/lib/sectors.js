/**
 * Cape Verde economic sectors and their typical departments.
 * Used to pre-populate department options based on company sector.
 */
export const CV_SECTORS = [
  {
    key: 'turismo',
    label: 'Turismo / Hotelaria',
    icon: '🏨',
    departments: ['Receção', 'F&B', 'Housekeeping', 'Eventos', 'Comercial', 'Manutenção'],
  },
  {
    key: 'telecom',
    label: 'Telecomunicações',
    icon: '📡',
    departments: ['TI', 'Rede', 'Comercial', 'Apoio ao Cliente', 'Jurídico', 'Regulação'],
  },
  {
    key: 'banca',
    label: 'Banca / Seguros',
    icon: '🏦',
    departments: ['Crédito', 'Risco', 'Compliance', 'Operações', 'Atendimento', 'TI'],
  },
  {
    key: 'retalho',
    label: 'Retalho / Distribuição',
    icon: '🛒',
    departments: ['Compras', 'Logística/Armazém', 'Vendas', 'Financeiro'],
  },
  {
    key: 'construcao',
    label: 'Construção',
    icon: '🏗️',
    departments: ['Obra/Projecto', 'Orçamentação', 'Compras', 'Administrativo'],
  },
  {
    key: 'pesca',
    label: 'Pesca / Indústria',
    icon: '🐟',
    departments: ['Produção', 'Qualidade', 'Logística', 'Comercial Export'],
  },
  {
    key: 'ti',
    label: 'TI / Startups',
    icon: '💻',
    departments: ['Desenvolvimento', 'Produto', 'Suporte', 'Comercial'],
  },
  {
    key: 'outro',
    label: 'Outro',
    icon: '🏢',
    departments: ['Administrativo', 'Financeiro', 'RH', 'Comercial', 'TI', 'Operações'],
  },
];

export const DEFAULT_DEPARTMENTS = ['Administrativo', 'Financeiro', 'RH', 'Comercial', 'TI', 'Operações'];

export const getDepartments = (sectorKey) => {
  if (!sectorKey) return DEFAULT_DEPARTMENTS;
  const sector = CV_SECTORS.find(s => s.key === sectorKey);
  return sector ? sector.departments : DEFAULT_DEPARTMENTS;
};

export const getSectorLabel = (sectorKey) => {
  const sector = CV_SECTORS.find(s => s.key === sectorKey);
  return sector ? sector.label : 'Setor não definido';
};
