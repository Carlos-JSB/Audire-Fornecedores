export interface CadastralSocio {
  cpfCnpj: string;
  nome: string;
  tipo: 'Pessoa Física' | 'Pessoa Jurídica';
  dataEntrada: string;
  qualificacao: string;
  faixaEtaria: string;
}

export interface CadastralData {
  // Informações Gerais
  raizCnpj: string;
  razaoSocial: string;
  capitalSocial: string;
  porteEmpresa: string;
  naturezaJuridica: string;
  qualificacaoResponsavel: string;
  criadoEm: string;
  atualizadoEm: string;

  // Estabelecimento
  cnpjCompleto: string;
  tipo: 'Matriz' | 'Filial';
  nomeFantasia: string;
  situacaoCadastral: string;
  dataSituacaoCadastral: string;
  dataInicioAtividades: string;
  pais: string;
  estado: string;
  cidade: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  telefones: string[];
  email: string;

  // Sócios
  socios: CadastralSocio[];

  // Regime Tributário
  optanteSimples: boolean;
  dataOpcaoSimples: string;
  dataExclusaoSimples: string;
  optanteMEI: boolean;

  // Atividades Econômicas
  atividadePrincipal: string;
  atividadesSecundarias: string[];
}

export const cadastralDataBySupplier: Record<string, CadastralData> = {
  '1': {
    raizCnpj: '12.345.678',
    razaoSocial: 'DISTRIBUIDORA NACIONAL LTDA',
    capitalSocial: 'R$ 2.500.000,00',
    porteEmpresa: 'Empresa de Médio Porte',
    naturezaJuridica: '206-2 - Sociedade Empresária Limitada',
    qualificacaoResponsavel: '49 - Sócio-Administrador',
    criadoEm: '2008-03-15',
    atualizadoEm: '2026-01-10',
    cnpjCompleto: '12.345.678/0001-90',
    tipo: 'Matriz',
    nomeFantasia: 'DISTRIBUIDORA NACIONAL',
    situacaoCadastral: 'Ativa',
    dataSituacaoCadastral: '2008-03-15',
    dataInicioAtividades: '2008-04-01',
    pais: 'Brasil',
    estado: 'SP',
    cidade: 'São Paulo',
    cep: '01310-100',
    logradouro: 'Avenida Paulista',
    numero: '1578',
    complemento: 'Sala 1204',
    bairro: 'Bela Vista',
    telefones: ['(11) 3456-7890', '(11) 98765-4321'],
    email: 'contato@distribuidoranacional.com.br',
    socios: [
      { cpfCnpj: '***.456.789-**', nome: 'CARLOS EDUARDO SILVA', tipo: 'Pessoa Física', dataEntrada: '2008-03-15', qualificacao: 'Sócio-Administrador', faixaEtaria: '41-50 anos' },
      { cpfCnpj: '***.789.012-**', nome: 'MARIA FERNANDA OLIVEIRA', tipo: 'Pessoa Física', dataEntrada: '2012-06-20', qualificacao: 'Sócio', faixaEtaria: '31-40 anos' },
    ],
    optanteSimples: false,
    dataOpcaoSimples: '',
    dataExclusaoSimples: '',
    optanteMEI: false,
    atividadePrincipal: '46.49-4-99 - Comércio atacadista de outros equipamentos e artigos de uso pessoal e doméstico',
    atividadesSecundarias: [
      '46.41-9-01 - Comércio atacadista de tecidos',
      '46.42-7-01 - Comércio atacadista de artigos do vestuário e acessórios',
      '47.89-0-99 - Comércio varejista de outros produtos não especificados',
    ],
  },
  '2': {
    raizCnpj: '98.765.432',
    razaoSocial: 'LOGÍSTICA EXPRESS S.A.',
    capitalSocial: 'R$ 15.000.000,00',
    porteEmpresa: 'Empresa de Grande Porte',
    naturezaJuridica: '205-4 - Sociedade Anônima Fechada',
    qualificacaoResponsavel: '05 - Administrador',
    criadoEm: '2001-07-22',
    atualizadoEm: '2026-02-05',
    cnpjCompleto: '98.765.432/0001-10',
    tipo: 'Matriz',
    nomeFantasia: 'LOG EXPRESS',
    situacaoCadastral: 'Ativa',
    dataSituacaoCadastral: '2001-07-22',
    dataInicioAtividades: '2001-08-01',
    pais: 'Brasil',
    estado: 'RJ',
    cidade: 'Rio de Janeiro',
    cep: '20040-020',
    logradouro: 'Rua Buenos Aires',
    numero: '68',
    complemento: '12º Andar',
    bairro: 'Centro',
    telefones: ['(21) 2222-3333', '(21) 99876-5432'],
    email: 'contato@logexpress.com.br',
    socios: [
      { cpfCnpj: '***.123.456-**', nome: 'ROBERTO MENDES CARVALHO', tipo: 'Pessoa Física', dataEntrada: '2001-07-22', qualificacao: 'Diretor', faixaEtaria: '51-60 anos' },
      { cpfCnpj: '12.345.678/0001-**', nome: 'HOLDING TRANSPORTES LTDA', tipo: 'Pessoa Jurídica', dataEntrada: '2015-01-10', qualificacao: 'Sócio', faixaEtaria: '—' },
      { cpfCnpj: '***.654.321-**', nome: 'ANA PAULA SANTOS', tipo: 'Pessoa Física', dataEntrada: '2018-03-15', qualificacao: 'Conselheiro', faixaEtaria: '41-50 anos' },
    ],
    optanteSimples: false,
    dataOpcaoSimples: '',
    dataExclusaoSimples: '',
    optanteMEI: false,
    atividadePrincipal: '49.30-2-02 - Transporte rodoviário de carga, exceto produtos perigosos',
    atividadesSecundarias: [
      '52.11-7-01 - Armazéns gerais – emissão de warrant',
      '52.12-5-00 - Carga e descarga',
    ],
  },
  '3': {
    raizCnpj: '11.222.333',
    razaoSocial: 'TECH PARTS INDÚSTRIA E COMÉRCIO LTDA',
    capitalSocial: 'R$ 800.000,00',
    porteEmpresa: 'Empresa de Pequeno Porte',
    naturezaJuridica: '206-2 - Sociedade Empresária Limitada',
    qualificacaoResponsavel: '49 - Sócio-Administrador',
    criadoEm: '2015-11-03',
    atualizadoEm: '2026-01-28',
    cnpjCompleto: '11.222.333/0001-44',
    tipo: 'Matriz',
    nomeFantasia: 'TECH PARTS',
    situacaoCadastral: 'Ativa',
    dataSituacaoCadastral: '2015-11-03',
    dataInicioAtividades: '2015-12-01',
    pais: 'Brasil',
    estado: 'MG',
    cidade: 'Belo Horizonte',
    cep: '30130-000',
    logradouro: 'Rua da Bahia',
    numero: '1234',
    complemento: '',
    bairro: 'Funcionários',
    telefones: ['(31) 3333-4444'],
    email: 'comercial@techparts.com.br',
    socios: [
      { cpfCnpj: '***.987.654-**', nome: 'LUCAS FERREIRA GOMES', tipo: 'Pessoa Física', dataEntrada: '2015-11-03', qualificacao: 'Sócio-Administrador', faixaEtaria: '31-40 anos' },
    ],
    optanteSimples: true,
    dataOpcaoSimples: '2016-01-01',
    dataExclusaoSimples: '',
    optanteMEI: false,
    atividadePrincipal: '26.10-8-00 - Fabricação de componentes eletrônicos',
    atividadesSecundarias: [
      '26.21-3-00 - Fabricação de equipamentos de informática',
      '46.52-4-00 - Comércio atacadista de componentes eletrônicos',
    ],
  },
  '4': {
    raizCnpj: '44.555.666',
    razaoSocial: 'METALÚRGICA PROGRESSO INDÚSTRIA LTDA',
    capitalSocial: 'R$ 5.000.000,00',
    porteEmpresa: 'Empresa de Médio Porte',
    naturezaJuridica: '206-2 - Sociedade Empresária Limitada',
    qualificacaoResponsavel: '49 - Sócio-Administrador',
    criadoEm: '1995-06-10',
    atualizadoEm: '2026-02-20',
    cnpjCompleto: '44.555.666/0001-77',
    tipo: 'Matriz',
    nomeFantasia: 'METALÚRGICA PROGRESSO',
    situacaoCadastral: 'Ativa',
    dataSituacaoCadastral: '1995-06-10',
    dataInicioAtividades: '1995-07-01',
    pais: 'Brasil',
    estado: 'RS',
    cidade: 'Porto Alegre',
    cep: '90030-000',
    logradouro: 'Avenida Borges de Medeiros',
    numero: '2500',
    complemento: 'Galpão 3',
    bairro: 'Praia de Belas',
    telefones: ['(51) 3210-5678', '(51) 99123-4567'],
    email: 'contato@metprogresso.com.br',
    socios: [
      { cpfCnpj: '***.111.222-**', nome: 'ANTÔNIO MARCOS PEREIRA', tipo: 'Pessoa Física', dataEntrada: '1995-06-10', qualificacao: 'Sócio-Administrador', faixaEtaria: '61-70 anos' },
      { cpfCnpj: '***.333.444-**', nome: 'JULIANA PEREIRA COSTA', tipo: 'Pessoa Física', dataEntrada: '2010-02-15', qualificacao: 'Sócio', faixaEtaria: '31-40 anos' },
      { cpfCnpj: '***.555.666-**', nome: 'MARCOS PEREIRA FILHO', tipo: 'Pessoa Física', dataEntrada: '2018-08-01', qualificacao: 'Sócio', faixaEtaria: '21-30 anos' },
    ],
    optanteSimples: false,
    dataOpcaoSimples: '',
    dataExclusaoSimples: '',
    optanteMEI: false,
    atividadePrincipal: '24.31-8-00 - Produção de barras, perfis e vergalhões de aço',
    atividadesSecundarias: [
      '25.11-0-00 - Fabricação de estruturas metálicas',
      '25.99-3-99 - Fabricação de outros produtos de metal',
    ],
  },
  '5': {
    raizCnpj: '77.888.999',
    razaoSocial: 'ALIMENTOS DO SUL LTDA',
    capitalSocial: 'R$ 1.200.000,00',
    porteEmpresa: 'Empresa de Pequeno Porte',
    naturezaJuridica: '206-2 - Sociedade Empresária Limitada',
    qualificacaoResponsavel: '49 - Sócio-Administrador',
    criadoEm: '2012-09-18',
    atualizadoEm: '2026-02-12',
    cnpjCompleto: '77.888.999/0001-22',
    tipo: 'Matriz',
    nomeFantasia: 'ALIMENTOS DO SUL',
    situacaoCadastral: 'Ativa',
    dataSituacaoCadastral: '2012-09-18',
    dataInicioAtividades: '2012-10-01',
    pais: 'Brasil',
    estado: 'PR',
    cidade: 'Curitiba',
    cep: '80010-000',
    logradouro: 'Rua XV de Novembro',
    numero: '700',
    complemento: '',
    bairro: 'Centro',
    telefones: ['(41) 3030-4040'],
    email: 'vendas@alimentosdosul.com.br',
    socios: [
      { cpfCnpj: '***.222.333-**', nome: 'PATRICIA ALMEIDA SOUZA', tipo: 'Pessoa Física', dataEntrada: '2012-09-18', qualificacao: 'Sócio-Administrador', faixaEtaria: '41-50 anos' },
      { cpfCnpj: '***.444.555-**', nome: 'RICARDO SOUZA NETO', tipo: 'Pessoa Física', dataEntrada: '2012-09-18', qualificacao: 'Sócio', faixaEtaria: '41-50 anos' },
    ],
    optanteSimples: true,
    dataOpcaoSimples: '2013-01-01',
    dataExclusaoSimples: '',
    optanteMEI: false,
    atividadePrincipal: '10.99-6-99 - Fabricação de outros produtos alimentícios',
    atividadesSecundarias: [
      '46.37-1-99 - Comércio atacadista de outros produtos alimentícios',
      '10.91-1-02 - Fabricação de produtos de padaria e confeitaria',
    ],
  },
  '6': {
    raizCnpj: '33.444.555',
    razaoSocial: 'CONSTRUTORA HORIZONTE ENGENHARIA LTDA',
    capitalSocial: 'R$ 10.000.000,00',
    porteEmpresa: 'Empresa de Grande Porte',
    naturezaJuridica: '206-2 - Sociedade Empresária Limitada',
    qualificacaoResponsavel: '49 - Sócio-Administrador',
    criadoEm: '1998-02-28',
    atualizadoEm: '2026-01-25',
    cnpjCompleto: '33.444.555/0001-88',
    tipo: 'Matriz',
    nomeFantasia: 'CONSTRUTORA HORIZONTE',
    situacaoCadastral: 'Ativa',
    dataSituacaoCadastral: '1998-02-28',
    dataInicioAtividades: '1998-04-01',
    pais: 'Brasil',
    estado: 'BA',
    cidade: 'Salvador',
    cep: '40020-000',
    logradouro: 'Avenida Tancredo Neves',
    numero: '3000',
    complemento: 'Torre Sul, Sala 801',
    bairro: 'Caminho das Árvores',
    telefones: ['(71) 3344-5566', '(71) 98877-6655'],
    email: 'diretoria@construtora-horizonte.com.br',
    socios: [
      { cpfCnpj: '***.666.777-**', nome: 'JOSÉ HENRIQUE BATISTA', tipo: 'Pessoa Física', dataEntrada: '1998-02-28', qualificacao: 'Sócio-Administrador', faixaEtaria: '61-70 anos' },
      { cpfCnpj: '***.888.999-**', nome: 'FERNANDA BATISTA LIMA', tipo: 'Pessoa Física', dataEntrada: '2005-04-10', qualificacao: 'Sócio', faixaEtaria: '41-50 anos' },
    ],
    optanteSimples: false,
    dataOpcaoSimples: '',
    dataExclusaoSimples: '',
    optanteMEI: false,
    atividadePrincipal: '41.20-4-00 - Construção de edifícios',
    atividadesSecundarias: [
      '42.11-1-01 - Construção de rodovias e ferrovias',
      '43.30-4-99 - Outras obras de acabamento da construção',
    ],
  },
  '7': {
    raizCnpj: '55.666.777',
    razaoSocial: 'FARMACÊUTICA VIDA INDÚSTRIA E COMÉRCIO S.A.',
    capitalSocial: 'R$ 30.000.000,00',
    porteEmpresa: 'Empresa de Grande Porte',
    naturezaJuridica: '204-6 - Sociedade Anônima Aberta',
    qualificacaoResponsavel: '05 - Administrador',
    criadoEm: '1990-01-15',
    atualizadoEm: '2026-02-15',
    cnpjCompleto: '55.666.777/0001-33',
    tipo: 'Matriz',
    nomeFantasia: 'FARMA VIDA',
    situacaoCadastral: 'Ativa',
    dataSituacaoCadastral: '1990-01-15',
    dataInicioAtividades: '1990-03-01',
    pais: 'Brasil',
    estado: 'GO',
    cidade: 'Goiânia',
    cep: '74000-000',
    logradouro: 'Avenida Anhanguera',
    numero: '5200',
    complemento: 'Bloco A',
    bairro: 'Setor Central',
    telefones: ['(62) 3131-2020', '(62) 99000-1122'],
    email: 'contato@farmavida.com.br',
    socios: [
      { cpfCnpj: '***.010.020-**', nome: 'DR. PAULO RICARDO MENDES', tipo: 'Pessoa Física', dataEntrada: '1990-01-15', qualificacao: 'Presidente', faixaEtaria: '71-80 anos' },
      { cpfCnpj: '***.030.040-**', nome: 'DRA. CAMILA MENDES ROCHA', tipo: 'Pessoa Física', dataEntrada: '2015-06-01', qualificacao: 'Diretor', faixaEtaria: '31-40 anos' },
      { cpfCnpj: '99.888.777/0001-**', nome: 'FUNDO INVEST SAÚDE FIP', tipo: 'Pessoa Jurídica', dataEntrada: '2020-09-15', qualificacao: 'Sócio', faixaEtaria: '—' },
    ],
    optanteSimples: false,
    dataOpcaoSimples: '',
    dataExclusaoSimples: '',
    optanteMEI: false,
    atividadePrincipal: '21.21-1-01 - Fabricação de medicamentos alopáticos para uso humano',
    atividadesSecundarias: [
      '21.23-8-00 - Fabricação de preparações farmacêuticas',
      '46.44-3-01 - Comércio atacadista de medicamentos e drogas de uso humano',
    ],
  },
  '8': {
    raizCnpj: '22.333.444',
    razaoSocial: 'TRANSPORTES RÁPIDO LTDA',
    capitalSocial: 'R$ 3.000.000,00',
    porteEmpresa: 'Empresa de Médio Porte',
    naturezaJuridica: '206-2 - Sociedade Empresária Limitada',
    qualificacaoResponsavel: '49 - Sócio-Administrador',
    criadoEm: '2005-05-20',
    atualizadoEm: '2026-02-14',
    cnpjCompleto: '22.333.444/0001-55',
    tipo: 'Matriz',
    nomeFantasia: 'TRANSPORTES RÁPIDO',
    situacaoCadastral: 'Ativa',
    dataSituacaoCadastral: '2005-05-20',
    dataInicioAtividades: '2005-06-01',
    pais: 'Brasil',
    estado: 'SC',
    cidade: 'Florianópolis',
    cep: '88010-000',
    logradouro: 'Rua Felipe Schmidt',
    numero: '450',
    complemento: 'Sala 302',
    bairro: 'Centro',
    telefones: ['(48) 3025-6789', '(48) 99111-2233'],
    email: 'operacoes@transportesrapido.com.br',
    socios: [
      { cpfCnpj: '***.050.060-**', nome: 'GUSTAVO HENRIQUE MARTINS', tipo: 'Pessoa Física', dataEntrada: '2005-05-20', qualificacao: 'Sócio-Administrador', faixaEtaria: '51-60 anos' },
      { cpfCnpj: '***.070.080-**', nome: 'RENATA MARTINS SOUZA', tipo: 'Pessoa Física', dataEntrada: '2005-05-20', qualificacao: 'Sócio', faixaEtaria: '51-60 anos' },
    ],
    optanteSimples: false,
    dataOpcaoSimples: '',
    dataExclusaoSimples: '',
    optanteMEI: false,
    atividadePrincipal: '49.30-2-02 - Transporte rodoviário de carga, exceto produtos perigosos',
    atividadesSecundarias: [
      '52.50-8-01 - Comissaria de despachos',
      '52.12-5-00 - Carga e descarga',
    ],
  },
};
