3.1. Angular Signals — estado local

import { Component, computed, signal, output } from '@angular/core';

interface CarrinhoItem {
  id: number;
  nome: string;
  quantidade: number;
  preco: number;
}

@Component({
  standalone: true,
  selector: 'app-carrinho',
  template: `
    <div>
      <h3>Carrinho</h3>
      <p>Total: {{ total() | currency }}</p>
      
      @for (item of itens(); track item.id) {
        <div>
          {{ item.nome }} - R$ {{ item.preco }} x {{ item.quantidade }}
          <button (click)="removerItem(item.id)">Remover</button>
        </div>
      }
      
      <button (click)="adicionarItem({ id: 1, nome: 'Produto', quantidade: 1, preco: 10 })">
        Adicionar
      </button>
    </div>
  `
})
export class CarrinhoComponent {
  itens = signal<CarrinhoItem[]>([]);

  total = computed(() => {
    return this.itens().reduce(
      (acc, item) => acc + (item.quantidade * item.preco), 
      0
    );
  });

  totalChange = output<number>();
  
  private previousTotal = 0;
  
  constructor() {
    effect(() => {
      const novoTotal = this.total();
      if (novoTotal !== this.previousTotal) {
        this.previousTotal = novoTotal;
        this.totalChange.emit(novoTotal);
      }
    });
  }
  
  adicionarItem(novoItem: CarrinhoItem): void {
    this.itens.update(itensAtuais => {
      const itemExistente = itensAtuais.find(item => item.id === novoItem.id);
      
      if (itemExistente) {
        return itensAtuais.map(item =>
          item.id === novoItem.id
            ? { ...item, quantidade: item.quantidade + novoItem.quantidade }
            : item
        );
      }
      
      return [...itensAtuais, novoItem];
    });
  }
  
  removerItem(id: number): void {
    this.itens.update(itensAtuais => 
      itensAtuais.filter(item => item.id !== id)
    );
  }
}

3.2. NgRx — Feature To-do

State / Modelo:

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
}

export const initialTodoState: TodoState = {
  todos: [],
  loading: false,
  error: null
};

Ações: 

import { createAction, props } from '@ngrx/store';
import { Todo } from './todo.model';

export const loadTodos = createAction('[Todo] Load Todos');
export const loadTodosSuccess = createAction(
  '[Todo] Load Todos Success',
  props<{ todos: Todo[] }>()
);
export const loadTodosError = createAction(
  '[Todo] Load Todos Error',
  props<{ error: string }>()
);
export const toggleTodoComplete = createAction(
  '[Todo] Toggle Complete',
  props<{ id: string }>()
);

Reducer:

import { createReducer, on } from '@ngrx/store';
import { TodoState, initialTodoState } from './todo.model';
import * as TodoActions from './todo.actions';

export const todoReducer = createReducer(
  initialTodoState,
  
  on(TodoActions.loadTodos, (state): TodoState => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(TodoActions.loadTodosSuccess, (state, { todos }): TodoState => ({
    ...state,
    todos,
    loading: false,
    error: null
  })),
  
  on(TodoActions.loadTodosError, (state, { error }): TodoState => ({
    ...state,
    loading: false,
    error
  })),
  
  on(TodoActions.toggleTodoComplete, (state, { id }): TodoState => ({
    ...state,
    todos: state.todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )
  }))
);

Selectors:

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TodoState } from './todo.model';

export const selectTodoState = createFeatureSelector<TodoState>('todos');

export const selectAllTodos = createSelector(
  selectTodoState,
  (state) => state.todos
);

export const selectPendingTodos = createSelector(
  selectAllTodos,
  (todos) => todos.filter(todo => !todo.completed)
);

export const selectTodosLoading = createSelector(
  selectTodoState,
  (state) => state.loading
);

export const selectTodosError = createSelector(
  selectTodoState,
  (state) => state.error
);

Effect:

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpClient } from '@angular/common/http';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as TodoActions from './todo.actions';
import { Todo } from './todo.model';

@Injectable()
export class TodoEffects {
  constructor(
    private actions$: Actions,
    private http: HttpClient
  ) {}

  loadTodos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.loadTodos),
      switchMap(() =>
        this.http.get<Todo[]>('https://jsonplaceholder.typicode.com/todos?_limit=5').pipe(
          map((todos) => TodoActions.loadTodosSuccess({ todos })),
          catchError((error) =>
            of(TodoActions.loadTodosError({ error: error.message }))
          )
        )
      )
    )
  );
}

Registro no Store (app.config.ts ou standalone):

import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { todoReducer } from './store/todo.reducer';
import { TodoEffects } from './store/todo.effects';

export const appConfig = {
  providers: [
    provideStore({ todos: todoReducer }),
    provideEffects([TodoEffects])
  ]
};