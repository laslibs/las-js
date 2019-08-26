import path from 'path';
import Las from '../index';

const myLas = new Las(path.resolve(__dirname, './sample/example1.las'));

test('Returns version of las file', async () => {
  const version = await myLas.version;
  expect(version).toBe(2);
}, 1000);
test("the decoded string shouldn't be empty", async () => {
  const blob = await myLas.blob;
  expect(blob!.length).toBeGreaterThan(0);
}, 1000);

test('The data is an Array', async () => {
  const data = await myLas.data;
  expect(data).toBeInstanceOf(Array);
}, 1000);

test('The dataStripped is an Array', async () => {
  const dataStripped = await myLas.dataStripped;
  expect(dataStripped).toBeInstanceOf(Array);
}, 1000);

test('The header is an non-empty Array', async () => {
  const header = await myLas.header;
  expect(header!.length).toBeGreaterThan(0);
}, 1000);

test('The headerAndDescr is an non-empty object', async () => {
  const headerAndDescr = await myLas.headerAndDescr;
  expect(Object.keys(headerAndDescr as object).length).toBeGreaterThan(0);
}, 1000);

test('wrap state must be a boolean', async () => {
  const wrap = await myLas.wrap;
  expect(typeof wrap).toBe('boolean');
}, 1000);
