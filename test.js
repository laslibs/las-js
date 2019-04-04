const ReadLas = require('./index');

async function read() {
  try {
    const myLas = new ReadLas('./sample/example1.las');
    const blob = await myLas.initialize();
    const well = myLas.property(blob, 'well');
    console.log(well);
  } catch (error) {
    console.log(error);
  }
}

read();
