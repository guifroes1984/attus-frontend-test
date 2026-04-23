import { Component } from '@angular/core';
import { UsersService } from '../../services/usersService';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { catchError, debounceTime, distinctUntilChanged, map, Observable, of, startWith, switchMap } from 'rxjs';
import { User } from '../../models/user.model';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatInputModule, MatFormFieldModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export class UserList {

  search = new FormControl('');

  loading = false;
  error = false;

  constructor(private service: UsersService) { }

  users$: Observable<User[]> = this.search.valueChanges.pipe(
    startWith(''),
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(term => {
      this.loading = true;
      this.error = false;

      return this.service.getUsers(term || '').pipe(
        map(users => {
          this.loading = false;
          return users;
        }),
        catchError(() => {
          this.loading = false;
          this.error = true;
          return of([]);
        })
      );
    })
  );

}
