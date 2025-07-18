const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'src/routes');

// Get all JavaScript files in routes directory
const files = fs.readdirSync(routesDir)
  .filter(file => file.endsWith('.js'))
  .map(file => path.join(routesDir, file));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace auth references
  content = content.replace(/(\s+)auth,/g, '$1authenticate,');
  content = content.replace(/(\s+)auth$/gm, '$1authenticate');
  content = content.replace(/(\s+)auth\s*\)/g, '$1authenticate)');
  
  fs.writeFileSync(file, content);
  console.log(`Fixed ${file}`);
});

console.log('Auth fixes applied to all route files');
