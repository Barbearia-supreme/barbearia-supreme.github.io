let todasLasCitas = []; // Guardará el respaldo de Firebase para aplicar los filtros

document.addEventListener('DOMContentLoaded', () => {
    const listaCitasBody = document.getElementById('lista-citas-body');
    const filtroBarbero = document.getElementById('filtro-barbero');
    const contadorCitas = document.getElementById('total-citas');

    // 1. CONSULTA ORDENADA A FIREBASE: Trae las citas ordenadas por fecha cronológica
    if (window.db && window.collection && window.onSnapshot && window.query && window.orderBy) {
        
        // Creamos una consulta ordenada por el campo 'fecha'
        const consultaOrdenada = window.query(window.collection(window.db, "citas"), window.orderBy("fecha", "asc"));

        window.onSnapshot(consultaOrdenada, (snapshot) => {
            todasLasCitas = []; // Limpiar caché local
            
            snapshot.forEach((doc) => {
                // Guardamos los datos de la cita añadiendo su ID interno de Firebase
                todasLasCitas.push({ id: doc.id, ...doc.data() });
            });

            // Renderizar la tabla con los datos actuales
            mostrarCitasEnTabla(todasLasCitas);
        });
    }

    // 2. FUNCIÓN PARA PINTAR LOS REGISTROS EN LA TABLA HTML
       // 2. FUNCIÓN PARA PINTAR LOS REGISTROS EN LA TABLA HTML (CON ORDEN CRONOLÓGICO)
    function mostrarCitasEnTabla(citasFiltradas) {
        listaCitasBody.innerHTML = ''; // Limpiar la tabla visual
        contadorCitas.textContent = citasFiltradas.length; // Actualizar métrica total

        if (citasFiltradas.length === 0) {
            listaCitasBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#888;">Nenhum agendamento encontrado.</td></tr>`;
            return;
        }

        // 🔥 NUEVO: Ordenar las citas por la hora de 'inicio' antes de pintarlas
        citasFiltradas.sort((a, b) => {
            // Aseguramos que existan los campos de inicio para evitar errores de lectura
            const horaA = a.inicio || "00:00";
            const horaB = b.inicio || "00:00";
            
            // Compara "08:15" contra "10:00" y los ordena de menor a mayor perfectamente
            return horaA.localeCompare(horaB);
        });

        // El resto de tu función original sigue exactamente igual
        citasFiltradas.forEach((cita) => {
            const fila = document.createElement('tr');

            fila.innerHTML = `
                <td><strong>${cita.cliente}</strong></td>
                <td>${cita.telefono}</td>
                <td>${cita.inicio} hs - ${cita.fin} hs</td>
                <td>${cita.fecha}</td>
                <td>${cita.barbero}</td>
                <td>${cita.servicio || 'No especificado'}</td>
                <td>
                    <button class="btn-eliminar" data-id="${cita.id}">Cancelar ❌</button>
                </td>
            `;

            listaCitasBody.appendChild(fila);
        });

        // Activar los botones de eliminación que se acaban de crear
        asignarEventosEliminar();
    }


    // 3. LOGICA PARA FILTRAR POR BARBERO DESDE EL SELECTOR
    filtroBarbero.addEventListener('change', (e) => {
        const barberoElegido = e.target.value;

        if (barberoElegido === 'todos') {
            mostrarCitasEnTabla(todasLasCitas);
        } else {
            const filtradas = todasLasCitas.filter(cita => cita.barbero === barberoElegido);
            mostrarCitasEnTabla(filtradas);
        }
    });

    // 4. ELIMINAR DIRECTAMENTE DESDE LA WEB EN LA NUBE DE FIREBASE
    function asignarEventosEliminar() {
        const botones = document.querySelectorAll('.btn-eliminar');
        
        botones.forEach((boton) => {
            boton.addEventListener('click', async (e) => {
                const idDocumento = e.target.getAttribute('data-id');
                
                const confirmar = confirm("¿Estás seguro de que deseas cancelar y eliminar permanentemente esta cita de la agenda?");
                
                if (confirmar) {
                    try {
                        // Comando directo a la nube usando el ID del documento
                        await window.deleteDoc(window.doc(window.db, "citas", idDocumento));
                        alert("Cita removida del servidor con éxito.");
                    } catch (error) {
                        console.error("Error al eliminar cita de Firebase:", error);
                        alert("No se pudo eliminar la cita. Revisa las reglas de seguridad.");
                    }
                }
            });
        });
    }
});
