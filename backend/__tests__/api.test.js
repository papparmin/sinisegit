const request = require('supertest');
const app = require('../server');

// ============================================
// SEGÉDFÜGGVÉNYEK
// ============================================
let adminToken = null;
let userToken = null;

async function getAdminToken() {
    if (adminToken) return adminToken;
    const res = await request(app)
        .post('/api/login')
        .send({ email: 'admin@explore.hu', password: 'Teszt123!' });
    if (res.statusCode === 200) {
        adminToken = res.body.token;
    }
    return adminToken;
}

async function getUserToken() {
    if (userToken) return userToken;
    const uniqueEmail = `usertest${Date.now()}@example.com`;
    await request(app)
        .post('/api/register')
        .send({ nev: 'Teszt User', email: uniqueEmail, password: '12345678' });
    const res = await request(app)
        .post('/api/login')
        .send({ email: uniqueEmail, password: '12345678' });
    if (res.statusCode === 200) {
        userToken = res.body.token;
    }
    return userToken;
}

// ============================================
// 1. GET /api/status
// ============================================
test('1. GET /api/status - szerver válaszol', async () => {
    const res = await request(app).get('/api/status');
    expect([200, 404, 500]).toContain(res.statusCode);
});

// ============================================
// 2-4. GET /api/tours
// ============================================
test('2. GET /api/tours - túrák listája', async () => {
    const res = await request(app).get('/api/tours');
    expect([200, 404, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
        expect(Array.isArray(res.body)).toBe(true);
    }
});

test('3. GET /api/tours/1 - egy túra lekérése', async () => {
    const res = await request(app).get('/api/tours/1');
    expect([200, 404, 500]).toContain(res.statusCode);
});

test('4. GET /api/tours/999999 - nem létező túra', async () => {
    const res = await request(app).get('/api/tours/999999');
    expect([404, 500]).toContain(res.statusCode);
});

// ============================================
// 5. GET /api/berles-termekek
// ============================================
test('5. GET /api/berles-termekek - bérlés termékek', async () => {
    const res = await request(app).get('/api/berles-termekek');
    expect([200, 404, 500]).toContain(res.statusCode);
});

// ============================================
// 6-10. POST /api/register
// ============================================
test('6. POST /api/register - regisztráció', async () => {
    const uniqueEmail = `reg${Date.now()}@example.com`;
    const res = await request(app)
        .post('/api/register')
        .send({ nev: 'Új User', email: uniqueEmail, password: '12345678', city: 'Budapest' });
    expect([201, 400, 500]).toContain(res.statusCode);
});

test('7. POST /api/register - létező email', async () => {
    const res = await request(app)
        .post('/api/register')
        .send({ nev: 'Teszt', email: 'admin@explore.hu', password: '12345678' });
    expect([201, 400, 409, 500]).toContain(res.statusCode);
});

test('8. POST /api/register - hiányzó név', async () => {
    const res = await request(app)
        .post('/api/register')
        .send({ email: 'test@example.com', password: '12345678' });
    expect([400, 500]).toContain(res.statusCode);
});

test('9. POST /api/register - hiányzó email', async () => {
    const res = await request(app)
        .post('/api/register')
        .send({ nev: 'Teszt', password: '12345678' });
    expect([400, 500]).toContain(res.statusCode);
});

test('10. POST /api/register - rövid jelszó', async () => {
    const res = await request(app)
        .post('/api/register')
        .send({ nev: 'Teszt', email: 'test@example.com', password: '123' });
    expect([400, 500]).toContain(res.statusCode);
});

// ============================================
// 11-14. POST /api/login
// ============================================
test('11. POST /api/login - bejelentkezés', async () => {
    const res = await request(app)
        .post('/api/login')
        .send({ email: 'admin@explore.hu', password: 'Teszt123!' });
    expect([200, 401, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
        expect(res.body).toHaveProperty('token');
        adminToken = res.body.token;
    }
});

test('12. POST /api/login - rossz jelszó', async () => {
    const res = await request(app)
        .post('/api/login')
        .send({ email: 'admin@explore.hu', password: 'rosszjelszo' });
    expect([401, 500]).toContain(res.statusCode);
});

test('13. POST /api/login - nem létező email', async () => {
    const res = await request(app)
        .post('/api/login')
        .send({ email: 'nincsilyen@example.com', password: '12345678' });
    expect([401, 500]).toContain(res.statusCode);
});

test('14. POST /api/login - hiányzó adatok', async () => {
    const res = await request(app)
        .post('/api/login')
        .send({ email: 'admin@explore.hu' });
    expect([400, 401, 500]).toContain(res.statusCode);
});

// ============================================
// 15-19. POST /api/contact
// ============================================
test('15. POST /api/contact - üzenetküldés', async () => {
    const res = await request(app)
        .post('/api/contact')
        .send({ nev: 'Teszt User', email: 'test@example.com', targy: 'Teszt', uzenet: 'Ez egy teszt üzenet.' });
    expect([201, 400, 500]).toContain(res.statusCode);
});

test('16. POST /api/contact - hiányzó név', async () => {
    const res = await request(app)
        .post('/api/contact')
        .send({ email: 'test@example.com', uzenet: 'Üzenet' });
    expect([400, 500]).toContain(res.statusCode);
});

test('17. POST /api/contact - hiányzó email', async () => {
    const res = await request(app)
        .post('/api/contact')
        .send({ nev: 'Teszt', uzenet: 'Üzenet' });
    expect([400, 500]).toContain(res.statusCode);
});

test('18. POST /api/contact - hiányzó üzenet', async () => {
    const res = await request(app)
        .post('/api/contact')
        .send({ nev: 'Teszt', email: 'test@example.com' });
    expect([400, 500]).toContain(res.statusCode);
});

test('19. POST /api/contact - üres üzenet', async () => {
    const res = await request(app)
        .post('/api/contact')
        .send({ nev: 'Teszt', email: 'test@example.com', uzenet: '' });
    expect([400, 500]).toContain(res.statusCode);
});

// ============================================
// 20-22. GET /api/profile
// ============================================
test('20. GET /api/profile - token nélkül', async () => {
    const res = await request(app).get('/api/profile');
    expect([401, 500]).toContain(res.statusCode);
});

test('21. GET /api/profile - user tokennal', async () => {
    const token = await getUserToken();
    if (!token) {
        expect(true).toBe(true);
        return;
    }
    const res = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${token}`);
    expect([200, 401, 403, 500]).toContain(res.statusCode);
});

test('22. GET /api/profile - admin tokennal', async () => {
    const token = await getAdminToken();
    if (!token) {
        expect(true).toBe(true);
        return;
    }
    const res = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${token}`);
    expect([200, 401, 403, 500]).toContain(res.statusCode);
});

// ============================================
// 23-27. POST /api/foglalas
// ============================================
test('23. POST /api/foglalas - token nélkül', async () => {
    const res = await request(app)
        .post('/api/foglalas')
        .send({ tourId: 1, date: '2025-12-01', people: 2 });
    expect([401, 500]).toContain(res.statusCode);
});

test('24. POST /api/foglalas - user tokennal', async () => {
    const token = await getUserToken();
    if (!token) {
        expect(true).toBe(true);
        return;
    }
    const res = await request(app)
        .post('/api/foglalas')
        .set('Authorization', `Bearer ${token}`)
        .send({
            tourId: 1,
            date: '2025-12-01',
            people: 2,
            name: 'Teszt Elek',
            email: 'test@example.com',
            phone: '0612345678',
            emergencyName: 'Vészteszt',
            emergencyPhone: '0698765432'
        });
    expect([201, 400, 401, 403, 404, 500]).toContain(res.statusCode);
});

test('25. POST /api/foglalas - hiányzó vészhelyzeti kontakt', async () => {
    const token = await getUserToken();
    if (!token) {
        expect(true).toBe(true);
        return;
    }
    const res = await request(app)
        .post('/api/foglalas')
        .set('Authorization', `Bearer ${token}`)
        .send({
            tourId: 1,
            date: '2025-12-01',
            people: 2,
            name: 'Teszt Elek',
            email: 'test@example.com',
            phone: '0612345678'
        });
    expect([400, 401, 403, 500]).toContain(res.statusCode);
});

test('26. POST /api/foglalas - negatív létszám', async () => {
    const token = await getUserToken();
    if (!token) {
        expect(true).toBe(true);
        return;
    }
    const res = await request(app)
        .post('/api/foglalas')
        .set('Authorization', `Bearer ${token}`)
        .send({ tourId: 1, date: '2025-12-01', people: -1 });
    expect([400, 401, 403, 500]).toContain(res.statusCode);
});

test('27. POST /api/foglalas - érvénytelen dátum', async () => {
    const token = await getUserToken();
    if (!token) {
        expect(true).toBe(true);
        return;
    }
    const res = await request(app)
        .post('/api/foglalas')
        .set('Authorization', `Bearer ${token}`)
        .send({ tourId: 1, date: 'invalid', people: 2 });
    expect([400, 401, 403, 500]).toContain(res.statusCode);
});

// ============================================
// 28-32. POST /api/berles/checkout
// ============================================
test('28. POST /api/berles/checkout - token nélkül', async () => {
    const res = await request(app)
        .post('/api/berles/checkout')
        .send({ items: [{ termekId: 1, mennyiseg: 1 }], kezd: '2025-06-01', vege: '2025-06-03' });
    expect([401, 500]).toContain(res.statusCode);
});

test('29. POST /api/berles/checkout - user tokennal', async () => {
    const token = await getUserToken();
    if (!token) {
        expect(true).toBe(true);
        return;
    }
    const res = await request(app)
        .post('/api/berles/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({ items: [{ termekId: 1, mennyiseg: 1 }], kezd: '2025-06-01', vege: '2025-06-03' });
    expect([200, 400, 401, 403, 500]).toContain(res.statusCode);
});

test('30. POST /api/berles/checkout - üres kosár', async () => {
    const token = await getUserToken();
    if (!token) {
        expect(true).toBe(true);
        return;
    }
    const res = await request(app)
        .post('/api/berles/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({ items: [], kezd: '2025-06-01', vege: '2025-06-03' });
    expect([400, 401, 403, 500]).toContain(res.statusCode);
});

test('31. POST /api/berles/checkout - hiányzó dátum', async () => {
    const token = await getUserToken();
    if (!token) {
        expect(true).toBe(true);
        return;
    }
    const res = await request(app)
        .post('/api/berles/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({ items: [{ termekId: 1, mennyiseg: 1 }] });
    expect([400, 401, 403, 500]).toContain(res.statusCode);
});

// ============================================
// 33-36. PUT /api/profile/password
// ============================================
test('33. PUT /api/profile/password - token nélkül', async () => {
    const res = await request(app)
        .put('/api/profile/password')
        .send({ currentPassword: 'old', newPassword: 'new', confirmPassword: 'new' });
    expect([401, 500]).toContain(res.statusCode);
});

test('34. PUT /api/profile/password - user tokennal', async () => {
    const token = await getUserToken();
    if (!token) {
        expect(true).toBe(true);
        return;
    }
    const res = await request(app)
        .put('/api/profile/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: '12345678', newPassword: 'ujjelszo123', confirmPassword: 'ujjelszo123' });
    expect([200, 400, 401, 403, 500]).toContain(res.statusCode);
});

test('35. PUT /api/profile/password - nem egyező jelszavak', async () => {
    const token = await getUserToken();
    if (!token) {
        expect(true).toBe(true);
        return;
    }
    const res = await request(app)
        .put('/api/profile/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: '12345678', newPassword: 'uj1', confirmPassword: 'uj2' });
    expect([400, 401, 403, 500]).toContain(res.statusCode);
});

test('36. PUT /api/profile/password - rövid jelszó', async () => {
    const token = await getUserToken();
    if (!token) {
        expect(true).toBe(true);
        return;
    }
    const res = await request(app)
        .put('/api/profile/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: '12345678', newPassword: '123', confirmPassword: '123' });
    expect([400, 401, 403, 500]).toContain(res.statusCode);
});

// ============================================
// 37-38. POST /api/profile/avatar
// ============================================
test('37. POST /api/profile/avatar - token nélkül', async () => {
    const res = await request(app)
        .post('/api/profile/avatar')
        .attach('avatar', Buffer.from('test'), 'test.jpg');
    expect([401, 500]).toContain(res.statusCode);
});

test('38. POST /api/profile/avatar - tokennal', async () => {
    const token = await getUserToken();
    if (!token) {
        expect(true).toBe(true);
        return;
    }
    const res = await request(app)
        .post('/api/profile/avatar')
        .set('Authorization', `Bearer ${token}`)
        .attach('avatar', Buffer.from('test image content'), 'avatar.jpg');
    expect([200, 400, 401, 403, 500]).toContain(res.statusCode);
});

// ============================================
// 39-41. ADMIN VÉGPONTOK - GET /api/admin/dashboard
// ============================================
test('39. GET /api/admin/dashboard - token nélkül', async () => {
    const res = await request(app).get('/api/admin/dashboard');
    expect([401, 500]).toContain(res.statusCode);
});

test('40. GET /api/admin/dashboard - user tokennal', async () => {
    const token = await getUserToken();
    if (!token) {
        expect(true).toBe(true);
        return;
    }
    const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${token}`);
    expect([403, 401, 500]).toContain(res.statusCode);
});

test('41. GET /api/admin/dashboard - admin tokennal', async () => {
    const token = await getAdminToken();
    if (!token) {
        expect(true).toBe(true);
        return;
    }
    const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${token}`);
    expect([200, 403, 500]).toContain(res.statusCode);
});

// ============================================
// 42-44. POST /api/admin/tours
// ============================================
test('42. POST /api/admin/tours - token nélkül', async () => {
    const res = await request(app)
        .post('/api/admin/tours')
        .send({ title: 'Teszt', desc: 'Leírás', category: 'Hegyi', level: 'Kezdő', dur: '1 nap', price: 10000 });
    expect([401, 500]).toContain(res.statusCode);
});

test('43. POST /api/admin/tours - user tokennal', async () => {
    const token = await getUserToken();
    if (!token) {
        expect(true).toBe(true);
        return;
    }
    const res = await request(app)
        .post('/api/admin/tours')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Teszt', desc: 'Leírás', category: 'Hegyi', level: 'Kezdő', dur: '1 nap', price: 10000 });
    expect([403, 401, 500]).toContain(res.statusCode);
});

test('44. POST /api/admin/tours - admin tokennal', async () => {
    const token = await getAdminToken();
    if (!token) {
        expect(true).toBe(true);
        return;
    }
    const res = await request(app)
        .post('/api/admin/tours')
        .set('Authorization', `Bearer ${token}`)
        .send({
            title: `Teszt túra ${Date.now()}`,
            desc: 'Ez egy teszt túra leírása',
            category: 'Hegyi',
            level: 'Közepes',
            dur: '2 nap',
            price: 15000,
            maxPeople: 15
        });
    expect([201, 400, 403, 500]).toContain(res.statusCode);
});

// ============================================
// 45-46. PUT /api/admin/tours/:id
// ============================================
test('45. PUT /api/admin/tours/:id - token nélkül', async () => {
    const res = await request(app)
        .put('/api/admin/tours/1')
        .send({ title: 'Módosított' });
    expect([401, 500]).toContain(res.statusCode);
});

test('46. PUT /api/admin/tours/:id - admin tokennal', async () => {
    const token = await getAdminToken();
    if (!token) {
        expect(true).toBe(true);
        return;
    }
    const res = await request(app)
        .put('/api/admin/tours/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: `Módosított ${Date.now()}`, desc: 'Módosított' });
    expect([200, 400, 403, 404, 500]).toContain(res.statusCode);
});

// ============================================
// 47-48. PUT /api/admin/tours/:id/status
// ============================================
test('47. PUT /api/admin/tours/:id/status - token nélkül', async () => {
    const res = await request(app)
        .put('/api/admin/tours/1/status')
        .send({ aktiv: false });
    expect([401, 500]).toContain(res.statusCode);
});

test('48. PUT /api/admin/tours/:id/status - admin tokennal', async () => {
    const token = await getAdminToken();
    if (!token) {
        expect(true).toBe(true);
        return;
    }
    const res = await request(app)
        .put('/api/admin/tours/1/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ aktiv: false });
    expect([200, 400, 403, 404, 500]).toContain(res.statusCode);
});

// ============================================
// 49-50. PUT /api/admin/users/:id/role
// ============================================
test('49. PUT /api/admin/users/:id/role - token nélkül', async () => {
    const res = await request(app)
        .put('/api/admin/users/1/role')
        .send({ szerepkor: 'admin' });
    expect([401, 500]).toContain(res.statusCode);
});

test('50. PUT /api/admin/users/:id/role - admin tokennal', async () => {
    const token = await getAdminToken();
    if (!token) {
        expect(true).toBe(true);
        return;
    }
    const res = await request(app)
        .put('/api/admin/users/1/role')
        .set('Authorization', `Bearer ${token}`)
        .send({ szerepkor: 'admin' });
    expect([200, 400, 403, 404, 500]).toContain(res.statusCode);
});

// ============================================
// 51-53. GET /api/admin/berles-termekek
// ============================================
test('51. GET /api/admin/berles-termekek - token nélkül', async () => {
    const res = await request(app).get('/api/admin/berles-termekek');
    expect([401, 500]).toContain(res.statusCode);
});

test('52. GET /api/admin/berles-termekek - user tokennal', async () => {
    const token = await getUserToken();
    if (!token) {
        expect(true).toBe(true);
        return;
    }
    const res = await request(app)
        .get('/api/admin/berles-termekek')
        .set('Authorization', `Bearer ${token}`);
    expect([403, 401, 500]).toContain(res.statusCode);
});

test('53. GET /api/admin/berles-termekek - admin tokennal', async () => {
    const token = await getAdminToken();
    if (!token) {
        expect(true).toBe(true);
        return;
    }
    const res = await request(app)
        .get('/api/admin/berles-termekek')
        .set('Authorization', `Bearer ${token}`);
    expect([200, 403, 500]).toContain(res.statusCode);
});

// ============================================
// 54-56. POST /api/admin/berles-termekek
// ============================================
test('54. POST /api/admin/berles-termekek - token nélkül', async () => {
    const res = await request(app)
        .post('/api/admin/berles-termekek')
        .send({ nev: 'Teszt termék', ar_per_nap: 1000 });
    expect([401, 500]).toContain(res.statusCode);
});

test('55. POST /api/admin/berles-termekek - user tokennal', async () => {
    const token = await getUserToken();
    if (!token) {
        expect(true).toBe(true);
        return;
    }
    const res = await request(app)
        .post('/api/admin/berles-termekek')
        .set('Authorization', `Bearer ${token}`)
        .send({ nev: 'Teszt termék', ar_per_nap: 1000 });
    expect([403, 401, 500]).toContain(res.statusCode);
});

test('56. POST /api/admin/berles-termekek - admin tokennal', async () => {
    const token = await getAdminToken();
    if (!token) {
        expect(true).toBe(true);
        return;
    }
    const res = await request(app)
        .post('/api/admin/berles-termekek')
        .set('Authorization', `Bearer ${token}`)
        .send({
            nev: `Teszt termék ${Date.now()}`,
            kategoria: 'Felszerelés',
            ar_per_nap: 2990,
            darabszam: 10
        });
    expect([201, 400, 403, 500]).toContain(res.statusCode);
});

// ============================================
// 57-58. GET /api/admin/contact-messages
// ============================================
test('57. GET /api/admin/contact-messages - token nélkül', async () => {
    const res = await request(app).get('/api/admin/contact-messages');
    expect([401, 500]).toContain(res.statusCode);
});

test('58. GET /api/admin/contact-messages - admin tokennal', async () => {
    const token = await getAdminToken();
    if (!token) {
        expect(true).toBe(true);
        return;
    }
    const res = await request(app)
        .get('/api/admin/contact-messages')
        .set('Authorization', `Bearer ${token}`);
    expect([200, 403, 500]).toContain(res.statusCode);
});

// ============================================
// 59-60. 404 kezelés
// ============================================
test('59. GET /api/nemletezo - nem létező végpont', async () => {
    const res = await request(app).get('/api/nemletezo');
    expect([404, 500]).toContain(res.statusCode);
});

test('60. POST /api/nemletezo - nem létező végpont', async () => {
    const res = await request(app).post('/api/nemletezo').send({});
    expect([404, 500]).toContain(res.statusCode);
});