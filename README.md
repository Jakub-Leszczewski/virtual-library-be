<div id="top"></div>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
    <h1 align="center">[BE] Virtual library</h1>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Spis treści</summary>
  <ol>
    <li><a href="#technologie">Technologie</a></li>
    <li>
      <a href="#jak-zacząć">Jak zacząć</a>
      <ul>
        <li><a href="#warunki-wstepne">Warunki wstępne</a></li>
        <li><a href="#instalacja">Instalacja</a></li>
        <li><a href="#testowanie">Testowanie</a></li>
      </ul>
    </li>
    <li>
      <a href="#endpoints">Endpoints</a>
      <ul>
        <li><a href="#auth">Autoryzacja</a></li>
        <li><a href="#user">Użytkownik</a></li>
        <li><a href="#book">Książka</a></li>
      </ul>
    </li>
  </ol>
</details>

### Technologie
[![Nest][Nest]][Nest-url]
[![Typescript][Typescript]][Typescript-url]
[![Typeorm][Typeorm]][Typeorm-url]
[![Jwt][Jwt]][Jwt-url]
[![Mysql][Mysql]][Mysql-url]
[![Passport][Passport]][Passport-url]
[![Bcrypt][Bcrypt]][Bcrypt-url]
[![Nodemailer][Nodemailer]][Nodemailer-url]
[![Jest][Jest]][Jest-url]
[![Eslint][Eslint]][Eslint-url]
[![Prettier][Prettier]][Prettier-url]

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Jak zacząć

### Warunki wstępne
* node
  ```sh
  node@^16.15.1
  ```
* yarn
  ```sh
  yarn@^1.22.19
  ```

### Instalacja

1. Sklonuj repozytorium
   ```sh
   git clone https://github.com/ezterr/virtual-library-be.git
   ```
2. Przejdź do katalogu projektu
   ```sh
   cd virtual-library-be
   ```
3. Zainstaluj wszystkie zależności
   ```sh
   yarn
   ```
4. zmień nazwę pliku `src/config/config.example.ts` na `src/config/config.ts`odpowiednio uzupełnij plik config `src/config/config.ts`

     ```ts
         export const config = {
           itemsCountPerPage: 10,  // maksymalna ilość elementów na jedną stronę
           dbHost: 'localhost',  // Adres ip do bazy danych
           dbPort: 3306,  // Port do bazy danych
           dbDatabase: 'travel_journal',  // nazwa bazy danych
           dbUsername: 'root',  // nazwa użytkownika do bazy danych
           dbPassword: '',  // hasło do bazy danych
           dbSynchronize: true,  // czy typeorm ma synchronizować bazę danych zalecane - false
           dbLogging: false,  // wyświetlanie w konsoli wykonywanego sql
           jwtSecret: '',  // klucz zabezpieczający jwt
           jwtTimeToExpire: '1y',  // ważność jwt
           jwtCookieTimeToExpire: 1000 * 60 * 60 * 24 * 365, // ważność ciastaka
           jwtCookieDomain: 'localhost',  // Dozwolona domena, która może uzyskać dostęp do ciastka
           cookieSecure: false, // ciesteczka tylko dla https
           mailHost: 'localhost', // adres serwera smtp
           mailPort: 2500,  // port serwera smtp
           mailUsername: 'admin', // nazwa użytkownika serwera smtp
           mailPassword: 'admin', // hasło serwera smtp
           mailFrom: 'no-replay@exaple.com', // adres email z którego będą przychodzić wiadomości
         };
     ```

<p align="right">(<a href="#top">back to top</a>)</p>


### Testowanie
   ```sh
   yarn test
   ```


<!-- USAGE EXAMPLES -->
## Endpoints

### Auth
* **POST /auth/login** - loguje użytkownika
  ```ts
    // dto dla body
    {
      username: string;
      password: string;
    }
  ```
* **DELETE /auth/logout** - wylogowanie użytkownika **(tylko zalogowany)**

* **GET /auth/user** - pobiera aktualnie zalogowanego użytkownika **(tylko zalogowany)**
<p align="right">(<a href="#top">back to top</a>)</p>

### User
* **POST /user** - dodaje nowego użytkownika z rolą "user"
    ```ts
      // dto dla body
      {
        firstName: string;
        lastName: string;
        username: string;
        email: string;
        password: string;
      }
    ```
* **POST /user/admin/:token** - dodaje nowego użytkownika z rolą "admin"
    ```ts
      // dto dla body
      {
        firstName: string;
        lastName: string;
        username: string;
        email: string;
        password: string;
      }
    ```
* **POST /user/admin** - wysyła wiadomość na wskazany adres e-mail z kodem wymaganym do rejestracji admina **(tylko admin)**
    ```ts
      // dto dla body
      {
        email: string;
      }
    ```

  <p align="right">(<a href="#top">back to top</a>)</p>

### Book
* **GET /book/:id** - pobiera dane na temat podanej książki **(tylko zalogowany)**
    ```ts
      // dto dla query
      {
        secure: boolean; // (tylko admin)
      }
   ```
* **GET /book/** - pobiera dane na temat książek **(tylko zalogowany)**
    ```ts
      // dto dla query
      {
        secure: boolean; // (tylko admin)
        page: number;
        status: 'available' | 'borrowed' | 'all';
      }
   ```
* **POST /book** - dodaje nową książkę **(tylko admin)**
    ```ts
      // dto dla body
      {
        title: string;
        author: string;
        isbn: string;
      }
   ```
* **PATCH /book/:id** - aktualizuje dane na temat książki **(tylko admin)**
    ```ts
      // dto dla body
      {
        title?: string;
        author?: string;
        isbn?: string;
      }
   ```
* **DELETE /book/:id** - Usuwa podaną książkę **(tylko admin)**
* **PATCH /book/:id/borrow** - wypożycza daną książkę **(tylko zalogowany - "user")**
* **DELETE /book/:id/borrow** - zwraca daną książkę **(tylko zalogowany - "user")**

  <p align="right">(<a href="#top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/ezterr/virtual-library-be.svg?style=for-the-badge
[contributors-url]: https://github.com/ezterr/virtual-library-be/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/ezterr/virtual-library-be.svg?style=for-the-badge
[forks-url]: https://github.com/ezterr/virtual-library-be/network/members
[stars-shield]: https://img.shields.io/github/stars/ezterr/virtual-library-be.svg?style=for-the-badge
[stars-url]: https://github.com/ezterr/virtual-library-be/stargazers
[issues-shield]: https://img.shields.io/github/issues/ezterr/virtual-library-be.svg?style=for-the-badge
[issues-url]: https://github.com/ezterr/virtual-library-be/issues

[Typescript]: https://img.shields.io/badge/typescript-20232A?style=for-the-badge&logo=typescript&logoColor=3178c6
[Typescript-url]: https://www.typescriptlang.org/
[Nest]: https://img.shields.io/badge/Nest-20232A?style=for-the-badge&logo=nestjs&logoColor=ea2845
[Nest-url]: https://nestjs.com/
[Typeorm]: https://img.shields.io/badge/type%20orm-20232A?style=for-the-badge&logo=typeorm&logoColor=ea2845
[Typeorm-url]: https://typeorm.io/
[Jwt]: https://img.shields.io/badge/jwt-20232A?style=for-the-badge&logo=JSONwebtokens&logoColor=fff
[Jwt-url]: https://jwt.io/
[Mysql]: https://img.shields.io/badge/mysql-20232A?style=for-the-badge&logo=mysql&logoColor=fff
[Mysql-url]: https://www.mysql.com/
[Passport]: https://img.shields.io/badge/passport-20232A?style=for-the-badge&logo=passport&logoColor=fff
[Passport-url]: https://www.passportjs.org/
[Bcrypt]: https://img.shields.io/badge/bcrypt-20232A?style=for-the-badge&logo=bcrypt&logoColor=fff
[Bcrypt-url]: https://github.com/kelektiv/node.bcrypt.js
[Jest]: https://img.shields.io/badge/jest-20232A?style=for-the-badge&logo=jest&logoColor=C63D14
[Jest-url]: https://www.npmjs.com/package/jest
[Eslint]: https://img.shields.io/badge/eslint-20232A?style=for-the-badge&logo=eslint&logoColor=3a33d1
[Eslint-url]: https://www.npmjs.com/package/eslint
[Prettier]: https://img.shields.io/badge/prettier-20232A?style=for-the-badge&logo=prettier&logoColor=c596c7
[Prettier-url]: https://prettier.io/
[Nodemailer]: https://img.shields.io/badge/nodemailer-20232A?style=for-the-badge&logo=nodemailer&logoColor=fff
[Nodemailer-url]: https://nodemailer.com/about/
