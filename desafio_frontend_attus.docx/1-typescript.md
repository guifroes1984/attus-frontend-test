1.1. Refatoração

Código refatorado

interface ProdutoProps {
  id: number;
  descricao: string;
  quantidadeEstoque: number;
}

class Produto {
  constructor(
    public readonly id: number,
    public readonly descricao: string,
    public readonly quantidadeEstoque: number
  ) {}
}

class Verdureira {
  private produtos: Produto[];

  constructor() {
    this.produtos = [
      new Produto(1, 'Maçã', 20),
      new Produto(2, 'Laranja', 0),
      new Produto(3, 'Limão', 20)
    ];
  }

  private buscarProdutoPorId(produtoId: number): Produto | undefined {
    return this.produtos.find(produto => produto.id === produtoId);
  }

  getDescricaoProduto(produtoId: number): string {
    const produto = this.buscarProdutoPorId(produtoId);
    
    if (!produto) {
      throw new Error(`Produto com id ${produtoId} não encontrado`);
    }
    
    return `${produto.id} - ${produto.descricao} (${produto.quantidadeEstoque}x)`;
  }

  hasEstoqueProduto(produtoId: number): boolean {
    const produto = this.buscarProdutoPorId(produtoId);
    return produto ? produto.quantidadeEstoque > 0 : false;
  }
}

/*

        Principais melhorias:

Problema	                Solução

any nos tipos	            Tipagem forte: number, string
Repetição de busca	        Extraído método buscarProdutoPorId
for manual	                Uso de find (mais declarativo)
Sem tratamento de erro	    Validação com throw
Produto mutável	            readonly + parâmetros diretos no constructor
Falta de encapsulamento	    private para produtos

*/

Definição dos tipos

interface PaginaParams {
  pagina: number;
  tamanho: number;
}

1.2. Generics e tipos utilitários

interface Pagina<T> {
  itens: T[];
  total: number;
  paginaAtual: number;
  totalPaginas: number;
}

Função genérica

function filtrarEPaginar<T>(
  data: T[],
  filterFn: (item: T) => boolean,
  params: PaginaParams
): Pagina<T> {
  const itensFiltrados = data.filter(filterFn);

  const inicio = (params.pagina - 1) * params.tamanho;
  const fim = inicio + params.tamanho;

  const itensPaginados = itensFiltrados.slice(inicio, fim);
  
  return {
    itens: itensPaginados,
    total: itensFiltrados.length,
    paginaAtual: params.pagina,
    totalPaginas: Math.ceil(itensFiltrados.length / params.tamanho)
  };
}

Exemplo de uso

interface Usuario {
  id: number;
  nome: string;
  email: string;
}

const usuarios: Usuario[] = [
  { id: 1, nome: 'João Silva', email: 'joao@email.com' },
  { id: 2, nome: 'Maria Santos', email: 'maria@email.com' },
  { id: 3, nome: 'Pedro Souza', email: 'pedro@email.com' },
  { id: 4, nome: 'Ana Lima', email: 'ana@email.com' },
];

const resultado = filtrarEPaginar<Usuario>(
  usuarios,
  (usuario) => usuario.nome.includes('a'),
  { pagina: 1, tamanho: 2 }
);
