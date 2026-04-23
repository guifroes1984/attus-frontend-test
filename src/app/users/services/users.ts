import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { delay, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Users {
  private users: User[] = [
    {
      id: 1, 
      nome: 'Davi Oliveira Froes', 
      email: 'davi@email.com', 
      cpf: '12345678900', 
      telefone: '999999999',
      tipoTelefone: 'celular',
    },
  ];

  getUsers(): Observable<User[]> {
    return of(this.users).pipe(delay(500));
  }
}
