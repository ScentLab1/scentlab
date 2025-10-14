// ==================== VARIABLES GLOBALES ====================
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// ==================== SECCIONES Y NAVEGACIÓN ====================
function mostrarSeccion(id) {
  document.querySelectorAll(".seccion").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Cierra el menú móvil si está abierto
  const nav = document.getElementById("mainNav");
  if (nav && nav.classList.contains("active")) {
    nav.classList.remove("active");
  }
}

// Desplazamiento suave y activación de sección
function scrollToSection(id) {
  mostrarSeccion(id); // activa la sección correspondiente
  const section = document.getElementById(id);
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
}

// Menú móvil (botón ☰)
function toggleMenu() {
  const nav = document.getElementById("mainNav");
  nav.classList.toggle("active");
}

// ==================== CARRITO ====================
function toggleCart() {
  const cart = document.getElementById("cartContainer");
  cart.style.display = (cart.style.display === "block") ? "none" : "block";
}

function agregarAlCarrito(nombre, precio) {
  const productoExistente = carrito.find(p => p.nombre === nombre);
  if (productoExistente) {
    productoExistente.cantidad++;
  } else {
    carrito.push({ nombre, precio, cantidad: 1 });
  }
  guardarCarrito();
  actualizarCarrito();
  mostrarToast(`"${nombre}" agregado al carrito 🛍️`);
}

function eliminarItem(index) {
  carrito.splice(index, 1);
  guardarCarrito();
  actualizarCarrito();
}

function vaciarCarrito() {
  carrito = [];
  guardarCarrito();
  actualizarCarrito();
}

function cambiarCantidad(index, cambio) {
  carrito[index].cantidad += cambio;
  if (carrito[index].cantidad <= 0) carrito.splice(index, 1);
  guardarCarrito();
  actualizarCarrito();
}

function actualizarCarrito() {
  const items = document.getElementById("cartItems");
  const total = document.getElementById("cartTotal");
  const count = document.getElementById("cartCount");
  const empty = document.getElementById("cartEmpty");

  items.innerHTML = "";
  let totalValue = 0;

  carrito.forEach((item, i) => {
    const subtotal = item.precio * item.cantidad;
    totalValue += subtotal;

    items.innerHTML += `
      <div class="cart-item">
        <div>
          <strong>${item.nombre}</strong><br>
          <small>$${item.precio.toLocaleString()} × ${item.cantidad}</small>
        </div>
        <div class="cart-controls">
          <button class="btn-control" onclick="cambiarCantidad(${i}, -1)">➖</button>
          <button class="btn-control" onclick="cambiarCantidad(${i}, 1)">➕</button>
          <button class="btn-control danger" onclick="eliminarItem(${i})">✖</button>
        </div>
      </div>
    `;
  });

  total.textContent = totalValue.toLocaleString();
  count.textContent = carrito.length;
  empty.style.display = carrito.length ? "none" : "block";
}

// ==================== LOCALSTORAGE ====================
function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

// ==================== FINALIZAR COMPRA ====================
function checkout() {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  const overlay = document.getElementById("receiptOverlay");
  const details = document.getElementById("receiptDetails");
  const date = document.getElementById("receiptDate");

  const now = new Date();
  const fecha = now.toLocaleDateString();
  const hora = now.toLocaleTimeString();

  let total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

  let productosHTML = carrito
    .map(p => `<p>${p.nombre} — ${p.cantidad} × $${p.precio.toLocaleString()}</p>`)
    .join("");

  details.innerHTML = `
    ${productosHTML}
    <hr>
    <p><strong>Total:</strong> $${total.toLocaleString()}</p>
  `;
  date.textContent = `Fecha: ${fecha} · Hora: ${hora}`;

  overlay.style.display = "flex";
}

function cerrarRecibo() {
  document.getElementById("receiptOverlay").style.display = "none";
}

// ==================== DESCARGAR PDF ====================
async function descargarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const fecha = new Date();
  const fechaTexto = fecha.toLocaleDateString("es-CO");
  const horaTexto = fecha.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

  const logo = new Image();
  logo.src = "img/logo.png";
  await new Promise(resolve => { logo.onload = resolve; });
  doc.addImage(logo, "PNG", 90, 10, 30, 30);

  doc.setTextColor(212, 175, 55);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("SCENT LAB", 105, 50, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("Fragancias de Lujo y Elegancia", 105, 58, { align: "center" });
  doc.text("----------------------------------------", 105, 63, { align: "center" });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.text(`Fecha: ${fechaTexto}`, 20, 75);
  doc.text(`Hora: ${horaTexto}`, 140, 75);

  doc.setFontSize(12);
  doc.text("----------------------------------------", 105, 85, { align: "center" });
  doc.text("DETALLE DE COMPRA", 105, 95, { align: "center" });
  doc.text("----------------------------------------", 105, 100, { align: "center" });

  let y = 115;
  let total = 0;
  carrito.forEach(item => {
    const subtotal = item.precio * item.cantidad;
    doc.text(`${item.nombre} — ${item.cantidad} × $${item.precio.toLocaleString("es-CO")}`, 20, y);
    y += 8;
    total += subtotal;
  });

  y += 5;
  doc.text("----------------------------------------", 105, y, { align: "center" });
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.text(`Total: $${total.toLocaleString("es-CO")}`, 105, y, { align: "center" });
  y += 10;
  doc.text("----------------------------------------", 105, y, { align: "center" });
  y += 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("Gracias por tu compra", 105, y, { align: "center" });
  y += 7;
  doc.text("Scent Lab — Fragancias de Lujo", 105, y, { align: "center" });
  y += 7;
  doc.setTextColor(100, 100, 100);
  doc.text("scentlab.com.co", 105, y, { align: "center" });

  doc.save("Recibo_SCENTLAB.pdf");

  vaciarCarrito();
  cerrarRecibo();
}

// ==================== FORMULARIO ====================
function enviarFormulario(e) {
  e.preventDefault();
  alert("Gracias por contactarnos. Te responderemos pronto 💌");
  e.target.reset();
  return false;
}

// ==================== TOAST ====================
function mostrarToast(mensaje) {
  const toast = document.createElement("div");
  toast.textContent = mensaje;
  toast.classList.add("toast");
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("visible"), 100);
  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 500);
  }, 2500);
}

// ==================== INICIALIZACIÓN ====================
document.addEventListener("DOMContentLoaded", actualizarCarrito);
