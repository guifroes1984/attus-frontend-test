import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { BehaviorSubject, delay, map, Observable, of } from 'rxjs';

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

  private usersSubject = new BehaviorSubject<User[]>(this.users);

  users$ = this.usersSubject.asObservable();

  getUsers(term: string): Observable<User[]> {
    return this.users$.pipe(
      map(users =>
        users.filter(u =>
          u.nome.toLowerCase().includes(term.toLowerCase())
        )
      )
    );
  }

  addUser(user: User) {
    this.users = [...this.users, user];
    this.usersSubject.next(this.users);
  }

  updateUser(updated: User) {
    this.users = this.users.map(u =>
      u.id === updated.id ? updated : u
    );
    this.usersSubject.next(this.users);
  }

}