const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'siniestros.db');

let db;

function getDb() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) console.error('Error abriendo DB:', err.message);
      else console.log('SQLite conectada:', DB_PATH);
    });
    db.run('PRAGMA journal_mode=WAL');
    db.run('PRAGMA foreign_keys=ON');
  }
  return db;
}

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function initDatabase() {
  const d = getDb();

  // Crear tablas
  await dbRun(`CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    rol TEXT NOT NULL CHECK(rol IN ('admin','gestor','perito')),
    activo INTEGER DEFAULT 1,
    creado_en TEXT DEFAULT (datetime('now')),
    ultimo_login TEXT
  )`);

  await dbRun(`CREATE TABLE IF NOT EXISTS clientes (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    email TEXT,
    dni TEXT,
    direccion TEXT,
    poliza TEXT UNIQUE,
    tipo_poliza TEXT,
    fecha_alta TEXT DEFAULT (datetime('now')),
    notas TEXT
  )`);

  await dbRun(`CREATE TABLE IF NOT EXISTS siniestros (
    id TEXT PRIMARY KEY,
    expediente TEXT UNIQUE NOT NULL,
    cliente_id TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('coche','hogar','salud','robo','otro')),
    descripcion TEXT NOT NULL,
    estado TEXT DEFAULT 'Abierto' CHECK(estado IN ('Abierto','En gestion','Perito asignado','Resuelto','Cerrado','Fraude')),
    urgencia INTEGER DEFAULT 5 CHECK(urgencia BETWEEN 1 AND 10),
    score_fraude INTEGER DEFAULT 0,
    direccion TEXT,
    lat REAL,
    lng REAL,
    zona TEXT,
    perito_id TEXT,
    ia_confianza INTEGER DEFAULT 85,
    ia_gestion TEXT DEFAULT 'full',
    ia_tiempo TEXT,
    humano_tiempo TEXT,
    valoracion REAL,
    indemnizacion REAL,
    fecha_creacion TEXT DEFAULT (datetime('now')),
    fecha_actualizacion TEXT DEFAULT (datetime('now')),
    fecha_cierre TEXT,
    FOREIGN KEY(cliente_id) REFERENCES clientes(id),
    FOREIGN KEY(perito_id) REFERENCES agentes(id)
  )`);

  await dbRun(`CREATE TABLE IF NOT EXISTS expedientes (
    id TEXT PRIMARY KEY,
    siniestro_id TEXT NOT NULL,
    tipo_evento TEXT NOT NULL,
    descripcion TEXT,
    usuario_id TEXT,
    datos_extra TEXT,
    fecha TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(siniestro_id) REFERENCES siniestros(id)
  )`);

  await dbRun(`CREATE TABLE IF NOT EXISTS agentes (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('perito','grua','legal','medico')),
    especialidad TEXT,
    telefono TEXT,
    email TEXT,
    zona TEXT,
    disponible INTEGER DEFAULT 1,
    valoracion REAL DEFAULT 4.5,
    expedientes_total INTEGER DEFAULT 0,
    tiempo_medio_dias REAL DEFAULT 4.0,
    creado_en TEXT DEFAULT (datetime('now'))
  )`);

  await dbRun(`CREATE TABLE IF NOT EXISTS llamadas (
    id TEXT PRIMARY KEY,
    siniestro_id TEXT,
    cliente_id TEXT,
    telefono_origen TEXT,
    telefono_destino TEXT,
    duracion_seg INTEGER DEFAULT 0,
    tipo TEXT CHECK(tipo IN ('entrante','saliente','ia')),
    transcripcion TEXT,
    resumen_ia TEXT,
    sentimiento TEXT,
    estado TEXT DEFAULT 'completada',
    fecha TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(siniestro_id) REFERENCES siniestros(id),
    FOREIGN KEY(cliente_id) REFERENCES clientes(id)
  )`);

  await dbRun(`CREATE TABLE IF NOT EXISTS mensajes_whatsapp (
    id TEXT PRIMARY KEY,
    siniestro_id TEXT,
    cliente_id TEXT,
    telefono TEXT,
    direccion TEXT CHECK(direccion IN ('entrante','saliente')),
    contenido TEXT NOT NULL,
    tipo_contenido TEXT DEFAULT 'texto' CHECK(tipo_contenido IN ('texto','imagen','documento','ubicacion')),
    estado TEXT DEFAULT 'enviado',
    respuesta_ia TEXT,
    fecha TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(siniestro_id) REFERENCES siniestros(id),
    FOREIGN KEY(cliente_id) REFERENCES clientes(id)
  )`);

  await dbRun(`CREATE TABLE IF NOT EXISTS documentos (
    id TEXT PRIMARY KEY,
    siniestro_id TEXT NOT NULL,
    nombre TEXT NOT NULL,
    tipo TEXT,
    tamano TEXT,
    ruta TEXT,
    analisis_ia TEXT,
    fecha TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(siniestro_id) REFERENCES siniestros(id)
  )`);

  console.log('Tablas creadas correctamente');
}

async function seedDatabase() {
  const count = await dbGet('SELECT COUNT(*) as c FROM clientes');
  if (count && count.c > 0) {
    console.log('Base de datos ya tiene datos, omitiendo seed');
    return;
  }

  console.log('Insertando datos de ejemplo...');
  const passHash = await bcrypt.hash('admin123', 10);

  // Usuarios
  const usuarios = [
    { id: uuidv4(), nombre: 'Ana Martinez', email: 'ana@siniestrosai.com', password: passHash, rol: 'admin' },
    { id: uuidv4(), nombre: 'Roberto Diaz', email: 'roberto@siniestrosai.com', password: passHash, rol: 'gestor' },
    { id: uuidv4(), nombre: 'Laura Vega', email: 'laura@siniestrosai.com', password: passHash, rol: 'perito' },
  ];
  for (const u of usuarios) {
    await dbRun('INSERT INTO usuarios (id,nombre,email,password,rol) VALUES (?,?,?,?,?)', [u.id, u.nombre, u.email, u.password, u.rol]);
  }

  // Clientes (15)
  const clientes = [
    { id: 'CLI-001', nombre: 'Maria Garcia Lopez', telefono: '612345678', email: 'maria.garcia@email.com', dni: '12345678A', direccion: 'Calle Gran Via 42, Madrid', poliza: 'POL-2024-00456', tipo_poliza: 'Todo riesgo' },
    { id: 'CLI-002', nombre: 'Carlos Fernandez Ruiz', telefono: '634567890', email: 'carlos@email.com', dni: '23456789B', direccion: 'Calle Aragon 234, Barcelona', poliza: 'POL-2024-00312', tipo_poliza: 'Hogar Plus' },
    { id: 'CLI-003', nombre: 'Laura Mendez Torres', telefono: '678901234', email: 'laura@email.com', dni: '34567890C', direccion: 'Av. del Puerto 89, Valencia', poliza: 'POL-2024-00289', tipo_poliza: 'Comercio' },
    { id: 'CLI-004', nombre: 'Pedro Alvarez Gomez', telefono: '645678901', email: 'pedro@email.com', dni: '45678901D', direccion: 'Calle Serrano 15, Madrid', poliza: 'POL-2024-00178', tipo_poliza: 'Salud Premium' },
    { id: 'CLI-005', nombre: 'Sofia Rodriguez Blanco', telefono: '623456789', email: 'sofia@email.com', dni: '56789012E', direccion: 'Paseo Independencia 33, Zaragoza', poliza: 'POL-2024-00567', tipo_poliza: 'Auto basico' },
    { id: 'CLI-006', nombre: 'Antonio Navarro Gil', telefono: '656789012', email: 'antonio@email.com', dni: '67890123F', direccion: 'Calle Betis 56, Sevilla', poliza: 'POL-2024-00890', tipo_poliza: 'Hogar basico' },
    { id: 'CLI-007', nombre: 'Isabel Moreno Diaz', telefono: '667890123', email: 'isabel@email.com', dni: '78901234G', direccion: 'Av. Andalucia 15, Malaga', poliza: 'POL-2024-00445', tipo_poliza: 'Auto terceros' },
    { id: 'CLI-008', nombre: 'Francisco Herrera Ruiz', telefono: '689012345', email: 'fran@email.com', dni: '89012345H', direccion: 'Gran Via 78, Bilbao', poliza: 'POL-2024-00678', tipo_poliza: 'Hogar Plus' },
    { id: 'CLI-009', nombre: 'Carmen Vega Sanz', telefono: '698123456', email: 'carmen@email.com', dni: '90123456J', direccion: 'Calle Alcala 120, Madrid', poliza: 'POL-2024-00234', tipo_poliza: 'Todo riesgo' },
    { id: 'CLI-010', nombre: 'Javier Romero Pena', telefono: '611223344', email: 'javier.romero@email.com', dni: '01234567K', direccion: 'Rambla Catalunya 55, Barcelona', poliza: 'POL-2024-00777', tipo_poliza: 'Auto Premium' },
    { id: 'CLI-011', nombre: 'Elena Torres Vidal', telefono: '622334455', email: 'elena.torres@email.com', dni: '11234567L', direccion: 'Calle Colon 30, Valencia', poliza: 'POL-2024-00888', tipo_poliza: 'Hogar basico' },
    { id: 'CLI-012', nombre: 'Miguel Angel Soto', telefono: '633445566', email: 'miguel.soto@email.com', dni: '21234567M', direccion: 'Av. Constitucion 8, Sevilla', poliza: 'POL-2024-00999', tipo_poliza: 'Salud basico' },
    { id: 'CLI-013', nombre: 'Raquel Gimenez Ortiz', telefono: '644556677', email: 'raquel@email.com', dni: '31234567N', direccion: 'Calle Mayor 12, Murcia', poliza: 'POL-2024-01010', tipo_poliza: 'Hogar Plus' },
    { id: 'CLI-014', nombre: 'Pablo Sanchez Martin', telefono: '655667788', email: 'pablo.sanchez@email.com', dni: '41234567P', direccion: 'Paseo de Gracia 100, Barcelona', poliza: 'POL-2024-01111', tipo_poliza: 'Todo riesgo' },
    { id: 'CLI-015', nombre: 'Lucia Fernandez Ramos', telefono: '666778899', email: 'lucia.f@email.com', dni: '51234567Q', direccion: 'Calle Larios 5, Malaga', poliza: 'POL-2024-01212', tipo_poliza: 'Auto terceros' },
  ];
  for (const c of clientes) {
    await dbRun('INSERT INTO clientes (id,nombre,telefono,email,dni,direccion,poliza,tipo_poliza) VALUES (?,?,?,?,?,?,?,?)',
      [c.id, c.nombre, c.telefono, c.email, c.dni, c.direccion, c.poliza, c.tipo_poliza]);
  }

  // Agentes/Peritos
  const agentes = [
    { id: 'AGT-001', nombre: 'Carlos Ruiz Martinez', tipo: 'perito', especialidad: 'Auto, Hogar', telefono: '611000001', email: 'cruiz@peritos.com', zona: 'Madrid', valoracion: 4.9, expedientes_total: 87, tiempo_medio_dias: 3.1 },
    { id: 'AGT-002', nombre: 'Elena Torres Vidal', tipo: 'perito', especialidad: 'Hogar, Salud', telefono: '611000002', email: 'etorres@peritos.com', zona: 'Barcelona', valoracion: 4.8, expedientes_total: 72, tiempo_medio_dias: 3.4 },
    { id: 'AGT-003', nombre: 'Miguel Angel Fernandez', tipo: 'perito', especialidad: 'Auto', telefono: '611000003', email: 'mfernandez@peritos.com', zona: 'Sevilla', valoracion: 4.7, expedientes_total: 65, tiempo_medio_dias: 3.8 },
    { id: 'AGT-004', nombre: 'Laura Sanchez Gil', tipo: 'perito', especialidad: 'Robo, Hogar', telefono: '611000004', email: 'lsanchez@peritos.com', zona: 'Valencia', valoracion: 4.6, expedientes_total: 58, tiempo_medio_dias: 4.0 },
    { id: 'AGT-005', nombre: 'Pedro Jimenez Ruiz', tipo: 'perito', especialidad: 'Todos', telefono: '611000005', email: 'pjimenez@peritos.com', zona: 'Bilbao', valoracion: 4.5, expedientes_total: 51, tiempo_medio_dias: 4.2 },
    { id: 'AGT-006', nombre: 'Gruas Madrid 24h', tipo: 'grua', especialidad: 'Vehiculos', telefono: '900111222', email: 'gruas@madrid24h.com', zona: 'Madrid', valoracion: 4.3, expedientes_total: 120, tiempo_medio_dias: 0.1 },
    { id: 'AGT-007', nombre: 'Dr. Alicia Moreno', tipo: 'medico', especialidad: 'Traumatologia', telefono: '611000007', email: 'amoreno@clinica.com', zona: 'Madrid', valoracion: 4.9, expedientes_total: 40, tiempo_medio_dias: 2.0 },
  ];
  for (const a of agentes) {
    await dbRun('INSERT INTO agentes (id,nombre,tipo,especialidad,telefono,email,zona,valoracion,expedientes_total,tiempo_medio_dias) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [a.id, a.nombre, a.tipo, a.especialidad, a.telefono, a.email, a.zona, a.valoracion, a.expedientes_total, a.tiempo_medio_dias]);
  }

  // Siniestros (15)
  const siniestros = [
    { id: 'SIN-001', exp: 'EXP-2024-0891', cli: 'CLI-001', tipo: 'coche', desc: 'Colision frontal en M-30 salida 7. Airbags activados. Vehiculo no arranca.', estado: 'Abierto', urgencia: 9, fraude: 12, dir: 'M-30 km 7.2, Madrid', lat: 40.4168, lng: -3.7038, zona: 'Madrid', perito: null, ia_conf: 94, ia_gest: 'full', ia_t: '1.8 min', hum_t: '22 min' },
    { id: 'SIN-002', exp: 'EXP-2024-0890', cli: 'CLI-002', tipo: 'hogar', desc: 'Inundacion planta baja por rotura de tuberia principal. Danos en parquet y muebles.', estado: 'En gestion', urgencia: 7, fraude: 8, dir: 'Calle Aragon 234, Barcelona', lat: 41.3851, lng: 2.1734, zona: 'Barcelona', perito: 'AGT-002', ia_conf: 91, ia_gest: 'full', ia_t: '2.1 min', hum_t: '19 min' },
    { id: 'SIN-003', exp: 'EXP-2024-0889', cli: 'CLI-003', tipo: 'robo', desc: 'Robo con fuerza en local comercial. Puerta forzada, caja registradora vaciada.', estado: 'Perito asignado', urgencia: 8, fraude: 45, dir: 'Av. del Puerto 89, Valencia', lat: 39.4699, lng: -0.3763, zona: 'Valencia', perito: 'AGT-004', ia_conf: 72, ia_gest: 'partial', ia_t: '3.2 min', hum_t: '25 min' },
    { id: 'SIN-004', exp: 'EXP-2024-0888', cli: 'CLI-004', tipo: 'salud', desc: 'Apendicitis aguda. Intervencion quirurgica de urgencia en Hospital La Paz.', estado: 'En gestion', urgencia: 10, fraude: 3, dir: 'Hospital La Paz, Madrid', lat: 40.4815, lng: -3.6872, zona: 'Madrid', perito: null, ia_conf: 98, ia_gest: 'full', ia_t: '0.8 min', hum_t: '15 min' },
    { id: 'SIN-005', exp: 'EXP-2024-0887', cli: 'CLI-005', tipo: 'coche', desc: 'Danos por granizo severo. Abolladuras en techo, capo y puertas laterales.', estado: 'Perito asignado', urgencia: 4, fraude: 5, dir: 'CC Augusta, Zaragoza', lat: 41.6488, lng: -0.8891, zona: 'Zaragoza', perito: 'AGT-001', ia_conf: 96, ia_gest: 'full', ia_t: '1.5 min', hum_t: '20 min' },
    { id: 'SIN-006', exp: 'EXP-2024-0886', cli: 'CLI-006', tipo: 'hogar', desc: 'Incendio en cocina por cortocircuito en campana extractora. Danos importantes.', estado: 'Resuelto', urgencia: 9, fraude: 15, dir: 'Calle Betis 56, Sevilla', lat: 37.3886, lng: -5.9823, zona: 'Sevilla', perito: 'AGT-003', ia_conf: 88, ia_gest: 'full', ia_t: '2.4 min', hum_t: '28 min', indem: 23500 },
    { id: 'SIN-007', exp: 'EXP-2024-0885', cli: 'CLI-007', tipo: 'coche', desc: 'Alcance trasero en semaforo. Paragolpes y piloto trasero danados.', estado: 'Resuelto', urgencia: 3, fraude: 7, dir: 'Av. Andalucia 15, Malaga', lat: 36.7213, lng: -4.4214, zona: 'Malaga', perito: 'AGT-001', ia_conf: 97, ia_gest: 'full', ia_t: '1.1 min', hum_t: '18 min', indem: 1850 },
    { id: 'SIN-008', exp: 'EXP-2024-0884', cli: 'CLI-008', tipo: 'otro', desc: 'Responsabilidad civil por filtracion de agua al vecino de abajo. Danos en techo.', estado: 'En gestion', urgencia: 5, fraude: 10, dir: 'Gran Via 78, Bilbao', lat: 43.2630, lng: -2.9350, zona: 'Bilbao', perito: null, ia_conf: 85, ia_gest: 'full', ia_t: '2.0 min', hum_t: '17 min' },
    { id: 'SIN-009', exp: 'EXP-2024-0883', cli: 'CLI-009', tipo: 'robo', desc: 'Robo de BMW Serie 3 en parking subterraneo del CC La Vaguada.', estado: 'Abierto', urgencia: 8, fraude: 68, dir: 'CC La Vaguada, Madrid', lat: 40.4797, lng: -3.7100, zona: 'Madrid', perito: null, ia_conf: 61, ia_gest: 'partial', ia_t: '4.1 min', hum_t: '30 min' },
    { id: 'SIN-010', exp: 'EXP-2024-0882', cli: 'CLI-010', tipo: 'coche', desc: 'Colision lateral en rotonda. Puerta del conductor bloqueada.', estado: 'Abierto', urgencia: 7, fraude: 10, dir: 'Ronda Universitat, Barcelona', lat: 41.3870, lng: 2.1680, zona: 'Barcelona', perito: null, ia_conf: 92, ia_gest: 'full', ia_t: '1.6 min', hum_t: '21 min' },
    { id: 'SIN-011', exp: 'EXP-2024-0881', cli: 'CLI-011', tipo: 'hogar', desc: 'Rotura de cristal del salon por tormenta. Lluvia entro en el interior.', estado: 'Perito asignado', urgencia: 6, fraude: 4, dir: 'Calle Colon 30, Valencia', lat: 39.4700, lng: -0.3750, zona: 'Valencia', perito: 'AGT-004', ia_conf: 95, ia_gest: 'full', ia_t: '1.3 min', hum_t: '16 min' },
    { id: 'SIN-012', exp: 'EXP-2024-0880', cli: 'CLI-012', tipo: 'salud', desc: 'Fractura de muneca tras caida en via publica. Atencion en urgencias.', estado: 'Resuelto', urgencia: 6, fraude: 2, dir: 'Hospital Virgen del Rocio, Sevilla', lat: 37.3620, lng: -5.9780, zona: 'Sevilla', perito: null, ia_conf: 99, ia_gest: 'full', ia_t: '0.7 min', hum_t: '14 min', indem: 2200 },
    { id: 'SIN-013', exp: 'EXP-2024-0879', cli: 'CLI-013', tipo: 'hogar', desc: 'Danos por humedad en pared medianera. Aparicion de moho en dormitorio.', estado: 'En gestion', urgencia: 4, fraude: 6, dir: 'Calle Mayor 12, Murcia', lat: 37.9838, lng: -1.1300, zona: 'Murcia', perito: 'AGT-002', ia_conf: 90, ia_gest: 'full', ia_t: '1.9 min', hum_t: '18 min' },
    { id: 'SIN-014', exp: 'EXP-2024-0878', cli: 'CLI-014', tipo: 'coche', desc: 'Accidente multiple en autopista AP-7. Tres vehiculos implicados.', estado: 'Abierto', urgencia: 10, fraude: 8, dir: 'AP-7 km 150, Barcelona', lat: 41.3500, lng: 2.0900, zona: 'Barcelona', perito: null, ia_conf: 87, ia_gest: 'full', ia_t: '2.2 min', hum_t: '35 min' },
    { id: 'SIN-015', exp: 'EXP-2024-0877', cli: 'CLI-015', tipo: 'robo', desc: 'Robo de bicicleta electrica en portal del edificio. Candado cortado.', estado: 'Resuelto', urgencia: 3, fraude: 20, dir: 'Calle Larios 5, Malaga', lat: 36.7200, lng: -4.4200, zona: 'Malaga', perito: null, ia_conf: 93, ia_gest: 'full', ia_t: '1.0 min', hum_t: '12 min', indem: 1500 },
  ];
  for (const s of siniestros) {
    await dbRun(`INSERT INTO siniestros (id,expediente,cliente_id,tipo,descripcion,estado,urgencia,score_fraude,direccion,lat,lng,zona,perito_id,ia_confianza,ia_gestion,ia_tiempo,humano_tiempo,indemnizacion)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [s.id, s.exp, s.cli, s.tipo, s.desc, s.estado, s.urgencia, s.fraude, s.dir, s.lat, s.lng, s.zona, s.perito, s.ia_conf, s.ia_gest, s.ia_t, s.hum_t, s.indem || null]);
  }

  // Llamadas de ejemplo
  const llamadas = [
    { id: uuidv4(), sin: 'SIN-001', cli: 'CLI-001', tel_o: '612345678', tel_d: '+34900100200', dur: 102, tipo: 'ia', trans: 'Cliente reporta colision frontal en M-30. Airbags activados. Sin heridos.', resumen: 'Accidente trafico M-30, vehiculo inmovilizado, grua solicitada', sent: 'urgente' },
    { id: uuidv4(), sin: 'SIN-004', cli: 'CLI-004', tel_o: '645678901', tel_d: '+34900100200', dur: 48, tipo: 'ia', trans: 'Cliente con apendicitis aguda ingresado en La Paz. Solicita cobertura.', resumen: 'Urgencia medica, cobertura salud verificada y autorizada', sent: 'preocupado' },
    { id: uuidv4(), sin: 'SIN-009', cli: 'CLI-009', tel_o: '698123456', tel_d: '+34900100200', dur: 180, tipo: 'entrante', trans: 'Cliente denuncia robo de vehiculo BMW. Sospecha fraude elevada.', resumen: 'Robo vehiculo premium, score fraude alto, requiere investigacion', sent: 'nervioso' },
  ];
  for (const l of llamadas) {
    await dbRun('INSERT INTO llamadas (id,siniestro_id,cliente_id,telefono_origen,telefono_destino,duracion_seg,tipo,transcripcion,resumen_ia,sentimiento) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [l.id, l.sin, l.cli, l.tel_o, l.tel_d, l.dur, l.tipo, l.trans, l.resumen, l.sent]);
  }

  // Mensajes WhatsApp
  const mensajes = [
    { id: uuidv4(), sin: 'SIN-002', cli: 'CLI-002', tel: '634567890', dir: 'entrante', cont: 'Hola, se me ha roto una tuberia y hay agua por todo el salon', resp: 'He abierto un parte por inundacion. Un perito le visitara manana entre 9:00 y 12:00.' },
    { id: uuidv4(), sin: 'SIN-002', cli: 'CLI-002', tel: '634567890', dir: 'entrante', cont: 'Aqui envio fotos de los danos', tipo_cont: 'imagen', resp: 'Fotos recibidas y analizadas. Estimacion preliminar: 4.200-5.800 EUR.' },
    { id: uuidv4(), sin: 'SIN-011', cli: 'CLI-011', tel: '622334455', dir: 'entrante', cont: 'Se ha roto el cristal del salon con la tormenta', resp: 'Parte abierto por rotura de cristal. Perito asignado. Le mantendremos informado.' },
    { id: uuidv4(), sin: 'SIN-013', cli: 'CLI-013', tel: '644556677', dir: 'entrante', cont: 'Tengo humedad y moho en la pared del dormitorio', resp: 'He registrado el siniestro por humedad. Un perito especializado le contactara en 24h.' },
  ];
  for (const m of mensajes) {
    await dbRun('INSERT INTO mensajes_whatsapp (id,siniestro_id,cliente_id,telefono,direccion,contenido,tipo_contenido,respuesta_ia) VALUES (?,?,?,?,?,?,?,?)',
      [m.id, m.sin, m.cli, m.tel, m.dir, m.cont, m.tipo_cont || 'texto', m.resp]);
  }

  // Expedientes/Timeline
  const eventos = [
    { id: uuidv4(), sin: 'SIN-001', tipo: 'creacion', desc: 'Siniestro registrado automaticamente por IA' },
    { id: uuidv4(), sin: 'SIN-001', tipo: 'grua', desc: 'Grua solicitada - ETA 12 min' },
    { id: uuidv4(), sin: 'SIN-002', tipo: 'creacion', desc: 'Parte abierto via WhatsApp' },
    { id: uuidv4(), sin: 'SIN-002', tipo: 'perito', desc: 'Perito Elena Torres asignado' },
    { id: uuidv4(), sin: 'SIN-006', tipo: 'cierre', desc: 'Expediente cerrado. Indemnizacion: 23.500 EUR' },
    { id: uuidv4(), sin: 'SIN-009', tipo: 'fraude', desc: 'Alerta anti-fraude: score 68/100' },
    { id: uuidv4(), sin: 'SIN-014', tipo: 'creacion', desc: 'Accidente multiple registrado. Urgencia maxima.' },
  ];
  for (const e of eventos) {
    await dbRun('INSERT INTO expedientes (id,siniestro_id,tipo_evento,descripcion) VALUES (?,?,?,?)',
      [e.id, e.sin, e.tipo, e.desc]);
  }

  console.log('Datos de ejemplo insertados: 15 clientes, 15 siniestros, 7 agentes, llamadas y mensajes');
}

module.exports = { getDb, dbRun, dbAll, dbGet, initDatabase, seedDatabase };
