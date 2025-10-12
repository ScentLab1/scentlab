let carrito = [];

function agregarAlCarrito(nombre, precio) {
  const encontrado = carrito.find(p => p.nombre === nombre);
  if (encontrado) encontrado.cantidad++;
  else carrito.push({ nombre, precio, cantidad: 1 });
  guardarCarrito();
  actualizarCarrito();
}

function toggleCart() {
  const cart = document.getElementById("cartContainer");
  cart.style.display = cart.style.display === "block" ? "none" : "block";
  actualizarCarrito();
}

function actualizarCarrito() {
  const items = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  const empty = document.getElementById("cartEmpty");
  items.innerHTML = "";
  let total = 0;
  if (carrito.length === 0) {
    empty.style.display = "block";
  } else {
    empty.style.display = "none";
    carrito.forEach((p, i) => {
      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `${p.nombre} x${p.cantidad} — $${(p.precio*p.cantidad).toLocaleString()}
        <button onclick="eliminarItem(${i})">✕</button>`;
      items.appendChild(div);
      total += p.precio * p.cantidad;
    });
  }
  totalEl.textContent = total.toLocaleString();
  document.getElementById("cartCount").textContent = carrito.reduce((a, p) => a + p.cantidad, 0);
}

function eliminarItem(i) {
  carrito.splice(i, 1);
  guardarCarrito();
  actualizarCarrito();
}

function vaciarCarrito() {
  carrito = [];
  guardarCarrito();
  actualizarCarrito();
}

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

document.addEventListener("DOMContentLoaded", () => {
  carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  actualizarCarrito();
  mostrarSeccion("inicio");
});

// ====== SECCIONES ======
function mostrarSeccion(id) {
  document.querySelectorAll(".seccion").forEach(sec => sec.style.display = "none");
  document.getElementById(id).style.display = "block";
}

// ====== FORMULARIO ======
function enviarFormulario(e) {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value;
  const correo = document.getElementById("correo").value;
  alert(`Gracias ${nombre}. Te contactaremos pronto a ${correo}.`);
  e.target.reset();
  return false;
}

// ====== CHECKOUT ======
function checkout() {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }
  const overlay = document.getElementById("receiptOverlay");
  const box = document.getElementById("receiptContent");
  const fecha = new Date().toLocaleString();
  let total = carrito.reduce((a, p) => a + p.precio * p.cantidad, 0);
  box.innerHTML = `
    <img src="img/logo.png" alt="Logo" style="width:80px; margin-bottom:10px;">
    <h2>Recibo de compra</h2>
    <p><strong>Fecha:</strong> ${fecha}</p>
    <ul style="text-align:left; list-style:none; padding:0;">
      ${carrito.map(p => `<li>${p.nombre} x${p.cantidad} — $${(p.precio*p.cantidad).toLocaleString()}</li>`).join('')}
    </ul>
    <hr style="border-color:rgba(212,175,55,0.3);">
    <h3>Total: $${total.toLocaleString()}</h3>
    <p style="font-size:12px;color:#999;">Gracias por tu compra 💛</p>
    <button class="btn primary" onclick="descargarPDF()">Descargar PDF</button>
    <button class="btn ghost" onclick="cerrarRecibo()">Cerrar</button>
  `;
  overlay.style.display = "flex";
}

// ====== DESCARGAR PDF ======
function descargarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const fecha = new Date().toLocaleString();
  const logo = new Image();
  logo.src = "img/logo.png";

  logo.onload = function() {
    doc.setFillColor(15, 15, 15);
    doc.rect(0, 0, 210, 297, "F");

    doc.addImage(logo, "PNG", 85, 10, 40, 40);
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(20);
    doc.text("SCENT LAB — Recibo", 50, 60);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(`Fecha y hora: ${fecha}`, 20, 75);

    let y = 90;
    carrito.forEach(p => {
      doc.text(`${p.nombre} x${p.cantidad} — $${(p.precio*p.cantidad).toLocaleString()}`, 20, y);
      y += 8;
    });

    const total = carrito.reduce((a, p) => a + p.precio * p.cantidad, 0);
    doc.setTextColor(212, 175, 55);
    doc.text(`TOTAL: $${total.toLocaleString()}`, 20, y + 10);

    doc.setTextColor(200,200,200);
    doc.text("Gracias por tu compra - SCENT LAB", 20, y + 25);
    doc.save("Recibo_SCENTLAB.pdf");
  };
}

function cerrarRecibo() {
  document.getElementById("receiptOverlay").style.display = "none";
}
