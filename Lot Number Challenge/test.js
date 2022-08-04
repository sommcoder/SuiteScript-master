/*
loop 100 times (i)

if i is div 3 & 5: console: "FizzBuzz"
if i is div 3: console: "Fizz"
if i is div 5: console: "buzz"
*/

for (let i = 1; i <= 100; i++) {
  let output = "";
  if (i % 3 === 0) output += "Fizz";
  if (i % 5 === 0) output += "Buzz";
  if (i % 7 === 0) output += "Bazz";
  console.log(output || i);
}
