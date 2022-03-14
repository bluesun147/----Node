const fs = require('fs');

// readFileSync

// console.log('A');
// const result = fs.readFileSync('./sample.txt', 'utf8');
// console.log(result);
// console.log('C');

console.log('A');
fs.readFile('./sample.txt', 'utf8', (err, result) => {
    console.log(result);
});
console.log('C');