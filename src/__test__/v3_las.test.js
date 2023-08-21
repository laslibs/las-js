const path = require('path');
const { Las } = require('../../dist/index');
const fs = require('fs');

const files = ['E1.las', 'E2.las', 'E3.las', 'E4.las', 'E5.las'];

describe('Version', () => {
  it.each(files)(
    'Returns version of las file for %s',
    async filename => {
      const myLas = new Las(path.resolve(__dirname, `./sample_v3/${filename}`));
      const version = await myLas.version();
      expect(version).toBe(3);
    },
    1000
  );
});

describe('Blob', () => {
  it.each(files)(
    "The decoded string shouldn't be empty for %s",
    async filename => {
      const myLas = new Las(path.resolve(__dirname, `./sample_v3/${filename}`));
      const blob = await myLas.blobString;
      expect(blob.length).toBeGreaterThan(0);
    },
    1000
  );
});

describe('Raw las data', () => {
  it.each(files)(
    "The decoded string shouldn't be empty for %s",
    async filename => {
      const file = path.resolve(__dirname, `./sample_v3/${filename}`);
      const data = await fs.promises.readFile(file, { encoding: 'utf8' });
      const myLas = new Las(data, { loadFile: false });
      const blob = await myLas.blobString;
      expect(myLas.path).toEqual('');
      expect(blob.length).toBeGreaterThan(0);
      expect(blob).toEqual(data);
    },
    1000
  );
});

describe('Data', () => {
  it.each(files)(
    'The data is an Array for %s',
    async filename => {
      const myLas = new Las(path.resolve(__dirname, `./sample_v3/${filename}`));
      const data = await myLas.data();
      expect(data).toBeInstanceOf(Array);
    },
    1000
  );
});

describe('Stripped Data', () => {
  it.each(files)(
    'The dataStripped is an Array for %s',
    async filename => {
      const myLas = new Las(path.resolve(__dirname, `./sample_v3/${filename}`));
      const dataStripped = await myLas.dataStripped();
      expect(dataStripped).toBeInstanceOf(Array);
    },
    1000
  );
});

describe('Header', () => {
  it.each(files)(
    'The header is an non-empty Array for %s',
    async filename => {
      const myLas = new Las(path.resolve(__dirname, `./sample_v3/${filename}`));
      const header = await myLas.header();
      expect(header.length).toBeGreaterThan(0);
    },
    1000
  );
});

describe('Header and Description', () => {
  it.each(files)(
    'The headerAndDescr is an non-empty object for %s',
    async filename => {
      const myLas = new Las(path.resolve(__dirname, `./sample_v3/${filename}`));
      const headerAndDescr = await myLas.headerAndDescr();
      expect(Object.keys(headerAndDescr).length).toBeGreaterThan(0);
    },
    1000
  );
});

describe('Wrap variant', () => {
  it.each(files)(
    'wrap state must be a boolean for %s',
    async filename => {
      const myLas = new Las(path.resolve(__dirname, `./sample_v3/${filename}`));
      const wrap = await myLas.wrap();
      expect(typeof wrap).toBe('boolean');
    },
    1000
  );
});

describe('Well Parameters', () => {
  it.each(files)(
    'well parameters are present for %s',
    async filename => {
      const myLas = new Las(path.resolve(__dirname, `./sample_v3/${filename}`));
      const well = await myLas.wellParams();
      expect(Object.keys(well).length).toBeGreaterThan(0);
    },
    1000
  );
});

describe('Curve Parameters', () => {
  it.each(files)(
    'curve parameters are present for %s',
    async filename => {
      const myLas = new Las(path.resolve(__dirname, `./sample_v3/${filename}`));
      const curve = await myLas.curveParams();
      expect(Object.keys(curve).length).toBeGreaterThan(0);
    },
    1000
  );
});

describe('Log Parameters', () => {
  it.each(files)(
    'log parameters are present for %s',
    async filename => {
      const myLas = new Las(path.resolve(__dirname, `./sample_v3/${filename}`));
      const param = await myLas.logParams();
      expect(Object.keys(param).length).toBeGreaterThan(0);
    },
    1000
  );
});

describe('Rows', () => {
  it.each(files)(
    '%s has more than zero rows',
    async filename => {
      const myLas = new Las(path.resolve(__dirname, `./sample_v3/${filename}`));
      const rowCount = await myLas.rowCount();
      expect(rowCount).toBeGreaterThan(0);
    },
    1000
  );
});

describe('Column', () => {
  it.each(files)(
    '%s has more than zero columns',
    async filename => {
      const myLas = new Las(path.resolve(__dirname, `./sample_v3/${filename}`));
      const columnCount = await myLas.columnCount();
      expect(columnCount).toBeGreaterThan(0);
    },
    1000
  );
});
