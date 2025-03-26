/**
 * Creates a console progress bar
 */
export function createConsoleProgressBar() {
    let currentLine = '';
    
    return {
      /**
       * Update the progress bar
       * @param {number} percentage - Current percentage (0-100)
       * @param {string} message - Message to display below bar
       */
      update({percentage, message}) {
        // Clear current line
        process.stdout.write('\r' + ' '.repeat(currentLine.length) + '\r');
        
        // Build progress bar (80 chars wide)
        const barWidth = 80;
        const completed = Math.round((percentage / 100) * barWidth);
        const remaining = barWidth - completed - 2; // -2 for | chars
        
        // Format: |====>                      | 25/100%
        const bar = `|${'='.repeat(Math.max(0, completed-1))}>${' '.repeat(Math.max(0, remaining))}| ${percentage}/100%`;
        const line = `${bar}\n${message}`;
        
        // Save and print
        currentLine = line;
        process.stdout.write('\x1Bc')
        process.stdout.write(line);
      },
      
      /**
       * Finish the progress bar with a newline
       */
      complete() {
        console.log('\n');
      }
    };
  }