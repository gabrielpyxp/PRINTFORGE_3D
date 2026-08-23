# Microsserviço de precificação

Serviço Spring Boot responsável exclusivamente por calcular o preço sugerido de uma peça impressa em 3D. Ele não acessa o PostgreSQL/Neon: a API Node é quem persiste o resultado quando ele for vinculado a um produto.

## Requisitos e execução

- JDK 21
- Maven 3.6.3 ou superior

O projeto usa Spring Boot 4.1.0 e compila com `--release 21`.

```bash
cd backend-java
mvn test
mvn spring-boot:run
```

O serviço inicia em `http://localhost:8080`. Para gerar o JAR executável, use `mvn package` e execute `java -jar target/calculadora-precificacao-1.0.0.jar`.

Também há um `Dockerfile` para a orquestração do projeto:

```bash
docker build -t loja-3d-calculadora ./backend-java
docker run --rm -p 8080:8080 loja-3d-calculadora
```

## Configuração

| Variável | Padrão | Uso |
| --- | --- | --- |
| `SERVER_PORT` | `8080` | Porta HTTP do serviço. |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Origens permitidas, separadas por vírgula. |

Em produção, configure `CORS_ALLOWED_ORIGINS` com os domínios reais do frontend. O serviço não habilita credenciais/cookies CORS.

## API

`POST /calculo/precificacao`

```json
{
  "pesoFilamentoG": 120,
  "custoFilamentoPorKg": 95,
  "tempoImpressaoH": 6.5,
  "potenciaImpressoraW": 150,
  "custoKwh": 0.95,
  "margemLucroPercentual": 40
}
```

Resposta `200 OK`:

```json
{
  "custoFilamento": 11.40,
  "custoEnergia": 0.93,
  "custoTotalProducao": 12.33,
  "valorLucro": 4.93,
  "precoFinalSugerido": 17.26
}
```

As fórmulas aplicadas são:

```text
custo do filamento = (peso em g / 1000) * custo do filamento por kg
custo de energia   = tempo de impressão (h) * (potência em W / 1000) * custo do kWh
custo total        = custo do filamento + custo de energia
lucro              = custo total * (margem de lucro / 100)
preço final        = custo total + lucro
```

Os valores de moeda são calculados com `BigDecimal`, arredondados para duas casas com `HALF_UP` em cada etapa financeira. Isso evita erros de ponto flutuante e mantém os valores retornados conciliáveis (`total = filamento + energia` e `final = total + lucro`).

Todos os campos são obrigatórios. Peso deve ser maior que zero; custos, tempo, potência e margem não podem ser negativos. Uma entrada inválida recebe `400` com um corpo como:

```json
{
  "status": 400,
  "erro": "Dados inválidos",
  "mensagem": "Corrija os campos informados e tente novamente.",
  "campos": {
    "pesoFilamentoG": "pesoFilamentoG deve ser maior que zero"
  }
}
```

## Testes

`mvn test` cobre a aplicação das fórmulas, arredondamento e as regras principais de validação do DTO.
