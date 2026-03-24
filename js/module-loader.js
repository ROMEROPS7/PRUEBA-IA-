// ============================================
// SiniestrosAI - Module Loader v2.0
// Carga modular de componentes del frontend
// ============================================

'use strict';

const SiniestrosModules = {
  modules: [
    'js/modules/simulators.js',
    'js/modules/saas.js',
    'js/modules/modules-data.js',
    'js/modules/polizas.js',
    'js/modules/peritacion.js',
    'js/modules/gestion.js',
    'js/modules/analytics.js',
    'js/modules/coordinacion.js',
    'js/modules/importar.js',
    'js/modules/wiki.js',
  ],

  loaded: 0,

  loadAll() {
    this.modules.forEach(src => {
      const script = document.createElement('script');
      script.src = src;
      script.defer = true;
      script.onload = () => {
        this.loaded++;
        if (this.loaded === this.modules.length) {
          console.log('[SiniestrosAI] Todos los modulos cargados');
          document.dispatchEvent(new Event('siniestros-modules-ready'));
        }
      };
      document.head.appendChild(script);
    });
  },

  loadModule(name) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'js/modules/' + name + '.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
};

if (typeof window !== 'undefined') {
  window.SiniestrosModules = SiniestrosModules;
}
