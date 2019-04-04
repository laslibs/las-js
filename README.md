# las-js is a zero-dependency JavaScript library for parsing .Las file (Geophysical well log files).

### Currently supports only version 2.0 of LAS Specification. For more information about this format, see the Canadian Well Logging Society [web page](http://www.cwls.org/las/)

## How to use

- Installing

  ```bash
  $npm install las-js
  ```

- Usage

  ```js
  const ReadLas = require('readlasjs');
  ```

- Initialize

  ```js
  const read = mylas.initialize();
  ```

- Read data

  ```javascript
  async function read() {
    try {
      const myLas = new ReadLas('./path-to-las-file.las');
      const blob = await las.initialize();
      const logValues = myLas.data(blob);
      console.log(logValues);
      /**
         [
             { DEPT: '1670.000',DT: '123.450',RHOB: '2550.000',NPHI:'0.450'},
            { DEPT: '1669.875', DT: '123.450', RHOB: '2550.000', NPHI: '0.450'},
            { DEPT: '1669.750', DT: '123.450', RHOB: '2550.000', NPHI: '0.450' }
        ]
        */
    } catch (error) {
      console.log(error);
    }
  }
  ```

- Well parameters

  ```javascript
  ...
  const well = myLas.property(blob, 'well');
  console.log(well.STRT) // { unit: 'M', value: '1670.0000', description: 'START DEPTH' }

  console.log(well.STOP) // { unit: 'M', value: '1669.7500', description: 'STOP DEPTH' }

  console.log(well.COMP) // { unit: 'none', value: 'ANY OIL COMPANY INC.',description: 'COMPANY' }

  //Null Value
  const nullValue = well.NULL.value
  console.log(nullValue) // -999.25
  ...
  ```

- Log Headers

  ```javascript
  ...
  const header = myLas.header(blob)
  console.log(header) // [ 'DEPT', 'DT', 'RHOB', 'NPHI', 'SFLU', 'SFLA', 'ILM', 'ILD' ]
  ...
  ```

- Get Values of Specific Column of the logs

  ```javascript
  ...
  const header = myLas.column(blob, 'RHOB')
  console.log(header) // [ '2550.000', '2550.000', '2550.000' ]
  ...
  ```

- Get Version/Wrap of the logs

  ```javascript
  ...
  const vesrion = myLas.metadata(blob).VERS // '2.0'
  const wrap = myLas.metadata(blob).WRAP // 'NO'
  ...
  ```

- Other

  ```javascript
  ...
  const other = myLas.other(blob)
  /**
   Note: The logging tools became stuck at 625 metres causing the data between 625 metres and 615 metres to be invalid.
  */
  ...
  ```
