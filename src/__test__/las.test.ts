import path from 'path';
import Las from '../index';

const files = ['example1.las', '1046943371.las', 'A10.las', 'C1.las'];

describe('Version', () => {
  it.each(files)(
    'Returns version of las file for %s',
    async filename => {
      const myLas = new Las(path.resolve(__dirname, `./sample/${filename}`));
      const version = await myLas.version;
      expect(version).toBe(2);
    },
    1000
  );
});

describe('Blob', () => {
  it.each(files)(
    "The decoded string shouldn't be empty for %s",
    async filename => {
      const myLas = new Las(path.resolve(__dirname, `./sample/${filename}`));
      const blob = await myLas.blob;
      expect(blob!.length).toBeGreaterThan(0);
    },
    1000
  );
});

describe('Data', () => {
  it.each(files)(
    'The data is an Array for %s',
    async filename => {
      const myLas = new Las(path.resolve(__dirname, `./sample/${filename}`));
      const data = await myLas.data;
      expect(data).toBeInstanceOf(Array);
    },
    1000
  );
});

describe('Stripped Data', () => {
  it.each(files)(
    'The dataStripped is an Array for %s',
    async filename => {
      const myLas = new Las(path.resolve(__dirname, `./sample/${filename}`));
      const dataStripped = await myLas.dataStripped;
      expect(dataStripped).toBeInstanceOf(Array);
    },
    1000
  );
});

describe('Header', () => {
  it.each(files)(
    'The header is an non-empty Array for %s',
    async filename => {
      const myLas = new Las(path.resolve(__dirname, `./sample/${filename}`));
      const header = await myLas.header;
      expect(header.length).toBeGreaterThan(0);
    },
    1000
  );
});

describe('Header and Description', () => {
  it.each(files)(
    'The headerAndDescr is an non-empty object for %s',
    async filename => {
      const myLas = new Las(path.resolve(__dirname, `./sample/${filename}`));
      const headerAndDescr = await myLas.headerAndDescr;
      expect(Object.keys(headerAndDescr as object).length).toBeGreaterThan(0);
    },
    1000
  );
});

describe('Wrap variant', () => {
  it.each(files)(
    'wrap state must be a boolean for %s',
    async filename => {
      const myLas = new Las(path.resolve(__dirname, `./sample/${filename}`));
      const wrap = await myLas.wrap;
      expect(typeof wrap).toBe('boolean');
    },
    1000
  );
});

describe('Well Parameters', () => {
  it.each(files)(
    'well parameters are present for %s',
    async filename => {
      const myLas = new Las(path.resolve(__dirname, `./sample/${filename}`));
      const well = await myLas.well;
      expect(Object.keys(well as object).length).toBeGreaterThan(0);
    },
    1000
  );
});

describe('Curve Parameters', () => {
  it.each(files)(
    'curve parameters are present for %s',
    async filename => {
      const myLas = new Las(path.resolve(__dirname, `./sample/${filename}`));
      const curve = await myLas.curve;
      expect(Object.keys(curve as object).length).toBeGreaterThan(0);
    },
    1000
  );
});

describe('Log Parameters', () => {
  it.each(files.slice(0, 2))(
    'log parameters are present for %s',
    async filename => {
      const myLas = new Las(path.resolve(__dirname, `./sample/${filename}`));
      const param = await myLas.param;
      expect(Object.keys(param as object).length).toBeGreaterThan(0);
    },
    1000
  );
});

describe('Rows', () => {
  it.each(files)(
    '%s has more than zero rows',
    async filename => {
      const myLas = new Las(path.resolve(__dirname, `./sample/${filename}`));
      const rowCount = await myLas.rowCount;
      expect(rowCount).toBeGreaterThan(0);
    },
    1000
  );
});

describe('Column', () => {
  it.each(files)(
    '%s has more than zero columns',
    async filename => {
      const myLas = new Las(path.resolve(__dirname, `./sample/${filename}`));
      const columnCount = await myLas.columnCount;
      expect(columnCount).toBeGreaterThan(0);
    },
    1000
  );
});
