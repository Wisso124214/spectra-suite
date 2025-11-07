export default class Debugger {
  constructor() {
    this.logSpacing = 2;
  }

  logData(data, deep = 1) {
    if (Array.isArray(data)) {
      console.log(`  ${' '.repeat(deep * this.logSpacing)}[`);
      data.forEach((item) => {
        console.log(`  ${' '.repeat((deep + 1) * this.logSpacing)}'${item}',`);
      });
      console.log(`  ${' '.repeat(deep * this.logSpacing)}]`);
    } else {
      for (const d in data) {
        if (typeof data[d] === 'object') {
          console.log(`  ${' '.repeat(deep * this.logSpacing)}${d}: {`);
          this.logData(data[d], deep + 1);
          console.log(`  ${' '.repeat(deep * this.logSpacing)}}`);
        } else {
          console.log(`  ${' '.repeat(deep * this.logSpacing)}${d}:`, data[d]);
        }
      }
    }
  }
}
