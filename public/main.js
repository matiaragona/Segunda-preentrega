//CLIENTE
const socket = io()

// SCHEMA Normalizer //
const authorSchema = new normalizr.schema.Entity("author", {}, { idAttribute: "id" });

const messageSchema = new normalizr.schema.Entity("message", { author: authorSchema });

const messagesSchema = new normalizr.schema.Entity("messages", { messages: [messageSchema] });
//------------------//

socket.on('mensajes', mensajes => {

  console.log(mensajes)

  let mensajeNorm = mensajes.dataNormalized

  console.log(mensajeNorm)

  let dataDenormalizada = normalizr.denormalize(mensajeNorm.result, messagesSchema, mensajeNorm.entities)

  console.log(dataDenormalizada)


  let html = ""
  if ((dataDenormalizada.messages.length >= 1)) {
    html = dataDenormalizada.messages.map(msj => {
      return `<div class="container mt-3 style=text-align: center">                  
                  <strong style="color:blue">${msj.author.nombre}</strong>
                  [<span style="color:brown">${msj.timestamp}</span>]
                  <em style="color:green">: ${msj.text}</em>
                  
              </div>`
    }).join(" ")
  }
  document.getElementById("message").innerHTML = html

  let p = `<h1 style="color:crimson; text-align: center;">Compresion: %${mensajes.porcentageCompression}</h1>`

  document.getElementById("compresion").innerHTML = p
})

socket.on('faker', product => {
  if (product.length >= 1) {
    let html2 = product.map(prod => {
      return `<tr> 
                <td>${prod.id}</td>               
                <td>${prod.nombre}</td>
                <td>${prod.descripcion}</td>
                <td>${prod.codigo}</td>
                <td>${prod.precio}</td>                
                <td><img style="width: 80px;" src="${prod.foto}", alt="sin imagen"></td>
                <td>${prod.stock}</td>                
              </tr>`
    }).join(" ")

    html = `
    <h1 style="color:crimson; text-align: center"> 5 Productos Random</h1>
      <table class="table table-dark">
        <tr style="color: yellow;"> <th>ID</th><th>Titulo</th> <th>Descripcion</th> <th>Codigo</th> <th>Precio</th> <th>Imagen</th> <th>Stock</th></tr>
        ${html2}    
      </table>`

  }
  document.getElementById("product").innerHTML = html
})

socket.on('productos', produc => {
  if (produc.length >= 1) {
    let html2 = produc.map(produ => {
      return `<tr>                               
                <td>${produ.titulo}</td>
                <td>${produ.descripcion}</td>
                <td>${produ.codigo}</td>
                <td>${produ.precio}</td>                
                <td><img style="width: 80px;" src="${produ.foto}", alt="sin imagen"></td>
                <td>${produ.stock}</td>                
              </tr>`
    }).join(" ")

    html = `
    <h1 style="color:crimson; text-align: center">Productos desde form</h1>
      <table class="table table-dark">
        <tr style="color: yellow;"><th>titulo</th> <th>Descripcion</th> <th>Codigo</th> <th>Precio</th> <th>Imagen</th> <th>Stock</th></tr>
        ${html2}    
      </table>`

  }
  document.getElementById("producto").innerHTML = html
})

//----------------Funcion guardar mensajes---------------------------//
// Toma los valores de los imput, los guarda y los envia al servidor //
function addMessage() {

  const message = {

    author: {
      email: document.getElementById("email").value,
      nombre: document.getElementById("nombre").value,
      apellido: document.getElementById("apellido").value,
      edad: document.getElementById("edad").value,
      alias: document.getElementById("alias").value,
      avatar: document.getElementById("avatar").value,
    },
    text: document.getElementById("texto").value,
    timestamp: new Date().toLocaleString(),

  }

  socket.emit('new-msj', message)
  return false

}
//-------------------------------------------------------------------//

//---------------Funcion guardar productos --------------------------//
// Toma los valores de los imput, los guarda y los envia al servidor //
function addProduct() {

  const producto = {
    titulo: document.getElementById("titulo").value,
    descripcion: document.getElementById("descripcion").value,
    codigo: parseInt(document.getElementById("codigo").value),
    precio: parseInt(document.getElementById("precio").value),
    foto: document.getElementById("imagen").value,
    stock: parseInt(document.getElementById("stock").value),
  }

  socket.emit('new-product', producto)
  return false
}
//--------------------------------------------------------------------//

//--------------funcion para agregar productos al carrito y los guarda y los envia al seridor-----------------//
function addCart(id) {
  const userMail = document.getElementById("userMail").innerText
  fetch(`https://fakestoreapi.com/products/${id}`)
    .then(res => res.json())
    .then(data => {
      let producto = {
        codigo: data.id,
        titulo: data.title,
        descripcion: data.description,
        precio: data.price,
        foto: data.image,
        stock: data?.stock || 10,
        quantity: 1,
        idUsuario: userMail
      }

      socket.emit('new-product', producto)
      return false
    })
}
//--------------------------------------------------------------------//

//---------------fetch a productos desde api https://fakestoreapi.com/products?limit=10' y los renderizo en id 'productList' --------------------------//

function getProductList() {
  fetch('https://fakestoreapi.com/products?limit=10')
    .then(res => res.json())
    .then(data => {
      let html = data.map(prod => {
        return `<tr> 
                <td>${prod.id}</td>               
                <td>${prod.title}</td>
                <td>${prod.description}</td>
                <td>${prod.category}</td>
                <td>${prod.price}</td>                
                <td><img style="width: 80px;" src="${prod.image}", alt="sin imagen"></td>
                <td colspan="6"><button class="btn btn-success" onclick="addCart(${prod.id})">Agregar al carrito</button></td>
              </tr>`
      }).join(" ")

      html = `
      <h1 style="color:crimson; text-align: center"> Lista de Productos desde Api</h1>
        <table class="table table-dark">
          <tr style="color: yellow;"> <th>ID</th><th>Titulo</th> <th>Descripcion</th> <th>Categoria</th> <th>Precio</th> <th>Imagen</th></tr>
          ${html}    
        </table>`

      document.getElementById("productList").innerHTML = html
      

    })
}

getProductList()

//--------------------------------------------------------------------//

//---------------fetch a productos desde api https://fakestoreapi.com pero con filtro por categoria y los renderizo en id 'productList' --------------------------//

function getProductListByCategory(category) {
  fetch(`https://fakestoreapi.com/products/category/${category}`)
    .then(res => res.json())
    .then(data => {
      let html = data.map(prod => {
        return `<tr> 
                <td>${prod.id}</td>               
                <td>${prod.title}</td>
                <td>${prod.description}</td>
                <td>${prod.category}</td>
                <td>${prod.price}</td>                
                <td><img style="width: 80px;" src="${prod.image}", alt="sin imagen"></td>
                <td colspan="6"><button class="btn btn-success" onclick="addCart(${prod.id})">Agregar al carrito</button></td>
              </tr>`
      }).join(" ")

      html = `
      <h1 style="color:crimson; text-align: center"> Lista de Productos por Categoría</h1>
        <table class="table table-dark">
          <tr style="color: yellow;"> <th>ID</th><th>Titulo</th> <th>Descripcion</th> <th>Categoria</th> <th>Precio</th> <th>Imagen</th></tr>
          ${html}    
        </table>`

      document.getElementById("productList").innerHTML = html
      

    })
}

//--------------------------------------------------------------------//

//si hace click en el boton de categoria, ejecuta la funcion getProductListByCategory con el id del boton como parametro
document.getElementById("category1").addEventListener("click", (e) => {
  getProductListByCategory(e.target.id)
})
document.getElementById("category2").addEventListener("click", (e) => {
  getProductListByCategory(e.target.id)
})
document.getElementById("category3").addEventListener("click", (e) => {
  getProductListByCategory(e.target.id)
})

//a los li con id category1, category2 y category3 le agrego el estilo cursor pointer
document.getElementById("category1").style.cursor = "pointer"
document.getElementById("category2").style.cursor = "pointer"
document.getElementById("category3").style.cursor = "pointer"