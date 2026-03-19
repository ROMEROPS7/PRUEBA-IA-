// ============================================================
// DATOS DE EJEMPLO - SINIESTROS APP
// ============================================================

const PERITOS = [
    'Carlos Ruiz Martinez',
    'Elena Torres Vidal',
    'Miguel Angel Fernandez',
    'Laura Sanchez Gil',
    'Pedro Jimenez Ruiz'
];

const TIPOS_LABEL = {
    coche: 'Automovil',
    hogar: 'Hogar',
    salud: 'Salud',
    robo: 'Robo',
    otro: 'Otro'
};

const TIPOS_ICON = {
    coche: 'fa-car-crash',
    hogar: 'fa-house-damage',
    salud: 'fa-heartbeat',
    robo: 'fa-mask',
    otro: 'fa-file-alt'
};

let siniestros = [
    {
        id: 'EXP-2024-0891',
        cliente: 'Maria Garcia Lopez',
        telefono: '612 345 678',
        email: 'maria.garcia@email.com',
        poliza: 'POL-2024-00456',
        tipo: 'coche',
        descripcion: 'Colision frontal en la M-30 a la altura de la salida 7. El vehiculo contrario invadio el carril. Danos severos en la parte delantera. Airbags activados.',
        estado: 'Abierto',
        fecha: '2024-12-18',
        urgencia: 9,
        fraude: 12,
        perito: null,
        zona: 'Madrid',
        direccion: 'M-30 km 7.2, Madrid',
        lat: 40.4168,
        lng: -3.7038,
        timeline: [
            { fecha: '2024-12-18 09:15', titulo: 'Siniestro registrado', desc: 'Apertura automatica por llamada del cliente', tipo: 'completed' },
            { fecha: '2024-12-18 09:20', titulo: 'Documentacion solicitada', desc: 'Se solicita parte amistoso y fotos del vehiculo', tipo: 'completed' },
            { fecha: '2024-12-18 10:00', titulo: 'Pendiente asignacion de perito', desc: 'En espera de perito disponible en zona Madrid', tipo: 'active' }
        ],
        chat: [
            { usuario: 'Ana Martinez', iniciales: 'AM', texto: 'Acabo de recibir la llamada del cliente. Parece un siniestro grave, airbags activados.', hora: '09:15' },
            { usuario: 'Javier Lopez', iniciales: 'JL', texto: 'He revisado la poliza, tiene cobertura a todo riesgo. Proceded con la grua.', hora: '09:25' },
            { usuario: 'Ana Martinez', iniciales: 'AM', texto: 'Perfecto, necesitamos asignar perito urgente. La clienta esta en el hospital por revision.', hora: '09:30' }
        ],
        documentos: [
            { nombre: 'Parte amistoso.pdf', tamano: '245 KB', icono: 'fa-file-pdf' },
            { nombre: 'Foto_frontal.jpg', tamano: '1.8 MB', icono: 'fa-file-image' },
            { nombre: 'Foto_lateral.jpg', tamano: '2.1 MB', icono: 'fa-file-image' }
        ],
        cambios: [
            { texto: 'Siniestro creado por <strong>Ana Martinez</strong>', fecha: '18/12/2024 09:15' },
            { texto: 'Urgencia actualizada a <strong>9</strong>', fecha: '18/12/2024 09:16' },
            { texto: 'Documentacion solicitada al cliente', fecha: '18/12/2024 09:20' }
        ]
    },
    {
        id: 'EXP-2024-0890',
        cliente: 'Carlos Fernandez Ruiz',
        telefono: '634 567 890',
        email: 'carlos.fernandez@email.com',
        poliza: 'POL-2024-00312',
        tipo: 'hogar',
        descripcion: 'Inundacion en la planta baja por rotura de tuberia principal. Afectados salon, cocina y un dormitorio. Muebles y electrodomesticos danados.',
        estado: 'En gestion',
        fecha: '2024-12-17',
        urgencia: 7,
        fraude: 8,
        perito: 'Elena Torres Vidal',
        zona: 'Barcelona',
        direccion: 'Calle Aragon 234, Barcelona',
        lat: 41.3851,
        lng: 2.1734,
        timeline: [
            { fecha: '2024-12-17 14:30', titulo: 'Siniestro registrado', desc: 'Cliente reporta inundacion en vivienda', tipo: 'completed' },
            { fecha: '2024-12-17 15:00', titulo: 'Perito asignado', desc: 'Elena Torres Vidal asignada al caso', tipo: 'completed' },
            { fecha: '2024-12-17 16:30', titulo: 'Visita programada', desc: 'Visita del perito programada para el 19/12', tipo: 'active' }
        ],
        chat: [
            { usuario: 'Roberto Diaz', iniciales: 'RD', texto: 'El cliente reporta inundacion importante. Necesita actuacion rapida.', hora: '14:35' },
            { usuario: 'Elena Torres', iniciales: 'ET', texto: 'Acepto el caso. Programo visita para manana a primera hora.', hora: '15:10' },
            { usuario: 'Roberto Diaz', iniciales: 'RD', texto: 'Perfecto. El cliente ha cortado el agua general. Los bomberos ya actuaron.', hora: '15:15' }
        ],
        documentos: [
            { nombre: 'Fotos_inundacion.zip', tamano: '12.4 MB', icono: 'fa-file-archive' },
            { nombre: 'Poliza_hogar.pdf', tamano: '180 KB', icono: 'fa-file-pdf' }
        ],
        cambios: [
            { texto: 'Siniestro creado por <strong>Roberto Diaz</strong>', fecha: '17/12/2024 14:30' },
            { texto: 'Perito <strong>Elena Torres Vidal</strong> asignada', fecha: '17/12/2024 15:00' },
            { texto: 'Estado cambiado a <strong>En gestion</strong>', fecha: '17/12/2024 15:00' }
        ]
    },
    {
        id: 'EXP-2024-0889',
        cliente: 'Laura Mendez Torres',
        telefono: '678 901 234',
        email: 'laura.mendez@email.com',
        poliza: 'POL-2024-00289',
        tipo: 'robo',
        descripcion: 'Robo con fuerza en local comercial. Sustraccion de caja registradora y equipos informaticos. Cerradura forzada y cristal de la puerta roto.',
        estado: 'Perito asignado',
        fecha: '2024-12-16',
        urgencia: 8,
        fraude: 45,
        perito: 'Laura Sanchez Gil',
        zona: 'Valencia',
        direccion: 'Avenida del Puerto 89, Valencia',
        lat: 39.4699,
        lng: -0.3763,
        timeline: [
            { fecha: '2024-12-16 07:00', titulo: 'Siniestro registrado', desc: 'Denuncia policial presentada. Cliente notifica a la aseguradora', tipo: 'completed' },
            { fecha: '2024-12-16 08:30', titulo: 'Documentacion recibida', desc: 'Recibida copia de la denuncia y fotos del local', tipo: 'completed' },
            { fecha: '2024-12-16 10:00', titulo: 'Perito asignado', desc: 'Laura Sanchez Gil asignada para peritaje', tipo: 'completed' },
            { fecha: '2024-12-17 09:00', titulo: 'Peritaje en curso', desc: 'Perito visitando el local comercial', tipo: 'active' }
        ],
        chat: [
            { usuario: 'Ana Martinez', iniciales: 'AM', texto: 'Caso de robo con fuerza. Score de fraude elevado (45), revisad con atencion.', hora: '07:15' },
            { usuario: 'Laura Sanchez', iniciales: 'LS', texto: 'Revisado. El importe declarado es alto. Voy a verificar en persona manana.', hora: '10:30' },
            { usuario: 'Javier Lopez', iniciales: 'JL', texto: 'Ojo que este cliente tuvo otro siniestro de robo hace 8 meses.', hora: '11:00' },
            { usuario: 'Laura Sanchez', iniciales: 'LS', texto: 'Gracias por el dato. Lo tendre en cuenta en la valoracion.', hora: '11:15' }
        ],
        documentos: [
            { nombre: 'Denuncia_policial.pdf', tamano: '320 KB', icono: 'fa-file-pdf' },
            { nombre: 'Inventario_robado.xlsx', tamano: '45 KB', icono: 'fa-file-excel' },
            { nombre: 'Fotos_local.zip', tamano: '8.7 MB', icono: 'fa-file-archive' },
            { nombre: 'Video_seguridad.mp4', tamano: '156 MB', icono: 'fa-file-video' }
        ],
        cambios: [
            { texto: 'Siniestro creado por <strong>Ana Martinez</strong>', fecha: '16/12/2024 07:00' },
            { texto: 'Denuncia policial adjuntada', fecha: '16/12/2024 08:30' },
            { texto: 'Perito <strong>Laura Sanchez Gil</strong> asignada', fecha: '16/12/2024 10:00' },
            { texto: 'Estado cambiado a <strong>Perito asignado</strong>', fecha: '16/12/2024 10:00' },
            { texto: 'Score de fraude actualizado: <strong>45/100</strong>', fecha: '16/12/2024 10:30' }
        ]
    },
    {
        id: 'EXP-2024-0888',
        cliente: 'Pedro Alvarez Gomez',
        telefono: '645 678 901',
        email: 'pedro.alvarez@email.com',
        poliza: 'POL-2024-00178',
        tipo: 'salud',
        descripcion: 'Intervencion quirurgica de urgencia por apendicitis aguda. Ingreso en Hospital Universitario La Paz. Requiere 3 dias de hospitalizacion estimados.',
        estado: 'En gestion',
        fecha: '2024-12-17',
        urgencia: 10,
        fraude: 3,
        perito: null,
        zona: 'Madrid',
        direccion: 'Hospital La Paz, Madrid',
        lat: 40.4815,
        lng: -3.6872,
        timeline: [
            { fecha: '2024-12-17 22:00', titulo: 'Siniestro registrado', desc: 'Familiar del asegurado reporta ingreso de urgencias', tipo: 'completed' },
            { fecha: '2024-12-17 22:30', titulo: 'Cobertura verificada', desc: 'Poliza de salud premium verificada. Cobertura total', tipo: 'completed' },
            { fecha: '2024-12-18 08:00', titulo: 'Seguimiento hospitalario', desc: 'Coordinacion con el hospital para seguimiento', tipo: 'active' }
        ],
        chat: [
            { usuario: 'Guardia nocturna', iniciales: 'GN', texto: 'Recibida llamada de urgencia. Paciente ingresado en La Paz por apendicitis.', hora: '22:05' },
            { usuario: 'Ana Martinez', iniciales: 'AM', texto: 'Buenos dias. Tomo el caso. Contacto con el hospital para confirmar cobertura.', hora: '08:10' }
        ],
        documentos: [
            { nombre: 'Informe_urgencias.pdf', tamano: '890 KB', icono: 'fa-file-pdf' },
            { nombre: 'Autorizacion_cirugia.pdf', tamano: '120 KB', icono: 'fa-file-pdf' }
        ],
        cambios: [
            { texto: 'Siniestro creado por <strong>Guardia nocturna</strong>', fecha: '17/12/2024 22:00' },
            { texto: 'Cobertura verificada automaticamente', fecha: '17/12/2024 22:30' },
            { texto: 'Asignado a <strong>Ana Martinez</strong>', fecha: '18/12/2024 08:00' }
        ]
    },
    {
        id: 'EXP-2024-0887',
        cliente: 'Sofia Rodriguez Blanco',
        telefono: '623 456 789',
        email: 'sofia.rodriguez@email.com',
        poliza: 'POL-2024-00567',
        tipo: 'coche',
        descripcion: 'Danos por granizo en vehiculo aparcado en zona exterior. Multiples abolladuras en techo y capo. Cristal trasero agrietado.',
        estado: 'Perito asignado',
        fecha: '2024-12-15',
        urgencia: 4,
        fraude: 5,
        perito: 'Carlos Ruiz Martinez',
        zona: 'Zaragoza',
        direccion: 'Parking Centro Comercial Augusta, Zaragoza',
        lat: 41.6488,
        lng: -0.8891,
        timeline: [
            { fecha: '2024-12-15 18:00', titulo: 'Siniestro registrado', desc: 'Cliente reporta danos por granizo', tipo: 'completed' },
            { fecha: '2024-12-16 09:00', titulo: 'Perito asignado', desc: 'Carlos Ruiz Martinez asignado', tipo: 'completed' },
            { fecha: '2024-12-16 11:00', titulo: 'Valoracion en curso', desc: 'Perito realizando valoracion de danos', tipo: 'active' }
        ],
        chat: [
            { usuario: 'Roberto Diaz', iniciales: 'RD', texto: 'Siniestro comun por temporal de granizo en Zaragoza. Hay varios mas similares.', hora: '18:10' },
            { usuario: 'Carlos Ruiz', iniciales: 'CR', texto: 'Confirmo. Tengo 3 peritajes mas de la misma tormenta. Los agrupo.', hora: '09:15' }
        ],
        documentos: [
            { nombre: 'Fotos_vehiculo.zip', tamano: '5.2 MB', icono: 'fa-file-archive' },
            { nombre: 'Parte_meteorologico.pdf', tamano: '67 KB', icono: 'fa-file-pdf' }
        ],
        cambios: [
            { texto: 'Siniestro creado por <strong>Roberto Diaz</strong>', fecha: '15/12/2024 18:00' },
            { texto: 'Perito <strong>Carlos Ruiz Martinez</strong> asignado', fecha: '16/12/2024 09:00' },
            { texto: 'Estado cambiado a <strong>Perito asignado</strong>', fecha: '16/12/2024 09:00' }
        ]
    },
    {
        id: 'EXP-2024-0886',
        cliente: 'Antonio Navarro Perez',
        telefono: '656 789 012',
        email: 'antonio.navarro@email.com',
        poliza: 'POL-2024-00890',
        tipo: 'hogar',
        descripcion: 'Incendio en la cocina por cortocircuito en la instalacion electrica. Danos graves en cocina y parciales en comedor. Estructura no afectada.',
        estado: 'Resuelto',
        fecha: '2024-12-10',
        urgencia: 9,
        fraude: 15,
        perito: 'Miguel Angel Fernandez',
        zona: 'Sevilla',
        direccion: 'Calle Betis 56, Sevilla',
        lat: 37.3886,
        lng: -5.9823,
        timeline: [
            { fecha: '2024-12-10 03:30', titulo: 'Siniestro registrado', desc: 'Bomberos apagan incendio. Cliente llama a las 6:00', tipo: 'completed' },
            { fecha: '2024-12-10 09:00', titulo: 'Perito asignado', desc: 'Miguel Angel Fernandez asignado de urgencia', tipo: 'completed' },
            { fecha: '2024-12-10 14:00', titulo: 'Peritaje completado', desc: 'Valoracion de danos: 23.500 EUR', tipo: 'completed' },
            { fecha: '2024-12-12 10:00', titulo: 'Indemnizacion aprobada', desc: 'Aprobada indemnizacion de 23.500 EUR', tipo: 'completed' },
            { fecha: '2024-12-15 16:00', titulo: 'Expediente cerrado', desc: 'Pago realizado. Cliente satisfecho', tipo: 'completed' }
        ],
        chat: [
            { usuario: 'Guardia nocturna', iniciales: 'GN', texto: 'Incendio en vivienda en Sevilla. Bomberos han actuado. No hay heridos.', hora: '06:10' },
            { usuario: 'Miguel A. Fernandez', iniciales: 'MF', texto: 'Peritaje completado. Danos valorados en 23.500 EUR. Adjunto informe.', hora: '14:30' },
            { usuario: 'Ana Martinez', iniciales: 'AM', texto: 'Aprobada la indemnizacion. Tramitando el pago.', hora: '10:15' }
        ],
        documentos: [
            { nombre: 'Informe_bomberos.pdf', tamano: '1.2 MB', icono: 'fa-file-pdf' },
            { nombre: 'Peritaje_completo.pdf', tamano: '3.4 MB', icono: 'fa-file-pdf' },
            { nombre: 'Fotos_danos.zip', tamano: '18.9 MB', icono: 'fa-file-archive' },
            { nombre: 'Factura_indemnizacion.pdf', tamano: '95 KB', icono: 'fa-file-pdf' }
        ],
        cambios: [
            { texto: 'Siniestro creado por <strong>Guardia nocturna</strong>', fecha: '10/12/2024 06:10' },
            { texto: 'Perito <strong>Miguel Angel Fernandez</strong> asignado', fecha: '10/12/2024 09:00' },
            { texto: 'Peritaje completado: <strong>23.500 EUR</strong>', fecha: '10/12/2024 14:00' },
            { texto: 'Indemnizacion aprobada por <strong>Ana Martinez</strong>', fecha: '12/12/2024 10:00' },
            { texto: 'Pago realizado. Expediente <strong>cerrado</strong>', fecha: '15/12/2024 16:00' }
        ]
    },
    {
        id: 'EXP-2024-0885',
        cliente: 'Isabel Moreno Castro',
        telefono: '667 890 123',
        email: 'isabel.moreno@email.com',
        poliza: 'POL-2024-00445',
        tipo: 'coche',
        descripcion: 'Alcance trasero en semaforo. Danos leves en paragolpes trasero y piloto derecho. Sin heridos.',
        estado: 'Resuelto',
        fecha: '2024-12-08',
        urgencia: 3,
        fraude: 7,
        perito: 'Carlos Ruiz Martinez',
        zona: 'Malaga',
        direccion: 'Avenida de Andalucia 15, Malaga',
        lat: 36.7213,
        lng: -4.4214,
        timeline: [
            { fecha: '2024-12-08 17:45', titulo: 'Siniestro registrado', desc: 'Parte amistoso cumplimentado en el lugar', tipo: 'completed' },
            { fecha: '2024-12-09 10:00', titulo: 'Perito asignado', desc: 'Carlos Ruiz Martinez', tipo: 'completed' },
            { fecha: '2024-12-09 16:00', titulo: 'Valoracion completada', desc: 'Danos valorados en 1.200 EUR', tipo: 'completed' },
            { fecha: '2024-12-11 09:00', titulo: 'Expediente cerrado', desc: 'Reparacion autorizada en taller concertado', tipo: 'completed' }
        ],
        chat: [
            { usuario: 'Roberto Diaz', iniciales: 'RD', texto: 'Siniestro menor, alcance trasero. Parte amistoso firmado por ambas partes.', hora: '17:50' },
            { usuario: 'Carlos Ruiz', iniciales: 'CR', texto: 'Valoracion rapida: 1.200 EUR. Autorizo reparacion en taller Autolux Malaga.', hora: '16:15' }
        ],
        documentos: [
            { nombre: 'Parte_amistoso.pdf', tamano: '890 KB', icono: 'fa-file-pdf' },
            { nombre: 'Presupuesto_taller.pdf', tamano: '234 KB', icono: 'fa-file-pdf' }
        ],
        cambios: [
            { texto: 'Siniestro creado por <strong>Roberto Diaz</strong>', fecha: '08/12/2024 17:45' },
            { texto: 'Perito asignado y valoracion completada', fecha: '09/12/2024 16:00' },
            { texto: 'Expediente cerrado. Reparacion en taller', fecha: '11/12/2024 09:00' }
        ]
    },
    {
        id: 'EXP-2024-0884',
        cliente: 'Francisco Herrera Luna',
        telefono: '689 012 345',
        email: 'francisco.herrera@email.com',
        poliza: 'POL-2024-00678',
        tipo: 'otro',
        descripcion: 'Responsabilidad civil por danos a tercero en comunidad de vecinos. Filtracion de agua del piso del asegurado al piso inferior.',
        estado: 'En gestion',
        fecha: '2024-12-16',
        urgencia: 5,
        fraude: 10,
        perito: null,
        zona: 'Bilbao',
        direccion: 'Calle Gran Via 78, Bilbao',
        lat: 43.2630,
        lng: -2.9350,
        timeline: [
            { fecha: '2024-12-16 11:00', titulo: 'Siniestro registrado', desc: 'Vecino afectado reclama al asegurado', tipo: 'completed' },
            { fecha: '2024-12-16 12:00', titulo: 'En estudio', desc: 'Verificando cobertura de RC en la poliza', tipo: 'active' }
        ],
        chat: [
            { usuario: 'Javier Lopez', iniciales: 'JL', texto: 'Caso de RC. El vecino de abajo reclama danos por filtracion.', hora: '11:15' },
            { usuario: 'Ana Martinez', iniciales: 'AM', texto: 'Verifico la poliza. Tiene RC incluida hasta 300.000 EUR. Procederemos.', hora: '12:05' }
        ],
        documentos: [
            { nombre: 'Reclamacion_vecino.pdf', tamano: '156 KB', icono: 'fa-file-pdf' },
            { nombre: 'Fotos_danos_piso.zip', tamano: '4.3 MB', icono: 'fa-file-archive' }
        ],
        cambios: [
            { texto: 'Siniestro creado por <strong>Javier Lopez</strong>', fecha: '16/12/2024 11:00' },
            { texto: 'En estudio de cobertura', fecha: '16/12/2024 12:00' }
        ]
    },
    {
        id: 'EXP-2024-0883',
        cliente: 'Carmen Vega Ortiz',
        telefono: '698 123 456',
        email: 'carmen.vega@email.com',
        poliza: 'POL-2024-00234',
        tipo: 'robo',
        descripcion: 'Robo de vehiculo en parking subterraneo del centro comercial. El vehiculo es un BMW Serie 3 2023. Denuncia presentada ante la policia.',
        estado: 'Abierto',
        fecha: '2024-12-18',
        urgencia: 8,
        fraude: 68,
        perito: null,
        zona: 'Madrid',
        direccion: 'CC La Vaguada, Madrid',
        lat: 40.4797,
        lng: -3.7100,
        timeline: [
            { fecha: '2024-12-18 12:00', titulo: 'Siniestro registrado', desc: 'Clienta reporta robo del vehiculo', tipo: 'completed' },
            { fecha: '2024-12-18 12:30', titulo: 'Alerta de fraude', desc: 'Score de fraude elevado (68). Revision prioritaria', tipo: 'active' }
        ],
        chat: [
            { usuario: 'Ana Martinez', iniciales: 'AM', texto: 'ATENCION: Score de fraude muy alto (68). Esta clienta tiene historial de reclamaciones.', hora: '12:35' },
            { usuario: 'Javier Lopez', iniciales: 'JL', texto: 'Solicito las grabaciones del parking y el historial completo de la poliza.', hora: '12:40' }
        ],
        documentos: [
            { nombre: 'Denuncia_policial.pdf', tamano: '280 KB', icono: 'fa-file-pdf' },
            { nombre: 'Ficha_vehiculo.pdf', tamano: '145 KB', icono: 'fa-file-pdf' }
        ],
        cambios: [
            { texto: 'Siniestro creado por <strong>Ana Martinez</strong>', fecha: '18/12/2024 12:00' },
            { texto: 'Alerta de fraude activada: <strong>Score 68/100</strong>', fecha: '18/12/2024 12:30' }
        ]
    },
    {
        id: 'EXP-2024-0882',
        cliente: 'Roberto Diaz Martin',
        telefono: '654 321 098',
        email: 'roberto.diaz@email.com',
        poliza: 'POL-2024-00901',
        tipo: 'salud',
        descripcion: 'Tratamiento de rehabilitacion tras fractura de femur por caida. Requiere 20 sesiones de fisioterapia y revision traumatologica.',
        estado: 'Resuelto',
        fecha: '2024-11-20',
        urgencia: 6,
        fraude: 2,
        perito: null,
        zona: 'Barcelona',
        direccion: 'Clinica Teknon, Barcelona',
        lat: 41.3960,
        lng: 2.1340,
        timeline: [
            { fecha: '2024-11-20 10:00', titulo: 'Siniestro registrado', desc: 'Cliente solicita cobertura para rehabilitacion', tipo: 'completed' },
            { fecha: '2024-11-20 11:00', titulo: 'Cobertura aprobada', desc: 'Aprobadas 20 sesiones de fisioterapia', tipo: 'completed' },
            { fecha: '2024-12-15 10:00', titulo: 'Tratamiento completado', desc: 'Rehabilitacion finalizada con exito', tipo: 'completed' },
            { fecha: '2024-12-16 09:00', titulo: 'Expediente cerrado', desc: 'Alta medica confirmada', tipo: 'completed' }
        ],
        chat: [
            { usuario: 'Ana Martinez', iniciales: 'AM', texto: 'Caso sencillo de rehabilitacion. Poliza de salud premium con cobertura.', hora: '10:15' }
        ],
        documentos: [
            { nombre: 'Informe_traumatologo.pdf', tamano: '567 KB', icono: 'fa-file-pdf' },
            { nombre: 'Plan_rehabilitacion.pdf', tamano: '234 KB', icono: 'fa-file-pdf' },
            { nombre: 'Alta_medica.pdf', tamano: '189 KB', icono: 'fa-file-pdf' }
        ],
        cambios: [
            { texto: 'Siniestro creado', fecha: '20/11/2024 10:00' },
            { texto: 'Cobertura aprobada automaticamente', fecha: '20/11/2024 11:00' },
            { texto: 'Tratamiento completado', fecha: '15/12/2024 10:00' },
            { texto: 'Expediente <strong>cerrado</strong>', fecha: '16/12/2024 09:00' }
        ]
    }
];

let currentSiniestro = null;

// ============================================================
// NAVEGACION
// ============================================================

function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const pageEl = document.getElementById('page-' + page);
    if (pageEl) pageEl.classList.add('active');

    const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (navItem) navItem.classList.add('active');

    // Cerrar sidebar en movil
    document.getElementById('sidebar').classList.remove('open');
}

function openDetail(id) {
    const siniestro = siniestros.find(s => s.id === id);
    if (!siniestro) return;

    currentSiniestro = siniestro;
    renderDetail(siniestro);
    navigateTo('detalle');
}

// ============================================================
// INICIALIZACION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initDashboard();
    initExpedientes();
    initForm();
    initMetricas();
    initNotifications();
    initSearch();
});

function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            navigateTo(item.dataset.page);
        });
    });

    document.getElementById('menuToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
}

// ============================================================
// DASHBOARD
// ============================================================

function initDashboard() {
    renderDashboardTable();
    renderChartSiniestrosMes();
    renderChartTipos();
    updateKPIs();
}

function updateKPIs() {
    const abiertos = siniestros.filter(s => s.estado === 'Abierto').length;
    const enGestion = siniestros.filter(s => s.estado === 'En gestion' || s.estado === 'Perito asignado').length;
    const resueltos = siniestros.filter(s => s.estado === 'Resuelto').length;

    animateCounter('kpiAbiertos', abiertos);
    animateCounter('kpiGestion', enGestion);
    animateCounter('kpiResueltos', resueltos);
    animateCounter('kpiTotal', siniestros.length);
}

function animateCounter(elementId, target) {
    const el = document.getElementById(elementId);
    let current = 0;
    const step = Math.max(1, Math.floor(target / 30));
    const interval = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(interval);
        }
        el.textContent = current;
    }, 30);
}

function renderDashboardTable() {
    const tbody = document.getElementById('dashboardTableBody');
    const recent = [...siniestros].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 6);
    tbody.innerHTML = recent.map(s => `
        <tr>
            <td><strong>${s.id}</strong></td>
            <td>${s.cliente}</td>
            <td><i class="fas ${TIPOS_ICON[s.tipo]}"></i> ${TIPOS_LABEL[s.tipo]}</td>
            <td>${getStatusBadge(s.estado)}</td>
            <td>${formatDate(s.fecha)}</td>
            <td>${getUrgencyBadge(s.urgencia)}</td>
            <td>
                <div class="table-actions">
                    <button title="Ver detalle" onclick="openDetail('${s.id}')"><i class="fas fa-eye"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderChartSiniestrosMes() {
    const ctx = document.getElementById('chartSiniestrosMes').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            datasets: [
                {
                    label: 'Abiertos',
                    data: [15, 12, 18, 22, 20, 24],
                    backgroundColor: '#fee2e2',
                    borderColor: '#dc2626',
                    borderWidth: 1
                },
                {
                    label: 'En gestion',
                    data: [28, 25, 32, 35, 40, 38],
                    backgroundColor: '#fef3c7',
                    borderColor: '#f59e0b',
                    borderWidth: 1
                },
                {
                    label: 'Resueltos',
                    data: [45, 52, 48, 55, 60, 65],
                    backgroundColor: '#dcfce7',
                    borderColor: '#16a34a',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15 } } },
            scales: {
                x: { stacked: false, grid: { display: false } },
                y: { beginAtZero: true, grid: { color: '#f1f5f9' } }
            }
        }
    });
}

function renderChartTipos() {
    const ctx = document.getElementById('chartTipos').getContext('2d');
    const counts = {};
    siniestros.forEach(s => { counts[s.tipo] = (counts[s.tipo] || 0) + 1; });

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(counts).map(k => TIPOS_LABEL[k]),
            datasets: [{
                data: Object.values(counts),
                backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'],
                borderWidth: 0,
                spacing: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15 } }
            }
        }
    });
}

// ============================================================
// EXPEDIENTES
// ============================================================

function initExpedientes() {
    renderExpedientesTable();

    ['filtroEstado', 'filtroTipo', 'filtroUrgencia', 'filtroOrden'].forEach(id => {
        document.getElementById(id).addEventListener('change', renderExpedientesTable);
    });
}

function renderExpedientesTable() {
    let filtered = [...siniestros];

    const estado = document.getElementById('filtroEstado').value;
    const tipo = document.getElementById('filtroTipo').value;
    const urgMin = parseInt(document.getElementById('filtroUrgencia').value);
    const orden = document.getElementById('filtroOrden').value;

    if (estado) filtered = filtered.filter(s => s.estado === estado);
    if (tipo) filtered = filtered.filter(s => s.tipo === tipo);
    if (urgMin > 0) filtered = filtered.filter(s => s.urgencia >= urgMin);

    switch (orden) {
        case 'fecha-desc': filtered.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); break;
        case 'fecha-asc': filtered.sort((a, b) => new Date(a.fecha) - new Date(b.fecha)); break;
        case 'urgencia-desc': filtered.sort((a, b) => b.urgencia - a.urgencia); break;
        case 'fraude-desc': filtered.sort((a, b) => b.fraude - a.fraude); break;
    }

    const tbody = document.getElementById('expedientesTableBody');
    tbody.innerHTML = filtered.map(s => `
        <tr>
            <td><strong>${s.id}</strong></td>
            <td>${s.cliente}</td>
            <td><i class="fas ${TIPOS_ICON[s.tipo]}"></i> ${TIPOS_LABEL[s.tipo]}</td>
            <td>${getStatusBadge(s.estado)}</td>
            <td>${formatDate(s.fecha)}</td>
            <td>${getUrgencyBadge(s.urgencia)}</td>
            <td>${getFraudBadge(s.fraude)}</td>
            <td>
                <div class="table-actions">
                    <button title="Ver detalle" onclick="openDetail('${s.id}')"><i class="fas fa-eye"></i></button>
                    <button title="Asignar perito" onclick="openDetail('${s.id}'); setTimeout(()=>openModal('modalPerito'),300)"><i class="fas fa-user-tie"></i></button>
                    ${s.tipo === 'coche' ? `<button title="Enviar grua" onclick="openDetail('${s.id}'); setTimeout(()=>openModal('modalGrua'),300)"><i class="fas fa-truck"></i></button>` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// ============================================================
// DETALLE DE SINIESTRO
// ============================================================

function renderDetail(s) {
    document.getElementById('detalleTitle').textContent = s.id;
    document.getElementById('detalleEstadoBadge').outerHTML = getStatusBadge(s.estado);

    // Info
    document.getElementById('detalleInfo').innerHTML = `
        <div class="detail-info-item"><label>CLIENTE</label><span>${s.cliente}</span></div>
        <div class="detail-info-item"><label>TELEFONO</label><span>${s.telefono}</span></div>
        <div class="detail-info-item"><label>EMAIL</label><span>${s.email}</span></div>
        <div class="detail-info-item"><label>N. POLIZA</label><span>${s.poliza}</span></div>
        <div class="detail-info-item"><label>TIPO</label><span><i class="fas ${TIPOS_ICON[s.tipo]}"></i> ${TIPOS_LABEL[s.tipo]}</span></div>
        <div class="detail-info-item"><label>URGENCIA</label><span>${getUrgencyBadge(s.urgencia)}</span></div>
        <div class="detail-info-item"><label>FECHA</label><span>${formatDate(s.fecha)}</span></div>
        <div class="detail-info-item"><label>ZONA</label><span>${s.zona}</span></div>
        <div class="detail-info-item"><label>PERITO</label><span>${s.perito || 'Sin asignar'}</span></div>
        <div class="detail-info-item"><label>DIRECCION</label><span>${s.direccion}</span></div>
        <div class="detail-info-item" style="grid-column:1/-1"><label>DESCRIPCION</label><span>${s.descripcion}</span></div>
    `;

    // Timeline
    document.getElementById('detalleTimeline').innerHTML = s.timeline.map(t => `
        <div class="timeline-item">
            <div class="timeline-dot ${t.tipo}"></div>
            <div class="timeline-content">
                <h4>${t.titulo}</h4>
                <p>${t.desc}</p>
                <span class="timeline-date">${t.fecha}</span>
            </div>
        </div>
    `).join('');

    // Chat
    renderChat(s);

    // Fraud Score
    renderFraudScore(s.fraude);

    // Documents
    document.getElementById('documentsList').innerHTML = s.documentos.map(d => `
        <div class="doc-item">
            <i class="fas ${d.icono}"></i>
            <span class="doc-name">${d.nombre}</span>
            <span class="doc-size">${d.tamano}</span>
        </div>
    `).join('');

    // Changes
    document.getElementById('changesList').innerHTML = s.cambios.map(c => `
        <div class="change-item">
            ${c.texto}
            <span class="change-date">${c.fecha}</span>
        </div>
    `).join('');

    // Action buttons
    setupDetailActions(s);
}

function renderChat(s) {
    const container = document.getElementById('chatContainer');
    container.innerHTML = s.chat.map(m => `
        <div class="chat-message">
            <div class="chat-avatar">${m.iniciales}</div>
            <div class="chat-bubble">
                <div class="chat-name">${m.usuario}</div>
                <div class="chat-text">${m.texto}</div>
                <div class="chat-time">${m.hora}</div>
            </div>
        </div>
    `).join('');
    container.scrollTop = container.scrollHeight;
}

function renderFraudScore(score) {
    const container = document.getElementById('fraudScoreContainer');
    let color, level;
    if (score < 25) { color = '#16a34a'; level = 'Riesgo bajo'; }
    else if (score < 50) { color = '#f59e0b'; level = 'Riesgo medio'; }
    else { color = '#dc2626'; level = 'Riesgo alto'; }

    const angle = (score / 100) * 360;
    container.innerHTML = `
        <div class="fraud-gauge" style="background: conic-gradient(${color} ${angle}deg, #e2e8f0 ${angle}deg)">
            <div class="fraud-gauge-inner">
                <span class="fraud-gauge-value" style="color:${color}">${score}</span>
                <span class="fraud-gauge-label">/ 100</span>
            </div>
        </div>
        <p class="fraud-description" style="color:${color}; font-weight:600;">${level}</p>
    `;
}

function setupDetailActions(s) {
    document.getElementById('btnAsignarPerito').onclick = () => openModal('modalPerito');
    document.getElementById('btnEnviarGrua').onclick = () => openModal('modalGrua');
    document.getElementById('btnCerrarExpediente').onclick = () => {
        if (confirm('Desea cerrar este expediente?')) {
            s.estado = 'Resuelto';
            s.timeline.push({
                fecha: new Date().toISOString().slice(0, 16).replace('T', ' '),
                titulo: 'Expediente cerrado',
                desc: 'Cerrado por Ana Martinez',
                tipo: 'completed'
            });
            s.cambios.push({
                texto: 'Expediente <strong>cerrado</strong> por Ana Martinez',
                fecha: formatDateNow()
            });
            renderDetail(s);
            updateKPIs();
            renderExpedientesTable();
            renderDashboardTable();
            showToast('Expediente cerrado correctamente', 'success');
        }
    };

    // Chat send
    const chatInput = document.getElementById('chatInput');
    const btnChat = document.getElementById('btnEnviarChat');

    const sendChat = () => {
        const text = chatInput.value.trim();
        if (!text) return;
        s.chat.push({
            usuario: 'Ana Martinez',
            iniciales: 'AM',
            texto: text,
            hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        });
        chatInput.value = '';
        renderChat(s);
    };

    btnChat.onclick = sendChat;
    chatInput.onkeydown = (e) => { if (e.key === 'Enter') sendChat(); };

    // Confirm perito
    document.getElementById('btnConfirmarPerito').onclick = () => {
        const perito = document.getElementById('selectPerito').value;
        s.perito = perito;
        s.estado = 'Perito asignado';
        s.timeline.push({
            fecha: new Date().toISOString().slice(0, 16).replace('T', ' '),
            titulo: 'Perito asignado',
            desc: `${perito} asignado al expediente`,
            tipo: 'active'
        });
        s.cambios.push({
            texto: `Perito <strong>${perito}</strong> asignado`,
            fecha: formatDateNow()
        });
        closeModal('modalPerito');
        renderDetail(s);
        updateKPIs();
        renderExpedientesTable();
        renderDashboardTable();
        showToast(`Perito ${perito} asignado correctamente`, 'success');
    };

    // Confirm grua
    document.getElementById('btnConfirmarGrua').onclick = () => {
        const grua = document.getElementById('selectGrua').value;
        s.timeline.push({
            fecha: new Date().toISOString().slice(0, 16).replace('T', ' '),
            titulo: 'Grua solicitada',
            desc: `Servicio de grua solicitado a ${grua}`,
            tipo: 'active'
        });
        s.cambios.push({
            texto: `Grua solicitada: <strong>${grua}</strong>`,
            fecha: formatDateNow()
        });
        closeModal('modalGrua');
        renderDetail(s);
        showToast('Servicio de grua solicitado', 'success');
    };
}

// ============================================================
// FORMULARIO NUEVO SINIESTRO
// ============================================================

function initForm() {
    const form = document.getElementById('formNuevoSiniestro');
    const urgencia = document.getElementById('urgencia');
    const urgenciaValue = document.getElementById('urgenciaValue');
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const btnGeo = document.getElementById('btnGeolocalizacion');

    urgencia.addEventListener('input', () => {
        urgenciaValue.textContent = urgencia.value;
        const val = parseInt(urgencia.value);
        if (val <= 3) urgenciaValue.style.color = '#16a34a';
        else if (val <= 6) urgenciaValue.style.color = '#f59e0b';
        else if (val <= 8) urgenciaValue.style.color = '#ea580c';
        else urgenciaValue.style.color = '#dc2626';
    });

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.style.borderColor = 'var(--primary)'; });
    uploadArea.addEventListener('dragleave', () => { uploadArea.style.borderColor = ''; });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '';
        handleFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', () => handleFiles(fileInput.files));

    btnGeo.addEventListener('click', () => {
        if (navigator.geolocation) {
            btnGeo.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Obteniendo...';
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    document.getElementById('geoLat').textContent = pos.coords.latitude.toFixed(6);
                    document.getElementById('geoLng').textContent = pos.coords.longitude.toFixed(6);
                    document.getElementById('geoAddress').textContent = 'Ubicacion obtenida correctamente';
                    document.getElementById('geoInfo').style.display = 'block';
                    btnGeo.innerHTML = '<i class="fas fa-check"></i> Ubicacion obtenida';
                    btnGeo.style.background = 'var(--success-light)';
                    btnGeo.style.color = 'var(--success)';
                },
                () => {
                    // Fallback con coordenadas de ejemplo
                    document.getElementById('geoLat').textContent = '40.416775';
                    document.getElementById('geoLng').textContent = '-3.703790';
                    document.getElementById('geoAddress').textContent = 'Centro de Madrid (ubicacion aproximada)';
                    document.getElementById('geoInfo').style.display = 'block';
                    btnGeo.innerHTML = '<i class="fas fa-check"></i> Ubicacion estimada';
                    btnGeo.style.background = 'var(--warning-light)';
                    btnGeo.style.color = '#b45309';
                }
            );
        } else {
            showToast('Geolocalizacion no disponible en este navegador', 'warning');
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        submitNewSiniestro();
    });
}

function handleFiles(files) {
    const grid = document.getElementById('previewGrid');
    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const div = document.createElement('div');
            div.className = 'preview-item';
            div.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <button class="remove-btn" type="button" onclick="this.parentElement.remove()">&times;</button>
            `;
            grid.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
}

function submitNewSiniestro() {
    const nombre = document.getElementById('clienteNombre').value;
    const telefono = document.getElementById('clienteTelefono').value;
    const email = document.getElementById('clienteEmail').value;
    const poliza = document.getElementById('clientePoliza').value;
    const tipo = document.getElementById('tipoSiniestro').value;
    const urgencia = parseInt(document.getElementById('urgencia').value);
    const descripcion = document.getElementById('descripcion').value;

    const newId = 'EXP-2024-' + String(892 + siniestros.length - 10).padStart(4, '0');
    const today = new Date().toISOString().slice(0, 10);

    const nuevo = {
        id: newId,
        cliente: nombre,
        telefono: telefono,
        email: email,
        poliza: poliza,
        tipo: tipo,
        descripcion: descripcion,
        estado: 'Abierto',
        fecha: today,
        urgencia: urgencia,
        fraude: Math.floor(Math.random() * 30),
        perito: null,
        zona: 'Madrid',
        direccion: document.getElementById('direccionManual').value || 'Sin especificar',
        lat: 40.4168,
        lng: -3.7038,
        timeline: [
            {
                fecha: new Date().toISOString().slice(0, 16).replace('T', ' '),
                titulo: 'Siniestro registrado',
                desc: 'Apertura por formulario web',
                tipo: 'active'
            }
        ],
        chat: [
            {
                usuario: 'Sistema',
                iniciales: 'SI',
                texto: `Nuevo siniestro registrado: ${TIPOS_LABEL[tipo]} - ${nombre}`,
                hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
            }
        ],
        documentos: [],
        cambios: [
            {
                texto: 'Siniestro creado via <strong>formulario web</strong>',
                fecha: formatDateNow()
            }
        ]
    };

    siniestros.unshift(nuevo);
    resetForm();
    updateKPIs();
    renderDashboardTable();
    renderExpedientesTable();
    showToast(`Siniestro ${newId} registrado correctamente`, 'success');
    navigateTo('expedientes');
}

function resetForm() {
    document.getElementById('formNuevoSiniestro').reset();
    document.getElementById('previewGrid').innerHTML = '';
    document.getElementById('geoInfo').style.display = 'none';
    document.getElementById('urgenciaValue').textContent = '5';
    document.getElementById('urgenciaValue').style.color = 'var(--primary)';
    const btnGeo = document.getElementById('btnGeolocalizacion');
    btnGeo.innerHTML = '<i class="fas fa-crosshairs"></i> Obtener ubicacion automatica';
    btnGeo.style.background = '';
    btnGeo.style.color = '';
}

// ============================================================
// METRICAS
// ============================================================

function initMetricas() {
    renderChartResolucion();
    renderChartAhorro();
    renderChartSatisfaccion();
}

function renderChartResolucion() {
    const ctx = document.getElementById('chartResolucion').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Automovil', 'Hogar', 'Salud', 'Robo', 'Otro'],
            datasets: [{
                label: 'Dias promedio',
                data: [3.8, 5.2, 2.1, 6.5, 4.0],
                backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: {
                x: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                y: { grid: { display: false } }
            }
        }
    });
}

function renderChartAhorro() {
    const ctx = document.getElementById('chartAhorro').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            datasets: [{
                label: 'Ahorro acumulado',
                data: [12500, 19800, 26300, 33100, 40200, 47320],
                borderColor: '#16a34a',
                backgroundColor: 'rgba(22, 163, 74, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#16a34a',
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true, grid: { color: '#f1f5f9' },
                    ticks: { callback: v => v.toLocaleString('es-ES') + ' EUR' }
                }
            }
        }
    });
}

function renderChartSatisfaccion() {
    const ctx = document.getElementById('chartSatisfaccion').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            datasets: [{
                label: 'Satisfaccion',
                data: [7.8, 8.0, 8.1, 8.3, 8.5, 8.7],
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#f59e0b',
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { min: 6, max: 10, grid: { color: '#f1f5f9' } }
            }
        }
    });
}

// ============================================================
// NOTIFICACIONES
// ============================================================

function initNotifications() {
    const btn = document.getElementById('notifBtn');
    const dropdown = document.getElementById('notifDropdown');

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
        dropdown.classList.remove('show');
    });

    dropdown.addEventListener('click', (e) => e.stopPropagation());

    document.querySelector('.notif-clear').addEventListener('click', () => {
        document.querySelectorAll('.notif-item.unread').forEach(i => i.classList.remove('unread'));
        btn.querySelector('.badge').style.display = 'none';
    });
}

// ============================================================
// BUSQUEDA GLOBAL
// ============================================================

function initSearch() {
    document.getElementById('globalSearch').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query.length < 2) return;

        const results = siniestros.filter(s =>
            s.id.toLowerCase().includes(query) ||
            s.cliente.toLowerCase().includes(query) ||
            s.poliza.toLowerCase().includes(query)
        );

        if (results.length === 1) {
            openDetail(results[0].id);
        } else if (results.length > 0) {
            navigateTo('expedientes');
        }
    });
}

// ============================================================
// MODALES
// ============================================================

function openModal(id) {
    document.getElementById(id).classList.add('show');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('show');
}

// ============================================================
// TOASTS
// ============================================================

function showToast(message, type) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type || 'info'}`;

    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ============================================================
// UTILIDADES
// ============================================================

function getStatusBadge(estado) {
    const classes = {
        'Abierto': 'status-abierto',
        'En gestion': 'status-gestion',
        'Perito asignado': 'status-perito',
        'Resuelto': 'status-resuelto'
    };
    return `<span class="status-badge ${classes[estado] || ''}" id="detalleEstadoBadge">${estado}</span>`;
}

function getUrgencyBadge(level) {
    let cls;
    if (level <= 3) cls = 'urgency-low';
    else if (level <= 6) cls = 'urgency-medium';
    else if (level <= 8) cls = 'urgency-high';
    else cls = 'urgency-critical';
    return `<span class="urgency-badge ${cls}">${level}</span>`;
}

function getFraudBadge(score) {
    let cls, icon;
    if (score < 25) { cls = 'fraud-low'; icon = 'fa-shield-alt'; }
    else if (score < 50) { cls = 'fraud-medium'; icon = 'fa-exclamation-triangle'; }
    else { cls = 'fraud-high'; icon = 'fa-skull-crossbones'; }
    return `<span class="fraud-badge ${cls}"><i class="fas ${icon}"></i> ${score}</span>`;
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateNow() {
    const now = new Date();
    return now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
        ' ' + now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}
