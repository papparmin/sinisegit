const { spawn, execSync } = require('child_process');

console.log('\x1b[33m%s\x1b[0m', '⏳ A RENDSZER indítása folyamatban... (Kérlek várj pár másodpercet)');

// Docker indítása a háttérben
const docker = spawn('docker', ['compose', 'up', '-d', '--build'], { stdio: 'inherit', shell: true });

docker.on('close', (code) => {
    if (code === 0) {
        console.clear();
        console.log('\x1b[32m%s\x1b[0m', '✅ A RENDSZER SIKERESEN ELINDULT!');
        console.log('--------------------------------------------------');
        console.log('🌍 \x1b[36mWEBOLDAL (Frontend):\x1b[0m       http://localhost:8100');  // <-- ÚJ PORT
        console.log('🗄️  \x1b[36mADATBÁZIS (PhpMyAdmin):\x1b[0m    http://localhost:8101');  // <-- ÚJ PORT
        console.log('⚙️  \x1b[36mBACKEND API:\x1b[0m               http://localhost:5050');  // <-- ÚJ PORT
        console.log('--------------------------------------------------');
        console.log('\x1b[33m%s\x1b[0m', '🛑 LEÁLLÍTÁSHOZ NYOMJ: CTRL + C');
        
        setInterval(() => {}, 1000);
    } else {
        console.error('\x1b[31m%s\x1b[0m', '❌ Hiba történt a Docker indításakor!');
        process.exit(1);
    }
});

process.on('SIGINT', () => {
    console.log('\n\x1b[31m%s\x1b[0m', '🛑 Leállítás folyamatban... (A konténerek leállnak)');
    try {
        execSync('docker compose down', { stdio: 'inherit' });
        console.log('\x1b[32m%s\x1b[0m', '✅ Minden leállt. Viszlát!');
        process.exit(0);
    } catch (e) {
        console.log('\x1b[31m%s\x1b[0m', '❌ Hiba a leállításkor, de a program kilép.');
        process.exit(1);
    }
});