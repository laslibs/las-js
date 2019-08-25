import path from 'path';
import Las from '../index';

const myLas = new Las(path.resolve(__dirname, './sample/example1.las'));

test('Returns version of las file', async () => {
  const version = await myLas.version;
  expect(version).toBeDefined();
}, 1000);
