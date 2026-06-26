const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, 'src');
const BACKEND_DIR = path.join(__dirname, '../backend/src/main/java');

function getPurpose(filePath) {
    if (filePath.includes('components/ui')) return 'Reusable UI component (Shadcn/Custom) for consistent design.';
    if (filePath.includes('components/')) return 'Feature-specific React component to encapsulate UI logic.';
    if (filePath.includes('pages/')) return 'Full page React view rendering a distinct route in the application.';
    if (filePath.includes('store/')) return 'Redux slice/store configuration for managing global application state.';
    if (filePath.includes('services/')) return 'API service helper to make external network requests.';
    if (filePath.includes('controller/')) return 'Spring Boot REST Controller handling incoming HTTP requests and routing.';
    if (filePath.includes('service/')) return 'Spring Boot Service containing core business logic and database orchestration.';
    if (filePath.includes('entity/')) return 'JPA Entity representing a database table schema.';
    if (filePath.includes('dto/')) return 'Data Transfer Object used for safely transferring data between client and server.';
    if (filePath.includes('repository/')) return 'Spring Data JPA Repository for database CRUD operations.';
    if (filePath.includes('exception/')) return 'Custom Exception handler for robust error management.';
    if (filePath.includes('config/')) return 'Configuration file for setting up core application settings (Security, CORS, etc).';
    
    return 'Core application module.';
}

function countFunctions(content, isJava) {
    let count = 0;
    if (isJava) {
        // Simple regex for java methods
        const matches = content.match(/(public|private|protected)\s+(static\s+)?[\w<>,\[\]]+\s+(\w+)\s*\(/g);
        count = matches ? matches.length : 0;
    } else {
        // JS/JSX functions
        const functionMatches = content.match(/function\s+\w+\s*\(/g);
        const arrowMatches = content.match(/const\s+\w+\s*=\s*(\(|[^=]+=>)/g);
        const classMatches = content.match(/class\s+\w+/g);
        count += functionMatches ? functionMatches.length : 0;
        count += arrowMatches ? arrowMatches.length : 0;
        count += classMatches ? classMatches.length : 0;
    }
    return count;
}

function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Skip if already has our custom doc header
        if (content.includes('File Purpose Documentation')) return;

        const isJava = filePath.endsWith('.java');
        const filename = path.basename(filePath);
        const purpose = getPurpose(filePath);
        const funcCount = countFunctions(content, isJava);

        const docBlock = `/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: ${filename}
 * Purpose: ${purpose}
 * Functions/Methods: ${funcCount}
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */\n\n`;

        fs.writeFileSync(filePath, docBlock + content);
        console.log(`Documented: ${filePath}`);
    } catch (e) {
        console.error(`Error processing ${filePath}:`, e);
    }
}

function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (stat.isFile() && (fullPath.endsWith('.js') || fullPath.endsWith('.jsx') || fullPath.endsWith('.java'))) {
            processFile(fullPath);
        }
    }
}

console.log('Starting automated codebase documentation...');
walkDir(FRONTEND_DIR);
walkDir(BACKEND_DIR);
console.log('Documentation complete!');
