export default typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null &&
  process.title !== 'browser';
