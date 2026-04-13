// Mockoljuk a MySQL kapcsolatot (becsapjuk, mintha lenne adatbázis)
jest.mock('mysql2', () => ({
    createPool: jest.fn(() => ({
        promise: jest.fn(() => ({
            query: jest.fn().mockResolvedValue([[]]),
            getConnection: jest.fn().mockResolvedValue({
                query: jest.fn().mockResolvedValue([[]]),
                beginTransaction: jest.fn().mockResolvedValue(),
                commit: jest.fn().mockResolvedValue(),
                rollback: jest.fn().mockResolvedValue(),
                release: jest.fn()
            })
        })),
        getConnection: jest.fn((cb) => cb(null, { release: jest.fn() }))
    }))
}));

// Mockoljuk a nodemailer-t (becsapjuk, mintha emailt küldene)
jest.mock('nodemailer', () => ({
    createTransport: jest.fn(() => ({
        sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' })
    }))
}));

// Mockoljuk a bcrypt-t (becsapjuk, mintha jelszót hash-elne)
jest.mock('bcryptjs', () => ({
    hash: jest.fn().mockResolvedValue('hashedpassword'),
    compare: jest.fn().mockResolvedValue(true)
}));

// Mockoljuk a jsonwebtoken-t (becsapjuk, mintha token-t gyártana)
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(() => 'fake-token'),
    verify: jest.fn(() => ({ id: 1 }))
}));