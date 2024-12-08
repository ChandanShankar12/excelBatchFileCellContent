const fs = require('fs');
const { type } = require('os');
const path = require('path');
const { isExternal } = require('util/types');
const ExcelJS = require('exceljs');
const XLSX = require('xlsx');


// async function modifyCellContent() {
//     try {
//       const workbook = new ExcelJS.Workbook();
  
//       // Load the file - make sure to use .xlsx format
//       await workbook.xlsx.readFile('./Production Files/T2/Book1.xlsx');  // Changed extension to .xlsx
  
//       // Get the worksheet - add error checking
//       const worksheet = workbook.worksheets[0];
//     //   if (!worksheet) {
//     //     throw new Error('No worksheet found in the workbook');
//     //   }
  
//       // Log worksheet info for debugging
//       console.log('Worksheet name:', worksheet.name);
//       console.log('Number of worksheets:', workbook.worksheets.length);
  
//       // Rest of your code...
//       const cell = worksheet.getRow(1).getCell(1); // This gets cell A1
//       cell.value = '1234';
  
//     //   worksheet.getCell(1, 2).value = 'Another New Value';
  
//       // Save as xlsx
//       await workbook.xlsx.writeFile('output.xlsx');
  
//       console.log('Excel file updated successfully!');
//     } catch (error) {
//       console.error('Error modifying Excel file:', error.message);
//       console.error('Stack:', error.stack);  // Added for better error debugging
//     }
//   }

// // Call the function
// modifyCellContent();


//Count the number of excel files in a directory
// function countExcelFiles(currentPath) {
//     try {
//         // Get all files in the directory
//         const files = fs.readdirSync(currentPath);
        
//         // Filter for Excel files (both .xlsx and .xls extensions)
//         const excelFiles = files.filter(file => {
//             const extension = path.extname(file).toLowerCase();
//             return extension === '.xlsx' || extension === '.xls';
//         });
        
//         return excelFiles.length;
//     } catch (error) {
//         console.error('Error reading directory:', error);
//         return 0;
//     }
// }


// Example usage
// const rootDirectory = './';
// const excelCount = countExcelFiles(rootDirectory);
// console.log(`Number of Excel files found: ${excelCount}`);

const mainRootFolder = path

//Copy the content of the directory to a new folder
async function copyContentToNewFolder(rootFolderPath, newFolderName) {
    // Ensure the root folder exists
    if (!fs.existsSync(rootFolderPath)) {
        console.log("Root folder does not exist.");
        return;
    }

    // Create the new folder if it doesn't exist
    const newFolderPath = path.join(rootFolderPath, newFolderName);
    if (!fs.existsSync(newFolderPath)) {
        fs.mkdirSync(newFolderPath);
        console.log(`New folder created: ${newFolderPath}`);
    } else {
        console.log(`The folder '${newFolderName}' already exists.`);
        return;
    }

    // Function to recursively find all files
    function getAllFiles(dirPath) {
        let files = [];
        const items = fs.readdirSync(dirPath);

        items.forEach(item => {
            const fullPath = path.join(dirPath, item);
            if (fs.statSync(fullPath).isDirectory()) {
                files = files.concat(getAllFiles(fullPath));
            } else {
                files.push(fullPath);
            }
        });

        return files;
    }

    try {
        // Get all files from all subdirectories
        const allFiles = getAllFiles(rootFolderPath).filter(file => 
            !file.includes(newFolderName) // Exclude files from the new folder
        );

        // Copy each file to the new folder
        allFiles.forEach(filePath => {
            const fileName = path.basename(filePath);
            const destPath = path.join(newFolderPath, fileName);
            fs.copyFileSync(filePath, destPath);
            console.log(`Copied: ${fileName}`);
        });

        console.log('All files have been copied successfully');
    } catch (error) {
        console.error('Error copying files:', error);
    }
}

// Example usage:
const copiedExcelRootFile = path.join(__dirname, 'Files'); // Change to your root folder path
const newFolder = 'copiedExcelRootFile';  // The new folder to create
copyContentToNewFolder('./Production Files', newFolder);

// Root directory containing the Excel files
const excelFileRootFolder = copiedExcelRootFile;
const convertedFolder = path.join(__dirname, 'ConvertedFiles');

// Step 1: Process root directory and copy Excel 2003 files
function copyExcelFiles() {
    // Add this check
    if (!fs.existsSync(copiedExcelRootFile)) {
        console.error(`Directory not found: ${copiedExcelRootFile}`);
        return;
    }

    fs.readdirSync(copiedExcelRootFile).forEach((file) => {
        const ext = path.extname(file).toLowerCase();
        if (ext === '.xls') {
            fs.copyFileSync(
                path.join(copiedExcelRootFile, file), 
                path.join(backupFolder, file)
            );
            console.log(`Copied: ${file}`);
        }
    });
}

// Step 2: Convert Excel files to newer version
function convertExcelFiles() {
    // Create converted folder if it doesn't exist
    if (!fs.existsSync(convertedFolder)) {
        fs.mkdirSync(convertedFolder, { recursive: true });
    }

    fs.readdirSync(copiedExcelRootFile).forEach((file) => {
        const ext = path.extname(file).toLowerCase();
        if (ext === '.xls') {
            const oldPath = path.join(copiedExcelRootFile, file);
            const workbook = XLSX.readFile(oldPath);

            const newPath = path.join(convertedFolder, `${path.basename(file, ext)}.xlsx`);
            XLSX.writeFile(workbook, newPath, { bookType: 'xlsx' });
            console.log(`Converted: ${file} --> ${path.basename(newPath)}`);
        }
    });
}

// Main function
function automateExcelConversion() {
    console.log('Step 1: Copying Excel 2003 files...');
    copyExcelFiles();

    console.log('Step 2: Converting files to newer Excel format...');
    convertExcelFiles();

    console.log('Task Completed!');
}

automateExcelConversion();


async function processExcelFile(directoryPath = './Production Files/copiedExcelRootFile') {
    try {
        const files = fs.readdirSync(directoryPath);
        
        for (const file of files) {
            const filePath = path.join(directoryPath, file);
            
            // Skip if it's a directory
            if (fs.statSync(filePath).isDirectory()) continue;
            
            // Check if it's an Excel file
            const ext = path.extname(file).toLowerCase();
            if (ext !== '.xls' && ext !== '.xlsx') continue;

            try {
                // Read the Excel file
                const workbook = XLSX.readFile(filePath);
                
                const worksheet = workbook.Sheets['Microplan H-t-H'];
                
                // Modify cell A1 (using XLSX notation)
                worksheet['A1'] = { t: 's', v: '1234' };  // t:'s' means string type, v is the value
                
                // Write back to the same file
                XLSX.writeFile(workbook, filePath);
                console.log(`Excel file ${file} updated successfully!`);

            } catch (error) {
                console.error(`Error processing Excel file ${file}:`, error.message);
            }
        }
    } catch (error) {
        console.error('Error reading directory:', error);
    }
}

// Call the async function
(async () => {
    await processExcelFile();
})();

