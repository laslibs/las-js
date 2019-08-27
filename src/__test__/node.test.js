// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Las } = require('../../dist/index');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// const path = require('path');
const files = ['example1.las', '1046943371.las', 'A10.las', 'C1.las'];

describe('Version', () => {
  it.each(files)(
    'Returns version of las file for %s',
    async filename => {
      const myLas = new Las(path.resolve(__dirname, `./sample/${filename}`));
      const version = await myLas.version();
      expect(version).toBe(2);
    },
    1000
  );
});
