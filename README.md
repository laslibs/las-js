![](https://github.com/laslibs/las-js/workflows/Node%20CI/badge.svg?)
![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/las-js?style=flat-square)
![npm type definitions](https://img.shields.io/npm/types/las-js?style=flat-square)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/las-js?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/iykekings/las-js?style=flat-square)
![NPM](https://img.shields.io/npm/l/las-js?style=flat-square)
![npm](https://img.shields.io/npm/v/las-js?style=flat-square)

# las-js is a zero-dependency JavaScript library for parsing .Las file (Geophysical well log files).

### Currently supports only version 2.0 of LAS Specification. For more information about this format, see the Canadian Well Logging Society [web page](http://www.cwls.org/las/)

## How to use

- Installing

  > NPM

  ```sh
  $npm install las-js
  ```

  > Yarn

  ```sh
  $yarn add las-js
  ```

  > Browser

  ```html
  <script defer src="https://cdn.jsdelivr.net/npm/las-js/dist/browser.js"></srcipt>
  ```

- Usage

  import/require las-js module

  > Node

  ```js
  // common js
  const { Las } = require('las-js');
  // esm
  import { Las } from 'las-js';
  const myLas = new Lasjs(`./sample/example1.las`);
  ```

> Browser

las-js adds a global class Lasjs or using esm

```js
import { Las } from 'las-js';
```

```js
const input = document.getElementById('file-input');
input.addEventListener('change', async e => {
  const file = e.target.files[0];
  const myLas = new Lasjs(file);
});
// or
const myLas = new Lasjs('https://raw.githubusercontent.com/iykekings/las-js/master/src/__test__/sample/A10.las'); // url - only on browser
```

- Read data

  > Use Laspy.data to get a 2-dimensional array containing the readings of each log,
  > Or Lasjs.dataStripped to get the same as above but with all rows containing null values stripped off

  ```js
  async function read() {
    try {
      const data = await myLas.data();
      console.log(data);
      /**
         [[2650.0, 177.825, -999.25, -999.25],
          [2650.5, 182.5, -999.25,-999.25],
          [2651.0,180.162, -999.25, -999.25],
          [2651.5, 177.825, -999.25, -999.25],
          [2652.0, 177.825, -999.25, -999.25] ...]
        */

      const dataStripped = await myLas.dataStripped();
      console.log(dataStripped);
      /**
       [[2657.5, 212.002, 0.16665, 1951.74597],
       [2658.0, 201.44, 0.1966, 1788.50696],
       [2658.5, 204.314, 0.21004, 1723.21204],
       [2659.0, 212.075, 0.22888, 1638.328],
       [2659.5, 243.536, 0.22439, 1657.91699]...]
       */
    } catch (error) {
      console.log(error);
    }
  }
  ```

- Get the log headers


    ```javascript
        // ...
        const headers = await myLas.header();
        console.log(headers);
        // ['DEPTH', 'GR', 'NPHI', 'RHOB']
       // ...
    ```

- Get the log headers descriptions


    ```Js
        //...
        const headerAndDescr = await myLas.headerAndDescr();
        console.log(headerAndDescr)
        // {DEPTH: 'DEPTH', GR: 'Gamma Ray', NPHI: 'Neutron Porosity', RHOB: 'Bulk density'}
        // ...
    ```

- Get a particular column, say Gamma Ray log


    ```Js
        // ...
        const gammaRay = await myLas.column('GR');
        console.log(gammaRay);
        // [-999.25, -999.25, -999.25, -999.25, -999.25, 122.03, 123.14, ...]
        // ...
    ```
    ```Js
        // ...
        // get column with null values stripped
        const gammaRay = await myLas.columnStripped('GR');
        console.log(gammaRay);
        // [61.61, 59.99, 54.02, 50.87, 54.68, 64.39, 77.96, ...]
        // ...
    ```
    > Note this returns the column, after all the data has been stripped off their null values, which means that valid data in a particular column would be stripped off if there is another column that has a null value at that particular row

- Get the Well Parameters

  ### Presents a way of accessing the details of individual well parameters.

  ### The details include the following:

        1. descr - Description/ Full name of the well parameter
        2. units - Its unit measurements
        3. value - Value

  ```Js
    // ...
    const well = await myLas.wellParams()
    const start = well.STRT.value // 1670.0
    const stop = well.STOP.value // 1669.75
    const null_value = well.NULL.value //  -999.25
    // Any other well parameter present in the file, can be gotten with the same syntax above
    // ...
  ```

- Get the Curve Parameters

  ### Presents a way of accessing the details of individual log columns.

  ### The details include the following:

        1. descr - Description/ Full name of the log column
        2. units - Unit of the log column measurements
        3. value - API value of the log column

  ```Js
    // ...
    const curve = await myLas.curveParams()
    const NPHI = curve.NPHI.descr // 'Neutron Porosity'
    const RHOB = curve.RHOB.descr // 'Bulk density'
    // This is the same for all log column present in the file
    // ...
  ```

- Get the Parameters of the well

  ### The details include the following:

        1. descr - Description/ Full name of the log column
        2. units - Unit of the log column measurements
        3. value - API value of the log column

  ```Js
    // ...
    const param = await myLas.logParams(); // 'BOTTOM HOLE TEMPERATURE'
    const BHT = param.BHT.descr // 'BOTTOM HOLE TEMPERATURE'
    const BHTValaue = param.BHT.value // 35.5
    const BHTUnits = param.BHT.units // 'DEGC'
    // This is the same for all well parameters present in the file
    // ...
  ```

- Get the number of rows and columns


    ```Js
        // ...
        const numRows = await myLas.rowCount() // 4
        const numColumns = await myLas.columnCount() // 3081
        // ...
    ```

- Get the version and wrap


    ```Js
        // ...
        const version = await myLas.version() // '2.0'
        const wrap = await myLas.wrap() // true
        // ...
    ```

- Get other information

  ```Js
      // ...
      const other = await myLas.other()
      console.log(other)
      // Note: The logging tools became stuck at 625 metres causing the data between 625 metres and 615 metres to be invalid.
      // ...
  ```

- Export to CSV

  ### For node, this writes a csv file to the current working directory, with headers of the well and data section only for node. For browser, this returns a File Blob, that can be downloaded by using _URL.createObjectURL_

  ```Js
      //...
      await myLas.toCsv('result')
      // result.csv has been created Successfully!
      //...
  ```

  > result.csv

  | DEPT | RHOB    | GR      | NPHI  |
  | ---- | ------- | ------- | ----- |
  | 0.5  | -999.25 | -999.25 | -0.08 |
  | 1.0  | -999.25 | -999.25 | -0.08 |
  | 1.5  | -999.25 | -999.25 | -0.04 |
  | ...  | ...     | ...     | ...   |
  | 1.3  | -999.25 | -999.25 | -0.08 |

  Or get the version of csv with null values stripped

  ```Js
      // ...
      await myLas.toCsvStripped('clean')
      // clean.csv has been created Successfully!
      // ...
  ```

  > clean.csv

  | DEPT | RHOB  | GR   | NPHI  |
  | ---- | ----- | ---- | ----- |
  | 80.5 | 2.771 | 18.6 | -6.08 |
  | 81.0 | 2.761 | 17.4 | -6.0  |
  | 81.5 | 2.752 | 16.4 | -5.96 |
  | ...  | ...   | ...  | ...   |
  | 80.5 | 2.762 | 16.2 | -5.06 |

- Browser and Node Supports

  > las-js is written in typescript and compiles to es6.

  - Browser
    Supports IE 10 and 11 - (doesn't yet support url)
    Doesn't support Opera Mini
  - Node
    Tested 0n 8, 10 and 12

- ## Support
  las-js is an MIT-licensed open source project. You can help it grow by becoming a sponsor/supporter.[Become a Patron!](https://www.patreon.com/bePatron?u=19152008)
