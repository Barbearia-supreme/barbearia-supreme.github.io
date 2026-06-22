let todasLasCitas = []; 
let filtroBarberoActual = "todos";
let filtroFechaActual = "hoje"; 

document.addEventListener('DOMContentLoaded', () => {
    const filtroBarbero = document.getElementById('filtro-barbero');
    const contadorCitas = document.getElementById('total-citas');
    
    const btnHoje = document.getElementById('btn-filtro-hoje');
    const btnAmanha = document.getElementById('btn-filtro-amanha');
    const btnTodos = document.getElementById('btn-filtro-todos');
    const inputBuscarFecha = document.getElementById('buscar-fecha-admin');

    // CONVERTIR FORMATO DE FECHA A: "06-jun-2026"
    function formatearFechaTabla(fechaTexto) {
        if (!fechaTexto || !fechaTexto.includes('-')) return fechaTexto;
        try {
            const fechaObjeto = new Date(fechaTexto + 'T00:00:00');
            const opciones = { day: '2-digit', month: 'short', year: 'numeric' };
            let fechaFormateada = new Intl.DateTimeFormat('pt-BR', opciones).format(fechaObjeto);
            fechaFormateada = fechaFormateada.replace(/\./g, '').replace(/ de /g, '-').replace(/ /g, '-');
            return fechaFormateada.toLowerCase();
        } catch (e) {
            return fechaTexto;
        }
    }

    // OBTENER FECHAS DEL SISTEMA (Formato YYYY-MM-DD)
    function obtenerFechaString(desplazamiento = 0) {
        const d = new Date();
        d.setDate(d.getDate() + desplazamiento);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    // 1. CONEXIÓN Y ESCUCHA EN TIEMPO REAL CON FIREBASE
    if (window.db && window.collection && window.onSnapshot && window.query && window.orderBy) {
        const consultaOrdenada = window.query(window.collection(window.db, "citas"), window.orderBy("fecha", "asc"));

        window.onSnapshot(consultaOrdenada, (snapshot) => {
            todasLasCitas = [];
            snapshot.forEach((doc) => {
                todasLasCitas.push({ id: doc.id, ...doc.data() });
            });
            aplicarFiltrosCombinados();
        });
    }

    // 2. LOGICA DE FILTRADO COMBINADO (BARBERO + FECHA)
    function aplicarFiltrosCombinados() {
        let registradas = [...todasLasCitas];

        // Filtro de Profesionales
        if (filtroBarberoActual !== "todos") {
            registradas = registradas.filter(cita => cita.barbero === filtroBarberoActual);
        }

        // Filtro de Fechas
        const hoyStr = obtenerFechaString(0);
        const amanhaStr = obtenerFechaString(1);

        if (filtroFechaActual === "hoje") {
            registradas = registradas.filter(cita => cita.fecha === hoyStr);
        } else if (filtroFechaActual === "amanha") {
            registradas = registradas.filter(cita => cita.fecha === amanhaStr);
        } else if (filtroFechaActual !== "todos") {
            registradas = registradas.filter(cita => cita.fecha === filtroFechaActual);
        }

        // Ordenamiento Cronológico por Horario de Entrada
        registradas.sort((a, b) => {
            const horaA = a.inicio || "00:00";
            const horaB = b.inicio || "00:00";
            return horaA.localeCompare(horaB);
        });

        mostrarCitasEnTabla(registradas);
    }

    // 3. RENDERIZACIÓN DE LAS FILAS EN LA TABLA
    function mostrarCitasEnTabla(citasFiltradas) {
        const listaCitasBodySeguro = document.getElementById('lista-citas-body');
        if (!listaCitasBodySeguro) return;

        listaCitasBodySeguro.innerHTML = ''; 
        if (contadorCitas) contadorCitas.textContent = citasFiltradas.length;

        if (citasFiltradas.length === 0) {
            listaCitasBodySeguro.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#888; padding: 20px;">Nenhum agendamento encontrado para este período.</td></tr>`;
            return;
        }

        citasFiltradas.forEach((cita) => {
            const fila = document.createElement('tr');
            const fechaAbreviada = formatearFechaTabla(cita.fecha);

            fila.innerHTML = `
                <td><strong>${cita.cliente}</strong></td>
                <td>${cita.telefono}</td>
                <td>${cita.inicio} hs - ${cita.fin} hs</td>
                <td>${fechaAbreviada}</td>
                <td>${cita.barbero}</td>
                <td>${cita.servicio || 'No especificado'}</td>
                <td>
                    <button class="btn-eliminar" data-id="${cita.id}">Apagar ❌</button>
                </td>
            `;
            listaCitasBodySeguro.appendChild(fila);
        });

        asignarEventosEliminar();
    }

    // ACCIONES DE LOS FILTROS
    if (filtroBarbero) {
        filtroBarbero.addEventListener('change', (e) => {
            filtroBarberoActual = e.target.value;
            aplicarFiltrosCombinados();
        });
    }

    function refrescarBotonesActivos(btnActivo) {
        [btnHoje, btnAmanha, btnTodos].forEach(btn => {
            if(btn) btn.classList.remove('activo');
        });
        if (btnActivo) btnActivo.classList.add('activo');
        if (btnActivo !== null && inputBuscarFecha) inputBuscarFecha.value = ""; 
    }

    if (btnHoje) {
        btnHoje.addEventListener('click', () => {
            filtroFechaActual = "hoje";
            refrescarBotonesActivos(btnHoje);
            aplicarFiltrosCombinados();
        });
    }

    if (btnAmanha) {
        btnAmanha.addEventListener('click', () => {
            filtroFechaActual = "amanha";
            refrescarBotonesActivos(btnAmanha);
            aplicarFiltrosCombinados();
        });
    }

    if (btnTodos) {
        btnTodos.addEventListener('click', () => {
            filtroFechaActual = "todos";
            refrescarBotonesActivos(btnTodos);
            aplicarFiltrosCombinados();
        });
    }

    if (inputBuscarFecha) {
        inputBuscarFecha.addEventListener('change', (e) => {
            if (e.target.value) {
                filtroFechaActual = e.target.value; 
                refrescarBotonesActivos(null); 
                aplicarFiltrosCombinados();
            }
        });
    }

    
    function asignarEventosEliminar() {
        const botones = document.querySelectorAll('.btn-eliminar');
        botones.forEach((boton) => {
            boton.addEventListener('click', async (e) => {
                const idDocumento = e.target.getAttribute('data-id');
                const confirmar = confirm("Você tem certeza que deseja cancelar e excluir permanentemente este agendamento da agenda?");
                if (confirmar) {
                    try {
                        await window.deleteDoc(window.doc(window.db, "citas", idDocumento));
                        alert("Agendamento removido do servidor com sucesso.");
                    } catch (error) {
                        console.error("Erro ao excluir agendamento:", error);
                    }
                }
            });
        });
    }
});

