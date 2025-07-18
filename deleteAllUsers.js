const mongoose = require('mongoose');
const dotenv = require('dotenv');
const readline = require('readline');

// تحميل متغيرات البيئة (سيقوم بقراءة ملف .env)
dotenv.config();

// استيراد نموذج المستخدم
const User = require('./models/User');

// دالة للاتصال بقاعدة البيانات
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // Options are no longer needed in Mongoose 6+
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

// دالة الحذف الرئيسية
const deleteAllUsers = async () => {
    try {
        const result = await User.deleteMany({}); // {} تعني حذف كل المستندات
        console.log(`✅ Success! Deleted ${result.deletedCount} users.`);
    } catch (error) {
        console.error(`❌ Error deleting users: ${error.message}`);
    }
};

// واجهة لسطر الأوامر لتأكيد العملية
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const run = async () => {
    console.log('--- SCRIPT TO DELETE ALL USERS ---');
    console.log('Connecting to the database...');
    
    // تأكد من اسم قاعدة البيانات (اختياري ولكنه جيد للأمان)
    const dbName = new URL(process.env.MONGO_URI).pathname.substring(1);
    if (dbName !== '') {
        console.error(`\n🛑 DANGER: Your database name is NOT 'test'. It is '${dbName}'.`);
        console.error('This script is configured to run ONLY on the "test" database for safety.');
        rl.close();
        process.exit(1);
    }

    await connectDB();

    console.log('\n======================================================');
    console.log('🚨 WARNING: THIS ACTION IS IRREVERSIBLE! 🚨');
    console.log(`You are about to delete ALL users from the '${dbName}' database.`);
    console.log('======================================================\n');

    rl.question('Type "DELETE ALL" to confirm: ', async (answer) => {
        if (answer === 'DELETE ALL') {
            console.log('\nConfirmation received. Deleting all users...');
            await deleteAllUsers();
        } else {
            console.log('\nConfirmation incorrect. Aborting script.');
        }
        
        rl.close();
        // إغلاق اتصال قاعدة البيانات بعد الانتهاء
        await mongoose.connection.close();
        console.log('Database connection closed.');
        process.exit(0);
    });
};

run();