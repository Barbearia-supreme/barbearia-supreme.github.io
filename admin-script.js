let todasLasCitas = []; // Guardará el respaldo de Firebase para aplicar los filtros

document.addEventListener('DOMContentLoaded', () => {
    const listaCitasBody = document.getElementById('lista-citas-body');
    const filtroBarbero = document.getElementById('filtro-barbero');
    const contadorCitas = document.getElementById('total-citas');

    // FUNCIÓN INTERNA: Convierte la fecha "2026-06-06" a formato abreviado "06-jun-2026"
    function formatearFechaTabla(fechaTexto) {
        if (!fechaTexto || !fechaTexto.includes('-')) return fechaTexto;
        
        try {
            const fechaObjeto = new Date(fechaTexto + 'T00:00:00');
            const opciones = { day: '2-digit', month: 'short', year: 'numeric' };
            
            let fechaFormateada = new Intl.DateTimeFormat('pt-BR', opciones).format(fechaObjeto);
            // Reemplaza puntos, conectores " de " y espacios por guiones individuales
            fechaFormateada = fechaFormateada.replace(/\./g, '').replace(/ de /g, '-').replace(/ /g, '-');
            return fechaFormateada.toLowerCase();
        } catch (e) {
            return fechaTexto; // Si falla por algún motivo, muestra la fecha original sin romper la app
        }
    }

    // 1. CONSULTA ORDENADA A FIREBASE: Trae las citas ordenadas por fecha cronológica
    if (window.db && window.collection && window.onSnapshot && window.query && window.orderBy) {
        
        const consultaOrdenada = window.query(window.collection(window.db, "citas"), window.orderBy("fecha", "asc"));

        window.onSnapshot(consultaOrdenada, (snapshot) => {
            todasLasCitas = []; // Limpiar caché local
            
            snapshot.forEach((doc) => {
                todasLasCitas.push({ id: doc.id, ...doc.data() });
            });

            // Renderizar la tabla con los datos actuales
            mostrarCitasEnTabla(todasLasCitas);
        });
    }

    // 2. FUNCIÓN PARA PINTAR LOS REGISTROS EN LA TABLA HTML (CON ORDEN CRONOLÓGICO)
    function mostrarCitasEnTabla(citasFiltradas) {
        listaCitasBody.innerHTML = ''; // Limpiar la tabla visual
        contadorCitas.textContent = citasFiltradas.length; // Actualizar métrica total

        if (citasFiltradas.length === 0) {
            listaCitasBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#888;">Nenhum agendamento encontrado.</td></tr>`;
            return;
        }

        // Ordenar las citas por la hora de 'inicio' antes de pintarlas
        citasFiltradas.sort((a, b) => {
            const horaA = a.inicio || "00:00";
            const horaB = b.inicio || "00:00";
            return horaA.localeCompare(horaB);
        });

        // Dibujar las filas en la tabla
        citasFiltradas.forEach((cita) => {
            const fila = document.createElement('tr');

            // 🔥 Pasamos la fecha por el formateador abreviado
            const fechaAbreviada = formatearFechaTabla(cita.fecha);

            fila.innerHTML = `
                <td><strong>${cita.cliente}</strong></td>
                <td>${cita.telefono}</td>
                <td>${cita.inicio} hs - ${cita.fin} hs</td>
                <td>${fechaAbreviada}</td> <!-- 🔥 Se usa la fecha con formato abreviado -->
                <td>${cita.barbero}</td>
                <td>${cita.servicio || 'No especificado'}</td>
                <td>
                    <button class="btn-eliminar" data-id="${cita.id}">Apagar ❌</button>
                </td>
            `;

            listaCitasBody.appendChild(fila);
        });

        // Activar los botones de eliminación que se acaban de crear
        asignarEventosEliminar();
    }

    // 3. LOGICA PARA FILTRAR POR BARBERO DESDE EL SELECTOR
    if (filtroBarbero) {
        filtroBarbero.addEventListener('change', (e) => {
            const barberoElegido = e.target.value;

            if (barberoElegido === 'todos') {
                mostrarCitasEnTabla(todasLasCitas);
            } else {
                const filtradas = todasLasCitas.filter(cita => cita.barbero === barberoElegido);
                mostrarCitasEnTabla(filtradas);
            }
        });
    }

    // 4. ELIMINAR DIRECTAMENTE DESDE LA WEB EN LA NUBE DE FIREBASE
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
                        console.error("Erro ao excluir agendamento do Firebase:", error);
                        alert("Não foi possível excluir o agendamento. Verifique as regras de segurança.");
                    }
                }
            });
        });
    }
});
