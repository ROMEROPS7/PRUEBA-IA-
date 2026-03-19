const { v4: uuidv4 } = require('uuid');

// ============================================================================
// BASE DE DATOS EN MEMORIA - ACCIDENTES ANALIZADOS
// ============================================================================

const accidentesAnalizados = [
  {
    id: 'inv-001', siniestroId: 'SIN-2025-0412',
    fecha_accidente: '2025-10-10', hora: '08:45',
    ubicacion: 'Calle Gran Vía 42, Madrid',
    tipo_colision: 'alcance_trasero',
    vehiculos: [
      {
        rol: 'victima', conductor: 'María López Fernández', vehiculo: 'Seat León 2021',
        matricula: '1234 ABC', danios: 'Paragolpes trasero, portón, luces traseras',
        patron_danio: 'impacto_trasero', declaracion: 'Estaba detenida en semáforo rojo cuando recibí el impacto por detrás. No tuve tiempo de reaccionar.',
        lesiones: 'Cervicalgia leve (latigazo cervical)'
      },
      {
        rol: 'causante', conductor: 'Carlos Ruiz Gómez', vehiculo: 'Volkswagen Golf 2019',
        matricula: '5678 DEF', danios: 'Paragolpes delantero, capó, radiador',
        patron_danio: 'impacto_frontal', declaracion: 'Me distraje un momento mirando el GPS y cuando levanté la vista ya estaba encima del coche de delante. Frené pero no fue suficiente.',
        lesiones: 'Sin lesiones'
      }
    ],
    condiciones_meteorologicas: { tiempo: 'despejado', temperatura: 18, visibilidad: 'buena', pavimento: 'seco' },
    condiciones_via: { tipo: 'urbana', carriles: 2, estado: 'bueno', senalizacion: 'semáforo', iluminacion: 'natural' },
    evidencias: ['parte_amistoso', 'fotos_danios', 'atestado_policial', 'informe_medico'],
    telemetria: { velocidad_impacto_estimada: 35, distancia_frenada: 8.5, airbag_activado: false },
    resultado: {
      reconstruccion: 'El vehículo causante (VW Golf) circulaba a aproximadamente 35 km/h cuando impactó contra el Seat León que se encontraba detenido en semáforo rojo. La distancia de frenada de 8.5m es consistente con una frenada tardía. El conductor admite distracción por uso del GPS.',
      porcentaje_culpabilidad: { victima: 0, causante: 100 },
      contradicciones: [],
      conclusion: 'Caso claro de colisión por alcance con distracción del conductor causante. Culpabilidad 100% del tercero. Compatible con subrogación total.'
    }
  },
  {
    id: 'inv-002', siniestroId: 'SIN-2025-0523',
    fecha_accidente: '2025-10-28', hora: '19:30',
    ubicacion: 'Carretera N-340, km 142, Valencia',
    tipo_colision: 'frontal_parcial',
    vehiculos: [
      {
        rol: 'victima', conductor: 'Antonio García Martín', vehiculo: 'Renault Clio 2020',
        matricula: '9012 GHI', danios: 'Frontal izquierdo, faro, aleta, puerta',
        patron_danio: 'impacto_frontal_izquierdo', declaracion: 'Circulaba por mi carril cuando vi venir un coche de frente invadiendo mi carril. Intenté esquivarlo girando a la derecha.',
        lesiones: 'Contusión en rodilla izquierda, cervicalgia'
      },
      {
        rol: 'causante', conductor: 'Laura Sánchez Díaz', vehiculo: 'Ford Focus 2018',
        matricula: '3456 JKL', danios: 'Frontal derecho completo, airbag desplegado',
        patron_danio: 'impacto_frontal_derecho', declaracion: 'Iba adelantando a un camión cuando apareció el otro coche. No me dio tiempo a volver a mi carril.',
        lesiones: 'Fractura de muñeca, contusiones varias'
      }
    ],
    condiciones_meteorologicas: { tiempo: 'lluvioso', temperatura: 12, visibilidad: 'reducida', pavimento: 'mojado' },
    condiciones_via: { tipo: 'interurbana', carriles: 1, estado: 'regular', senalizacion: 'linea_continua', iluminacion: 'crepúsculo' },
    evidencias: ['atestado_policial', 'fotos_danios', 'informe_perito', 'informe_medico', 'croquis_accidente'],
    telemetria: { velocidad_impacto_estimada: 70, distancia_frenada: 22, airbag_activado: true },
    resultado: {
      reconstruccion: 'La conductora del Ford Focus realizó un adelantamiento en zona de línea continua con visibilidad reducida por lluvia y crepúsculo. El Renault Clio circulaba correctamente por su carril. Sin embargo, la velocidad del Clio (estimada 85 km/h en zona de 80) contribuyó ligeramente a la gravedad del impacto.',
      porcentaje_culpabilidad: { victima: 20, causante: 80 },
      contradicciones: [
        'La causante declara "apareció el otro coche" pero el Clio circulaba por su carril con las luces encendidas - debía ser visible',
        'La causante no menciona la línea continua ni las condiciones meteorológicas adversas'
      ],
      conclusion: 'Adelantamiento antirreglamentario en condiciones adversas. Culpabilidad principal (80%) de la conductora del Ford Focus. Leve contribución del asegurado por exceso de velocidad marginal.'
    }
  },
  {
    id: 'inv-003', siniestroId: 'SIN-2025-0298',
    fecha_accidente: '2025-09-02', hora: '11:15',
    ubicacion: 'Intersección Av. Diagonal con C/ Marina, Barcelona',
    tipo_colision: 'lateral_perpendicular',
    vehiculos: [
      {
        rol: 'victima', conductor: 'Pilar Hernández Ruiz', vehiculo: 'Toyota Yaris 2022',
        matricula: '7890 MNO', danios: 'Lateral derecho completo, dos puertas, pilar B',
        patron_danio: 'impacto_lateral_derecho', declaracion: 'Yo circulaba por la Diagonal con prioridad. El otro coche salió de Marina sin parar en el STOP y me dio en el lateral.',
        lesiones: 'Sin lesiones gracias al airbag lateral'
      },
      {
        rol: 'causante', conductor: 'Miguel Ángel Torres', vehiculo: 'Peugeot 308 2020',
        matricula: '2345 PQR', danios: 'Frontal completo, capó, radiador, faros',
        patron_danio: 'impacto_frontal', declaracion: 'Yo paré en el STOP y miré. No vi a nadie venir y avancé. De repente apareció el Toyota por la derecha.',
        lesiones: 'Contusión costal'
      }
    ],
    condiciones_meteorologicas: { tiempo: 'soleado', temperatura: 28, visibilidad: 'excelente', pavimento: 'seco' },
    condiciones_via: { tipo: 'urbana', carriles: 3, estado: 'bueno', senalizacion: 'STOP_en_marina', iluminacion: 'natural' },
    evidencias: ['atestado_policial', 'fotos_danios', 'parte_amistoso', 'video_camara_trafico', 'testimonio_testigos'],
    telemetria: { velocidad_impacto_estimada: 45, distancia_frenada: 0, airbag_activado: true },
    resultado: {
      reconstruccion: 'El Peugeot 308 debía detenerse en la señal de STOP de C/ Marina antes de incorporarse a Av. Diagonal. Las cámaras de tráfico confirman que el vehículo no se detuvo completamente. El Toyota Yaris circulaba a velocidad adecuada por Av. Diagonal con prioridad de paso. La distancia de frenada 0 del Peugeot indica que no frenó antes del impacto.',
      porcentaje_culpabilidad: { victima: 0, causante: 100 },
      contradicciones: [
        'El causante declara "paré en el STOP" pero el vídeo de la cámara de tráfico muestra que no se detuvo completamente',
        'Declara "no vi a nadie" pero la visibilidad era excelente y la Diagonal tiene 3 carriles - un Toyota Yaris blanco es perfectamente visible',
        'La ausencia de marcas de frenada del Peugeot contradice su versión de haber parado'
      ],
      conclusion: 'Incumplimiento claro de señal de STOP. Evidencia de vídeo contradice declaración del causante. Culpabilidad 100% del tercero.'
    }
  },
  {
    id: 'inv-004', siniestroId: 'SIN-2026-0112',
    fecha_accidente: '2026-01-30', hora: '17:45',
    ubicacion: 'Rotonda Puerta de Alcalá, Madrid',
    tipo_colision: 'lateral_incorporacion',
    vehiculos: [
      {
        rol: 'victima', conductor: 'Elena Martínez Soler', vehiculo: 'Hyundai Tucson 2023',
        matricula: '6789 STU', danios: 'Lateral izquierdo trasero, aleta, puerta trasera',
        patron_danio: 'impacto_lateral_trasero_izquierdo', declaracion: 'Circulaba por dentro de la rotonda por el carril interior. El otro coche se incorporó sin mirar y me golpeó.',
        lesiones: 'Cervicalgia moderada'
      },
      {
        rol: 'causante', conductor: 'David Fernández Navarro', vehiculo: 'BMW Serie 3 2021',
        matricula: '0123 VWX', danios: 'Frontal derecho, faro, paragolpes',
        patron_danio: 'impacto_frontal_derecho', declaracion: 'Yo ya estaba entrando en la rotonda cuando el Hyundai cambió de carril hacia fuera y me cortó el paso.',
        lesiones: 'Sin lesiones'
      }
    ],
    condiciones_meteorologicas: { tiempo: 'nublado', temperatura: 8, visibilidad: 'buena', pavimento: 'seco' },
    condiciones_via: { tipo: 'urbana', carriles: 3, estado: 'bueno', senalizacion: 'rotonda_ceda_paso', iluminacion: 'artificial' },
    evidencias: ['atestado_policial', 'fotos_danios', 'dashcam_testigo'],
    telemetria: { velocidad_impacto_estimada: 30, distancia_frenada: 3, airbag_activado: false },
    resultado: {
      reconstruccion: 'El BMW Serie 3 se incorporaba a la rotonda y debía ceder el paso a los vehículos que ya circulaban por ella. El Hyundai Tucson circulaba por el carril interior. La dashcam de un vehículo testigo muestra que el BMW entró en la rotonda sin detenerse en el ceda el paso. El patrón de daños (frontal derecho BMW vs lateral trasero izquierdo Hyundai) es consistente con una incorporación del BMW contra el Hyundai que ya circulaba.',
      porcentaje_culpabilidad: { victima: 0, causante: 100 },
      contradicciones: [
        'El causante alega que el Hyundai "cambió de carril" pero los daños en el lateral trasero indican que el Hyundai ya había pasado el punto de incorporación',
        'La dashcam del testigo muestra que el BMW no se detuvo en el ceda el paso'
      ],
      conclusion: 'Incorporación a rotonda sin ceder el paso. Evidencia de dashcam testigo refuerza la versión de la víctima. Culpabilidad 100% del tercero.'
    }
  },
  {
    id: 'inv-005', siniestroId: 'SIN-2026-0098',
    fecha_accidente: '2026-01-22', hora: '22:10',
    ubicacion: 'Cruce Av. del Puerto con C/ Serrería, Valencia',
    tipo_colision: 'lateral_semaforo',
    vehiculos: [
      {
        rol: 'victima', conductor: 'Roberto Jiménez Ortiz', vehiculo: 'Kia Sportage 2022',
        matricula: '4567 YZA', danios: 'Lateral derecho, puerta delantera y trasera, pilar B',
        patron_danio: 'impacto_lateral_derecho', declaracion: 'Crucé con semáforo en verde. No vi al otro coche hasta que me golpeó en el lateral.',
        lesiones: 'Contusión en hombro derecho, cervicalgia'
      },
      {
        rol: 'causante', conductor: 'Ana Belén Castro Ramos', vehiculo: 'Opel Corsa 2019',
        matricula: '8901 BCD', danios: 'Frontal completo, airbag desplegado',
        patron_danio: 'impacto_frontal', declaracion: 'El semáforo estaba en ámbar y pensé que me daba tiempo a pasar. Reconozco que quizás debí frenar.',
        lesiones: 'Abrasión por airbag, contusión torácica'
      }
    ],
    condiciones_meteorologicas: { tiempo: 'despejado', temperatura: 10, visibilidad: 'buena_noche', pavimento: 'seco' },
    condiciones_via: { tipo: 'urbana', carriles: 2, estado: 'bueno', senalizacion: 'semáforo', iluminacion: 'artificial' },
    evidencias: ['atestado_policial', 'fotos_danios', 'registro_semaforo'],
    telemetria: { velocidad_impacto_estimada: 50, distancia_frenada: 0, airbag_activado: true },
    resultado: {
      reconstruccion: 'El Opel Corsa cruzó la intersección con el semáforo en rojo (la propia conductora admite que estaba en ámbar, y el registro del ciclo semafórico muestra que llevaba 3 segundos en rojo cuando se produjo el impacto). El Kia Sportage cruzó con semáforo en verde. La velocidad de impacto de 50 km/h y la ausencia de frenada indican que la conductora del Corsa no intentó detenerse.',
      porcentaje_culpabilidad: { victima: 0, causante: 100 },
      contradicciones: [
        'La causante dice "estaba en ámbar" pero el registro del semáforo muestra que llevaba 3 segundos en rojo',
        'La ausencia total de frenada contradice la versión de "pensé que me daba tiempo" - si pensó que le daba tiempo, no habría necesidad de frenar'
      ],
      conclusion: 'Infracción clara de semáforo en rojo con registro electrónico que lo confirma. Culpabilidad 100% del tercero.'
    }
  },
  {
    id: 'inv-006', siniestroId: 'SIN-2026-0155',
    fecha_accidente: '2026-02-12', hora: '07:30',
    ubicacion: 'Autovía A-7, km 456, Málaga',
    tipo_colision: 'multiple_cadena',
    vehiculos: [
      {
        rol: 'victima', conductor: 'Lucía Navarro Campos', vehiculo: 'Mercedes Clase A 2023',
        matricula: '2345 EFG', danios: 'Trasero completo y frontal parcial (efecto sándwich)',
        patron_danio: 'impacto_trasero_y_frontal', declaracion: 'Circulaba en la autovía cuando el tráfico se detuvo. Yo frené a tiempo pero el camión de detrás me empujó contra el coche de delante.',
        lesiones: 'Cervicalgia grave, lumbalgia, contusiones múltiples'
      },
      {
        rol: 'causante', conductor: 'Óscar Delgado Herrera', vehiculo: 'Camión Iveco Daily 2020',
        matricula: '6789 HIJ', danios: 'Paragolpes y cabina frontal',
        patron_danio: 'impacto_frontal', declaracion: 'Había mucha niebla y no vi que el tráfico estaba parado hasta que fue demasiado tarde. Frené pero el suelo estaba húmedo.',
        lesiones: 'Sin lesiones (cabina elevada)'
      },
      {
        rol: 'afectado', conductor: 'Pedro Gómez Ruiz', vehiculo: 'Citroën C4 2021',
        matricula: '0123 KLM', danios: 'Trasero medio (impacto secundario)',
        patron_danio: 'impacto_trasero', declaracion: 'Yo ya estaba parado cuando noté el golpe por detrás. Fue el Mercedes que me empujaron encima.',
        lesiones: 'Cervicalgia leve'
      }
    ],
    condiciones_meteorologicas: { tiempo: 'niebla', temperatura: 5, visibilidad: 'muy_reducida_50m', pavimento: 'mojado' },
    condiciones_via: { tipo: 'autovia', carriles: 3, estado: 'bueno', senalizacion: 'panel_variable_velocidad_60', iluminacion: 'amanecer_niebla' },
    evidencias: ['atestado_policial', 'fotos_danios', 'informe_perito', 'informe_medico', 'datos_panel_variable'],
    telemetria: { velocidad_impacto_estimada: 60, distancia_frenada: 35, airbag_activado: true },
    resultado: {
      reconstruccion: 'Colisión en cadena en A-7 con niebla densa. El camión Iveco Daily no respetó la distancia de seguridad y la velocidad reducida señalizada en el panel variable (60 km/h). La frenada de 35m con pavimento mojado sugiere una velocidad superior a los 60 km/h señalizados. El impacto primario del camión contra el Mercedes causó un efecto cadena sobre el Citroën. La víctima (Mercedes) estaba correctamente detenida.',
      porcentaje_culpabilidad: { victima: 0, causante: 100 },
      contradicciones: [
        'El causante alega "mucha niebla" como excusa pero eso precisamente obligaba a reducir velocidad y aumentar distancia de seguridad',
        'La distancia de frenada de 35m es incompatible con circular a 60 km/h (la velocidad señalizada) - indica velocidad real superior a 80 km/h'
      ],
      conclusion: 'Colisión múltiple causada por exceso de velocidad y distancia de seguridad insuficiente del camión en condiciones meteorológicas adversas. Culpabilidad 100% del conductor del camión.'
    }
  },
  {
    id: 'inv-007', siniestroId: 'SIN-2026-0041',
    fecha_accidente: '2026-01-05', hora: '03:20',
    ubicacion: 'C/ Alcalá 200, Madrid (zona de estacionamiento)',
    tipo_colision: 'atropello_vehiculo_estacionado',
    vehiculos: [
      {
        rol: 'victima', conductor: 'Carmen Rodríguez Blanco (no presente)', vehiculo: 'Audi A3 2022',
        matricula: '4567 NOP', danios: 'Lateral izquierdo completo, dos puertas hundidas, retrovisor arrancado',
        patron_danio: 'impacto_lateral_izquierdo_severo', declaracion: 'Mi coche estaba correctamente estacionado. Me llamó la policía a las 4 AM para informarme del siniestro.',
        lesiones: 'N/A - vehículo estacionado'
      },
      {
        rol: 'causante', conductor: 'Francisco Javier López', vehiculo: 'Seat Ibiza 2017',
        matricula: '8901 QRS', danios: 'Frontal y lateral derecho',
        patron_danio: 'impacto_lateral_derecho', declaracion: 'Se me cruzó un gato y di un volantazo para esquivarlo. Perdí el control y me fui contra los coches aparcados.',
        lesiones: 'Contusión facial por airbag'
      }
    ],
    condiciones_meteorologicas: { tiempo: 'despejado', temperatura: 2, visibilidad: 'nocturna_buena', pavimento: 'seco' },
    condiciones_via: { tipo: 'urbana', carriles: 2, estado: 'bueno', senalizacion: 'normal', iluminacion: 'artificial' },
    evidencias: ['atestado_policial', 'fotos_danios', 'test_alcoholemia_positivo', 'grabacion_camara_comercio'],
    telemetria: { velocidad_impacto_estimada: 55, distancia_frenada: 0, airbag_activado: true },
    resultado: {
      reconstruccion: 'El Seat Ibiza circulaba a velocidad excesiva (55 km/h en zona 30) a las 03:20 AM y perdió el control impactando contra el Audi A3 estacionado. El test de alcoholemia arrojó 0.45 mg/l (positivo, el límite es 0.25 mg/l). La grabación de la cámara del comercio cercano no muestra ningún animal en la vía. La ausencia de marcas de frenada y la velocidad de impacto indican pérdida total de control del vehículo.',
      porcentaje_culpabilidad: { victima: 0, causante: 100 },
      contradicciones: [
        'El causante alega "un gato" pero la cámara del comercio no registra ningún animal en la vía',
        'Velocidad de 55 km/h en zona 30 - exceso de velocidad',
        'Test de alcoholemia positivo (0.45 mg/l) - duplica el límite legal',
        'Ausencia de frenada contradice una maniobra evasiva por animal'
      ],
      conclusion: 'Conducción bajo influencia de alcohol con exceso de velocidad. Declaración sobre animal no corroborada por evidencias. Culpabilidad 100% del tercero. Posible responsabilidad penal por conducción etílica (Art. 379.2 CP).'
    }
  },
  {
    id: 'inv-008', siniestroId: 'SIN-2026-0201',
    fecha_accidente: '2026-03-01', hora: '09:00',
    ubicacion: 'Incorporación A-3, Rivas-Vaciamadrid',
    tipo_colision: 'incorporacion_autovia',
    vehiculos: [
      {
        rol: 'victima', conductor: 'Fernando Ruiz Moreno', vehiculo: 'Nissan Qashqai 2023',
        matricula: '2345 TUV', danios: 'Lateral derecho, puerta delantera, aleta trasera',
        patron_danio: 'impacto_lateral_derecho', declaracion: 'Circulaba por el carril derecho de la A-3 a unos 100 km/h. El otro coche se incorporó sin respetar mi prioridad y me golpeó.',
        lesiones: 'Cervicalgia leve'
      },
      {
        rol: 'causante', conductor: 'Patricia Iglesias Rojo', vehiculo: 'Dacia Sandero 2021',
        matricula: '6789 WXY', danios: 'Frontal izquierdo, paragolpes, faro',
        patron_danio: 'impacto_frontal_izquierdo', declaracion: 'Intenté incorporarme a la autovía pero el carril de aceleración era muy corto. El Nissan iba muy rápido y no pude evitar el contacto.',
        lesiones: 'Sin lesiones'
      }
    ],
    condiciones_meteorologicas: { tiempo: 'soleado', temperatura: 14, visibilidad: 'excelente', pavimento: 'seco' },
    condiciones_via: { tipo: 'autovia', carriles: 3, estado: 'bueno', senalizacion: 'carril_aceleracion', iluminacion: 'natural' },
    evidencias: ['atestado_policial', 'fotos_danios', 'informe_perito'],
    telemetria: { velocidad_impacto_estimada: 80, distancia_frenada: 15, airbag_activado: false },
    resultado: {
      reconstruccion: 'El Dacia Sandero se incorporaba a la A-3 desde el carril de aceleración y debía ceder el paso a los vehículos que circulaban por la autovía. El Nissan Qashqai circulaba por el carril derecho a velocidad reglamentaria. El patrón de daños confirma que el Dacia impactó con su frontal izquierdo contra el lateral derecho del Nissan, lo que demuestra que la incorporación no se completó correctamente.',
      porcentaje_culpabilidad: { victima: 0, causante: 100 },
      contradicciones: [
        'La causante alega carril de aceleración corto, pero el tramo de incorporación en ese punto tiene 250m de longitud (estándar)',
        'Alega que "el Nissan iba muy rápido" pero 100 km/h es la velocidad reglamentaria en autovía'
      ],
      conclusion: 'Incorporación a autovía sin ceder el paso. El vehículo que se incorpora tiene la obligación de adaptarse al flujo de la vía. Culpabilidad 100% del tercero.'
    }
  }
];

// Factores de análisis
const factoresMeteorologicos = {
  despejado: { factor_riesgo: 1.0, descripcion: 'Sin influencia meteorológica' },
  nublado: { factor_riesgo: 1.1, descripcion: 'Ligera reducción de luminosidad' },
  lluvioso: { factor_riesgo: 1.5, descripcion: 'Pavimento mojado, mayor distancia de frenada (+30-50%), reducción de visibilidad' },
  niebla: { factor_riesgo: 2.0, descripcion: 'Visibilidad severamente reducida, obliga a reducir velocidad significativamente' },
  nieve: { factor_riesgo: 2.5, descripcion: 'Adherencia mínima, riesgo muy alto de pérdida de control' },
  helada: { factor_riesgo: 2.8, descripcion: 'Hielo en calzada, adherencia casi nula, frenada prácticamente imposible' },
  viento_fuerte: { factor_riesgo: 1.4, descripcion: 'Riesgo de desplazamiento lateral, especialmente vehículos altos' },
  soleado: { factor_riesgo: 1.0, descripcion: 'Condiciones óptimas de visibilidad' }
};

const patronesDanio = {
  impacto_frontal: {
    implicacion: 'El vehículo impactó de frente. Indica que el conductor iba en la dirección del impacto.',
    gravedad_tipica: 'alta',
    compatible_con: ['alcance_trasero', 'frontal_parcial', 'incorporacion_autovia']
  },
  impacto_trasero: {
    implicacion: 'El vehículo fue impactado por detrás. Típico de vehículo detenido o que circulaba delante.',
    gravedad_tipica: 'media',
    compatible_con: ['alcance_trasero', 'multiple_cadena']
  },
  impacto_lateral_derecho: {
    implicacion: 'Impacto recibido por la derecha. Compatible con no respetar prioridad desde la derecha.',
    gravedad_tipica: 'alta',
    compatible_con: ['lateral_perpendicular', 'lateral_semaforo', 'incorporacion_autovia']
  },
  impacto_lateral_izquierdo: {
    implicacion: 'Impacto recibido por la izquierda. Compatible con invasión de carril contrario.',
    gravedad_tipica: 'alta',
    compatible_con: ['frontal_parcial', 'lateral_perpendicular']
  },
  impacto_frontal_izquierdo: {
    implicacion: 'Impacto parcial frontal izquierdo. Compatible con colisión en incorporación o giro.',
    gravedad_tipica: 'media-alta',
    compatible_con: ['frontal_parcial', 'incorporacion_autovia']
  },
  impacto_frontal_derecho: {
    implicacion: 'Impacto parcial frontal derecho. Compatible con incorporación a vía con tráfico.',
    gravedad_tipica: 'media-alta',
    compatible_con: ['lateral_incorporacion', 'frontal_parcial']
  },
  impacto_lateral_trasero_izquierdo: {
    implicacion: 'Impacto en cuarto trasero izquierdo. Compatible con alcance lateral o incorporación.',
    gravedad_tipica: 'media',
    compatible_con: ['lateral_incorporacion', 'cambio_carril']
  },
  impacto_lateral_izquierdo_severo: {
    implicacion: 'Impacto severo en lateral izquierdo. Compatible con colisión a alta velocidad contra vehículo estacionado.',
    gravedad_tipica: 'muy_alta',
    compatible_con: ['atropello_vehiculo_estacionado']
  },
  impacto_trasero_y_frontal: {
    implicacion: 'Efecto sándwich - vehículo comprimido entre dos impactos. Típico de colisión en cadena.',
    gravedad_tipica: 'muy_alta',
    compatible_con: ['multiple_cadena']
  }
};

// ============================================================================
// FUNCIONES DEL AGENTE DE INVESTIGACIÓN
// ============================================================================

/**
 * Análisis completo de un accidente
 */
function analizarAccidente(siniestroId) {
  // Buscar en accidentes pre-analizados
  const existente = accidentesAnalizados.find(a => a.siniestroId === siniestroId);
  if (existente) {
    return _formatearAnalisisCompleto(existente);
  }

  // Si no existe, generar análisis genérico
  return _generarAnalisisGenerico(siniestroId);
}

/**
 * Genera informe legal de investigación
 */
function generarInforme(siniestroId) {
  const accidente = accidentesAnalizados.find(a => a.siniestroId === siniestroId);
  if (!accidente) {
    return {
      exito: false,
      mensaje: `No se encontró análisis previo para el siniestro ${siniestroId}. Ejecute analizarAccidente() primero.`
    };
  }

  const informe = {
    titulo: `INFORME DE INVESTIGACIÓN DE SINIESTRO`,
    expediente: siniestroId,
    fecha_emision: new Date().toISOString().split('T')[0],
    clasificacion: 'CONFIDENCIAL',

    seccion_1_datos_generales: {
      titulo: '1. DATOS GENERALES DEL SINIESTRO',
      fecha_accidente: accidente.fecha_accidente,
      hora: accidente.hora,
      ubicacion: accidente.ubicacion,
      tipo_colision: accidente.tipo_colision,
      numero_vehiculos: accidente.vehiculos.length
    },

    seccion_2_vehiculos: {
      titulo: '2. VEHÍCULOS IMPLICADOS',
      vehiculos: accidente.vehiculos.map(v => ({
        rol: v.rol,
        conductor: v.conductor,
        vehiculo: v.vehiculo,
        matricula: v.matricula,
        danios_descripcion: v.danios,
        patron_danio: v.patron_danio,
        analisis_patron: patronesDanio[v.patron_danio] || { implicacion: 'Patrón no catalogado' },
        lesiones: v.lesiones
      }))
    },

    seccion_3_condiciones: {
      titulo: '3. CONDICIONES EN EL MOMENTO DEL ACCIDENTE',
      meteorologia: {
        ...accidente.condiciones_meteorologicas,
        analisis: factoresMeteorologicos[accidente.condiciones_meteorologicas.tiempo] || factoresMeteorologicos.despejado
      },
      via: accidente.condiciones_via
    },

    seccion_4_declaraciones: {
      titulo: '4. ANÁLISIS DE DECLARACIONES',
      declaraciones: accidente.vehiculos.map(v => ({
        conductor: v.conductor,
        rol: v.rol,
        declaracion: v.declaracion
      })),
      contradicciones_detectadas: accidente.resultado.contradicciones
    },

    seccion_5_reconstruccion: {
      titulo: '5. RECONSTRUCCIÓN DEL ACCIDENTE',
      reconstruccion: accidente.resultado.reconstruccion,
      datos_telemetricos: accidente.telemetria,
      linea_temporal: _generarLineaTiempo(accidente)
    },

    seccion_6_culpabilidad: {
      titulo: '6. DETERMINACIÓN DE CULPABILIDAD',
      porcentajes: accidente.resultado.porcentaje_culpabilidad,
      justificacion: accidente.resultado.conclusion
    },

    seccion_7_evidencias: {
      titulo: '7. EVIDENCIAS ANALIZADAS',
      lista: accidente.evidencias,
      valoracion: accidente.evidencias.map(e => ({
        evidencia: e,
        peso_probatorio: _getPesoProbatorio(e)
      }))
    },

    seccion_8_conclusion: {
      titulo: '8. CONCLUSIÓN',
      texto: accidente.resultado.conclusion,
      recomendacion_subrogacion: accidente.resultado.porcentaje_culpabilidad.causante >= 50
        ? `Se recomienda iniciar subrogación por el ${accidente.resultado.porcentaje_culpabilidad.causante}% de los daños.`
        : 'No se recomienda subrogación - culpabilidad insuficiente del tercero.'
    },

    firma: {
      investigador: 'Departamento de Investigación - IA Seguros',
      fecha: new Date().toISOString().split('T')[0],
      nota: 'Informe generado mediante análisis automatizado. Sujeto a revisión por perito humano.'
    }
  };

  return { exito: true, informe };
}

/**
 * Obtiene todos los accidentes analizados
 */
function getAccidentesAnalizados() {
  return {
    total: accidentesAnalizados.length,
    accidentes: accidentesAnalizados.map(a => ({
      id: a.id,
      siniestroId: a.siniestroId,
      fecha: a.fecha_accidente,
      ubicacion: a.ubicacion,
      tipo: a.tipo_colision,
      vehiculos: a.vehiculos.length,
      culpabilidad_causante: a.resultado.porcentaje_culpabilidad.causante,
      contradicciones: a.resultado.contradicciones.length,
      conclusion_resumida: a.resultado.conclusion.substring(0, 100) + '...'
    }))
  };
}

// ============================================================================
// FUNCIONES INTERNAS
// ============================================================================

function _formatearAnalisisCompleto(accidente) {
  const lineaTiempo = _generarLineaTiempo(accidente);
  const analisisDanios = accidente.vehiculos.map(v => ({
    conductor: v.conductor,
    patron: v.patron_danio,
    analisis: patronesDanio[v.patron_danio] || { implicacion: 'No catalogado' },
    danios: v.danios
  }));
  const factorMeteo = factoresMeteorologicos[accidente.condiciones_meteorologicas.tiempo] || factoresMeteorologicos.despejado;

  return {
    exito: true,
    siniestroId: accidente.siniestroId,
    reconstruccion: accidente.resultado.reconstruccion,
    linea_tiempo: lineaTiempo,
    porcentaje_culpabilidad: accidente.resultado.porcentaje_culpabilidad,
    contradicciones: accidente.resultado.contradicciones,
    analisis_danios: analisisDanios,
    condiciones: {
      meteorologicas: {
        ...accidente.condiciones_meteorologicas,
        factor_riesgo: factorMeteo.factor_riesgo,
        analisis: factorMeteo.descripcion
      },
      via: accidente.condiciones_via
    },
    telemetria: accidente.telemetria,
    evidencias: accidente.evidencias,
    informe: accidente.resultado.conclusion,
    conclusion: accidente.resultado.conclusion,
    recomendacion: accidente.resultado.porcentaje_culpabilidad.causante >= 50
      ? 'Se recomienda iniciar proceso de subrogación'
      : 'No se recomienda subrogación'
  };
}

function _generarLineaTiempo(accidente) {
  const hora = accidente.hora;
  const [h, m] = hora.split(':').map(Number);

  const formatTime = (hh, mm) => `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;

  const eventos = [];

  // Antes del impacto
  eventos.push({
    fase: 'pre_accidente',
    timestamp: formatTime(h, Math.max(0, m - 5)),
    evento: 'Circulación normal de los vehículos implicados',
    detalle: accidente.vehiculos.map(v => `${v.conductor} (${v.vehiculo}) circulaba por la zona`).join('. ')
  });

  // Situación previa
  eventos.push({
    fase: 'pre_accidente',
    timestamp: formatTime(h, Math.max(0, m - 2)),
    evento: 'Situación de riesgo detectada',
    detalle: _getDescripcionPrevia(accidente)
  });

  // Momento del impacto
  eventos.push({
    fase: 'impacto',
    timestamp: formatTime(h, m),
    evento: 'IMPACTO',
    detalle: `Colisión tipo ${accidente.tipo_colision}. Velocidad estimada: ${accidente.telemetria.velocidad_impacto_estimada} km/h. ${accidente.telemetria.airbag_activado ? 'Airbag activado.' : 'Airbag no activado.'}`
  });

  // Inmediatamente después
  eventos.push({
    fase: 'post_accidente',
    timestamp: formatTime(h, m + 1),
    evento: 'Post-impacto inmediato',
    detalle: `Vehículos inmovilizados. ${accidente.vehiculos.filter(v => v.lesiones !== 'Sin lesiones' && v.lesiones !== 'N/A - vehículo estacionado').length} persona(s) con lesiones.`
  });

  // Llegada servicios
  eventos.push({
    fase: 'post_accidente',
    timestamp: formatTime(h, m + 12),
    evento: 'Llegada de servicios de emergencia',
    detalle: 'Policía Local / Guardia Civil en el lugar. Inicio de diligencias y toma de declaraciones.'
  });

  // Atestado
  eventos.push({
    fase: 'post_accidente',
    timestamp: formatTime(h, m + 45),
    evento: 'Finalización de diligencias',
    detalle: 'Atestado policial completado. Retirada de vehículos por grúa si procede.'
  });

  return eventos;
}

function _getDescripcionPrevia(accidente) {
  const tipo = accidente.tipo_colision;
  const causante = accidente.vehiculos.find(v => v.rol === 'causante');
  if (!causante) return 'Situación previa no determinable';

  const descripciones = {
    alcance_trasero: `${causante.conductor} se aproxima al vehículo precedente sin mantener distancia de seguridad`,
    frontal_parcial: `${causante.conductor} inicia maniobra de adelantamiento en zona no permitida`,
    lateral_perpendicular: `${causante.conductor} se aproxima a la intersección con señal de STOP`,
    lateral_incorporacion: `${causante.conductor} se aproxima al ceda el paso de la rotonda`,
    lateral_semaforo: `El semáforo cambia a rojo para ${causante.conductor}`,
    multiple_cadena: `Tráfico denso con retenciones. ${causante.conductor} se aproxima a velocidad excesiva`,
    atropello_vehiculo_estacionado: `${causante.conductor} circula a velocidad excesiva por zona residencial`,
    incorporacion_autovia: `${causante.conductor} circula por carril de aceleración preparando incorporación`
  };

  return descripciones[tipo] || `${causante.conductor} se aproxima al punto de colisión`;
}

function _getPesoProbatorio(evidencia) {
  const pesos = {
    atestado_policial: { peso: 'alto', descripcion: 'Documento público con presunción de veracidad' },
    video_camara_trafico: { peso: 'muy_alto', descripcion: 'Evidencia objetiva e irrefutable' },
    dashcam_testigo: { peso: 'muy_alto', descripcion: 'Grabación independiente del accidente' },
    registro_semaforo: { peso: 'muy_alto', descripcion: 'Registro electrónico oficial del ciclo semafórico' },
    grabacion_camara_comercio: { peso: 'alto', descripcion: 'Grabación de videovigilancia de establecimiento cercano' },
    test_alcoholemia_positivo: { peso: 'muy_alto', descripcion: 'Prueba de detección de alcohol con resultado positivo' },
    informe_perito: { peso: 'alto', descripcion: 'Valoración técnica profesional de daños y circunstancias' },
    informe_medico: { peso: 'alto', descripcion: 'Documentación médica de lesiones' },
    parte_amistoso: { peso: 'medio', descripcion: 'Declaración conjunta - puede contener admisión de culpabilidad' },
    fotos_danios: { peso: 'medio', descripcion: 'Evidencia visual del patrón y magnitud de daños' },
    fotos_accidente: { peso: 'medio', descripcion: 'Fotografías de la escena del accidente' },
    fotos_senalizacion: { peso: 'medio', descripcion: 'Documentación de señalización vial en el lugar' },
    croquis_accidente: { peso: 'medio', descripcion: 'Representación gráfica de la dinámica del accidente' },
    testimonio_testigos: { peso: 'medio', descripcion: 'Declaración de testigos presenciales' },
    testimonio_testigo: { peso: 'medio', descripcion: 'Declaración de testigo presencial' },
    datos_panel_variable: { peso: 'alto', descripcion: 'Registro de señalización variable activa' },
    denuncia: { peso: 'bajo', descripcion: 'Declaración unilateral del denunciante' },
    grabaciones_camaras: { peso: 'alto', descripcion: 'Grabaciones de videovigilancia' },
    factura_reparacion: { peso: 'medio', descripcion: 'Documentación de costes de reparación' },
    grabacion_semaforo: { peso: 'muy_alto', descripcion: 'Registro del ciclo semafórico' }
  };
  return pesos[evidencia] || { peso: 'bajo', descripcion: 'Evidencia no catalogada' };
}

function _generarAnalisisGenerico(siniestroId) {
  return {
    exito: true,
    siniestroId,
    reconstruccion: `Análisis preliminar del siniestro ${siniestroId}. Se requiere recopilación de evidencias para un análisis completo.`,
    linea_tiempo: [
      { fase: 'pre_accidente', timestamp: 'Por determinar', evento: 'Circulación previa', detalle: 'Pendiente de declaraciones' },
      { fase: 'impacto', timestamp: 'Por determinar', evento: 'IMPACTO', detalle: 'Pendiente de análisis pericial' },
      { fase: 'post_accidente', timestamp: 'Por determinar', evento: 'Post-impacto', detalle: 'Pendiente de diligencias' }
    ],
    porcentaje_culpabilidad: { victima: 'pendiente', causante: 'pendiente' },
    contradicciones: [],
    analisis_danios: [],
    condiciones: { meteorologicas: 'Por determinar', via: 'Por determinar' },
    telemetria: null,
    evidencias: [],
    informe: 'Análisis pendiente de completar. Se requieren evidencias.',
    conclusion: 'Insuficientes datos para emitir conclusión. Solicitar: atestado policial, fotografías de daños, declaraciones de ambas partes.',
    recomendacion: 'Recopilar evidencias antes de determinar viabilidad de subrogación'
  };
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

module.exports = {
  analizarAccidente,
  generarInforme,
  getAccidentesAnalizados,
  // Acceso directo a datos
  accidentesAnalizados,
  factoresMeteorologicos,
  patronesDanio
};
