2.1. Change Detection e OnPush

Problema identificado:
O componente usa OnPush, que só dispara change detection quando:

Uma @Input() bindada muda (referência)

Um evento do template ocorre

Um Observable vinculado via async pipe emite

O setInterval altera contador, mas não dispara detecção. Além disso, o subscribe manual também não dispara.

import { ChangeDetectionStrategy, Component, Injectable, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { of, Subscription, interval } from 'rxjs';
import { delay, takeUntil, Subject } from 'rxjs/operators';

@Injectable()
class PessoaService {
  buscarPorId(id: number) {
    return of({ id, nome: 'João' }).pipe(delay(500));
  }
}

@Component({
  selector: 'app-root',
  providers: [PessoaService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h1>{{ texto }}</h1>`,
})
export class AppComponent implements OnInit, OnDestroy {
  texto: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private readonly pessoaService: PessoaService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.pessoaService.buscarPorId(1)
      .pipe(takeUntil(this.destroy$))
      .subscribe((pessoa) => {
        this.texto = `Nome: ${pessoa.nome}`;
        this.cdr.markForCheck();
      });

    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.contador++;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

Explicação: ChangeDetectorRef.markForCheck() sinaliza ao Angular que este componente precisa ser verificado no próximo ciclo de detecção.

2.2. RxJS — eliminando subscriptions aninhadas

import { switchMap } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

ngOnInit(): void {
  const pessoaId = 1;
  
  this.pessoaService.buscarPorId(pessoaId).pipe(
    switchMap(pessoa => 
      this.pessoaService.buscarQuantidadeFamiliares(pessoaId).pipe(
        map(qtd => ({ pessoa, qtd }))
      )
    ),
    takeUntil(this.destroy$)
  ).subscribe(({ pessoa, qtd }) => {
    this.texto = `Nome: ${pessoa.nome} | familiares: ${qtd}`;
  });
}

switchMap cancela a assinatura anterior se uma nova emissão chegar, ideal para cenários onde o resultado anterior perde relevância

Alternativa com forkJoin se ambas as chamadas forem independentes:

forkJoin({
  pessoa: this.pessoaService.buscarPorId(pessoaId),
  qtd: this.pessoaService.buscarQuantidadeFamiliares(pessoaId)
}).pipe(takeUntil(this.destroy$))
.subscribe(({ pessoa, qtd }) => {
  this.texto = `Nome: ${pessoa.nome} | familiares: ${qtd}`;
});

2.3. RxJS — busca com debounce

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Produto {
  id: number;
  nome: string;
}

@Injectable({ providedIn: 'root' })
export class BuscaService {
  constructor(private http: HttpClient) {}

  buscar(termo: string): Observable<Produto[]> {
    return this.http.get<Produto[]>(`/api/produtos?search=${termo}`);
  }
}

Componente:

import { Component, inject, DestroyRef } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, AsyncPipe],
  template: `
    <input [formControl]="buscaControl" placeholder="Buscar..." />
    
    <div *ngIf="loading$ | async">Carregando...</div>
    <div *ngIf="erro$ | async">Erro na busca</div>
    
    <ul>
      <li *ngFor="let item of resultados$ | async">
        {{ item.nome }}
      </li>
    </ul>
  `
})
export class BuscaComponent {
  private buscaService = inject(BuscaService);
  private destroyRef = inject(DestroyRef);
  
  buscaControl = new FormControl('');
  
  private busca$ = this.buscaControl.valueChanges.pipe(
    debounceTime(500),
    distinctUntilChanged(),
    switchMap(termo => {
      this.loadingSubject.next(true);
      return this.buscaService.buscar(termo || '').pipe(
        catchError(erro => {
          this.erroSubject.next(true);
          return of([]);
        })
      );
    }),
    takeUntilDestroyed(this.destroyRef)
  );
  
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();
  
  private erroSubject = new BehaviorSubject<boolean>(false);
  erro$ = this.erroSubject.asObservable();
  
  resultados$ = this.busca$.pipe(
    tap(() => {
      this.loadingSubject.next(false);
      this.erroSubject.next(false);
    })
  );
}

2.4. Performance — OnPush e trackBy

Por que trackBy melhora a performance:
Quando um array é re-renderizado, o Angular precisa decidir quais elementos do DOM devem ser recriados. Sem trackBy, o Angular usa identidade por posição (primeiro item, segundo item...). Com trackBy, o Angular usa um identificador único (ex: item.id).

<!-- Sem trackBy - recria todos os itens -->
@for (item of lista; track $index) {
  <app-card [data]="item" />
}

<!-- Com trackBy - recria apenas itens que mudaram ou foram realocados -->
@for (item of lista; track item.id) {
  <app-card [data]="item" />
}

## Impacto do OnPush neste cenário

| Estratégia | Comportamento | Impacto com centenas de itens |
|-----------|--------------|-------------------------------|
| OnPush | Só verifica componente quando `@Input` muda (referência), eventos do template ou `async pipe` | Excelente — cada card só verifica se seu `data.id` ou `data.nome` mudou |
| Default | Verifica toda a árvore (todos os cards) a cada tick do change detection | Ruim — mesmo um scroll, hover ou timer global dispara verificação em centenas de cards |

Impacto da estratégia Default:

Ações triviais (movimento de mouse, setInterval de terceiros) disparam verificação em todos os componentes
Com 500 cards, cada ciclo de detecção verifica 500 componentes
Resultado: UI engasgada, baixo FPS, potencial travamento