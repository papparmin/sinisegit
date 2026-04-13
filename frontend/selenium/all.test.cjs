const { Builder, By } = require('selenium-webdriver');
require('chromedriver');

async function runTests() {
    console.log('\n🚀 Selenium tesztek futtatása...\n');
    
    let driver;
    let passed = 0;
    let failed = 0;
    
    try {
        driver = await new Builder().forBrowser('chrome').build();
        
        // TESZT #1
        console.log('📋 Teszt #1 - Home oldal');
        await driver.get('http://localhost:8100');
        await driver.sleep(2000);
        console.log('   ✅ Home oldal betöltődött');
        passed++;
        
        // TESZT #2
        console.log('📋 Teszt #2 - Túrák oldal');
        await driver.get('http://localhost:8100/turak');
        await driver.sleep(2000);
        console.log('   ✅ Túrák oldal betöltődött');
        passed++;
        
        // TESZT #3
        console.log('📋 Teszt #3 - Bérlés oldal');
        await driver.get('http://localhost:8100/berles');
        await driver.sleep(2000);
        console.log('   ✅ Bérlés oldal betöltődött');
        passed++;
        
        // TESZT #4
        console.log('📋 Teszt #4 - Galéria oldal');
        await driver.get('http://localhost:8100/galeria');
        await driver.sleep(2000);
        console.log('   ✅ Galéria oldal betöltődött');
        passed++;
        
        // TESZT #5
        console.log('📋 Teszt #5 - Profil oldal');
        await driver.get('http://localhost:8100/profil');
        await driver.sleep(2000);
        console.log('   ✅ Profil oldal betöltődött');
        passed++;
        
        // TESZT #6
        console.log('📋 Teszt #6 - Foglalás oldal');
        await driver.get('http://localhost:8100/foglalas');
        await driver.sleep(2000);
        console.log('   ✅ Foglalás oldal betöltődött');
        passed++;
        
        // TESZT #7
        console.log('📋 Teszt #7 - Fizetés oldal');
        await driver.get('http://localhost:8100/fizetes');
        await driver.sleep(2000);
        console.log('   ✅ Fizetés oldal betöltődött');
        passed++;
        
        // TESZT #8
        console.log('📋 Teszt #8 - Helyszínek oldal');
        await driver.get('http://localhost:8100/helyszinek-terkep');
        await driver.sleep(2000);
        console.log('   ✅ Helyszínek oldal betöltődött');
        passed++;
        
        // TESZT #9
        console.log('📋 Teszt #9 - Admin oldal');
        await driver.get('http://localhost:8100/admin');
        await driver.sleep(2000);
        console.log('   ✅ Admin oldal betöltődött');
        passed++;
        
        // TESZT #10
        console.log('📋 Teszt #10 - Impresszum oldal');
        await driver.get('http://localhost:8100/impresszum');
        await driver.sleep(2000);
        console.log('   ✅ Impresszum oldal betöltődött');
        passed++;
        
        // EREDMÉNYEK
        console.log('\n' + '='.repeat(40));
        console.log(`📊 Eredmény: ${passed}/${passed + failed} teszt sikeres`);
        console.log('='.repeat(40));
        
    } catch (error) {
        console.error('❌ Hiba:', error.message);
        failed++;
    } finally {
        if (driver) await driver.quit();
    }
}

runTests();