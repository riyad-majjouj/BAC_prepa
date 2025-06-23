// deleteAllQuestionsNode.js
// يتطلب تثبيت mongoose: npm install mongoose dotenv
require('dotenv').config(); // لتحميل متغيرات البيئة من ملف .env (مثل MONGO_URI)
const mongoose = require('mongoose');

// 1. تعريف موديل السؤال (Question) - يجب أن يكون مطابقًا لتعريفه في تطبيقك
//    إذا كان موديل السؤال لديك في ملف منفصل، قم باستيراده.
//    هنا مثال مبسط إذا لم يكن لديك ملف موديل منفصل لهذا السكربت.
let Question;
try {
    // حاول استخدام الموديل إذا كان مُسجلاً بالفعل (في حالة تشغيله ضمن سياق تطبيق أكبر نادرًا)
    Question = mongoose.model('Question');
} catch (error) {
    // إذا لم يكن الموديل مُسجلاً، قم بتعريفه هنا للسكربت فقط
    const questionSchema = new mongoose.Schema({}, { strict: false, collection: 'questions' });
    // strict: false يسمح بأي حقول (مفيد للحذف العام)
    // collection: 'questions' يضمن أنه يعمل على المجموعة الصحيحة
    Question = mongoose.model('Question', questionSchema);
}


// 2. إعدادات الاتصال بقاعدة البيانات
//    افترض أن MONGO_URI موجود في ملف .env الخاص بك
//    وأن اسم قاعدة البيانات هو 'test' كما ذكرت.
//    إذا لم يكن 'test' هو الاسم الصحيح، عدّله في MONGO_URI.
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error("خطأ: لم يتم العثور على MONGO_URI في متغيرات البيئة.");
    console.log("يرجى التأكد من وجود ملف .env يحتوي على MONGO_URI=mongodb+srv://user:pass@cluster/dbName");
    process.exit(1);
}

// اسم قاعدة البيانات (تأكد من أنه 'test' إذا كان هذا هو ما تستخدمه)
// عادةً ما يتم تضمين اسم قاعدة البيانات في MONGO_URI.
// إذا كان MONGO_URI هو: mongodb+srv://majoriyad:CUbNhg4PYp4Bc0vU@cluster0.bpqezif.mongodb.net/
// يجب أن تضيف اسم قاعدة البيانات إليه ليصبح:
// mongodb+srv://majoriyad:CUbNhg4PYp4Bc0vU@cluster0.bpqezif.mongodb.net/test?retryWrites=true&w=majority
// أو أي اسم قاعدة بيانات آخر تستخدمه.

async function deleteAllQuestions() {
    try {
        console.log("جاري الاتصال بقاعدة البيانات...");
        await mongoose.connect(mongoURI, {
            // useNewUrlParser: true, // لم تعد ضرورية في الإصدارات الحديثة من Mongoose
            // useUnifiedTopology: true, // لم تعد ضرورية
            // serverSelectionTimeoutMS: 5000 // مثال على خيار
        });
        console.log("تم الاتصال بنجاح بـ MongoDB!");
        const dbName = mongoose.connection.name; // اسم قاعدة البيانات المتصل بها
        console.log(`متصل بقاعدة البيانات: ${dbName}`);


        console.log(`\n!!! تحذير شديد !!!`);
        console.log(`أنت على وشك حذف جميع الوثائق من مجموعة 'questions' في قاعدة البيانات '${dbName}'.`);
        console.log(`هذا الإجراء لا يمكن التراجع عنه.`);
        console.log(`سيتم المتابعة خلال 5 ثوانٍ... اضغط CTRL+C للإلغاء الفوري.`);

        // انتظار قصير لإعطاء فرصة للإلغاء
        await new Promise(resolve => setTimeout(resolve, 5000));


        console.log("\nجاري حذف جميع الأسئلة...");
        const countBefore = await Question.countDocuments({});
        console.log(`العدد الحالي للأسئلة قبل الحذف: ${countBefore}`);

        if (countBefore === 0) {
            console.log("لا توجد أسئلة لحذفها.");
        } else {
            const deleteResult = await Question.deleteMany({});
            console.log(`تم بنجاح حذف ${deleteResult.deletedCount} سؤال.`);
            const countAfter = await Question.countDocuments({});
            console.log(`العدد الحالي للأسئلة بعد الحذف: ${countAfter}`);
        }

    } catch (error) {
        console.error("\nحدث خطأ أثناء عملية الحذف:");
        console.error(error);
        if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError') {
            console.error("فشل الاتصال بقاعدة البيانات. تأكد من صحة MONGO_URI ومن أن خادم MongoDB يعمل ويمكن الوصول إليه.");
        }
    } finally {
        console.log("\nجاري إغلاق الاتصال بقاعدة البيانات...");
        await mongoose.disconnect();
        console.log("تم إغلاق الاتصال. انتهى السكربت.");
    }
}

// استدعاء الدالة الرئيسية
deleteAllQuestions();