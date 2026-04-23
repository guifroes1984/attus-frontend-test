import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { delay, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private users: User[] = [
    {
      id: 1,
      nome: 'Davi Oliveira Froes',
      email: 'davi@email.com',
      cpf: '12345678900',
      telefone: '999999999',
      tipoTelefone: 'celular',
    },
     {
      id: 2,
      nome: 'Guilherme Froes',
      email: 'gui@email.com',
      cpf: '12345678900',
      telefone: '888888888',
      tipoTelefone: 'fixo',
    }, 
     {
      id: 3,
      nome: 'Fran Oliveira Froes',
      email: 'fran@email.com',
      cpf: '12345678900',
      telefone: '777777777',
      tipoTelefone: 'celular',
    }
  ];

  getUsers(term: string) {
    const filtered = this.users.filter(user =>
      user.nome.toLowerCase().includes(term.toLowerCase())
    );

    return of(filtered).pipe(delay(500));
  }
}
