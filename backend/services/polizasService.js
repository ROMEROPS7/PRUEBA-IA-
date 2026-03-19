// =============================================================================
// SERVICIO DE POLIZAS DE SEGUROS - Motor completo de productos y coberturas
// =============================================================================

// ---------------------------------------------------------------------------
// CATALOGO DE PRODUCTOS
// ---------------------------------------------------------------------------
const productos = {
  coche: {
    id: 'PROD-AUTO',
    nombre: 'Seguro de Automovil',
    descripcion: 'Proteccion integral para tu vehiculo y responsabilidad civil',
    coberturas: [
      { nombre: 'Responsabilidad Civil Obligatoria', descripcion: 'Cobertura legal obligatoria por danos a terceros en accidentes de trafico', limite_euros: 70000000, incluida_en: ['basica', 'completa', 'premium'] },
      { nombre: 'Responsabilidad Civil Voluntaria', descripcion: 'Ampliacion de la cobertura de RC hasta el limite indicado', limite_euros: 50000000, incluida_en: ['completa', 'premium'] },
      { nombre: 'Lunas', descripcion: 'Reparacion o sustitucion de lunas, parabrisas y cristales del vehiculo', limite_euros: 1500, incluida_en: ['completa', 'premium'] },
      { nombre: 'Robo', descripcion: 'Indemnizacion por robo total o parcial del vehiculo y accesorios fijos', limite_euros: 30000, incluida_en: ['completa', 'premium'] },
      { nombre: 'Incendio', descripcion: 'Danos causados por incendio, explosion o caida de rayo en el vehiculo', limite_euros: 40000, incluida_en: ['completa', 'premium'] },
      { nombre: 'Asistencia en Viaje', descripcion: 'Grua, vehiculo de sustitucion y asistencia mecanica 24h en carretera', limite_euros: 3000, incluida_en: ['basica', 'completa', 'premium'] },
      { nombre: 'Danos Propios - Todo Riesgo', descripcion: 'Cobertura de danos propios del vehiculo incluyendo colision, vuelco y salida de via', limite_euros: 50000, incluida_en: ['premium'] },
      { nombre: 'Accidentes del Conductor', descripcion: 'Indemnizacion por fallecimiento o invalidez permanente del conductor', limite_euros: 100000, incluida_en: ['completa', 'premium'] },
    ],
    exclusiones: [
      'Conduccion bajo efectos de alcohol o drogas',
      'Uso del vehiculo en competiciones no autorizadas',
      'Danos por desgaste natural o falta de mantenimiento',
      'Conduccion sin permiso valido en vigor',
      'Actos intencionados del asegurado',
      'Guerra, terrorismo o catastrofes nucleares',
    ],
    franquicias: { basica: 0, completa: 300, premium: 150 },
  },

  hogar: {
    id: 'PROD-HOG',
    nombre: 'Seguro de Hogar',
    descripcion: 'Proteccion completa para tu vivienda, bienes y responsabilidad civil familiar',
    coberturas: [
      { nombre: 'Continente', descripcion: 'Estructura de la vivienda: paredes, suelos, techos, instalaciones fijas', limite_euros: 300000, incluida_en: ['basica', 'completa', 'premium'] },
      { nombre: 'Contenido', descripcion: 'Muebles, electrodomesticos, ropa y enseres personales del hogar', limite_euros: 50000, incluida_en: ['basica', 'completa', 'premium'] },
      { nombre: 'Responsabilidad Civil Familiar', descripcion: 'Danos causados involuntariamente a terceros por los miembros de la familia', limite_euros: 600000, incluida_en: ['basica', 'completa', 'premium'] },
      { nombre: 'Robo y Expoliacion', descripcion: 'Sustraccion ilegitima de bienes dentro de la vivienda o por atraco', limite_euros: 15000, incluida_en: ['completa', 'premium'] },
      { nombre: 'Danos por Agua', descripcion: 'Filtraciones, roturas de tuberias, goteras y danos derivados de escapes de agua', limite_euros: 30000, incluida_en: ['basica', 'completa', 'premium'] },
      { nombre: 'Incendio y Explosion', descripcion: 'Danos por fuego, explosion, caida de rayo y humo en la vivienda', limite_euros: 300000, incluida_en: ['basica', 'completa', 'premium'] },
      { nombre: 'Fenomenos Atmosfericos', descripcion: 'Lluvia, viento, granizo, nieve y heladas que causen danos a la vivienda', limite_euros: 50000, incluida_en: ['completa', 'premium'] },
      { nombre: 'Asistencia Hogar 24h', descripcion: 'Cerrajero, electricista, fontanero y cristalero de urgencia las 24 horas', limite_euros: 5000, incluida_en: ['completa', 'premium'] },
      { nombre: 'Joyas y Objetos de Valor', descripcion: 'Cobertura especial para joyas, obras de arte y objetos de alto valor declarados', limite_euros: 25000, incluida_en: ['premium'] },
    ],
    exclusiones: [
      'Vivienda deshabitada mas de 60 dias consecutivos sin aviso',
      'Danos esteticos sin afectar funcionalidad',
      'Humedades por falta de mantenimiento o condensacion',
      'Bienes no declarados con valor superior a 3.000 euros',
      'Danos causados por animales domesticos del asegurado a la propia vivienda',
    ],
    franquicias: { basica: 200, completa: 150, premium: 0 },
  },

  vida: {
    id: 'PROD-VID',
    nombre: 'Seguro de Vida',
    descripcion: 'Proteccion economica para tu familia ante fallecimiento o invalidez',
    coberturas: [
      { nombre: 'Fallecimiento por cualquier causa', descripcion: 'Capital asegurado a los beneficiarios en caso de fallecimiento del asegurado', limite_euros: 300000, incluida_en: ['basica', 'completa', 'premium'] },
      { nombre: 'Invalidez Permanente Absoluta (IPA)', descripcion: 'Capital asegurado si el asegurado queda en situacion de invalidez permanente absoluta', limite_euros: 300000, incluida_en: ['basica', 'completa', 'premium'] },
      { nombre: 'Invalidez Permanente Total', descripcion: 'Indemnizacion por invalidez permanente total para la profesion habitual', limite_euros: 200000, incluida_en: ['completa', 'premium'] },
      { nombre: 'Doble Capital por Accidente', descripcion: 'Duplica el capital asegurado si el fallecimiento es por accidente', limite_euros: 600000, incluida_en: ['completa', 'premium'] },
      { nombre: 'Gran Invalidez', descripcion: 'Capital adicional cuando se necesita asistencia de tercera persona', limite_euros: 500000, incluida_en: ['premium'] },
      { nombre: 'Anticipo por Enfermedad Grave', descripcion: 'Anticipo del 50% del capital en caso de diagnostico de enfermedad terminal', limite_euros: 150000, incluida_en: ['premium'] },
    ],
    exclusiones: [
      'Suicidio durante el primer ano de vigencia de la poliza',
      'Fallecimiento en actos delictivos dolosos',
      'Practicas de deportes de alto riesgo no declarados',
      'Enfermedades preexistentes no declaradas en el cuestionario de salud',
      'Fallecimiento por consumo de drogas no prescritas',
    ],
    franquicias: { basica: 0, completa: 0, premium: 0 },
  },

  salud: {
    id: 'PROD-SAL',
    nombre: 'Seguro de Salud',
    descripcion: 'Acceso a la mejor asistencia sanitaria privada sin esperas',
    coberturas: [
      { nombre: 'Hospitalizacion', descripcion: 'Ingreso hospitalario en habitacion individual con acompanante', limite_euros: 500000, incluida_en: ['basica', 'completa', 'premium'] },
      { nombre: 'Consultas Medicas', descripcion: 'Consultas con especialistas sin listas de espera en cuadro medico', limite_euros: 100000, incluida_en: ['basica', 'completa', 'premium'] },
      { nombre: 'Dental', descripcion: 'Revision anual, limpieza, empastes, endodoncias y ortodoncias', limite_euros: 5000, incluida_en: ['completa', 'premium'] },
      { nombre: 'Optica', descripcion: 'Graduacion, gafas o lentillas con aportacion del seguro', limite_euros: 300, incluida_en: ['completa', 'premium'] },
      { nombre: 'Pruebas Diagnosticas', descripcion: 'Analiticas, radiografias, resonancias magneticas, TAC y ecografias', limite_euros: 50000, incluida_en: ['basica', 'completa', 'premium'] },
      { nombre: 'Rehabilitacion', descripcion: 'Sesiones de fisioterapia, logopedia y rehabilitacion funcional', limite_euros: 10000, incluida_en: ['completa', 'premium'] },
      { nombre: 'Segunda Opinion Medica', descripcion: 'Consulta con especialista de referencia para segunda valoracion', limite_euros: 5000, incluida_en: ['premium'] },
      { nombre: 'Cobertura Internacional', descripcion: 'Asistencia sanitaria en el extranjero durante viajes', limite_euros: 100000, incluida_en: ['premium'] },
    ],
    exclusiones: [
      'Cirugia estetica sin finalidad reparadora',
      'Tratamientos experimentales no aprobados',
      'Enfermedades preexistentes durante periodo de carencia (6 meses)',
      'Medicina alternativa no reconocida oficialmente',
      'Tratamientos de fertilidad (excepto poliza premium)',
    ],
    franquicias: { basica: 0, completa: 0, premium: 0 },
  },

  decesos: {
    id: 'PROD-DEC',
    nombre: 'Seguro de Decesos',
    descripcion: 'Gestion integral del servicio funerario y tramites asociados',
    coberturas: [
      { nombre: 'Servicio Funerario Completo', descripcion: 'Feretro, tanatorio, ceremonia, coronas florales y lapida', limite_euros: 12000, incluida_en: ['basica', 'completa', 'premium'] },
      { nombre: 'Repatriacion Nacional', descripcion: 'Traslado del fallecido a cualquier punto de la peninsula', limite_euros: 5000, incluida_en: ['basica', 'completa', 'premium'] },
      { nombre: 'Repatriacion Internacional', descripcion: 'Traslado del fallecido desde cualquier pais del mundo', limite_euros: 20000, incluida_en: ['completa', 'premium'] },
      { nombre: 'Tramites Administrativos', descripcion: 'Gestion de certificado de defuncion, testamentaria y herencia', limite_euros: 3000, incluida_en: ['completa', 'premium'] },
      { nombre: 'Asistencia Psicologica', descripcion: 'Apoyo psicologico a familiares durante el duelo', limite_euros: 2000, incluida_en: ['premium'] },
      { nombre: 'Capital de Fallecimiento', descripcion: 'Importe economico adicional a disposicion de los beneficiarios', limite_euros: 6000, incluida_en: ['premium'] },
    ],
    exclusiones: [
      'Gastos anteriores a la comunicacion del fallecimiento',
      'Servicios no contratados a traves de la aseguradora',
      'Actos de guerra o terrorismo internacional',
    ],
    franquicias: { basica: 0, completa: 0, premium: 0 },
  },

  viaje: {
    id: 'PROD-VIA',
    nombre: 'Seguro de Viaje',
    descripcion: 'Proteccion integral durante tus desplazamientos nacionales e internacionales',
    coberturas: [
      { nombre: 'Asistencia Medica en Viaje', descripcion: 'Gastos medicos, farmaceuticos y de hospitalizacion en destino', limite_euros: 100000, incluida_en: ['basica', 'completa', 'premium'] },
      { nombre: 'Equipaje', descripcion: 'Perdida, robo o deterioro del equipaje durante el viaje', limite_euros: 1500, incluida_en: ['basica', 'completa', 'premium'] },
      { nombre: 'Cancelacion de Viaje', descripcion: 'Reembolso por cancelacion justificada del viaje antes de la salida', limite_euros: 5000, incluida_en: ['completa', 'premium'] },
      { nombre: 'Repatriacion Sanitaria', descripcion: 'Traslado medico al pais de origen en caso de enfermedad grave o accidente', limite_euros: 50000, incluida_en: ['basica', 'completa', 'premium'] },
      { nombre: 'Responsabilidad Civil en Viaje', descripcion: 'Danos involuntarios causados a terceros durante el viaje', limite_euros: 60000, incluida_en: ['completa', 'premium'] },
      { nombre: 'Retraso de Vuelo', descripcion: 'Compensacion por retrasos superiores a 6 horas en vuelos', limite_euros: 300, incluida_en: ['completa', 'premium'] },
      { nombre: 'Deportes de Aventura', descripcion: 'Cobertura durante practica de deportes de riesgo moderado', limite_euros: 30000, incluida_en: ['premium'] },
    ],
    exclusiones: [
      'Viajes a paises con alerta de seguridad del MAEC',
      'Enfermedades cronicas sin estabilizar previamente',
      'Deportes de alto riesgo (salvo poliza premium)',
      'Pandemias declaradas por la OMS (salvo clausula especifica)',
    ],
    franquicias: { basica: 50, completa: 0, premium: 0 },
  },

  mascotas: {
    id: 'PROD-MAS',
    nombre: 'Seguro de Mascotas',
    descripcion: 'Proteccion sanitaria y de responsabilidad civil para tu animal de compania',
    coberturas: [
      { nombre: 'Asistencia Veterinaria', descripcion: 'Consultas, tratamientos, cirugia y hospitalizacion veterinaria', limite_euros: 5000, incluida_en: ['basica', 'completa', 'premium'] },
      { nombre: 'Responsabilidad Civil por Mascota', descripcion: 'Danos que tu mascota pueda causar a terceros o a sus bienes', limite_euros: 120000, incluida_en: ['basica', 'completa', 'premium'] },
      { nombre: 'Robo o Extravio', descripcion: 'Indemnizacion por robo de la mascota y gastos de busqueda', limite_euros: 2000, incluida_en: ['completa', 'premium'] },
      { nombre: 'Sacrificio y Eliminacion de Restos', descripcion: 'Eutanasia humanitaria e incineracion o entierro de la mascota', limite_euros: 500, incluida_en: ['completa', 'premium'] },
      { nombre: 'Estancia en Residencia', descripcion: 'Alojamiento de la mascota si el propietario es hospitalizado', limite_euros: 1000, incluida_en: ['premium'] },
      { nombre: 'Cobertura Dental Veterinaria', descripcion: 'Limpieza dental, extracciones y tratamientos bucodentales de la mascota', limite_euros: 800, incluida_en: ['premium'] },
    ],
    exclusiones: [
      'Razas potencialmente peligrosas sin licencia municipal',
      'Animales no identificados con microchip',
      'Enfermedades preexistentes conocidas antes de la contratacion',
      'Animales destinados a actividades profesionales (caza, guarda, cria)',
      'Mascotas exoticas no declaradas expresamente',
    ],
    franquicias: { basica: 100, completa: 50, premium: 0 },
  },

  negocio: {
    id: 'PROD-NEG',
    nombre: 'Seguro de Negocio',
    descripcion: 'Proteccion integral para locales comerciales, mercancias y actividad empresarial',
    coberturas: [
      { nombre: 'Local Comercial', descripcion: 'Danos al local comercial por incendio, agua, robo o fenomenos atmosfericos', limite_euros: 500000, incluida_en: ['basica', 'completa', 'premium'] },
      { nombre: 'Mercancia y Existencias', descripcion: 'Danos o perdida de las existencias almacenadas en el local', limite_euros: 100000, incluida_en: ['basica', 'completa', 'premium'] },
      { nombre: 'Responsabilidad Civil Empresarial', descripcion: 'Danos a clientes, visitantes o terceros dentro del local o por la actividad', limite_euros: 600000, incluida_en: ['basica', 'completa', 'premium'] },
      { nombre: 'Accidentes de Empleados', descripcion: 'Cobertura complementaria de accidentes laborales de los trabajadores', limite_euros: 150000, incluida_en: ['completa', 'premium'] },
      { nombre: 'Perdida de Beneficios', descripcion: 'Compensacion por lucro cesante debido a siniestro cubierto', limite_euros: 100000, incluida_en: ['completa', 'premium'] },
      { nombre: 'Averia de Maquinaria', descripcion: 'Reparacion o sustitucion de maquinaria y equipos profesionales', limite_euros: 50000, incluida_en: ['premium'] },
      { nombre: 'Ciberriesgos', descripcion: 'Danos por ciberataques, perdida de datos y extorsion digital', limite_euros: 75000, incluida_en: ['premium'] },
    ],
    exclusiones: [
      'Actividades ilegales o sin licencia municipal',
      'Danos por falta de mantenimiento del local',
      'Mercancias perecederas no refrigeradas correctamente',
      'Robos sin signos de forzamiento (salvo empleados)',
      'Danos medioambientales por vertidos dolosos',
    ],
    franquicias: { basica: 500, completa: 300, premium: 150 },
  },
};

// ---------------------------------------------------------------------------
// MAPA DE TIPO DE SINIESTRO A TIPO DE PRODUCTO Y COBERTURA
// ---------------------------------------------------------------------------
const mapaSiniestroCobertura = {
  accidente_trafico: { producto: 'coche', coberturas: ['Responsabilidad Civil Obligatoria', 'Responsabilidad Civil Voluntaria', 'Danos Propios - Todo Riesgo', 'Accidentes del Conductor'] },
  rotura_luna: { producto: 'coche', coberturas: ['Lunas'] },
  robo_vehiculo: { producto: 'coche', coberturas: ['Robo'] },
  incendio_vehiculo: { producto: 'coche', coberturas: ['Incendio'] },
  averia_carretera: { producto: 'coche', coberturas: ['Asistencia en Viaje'] },
  danos_agua: { producto: 'hogar', coberturas: ['Danos por Agua'] },
  incendio_hogar: { producto: 'hogar', coberturas: ['Incendio y Explosion'] },
  robo_hogar: { producto: 'hogar', coberturas: ['Robo y Expoliacion'] },
  robo_contenido: { producto: 'hogar', coberturas: ['Contenido', 'Robo y Expoliacion'] },
  rc_familiar: { producto: 'hogar', coberturas: ['Responsabilidad Civil Familiar'] },
  temporal: { producto: 'hogar', coberturas: ['Fenomenos Atmosfericos'] },
  fallecimiento: { producto: 'vida', coberturas: ['Fallecimiento por cualquier causa', 'Doble Capital por Accidente'] },
  invalidez: { producto: 'vida', coberturas: ['Invalidez Permanente Absoluta (IPA)', 'Invalidez Permanente Total', 'Gran Invalidez'] },
  hospitalizacion: { producto: 'salud', coberturas: ['Hospitalizacion'] },
  consulta_medica: { producto: 'salud', coberturas: ['Consultas Medicas'] },
  dental: { producto: 'salud', coberturas: ['Dental'] },
  defuncion: { producto: 'decesos', coberturas: ['Servicio Funerario Completo', 'Repatriacion Nacional', 'Repatriacion Internacional'] },
  accidente_viaje: { producto: 'viaje', coberturas: ['Asistencia Medica en Viaje', 'Repatriacion Sanitaria'] },
  perdida_equipaje: { producto: 'viaje', coberturas: ['Equipaje'] },
  cancelacion_viaje: { producto: 'viaje', coberturas: ['Cancelacion de Viaje'] },
  veterinario: { producto: 'mascotas', coberturas: ['Asistencia Veterinaria'] },
  rc_mascota: { producto: 'mascotas', coberturas: ['Responsabilidad Civil por Mascota'] },
  danos_local: { producto: 'negocio', coberturas: ['Local Comercial'] },
  robo_negocio: { producto: 'negocio', coberturas: ['Mercancia y Existencias'] },
  rc_empresarial: { producto: 'negocio', coberturas: ['Responsabilidad Civil Empresarial'] },
  accidente_laboral: { producto: 'negocio', coberturas: ['Accidentes de Empleados'] },
};

// ---------------------------------------------------------------------------
// BASE DE DATOS DE POLIZAS DEMO
// ---------------------------------------------------------------------------
const polizas = [
  {
    id: 'POL-2024-001',
    clienteId: 'CLI-001',
    producto: 'coche',
    tier: 'premium',
    estado: 'activa',
    fechaInicio: '2024-01-15',
    fechaFin: '2025-01-15',
    prima_anual: 895.50,
    datos: { marca: 'Seat', modelo: 'Leon', matricula: '1234 ABC', ano: 2021, valor_vehiculo: 22000 },
  },
  {
    id: 'POL-2024-002',
    clienteId: 'CLI-001',
    producto: 'hogar',
    tier: 'completa',
    estado: 'activa',
    fechaInicio: '2024-03-01',
    fechaFin: '2025-03-01',
    prima_anual: 420.00,
    datos: { direccion: 'Calle Gran Via 42, 3o B, Madrid', m2: 95, tipo: 'piso', valor_continente: 180000, valor_contenido: 35000 },
  },
  {
    id: 'POL-2024-003',
    clienteId: 'CLI-002',
    producto: 'coche',
    tier: 'completa',
    estado: 'activa',
    fechaInicio: '2024-02-10',
    fechaFin: '2025-02-10',
    prima_anual: 650.00,
    datos: { marca: 'Volkswagen', modelo: 'Golf', matricula: '5678 DEF', ano: 2019, valor_vehiculo: 18000 },
  },
  {
    id: 'POL-2024-004',
    clienteId: 'CLI-003',
    producto: 'vida',
    tier: 'completa',
    estado: 'activa',
    fechaInicio: '2023-06-01',
    fechaFin: '2024-06-01',
    prima_anual: 380.00,
    datos: { capital_asegurado: 200000, beneficiarios: ['Maria Garcia Lopez', 'Pedro Garcia Lopez'] },
  },
  {
    id: 'POL-2024-005',
    clienteId: 'CLI-004',
    producto: 'salud',
    tier: 'premium',
    estado: 'activa',
    fechaInicio: '2024-01-01',
    fechaFin: '2025-01-01',
    prima_anual: 1200.00,
    datos: { asegurados: 3, titular: 'Laura Martinez', incluye_dental: true, incluye_optica: true },
  },
  {
    id: 'POL-2024-006',
    clienteId: 'CLI-005',
    producto: 'hogar',
    tier: 'basica',
    estado: 'activa',
    fechaInicio: '2024-04-15',
    fechaFin: '2025-04-15',
    prima_anual: 260.00,
    datos: { direccion: 'Avda. Diagonal 150, 7o A, Barcelona', m2: 75, tipo: 'piso', valor_continente: 150000, valor_contenido: 20000 },
  },
  {
    id: 'POL-2024-007',
    clienteId: 'CLI-006',
    producto: 'decesos',
    tier: 'completa',
    estado: 'activa',
    fechaInicio: '2023-09-01',
    fechaFin: '2024-09-01',
    prima_anual: 145.00,
    datos: { asegurados: 2, ambito: 'nacional_internacional' },
  },
  {
    id: 'POL-2024-008',
    clienteId: 'CLI-007',
    producto: 'viaje',
    tier: 'completa',
    estado: 'activa',
    fechaInicio: '2024-07-01',
    fechaFin: '2024-07-20',
    prima_anual: 85.00,
    datos: { destino: 'Tailandia', tipo_viaje: 'ocio', viajeros: 2 },
  },
  {
    id: 'POL-2024-009',
    clienteId: 'CLI-008',
    producto: 'mascotas',
    tier: 'premium',
    estado: 'activa',
    fechaInicio: '2024-05-01',
    fechaFin: '2025-05-01',
    prima_anual: 320.00,
    datos: { especie: 'perro', raza: 'Labrador Retriever', nombre: 'Rocky', edad: 4, microchip: '941000024681357' },
  },
  {
    id: 'POL-2024-010',
    clienteId: 'CLI-009',
    producto: 'negocio',
    tier: 'completa',
    estado: 'activa',
    fechaInicio: '2024-01-01',
    fechaFin: '2025-01-01',
    prima_anual: 1850.00,
    datos: { nombre_negocio: 'Restaurante El Buen Sabor', actividad: 'hosteleria', empleados: 8, m2_local: 180 },
  },
  {
    id: 'POL-2024-011',
    clienteId: 'CLI-010',
    producto: 'coche',
    tier: 'basica',
    estado: 'activa',
    fechaInicio: '2024-06-01',
    fechaFin: '2025-06-01',
    prima_anual: 380.00,
    datos: { marca: 'Renault', modelo: 'Clio', matricula: '9012 GHI', ano: 2017, valor_vehiculo: 9500 },
  },
  {
    id: 'POL-2024-012',
    clienteId: 'CLI-011',
    producto: 'hogar',
    tier: 'premium',
    estado: 'activa',
    fechaInicio: '2024-02-01',
    fechaFin: '2025-02-01',
    prima_anual: 680.00,
    datos: { direccion: 'Calle Sierpes 28, Sevilla', m2: 140, tipo: 'chalet adosado', valor_continente: 320000, valor_contenido: 60000 },
  },
  {
    id: 'POL-2024-013',
    clienteId: 'CLI-012',
    producto: 'vida',
    tier: 'premium',
    estado: 'vencida',
    fechaInicio: '2022-03-01',
    fechaFin: '2023-03-01',
    prima_anual: 550.00,
    datos: { capital_asegurado: 350000, beneficiarios: ['Ana Ruiz Torres'] },
  },
  {
    id: 'POL-2024-014',
    clienteId: 'CLI-013',
    producto: 'salud',
    tier: 'basica',
    estado: 'activa',
    fechaInicio: '2024-04-01',
    fechaFin: '2025-04-01',
    prima_anual: 520.00,
    datos: { asegurados: 1, titular: 'Fernando Diaz', incluye_dental: false, incluye_optica: false },
  },
  {
    id: 'POL-2024-015',
    clienteId: 'CLI-014',
    producto: 'coche',
    tier: 'completa',
    estado: 'suspendida',
    fechaInicio: '2024-01-01',
    fechaFin: '2025-01-01',
    prima_anual: 720.00,
    datos: { marca: 'BMW', modelo: 'Serie 3', matricula: '3456 JKL', ano: 2020, valor_vehiculo: 32000 },
  },
  {
    id: 'POL-2024-016',
    clienteId: 'CLI-015',
    producto: 'negocio',
    tier: 'premium',
    estado: 'activa',
    fechaInicio: '2024-03-01',
    fechaFin: '2025-03-01',
    prima_anual: 2400.00,
    datos: { nombre_negocio: 'Taller Mecanico Gonzalez', actividad: 'automocion', empleados: 5, m2_local: 250 },
  },
  {
    id: 'POL-2024-017',
    clienteId: 'CLI-002',
    producto: 'hogar',
    tier: 'completa',
    estado: 'activa',
    fechaInicio: '2024-05-01',
    fechaFin: '2025-05-01',
    prima_anual: 390.00,
    datos: { direccion: 'Calle Larios 15, 2o D, Malaga', m2: 85, tipo: 'piso', valor_continente: 160000, valor_contenido: 28000 },
  },
];

// ---------------------------------------------------------------------------
// FUNCIONES DEL SERVICIO
// ---------------------------------------------------------------------------

/**
 * Obtiene todas las polizas de un cliente.
 */
function getPolizasCliente(clienteId) {
  const resultado = polizas.filter(p => p.clienteId === clienteId);
  return resultado.map(p => ({
    ...p,
    producto_detalle: productos[p.producto] ? {
      nombre: productos[p.producto].nombre,
      descripcion: productos[p.producto].descripcion,
    } : null,
  }));
}

/**
 * Obtiene el detalle completo de una poliza incluyendo sus coberturas aplicables.
 */
function getDetallePoliza(polizaId) {
  const poliza = polizas.find(p => p.id === polizaId);
  if (!poliza) {
    return { error: true, mensaje: `No se encontro la poliza con ID ${polizaId}` };
  }

  const producto = productos[poliza.producto];
  if (!producto) {
    return { error: true, mensaje: `Producto desconocido: ${poliza.producto}` };
  }

  const coberturasAplicables = producto.coberturas.filter(c =>
    c.incluida_en.includes(poliza.tier)
  );

  const franquicia = producto.franquicias[poliza.tier] || 0;

  return {
    poliza,
    producto: {
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
    },
    coberturas: coberturasAplicables,
    exclusiones: producto.exclusiones,
    franquicia,
    vigente: verificarVigencia(polizaId).vigente,
  };
}

/**
 * Verifica si una poliza esta vigente.
 */
function verificarVigencia(polizaId) {
  const poliza = polizas.find(p => p.id === polizaId);
  if (!poliza) {
    return { vigente: false, motivo: 'Poliza no encontrada' };
  }

  if (poliza.estado === 'suspendida') {
    return { vigente: false, motivo: 'La poliza se encuentra suspendida por impago de prima', polizaId };
  }

  if (poliza.estado === 'cancelada') {
    return { vigente: false, motivo: 'La poliza ha sido cancelada por el asegurado o la aseguradora', polizaId };
  }

  const hoy = new Date();
  const inicio = new Date(poliza.fechaInicio);
  const fin = new Date(poliza.fechaFin);

  if (hoy < inicio) {
    return { vigente: false, motivo: `La poliza aun no ha entrado en vigor. Fecha de inicio: ${poliza.fechaInicio}`, polizaId };
  }

  if (hoy > fin) {
    return { vigente: false, motivo: `La poliza ha vencido el ${poliza.fechaFin}. Debe renovarla para mantener la cobertura`, polizaId };
  }

  if (poliza.estado === 'vencida') {
    return { vigente: false, motivo: `La poliza esta marcada como vencida desde el ${poliza.fechaFin}`, polizaId };
  }

  return { vigente: true, motivo: 'Poliza activa y dentro del periodo de vigencia', polizaId, fechaFin: poliza.fechaFin };
}

/**
 * Calcula la franquicia aplicable a un siniestro concreto.
 */
function calcularFranquicia(polizaId, tipoSiniestro) {
  const poliza = polizas.find(p => p.id === polizaId);
  if (!poliza) {
    return { error: true, mensaje: 'Poliza no encontrada' };
  }

  const producto = productos[poliza.producto];
  if (!producto) {
    return { error: true, mensaje: 'Producto no encontrado' };
  }

  const franquiciaBase = producto.franquicias[poliza.tier] || 0;

  // Aplicar incremento de franquicia para ciertos tipos de siniestro mas costosos
  const incrementosPorTipo = {
    incendio_vehiculo: 1.5,
    incendio_hogar: 1.5,
    robo_vehiculo: 1.2,
    robo_hogar: 1.2,
    danos_local: 1.3,
    robo_negocio: 1.3,
    accidente_trafico: 1.0,
    danos_agua: 1.0,
    rotura_luna: 0.5,
    veterinario: 0.8,
  };

  const multiplicador = incrementosPorTipo[tipoSiniestro] || 1.0;
  const franquiciaFinal = Math.round(franquiciaBase * multiplicador * 100) / 100;

  return {
    polizaId,
    tipoSiniestro,
    tier: poliza.tier,
    franquicia_base: franquiciaBase,
    multiplicador,
    franquicia_aplicable: franquiciaFinal,
    descripcion: franquiciaFinal === 0
      ? 'Esta poliza no tiene franquicia para este tipo de siniestro'
      : `La franquicia aplicable es de ${franquiciaFinal} EUR. Este importe sera descontado de la indemnizacion`,
  };
}

/**
 * Devuelve todos los productos disponibles con sus tiers y coberturas.
 */
function getProductos() {
  return Object.entries(productos).map(([clave, prod]) => ({
    clave,
    id: prod.id,
    nombre: prod.nombre,
    descripcion: prod.descripcion,
    tiers_disponibles: ['basica', 'completa', 'premium'],
    num_coberturas: prod.coberturas.length,
    coberturas: prod.coberturas,
    exclusiones: prod.exclusiones,
    franquicias: prod.franquicias,
  }));
}

/**
 * Verifica la cobertura de un cliente para un tipo de siniestro e importe estimado.
 * Devuelve si esta cubierto, la cobertura aplicable, franquicia, limite y calculo de
 * importe indemnizable.
 */
function verificarCobertura(clienteId, tipoSiniestro, importeEstimado) {
  // 1. Buscar polizas del cliente
  const polizasCliente = polizas.filter(p => p.clienteId === clienteId);
  if (polizasCliente.length === 0) {
    return {
      cubierto: false,
      motivo_exclusion: `El cliente ${clienteId} no tiene ninguna poliza contratada en nuestro sistema`,
      alternativas: ['Contratar una poliza adecuada al tipo de siniestro reportado'],
    };
  }

  // 2. Determinar que producto y coberturas aplican al tipo de siniestro
  const mapa = mapaSiniestroCobertura[tipoSiniestro];
  if (!mapa) {
    return {
      cubierto: false,
      motivo_exclusion: `El tipo de siniestro "${tipoSiniestro}" no esta catalogado en nuestro sistema`,
      tipos_validos: Object.keys(mapaSiniestroCobertura),
    };
  }

  // 3. Buscar poliza del producto adecuado
  const polizaProducto = polizasCliente.find(p => p.producto === mapa.producto);
  if (!polizaProducto) {
    return {
      cubierto: false,
      motivo_exclusion: `El cliente tiene polizas activas pero ninguna del tipo "${productos[mapa.producto].nombre}" necesario para cubrir "${tipoSiniestro}"`,
      polizas_actuales: polizasCliente.map(p => ({ id: p.id, producto: productos[p.producto]?.nombre || p.producto, estado: p.estado })),
      alternativas: [`Contratar un ${productos[mapa.producto].nombre} para obtener esta cobertura`],
    };
  }

  // 4. Verificar vigencia
  const vigencia = verificarVigencia(polizaProducto.id);
  if (!vigencia.vigente) {
    return {
      cubierto: false,
      motivo_exclusion: vigencia.motivo,
      poliza: { id: polizaProducto.id, producto: productos[polizaProducto.producto].nombre, estado: polizaProducto.estado },
      alternativas: ['Renovar la poliza para restablecer las coberturas'],
    };
  }

  // 5. Verificar que la cobertura esta incluida en el tier contratado
  const producto = productos[polizaProducto.producto];
  const coberturasNecesarias = mapa.coberturas;
  const coberturasDelTier = producto.coberturas.filter(c => c.incluida_en.includes(polizaProducto.tier));
  const nombresCoberturasDelTier = coberturasDelTier.map(c => c.nombre);

  const coberturaEncontrada = coberturasNecesarias.find(nombre => nombresCoberturasDelTier.includes(nombre));
  if (!coberturaEncontrada) {
    const tiersNecesarios = [];
    for (const nombreCob of coberturasNecesarias) {
      const cob = producto.coberturas.find(c => c.nombre === nombreCob);
      if (cob) {
        tiersNecesarios.push(...cob.incluida_en);
      }
    }
    const tierMinimo = [...new Set(tiersNecesarios)].sort((a, b) => {
      const orden = { basica: 0, completa: 1, premium: 2 };
      return orden[a] - orden[b];
    })[0];

    return {
      cubierto: false,
      motivo_exclusion: `La cobertura necesaria para "${tipoSiniestro}" no esta incluida en el tier "${polizaProducto.tier}" contratado`,
      poliza: { id: polizaProducto.id, producto: producto.nombre, tier: polizaProducto.tier },
      coberturas_necesarias: coberturasNecesarias,
      alternativas: [`Mejorar la poliza al tier "${tierMinimo || 'superior'}" para incluir esta cobertura`],
    };
  }

  // 6. Obtener detalles de la cobertura encontrada
  const detalleCobertura = producto.coberturas.find(c => c.nombre === coberturaEncontrada);
  const franquiciaInfo = calcularFranquicia(polizaProducto.id, tipoSiniestro);
  const franquicia = franquiciaInfo.franquicia_aplicable || 0;
  const limiteMaximo = detalleCobertura.limite_euros;

  // 7. Calcular importe indemnizable
  let importeIndemnizable = 0;
  let cubierto = false;
  let cubiertoParcial = false;

  if (importeEstimado <= franquicia) {
    // El importe no supera la franquicia
    return {
      cubierto: false,
      motivo_exclusion: `El importe estimado (${importeEstimado} EUR) no supera la franquicia aplicable (${franquicia} EUR). El asegurado debe asumir el coste`,
      cobertura_aplicable: detalleCobertura,
      franquicia,
      limite_maximo: limiteMaximo,
      importe_indemnizable: 0,
      poliza: { id: polizaProducto.id, producto: producto.nombre, tier: polizaProducto.tier },
    };
  }

  const importeSinFranquicia = importeEstimado - franquicia;

  if (importeSinFranquicia > limiteMaximo) {
    importeIndemnizable = limiteMaximo;
    cubiertoParcial = true;
  } else {
    importeIndemnizable = importeSinFranquicia;
    cubierto = true;
  }

  importeIndemnizable = Math.round(importeIndemnizable * 100) / 100;

  return {
    cubierto: cubiertoParcial ? 'parcial' : true,
    cobertura_aplicable: detalleCobertura,
    franquicia,
    limite_maximo: limiteMaximo,
    importe_estimado: importeEstimado,
    importe_indemnizable: importeIndemnizable,
    motivo_exclusion: cubiertoParcial
      ? `El importe supera el limite de cobertura. Se indemnizara hasta el maximo de ${limiteMaximo} EUR`
      : null,
    poliza: {
      id: polizaProducto.id,
      producto: producto.nombre,
      tier: polizaProducto.tier,
      estado: polizaProducto.estado,
      vigente: true,
    },
    desglose: {
      importe_siniestro: importeEstimado,
      franquicia_descontada: franquicia,
      importe_tras_franquicia: importeSinFranquicia,
      limite_cobertura: limiteMaximo,
      importe_final_indemnizable: importeIndemnizable,
      a_cargo_asegurado: importeEstimado - importeIndemnizable,
    },
  };
}

// ---------------------------------------------------------------------------
// EXPORTACIONES
// ---------------------------------------------------------------------------
module.exports = {
  verificarCobertura,
  calcularFranquicia,
  verificarVigencia,
  getPolizasCliente,
  getProductos,
  getDetallePoliza,
  productos,
  polizas,
  mapaSiniestroCobertura,
};
