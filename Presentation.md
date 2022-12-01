### **Tasks** :
- Fix the issues in handler.ts file



### **SOLUTION:**


 1.  **ES6 STANDARD FOR VARIABLE DECLARATION**

Changed all `var` to `let` or `const` for variable declaration to conform to ES6 standard which is the target in the `tsconfig.json.` 

Also, `var` declarations are globally scoped or function scoped while `let` and `const` are block scoped which make it less error-prone compared to `var`. 


Example:
```javascript
 // Before refactoring
  var name: string = request.params['name']

  // After refactoring
   const name = request.params["name"] as string;

```

2. **ES MODULES IMPORT**

Some modules in the file are imported as commonJS modules while some are imported as ES modules. For consistency, all modules are imported as ES modules.

Example:
```javascript
 // Before refactoring
   const http = require('http');

  // After refactoring
   import {http} from 'http';

```

- Also, some modules are imported within the function and not at the top of the file. With ES Modules, imports are static, which means they are executed at parse time. This is why imports are “hoisted”. They are implicitly moved to the top of the file. Therefore, we cannot use the import syntax  just in the middle of our code unlike CommonJS imports are dynamically resolved at runtime. The require() function is simply run at the time our code executes. As a consequence, one can call it anywhere in the  code.



**CODE REFACTORING**

3. one of the major refactoring done is the code snippet below

```javascript
  var urlApiPokeman = `https://pokeapi.co/api/v2/pokemon/`;

  var params = {}
  name == null
      ? name.trim() != ''
      ? (params["name"] = name, urlApiPokeman = urlApiPokeman + '/', urlApiPokeman = urlApiPokeman + name)
      : (urlApiPokeman = urlApiPokeman + '"?offset=20"', urlApiPokeman = urlApiPokeman + "&limit=20")
      : (urlApiPokeman = urlApiPokeman + '"?offset=20"', urlApiPokeman = urlApiPokeman + "&limit=20")


```

Ternary operators can become confusing or non-readable for multiple conditions chaining.

The goal of the above snippet is to check if `name` was passed as the params, if yes, name should be appended to the `urlApiPokeman` and `'"?offset=20"'` and `&limit=20` should be added to the `urlApiPokeman` before making the api call.

The refactoring i did here was to create a function __(getPokemonUrl())__ that takes `name:string` as an arguement and return the `url+name+offset+limit` if name is passed and default to `urt+offset+limit` when name is not passed.

One of the reason I created this function to achieve the above snippet is because
- **_getPokemonByName()_** has so many things going on which sort of contradicts the **"S- single responsibilty"** of "SOLID" principle 

- Also, creating this function makes the code more **_readable_**, **_re-usable_** and generally makes the code more **_testable_**.

Below is the new function that achieved the same thing done with the ternary operators

```javascript
export const getPokemonUrl = (name = ""): string => {
  const paramsName = name.trim();
  return `https://pokeapi.co/api/v2/pokemon/${paramsName}?offset=20&limit=20`;
};
```


4. Another code refactoring done is applying the **DRY** principle by creating a function that makes api calls to third party.

```javascript
const http = require('http');
  const keepAliveAgent = new http.Agent({ keepAlive: true });

  let response: any = ""

  http.request({ ...reply.headers, ...({ hostname: urlApiPokeman, port: 80, }) }, (result) => { response = result })

  const http = require('http');
    const keepAliveAgent = new http.Agent({ keepAlive: true });
http.request({ hostname: element }, (response) => pokemonTypes.push(response))

```

The snippet above was refactored to this

```javascript
export const makeApiCall = async (url: string, options?: Partial<IOptions>): Promise<unknown> => {

  const response = await fetch(url, options)

    if (!response.ok && response.status===404) {
      throw new NotFoundError(response.statusText)
    }
    if(!response.ok){
      throw new CustomError()
    }
    return response.json()


};
```

The above function is called anytime and api request is to be made to third party.


5. Created an **`error class`** which works in hand with fastify **`setErrorHandler`** to create custom error. This makes error handling more clean and readable. And I also used `winston` for logging

__Check files:__ 

_./src/common/http_

_.src/common/error_

._/src/logger_

```javascript

// setErrorHandler 
app.setErrorHandler(async (error, _request, reply) => {
  let customError = error;

  //log error for internal investigation
  logger.error(error);

  if (!(error instanceof CustomError)) {

    customError = new CustomError(
      //Use this generic error message so users wont see error messages like "undefined" or DB error
      "An error occurred, admin fixing 🛠"
    );
  }

  reply.status(customError.statusCode).send(new ErrorResponseObject(`${customError.message}`));
})

```

- Also created `Error and Success Response class` for consistency when for API response with. Every response looks like this:

```Javascript
{
    "success": xxx,
    "message": xxx,
    "data":xxxx
}

```

file reference: `./common/http`



6. Remove `any` as a type and replace with Interface or incase of not knowing the shape upfront, use `unknown`. 
Using the `any` type defeats the purpose of writing Typescript code. When `any` is used, the TypeScript compiler allows for the type to  be any data type, which is not "safe" and can lead to unexpected values if one is not  careful. The idea of TypeScript is to provide "strictly-typed" JS code so that its durable and safer than plain old JS which is "loosely-typed".

[Reference](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html).



```javascript
//Before
 const resp = response as any

 // After
 const resp = response as IPokemonWithStats;

 const pokemonTypes: IPokemonWithStats[] = [];

```



7. 
```javascript
let types = resp.types.map(type => type.type).map(type => { return type.url }).reduce((types, typeUrl) => types.push(typeUrl));

```
The above snippet in __`computeResponse()`__ , the purpose is to loop resp.types and get the types, then loop the returned types to get the typeUrl, then iterate the returned value using `reduce` and push to types.

The `.reduce` is not needed

Below is the refacotring

```javascript
    const { types, stats } = resp;

    const typesUrls = types.map((type) => type.type).map((type) => type.url);

```
### **PERFORMANCE/OPTIMIZATION**

8. **Run api calls concurrently**

This was done by using ` Promise.all()` while making api calls to the urls. This helps to increase the performace of the system by running the code concurrently.


```javascript
    await Promise.all(
      typesUrls.map(async (url) => {
        const data = await makeApiCall(url) as IPokemonWithStats
        pokemonTypes.push(data);
      })
    );

```

**8. Avoid multiple nested loop to reduce time complexity**

```javascript
response.stats.forEach(element => {
    var stats = []

    pokemonTypes.map(pok =>
        pok.stats.map(st =>
            st.stat.name.toUpperCase() == element.stat.name
                ? stats.push(st.base_state)
                : ([])
        )
    )

    if (stats) {
      let avg = stats.reduce((a, b) => a + b) / stats.length
      element.averageStat = avg
    } else {
      element.averageStat = 0
    }
  });
```

The time complexity of the above snippet is **O(n^4)** which will affect the performance of the code.

The above snippet was refactored by:
- first creating an hashMap data structure
- run a conditional nested loop 0(n) or 0(n2)
- Populate hashMap
- Run a loop and check hashMap using a key [Checking hashMap is Time-complexity 0(1)]

Below is the code refactoring

```javascript
   // Create hashMap
    const statNames = new Map();

    // conditional nested loop O(N) / O(N^2)

    pokemonTypes.forEach((element) => {
      if (element?.stats) {
        element.stats.map((stats) => {
          // populate hashmap
          statNames.set(`${stats.stat.name}`, stats)
        })
      }
    })



    // use foreach to mutate the response.
    stats.forEach((element) => {
      const stat: number[] = [];

      

      //JS is case sensitive 'a' !== 'A'
      const isStatExist =
        statNames[element.stat.name] &&
        `${statNames[element.stat.name].stat.name}`.toUpperCase() ===`${element.stat.name}`.toUpperCase();

      if (isStatExist) {
        const base_stat = statNames[element.stat.name].base_stat;
        stat.push(base_stat);
      }

      const avg = stat.length ? stat.reduce((a, b) => a + b) / stat.length : 0;
      element.averageStat = avg;
    });


```

## To run project:


- Ensure you have node and npm installed on your machine.  If you’re not sure kindly enter this command on your terminal:

    `node -v`

   `npm -v`


- Clone this project to your machine:
    git clone xxxxx


- Open the project on your favourite IDE . I recommend VScode [Guess Is because I love it 😍]

- To test the routes, you’ll need API client like  Postman and if you’re team Insomnia, thats fine.

## **Installing**

Enter the root directory of this project  and enter the command below to install all dependencies.

`npm install`

After installing all dependencies, check if the app is up and running by entering the command below:

`npm run dev`

![](https://paper-attachments.dropboxusercontent.com/s_72A74ED176B22A988AD5564BEDF7070ED14A4722B875F4FA2DBBAF84583FAB62_1669861183437_Screenshot+2022-12-01+at+03.19.20.png)


## **Test if routes is working:**

  `GET` `http://localhost:3000/poke/:name`

![](https://paper-attachments.dropboxusercontent.com/s_72A74ED176B22A988AD5564BEDF7070ED14A4722B875F4FA2DBBAF84583FAB62_1669860974003_Screenshot+2022-12-01+at+03.14.52.png)



To run test:

 - CD to root folder directory of project
 - run this command `npm run test`

 
![](https://paper-attachments.dropboxusercontent.com/s_72A74ED176B22A988AD5564BEDF7070ED14A4722B875F4FA2DBBAF84583FAB62_1669860973994_Screenshot+2022-12-01+at+03.13.57.png)
