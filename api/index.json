const express = require('express');
const app = express();

// تمكين الـ CORS لكي يتمكن تطبيق ستريمو من قراءة الإضافة
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

// 1. ملف الـ Manifest (هوية الإضافة داخل ستريمو)
const MANIFEST = {
    id: "org.disneydubbed.torrent",
    version: "1.0.0",
    name: "ديزني مدبلج - تورنت وأرشيف",
    description: "مكتبة أفلام ديزني المدبلجة بجودة عالية مستضافة على أرشيف الإنترنت",
    resources: ["catalog", "stream"],
    types: ["movie"],
    idPrefixes: ["tt", "ds_"], // ds_ للمعرفات الخاصة بك إذا لم تستخدم IMDb
    catalogs: [
        {
            type: "movie",
            id: "disney_dubbed_catalog",
            name: "أفلام ديزني المدبلجة"
        }
    ]
};

// 2. قاعدة بيانات الأفلام (قم بتعديل الأسماء بدقة كما تظهر في التورنت)
const MOVIES_DATABASE = {
    // مثال 1: باستخدام معرف IMDb لفيلم 101 Dalmatians
    "tt0054591": {
        title: "101 Dalmatians (1961)",
        filename: "101.Dalmatians.1961.1080p.BluRay.H.265.Egy.mkv",
        poster: "https://image.tmdb.org/t/p/w500/182A9vSOfS9Z8UqZ8FvT3fXfW6G.jpg" // رابط بوستر اختياري
    },
    // مثال 2: يمكنك ابتكار معرف خاص بك إذا لم تجد IMDb للفيلم
    "ds_aladdin1992": {
        title: "علاء الدين (1992)",
        filename: "Aladdin.1992.1080p.BluRay.Arabic.mkv", // اكتب الاسم مطابق تماماً لملف التورنت
        poster: ""
    }
};

// رابط الأرشيف الأساسي للتحميل المباشر (Webseed)
const ARCHIVE_BASE_URL = "https://archive.org/download/disney_202105/";

// مسار الـ Manifest الرئيسي
app.get('/manifest.json', (req, res) => {
    res.json(MANIFEST);
});

// مسار الكتالوج (عرض الأفلام داخل ستriمو)
app.get('/catalog/movie/disney_dubbed_catalog.json', (req, res) => {
    const metas = Object.keys(MOVIES_DATABASE).map(id => ({
        id: id,
        type: "movie",
        name: MOVIES_DATABASE[id].title,
        poster: MOVIES_DATABASE[id].poster || "https://placehold.co/600x400?text=Disney", // بوستر مؤقت لو لم يتوفر
    }));
    res.json({ metas });
});

// مسار البث (Stream) - عندما يضغط المستخدم على الفيلم ليفتحه
app.get('/stream/movie/:id.json', (req, res) => {
    const id = req.params.id.replace('.json', ''); // تنظيف الـ ID
    
    if (MOVIES_DATABASE[id]) {
        const movie = MOVIES_DATABASE[id];
        // دمج الرابط الأساسي مع اسم الملف لإنشاء رابط ويب سيد مباشر فائق السرعة
        const directStreamUrl = `${ARCHIVE_BASE_URL}${encodeURIComponent(movie.filename)}`;
        
        res.json({
            streams: [
                {
                    title: `بث مباشر (Archive Webseed) - 1080p`,
                    url: directStreamUrl
                }
            ]
        });
    } else {
        res.json({ streams: [] });
    }
});

// تشغيل السيرفر محلياً للتجربة
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Addon running on port ${PORT}`);
});

module.exports = app;
