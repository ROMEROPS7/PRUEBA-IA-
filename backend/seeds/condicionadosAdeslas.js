// =============================================================================
// Seed: Condicionados SegurCaixa Adeslas
// Inserta las condiciones generales y particulares de cada producto
// en el wiki interno para consulta por agentes IA y humanos.
// =============================================================================

const wikiService = require('../services/wikiService');

// Utilidad para comprobar si una nota ya existe por titulo
async function notaExiste(titulo) {
  try {
    const resultados = await wikiService.buscar(titulo);
    return resultados.some(
      (n) => n.titulo && n.titulo.toLowerCase() === titulo.toLowerCase()
    );
  } catch {
    return false;
  }
}

// =============================================================================
// DEFINICION DE NOTAS
// =============================================================================

const NOTAS_CONDICIONADOS = [
  // =========================================================================
  // AUTO (8 notas)
  // =========================================================================
  {
    titulo: 'Condicionado Auto - Terceros Basico',
    categoria: 'condicionado',
    tags: 'auto,terceros,basico,RC,asistencia,seguro obligatorio,adeslas',
    autor: 'departamento-producto',
    contenido: `Producto: Seguro de Automovil - Terceros Basico
Nivel: Basico
Compania: SegurCaixa Adeslas
Prima desde: 195 EUR/ano
Franquicia: No aplicable (solo RC)

COBERTURAS INCLUIDAS:
1. Responsabilidad Civil Obligatoria: hasta 50.000.000 EUR por siniestro, conforme al Real Decreto Legislativo 8/2004. Cubre danos corporales y materiales causados a terceros con el vehiculo asegurado en circulacion.
2. Responsabilidad Civil Voluntaria: ampliacion hasta 50.000.000 EUR por encima de la cobertura obligatoria, incluyendo danos materiales y corporales no cubiertos por el seguro obligatorio.
3. Defensa Juridica: cobertura de honorarios de abogado y procurador hasta 3.000 EUR para la defensa penal del conductor en procedimientos judiciales derivados de accidente de circulacion.
4. Reclamacion de Danos: gestion y cobertura de gastos legales hasta 3.000 EUR para reclamar al tercero responsable de un accidente los danos sufridos por el asegurado.
5. Asistencia en Carretera: servicio 24 horas para averias y accidentes a mas de 25 km del domicilio habitual. Incluye remolque del vehiculo al taller mas cercano, traslado de ocupantes (hasta 5 personas), estancia hotelera (1 noche, maximo 60 EUR por persona) si la reparacion supera 24 horas.
6. Accidentes del Conductor: indemnizacion por fallecimiento (18.000 EUR) e invalidez permanente (18.000 EUR) del conductor del vehiculo asegurado.

EXCLUSIONES PRINCIPALES:
1. Conduccion bajo influencia de alcohol (tasa superior a 0,25 mg/l en aire espirado) o drogas. Art. 10 LCS.
2. Participacion en competiciones, carreras, rallies o pruebas de velocidad, oficiales o no.
3. Uso del vehiculo para actividad profesional no declarada en poliza (taxi, VTC, transporte de mercancias).
4. Conduccion sin permiso de conducir valido y en vigor para la categoria del vehiculo.
5. Danos intencionados o dolosos causados por el propio asegurado.
6. Hechos derivados de guerra, terrorismo, riesgos nucleares o catastrofes extraordinarias (cubiertos por CCS).
7. Vehiculos no aptos para circular segun ITV o sin matriculacion.

DOCUMENTACION NECESARIA:
- Permiso de circulacion del vehiculo
- Ficha tecnica / ITV en vigor
- Permiso de conducir del conductor habitual
- Datos del vehiculo: marca, modelo, matricula, fecha primera matriculacion, km anuales estimados
- Declaracion de siniestralidad previa (ultimos 5 anos)

PLAZOS:
- Comunicacion del siniestro: 7 dias habiles desde el conocimiento del hecho (Art. 16 LCS)
- Resolucion: 40 dias maximos desde comunicacion
- Pago tras acuerdo: 5 dias habiles

ASISTENCIA EN CARRETERA - DETALLE:
- Numero de contacto: 900 200 200 (24h, 365 dias)
- Limite de 25 km: dentro del radio de 25 km del domicilio, se aplica copago de 45 EUR por servicio de grua
- Vehiculo de sustitucion: NO incluido en este nivel
- Averias cubiertas: mecanicas, electricas, pinchazo, falta de combustible, perdida de llaves
- Averias excluidas: falta de mantenimiento demostrable, neumaticos en mal estado, bateria con mas de 5 anos

Ver tambien: [[Exclusiones Auto]], [[Franquicias Auto]], [[Procedimiento apertura siniestro auto]], [[Documentacion requerida auto]]`
  },

  {
    titulo: 'Condicionado Auto - Terceros Ampliado',
    categoria: 'condicionado',
    tags: 'auto,terceros,ampliado,lunas,robo,incendio,adeslas',
    autor: 'departamento-producto',
    contenido: `Producto: Seguro de Automovil - Terceros Ampliado
Nivel: Ampliado
Compania: SegurCaixa Adeslas
Prima desde: 285 EUR/ano
Franquicia: Variable segun cobertura (ver detalle)

COBERTURAS INCLUIDAS:
Incluye todas las coberturas del nivel Basico (ver [[Condicionado Auto - Terceros Basico]]) y ademas:

1. Rotura de Lunas: cobertura completa de parabrisas delantero, trasero, luneta y ventanillas laterales. SIN franquicia. Incluye calibracion de sensores ADAS (sistemas avanzados de asistencia a la conduccion) hasta 300 EUR. Lunas originales del fabricante siempre que esten disponibles; en caso contrario, lunas homologadas de calidad equivalente. Maximo 2 sustituciones por anualidad.
2. Robo e Incendio del Vehiculo: cobertura del valor venal del vehiculo en caso de robo total consumado (transcurridos 30 dias sin recuperacion). En caso de recuperacion con danos, se cubren los danos materiales hasta el valor venal. Incendio: danos al vehiculo por combustion espontanea, cortocircuito o fuego externo. Franquicia: 150 EUR para incendio, sin franquicia para robo total.
3. Fenomenos Atmosfericos: danos causados por pedrisco, inundacion, viento huracanado (velocidad superior a 96 km/h), caida de rayos y nieve. Franquicia: 150 EUR por siniestro. Se requiere certificado de AEMET o informe de Proteccion Civil para acreditar el fenomeno en la zona y fecha del siniestro.
4. Incendio del vehiculo: cobertura total de danos producidos por incendio, explosion o caida de rayo. Incluye danos al sistema electrico y electronico. Se excluyen danos por cortocircuito en vehiculos con mas de 15 anos de antiguedad sin revision electrica acreditada.
5. Actos vandalicos: danos materiales al vehiculo causados por accion directa de terceros identificados o no. Requiere denuncia policial. Franquicia: 150 EUR.

EXCLUSIONES PRINCIPALES ADICIONALES:
1. Robo: no cubre accesorios o efectos personales del interior del vehiculo salvo que esten atornillados o empotrados de fabrica.
2. Robo: no se cubre si el vehiculo se dejo abierto o con las llaves puestas (negligencia grave).
3. Lunas: no cubre desperfectos esteticos menores que no afecten a la vision ni a la seguridad (menos de 2 cm de diametro fuera del campo visual del conductor, salvo peticion expresa del asegurado).
4. Fenomenos atmosfericos: no cubre danos por inundacion si el vehiculo estaba estacionado en zona inundable conocida con alerta roja activa y el asegurado no tomo medidas razonables de proteccion.

DOCUMENTACION NECESARIA:
- Toda la documentacion del nivel Basico
- Para robo: denuncia policial (Comisaria o Guardia Civil) en las 24 horas siguientes al descubrimiento
- Para incendio: informe de bomberos si intervienen
- Para fenomenos atmosfericos: certificado AEMET de la zona y fecha
- Fotografias del vehiculo danado (minimo 4 angulos)

PLAZOS:
- Comunicacion del siniestro: 7 dias habiles (Art. 16 LCS), 24 horas para robo
- Peritacion: maximo 5 dias habiles desde comunicacion
- Resolucion: 40 dias desde comunicacion

Ver tambien: [[Condicionado Auto - Terceros Basico]], [[Exclusiones Auto]], [[Franquicias Auto]], [[Documentacion requerida auto]]`
  },

  {
    titulo: 'Condicionado Auto - Todo Riesgo con Franquicia',
    categoria: 'condicionado',
    tags: 'auto,todo riesgo,franquicia,colision,danos propios,adeslas',
    autor: 'departamento-producto',
    contenido: `Producto: Seguro de Automovil - Todo Riesgo con Franquicia
Nivel: Premium con Franquicia
Compania: SegurCaixa Adeslas
Prima desde: 420 EUR/ano
Franquicia: 300 EUR por siniestro (danos propios)

COBERTURAS INCLUIDAS:
Incluye todas las coberturas del nivel Terceros Ampliado (ver [[Condicionado Auto - Terceros Ampliado]]) y ademas:

1. Danos Propios por Colision: reparacion o indemnizacion del vehiculo asegurado cuando sufra danos materiales por colision con otro vehiculo, objeto fijo o movil, o animal. Franquicia de 300 EUR por siniestro. Se aplica sobre el coste total de reparacion, IVA incluido. Si el coste de reparacion es inferior a la franquicia, no se genera indemnizacion.
2. Vuelco: danos al vehiculo producidos por vuelco o caida por desnivel, incluyendo los causados por el desplazamiento de la carga transportada. Franquicia de 300 EUR.
3. Salida de Via: danos derivados de la salida involuntaria del vehiculo de la calzada o vial de circulacion. Incluye danos producidos por el impacto con elementos fuera de la calzada (arboles, senales, cunetas, muros). Franquicia de 300 EUR.
4. Danos por Animales: colision con animales en la calzada (fauna silvestre o domestica). Se requiere parte de accidente o atestado que acredite la colision. Franquicia de 300 EUR.
5. Danos por Aparcamiento: impactos sufridos estando el vehiculo estacionado por vehiculo o agente no identificado. Franquicia de 300 EUR. Se requiere denuncia policial si no hay parte contrario.

CALCULO DE INDEMNIZACION EN CASO DE SINIESTRO TOTAL:
- El vehiculo se considera siniestro total cuando el coste de reparacion supere el 100% de su valor venal.
- Valor venal: se determina segun tablas Ganvam/Eurotax del mes del siniestro, ajustado por estado de conservacion, kilometraje y equipamiento.
- Indemnizacion = Valor venal - Franquicia (300 EUR) - Valor de los restos
- Si el asegurado no acepta la declaracion de siniestro total, puede optar por la reparacion asumiendo la diferencia sobre el valor venal.

FRANQUICIA - DETALLE:
- La franquicia de 300 EUR se aplica por cada siniestro independiente.
- En caso de siniestro con tercero identificado y culpable, la compania reclamara al tercero el importe completo (incluida franquicia) y, si se recupera, se reembolsara la franquicia al asegurado.
- La franquicia NO se aplica a las coberturas de Lunas, RC, Asistencia en Carretera ni Accidentes del Conductor.
- Ver detalle completo en [[Franquicias Auto]].

EXCLUSIONES ADICIONALES:
1. Danos mecanicos o de desgaste que no tengan origen en un accidente de circulacion.
2. Danos esteticos previos al siniestro (deben documentarse en informe de estado al contratar).
3. Danos en neumaticos, llantas y elementos de rodaje salvo que se produzcan simultaneamente con otros danos cubiertos.
4. Conduccion fuera de vias aptas para la circulacion (caminos forestales no pavimentados, playas, cauces secos).

DOCUMENTACION NECESARIA:
- Toda la documentacion del nivel Terceros Ampliado
- Parte Europeo de Accidente cumplimentado por ambas partes (si hay contrario)
- Atestado policial (si no hay parte amistoso o hay heridos)
- Fotografias del vehiculo (4 angulos minimo + detalle de cada dano)
- Presupuesto de reparacion del taller concertado o libre

PLAZOS:
- Comunicacion: 7 dias habiles
- Peritacion: 3-5 dias habiles
- Resolucion: 30 dias habiles
- Pago tras acuerdo: 5 dias habiles

Ver tambien: [[Franquicias Auto]], [[Exclusiones Auto]], [[Condicionado Auto - Todo Riesgo]], [[Procedimiento apertura siniestro auto]]`
  },

  {
    titulo: 'Condicionado Auto - Todo Riesgo',
    categoria: 'condicionado',
    tags: 'auto,todo riesgo,sin franquicia,maxima cobertura,sustitucion,adeslas',
    autor: 'departamento-producto',
    contenido: `Producto: Seguro de Automovil - Todo Riesgo sin Franquicia
Nivel: Premium
Compania: SegurCaixa Adeslas
Prima desde: 580 EUR/ano
Franquicia: 0 EUR (sin franquicia)

COBERTURAS INCLUIDAS:
Incluye todas las coberturas del Todo Riesgo con Franquicia (ver [[Condicionado Auto - Todo Riesgo con Franquicia]]) pero SIN aplicacion de franquicia en ninguna cobertura de danos propios. Ademas incluye:

1. Danos Propios sin Franquicia: toda reparacion por colision, vuelco, salida de via, aparcamiento y danos por animales sin deduccion de franquicia. Primer euro cubierto.
2. Vehiculo de Sustitucion: cuando la reparacion en taller concertado supere los 3 dias laborables, se proporciona vehiculo de sustitucion de categoria similar (segmento B-C) durante todo el periodo de reparacion, con un maximo de 30 dias naturales. Incluye seguro a terceros del vehiculo de sustitucion. Carburante a cargo del asegurado. Procedimiento detallado en [[Vehiculo de sustitucion procedimiento]].
3. Asistencia en Carretera Ampliada: sin limite de distancia (incluye averia a 0 km del domicilio). Vehiculo de sustitucion inmediato en caso de inmovilizacion por averia o accidente. Estancia hotelera ampliada: 2 noches, hasta 90 EUR/noche por persona, maximo 4 personas.
4. Conductor Asegurado Ampliado: indemnizacion por fallecimiento (30.000 EUR), invalidez permanente (30.000 EUR), gastos medicos complementarios (3.000 EUR).
5. Equipaje y Efectos Personales: cobertura de objetos personales en el interior del vehiculo en caso de accidente o robo con fuerza. Limite: 1.500 EUR. Franquicia: 0 EUR. Se excluyen dinero en efectivo, joyas y dispositivos electronicos de valor superior a 500 EUR unitario.
6. Defensa Juridica Ampliada: limite de 6.000 EUR (frente a 3.000 EUR del nivel Basico). Libre eleccion de abogado y procurador. Incluye reclamacion administrativa de multas y sanciones de trafico.
7. Asistencia en Viajes al Extranjero: cobertura de asistencia en carretera en toda la Union Europea y paises de la Carta Verde. Remolque hasta 100 km del punto de averia o al taller oficial mas cercano.

EXCLUSIONES PRINCIPALES:
Se aplican las mismas exclusiones generales del producto Auto (ver [[Exclusiones Auto]]). Adicionalmente:
1. El vehiculo de sustitucion no se proporciona si la reparacion se realiza en taller no concertado, salvo autorizacion expresa del departamento de siniestros.
2. Equipaje: no cubre objetos dejados a la vista en el interior del vehiculo si este no estaba cerrado con llave.

DOCUMENTACION NECESARIA:
- Toda la documentacion general del seguro de auto
- Para vehiculo de sustitucion: orden de reparacion del taller con estimacion de plazo
- Para equipaje: listado detallado con valor de adquisicion y antiguedad, fotografias si se dispone de ellas

PLAZOS:
- Comunicacion: 7 dias habiles
- Vehiculo sustitucion: entrega en menos de 4 horas habiles desde autorizacion
- Peritacion: 3 dias habiles
- Resolucion: 30 dias habiles
- Pago: 5 dias habiles tras acuerdo

Ver tambien: [[Vehiculo de sustitucion procedimiento]], [[Exclusiones Auto]], [[Franquicias Auto]], [[Procedimiento apertura siniestro auto]]`
  },

  {
    titulo: 'Exclusiones Auto',
    categoria: 'condicionado',
    tags: 'auto,exclusiones,limitaciones,alcohol,drogas,carreras,adeslas',
    autor: 'departamento-juridico',
    contenido: `Producto: Seguro de Automovil - Exclusiones Generales
Compania: SegurCaixa Adeslas
Base legal: Ley 50/1980 de Contrato de Seguro (LCS) y RDL 8/2004

EXCLUSIONES GENERALES APLICABLES A TODAS LAS MODALIDADES:

1. CONDUCCION SIN PERMISO VALIDO (Art. 10 LCS, Art. 7.c RDL 8/2004):
Queda excluida la cobertura cuando el vehiculo sea conducido por persona que carezca de permiso de conducir valido y en vigor para la categoria del vehiculo asegurado. Se incluye permiso caducado, suspendido, retirado judicial o administrativamente, o de categoria insuficiente. La compania podra repetir contra el tomador o asegurado las cantidades abonadas a terceros en virtud del seguro obligatorio.

2. CONDUCCION BAJO INFLUENCIA DE ALCOHOL O DROGAS (Art. 10 LCS):
Excluida la cobertura cuando el conductor presente una tasa de alcohol en aire espirado superior a 0,25 mg/l (0,15 mg/l para conductores profesionales y noveles con menos de 2 anos de permiso) o de positivo en test de drogas o sustancias psicotropicas segun RD 818/2009. La compania pagara a los terceros perjudicados pero podra ejercer accion de repeticion contra el conductor.

3. MODIFICACIONES NO DECLARADAS (Art. 10 y 89 LCS):
Exclusion de cobertura si el vehiculo ha sido objeto de modificaciones tecnicas no homologadas o no declaradas a la compania: cambios de motor, preparaciones de potencia, modificaciones de carroceria, instalacion de kits de suspension o neumaticos fuera de medidas homologadas. El asegurado debera comunicar toda modificacion en plazo de 15 dias y obtener nueva aceptacion.

4. COMPETICIONES Y PRUEBAS DE VELOCIDAD (Art. 5 Condiciones Generales):
Quedan excluidos los siniestros ocurridos durante la participacion del vehiculo en competiciones, carreras, rallies, pruebas de velocidad o resistencia, ya sean oficiales o no oficiales, incluyendo entrenamientos previos. Se incluyen track days en circuito salvo que se haya contratado extension especifica.

5. USO PARA TRANSPORTE REMUNERADO NO DECLARADO:
No se cubren siniestros cuando el vehiculo se utilice para servicios de transporte de viajeros con contraprestacion economica (taxi, VTC, ridesharing tipo Uber/Cabify/BlaBlaCar con animo de lucro) sin que se haya contratado la extension de uso profesional correspondiente. El uso esporadico compartido de gastos de viaje (carpooling sin animo de lucro) no se considera excluido.

6. GUERRA, TERRORISMO Y RIESGOS NUCLEARES (Exclusion legal):
Quedan excluidos los riesgos derivados de conflicto belico (declarado o no), movimientos sediciosos, terrorismo, energia nuclear y contaminacion radiactiva. Los riesgos extraordinarios son cubiertos por el Consorcio de Compensacion de Seguros conforme al RDL 7/2004.

7. DANOS INTENCIONADOS O POR DOLO (Art. 19 LCS):
La compania queda liberada de prestacion cuando el siniestro haya sido causado intencionadamente o por mala fe del asegurado, tomador o beneficiario. Incluye autolesiones, simulacion de siniestro y destruccion voluntaria del vehiculo.

8. USO FUERA DE AMBITO TERRITORIAL:
La poliza cubre la circulacion en Espana y paises del sistema de Carta Verde. El uso del vehiculo fuera de estos territorios requiere comunicacion previa y obtencion de Carta Verde especifica. No se cubren siniestros en paises en conflicto belico.

9. VEHICULOS SIN ITV EN VIGOR (Art. 89 LCS):
Se excluyen los siniestros producidos en vehiculo que no tenga vigente la Inspeccion Tecnica de Vehiculos. La falta de ITV constituye agravacion del riesgo no comunicada. La compania podra reducir proporcionalmente la indemnizacion o rechazarla segun Art. 12 LCS.

10. CARGA EXCESIVA O MAL SUJETA:
Exclusion de danos al vehiculo asegurado derivados de sobrecarga o transporte de carga excesiva respecto a la MMA (Masa Maxima Autorizada) o por sujecion deficiente de la carga transportada.

Ver tambien: [[Condicionado Auto - Terceros Basico]], [[Condicionado Auto - Todo Riesgo]], [[Franquicias Auto]], [[Procedimiento apertura siniestro auto]]`
  },

  {
    titulo: 'Franquicias Auto',
    categoria: 'condicionado',
    tags: 'auto,franquicias,deducible,copago,calculo,adeslas',
    autor: 'departamento-producto',
    contenido: `Producto: Seguro de Automovil - Tabla de Franquicias
Compania: SegurCaixa Adeslas

CONCEPTO DE FRANQUICIA:
La franquicia es la cantidad que queda a cargo del asegurado en cada siniestro. Se aplica POR SINIESTRO, no por anualidad. Es decir, cada parte o reclamacion independiente genera su propia franquicia. La franquicia se descuenta de la indemnizacion total y se calcula sobre el coste de reparacion con IVA incluido.

TABLA DE FRANQUICIAS POR PRODUCTO Y COBERTURA:

TERCEROS BASICO:
- RC Obligatoria: Sin franquicia (cobertura legal)
- RC Voluntaria: Sin franquicia
- Defensa Juridica: Sin franquicia
- Asistencia en Carretera (<25km): 45 EUR copago
- Asistencia en Carretera (>25km): Sin franquicia
- Lunas: NO incluida
- Robo/Incendio: NO incluido
- Danos Propios: NO incluidos

TERCEROS AMPLIADO:
- Todas las anteriores sin franquicia
- Lunas: Sin franquicia (maximo 2 sustituciones/ano)
- Robo Total: Sin franquicia
- Incendio: 150 EUR
- Fenomenos Atmosfericos: 150 EUR
- Actos Vandalicos: 150 EUR

TODO RIESGO CON FRANQUICIA:
- Todas las coberturas de Terceros Ampliado con sus franquicias
- Danos Propios por Colision: 300 EUR
- Vuelco: 300 EUR
- Salida de Via: 300 EUR
- Danos por Animales: 300 EUR
- Danos en Aparcamiento: 300 EUR

TODO RIESGO SIN FRANQUICIA:
- Todas las coberturas: 0 EUR de franquicia
- Incluye danos propios sin deduccion

FORMULA DE CALCULO:
En la modalidad de Todo Riesgo con Franquicia, la franquicia aplicable es:
  Franquicia = MAX(cantidad_fija, porcentaje_del_siniestro)
  Donde cantidad_fija = 300 EUR y porcentaje = 0% (no aplica porcentaje en este producto).
  En productos comerciales o flotas, la formula puede ser: MAX(300, 10% del siniestro).

CASOS ESPECIALES:
1. Siniestro con tercero culpable identificado: la franquicia se aplica inicialmente pero se reembolsa al asegurado si la compania recupera el importe del tercero responsable. Plazo habitual de recuperacion: 3-6 meses.
2. Convenio CICOS (Convenio de Indemnizacion Directa): en siniestros gestionados por convenio entre companias, la franquicia se aplica normalmente. La gestion la realiza la compania del asegurado (tramitacion directa).
3. Siniestro total: la franquicia se deduce del valor venal determinado por peritacion. Indemnizacion = Valor venal - Franquicia - Valor de restos.
4. Multiples vehiculos implicados: se aplica una unica franquicia por siniestro, no por vehiculo contrario.

REDUCCION DE FRANQUICIA:
El asegurado puede optar por reducir la franquicia a 150 EUR con un suplemento de prima del 15% sobre la tarifa base de Todo Riesgo con Franquicia.

Ver tambien: [[Condicionado Auto - Todo Riesgo con Franquicia]], [[Condicionado Auto - Todo Riesgo]], [[Exclusiones Auto]], [[Procedimiento apertura siniestro auto]]`
  },

  {
    titulo: 'Procedimiento apertura siniestro auto',
    categoria: 'procedimiento',
    tags: 'auto,siniestro,apertura,procedimiento,perito,tramitacion,adeslas',
    autor: 'departamento-siniestros',
    contenido: `Procedimiento: Apertura y Tramitacion de Siniestro de Automovil
Compania: SegurCaixa Adeslas
Version: 3.2 - Actualizado enero 2026

PASO 1: RECEPCION DE LA COMUNICACION DEL SINIESTRO
- Canal telefono: 900 200 200 (24h, 365 dias). El operador recoge datos basicos: numero de poliza, fecha y hora del siniestro, lugar, vehiculos implicados, existencia de heridos.
- Canal online: area de cliente en www.segurcaixa.es o app movil. El cliente cumplimenta formulario digital con campos obligatorios.
- Canal presencial: oficina o mediador. Se cumplimenta parte de siniestro en papel con firma del asegurado.
- Canal chat/WhatsApp: a traves del agente IA. Se guia al cliente paso a paso y se recopila documentacion via mensajeria.

PASO 2: VERIFICACION DE POLIZA Y COBERTURAS
- Comprobar que la poliza esta en vigor (no anulada, no suspendida por impago).
- Verificar la identidad del conductor: comprobar que esta incluido en poliza como conductor habitual u ocasional autorizado.
- Consultar nivel de cobertura contratado: Terceros Basico, Terceros Ampliado, Todo Riesgo con Franquicia o Todo Riesgo. Ver [[Condicionado Auto - Terceros Basico]] y siguientes.
- Verificar franquicia aplicable segun [[Franquicias Auto]].
- Comprobar si existen siniestros previos en el periodo (afecta a bonificacion/recargo).

PASO 3: EVALUACION INICIAL Y CHECK DE COBERTURAS
- Clasificar el tipo de siniestro: colision, robo, incendio, rotura de lunas, fenomenos atmosfericos, asistencia.
- Verificar que el siniestro no incurre en exclusiones (consultar [[Exclusiones Auto]]).
- Determinar si hay tercero implicado y su responsabilidad.
- Si hay heridos: activar protocolo de lesiones y derivar a departamento de corporales.

PASO 4: SOLICITUD DE DOCUMENTACION
- Solicitar Parte Europeo de Accidente (Declaracion Amistosa) cumplimentado y firmado por ambos conductores.
- Si no hay parte amistoso: solicitar atestado policial (Policia Local, Guardia Civil o Mossos).
- Solicitar fotografias del siniestro (minimo 4 angulos: frontal, trasero, lateral izquierdo, lateral derecho, mas detalle de cada dano).
- Solicitar copia del permiso de conducir del conductor en el momento del siniestro.
- Ver listado completo en [[Documentacion requerida auto]].

PASO 5: ASIGNACION DE PERITO
- Siniestros de danos materiales con importe estimado superior a 800 EUR: asignacion automatica de perito de la red.
- Siniestros menores de 800 EUR: autorizacion directa con fotografias (peritacion digital/fotoperitacion).
- El perito debe inspeccionar el vehiculo en plazo maximo de 3 dias habiles desde la asignacion.
- El perito emite informe con: descripcion de danos, coherencia con la dinamica declarada, valoracion de reparacion, decision de reparabilidad.

PASO 6: DETERMINACION DE SINIESTRO TOTAL O REPARABLE
- Si el coste de reparacion supera el 100% del valor venal: se propone siniestro total al asegurado.
- Calculo del valor de mercado: segun tablas Ganvam/Eurotax del mes del siniestro, ajustado por km, estado y equipamiento.
- Si reparable: se solicitan al menos 2 presupuestos de talleres (1 concertado + 1 libre a peticion del asegurado).
- El asegurado puede optar por taller concertado (garantia de reparacion 2 anos) o taller libre (pago segun baremo de la compania).

PASO 7: RESOLUCION Y PAGO
- Comunicar la decision al asegurado en plazo maximo de 40 dias (Art. 18 LCS).
- Si hay acuerdo: pago en 5 dias habiles por transferencia bancaria.
- Si hay desacuerdo: ofrecer mediacion o arbitraje. El asegurado tiene derecho a reclamar al Defensor del Asegurado.
- Registro del siniestro en sistema TIREA (Fichero Historico de Seguros del Automovil).

Ver tambien: [[Documentacion requerida auto]], [[Exclusiones Auto]], [[Franquicias Auto]], [[Baremos indemnizacion auto]]`
  },

  {
    titulo: 'Documentacion requerida auto',
    categoria: 'procedimiento',
    tags: 'auto,documentacion,parte europeo,atestado,fotos,requisitos,adeslas',
    autor: 'departamento-siniestros',
    contenido: `Procedimiento: Documentacion Requerida para Siniestros de Automovil
Compania: SegurCaixa Adeslas
Version: 2.1

DOCUMENTACION OBLIGATORIA EN TODOS LOS SINIESTROS DE AUTO:

1. PARTE EUROPEO DE ACCIDENTE (Declaracion Amistosa de Accidente - DAA):
- Debe estar cumplimentado en su totalidad: datos de ambos conductores, vehiculos, companias aseguradoras, circunstancias del accidente (marcar casillas correspondientes), croquis del accidente con indicacion de calles, sentido de circulacion y punto de impacto.
- Firmado por ambos conductores. Si una de las partes se niega a firmar, anotar matricula, marca y modelo del otro vehiculo y datos del conductor si se facilitan.
- Si no se dispone de parte europeo en papel, se acepta parte digital a traves de la app iDEA (app oficial del sector asegurador espanol).
- IMPORTANTE: el parte europeo no implica reconocimiento de culpa; es una descripcion de hechos.

2. ATESTADO POLICIAL (si aplica):
- Obligatorio cuando hay heridos de cualquier gravedad.
- Obligatorio cuando no hay acuerdo entre las partes sobre la dinamica del accidente.
- Recomendado cuando una de las partes se da a la fuga (siniestro con huida).
- Se puede solicitar a Policia Local (zona urbana), Guardia Civil (zona interurbana), Mossos d'Esquadra (Cataluna), Ertzaintza (Pais Vasco) o Policia Foral (Navarra).
- Plazo para solicitar copia: el asegurado puede solicitarla como interesado. Plazo habitual de emision: 15-30 dias.

3. FOTOGRAFIAS DEL VEHICULO DANADO:
- Minimo 4 fotografias generales: frontal completo, trasero completo, lateral izquierdo, lateral derecho.
- Fotografias de detalle de cada zona danada (primer plano que permita apreciar la extension y profundidad del dano).
- Fotografias del cuentakilometros (verificacion de km).
- Si es posible: fotografias del lugar del accidente mostrando la via, senalizacion y condiciones.
- Formato: digital, resolucion minima 2 MP. Metadatos EXIF con fecha y geolocalizacion (no manipulados).
- Las fotografias deben tomarse ANTES de iniciar cualquier reparacion.

4. PERMISO DE CONDUCIR DEL CONDUCTOR:
- Copia del anverso y reverso del permiso de conducir de la persona que conducia en el momento del siniestro.
- Debe estar en vigor y ser de la categoria adecuada para el vehiculo asegurado.
- Para conductores con permiso extranjero: se verifica la validez en Espana segun convenio internacional aplicable.

5. PERMISO DE CIRCULACION Y FICHA TECNICA:
- Copia del permiso de circulacion (tarjeta de propiedad) del vehiculo asegurado.
- Ficha tecnica con ITV en vigor. Si la ITV esta caducada, se documentara y podra afectar a la cobertura.

6. DOCUMENTACION ADICIONAL SEGUN TIPO DE SINIESTRO:
- Robo: denuncia policial en las 24 horas siguientes. Segunda llave del vehiculo. Documentacion acreditativa del sistema antirrobo.
- Incendio: informe de bomberos si hubo intervencion. Informe de perito de causa si lo solicita la compania.
- Danos por fenomenos atmosfericos: certificado AEMET de la zona y fecha.
- Lesiones: informe medico de urgencias, parte de asistencia, informes de seguimiento.
- Siniestro total: ultimo recibo de ITV, facturas de mejoras o equipamiento adicional, contrato de financiacion si aplica.

FORMATO DE ENTREGA:
- Via app movil: subida directa de documentos y fotos desde la app SegurCaixa Adeslas.
- Via email: siniestros.auto@segurcaixa.es (maximo 25 MB por envio).
- Via area de cliente web: seccion "Mis Siniestros" > "Aportar documentacion".
- Via oficina o mediador: entrega en persona de copias.

PLAZOS DE ENTREGA:
- Documentacion basica (parte + fotos + permisos): 7 dias habiles desde la comunicacion del siniestro.
- Documentacion complementaria (atestado, informes): 30 dias habiles.
- Si transcurrido el plazo no se aporta documentacion, se enviara requerimiento. Si en 30 dias adicionales no se recibe, se archivara el expediente sin perjuicio de reapertura.

Ver tambien: [[Procedimiento apertura siniestro auto]], [[Exclusiones Auto]], [[Condicionado Auto - Terceros Basico]]`
  },

  // =========================================================================
  // HOGAR (6 notas)
  // =========================================================================
  {
    titulo: 'Condicionado Hogar Basico',
    categoria: 'condicionado',
    tags: 'hogar,basico,continente,contenido,RC,incendio,agua,adeslas',
    autor: 'departamento-producto',
    contenido: `Producto: Seguro de Hogar Basico
Nivel: Basico
Compania: SegurCaixa Adeslas
Prima desde: 145 EUR/ano
Franquicia: 100 EUR por siniestro

COBERTURAS INCLUIDAS:

1. Continente (Estructura del Edificio): hasta 100.000 EUR
Cubre la estructura del inmueble asegurado: muros, techos, suelos, tabiques, instalaciones fijas (fontaneria, electricidad, calefaccion, aire acondicionado empotrado), puertas, ventanas y elementos fijos de la vivienda. Incluye garaje y trastero vinculados a la vivienda si constan en poliza.

2. Contenido (Enseres y Mobiliario): hasta 20.000 EUR
Cubre muebles, electrodomesticos, ropa, objetos de uso personal y enseres domesticos del interior de la vivienda. Sublimite para objetos de especial valor (joyas, obras de arte, antigueidades): 1.500 EUR por pieza y 3.000 EUR en conjunto, salvo declaracion expresa con valoracion pericial.

3. Responsabilidad Civil Familiar: hasta 300.000 EUR
Cubre danos corporales y materiales causados involuntariamente a terceros por el asegurado, su conyuge, hijos menores y empleados del hogar en el ejercicio de sus funciones. Incluye RC por tenencia de animales domesticos (excluidos perros potencialmente peligrosos salvo declaracion y licencia). Incluye RC como propietario del inmueble (caida de objetos desde fachada, etc.).

4. Incendio y Explosion: hasta limite del continente/contenido
Danos producidos por incendio (accion directa del fuego con llama), explosion de gas u otros combustibles, y danos por humo subito y accidental. Incluye gastos de extincion, desescombro y demolicion de partes danadas (hasta 10% del capital de continente).

5. Danos por Agua de Instalaciones Propias: hasta limite del continente/contenido
Roturas o fugas de tuberias, llaves de paso, grifos, cisternas, radiadores y electrodomesticos conectados a la red de agua de la propia vivienda asegurada. Incluye localizacion y reparacion de la averia (mano de obra y materiales de la instalacion danada, hasta 600 EUR por siniestro). Franquicia: 100 EUR.

6. Fenomenos Atmosfericos: hasta limite del continente/contenido
Danos causados por lluvia, viento, pedrisco, nieve y helada. Se requiere que el fenomeno sea acreditado por AEMET o Proteccion Civil. Franquicia: 100 EUR. Los riesgos extraordinarios (inundaciones extraordinarias, terremotos, erupciones volcanicas) son competencia del Consorcio de Compensacion de Seguros.

EXCLUSIONES PRINCIPALES:
1. Desgaste natural y deterioro progresivo de materiales.
2. Danos preexistentes a la contratacion del seguro.
3. Vivienda deshabitada mas de 30 dias consecutivos sin comunicacion a la compania.
4. Obras o reformas realizadas sin licencia municipal o sin la supervision de tecnico competente.
5. Plagas de insectos, roedores, termitas u organismos nocivos.
6. Hundimiento o subsidencia del terreno durante el primer ano de vigencia de la poliza (periodo de carencia).
7. Danos a jardines, piscinas y elementos exteriores (no cubiertos en nivel Basico).

DOCUMENTACION NECESARIA:
- Escritura de propiedad o contrato de alquiler
- Nota simple del Registro de la Propiedad
- Fotografias del estado de la vivienda
- Inventario de contenido de valor superior a 1.000 EUR por pieza

PLAZOS:
- Comunicacion: 7 dias habiles desde el siniestro (Art. 16 LCS)
- Resolucion: 40 dias desde comunicacion
- Pago tras acuerdo: 5 dias habiles

Ver tambien: [[Exclusiones Hogar]], [[Condicionado Hogar Plus]], [[Procedimiento apertura siniestro hogar]], [[Documentacion requerida hogar]]`
  },

  {
    titulo: 'Condicionado Hogar Plus',
    categoria: 'condicionado',
    tags: 'hogar,plus,robo,cristales,electricidad,asistencia 24h,adeslas',
    autor: 'departamento-producto',
    contenido: `Producto: Seguro de Hogar Plus
Nivel: Plus
Compania: SegurCaixa Adeslas
Prima desde: 235 EUR/ano
Franquicia: 50 EUR por siniestro

COBERTURAS INCLUIDAS:
Incluye todas las coberturas del Hogar Basico (ver [[Condicionado Hogar Basico]]) con los siguientes capitales ampliados y coberturas adicionales:

1. Continente: hasta 150.000 EUR (ampliado desde 100.000 EUR del Basico)
2. Contenido: hasta 35.000 EUR (ampliado desde 20.000 EUR del Basico)
3. RC Familiar: hasta 600.000 EUR (ampliado desde 300.000 EUR del Basico)

COBERTURAS ADICIONALES:

4. Robo con Fuerza en las Cosas o Violencia en las Personas: hasta el limite del contenido
Cubre la sustraccion de bienes del interior de la vivienda cuando se produzca mediante forzamiento de puertas, ventanas, cerraduras o cualquier acceso; escalamiento; uso de llaves falsas o ganzuas; o amenaza o violencia sobre los ocupantes. Se requiere denuncia policial en las 24 horas siguientes al descubrimiento. El perito verificara las senales de fuerza. Sublimite en metalico: 300 EUR. Sublimite en joyas: 3.000 EUR (salvo declaracion expresa).

5. Rotura de Cristales y Sanitarios: hasta 2.000 EUR por anualidad
Cubre la rotura accidental de cristales fijos (ventanas, mamparas, espejos empotrados), vitroceramicas y sanitarios (lavabos, inodoros, baneras, platos de ducha). No cubre cristales moviles, marcos ni griferia.

6. Danos Electricos: hasta 3.000 EUR por anualidad
Cubre danos a aparatos electricos y electronicos producidos por sobretension, cortocircuito o caida de rayo en la red electrica. Incluye electrodomesticos, equipos informaticos, televisores, sistemas de alarma. Se valora el bien por valor de reposicion con deduccion por antiguedad (depreciacion del 10% anual a partir del segundo ano, maximo 70% de depreciacion).

7. Asistencia en el Hogar 24 horas: incluida sin limite de intervenciones
Servicio de urgencias disponible las 24 horas del dia, los 365 dias del ano:
- Cerrajeria de urgencia: apertura de puerta por cierre involuntario, cambio de cerradura por robo o perdida de llaves. Hasta 2 intervenciones/ano. Primera hora de mano de obra incluida.
- Fontaneria de urgencia: reparacion de fugas, atascos y averias en instalaciones de agua. Hasta 3 intervenciones/ano. Primera hora de mano de obra y materiales basicos incluidos.
- Electricidad de urgencia: reparacion de averias electricas que afecten al suministro de la vivienda. Hasta 3 intervenciones/ano.
- Cristaleria de urgencia: colocacion de cristal provisional en caso de rotura que afecte a la seguridad de la vivienda.
- Procedimiento detallado en [[Asistencia hogar 24h procedimiento]].

8. Responsabilidad Civil por Danos por Agua a Vecinos: hasta 6.000 EUR
Cobertura especifica para danos causados por agua a viviendas colindantes por averia en la instalacion del asegurado.

EXCLUSIONES ADICIONALES (respecto al Basico):
1. Robo sin fuerza (hurto): no cubierto en nivel Plus. Solo cubierto desde nivel Premium.
2. Robo de objetos en dependencias no cerradas (terrazas abiertas, jardines).
3. Danos electricos a equipos de mas de 10 anos de antiguedad.
4. Cerrajeria: no cubre cambio de cerradura por desgaste normal o averia no urgente.

DOCUMENTACION NECESARIA:
- Toda la del Hogar Basico
- Para robo: denuncia policial con listado de objetos sustraidos y su valor estimado
- Para danos electricos: factura de compra o documento acreditativo de antiguedad del aparato

PLAZOS:
- Comunicacion: 7 dias habiles (24 horas para robo)
- Resolucion: 40 dias desde comunicacion
- Asistencia urgente: tiempo de respuesta maximo 2 horas desde la llamada

Ver tambien: [[Condicionado Hogar Basico]], [[Condicionado Hogar Premium]], [[Exclusiones Hogar]], [[Asistencia hogar 24h procedimiento]], [[Procedimiento apertura siniestro hogar]]`
  },

  {
    titulo: 'Condicionado Hogar Premium',
    categoria: 'condicionado',
    tags: 'hogar,premium,sin franquicia,defensa juridica,jardin,piscina,realojamiento,adeslas',
    autor: 'departamento-producto',
    contenido: `Producto: Seguro de Hogar Premium
Nivel: Premium
Compania: SegurCaixa Adeslas
Prima desde: 385 EUR/ano
Franquicia: 0 EUR (sin franquicia)

COBERTURAS INCLUIDAS:
Incluye todas las coberturas del Hogar Plus (ver [[Condicionado Hogar Plus]]) SIN franquicia y con las siguientes ampliaciones y coberturas adicionales:

1. Continente: hasta 250.000 EUR
2. Contenido: hasta 60.000 EUR
3. RC Familiar: hasta 900.000 EUR
4. Sin franquicia en ninguna cobertura

COBERTURAS ADICIONALES PREMIUM:

5. Defensa Juridica del Hogar: hasta 6.000 EUR
Cobertura de gastos de abogado y procurador para la defensa de los intereses del asegurado como propietario o inquilino de la vivienda: reclamaciones por vicios ocultos, disputas con comunidad de propietarios, reclamaciones por danos causados por terceros, defensa frente a reclamaciones de responsabilidad. Libre eleccion de abogado en capitales superiores a 3.000 EUR.

6. Hurto sin Fuerza (Robo sin Violencia): hasta 3.000 EUR por anualidad
Cubre la sustraccion de bienes del interior de la vivienda sin que medie fuerza en las cosas ni violencia en las personas (por ejemplo, por descuido dejando puerta abierta). Requiere denuncia policial. Sublimite: 1.000 EUR por siniestro.

7. Danos Esteticos: hasta 5.000 EUR
Reparacion estetica de paredes, techos y suelos afectados por un siniestro cubierto, para devolver la vivienda a su estado original. Incluye pintura, empapelado, solado y alicatado de las estancias afectadas, aun cuando los danos esteticos no afecten a la funcionalidad de la vivienda.

8. Jardin y Piscina: hasta 6.000 EUR
Cubre danos a jardines, cesped, plantas ornamentales, arboles (hasta 500 EUR por ejemplar), sistemas de riego automatico, mobiliario de jardin, barbacoas de obra, cenadores y pergolas fijas. Piscina: cubre estructura del vaso, sistema de depuracion, equipo de climatizacion y cubierta de piscina. Excluye vaciado y llenado salvo por siniestro cubierto.

9. Alojamiento Temporal por Inhabitabilidad: hasta 90 dias
Si la vivienda asegurada resulta inhabitable a consecuencia de un siniestro cubierto (incendio, explosion, inundacion grave), la compania cubre el alojamiento del asegurado y su familia en hotel o vivienda de alquiler, con un limite de 120 EUR/dia y 90 dias de duracion maxima. Incluye traslado de enseres de primera necesidad y guarda-muebles (hasta 600 EUR).

10. Averia de Electrodomesticos: cobertura de reparacion
Incluye la reparacion de averias mecanicas o electricas de electrodomesticos de linea blanca (lavadora, secadora, lavavajillas, frigorifico, horno) y sistemas de climatizacion. Mano de obra cubierta; piezas a cargo del asegurado si la antiguedad supera 5 anos. Maximo 3 intervenciones por anualidad.

11. Cobertura de Alimentos Congelados: hasta 300 EUR
Indemnizacion por deterioro de alimentos almacenados en congelador por averia del aparato o corte de suministro electrico superior a 6 horas (acreditado por compania electrica).

12. Responsabilidad Civil Ampliada: hasta 900.000 EUR
Incluye RC por practica de deportes no profesionales, RC por uso de bicicletas, RC de animales domesticos (incluidos perros potencialmente peligrosos con licencia), RC por actividades de voluntariado.

EXCLUSIONES ADICIONALES:
1. Jardin: no cubre sequia, falta de mantenimiento ni enfermedades de plantas.
2. Piscina: no cubre danos por congelacion si no se realizo la invernacion adecuada.
3. Alojamiento: no cubre inhabitabilidad por obras de mejora voluntarias del asegurado.

DOCUMENTACION NECESARIA:
- Toda la del nivel Plus
- Para jardin/piscina: fotografias previas que acrediten estado anterior al siniestro
- Para alojamiento: informe del perito que certifique la inhabitabilidad

PLAZOS:
- Comunicacion: 7 dias habiles
- Resolucion: 30 dias habiles
- Alojamiento: autorizacion en menos de 24 horas desde la certificacion de inhabitabilidad

Ver tambien: [[Condicionado Hogar Plus]], [[Exclusiones Hogar]], [[Procedimiento apertura siniestro hogar]], [[Documentacion requerida hogar]]`
  },

  {
    titulo: 'Exclusiones Hogar',
    categoria: 'condicionado',
    tags: 'hogar,exclusiones,limitaciones,desgaste,plagas,obras,adeslas',
    autor: 'departamento-juridico',
    contenido: `Producto: Seguro de Hogar - Exclusiones Generales
Compania: SegurCaixa Adeslas
Base legal: Ley 50/1980 de Contrato de Seguro (LCS)

EXCLUSIONES GENERALES APLICABLES A TODAS LAS MODALIDADES DE HOGAR:

1. DESGASTE NATURAL Y DETERIORO PROGRESIVO:
Se excluyen los danos derivados del uso normal, envejecimiento de materiales, oxidacion, corrosion, humedad por condensacion habitual y deterioro paulatino de elementos constructivos o instalaciones. La falta de mantenimiento preventivo (tuberias sin revisar, impermeabilizacion vencida, tejado sin reparar) constituye agravacion de riesgo y puede motivar la reduccion o denegacion de la cobertura. Art. 12 LCS.

2. DANOS PREEXISTENTES:
No se cubren danos existentes con anterioridad a la fecha de efecto de la poliza. En caso de duda, se estara al informe del perito designado por la compania, sin perjuicio del derecho del asegurado a designar perito propio en procedimiento pericial contradictorio (Art. 38 LCS).

3. VIVIENDA DESHABITADA MAS DE 30 DIAS CONSECUTIVOS:
Si la vivienda asegurada permanece desocupada mas de 30 dias consecutivos sin comunicacion previa a la compania, se excluyen los siniestros de robo, actos vandalicos y danos por agua que se produzcan durante ese periodo. El asegurado puede comunicar la ausencia prolongada (vacaciones, desplazamiento laboral) y contratar vigilancia remota complementaria por suplemento de prima (aproximadamente 12 EUR/mes).

4. OBRAS Y REFORMAS SIN LICENCIA O SIN DIRECCION TECNICA:
Se excluyen los danos derivados de obras de reforma, ampliacion o rehabilitacion realizadas sin la correspondiente licencia municipal de obra o sin la supervision de un tecnico competente (arquitecto o aparejador colegiado). Incluye derribos, apertura de huecos en muros de carga, modificacion de instalaciones de gas, y cualquier intervencion que requiera proyecto tecnico segun el Codigo Tecnico de la Edificacion.

5. PLAGAS E INFESTACIONES:
Danos causados por termitas, carcoma, polillas, cucarachas, ratones, ratas u otros organismos nocivos. Se excluye tanto la eliminacion de la plaga como la reparacion de los danos causados por ella. Recomendacion: el asegurado debe mantener contrato de control de plagas preventivo, especialmente en viviendas unifamiliares, zonas humedas o rurales.

6. HUNDIMIENTO Y SUBSIDENCIA DEL TERRENO:
Se excluyen durante el primer ano de vigencia de la poliza (periodo de carencia de 12 meses desde la fecha de efecto) los danos causados por asientos diferenciales, desplazamiento o hundimiento del terreno sobre el que se asienta el inmueble. A partir del segundo ano, esta cobertura se activa automaticamente para fenomenos subitos (no para asentamientos progresivos).

7. RIESGOS EXTRAORDINARIOS (competencia del CCS):
Los danos causados por fenomenos de la naturaleza de caracter extraordinario (terremotos, maremotos, erupciones volcanicas, inundaciones extraordinarias, embates de mar) y los derivados de terrorismo, sedicion o tumulto popular son competencia del Consorcio de Compensacion de Seguros (CCS). La poliza incluye automaticamente el recargo obligatorio del CCS.

8. DANOS POR HUMEDAD PROGRESIVA:
Manchas, moho, eflorescencias y danos derivados de humedad por capilaridad, filtracion lenta por fachada o cubierta, o condensacion habitual no constituyen siniestro cubierto. Solo se cubren danos por agua de origen subito y accidental (rotura de tuberia, desbordamiento de aparato).

9. BIENES NO DECLARADOS DE VALOR ESPECIAL:
Joyas, obras de arte, colecciones, objetos antiguos y cualesquiera bienes cuyo valor individual supere 1.500 EUR o cuyo valor conjunto supere 6.000 EUR quedan cubiertos unicamente si se han declarado expresamente en las Condiciones Particulares con valoracion pericial adjunta.

10. INMUEBLE EN ESTADO RUINOSO:
Se excluyen los danos cuando el inmueble haya sido declarado en ruina por la autoridad competente, o cuando la estructura presente deficiencias estructurales manifiestas no subsanadas que hubieran sido detectables en una inspeccion tecnica previa a la contratacion.

Ver tambien: [[Condicionado Hogar Basico]], [[Condicionado Hogar Plus]], [[Condicionado Hogar Premium]], [[Procedimiento apertura siniestro hogar]]`
  },

  {
    titulo: 'Procedimiento apertura siniestro hogar',
    categoria: 'procedimiento',
    tags: 'hogar,siniestro,apertura,procedimiento,agua,incendio,robo,adeslas',
    autor: 'departamento-siniestros',
    contenido: `Procedimiento: Apertura y Tramitacion de Siniestro de Hogar
Compania: SegurCaixa Adeslas
Version: 2.4 - Actualizado febrero 2026

PROCEDIMIENTO GENERAL:

PASO 1: RECEPCION DE LA COMUNICACION
- Telefono: 900 200 200 (24h). El operador clasifica por tipo: agua, incendio, robo, rotura, fenomeno atmosferico, RC.
- App/Web: formulario con seleccion de tipo de siniestro, descripcion libre y subida de fotografias.
- Mediador: comunicacion presencial con formulario de parte de siniestro hogar.

PASO 2: VERIFICACION DE POLIZA
- Comprobar vigencia de la poliza y ausencia de impagos.
- Verificar capitales asegurados (continente y contenido).
- Comprobar nivel contratado (Basico, Plus, Premium) y franquicia aplicable.
- Verificar que la vivienda asegurada corresponde con la direccion del siniestro.

PASO 3: MEDIDAS URGENTES DE MITIGACION
El asegurado tiene la obligacion legal de mitigar los danos (Art. 17 LCS). La compania reembolsara los gastos razonables de mitigacion. Instrucciones segun tipo:

SINIESTRO POR AGUA:
- PRIMERO: cortar el suministro de agua de la vivienda (llave de paso general).
- Si la fuga proviene de vivienda superior: avisar al vecino y, si no esta, contactar con el presidente de la comunidad o administrador de fincas.
- Recoger el agua con cubos, toallas o aspirador de liquidos para minimizar danos a contenido y a vecinos inferiores.
- NO tirar objetos danados hasta que el perito los haya inspeccionado.
- Documentar con fotografias y video la procedencia del agua y los danos.
- La compania enviara fontanero de urgencia en menos de 2 horas (si se ha contratado asistencia hogar).

SINIESTRO POR INCENDIO:
- PRIMERO: garantizar la seguridad de todos los ocupantes. Evacuar la vivienda si hay riesgo.
- Llamar al 112 si el fuego no esta controlado.
- No intentar apagar el fuego si supera el tamano de una papelera. Cerrar puertas y ventanas para evitar corrientes.
- Una vez controlado: NO tocar ni mover nada hasta la intervencion de bomberos y perito.
- Documentar con fotografias si es posible hacerlo de forma segura.
- El informe de bomberos es necesario para la tramitacion (ver [[Documentacion requerida hogar]]).

SINIESTRO POR ROBO:
- PRIMERO: interponer denuncia policial en las 24 horas siguientes al descubrimiento del robo.
- No tocar ni limpiar la zona del acceso forzado hasta que la policia tome huellas (si procede).
- Preparar listado detallado de objetos sustraidos con valor estimado de cada uno.
- Aportar facturas de compra de los objetos sustraidos si se dispone de ellas.
- Fotografiar los danos en puertas, ventanas o cerraduras forzadas.
- La compania enviara cerrajero de urgencia para asegurar la vivienda (si se ha contratado asistencia hogar).

PASO 4: ASIGNACION DE PERITO
- Siniestros con danos estimados superiores a 600 EUR: perito presencial.
- Siniestros menores de 600 EUR: videoperitacion o fotoperitacion (el asegurado graba un video guiado por el perito por videollamada).
- El perito debe visitar la vivienda en un plazo maximo de 48 horas habiles (72 horas en periodos de alta siniestralidad como DANA o ola de frio).

PASO 5: PRESUPUESTOS Y REPARACION
- El perito solicita al menos 2 presupuestos de reparacion.
- El asegurado puede elegir reparar con la red de profesionales concertados de la compania (garantia de reparacion de 2 anos) o con profesional de su eleccion (la compania paga segun baremo).
- Autorizacion de reparacion: para importes inferiores a 1.500 EUR, el perito autoriza directamente. Para importes superiores, requiere aprobacion del jefe de siniestros.

PASO 6: RESOLUCION Y PAGO
- Plazo maximo de resolucion: 40 dias desde comunicacion del siniestro (Art. 18 LCS).
- Comunicacion de la decision al asegurado por escrito (email o carta).
- Pago por transferencia bancaria en 5 dias habiles desde el acuerdo.

Ver tambien: [[Documentacion requerida hogar]], [[Exclusiones Hogar]], [[Condicionado Hogar Basico]], [[Condicionado Hogar Plus]]`
  },

  {
    titulo: 'Documentacion requerida hogar',
    categoria: 'procedimiento',
    tags: 'hogar,documentacion,fotos,presupuestos,denuncia,informes,adeslas',
    autor: 'departamento-siniestros',
    contenido: `Procedimiento: Documentacion Requerida para Siniestros de Hogar
Compania: SegurCaixa Adeslas
Version: 2.0

DOCUMENTACION GENERAL (todos los siniestros de hogar):
1. Fotografias de los danos: minimo 3 fotografias generales de cada estancia afectada mas detalle de cada dano concreto. Formato digital con resolucion minima 2 MP. Incluir fotografias del origen del dano si es visible.
2. Presupuestos de reparacion: minimo 2 presupuestos de profesionales distintos (fontanero, electricista, albanil, pintor, segun aplique). Cada presupuesto debe detallar: descripcion del trabajo, materiales, mano de obra, IVA y plazo estimado.
3. Datos de la poliza y del asegurado: numero de poliza, nombre del tomador, direccion de la vivienda asegurada, telefono de contacto, email y cuenta bancaria para el pago de la indemnizacion.

DOCUMENTACION ESPECIFICA POR TIPO DE SINIESTRO:

DANOS POR AGUA:
- Informe del fontanero que realiza la reparacion de urgencia indicando el origen de la fuga (tuberia general, particular, electrodomestico, bajante comunitaria).
- Si la fuga proviene de vivienda de vecino o zona comun: datos del seguro de la comunidad o del vecino.
- Facturas de reparacion de la averia (fontaneria) y de los danos derivados (albanileria, pintura, suelo).
- Si hay danos a contenido (muebles, electrodomesticos): fotografias y valor estimado de cada bien.

ROBO CON FUERZA:
- Denuncia policial: copia del atestado o denuncia interpuesta ante la Policia Nacional, Guardia Civil o policia autonomica. Debe incluir relacion de objetos sustraidos.
- Listado detallado de bienes sustraidos: descripcion, marca, modelo, ano de adquisicion, valor de compra y valor estimado actual.
- Facturas de compra de los objetos sustraidos (si se conservan). En su defecto, cualquier prueba de preexistencia (fotografias previas, extractos bancarios del pago, garantias).
- Fotografias de los danos en accesos (puertas forzadas, ventanas rotas, cerraduras violentadas).
- Si hay sistema de alarma: informe de la central de alarmas con registro de activaciones.

INCENDIO:
- Informe del cuerpo de bomberos si hubo intervencion (se solicita directamente al parque de bomberos del municipio).
- Informe policial si se sospecha intencionalidad o si el incendio afecto a terceros.
- Fotografias del estado posterior al incendio (no retirar escombros ni limpiar hasta la visita del perito).
- Factura de la empresa de limpieza y desescombro (si autorizada por la compania).

FENOMENOS ATMOSFERICOS:
- Certificado de AEMET acreditando el fenomeno meteorologico en la zona y fecha del siniestro (disponible en www.aemet.es o se solicita por la compania).
- Informe de Proteccion Civil si hubo activacion de protocolo de emergencia.
- Fotografias de los danos al exterior e interior de la vivienda.

RESPONSABILIDAD CIVIL:
- Reclamacion escrita del tercero perjudicado indicando los danos y el importe reclamado.
- Documentacion acreditativa de los danos del tercero (fotografias, presupuestos, facturas).
- Si hay demanda judicial: copia de la demanda y providencia de admision.
- NO reconocer responsabilidad ni aceptar pagos sin autorizacion de la compania.

FORMATO DE ENTREGA:
- App SegurCaixa Adeslas: seccion "Mis Siniestros", boton "Aportar documentos". Admite fotos, PDF y documentos escaneados.
- Email: siniestros.hogar@segurcaixa.es (limite 25 MB por envio).
- Presencial: oficina o mediador con copias en papel.

PLAZOS:
- Documentacion basica (fotos + presupuestos): 10 dias habiles desde la comunicacion del siniestro.
- Documentacion complementaria (denuncia, informes oficiales): 30 dias habiles.
- Requerimiento por falta de documentacion: se envia a los 15 dias. Si en 30 dias no se aporta, se archiva el expediente.

Ver tambien: [[Procedimiento apertura siniestro hogar]], [[Exclusiones Hogar]], [[Condicionado Hogar Basico]]`
  },

  // =========================================================================
  // DECESOS (3 notas)
  // =========================================================================
  {
    titulo: 'Condicionado Decesos Esencial',
    categoria: 'condicionado',
    tags: 'decesos,esencial,tanatorio,traslado,certificados,carencia,adeslas',
    autor: 'departamento-producto',
    contenido: `Producto: Seguro de Decesos Esencial
Nivel: Esencial
Compania: SegurCaixa Adeslas
Prima desde: 42 EUR/ano (edad de contratacion 30-45 anos)
Franquicia: No aplicable
Capital maximo: 4.000 EUR

COBERTURAS INCLUIDAS:

1. Servicio de Tanatorio: hasta 2.500 EUR
Cubre el uso de sala velatorio (24 horas), sala de ceremonias, servicio de tanatopraxia (preparacion estetica del fallecido), arca mortuoria (feretro o urna), coche funebre para el traslado al cementerio o crematorio. Incluye libro de firmas, recordatorios (100 unidades) y esquelas en prensa local (1 insercion en periodico provincial).

2. Traslado Nacional: hasta 800 EUR
Traslado del fallecido desde el lugar del fallecimiento hasta el tanatorio y posteriormente al lugar de inhumacion o cremacion dentro del territorio nacional. Incluye tramites administratarios para el traslado intercomunitario (certificado sanitario de defuncion, autorizacion de traslado). Distancia maxima cubierta: sin limite en Peninsula e Islas Baleares. Para Islas Canarias, Ceuta y Melilla: traslado aereo incluido.

3. Tramitacion de Certificados y Documentacion: incluido
Gestion integra de los tramites burocraticos derivados del fallecimiento: inscripcion en el Registro Civil, obtencion del certificado de defuncion, certificado de ultimas voluntades, certificado de seguros de vida con cobertura de fallecimiento. Incluye tramitacion de la pension de viudedad y orfandad ante la Seguridad Social y solicitud de prestaciones por defuncion. Gestion ante el INSS (Instituto Nacional de la Seguridad Social).

4. Inhumacion o Cremacion: incluido en el capital
Cubre los gastos de inhumacion (derechos de cementerio por apertura de nicho o sepultura si es propiedad del asegurado) o de cremacion (servicio de horno crematorio y entrega de cenizas en urna estandar).

CARENCIAS:
- Fallecimiento por enfermedad: 6 meses de carencia desde la fecha de efecto de la poliza.
- Fallecimiento por accidente: sin carencia. Cobertura desde el primer dia.
- Suicidio: 1 ano de carencia.
- Enfermedades preexistentes no declaradas: excluidas permanentemente si se demuestra ocultacion dolosa (Art. 10 LCS).

EXCLUSIONES PRINCIPALES:
1. Fallecimiento por participacion en actividades delictivas.
2. Fallecimiento en actos de guerra, terrorismo o sedicion (cubiertos por CCS si aplica).
3. Gastos de lapida, nicho o sepultura (no incluye adquisicion de derechos funerarios, solo apertura).
4. Gastos de flores mas alla de una corona basica incluida en el servicio de tanatorio.
5. Servicios religiosos o ceremoniales especificos no incluidos en el paquete estandar.

LIMITES DE EDAD:
- Contratacion: desde 0 hasta 70 anos.
- Renovacion: automatica sin limite de edad.
- La prima se revisa anualmente segun la edad actuarial del asegurado.

BENEFICIARIOS:
- El servicio se presta al asegurado fallecido. Los beneficiarios (familiares o persona designada) son quienes activan el servicio llamando al telefono 24h de decesos.

DOCUMENTACION NECESARIA:
- Certificado medico de defuncion
- DNI del fallecido y del declarante
- Libro de familia o certificado de empadronamiento

PLAZOS:
- Comunicacion: lo antes posible tras el fallecimiento. Sin plazo legal especifico.
- Activacion del servicio: inmediata (telefono 24h, 365 dias)

Ver tambien: [[Condicionado Decesos Completo]], [[Condicionado Decesos Premium]]`
  },

  {
    titulo: 'Condicionado Decesos Completo',
    categoria: 'condicionado',
    tags: 'decesos,completo,repatriacion,herencia,psicologia,flores,adeslas',
    autor: 'departamento-producto',
    contenido: `Producto: Seguro de Decesos Completo
Nivel: Completo
Compania: SegurCaixa Adeslas
Prima desde: 68 EUR/ano (edad de contratacion 30-45 anos)
Franquicia: No aplicable
Capital maximo: 6.000 EUR

COBERTURAS INCLUIDAS:
Incluye todas las coberturas del Decesos Esencial (ver [[Condicionado Decesos Esencial]]) con los siguientes capitales ampliados y servicios adicionales:

1. Servicio de Tanatorio Ampliado: hasta 3.500 EUR
Todo lo incluido en el nivel Esencial mas: feretro de gama media (acabado en madera noble), esquelas en 2 periodicos (provincial y nacional), 200 recordatorios, servicio de maestro de ceremonias laico o religioso segun preferencia del asegurado.

2. Repatriacion Internacional: hasta 6.000 EUR
Traslado del fallecido desde cualquier pais del mundo hasta el lugar de inhumacion o cremacion en Espana. Incluye: embalsamamiento en pais de origen si lo requiere la legislacion local, feretro homologado para transporte aereo (feretro zinc), tramites consulares y aduaneros, acompanamiento de un familiar en el vuelo de repatriacion (billete de avion en clase turista). El servicio se coordina a traves de la red internacional de corresponsales de la compania. Si el fallecimiento se produce en pais con conflicto belico activo, la cobertura queda sujeta a la posibilidad efectiva de repatriacion.

3. Asistencia Juridica en Herencias: hasta 3.000 EUR
Asesoramiento y gestion juridica para los herederos del asegurado fallecido: apertura de testamento, tramitacion de declaracion de herederos abintestato (si no hay testamento), liquidacion del Impuesto de Sucesiones y Donaciones, gestion ante el Registro de la Propiedad para cambio de titularidad de inmuebles, tramitacion de cambio de titular en vehiculos y cuentas bancarias. Incluye honorarios de abogado y notario hasta el limite indicado. Libre eleccion de abogado.

4. Asistencia Psicologica al Duelo: 10 sesiones
Servicio de atencion psicologica para los familiares directos del fallecido (conyuge, hijos, padres). Hasta 10 sesiones individuales de 50 minutos con psicologo colegiado. Las sesiones pueden ser presenciales (en la provincia del asegurado) o por videollamada. Periodo maximo para utilizar el servicio: 12 meses desde el fallecimiento.

5. Arreglos Florales: incluido
Corona de flores naturales para la sala del tanatorio y ramo para el feretro. Posibilidad de encargar arreglos adicionales con cargo al asegurado con descuento del 20% en floristeria concertada.

6. Gestion de Baja de Servicios: incluido
Tramitacion de baja del fallecido en suministros (agua, luz, gas, telefono, internet), seguros, suscripciones y servicios bancarios. Incluye cancelacion de domiciliaciones y redireccion de correspondencia postal durante 6 meses.

CARENCIAS:
- Fallecimiento por enfermedad: 6 meses.
- Fallecimiento por accidente: sin carencia.
- Suicidio: 1 ano.
- Repatriacion internacional: sin carencia si el viaje duro menos de 90 dias. Si el asegurado reside en el extranjero permanentemente, la carencia para repatriacion es de 12 meses.

EXCLUSIONES ADICIONALES:
1. Gastos de tramitacion de herencias con elementos internacionales (bienes en el extranjero) que superen la complejidad cubierta por el limite de 3.000 EUR.
2. Repatriacion desde paises sin representacion consular espanola (requiere autorizacion especial).

DOCUMENTACION NECESARIA:
- Toda la documentacion del nivel Esencial
- Para repatriacion: certificado consular de defuncion, pasaporte del fallecido
- Para herencias: copia del testamento o solicitud de declaracion de herederos

PLAZOS:
- Activacion: inmediata
- Repatriacion: el servicio se inicia en menos de 24 horas desde la comunicacion
- Asistencia psicologica: primera sesion disponible en menos de 72 horas

Ver tambien: [[Condicionado Decesos Esencial]], [[Condicionado Decesos Premium]]`
  },

  {
    titulo: 'Condicionado Decesos Premium',
    categoria: 'condicionado',
    tags: 'decesos,premium,capital ampliado,mundial,memorial,viaje familia,adeslas',
    autor: 'departamento-producto',
    contenido: `Producto: Seguro de Decesos Premium
Nivel: Premium
Compania: SegurCaixa Adeslas
Prima desde: 95 EUR/ano (edad de contratacion 30-45 anos)
Franquicia: No aplicable
Capital maximo: 10.000 EUR

COBERTURAS INCLUIDAS:
Incluye todas las coberturas del Decesos Completo (ver [[Condicionado Decesos Completo]]) con capitales ampliados y servicios adicionales exclusivos:

1. Servicio Funerario Premium: hasta 6.000 EUR
Servicio integral de maxima calidad: feretro premium de madera noble o urna de diseno, sala VIP de velatorio, servicio de catering para asistentes (hasta 30 personas), vehiculo de acompanamiento para familiares, servicio de fotografia y video de la ceremonia si se solicita, coordinacion completa de la ceremonia (religiosa, laica o mixta).

2. Capital Adicional Libre Disposicion: 4.000 EUR
Indemnizacion en metalico a los beneficiarios designados para cubrir gastos no funerarios derivados del fallecimiento: desplazamientos de familiares, dias de ausencia laboral, pagos urgentes, o cualquier otra necesidad. El pago se realiza por transferencia en 48 horas desde la acreditacion del fallecimiento.

3. Servicio Mundial: cobertura integral en cualquier pais
Cobertura de servicio funerario completo en el pais de fallecimiento si la familia decide no repatriar. La compania se encarga de gestionar el servicio funerario local conforme a la legislacion y costumbres del pais, con la red de corresponsales internacionales. Alternativa a la repatriacion, a eleccion de los beneficiarios.

4. Asistencia en Viaje a Familiares: hasta 3.000 EUR
Si el fallecimiento se produce fuera de la localidad de residencia del asegurado (a mas de 100 km), la compania cubre el desplazamiento de hasta 3 familiares directos al lugar del fallecimiento: billetes de tren/avion en clase turista, alojamiento (1 noche, hasta 90 EUR/persona) y gastos de manutencion (30 EUR/persona/dia, maximo 3 dias).

5. Memorial Online: incluido
Creacion de una pagina memorial digital personalizada para el fallecido. Incluye: espacio para biografia, fotografias, mensajes de condolencia de familiares y amigos, y opcion de donacion a ONG en memoria del fallecido. La pagina permanece activa durante 5 anos y se puede renovar gratuitamente.

6. Asistencia Psicologica Ampliada: 20 sesiones
Ampliacion a 20 sesiones de atencion psicologica (frente a las 10 del nivel Completo). Incluye sesiones grupales para la unidad familiar y sesiones especializadas para menores (psicologo infantil). Periodo de utilizacion ampliado a 24 meses desde el fallecimiento.

7. Asesoramiento Fiscal y Testamentario en Vida: 1 consulta anual
Mientras la poliza este en vigor, el asegurado tiene derecho a 1 consulta anual (presencial o telefonica) con abogado especialista en derecho sucesorio para revisar su testamento, planificar la herencia, optimizar fiscalmente la sucesion y resolver dudas sobre el Impuesto de Sucesiones en su comunidad autonoma.

8. Servicio de Limpieza y Vaciado de Vivienda: hasta 1.500 EUR
Si el fallecido vivia solo: servicio de vaciado, limpieza y acondicionamiento de la vivienda para su entrega a herederos, alquiler o venta. Incluye retirada de enseres no deseados a punto limpio y limpieza integral.

CARENCIAS:
- Fallecimiento por enfermedad: 6 meses.
- Fallecimiento por accidente: sin carencia.
- Capital libre disposicion: 6 meses (excepto accidente).
- Suicidio: 1 ano.

EXCLUSIONES PRINCIPALES:
Se aplican las mismas exclusiones de los niveles Esencial y Completo. Adicionalmente:
1. El capital libre disposicion no es acumulable con indemnizaciones de seguros de vida del mismo grupo asegurador.
2. El servicio mundial puede tener limitaciones en paises con restricciones sanitarias o de seguridad extrema segun criterio del Ministerio de Asuntos Exteriores.

DOCUMENTACION NECESARIA:
- Certificado medico de defuncion
- DNI del fallecido y del beneficiario que activa el servicio
- Para capital libre disposicion: certificado bancario del beneficiario

PLAZOS:
- Activacion del servicio funerario: inmediata
- Pago del capital libre disposicion: 48 horas desde la acreditacion del fallecimiento
- Memorial online: activacion en 5 dias habiles

Ver tambien: [[Condicionado Decesos Completo]], [[Condicionado Decesos Esencial]]`
  },

  // =========================================================================
  // VIDA (2 notas)
  // =========================================================================
  {
    titulo: 'Condicionado Vida Fallecimiento',
    categoria: 'condicionado',
    tags: 'vida,fallecimiento,capital,beneficiario,carencia,exclusiones,adeslas',
    autor: 'departamento-producto',
    contenido: `Producto: Seguro de Vida - Fallecimiento
Nivel: Basico Vida
Compania: SegurCaixa Adeslas
Prima desde: 85 EUR/ano (capital 50.000 EUR, edad 30-40 anos, no fumador)
Franquicia: No aplicable

COBERTURAS INCLUIDAS:

1. Fallecimiento por Cualquier Causa: capital desde 50.000 EUR
Pago de la indemnizacion al beneficiario o beneficiarios designados en caso de fallecimiento del asegurado por cualquier causa (enfermedad o accidente), una vez transcurrido el periodo de carencia. El capital se paga en un unico pago (pago unico) o, a eleccion del beneficiario, en forma de renta temporal o vitalicia.

2. Doble Capital por Accidente de Circulacion: hasta 100.000 EUR
Si el fallecimiento se produce como consecuencia directa de un accidente de circulacion (como conductor, pasajero o peaton), el capital se duplica. Se considera accidente de circulacion el que se produce con intervencion de un vehiculo a motor en vias publicas o privadas abiertas al trafico.

3. Anticipo por Enfermedad Terminal: hasta el 50% del capital
Si el asegurado es diagnosticado con una enfermedad terminal (esperanza de vida inferior a 12 meses segun informe medico de dos especialistas), puede solicitar el anticipo de hasta el 50% del capital asegurado en vida. El importe anticipado se descuenta del capital pendiente para los beneficiarios.

4. Gastos de Sepelio: 3.000 EUR adicionales
Indemnizacion adicional al capital principal para cubrir los gastos inmediatos del sepelio, sin necesidad de justificacion. Se abona al beneficiario o a la persona que acredite haber sufragado los gastos funerarios.

CARENCIAS:
- Fallecimiento por accidente: sin carencia. Cobertura desde el primer dia.
- Fallecimiento por enfermedad: 1 ano de carencia desde la fecha de efecto.
- Suicidio: excluido durante el primer ano de vigencia de la poliza (Art. 93 LCS). A partir del segundo ano, el suicidio queda cubierto.

EXCLUSIONES PRINCIPALES:
1. Suicidio durante el primer ano de vigencia (Art. 93 LCS). A partir del segundo ano se cubre.
2. Fallecimiento por participacion activa en conflicto belico (declarado o no), excepto si el asegurado es miembro de las Fuerzas Armadas en mision oficial.
3. Fallecimiento por riesgos nucleares, contaminacion radiactiva o exposicion a materiales fisionables.
4. Fallecimiento derivado de la participacion en actividades delictivas dolosas.
5. Fallecimiento bajo los efectos de drogas o sustancias psicotropicas no prescritas medicamente, si se demuestra relacion causal directa.

DESIGNACION DE BENEFICIARIOS:
- El tomador designa libremente al beneficiario o beneficiarios en la solicitud de seguro.
- Se puede modificar la designacion en cualquier momento mediante comunicacion escrita a la compania, salvo que la designacion sea irrevocable.
- Si se designan varios beneficiarios sin indicar porcentajes, el capital se reparte a partes iguales.
- Si no hay beneficiario designado o este premuere al asegurado: el capital pasa a los herederos legales segun el Codigo Civil.
- La designacion generica "mis herederos" equivale a los herederos legales del asegurado.
- Clausula especial para hipotecas: si la poliza esta vinculada a un prestamo hipotecario, el beneficiario preferente es la entidad financiera hasta el limite del capital pendiente.

DOCUMENTACION NECESARIA:
- Certificado medico de defuncion
- Certificado de ultimas voluntades
- Certificado de seguros con cobertura de fallecimiento (registro de contratos de seguros de cobertura de fallecimiento)
- DNI del fallecido y de los beneficiarios
- Libro de familia o documentacion acreditativa del vinculo (si beneficiario generico)
- Para doble capital: atestado policial del accidente de circulacion

PLAZOS:
- Comunicacion: sin plazo legal especifico, pero se recomienda comunicar en los primeros 7 dias
- Pago: 40 dias desde la acreditacion del fallecimiento y aportacion de toda la documentacion
- Prescripcion: 5 anos desde el fallecimiento (Art. 23 LCS)

Ver tambien: [[Condicionado Vida Completo]], [[Baremos incapacidad]]`
  },

  {
    titulo: 'Condicionado Vida Completo',
    categoria: 'condicionado',
    tags: 'vida,completo,invalidez,incapacidad,gran invalidez,doble capital,adeslas',
    autor: 'departamento-producto',
    contenido: `Producto: Seguro de Vida Completo (Fallecimiento + Invalidez)
Nivel: Completo
Compania: SegurCaixa Adeslas
Prima desde: 145 EUR/ano (capital 50.000 EUR, edad 30-40 anos, no fumador)
Franquicia: No aplicable

COBERTURAS INCLUIDAS:
Incluye todas las coberturas del Vida Fallecimiento (ver [[Condicionado Vida Fallecimiento]]) y ademas:

1. Incapacidad Permanente Total (IPT): 100% del capital
Pago del capital asegurado si el asegurado es declarado en situacion de Incapacidad Permanente Total para su profesion habitual por la Seguridad Social o por dictamen medico de dos especialistas independientes. Se requiere que la incapacidad sea definitiva (no provisional). El pago se realiza una vez firme la resolucion del INSS o sentencia judicial. El cobro de esta prestacion extingue la cobertura de fallecimiento.

2. Incapacidad Permanente Absoluta (IPA): 100% del capital
Pago del capital si el asegurado es declarado en situacion de Incapacidad Permanente Absoluta para toda profesion u oficio. Criterio: incapacidad que inhabilite por completo al trabajador para toda profesion u oficio (Art. 137.5 LGSS). Compatible con la percepcion de la pension publica de incapacidad.

3. Gran Invalidez (GI): 150% del capital
Pago del 150% del capital asegurado si el asegurado es declarado en situacion de Gran Invalidez: incapacidad permanente absoluta que ademas requiere la asistencia de otra persona para los actos esenciales de la vida (vestirse, desplazarse, comer, aseo personal). Conforme a [[Baremos incapacidad]], la gran invalidez supone el grado maximo de incapacidad reconocido por el sistema de Seguridad Social.

4. Incapacidad Permanente Parcial (>66%): porcentaje del capital
Si la incapacidad permanente reconocida es parcial pero con grado igual o superior al 66% segun baremo de la Seguridad Social, se abona el porcentaje del capital correspondiente al grado de incapacidad (por ejemplo, 66% de incapacidad = 66% del capital). Para grados entre 33% y 65%, la cobertura queda excluida salvo que se haya contratado la extension especifica.

5. Doble Capital por Accidente de Circulacion: aplica a fallecimiento Y a invalidez
En caso de que el fallecimiento o la invalidez permanente se deriven de un accidente de circulacion, los capitales anteriores se duplican. Ejemplo: GI por accidente de trafico = 300% del capital base.

6. Exencion de Pago de Primas por Incapacidad: incluido
Si el asegurado es declarado en situacion de IPA o GI, queda exento del pago de primas futuras manteniendose la poliza en vigor con todas sus coberturas hasta el vencimiento o hasta el siniestro de fallecimiento.

EXCLUSIONES ADICIONALES (respecto a Vida Fallecimiento):
1. Incapacidades derivadas de enfermedades o lesiones preexistentes no declaradas en el cuestionario de salud.
2. Incapacidades derivadas de la practica de deportes de riesgo no declarados: paracaidismo, ala delta, submarinismo a mas de 30m, escalada en roca sin seguro, motociclismo de competicion.
3. Incapacidades autoinfligidas o derivadas de tentativa de suicidio durante el primer ano.
4. Incapacidades derivadas del consumo cronico de alcohol o drogas no prescritas.

CUESTIONARIO DE SALUD:
Para capitales superiores a 150.000 EUR se requiere reconocimiento medico completo (analisis de sangre y orina, electrocardiograma, informe medico). Para capitales inferiores, cuestionario de salud simplificado (declaracion del asegurado sobre enfermedades, tratamientos, intervenciones quirurgicas, bajas laborales y habitos).

DOCUMENTACION NECESARIA:
- Para invalidez: resolucion del INSS declarando la incapacidad permanente, o sentencia firme del Juzgado de lo Social
- Informe medico detallado de las lesiones o patologias
- Historial clinico relevante
- Documentacion de identidad del asegurado

PLAZOS:
- Comunicacion de la incapacidad: 7 dias desde la resolucion firme del INSS
- Evaluacion: 60 dias desde la recepcion de toda la documentacion
- Pago: 15 dias desde la aceptacion del siniestro

Ver tambien: [[Condicionado Vida Fallecimiento]], [[Baremos incapacidad]]`
  },

  // =========================================================================
  // ACCIDENTES (2 notas)
  // =========================================================================
  {
    titulo: 'Condicionado Accidentes Basico',
    categoria: 'condicionado',
    tags: 'accidentes,basico,fallecimiento,invalidez,24h,profesional,privado,adeslas',
    autor: 'departamento-producto',
    contenido: `Producto: Seguro de Accidentes Basico
Nivel: Basico
Compania: SegurCaixa Adeslas
Prima desde: 55 EUR/ano
Franquicia: No aplicable

DEFINICION DE ACCIDENTE (Art. 100 LCS):
Se entiende por accidente la lesion corporal que deriva de una causa violenta, subita, externa y ajena a la intencionalidad del asegurado, que produzca invalidez temporal o permanente, o fallecimiento. Se incluyen: caidas, golpes, cortes, quemaduras, intoxicaciones accidentales, ahogamientos, electrocucion, mordeduras de animales, picaduras con reaccion anafilactica. Se excluyen: enfermedades, aunque se manifiesten de forma subita (infarto, ictus), salvo que sean consecuencia directa de un accidente cubierto.

COBERTURAS INCLUIDAS:

1. Fallecimiento por Accidente: 30.000 EUR
Pago del capital al beneficiario designado si el asegurado fallece como consecuencia directa de un accidente cubierto, dentro de los 12 meses siguientes a la fecha del accidente. La causa del fallecimiento debe estar directamente relacionada con las lesiones del accidente, acreditada por certificado medico.

2. Invalidez Permanente por Accidente: hasta 30.000 EUR
Pago del porcentaje del capital correspondiente al grado de invalidez permanente reconocido, conforme al baremo de indemnizaciones incluido en las condiciones generales. El baremo sigue la tabla de la Direccion General de Seguros:
- Perdida funcional completa de ambas manos: 100%
- Perdida funcional completa de una mano: 60%
- Perdida funcional completa de un pulgar: 20%
- Perdida funcional completa de la vision de ambos ojos: 100%
- Perdida funcional completa de la vision de un ojo: 35%
- Perdida funcional completa de una pierna: 60%
- Perdida de un pie: 45%
- Perdida total de audicion bilateral: 65%
- Perdida total de audicion unilateral: 15%
Para grados intermedios: valoracion por perito medico de la compania.

3. Cobertura 24 horas: Profesional y Privada
La poliza cubre accidentes ocurridos tanto durante la actividad laboral (accidente laboral o in itinere) como durante la vida privada del asegurado, las 24 horas del dia, los 365 dias del ano, en cualquier parte del mundo. No se distingue entre accidente laboral y accidente domestico o de ocio.

4. Gastos de Primera Asistencia: hasta 500 EUR
Reembolso de los gastos medicos de urgencia derivados del accidente (atencion en urgencias, ambulancia si no cubierta por la Seguridad Social, primeros auxilios), con limite de 500 EUR y presentacion de facturas.

EXCLUSIONES PRINCIPALES:
1. Enfermedades o patologias preexistentes, aunque se agraven por el accidente (salvo que el accidente sea la causa principal y directa).
2. Deportes de riesgo o extremos sin extension contratada: paracaidismo, puenting, barranquismo, escalada sin seguro, submarinismo a mas de 30 metros, deportes aereos con motor.
3. Accidentes bajo influencia de alcohol (>0,25 mg/l) o drogas no prescritas.
4. Lesiones derivadas de intervenciones quirurgicas o tratamientos medicos (salvo las derivadas de un accidente cubierto).
5. Hernias, lumbalgias y lesiones de espalda salvo que se demuestre el mecanismo traumatico agudo.
6. Accidentes ocurridos durante el servicio militar en zona de conflicto activo.
7. Participacion en competiciones deportivas federadas (requiere extension).

DOCUMENTACION NECESARIA:
- Parte de accidente describiendo circunstancias, fecha, hora y lugar
- Informe medico de urgencias
- Informe de alta medica con diagnostico y secuelas
- Para accidente laboral: parte de accidente de trabajo (sistema Delt@)

PLAZOS:
- Comunicacion: 7 dias habiles desde el accidente
- Determinacion de invalidez: cuando las lesiones esten consolidadas (maximo 18 meses desde el accidente, prorrogable a 24 meses)
- Pago: 15 dias desde la valoracion definitiva

Ver tambien: [[Condicionado Accidentes Plus]], [[Baremos incapacidad]]`
  },

  {
    titulo: 'Condicionado Accidentes Plus',
    categoria: 'condicionado',
    tags: 'accidentes,plus,gastos medicos,hospitalizacion,subsidio diario,adeslas',
    autor: 'departamento-producto',
    contenido: `Producto: Seguro de Accidentes Plus
Nivel: Plus
Compania: SegurCaixa Adeslas
Prima desde: 89 EUR/ano
Franquicia: No aplicable

COBERTURAS INCLUIDAS:
Incluye todas las coberturas del Accidentes Basico (ver [[Condicionado Accidentes Basico]]) con los siguientes capitales ampliados y coberturas adicionales:

1. Fallecimiento por Accidente: 50.000 EUR (ampliado desde 30.000 EUR)
2. Invalidez Permanente por Accidente: hasta 50.000 EUR (ampliado desde 30.000 EUR)

COBERTURAS ADICIONALES:

3. Gastos Medicos por Accidente: hasta 3.000 EUR
Reembolso de gastos medicos, quirurgicos, farmaceuticos y de rehabilitacion derivados de un accidente cubierto, complementario a las prestaciones de la Seguridad Social o del seguro de salud del asegurado. Incluye:
- Consultas medicas de especialista
- Pruebas diagnosticas (radiografias, resonancias, TAC)
- Intervenciones quirurgicas ambulatorias
- Tratamiento farmacologico prescrito
- Rehabilitacion y fisioterapia (hasta 30 sesiones)
- Ortopedia y protesis funcionales (no esteticas): hasta 1.500 EUR
- Odontologia derivada de traumatismo: hasta 1.000 EUR (reconstruccion de piezas dentales danadas por impacto)
Los gastos se abonan previa presentacion de facturas y prescripcion medica. Se deduce lo abonado por la Seguridad Social u otro seguro de salud (principio indemnizatorio, no enriquecimiento).

4. Subsidio Diario por Hospitalizacion: 50 EUR/dia
Por cada dia de hospitalizacion del asegurado como consecuencia de un accidente cubierto, se abona una indemnizacion diaria de 50 EUR. Maximo: 365 dias consecutivos por siniestro. La hospitalizacion debe ser medicamente necesaria y prescrita por el facultativo responsable. Incluye hospitalizacion en UCI. No incluye hospitalizacion por rehabilitacion ni ingresos voluntarios para tratamiento no derivado del accidente.

5. Subsidio por Incapacidad Temporal: 30 EUR/dia
Por cada dia de baja laboral medicamente acreditada (parte de baja de la Seguridad Social) derivada de un accidente cubierto, a partir del dia 8 de baja. Maximo: 180 dias por siniestro. Si la baja se prolonga mas de 180 dias, el caso pasa a evaluacion de invalidez permanente.

6. Cirugia Estetica Reparadora: hasta 2.000 EUR
Cubre los gastos de cirugia estetica reparadora necesaria para corregir secuelas visibles derivadas de un accidente cubierto (cicatrices en cara, cuello y manos). Se requiere informe del cirujano plastico con plan de tratamiento aprobado por el medico de la compania.

7. Adaptacion del Domicilio: hasta 3.000 EUR
Si el accidente provoca una invalidez permanente que requiera adaptaciones en la vivienda habitual del asegurado (rampas, ascensor, banera por ducha adaptada, barras de apoyo), se cubren los gastos de adaptacion previa aprobacion del proyecto por la compania.

8. Asistencia en Viaje por Accidente: incluida
Si el accidente ocurre a mas de 50 km del domicilio o en el extranjero: traslado sanitario (ambulancia o avion medicalizado), repatriacion, desplazamiento de un familiar al lugar del accidente.

EXCLUSIONES ADICIONALES:
1. Gastos medicos por lesiones deportivas en competiciones federadas sin extension.
2. Tratamientos de medicina alternativa no prescritos por medico colegiado (homeopatia, acupuntura, etc.).
3. Gastos farmaceuticos de medicamentos no directamente relacionados con el accidente.
4. Subsidio por hospitalizacion: no se abona en ingresos inferiores a 24 horas (hospital de dia).

DOCUMENTACION NECESARIA:
- Toda la del Accidentes Basico
- Facturas originales de gastos medicos, farmacia, rehabilitacion
- Para subsidio hospitalizacion: informe de alta hospitalaria con fechas de ingreso y alta
- Para subsidio IT: partes de baja y alta de la Seguridad Social
- Para cirugia reparadora: informe del cirujano plastico y presupuesto

PLAZOS:
- Comunicacion: 7 dias habiles desde el accidente
- Reembolso de gastos: 15 dias desde la presentacion de facturas
- Subsidio hospitalizacion: pago mensual o al alta hospitalaria

Ver tambien: [[Condicionado Accidentes Basico]], [[Baremos incapacidad]]`
  },

  // =========================================================================
  // COMERCIO (2 notas)
  // =========================================================================
  {
    titulo: 'Condicionado Comercio Basico',
    categoria: 'condicionado',
    tags: 'comercio,basico,local,negocio,continente,contenido,RC,robo,adeslas',
    autor: 'departamento-producto',
    contenido: `Producto: Seguro de Comercio Basico
Nivel: Basico
Compania: SegurCaixa Adeslas
Prima desde: 320 EUR/ano
Franquicia: 150 EUR por siniestro

COBERTURAS INCLUIDAS:

1. Continente del Local Comercial: hasta 150.000 EUR
Estructura del inmueble destinado a actividad comercial: muros, techos, suelos, tabiques, instalaciones fijas (electricidad, fontaneria, climatizacion), escaparates, rotulos fijos, puertas de acceso (incluidas automaticas y de seguridad). Si el local es en regimen de alquiler, se cubre la responsabilidad del inquilino frente al propietario por danos al inmueble (RC locativa).

2. Contenido del Local Comercial: hasta 30.000 EUR
Mobiliario comercial (mostradores, estanterias, vitrinas), equipos informaticos y de oficina, maquinaria no industrial, utillaje, mercancia almacenada en el local (stock). Sublimite para dinero en efectivo en caja: 1.000 EUR durante horario comercial, 300 EUR fuera de horario. Sublimite para mercancias en camara frigorifica: 5.000 EUR (para comercios de alimentacion).

3. Responsabilidad Civil de la Actividad: hasta 300.000 EUR
Cubre danos corporales y materiales causados involuntariamente a terceros (clientes, proveedores, viandantes) como consecuencia de la actividad comercial desarrollada en el local asegurado. Incluye: RC patronal (danos a empleados en el ejercicio de sus funciones, complementaria a la prestacion de la Seguridad Social), RC de locales (caidas de clientes, danos por instalaciones defectuosas), RC de productos vendidos (solo fabricantes o importadores, no meros distribuidores). Franquicia RC: 150 EUR por siniestro.

4. Incendio y Explosion: hasta limite de continente + contenido
Cobertura integral de danos por incendio, explosion de gas, caida de rayo y danos por humo. Incluye gastos de extincion, desescombro (10% del capital), demolicion de partes danadas y honorarios tecnicos para la reconstruccion (arquitecto, aparejador). Cubre danos a bienes de terceros (clientes, empleados) depositados en el local.

5. Danos por Agua: hasta limite de continente + contenido
Danos por rotura de tuberias, desbordamiento de aparatos, filtraciones accidentales desde pisos superiores o desde la cubierta. Incluye localizacion y reparacion de la averia (hasta 1.000 EUR). Franquicia: 150 EUR.

6. Robo con Fuerza: hasta limite del contenido
Sustraccion de bienes del interior del local mediante forzamiento de accesos o uso de llaves falsas. Requiere denuncia policial en 24 horas. Incluye danos causados en los accesos por el propio robo. No cubre hurto (sustraccion sin fuerza durante horario comercial) ni atraco (requiere extension).

7. Rotura de Cristales y Rotulos: hasta 3.000 EUR por anualidad
Escaparates, cristales fijos, vitrinas de exposicion, rotulos luminosos y letreros fijos del exterior. Incluye la instalacion del cristal o rotulo de sustitucion.

8. Danos Electricos: hasta 3.000 EUR por anualidad
Danos a equipos electricos y electronicos por sobretension, cortocircuito o caida de rayo. Incluye TPV, ordenadores, impresoras, sistemas de alarma, camaras de videovigilancia y centrales telefonicas.

EXCLUSIONES PRINCIPALES:
1. Danos por falta de mantenimiento o desgaste natural.
2. Robo sin fuerza (hurto) durante horario comercial.
3. Danos a vehiculos de clientes en aparcamiento del local (requiere extension).
4. Perdida de beneficios por interrupcion de actividad (cubierto desde nivel Integral).
5. Riesgos ciberneticos (cubiertos desde nivel Integral).
6. Actividades industriales o manufactureras (requiere poliza especifica).
7. Danos por obras de reforma en el local sin licencia.

DOCUMENTACION NECESARIA:
- Licencia de apertura o declaracion responsable de actividad
- Contrato de alquiler del local (si no es propiedad)
- Inventario de maquinaria y equipos de valor superior a 1.000 EUR
- Descripcion de la actividad comercial

PLAZOS:
- Comunicacion: 7 dias habiles (24 horas para robo)
- Resolucion: 40 dias desde comunicacion
- Pago: 5 dias habiles tras acuerdo

Ver tambien: [[Exclusiones Comercio]], [[Condicionado Comercio Integral]]`
  },

  {
    titulo: 'Condicionado Comercio Integral',
    categoria: 'condicionado',
    tags: 'comercio,integral,perdida beneficios,averia maquinaria,ciberriesgo,fidelidad,adeslas',
    autor: 'departamento-producto',
    contenido: `Producto: Seguro de Comercio Integral
Nivel: Integral (Premium)
Compania: SegurCaixa Adeslas
Prima desde: 580 EUR/ano
Franquicia: 10% del importe del siniestro, minimo 300 EUR

COBERTURAS INCLUIDAS:
Incluye todas las coberturas del Comercio Basico (ver [[Condicionado Comercio Basico]]) con capitales ampliados y las siguientes coberturas adicionales:

1. Continente: hasta 300.000 EUR (ampliado)
2. Contenido: hasta 80.000 EUR (ampliado)
3. RC Actividad: hasta 600.000 EUR (ampliado)

COBERTURAS ADICIONALES:

4. Averia de Maquinaria: hasta 15.000 EUR por anualidad
Cobertura de averia mecanica o electrica de maquinaria y equipos instalados en el local comercial: camaras frigorificas, hornos industriales, maquinas expendedoras, equipos de climatizacion, sistemas de riego automatico (floristeria, viveros). Cubre la reparacion o sustitucion del equipo. No cubre piezas de desgaste (correas, filtros, juntas) ni averias por falta de mantenimiento segun las indicaciones del fabricante. Antiguedad maxima cubierta: 10 anos.

5. Perdida de Beneficios por Interrupcion de Actividad: hasta 12 meses de beneficio neto
Indemnizacion del lucro cesante cuando el local comercial no pueda ejercer su actividad normal como consecuencia directa de un siniestro cubierto (incendio, explosion, danos por agua graves, robo que impida la actividad). Calculo: se indemniza el beneficio neto mensual (facturacion media de los ultimos 12 meses menos costes variables) multiplicado por el numero de meses de inactividad, con un maximo de 12 meses. Franquicia temporal: 3 dias (los primeros 3 dias de inactividad no se indemnizan). Se requiere acreditacion contable del beneficio neto (ultima declaracion de IVA trimestral o resumen anual, o contabilidad certificada por asesor fiscal).

6. Infidelidad de Empleados: hasta 6.000 EUR
Cubre las perdidas economicas directas derivadas de actos deshonestos de empleados del asegurado: sustraccion de dinero, mercancias o equipos, falsificacion de documentos contables, uso fraudulento de tarjetas de credito del negocio. Requiere denuncia penal contra el empleado. Franquicia: 300 EUR. Sublimite por empleado: 3.000 EUR. No cubre deficiencias de gestion, errores involuntarios ni actos cometidos con conocimiento o tolerancia del asegurado.

7. Riesgo Cibernetico Basico: hasta 10.000 EUR
Cobertura de los gastos derivados de un incidente de ciberseguridad que afecte al negocio:
- Gastos de restauracion de datos y sistemas (backup recovery): hasta 5.000 EUR
- Gastos de notificacion a afectados por brecha de datos personales (RGPD): hasta 2.000 EUR
- Gastos de asesoria legal especializada en proteccion de datos: hasta 3.000 EUR
- Asistencia tecnica de emergencia 24h (helpdesk de ciberseguridad)
No cubre: rescates de ransomware, perdida de beneficios por interrupcion cibernetica, multas de la AEPD, responsabilidad frente a terceros por filtracion de datos (requiere poliza de ciberriesgo especifica).

8. Atraco en el Local: hasta 5.000 EUR
Sustraccion con violencia o intimidacion sobre el asegurado, empleados o clientes dentro del local comercial. Cubre el efectivo sustraido (hasta 2.000 EUR) y las mercancias (hasta 3.000 EUR). Requiere denuncia policial inmediata. Incluye asistencia psicologica post-atraco (3 sesiones por persona afectada).

9. Transporte de Fondos: hasta 3.000 EUR
Cobertura del dinero en efectivo durante su transporte desde el local hasta la entidad bancaria, en un radio maximo de 2 km. Cubre sustraccion con violencia durante el trayecto. Requiere que el transporte lo realice el titular, empleado autorizado o empresa de transporte de fondos.

10. Asistencia Informatica: incluida
Soporte tecnico telefon y remoto para incidencias informaticas del negocio: configuracion de equipos, instalacion de software, resolucion de problemas de red. Hasta 5 intervenciones por anualidad.

CALCULO DE FRANQUICIA:
La franquicia en este producto es variable: se aplica el MAYOR valor entre la cantidad fija minima (300 EUR) y el 10% del importe total del siniestro.
Ejemplo: siniestro de 2.000 EUR -> franquicia = MAX(300, 200) = 300 EUR.
Ejemplo: siniestro de 8.000 EUR -> franquicia = MAX(300, 800) = 800 EUR.

EXCLUSIONES ADICIONALES:
1. Actividades industriales (fabricacion, transformacion) o de almacenamiento masivo (logistica).
2. Comercios de alto riesgo: joyerias, armerias, estancos, gasolineras (requieren poliza especifica).
3. Comercio electronico puro (sin local fisico).

DOCUMENTACION NECESARIA:
- Toda la del Comercio Basico
- Para perdida de beneficios: declaraciones trimestrales de IVA, cuenta de resultados
- Para infidelidad de empleados: denuncia penal, pruebas documentales

PLAZOS:
- Comunicacion: 7 dias habiles
- Resolucion: 40 dias desde comunicacion
- Pago: 5 dias habiles tras acuerdo

Ver tambien: [[Condicionado Comercio Basico]], [[Exclusiones Comercio]]`
  },

  // =========================================================================
  // COMUNIDADES (2 notas)
  // =========================================================================
  {
    titulo: 'Condicionado Comunidades Basico',
    categoria: 'condicionado',
    tags: 'comunidades,basico,RC inmueble,incendio,agua zonas comunes,atmosfericos,adeslas',
    autor: 'departamento-producto',
    contenido: `Producto: Seguro de Comunidades de Propietarios - Basico
Nivel: Basico
Compania: SegurCaixa Adeslas
Prima desde: 280 EUR/ano (edificio hasta 20 viviendas)
Franquicia: 200 EUR por siniestro

COBERTURAS INCLUIDAS:

1. Responsabilidad Civil del Inmueble: hasta 600.000 EUR
Cubre los danos corporales y materiales causados a terceros como consecuencia de la propiedad, uso y mantenimiento del inmueble asegurado. Incluye:
- Caida de elementos de fachada (cornisas, baldosas, revestimientos) sobre viandantes o vehiculos.
- Danos por deficiente conservacion de aceras, accesos y zonas comunes.
- Danos a propiedades colindantes por filtraciones desde elementos comunes.
- RC por obras de mantenimiento en el edificio (siempre que las realice empresa con seguro de RC propio).
- RC del presidente y miembros de la junta de propietarios en el ejercicio de sus funciones.
Franquicia RC: 200 EUR por siniestro. Excluye RC de propietarios individuales por danos originados en sus viviendas (cubierto por seguro de hogar individual).

2. Incendio y Explosion: hasta el valor del continente asegurado
Danos al edificio (estructura, instalaciones comunes, fachadas) por incendio, explosion de gas u otros combustibles, caida de rayo y danos derivados del humo. Incluye:
- Gastos de extincion y salvamento.
- Desescombro de zonas comunes (hasta 10% del capital de continente).
- Honorarios tecnicos de reconstruccion (arquitecto, aparejador): hasta 5% del capital.
- Perdida de alquileres de locales comunitarios por inhabilitacion post-incendio: hasta 12 meses.

3. Danos por Agua en Zonas Comunes: hasta el valor del continente asegurado
Danos producidos por rotura, obstruccion o desbordamiento de instalaciones de agua comunitarias: bajantes, montantes, tuberias generales, depositos de agua, sistemas de riego de zonas ajardinadas comunes. Incluye:
- Localizacion de la averia: busqueda no destructiva (termografia, camaras endoscopicas) hasta 1.500 EUR.
- Reparacion de la tuberia o instalacion averiada: mano de obra y materiales, hasta 2.000 EUR.
- Reparacion de los danos consecuenciales en zonas comunes: albanileria, pintura, suelos.
- Si la averia de zona comun causa danos en viviendas particulares: la comunidad responde frente al propietario afectado con cargo a esta poliza.
Franquicia: 200 EUR por siniestro.

4. Fenomenos Atmosfericos: hasta el valor del continente asegurado
Danos en la estructura y elementos comunes del edificio por lluvia torrencial, viento (velocidad superior a 96 km/h), pedrisco, nieve y helada. Incluye danos en cubiertas (tejado, azotea), fachadas, patios, cristales de zonas comunes y antenas comunitarias.
Para eventos de caracter extraordinario (inundacion extraordinaria, terremoto): competencia del Consorcio de Compensacion de Seguros (CCS), cuyo recargo esta incluido en la prima.
Franquicia: 200 EUR por siniestro.

EXCLUSIONES PRINCIPALES:
1. Danos en el interior de las viviendas particulares (corresponde al seguro de hogar individual de cada propietario).
2. Defectos de construccion del edificio anteriores a la fecha de contratacion.
3. Falta de mantenimiento demostrable de las instalaciones comunes (revision obligatoria de gas cada 5 anos, ITE del edificio).
4. Danos derivados de obras de rehabilitacion no autorizadas por la junta de propietarios.
5. Danos a vehiculos en garaje comunitario (salvo RC del inmueble).
6. Danos por subsidencia y asientos del edificio durante los primeros 12 meses de poliza.

DOCUMENTACION NECESARIA:
- CIF de la comunidad de propietarios
- Acta de la junta de propietarios autorizando la contratacion del seguro
- Datos del inmueble: direccion, numero de viviendas, superficie construida, ano de construccion
- Informe de evaluacion del edificio (ITE/IEE) si el edificio tiene mas de 50 anos

PLAZOS:
- Comunicacion: 7 dias habiles
- Resolucion: 40 dias
- Pago: 5 dias habiles tras acuerdo

Ver tambien: [[Condicionado Comunidades Completo]], [[Procedimiento siniestro comunidades]]`
  },

  {
    titulo: 'Condicionado Comunidades Completo',
    categoria: 'condicionado',
    tags: 'comunidades,completo,agua viviendas,ascensor,defensa juridica,trabajadores,adeslas',
    autor: 'departamento-producto',
    contenido: `Producto: Seguro de Comunidades de Propietarios - Completo
Nivel: Completo
Compania: SegurCaixa Adeslas
Prima desde: 480 EUR/ano (edificio hasta 20 viviendas)
Franquicia: 100 EUR por siniestro

COBERTURAS INCLUIDAS:
Incluye todas las coberturas del Comunidades Basico (ver [[Condicionado Comunidades Basico]]) con capitales ampliados y coberturas adicionales:

1. RC Inmueble Ampliada: hasta 1.200.000 EUR (ampliada desde 600.000 EUR)
2. Franquicia Reducida: 100 EUR (reducida desde 200 EUR)

COBERTURAS ADICIONALES:

3. Danos por Agua en Viviendas Individuales: hasta 3.000 EUR por vivienda/siniestro
Ampliacion que cubre los danos causados por agua procedente de instalaciones comunitarias (bajantes, montantes, cubiertas) en el interior de las viviendas particulares de los propietarios. Cubre los danos a paredes, techos, suelos y contenido (mobiliario y enseres) de la vivienda afectada, hasta el sublimite de 3.000 EUR por vivienda y siniestro. Esta cobertura facilita la gestion al evitar que el propietario afectado deba reclamar a la comunidad: se gestiona directamente por la poliza comunitaria. Procedimiento detallado en [[Procedimiento siniestro comunidades]].

4. Responsabilidad Civil del Ascensor: hasta 300.000 EUR
Cubre los danos corporales y materiales a usuarios del ascensor comunitario derivados de averia, caida, atrapamiento o cualquier funcionamiento anomalo. Incluye:
- Indemnizaciones a los afectados.
- Gastos de rescate de personas atrapadas (bomberos o servicio de emergencia).
- Requiere que el ascensor tenga contrato de mantenimiento en vigor con empresa autorizada y certificado de inspeccion periodica (cada 2 o 4 anos segun comunidad autonoma).
- Excluye danos si el ascensor no tenia la revision reglamentaria en vigor.

5. Accidentes de Trabajadores en Zonas Comunes: hasta 50.000 EUR
Cobertura de accidentes que sufran personas que realizan trabajos de mantenimiento, limpieza, jardineria u obras menores en las zonas comunes del edificio por encargo de la comunidad. Cubre:
- Accidentes de porteros, conserjes y personal de limpieza contratados por la comunidad.
- Accidentes de trabajadores de empresas subcontratadas (la comunidad actua como subsidiaria si la empresa no tiene seguro).
- Indemnizacion por fallecimiento (30.000 EUR) e invalidez permanente (50.000 EUR).
- Complementaria a las coberturas de la Seguridad Social y del seguro de Convenio.

6. Defensa Juridica de la Comunidad: hasta 6.000 EUR
Cobertura de gastos de abogado y procurador para:
- Defensa de la comunidad en reclamaciones de terceros.
- Reclamacion de la comunidad contra constructores, arquitectos o promotores por defectos constructivos (Ley de Ordenacion de la Edificacion, LOE).
- Defensa frente a propietarios morosos: reclamacion judicial de cuotas impagadas (proceso monitorio).
- Defensa en procedimientos administrativos (sanciones urbanisticas, ITE).
- Libre eleccion de abogado para procedimientos de cuantia superior a 6.000 EUR.

7. Robo en Zonas Comunes: hasta 5.000 EUR
Sustraccion con fuerza de bienes situados en zonas comunes: extintores, mobiliario de porteria, equipos de limpieza, herramientas de mantenimiento, elementos decorativos fijos. Incluye robo del contenido del cuarto de contadores (equipos de telecomunicaciones, cuadros electricos). Requiere denuncia policial.

8. Rotura de Cristales Comunitarios: hasta 2.000 EUR/ano
Cristales de escaleras, portales, lucernarios, claraboyas, puertas de acceso y cristales de cuartos comunes.

9. Asistencia en el Edificio 24h: incluida
Servicio de urgencias para zonas comunes: fontaneria (bajantes atascados, fugas en montantes), electricidad (averias en alumbrado comunitario, cuadro general), cerrajeria (portales, cuartos comunes). Hasta 4 intervenciones por anualidad. Primera hora de mano de obra y materiales basicos incluidos.

EXCLUSIONES ADICIONALES:
1. Danos por falta de ITE (Inspeccion Tecnica de Edificios) cuando sea obligatoria.
2. RC de garaje por atropello o colision entre vehiculos de comuneros.
3. Danos a piscina comunitaria (requiere extension especifica).

DOCUMENTACION NECESARIA:
- Toda la del nivel Basico
- Contrato de mantenimiento del ascensor (si aplica)
- Certificado de revision del ascensor
- Actas de junta con acuerdos de obras o reformas

PLAZOS:
- Comunicacion: 7 dias habiles
- Resolucion: 40 dias
- Asistencia urgente: tiempo maximo de respuesta 3 horas

Ver tambien: [[Condicionado Comunidades Basico]], [[Procedimiento siniestro comunidades]]`
  },

  // =========================================================================
  // RC (2 notas)
  // =========================================================================
  {
    titulo: 'Condicionado RC Profesional',
    categoria: 'condicionado',
    tags: 'RC,profesional,errores,omisiones,datos,defensa,claims-made,adeslas',
    autor: 'departamento-producto',
    contenido: `Producto: Seguro de Responsabilidad Civil Profesional
Nivel: Estandar
Compania: SegurCaixa Adeslas
Prima desde: 280 EUR/ano (actividades de bajo riesgo)
Franquicia: 500 EUR por reclamacion

MODALIDAD DEL SEGURO: CLAIMS-MADE (Reclamaciones Presentadas)
Este seguro opera en base claims-made: cubre las reclamaciones PRESENTADAS contra el asegurado durante el periodo de vigencia de la poliza, independientemente de cuando se cometio el error u omision profesional, siempre que la fecha de la prestacion profesional sea posterior a la FECHA RETROACTIVA. La fecha retroactiva es la fecha de efecto de la primera poliza contratada de forma ininterrumpida con la compania (o la fecha indicada en Condiciones Particulares).

COBERTURAS INCLUIDAS:

1. Errores y Omisiones Profesionales: hasta 300.000 EUR
Cubre la responsabilidad civil del asegurado frente a clientes y terceros por danos patrimoniales (lucro cesante, dano emergente) derivados de errores, negligencias, omisiones o imprudencias cometidos en el ejercicio de la actividad profesional declarada en poliza. Ejemplos: calculo erroneo de un ingeniero, asesoramiento fiscal incorrecto, diagnostico medico incompleto (para profesiones sanitarias, poliza especifica), diseno defectuoso de un arquitecto, error contable de un asesor.

2. Responsabilidad por Brecha de Datos Personales: hasta 50.000 EUR
Cubre los gastos y responsabilidades derivados de una brecha de seguridad que afecte a datos personales de clientes del asegurado, conforme al Reglamento General de Proteccion de Datos (RGPD) y la LOPDGDD. Incluye:
- Gastos de notificacion a los afectados y a la AEPD (Agencia Espanola de Proteccion de Datos).
- Gastos de asesoria legal especializada en proteccion de datos.
- Indemnizaciones a afectados por danos morales derivados de la filtracion.
- NO cubre: multas administrativas de la AEPD (son inasegurables por ley).

3. Gastos de Defensa Juridica: incluidos dentro del limite de 300.000 EUR
Honorarios de abogado, procurador, peritos y costas judiciales para la defensa del asegurado en procedimientos judiciales o extrajudiciales derivados de una reclamacion cubierta. Los gastos de defensa consumen capital (se deducen del limite global). Libre eleccion de abogado en todo caso (Art. 76.d LCS).

4. Gastos de Constitucion de Fianzas: hasta 30.000 EUR
Si en el marco de un procedimiento penal derivado de la actividad profesional se exige fianza al asegurado para evitar prision provisional, la compania adelanta el importe (hasta 30.000 EUR), que debera ser reembolsado por el asegurado al termino del procedimiento.

EXCLUSIONES PRINCIPALES:
1. Reclamaciones derivadas de conducta dolosa, fraude o actos criminales del asegurado.
2. Responsabilidad contractual por incumplimiento de plazos de entrega o penalizaciones contractuales (salvo que el incumplimiento derive de un error profesional cubierto).
3. Responsabilidad como empleador (danos a empleados, acoso laboral): requiere poliza especifica.
4. Reclamaciones entre profesionales asociados o socios del mismo despacho.
5. Reclamaciones derivadas de actividad profesional no declarada en poliza.
6. Multas, sanciones administrativas y recargos por infracciones.
7. Danos corporales (requiere poliza de RC General).

PROFESIONES CUBIERTAS (sin exhaustividad):
Abogados, economistas, auditores, asesores fiscales, ingenieros, arquitectos, dissenadores, consultores, informaticos, periodistas, publicistas, corredores de seguros, administradores de fincas, y profesiones liberales en general. Para profesiones sanitarias, se requiere poliza RC Profesional Sanitaria especifica.

DOCUMENTACION NECESARIA:
- Descripcion detallada de la actividad profesional
- Facturacion anual del profesional o despacho
- Numero de socios y empleados
- Historial de reclamaciones (ultimos 5 anos)

PLAZOS:
- Comunicacion de reclamacion: inmediata, en todo caso antes de 7 dias desde su recepcion
- No reconocer responsabilidad sin autorizacion de la compania
- Periodo de descubrimiento post-cancelacion: 1 ano (el asegurado tiene 1 ano tras cancelar la poliza para comunicar reclamaciones relativas a hechos ocurridos durante la vigencia)

Ver tambien: [[Condicionado RC General]]`
  },

  {
    titulo: 'Condicionado RC General',
    categoria: 'condicionado',
    tags: 'RC,general,lesiones,danos materiales,productos,occurrence,adeslas',
    autor: 'departamento-producto',
    contenido: `Producto: Seguro de Responsabilidad Civil General
Nivel: Estandar
Compania: SegurCaixa Adeslas
Prima desde: 350 EUR/ano
Franquicia: 300 EUR por siniestro

MODALIDAD DEL SEGURO: OCCURRENCE (Base Ocurrencia)
Este seguro opera en base ocurrencia: cubre los siniestros (hechos danosos) que OCURRAN durante el periodo de vigencia de la poliza, independientemente de cuando se presente la reclamacion, siempre que esta se presente dentro del plazo legal de prescripcion (1 ano para RC extracontractual segun Art. 1968 CC, o 5 anos segun jurisprudencia reciente post-reforma 2015).

COBERTURAS INCLUIDAS:

1. Danos Corporales a Terceros: hasta 600.000 EUR por siniestro y anualidad
Indemnizaciones por lesiones corporales (incluido fallecimiento) causados involuntariamente a terceros como consecuencia de la actividad del asegurado, de sus instalaciones o de sus productos. Incluye gastos medicos, incapacidades temporales y permanentes, perjuicio estetico, dano moral. La valoracion de danos corporales se realiza conforme al Baremo de la Ley 35/2015 (para accidentes de trafico) por analogia, o segun pericial medica en otros ambitos.

2. Danos Materiales a Terceros: hasta 600.000 EUR por siniestro y anualidad
Indemnizaciones por deterioro, destruccion o perdida de bienes propiedad de terceros causados por la actividad del asegurado. El limite es compartido con danos corporales (limite agregado anual: 600.000 EUR). Incluye lucro cesante del tercero derivado del dano material (hasta el 10% del importe del dano material).

3. Responsabilidad Civil de Productos: hasta 600.000 EUR
Cubre los danos causados a terceros por productos fabricados, transformados, envasados, etiquetados, importados o distribuidos por el asegurado, despues de su entrega al comprador o usuario. Se rige por el Real Decreto Legislativo 1/2007 (Texto Refundido de la Ley de Defensa de Consumidores y Usuarios). Incluye:
- Defectos de fabricacion.
- Defectos de diseno.
- Defectos de informacion (etiquetado, instrucciones de uso insuficientes).
Excluye: retirada de productos del mercado (recall) y coste del producto defectuoso.

4. Responsabilidad Civil Post-Trabajos (Completed Operations): incluida
Cubre los danos que se manifiesten despues de finalizada la obra o servicio contratado por el asegurado, derivados de un error o defecto en la ejecucion. Ejemplo: una instalacion de fontaneria realizada por el asegurado que produce una fuga 3 meses despues de la entrega. Periodo post-trabajos: durante toda la vigencia de la poliza (para trabajos realizados durante la vigencia).

5. RC Patronal (Complementaria): hasta 150.000 EUR por trabajador
Responsabilidad civil del asegurado como empleador frente a sus trabajadores por accidentes laborales o enfermedades profesionales, complementaria a las prestaciones de la Seguridad Social. Cubre el recargo de prestaciones por falta de medidas de seguridad (Art. 164 LGSS) y las indemnizaciones civiles por dano moral y perjuicio adicional.

6. RC Cruzada (si varios asegurados en poliza): incluida
En polizas con varios coinasegurados (por ejemplo, contratista y subcontratista), la cobertura opera entre ellos como si fueran terceros entre si, cubriendo los danos que uno cause al otro.

7. Gastos de Defensa: incluidos dentro del limite
Abogado, procurador, peritos judiciales y extrajudiciales, costas procesales. Libre eleccion de letrado.

EXCLUSIONES PRINCIPALES:
1. Responsabilidad contractual pura (incumplimiento de contrato sin dano a bienes o personas).
2. Danos al propio producto del asegurado (garantia de producto).
3. Contaminacion gradual (requiere poliza de RC Medioambiental).
4. Danos por amianto o materiales prohibidos.
5. Responsabilidad profesional (errores intelectuales): cubierta por [[Condicionado RC Profesional]].
6. Danos nucleares y guerra.
7. Multas y sanciones administrativas.
8. Danos causados por vehiculos a motor en circulacion (cubiertos por el seguro obligatorio de auto).

DOCUMENTACION NECESARIA:
- Descripcion de la actividad empresarial o profesional
- Facturacion anual
- Numero de empleados
- Descripcion de productos fabricados o servicios prestados
- Historial de siniestros de RC (ultimos 5 anos)

PLAZOS:
- Comunicacion: 7 dias desde el conocimiento del hecho danoso
- Comunicacion de demanda judicial: inmediata (24 horas)
- Prescripcion: 1 ano desde el conocimiento del dano por el perjudicado

Ver tambien: [[Condicionado RC Profesional]]`
  },

  // =========================================================================
  // PROCEDIMIENTOS GENERALES (5 notas)
  // =========================================================================
  {
    titulo: 'Plazos legales siniestros',
    categoria: 'procedimiento',
    tags: 'plazos,legales,LCS,comunicacion,resolucion,pago,intereses,mora,adeslas',
    autor: 'departamento-juridico',
    contenido: `Procedimiento: Plazos Legales en la Gestion de Siniestros
Base legal: Ley 50/1980 de 8 de octubre, de Contrato de Seguro (LCS)
Actualizado conforme a jurisprudencia del Tribunal Supremo hasta 2025

PLAZOS PARA EL ASEGURADO:

1. Comunicacion del siniestro al asegurador (Art. 16 LCS):
- Plazo general: 7 dias habiles desde que el asegurado tuvo conocimiento del siniestro.
- Excepcion: en seguro de vida, no hay plazo especifico para la comunicacion del fallecimiento.
- Consecuencias del incumplimiento: la demora solo perjudica al asegurado si ha causado perjuicio al asegurador (por ejemplo, imposibilidad de verificar las circunstancias del siniestro). El asegurador puede reducir la prestacion en proporcion al perjuicio sufrido. La falta de comunicacion NO exonera al asegurador de su obligacion de pago si no ha sufrido perjuicio demostrable.

2. Deber de mitigar los danos (Art. 17 LCS):
- El asegurado debe emplear los medios a su alcance para aminorar las consecuencias del siniestro.
- Los gastos de salvamento corren a cargo del asegurador, incluso si superan el capital asegurado.
- El incumplimiento del deber de salvamento faculta al asegurador a reducir la prestacion.

PLAZOS PARA EL ASEGURADOR:

3. Acuse de recibo de la comunicacion: 24 horas habiles
- Buena practica sectorial (no obligatorio por ley): confirmar al asegurado la recepcion de la comunicacion del siniestro en un plazo maximo de 24 horas habiles. Obligatorio en reclamaciones de consumidores segun normativa DGSFP.

4. Decision de cobertura (comunicacion de aceptacion o rechazo): 5 dias habiles
- El asegurador debe comunicar al asegurado si el siniestro esta cubierto o no en un plazo razonable. La jurisprudencia del TS establece que 5 dias habiles es un plazo razonable. Si se requiere investigacion adicional (peritacion, documentacion complementaria), se debe comunicar al asegurado el estado del expediente y la documentacion pendiente.

5. Plazo maximo de resolucion e indemnizacion (Art. 18 LCS):
- El asegurador esta obligado al pago de la prestacion dentro de los 40 DIAS siguientes a la recepcion de la declaracion del siniestro.
- Este plazo de 40 dias se computa desde que el asegurado comunica el siniestro y aporta la documentacion basica necesaria.
- Dentro de los 40 dias, el asegurador debe: investigar el siniestro, realizar la peritacion, determinar la indemnizacion y efectuar el pago.

6. Pago del importe minimo indiscutido (Art. 18.5 LCS):
- Si hay desacuerdo sobre la cuantia de la indemnizacion, el asegurador debe pagar, dentro de los 40 dias, el importe minimo que reconozca como debido (importe minimo indiscutido), sin perjuicio de la posterior liquidacion definitiva.

7. MORA DEL ASEGURADOR E INTERESES DE DEMORA (Art. 20 LCS):
Si el asegurador no cumple su obligacion de pago dentro de los 40 dias, incurre en mora y debera abonar:
- Intereses de demora: el interes legal del dinero vigente en el momento del devengo, incrementado en un 50%.
- A partir de los 2 ANOS desde la fecha del siniestro: el interes de demora no podra ser inferior al 20% anual.
- Estos intereses se aplican sobre el importe de la indemnizacion adeudada.
- El asegurador queda exonerado de la mora solo si demuestra que el retraso se debio a causa justificada o que no le fue posible determinar la prestacion (necesidad de resolucion judicial, investigacion penal en curso, etc.).

PLAZOS DE PRESCRIPCION (Art. 23 LCS):
- Seguro de danos: 2 anos desde la fecha del siniestro.
- Seguro de personas (vida, accidentes, decesos): 5 anos desde el hecho que da derecho a la prestacion.
- La prescripcion se interrumpe por reclamacion extrajudicial fehaciente (burofax), por interposicion de demanda judicial, o por reconocimiento del derecho por parte del asegurador.

PROCEDIMIENTO INTERNO RECOMENDADO:
- Dia 0: Recepcion del parte -> confirmar recepcion en 24h.
- Dia 1-5: Verificar poliza, coberturas, franquicia. Comunicar al asegurado si esta cubierto o no.
- Dia 5-15: Asignar perito, solicitar documentacion complementaria.
- Dia 15-30: Recibir informe pericial, valorar indemnizacion.
- Dia 30-40: Comunicar propuesta al asegurado, negociar si hay desacuerdo, efectuar pago.
- Si se supera dia 40 sin pago: activar protocolo de mora, calcular intereses, informar a direccion.

Ver tambien: [[Procedimiento apertura siniestro auto]], [[Procedimiento apertura siniestro hogar]], [[Baremos indemnizacion auto]]`
  },

  {
    titulo: 'Baremos indemnizacion auto',
    categoria: 'procedimiento',
    tags: 'baremo,indemnizacion,auto,lesiones,incapacidad,fallecimiento,trafico,adeslas',
    autor: 'departamento-juridico',
    contenido: `Procedimiento: Baremos de Indemnizacion por Accidente de Circulacion
Base legal: Ley 35/2015 de 22 de septiembre (reforma del sistema de valoracion de danos y perjuicios por accidentes de trafico)
Tablas actualizadas: Resolucion DGSFP anual (ultima: BOE enero 2026)

ESTRUCTURA DEL BAREMO:

El baremo de trafico se aplica obligatoriamente para la valoracion de danos personales en accidentes de circulacion. Se estructura en tres grandes bloques:

TABLA 1: INDEMNIZACIONES POR FALLECIMIENTO
Cuantias segun el parentesco del beneficiario con el fallecido (importes orientativos actualizados 2026):
- Conyuge o pareja de hecho (hasta 65 anos): 90.000 - 120.000 EUR
- Conyuge o pareja de hecho (mas de 65 anos): 50.000 - 70.000 EUR
- Cada hijo menor de edad: 70.000 - 90.000 EUR
- Cada hijo mayor de edad (hasta 30 anos): 40.000 - 55.000 EUR
- Cada hijo mayor de 30 anos: 15.000 - 25.000 EUR
- Cada padre/madre (si fallecido menor de 30 anos): 40.000 - 60.000 EUR
- Cada padre/madre (si fallecido mayor de 30 anos): 15.000 - 25.000 EUR
- Cada hermano menor de edad: 15.000 - 20.000 EUR
- Cada hermano mayor de edad: 7.000 - 15.000 EUR
Los importes se ajustan anualmente por IPC y se individualizan por las circunstancias personales y familiares del caso (convivencia, dependencia economica, perjuicio patrimonial).

TABLA 2: INCAPACIDAD TEMPORAL (lesiones temporales)
Indemnizacion diaria por cada dia de recuperacion:
- Dia de hospitalizacion (perjuicio personal muy grave): 105-115 EUR/dia
- Dia impeditivo (baja laboral efectiva): 60-70 EUR/dia
- Dia no impeditivo moderado (limitacion parcial de actividades): 35-45 EUR/dia
- Dia no impeditivo basico (molestias sin limitacion significativa): 30-38 EUR/dia
Ademas de la indemnizacion diaria por perjuicio personal, se indemnizan:
- Dano patrimonial: ingresos netos dejados de percibir por incapacidad temporal.
- Gastos medicos: asistencia sanitaria, rehabilitacion, transporte sanitario no cubiertos por la Seguridad Social.

TABLA 3: SECUELAS PERMANENTES (incapacidad permanente)
Valoracion en puntos (0 a 100) segun el baremo medico de secuelas:
- Cada punto de secuela tiene un valor economico que depende de la edad de la victima y del numero total de puntos.
- Victima de 20 anos, 10 puntos: aprox. 10.000 - 12.000 EUR.
- Victima de 40 anos, 10 puntos: aprox. 8.000 - 10.000 EUR.
- Victima de 60 anos, 10 puntos: aprox. 5.000 - 7.000 EUR.
- A mayor numero de puntos, el valor marginal de cada punto aumenta (formula polinomica).
- Perjuicio estetico: se valora por separado en escala de 1 a 50 puntos.

EJEMPLOS DE PUNTUACION DE SECUELAS HABITUALES EN SINIESTROS AUTO:
- Cervicalgia postraumatica (latigazo cervical) leve: 1-3 puntos
- Cervicalgia moderada con limitacion funcional: 3-8 puntos
- Fractura vertebral sin deficit neurologico: 5-15 puntos
- Limitacion de movilidad de rodilla (tras fractura): 5-20 puntos
- Amputacion de una falange: 3-5 puntos
- Estres postraumatico leve: 1-3 puntos
- Cicatriz facial visible: 1-10 puntos (estetico)

DANO PATRIMONIAL FUTURO (lucro cesante por incapacidad permanente):
Se calcula mediante multiplicandos (ingreso anual neto del perjudicado) y multiplicadores (tabla actuarial en funcion de la edad y grado de incapacidad). Para gran invalidez se anaden gastos de asistencia de tercera persona (entre 30.000 y 60.000 EUR anuales segun grado de dependencia).

PROCEDIMIENTO DE APLICACION DEL BAREMO:
1. El medico valorador o forense determina los dias de incapacidad temporal (Tabla 2) y las secuelas permanentes (Tabla 3).
2. El tramitador aplica las tablas economicas vigentes.
3. Se calcula la indemnizacion sumando: dias de IT + puntos de secuelas + dano patrimonial (lucro cesante) + gastos + dano moral.
4. Se presenta oferta motivada al perjudicado en el plazo de 3 meses desde la recepcion de la documentacion medica completa.

Ver tambien: [[Plazos legales siniestros]], [[Procedimiento apertura siniestro auto]], [[Baremos incapacidad]]`
  },

  {
    titulo: 'Criterios deteccion fraude',
    categoria: 'procedimiento',
    tags: 'fraude,deteccion,indicadores,red flags,investigacion,prevencion,adeslas',
    autor: 'departamento-antifraude',
    contenido: `Procedimiento: Criterios de Deteccion de Fraude en Siniestros
Compania: SegurCaixa Adeslas
Departamento: Unidad de Investigacion de Fraude (UIF)
Clasificacion: Confidencial - Uso interno
Version: 4.1

INTRODUCCION:
El fraude al seguro representa entre el 5% y el 10% de las primas cobradas en el sector asegurador espanol (estimacion ICEA/UNESPA). La deteccion temprana es esencial para la sostenibilidad del sistema. Este documento recoge los indicadores objetivos (red flags) que deben activar la revision por la UIF.

INDICADORES DE ALERTA (SCORING DE FRAUDE):
Cada indicador suma puntos al score de fraude del expediente. Si el score total supera 65 puntos, el expediente se escala automaticamente a la UIF.

INDICADORES TEMPORALES (hasta 25 puntos):
1. Siniestro comunicado dentro de los 30 primeros dias desde la contratacion de la poliza: +15 puntos. La proximidad entre contratacion y siniestro es el indicador estadistico mas fuerte de fraude.
2. Siniestro comunicado dentro de los 60 dias desde un aumento de capitales: +10 puntos.
3. Siniestro comunicado justo antes del vencimiento de la poliza (ultimos 15 dias): +5 puntos.
4. Multiples siniestros en el mismo periodo de poliza (3 o mas): +15 puntos.
5. Historial de siniestros con otras companias (consulta TIREA/SINCO): +10 puntos si hay 3 o mas siniestros en los ultimos 3 anos con distintas aseguradoras.

INDICADORES DOCUMENTALES (hasta 25 puntos):
6. Fotografias con metadatos EXIF incoherentes: fecha de captura anterior al siniestro, geolocalizacion distinta al lugar declarado, o metadatos eliminados manualmente: +15 puntos.
7. Parte europeo de accidente con caligrafia identica en ambas firmas: +10 puntos.
8. Facturas o presupuestos de talleres/proveedores con irregularidades: NIF invalido, formato no estandar, importes inflados respecto a baremo: +10 puntos.
9. Documentacion medica con diagnostico desproporcionado respecto a la dinamica del accidente: +10 puntos (ejemplo: gran cervicalgia por alcance a 5 km/h).

INDICADORES CONDUCTUALES (hasta 25 puntos):
10. El asegurado presiona para una resolucion rapida y rechaza la peritacion presencial: +10 puntos.
11. El asegurado tiene conocimiento inusualmente detallado del proceso de reclamacion y de los limites de cobertura: +5 puntos.
12. El asegurado no puede ser localizado o proporciona datos de contacto cambiantes: +10 puntos.
13. Testigos que son familiares o conocidos del asegurado: +5 puntos.
14. Negativa a aportar documentacion complementaria solicitada (facturas, certificados): +10 puntos.

INDICADORES DE RED/PATRON (hasta 25 puntos):
15. Vinculacion con redes de fraude conocidas (base de datos interna y UNESPA): +25 puntos (escalado inmediato).
16. Concentracion geografica: multiples siniestros del mismo tipo en un radio de 2 km con talleres o proveedores comunes: +15 puntos.
17. Patron temporal: siniestros en dias especificos (viernes noche, puentes, vispera de vacaciones) correlacionados con tipo de siniestro (robo de vehiculo, dano propio): +5 puntos.
18. Mismo abogado o perito privado en multiples expedientes con patron sospechoso: +10 puntos.

PROCEDIMIENTO AL SUPERAR UMBRAL (score > 65):
1. El sistema bloquea la resolucion automatica del expediente.
2. Se genera alerta automatica a la UIF con resumen del scoring.
3. La UIF asigna investigador en un plazo maximo de 24 horas.
4. El investigador revisa toda la documentacion, realiza entrevista al asegurado y, si procede, contrata investigador privado.
5. Plazo de investigacion: 15 dias habiles (prorrogable a 30 con autorizacion del jefe de la UIF).
6. Resultado: a) Fraude descartado (se reanuda tramitacion normal); b) Fraude confirmado (se deniega siniestro, se anula poliza por dolo Art. 19 LCS, y se valora denuncia penal por estafa Art. 248 CP).

Ver tambien: [[Plazos legales siniestros]], [[Guia escalado por departamentos]]`
  },

  {
    titulo: 'Protocolo DANA y catastrofes',
    categoria: 'procedimiento',
    tags: 'DANA,catastrofe,emergencia,CCS,consorcio,protocolo,masivo,adeslas',
    autor: 'departamento-operaciones',
    contenido: `Procedimiento: Protocolo de Actuacion ante DANA y Catastrofes Naturales
Compania: SegurCaixa Adeslas
Version: 3.0 - Actualizado tras la experiencia DANA noviembre 2024
Clasificacion: Operativo

DEFINICION Y ACTIVACION:
Este protocolo se activa cuando se produce un evento catastrofico que genera un volumen excepcional de siniestros en un area geografica concentrada. Eventos tipicos: DANA (Depresion Aislada en Niveles Altos), gota fria, inundaciones, temporales de viento, pedriscos severos, nevadas extraordinarias, terremotos.

CRITERIOS DE ACTIVACION:
- AEMET emite alerta roja o naranja en una o varias provincias.
- Proteccion Civil activa algun nivel de emergencia (nivel 1, 2 o 3).
- Se reciben mas de 50 comunicaciones de siniestro de la misma zona en menos de 24 horas.
- Activacion del Consorcio de Compensacion de Seguros (CCS) para riesgos extraordinarios.

QUIEN ACTIVA: Director de Operaciones, Director de Siniestros o responsable de guardia (fuera de horario laboral).

FASE 1: ACTIVACION DE EMERGENCIA (0-24 horas)
1. Comunicacion interna: notificacion a todos los departamentos via email y canal de emergencia interno. Convocatoria del Comite de Crisis (Director General, Director de Operaciones, Director de Siniestros, Director de Comunicacion, Director IT).
2. Activacion del Centro de Atencion de Emergencias (CAE): lineas telefonicas adicionales con operadores reforzados (hasta x5 de capacidad habitual).
3. Activacion del canal de comunicacion masiva: envio de SMS y push notification a todos los asegurados de la zona afectada con instrucciones: "Si ha sufrido danos, documente con fotos y contacte con nosotros en las proximas 72 horas. No tire ningun objeto danado. Numero de emergencia: 900 200 200."
4. Habilitacion de formulario simplificado de comunicacion de siniestro: formulario online con datos minimos (numero de poliza, tipo de dano, direccion, telefono, 2 fotos).

FASE 2: GESTION MASIVA DE SINIESTROS (24-72 horas)
1. Apertura automatica de expedientes con documentacion simplificada: no se exige parte europeo, denuncia ni presupuestos en esta fase. Solo: poliza, descripcion del dano, fotografias.
2. Clasificacion automatica por gravedad (triage): Verde (danos menores, <2.000 EUR), Amarillo (danos moderados, 2.000-15.000 EUR), Rojo (danos graves, >15.000 EUR o vivienda inhabitable).
3. Autorizacion rapida (fast-track) para danos menores (Verde): el gestor puede autorizar reparacion sin peritacion presencial para importes inferiores a 2.000 EUR (fotoperitacion).
4. Despliegue de peritos de refuerzo: movilizar peritos de otras provincias no afectadas. Acuerdo con empresas de peritacion externas para refuerzo temporal.
5. Coordinacion con proveedores de emergencia: activacion de red de limpiezas, bombeos, secado industrial, desescombro, cerrajeria y cristaleria en la zona.

FASE 3: COORDINACION CON EL CONSORCIO DE COMPENSACION DE SEGUROS (CCS)
Los riesgos extraordinarios (inundacion, terremoto, tsunami, erupcion volcanica, tempestad ciclonica atipica) estan cubiertos por el CCS, no por la compania aseguradora. Procedimiento:
1. La compania recibe la comunicacion del siniestro y abre expediente.
2. Si el siniestro corresponde a riesgo extraordinario: la compania transfiere el expediente al CCS a traves del sistema SIGER.
3. El CCS nombra perito propio y gestiona directamente la indemnizacion.
4. La compania colabora facilitando datos de la poliza y del asegurado.
5. Los danos "ordinarios" producidos durante el evento (por ejemplo, rotura de tuberia coincidente con la DANA pero no causada por la inundacion) se gestionan por la compania.

FASE 4: RESOLUCION Y SEGUIMIENTO (72 horas - 6 meses)
1. Seguimiento semanal de cada expediente abierto en zona catastrofica.
2. Informes semanales al CCS para expedientes transferidos.
3. Informe mensual de evolucion al Consejo de Direccion.
4. Provision economica especial: calculo de provision IBNR (Incurred But Not Reported) para siniestros aun no comunicados de la zona afectada.
5. Revision trimestral de la provision y ajuste.

LECCIONES APRENDIDAS (DANA noviembre 2024, Valencia):
- 3.247 expedientes abiertos en 15 dias.
- Tiempo medio de primera respuesta: 1.8 horas (objetivo: <2h, cumplido).
- Cuello de botella critico: disponibilidad de peritos presenciales (solucion: fotoperitacion masiva).
- Ratio de fraude detectado: 3.2% (inferior al habitual del 5%, posiblemente por la gravedad del evento).

Ver tambien: [[Plazos legales siniestros]], [[Procedimiento apertura siniestro hogar]], [[Criterios deteccion fraude]]`
  },

  {
    titulo: 'Guia escalado por departamentos',
    categoria: 'procedimiento',
    tags: 'escalado,departamentos,fraude,legal,atencion cliente,direccion,procedimiento,adeslas',
    autor: 'departamento-operaciones',
    contenido: `Procedimiento: Guia de Escalado de Expedientes por Departamentos
Compania: SegurCaixa Adeslas
Version: 2.3
Ultima actualizacion: enero 2026

OBJETIVO:
Definir los criterios claros para que los gestores de siniestros, agentes IA y operadores escalen los expedientes al departamento competente, evitando retrasos, duplicidades y errores de asignacion.

DEPARTAMENTO 1: UNIDAD DE INVESTIGACION DE FRAUDE (UIF)
Escalado obligatorio cuando:
- Score de fraude del expediente supera 65 puntos (ver [[Criterios deteccion fraude]]).
- El perito informa de incoherencias graves entre los danos y la dinamica declarada.
- Se detectan documentos falsificados o manipulados (fotos con metadatos alterados, facturas con NIF falso).
- El asegurado ha tenido 3 o mas siniestros del mismo tipo en los ultimos 2 anos.
- El asegurado aparece en la base de datos de fraude compartida del sector (UNESPA/ICEA).
Forma de escalado: marcar expediente como "sospecha de fraude" en el sistema + email a uif@segurcaixa.es con resumen del caso y adjuntando las evidencias.
Tiempo de respuesta de la UIF: 24 horas habiles para acusar recibo, 15 dias para informe preliminar.

DEPARTAMENTO 2: DEPARTAMENTO JURIDICO / LEGAL
Escalado obligatorio cuando:
- Se recibe demanda judicial (citacion, providencia de admision de demanda, requerimiento judicial).
- El asegurado o el tercero perjudicado menciona que tiene abogado o que va a interponer denuncia.
- El siniestro implica lesiones graves (hospitalizacion >72h, secuelas permanentes, fallecimiento).
- Existe conflicto de intereses entre tomador y asegurado, o entre asegurado y beneficiario.
- Se requiere intervencion del Consorcio de Compensacion de Seguros por riesgo extraordinario.
- Reclamacion ante la DGSFP (Direccion General de Seguros y Fondos de Pensiones).
Forma de escalado: crear incidencia juridica en el sistema + email a legal@segurcaixa.es adjuntando toda la documentacion del expediente y las comunicaciones recibidas del abogado o juzgado.
Tiempo de respuesta: 24 horas habiles. Si hay plazo procesal urgente, contacto telefonico inmediato.

DEPARTAMENTO 3: ATENCION AL CLIENTE / EXPERIENCIA CLIENTE
Escalado obligatorio cuando:
- El asegurado presenta queja formal o reclamacion escrita.
- El asegurado solicita hablar con un responsable (no acepta la respuesta del gestor).
- El asegurado menciona que va a acudir al Defensor del Asegurado, OMIC, Junta Arbitral de Consumo o redes sociales/medios de comunicacion.
- NPS (Net Promoter Score) del cliente es detractor (puntuacion 0-6) tras la encuesta de satisfaccion post-siniestro.
- El expediente ha superado los 40 dias sin resolucion (mora, ver [[Plazos legales siniestros]]).
- El cliente ha llamado 3 o mas veces por el mismo asunto sin obtencion de respuesta satisfactoria.
Forma de escalado: crear incidencia de calidad en el sistema + email a atencion.cliente@segurcaixa.es con cronologia de gestiones realizadas.
Tiempo de respuesta: 4 horas habiles en horario laboral.

DEPARTAMENTO 4: DIRECCION DE SINIESTROS / DIRECCION GENERAL
Escalado obligatorio cuando:
- El importe del siniestro supera 50.000 EUR.
- El siniestro tiene o puede tener repercusion mediatica (personaje publico, accidente con victimas multiples, tema sensible socialmente).
- Se requiere autorizacion para ofrecer indemnizacion superior al limite de poliza (decision comercial).
- Existe riesgo reputacional para la compania (el asegurado amenaza con ir a medios de comunicacion o redes sociales con repercusion potencial).
- El siniestro afecta a un cliente VIP, gran cuenta o mediador estrategico.
- Litigio en el que se reclama mas de 100.000 EUR.
Forma de escalado: email directo a direccion.siniestros@segurcaixa.es con informe ejecutivo (1 pagina: resumen del caso, importe, riesgo, propuesta de actuacion). Si es urgente (medios de comunicacion implicados), contacto telefonico inmediato con el Director de Siniestros.
Tiempo de respuesta: 2 horas habiles. Para temas mediaticos: 30 minutos.

DEPARTAMENTO 5: DEPARTAMENTO MEDICO / CORPORALES
Escalado obligatorio cuando:
- El siniestro implica lesiones corporales con baja medica superior a 30 dias.
- Se requiere valoracion medica de secuelas permanentes (aplicacion del baremo, ver [[Baremos indemnizacion auto]]).
- El lesionado solicita reembolso de gastos medicos privados.
- Se recibe informe de alta del Servicio Publico de Salud con secuelas.
Forma de escalado: asignar expediente al equipo medico en el sistema + adjuntar toda la documentacion clinica.
Tiempo de respuesta: 48 horas habiles.

REGLA GENERAL:
En caso de duda sobre el departamento de escalado, el gestor debe consultar con su supervisor directo. Nunca se debe dejar un expediente sin escalado cuando cumple alguno de los criterios anteriores. El sistema de gestion registra automaticamente el tiempo de respuesta de cada departamento para la medicion de SLAs internos.

Ver tambien: [[Criterios deteccion fraude]], [[Plazos legales siniestros]], [[Baremos indemnizacion auto]], [[Protocolo DANA y catastrofes]], [[Procedimiento apertura siniestro auto]], [[Procedimiento apertura siniestro hogar]]`
  }
];

// =============================================================================
// FUNCION PRINCIPAL DE SEED
// =============================================================================

async function seedCondicionados() {
  console.log('Condicionados Adeslas: verificando si ya existen...');

  // Comprobar si ya se han insertado (buscar la primera nota)
  const yaExiste = await notaExiste('Condicionado Auto - Terceros Basico');
  if (yaExiste) {
    console.log('Condicionados Adeslas: ya insertados, omitiendo seed.');
    return;
  }

  console.log(`Condicionados Adeslas: insertando ${NOTAS_CONDICIONADOS.length} notas...`);

  let insertadas = 0;
  let errores = 0;

  for (const nota of NOTAS_CONDICIONADOS) {
    try {
      // Usar la categoria 'procedimiento' para notas de procedimientos,
      // y 'condicionado' para el resto
      const categoria = nota.categoria === 'procedimiento' ? 'procedimientos' : nota.categoria;

      await wikiService.crearNota({
        titulo: nota.titulo,
        contenido: nota.contenido,
        categoria: categoria,
        tags: nota.tags.split(',').map(t => t.trim()),
        autor: nota.autor
      });
      insertadas++;
      if (insertadas % 5 === 0) {
        console.log(`  ... ${insertadas}/${NOTAS_CONDICIONADOS.length} notas insertadas`);
      }
    } catch (err) {
      errores++;
      console.error(`  Error insertando "${nota.titulo}": ${err.message}`);
    }
  }

  console.log(`Condicionados Adeslas: ${insertadas} notas insertadas, ${errores} errores.`);
  console.log('Condicionados Adeslas: seed completado.');
}

module.exports = { seedCondicionados };
