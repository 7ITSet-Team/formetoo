export default {
    connection: {
        port: 8082
    },
    jwt: {
        secret: 'SYW/:ZIFrxd\')ueR#<Oj,ABzutT]QI({%MekfS9(l|7NM-&m6RTgP@)X44sOGVE',
        lifetime: 1000 * 60 * 60 * 24 * 30
    },
    db: {
        url: 'mongodb://localhost/formetoo'
    },
    nodemailer: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'formetood@gmail.com',
            pass: 'topotop123'
        }
    },
    contacts: {
        support: {
            mail: 'support@formetoo.ru'
        }
    }
}