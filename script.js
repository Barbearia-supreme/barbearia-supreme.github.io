

     const horaApertura = "08:00";
    const horaCierre = "20:00";
    const bloqueMinimo = 15; 

    
    const fotosBarberos = {
   Carlos: "assets/carlos.jpg",
    Miguel: "assets/miguel.jpg"
    };

    // Array que se sincroniza automáticamente con Firebase  

let citasReservadas = [];


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


// Recalcular horarios automáticamente
selectServicio.addEventListener('change', calcularHorariosDisponibles);
selectBarbero.addEventListener('change', calcularHorariosDisponibles);
inputFecha.addEventListener('change', calcularHorariosDisponibles);
selectBarbero.addEventListener('change', mostrarFotoBarbero);
formulario.addEventListener('submit', registrarCita);

btnWhatsapp.addEventListener('click', () => {
    setTimeout(ocultarAvisoExito, 9000);
});


// FIREBASE - SINCRONIZACIÓN EN TIEMPO REAL


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


function horaAMinutos(horaTexto) {

    const [h, m] = horaTexto.split(':').map(Number);

    return (h * 60) + m;

}

function minutosAHora(minutos) {

    const h = Math.floor(minutos / 60);
    const m = minutos % 60;

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

}

function obtenerFechaHoy() {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;



   

}

function formatearFechaAmigable(fechaTexto) {
    if (!fechaTexto) return "";

    const fechaObjeto = new Date(fechaTexto + 'T00:00:00');

    const opciones = {
        day: '2-digit',
        month: 'short', 
        year: 'numeric'
    };

    
    let fechaFormateada = new Intl.DateTimeFormat('pt-BR', opciones).format(fechaObjeto);
    
    fechaFormateada = fechaFormateada.replace(/\./g, '').replace(/ de /g, '-').replace(/ /g, '-');

    return fechaFormateada.toLowerCase();
}


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

function calcularHorariosDisponibles() {

    const servicio = selectServicio.value;
    const barbero = selectBarbero.value;
    const fecha = inputFecha.value;
    if (!servicio || !barbero || !fecha) {

        selectHorario.innerHTML =
            '<option value="">Selecciona servicio, barbero y fecha</option>';

        return;

    }

    const fechaObjeto = new Date(fecha + 'T00:00:00');
    const diaSemana = fechaObjeto.getDay();
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
            '<option value="">Selecione um serviço e uma data primeiro</option>';

        return;

    }


    const duracionServicio = parseInt(servicio);

    selectHorario.innerHTML =
        '<option value="">Selecciona un horario</option>';

    let minInicio = horaAMinutos(horaApertura);

    const minFin = horaAMinutos(horaCierre);

    const fechaHoyStr = obtenerFechaHoy();

    if (fecha === fechaHoyStr) {

        const hoy = new Date();

        const horaActual = `${String(hoy.getHours()).padStart(2, '0')}:${String(hoy.getMinutes()).padStart(2, '0')}`;

        const minActual = horaAMinutos(horaActual);

        if (minActual > minInicio) {

            minInicio = minActual;

        }

    }

    // RECORRER HORARIOS DISPONIBLES
    
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
        

        if (horarioLibre) {

            const opcion = document.createElement('option');

            opcion.value = minutosAHora(tiempoActual);

            opcion.textContent = minutosAHora(tiempoActual);

            selectHorario.appendChild(opcion);

        }

    
    }

}

// REGISTRAR CITA

async function registrarCita(e) {

    e.preventDefault();

    const nombre = inputNombre.value;

    const telefono = inputTelefono.value;

    const telefonoLimpio = telefono.replace(/\D/g, '');

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

    // GUARDAR EN FIREBASE
   

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


        const telefonoBarberia = "5519997672157";

        const fechaAmigable =
            formatearFechaAmigable(fecha);

        const textoMensaje = `
 SUPREME BARBERSHOP!

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


function restringirCalendario() {

    inputFecha.min = obtenerFechaHoy();

}


function mostrarAvisoExito(mensaje, urlWhatsApp) {

    textoNotificacion.innerHTML = mensaje;

    btnWhatsapp.href = urlWhatsApp;

    notificacion.classList.add('mostrar');

    // Cerrar automáticamente
    setTimeout(() => {

        ocultarAvisoExito();

    }, 10000);

}


function ocultarAvisoExito() {

    notificacion.classList.remove('mostrar');

}




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



restringirCalendario();
