1. login screen

2. Menu
HOME
FUNCIONARIOS
ATTEDANCES


## Security
- Path transversal vulnearibily 
- Colocar Hora do Brasil

## Features
- Home Page (Dashboard com visao geral)
- Pagina com lista de usuarios
 - Boostrap icons (Edit -> Delete, Update All, Toogle Status)
 - Font Awesome
- Attendnaces
 -- All Antendaces
 -- Attendances of specific user
   -- By entrada, saida, etc
   -- Heatmap com dias que falataram
- Filter is broken related to stauts
- Adicionar de volta no meu de navegacao o triangulo pra baixo da fonte awesome
- A way to sidebar not appearing as loading due javascript execution
- Unificar htmls de dominions diferentes em somente um
 - Navegar por eles com pushState e usar popstate pra voltar em versoes anteriores
 - users/user.html?view=create,list,edit
 - Em vez daquelas 5 subopaginas separadas, na pagina de list fica create e update tb
 - Férias e Desempenho deixa separado

- serach.js pode ser parametrizavel por id para ser algo melhor e nao ser somente de usuarios
- Ver dps como faz questao de autenticacao
- Dps de feito login redirect pra pagina de funcionarios

- Keep Connection ALive
- Count active users with stateful with COOKIES

- Do this
 Typical Use Case
  In Multi-Page Applications (MPA):
  User loads index.html.
  A small <script> runs and sends a request to /auth/check.
  If response is valid (e.g., HTTP 200), continue loading UI.
  If not valid (e.g., HTTP 401), redirect to login page.

- Add to sidebar navigation, the current page
- Add validations to my frontend 
 - Before submitting
   - Show error messages se tiver algo errado
   - Se for algo mais ou menos ruim, tira com trim, lower, etc
   - Adicionar placeholders nos inputs pra deixar mais claro como tem que preencher
- Adicionar favico
- Melhoras os buttoes e padronizar

### Code
<footer>
    <p>Author: Hege Refsnes<br>
    <a href="mailto:hege@example.com">hege@example.com</a></p>
</footer>
<p>BAKERY AVENIDA @TRADEMARK </p>