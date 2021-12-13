// Variables
//Espacio donde se almacenará cada producto que el usuario haga click
$carrito = $('#carrito'); 
//const carrito = document.querySelector('#carrito'); 
//Contenedor donde estan todos los productos listados
$listaCursos = $('#lista-cursos');
//const listaCursos = document.querySelector('#lista-cursos');
//Es donde se van a colocar los elementos del carrito
$contenedorCarrito = $('#lista-carrito tbody#articulos');
//const contenedorCarrito = document.querySelector('#lista-carrito tbody');
//Es donde se van a colocar el costo tatal del carrito
$contenedorCostos = $('table #costostotal #infocosto #costo-total');
//const contenedorCostos = document.querySelector('table');
//btn del index de vaciar carrito
$vaciarCarritoBtn = $('#vaciar-carrito'); 
//const vaciarCarritoBtn = document.querySelector('#vaciar-carrito'); 
//array del carrito d compras
$articulosCarrito = [];
//valor del subtotal
let totalcosto = 0;

// Listeners
cargarEventListeners();
costos();
obtenerDatos();
//Creo una funcion para que capte todos los click's que se den en la pagina
function cargarEventListeners() {
     // Dispara cuando se presiona "Agregar Carrito"
     $listaCursos.click(agregarCurso);

     // Cuando se elimina un curso del carrito
     $carrito.click(eliminarCurso);

     //mostrar el carrito del local storage
     document.addEventListener('DOMContentLoaded', () => {
          $articulosCarrito = JSON.parse(localStorage.getItem('carrito')) || [];
          carritoHTML();
          sumarPago();
          //reseteamos el monto a 0 y tomamos el carrito del localstorage para sacar el monto total
          totalcosto = 0;
          for (let t = 0; t <  $articulosCarrito.length; t++) {
               totalcosto = totalcosto + $articulosCarrito[t].precio;             
          }
          mostrarPago(totalcosto);
     })


     $vaciarCarritoBtn.click(()=>{
          $articulosCarrito = []; //Se resetea el arreglo del carrito
          vaciarCarrito(); //Se elimina todo el html          
          localStorage.removeItem('carrito');
     });
}

// Funciones
// Función que añade el curso al carrito
function agregarCurso(e) {
     //evitamos que el boton de agregar carrito tenga la funcion de refrescar la pagina
     e.preventDefault();
     //verificamos si el elemento que se preciona es un boton para eso debe 
     //contener la clase "agregar-carrito"
     if(e.target.classList.contains('agregar-carrito')) {
          //leemos el contenido del div padre para saber su contanido
          const curso = e.target.parentElement.parentElement;
          // Enviamos el producto seleccionado para tomar sus datos
          leerDatosCurso(curso);
          totalcosto = 0;
          
     }
     sumarPago(totalcosto);
}

//sumamos todos los valores del precio del carrito para hallar el total
function sumarPago(totalcosto) {
     for (let t = 0; t <  $articulosCarrito.length; t++) {
          totalcosto = totalcosto + $articulosCarrito[t].precio;             
     }
     mostrarPago(totalcosto);
}

//aca mostramos el valor obtenido en la casilla correspondiente
function mostrarPago (totalcosto){
     let montoPagar = document.querySelector('#pagototal');
     montoPagar.innerHTML = '';

     montoPagar.innerHTML += `${totalcosto}`;
}

// Lee los datos del producto seleccionado
function leerDatosCurso(curso) {

     //se crea un objeto con la información del curso
     const infoCurso = {
          //se recoge los datos del producto como imagen, titulo, precio, id y cantidad
          imagen: curso.querySelector('img').src,
          titulo: curso.querySelector('h4').textContent,
          precio: parseInt(curso.querySelector('.precio .u-pull-right span').textContent),
          id: curso.querySelector('a').getAttribute('data-id'), 
          cantidad: 1
     }

     //Agregamos elementos al carrito de compras
     //si el elemento seleccionado ya existe en el carrito, lo que hago es sumarle +1
     // al atributo de cantidad
     if( $articulosCarrito.some( curso => curso.id === infoCurso.id ) ) { 
          const cursos = $articulosCarrito.map( curso => {
               if( curso.id === infoCurso.id ) {
                    curso.cantidad++;                    
                    curso.precio = curso.precio * curso.cantidad;
                     return curso;
                } else {
                     return curso;
             }
          })
          $articulosCarrito = [...cursos];
     }  else {
          // si es que el producto seleccionado no estaba en el carrito, solo lo agrego
          //como un objeto mas.
          globalThis.$articulosCarrito = [...$articulosCarrito, infoCurso];
     }

     //vemos como se va llenando el carrito de compras
     carritoHTML();
}

// Elimina el curso del carrito en el DOM al precionar el boton de la "X"
function eliminarCurso(e) {
     e.preventDefault();
     if(e.target.classList.contains('borrar-curso') ) {
          // e.target.parentElement.parentElement.remove();
          const cursoId = e.target.getAttribute('data-id')
          // Eliminar del arreglo del carrito
          $articulosCarrito = $articulosCarrito.filter(curso => curso.id !== cursoId);
          
          carritoHTML();
     }
}


// se muestra el curso seleccionado en el Carrito
function carritoHTML() {
     //limpeamos l carrito
     vaciarCarrito();
     //se itera sobre el carrito, recorre el carrito y genera el html
     $articulosCarrito.forEach(curso => {
          //creamos un tr que se requiere para la tabla
          const row = document.createElement('tr');
          //creamos contenido html en el DOM con los cursos ya en el carrito, cada
          //con su recuadro respectivo
          row.innerHTML = `
               <td>  
                    <img src="${curso.imagen}" width=100>
               </td>
               <td>${curso.titulo}</td>
               <td>${curso.cantidad} und</td>
               <td>$ ${curso.precio}</td>
               <td>
                    <a href="#" class="borrar-curso" data-id="${curso.id}">X</a>
               </td>
          `;
          // Con esto se agrega el html al carrito en el tbody
          $contenedorCarrito.append(row);
     });
     totalcosto = 0;
     for (let t = 0; t <  $articulosCarrito.length; t++) {
          totalcosto = totalcosto + $articulosCarrito[t].precio;             
     }
     mostrarPago(totalcosto);


     // agregamos el carrito al Storage
     sincronizarStorage();
}



// Aqui creamos la casilla donde se mostrara el total del costo del carrito
function costos(){             
     const costos = document.createElement('td');
     costos.innerHTML = `total: $  <span id="pagototal"></span>`;
     $contenedorCostos.append(costos);
}

// En esta funcion hacemos la peticion mediante ajax a una API publica sobre
// el cambio del dolor actual

function obtenerDatos(){
     let url = `https://mindicador.cl/api/dolar`;

     const api = new XMLHttpRequest();
     api.open('GET', url, true);
     api.send();
     api.onreadystatechange = function(){
          if(this.status == 200 && this.readyState == 4){
               let datos = JSON.parse(this.responseText);

               let resultado = document.querySelector('#cambio-dolar');
               resultado.innerHTML = '';

               resultado.innerHTML += `<td>Cambio de dolar: $${datos.serie[1].valor} dia: ${datos.serie[1].fecha.slice(0,10)}</td>`;
               
          }
     }

     
}

// Agrega carrito a local storage
function sincronizarStorage() {
     localStorage.setItem('carrito', JSON.stringify($articulosCarrito));
}

// Elimina los cursos del carrito en el DOM
function vaciarCarrito() {

     var hijos = $('#lista-carrito #articulos').children();

     if (hijos.length > 0) {
          hijos.remove().children();
     }
     totalcosto = 0;
     mostrarPago(totalcosto);
}

//ANIMACIONES
loop();

function loop() {
     $('#h1-text').fadeOut(1000).fadeIn(500, loop)
}

$('#p-text-tachado').fadeOut(1000);
$('#p-text').hide().fadeIn(1000);
