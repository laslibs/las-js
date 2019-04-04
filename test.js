const ReadLas = require('./index');

async function read() {
  try {
    const myLas = new ReadLas('./sample/example1.las');
    const blob = await myLas.initialize();
    const header = myLas.other(blob);
    console.log(header);
  } catch (error) {
    console.log(error);
  }
}

read();
