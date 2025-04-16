import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { ChartBar, TrendingUp, AlertTriangle, TrendingDown, Activity, Plus, MoreHorizontal, Info, Search, Pin, Download, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableStatus,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { 
  Form,
  FormField,
  FormItem,
  FormControl
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as XLSX from 'xlsx';
import axios from 'axios';
import CardsAcaoDiariaContas from "@/components/AcaoDiariaContas";

interface DadosLoja {
  chaveLoja: string;
  cnpj: string;
  nomeLoja: string;
  mesM3: number;
  mesM2: number;
  mesM1: number;
  mesM0: number;
  situacao: "ativa" | "bloqueada" | "em processo de encerramento";
  dataUltTrxContabil: Date;
  dataUltTrxNegocio: Date;
  dataBloqueio?: Date;
  dataInauguracao: Date;
  agencia: string;
  telefoneLoja: string;
  nomeContato: string;
  gerenciaRegional: string;
  diretoriaRegional: string;
  tendencia: "queda" | "atencao" | "estavel" | "comecando";
  endereco?: string;
  nomePdv?: string;
  multiplicadorResponsavel?: string;
  dataCertificacao?: Date;
  situacaoTablet?: "Instalado" | "Retirado" | "S.Tablet";
  produtosHabilitados?: {
    consignado: boolean;
    microsseguro: boolean;
    lime: boolean;
  };
  motivoBloqueio?: string;
}

interface DadosEstrategia {
  titulo: string;
  visaoGeral: string;
  dadosAnaliticos?: DadosLoja[];
}

interface FiltrosLoja {
  chaveLoja: string;
  cnpj: string;
  nomeLoja: string;
  situacao: string;
  agencia: string;
  gerenciaRegional: string;
  diretoriaRegional: string;
  tendencia: string;
}

const dadosSimulados: Record<string, DadosEstrategia> = {
  "credito": {
    titulo: "Estratégia de Crédito",
    visaoGeral: "Aumentar a oferta de produtos de crédito para clientes com bom histórico financeiro.",
    dadosAnaliticos: [
      {
        chaveLoja: "5001",
        cnpj: "12.345.678/0001-99",
        nomeLoja: "Loja Centro",
        mesM3: 15,
        mesM2: 18,
        mesM1: 22,
        mesM0: 20,
        situacao: "ativa",
        dataUltTrxContabil: new Date("2023-03-25"),
        dataUltTrxNegocio: new Date("2023-03-27"),
        dataInauguracao: new Date("2020-05-15"),
        agencia: "0001",
        telefoneLoja: "(11) 3456-7890",
        nomeContato: "João Silva",
        gerenciaRegional: "São Paulo Centro",
        diretoriaRegional: "Sudeste",
        tendencia: "estavel",
        endereco: "Av. Paulista, 1000 - Centro, São Paulo/SP",
        nomePdv: "Centro SP",
        multiplicadorResponsavel: "Carlos Oliveira",
        dataCertificacao: new Date("2022-10-05"),
        situacaoTablet: "Instalado",
        produtosHabilitados: {
          consignado: true,
          microsseguro: true,
          lime: false
        }
      },
      {
        chaveLoja: "5002",
        cnpj: "23.456.789/0001-88",
        nomeLoja: "Loja Shopping Vila Olímpia",
        mesM3: 10,
        mesM2: 12,
        mesM1: 15,
        mesM0: 18,
        situacao: "ativa",
        dataUltTrxContabil: new Date("2023-03-26"),
        dataUltTrxNegocio: new Date("2023-03-28"),
        dataInauguracao: new Date("2021-11-20"),
        agencia: "0002",
        telefoneLoja: "(11) 3456-7891",
        nomeContato: "Maria Santos",
        gerenciaRegional: "São Paulo Zona Sul",
        diretoriaRegional: "Sudeste",
        tendencia: "comecando",
        endereco: "Shopping Vila Olímpia, Loja 42 - São Paulo/SP",
        nomePdv: "Vila Olímpia",
        multiplicadorResponsavel: "Ana Pereira",
        dataCertificacao: new Date("2022-09-15"),
        situacaoTablet: "Instalado",
        produtosHabilitados: {
          consignado: true,
          microsseguro: false,
          lime: true
        }
      },
      {
        chaveLoja: "5003",
        cnpj: "34.567.890/0001-77",
        nomeLoja: "Loja Campinas Shopping",
        mesM3: 8,
        mesM2: 6,
        mesM1: 5,
        mesM0: 3,
        situacao: "ativa",
        dataUltTrxContabil: new Date("2023-03-25"),
        dataUltTrxNegocio: new Date("2023-03-25"),
        dataInauguracao: new Date("2019-03-10"),
        agencia: "0015",
        telefoneLoja: "(19) 3456-7892",
        nomeContato: "Pedro Almeida",
        gerenciaRegional: "Campinas",
        diretoriaRegional: "Interior SP",
        tendencia: "queda",
        endereco: "Campinas Shopping, Loja 67 - Campinas/SP",
        nomePdv: "Campinas Shop",
        multiplicadorResponsavel: "Roberto Costa",
        dataCertificacao: new Date("2022-11-20"),
        situacaoTablet: "Instalado",
        produtosHabilitados: {
          consignado: true,
          microsseguro: true,
          lime: true
        }
      },
      {
        chaveLoja: "5004",
        cnpj: "45.678.901/0001-66",
        nomeLoja: "Loja Rio Branco",
        mesM3: 5,
        mesM2: 7,
        mesM1: 9,
        mesM0: 11,
        situacao: "ativa",
        dataUltTrxContabil: new Date("2023-03-01"),
        dataUltTrxNegocio: new Date("2023-03-01"),
        dataInauguracao: new Date("2018-06-05"),
        agencia: "0032",
        telefoneLoja: "(21) 3456-7893",
        nomeContato: "Fernanda Lima",
        gerenciaRegional: "Rio de Janeiro Centro",
        diretoriaRegional: "Rio de Janeiro",
        tendencia: "comecando",
        endereco: "Av. Rio Branco, 156 - Centro, Rio de Janeiro/RJ",
        nomePdv: "Rio Branco",
        multiplicadorResponsavel: "Paulo Mendes",
        dataCertificacao: new Date("2021-05-10"),
        situacaoTablet: "Instalado",
        produtosHabilitados: {
          consignado: true,
          microsseguro: true,
          lime: true
        }
      },
      {
        chaveLoja: "5005",
        cnpj: "56.789.012/0001-55",
        nomeLoja: "Loja Salvador Shopping",
        mesM3: 12,
        mesM2: 8,
        mesM1: 6,
        mesM0: 4,
        situacao: "ativa",
        dataUltTrxContabil: new Date("2023-03-10"),
        dataUltTrxNegocio: new Date("2023-03-15"),
        dataInauguracao: new Date("2017-09-22"),
        agencia: "0048",
        telefoneLoja: "(71) 3456-7894",
        nomeContato: "Luciana Costa",
        gerenciaRegional: "Salvador",
        diretoriaRegional: "Nordeste",
        tendencia: "queda",
        endereco: "Salvador Shopping, Loja 33 - Salvador/BA",
        nomePdv: "Salvador Shop",
        multiplicadorResponsavel: "Marcos Vieira",
        dataCertificacao: new Date("2020-11-05"),
        situacaoTablet: "S.Tablet",
        produtosHabilitados: {
          consignado: true,
          microsseguro: true,
          lime: false
        }
      }
    ]
  },
  "abertura-conta": {
    titulo: "Estratégia de Abertura de Contas",
    visaoGeral: "Cada ação no dia a dia fortalece sua gestão. Atue com estratégia e transforme desafios em resultados!",
    dadosAnaliticos: [
      {
        chaveLoja: "5001",
        cnpj: "12.345.678/0001-99",
        nomeLoja: "Loja Centro",
        mesM3: 12,
        mesM2: 10,
        mesM1: 15,
        mesM0: 14,
        situacao: "ativa",
        dataUltTrxContabil: new Date("2023-03-25"),
        dataUltTrxNegocio: new Date("2023-03-27"),
        dataInauguracao: new Date("2020-05-15"),
        agencia: "0001",
        telefoneLoja: "(11) 3456-7890",
        nomeContato: "João Silva",
        gerenciaRegional: "São Paulo Centro",
        diretoriaRegional: "Sudeste",
        tendencia: "estavel",
        endereco: "Av. Paulista, 1000 - Centro, São Paulo/SP",
        nomePdv: "Centro SP",
        multiplicadorResponsavel: "Carlos Oliveira",
        dataCertificacao: new Date("2022-10-05"),
        situacaoTablet: "Instalado",
        produtosHabilitados: {
          consignado: true,
          microsseguro: true,
          lime: false
        }
      },
      {
        chaveLoja: "5002",
        cnpj: "23.456.789/0001-88",
        nomeLoja: "Loja Shopping Vila Olímpia",
        mesM3: 8,
        mesM2: 6,
        mesM1: 4,
        mesM0: 5,
        situacao: "ativa",
        dataUltTrxContabil: new Date("2023-03-26"),
        dataUltTrxNegocio: new Date("2023-03-28"),
        dataInauguracao: new Date("2021-11-20"),
        agencia: "0002",
        telefoneLoja: "(11) 3456-7891",
        nomeContato: "Maria Santos",
        gerenciaRegional: "São Paulo Zona Sul",
        diretoriaRegional: "Sudeste",
        tendencia: "queda",
        endereco: "Shopping Vila Olímpia, Loja 42 - São Paulo/SP",
        nomePdv: "Vila Olímpia",
        multiplicadorResponsavel: "Ana Pereira",
        dataCertificacao: new Date("2022-09-15"),
        situacaoTablet: "Instalado",
        produtosHabilitados: {
          consignado: true,
          microsseguro: false,
          lime: true
        }
      },
      {
        chaveLoja: "5003",
        cnpj: "34.567.890/0001-77",
        nomeLoja: "Loja Campinas Shopping",
        mesM3: 5,
        mesM2: 7,
        mesM1: 9,
        mesM0: 13,
        situacao: "ativa",
        dataUltTrxContabil: new Date("2023-03-25"),
        dataUltTrxNegocio: new Date("2023-03-25"),
        dataInauguracao: new Date("2019-03-10"),
        agencia: "0015",
        telefoneLoja: "(19) 3456-7892",
        nomeContato: "Pedro Almeida",
        gerenciaRegional: "Campinas",
        diretoriaRegional: "Interior SP",
        tendencia: "comecando",
        endereco: "Campinas Shopping, Loja 67 - Campinas/SP",
        nomePdv: "Campinas Shop",
        multiplicadorResponsavel: "Roberto Costa",
        dataCertificacao: new Date("2022-11-20"),
        situacaoTablet: "Instalado",
        produtosHabilitados: {
          consignado: true,
          microsseguro: true,
          lime: true
        }
      },
      {
        chaveLoja: "5004",
        cnpj: "45.678.901/0001-66",
        nomeLoja: "Loja Rio Branco",
        mesM3: 10,
        mesM2: 8,
        mesM1: 6,
        mesM0: 5,
        situacao: "bloqueada",
        dataUltTrxContabil: new Date("2023-03-01"),
        dataUltTrxNegocio: new Date("2023-03-01"),
        dataBloqueio: new Date("2023-03-02"),
        dataInauguracao: new Date("2018-06-05"),
        agencia: "0032",
        telefoneLoja: "(21) 3456-7893",
        nomeContato: "Fernanda Lima",
        gerenciaRegional: "Rio de Janeiro Centro",
        diretoriaRegional: "Rio de Janeiro",
        tendencia: "queda",
        endereco: "Av. Rio Branco, 156 - Centro, Rio de Janeiro/RJ",
        nomePdv: "Rio Branco",
        multiplicadorResponsavel: "Paulo Mendes",
        dataCertificacao: new Date("2021-05-10"),
        situacaoTablet: "Retirado",
        produtosHabilitados: {
          consignado: false,
          microsseguro: false,
          lime: false
        },
        motivoBloqueio: "Bloqueio temporário devido a irregularidades na documentação. Necessário regularização com a gerência regional."
      },
      {
        chaveLoja: "5005",
        cnpj: "56.789.012/0001-55",
        nomeLoja: "Loja Salvador Shopping",
        mesM3: 7,
        mesM2: 7,
        mesM1: 8,
        mesM0: 6,
        situacao: "em processo de encerramento",
        dataUltTrxContabil: new Date("2023-03-10"),
        dataUltTrxNegocio: new Date("2023-03-15"),
        dataInauguracao: new Date("2017-09-22"),
        agencia: "0048",
        telefoneLoja: "(71) 3456-7894",
        nomeContato: "Luciana Costa",
        gerenciaRegional: "Salvador",
        diretoriaRegional: "Nordeste",
        tendencia: "queda",
        endereco: "Salvador Shopping, Loja 33 - Salvador/BA",
        nomePdv: "Salvador Shop",
        multiplicadorResponsavel: "Marcos Vieira",
        dataCertificacao: new Date("2020-11-05"),
        situacaoTablet: "S.Tablet",
        produtosHabilitados: {
          consignado: false,
          microsseguro: true,
          lime: false
        }
      },
      {
        chaveLoja: "5006",
        cnpj: "67.890.123/0001-44",
        nomeLoja: "Loja Belo Horizonte",
        mesM3: 9,
        mesM2: 11,
        mesM1: 10,
        mesM0: 12,
        situacao: "ativa",
        dataUltTrxContabil: new Date("2023-03-29"),
        dataUltTrxNegocio: new Date("2023-03-29"),
        dataInauguracao: new Date("2019-12-10"),
        agencia: "0056",
        telefoneLoja: "(31) 3456-7895",
        nomeContato: "Ricardo Souza",
        gerenciaRegional: "Belo Horizonte",
        diretoriaRegional: "Minas Gerais",
        tendencia: "estavel",
        endereco: "Av. Afonso Pena, 1500 - Centro, Belo Horizonte/MG",
        nomePdv: "BH Centro",
        multiplicadorResponsavel: "Camila Rocha",
        dataCertificacao: new Date("2022-07-15"),
        situacaoTablet: "Instalado",
        produtosHabilitados: {
          consignado: true,
          microsseguro: true,
          lime: true
        }
      }
    ]
  },
  "seguro": {
    titulo: "Estratégia de Seguros",
    visaoGeral: "Ampliar carteira de seguros com foco em microsseguros e seguros residenciais.",
    dadosAnaliticos: [
      {
        chaveLoja: "5001",
        cnpj: "12.345.678/0001-99",
        nomeLoja: "Loja Centro",
        mesM3: 8,
        mesM2: 10,
        mesM1: 12,
        mesM0: 15,
        situacao: "ativa",
        dataUltTrxContabil: new Date("2023-03-25"),
        dataUltTrxNegocio: new Date("2023-03-27"),
        dataInauguracao: new Date("2020-05-15"),
        agencia: "0001",
        telefoneLoja: "(11) 3456-7890",
        nomeContato: "João Silva",
        gerenciaRegional: "São Paulo Centro",
        diretoriaRegional: "Sudeste",
        tendencia: "comecando",
        endereco: "Av. Paulista, 1000 - Centro, São Paulo/SP",
        nomePdv: "Centro SP",
        multiplicadorResponsavel: "Carlos Oliveira",
        dataCertificacao: new Date("2022-10-05"),
        situacaoTablet: "Instalado",
        produtosHabilitados: {
          consignado: true,
          microsseguro: true,
          lime: false
        }
      },
      {
        chaveLoja: "5002",
        cnpj: "23.456.789/0001-88",
        nomeLoja: "Loja Shopping Vila Olímpia",
        mesM3: 7,
        mesM2: 9,
        mesM1: 11,
        mesM0: 14,
        situacao: "ativa",
        dataUltTrxContabil: new Date("2023-03-26"),
        dataUltTrxNegocio: new Date("2023-03-28"),
        dataInauguracao: new Date("2021-11-20"),
        agencia: "0002",
        telefoneLoja: "(11) 3456-7891",
        nomeContato: "Maria Santos",
        gerenciaRegional: "São Paulo Zona Sul",
        diretoriaRegional: "Sudeste",
        tendencia: "comecando",
        endereco: "Shopping Vila Olímpia, Loja 42 - São Paulo/SP",
        nomePdv: "Vila Olímpia",
        multiplicadorResponsavel: "Ana Pereira",
        dataCertificacao: new Date("2022-09-15"),
        situacaoTablet: "Instalado",
        produtosHabilitados: {
          consignado: true,
          microsseguro: true,
          lime: true
        }
      },
      {
        chaveLoja: "5003",
        cnpj: "34.567.890/0001-77",
        nomeLoja: "Loja Campinas Shopping",
        mesM3: 3,
        mesM2: 2,
        mesM1: 1,
        mesM0: 0,
        situacao: "ativa",
        dataUltTrxContabil: new Date("2023-02-25"),
        dataUltTrxNegocio: new Date("2023-02-25"),
        dataInauguracao: new Date("2019-03-10"),
        agencia: "0015",
        telefoneLoja: "(19) 3456-7892",
        nomeContato: "Pedro Almeida",
        gerenciaRegional: "Campinas",
        diretoriaRegional: "Interior SP",
        tendencia: "queda",
        endereco: "Campinas Shopping, Loja 67 - Campinas/SP",
        nomePdv: "Campinas Shop",
        multiplicadorResponsavel: "Roberto Costa",
        dataCertificacao: new Date("2022-11-20"),
        situacaoTablet: "Instalado",
        produtosHabilitados: {
          consignado: true,
          microsseguro: false,
          lime: true
        }
      },
      {
        chaveLoja: "5004",
        cnpj: "45.678.901/0001-66",
        nomeLoja: "Loja Rio Branco",
        mesM3: 6,
        mesM2: 8,
        mesM1: 5,
        mesM0: 7,
        situacao: "ativa",
        dataUltTrxContabil: new Date("2023-03-20"),
        dataUltTrxNegocio: new Date("2023-03-20"),
        dataInauguracao: new Date("2018-06-05"),
        agencia: "0032",
        telefoneLoja: "(21) 3456-7893",
        nomeContato: "Fernanda Lima",
        gerenciaRegional: "Rio de Janeiro Centro",
        diretoriaRegional: "Rio de Janeiro",
        tendencia: "estavel",
        endereco: "Av. Rio Branco, 156 - Centro, Rio de Janeiro/RJ",
        nomePdv: "Rio Branco",
        multiplicadorResponsavel: "Paulo Mendes",
        dataCertificacao: new Date("2021-05-10"),
        situacaoTablet: "Instalado",
        produtosHabilitados: {
          consignado: true,
          microsseguro: true,
          lime: true
        }
      },
      {
        chaveLoja: "5005",
        cnpj: "56.789.012/0001-55",
        nomeLoja: "Loja Salvador Shopping",
        mesM3: 5,
        mesM2: 4,
        mesM1: 3,
        mesM0: 2,
        situacao: "ativa",
        dataUltTrxContabil: new Date("2023-03-10"),
        dataUltTrxNegocio: new Date("2023-03-15"),
        dataInauguracao: new Date("2017-09-22"),
        agencia: "0048",
        telefoneLoja: "(71) 3456-7894",
        nomeContato: "Luciana Costa",
        gerenciaRegional: "Salvador",
        diretoriaRegional: "Nordeste",
        tendencia: "atencao",
        endereco: "Salvador Shopping, Loja 33 - Salvador/BA",
        nomePdv: "Salvador Shop",
        multiplicadorResponsavel: "Marcos Vieira",
        dataCertificacao: new Date("2020-11-05"),
        situacaoTablet: "S.Tablet",
        produtosHabilitados: {
          consignado: false,
          microsseguro: true,
          lime: false
        }
      }
    ]
  }
};

const DetalhesEstrategia: React.FC = () => {
  const navigate = useNavigate();
  const { produto } = useParams<{ produto: string }>();
  const [dados, setDados] = useState<DadosEstrategia | null>(null);
  const [lojaExpandida, setLojaExpandida] = useState<string | null>(null);
  const [dadosFiltrados, setDadosFiltrados] = useState<DadosLoja[]>([]);
  const [ordenacao, setOrdenacao] = useState<{
    coluna: keyof DadosLoja | null;
    direcao: 'asc' | 'desc';
  }>({ coluna: null, direcao: 'asc' });
  const { user, isManager } = useAuth();
  const [modalBloqueio, setModalBloqueio] = useState<{
    isOpen: boolean;
    loja: DadosLoja | null;
  }>({
    isOpen: false,
    loja: null
  });

  
  const [lojasMarcadas, setLojasMarcadas] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const API_BASE_URL = 'http://localhost:3001'; // Altere para o endereço e porta corretos do seu servidor

  const form = useForm<FiltrosLoja>({
    defaultValues: {
      chaveLoja: "",
      cnpj: "",
      nomeLoja: "",
      situacao: "",
      agencia: "",
      gerenciaRegional: "",
      diretoriaRegional: "",
      tendencia: "",
    }
  });

  // Função para verificar o status do servidor
  const checkServerStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/health`);
      console.log('Status do servidor:', response.data);
      
      if (response.data.status === 'ok') {
        setConnectionStatus('connected');
        
        if (!response.data.tableExists) {
          console.error('Tabela oportunidades_contas não existe no banco de dados!');
          setError('A tabela oportunidades_contas não foi encontrada no banco de dados.');
          return false;
        }
        
        if (response.data.recordCount === 0) {
          console.warn('Nenhum registro encontrado na tabela oportunidades_contas para abertura-conta.');
          setError('Nenhum registro encontrado na tabela oportunidades_contas. Verifique se o script SQL foi executado.');
          return false;
        }
        
        return true;
      } else {
        setConnectionStatus('error');
        setError('Servidor disponível, mas reportou um erro.');
        return false;
      }
    } catch (err) {
      console.error('Erro ao verificar status do servidor:', err);
      setConnectionStatus('error');
      setError('Não foi possível conectar ao servidor. Verifique se o servidor está rodando na porta correta.');
      return false;
    }
  };

  // Função para buscar dados da tabela de oportunidades_contas
  const fetchOportunidadesContas = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Usamos o mesmo endpoint e token de autenticação que o server-modular.js utiliza
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Nenhum token de autenticação encontrado no localStorage');
        throw new Error('Token de autenticação não encontrado');
      }
      
      console.log('Iniciando busca de dados: /api/oportunidades-contas');
      
      // Autenticar usuário manualmente se necessário
      // Para testes, vamos tentar fazer login novamente para garantir um token válido
      //  try {
        // Esta parte só será executada durante testes e desenvolvimento
        // Você pode remover após confirmar que tudo está funcionando
       // if (window.location.hostname === 'localhost') {
       //   const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
       //     funcional: '9444168', // Funcional do admin
       //     password: 'hashed_password' // Senha conforme definido no script de exemplo
      //    });
          
     //     if (loginResponse.data && loginResponse.data.token) {
     //       console.log('Login bem-sucedido, atualizando token...');
     //       localStorage.setItem('token', loginResponse.data.token);
    //      }
    //  }
      //} catch (loginErr) {
      //  console.warn('Tentativa de login automático falhou, usando token existente');
      //}
      
      // Obtém o token (possivelmente atualizado)
      const updatedToken = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/api/oportunidades-contas`, {
        headers: {
          Authorization: `Bearer ${updatedToken}`
        },
        params: {
          tipoEstrategia: 'abertura-conta'
        }
      });
      
      console.log('Dados recebidos do servidor:', response.data);
      
      if (!response.data || response.data.length === 0) {
        console.warn('Nenhum dado recebido do servidor, usando dados simulados');
        setConnectionStatus('error');
        setError('Nenhum registro encontrado na tabela oportunidades_contas. Verifique se o script SQL foi executado corretamente.');
        throw new Error('Nenhum dado recebido');
      }
      
      // Convertemos o formato do banco para o formato utilizado pelo componente
      const lojas = response.data.map((item: any) => ({
        chaveLoja: item.CHAVE_LOJA,
        cnpj: item.CNPJ,
        nomeLoja: item.NOME_LOJA,
        mesM3: item.MES_M3 || 0,
        mesM2: item.MES_M2 || 0,
        mesM1: item.MES_M1 || 0,
        mesM0: item.MES_M0 || 0,
        situacao: item.SITUACAO || 'ativa',
        dataUltTrxContabil: item.ULT_TRX_CONTABIL ? new Date(item.ULT_TRX_CONTABIL) : new Date(),
        dataUltTrxNegocio: item.ULT_TRX_NEGOCIO ? new Date(item.ULT_TRX_NEGOCIO) : new Date(),
        dataBloqueio: item.DATA_BLOQUEIO ? new Date(item.DATA_BLOQUEIO) : undefined,
        dataInauguracao: item.DATA_INAUGURACAO ? new Date(item.DATA_INAUGURACAO) : new Date(),
        agencia: item.COD_AG || '',
        telefoneLoja: item.TELEFONE || '',
        nomeContato: item.CONTATO || '',
        gerenciaRegional: item.GER_REGIONAL || '',
        diretoriaRegional: item.DIR_REGIONAL || '',
        tendencia: item.TENDENCIA || 'estavel',
        endereco: item.LOCALIZACAO || '',
        nomePdv: item.NOME_PDV || '',
        multiplicadorResponsavel: item.MULTIPLICADOR_RESPONSAVEL || '',
        dataCertificacao: item.DATA_CERTIFICACAO ? new Date(item.DATA_CERTIFICACAO) : undefined,
        situacaoTablet: item.STATUS_TABLET || 'S.Tablet',
        produtosHabilitados: {
          consignado: Boolean(item.HABILITADO_CONSIGNADO),
          microsseguro: Boolean(item.HABILITADO_MICROSSEGURO),
          lime: Boolean(item.HABILITADO_LIME)
        },
        motivoBloqueio: item.MOTIVO_BLOQUEIO || ''
      }));
      
      console.log(`Convertidos ${lojas.length} registros para o formato do componente`);
      setConnectionStatus('connected');
      
      // Atualizamos o objeto abertura-conta com os dados reais
      if (produto === 'abertura-conta') {
        const estrategiaAtualizada = {
          ...dadosSimulados['abertura-conta'],
          dadosAnaliticos: lojas
        };
        
        setDados(estrategiaAtualizada);
        setDadosFiltrados(lojas);
        console.log('Dados reais aplicados com sucesso para abertura-conta');
      } else if (produto && produto in dadosSimulados) {
        setDados(dadosSimulados[produto]);
        if (dadosSimulados[produto].dadosAnaliticos) {
          setDadosFiltrados(dadosSimulados[produto].dadosAnaliticos || []);
        }
      }
      
    } catch (err: any) {
      console.error('Erro ao buscar dados de oportunidades:', err);
      if (err.response) {
        // O servidor respondeu com um status de erro
        console.error('Resposta do servidor:', err.response.status, err.response.data);
        setError(`Erro ${err.response.status}: ${err.response.data.message || 'Erro ao comunicar com o servidor'}`);
      } else if (err.request) {
        // A requisição foi feita mas não houve resposta
        console.error('Sem resposta do servidor:', err.request);
        setError('Servidor não está respondendo. Verifique se ele está rodando.');
      } else {
        // Algum erro na configuração da requisição
        console.error('Erro na requisição:', err.message);
        setError(err.message);
      }
      
      setConnectionStatus('error');
      
      // Em caso de erro, carregamos os dados simulados como fallback
      if (produto && produto in dadosSimulados) {
        console.log('Usando dados simulados como fallback');
        setDados(dadosSimulados[produto]);
        if (dadosSimulados[produto].dadosAnaliticos) {
          setDadosFiltrados(dadosSimulados[produto].dadosAnaliticos || []);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (produto === 'abertura-conta') {
      fetchOportunidadesContas();
    } else if (produto && produto in dadosSimulados) {
      setDados(dadosSimulados[produto]);
      if (dadosSimulados[produto].dadosAnaliticos) {
        setDadosFiltrados(dadosSimulados[produto].dadosAnaliticos || []);
      }
    }
  }, [produto]);

  const aplicarFiltros = (values: FiltrosLoja) => {
    if (!dados?.dadosAnaliticos) return;
    
    const filtrados = dados.dadosAnaliticos.filter(loja => {
      if (values.chaveLoja && !loja.chaveLoja.includes(values.chaveLoja)) return false;
      if (values.cnpj && !loja.cnpj.includes(values.cnpj)) return false;
      if (values.nomeLoja && !loja.nomeLoja.toLowerCase().includes(values.nomeLoja.toLowerCase())) return false;
      if (values.situacao && values.situacao !== "all" && loja.situacao !== values.situacao) return false;
      if (values.agencia && !loja.agencia.includes(values.agencia)) return false;
      if (values.gerenciaRegional && values.gerenciaRegional !== "all" && !loja.gerenciaRegional.includes(values.gerenciaRegional)) return false;
      if (values.diretoriaRegional && values.diretoriaRegional !== "all" && !loja.diretoriaRegional.includes(values.diretoriaRegional)) return false;
      if (values.tendencia && values.tendencia !== "all" && loja.tendencia !== values.tendencia) return false;
      
      return true;
    });
        
    setDadosFiltrados(filtrados);
  };

  const limparFiltros = () => {
    form.reset();
    if (dados?.dadosAnaliticos) {
      setDadosFiltrados(dados.dadosAnaliticos);
    }
  };

  const handleOrdenacao = (coluna: keyof DadosLoja) => {
    setOrdenacao(prev => ({
      coluna,
      direcao: prev.coluna === coluna && prev.direcao === 'asc' ? 'desc' : 'asc'
    }));
  };

  const dadosOrdenados = React.useMemo(() => {
    if (!ordenacao.coluna) return dadosFiltrados;

    return [...dadosFiltrados].sort((a, b) => {
      const valorA = a[ordenacao.coluna!];
      const valorB = b[ordenacao.coluna!];

      if (valorA === valorB) return 0;
      
      const comparacao = valorA < valorB ? -1 : 1;
      return ordenacao.direcao === 'asc' ? comparacao : -comparacao;
    });
  }, [dadosFiltrados, ordenacao]);

  const exportarParaExcel = () => {
    // Preparar os dados para exportação
    const dadosParaExportar = dadosOrdenados.map(loja => ({
      'Chave Loja': loja.chaveLoja,
      'CNPJ': loja.cnpj,
      'Nome Loja': loja.nomeLoja,
      'Agência': loja.agencia,
      'M-3': loja.mesM3,
      'M-2': loja.mesM2,
      'M-1': loja.mesM1,
      'M0': loja.mesM0,
      'Situação': loja.situacao,
      'Últ. Contábil': formatDate(loja.dataUltTrxContabil),
      'Últ. Negócio': formatDate(loja.dataUltTrxNegocio),
      'Tendência': loja.tendencia,
      'Gerência Regional': loja.gerenciaRegional,
      'Diretoria Regional': loja.diretoriaRegional
    }));

    // Criar uma nova planilha
    const ws = XLSX.utils.json_to_sheet(dadosParaExportar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dados");

    // Gerar o arquivo Excel
    const nomeProduto = produto === "abertura-conta" ? "Abertura De Contas" : 
                        produto === "credito" ? "Crédito" : "Produto";
    XLSX.writeFile(wb, `Analítico BE (${nomeProduto}) - ${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
  };

  const handleVoltar = () => {
    navigate('/estrategia-comercial');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Carregando dados...</p>
      </div>
    );
  }

  // Mostramos uma mensagem específica baseada no status da conexão
  if (connectionStatus === 'error') {
    console.warn(`Erro de conexão: ${error}`);
    // Continuamos com os dados simulados, apenas adicionamos um aviso na tela
  }

  if (!dados) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Produto não encontrado ou dados indisponíveis.</p>
      </div>
    );
  }

  const renderTendenciaIcon = (tendencia: string) => {
    switch(tendencia) {
      case "queda":
        return <TrendingDown size={16} className="text-red-500" />;
      case "atencao":
        return <AlertTriangle size={16} className="text-amber-500" />;
      case "estavel":
        return <Activity size={16} className="text-blue-500" />;
      case "comecando":
        return <TrendingUp size={16} className="text-green-500" />;
      default:
        return null;
    }
  };

  const formatDate = (date: Date) => {
    if (!date) return "—";
    return format(date, "dd/MM/yyyy", {locale: ptBR});
  };
  
  const toggleLojaExpandida = (chaveLoja: string) => {
    if (lojaExpandida === chaveLoja) {
      setLojaExpandida(null);
    } else {
      setLojaExpandida(chaveLoja);
    }
  };

  const getOpcoesUnicas = (campo: keyof DadosLoja) => {
    if (!dados?.dadosAnaliticos) return [];
    return Array.from(new Set(dados.dadosAnaliticos.map(loja => loja[campo] as string))).filter(Boolean);
  };

  const situacoes = ["ativa", "bloqueada", "em processo de encerramento"];
  const gerenciasRegionais = getOpcoesUnicas("gerenciaRegional");
  const diretoriasRegionais = getOpcoesUnicas("diretoriaRegional");

  const toggleLojaMarcada = (chaveLoja: string) => {
    setLojasMarcadas(prev => {
      const novoSet = new Set(prev);
      if (novoSet.has(chaveLoja)) {
        novoSet.delete(chaveLoja);
      } else {
        novoSet.add(chaveLoja);
      }
      return novoSet;
    });
  };

  const renderCards = () => {
    if (produto === "abertura-conta") {
      return (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <CardsAcaoDiariaContas />
          
          <Card className="border-2 border-lime-200 bg-gradient-to-r from-lime-50 to-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-lime-800">Universitários</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lime-600 mb-4">
                Jovens estudantes universitários, ideais para pacotes iniciais com foco digital e possibilidade de expansão futura.
              </p>
              <div className="flex justify-end">
                <Button className="bg-lime-600 hover:bg-lime-700">
                  Ver detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-blue-800">Contas PJ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-600 mb-4">
                Empresas e MEIs que precisam de contas empresariais com benefícios e taxas competitivas.
              </p>
              <div className="flex justify-end">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Ver detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    } else if (produto === "credito") {
      return (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-emerald-800">Crédito Pessoal Facilitado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-emerald-600 mb-4">
                Oferta para clientes com bom histórico, taxas reduzidas e aprovação rápida.
              </p>
              <div className="flex justify-end">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Ver detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-purple-800">Consignado Premium</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-600 mb-4">
                Para funcionários públicos e aposentados, menor taxa do mercado e maior prazo.
              </p>
              <div className="flex justify-end">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Ver detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-amber-800">Financiamento Imobiliário</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-600 mb-4">
                Taxas competitivas e condições especiais para aquisição da casa própria.
              </p>
              <div className="flex justify-end">
                <Button className="bg-amber-600 hover:bg-amber-700">
                  Ver detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    } else if (produto === "seguro") {
      return (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-red-800">Microsseguro Família Protegida</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600 mb-4">
                Proteção básica para famílias de baixa renda com valor acessível e cobertura essencial.
              </p>
              <div className="flex justify-end">
                <Button className="bg-red-600 hover:bg-red-700">
                  Ver detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-cyan-200 bg-gradient-to-r from-cyan-50 to-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-cyan-800">Residencial Simplificado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-cyan-600 mb-4">
                Proteção para residências com coberturas básicas, preço acessível e contratação descomplicada.
              </p>
              <div className="flex justify-end">
                <Button className="bg-cyan-600 hover:bg-cyan-700">
                  Ver detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-orange-800">Vida Individual Premium</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-600 mb-4">
                Seguro de vida completo com coberturas ampliadas para indivíduos de alto valor.
              </p>
              <div className="flex justify-end">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Ver detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="container mx-auto">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleVoltar}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{dados.titulo}</h1>
            <p className="text-gray-500">Estratégia Comercial - {user?.name}</p>
          </div>
        </div>

        {connectionStatus === 'error' && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg shadow-sm">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
              <span className="font-medium">Aviso:</span>
              <span className="ml-2">{error || 'Usando dados de demonstração devido a um erro de conexão com o servidor.'}</span>
            </div>
            <p className="text-sm mt-1 ml-7">Para usar dados reais, verifique se o servidor está rodando e se o script SQL foi executado.</p>
          </div>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Visão Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{dados.visaoGeral}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {produto === "abertura-conta" && (
            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl text-blue-800">Ação Diária</CardTitle>
                    <p className="text-sm text-blue-600 mt-1">Loja que necessita atenção hoje</p>
                  </div>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    Hoje
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-blue-800">Loja Centro</h4>
                      <p className="text-sm text-gray-600">Chave: 5001 - Ag: 0001</p>
                    </div>
                    <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                      Pendente
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Situação:</span> 5 contas abertas no sistema legado
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Contato:</span> João Silva
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="default" 
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => window.location.href = '/migracao-contas'}
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Iniciar Tratativa
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {produto === "credito" && (
            <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl text-green-800">Prioridades do Mês</CardTitle>
                    <p className="text-sm text-green-600 mt-1">Crédito Pessoal e Consignado</p>
                  </div>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {format(new Date(), 'MMM/yyyy', {locale: ptBR})}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-lg border border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-green-800">Loja Shopping Vila Olímpia</h4>
                      <p className="text-sm text-gray-600">Chave: 5002 - Ag: 0002</p>
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Alta Conversão
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Oportunidade:</span> Potencial de 25 contratos de crédito consignado
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Público:</span> Funcionários da empresa ABC Ltda.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="default" 
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => window.location.href = '/propostas-credito'}
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Ver Propostas
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {produto === "seguro" && (
            <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl text-indigo-800">Campanha Ativa</CardTitle>
                    <p className="text-sm text-indigo-600 mt-1">Microsseguro Residencial</p>
                  </div>
                  <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                    Até {format(new Date(new Date().setDate(new Date().getDate() + 15)), 'dd/MM', {locale: ptBR})}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-lg border border-indigo-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-indigo-800">Promoção Proteção Familiar</h4>
                      <p className="text-sm text-gray-600">Seguro a partir de R$ 9,90/mês</p>
                    </div>
                    <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                      Exclusivo BE
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Meta:</span> 5 seguros por correspondente
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Bônus:</span> Comissão extra de 2% para lojas que baterem a meta
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="default" 
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => window.location.href = '/campanha-seguro'}
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Ver Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-gray-50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Tendência</CardTitle>
                <TrendingUp size={24} className="text-gray-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-green-50 transition-colors"
                  onClick={() => {
                    form.setValue('tendencia', 'comecando');
                    aplicarFiltros(form.getValues());
                  }}
                >
                  <div className="bg-green-100 p-2 rounded-full">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Crescimento</p>
                    <p className="text-xl font-semibold text-green-800">
                      {dados?.dadosAnaliticos?.filter(loja => loja.tendencia === "comecando").length || 0}
                    </p>
                  </div>
                </div>
                <div 
                  className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={() => {
                    form.setValue('tendencia', 'estavel');
                    aplicarFiltros(form.getValues());
                  }}
                >
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estável</p>
                    <p className="text-xl font-semibold text-blue-800">
                      {dados?.dadosAnaliticos?.filter(loja => loja.tendencia === "estavel").length || 0}
                    </p>
                  </div>
                </div>
                <div 
                  className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-amber-50 transition-colors"
                  onClick={() => {
                    form.setValue('tendencia', 'atencao');
                    aplicarFiltros(form.getValues());
                  }}
                >
                  <div className="bg-amber-100 p-2 rounded-full">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Atenção</p>
                    <p className="text-xl font-semibold text-amber-800">
                      {dados?.dadosAnaliticos?.filter(loja => loja.tendencia === "atencao").length || 0}
                    </p>
                  </div>
                </div>
                <div 
                  className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-red-50 transition-colors"
                  onClick={() => {
                    form.setValue('tendencia', 'queda');
                    aplicarFiltros(form.getValues());
                  }}
                >
                  <div className="bg-red-100 p-2 rounded-full">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Queda</p>
                    <p className="text-xl font-semibold text-red-800">
                      {dados?.dadosAnaliticos?.filter(loja => loja.tendencia === "queda").length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  {produto === "abertura-conta" && (
                    <>
                      <CardTitle className="text-lg">Lojas Sem Abertura</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">Lojas ativas sem movimentação de contas</p>
                    </>
                  )}
                  {produto === "credito" && (
                    <>
                      <CardTitle className="text-lg">Oportunidades de Crédito</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">Correspondentes sem propostas no mês</p>
                    </>
                  )}
                  {produto === "seguro" && (
                    <>
                      <CardTitle className="text-lg">Lojas com Potencial</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">Correspondentes qualificados para seguros</p>
                    </>
                  )}
                </div>
                {produto === "abertura-conta" && <AlertTriangle size={24} className="text-gray-500" />}
                {produto === "credito" && <ChartBar size={24} className="text-gray-500" />}
                {produto === "seguro" && <Info size={24} className="text-gray-500" />}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      {produto === "abertura-conta" && (
                        <>
                          <h4 className="font-semibold text-gray-800">Análise de Inatividade</h4>
                          <p className="text-sm text-gray-600">Identificação de lojas que precisam de atenção</p>
                        </>
                      )}
                      {produto === "credito" && (
                        <>
                          <h4 className="font-semibold text-gray-800">Avaliação de Público-Alvo</h4>
                          <p className="text-sm text-gray-600">Lojas com potencial para ofertas de crédito</p>
                        </>
                      )}
                      {produto === "seguro" && (
                        <>
                          <h4 className="font-semibold text-gray-800">Correspondentes Certificados</h4>
                          <p className="text-sm text-gray-600">Multiplicadores treinados em produtos de seguros</p>
                        </>
                      )}
                    </div>
                    <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                      {produto === "abertura-conta" && (
                        <>
                          {dados?.dadosAnaliticos?.filter(loja => 
                            loja.situacao === "ativa" && 
                            loja.mesM0 === 0 && 
                            loja.mesM1 === 0 && 
                            loja.mesM2 === 0 && 
                            loja.mesM3 === 0
                          ).length || 0} Lojas
                        </>
                      )}
                      {produto === "credito" && (
                        <>
                          {dados?.dadosAnaliticos?.filter(loja => 
                            loja.situacao === "ativa" && 
                            loja.produtosHabilitados?.consignado === true
                          ).length || 0} Lojas
                        </>
                      )}
                      {produto === "seguro" && (
                        <>
                          {dados?.dadosAnaliticos?.filter(loja => 
                            loja.situacao === "ativa" && 
                            loja.produtosHabilitados?.microsseguro === true
                          ).length || 0} Lojas
                        </>
                      )}
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">
                      {produto === "abertura-conta" && (
                        <>
                          <span className="font-medium">Situação:</span> Lojas ativas sem movimentação nos últimos 4 meses
                        </>
                      )}
                      {produto === "credito" && (
                        <>
                          <span className="font-medium">Oportunidade:</span> Correspondentes com produto habilitado sem propostas recentes
                        </>
                      )}
                      {produto === "seguro" && (
                        <>
                          <span className="font-medium">Destaque:</span> Correspondentes aptos a oferecer microsseguros e proteção residencial
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    variant="default" 
                    size="sm"
                    className={`
                      ${produto === "abertura-conta" ? "bg-gray-600 hover:bg-gray-700" : ""} 
                      ${produto === "credito" ? "bg-green-600 hover:bg-green-700" : ""}
                      ${produto === "seguro" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                    `}
                    onClick={() => window.location.href = produto === "abertura-conta" 
                      ? '/analise-inatividade' 
                      : produto === "credito" 
                        ? '/oportunidades-credito' 
                        : '/potencial-seguros'
                    }
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    {produto === "abertura-conta" && "Ver Análise Detalhada"}
                    {produto === "credito" && "Explorar Oportunidades"}
                    {produto === "seguro" && "Ver Correspondentes"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="oportunidades">
          <TabsList className="mb-4">
            <TabsTrigger value="oportunidades">Oportunidades</TabsTrigger>
            <TabsTrigger value="acoes">Correspondentes Marcados</TabsTrigger>
            {isManager && <TabsTrigger value="gerencial">Visão Gerencial</TabsTrigger>}
          </TabsList>

          <TabsContent value="oportunidades">
            {(produto === "abertura-conta" || produto === "credito" || produto === "seguro") && dados.dadosAnaliticos ? (
              <Card>
                <CardHeader>
                  <CardTitle>Quadro Analítico de Oportunidades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 bg-gray-50 rounded-lg p-4">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(aplicarFiltros)} className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                            <Search size={16} />
                            Filtrar lojas
                          </h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={exportarParaExcel}
                            className="flex items-center gap-2"
                          >
                            <Download size={16} />
                            Exportar Excel
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          <FormField
                            control={form.control}
                            name="chaveLoja"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Chave Loja" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="cnpj"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="CNPJ" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="nomeLoja"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Nome da Loja" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="situacao"
                            render={({ field }) => (
                              <FormItem>
                                <Select 
                                  onValueChange={field.onChange} 
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Situação" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="all">Todas</SelectItem>
                                    {situacoes.map(situacao => (
                                      <SelectItem key={situacao} value={situacao}>
                                        {situacao === "ativa" ? "Ativa" : 
                                         situacao === "bloqueada" ? "Bloqueada" : 
                                         "Em encerramento"}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="agencia"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Agência" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="gerenciaRegional"
                            render={({ field }) => (
                              <FormItem>
                                <Select 
                                  onValueChange={field.onChange} 
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Gerência Regional" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="all">Todas</SelectItem>
                                    {gerenciasRegionais.map(gr => (
                                      <SelectItem key={gr} value={gr}>{gr}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="diretoriaRegional"
                            render={({ field }) => (
                              <FormItem>
                                <Select 
                                  onValueChange={field.onChange} 
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Diretoria Regional" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="all">Todas</SelectItem>
                                    {diretoriasRegionais.map(dr => (
                                      <SelectItem key={dr} value={dr}>{dr}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={limparFiltros}
                          >
                            Limpar
                          </Button>
                          <Button type="submit">
                            Aplicar Filtros
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead 
                            className="w-[120px] cursor-pointer hover:bg-gray-100" 
                            onClick={() => handleOrdenacao('chaveLoja')}
                          >
                            <div className="flex items-center gap-1">
                              Chave Loja
                              {ordenacao.coluna === 'chaveLoja' && (
                                <span>{ordenacao.direcao === 'asc' ? '↑' : '↓'}</span>
                              )}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-100"
                            onClick={() => handleOrdenacao('nomeLoja')}
                          >
                            <div className="flex items-center gap-1">
                              Nome Loja
                              {ordenacao.coluna === 'nomeLoja' && (
                                <span>{ordenacao.direcao === 'asc' ? '↑' : '↓'}</span>
                              )}
                            </div>
                          </TableHead>
                          <TableHead className="text-center" colSpan={4}>
                            <div className="mb-1">Qtd. Contas</div>
                            <div className="grid grid-cols-4 gap-2 text-xs font-normal">
                              <div 
                                className="cursor-pointer hover:bg-gray-100"
                                onClick={() => handleOrdenacao('mesM3')}
                              >
                                M-3 {ordenacao.coluna === 'mesM3' && (ordenacao.direcao === 'asc' ? '↑' : '↓')}
                              </div>
                              <div 
                                className="cursor-pointer hover:bg-gray-100"
                                onClick={() => handleOrdenacao('mesM2')}
                              >
                                M-2 {ordenacao.coluna === 'mesM2' && (ordenacao.direcao === 'asc' ? '↑' : '↓')}
                              </div>
                              <div 
                                className="cursor-pointer hover:bg-gray-100"
                                onClick={() => handleOrdenacao('mesM1')}
                              >
                                M-1 {ordenacao.coluna === 'mesM1' && (ordenacao.direcao === 'asc' ? '↑' : '↓')}
                              </div>
                              <div 
                                className="cursor-pointer hover:bg-gray-100"
                                onClick={() => handleOrdenacao('mesM0')}
                              >
                                M0 {ordenacao.coluna === 'mesM0' && (ordenacao.direcao === 'asc' ? '↑' : '↓')}
                              </div>
                            </div>
                          </TableHead>
                          <TableHead 
                            className="text-center cursor-pointer hover:bg-gray-100"
                            onClick={() => handleOrdenacao('situacao')}
                          >
                            <div className="flex items-center justify-center gap-1">
                              Situação
                              {ordenacao.coluna === 'situacao' && (
                                <span>{ordenacao.direcao === 'asc' ? '↑' : '↓'}</span>
                              )}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="text-center cursor-pointer hover:bg-gray-100"
                            onClick={() => handleOrdenacao('dataUltTrxContabil')}
                          >
                            <div className="flex items-center justify-center gap-1">
                              Últ. Contábil
                              {ordenacao.coluna === 'dataUltTrxContabil' && (
                                <span>{ordenacao.direcao === 'asc' ? '↑' : '↓'}</span>
                              )}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="text-center cursor-pointer hover:bg-gray-100"
                            onClick={() => handleOrdenacao('dataUltTrxNegocio')}
                          >
                            <div className="flex items-center justify-center gap-1">
                              Últ. Negócio
                              {ordenacao.coluna === 'dataUltTrxNegocio' && (
                                <span>{ordenacao.direcao === 'asc' ? '↑' : '↓'}</span>
                              )}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="text-center cursor-pointer hover:bg-gray-100"
                            onClick={() => handleOrdenacao('tendencia')}
                          >
                            <div className="flex items-center justify-center gap-1">
                              Tendência
                              {ordenacao.coluna === 'tendencia' && (
                                <span>{ordenacao.direcao === 'asc' ? '↑' : '↓'}</span>
                              )}
                            </div>
                          </TableHead>
                          <TableHead className="w-[120px] text-center">
                            <div className="flex items-center justify-center">Ações</div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dadosOrdenados.map((loja) => (
                          <React.Fragment key={loja.chaveLoja}>
                            <TableRow>
                              <TableCell className="font-medium">
                                <div>{loja.chaveLoja}</div>
                                <div className="text-xs text-gray-500">{loja.cnpj}</div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{loja.nomeLoja}</div>
                                <div className="text-xs text-gray-500">
                                  Ag: {loja.agencia}
                                </div>
                              </TableCell>
                              <TableCell className="text-center p-2">{loja.mesM3}</TableCell>
                              <TableCell className="text-center p-2">{loja.mesM2}</TableCell>
                              <TableCell className="text-center p-2">{loja.mesM1}</TableCell>
                              <TableCell className="text-center p-2">{loja.mesM0}</TableCell>
                              <TableCell className="text-center">
                                {loja.situacao === "ativa" ? (
                                  <TableStatus status="realizar" label="Ativa" />
                                ) : loja.situacao === "bloqueada" ? (
                                  <div 
                                    className="cursor-pointer" 
                                    onClick={() => setModalBloqueio({ isOpen: true, loja })}
                                  >
                                    <TableStatus status="bloqueada" label="Bloqueada" />
                                  </div>
                                ) : (
                                  <TableStatus status="pendente" label="Em encerramento" />
                                )}
                              </TableCell>
                              <TableCell className="text-center">{formatDate(loja.dataUltTrxContabil)}</TableCell>
                              <TableCell className="text-center">{formatDate(loja.dataUltTrxNegocio)}</TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center items-center">
                                  {renderTendenciaIcon(loja.tendencia)}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    title="Ver detalhes"
                                    onClick={() => toggleLojaExpandida(loja.chaveLoja)}
                                    className="bg-blue-50 border-blue-200 hover:bg-blue-100"
                                  >
                                    <Info size={16} className="text-blue-600" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    title="Adicionar tratativa"
                                    className="bg-green-50 border-green-200 hover:bg-green-100"
                                  >
                                    <Plus size={16} className="text-green-600" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    title={lojasMarcadas.has(loja.chaveLoja) ? "Desmarcar loja" : "Acompanhar Loja"}
                                    onClick={() => toggleLojaMarcada(loja.chaveLoja)}
                                    className={`${lojasMarcadas.has(loja.chaveLoja) ? 'bg-purple-50 border-purple-200 hover:bg-purple-100' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                                  >
                                    <Pin size={16} className={lojasMarcadas.has(loja.chaveLoja) ? "text-purple-600" : "text-gray-600"} />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                            {lojaExpandida === loja.chaveLoja && (
                              <TableRow className="bg-gray-50">
                                <TableCell colSpan={10} className="py-3">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                      <h4 className="font-medium mb-2">Informações da Loja</h4>
                                      <ul className="space-y-1.5">
                                        <li className="text-sm"><span className="font-medium">Localização:</span> {loja.endereco}</li>
                                        <li className="text-sm"><span className="font-medium">Contato:</span> {loja.nomePdv}</li>
                                        <li className="text-sm"><span className="font-medium">Telefone:</span> {loja.telefoneLoja}</li>
                                        <li className="text-sm"><span className="font-medium">Data Certificação:</span> {loja.dataCertificacao ? formatDate(loja.dataCertificacao) : '—'}</li>
                                        <li className="text-sm"><span className="font-medium">Situação Tablet:</span> {loja.situacaoTablet}</li>
                                      </ul>
                                    </div>
                                    <div>
                                      <h4 className="font-medium mb-2">Hierarquia</h4>
                                      <ul className="space-y-1.5">
                                        <li className="text-sm"><span className="font-medium">Diretoria Regional:</span> {loja.diretoriaRegional}</li>
                                        <li className="text-sm"><span className="font-medium">Gerência Regional:</span> {loja.gerenciaRegional}</li>
                                        <li className="text-sm"><span className="font-medium">Multiplicador:</span> {loja.multiplicadorResponsavel}</li>
                                      </ul>
                                    </div>
                                    <div>
                                      <h4 className="font-medium mb-2">Produtos Habilitados</h4>
                                      <div className="flex flex-col space-y-2">
                                        <div className={`px-2.5 py-1 rounded-full text-xs ${loja.produtosHabilitados?.consignado ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                          Consignado
                                        </div>
                                        <div className={`px-2.5 py-1 rounded-full text-xs ${loja.produtosHabilitados?.microsseguro ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                          Microsseguro
                                        </div>
                                        <div className={`px-2.5 py-1 rounded-full text-xs ${loja.produtosHabilitados?.lime ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                          Lime
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {produto === "abertura-conta" && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Contas Digitais</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Agilize a abertura de contas com o novo fluxo 100% digital. Documentação simplificada e aprovação rápida.</p>
                    </CardContent>
                  </Card>
                )}

                {produto === "abertura-conta" && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Universitários</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Isenção de tarifas por 6 meses para estudantes. Cartão com cashback em materiais escolares.</p>
                    </CardContent>
                  </Card>
                )}

                {produto === "credito" && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Crédito Pessoal Facilitado</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Taxa reduzida para clientes com conta corrente. Pré-aprovação diretamente no aplicativo Bradesco.</p>
                    </CardContent>
                  </Card>
                )}

                {produto === "credito" && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Consignado Premium</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Novo convênio com órgãos federais. Margem ampliada e condições especiais para servidores.</p>
                    </CardContent>
                  </Card>
                )}

                {produto === "seguro" && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Microsseguro Família Protegida</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Cobertura familiar a partir de R$ 9,90/mês. Assistência funeral e pequenas despesas médicas incluídas.</p>
                    </CardContent>
                  </Card>
                )}

                {produto === "seguro" && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Residencial Simplificado</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Proteção para residências contra incêndio, roubo e danos elétricos. Contratação em apenas 5 minutos.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="acoes">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dadosOrdenados
                .filter(loja => lojasMarcadas.has(loja.chaveLoja))
                .map((loja) => (
                  <Card key={loja.chaveLoja} className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-white shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-lg text-purple-800">{loja.nomeLoja}</CardTitle>
                          <p className="text-sm text-purple-600">Chave: {loja.chaveLoja} - Ag: {loja.agencia}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => toggleLojaMarcada(loja.chaveLoja)}
                          className="bg-purple-50 border-purple-200 hover:bg-purple-100"
                        >
                          <Pin size={16} className="text-purple-600" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="bg-white p-3 rounded-lg border border-purple-100">
                          <h4 className="text-sm font-medium text-purple-800 mb-2">Evolução de Contas</h4>
                          <div className="grid grid-cols-4 gap-2">
                            <div className="text-center">
                              <p className="text-xs text-gray-500">M-3</p>
                              <p className="text-lg font-semibold text-purple-800">{loja.mesM3}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">M-2</p>
                              <p className="text-lg font-semibold text-purple-800">{loja.mesM2}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">M-1</p>
                              <p className="text-lg font-semibold text-purple-800">{loja.mesM1}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">M0</p>
                              <p className="text-lg font-semibold text-purple-800">{loja.mesM0}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-purple-100">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Situação:</span> {loja.situacao}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Contato:</span> {loja.nomeContato}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Últ. Contábil:</span> {formatDate(loja.dataUltTrxContabil)}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Últ. Negócio:</span> {formatDate(loja.dataUltTrxNegocio)}
                              </p>
                            </div>
                          </div>
                        </div>
                        {lojaExpandida === loja.chaveLoja && (
                          <div className="bg-white p-3 rounded-lg border border-purple-100">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <h4 className="font-medium mb-2">Informações da Loja</h4>
                                <ul className="space-y-1.5">
                                  <li className="text-sm"><span className="font-medium">Localização:</span> {loja.endereco}</li>
                                  <li className="text-sm"><span className="font-medium">Contato:</span> {loja.nomePdv}</li>
                                  <li className="text-sm"><span className="font-medium">Telefone:</span> {loja.telefoneLoja}</li>
                                  <li className="text-sm"><span className="font-medium">Data Certificação:</span> {loja.dataCertificacao ? formatDate(loja.dataCertificacao) : '—'}</li>
                                  <li className="text-sm"><span className="font-medium">Situação Tablet:</span> {loja.situacaoTablet}</li>
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Hierarquia</h4>
                                <ul className="space-y-1.5">
                                  <li className="text-sm"><span className="font-medium">Diretoria Regional:</span> {loja.diretoriaRegional}</li>
                                  <li className="text-sm"><span className="font-medium">Gerência Regional:</span> {loja.gerenciaRegional}</li>
                                  <li className="text-sm"><span className="font-medium">Multiplicador:</span> {loja.multiplicadorResponsavel}</li>
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Produtos Habilitados</h4>
                                <div className="flex flex-col space-y-2">
                                  <div className={`px-2.5 py-1 rounded-full text-xs ${loja.produtosHabilitados?.consignado ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    Consignado
                                  </div>
                                  <div className={`px-2.5 py-1 rounded-full text-xs ${loja.produtosHabilitados?.microsseguro ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    Microsseguro
                                  </div>
                                  <div className={`px-2.5 py-1 rounded-full text-xs ${loja.produtosHabilitados?.lime ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    Lime
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-blue-50 border-blue-200 hover:bg-blue-100"
                            onClick={() => toggleLojaExpandida(loja.chaveLoja)}
                          >
                            <Info size={16} className="text-blue-600 mr-2" />
                            {lojaExpandida === loja.chaveLoja ? "Ocultar Detalhes" : "Ver Detalhes"}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-green-50 border-green-200 hover:bg-green-100"
                          >
                            <Plus size={16} className="text-green-600 mr-2" />
                            Adicionar Tratativa
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {dadosOrdenados.filter(loja => lojasMarcadas.has(loja.chaveLoja)).length === 0 && (
                <div className="col-span-full text-center py-8">
                  <Pin size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Nenhum correspondente marcado</h3>
                  <p className="text-gray-500 mt-2">
                    Clique no ícone de alfinete nas lojas para marcá-las e acompanhar aqui.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {isManager && (
            <TabsContent value="gerencial">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Visão Consolidada da Equipe</h3>
                    <p>Esta seção contém informações gerenciais detalhadas sobre o desempenho da sua equipe neste produto.</p>
                    <p className="text-amber-600">Disponível apenas para coordenadores e gerentes.</p>
                    
                    <div className="py-4 px-6 bg-gray-50 rounded-lg">
                      <p className="text-gray-500 text-sm italic text-center">
                        Dados detalhados de equipe seriam exibidos aqui em uma implementação completa.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Modal de Bloqueio */}
      <Dialog open={modalBloqueio.isOpen} onOpenChange={() => setModalBloqueio({ isOpen: false, loja: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Bloqueio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Loja</h4>
              <p className="text-sm text-gray-600">
                {modalBloqueio.loja?.nomeLoja} - {modalBloqueio.loja?.chaveLoja}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Data do Bloqueio</h4>
              <p className="text-sm text-gray-600">
                {modalBloqueio.loja?.dataBloqueio ? formatDate(modalBloqueio.loja.dataBloqueio) : '—'}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Motivo do Bloqueio</h4>
              <p className="text-sm text-gray-600">
                {modalBloqueio.loja?.motivoBloqueio || 'Motivo não especificado'}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DetalhesEstrategia;
