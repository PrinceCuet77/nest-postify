# Nest Postify

- Install `nestjs` globally

```
npm install -g @nestjs/cli
```

- Create a project

```
nest new nest-postify

- npm
- no
```

- Create a module

```
nest g module auth
nest g module users
```

- Create a controller file without test file

```
nest g controller auth --no-spec
nest g controller auth --no-spec
```

- Create a service file without test file

```
nest g service auth --no-spec
nest g service users --no-spec
```

- Create a interface with no extra folder

```
nest g interface auth/auth --no-spec --flat
```

- `ParseIntPipe` do 2 works
  - If I send `/users/1` then it converts from string to int automatically
  - If I send `/users/abc` then it can't convert from string to int so return error response
- Create DTO

```
nest g class auth/dto/auth.dto --no-spec --flat
nest g class users/dto/users.dto --no-spec --flat
```

- Using DTO, fix the structure
- Typescript checks the type at the compile time
- In the run time need validation using `class-validator`

```
npm install class-validator class-transformer
```

- Checks the validation rules using `class-validator`
- Transform the body json to dto class instance
- Need to introduce validation so that body should match with defined DTO, that is done by `ValidationPipe`
- in `main.js` file:

```ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // apply all the APIs
    forbidNonWhitelisted: true, // throw errors for not defined DTO property in body
  }),
);
```

- Create middleware & also mention for which route I should apply it 

```
nest g middleware common/request-logger --no-spec --flat
```

- Create guard

```
nest g guard tickets/guards/staff --no-spec --flat
```

- Middleware: Generic work
- Guard: Access control (`403`)
- First visit middleware then go to guard
- To define fixed success response, I use `Interceptor`
- Create Interceptor & also mention for which route I should apply it 

```
nest g interceptor common/response --no-spec --flat
```

- Whole Architecture
  - Module: Seperate the features
  - Controller: Handle HTTP requests
  - Service: Communicate with database
  - Dependencies Injection: Connect controller & service
  - Data Transfer Object (DTO): Define allowed client data
  - Pipe: Validate DTO data
  - Exception: Throw errors
  - Middleware: Common logging
  - Guard: For access control
  - Interceptor: Prepare fixed success response

## Prisma Setup

```
npm install prisma --save-dev
npx prisma init

```