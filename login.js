/* ==============================================
   login.js
============================================== */

// Cambiar entre pestañas
function switchTab(tab) {
  const panelLogin    = document.getElementById('panelLogin');
  const panelRegister = document.getElementById('panelRegister');
  const tabLogin      = document.getElementById('tabLogin');
  const tabRegister   = document.getElementById('tabRegister');
  const msg           = document.getElementById('loginMsg');

  msg.textContent = '';
  msg.className   = 'login-msg';

  if (tab === 'login') {
    panelLogin.classList.remove('hidden');
    panelRegister.classList.add('hidden');
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
  } else {
    panelRegister.classList.remove('hidden');
    panelLogin.classList.add('hidden');
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
  }
}

// Mostrar/ocultar contraseña
function togglePass(id, btn) {
  const input = document.getElementById(id);
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁';
  }
}

// Selector de ficha
document.querySelectorAll('.token-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.token-opt').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Mostrar mensaje
function showMsg(text, type) {
  const msg = document.getElementById('loginMsg');
  msg.textContent = text;
  msg.className   = 'login-msg ' + type;
  // re-trigger animación
  if (type === 'error') {
    msg.style.animation = 'none';
    requestAnimationFrame(() => { msg.style.animation = ''; });
  }
}

// Validación básica Login
function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPass').value;

  if (!email || !pass) {
    showMsg('⚠ Por favor completa todos los campos.', 'error');
    return;
  }
  if (!email.includes('@')) {
    showMsg('⚠ Ingresa un correo válido.', 'error');
    return;
  }
  if (pass.length < 6) {
    showMsg('⚠ La contraseña debe tener al menos 6 caracteres.', 'error');
    return;
  }

  // Simular carga
  const btn = document.querySelector('#panelLogin .btn-submit');
  btn.textContent = '⏳ Ingresando...';
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = 'Entrar al Juego 🎲';
    btn.disabled = false;
    showMsg('✅ ¡Bienvenido/a! Redirigiendo al tablero...', 'success');
    setTimeout(() => { window.location.href = 'tablero.html'; }, 1400);
  }, 1200);
}

// Validación básica Registro
function handleRegister() {
  const name  = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass  = document.getElementById('regPass').value;
  const token = document.querySelector('.token-opt.active')?.dataset.token || '🧑';

  if (!name || !email || !pass) {
    showMsg('⚠ Por favor completa todos los campos.', 'error');
    return;
  }
  if (!email.includes('@')) {
    showMsg('⚠ Ingresa un correo válido.', 'error');
    return;
  }
  if (pass.length < 8) {
    showMsg('⚠ La contraseña debe tener al menos 8 caracteres.', 'error');
    return;
  }

  const btn = document.querySelector('#panelRegister .btn-submit');
  btn.textContent = '⏳ Creando cuenta...';
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = 'Crear Cuenta 🏥';
    btn.disabled = false;
    showMsg(`✅ ¡Cuenta creada! Ficha elegida: ${token}`, 'success');
    setTimeout(() => { window.location.href = 'tablero.html'; }, 1500);
  }, 1300);
}
