# Projeto

Projeto desenvolvido em Angular com foco em boas práticas de arquitetura, organização de código e uso de componentes reutilizáveis.

---

## Como rodar

```bash
npm install
ng serve

Acesse: http://localhost:4200

Tecnologias
Angular 17
RxJS
Angular Material
Decisões técnicas
Uso de RxJS

O RxJS foi utilizado para lidar com operações assíncronas e gerenciamento de estado reativo, especialmente em:

chamadas HTTP
manipulação de streams de dados
controle de eventos do usuário

A escolha do RxJS se dá porque ele já é amplamente integrado ao Angular e permite maior controle sobre fluxos complexos, como:

debounce em buscas
cancelamento de requisições (switchMap)
composição de múltiplas fontes de dados
Signals (Angular 17)

Signals não foram adotados como padrão principal neste projeto, mas poderiam ser usados para:

estados locais simples
reatividade mais direta e menos verbosa
substituição de BehaviorSubjects em casos simples

Optou-se por manter RxJS como principal abordagem por:

maior maturidade no ecossistema Angular
melhor suporte para cenários complexos (HTTP + operadores)
maior familiaridade em projetos corporativos