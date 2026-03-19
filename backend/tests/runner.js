#!/usr/bin/env node
// ============================================================
// TEST RUNNER - SiniestrosAI Backend
// Imports and runs all test suites sequentially
// Prints colorized summary with timing
// Exits with code 1 if any failures
// ============================================================

const siniestrosTests = require('./siniestros.test');
const authTests = require('./auth.test');
const fraudeTests = require('./fraude.test');
const agentesTests = require('./agentes.test');
const webhooksTests = require('./webhooks.test');
const rulesTests = require('./rules.test');
const templatesTests = require('./templates.test');
const slasTests = require('./slas.test');
const blockchainTests = require('./blockchain.test');
const negociadorTests = require('./negociador.test');
const vendedorTests = require('./vendedor.test');
const vigilanteTests = require('./vigilante.test');
const polizasTests = require('./polizas.test');
const retencionTests = require('./retencion.test');
const recobroTests = require('./recobro.test');
const complianceTests = require('./compliance.test');
const securityTests = require('./security.test');
const performanceTests = require('./performance.test');

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[90m';

const suites = [
  { name: 'Siniestros', module: siniestrosTests },
  { name: 'Auth', module: authTests },
  { name: 'Fraude', module: fraudeTests },
  { name: 'Agentes', module: agentesTests },
  { name: 'Webhooks', module: webhooksTests },
  { name: 'Rules Engine', module: rulesTests },
  { name: 'Templates', module: templatesTests },
  { name: 'SLAs', module: slasTests },
  { name: 'Blockchain', module: blockchainTests },
  { name: 'Negociador Agent', module: negociadorTests },
  { name: 'Vendedor Agent', module: vendedorTests },
  { name: 'Vigilante Agent', module: vigilanteTests },
  { name: 'Polizas', module: polizasTests },
  { name: 'Retencion Agent', module: retencionTests },
  { name: 'Recobro Agent', module: recobroTests },
  { name: 'Compliance', module: complianceTests },
  { name: 'Security', module: securityTests },
  { name: 'Performance', module: performanceTests },
];

async function runAllTests() {
  const globalStart = Date.now();
  let totalPassed = 0;
  let totalFailed = 0;
  let totalTests = 0;
  const allErrors = [];

  console.log('');
  console.log(`${BOLD}${CYAN}============================================${RESET}`);
  console.log(`${BOLD}${CYAN}  SiniestrosAI - Test Runner${RESET}`);
  console.log(`${BOLD}${CYAN}============================================${RESET}`);
  console.log(`${DIM}  Ejecutando ${suites.length} suites de tests...${RESET}`);
  console.log('');

  for (const suite of suites) {
    const suiteStart = Date.now();
    const testCount = suite.module.tests.length;
    totalTests += testCount;

    console.log(`${BOLD}${YELLOW}  ${suite.name}${RESET} ${DIM}(${testCount} tests)${RESET}`);
    console.log(`${DIM}  ${'─'.repeat(40)}${RESET}`);

    try {
      const results = await suite.module.runTests();
      totalPassed += results.passed;
      totalFailed += results.failed;

      if (results.errors.length > 0) {
        results.errors.forEach(e => allErrors.push({ suite: suite.name, ...e }));
      }
    } catch (err) {
      totalFailed += testCount;
      console.log(`  ${RED}Suite error: ${err.message}${RESET}`);
      allErrors.push({ suite: suite.name, name: 'Suite initialization', error: err.message });
    }

    const suiteElapsed = Date.now() - suiteStart;
    console.log(`${DIM}  Completado en ${suiteElapsed}ms${RESET}`);
    console.log('');
  }

  const globalElapsed = Date.now() - globalStart;

  // Summary
  console.log(`${BOLD}${CYAN}============================================${RESET}`);
  console.log(`${BOLD}${CYAN}  RESUMEN${RESET}`);
  console.log(`${BOLD}${CYAN}============================================${RESET}`);
  console.log('');
  console.log(`  Total:    ${BOLD}${totalTests}${RESET} tests`);
  console.log(`  Pasados:  ${GREEN}${BOLD}${totalPassed}${RESET}`);
  console.log(`  Fallidos: ${totalFailed > 0 ? RED + BOLD : DIM}${totalFailed}${RESET}`);
  console.log(`  Tiempo:   ${DIM}${globalElapsed}ms${RESET}`);
  console.log('');

  if (allErrors.length > 0) {
    console.log(`${RED}${BOLD}  ERRORES DETALLADOS:${RESET}`);
    console.log(`${DIM}  ${'─'.repeat(40)}${RESET}`);
    allErrors.forEach((e, i) => {
      console.log(`  ${RED}${i + 1}. [${e.suite}] ${e.name}${RESET}`);
      console.log(`     ${DIM}${e.error}${RESET}`);
    });
    console.log('');
  }

  if (totalFailed === 0) {
    console.log(`  ${GREEN}${BOLD}Todos los tests pasaron correctamente.${RESET}`);
  } else {
    console.log(`  ${RED}${BOLD}${totalFailed} test(s) fallaron.${RESET}`);
  }

  console.log('');
  console.log(`${BOLD}${CYAN}============================================${RESET}`);
  console.log('');

  process.exit(totalFailed > 0 ? 1 : 0);
}

runAllTests().catch(err => {
  console.error(`${RED}Error fatal ejecutando tests:${RESET}`, err);
  process.exit(1);
});
