// const ngrok = require("@ngrok/ngrok");

// async function forwardToApp() {
// 	const forwarder = await ngrok.forward({
// 		addr: "localhost:8443",
// 		authtoken_from_env: true,
// 		domain: "clone-finless-hut.ngrok-free.dev",
// 	});
// 	console.log(`Available at: ${forwarder.url()}`);
// }

// forwardToApp();
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Read the image and generate the base64 string
const base64Image = fs.readFileSync('./public/Photos/hyderabadi_biryani.jpg', { encoding: 'base64' });
const dataString = `{"data:image/jpeg;base64,${base64Image}"}`;

// Write to a temporary file to avoid command-line length limits
const tempFile = path.join(__dirname, 'temp_clipboard.txt');
fs.writeFileSync(tempFile, dataString);

// Read the temp file into the Windows clipboard via PowerShell and clean up
execSync(`powershell -command "Get-Content -Path '${tempFile}' -Raw | Set-Clipboard"`);
fs.unlinkSync(tempFile);

console.log('Successfully copied base64 string to clipboard!');


//ngrok http 8443 --config C:\Users\pranj\AppData\Local\ngrok\ngrok1.yml
//ngrok http 8000 --config C:\Users\pranj\AppData\Local\ngrok\ngrok2.yml