const crypto = require('crypto');

/**
 * Genera número de expediente único: SIN-2024-AUTO-XXXXX
 */
function generarNumeroExpediente(tipo) {
  const year = new Date().getFullYear();
  const ramo = tipo.startsWith('auto') ? 'AUT' : tipo.startsWith('negocio') ? 'NEG' : 'GEN';
  const random = crypto.randomInt(10000, 99999);
  return `SIN-${year}-${ramo}-${random}`;
}

/**
 * Sanitizar input para prevenir XSS/injection
 */
function sanitizar(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>'"&]/g, (c) => ({
    '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;', '&': '&amp;'
  }[c]));
}

/**
 * Paginar resultados
 */
function paginar(query, page = 1, limit = 20) {
  const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
  return query.limit(parseInt(limit)).offset(offset);
}

/**
 * Formatear respuesta paginada
 */
function respuestaPaginada(datos, total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  return {
    data: datos,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      total_pages: totalPages,
      has_next: parseInt(page) < totalPages,
      has_prev: parseInt(page) > 1
    }
  };
}

/**
 * Encriptar datos sensibles (RGPD)
 */
function encriptarDato(texto) {
  if (!texto || !process.env.ENCRYPTION_KEY) return texto;
  const key = Buffer.from(process.env.ENCRYPTION_KEY.padEnd(32).slice(0, 32));
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(texto, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function desencriptarDato(textoEncriptado) {
  if (!textoEncriptado || !process.env.ENCRYPTION_KEY || !textoEncriptado.includes(':')) return textoEncriptado;
  const key = Buffer.from(process.env.ENCRYPTION_KEY.padEnd(32).slice(0, 32));
  const [ivHex, encrypted] = textoEncriptado.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = { generarNumeroExpediente, sanitizar, paginar, respuestaPaginada, encriptarDato, desencriptarDato };
