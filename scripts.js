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

  if (!items || !total || !count || !empty) return;

  items.innerHTML = "";
  let totalValue = 0;
  let totalProductos = 0;

  carrito.forEach((item, i) => {
    const subtotal = item.precio * item.cantidad;
    totalValue += subtotal;
    totalProductos += item.cantidad;

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

  total.textContent = totalValue.toLocaleString("es-CO");
  count.textContent = totalProductos;
  empty.style.display = carrito.length ? "none" : "block";

  // Actualiza el texto del botón del carrito
  const cartButton = document.querySelector(".cart-toggle");
  if (cartButton) {
    const label = (currentLang === "en") ? "Cart" : "Carrito";
    cartButton.innerHTML = `🛒 ${label} (<span id="cartCount">${totalProductos}</span>)`;
  }
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
// ==================== CAMBIO DE IDIOMA GLOBAL ====================
// ==================== CAMBIO DE IDIOMA TOTAL (DETECCIÓN FLEXIBLE) ====================
let currentLang = "es";
let originalTexts = {};

const translations = {
  en: {
    // --- Navegación ---
    "inicio": "Home",
    "colección": "Collection",
    "nosotros": "About Us",
    "contacto": "Contact",
    "explorar colección": "Explore Collection",
    "fragancias que inspiran poder y elegancia": "Fragrances that inspire power and elegance",
    "no es solo un aroma — es tu firma personal.": "Not just a scent — it's your personal signature.",
    "colección destacada": "Featured Collection",
    "fragancias cuidadosamente seleccionadas para él y para ella.": "Fragrances carefully selected for him and her.",

    // --- Secciones de productos ---
    "fragancias para hombres": "Men’s Fragrances",
    "fragancias para mujeres": "Women’s Fragrances",
    "colección exclusiva scent lab": "Exclusive SCENT LAB Collection",

    // --- Carrito ---
    "tu carrito": "Your Cart",
    "carrito vacío": "Empty Cart",
    "vaciar carrito": "Empty Cart",
    "finalizar compra": "Checkout",
    "recibo de compra": "Purchase Receipt",
    "descargar pdf": "Download PDF",
    "cerrar": "Close",

    // --- Contacto ---
    "escríbenos para pedidos, colaboraciones o consultas.": "Write to us for orders, collaborations or inquiries.",
    "nombre": "Name",
    "correo": "Email",
    "mensaje": "Message",
    "limpiar": "Clear",
    "enviar": "Send",

    // --- Nosotros ---
    "nosotros": "About Us",
    "misión": "Mission",
    "visión": "Vision",
    "en scent lab combinamos ciencia y arte olfativo. desarrollamos tiradas limitadas, trabajamos con perfumistas y seleccionamos ingredientes trazables.":
      "At SCENT LAB, we combine science and the art of fragrance creation. We develop limited-edition batches, collaborate with perfumers, and carefully select traceable ingredients.",

    // --- Misión y Visión ---
    "mision_text": `Scentlab’s mission is to create unique sensory experiences through high-quality body lotions, blending science, innovation, and sustainability. We aim for every fragrance to reflect our clients’ identity and lifestyle, providing well-being and confidence through products made with safe, environmentally responsible ingredients. Our commitment is to ensure that everyone has access to premium fragrances, allowing people of all backgrounds to enjoy high-end products without paying excessive prices. At Scentlab, every lotion tells a story of authenticity, care, and elegance, crafted under the highest standards of quality and respect for both skin and the planet, elevating the client’s experience beyond the material through innovation.`,
    
    "vision_text": `Scentlab’s vision is to be recognized as a leading brand in olfactory innovation in Colombia and Latin America, standing out for integrating technology, personalization, and environmental commitment in the fragrance and personal care industry. Our goal is to build a loyal community of clients who value authenticity and excellence, while expanding internationally — always maintaining our pillars of quality and innovation. Scentlab doesn’t just sell products, it sells experiences that transform how people connect with their scent, their skin, and their surroundings.`,

    // --- Descripciones de productos ---
    "aromas amaderados": "Woody aromas with amber heart and citrus touch — long-lasting trail.",
    "jazmín y rosa": "Jasmine and rose on a musky base — elegant and seductive.",
    "esencia oscura": "Dark essence with intense, sophisticated notes — unforgettable presence.",
    "aroma intenso": "Intense aroma with woody notes, amber, and oriental spices.",
    "fragancia fresca": "Fresh fragrance with citrus, musk, and white woods.",
    "aroma moderno": "Modern scent with bergamot, vetiver, and fine woods.",
    "notas profundas": "Deep notes of leather, wood, and amber with an elegant touch.",
    "fragancia elegante": "Elegant feminine fragrance with floral notes and vanilla base.",
    "notas de jazmín": "Jasmine, white musk, and exotic flowers of pure elegance.",
    "toques cítricos": "Citrus and sweet touches with orange blossom and soft wood essence.",
    "aroma fresco": "Fresh scent with green, floral, and slightly fruity notes."
  }
};

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[\n\r\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toggleLanguage() {
  const isToEnglish = currentLang === "es";
  const dict = translations.en;
  const langBtn = document.getElementById("langToggle");

  // Guardar textos originales solo una vez
  if (Object.keys(originalTexts).length === 0) {
    document.querySelectorAll("h1, h2, h3, p, a:not(.social-btn), button, span, label, strong").forEach((el, i) => {
      originalTexts[i] = el.textContent.trim();
      el.dataset.textId = i;
    });
  }

  // Traducir textos generales (excluyendo redes sociales)
  document.querySelectorAll("h1, h2, h3, p, a:not(.social-btn), button, span, label, strong").forEach(el => {
    const id = el.dataset.textId;
    if (!id) return;
    const original = originalTexts[id];
    const norm = normalizeText(original);

    if (isToEnglish) {
      let t = dict[norm];

      // Traducción por palabras clave (para títulos)
      if (!t) {
        if (norm.includes("hombres")) t = "Men’s Fragrances";
        else if (norm.includes("mujeres")) t = "Women’s Fragrances";
        else if (norm.includes("colección exclusiva")) t = "Exclusive SCENT LAB Collection";
      }

      if (t) el.textContent = t;
    } else {
      el.textContent = original;
    }
  });

  // Traducir descripciones (.desc) — coincidencia parcial
  document.querySelectorAll(".desc").forEach(el => {
    if (!el.dataset.originalText) el.dataset.originalText = el.textContent.trim();
    if (isToEnglish) {
      const norm = normalizeText(el.dataset.originalText);
      let found = false;
      for (const [key, val] of Object.entries(dict)) {
        if (norm.includes(key)) {
          el.textContent = val;
          found = true;
          break;
        }
      }
      if (!found) el.textContent = el.dataset.originalText;
    } else {
      el.textContent = el.dataset.originalText;
    }
  });

  // Traducir carrito
  const cartButton = document.querySelector(".cart-toggle");
  const count = document.getElementById("cartCount")?.textContent || "0";
  if (cartButton) {
    cartButton.innerHTML = isToEnglish
      ? `🛒 Cart (<span id="cartCount">${count}</span>)`
      : `🛒 Carrito (<span id="cartCount">${count}</span>)`;
  }

  const cartTitle = document.querySelector("#cartContainer h3");
  const cartEmpty = document.getElementById("cartEmpty");
  const checkoutBtn = document.querySelector("#cartContainer .btn.primary");
  const clearBtn = document.querySelector("#cartContainer .btn.ghost");

  if (cartTitle) cartTitle.textContent = isToEnglish ? "Your Cart" : "Tu carrito";
  if (cartEmpty) cartEmpty.textContent = isToEnglish ? "Empty Cart" : "Carrito vacío";
  if (checkoutBtn) checkoutBtn.textContent = isToEnglish ? "Checkout" : "Finalizar compra";
  if (clearBtn) clearBtn.textContent = isToEnglish ? "Empty Cart" : "Vaciar carrito";

  // Traducir misión y visión
 // Traducir justificación, misión y visión
const nosotros = document.getElementById("nosotros");
if (nosotros) {
  const p = nosotros.querySelectorAll("p");

  // Justificación (busca por ID o posición)
  const justEs = document.getElementById("justificacion-es");
  const justEn = document.getElementById("justificacion-en");

  if (justEs && justEn) {
    justEs.style.display = isToEnglish ? "none" : "block";
    justEn.style.display = isToEnglish ? "block" : "none";
  }

  // Misión
  const misionEs = document.getElementById("mision-es");
  const misionEn = document.getElementById("mision-en");

  if (misionEs && misionEn) {
    misionEs.style.display = isToEnglish ? "none" : "block";
    misionEn.style.display = isToEnglish ? "block" : "none";
  }

  // Visión
  const visionEs = document.getElementById("vision-es");
  const visionEn = document.getElementById("vision-en");

  if (visionEs && visionEn) {
    visionEs.style.display = isToEnglish ? "none" : "block";
    visionEn.style.display = isToEnglish ? "block" : "none";
  }

  // Actualiza títulos
  const titJust = document.getElementById("titulo-justificacion");
  const titMision = document.getElementById("titulo-mision");
  const titVision = document.getElementById("titulo-vision");

  if (titJust) titJust.textContent = isToEnglish ? "Justification" : "Justificación";
  if (titMision) titMision.textContent = isToEnglish ? "Mission" : "Misión";
  if (titVision) titVision.textContent = isToEnglish ? "Vision" : "Visión";
}


  // Cambiar idioma actual
  currentLang = isToEnglish ? "en" : "es";
  langBtn.textContent = currentLang === "es" ? "EN / ES" : "ES / EN";
}
