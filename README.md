# API de Pastelería

Esta API permite gestionar ingredientes, postres y la relación entre ellos (postres-ingredientes) usando Express y una base de datos remota (Turso/libSQL).

## Base URL

```
http://localhost:3000
```

---

## Endpoints y Ejemplos de Uso

### Ingredientes

#### Obtener todos los ingredientes
```js
fetch('http://localhost:3000/ingredientes')
  .then(res => res.json())
  .then(data => console.log(data));
```

#### Obtener un ingrediente por ID
```js
fetch('http://localhost:3000/ingredientes/1')
  .then(res => res.json())
  .then(data => console.log(data));
```

#### Crear un ingrediente
```js
fetch('http://localhost:3000/ingredientes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombreIngrediente: 'Azúcar',
    existencias: 50
  })
})
.then(res => res.json())
.then(data => console.log(data));
```
**Datos a enviar:**
- `nombreIngrediente` (string)
- `existencias` (number)

#### Actualizar un ingrediente
```js
fetch('http://localhost:3000/ingredientes/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombreIngrediente: 'Azúcar refinada',
    existencias: 60
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

#### Eliminar un ingrediente
```js
fetch('http://localhost:3000/ingredientes/1', {
  method: 'DELETE'
})
.then(res => res.json())
.then(data => console.log(data));
```

---

### Postres

#### Obtener todos los postres
```js
fetch('http://localhost:3000/postres')
  .then(res => res.json())
  .then(data => console.log(data));
```

#### Obtener un postre por ID
```js
fetch('http://localhost:3000/postres/1')
  .then(res => res.json())
  .then(data => console.log(data));
```

#### Crear un postre
```js
fetch('http://localhost:3000/postres', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombrePostre: 'Tarta de Manzana'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```
**Datos a enviar:**
- `nombrePostre` (string)

#### Actualizar un postre
```js
fetch('http://localhost:3000/postres/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombrePostre: 'Tarta de Manzana Clásica'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

#### Eliminar un postre
```js
fetch('http://localhost:3000/postres/1', {
  method: 'DELETE'
})
.then(res => res.json())
.then(data => console.log(data));
```

---

### PostresIngredientes

#### Obtener todas las relaciones postre-ingrediente
```js
fetch('http://localhost:3000/postres-ingredientes')
  .then(res => res.json())
  .then(data => console.log(data));
```

#### Obtener una relación por ID
```js
fetch('http://localhost:3000/postres-ingredientes/1')
  .then(res => res.json())
  .then(data => console.log(data));
```

#### Crear una relación postre-ingrediente
```js
fetch('http://localhost:3000/postres-ingredientes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    idPostre: 1,
    idIngrediente: 2,
    Cantidad: 1.5
  })
})
.then(res => res.json())
.then(data => console.log(data));
```
**Datos a enviar:**
- `idPostre` (number)
- `idIngrediente` (number)
- `Cantidad` (number)

#### Actualizar una relación (todos los campos)
```js
fetch('http://localhost:3000/postres-ingredientes/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    idPostre: 1,
    idIngrediente: 2,
    Cantidad: 2.0
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

#### Modificar solo la cantidad de una relación
```js
fetch('http://localhost:3000/postres-ingredientes/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    Cantidad: 3.5
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

**Puedes enviar solo el campo `Cantidad` para modificar únicamente la cantidad de la relación. Si envías los tres campos (`idPostre`, `idIngrediente`, `Cantidad`), se actualizarán todos.**

#### Eliminar una relación
```js
fetch('http://localhost:3000/postres-ingredientes/1', {
  method: 'DELETE'
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## Notas
- Todas las respuestas de creación (`POST`) devuelven el objeto recién creado con todos sus campos.
- El API permite solicitudes desde cualquier origen (CORS habilitado).
- Si tienes dudas o necesitas ejemplos con otra librería (axios, etc.), ¡pide ayuda! 