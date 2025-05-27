   // Calculator state variables
   let currentInput = '0';
   let previousInput = '';
   let operator = '';
   let waitingForNewInput = false;
   let justCalculated = false;

   // DOM elements
   const display = document.getElementById('display');
   const displaySecondary = document.getElementById('display-secondary');

   // Update display function
   function updateDisplay() {
       // Format large numbers with commas
       const formattedInput = formatNumber(currentInput);
       display.textContent = formattedInput;
       
       // Update secondary display with operation history
       if (previousInput && operator) {
           displaySecondary.textContent = `${formatNumber(previousInput)} ${operator}`;
       } else {
           displaySecondary.textContent = '';
       }
   }

   // Format numbers with commas for better readability
   function formatNumber(num) {
       if (num === '' || num === '0') return '0';
       
       // Handle decimal numbers
       if (num.includes('.')) {
           const parts = num.split('.');
           const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
           return `${integerPart}.${parts[1]}`;
       }
       
       // Handle integer numbers
       return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
   }

   // Remove formatting for calculations
   function removeFormatting(num) {
       return num.toString().replace(/,/g, '');
   }

   // Input number function
   function inputNumber(num) {
       animateButton(event.target);
       
       if (waitingForNewInput || justCalculated) {
           currentInput = num;
           waitingForNewInput = false;
           justCalculated = false;
       } else {
           if (currentInput === '0') {
               currentInput = num;
           } else {
               // Limit input length to prevent overflow
               if (removeFormatting(currentInput).length < 12) {
                   currentInput += num;
               }
           }
       }
       
       updateDisplay();
   }

   // Input decimal point
   function inputDecimal() {
       animateButton(event.target);
       
       if (waitingForNewInput || justCalculated) {
           currentInput = '0.';
           waitingForNewInput = false;
           justCalculated = false;
       } else if (!currentInput.includes('.')) {
           currentInput += '.';
       }
       
       updateDisplay();
   }

   // Input operator function
   function inputOperator(op) {
       animateButton(event.target);
       
       if (previousInput && operator && !waitingForNewInput) {
           calculate();
       }
       
       previousInput = removeFormatting(currentInput);
       operator = op;
       waitingForNewInput = true;
       justCalculated = false;
       
       updateDisplay();
   }

   // Calculate function
   function calculate() {
       if (previousInput && operator && !waitingForNewInput) {
           animateButton(event.target);
           
           const prev = parseFloat(removeFormatting(previousInput));
           const current = parseFloat(removeFormatting(currentInput));
           let result;

           // Perform calculation based on operator
           switch (operator) {
               case '+':
                   result = prev + current;
                   break;
               case '-':
                   result = prev - current;
                   break;
               case '×':
                   result = prev * current;
                   break;
               case '÷':
                   if (current === 0) {
                       showError('Cannot divide by zero');
                       return;
                   }
                   result = prev / current;
                   break;
               default:
                   return;
           }

           // Handle result
           if (isNaN(result) || !isFinite(result)) {
               showError('Invalid operation');
               return;
           }

           // Round to avoid floating point precision issues
           result = Math.round(result * 100000000000) / 100000000000;
           
           // Convert to string and handle very large/small numbers
           if (Math.abs(result) > 999999999999) {
               currentInput = result.toExponential(6);
           } else {
               currentInput = result.toString();
           }

           previousInput = '';
           operator = '';
           waitingForNewInput = true;
           justCalculated = true;
           
           updateDisplay();
       }
   }

   // Clear all function
   function clearAll() {
       animateButton(event.target);
       currentInput = '0';
       previousInput = '';
       operator = '';
       waitingForNewInput = false;
       justCalculated = false;
       display.classList.remove('error');
       updateDisplay();
   }

   // Clear entry function
   function clearEntry() {
       animateButton(event.target);
       currentInput = '0';
       display.classList.remove('error');
       updateDisplay();
   }

   // Delete last character
   function deleteLast() {
       animateButton(event.target);
       
       if (currentInput.length > 1) {
           // Remove formatting, delete last character, then reformat
           let unformatted = removeFormatting(currentInput);
           unformatted = unformatted.slice(0, -1);
           currentInput = unformatted || '0';
       } else {
           currentInput = '0';
       }
       
       display.classList.remove('error');
       updateDisplay();
   }

   // Show error function
   function showError(message) {
       display.textContent = message;
       display.classList.add('error');
       
       // Reset after 2 seconds
       setTimeout(() => {
           clearAll();
       }, 2000);
   }

   // Animate button press
   function animateButton(button) {
       button.classList.add('btn-pressed');
       setTimeout(() => {
           button.classList.remove('btn-pressed');
       }, 200);
   }

   // Keyboard support
   document.addEventListener('keydown', function(event) {
       const key = event.key;
       
       // Prevent default behavior for calculator keys
       if ('0123456789+-*/.=Enter'.includes(key) || key === 'Backspace' || key === 'Escape') {
           event.preventDefault();
       }
       
       // Handle number keys
       if (key >= '0' && key <= '9') {
           inputNumber(key);
       }
       
       // Handle operator keys
       else if (key === '+') {
           inputOperator('+');
       } else if (key === '-') {
           inputOperator('-');
       } else if (key === '*') {
           inputOperator('×');
       } else if (key === '/') {
           inputOperator('÷');
       }
       
       // Handle other keys
       else if (key === '.') {
           inputDecimal();
       } else if (key === '=' || key === 'Enter') {
           calculate();
       } else if (key === 'Backspace') {
           deleteLast();
       } else if (key === 'Escape') {
           clearAll();
       } else if (key.toLowerCase() === 'c') {
           clearEntry();
       }
   });

   // Initialize display
   updateDisplay();

   // Add visual feedback for keyboard presses
   document.addEventListener('keydown', function(event) {
       const key = event.key;
       let targetButton = null;
       
       // Find the corresponding button
       if (key >= '0' && key <= '9') {
           targetButton = document.querySelector(`button[onclick="inputNumber('${key}')"]`);
       } else if (key === '+') {
           targetButton = document.querySelector(`button[onclick="inputOperator('+')"]`);
       } else if (key === '-') {
           targetButton = document.querySelector(`button[onclick="inputOperator('-')"]`);
       } else if (key === '*') {
           targetButton = document.querySelector(`button[onclick="inputOperator('×')"]`);
       } else if (key === '/') {
           targetButton = document.querySelector(`button[onclick="inputOperator('÷')"]`);
       } else if (key === '.') {
           targetButton = document.querySelector(`button[onclick="inputDecimal()"]`);
       } else if (key === '=' || key === 'Enter') {
           targetButton = document.querySelector(`button[onclick="calculate()"]`);
       } else if (key === 'Backspace') {
           targetButton = document.querySelector(`button[onclick="deleteLast()"]`);
       } else if (key === 'Escape') {
           targetButton = document.querySelector(`button[onclick="clearAll()"]`);
       }
       
       if (targetButton) {
           animateButton(targetButton);
       }
   });