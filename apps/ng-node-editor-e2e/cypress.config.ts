import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';

import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'src',
      webServerCommands: {
        default: 'nx run ng-node-editor:serve:development',
        production: 'nx run ng-node-editor:serve:production',
      },
      ciWebServerCommand: 'nx run ng-node-editor:serve-static',
    }),
    baseUrl: 'http://localhost:4200',
  },
});
