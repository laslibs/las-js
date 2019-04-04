const fs = require('fs');
const util = require('util');
const fsprom = util.promisify(fs.readFile);

Array.prototype.chunk = function(size) {
  let overall = [];
  let index = 0;
  while (index < this.length) {
    overall.push(this.slice(index, index + size));
    index += size;
  }
  return overall;
};

module.exports = class ReadLas {
  constructor(path) {
    this.path = path;
  }

  async initialize() {
    try {
      const str = await fsprom(this.path, 'utf8');
      return str;
    } catch (error) {
      throw error;
    }
  }

  data(s) {
    const hds = ReadLas.header(s);
    const totalHeadersLength = hds.length;
    const sB = s
      .split(/~A(?:\w*\s*)*\n/)[1]
      .trim()
      .split(/\s+/)
      .map(m => m.trim());
    const con = sB.chunk(totalHeadersLength);
    // return con
    let collated = [];
    for (let i = 0; i < con.length; i++) {
      let singleObj = {};
      for (let j = 0; j < hds.length; j++) {
        singleObj[hds[j]] = con[i][j];
      }
      collated.push(singleObj);
    }
    return collated;
  }

  static removeComment(str) {
    return str
      .trim()
      .split('\n')
      .map(val => val.trimStart())
      .filter(f => !(f.charAt(0) == '#'))
      .join('\n');
  }

  column(blob, str) {
    const hds = this.header(blob);
    const totalHeadersLength = hds.length;
    const sB = blob
      .split(/~A(?:\w*\s*)*\n/)[1]
      .trim()
      .split(/\s+/)
      .map(m => m.trim());
    const con = sB.chunk(totalHeadersLength);
    const index = hds.findIndex(item => item === str);
    if (index >= 0) {
      return con.map(c => c[index]);
    } else {
      throw `Column with title ${str} doesn't exist on the log`;
    }
  }

  // Rewrite from py
  metadata(str) {
    const sB = str
      .trim()
      .split(/~V(?:\w*\s*)*\n\s*/)[1]
      .split(/~/)[0];
    const sw = ReadLas.removeComment(sB);
    const refined = sw
      .split('\n')
      .map(m => m.split(/\s{2,}|\s*:/).slice(0, 2))
      .filter(f => Boolean(f));
    let someObj = {};
    refined.forEach(r => {
      someObj[r[0].replace('.','')] = r[1];
    });
    return someObj;
  }

  // Rewrite from py version
  property(str, param) {
    const regDict = {
      parameters: '~P(?:\\w*\\s*)*\\n\\s*',
      curve: '~C(?:\\w*\\s*)*\\n\\s*',
      well: '~W(?:\\w*\\s*)*\\n\\s*'
    };
    const regExp = new RegExp(regDict[param], 'i');
    let substr = str.split(regExp);
    let sw = '';
    if (substr.length > 1) {
      substr = substr[1].split(/~/)[0];
      sw = ReadLas.removeComment(substr);
    }
    if (sw.length > 0) {
      let s = {};
      sw.split('\n').map(c => {
        const obj = c.replace(/\s*[.]\s+/, '   none   ');
        const title = obj.split(/[.]|\s+/)[0];
        const unit = obj
          .trim()
          .split(/^\w+\s*[.]*s*/)[1]
          .split(/\s+/)[0];
        const description = Boolean(obj.split(/[:]/)[1].trim())
          ? obj.split(/[:]/)[1].trim()
          : 'none';
        let third = obj.split(/[:]/)[0].split(/\s{2,}\w*\s{2,}/);
        const value =
          third.length > 2 && !Boolean(third[third.length - 1])
            ? third[third.length - 2]
            : third[third.length - 1];
        s[title] = { unit, value, description };
      });
      return s;
    } else {
      return 'none';
    }
  }

  other(s) {
    const som = s
      .split(/~O(?:\w*\s*)*\n\s*/i)[1]
      .split('~')[0]
      .replace(/\n\s*/g, ' ')
      .trim();
    const str = ReadLas.removeComment(som);
    return str.length > 0 ? str : 'none';
  }

  header(s) {
    const sth = s.split(/~C(?:\w*\s*)*\n\s*/)[1].split('~')[0];
    const uncommentedSth = ReadLas.removeComment(sth).trim();
    return uncommentedSth.split('\n').map(m => m.trim().split(/\s+|[.]/)[0]);
  }
};
