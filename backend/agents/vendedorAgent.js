/**
 * vendedorAgent.js — Agente de ventas IA para SiniestrosAI
 * Sistema completo de gestion comercial de seguros en Espana
 */

const { v4: uuidv4 } = require('uuid');

// ============================================================
// CATALOGO DE PRODUCTOS
// ============================================================

const PRODUCTOS = {
  seguro_coche: {
    nombre: 'Seguro de Coche',
    precio_desde: 280,
    unidad: 'año',
    coberturas: [
      'Responsabilidad civil ilimitada',
      'Asistencia en carretera 24h',
      'Defensa juridica',
      'Robo e incendio',
      'Lunas',
      'Todo riesgo con franquicia desde 150€',
    ],
    beneficios: [
      'Sin permanencia, cancela cuando quieras',
      'Perito en menos de 24h tras siniestro',
      'Vehiculo de sustitucion gratuito',
      'App para gestionar partes desde el movil',
    ],
    target_edad: [18, 75],
  },
  hogar: {
    nombre: 'Seguro de Hogar',
    precio_desde: 180,
    unidad: 'año',
    coberturas: [
      'Continente y contenido',
      'Responsabilidad civil',
      'Daños por agua',
      'Robo y expoliacion',
      'Fenomenos atmosfericos',
      'Asistencia hogar 24h (cerrajero, fontanero, electricista)',
    ],
    beneficios: [
      'Reparaciones urgentes en menos de 2 horas',
      'Sin franquicia en daños por agua',
      'Capital de contenido ajustable',
      'Cobertura de mascotas incluida',
    ],
    target_edad: [25, 80],
  },
  vida: {
    nombre: 'Seguro de Vida',
    precio_desde: 120,
    unidad: 'año',
    coberturas: [
      'Fallecimiento por cualquier causa',
      'Invalidez permanente absoluta',
      'Invalidez permanente total',
      'Enfermedades graves',
      'Doble capital por accidente',
    ],
    beneficios: [
      'Capital asegurado desde 50.000€ hasta 600.000€',
      'Sin reconocimiento medico hasta 200.000€',
      'Precio garantizado los primeros 5 años',
      'Ideal para hipotecas y proteccion familiar',
    ],
    target_edad: [25, 65],
  },
  salud: {
    nombre: 'Seguro de Salud',
    precio_desde: 350,
    unidad: 'año',
    coberturas: [
      'Medicina general y especialistas',
      'Hospitalizacion y cirugia',
      'Pruebas diagnosticas',
      'Rehabilitacion y fisioterapia',
      'Urgencias 24h',
      'Salud mental',
    ],
    beneficios: [
      'Sin listas de espera, cita en 24-48h',
      'Cuadro medico con mas de 40.000 profesionales',
      'App de videoconsulta incluida',
      'Cobertura dental basica incluida',
    ],
    target_edad: [0, 70],
  },
  decesos: {
    nombre: 'Seguro de Decesos',
    precio_desde: 50,
    unidad: 'año',
    coberturas: [
      'Servicio funerario completo',
      'Traslado nacional e internacional',
      'Gestion de tramites y documentacion',
      'Asistencia juridica hereditaria',
      'Capital de libre disposicion',
    ],
    beneficios: [
      'Tranquilidad para toda la familia',
      'Ahorro de hasta 6.000€ respecto a pago directo',
      'Sin limite de edad para contratacion',
      'Cobertura mundial',
    ],
    target_edad: [18, 90],
  },
  viaje: {
    nombre: 'Seguro de Viaje',
    precio_desde: 25,
    unidad: 'viaje',
    coberturas: [
      'Asistencia medica hasta 300.000€',
      'Repatriacion sanitaria',
      'Cancelacion de viaje',
      'Perdida de equipaje',
      'Responsabilidad civil en el extranjero',
      'Demora de vuelo',
    ],
    beneficios: [
      'Contratacion hasta el mismo dia del viaje',
      'Cobertura COVID incluida',
      'Atencion en español 24h en todo el mundo',
      'Multiviaje anual desde 95€',
    ],
    target_edad: [0, 85],
  },
  mascotas: {
    nombre: 'Seguro de Mascotas',
    precio_desde: 90,
    unidad: 'año',
    coberturas: [
      'Asistencia veterinaria',
      'Cirugia y hospitalizacion',
      'Responsabilidad civil del animal',
      'Robo y extravio',
      'Sacrificio necesario e incineracion',
      'Daños a terceros',
    ],
    beneficios: [
      'Cuadro veterinario con mas de 5.000 clinicas',
      'Sin periodo de carencia para accidentes',
      'Incluye vacunaciones y desparasitacion',
      'Obligatorio para razas PPP incluido',
    ],
    target_edad: [18, 80],
  },
  negocio: {
    nombre: 'Seguro de Negocio',
    precio_desde: 450,
    unidad: 'año',
    coberturas: [
      'Daños materiales al local',
      'Responsabilidad civil profesional',
      'Perdida de beneficios',
      'Robo y atraco',
      'Daños electricos y electronicos',
      'Defensa juridica empresarial',
    ],
    beneficios: [
      'Perito especializado en menos de 12h',
      'Indemnizacion por cese temporal de actividad',
      'Cobertura de ciberriesgos incluida',
      'Asesoramiento fiscal y laboral 24h',
    ],
    target_edad: [22, 70],
  },
};

// ============================================================
// OBJECIONES Y RESPUESTAS INTELIGENTES
// ============================================================

const OBJECIONES = {
  es_caro: {
    patron: /caro|precio|dinero|no puedo pagar|muy costo|no llego/i,
    respuestas: [
      'Entiendo tu preocupacion por el precio, {nombre}. Pero piensa que {producto} cuesta solo {precio_dia}€ al dia. Menos que un cafe. Y si ocurre un siniestro sin seguro, el coste medio es de {coste_sin_seguro}€. ¿Merece la pena arriesgarse por {precio_dia}€ diarios?',
      'Precisamente porque se que el dinero importa, te ofrezco la mejor relacion calidad-precio del mercado. Ademas, tenemos fraccionamiento sin recargo: puedes pagar mensualmente por solo {precio_mes}€/mes. ¿Eso te encajaria mejor?',
      '{nombre}, muchos clientes me dijeron lo mismo y hoy son los mas satisfechos. La tranquilidad no tiene precio. Ademas, puedo aplicarte un {descuento}% de descuento por contratacion directa. ¿Que te parece?',
    ],
    coste_sin_seguro: { seguro_coche: 8500, hogar: 12000, vida: 0, salud: 15000, decesos: 6000, viaje: 3500, mascotas: 2000, negocio: 25000 },
  },
  ya_tengo_seguro: {
    patron: /ya tengo|tengo uno|estoy asegurado|mi compañia|otra aseguradora/i,
    respuestas: [
      'Perfecto, {nombre}. Que tengas seguro habla bien de ti, eres una persona responsable. Pero, ¿hace cuanto que no revisas tus coberturas? El mercado cambia y es posible que estes pagando de mas por menos proteccion. ¿Me dejas hacer una comparativa sin compromiso? Solo necesito 2 minutos.',
      'Me alegra saberlo. Muchos de nuestros mejores clientes vinieron de otras compañias y ahorraron una media de {ahorro}€ al año con mejores coberturas. ¿No te gustaria al menos comparar? No pierdes nada.',
      'Genial, eso me facilita las cosas. Si ya conoces el producto, sabes lo importante que es. Solo te pido que me dejes enseñarte lo que incluimos nosotros que tu seguro actual probablemente no tiene: {beneficio_exclusivo}. ¿Tienes tu poliza a mano para compararla?',
    ],
    ahorro: { seguro_coche: 180, hogar: 95, vida: 60, salud: 200, decesos: 30, viaje: 15, mascotas: 45, negocio: 250 },
  },
  lo_tengo_que_pensar: {
    patron: /pensar|pensarlo|consultarlo|no se|decidir|mas adelante|tiempo/i,
    respuestas: [
      'Por supuesto, {nombre}, es una decision importante. Pero dejame preguntarte: ¿que es exactamente lo que necesitas pensar? Si es el precio, puedo ajustarlo. Si son las coberturas, las revisamos juntos ahora mismo. ¿Que te genera dudas?',
      'Claro que si. Solo te comento que esta promocion con {descuento}% de descuento termina esta semana. Si lo cerramos hoy, te garantizo estas condiciones. Si lo piensas y me llamas la proxima semana, el precio seria {precio_sin_descuento}€. ¿No prefieres asegurartelo ahora?',
      'Lo entiendo perfectamente. Te propongo algo: yo te envio el presupuesto detallado al email y te llamo en 48 horas. Asi lo revisas con calma. ¿Te parece bien el {dia_callback}?',
    ],
  },
  no_me_interesa: {
    patron: /no me interesa|no quiero|no necesito|dejame en paz|no llames/i,
    respuestas: [
      '{nombre}, respeto totalmente tu decision. Solo una pregunta rapida antes de despedirme: ¿tienes familia o personas que dependan de ti? Porque nuestro {producto} esta pensado exactamente para protegerles. Si me das 30 segundos, te explico por que el 78% de personas que me dijeron "no me interesa" acabaron contratando.',
      'Entiendo, {nombre}. No quiero ser insistente. Pero me gustaria dejarte mi contacto por si la situacion cambia. ¿Sabias que el {estadistica}% de los españoles no tiene {producto} y cuando lo necesita, es demasiado tarde? Solo quiero que estes informado.',
      'Sin problema. Solo te dejo un dato: el coste medio de un siniestro de {tipo_siniestro} sin seguro en España es de {coste_sin_seguro}€. Si en algun momento cambias de opinion, estaremos aqui. ¿Te puedo enviar informacion al email sin compromiso?',
    ],
    estadistica: { seguro_coche: 4, hogar: 45, vida: 68, salud: 25, decesos: 40, viaje: 55, mascotas: 70, negocio: 35 },
  },
  llamame_otro_dia: {
    patron: /otro dia|ahora no|estoy ocupado|mal momento|luego|mañana|otro momento/i,
    respuestas: [
      'Por supuesto, {nombre}, disculpa la molestia. ¿Cuando te viene bien que te llame? ¿Mañana por la mañana o mejor por la tarde? Asi reservo el hueco exclusivamente para ti.',
      'Entendido, {nombre}. Solo 15 segundos: te llamo porque tenemos una promocion especial de {descuento}% que acaba en 3 dias. ¿Me dejas que te llame el {dia_callback} a las {hora_callback}? Te lo explico en 5 minutos.',
      'Claro, ningun problema. Para cuando te llame, ¿te gustaria que te prepare ya un presupuesto personalizado? Solo necesito saber si vives en piso o casa y tu codigo postal. Asi la proxima llamada sera muy rapida.',
    ],
  },
};

// ============================================================
// ZONAS DE ESPAÑA CON FACTORES
// ============================================================

const ZONAS = {
  Madrid: { factor: 1.15, poblacion: 'alta' },
  Barcelona: { factor: 1.20, poblacion: 'alta' },
  Valencia: { factor: 1.05, poblacion: 'media' },
  Sevilla: { factor: 1.08, poblacion: 'media' },
  Bilbao: { factor: 1.10, poblacion: 'media' },
  Malaga: { factor: 1.03, poblacion: 'media' },
  Zaragoza: { factor: 1.00, poblacion: 'media' },
  Murcia: { factor: 0.98, poblacion: 'media' },
  Palma: { factor: 1.12, poblacion: 'media' },
  'Las Palmas': { factor: 1.06, poblacion: 'media' },
  Alicante: { factor: 1.02, poblacion: 'media' },
  Cordoba: { factor: 0.95, poblacion: 'baja' },
  Valladolid: { factor: 0.97, poblacion: 'baja' },
  Gijon: { factor: 0.96, poblacion: 'baja' },
  'A Coruña': { factor: 1.01, poblacion: 'media' },
};

const NOMBRES_ZONAS = Object.keys(ZONAS);

// ============================================================
// NOMBRES REALISTAS ESPAÑOLES
// ============================================================

const NOMBRES = [
  'Carlos Garcia Lopez', 'Maria Rodriguez Fernandez', 'Antonio Martinez Sanchez',
  'Laura Perez Gonzalez', 'Javier Hernandez Ruiz', 'Carmen Diaz Torres',
  'Miguel Lopez Ramirez', 'Ana Gonzalez Serrano', 'David Sanchez Moreno',
  'Isabel Fernandez Jimenez', 'Pablo Martin Alvarez', 'Lucia Ruiz Navarro',
  'Alejandro Moreno Castro', 'Marta Jimenez Ortiz', 'Raul Alvarez Delgado',
  'Elena Torres Romero', 'Daniel Romero Guerrero', 'Sofia Navarro Medina',
  'Oscar Gutierrez Iglesias', 'Paula Castro Blanco', 'Sergio Ortiz Mendez',
  'Andrea Medina Vega', 'Francisco Iglesias Fuentes', 'Natalia Guerrero Carrasco',
  'Alberto Blanco Prieto', 'Cristina Vega Dominguez', 'Jorge Fuentes Reyes',
  'Patricia Delgado Herrero', 'Fernando Mendez Cabrera', 'Sandra Prieto Calvo',
];

// ============================================================
// BASE DE DATOS EN MEMORIA
// ============================================================

const ESTADOS = ['Lead', 'Contactado', 'Interesado', 'Presupuestado', 'Cerrado', 'Perdido'];
const PRODUCTOS_KEYS = Object.keys(PRODUCTOS);

function generarTelefono() {
  const prefijos = ['612', '634', '656', '678', '690', '611', '622', '633', '644', '655'];
  const prefijo = prefijos[Math.floor(Math.random() * prefijos.length)];
  const numero = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
  return `+34 ${prefijo} ${numero}`;
}

function generarEmail(nombre) {
  const partes = nombre.toLowerCase().split(' ');
  const dominios = ['gmail.com', 'hotmail.com', 'yahoo.es', 'outlook.es', 'icloud.com'];
  const dominio = dominios[Math.floor(Math.random() * dominios.length)];
  return `${partes[0]}.${partes[1]}@${dominio}`;
}

function fechaAleatoria(diasAtras, diasAdelante = 0) {
  const ahora = new Date();
  const offset = Math.floor(Math.random() * (diasAtras + diasAdelante)) - diasAtras;
  ahora.setDate(ahora.getDate() + offset);
  return ahora.toISOString();
}

function crearLead(nombre, estado, productoKey, overrides = {}) {
  const zona = NOMBRES_ZONAS[Math.floor(Math.random() * NOMBRES_ZONAS.length)];
  const edad = 22 + Math.floor(Math.random() * 50);
  const id = uuidv4();
  const producto = PRODUCTOS[productoKey];

  const baseScore = estado === 'Cerrado' ? 85 + Math.floor(Math.random() * 15)
    : estado === 'Presupuestado' ? 65 + Math.floor(Math.random() * 20)
    : estado === 'Interesado' ? 50 + Math.floor(Math.random() * 20)
    : estado === 'Contactado' ? 30 + Math.floor(Math.random() * 25)
    : estado === 'Perdido' ? 5 + Math.floor(Math.random() * 20)
    : 10 + Math.floor(Math.random() * 30);

  const seguimientos = [];
  if (['Contactado', 'Interesado', 'Presupuestado', 'Cerrado', 'Perdido'].includes(estado)) {
    seguimientos.push({
      fecha: fechaAleatoria(30),
      tipo: 'llamada',
      nota: `Primera llamada de contacto. Cliente ${estado === 'Perdido' ? 'no mostro interes' : 'receptivo'}.`,
    });
  }
  if (['Interesado', 'Presupuestado', 'Cerrado'].includes(estado)) {
    seguimientos.push({
      fecha: fechaAleatoria(20),
      tipo: 'email',
      nota: 'Enviada informacion detallada del producto y coberturas.',
    });
  }
  if (['Presupuestado', 'Cerrado'].includes(estado)) {
    seguimientos.push({
      fecha: fechaAleatoria(14),
      tipo: 'presupuesto',
      nota: `Presupuesto personalizado enviado: ${producto.precio_desde + Math.floor(Math.random() * 200)}€/${producto.unidad}.`,
    });
  }
  if (estado === 'Cerrado') {
    seguimientos.push({
      fecha: fechaAleatoria(7),
      tipo: 'cierre',
      nota: 'Poliza firmada y documentacion enviada. Cliente satisfecho.',
    });
  }

  const objeciones = [];
  if (estado === 'Perdido') {
    objeciones.push('no me interesa');
  }
  if (['Interesado', 'Presupuestado', 'Cerrado'].includes(estado)) {
    const posibles = ['es caro', 'ya tengo seguro', 'lo tengo que pensar'];
    objeciones.push(posibles[Math.floor(Math.random() * posibles.length)]);
  }

  return {
    id,
    nombre,
    telefono: generarTelefono(),
    email: generarEmail(nombre),
    edad,
    zona,
    interes: productoKey,
    score: baseScore,
    estado,
    seguimientos,
    producto_interes: producto.nombre,
    presupuesto_enviado: ['Presupuestado', 'Cerrado'].includes(estado),
    fecha_creacion: fechaAleatoria(60),
    ultimo_contacto: estado === 'Lead' ? null : fechaAleatoria(15),
    objeciones,
    ...overrides,
  };
}

// Generar 30 leads con distribucion realista
const leads = [
  // 12 ventas cerradas este mes
  crearLead('Carlos Garcia Lopez', 'Cerrado', 'seguro_coche', { precio_final: 340 }),
  crearLead('Maria Rodriguez Fernandez', 'Cerrado', 'hogar', { precio_final: 215 }),
  crearLead('Antonio Martinez Sanchez', 'Cerrado', 'vida', { precio_final: 185 }),
  crearLead('Laura Perez Gonzalez', 'Cerrado', 'salud', { precio_final: 420 }),
  crearLead('Javier Hernandez Ruiz', 'Cerrado', 'seguro_coche', { precio_final: 390 }),
  crearLead('Carmen Diaz Torres', 'Cerrado', 'decesos', { precio_final: 65 }),
  crearLead('Miguel Lopez Ramirez', 'Cerrado', 'mascotas', { precio_final: 110 }),
  crearLead('Ana Gonzalez Serrano', 'Cerrado', 'hogar', { precio_final: 250 }),
  crearLead('David Sanchez Moreno', 'Cerrado', 'negocio', { precio_final: 580 }),
  crearLead('Isabel Fernandez Jimenez', 'Cerrado', 'salud', { precio_final: 395 }),
  crearLead('Pablo Martin Alvarez', 'Cerrado', 'viaje', { precio_final: 35 }),
  crearLead('Lucia Ruiz Navarro', 'Cerrado', 'vida', { precio_final: 155 }),

  // 4 presupuestados
  crearLead('Alejandro Moreno Castro', 'Presupuestado', 'seguro_coche'),
  crearLead('Marta Jimenez Ortiz', 'Presupuestado', 'salud'),
  crearLead('Raul Alvarez Delgado', 'Presupuestado', 'hogar'),
  crearLead('Elena Torres Romero', 'Presupuestado', 'negocio'),

  // 3 interesados
  crearLead('Daniel Romero Guerrero', 'Interesado', 'seguro_coche'),
  crearLead('Sofia Navarro Medina', 'Interesado', 'vida'),
  crearLead('Oscar Gutierrez Iglesias', 'Interesado', 'mascotas'),

  // 3 contactados
  crearLead('Paula Castro Blanco', 'Contactado', 'salud'),
  crearLead('Sergio Ortiz Mendez', 'Contactado', 'hogar'),
  crearLead('Andrea Medina Vega', 'Contactado', 'decesos'),

  // 4 leads nuevos
  crearLead('Francisco Iglesias Fuentes', 'Lead', 'seguro_coche'),
  crearLead('Natalia Guerrero Carrasco', 'Lead', 'salud'),
  crearLead('Alberto Blanco Prieto', 'Lead', 'vida'),
  crearLead('Cristina Vega Dominguez', 'Lead', 'viaje'),

  // 4 perdidos
  crearLead('Jorge Fuentes Reyes', 'Perdido', 'seguro_coche'),
  crearLead('Patricia Delgado Herrero', 'Perdido', 'hogar'),
  crearLead('Fernando Mendez Cabrera', 'Perdido', 'negocio'),
  crearLead('Sandra Prieto Calvo', 'Perdido', 'salud'),
];

// 5 renovaciones pendientes (polizas que vencen en los proximos 30 dias)
const renovaciones = [
  {
    id: uuidv4(),
    cliente_nombre: 'Carlos Garcia Lopez',
    cliente_id: leads[0].id,
    producto: 'seguro_coche',
    producto_nombre: 'Seguro de Coche',
    precio_actual: 340,
    fecha_vencimiento: new Date(Date.now() + 5 * 86400000).toISOString(),
    dias_para_vencimiento: 5,
    renovacion_automatica: false,
    contactado: false,
  },
  {
    id: uuidv4(),
    cliente_nombre: 'Maria Rodriguez Fernandez',
    cliente_id: leads[1].id,
    producto: 'hogar',
    producto_nombre: 'Seguro de Hogar',
    precio_actual: 215,
    fecha_vencimiento: new Date(Date.now() + 12 * 86400000).toISOString(),
    dias_para_vencimiento: 12,
    renovacion_automatica: true,
    contactado: false,
  },
  {
    id: uuidv4(),
    cliente_nombre: 'Antonio Martinez Sanchez',
    cliente_id: leads[2].id,
    producto: 'vida',
    producto_nombre: 'Seguro de Vida',
    precio_actual: 185,
    fecha_vencimiento: new Date(Date.now() + 18 * 86400000).toISOString(),
    dias_para_vencimiento: 18,
    renovacion_automatica: false,
    contactado: true,
  },
  {
    id: uuidv4(),
    cliente_nombre: 'Laura Perez Gonzalez',
    cliente_id: leads[3].id,
    producto: 'salud',
    producto_nombre: 'Seguro de Salud',
    precio_actual: 420,
    fecha_vencimiento: new Date(Date.now() + 22 * 86400000).toISOString(),
    dias_para_vencimiento: 22,
    renovacion_automatica: true,
    contactado: false,
  },
  {
    id: uuidv4(),
    cliente_nombre: 'Javier Hernandez Ruiz',
    cliente_id: leads[4].id,
    producto: 'seguro_coche',
    producto_nombre: 'Seguro de Coche',
    precio_actual: 390,
    fecha_vencimiento: new Date(Date.now() + 28 * 86400000).toISOString(),
    dias_para_vencimiento: 28,
    renovacion_automatica: false,
    contactado: false,
  },
];

// ============================================================
// ALGORITMO DE LEAD SCORING
// ============================================================

/**
 * Calcula el score de un lead basado en multiples factores
 */
function calcularScore(lead) {
  let score = 0;

  // Factor edad (0-20 puntos): mayor afinidad segun el producto
  const producto = PRODUCTOS[lead.interes];
  if (producto) {
    const [minEdad, maxEdad] = producto.target_edad;
    const edadMedia = (minEdad + maxEdad) / 2;
    const distancia = Math.abs(lead.edad - edadMedia);
    const rangoTotal = (maxEdad - minEdad) / 2;
    score += Math.max(0, Math.round(20 * (1 - distancia / rangoTotal)));
  }

  // Factor zona (0-15 puntos): zonas de alta poblacion y factor economico
  const zona = ZONAS[lead.zona];
  if (zona) {
    score += zona.poblacion === 'alta' ? 15 : zona.poblacion === 'media' ? 10 : 5;
  }

  // Factor interacciones previas (0-25 puntos)
  const numSeguimientos = lead.seguimientos.length;
  score += Math.min(25, numSeguimientos * 7);

  // Factor interes del producto (0-15 puntos): productos de mayor valor generan mas score
  const preciosOrden = { negocio: 15, salud: 13, seguro_coche: 12, hogar: 10, vida: 9, mascotas: 7, decesos: 5, viaje: 4 };
  score += preciosOrden[lead.interes] || 5;

  // Factor tiempo de respuesta (0-10 puntos): leads recientes puntuan mas
  if (lead.fecha_creacion) {
    const diasDesdeCreacion = (Date.now() - new Date(lead.fecha_creacion).getTime()) / 86400000;
    score += diasDesdeCreacion < 3 ? 10 : diasDesdeCreacion < 7 ? 8 : diasDesdeCreacion < 14 ? 5 : diasDesdeCreacion < 30 ? 3 : 1;
  }

  // Factor objeciones manejadas (0-15 puntos): si hubo objeciones y se avanza, es buen signo
  if (lead.objeciones.length > 0 && ['Interesado', 'Presupuestado', 'Cerrado'].includes(lead.estado)) {
    score += lead.objeciones.length * 5;
  } else if (lead.objeciones.length > 0 && lead.estado === 'Perdido') {
    score -= 10;
  }

  return Math.max(0, Math.min(100, score));
}

// Recalcular scores
leads.forEach(lead => {
  lead.score = calcularScore(lead);
});

// ============================================================
// SIMULACION DE LLAMADA DE VENTA
// ============================================================

/**
 * Simula una llamada de venta completa con un lead, devolviendo el log paso a paso
 */
function simulateVentaCall(leadId) {
  const lead = leads.find(l => l.id === leadId);
  if (!lead) {
    return { exito: false, error: 'Lead no encontrado', log: [] };
  }

  const producto = PRODUCTOS[lead.interes];
  if (!producto) {
    return { exito: false, error: 'Producto no encontrado para este lead', log: [] };
  }

  const precioBase = producto.precio_desde;
  const zonaFactor = ZONAS[lead.zona] ? ZONAS[lead.zona].factor : 1.0;
  const precioPersonalizado = Math.round(precioBase * zonaFactor);
  const descuento = 10 + Math.floor(Math.random() * 10); // 10-19%
  const precioConDescuento = Math.round(precioPersonalizado * (1 - descuento / 100));
  const precioDia = (precioPersonalizado / 365).toFixed(2);
  const precioMes = Math.round(precioPersonalizado / 12);

  // Determinar si la venta sera exitosa (basado en score)
  const probabilidadExito = lead.score / 100;
  const ventaExitosa = Math.random() < probabilidadExito;

  // Seleccionar objecion que pondra el cliente
  const objecionesCliente = ['es_caro', 'ya_tengo_seguro', 'lo_tengo_que_pensar', 'no_me_interesa', 'llamame_otro_dia'];
  const objecionSeleccionada = ventaExitosa
    ? objecionesCliente[Math.floor(Math.random() * 3)] // Si va a comprar, objeciones mas suaves
    : objecionesCliente[Math.floor(Math.random() * objecionesCliente.length)];
  const objecion = OBJECIONES[objecionSeleccionada];

  const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
  const diaCallback = diasSemana[Math.floor(Math.random() * diasSemana.length)];
  const horaCallback = `${9 + Math.floor(Math.random() * 9)}:${Math.random() > 0.5 ? '00' : '30'}`;

  function reemplazarVariables(texto) {
    return texto
      .replace(/{nombre}/g, lead.nombre.split(' ')[0])
      .replace(/{producto}/g, producto.nombre)
      .replace(/{precio_dia}/g, precioDia)
      .replace(/{precio_mes}/g, precioMes)
      .replace(/{descuento}/g, descuento)
      .replace(/{precio_sin_descuento}/g, precioPersonalizado)
      .replace(/{dia_callback}/g, diaCallback)
      .replace(/{hora_callback}/g, horaCallback)
      .replace(/{coste_sin_seguro}/g, objecion.coste_sin_seguro ? (objecion.coste_sin_seguro[lead.interes] || 5000) : 5000)
      .replace(/{ahorro}/g, objecion.ahorro ? (objecion.ahorro[lead.interes] || 100) : 100)
      .replace(/{beneficio_exclusivo}/g, producto.beneficios[0])
      .replace(/{estadistica}/g, objecion.estadistica ? (objecion.estadistica[lead.interes] || 40) : 40)
      .replace(/{tipo_siniestro}/g, producto.nombre.replace('Seguro de ', '').toLowerCase());
  }

  const log = [];

  // PASO 1: Saludo e identificacion
  log.push({
    paso: 1,
    tipo: 'saludo',
    mensaje_ia: `Buenos dias, ¿hablo con ${lead.nombre}? Mi nombre es Sara, le llamo de SiniestrosAI Seguros. ¿Tiene un momentito? Le llamo porque hemos preparado una oferta especial de ${producto.nombre} para su zona de ${lead.zona} que creo que le puede interesar mucho.`,
    respuesta_cliente: ventaExitosa || Math.random() > 0.3
      ? `Si, soy yo. Dime, ¿de que se trata?`
      : `Si, pero estoy un poco ocupado...`,
    accion: 'identificacion_completada',
    resultado: 'positivo',
  });

  // PASO 2: Deteccion de necesidades
  const preguntasNecesidad = lead.interes === 'seguro_coche'
    ? `${lead.nombre.split(' ')[0]}, ¿actualmente tiene vehiculo propio? ¿Lo utiliza a diario para ir al trabajo o mas bien para desplazamientos ocasionales? Y muy importante, ¿tiene actualmente algun seguro de coche?`
    : lead.interes === 'hogar'
    ? `${lead.nombre.split(' ')[0]}, ¿vive en piso o en casa unifamiliar? ¿Es vivienda propia o de alquiler? ¿Cuantos metros cuadrados tiene aproximadamente?`
    : lead.interes === 'vida'
    ? `${lead.nombre.split(' ')[0]}, ¿tiene familia, hijos? ¿Tiene alguna hipoteca o prestamo importante? Estas preguntas son importantes para dimensionar la proteccion que necesita.`
    : lead.interes === 'salud'
    ? `${lead.nombre.split(' ')[0]}, ¿como es su experiencia con la sanidad publica? ¿Ha tenido que esperar mucho para alguna consulta o prueba ultimamente? ¿Tiene hijos que incluir en la poliza?`
    : lead.interes === 'negocio'
    ? `${lead.nombre.split(' ')[0]}, ¿que tipo de negocio tiene? ¿Es local abierto al publico, oficina o taller? ¿Cuantos empleados tiene? ¿Ha tenido algun incidente en el local en los ultimos años?`
    : `${lead.nombre.split(' ')[0]}, cuenteme un poco sobre su situacion actual. ¿Que es lo que mas le preocupa en cuanto a proteccion y tranquilidad?`;

  const respuestasNecesidad = {
    seguro_coche: 'Si, tengo un coche que uso a diario para ir a trabajar. Tengo un seguro pero es basico, solo a terceros.',
    hogar: 'Vivo en un piso de unos 90 metros, es de propiedad. La hipoteca ya casi la tengo pagada.',
    vida: 'Si, tengo dos hijos pequeños y una hipoteca de 180.000€. Mi mujer tambien trabaja pero...',
    salud: 'Pues la verdad es que la ultima vez que necesite un especialista tuve que esperar 3 meses. Es desesperante.',
    negocio: 'Tengo una tienda de ropa en el centro, unos 120 metros cuadrados, con dos empleadas.',
    mascotas: 'Tengo un pastor aleman de 3 años. Es muy bueno pero ya sabes, son perros grandes...',
    decesos: 'Pues la verdad, nunca lo habia pensado, pero mi vecino tuvo que pagar 5.000€ cuando fallecio su padre...',
    viaje: 'Si, viajamos bastante, dos o tres veces al año fuera de España.',
  };

  log.push({
    paso: 2,
    tipo: 'deteccion_necesidades',
    mensaje_ia: preguntasNecesidad,
    respuesta_cliente: respuestasNecesidad[lead.interes] || 'Bueno, cuentame mas...',
    accion: 'necesidades_identificadas',
    resultado: 'informacion_obtenida',
  });

  // PASO 3: Presentacion del producto
  log.push({
    paso: 3,
    tipo: 'presentacion_producto',
    mensaje_ia: `Perfecto, ${lead.nombre.split(' ')[0]}. Basandome en lo que me cuenta, le recomiendo nuestro ${producto.nombre} que incluye: ${producto.coberturas.slice(0, 4).join(', ')}. Y lo mejor: ${producto.beneficios[0]}. ${producto.beneficios[1]}. Para su perfil, el precio es de solo ${precioPersonalizado}€/${producto.unidad}. Eso son apenas ${precioDia}€ al dia. ¿Que le parece?`,
    respuesta_cliente: ventaExitosa
      ? 'Suena bien, pero no se... ¿que incluye exactamente?'
      : 'Hmm, no se, la verdad...',
    accion: 'producto_presentado',
    resultado: 'cliente_escuchando',
  });

  // PASO 4: Objecion del cliente y manejo
  const respuestaObjecion = objecion.respuestas[Math.floor(Math.random() * objecion.respuestas.length)];
  const textoObjecion = objecionSeleccionada === 'es_caro' ? `Es que me parece un poco caro, ${precioPersonalizado}€ es mucho dinero...`
    : objecionSeleccionada === 'ya_tengo_seguro' ? 'Es que ya tengo un seguro con otra compañia y estoy contento...'
    : objecionSeleccionada === 'lo_tengo_que_pensar' ? 'Mira, dejame que lo piense y lo consulte con mi pareja...'
    : objecionSeleccionada === 'no_me_interesa' ? 'La verdad es que no me interesa, no creo que lo necesite...'
    : 'Oye, es que ahora mismo no puedo hablar, ¿puedes llamarme otro dia?';

  log.push({
    paso: 4,
    tipo: 'manejo_objecion',
    mensaje_ia: reemplazarVariables(respuestaObjecion),
    respuesta_cliente: textoObjecion,
    accion: 'objecion_manejada',
    resultado: ventaExitosa ? 'objecion_superada' : 'cliente_reticente',
    objecion_detectada: objecionSeleccionada,
  });

  // PASO 5: Segunda objecion o profundizacion
  if (ventaExitosa) {
    log.push({
      paso: 5,
      tipo: 'profundizacion',
      mensaje_ia: `Ademas, ${lead.nombre.split(' ')[0]}, quiero que sepa que como cliente nuevo, le puedo aplicar un ${descuento}% de descuento. Eso deja el precio en solo ${precioConDescuento}€/${producto.unidad}. Y puede pagarlo fraccionado sin recargo: ${Math.round(precioConDescuento / 12)}€/mes. Tambien incluimos gratuitamente: ${producto.beneficios[2]} y ${producto.beneficios[3]}.`,
      respuesta_cliente: 'Bueno, eso ya suena mejor... ¿y no hay permanencia ni nada raro?',
      accion: 'valor_añadido_presentado',
      resultado: 'interes_aumentado',
    });
  } else {
    // Segunda objecion
    const segundaObjecionKey = objecionesCliente.filter(o => o !== objecionSeleccionada)[Math.floor(Math.random() * 3)];
    const segundaObjecion = OBJECIONES[segundaObjecionKey];
    const respuesta2 = segundaObjecion.respuestas[Math.floor(Math.random() * segundaObjecion.respuestas.length)];

    log.push({
      paso: 5,
      tipo: 'segunda_objecion',
      mensaje_ia: reemplazarVariables(respuesta2),
      respuesta_cliente: 'Mira, de verdad, ahora mismo no me viene bien...',
      accion: 'segunda_objecion_manejada',
      resultado: 'cliente_no_convencido',
    });
  }

  // PASO 6: Cierre
  if (ventaExitosa) {
    log.push({
      paso: 6,
      tipo: 'cierre',
      mensaje_ia: `Sin permanencia, ${lead.nombre.split(' ')[0]}, puede cancelar cuando quiera. Cero letra pequeña. Mire, le propongo lo siguiente: le envio ahora mismo el presupuesto al email ${lead.email}, lo revisa con calma, y si le parece bien, puede firmarlo digitalmente desde el movil en 2 minutos. ¿Le envio el presupuesto?`,
      respuesta_cliente: 'Vale, si, envíamelo y lo miro.',
      accion: 'cierre_propuesto',
      resultado: 'aceptado',
    });

    log.push({
      paso: 7,
      tipo: 'confirmacion',
      mensaje_ia: `Fantastico, ${lead.nombre.split(' ')[0]}. Le acabo de enviar el presupuesto a ${lead.email}. Son ${precioConDescuento}€/${producto.unidad} con todas las coberturas que hemos comentado. Tiene 48 horas para firmarlo con las condiciones especiales. Si tiene cualquier duda, puede llamarme directamente. Ha sido un placer atenderle. ¡Que tenga un excelente dia!`,
      respuesta_cliente: 'Muchas gracias, Sara. Lo miro y te digo.',
      accion: 'presupuesto_enviado',
      resultado: 'venta_probable',
    });

    // Actualizar lead
    lead.estado = 'Presupuestado';
    lead.presupuesto_enviado = true;
    lead.ultimo_contacto = new Date().toISOString();
    lead.seguimientos.push({
      fecha: new Date().toISOString(),
      tipo: 'llamada_venta',
      nota: `Llamada de venta realizada por IA. Objecion "${objecionSeleccionada}" superada. Presupuesto ${precioConDescuento}€/${producto.unidad} enviado. Descuento ${descuento}% aplicado.`,
    });
    lead.score = Math.min(100, lead.score + 15);
  } else {
    log.push({
      paso: 6,
      tipo: 'cierre_fallido',
      mensaje_ia: `Entiendo perfectamente, ${lead.nombre.split(' ')[0]}. No se preocupe. Le dejo mi telefono directo por si en algun momento quiere retomar la conversacion. Y le envio un email informativo sin compromiso para que lo tenga. Muchas gracias por su tiempo y disculpe las molestias. ¡Que tenga un buen dia!`,
      respuesta_cliente: 'Vale, gracias. Adios.',
      accion: 'despedida',
      resultado: 'venta_no_cerrada',
    });

    // Actualizar lead
    lead.ultimo_contacto = new Date().toISOString();
    lead.seguimientos.push({
      fecha: new Date().toISOString(),
      tipo: 'llamada_venta',
      nota: `Llamada de venta realizada por IA. Objecion "${objecionSeleccionada}" no superada. Reagendar seguimiento.`,
    });
    lead.score = Math.max(0, lead.score - 5);
  }

  return {
    exito: ventaExitosa,
    lead_id: lead.id,
    lead_nombre: lead.nombre,
    producto: producto.nombre,
    precio_ofertado: precioConDescuento,
    descuento_aplicado: `${descuento}%`,
    objecion_principal: objecionSeleccionada,
    duracion_estimada: `${3 + Math.floor(Math.random() * 5)} minutos`,
    estado_final: lead.estado,
    score_actualizado: lead.score,
    resumen: ventaExitosa
      ? `Llamada exitosa. Presupuesto de ${precioConDescuento}€/${producto.unidad} enviado a ${lead.email}. Descuento del ${descuento}% aplicado. Objecion "${objecionSeleccionada}" superada con exito.`
      : `Llamada sin cierre. El cliente presento la objecion "${objecionSeleccionada}" que no se pudo superar. Se mantiene contacto para seguimiento futuro.`,
    log,
  };
}

// ============================================================
// PIPELINE COMERCIAL
// ============================================================

/**
 * Devuelve los leads agrupados por estado con conteos y valores
 */
function getPipeline() {
  const pipeline = {};

  ESTADOS.forEach(estado => {
    const leadsEnEstado = leads.filter(l => l.estado === estado);
    const valorEstimado = leadsEnEstado.reduce((sum, l) => {
      const prod = PRODUCTOS[l.interes];
      return sum + (l.precio_final || (prod ? prod.precio_desde : 0));
    }, 0);

    pipeline[estado] = {
      count: leadsEnEstado.length,
      leads: leadsEnEstado.map(l => ({
        id: l.id,
        nombre: l.nombre,
        producto: l.producto_interes,
        score: l.score,
        zona: l.zona,
        ultimo_contacto: l.ultimo_contacto,
      })),
      valor_estimado: valorEstimado,
    };
  });

  const totalLeads = leads.length;
  const tasaConversion = totalLeads > 0
    ? Math.round((pipeline.Cerrado.count / totalLeads) * 100)
    : 0;

  return {
    pipeline,
    resumen: {
      total_leads: totalLeads,
      tasa_conversion_global: `${tasaConversion}%`,
      valor_total_pipeline: Object.values(pipeline).reduce((s, p) => s + p.valor_estimado, 0),
      leads_calientes: leads.filter(l => l.score >= 70 && l.estado !== 'Cerrado' && l.estado !== 'Perdido').length,
    },
  };
}

// ============================================================
// VENTAS DEL MES
// ============================================================

/**
 * Devuelve las ventas cerradas este mes con totales y metricas
 */
function getVentasMes() {
  const ventasCerradas = leads.filter(l => l.estado === 'Cerrado');

  const ventasPorProducto = {};
  ventasCerradas.forEach(v => {
    if (!ventasPorProducto[v.interes]) {
      ventasPorProducto[v.interes] = { producto: v.producto_interes, cantidad: 0, ingresos: 0 };
    }
    ventasPorProducto[v.interes].cantidad++;
    ventasPorProducto[v.interes].ingresos += v.precio_final || PRODUCTOS[v.interes].precio_desde;
  });

  const totalIngresos = ventasCerradas.reduce((sum, v) => sum + (v.precio_final || PRODUCTOS[v.interes].precio_desde), 0);
  const ticketMedio = ventasCerradas.length > 0 ? Math.round(totalIngresos / ventasCerradas.length) : 0;

  return {
    mes: new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' }),
    total_ventas: ventasCerradas.length,
    ingresos_totales: `${totalIngresos}€`,
    ingresos_totales_num: totalIngresos,
    ticket_medio: `${ticketMedio}€`,
    ventas_por_producto: ventasPorProducto,
    detalle: ventasCerradas.map(v => ({
      id: v.id,
      cliente: v.nombre,
      producto: v.producto_interes,
      precio: v.precio_final || PRODUCTOS[v.interes].precio_desde,
      zona: v.zona,
      fecha_cierre: v.seguimientos.find(s => s.tipo === 'cierre')?.fecha || v.ultimo_contacto,
    })),
    objetivo_mes: 15,
    cumplimiento_objetivo: `${Math.round((ventasCerradas.length / 15) * 100)}%`,
    proyeccion_mes: Math.round(ventasCerradas.length * 1.25),
  };
}

// ============================================================
// CONTACTAR LEAD
// ============================================================

/**
 * Contacta a un lead, actualizando su estado y añadiendo seguimiento
 */
function contactarLead(leadId, nota = '') {
  const lead = leads.find(l => l.id === leadId);
  if (!lead) {
    return { exito: false, error: 'Lead no encontrado' };
  }

  const estadoAnterior = lead.estado;
  const transiciones = {
    Lead: 'Contactado',
    Contactado: 'Interesado',
    Interesado: 'Presupuestado',
    Presupuestado: 'Cerrado',
    Perdido: 'Contactado', // reactivacion
  };

  const nuevoEstado = transiciones[lead.estado] || lead.estado;
  lead.estado = nuevoEstado;
  lead.ultimo_contacto = new Date().toISOString();
  lead.score = Math.min(100, lead.score + 10);

  const seguimiento = {
    fecha: new Date().toISOString(),
    tipo: 'contacto_ia',
    nota: nota || `Contacto automatico IA. Estado actualizado: ${estadoAnterior} → ${nuevoEstado}. Score: ${lead.score}.`,
  };
  lead.seguimientos.push(seguimiento);

  if (nuevoEstado === 'Presupuestado') {
    lead.presupuesto_enviado = true;
  }

  return {
    exito: true,
    lead_id: lead.id,
    nombre: lead.nombre,
    estado_anterior: estadoAnterior,
    estado_nuevo: nuevoEstado,
    score: lead.score,
    seguimiento_añadido: seguimiento,
    producto: lead.producto_interes,
    proximo_paso: nuevoEstado === 'Contactado'
      ? 'Enviar informacion del producto por email'
      : nuevoEstado === 'Interesado'
      ? 'Preparar presupuesto personalizado'
      : nuevoEstado === 'Presupuestado'
      ? 'Hacer seguimiento en 48h para cierre'
      : nuevoEstado === 'Cerrado'
      ? 'Enviar documentacion de poliza y bienvenida'
      : 'Continuar seguimiento',
  };
}

// ============================================================
// DETECCION DE UPSELLING
// ============================================================

/**
 * Detecta oportunidades de upselling/cross-selling para un cliente existente
 */
function detectarUpselling(clienteId) {
  const cliente = leads.find(l => l.id === clienteId);
  if (!cliente) {
    return { exito: false, error: 'Cliente no encontrado' };
  }

  // Productos que ya tiene o en los que esta interesado
  const productoActual = cliente.interes;

  // Mapa de productos complementarios
  const complementarios = {
    seguro_coche: ['hogar', 'vida', 'salud', 'viaje'],
    hogar: ['vida', 'seguro_coche', 'mascotas', 'decesos'],
    vida: ['salud', 'hogar', 'decesos', 'seguro_coche'],
    salud: ['vida', 'decesos', 'viaje', 'mascotas'],
    decesos: ['vida', 'hogar', 'salud'],
    viaje: ['salud', 'seguro_coche', 'vida'],
    mascotas: ['hogar', 'salud', 'viaje'],
    negocio: ['seguro_coche', 'vida', 'salud', 'hogar'],
  };

  const productosRecomendados = (complementarios[productoActual] || []).map(key => {
    const prod = PRODUCTOS[key];
    const zonaFactor = ZONAS[cliente.zona] ? ZONAS[cliente.zona].factor : 1.0;
    const precioEstimado = Math.round(prod.precio_desde * zonaFactor);

    // Calcular probabilidad de compra basada en perfil
    let probabilidad = 40;
    if (cliente.estado === 'Cerrado') probabilidad += 25; // Ya es cliente
    if (cliente.score >= 70) probabilidad += 15;
    if (cliente.edad >= prod.target_edad[0] && cliente.edad <= prod.target_edad[1]) probabilidad += 10;
    probabilidad = Math.min(95, probabilidad);

    // Argumento de venta personalizado
    const argumentos = {
      hogar: `${cliente.nombre.split(' ')[0]}, como ya tiene su coche asegurado con nosotros, le ofrecemos un 15% de descuento en el Seguro de Hogar. Proteja tambien su vivienda.`,
      vida: `${cliente.nombre.split(' ')[0]}, con ${cliente.edad} años es el mejor momento para contratar un Seguro de Vida. Cuanto antes lo haga, mas economico sera.`,
      salud: `${cliente.nombre.split(' ')[0]}, complemente su proteccion con nuestro Seguro de Salud. Sin listas de espera y con videoconsulta 24h.`,
      seguro_coche: `${cliente.nombre.split(' ')[0]}, como cliente de confianza, tenemos una tarifa especial en Seguro de Coche con un 20% de descuento.`,
      decesos: `${cliente.nombre.split(' ')[0]}, por solo ${precioEstimado}€/año puede tener la tranquilidad del Seguro de Decesos para toda la familia.`,
      viaje: `${cliente.nombre.split(' ')[0]}, añada cobertura de viaje por solo ${prod.precio_desde}€ por viaje. Asistencia medica hasta 300.000€ en el extranjero.`,
      mascotas: `${cliente.nombre.split(' ')[0]}, ¿tiene mascota? Nuestro seguro incluye veterinario, RC y mucho mas desde ${precioEstimado}€/año.`,
      negocio: `${cliente.nombre.split(' ')[0]}, si tiene un negocio, podemos protegerlo con cobertura integral desde ${precioEstimado}€/año incluyendo ciberriesgos.`,
    };

    return {
      producto: prod.nombre,
      producto_key: key,
      precio_estimado: `${precioEstimado}€/${prod.unidad}`,
      probabilidad_compra: `${probabilidad}%`,
      argumento_venta: argumentos[key] || `Le recomendamos ${prod.nombre} como complemento ideal.`,
      coberturas_destacadas: prod.coberturas.slice(0, 3),
      descuento_cliente: '15%',
    };
  });

  return {
    exito: true,
    cliente: {
      id: cliente.id,
      nombre: cliente.nombre,
      producto_actual: cliente.producto_interes,
      estado: cliente.estado,
      score: cliente.score,
      zona: cliente.zona,
    },
    oportunidades: productosRecomendados,
    valor_potencial: productosRecomendados.reduce((sum, p) => {
      return sum + parseInt(p.precio_estimado);
    }, 0),
    recomendacion_ia: `El cliente ${cliente.nombre} tiene un perfil ideal para cross-selling. Recomiendo empezar por "${productosRecomendados[0]?.producto}" que tiene la mayor probabilidad de conversion. Contactar en horario de tarde.`,
  };
}

// ============================================================
// RENOVACIONES
// ============================================================

/**
 * Devuelve las polizas que vencen en los proximos 30 dias
 */
function getRenovaciones() {
  const ahora = new Date();

  const renovacionesPendientes = renovaciones.map(r => {
    const vencimiento = new Date(r.fecha_vencimiento);
    const diasRestantes = Math.ceil((vencimiento - ahora) / 86400000);

    return {
      ...r,
      dias_para_vencimiento: diasRestantes,
      urgencia: diasRestantes <= 7 ? 'critica' : diasRestantes <= 14 ? 'alta' : diasRestantes <= 21 ? 'media' : 'baja',
      accion_recomendada: diasRestantes <= 7
        ? `URGENTE: Llamar inmediatamente a ${r.cliente_nombre}. Poliza vence en ${diasRestantes} dias.`
        : diasRestantes <= 14
        ? `Enviar email de recordatorio y llamar en 48h.`
        : `Enviar comunicacion informativa sobre renovacion y mejoras.`,
      precio_renovacion_estimado: Math.round(r.precio_actual * 1.03), // IPC ~3%
      ahorro_fidelidad: Math.round(r.precio_actual * 0.05), // 5% descuento fidelidad
    };
  });

  const criticas = renovacionesPendientes.filter(r => r.urgencia === 'critica').length;
  const valorRenovaciones = renovacionesPendientes.reduce((s, r) => s + r.precio_actual, 0);

  return {
    total_renovaciones: renovacionesPendientes.length,
    renovaciones_criticas: criticas,
    valor_en_juego: `${valorRenovaciones}€`,
    renovaciones: renovacionesPendientes.sort((a, b) => a.dias_para_vencimiento - b.dias_para_vencimiento),
    resumen: `${renovacionesPendientes.length} polizas por renovar. ${criticas} son urgentes (vencen en menos de 7 dias). Valor total en juego: ${valorRenovaciones}€.`,
  };
}

// ============================================================
// TASAS DE CONVERSION
// ============================================================

/**
 * Calcula las tasas de conversion por producto
 */
function getConversion() {
  const conversionPorProducto = {};

  PRODUCTOS_KEYS.forEach(key => {
    const prod = PRODUCTOS[key];
    const leadsProducto = leads.filter(l => l.interes === key);
    const cerrados = leadsProducto.filter(l => l.estado === 'Cerrado');
    const perdidos = leadsProducto.filter(l => l.estado === 'Perdido');
    const enProceso = leadsProducto.filter(l => !['Cerrado', 'Perdido'].includes(l.estado));
    const tasa = leadsProducto.length > 0
      ? Math.round((cerrados.length / leadsProducto.length) * 100)
      : 0;

    conversionPorProducto[key] = {
      producto: prod.nombre,
      total_leads: leadsProducto.length,
      cerrados: cerrados.length,
      perdidos: perdidos.length,
      en_proceso: enProceso.length,
      tasa_conversion: `${tasa}%`,
      score_medio: leadsProducto.length > 0
        ? Math.round(leadsProducto.reduce((s, l) => s + l.score, 0) / leadsProducto.length)
        : 0,
      ingreso_medio: cerrados.length > 0
        ? `${Math.round(cerrados.reduce((s, l) => s + (l.precio_final || prod.precio_desde), 0) / cerrados.length)}€`
        : '0€',
      precio_base: `${prod.precio_desde}€/${prod.unidad}`,
    };
  });

  // Funnel global
  const totalLeads = leads.length;
  const funnel = ESTADOS.map(estado => {
    const count = leads.filter(l => l.estado === estado).length;
    return {
      estado,
      cantidad: count,
      porcentaje: `${Math.round((count / totalLeads) * 100)}%`,
    };
  });

  return {
    conversion_por_producto: conversionPorProducto,
    funnel_global: funnel,
    tasa_conversion_global: `${Math.round((leads.filter(l => l.estado === 'Cerrado').length / totalLeads) * 100)}%`,
    mejor_producto: Object.entries(conversionPorProducto)
      .sort((a, b) => parseInt(b[1].tasa_conversion) - parseInt(a[1].tasa_conversion))
      .map(([key, val]) => val.producto)[0],
    peor_producto: Object.entries(conversionPorProducto)
      .filter(([, val]) => val.total_leads > 0)
      .sort((a, b) => parseInt(a[1].tasa_conversion) - parseInt(b[1].tasa_conversion))
      .map(([key, val]) => val.producto)[0],
  };
}

// ============================================================
// COMPARATIVA IA vs EQUIPO HUMANO
// ============================================================

/**
 * Genera una comparativa de rendimiento entre el agente IA y un equipo humano
 */
function getComparativaHumano() {
  const ventasIA = leads.filter(l => l.estado === 'Cerrado').length;
  const ingresosIA = leads
    .filter(l => l.estado === 'Cerrado')
    .reduce((s, l) => s + (l.precio_final || PRODUCTOS[l.interes].precio_desde), 0);

  // Simulacion de metricas del equipo humano (IA es 3x mejor)
  const ventasHumano = Math.round(ventasIA / 3);
  const ingresosHumano = Math.round(ingresosIA / 3);

  return {
    periodo: new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' }),
    agente_ia: {
      nombre: 'Sara IA (SiniestrosAI)',
      ventas_cerradas: ventasIA,
      ingresos: `${ingresosIA}€`,
      llamadas_realizadas: ventasIA * 4, // ratio 4 llamadas por venta
      tasa_conversion: `${Math.round((ventasIA / (ventasIA * 4)) * 100)}%`,
      tiempo_medio_llamada: '4.2 minutos',
      horas_trabajadas: '24/7 (720h/mes)',
      coste_operativo: '199€/mes',
      satisfaccion_cliente: '4.6/5',
      leads_gestionados: leads.length,
      seguimientos_automaticos: leads.reduce((s, l) => s + l.seguimientos.length, 0),
      idiomas: 'Español, Ingles, Frances, Portugues',
      disponibilidad: '24 horas, 7 dias, 365 dias',
      errores_humanos: 0,
      escalaciones: 2,
    },
    equipo_humano: {
      nombre: 'Equipo Comercial Medio (3 personas)',
      ventas_cerradas: ventasHumano,
      ingresos: `${ingresosHumano}€`,
      llamadas_realizadas: ventasHumano * 8, // ratio 8 llamadas por venta
      tasa_conversion: `${Math.round((ventasHumano / (ventasHumano * 8)) * 100)}%`,
      tiempo_medio_llamada: '12.5 minutos',
      horas_trabajadas: '480h/mes (3 personas x 160h)',
      coste_operativo: '7.500€/mes (salarios + SS)',
      satisfaccion_cliente: '4.1/5',
      leads_gestionados: Math.round(leads.length * 0.6),
      seguimientos_automaticos: 0,
      idiomas: 'Español',
      disponibilidad: 'Lunes a Viernes, 9:00-18:00',
      errores_humanos: 15,
      escalaciones: 8,
    },
    comparativa: {
      ventas: {
        ia: ventasIA,
        humano: ventasHumano,
        ventaja_ia: `${Math.round(ventasIA / Math.max(1, ventasHumano))}x mas ventas`,
      },
      ingresos: {
        ia: `${ingresosIA}€`,
        humano: `${ingresosHumano}€`,
        ventaja_ia: `${Math.round(ingresosIA / Math.max(1, ingresosHumano))}x mas ingresos`,
      },
      coste_por_venta: {
        ia: `${Math.round(199 / Math.max(1, ventasIA))}€`,
        humano: `${Math.round(7500 / Math.max(1, ventasHumano))}€`,
        ahorro_ia: `${Math.round(7500 / Math.max(1, ventasHumano)) - Math.round(199 / Math.max(1, ventasIA))}€ por venta`,
      },
      roi: {
        ia: `${Math.round((ingresosIA / 199) * 100)}%`,
        humano: `${Math.round((ingresosHumano / 7500) * 100)}%`,
        ventaja_ia: 'ROI significativamente superior',
      },
      eficiencia: {
        ia: `${(ventasIA / 720 * 100).toFixed(2)}% del tiempo en ventas efectivas`,
        humano: `${(ventasHumano / 480 * 100).toFixed(2)}% del tiempo en ventas efectivas`,
        conclusion: 'La IA trabaja 24/7 sin descansos, bajas ni vacaciones',
      },
    },
    conclusion: `El agente IA Sara supera al equipo humano en todas las metricas clave: ${Math.round(ventasIA / Math.max(1, ventasHumano))}x mas ventas, ${Math.round(ingresosIA / Math.max(1, ingresosHumano))}x mas ingresos, a un coste ${Math.round(7500 / 199)}x menor. La IA gestiona ${leads.length} leads simultaneamente, trabaja 24/7 y mantiene una satisfaccion del cliente de 4.6/5. El coste por venta de la IA es de ${Math.round(199 / Math.max(1, ventasIA))}€ frente a ${Math.round(7500 / Math.max(1, ventasHumano))}€ del equipo humano.`,
  };
}

// ============================================================
// EXPORTACIONES
// ============================================================

module.exports = {
  // Funciones principales
  simulateVentaCall,
  getPipeline,
  getVentasMes,
  contactarLead,
  detectarUpselling,
  getRenovaciones,
  getConversion,
  getComparativaHumano,
  calcularScore,

  // Datos (para acceso desde otros modulos)
  leads,
  renovaciones,
  PRODUCTOS,
  OBJECIONES,
  ZONAS,
  ESTADOS,
};
