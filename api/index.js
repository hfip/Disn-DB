const express = require('express');
const app = express();

// إعداد تمكين الـ CORS بشكل كامل لضمان اتصال تطبيق ستريمو بدون مشاكل
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    next();
});

// 1. ملف الـ Manifest (تعريف الإضافة بالكامل داخل ستريمو)
const MANIFEST = {
    id: "org.disneydubbed.archive",
    version: "1.0.0",
    name: "ديزني مدبلج - المكتبة الكاملة",
    description: "مكتبة أفلام ديزني المدبلجة بجودة عالية مستضافة على أرشيف الإنترنت",
    resources: ["catalog", "stream"],
    types: ["movie"],
    idPrefixes: ["tt"],
    catalogs: [
        {
            type: "movie",
            id: "disney_dubbed_catalog",
            name: "أفلام ديزني المدبلجة"
        }
    ]
};

// الرابط الأساسي للألبوم المستخرج من أرشيف الإنترنت
const ARCHIVE_BASE_URL = "https://archive.org/download/disney_202105/";

// 2. قاعدة البيانات الكاملة للمكتبة مبنية بمعرفات IMDb والبوسترات الرسمية
const MOVIES_DATABASE = {
    "tt0054591": {
        title: "101 Dalmatians (1961) - 101 مرقش",
        filename: "101.Dalmatians.1961.1080p.BluRay.H.265.Egy.mkv",
        poster: "https://image.tmdb.org/t/p/w500/182A9vSOfS9Z8UqZ8FvT3fXfW6G.jpg"
    },
    "tt0103639": {
        title: "Aladdin (1992) - علاء الدين",
        filename: "Aladdin.1992.1080p.BluRay.Arabic.mkv",
        poster: "https://image.tmdb.org/t/p/w500/eio6sk838g6gZ674vU67wU6vvSu.jpg"
    },
    "tt0110357": {
        title: "The Lion King (1994) - الأسد الملك",
        filename: "The.Lion.King.1994.1080p.BluRay.Arabic.mkv",
        poster: "https://image.tmdb.org/t/p/w500/sKCr76HL6bZ3HQv7hw96C9w8Zwq.jpg"
    },
    "tt0101414": {
        title: "Beauty and the Beast (1991) - الجميلة والوحش",
        filename: "Beauty.and.the.Beast.1991.1080p.BluRay.Arabic.mkv",
        poster: "https://image.tmdb.org/t/p/w500/uw8byZ5mK6nFm9Dsh5u46765.jpg"
    },
    "tt0114709": {
        title: "Toy Story (1995) - حكاية لعبة",
        filename: "Toy.Story.1995.1080p.BluRay.Arabic.mkv",
        poster: "https://image.tmdb.org/t/p/w500/uXDfjJbdv4j7evvPy87Deu6wI3n.jpg"
    },
    "tt0266543": {
        title: "Finding Nemo (2003) - البحث عن نيمو",
        filename: "Finding.Nemo.2003.1080p.BluRay.Arabic.mkv",
        poster: "https://image.tmdb.org/t/p/w500/eHuGQ10m2asw1gmrSjGjX0p67rw.jpg"
    },
    "tt0120762": {
        title: "Mulan (1998) - مولان",
        filename: "Mulan.1998.1080p.BluRay.Arabic.mkv",
        poster: "https://image.tmdb.org/t/p/w500/4vI96Nf0bC18C4Nf5pS8X8C4Oa.jpg"
    },
    "tt0042332": {
        title: "Cinderella (1950) - سندريلا",
        filename: "Cinderella.1950.1080p.BluRay.Arabic.mkv",
        poster: "https://image.tmdb.org/t/p/w500/avY6u7f6pGOn8F5pX5P4Wc6S.jpg"
    },
    "tt0119282": {
        title: "Hercules (1997) - هرقل",
        filename: "Hercules.1997.1080p.BluRay.Arabic.mkv",
        poster: "https://image.tmdb.org/t/p/w500/775u0n8W6Gf7w5X4pS4O8G1g.jpg"
    },
    "tt0198781": {
        title: "Monsters, Inc. (2001) - شركة المرعبين المحدودة",
        filename: "Monsters.Inc.2001.1080p.BluRay.Arabic.mkv",
        poster: "https://image.tmdb.org/t/p/w500/w9kR8qbmv8zAr7YvO8g297p77SU.jpg"
    }
};

// 3. المسار الرئيسي لمنع خطأ 404 عند دخول المتصفح مباشرة للرابط
app.get('/', (req, res) => {
    res.send('إضافة ستريمو لديزني المدبلج تعمل بنجاح! لتركيبها في التطبيق استخدم مسار /manifest.json في نهاية الرابط.');
});

// 4. مسار الـ Manifest
app.get('/manifest.json', (req, res) => {
    res.json(MANIFEST);
});

// 5. مسار الكتالوج لعرض قائمة الأفلام داخل واجهة ستريمو
app.get('/catalog/movie/disney_dubbed_catalog.json', (req, res) => {
    const metas = Object.keys(MOVIES_DATABASE).map(id => ({
        id: id,
        type: "movie",
        name: MOVIES_DATABASE[id].title,
        poster: MOVIES_DATABASE[id].poster
    }));
    res.json({ metas });
});

// 6. مسار جلب رابط البث المباشر الفوري عند الضغط على الفيلم
app.get('/stream/movie/:id.json', (req, res) => {
    const id = req.params.id.replace('.json', '');
    
    if (MOVIES_DATABASE[id]) {
        const movie = MOVIES_DATABASE[id];
        // تشفير اسم الملف برمجياً لمنع حدوث مشاكل في المسافات أو الرموز داخل الرابط
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

module.exports = app;
