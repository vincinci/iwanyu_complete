const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'src/routes');

// Check each route file
const files = fs.readdirSync(routesDir).filter(file => file.endsWith('.js'));

files.forEach(file => {
  const filePath = path.join(routesDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Look for auth issues
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (line.includes('auth,') || line.includes('auth)') || line.includes('auth ')) {
      if (!line.includes('authenticate') && !line.includes('authorize') && !line.includes('adminAuth')) {
        console.log(`${file}:${index + 1}: ${line.trim()}`);
      }
    }
  });
});
