const ReadLas = require('./index');

async function read() {
  try {
    const myLas = new ReadLas('../Test/las/sample las files/A10.las');
    const well = await myLas.well;
    const n = well.NULL.value;
    // await myLas.toCsv('example');
    console.log(n);
  } catch (error) {
    console.log(error);
  }
}

read();
