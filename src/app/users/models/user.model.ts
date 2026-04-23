export interface User {
    id: number;
    nome: string;
    email: string;
    cpf: string;
    telefone: string;
    tipoTelefone: 'celular' | 'fixo';
}