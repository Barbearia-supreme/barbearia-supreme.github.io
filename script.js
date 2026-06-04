// ======================================================
// CONFIGURACIÓN GENERAL
// ======================================================

const horaApertura = "08:00";
const horaCierre = "20:00";
const bloqueMinimo = 15; // División de horarios en minutos

// Fotos de los barberos
const fotosBarberos = {
    Maduro: "assets/lula.png",
    Lula: "assets/maduro.png"
};

// Array que se sincroniza automáticamente con Firebase
let citasReservadas = [];


// ======================================================
// ELEMENTOS DEL DOM
// ======================================================

const formulario = document.getElementById('formulario');

const inputNombre = document.getElementById('nombre');
const inputTelefono = document.getElementById('telefono');
const inputFecha = document.getElementById('fecha');

const selectServicio = document.getElementById('servicio');
const selectBarbero = document.getElementById('barbero');
const selectHorario = document.getElementById('horario');

const contenedorFoto = document.getElementById('contenedor-foto-barbero');
const fotoBarbero = document.getElementById('foto-barbero');

const notificacion = document.getElementById('notificacion');
const textoNotificacion = document.getElementById('notificacion-mensaje');
const btnWhatsapp = document.getElementById('btn-whatsapp-confirmar');


// ======================================================
// EVENTOS
// ======================================================

// Recalcular horarios automáticamente
selectServicio.addEventListener('change', calcularHorariosDisponibles);
selectBarbero.addEventListener('change', calcularHorariosDisponibles);
inputFecha.addEventListener('change', calcularHorariosDisponibles);

// Mostrar foto del barbero
selectBarbero.addEventListener('change', mostrarFotoBarbero);

// Enviar formulario
formulario.addEventListener('submit', registrarCita);

// Cerrar notificación después de abrir WhatsApp
btnWhatsapp.addEventListener('click', () => {
    setTimeout(ocultarAvisoExito, 1000);
});



// ======================================================
// FIREBASE - SINCRONIZACIÓN EN TIEMPO REAL
// ======================================================

if (window.onSnapshot && window.collection && window.db) {

    window.onSnapshot(
        window.collection(window.db, "citas"),

        (snapshot) => {

            citasReservadas = [];

            snapshot.forEach((doc) => {
                citasReservadas.push(doc.data());
            });

            console.log("Citas sincronizadas:", citasReservadas);

            calcularHorariosDisponibles();
        }

    );

} else {

    console.error("Firebase no está disponible.");

}


// ======================================================
// FUNCIONES AUXILIARES
// ======================================================

// Convertir hora a minutos
function horaAMinutos(horaTexto) {

    const [h, m] = horaTexto.split(':').map(Number);

    return (h * 60) + m;

}


// Convertir minutos a hora
function minutosAHora(minutos) {

    const h = Math.floor(minutos / 60);
    const m = minutos % 60;

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

}


// Obtener fecha de hoy
function obtenerFechaHoy() {

    const hoy = new Date();

    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;

}


// Convertir fecha en formato amigable
function formatearFechaAmigable(fechaTexto) {

    if (!fechaTexto) return "";

    const fechaObjeto = new Date(fechaTexto + 'T00:00:00');

    const opciones = {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    };

    let fechaFormateada = new Intl.DateTimeFormat('pt-BR', opciones)
        .format(fechaObjeto);

    return fechaFormateada.charAt(0).toUpperCase() +
        fechaFormateada.slice(1);

}


// ======================================================
// FOTO DEL BARBERO
// ======================================================

function mostrarFotoBarbero() {

    const barberoSeleccionado = selectBarbero.value;

    if (
        barberoSeleccionado &&
        fotosBarberos[barberoSeleccionado]
    ) {

        fotoBarbero.src = fotosBarberos[barberoSeleccionado];

        contenedorFoto.classList.add('mostrar-foto');

    } else {

        contenedorFoto.classList.remove('mostrar-foto');

        fotoBarbero.src = "";

    }

}


// ======================================================
// CALCULAR HORARIOS DISPONIBLES
// ======================================================

function calcularHorariosDisponibles() {

    const servicio = selectServicio.value;
    const barbero = selectBarbero.value;
    const fecha = inputFecha.value;

    // Validar selección mínima
    if (!servicio || !barbero || !fecha) {

        selectHorario.innerHTML =
            '<option value="">Selecciona servicio, barbero y fecha</option>';

        return;

    }

    // ==================================================
    // VALIDAR DOMINGOS
    // ==================================================

    const fechaObjeto = new Date(fecha + 'T00:00:00');

    const diaSemana = fechaObjeto.getDay();

    // 0 = Domingo
    if (diaSemana === 0) {

        const mensajeDomingo = `
            <strong>Barbearia Fechada</strong><br>
              Não trabalhamos aos domingos.
              Por favor, selecione outro dia.
        `;

        notificacion.classList.add('alerta-roja');

        mostrarAvisoExito(mensajeDomingo, "#");

        btnWhatsapp.style.display = 'none';

        setTimeout(() => {

            notificacion.classList.remove('mostrar');
            notificacion.classList.remove('alerta-roja');

            btnWhatsapp.style.display = 'inline-block';

        }, 5000);

        inputFecha.value = "";

        selectHorario.innerHTML =
            '<option value="">Selecciona un servicio y fecha primero</option>';

        return;

    }

    // ==================================================
    // PREPARAR HORARIOS
    // ==================================================

    const duracionServicio = parseInt(servicio);

    selectHorario.innerHTML =
        '<option value="">Selecciona un horario</option>';

    let minInicio = horaAMinutos(horaApertura);

    const minFin = horaAMinutos(horaCierre);

    // ==================================================
    // VALIDAR HORA ACTUAL SI ES HOY
    // ==================================================

    const fechaHoyStr = obtenerFechaHoy();

    if (fecha === fechaHoyStr) {

        const hoy = new Date();

        const horaActual = `${String(hoy.getHours()).padStart(2, '0')}:${String(hoy.getMinutes()).padStart(2, '0')}`;

        const minActual = horaAMinutos(horaActual);

        if (minActual > minInicio) {

            minInicio = minActual;

        }

    }

    // ==================================================
    // RECORRER HORARIOS DISPONIBLES
    // ==================================================

    for (

        let tiempoActual = minInicio;

        tiempoActual + duracionServicio <= minFin;

        tiempoActual += bloqueMinimo

    ) {

        const tiempoFinServicio =
            tiempoActual + duracionServicio;

        let horarioLibre = true;

        // Revisar colisiones con citas existentes
        for (let cita of citasReservadas) {

            if (
                cita.barbero === barbero &&
                cita.fecha === fecha
            ) {

                const citaInicio =
                    horaAMinutos(cita.inicio);

                const citaFin =
                    horaAMinutos(cita.fin);

                // Detectar choque de horarios
                if (

                    tiempoActual < citaFin &&
                    tiempoFinServicio > citaInicio

                ) {

                    horarioLibre = false;

                    break;

                }

            }

        }

        // Crear opción disponible
        if (horarioLibre) {

            const opcion = document.createElement('option');

            opcion.value = minutosAHora(tiempoActual);

            opcion.textContent = minutosAHora(tiempoActual);

            selectHorario.appendChild(opcion);

        }

    }

}


// ======================================================
// REGISTRAR CITA
// ======================================================

async function registrarCita(e) {

    e.preventDefault();

    const nombre = inputNombre.value;

    const telefono = inputTelefono.value;

    // Limpiar teléfono
    const telefonoLimpio = telefono.replace(/\D/g, '');

    // Validación
    const regexTelefono = /^[0-9]{10,15}$/;

    if (!regexTelefono.test(telefonoLimpio)) {

        alert(`
            Por favor, digite um número válido.
           Apenas números entre 10 e 15 dígitos.
        `);

        return;

    }

    const horarioSeleccionado = selectHorario.value;

    if (!horarioSeleccionado) {

        alert("Selecione um horário disponível.");

        return;

    }

    // ==================================================
    // DATOS DEL SERVICIO
    // ==================================================

    const nombreServicio =
        selectServicio.options[
            selectServicio.selectedIndex
        ].text;

    const servicioMinutos =
        parseInt(selectServicio.value);

    const barbero = selectBarbero.value;

    const fecha = inputFecha.value;

    const horaInicio = horarioSeleccionado;

    const minutosInicio =
        horaAMinutos(horaInicio);

    const minutosFin =
        minutosInicio + servicioMinutos;

    const horaFin =
        minutosAHora(minutosFin);

    // ==================================================
    // OBJETO DE CITA
    // ==================================================

    const nuevaCita = {

        cliente: nombre,

        telefono: telefonoLimpio,

        servicio: nombreServicio,

        barbero: barbero,

        fecha: fecha,

        inicio: horaInicio,

        fin: horaFin,

        fechaRegistro: new Date()

    };

    // ==================================================
    // GUARDAR EN FIREBASE
    // ==================================================

    try {

        if (
            window.addDoc &&
            window.collection &&
            window.db
        ) {

            await window.addDoc(

                window.collection(window.db, "citas"),

                nuevaCita

            );

            console.log("Agendamento salvo com sucesso.");

        } else {

            throw new Error(
                "Firebase no está inicializado."
            );

        }

        // ==============================================
        // PREPARAR WHATSAPP
        // ==============================================

        const telefonoBarberia = "5519997672157";

        const fechaAmigable =
            formatearFechaAmigable(fecha);

        const textoMensaje = `
 Olá, Barbearia Bunny!

Gostaria de confirmar meu agendamento:

*Cliente:* ${nombre}
*Teléfone:* ${telefonoLimpio}
*serviço:* ${nombreServicio}
*Barbeiro:* ${barbero}
*Data:* ${fechaAmigable}
*Hora:* ${horaInicio} hs
`;

        const urlWhatsApp =
            `https://wa.me/${telefonoBarberia}?text=${encodeURIComponent(textoMensaje)}`;

        // ==============================================
        // MOSTRAR NOTIFICACIÓN
        // ==============================================

        const mensajeProfesional = `
            <strong>¡perfeito, ${nombre}!</strong><br>Seu horário com
            
            <strong>${barbero}</strong>
            foi reservado para
            ${fechaAmigable}
           às ${horaInicio} hs.
        `;

        mostrarAvisoExito(
            mensajeProfesional,
            urlWhatsApp
        );

        // ==============================================
        // LIMPIAR FORMULARIO
        // ==============================================

        formulario.reset();

        calcularHorariosDisponibles();

        contenedorFoto.classList.remove('mostrar-foto');

    } catch (error) {

        console.error(
            "Erro ao salvar agendamento.:",
            error
        );

        alert(`
           Ocorreu um erro ao salvar o agendamento no servidor. 
        `);

    }

}


// ======================================================
// RESTRINGIR FECHAS PASADAS
// ======================================================

function restringirCalendario() {

    inputFecha.min = obtenerFechaHoy();

}


// ======================================================
// NOTIFICACIONES
// ======================================================

function mostrarAvisoExito(mensaje, urlWhatsApp) {

    textoNotificacion.innerHTML = mensaje;

    btnWhatsapp.href = urlWhatsApp;

    notificacion.classList.add('mostrar');

    // Cerrar automáticamente
    setTimeout(() => {

        ocultarAvisoExito();

    }, 8000);

}


function ocultarAvisoExito() {

    notificacion.classList.remove('mostrar');

}


// ======================================================
// EFECTO VISUAL AL HACER SCROLL
// ======================================================

function efectoScroll() {

    const elementosAFiltrar = document.querySelectorAll(
        '.agendamiento h2, .campo, .boton'
    );

    const alturaLimiteHeader = 150;

    elementosAFiltrar.forEach((elemento) => {

        const posicionEfectiva =
            elemento.getBoundingClientRect().top;

        if (posicionEfectiva < alturaLimiteHeader) {

            elemento.style.opacity = "0";

            elemento.style.visibility = "hidden";

        } else {

            elemento.style.opacity = "1";

            elemento.style.visibility = "visible";

        }

    });

}


// ======================================================
// INICIALIZACIÓN
// ======================================================

restringirCalendario();
