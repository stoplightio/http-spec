import * as path from 'path';
import typescript from 'rollup-plugin-typescript2';

import pkg from './package.json';

module.exports = {
  input: Object.values(pkg.exports).map(({ default: entry }) =>
    path.join('src', path.dirname(entry), path.basename(entry, path.extname(entry)) + '.ts'),
  ),
  output: [
    {
      dir: './dist',
      entryFileNames: '[name].js',
      exports: 'named',
      format: 'cjs',
      name: pkg.name,
      preserveModules: true,
      sourcemap: true,
    },
    {
      dir: './dist',
      entryFileNames: '[name].mjs',
      format: 'es',
      name: pkg.name,
      preserveModules: true,
      sourcemap: true,
    },
  ],
  external: Object.keys(pkg.dependencies),
  plugins: [
    typescript({
      tsconfig: './tsconfig.build.json',
      useTsconfigDeclarationDir: true,
    }),
  ],
};
