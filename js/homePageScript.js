class MultiFaceDisplay {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.video = null;
        this.videoTexture = null;
        this.facePlanes = [];
        this.isRunning = false;
        this.hasCamera = false; // Track if camera is available
        this.frameBuffers = [];
        this.currentFrameIndex = 0;
        this.isDelayMode = false;
        this.frameHistory = [];
        this.maxFrameHistory = 50;
        // Frame capture now uses time-based approach (see lastCaptureTime)
        this.delayTextures = [];
        this.isRandomOrder = true;
        this.delayOrder = [];
        this.isZoomMode = false;
        this.zoomSettings = [];
        this.isPrimitiveMode = false;
        this.primitiveSettings = [];
        this.isPixelationMode = true; // DEFAULT MODE - start with pixelation
        this.pixelationSettings = [];

        // Entrance animation for pixelation mode
        this.isEntranceAnimating = false;
        this.entranceAnimationSpeed = 80; // milliseconds between reveals
        this.revealedPanels = new Set();
        this.lastRevealTime = 0;
        this.isInitialLoad = true; // Track if this is the first load

        // Magic numbers
        this.PIXELATION_TEXT_PANEL_COUNT = 9; // Number of pixelation text panels to create

        // Text overlay configuration
        this.enableTextOverlay = true; // Toggle for overlay text
        this.overlayTextCache = new Map(); // Cache for overlay text textures

        // Character-based headline display
        this.enableCharacterDisplay = true; // Toggle for character-based headlines
        this.currentHeadline = "גחליליות"; // Default headline for initial load
        this.characterPanels = []; // Store character panel data
        this.characterGapProbability = 0.3; // 30% chance to add gaps between characters

        this.handDetector = null;
        this.detectedHands = [];
        this.primitiveObjects = [];

        // Font configuration
        this.fontConfig = {
            title: {
                name: 'TheBasics-Bold',
                path: '../css/fonts/TheBasics-Bold.otf',
                boldName: 'TheBasics-DisplayBlack',
                boldPath: '../css/fonts/TheBasics-DisplayBlack.woff2'
            },
            author: {
                name: 'NarkissYair-Regular-TRIAL',
                path: '../css/fonts/NarkissYair-Regular-TRIAL.otf',
                boldName: 'NarkissYair-Bold-TRIAL',
                boldPath: '../css/fonts/NarkissYair-Bold-TRIAL.otf'
            },
            headline: {
                name: 'GretaText-Bold',
                path: '../css/fonts/GretaText-Bold.woff2'
            },
            scentence: {
                name: 'GretaText-Light',
                path: '../css/fonts/GretaText-Light.otf'
            }
        };

        // Face detection
        this.faceDetector = null;
        this.detectedFaces = [];
        this.detectionCanvas = null;
        this.detectionContext = null;
        this.isMediaPipeLoaded = false;
        this.faceDetectionInterval = null;
        this.zoomInitialized = false; // ADD THIS LINE

        // FPS monitoring
        this.fpsCounter = 0;
        this.lastFpsTime = 0;
        this.currentFps = 0;

        // Frame capture timing (for consistent delay mode)
        this.lastCaptureTime = 0;

        // Font loading
        this.fontsLoaded = false;

        // Hebrew articles configuration for each mode
        this.modeArticles = {
            effects: [
                {
                    title: "101 דרכים להבחין בין 'פסיכו' של היצ'קוק ל'פסיכו' של גאס ואן סנט",
                    author: "תומס מ. ליטש",
                    articleSentences: [
                        "המאמר מציע מדריך מקיף להבדלים הרבים – גדולים וקטנים – בין הסרט 'פסיכו' המקורי של היצ'קוק לבין הרימייק של גאס ואן סנט מ-1998.",
                        "באמצעות ניתוח השוואתי מפורט של כל מרכיב – משחק, דיאלוג, סאונד, בימוי, עיצוב ועריכה – נטען שהרימייק שונה מהותית מהמקור גם כאשר הוא שומר לכאורה על נאמנות צורנית."
                    ]
                },
                {
                    title: "'פסיכו', פטישיזם ועונג",
                    author: "ענת זנגר",
                    articleSentences: [
                        "המאמר בוחן את הסרט 'פסיכו' של היצ'קוק דרך עקרונות של חזרתיות, מציצנות ופטישיזם תרבותי.",
                        "זנגר עוקבת אחר גלגוליה הרבים של 'פסיכו' ו'סצנת המקלחת' שלו בטקסטים קולנועיים ותרבותיים, ומנתחת את הפיכתו לאובייקט פולחן שמעורר עונג מציצני וחרדה תרבותית."
                    ]
                },
                {
                    title: "לשמוע אותך שוב: הקול כמשקף חרדה טכנולוגית בסרטי 'כוכב נולד'",
                    author: "תומר נחושתן",
                    articleSentences: [
                        "המאמר עוקב אחר ארבעת העיבודים של 'כוכב נולד' ובוחן כיצד הם מתמודדים עם חרדה מטכנולוגיות קול והפרדת הקול מהגוף.",
                        "דרך ניתוח סצנות, שירה והקלטה, נטען שהסרטים מבקשים להציג את הקול כנובע 'באופן טבעי' מהכוכבת, גם בעידן של עיבוד דיגיטלי, ובכך שומרים על מיתוס הכוכבות האותנטית."
                    ]
                },
                {
                    title: "הגן שלנו עקור: חזרות והשמטות בסרטי 'הגננת'",
                    author: "אורי יעקובוביץ'",
                    articleSentences: [
                        "המאמר מציג ניתוח השוואתי בין 'הגננת' של נדב לפיד לבין הרימייק האמריקאי שלו, ובוחן את ההבדלים התרבותיים ביניהם.",
                        "באמצעות תיאוריות של אדפטציה, ביטוס וריאלמות, נטען שהגרסה הישראלית מציגה התנגשות בין האמן להקולקטיב, ואילו הרימייק האמריקאי מתמקד באינדיווידואליזם ובמאבק למימוש עצמי."
                    ]
                },
                {
                    title: "להתאהב לצלילי הרכבת: קריאה אקוסטית בשלושה גלגולים של 'פגישה מקרית'",
                    author: "רותם זודמן",
                    articleSentences: [
                        "המאמר בוחן את השימוש בקולה של הרכבת בשלושה גלגולים של 'פגישה מקרית' – מחזה, סרט עלילתי והומאז' קולנועי.",
                        "נטען שקול הרכבת אינו רק רכיב ריאליסטי, אלא אלמנט אקוסטי טעון שמבטא את רגשות הדמויות, ומופיע כסמן לחרדה, כמפעיל עלילתי וכסמל לפיצול פנימי."
                    ]
                }
            ],
            delay: [
                {
                    title: "'זד ושני אפסים' של פיטר גרינאוויי פוגש את 'השיגעון הלבן' של אדריאן דיטוורסט",
                    author: "חרווין ואן דר פול",
                    articleSentences: [
                        "המאמר מתאר את חוויית הצפייה הסינפילית דרך השוואה מפתיעה בין הסרט 'זד ושני אפסים' של גרינאוויי ל'הַשִּׁגָּעוֹן הַלָּבָן' של דיטוורסט.",
                        "ואן דר פול בוחן את העונג שבגילוי הקשרים הנסתרים בין סרטים, גם כשאינם מכוונים, כחוויה אינטימית של הסינפיל שמעניקה תחושת גאווה וייחודיות."
                    ]
                },
                {
                    title: "חזרתיות הטיפוסים ומציאותיות הזמן בקולנוע ההוליוודי: צ'נינג טייטום כמקרה מבחן",
                    author: "יואב ארבל",
                    articleSentences: [
                        "המאמר טוען כי חזרתיות בליהוקו של צ'נינג טייטום לטיפוס קולנועי מסוים יוצרת תחושת זמן ריאליסטית ועמוקה בקולנוע.",
                        "דרך תפקידיו השונים אך הדומים של טייטום, המאמר מדגים כיצד טיפוס קולנועי מתבגר עם הצופה ויוצר חוויית זמן קולקטיבית."
                    ]
                },
                {
                    title: "החזרה בקולנוע של אנייס ורדה כמערכת של עודפות קולנועית, חתרנות והנאה",
                    author: "טל רז",
                    articleSentences: [
                        "המאמר בוחן כיצד החזרה – סגנונית, נרטיבית ובין-טקסטואלית – משמשת את אנייס ורדה ככלי ליצירת עונג קולנועי לצד מסר פמיניסטי רדיקלי.",
                        "באמצעות ניתוח סרטים מרכזיים, נטען שהחזרה מאפשרת הן חוויה אסתטית והן גיבוש של תודעה ביקורתית אצל הצופה."
                    ]
                },
                {
                    title: "דינמיקת החזרה כאסטרטגיה של דימוי הגוף הנשי השמן",
                    author: "דורית גילון פיסטינר",
                    articleSentences: [
                        "המאמר עוסק באופן שבו סרטים קומיים פוסט-פמיניסטיים מציגים את הגוף הנשי השמן בעזרת תחבולות חזרתיות שמפרקות סטריאוטיפים ויוצרות ייצוג חדש וחיובי.",
                        "באמצעות ניתוח סרטים כמו 'מרגישה פצצה' ו'כמה רומנטי', מוצגת דינמיקת החזרה ככלי פוליטי וחתרני שבונה סובייקט נשי שמן גאה ועצמאי."
                    ]
                }
            ],
            zoom: [
                {
                    title: "התפתחות הדמויות בסדרות טלוויזיה: מסגרת של מערכת אקולוגית נרטיבית",
                    author: "ורוניקה אינוצ'נטי וגוליילמו פסקאטורה",
                    articleSentences: [
                        "המאמר מציע פרדיגמה חדשנית להבנת סדרות טלוויזיה כ'מערכת אקולוגית נרטיבית' – מודל שמתאר כיצד דמויות עוברות תהליכי ברירה והתפתחות בדומה לעולם הטבע.",
                        "באמצעות אנלוגיה ביולוגית, מוצגות דרכים שבהן תסריטאים ומפיקים מעצבים את הדמויות לאורך זמן כדי להבטיח הישרדות, שינוי ויציבות של יקום הסדרה."
                    ]
                },
                {
                    title: "מתחת לברדס הצדק: טראומת הגזע וחזרתיות באקוסיסטם 'השומרים'",
                    author: "יונתן אונגר",
                    articleSentences: [
                        "המאמר מנתח את הסדרה 'השומרים' כקריאה מחודשת ביצירה הקנונית של מור וגיבונס, דרך פריזמה של טראומה בין-דורית וגזענות אמריקאית.",
                        "באמצעות מודל האקוסיסטם הנרטיבי והיפר-טקסטואליות, נטען שהסדרה מבצעת רה-קונסטרוקציה של מיתוס גיבורי-העל ומציעה תיקון היסטורי באמצעות זהות שחורה גיבורת-על חדשה."
                    ]
                },
                {
                    title: "בחזרה ל'טווין פיקס' דרך הקריסטל",
                    author: "ליאור פרלשטיין",
                    articleSentences: [
                        "המאמר קורא את 'טווין פיקס: החזרה' כגרסה מאוחרת המפרקת את תפיסת הזמן והזהות, ומציעה חוויית צפייה פתלתלה וא-ליניארית.",
                        "באמצעות מושג 'דימוי-הקריסטל' של דלז, נטען שהחזרה משקפת מצבי זמן קונפליקטואליים – חיים ומוות, עבר ועתיד – ומערערת על מושג המקור ביצירה הסדרתית."
                    ]
                },
                {
                    title: "'האחיות בראון': זמן וחזרתיות בסדרת התצלומים של ניקולס ניקסון",
                    author: "מיה פרנקל טנא",
                    articleSentences: [
                        "המאמר עוסק בפרויקט הצילום רב-השנים של ניקולס ניקסון, שמתעד את ארבע האחיות לבית בראון במשך כמעט חמישה עשורים.",
                        "הטקסט בוחן כיצד החזרתיות והפורמט הקבוע יוצרים ייצוג רגשי, ספירלי וליניארי של הזמן, ומציעים לצופה חוויה של תיעוד מתמשך, זיכרון והשתקפות עצמית."
                    ]
                }
            ],
            pixelation: [
                {
                    title: "פיקסלים כמטפורה: הרטרו-פוטוריזם של משחקי הווידאו הקלאסיים",
                    author: "דן גרוס",
                    articleSentences: [
                        "פיקסלים במשחקי וידאו קלאסיים מייצגים נוסטלגיה ועתיד בו זמנית.",
                        "הרטרו-פוטוריזם יוצר מפגש מעניין בין טכנולוגיה ישנה לחדשה."
                    ]
                },
                {
                    title: "חזרת הפרימיטיב: פיקסלציה כאמצעי הפשטה באמנות דיגיטלית",
                    author: "מאיה רון",
                    articleSentences: [
                        "פיקסלציה מאפשרת חזרה אל הבסיסי והפרימיטיבי באמנות הדיגיטלית.",
                        "ההפשטה הדיגיטלית יוצרת שפה חדשה של ביטוי אמנותי."
                    ]
                },
                {
                    title: "הקישור הנעדר: ממשחקי ארקיד לקולנוע אקספריטמנטלי",
                    author: "יונתן שמאי",
                    articleSentences: [
                        "הקשר בין משחקי ארקיד לקולנוע אקספריטמנטלי חושף שפה ויזואלית משותפת.",
                        "הפיקסל כיחידה ויזואלית מקשרת בין מדיות שונות."
                    ]
                },
                {
                    title: "ביטים וביטקוינים: האסתטיקה הדיגיטלית כמוצר פיננסי",
                    author: "נעמה לוי",
                    articleSentences: [
                        "האסתטיקה הדיגיטלית הופכת למוצר פיננסי באמצעות NFT וקריפטו.",
                        "ביטים הופכים לביטקוינים ויוצרים כלכלה חדשה של אמנות דיגיטלית."
                    ]
                }
            ]
        };

        // Store text textures for each mode
        this.textTexturesCache = {};

        // Add raycaster for mouse interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredPanel = null;

        // 3x3 hover system properties - SIMPLIFIED
        this.hoveredArea = null; // Stores current hover info
        this.overlayPlane = null; // Single overlay plane for 3x3 text
        this.overlayMaterial = null; // Material for overlay plane
        this.currentHoveredPanel = null; // Store currently hovered panel for twin detection

        // Add mouse move event listener
        window.addEventListener('mousemove', (event) => this.onMouseMove(event));

        this.init();
        this.setupEventListeners();
        this.initializeMediaPipe();
        this.loadCustomFonts();

        // Image configuration for each mode
        this.modeImages = {
            pixelation: ['images/NoCamera/0.webp', 'images/NoCamera/1.webp'],
            effects: ['images/NoCamera/0.webp', 'images/NoCamera/1.webp'],
            zoom: ['images/NoCamera/0.webp', 'images/NoCamera/1.webp'],
            delay: ['images/NoCamera/0.webp', 'images/NoCamera/1.webp']
        };

        // Storage for loaded image textures
        this.loadedImageTextures = {};
        this.loadedImages = {}; // Store HTML Image elements for canvas drawing
        this.imagesLoaded = false;
    }

    getCurrentModeKey() {
        if (this.isDelayMode) return 'delay';
        if (this.isZoomMode) return 'zoom';
        if (this.isPrimitiveMode) return 'primitive';
        if (this.isPixelationMode) return 'pixelation';
        return 'effects'; // default
    }

    getArticlesForCurrentMode() {
        const modeKey = this.getCurrentModeKey();
        return this.modeArticles[modeKey] || this.modeArticles.effects;
    }

    // NEW: Check if running in fallback mode (without camera)
    isInFallbackMode() {
        return this.isRunning && !this.hasCamera;
    }

    // NEW: Load images for fallback mode
    async loadModeImages() {
        console.log('🖼️ Loading mode images for fallback mode...');

        const loader = new THREE.TextureLoader();
        const loadPromises = [];

        // Get unique image paths (avoid loading duplicates)
        const uniquePaths = new Set();
        Object.values(this.modeImages).forEach(imagePaths => {
            imagePaths.forEach(path => uniquePaths.add(path));
        });

        // Load each unique image
        for (const imagePath of uniquePaths) {
            const promise = new Promise((resolve, reject) => {
                // Load as HTML Image element for canvas drawing
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    // Store the HTML Image element
                    this.loadedImages[imagePath] = img;
                    
                    // Also create the THREE.js texture
                    const texture = new THREE.Texture(img);
                    texture.minFilter = THREE.LinearFilter;
                    texture.magFilter = THREE.LinearFilter;
                    texture.needsUpdate = true;
                    this.loadedImageTextures[imagePath] = texture;
                    
                    console.log(`✅ Loaded image: ${imagePath}`);
                    resolve(texture);
                };
                img.onerror = (error) => {
                    console.warn(`⚠️ Failed to load image: ${imagePath}`, error);
                    reject(error);
                };
                img.src = imagePath;
            });
            loadPromises.push(promise);
        }

        try {
            await Promise.all(loadPromises);
            this.imagesLoaded = true;
            console.log('✅ All mode images loaded successfully!');
            return true;
        } catch (error) {
            console.error('❌ Some images failed to load:', error);
            this.imagesLoaded = false;
            return false;
        }
    }

    loadCustomFonts() {
        // Load custom Hebrew fonts using the font configuration
        const titleFont = new FontFace(this.fontConfig.title.name, `url(${this.fontConfig.title.path})`);
        const titleBoldFont = new FontFace(this.fontConfig.title.boldName, `url(${this.fontConfig.title.boldPath})`);
        const authorFont = new FontFace(this.fontConfig.author.name, `url(${this.fontConfig.author.path})`);
        const authorBoldFont = new FontFace(this.fontConfig.author.boldName, `url(${this.fontConfig.author.boldPath})`);
        const headlineFont = new FontFace(this.fontConfig.headline.name, `url(${this.fontConfig.headline.path})`);
        const sentenceFont = new FontFace(this.fontConfig.scentence.name, `url(${this.fontConfig.scentence.path})`);

        // // console.log('Starting to load fonts...');
        // // console.log('Sentence font config:', {
        //     name: this.fontConfig.scentence.name,
        //     path: this.fontConfig.scentence.path
        // });

        Promise.all([
            titleFont.load().catch(e => { console.error('Title font failed:', e); throw e; }),
            titleBoldFont.load().catch(e => { console.error('Title bold font failed:', e); throw e; }),
            authorFont.load().catch(e => { console.error('Author font failed:', e); throw e; }),
            authorBoldFont.load().catch(e => { console.error('Author bold font failed:', e); throw e; }),
            headlineFont.load().catch(e => { console.error('Headline font failed:', e); throw e; }),
            sentenceFont.load().catch(e => { console.error('Sentence font failed:', e); throw e; })
        ]).then((fonts) => {
            // Add fonts to document
            fonts.forEach(font => {
                document.fonts.add(font);
                // // console.log(`✅ Font loaded and added: ${font.family}`);
            });

            this.fontsLoaded = true;
            // // console.log('🎉 All custom Hebrew fonts loaded successfully!');

            // Test if sentence font is available
            if (document.fonts.check(`16px "${this.fontConfig.scentence.name}"`)) {
                // // console.log('✅ Sentence font is available for use');
            } else {
                console.warn('⚠️ Sentence font not available despite loading');
            }

            // If system is already running, recreate face planes with new fonts
            // This works for both camera and fallback modes
            if (this.isRunning) {
                console.log('🔄 Fonts loaded - recreating face planes with correct fonts');
                this.createFacePlanes();
            }
        }).catch((error) => {
            console.error('❌ Failed to load custom fonts:', error);
            this.fontsLoaded = false;

            // If system is running (either with camera or fallback), recreate face planes
            if (this.isRunning) {
                console.log('🔄 Font loading failed, but recreating face planes with fallback fonts');
                this.createFacePlanes();
            }
        });
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111111);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        // Create renderer with performance optimizations
        this.renderer = new THREE.WebGLRenderer({
            antialias: false,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // Set pixel ratio but cap it for performance
        const pixelRatio = Math.min(window.devicePixelRatio, 2);
        this.renderer.setPixelRatio(pixelRatio);

        document.getElementById('container').appendChild(this.renderer.domElement);

        // Create detection canvas for face analysis (hidden)
        this.detectionCanvas = document.createElement('canvas');
        this.detectionCanvas.width = 640;
        this.detectionCanvas.height = 480;
        this.detectionCanvas.style.display = 'none';
        this.detectionContext = this.detectionCanvas.getContext('2d');
        document.body.appendChild(this.detectionCanvas);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    async initializeMediaPipe() {
        try {
            // // console.log('Initializing MediaPipe face detection...');

            // Check if MediaPipe is available
            if (typeof FaceDetection === 'undefined') {
                console.warn('MediaPipe not loaded, using fallback detection');
                this.isMediaPipeLoaded = false;
                return;
            }

            // Initialize MediaPipe Face Detection with error handling
            this.faceDetector = new FaceDetection({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4/${file}`;
                }
            });

            // Configure the face model with conservative settings
            this.faceDetector.setOptions({
                model: 'short', // Use faster short-range model
                minDetectionConfidence: 0.7, // Higher threshold for stability
            });

            // Set up face results callback with error handling
            this.faceDetector.onResults((results) => {
                try {
                    this.processMediaPipeResults(results);
                } catch (error) {
                    console.warn('MediaPipe results processing failed:', error.message);
                }
            });

            this.isMediaPipeLoaded = true;
            this.mediaPipeFailCount = 0; // Reset fail counter
            // // console.log('MediaPipe face detection initialized successfully!');

        } catch (error) {
            console.warn('MediaPipe initialization failed:', error.message);
            this.isMediaPipeLoaded = false;
        }
    }

    processHandResults(results) {
        this.detectedHands = [];

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            results.multiHandLandmarks.forEach((handLandmarks, index) => {
                // Safely get handedness
                let isRightHand = true; // default
                if (results.multiHandedness && results.multiHandedness[index]) {
                    const handedness = results.multiHandedness[index];
                    isRightHand = handedness.label === 'Right';
                }

                // Ensure we have enough landmarks
                if (handLandmarks.length < 21) {
                    console.warn('Incomplete hand landmarks detected');
                    return;
                }

                // Extract key hand points
                const hand = {
                    isRight: isRightHand,
                    landmarks: handLandmarks.map(landmark => ({
                        x: landmark.x,
                        y: landmark.y,
                        z: landmark.z || 0
                    })),
                    // Key points for primitive mapping
                    wrist: handLandmarks[0],
                    thumb: handLandmarks[4],
                    indexFinger: handLandmarks[8],
                    middleFinger: handLandmarks[12],
                    ringFinger: handLandmarks[16],
                    pinky: handLandmarks[20],
                    palm: handLandmarks[9] // Middle of palm
                };

                this.detectedHands.push(hand);
            });
        }
    }

    processMediaPipeResults(results) {
        this.detectedFaces = [];

        if (results.detections && results.detections.length > 0) {
            results.detections.forEach((detection, index) => {
                const bbox = detection.boundingBox;

                // Safely get confidence score
                let confidence = 0.8; // default
                if (detection.score && detection.score.length > 0) {
                    confidence = detection.score[0];
                } else if (typeof detection.score === 'number') {
                    confidence = detection.score;
                }

                // Convert MediaPipe coordinates to our format
                const face = {
                    centerX: bbox.xCenter,
                    centerY: bbox.yCenter,
                    width: bbox.width,
                    height: bbox.height,
                    confidence: confidence
                };

                this.detectedFaces.push(face);

                // Create additional focus regions for detailed face parts - EYES ONLY
                if (detection.landmarks && detection.landmarks.length >= 4) {
                    // Right eye
                    this.detectedFaces.push({
                        centerX: detection.landmarks[0].x,
                        centerY: detection.landmarks[0].y,
                        width: 0.08,
                        height: 0.06,
                        confidence: 0.9,
                        isEye: true // Mark as eye for primitive mode
                    });

                    // Left eye  
                    this.detectedFaces.push({
                        centerX: detection.landmarks[1].x,
                        centerY: detection.landmarks[1].y,
                        width: 0.08,
                        height: 0.06,
                        confidence: 0.9,
                        isEye: true // Mark as eye for primitive mode
                    });
                }
            });
        }
    }

    startFaceDetection() {
        // Clear any existing interval
        if (this.faceDetectionInterval) {
            clearInterval(this.faceDetectionInterval);
        }

        let isDetecting = false;
        // Remove the local zoomInitialized variable - use class property instead

        // Run face detection with different behavior per mode
        this.faceDetectionInterval = setInterval(async () => {
            if (!this.isRunning || isDetecting) return;

            try {
                isDetecting = true;

                if (this.isZoomMode && !this.zoomInitialized) {
                    // ONE-TIME detection for zoom mode initialization
                    // console.log('🔍 Running initial face detection for zoom initialization...');
                    const faces = await this.detectFaces();
                    this.detectedFaces = faces;
                    this.updateIntelligentZoomSettings(); // This will only run once
                    this.zoomInitialized = true; // Mark as initialized (class property)
                    // console.log('✅ Zoom mode initialized with eye positions');

                } else if (this.isPrimitiveMode) {
                    // Continue detecting for primitive mode (it needs real-time updates)
                    await this.detectFacesForPrimitive();
                }
                // Note: Zoom mode stops detecting after initialization

            } catch (error) {
                console.warn('Face detection loop error:', error.message);
            } finally {
                isDetecting = false;
            }
        }, 150);
    }




    async detectFacesForPrimitive() {
        if (!this.video) {
            // Fallback for when video isn't available - simple eye positions
            this.detectedFaces = [
                { centerX: 0.45, centerY: 0.35, width: 0.08, height: 0.06, confidence: 0.8, isEye: true },
                { centerX: 0.55, centerY: 0.35, width: 0.08, height: 0.06, confidence: 0.8, isEye: true }
            ];
            this.updatePrimitiveObjects();
            return;
        }

        if (!this.isMediaPipeLoaded) {
            // Fallback for when MediaPipe isn't available
            this.detectedFaces = [
                { centerX: 0.45, centerY: 0.35, width: 0.08, height: 0.06, confidence: 0.8, isEye: true },
                { centerX: 0.55, centerY: 0.35, width: 0.08, height: 0.06, confidence: 0.8, isEye: true }
            ];
            this.updatePrimitiveObjects();
            return;
        }

        try {
            // Detect faces using MediaPipe
            if (this.faceDetector) {
                await this.faceDetector.send({ image: this.video });
            }

            // Update primitive objects
            this.updatePrimitiveObjects();

        } catch (error) {
            console.warn('Face detection failed:', error.message);
            // Use fallback data on error
            this.detectedFaces = [
                { centerX: 0.45, centerY: 0.35, width: 0.08, height: 0.06, confidence: 0.8, isEye: true },
                { centerX: 0.55, centerY: 0.35, width: 0.08, height: 0.06, confidence: 0.8, isEye: true }
            ];
            this.updatePrimitiveObjects();
        }
    }

    updateIntelligentZoomSettings() {
        // Only run this ONCE to set initial eye positions
        if (this.zoomSettings.length > 0) {
            // console.log('🔒 Zoom settings already initialized, keeping stable positions');
            return; // Keep existing settings - no real-time updates
        }

        // console.log('🎯 Initializing zoom settings based on eye detection...');

        // Use fallback face detection if no faces detected
        if (!this.detectedFaces.length) {
            // console.log('⚠️ Using fallback face positions for initialization');
            this.detectedFaces = [{
                centerX: 0.5,
                centerY: 0.4,
                width: 0.25,
                height: 0.33,
                confidence: 0.8
            }];
        }

        const faceCount = this.facePlanes.length;

        // Get the main face (not eye-specific detections)
        const mainFace = this.detectedFaces.find(face => !face.isEye) || this.detectedFaces[0];

        // Create eye region variations around the detected face
        const eyeRegions = [
            // Left eye variations
            { x: mainFace.centerX - 0.08, y: mainFace.centerY - 0.05, name: 'left-eye-center' },
            { x: mainFace.centerX - 0.10, y: mainFace.centerY - 0.05, name: 'left-eye-outer' },
            { x: mainFace.centerX - 0.06, y: mainFace.centerY - 0.05, name: 'left-eye-inner' },
            { x: mainFace.centerX - 0.08, y: mainFace.centerY - 0.07, name: 'left-eye-upper' },
            { x: mainFace.centerX - 0.08, y: mainFace.centerY - 0.03, name: 'left-eye-lower' },

            // Right eye variations  
            { x: mainFace.centerX + 0.08, y: mainFace.centerY - 0.05, name: 'right-eye-center' },
            { x: mainFace.centerX + 0.10, y: mainFace.centerY - 0.05, name: 'right-eye-outer' },
            { x: mainFace.centerX + 0.06, y: mainFace.centerY - 0.05, name: 'right-eye-inner' },
            { x: mainFace.centerX + 0.08, y: mainFace.centerY - 0.07, name: 'right-eye-upper' },
            { x: mainFace.centerX + 0.08, y: mainFace.centerY - 0.03, name: 'right-eye-lower' },

            // Between eyes (nose bridge)
            { x: mainFace.centerX, y: mainFace.centerY - 0.05, name: 'nose-bridge' },
            { x: mainFace.centerX, y: mainFace.centerY - 0.08, name: 'between-eyes-upper' },
        ];

        // Create zoom settings for each face panel - ONCE AND STABLE
        for (let i = 0; i < faceCount; i++) {
            // Random zoom level that stays stable
            const zoomTypes = [1.2, 2.0, 3.5, 5.0, 7.5, 10.0];
            const randomZoomBase = zoomTypes[Math.floor(Math.random() * zoomTypes.length)];
            const finalZoom = randomZoomBase * (0.8 + Math.random() * 0.4);

            // Assign eye region based on current face detection
            const regionIndex = i % eyeRegions.length;
            const region = eyeRegions[regionIndex];

            // Convert to shader coordinates - FIXED POSITIONS
            const panX = (region.x - 0.5) * 1.6;
            const panY = (region.y - 0.45) * 1.2;

            this.zoomSettings[i] = {
                zoom: finalZoom,
                panX: panX,
                panY: panY,
                confidence: mainFace.confidence,
                isStable: true, // Mark as stable - never update again
                isFaceAware: true,
                region: region.name,
                assignedRegion: regionIndex
            };

            // // console.log(`Square ${i}: ${region.name}, zoom: ${finalZoom.toFixed(1)}x, pan: (${panX.toFixed(2)}, ${panY.toFixed(2)}) - FIXED`);
        }

        // console.log(`✅ Initialized ${faceCount} STABLE eye-focused zoom settings based on face at (${mainFace.centerX.toFixed(2)}, ${mainFace.centerY.toFixed(2)})`);
    }

    async detectFaces() {
        if (!this.video) {
            console.warn('🚫 No video element available');
            return [];
        }

        // Check if video is actually ready and has valid dimensions
        if (this.video.videoWidth === 0 || this.video.videoHeight === 0) {
            console.warn('🚫 Video not ready - dimensions are 0');
            return [];
        }

        // Check if video is playing
        if (this.video.paused || this.video.ended) {
            console.warn('🚫 Video is paused or ended');
            return [];
        }

        // If MediaPipe is available, try to use it with safety checks
        if (this.isMediaPipeLoaded && this.faceDetector) {
            try {
                // Create a canvas to ensure we have valid image data
                const canvas = document.createElement('canvas');
                canvas.width = 640;
                canvas.height = 480;
                const ctx = canvas.getContext('2d');

                // Draw video frame to canvas first (this ensures valid data)
                ctx.drawImage(this.video, 0, 0, 640, 480);

                // Use canvas instead of video element directly
                await this.faceDetector.send({ image: canvas });

                // Results will be set by processMediaPipeResults
                return this.detectedFaces;

            } catch (error) {
                console.warn('MediaPipe detection failed:', error.message);

                // Disable MediaPipe if it keeps failing
                this.mediaPipeFailCount = (this.mediaPipeFailCount || 0) + 1;
                if (this.mediaPipeFailCount > 5) {
                    console.warn('🚫 MediaPipe failed too many times, disabling...');
                    this.isMediaPipeLoaded = false;
                }
            }
        }

        // Fallback: Smart estimated face regions that work without detection
        const faces = [
            { centerX: 0.5, centerY: 0.4, width: 0.25, height: 0.33, confidence: 0.9 },
            { centerX: 0.45, centerY: 0.35, width: 0.08, height: 0.06, confidence: 0.8 },
            { centerX: 0.55, centerY: 0.35, width: 0.08, height: 0.06, confidence: 0.8 },
            { centerX: 0.5, centerY: 0.48, width: 0.1, height: 0.06, confidence: 0.7 },
            { centerX: 0.5, centerY: 0.42, width: 0.06, height: 0.08, confidence: 0.6 },
        ];

        return faces;
    }

    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.startCamera());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopCamera());
        document.getElementById('modeBtn').addEventListener('click', () => this.cycleMode());
        document.getElementById('orderBtn').addEventListener('click', () => this.toggleOrder());

        // Add keyboard controls for debugging
        this.setupKeyboardControls();
    }
    setupKeyboardControls() {
        document.addEventListener('keydown', (event) => {
            // Only respond to keyboard if camera is running
            // if (!this.isRunning) return;

            // Prevent default behavior for our keys
            const debugKeys = ['1', '2', '3', '4', 'r', 's'];
            if (debugKeys.includes(event.key)) {
                event.preventDefault();
            }

            switch (event.key) {
                case '1':
                    // Effects Mode
                    this.setMode('effects');
                    // // console.log('🎨 Switched to Effects Mode via keyboard');
                    break;

                case '2':
                    // Delay Mode
                    this.setMode('delay');
                    // // console.log('⏰ Switched to Delay Mode via keyboard');
                    break;

                case '3':
                    // Zoom Mode
                    this.setMode('zoom');
                    // // console.log('🔍 Switched to Zoom Mode via keyboard');
                    break;

                case '4':
                    // Primitive Mode
                    this.setMode('primitive');
                    // // console.log('👁️ Switched to Primitive Mode via keyboard');
                    break;

                case '5':
                    // Pixelation Mode
                    this.setMode('pixelation');
                    // // console.log('🔲 Switched to Pixelation Mode via keyboard');
                    break;

                case 'r':
                case 'R':
                    // Randomize text positions (recreate face planes)
                    if (this.isRunning && this.videoTexture) {
                        this.createFacePlanes();
                        // // console.log('🎲 Randomized text positions');
                    }
                    break;

                case 's':
                case 'S':
                    // Toggle random/sequential order in delay mode
                    if (this.isDelayMode) {
                        this.toggleOrder();
                        // // console.log('🔀 Toggled delay order');
                    }
                    break;

                case '?':
                    // Show help
                    this.showKeyboardHelp();
                    break;
                //add case for start camera
                case 'c':
                case 'C':
                    // Start camera
                    this.startCamera();
                    break;
                //add case for stop camera
                case 'x':
                    // Stop camera
                    this.stopCamera();
                    break;
                case 'z':
                case 'Z':
                    // Reinitialize zoom settings in zoom mode
                    if (this.isZoomMode) {
                        this.reinitializeZoomPositions();
                    }
                    break;
                case 'v':
                case 'V':
                    // Cycle through visual strategies in effects mode
                    if (!this.isDelayMode && !this.isZoomMode && !this.isPrimitiveMode) {
                        this.cycleVisualStrategy();
                    }
                    break;
                case 'o':
                case 'O':
                    // Toggle overlay text
                    this.toggleOverlayText();
                    break;
                case 'h':
                case 'H':
                    // Toggle character display
                    this.toggleCharacterDisplay();
                    break;
                case 't':
                case 'T':
                    // Test 3x3 system on a random text panel
                    this.test3x3System();
                    break;
                case 'g':
                case 'G':
                    // Re-scatter Hebrew characters (Galiliyot = גחליליות)
                    this.rescatterCharacters();
                    break;
                case 'p':
                case 'P':
                    // Toggle character gap probability (Pause = פסקים)
                    this.toggleCharacterGaps();
                    break;

                case 'd':
                case 'D':
                    // Debug: Log current mode and shader strategy
                    this.logCurrentState();
                    break;
            }
        });
    }

    setMode(modeKey) {
        // Store previous mode to detect if we're actually changing modes
        const wasDelayMode = this.isDelayMode;
        const wasZoomMode = this.isZoomMode;

        // Reset all modes
        this.isDelayMode = false;
        this.isZoomMode = false;
        this.isPrimitiveMode = false;
        this.isPixelationMode = false;

        // Set the requested mode
        switch (modeKey) {
            case 'delay':
                this.isDelayMode = true;
                // Force initialization if we're switching TO delay mode
                if (!wasDelayMode) {
                    this.delayOrder = null; // Clear to force reinit
                    this.cachedTextPairs = null; // Clear text positioning cache
                }
                break;
            case 'zoom':
                this.isZoomMode = true;
                // Force initialization if we're switching TO zoom mode
                if (!wasZoomMode) {
                    this.zoomSettings = null; // Clear to force reinit
                    this.zoomInitialized = false;
                    this.cachedTextPairs = null; // Clear text positioning cache
                }
                break;
            case 'primitive':
                this.isPrimitiveMode = true;
                this.cachedTextPairs = null; // Clear text positioning cache
                break;
            case 'pixelation':
                this.isPixelationMode = true;
                this.cachedTextPositions = null; // Clear text positioning cache
                break;
            case 'effects':
            default:
                // Effects mode is the default (all flags false)
                this.cachedTextPairs = null; // Clear text positioning cache
                break;
        }

        // Update the display
        this.updateModeDisplay();
    }

    setModeWithHeadline(modeKey, headline) {
        // Set the headline first
        if (headline && headline.trim() !== '') {
            this.currentHeadline = headline;
            // // console.log(`📝 Setting headline from navbar: ${headline}`);
        }

        // Then set the mode
        this.setMode(modeKey);
    }

    showKeyboardHelp() {
        const helpText = `
🎹 KEYBOARD DEBUG CONTROLS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  - Effects Mode (visual effects + text)
2️⃣  - Delay Mode (time delays + text)  
3️⃣  - Zoom Mode (face zooming + text)
4️⃣  - Primitive Mode (eye tracking + face)
5️⃣  - Pixelation Mode (pixelated visual effects)

🎲 R - Randomize text positions
🎨 V - Cycle visual strategies (Effects mode only)
🔀 S - Toggle delay order (sequential/random)
🔄 Z - Reinitialize zoom positions (Zoom mode only)
📝 O - Toggle overlay text on panels
🔤 H - Toggle Hebrew character display  
🧪 T - Test 3x3 hover system on random text panel
🎲 G - Re-scatter Hebrew characters (גחליליות)
💨 P - Toggle character gaps/spacing (פסקים)
🔍 D - Debug: Log current mode and effect strategy
🎥 C - Start camera
❌ X - Stop camera
❓ ? - Show this help

💡 TIP: Try 'V' in Effects mode to cycle through 6 different visual effect patterns!
💡 FIXED: Window resize no longer changes visual effects in ANY mode!
💡 FIXED: Zoom and Delay modes now stay consistent during window resize!
💡 TIP: Press 'O' to toggle overlay text like "LIVE", "REC", etc.
💡 TIP: Press 'H' to toggle Hebrew headline character display!
💡 TIP: Press 'T' to test the new 3x3 hover system!
💡 TIP: Press 'G' to re-scatter Hebrew characters across different rows/columns!
💡 TIP: Press 'P' to toggle gaps/spacing between Hebrew characters!
🎬 NEW: Fast entrance animation (1-2 seconds) now works in ALL modes!
🔧 FIXED: Window resize now preserves visual effects in Zoom and Delay modes!
        `;

        // // console.log(helpText);

        // Also show in browser alert for visibility
        alert(helpText.trim());
    }

    cycleVisualStrategy() {
        if (this.isRunning && this.videoTexture) {
            // Increment strategy index to cycle to next strategy
            if (!this.currentStrategyIndex) {
                this.currentStrategyIndex = 0;
            }

            this.currentStrategyIndex = (this.currentStrategyIndex + 1) % 5; // 5 strategies: random, zonal, gradient, symmetrical, concentric, diagonal
            console.log("current strategy index: ", this.currentStrategyIndex);
            // Force recreation of face planes with new strategy
            this.createFacePlanes();
            // // console.log('🎨 Cycled to new visual strategy');
        }
    }

    toggleOverlayText() {
        this.enableTextOverlay = !this.enableTextOverlay;
        // // console.log(`📝 Overlay text ${this.enableTextOverlay ? 'enabled' : 'disabled'}`);

        if (this.isRunning && this.videoTexture) {
            // Recreate face planes with new overlay settings
            this.createFacePlanes();
        }
    }

    toggleCharacterDisplay() {
        this.enableCharacterDisplay = !this.enableCharacterDisplay;
        // // console.log(`🔤 Character display ${this.enableCharacterDisplay ? 'enabled' : 'disabled'}`);

        if (this.isRunning && this.videoTexture) {
            // Recreate face planes with new character display settings
            this.createFacePlanes();
        }
    }

    async startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });

            this.video = document.getElementById('video');
            this.video.srcObject = stream;

            // Return a Promise that resolves when camera is fully initialized
            return new Promise((resolve, reject) => {
                this.video.addEventListener('loadedmetadata', () => {
                    this.hasCamera = true; // Mark that camera is available
                    this.setupVideoTexture();
                    this.initializeSystem();

                    document.getElementById('info').textContent = 'Multi-face display active with camera!';

                    // Update mirror uniforms now that camera is available
                    this.updateMirrorUniforms();

                    // Start face detection
                    this.startFaceDetection();

                    // Resolve the promise - camera is fully initialized
                    resolve();
                });

                this.video.addEventListener('error', (error) => {
                    reject(error);
                });
            });

        } catch (error) {
            console.error('Error accessing camera:', error);
            document.getElementById('info').textContent = 'Camera not available - running with text panels only';

            // Initialize system without camera
            this.setupFallbackTexture();

            // Wait for fonts to load before initializing system in fallback mode
            this.initializeSystemWithFonts();

            // Don't throw error - continue with fallback mode
            return Promise.resolve();
        }
    }

    // NEW: Separate system initialization from camera initialization
    initializeSystem() {
        this.createFacePlanes();
        this.startAnimation();

        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
        document.getElementById('modeBtn').disabled = false;
        document.getElementById('orderBtn').disabled = false;

        // Update FPS display
        this.updateFpsDisplay();

        // Start entrance animation if in pixelation mode and this is initial load
        if (this.isInitialLoad) {
            setTimeout(() => {
                this.startEntranceAnimation();
            }, 500); // Small delay to ensure everything is ready
            this.isInitialLoad = false; // Mark as no longer initial load
        }
    }

    // NEW: Initialize system with font loading check (for fallback mode)
    initializeSystemWithFonts() {
        if (this.fontsLoaded) {
            // Fonts already loaded - initialize immediately
            console.log('🔤 Fonts already loaded - initializing system immediately');
            this.initializeSystem();
        } else {
            // Wait for fonts to load with timeout
            console.log('⏳ Waiting for fonts to load before initializing system...');
            let attempts = 0;
            const maxAttempts = 50; // 5 second timeout (50 * 100ms)

            const checkFonts = () => {
                if (this.fontsLoaded) {
                    console.log('✅ Fonts loaded - now initializing system');
                    this.initializeSystem();
                } else if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(checkFonts, 100);
                } else {
                    console.warn('⚠️ Font loading timed out - initializing system with fallback fonts');
                    this.initializeSystem();
                }
            };
            checkFonts();
        }
    }

    // NEW: Create fallback texture when camera is not available
    setupFallbackTexture() {
        // Try to load images first, then fall back to gradient
        this.loadModeImages().then(() => {
            if (this.imagesLoaded) {
                console.log('🖼️ Images loaded - using images for fallback textures');
                this.setupImageFallbackTextures();
            } else {
                console.log('🎨 Images failed - using gradient for fallback textures');
                this.setupGradientFallbackTexture();
            }
        }).catch(() => {
            console.log('🎨 Image loading failed - using gradient for fallback textures');
            this.setupGradientFallbackTexture();
        });
    }

    // NEW: Set up image-based fallback textures
    setupImageFallbackTextures() {
        const currentMode = this.getCurrentModeKey();
        const modeImages = this.modeImages[currentMode] || this.modeImages.pixelation;

        // Create array of both images for 50-50 distribution
        this.fallbackImageTextures = [];

        // Load both images as textures for random distribution
        for (let i = 0; i < modeImages.length; i++) {
            const imagePath = modeImages[i];
            if (this.loadedImageTextures[imagePath]) {
                const texture = this.loadedImageTextures[imagePath].clone();
                texture.needsUpdate = true;
                this.fallbackImageTextures.push(texture);
            }
        }

        // If no images loaded, fallback to gradient
        if (this.fallbackImageTextures.length === 0) {
            this.setupGradientFallbackTexture();
            return;
        }

        // Use first image as primary texture (for compatibility)
        this.videoTexture = this.fallbackImageTextures[0].clone();
        this.videoTexture.needsUpdate = true;

        // Initialize delay textures with both images alternating
        for (let i = 0; i < this.maxFrameHistory; i++) {
            const imageIndex = i % modeImages.length;
            const imagePath = modeImages[imageIndex];

            if (this.loadedImages[imagePath]) {
                // Create a canvas for frame copying
                const canvas = document.createElement('canvas');
                canvas.width = 640;
                canvas.height = 480;
                const ctx = canvas.getContext('2d');

                // Initialize canvas with the actual image
                const img = this.loadedImages[imagePath];
                ctx.drawImage(img, 0, 0, 640, 480);

                const canvasTexture = new THREE.CanvasTexture(canvas);
                canvasTexture.minFilter = THREE.LinearFilter;
                canvasTexture.magFilter = THREE.LinearFilter;

                this.delayTextures.push({
                    canvas: canvas,
                    context: ctx,
                    texture: canvasTexture,
                    imageIndex: imageIndex,
                    imagePath: imagePath
                });
            } else {
                // Fallback to gradient if image not found
                this.setupGradientDelayTexture(i);
            }
        }
    }

    // NEW: Set up gradient fallback texture (original method)
    setupGradientFallbackTexture() {
        // Create a canvas with a subtle pattern for fallback
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');

        // Create a subtle gradient background
        const gradient = ctx.createLinearGradient(0, 0, 640, 480);
        gradient.addColorStop(0, '#1a1a1a');
        gradient.addColorStop(0.5, '#2d2d2d');
        gradient.addColorStop(1, '#1a1a1a');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 640, 480);

        // Add some subtle noise pattern
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * 640;
            const y = Math.random() * 480;
            ctx.fillRect(x, y, 1, 1);
        }

        this.videoTexture = new THREE.CanvasTexture(canvas);
        this.videoTexture.minFilter = THREE.LinearFilter;
        this.videoTexture.magFilter = THREE.LinearFilter;
        this.videoTexture.format = THREE.RGBFormat;
        this.videoTexture.needsUpdate = true;

        // Initialize delay textures with fallback content
        for (let i = 0; i < this.maxFrameHistory; i++) {
            this.setupGradientDelayTexture(i);
        }
    }

    // NEW: Set up a single gradient delay texture
    setupGradientDelayTexture(index) {
        const delayCanvas = document.createElement('canvas');
        delayCanvas.width = 640;
        delayCanvas.height = 480;
        const delayCtx = delayCanvas.getContext('2d');

        // Create gradient (same as main texture)
        const gradient = delayCtx.createLinearGradient(0, 0, 640, 480);
        gradient.addColorStop(0, '#1a1a1a');
        gradient.addColorStop(0.5, '#2d2d2d');
        gradient.addColorStop(1, '#1a1a1a');

        delayCtx.fillStyle = gradient;
        delayCtx.fillRect(0, 0, 640, 480);

        // Add noise
        delayCtx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * 640;
            const y = Math.random() * 480;
            delayCtx.fillRect(x, y, 1, 1);
        }

        const texture = new THREE.CanvasTexture(delayCanvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        this.delayTextures.push({
            canvas: delayCanvas,
            context: delayCtx,
            texture: texture
        });
    }

    setupVideoTexture() {
        this.videoTexture = new THREE.VideoTexture(this.video);
        this.videoTexture.minFilter = THREE.LinearFilter;
        this.videoTexture.magFilter = THREE.LinearFilter;
        this.videoTexture.format = THREE.RGBFormat;

        // Initialize delay textures
        for (let i = 0; i < this.maxFrameHistory; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 480;
            const texture = new THREE.CanvasTexture(canvas);
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            this.delayTextures.push({
                canvas: canvas,
                context: canvas.getContext('2d'),
                texture: texture
            });
        }
    }

    createFacePlanes() {
        // Calculate face size based on screen but with performance limits
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const aspectRatio = screenWidth / screenHeight;

        // Adjust target face size based on total pixel count for performance
        const totalPixels = screenWidth * screenHeight;
        let targetFaceSize;

        // Check if mobile device (width < 768px is common mobile breakpoint)
        const isMobile = screenWidth < 768;

        if (isMobile) {
            // MOBILE: Smaller panels = MORE panels
            targetFaceSize = 120; // Much smaller = more panels
        } else {
            // DESKTOP: Keep existing logic unchanged
            if (totalPixels > 3840 * 2160) { // 4K+
                targetFaceSize = 200;
            } else if (totalPixels > 1920 * 1080) { // 1440p
                targetFaceSize = 170;
            } else { // 1080p and below
                targetFaceSize = 150;
            }
        }

        const cols = Math.ceil(screenWidth / targetFaceSize);
        const rows = Math.ceil(screenHeight / targetFaceSize);
        const faceCount = cols * rows;

        // Calculate exact face dimensions to fill screen completely
        const facePixelWidth = screenWidth / cols;
        const facePixelHeight = screenHeight / rows;

        // Convert to Three.js world units
        const worldWidth = 10;
        const worldHeight = worldWidth / aspectRatio;

        const faceWorldWidth = worldWidth / cols;
        const faceWorldHeight = worldHeight / rows;

        // Set up orthographic-style view
        this.camera.position.z = 5;
        this.camera.fov = 2 * Math.atan(worldHeight / (2 * this.camera.position.z)) * (180 / Math.PI);
        this.camera.updateProjectionMatrix();

        const geometry = new THREE.PlaneGeometry(faceWorldWidth, faceWorldHeight);

        // Different shader effects
        const shaders = this.createShaders();
        const pixelationShaders = this.createPixelationShaders();

        // Get articles for current mode and create text textures
        const currentArticles = this.getArticlesForCurrentMode();
        const modeKey = this.getCurrentModeKey();

        // Skip text panels for primitive mode
        let titleTextures = [];
        let authorTextures = [];
        let textPairs = [];
        let textPanelMap = new Map();

        if (modeKey !== 'primitive') {
            if (this.isPixelationMode) {
                // For pixelation mode, create minimal text panels alongside character display
                if (!this.textTexturesCache[modeKey]) {
                    const pixelationTextures = this.createPixelationTextTextures(facePixelWidth, facePixelHeight);
                    this.textTexturesCache[modeKey] = {
                        pixelationTextures: pixelationTextures
                    };
                }

                const pixelationTextures = this.textTexturesCache[modeKey].pixelationTextures;

                // Select random positions for single text panels (avoiding second row)
                // Cache positions to avoid regeneration on resize
                const cacheKey = `pixelation_${cols}x${rows}`;
                if (!this.cachedTextPositions || this.cachedTextPositions.key !== cacheKey) {
                    this.cachedTextPositions = {
                        key: cacheKey,
                        positions: this.selectRandomSingleTextPanelsAvoidingRow(faceCount, cols, this.PIXELATION_TEXT_PANEL_COUNT, 1)
                    };
                }
                const textPositions = this.cachedTextPositions.positions;

                // Create a map for quick lookup of text panels
                textPositions.forEach((position, index) => {
                    textPanelMap.set(position, { type: 'pixelation', index: index });
                });

            } else {
                // Regular mode - title+author pairs
                // Check if we have cached textures for this mode
                if (!this.textTexturesCache[modeKey]) {
                    const { titleTextures: newTitleTextures, authorTextures: newAuthorTextures } =
                        this.createTitleAuthorTextures(currentArticles, facePixelWidth, facePixelHeight);
                    const { titleTextures: newTitleBoldTextures, authorTextures: newAuthorBoldTextures } =
                        this.createBoldTitleAuthorTextures(currentArticles, facePixelWidth, facePixelHeight);
                    this.textTexturesCache[modeKey] = {
                        titleTextures: newTitleTextures,
                        authorTextures: newAuthorTextures,
                        titleBoldTextures: newTitleBoldTextures,
                        authorBoldTextures: newAuthorBoldTextures
                    };
                }

                titleTextures = this.textTexturesCache[modeKey].titleTextures;
                authorTextures = this.textTexturesCache[modeKey].authorTextures;

                // Select random positions for text pairs (8 total: 4 titles + 4 authors)
                // Cache positions to avoid regeneration on resize
                const cacheKey = `${modeKey}_${cols}x${rows}`;
                if (!this.cachedTextPairs || this.cachedTextPairs.key !== cacheKey) {
                    this.cachedTextPairs = {
                        key: cacheKey,
                        pairs: this.selectRandomTextPairs(faceCount, cols, currentArticles.length)
                    };
                }
                textPairs = this.cachedTextPairs.pairs;


                // Create a map for quick lookup of text panels
                textPairs.forEach((pair, index) => {
                    textPanelMap.set(pair.titlePos, { type: 'title', index: index });
                    textPanelMap.set(pair.authorPos, { type: 'author', index: index });
                });
            }
        }

        // Clear existing faces and clean up hover states
        this.facePlanes.forEach(faceData => {
            // Clean up overlay planes
            if (faceData.overlayPlane) {
                this.scene.remove(faceData.overlayPlane);
                if (faceData.overlayTexture) {
                    faceData.overlayTexture.dispose();
                }
            }

            this.scene.remove(faceData.mesh);
            if (faceData.primitiveContainer) {
                this.scene.remove(faceData.primitiveContainer);
            }
        });
        this.facePlanes = [];

        // Reset hover state
        this.hoveredPair = null;
        this.currentHoveredPanel = null; // Reset currently hovered panel for twin detection

        // Clear scattered character positions if grid size changed OR if text panel positions might have changed
        // (this forces regeneration with new grid dimensions or new text panel layout)
        if (this.lastGridSize && (this.lastGridSize.cols !== cols || this.lastGridSize.rows !== rows)) {
            this.scatteredCharacterPositions = null;
            // console.log(`🔄 Grid size changed (${this.lastGridSize.cols}x${this.lastGridSize.rows} → ${cols}x${rows}), clearing scattered positions`);
        }

        // ALWAYS clear character positions when face planes are recreated 
        // because text panel positions are random and change each time
        this.scatteredCharacterPositions = null;
        // console.log(`🔄 Clearing scattered character positions to avoid text panel conflicts`);

        this.lastGridSize = { cols, rows };

        // CREATE COHESIVE EFFECT DISTRIBUTION
        const effectMap = this.createCohesiveEffectMap(cols, rows, shaders.length);

        for (let i = 0; i < faceCount; i++) {
            // Use the cohesive effect mapping instead of random
            const shaderIndex = effectMap[i];
            const textPanel = textPanelMap.get(i);
            const isTextPanel = textPanel !== undefined;

            let textureToUse = this.videoTexture;
            if (isTextPanel) {
                if (textPanel.type === 'title') {
                    textureToUse = titleTextures[textPanel.index];
                } else if (textPanel.type === 'author') {
                    textureToUse = authorTextures[textPanel.index];
                } else if (textPanel.type === 'pixelation') {
                    textureToUse = this.textTexturesCache[modeKey].pixelationTextures[textPanel.index];
                }
            }

            // Determine if we should mirror (camera = mirror, images = no mirror)
            const shouldMirror = this.hasCamera ? 1.0 : 0.0;

            // Create materials for each face
            const effectMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    uTexture: { value: textureToUse },
                    uTime: { value: 0 },
                    uDelay: { value: i * 0.1 },
                    uIntensity: { value: 0.5 + ((i * 7919) % 1000) / 2000 }, // Deterministic "random" based on position
                    uReveal: { value: 0.0 }, // Always start black for entrance animation
                    uMirror: { value: shouldMirror } // Control mirroring based on camera/image mode
                },
                vertexShader: shaders[isTextPanel ? 0 : shaderIndex].vertex, // Use plain shader for text
                fragmentShader: shaders[isTextPanel ? 0 : shaderIndex].fragment
            });

            const plainMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    uTexture: { value: textureToUse },
                    uReveal: { value: 0.0 }, // Always start black for entrance animation
                    uMirror: { value: shouldMirror } // Control mirroring based on camera/image mode
                },
                vertexShader: shaders[0].vertex,
                fragmentShader: shaders[0].fragment
            });

            // Create text material that doesn't mirror (for text panels only)
            const textMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    uTexture: { value: textureToUse },
                    uReveal: { value: 0.0 } // Always start black for entrance animation
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform sampler2D uTexture;
                    uniform float uReveal;
                    varying vec2 vUv;
                    void main() {
                        // No mirroring for text - keep text readable
                        vec4 textColor = texture2D(uTexture, vUv);
                        
                        // In pixelation mode, fade from black to text based on reveal
                        if (uReveal < 1.0) {
                            vec3 finalColor = mix(vec3(0.0), textColor.rgb, uReveal);
                            gl_FragColor = vec4(finalColor, textColor.a);
                        } else {
                            gl_FragColor = textColor;
                        }
                    }
                `
            });

            const zoomMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    uTexture: { value: textureToUse },
                    uZoom: { value: 1.0 },
                    uPanX: { value: 0.0 },
                    uPanY: { value: 0.0 },
                    uReveal: { value: 0.0 }, // Always start black for entrance animation
                    uMirror: { value: shouldMirror } // Control mirroring based on camera/image mode
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform sampler2D uTexture;
                    uniform float uZoom;
                    uniform float uPanX;
                    uniform float uPanY;
                    uniform float uReveal;
                    uniform float uMirror;
                    varying vec2 vUv;
                    void main() {
                        vec2 uv = vUv;
                        if (uMirror > 0.5) {
                            uv.x = 1.0 - uv.x; // Mirror horizontally only for video
                        }
                        
                        // Video aspect ratio adjustment (640x480 = 4:3)
                        float videoAspect = 640.0 / 480.0;
                        
                        // Make square crop centered on face area
                        uv.x = (uv.x - 0.5) * videoAspect + 0.5;
                        
                        // Apply zoom and pan for face focus
                        uv = (uv - 0.5) / uZoom + 0.5;
                        uv.x += uPanX * 0.3;
                        uv.y += uPanY * 0.2;
                        
                        // Center the crop on typical face position
                        uv.y += 0.1;
                        
                        // OPTION 1: Wrap/repeat texture instead of black
                        uv = fract(uv); // This wraps coordinates to 0.0-1.0 range
                        
                        vec4 color = texture2D(uTexture, uv);
                        
                        // Mix between black and the effect based on reveal
                        vec3 finalColor = mix(vec3(0.0), color.rgb, uReveal);
                        gl_FragColor = vec4(finalColor, color.a);
                    }
                `
            });

            // Create pixelation material with different variations
            const pixelationShaderIndex = i % pixelationShaders.length; // Deterministic based on position
            const pixelationMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    uTexture: { value: textureToUse },
                    uIntensity: { value: 0.5 + ((i * 6007) % 1000) / 2000 }, // Deterministic "random" based on position
                    uReveal: { value: 0.0 }, // Always start black for entrance animation
                    uMirror: { value: shouldMirror } // Control mirroring based on camera/image mode
                },
                vertexShader: pixelationShaders[pixelationShaderIndex].vertex,
                fragmentShader: pixelationShaders[pixelationShaderIndex].fragment
            });

            // Create the plane mesh first - use correct material based on current mode
            let initialMaterial;
            if (this.isPixelationMode && !isTextPanel) {
                initialMaterial = pixelationMaterial;
            } else if (isTextPanel) {
                initialMaterial = textMaterial;
            } else {
                initialMaterial = effectMaterial;
            }
            // console.log(initialMaterial);
            const plane = new THREE.Mesh(geometry, initialMaterial);

            // Position faces to completely fill screen edge-to-edge
            const col = i % cols;
            const row = Math.floor(i / cols);

            const startX = -worldWidth / 2 + faceWorldWidth / 2;
            const startY = worldHeight / 2 - faceWorldHeight / 2;

            plane.position.x = startX + col * faceWorldWidth;
            plane.position.y = startY - row * faceWorldHeight;
            plane.position.z = 0;

            // Now create primitive container using the plane's position
            const primitiveContainer = new THREE.Group();
            primitiveContainer.position.copy(plane.position);
            primitiveContainer.scale.set(faceWorldWidth * 0.8, faceWorldHeight * 0.8, 1);

            this.scene.add(plane);
            this.scene.add(primitiveContainer);

            // Find pair information for this panel
            let pairInfo = null;
            if (isTextPanel && textPanel.type !== 'pixelation') {
                // Only create pair info for title/author pairs, not pixelation panels
                const pairIndex = textPanel.index;
                const pair = textPairs[pairIndex];
                pairInfo = {
                    pairIndex: pairIndex,
                    isTitle: textPanel.type === 'title',
                    partnerPosition: textPanel.type === 'title' ? pair.authorPos : pair.titlePos,
                    myPosition: i
                };
            }

            // Create character-based panels or overlay text
            let overlayText = null;
            let overlayTexture = null;
            let overlayPlane = null;
            let isCharacterPanel = false;

            // Check if we should create character panels from current headline
            if (this.enableCharacterDisplay && this.currentHeadline && this.currentHeadline.trim() !== '') {
                if (this.currentHeadline.trim() === 'עמוד בית') {
                    this.currentHeadline = 'גחליליות';
                }
                const characters = this.splitHebrewText(this.currentHeadline.trim());
                const totalCharacters = characters.length;

                // Generate scattered positions for characters (if not already done)
                if (!this.scatteredCharacterPositions || this.scatteredCharacterPositions.length !== totalCharacters) {
                    this.scatteredCharacterPositions = this.generateScatteredCharacterPositions(
                        characters, cols, rows, faceCount, textPanelMap
                    );
                    // // console.log(`🎲 Generated scattered positions for "${this.currentHeadline}":`, 
                    //     this.scatteredCharacterPositions.map(pos => `${pos.char}@(${pos.col},${pos.row})`));
                }

                // Calculate current panel position
                const col = i % cols;
                const row = Math.floor(i / cols);

                // Check if this panel position matches any scattered character position
                const characterMatch = this.scatteredCharacterPositions.find(
                    charPos => charPos.col === col && charPos.row === row && charPos.panelIndex === i
                );

                if (characterMatch && characterMatch.character && characterMatch.character.trim() !== '') {
                    // Only use headline style (no variety)
                    let style = 'headline';

                    // Create character texture
                    overlayTexture = this.createCharacterTexture(characterMatch.character, facePixelWidth, facePixelHeight, style);

                    // Create overlay material with reveal support for entrance animation
                    const overlayMaterial = new THREE.MeshBasicMaterial({
                        map: overlayTexture,
                        transparent: true,
                        opacity: 0.0, // Always start hidden for entrance animation
                        depthWrite: false
                    });

                    // Create overlay plane (slightly in front of main plane)
                    overlayPlane = new THREE.Mesh(geometry, overlayMaterial);
                    overlayPlane.position.copy(plane.position);
                    overlayPlane.position.z += 0.001;

                    this.scene.add(overlayPlane);
                    overlayText = characterMatch.character;
                    isCharacterPanel = true;

                    // // console.log(`📝 Placed character "${characterMatch.character}" (${characterMatch.index + 1}/${totalCharacters}) at panel ${i} (${col},${row}) with ${style} style`);
                }
            }
            // Fallback to regular overlay text if no character panel was created
            else if (this.enableTextOverlay && ((i * 1327) % 1000) < 300) { // Deterministic 30% chance for overlay
                // Select deterministic overlay text based on position
                const textIndex = (i * 1549) % this.overlayTexts.length;
                const randomText = this.overlayTexts[textIndex];

                // Determine style based on text content
                let style = 'default';
                if (['LIVE', 'חי', 'ON AIR', 'שידור'].includes(randomText)) {
                    style = 'live';
                } else if (['REC', 'BROADCAST', 'STREAMING'].includes(randomText)) {
                    style = 'broadcast';
                } else if (['חי', 'עכשיו', 'שידור', 'אוויר', 'רשת', 'מקוון'].includes(randomText)) {
                    style = 'hebrew';
                }

                // Create overlay texture
                overlayTexture = this.createOverlayTextTexture(randomText, facePixelWidth, facePixelHeight, style);

                // Create overlay material
                const overlayMaterial = new THREE.MeshBasicMaterial({
                    map: overlayTexture,
                    transparent: true,
                    opacity: 0.9,
                    depthWrite: false // Ensure it renders on top
                });

                // Create overlay plane (slightly in front of main plane)
                overlayPlane = new THREE.Mesh(geometry, overlayMaterial);
                overlayPlane.position.copy(plane.position);
                overlayPlane.position.z += 0.001; // Slightly in front

                this.scene.add(overlayPlane);
                overlayText = randomText;
            }

            // Store references to bold textures for hover effects
            let boldTexture = null;
            if (isTextPanel && textPanel.type !== 'pixelation' && this.textTexturesCache[modeKey]) {
                if (textPanel.type === 'title') {
                    boldTexture = this.textTexturesCache[modeKey].titleBoldTextures[textPanel.index];
                } else if (textPanel.type === 'author') {
                    boldTexture = this.textTexturesCache[modeKey].authorBoldTextures[textPanel.index];
                }
            }

            this.facePlanes.push({
                mesh: plane,
                effectMaterial: effectMaterial,
                plainMaterial: plainMaterial,
                textMaterial: textMaterial,
                zoomMaterial: zoomMaterial,
                pixelationMaterial: pixelationMaterial,
                primitiveContainer: primitiveContainer,
                delay: i * 100,
                delayIndex: i,
                isTextPanel: isTextPanel,
                textPanel: textPanel,
                pairInfo: pairInfo,
                // Bold texture for hover effects
                boldTexture: boldTexture,
                originalTexture: textureToUse,
                // Overlay text properties
                overlayText: overlayText,
                overlayTexture: overlayTexture,
                overlayPlane: overlayPlane,
                isCharacterPanel: isCharacterPanel
            });
        }

        // Update delay textures array if needed
        const neededTextures = Math.max(faceCount, this.maxFrameHistory);
        while (this.delayTextures.length < neededTextures) {
            const canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 480;
            const texture = new THREE.CanvasTexture(canvas);
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            this.delayTextures.push({
                canvas: canvas,
                context: canvas.getContext('2d'),
                texture: texture
            });
        }

        // Initialize settings only if needed (done in updateModeDisplay now)
        // this.initializeDelayOrder(); // Moved to updateModeDisplay with conditions
        // this.initializeZoomSettings(); // Moved to updateModeDisplay with conditions

        const textPanelCount = this.isPixelationMode ?
            Object.keys(textPanelMap).length : // Pixelation mode has some text panels
            textPairs.length * 2;
        const pairCount = this.isPixelationMode ? 0 : textPairs.length;
        const characterCount = this.isPixelationMode && this.currentHeadline ?
            this.splitHebrewText(this.currentHeadline.trim()).length : 0;
        // // console.log(`Created ${faceCount} faces in ${cols}x${rows} grid with ${textPanelCount} text panels (${pairCount} pairs) and ${characterCount} character overlays for ${modeKey} mode`);
    }

    createTitleAuthorTextures(articles, width, height) {
        const titleTextures = [];
        const authorTextures = [];

        // Get device pixel ratio for high-DPI support
        const pixelRatio = window.devicePixelRatio || 1;

        // Define fonts with fallbacks using the font configuration
        const titleFont = this.fontsLoaded ? this.fontConfig.title.name : 'Arial, sans-serif';
        const authorFont = this.fontsLoaded ? this.fontConfig.author.name : 'Arial, sans-serif';
        // // console.log('Title font:', titleFont);
        // // console.log('Author font:', authorFont);

        articles.forEach((article, index) => {
            // Create title texture with high-DPI support
            const titleCanvas = document.createElement('canvas');
            titleCanvas.width = width * pixelRatio;
            titleCanvas.height = height * pixelRatio;
            titleCanvas.style.width = width + 'px';
            titleCanvas.style.height = height + 'px';
            const titleCtx = titleCanvas.getContext('2d');
            titleCtx.scale(pixelRatio, pixelRatio);

            // Title styling - dark background, light text
            titleCtx.fillStyle = '#444';
            titleCtx.fillRect(0, 0, width, height);
            titleCtx.fillStyle = '#ddddd1';
            titleCtx.font = `${Math.min(width, height) * 0.12}px ${titleFont}`;
            titleCtx.textAlign = 'right';
            titleCtx.textBaseline = 'middle';
            titleCtx.direction = 'rtl';

            // Draw title with text wrapping
            this.drawWrappedText(titleCtx, article.title, width / 1.1, height / 2, width * 0.9, Math.min(width, height) * 0.12);

            const titleTexture = new THREE.CanvasTexture(titleCanvas);
            titleTexture.minFilter = THREE.NearestFilter;
            titleTexture.magFilter = THREE.NearestFilter;
            titleTextures.push(titleTexture);

            // Create author texture with high-DPI support
            const authorCanvas = document.createElement('canvas');
            authorCanvas.width = width * pixelRatio;
            authorCanvas.height = height * pixelRatio;
            authorCanvas.style.width = width + 'px';
            authorCanvas.style.height = height + 'px';
            const authorCtx = authorCanvas.getContext('2d');
            authorCtx.scale(pixelRatio, pixelRatio);

            // Author styling - light background, dark text
            authorCtx.fillStyle = '#ddddd1';
            authorCtx.fillRect(0, 0, width, height);
            authorCtx.fillStyle = '#444';
            authorCtx.font = `${Math.min(width, height) * 0.12}px ${authorFont}`;
            authorCtx.textAlign = 'center';
            authorCtx.textBaseline = 'middle';
            authorCtx.direction = 'rtl';

            // Draw author with text wrapping
            this.drawWrappedText(authorCtx, article.author, width / 2, height / 2, width * 0.9, Math.min(width, height) * 0.12);

            const authorTexture = new THREE.CanvasTexture(authorCanvas);
            authorTexture.minFilter = THREE.NearestFilter;
            authorTexture.magFilter = THREE.NearestFilter;
            authorTextures.push(authorTexture);
        });

        return { titleTextures, authorTextures };
    }

    createBoldTitleAuthorTextures(articles, width, height) {
        const titleTextures = [];
        const authorTextures = [];

        // Get device pixel ratio for high-DPI support
        const pixelRatio = window.devicePixelRatio || 1;

        // Define BOLD fonts with fallbacks using the font configuration
        const titleBoldFont = this.fontsLoaded ? this.fontConfig.title.boldName : 'Arial Black, sans-serif';
        const authorBoldFont = this.fontsLoaded ? this.fontConfig.author.boldName : 'Arial Black, sans-serif';

        articles.forEach((article, index) => {
            // Create BOLD title texture with high-DPI support
            const titleCanvas = document.createElement('canvas');
            titleCanvas.width = width * pixelRatio;
            titleCanvas.height = height * pixelRatio;
            titleCanvas.style.width = width + 'px';
            titleCanvas.style.height = height + 'px';
            const titleCtx = titleCanvas.getContext('2d');
            titleCtx.scale(pixelRatio, pixelRatio);

            // Title styling - dark background, light text, BOLD
            titleCtx.fillStyle = '#444';
            titleCtx.fillRect(0, 0, width, height);
            titleCtx.fillStyle = '#ddddd1';
            titleCtx.font = `${Math.min(width, height) * 0.12}px ${titleBoldFont}`;
            titleCtx.textAlign = 'right';
            titleCtx.textBaseline = 'middle';
            titleCtx.direction = 'rtl';

            // Draw title with text wrapping
            this.drawWrappedText(titleCtx, article.title, width / 1.1, height / 2, width * 0.9, Math.min(width, height) * 0.12);

            const titleTexture = new THREE.CanvasTexture(titleCanvas);
            titleTexture.minFilter = THREE.NearestFilter;
            titleTexture.magFilter = THREE.NearestFilter;
            titleTextures.push(titleTexture);

            // Create BOLD author texture with high-DPI support
            const authorCanvas = document.createElement('canvas');
            authorCanvas.width = width * pixelRatio;
            authorCanvas.height = height * pixelRatio;
            authorCanvas.style.width = width + 'px';
            authorCanvas.style.height = height + 'px';
            const authorCtx = authorCanvas.getContext('2d');
            authorCtx.scale(pixelRatio, pixelRatio);

            // Author styling - light background, dark text, BOLD
            authorCtx.fillStyle = '#ddddd1';
            authorCtx.fillRect(0, 0, width, height);
            authorCtx.fillStyle = '#444';
            authorCtx.font = `${Math.min(width, height) * 0.12}px ${authorBoldFont}`;
            authorCtx.textAlign = 'center';
            authorCtx.textBaseline = 'middle';
            authorCtx.direction = 'rtl';

            // Draw author with text wrapping
            this.drawWrappedText(authorCtx, article.author, width / 2, height / 2, width * 0.9, Math.min(width, height) * 0.12);

            const authorTexture = new THREE.CanvasTexture(authorCanvas);
            authorTexture.minFilter = THREE.NearestFilter;
            authorTexture.magFilter = THREE.NearestFilter;
            authorTextures.push(authorTexture);
        });

        return { titleTextures, authorTextures };
    }

    drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let lines = [];
        let currentLine = '';

        // Build lines that fit within maxWidth
        for (let word of words) {
            const testLine = currentLine + word + ' ';
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && currentLine !== '') {
                lines.push(currentLine.trim());
                currentLine = word + ' ';
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine.trim() !== '') {
            lines.push(currentLine.trim());
        }

        // Draw centered lines
        const totalHeight = lines.length * lineHeight;
        const startY = y - totalHeight / 2 + lineHeight / 2;

        lines.forEach((line, index) => {
            ctx.fillText(line, x, startY + index * lineHeight);
        });
    }

    createPixelationTextTextures(width, height) {
        const pixelationTextures = [];
        const text1 = "חזרות במדיה";
        const text2 = "גליון 04";
        //random between text1 and text2

        // Get device pixel ratio for high-DPI support
        const pixelRatio = window.devicePixelRatio || 1;

        // Create variations of the same text with different styling
        for (let i = 0; i < this.PIXELATION_TEXT_PANEL_COUNT; i++) {
            let text = (i % 2 === 0) ? text1 : text2; // Deterministic alternation
            const canvas = document.createElement('canvas');
            canvas.width = width * pixelRatio;
            canvas.height = height * pixelRatio;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            const ctx = canvas.getContext('2d');
            ctx.scale(pixelRatio, pixelRatio);

            // Different background colors for variation
            const backgrounds = [
                '#444', // Dark gray
                '#ddddd1', // Dark purple
            ];

            ctx.fillStyle = backgrounds[i % 2];
            ctx.fillRect(0, 0, width, height);

            // Configure text rendering
            const fontSize = Math.min(width, height) * 0.15;
            ctx.fillStyle = backgrounds[(i + 1) % 2];
            ctx.font = `${fontSize}px ${this.fontConfig.author.name}, Arial, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Draw the text centered
            // ctx.fillText(text, width / 2, height / 2);
            this.drawWrappedTextLarge(ctx, text, width / 2, height / 2, width * 0.9, Math.min(width, height) * 0.12);

            // Create texture
            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;
            pixelationTextures.push(texture);
        }

        return pixelationTextures;
    }

    createOverlayTextTexture(text, width, height, style = 'default') {
        // Check cache first
        const cacheKey = `${text}_${width}_${height}_${style}`;
        if (this.overlayTextCache.has(cacheKey)) {
            return this.overlayTextCache.get(cacheKey);
        }

        // Get device pixel ratio for high-DPI support
        const pixelRatio = window.devicePixelRatio || 1;

        const canvas = document.createElement('canvas');
        canvas.width = width * pixelRatio;
        canvas.height = height * pixelRatio;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        const ctx = canvas.getContext('2d');
        ctx.scale(pixelRatio, pixelRatio);

        // Clear canvas (transparent background)
        ctx.clearRect(0, 0, width, height);

        // Configure text styling based on style parameter
        let fontSize, fontFamily, textColor, strokeColor, strokeWidth;

        switch (style) {
            case 'broadcast':
                fontSize = Math.min(width, height) * 0.08;
                fontFamily = 'Arial Black, Arial, sans-serif';
                textColor = '#ff0000';
                strokeColor = '#ffffff';
                strokeWidth = 0;
                break;
            case 'live':
                fontSize = Math.min(width, height) * 0.1;
                fontFamily = 'Arial Black, Arial, sans-serif';
                textColor = '#00ff00';
                strokeColor = '#000000';
                strokeWidth = 0;
                break;
            case 'hebrew':
                fontSize = Math.min(width, height) * 0.09;
                fontFamily = this.fontsLoaded ? this.fontConfig.headline.name : 'Arial, sans-serif';
                textColor = '#ffffff';
                strokeColor = '#000000';
                strokeWidth = 0;
                break;
            default:
                fontSize = Math.min(width, height) * 0.07;
                fontFamily = 'Arial, sans-serif';
                textColor = '#ffffff';
                strokeColor = '#000000';
                strokeWidth = 0;
        }

        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const x = width / 2;
        const y = height / 2;

        // Draw text with stroke for better visibility
        if (strokeWidth > 0) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth;
            ctx.strokeText(text, x, y);
        }

        ctx.fillStyle = textColor;
        ctx.fillText(text, x, y);

        // Create texture
        const texture = new THREE.CanvasTexture(canvas);
        texture.transparent = true;
        texture.needsUpdate = true;

        // Cache the texture
        this.overlayTextCache.set(cacheKey, texture);

        return texture;
    }

    selectRandomSingleTextPanels(totalCount, panelCount) {
        const positions = [];
        const used = new Set();

        while (positions.length < panelCount && positions.length < totalCount) {
            const randomPos = Math.floor(Math.random() * totalCount);
            // Skip if position is already used or is the top-left panel (index 0)
            // Note: This function is not currently used, so exclusion logic kept as original
            if (!used.has(randomPos) && randomPos !== 0) {
                positions.push(randomPos);
                used.add(randomPos);
            }
        }

        return positions;
    }

    selectRandomSingleTextPanelsAvoidingRow(totalCount, cols, panelCount, avoidRow) {
        const positions = [];
        const used = new Set();
        const maxAttempts = totalCount * 2; // Prevent infinite loops
        let attempts = 0;

        // Calculate bottom-left panel index
        const rows = Math.ceil(totalCount / cols);
        const bottomLeftIndex = (rows - 1) * cols; // Last row, first column

        while (positions.length < panelCount && attempts < maxAttempts) {
            attempts++;
            const randomPos = Math.floor(Math.random() * totalCount);

            // Calculate row for this position
            const row = Math.floor(randomPos / cols);

            // Skip if position is already used, in the avoided row, or is the bottom-left panel
            if (used.has(randomPos) || row === avoidRow || randomPos === bottomLeftIndex) {
                continue;
            }

            positions.push(randomPos);
            used.add(randomPos);
        }

        // console.log(`Created ${positions.length} text panels avoiding row ${avoidRow} and bottom-left panel (index ${bottomLeftIndex})`);
        return positions;
    }

    selectRandomTextPairs(totalCount, cols, pairCount) {
        const pairs = [];
        const usedPositions = new Set();
        const maxAttempts = totalCount * 2; // Prevent infinite loops
        let attempts = 0;

        // Calculate bottom-left panel index
        const rows = Math.ceil(totalCount / cols);
        const bottomLeftIndex = (rows - 1) * cols; // Last row, first column

        while (pairs.length < pairCount && attempts < maxAttempts) {
            attempts++;

            // Pick a random position for the title (left side)
            const titlePos = Math.floor(Math.random() * totalCount);

            // Skip if position already used or if it's the leftmost column
            const row = Math.floor(titlePos / cols);
            const col = titlePos % cols;

            // Skip if position is in top row (row 0) or is the bottom-left panel
            const lastRow = Math.floor((totalCount - 1) / cols);
            if (row === lastRow || row === 1) {  // Skip both last row and second row (row 1)
                continue;
            }
            if (usedPositions.has(titlePos) || col === cols - 1 || titlePos === bottomLeftIndex) {
                continue;
            }

            // Author position is to the right of title
            const authorPos = titlePos + 1;

            // Skip if author position is already used or is the bottom-left panel
            if (usedPositions.has(authorPos) || authorPos === bottomLeftIndex) {
                continue;
            }

            // Check minimum distance from other pairs
            let tooClose = false;
            const minDistance = Math.max(3, Math.ceil(cols / 3));

            for (let existingPair of pairs) {
                const titleDistance = Math.abs(titlePos - existingPair.titlePos);
                const authorDistance = Math.abs(authorPos - existingPair.authorPos);

                if (titleDistance < minDistance || authorDistance < minDistance) {
                    tooClose = true;
                    break;
                }
            }

            if (!tooClose) {
                pairs.push({ titlePos, authorPos });
                usedPositions.add(titlePos);
                usedPositions.add(authorPos);
            }
        }

        // console.log(`Created ${pairs.length} text pairs out of ${pairCount} requested (avoiding bottom-left panel at index ${bottomLeftIndex})`);
        return pairs;
    }

    // SIMPLIFIED: Only create eye spheres in primitive mode
    updatePrimitiveObjects() {
        // Get only the eye detections
        const eyeDetections = this.detectedFaces.filter(face => face.isEye);

        if (!eyeDetections.length) return;

        // Update each face panel's primitive objects
        this.facePlanes.forEach((faceData, index) => {
            if (!faceData.primitiveContainer) return;

            // Clear existing primitives
            faceData.primitiveContainer.clear();

            // Create eye spheres only
            this.createEyeSpheres(faceData.primitiveContainer, eyeDetections, index);
        });
    }

    createEyeSpheres(container, eyeDetections, panelIndex) {
        // Use different colors for each panel
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ff9f43', '#5f27cd'];
        const color = colors[panelIndex % colors.length];

        // Get the main face detection (not just eyes)
        const mainFace = this.detectedFaces.find(face => !face.isEye) || this.detectedFaces[0];

        if (mainFace) {
            // Convert face center coordinates
            const faceX = (mainFace.centerX - 0.5) * 2;
            const faceY = -((mainFace.centerY - 0.5) * 2);

            // Create face outline positioned at detected face center
            this.createFaceOutline(container, color, faceX, faceY);

            // Create mouth positioned relative to face center
            this.createMouth(container, color, faceX, faceY);
        }

        // Then create the eyes at their detected positions
        eyeDetections.forEach((eye, eyeIndex) => {
            // Convert eye coordinates to Three.js plane coordinates
            const eyeX = (eye.centerX - 0.5) * 2;  // 0-1 -> -1 to 1
            const eyeY = -((eye.centerY - 0.5) * 2); // 0-1 -> -1 to 1, flipped

            // Create sphere geometry
            const geometry = new THREE.SphereGeometry(0.04, 16, 16);

            // Create material with color - NO animation
            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.9
            });

            // Create mesh
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(eyeX, eyeY, 0.15); // Eyes in front of face

            container.add(sphere);
        });
    }

    createFaceOutline(container, color, faceX, faceY) {
        // Create face outline as an ellipse/oval shape
        const faceGeometry = new THREE.SphereGeometry(0.4, 16, 12);

        // Make it slightly flattened like a face
        faceGeometry.scale(1, 1.2, 0.1);

        const faceMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.2,
            wireframe: true
        });

        const faceOutline = new THREE.Mesh(faceGeometry, faceMaterial);
        faceOutline.position.set(faceX, faceY, 0.05); // Positioned at detected face center

        container.add(faceOutline);
    }

    createMouth(container, color, faceX, faceY) {
        // Create mouth as a small ellipse
        const mouthGeometry = new THREE.SphereGeometry(0.08, 16, 8);

        // Flatten it to make it more mouth-like
        mouthGeometry.scale(1.5, 0.5, 0.3);

        const mouthMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.7
        });

        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);

        // Position mouth relative to detected face center (below it)
        mouth.position.set(faceX, faceY - 0.25, 0.12);

        container.add(mouth);
    }

    initializeDelayOrder() {
        this.delayOrder = [];
        const faceCount = this.facePlanes.length;

        if (this.isRandomOrder) {
            const maxDelay = Math.min(faceCount, this.maxFrameHistory);
            const indices = Array.from({ length: maxDelay }, (_, i) => i);

            // Shuffle the indices
            for (let i = indices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [indices[i], indices[j]] = [indices[j], indices[i]];
            }

            this.delayOrder = [];
            for (let i = 0; i < faceCount; i++) {
                this.delayOrder.push(indices[i % indices.length]);
            }
        } else {
            this.delayOrder = Array.from({ length: faceCount }, (_, i) => i % this.maxFrameHistory);
        }
    }

    initializeZoomSettings() {
        this.zoomSettings = [];
        const faceCount = this.facePlanes.length;

        for (let i = 0; i < faceCount; i++) {
            // EXTREME zoom variation: from 0.3x (very far) to 8.0x (very close)
            const zoomLevel = 1.2 + Math.random() * 7.7; // Random between 0.3 and 8.0

            // RANDOM positioning - much wider range
            const panX = (Math.random() - 0.5) * 1.5; // -0.75 to +0.75
            const panY = (Math.random() - 0.5) * 1.2; // -0.6 to +0.6

            this.zoomSettings.push({
                zoom: zoomLevel,
                panX: panX,
                panY: panY,
                confidence: Math.random(),
                isStable: true // Mark as stable so it doesn't get overwritten
            });
        }

        // console.log(`Created ${faceCount} STABLE zoom settings with extreme variation (0.3x to 8.0x zoom)`);
    }

    createShaders() {
        const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

        return [
            // Original - clean reference
            {
                vertex: vertexShader,
                fragment: `
                uniform sampler2D uTexture;
                uniform float uReveal;
                uniform float uMirror;
                varying vec2 vUv;
                void main() {
                    vec2 uv = vUv;
                    if (uMirror > 0.5) {
                        uv.x = 1.0 - uv.x; // Mirror horizontally only for video
                    }
                    vec4 color = texture2D(uTexture, uv);
                    
                    // Mix between black and the effect based on reveal
                    vec3 finalColor = mix(vec3(0.0), color.rgb, uReveal);
                    gl_FragColor = vec4(finalColor, color.a);
                }
            `
            },
            // EXTREME High Contrast + Posterization
            {
                vertex: vertexShader,
                fragment: `
                uniform sampler2D uTexture;
                uniform float uIntensity;
                uniform float uReveal;
                uniform float uMirror;
                varying vec2 vUv;
                void main() {
                    vec2 uv = vUv;
                    if (uMirror > 0.5) {
                        uv.x = 1.0 - uv.x; // Mirror horizontally only for video
                    }
                    vec4 color = texture2D(uTexture, uv);
                    // Extreme contrast + posterization
                    color.rgb = (color.rgb - 0.5) * 2.5 + 0.5;
                    color.rgb = floor(color.rgb * 6.0) / 6.0; // Posterize
                    
                    // Mix between black and the effect based on reveal
                    vec3 finalColor = mix(vec3(0.0), color.rgb, uReveal);
                    gl_FragColor = vec4(finalColor, color.a);
                }
            `
            },
            // EXTREME Color Channel Isolation (Red Hell)
            {
                vertex: vertexShader,
                fragment: `
                uniform sampler2D uTexture;
                uniform float uIntensity;
                uniform float uReveal;
                uniform float uMirror;
                varying vec2 vUv;
                void main() {
                    vec2 uv = vUv;
                    if (uMirror > 0.5) {
                        uv.x = 1.0 - uv.x; // Mirror horizontally only for video
                    }
                    vec4 color = texture2D(uTexture, uv);
                    float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                    // Extreme red isolation with high contrast
                    color.rgb = vec3(luminance * 2.0, luminance * 0.1, luminance * 0.1);
                    color.rgb = pow(color.rgb, vec3(0.7)); // Gamma boost for intensity
                    
                    // Mix between black and the effect based on reveal
                    vec3 finalColor = mix(vec3(0.0), color.rgb, uReveal);
                    gl_FragColor = vec4(finalColor, color.a);
                }
            `
            },
            // EXTREME Cyan/Blue Isolation (Ice Cold)
            {
                vertex: vertexShader,
                fragment: `
                uniform sampler2D uTexture;
                uniform float uIntensity;
                uniform float uMirror;
                varying vec2 vUv;
                void main() {
                    vec2 uv = vUv;
                    if (uMirror > 0.5) {
                        uv.x = 1.0 - uv.x; // Mirror horizontally only for video
                    }
                    vec4 color = texture2D(uTexture, uv);
                    float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                    // Extreme cyan/blue with high saturation
                    color.rgb = vec3(luminance * 0.2, luminance * 1.5, luminance * 2.0);
                    color.rgb = pow(color.rgb, vec3(0.8)); // Intensify
                    gl_FragColor = color;
                }
            `
            },
            // EXTREME Inversion with Color Shift
            {
                vertex: vertexShader,
                fragment: `
                uniform sampler2D uTexture;
                uniform float uIntensity;
                uniform float uMirror;
                varying vec2 vUv;
                void main() {
                    vec2 uv = vUv;
                    if (uMirror > 0.5) {
                        uv.x = 1.0 - uv.x; // Mirror horizontally only for video
                    }
                    vec4 color = texture2D(uTexture, uv);
                    // Invert + extreme color shift
                    vec3 inverted = 1.0 - color.rgb;
                    inverted = vec3(inverted.g, inverted.b, inverted.r); // Channel swap
                    inverted = pow(inverted, vec3(0.6)); // Boost intensity
                    gl_FragColor = vec4(inverted, color.a);
                }
            `
            },
            // EXTREME Saturation Bomb
            {
                vertex: vertexShader,
                fragment: `
                uniform sampler2D uTexture;
                uniform float uIntensity;
                uniform float uMirror;
                varying vec2 vUv;
                void main() {
                    vec2 uv = vUv;
                    if (uMirror > 0.5) {
                        uv.x = 1.0 - uv.x; // Mirror horizontally only for video
                    }
                    vec4 color = texture2D(uTexture, uv);
                    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                    // EXTREME oversaturation
                    vec3 saturated = mix(vec3(gray), color.rgb, 3.5);
                    saturated = pow(saturated, vec3(0.8)); // More punch
                    gl_FragColor = vec4(saturated, color.a);
                }
            `
            },
            // // EXTREME Wave Distortion + Color Glitch
            // {
            //     vertex: vertexShader,
            //     fragment: `
            //     uniform sampler2D uTexture;
            //     uniform float uTime;
            //     uniform float uIntensity;
            //     uniform float uReveal;
            //     varying vec2 vUv;
            //     void main() {
            //         vec2 uv = vUv;
            //         uv.x = 1.0 - uv.x; // Mirror horizontally
            //         // Extreme wave distortion
            //         uv.x += sin(uv.y * 20.0 + uTime * 4.0) * 0.08;
            //         uv.y += cos(uv.x * 15.0 + uTime * 3.0) * 0.06;

            //         // Glitchy color separation
            //         vec4 colorR = texture2D(uTexture, uv + vec2(0.01, 0.0));
            //         vec4 colorG = texture2D(uTexture, uv);
            //         vec4 colorB = texture2D(uTexture, uv - vec2(0.01, 0.0));

            //         vec3 glitch = vec3(colorR.r, colorG.g, colorB.b);
            //         glitch = pow(glitch, vec3(0.7)); // Intensify

            //         // Mix between black and the effect based on reveal
            //         vec3 finalColor = mix(vec3(0.0), glitch, uReveal);
            //         gl_FragColor = vec4(finalColor, 1.0);
            //     }
            // `
            // }
        ];
    }

    startAnimation() {
        this.isRunning = true;
        this.animate();
    }

    animate() {
        if (!this.isRunning) return;

        requestAnimationFrame(() => this.animate());

        const time = Date.now() * 0.001;

        // FPS calculation
        this.fpsCounter++;
        if (time - this.lastFpsTime >= 1.0) {
            this.currentFps = Math.round(this.fpsCounter / (time - this.lastFpsTime));
            this.fpsCounter = 0;
            this.lastFpsTime = time;
            this.updateFpsDisplay();
        }


        // Update entrance animation if active
        this.updateEntranceAnimation();

        // ALWAYS fill delay buffer regardless of mode - with consistent timing
        const now = Date.now();
        if (!this.lastCaptureTime) this.lastCaptureTime = now;

        // Capture frames at consistent 60 FPS regardless of display refresh rate
        const captureInterval = 1000 / 60; // 60 FPS capture rate
        if (now - this.lastCaptureTime >= captureInterval) {
            this.captureFrame();
            this.lastCaptureTime = now;
        }

        if (this.isDelayMode) {
            this.updateDelayMode();
        } else if (this.isZoomMode) {
            this.updateZoomMode();
            this.updateImageFallbackMode(); // Apply 50-50 image distribution for zoom mode
        } else if (this.isPrimitiveMode) {
            this.updatePrimitiveMode();
            this.updateImageFallbackMode(); // Apply 50-50 image distribution for primitive mode
        } else {
            // Update shader uniforms for effects mode and pixelation mode
            this.facePlanes.forEach((faceData, index) => {
                if (faceData.effectMaterial.uniforms.uTime) {
                    // console.log(Math.sin(time + faceData.delay));
                    faceData.effectMaterial.uniforms.uTime.value = Math.sin(time + faceData.delay);
                }
            });
            this.updateImageFallbackMode(); // Apply 50-50 image distribution for effects/pixelation modes
        }

        this.renderer.render(this.scene, this.camera);
    }

    updateFpsDisplay() {
        const fpsElement = document.getElementById('fps');
        const faceCount = this.facePlanes.length;
        const resolution = `${window.innerWidth}x${window.innerHeight}`;
        const pixelRatio = this.renderer.getPixelRatio();

        let fpsClass = 'fps-good';
        if (this.currentFps < 45) fpsClass = 'fps-ok';
        if (this.currentFps < 30) fpsClass = 'fps-bad';

        fpsElement.innerHTML = `
        <span class="${fpsClass}">FPS: ${this.currentFps}</span><br>
        Faces: ${faceCount}<br>
        Resolution: ${resolution}<br>
        Pixel Ratio: ${pixelRatio}x
    `;
    }

    updateDelayMode() {
        this.facePlanes.forEach((faceData, index) => {
            // Skip text panels - don't apply delay effects to them
            if (faceData.isTextPanel) {
                return; // Keep original text texture
            }

            const delayIndex = this.delayOrder[index] || 0;
            const frameIndex = this.frameHistory.length - 1 - delayIndex;

            if (frameIndex >= 0 && frameIndex < this.frameHistory.length) {
                faceData.plainMaterial.uniforms.uTexture.value = this.delayTextures[frameIndex].texture;
            } else {
                const oldestIndex = Math.max(0, this.frameHistory.length - 1);
                if (oldestIndex >= 0 && this.delayTextures[oldestIndex]) {
                    faceData.plainMaterial.uniforms.uTexture.value = this.delayTextures[oldestIndex].texture;
                }
            }
        });
    }

    updatePrimitiveMode() {
        // No animations - primitive objects stay static
        // Face elements will only move when face detection updates their positions
    }

    updateZoomMode() {
        this.facePlanes.forEach((faceData, index) => {
            const zoomSetting = this.zoomSettings[index];
            if (zoomSetting && faceData.zoomMaterial.uniforms) {
                faceData.zoomMaterial.uniforms.uZoom.value = zoomSetting.zoom;
                faceData.zoomMaterial.uniforms.uPanX.value = zoomSetting.panX;
                faceData.zoomMaterial.uniforms.uPanY.value = zoomSetting.panY;
            }
        });
    }

    // NEW: Update image fallback textures for 50-50 distribution in all modes
    updateImageFallbackMode() {
        if (!this.isInFallbackMode() || !this.fallbackImageTextures || this.fallbackImageTextures.length < 2) {
            return;
        }

        this.facePlanes.forEach((faceData, index) => {
            // Skip text panels - don't apply fallback effects to them
            if (faceData.isTextPanel) {
                return;
            }

            // Use deterministic random based on panel index for consistent assignment
            const randomValue = (index * 7919) % 1000;
            const imageIndex = randomValue < 500 ? 0 : 1; // 50-50 split
            const selectedTexture = this.fallbackImageTextures[imageIndex];

            // Update all material uniforms that use textures
            if (faceData.effectMaterial && faceData.effectMaterial.uniforms.uTexture) {
                faceData.effectMaterial.uniforms.uTexture.value = selectedTexture;
            }
            if (faceData.plainMaterial && faceData.plainMaterial.uniforms.uTexture) {
                faceData.plainMaterial.uniforms.uTexture.value = selectedTexture;
            }
            if (faceData.zoomMaterial && faceData.zoomMaterial.uniforms.uTexture) {
                faceData.zoomMaterial.uniforms.uTexture.value = selectedTexture;
            }
            if (faceData.pixelationMaterial && faceData.pixelationMaterial.uniforms.uTexture) {
                faceData.pixelationMaterial.uniforms.uTexture.value = selectedTexture;
            }
        });
    }

    captureFrame() {
        this.frameHistory.push(Date.now());

        if (this.frameHistory.length > this.maxFrameHistory) {
            this.frameHistory.shift();
        }

        for (let i = this.maxFrameHistory - 1; i > 0; i--) {
            if (this.delayTextures[i - 1]) {
                const sourceCtx = this.delayTextures[i - 1].context;
                const targetCtx = this.delayTextures[i].context;

                targetCtx.clearRect(0, 0, 640, 480);
                targetCtx.drawImage(this.delayTextures[i - 1].canvas, 0, 0);
                this.delayTextures[i].texture.needsUpdate = true;
            }
        }

        if (this.delayTextures[0]) {
            const ctx = this.delayTextures[0].context;
            ctx.clearRect(0, 0, 640, 480);

            // Only draw from video if it's available and ready
            if (this.video && this.video.readyState >= 2) {
                ctx.drawImage(this.video, 0, 0, 640, 480);
            } else {
                // In fallback mode, draw alternating images to maintain delay effect
                if (this.isInFallbackMode() && this.loadedImages && Object.keys(this.loadedImages).length > 0) {
                    const currentMode = this.getCurrentModeKey();
                    const modeImages = this.modeImages[currentMode] || this.modeImages.pixelation;
                    
                    // Choose image based on current frame for alternating effect
                    const imageIndex = Math.floor(Date.now() / 1000) % modeImages.length;
                    const imagePath = modeImages[imageIndex];
                    const selectedImage = this.loadedImages[imagePath];
                    
                    if (selectedImage) {
                        ctx.drawImage(selectedImage, 0, 0, 640, 480);
                    } else {
                        // Fallback to gradient pattern
                        const gradient = ctx.createLinearGradient(0, 0, 640, 480);
                        gradient.addColorStop(0, '#1a1a1a');
                        gradient.addColorStop(0.5, '#2d2d2d');
                        gradient.addColorStop(1, '#1a1a1a');
                        ctx.fillStyle = gradient;
                        ctx.fillRect(0, 0, 640, 480);
                    }
                } else {
                    // Ultimate fallback - draw gradient pattern
                    const gradient = ctx.createLinearGradient(0, 0, 640, 480);
                    gradient.addColorStop(0, '#1a1a1a');
                    gradient.addColorStop(0.5, '#2d2d2d');
                    gradient.addColorStop(1, '#1a1a1a');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, 640, 480);
                }
            }

            this.delayTextures[0].texture.needsUpdate = true;
        }
    }

    cycleMode() {
        // Cycle through: Effects -> Delay -> Zoom -> Primitive -> Pixelation -> Effects
        if (!this.isDelayMode && !this.isZoomMode && !this.isPrimitiveMode && !this.isPixelationMode) {
            // Currently in Effects mode, switch to Delay
            this.isDelayMode = true;
            this.isZoomMode = false;
            this.isPrimitiveMode = false;
            this.isPixelationMode = false;
        } else if (this.isDelayMode && !this.isZoomMode && !this.isPrimitiveMode && !this.isPixelationMode) {
            // Currently in Delay mode, switch to Zoom
            this.isDelayMode = false;
            this.isZoomMode = true;
            this.isPrimitiveMode = false;
            this.isPixelationMode = false;
        } else if (!this.isDelayMode && this.isZoomMode && !this.isPrimitiveMode && !this.isPixelationMode) {
            // Currently in Zoom mode, switch to Primitive
            this.isDelayMode = false;
            this.isZoomMode = false;
            this.isPrimitiveMode = true;
            this.isPixelationMode = false;
        } else if (!this.isDelayMode && !this.isZoomMode && this.isPrimitiveMode && !this.isPixelationMode) {
            // Currently in Primitive mode, switch to Pixelation
            this.isDelayMode = false;
            this.isZoomMode = false;
            this.isPrimitiveMode = false;
            this.isPixelationMode = true;
        } else {
            // Currently in Pixelation mode, switch to Effects
            this.isDelayMode = false;
            this.isZoomMode = false;
            this.isPrimitiveMode = false;
            this.isPixelationMode = false;
        }

        this.updateModeDisplay();

        // If in fallback mode with images, reload textures for new mode
        if (this.isInFallbackMode() && this.imagesLoaded) {
            console.log('🔄 Mode changed - reloading images for new mode');
            this.setupImageFallbackTextures();
        }

        // Update mirror uniforms for all materials
        this.updateMirrorUniforms();

        // Update image fallback textures for 50-50 distribution (except delay mode)
        if (!this.isDelayMode) {
            this.updateImageFallbackMode();
        }
    }

    // NEW: Update mirror uniforms for all materials based on camera availability
    updateMirrorUniforms() {
        const shouldMirror = this.hasCamera ? 1.0 : 0.0;

        this.facePlanes.forEach((faceData) => {
            if (!faceData.isTextPanel) { // Only update video panels, not text panels
                // Update all material uniforms that have uMirror
                if (faceData.effectMaterial && faceData.effectMaterial.uniforms.uMirror) {
                    faceData.effectMaterial.uniforms.uMirror.value = shouldMirror;
                }
                if (faceData.plainMaterial && faceData.plainMaterial.uniforms.uMirror) {
                    faceData.plainMaterial.uniforms.uMirror.value = shouldMirror;
                }
                if (faceData.zoomMaterial && faceData.zoomMaterial.uniforms.uMirror) {
                    faceData.zoomMaterial.uniforms.uMirror.value = shouldMirror;
                }
                if (faceData.pixelationMaterial && faceData.pixelationMaterial.uniforms.uMirror) {
                    faceData.pixelationMaterial.uniforms.uMirror.value = shouldMirror;
                }
            }
        });

        console.log(`🪞 Updated mirror uniforms: ${shouldMirror ? 'Mirroring ON (camera)' : 'Mirroring OFF (images)'}`);
    }

    updateModeDisplay() {
        const modeBtn = document.getElementById('modeBtn');
        const modeIndicator = document.getElementById('modeIndicator');

        // Clean up 3x3 overlay when switching modes
        if (this.hoveredArea) {
            this.hide3x3Overlay();
        }

        // Recreate face planes with new articles for the current mode FIRST
        if (this.isRunning && this.videoTexture) {
            this.createFacePlanes();

            // Apply 50-50 image distribution for fallback mode (except delay mode)
            if (!this.isDelayMode) {
                this.updateImageFallbackMode();
            }

            // Trigger fast entrance animation when switching modes (except on initial load)
            if (!this.isInitialLoad) {
                setTimeout(() => {
                    this.startEntranceAnimation(true); // Use fast mode for mode switches
                }, 100); // Small delay to ensure planes are created
            }
        }

        // THEN apply the mode-specific materials and settings
        if (this.isDelayMode) {
            modeBtn.textContent = 'Next Mode (Zoom)';
            modeIndicator.textContent = 'Delay Mode';
            document.getElementById('info').textContent = 'Delay mode: Each face shows you from a different time!';

            this.facePlanes.forEach((faceData) => {
                // For text panels, keep their original texture but use text material
                if (faceData.isTextPanel) {
                    faceData.mesh.material = faceData.textMaterial;
                } else {
                    faceData.mesh.material = faceData.plainMaterial;
                }
                faceData.mesh.visible = true;
                faceData.primitiveContainer.visible = false;
            });

            // Don't clear the buffer - keep the pre-filled frames!
            // this.frameHistory = [];
            // this.frameCounter = 0;
            // this.delayTextures.forEach(delayData => {
            //     delayData.context.clearRect(0, 0, 640, 480);
            //     delayData.texture.needsUpdate = true;
            // });

            // Only initialize delay order if it doesn't exist or face count changed
            if (!this.delayOrder || this.delayOrder.length !== this.facePlanes.length) {
                this.initializeDelayOrder();
            }

        } else if (this.isZoomMode) {
            modeBtn.textContent = 'Next Mode (Primitive)';
            modeIndicator.textContent = 'Zoom Mode';
            document.getElementById('info').textContent = 'Zoom mode: Eye positions detected once and fixed!';

            this.facePlanes.forEach((faceData) => {
                if (faceData.isTextPanel) {
                    faceData.mesh.material = faceData.textMaterial;
                } else {
                    faceData.mesh.material = faceData.zoomMaterial;
                    faceData.zoomMaterial.uniforms.uTexture.value = this.videoTexture;
                }
                faceData.mesh.visible = true;
                faceData.primitiveContainer.visible = false;
            });

            // Only initialize zoom settings if they don't exist or face count changed
            if (!this.zoomSettings || this.zoomSettings.length !== this.facePlanes.length) {
                this.initializeZoomSettings(); // Initialize with random positions first
                this.zoomInitialized = false;   // Then let face detection override if available
                // console.log('🎯 Zoom mode activated - initialized random positions, will detect eye positions if possible');
            } else {
                // console.log('🎯 Zoom mode activated - using existing stable zoom positions');
            }
        } else if (this.isPrimitiveMode) {
            modeBtn.textContent = 'Next Mode (Pixelation)';
            modeIndicator.textContent = 'Primitive Mode';
            document.getElementById('info').textContent = 'Primitive mode: Eye spheres overlay on video!';

            this.facePlanes.forEach((faceData) => {
                // For text panels, keep text material; for video, show video with primitives
                if (faceData.isTextPanel) {
                    faceData.mesh.material = faceData.textMaterial;
                } else {
                    faceData.mesh.material = faceData.plainMaterial;
                    faceData.plainMaterial.uniforms.uTexture.value = this.videoTexture;
                }
                faceData.mesh.visible = true;
                faceData.primitiveContainer.visible = faceData.isTextPanel ? false : true;
            });
            // Initialize primitive objects
            this.updatePrimitiveObjects();

        } else if (this.isPixelationMode) {
            modeBtn.textContent = 'Next Mode (Effects)';
            modeIndicator.textContent = 'Pixelation Mode';
            document.getElementById('info').textContent = 'Pixelation mode: Retro pixel art effects with different styles!';

            this.facePlanes.forEach((faceData, index) => {
                // For text panels, keep text material; for video, use pixelation material
                if (faceData.isTextPanel) {
                    faceData.mesh.material = faceData.textMaterial;
                } else {
                    faceData.mesh.material = faceData.pixelationMaterial;
                    faceData.pixelationMaterial.uniforms.uTexture.value = this.videoTexture;
                    // Only reset to black during initial load, not when switching modes
                    if (this.isInitialLoad) {
                        faceData.pixelationMaterial.uniforms.uReveal.value = 0.0;
                    }
                }
                faceData.mesh.visible = true;
                faceData.primitiveContainer.visible = false;
            });
        } else {
            modeBtn.textContent = 'Next Mode (Delay)';
            modeIndicator.textContent = 'Effects Mode';
            document.getElementById('info').textContent = 'Effects mode: Each face shows different visual effects!';

            this.facePlanes.forEach((faceData) => {
                // For text panels, keep text material; for video, use effect material
                if (faceData.isTextPanel) {
                    faceData.mesh.material = faceData.textMaterial;
                } else {
                    faceData.mesh.material = faceData.effectMaterial;
                    faceData.effectMaterial.uniforms.uTexture.value = this.videoTexture;
                }
                faceData.mesh.visible = true;
                faceData.primitiveContainer.visible = false;
            });
        }
    }
    reinitializeZoomPositions() {
        if (!this.isZoomMode) {
            // console.log('⚠️ Can only reinitialize in zoom mode');
            return;
        }

        // console.log('🔄 Reinitializing zoom positions...');
        this.zoomSettings = []; // Clear existing settings
        this.zoomInitialized = false; // Reset initialization flag

        // Trigger one fresh detection
        this.detectFaces().then(faces => {
            this.detectedFaces = faces;
            this.updateIntelligentZoomSettings();
            this.zoomInitialized = true; // Mark as reinitialized
            // console.log('✅ Zoom positions reinitialized');
        });
    }
    toggleOrder() {
        if (!this.isDelayMode) return;

        this.isRandomOrder = !this.isRandomOrder;
        const orderBtn = document.getElementById('orderBtn');
        const orderIndicator = document.getElementById('orderIndicator');

        if (this.isRandomOrder) {
            orderBtn.textContent = 'Sequential Order';
            orderIndicator.textContent = 'Random';
            document.getElementById('info').textContent = 'Random delay mode: Time delays scattered randomly!';
        } else {
            orderBtn.textContent = 'Randomize Order';
            orderIndicator.textContent = 'Sequential';
            document.getElementById('info').textContent = 'Sequential delay mode: Time flows from left to right!';
        }

        this.initializeDelayOrder();
    }

    stopCamera() {
        this.isRunning = false;

        if (this.faceDetectionInterval) {
            clearInterval(this.faceDetectionInterval);
            this.faceDetectionInterval = null;
        }

        // Clean up hover states
        if (this.hoveredPair) {
            this.resetPairHoverState(this.hoveredPair);
            this.hoveredPair = null;
        }

        // Clean up 3x3 hover effect if active
        if (this.hoveredArea) {
            this.hide3x3Overlay();
        }

        if (this.video && this.video.srcObject) {
            const tracks = this.video.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            this.video.srcObject = null;
        }

        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
        document.getElementById('modeBtn').disabled = true;
        document.getElementById('orderBtn').disabled = true;
        document.getElementById('info').textContent = 'Camera stopped. Click "Start Camera" to begin again.';
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        const pixelRatio = Math.min(window.devicePixelRatio, 2);
        this.renderer.setPixelRatio(pixelRatio);

        if (this.isRunning && this.videoTexture) {
            this.createFacePlanes();
        }
        this.updateModeDisplay();

        this.updateFpsDisplay();
    }

    onMouseMove(event) {
        // Store raw mouse coordinates for cursor-repelling effect
        this.rawMouseX = event.clientX;
        this.rawMouseY = event.clientY;

        // Calculate mouse position in normalized device coordinates (-1 to +1)
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update the raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // SKIP 3x3 hover effect if navbar grid is currently visible
        if (window.universalNavbar && window.universalNavbar.isGridVisible) {
            // Hide any existing 3x3 overlay if navbar is open
            if (this.hoveredArea) {
                this.hide3x3Overlay();
            }
            return; // Exit early, don't process 3x3 hover effects
        }

        // Find intersections with face planes
        const intersects = this.raycaster.intersectObjects(
            this.facePlanes.map(face => face.mesh)
        );

        // Check if we're hovering over a text panel
        if (intersects.length > 0) {
            const intersectedFace = this.facePlanes.find(
                face => face.mesh === intersects[0].object
            );

            if (intersectedFace && intersectedFace.isTextPanel) {
                // Get the index of the hovered panel
                const hoveredIndex = this.facePlanes.indexOf(intersectedFace);

                // Check if this panel is a twin of the currently hovered panel
                const isTwinPanel = this.currentHoveredPanel &&
                    intersectedFace.pairInfo &&
                    this.currentHoveredPanel.pairInfo &&
                    intersectedFace.pairInfo.pairIndex === this.currentHoveredPanel.pairInfo.pairIndex;

                if (isTwinPanel) {
                    // Keep the same 3x3 overlay position - just update the stored panel
                    this.currentHoveredPanel = intersectedFace;
                    // console.log(`👫 Hovering over twin panel - keeping 3x3 overlay stable`);
                } else {
                    // Calculate 3x3 grid around this panel
                    const gridInfo = this.calculate3x3Grid(hoveredIndex);

                    if (gridInfo && gridInfo.indices.length > 0) {
                        // Check if this is a different area than currently hovered
                        const isDifferentArea = !this.hoveredArea ||
                            !this.arraysEqual(this.hoveredArea.indices, gridInfo.indices);

                        if (isDifferentArea) {
                            // Hide previous overlay
                            this.hide3x3Overlay();

                            // Get article info for the hovered panel
                            const articleInfo = this.getArticleInfoFromPanel(intersectedFace);

                            // Show new overlay with article info
                            this.show3x3Overlay(gridInfo, articleInfo);

                            // Store the currently hovered panel
                            this.currentHoveredPanel = intersectedFace;

                            // console.log(`3x3 overlay shown around panel ${hoveredIndex} for article:`, articleInfo?.title);
                        }
                    }
                }
            } else {
                // Not hovering over a text panel or in pixelation mode - hide overlay if we had one
                if (this.hoveredArea) {
                    this.hide3x3Overlay();
                }
            }
        } else {
            // Not hovering over anything - hide overlay if we had one
            if (this.hoveredArea) {
                this.hide3x3Overlay();
            }
        }
    }

    // Helper function to compare arrays
    arraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        return arr1.every((val, index) => val === arr2[index]);
    }

    // Get article information from a hovered panel
    getArticleInfoFromPanel(faceData) {
        if (!faceData.isTextPanel || !faceData.textPanel) return null;

        // Handle pixelation text panels specially
        if (faceData.textPanel.type === 'pixelation') {
            // Create appropriate article info for pixelation panels
            const pixelationTexts = ["חזרות במדיה", "גליון 04"];
            const text = pixelationTexts[faceData.textPanel.index % pixelationTexts.length];

            // Different sentences for each panel
            const pixelationSentences = [
                // Panel 0
                [
                    { title: "עורכים:", names: "ענת זנגר, ניר פרבר" }
                ],
                // Panel 1
                [
                    { title: "הפקה:", names: "ליאור פרלשטיין" }
                ],
                // Panel 2
                [
                    { title: "חברי המערכת:", names: "ענת זנגר, ניר פרבר, יעל לוי, עידו לויט, אורי לוין" }
                ],
                // Panel 3
                [
                    { title: "ועדה אקדמית:", names: "ד\"ר פבלו אוטין, ד\"ר שי בידרמן, ד\"ר בועז חגין, ד\"ר דן חיוטין, ד\"ר יעל לוי, ד\"ר עידו לויט, ד\"ר אורי לוין, ד\"ר אוהד לנדסמן, ד\"ר מירי מוהבן שקד" }
                ],
                // Panel 4
                [
                    { title: "עורכת לשון:", names: "רונית רוזנטל" }
                ],
                // Panel 5
                [
                    { title: "עיצוב גרפי:", names: "עמרי ברגמן" }
                ],

                // Panel 6
                [
                { title: "עורכים מייסדים:", names: "ענת זנגר, ניר פרבר" }
                ],
                // Panel 7
                [
                    { title: "אוצר פרויקט \"ואל מסך תשוב\":", names: "אופיר פלדמן" }
                ],

                // Panel 8
                [
                { title: "מערכת צעירה:", names: "עומר גורי, ליאור פרלשטיין, מישל צ'יקו, טל רז" }
                ],

                // Panel 9
                [
                { title: "תרגום ועריכה לשונית באנגלית:", names: "אורית פרידלנד" }
                ]

            ];

            // Use different sentences based on panel index
            const sentences = pixelationSentences[faceData.textPanel.index % pixelationSentences.length];

            return {
                title: text,
                author: "מחזור 03",
                excerpt: "פרויקט גמר בעיצוב חזותי דיגיטלי העוסק בחזרות במדיה ובהעתקות שלהן",
                link: "#",
                articleSentences: sentences
            };
        }

        const currentMode = this.getCurrentModeKey();
        const articles = this.modeArticles[currentMode];
        const articleIndex = faceData.textPanel.index;

        if (articleIndex >= 0 && articleIndex < articles.length) {
            return articles[articleIndex];
        }

        return null;
    }

    getPanelPair(faceData) {
        if (!faceData.isTextPanel || !faceData.pairInfo) {
            return {
                title: faceData.textPanel?.type === 'title' ? faceData : null,
                author: faceData.textPanel?.type === 'author' ? faceData : null
            };
        }

        // Find the partner panel
        const partnerPanel = this.facePlanes.find(face =>
            face.isTextPanel &&
            face.pairInfo &&
            face.pairInfo.myPosition === faceData.pairInfo.partnerPosition
        );

        return {
            title: faceData.pairInfo.isTitle ? faceData : partnerPanel,
            author: faceData.pairInfo.isTitle ? partnerPanel : faceData
        };
    }

    isSamePair(pair1, pair2) {
        return pair1.title === pair2.title && pair1.author === pair2.author;
    }

    applyPairHoverState(pair) {
        // Apply bold text to both panels in the pair
        if (pair.title) {
            this.applyBoldTextToPanel(pair.title);
        }
        if (pair.author) {
            this.applyBoldTextToPanel(pair.author);
        }
    }

    resetPairHoverState(pair) {
        // Reset text to regular weight for both panels
        if (pair.title) {
            this.resetTextToRegular(pair.title);
        }
        if (pair.author) {
            this.resetTextToRegular(pair.author);
        }
    }

    applyBoldTextToPanel(faceData) {
        if (!faceData || !faceData.isTextPanel || !faceData.boldTexture) return;

        // Switch to bold texture with smooth transition
        const material = faceData.mesh.material;
        if (material.uniforms && material.uniforms.uTexture) {
            material.uniforms.uTexture.value = faceData.boldTexture;
        }

        // console.log(`Applied bold text to ${faceData.textPanel.type} panel`);
    }

    resetTextToRegular(faceData) {
        if (!faceData || !faceData.isTextPanel || !faceData.originalTexture) return;

        // Switch back to regular texture
        const material = faceData.mesh.material;
        if (material.uniforms && material.uniforms.uTexture) {
            material.uniforms.uTexture.value = faceData.originalTexture;
        }

        // console.log(`Reset to regular text for ${faceData.textPanel.type} panel`);
    }

    // Calculate 3x3 grid around a hovered panel
    calculate3x3Grid(hoveredIndex) {
        if (!this.facePlanes.length) return null;

        // Calculate grid dimensions
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const aspectRatio = screenWidth / screenHeight;

        // Get face size (same calculation as in createFacePlanes)
        const totalPixels = screenWidth * screenHeight;
        let targetFaceSize;
        if (totalPixels > 3840 * 2160) targetFaceSize = 200;
        else if (totalPixels > 1920 * 1080) targetFaceSize = 170;
        else targetFaceSize = 150;

        const cols = Math.ceil(screenWidth / targetFaceSize);
        const rows = Math.ceil(screenHeight / targetFaceSize);

        // Convert hoveredIndex to row/col
        const hoveredCol = hoveredIndex % cols;
        const hoveredRow = Math.floor(hoveredIndex / cols);

        // Calculate 3x3 grid center (try to center on hovered panel)
        let startCol = hoveredCol - 1;
        let startRow = hoveredRow - 1;

        // Adjust for edges - keep 3x3 grid within bounds
        if (startCol < 0) startCol = 0;
        if (startRow < 0) startRow = 0;
        if (startCol + 3 > cols) startCol = cols - 3;
        if (startRow + 3 > rows) startRow = rows - 3;

        // Make sure we don't go negative (in case grid is smaller than 3x3)
        startCol = Math.max(0, startCol);
        startRow = Math.max(0, startRow);

        // Calculate the 9 panel indices
        const gridIndices = [];
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const panelCol = startCol + col;
                const panelRow = startRow + row;

                // Make sure we don't exceed bounds
                if (panelCol < cols && panelRow < rows) {
                    const panelIndex = panelRow * cols + panelCol;
                    if (panelIndex < this.facePlanes.length) {
                        gridIndices.push(panelIndex);
                    }
                }
            }
        }

        // Calculate panel dimensions
        const facePixelWidth = screenWidth / cols;
        const facePixelHeight = screenHeight / rows;

        return {
            indices: gridIndices,
            startCol,
            startRow,
            cols,
            rows,
            panelWidth: facePixelWidth,
            panelHeight: facePixelHeight
        };
    }

    // Create large canvas with 2 sentences spanning 3x3 grid - SIMPLIFIED
    create3x3TextCanvas(worldWidth, worldHeight, articleInfo = null) {
        // Calculate canvas size based on world dimensions
        const pixelRatio = window.devicePixelRatio || 1;
        const canvasWidth = Math.floor(worldWidth * 200 * pixelRatio); // Convert world units to pixels
        const canvasHeight = Math.floor(worldHeight * 200 * pixelRatio);

        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');
        ctx.scale(pixelRatio, pixelRatio);

        // Clear with semi-transparent dark background for better readability
        ctx.fillStyle = '#ddddd1';
        ctx.fillRect(0, 0, canvasWidth / pixelRatio, canvasHeight / pixelRatio);

        // Draw 3x3 grid lines (2 horizontal + 2 vertical lines)
        const actualWidth = canvasWidth / pixelRatio;
        const actualHeight = canvasHeight / pixelRatio;

        ctx.strokeStyle = '#999999'; // Light gray color for grid lines
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.6; // Make lines subtle

        // Draw 2 vertical lines to divide into 3 columns
        const colWidth = actualWidth / 3;
        ctx.beginPath();
        ctx.moveTo(colWidth, 0);
        ctx.lineTo(colWidth, actualHeight);
        ctx.moveTo(colWidth * 2, 0);
        ctx.lineTo(colWidth * 2, actualHeight);
        ctx.stroke();

        // Draw 2 horizontal lines to divide into 3 rows
        const rowHeight = actualHeight / 3;
        ctx.beginPath();
        ctx.moveTo(0, rowHeight);
        ctx.lineTo(actualWidth, rowHeight);
        ctx.moveTo(0, rowHeight * 2);
        ctx.lineTo(actualWidth, rowHeight * 2);
        ctx.stroke();

        // Reset alpha for text drawing
        ctx.globalAlpha = 1.0;

        // Configure text styling
        const fontSize = Math.min(canvasWidth, canvasHeight) / pixelRatio * 0.05; // Responsive font size
        const fontFamily = this.fontsLoaded ? this.fontConfig.scentence.name : 'Arial, sans-serif';

        // console.log('🎨 3x3 Canvas text styling:', {
        //     fontsLoaded: this.fontsLoaded,
        //     fontFamily: fontFamily,
        //     fontSize: fontSize,
        //     actualFont: `${fontSize}px ${fontFamily}`
        // });

        ctx.fillStyle = '#444';
        ctx.font = `${fontSize}px ${fontFamily}`; // Removed 'bold' to use the font's natural weight
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Set RTL direction for Hebrew text
        ctx.direction = 'rtl';
        ctx.textAlign = 'right'; // Keep center alignment even with RTL

        // Test if the font is actually available
        if (this.fontsLoaded && !document.fonts.check(`${fontSize}px "${fontFamily}"`)) {
            console.warn(`⚠️ Font "${fontFamily}" not available, falling back to Arial`);
        }

        // Article-specific sentences based on the hovered article
        let sentences = [
            "זהו הטקסט הראשון שמתפרש על פני 9 הפאנלים באזור.",
            "המשפט השני ממשיך ויוצר טקסט רציף על פני כל האזור."
        ]; // Default sentences

        // Use articleSentences directly from the article info if available
        if (articleInfo && articleInfo.articleSentences && Array.isArray(articleInfo.articleSentences)) {
            sentences = articleInfo.articleSentences;
        }

        // Check if we have structured content (title/names objects)
        const isStructuredContent = sentences.length > 0 && sentences[0] && typeof sentences[0] === 'object' && sentences[0].title;

        if (isStructuredContent) {
            // Handle structured content with different fonts for titles and names
            this.drawStructuredTextLarge(ctx, sentences,
                (canvasWidth / pixelRatio) / 1.15,
                (canvasHeight / pixelRatio) / 2.2,
                (canvasWidth / pixelRatio) * 0.7,
                fontSize);
        } else {
            // Handle regular text content (existing logic)
            const fullText = this.fixHebrewPunctuation(sentences.join(' '));
            this.drawWrappedTextLarge(ctx, fullText,
                (canvasWidth / pixelRatio) / 1.15,
                (canvasHeight / pixelRatio) / 2.2,
                (canvasWidth / pixelRatio) * 0.7,
                fontSize * 1.1);
        }

        return canvas;
    }

    // Fix Hebrew punctuation for proper RTL display
    fixHebrewPunctuation(text) {
        // Add RTL mark (U+200F) before punctuation to ensure proper RTL behavior
        const rtlMark = '\u200F';

        // Replace punctuation with RTL-marked versions
        return text
            .replace(/,/g, rtlMark + ',')
            .replace(/\./g, rtlMark + '.')
            .replace(/:/g, rtlMark + ':')
            .replace(/;/g, rtlMark + ';')
            .replace(/\?/g, rtlMark + '?')
            .replace(/!/g, rtlMark + '!')
            .replace(/"/g, rtlMark + '"')
            .replace(/'/g, rtlMark + "'")
            .replace(/\(/g, rtlMark + '(')
            .replace(/\)/g, rtlMark + ')')
            .replace(/\[/g, rtlMark + '[')
            .replace(/\]/g, rtlMark + ']')
            .replace(/-/g, rtlMark + '-')
            .replace(/–/g, rtlMark + '–')
            .replace(/—/g, rtlMark + '—');
    }

    // Enhanced text wrapping for large canvas
    drawWrappedTextLarge(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let lines = [];
        let currentLine = '';

        // Build lines that fit within maxWidth
        for (let word of words) {
            const testLine = currentLine + word + ' ';
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && currentLine !== '') {
                lines.push(currentLine.trim());
                currentLine = word + ' ';
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine.trim() !== '') {
            lines.push(currentLine.trim());
        }

        // Draw centered lines
        const totalHeight = lines.length * lineHeight;
        const startY = y - totalHeight / 2 + lineHeight / 2;

        lines.forEach((line, index) => {
            ctx.fillText(line, x, startY + index * lineHeight);
        });
    }

        // Draw structured text with different fonts for titles and names
    drawStructuredTextLarge(ctx, structuredSentences, x, y, maxWidth, fontSize) {
        const lineHeight = fontSize * 1.2;
        const titleFontSize = fontSize * 1.2; // Make titles bigger
        const namesFontSize = fontSize;
        const titleFont = this.fontsLoaded ? this.fontConfig.scentence.name : 'Arial, sans-serif';
        const authorFont = this.fontsLoaded ? this.fontConfig.author.name : 'Arial, sans-serif';
        
        // Collect all text lines with their styling (including wrapped lines)
        const textLines = [];
        
        structuredSentences.forEach(sentenceObj => {
            // Add title (single line, usually short) with bigger font
            textLines.push({
                text: this.fixHebrewPunctuation(sentenceObj.title),
                font: `${titleFontSize}px ${titleFont}`,
                isTitle: true
            });
            
            // Add names with text wrapping
            const namesText = this.fixHebrewPunctuation(sentenceObj.names);
            ctx.font = `${namesFontSize}px ${authorFont}`; // Set font for measuring

                        // Wrap the names text
            const wrappedNames = this.wrapText(ctx, namesText, maxWidth);
            wrappedNames.forEach(line => {
                textLines.push({
                    text: line,
                    font: `${namesFontSize}px ${authorFont}`,
                    isTitle: false
                });
            });
            
            // Add empty line between sentence objects for spacing
            textLines.push({
                text: '',
                font: `${titleFontSize}px ${titleFont}`,
                isTitle: true
            });
        });

        // Remove the last empty line
        if (textLines.length > 0 && textLines[textLines.length - 1].text === '') {
            textLines.pop();
        }

        // Calculate total height needed
        const totalHeight = textLines.length * lineHeight;
        const startY = y - totalHeight / 2 + lineHeight / 2;

        // Draw each line
        textLines.forEach((line, index) => {
            if (line.text === '') return; // Skip empty lines

            // Set font for this line
            ctx.font = line.font;

            // Draw the text
            ctx.fillText(line.text, x, startY + index * lineHeight);
        });
    }

    // Helper method to wrap text into multiple lines
    wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        let lines = [];
        let currentLine = '';

        for (let word of words) {
            const testLine = currentLine + word + ' ';
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && currentLine !== '') {
                lines.push(currentLine.trim());
                currentLine = word + ' ';
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine.trim() !== '') {
            lines.push(currentLine.trim());
        }

        return lines;
    }

    // Create and show overlay plane - MUCH SIMPLER APPROACH
    show3x3Overlay(gridInfo, articleInfo = null) {
        // console.log(`Showing 3x3 overlay for ${gridInfo.indices.length} panels`);

        // Calculate overlay position and size to EXACTLY match panel positioning
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const aspectRatio = screenWidth / screenHeight;

        // World dimensions (same as in createFacePlanes)
        const worldWidth = 10;
        const worldHeight = worldWidth / aspectRatio;

        // Panel dimensions in world coordinates (same as in createFacePlanes)
        const faceWorldWidth = worldWidth / gridInfo.cols;
        const faceWorldHeight = worldHeight / gridInfo.rows;

        // Overlay dimensions (exactly 3x3 panels)
        const overlayWorldWidth = faceWorldWidth * 3;
        const overlayWorldHeight = faceWorldHeight * 3;

        // Calculate overlay position using EXACT same logic as createFacePlanes
        const startX = -worldWidth / 2 + faceWorldWidth / 2;
        const startY = worldHeight / 2 - faceWorldHeight / 2;

        // Calculate the EXACT center of the 3x3 area by looking at the corners
        const leftmostX = startX + gridInfo.startCol * faceWorldWidth;
        const rightmostX = startX + (gridInfo.startCol + 2) * faceWorldWidth;
        const topmostY = startY - gridInfo.startRow * faceWorldHeight;
        const bottommostY = startY - (gridInfo.startRow + 2) * faceWorldHeight;

        // Center is exactly between the corners
        const overlayX = (leftmostX + rightmostX) / 2;
        const overlayY = (topmostY + bottommostY) / 2;

        // Create overlay plane geometry
        const overlayGeometry = new THREE.PlaneGeometry(overlayWorldWidth, overlayWorldHeight);

        // Create text canvas with article-specific content
        const textCanvas = this.create3x3TextCanvas(overlayWorldWidth, overlayWorldHeight, articleInfo);
        const textTexture = new THREE.CanvasTexture(textCanvas);
        textTexture.needsUpdate = true;

        // Create overlay material
        this.overlayMaterial = new THREE.MeshBasicMaterial({
            map: textTexture,
            transparent: true,
            opacity: 0.95,
            depthWrite: false, // Ensure it renders on top
            depthTest: false   // Disable depth testing to always render on top
        });

        // Create overlay plane
        this.overlayPlane = new THREE.Mesh(overlayGeometry, this.overlayMaterial);
        this.overlayPlane.position.set(overlayX, overlayY, 0.0); // Same Z as panels
        this.overlayPlane.renderOrder = 1; // Render after other objects

        // Add to scene
        this.scene.add(this.overlayPlane);

        // Store current hover area info
        this.hoveredArea = gridInfo;
    }

    // Hide and clean up overlay plane
    hide3x3Overlay() {
        if (!this.overlayPlane) return;

        // console.log('Hiding 3x3 overlay');

        // Remove from scene
        this.scene.remove(this.overlayPlane);

        // Clean up resources
        if (this.overlayMaterial) {
            if (this.overlayMaterial.map) {
                this.overlayMaterial.map.dispose();
            }
            this.overlayMaterial.dispose();
        }

        // Reset references
        this.overlayPlane = null;
        this.overlayMaterial = null;
        this.hoveredArea = null;
        this.currentHoveredPanel = null; // Reset currently hovered panel for twin detection
    }

    // Add click handler for text panels
    onTextPanelClick(event) {
        // Use raycaster to find which specific panel was clicked
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const intersects = this.raycaster.intersectObjects(
            this.facePlanes.map(face => face.mesh)
        );

        if (intersects.length > 0) {
            const clickedFace = this.facePlanes.find(
                face => face.mesh === intersects[0].object
            );

            if (clickedFace && clickedFace.isTextPanel) {
                const articleIndex = clickedFace.textPanel.index;
                const currentMode = this.getCurrentModeKey();
                const articles = this.modeArticles[currentMode];
                const article = articles[articleIndex];
                // console.log(articles);
                // console.log(`🖱️ Clicked on article: "${article.title}" (index: ${articleIndex})`);

                // Map of article titles to their URLs
                const articleUrls = {
                    "דינמיקת החזרה כאסטרטגיה של דימוי הגוף הנשי השמן": "articles/Influences/fatFemaleBody.html",
                    "בחזרה ל'טווין פיקס' דרך הקריסטל": "articles/series/twinPeaks.html",
                    "101 דרכים להבחין בין 'פסיכו' של היצ'קוק ל'פסיכו' של גאס ואן סנט": "articles/remake/psyco.html",
                    // Add more mappings as needed for your new articles
                };

                const url = articleUrls[article.title];
                if (url) {
                    // console.log(`🚀 Navigating to: ${url}`);
                    window.location.href = url;
                } else {
                    console.warn(`⚠️ No URL mapping found for article: "${article.title}"`);
                    // console.log('Available mappings:', Object.keys(articleUrls));
                }
            }
        }
    }

    createCohesiveEffectMap(cols, rows, shaderCount) {
        const totalFaces = cols * rows;
        const effectMap = new Array(totalFaces);

        // Choose a cohesive distribution strategy
        const strategies = [
            'random',       // Completely random effect assignment
            'gradient',     // Smooth transitions between effects
            'symmetrical',  // Mirror effects across axes
            'concentric',   // Effects radiate from center
            'diagonal'      // Effects flow diagonally
        ];

        // Start with random strategy, then cycle through others
        if (!this.currentStrategyIndex) {
            this.currentStrategyIndex = 0; // Start with random
        }

        const strategy = strategies[this.currentStrategyIndex];
        console.log("strategy: ", strategy);
        // Only increment strategy index when explicitly cycling through strategies (not on window resize)
        // this.currentStrategyIndex = (this.currentStrategyIndex + 1) % strategies.length;

        // console.log(`🎨 Using ${strategy} effect distribution strategy`);

        switch (strategy) {
            case 'random':
                return this.createRandomEffects(cols, rows, shaderCount);
            case 'zonal':
                return this.createZonalEffects(cols, rows, shaderCount);
            case 'gradient':
                return this.createGradientEffects(cols, rows, shaderCount);
            case 'symmetrical':
                return this.createSymmetricalEffects(cols, rows, shaderCount);
            case 'concentric':
                return this.createConcentricEffects(cols, rows, shaderCount);
            case 'diagonal':
                return this.createDiagonalEffects(cols, rows, shaderCount);
            default:
                return this.createRandomEffects(cols, rows, shaderCount);
        }
    }

    createRandomEffects(cols, rows, shaderCount) {
        const totalFaces = cols * rows;
        const effectMap = new Array(totalFaces);

        // Better pseudo-random with multiple hash functions to prevent clustering
        const seed = cols * 1000 + rows;

        for (let i = 0; i < totalFaces; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);

            // Multiple hash functions to scramble the distribution better
            let hash = seed;
            hash = ((hash ^ (col * 73856093)) * 19349663) ^ (row * 83492791);
            hash = ((hash ^ (i * 50331653)) * 28629151) ^ ((col + row) * 97563461);
            hash = Math.abs(hash);

            // Convert to 0-1 range and pick effect
            const pseudoRandom = (hash % 982451653) / 982451653;
            effectMap[i] = Math.floor(pseudoRandom * shaderCount);
        }

        return effectMap;
    }

    createZonalEffects(cols, rows, shaderCount) {
        const totalFaces = cols * rows;
        const effectMap = new Array(totalFaces);

        // Divide screen into zones and assign effect families to each zone
        const zonesX = Math.min(3, Math.ceil(cols / 3)); // Max 3 horizontal zones
        const zonesY = Math.min(3, Math.ceil(rows / 3)); // Max 3 vertical zones

        // Create effect families (related effects grouped together)
        const effectFamilies = [
            [0, 1, 5],      // Original + High Contrast + Extreme Saturation (Intensity family)
            [0, 2, 3],      // Original + Red Hell + Ice Cold (Color isolation family)  
            [0, 4, 6]       // Original + Inversion + Glitch (Digital distortion family)
        ];

        for (let i = 0; i < totalFaces; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);

            // Determine which zone this face belongs to
            const zoneX = Math.floor(col / (cols / zonesX));
            const zoneY = Math.floor(row / (rows / zonesY));
            const zoneIndex = (zoneX + zoneY * zonesX) % effectFamilies.length;

            // Pick an effect from the zone's family (deterministic)
            const family = effectFamilies[zoneIndex];
            const seed = cols * 1000 + rows + i; // Position-based seed
            const pseudoRandom = ((seed * 9301 + 49297) % 233280) / 233280;
            const effectIndex = family[Math.floor(pseudoRandom * family.length)];
            effectMap[i] = effectIndex;
        }

        return effectMap;
    }

    createGradientEffects(cols, rows, shaderCount) {
        const totalFaces = cols * rows;
        const effectMap = new Array(totalFaces);

        // Create smooth transitions from one effect to another
        for (let i = 0; i < totalFaces; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);

            // Create a gradient based on position
            const xProgress = col / (cols - 1);
            const yProgress = row / (rows - 1);

            // Combine X and Y gradients
            const combinedProgress = (xProgress + yProgress) / 2;

            // Map to shader index with smooth transitions
            const effectIndex = Math.floor(combinedProgress * (shaderCount - 1));
            effectMap[i] = Math.min(effectIndex, shaderCount - 1);
        }

        return effectMap;
    }

    createSymmetricalEffects(cols, rows, shaderCount) {
        const totalFaces = cols * rows;
        const effectMap = new Array(totalFaces);

        // Create symmetrical patterns
        const centerX = cols / 2;
        const centerY = rows / 2;

        for (let i = 0; i < totalFaces; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);

            // Calculate distance from center
            const distanceFromCenter = Math.sqrt(
                Math.pow(col - centerX, 2) + Math.pow(row - centerY, 2)
            );

            // Map distance to effect index
            const normalizedDistance = distanceFromCenter / Math.sqrt(centerX * centerX + centerY * centerY);
            const effectIndex = Math.floor(normalizedDistance * (shaderCount - 1));
            effectMap[i] = Math.min(effectIndex, shaderCount - 1);
        }

        return effectMap;
    }

    createConcentricEffects(cols, rows, shaderCount) {
        const totalFaces = cols * rows;
        const effectMap = new Array(totalFaces);

        const centerX = (cols - 1) / 2;
        const centerY = (rows - 1) / 2;
        const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);

        for (let i = 0; i < totalFaces; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);

            // Calculate distance from center
            const radius = Math.sqrt(
                Math.pow(col - centerX, 2) + Math.pow(row - centerY, 2)
            );

            // Create concentric rings of effects
            const ringIndex = Math.floor((radius / maxRadius) * shaderCount);
            effectMap[i] = Math.min(ringIndex, shaderCount - 1);
        }

        return effectMap;
    }

    createDiagonalEffects(cols, rows, shaderCount) {
        const totalFaces = cols * rows;
        const effectMap = new Array(totalFaces);

        for (let i = 0; i < totalFaces; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);

            // Create diagonal bands
            const diagonalPosition = (col + row) % (shaderCount * 2);
            const effectIndex = Math.floor(diagonalPosition / 2);
            effectMap[i] = Math.min(effectIndex, shaderCount - 1);
        }

        return effectMap;
    }

    createPixelationShaders() {
        const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

        return [
            // Large pixels - Grayscale style
            {
                vertex: vertexShader,
                fragment: `
                uniform sampler2D uTexture;
                uniform float uIntensity;
                uniform float uReveal; // 0.0 = black, 1.0 = full effect
                uniform float uMirror;
                varying vec2 vUv;
                void main() {
                    vec2 uv = vUv;
                    if (uMirror > 0.5) {
                        uv.x = 1.0 - uv.x; // Mirror horizontally only for video
                    }
                    vec2 pixelSize = vec2(15.0, 12.0);
                    vec2 pixelUv = floor(uv * pixelSize) / pixelSize;
                    
                    vec4 color = texture2D(uTexture, pixelUv);
                    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                    
                    // Website color palette: #ddddd1 (light) to #444 (dark)
                    vec3 lightColor = vec3(0.867, 0.867, 0.820); // #ddddd1
                    vec3 darkColor = vec3(0.267, 0.267, 0.267);  // #444
                    
                    vec3 websiteColor = vec3(0.0);
                    if (gray > 0.6) {
                        websiteColor = lightColor; // Bright areas use light color
                    } else if (gray > 0.3) {
                        websiteColor = mix(darkColor, lightColor, 0.6); // Medium blend
                    } else {
                        websiteColor = darkColor; // Dark areas use dark color
                    }
                    
                    // Mix between black and the effect based on reveal
                    vec3 finalColor = mix(vec3(0.0), websiteColor, uReveal);
                    gl_FragColor = vec4(finalColor, color.a);
                }
            `
            },
            // Medium pixels - Grayscale style
            {
                vertex: vertexShader,
                fragment: `
                uniform sampler2D uTexture;
                uniform float uIntensity;
                uniform float uReveal; // 0.0 = black, 1.0 = full effect
                uniform float uMirror;
                varying vec2 vUv;
                void main() {
                    vec2 uv = vUv;
                    if (uMirror > 0.5) {
                        uv.x = 1.0 - uv.x; // Mirror horizontally only for video
                    }
                    vec2 pixelSize = vec2(25.0, 20.0);
                    vec2 pixelUv = floor(uv * pixelSize) / pixelSize;
                    
                    vec4 color = texture2D(uTexture, pixelUv);
                    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                    
                    // Website color palette: #ddddd1 (light) to #444 (dark)
                    vec3 lightColor = vec3(0.867, 0.867, 0.820); // #ddddd1
                    vec3 darkColor = vec3(0.267, 0.267, 0.267);  // #444
                    
                    vec3 websiteColor = vec3(0.0);
                    if (gray > 0.7) {
                        websiteColor = lightColor; // Brightest areas
                    } else if (gray > 0.4) {
                        websiteColor = mix(darkColor, lightColor, 0.5); // Medium blend
                    } else if (gray > 0.15) {
                        websiteColor = mix(darkColor, lightColor, 0.25); // Darker blend
                    } else {
                        websiteColor = darkColor; // Darkest areas
                    }
                    
                    // Mix between black and the effect based on reveal
                    vec3 finalColor = mix(vec3(0.0), websiteColor, uReveal);
                    gl_FragColor = vec4(finalColor, color.a);
                }
            `
            },
            // Small pixels - High res grayscale
            {
                vertex: vertexShader,
                fragment: `
                uniform sampler2D uTexture;
                uniform float uIntensity;
                uniform float uReveal; // 0.0 = black, 1.0 = full effect
                uniform float uMirror;
                varying vec2 vUv;
                void main() {
                    vec2 uv = vUv;
                    if (uMirror > 0.5) {
                        uv.x = 1.0 - uv.x; // Mirror horizontally only for video
                    }
                    vec2 pixelSize = vec2(40.0, 30.0);
                    vec2 pixelUv = floor(uv * pixelSize) / pixelSize;
                    
                    vec4 color = texture2D(uTexture, pixelUv);
                    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                    
                    // Website color palette: #ddddd1 (light) to #444 (dark)
                    vec3 lightColor = vec3(0.867, 0.867, 0.820); // #ddddd1
                    vec3 darkColor = vec3(0.267, 0.267, 0.267);  // #444
                    
                    vec3 websiteColor = vec3(0.0);
                    if (gray > 0.6) {
                        websiteColor = mix(darkColor, lightColor, 0.85); // Bright blend
                    } else if (gray > 0.3) {
                        websiteColor = mix(darkColor, lightColor, 0.45); // Medium blend
                    } else {
                        websiteColor = mix(darkColor, lightColor, 0.1); // Dark blend
                    }
                    
                    // Mix between black and the effect based on reveal
                    vec3 finalColor = mix(vec3(0.0), websiteColor, uReveal);
                    gl_FragColor = vec4(finalColor, color.a);
                }
            `
            },
            // Massive pixels - Super chunky grayscale
            {
                vertex: vertexShader,
                fragment: `
                uniform sampler2D uTexture;
                uniform float uIntensity;
                uniform float uReveal; // 0.0 = black, 1.0 = full effect
                uniform float uMirror;
                varying vec2 vUv;
                void main() {
                    vec2 uv = vUv;
                    if (uMirror > 0.5) {
                        uv.x = 1.0 - uv.x; // Mirror horizontally only for video
                    }
                    vec2 pixelSize = vec2(8.0, 6.0);
                    vec2 pixelUv = floor(uv * pixelSize) / pixelSize;
                    
                    vec4 color = texture2D(uTexture, pixelUv);
                    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                    
                    // Website color palette: #ddddd1 (light) to #444 (dark)
                    vec3 lightColor = vec3(0.867, 0.867, 0.820); // #ddddd1
                    vec3 darkColor = vec3(0.267, 0.267, 0.267);  // #444
                    
                    vec3 websiteColor = vec3(0.0);
                    if (gray > 0.5) {
                        websiteColor = mix(darkColor, lightColor, 0.8); // Bright blend
                    } else if (gray > 0.25) {
                        websiteColor = mix(darkColor, lightColor, 0.4); // Medium blend
                    } else {
                        websiteColor = darkColor; // Pure dark color
                    }
                    
                    // Mix between black and the effect based on reveal
                    vec3 finalColor = mix(vec3(0.0), websiteColor, uReveal);
                    gl_FragColor = vec4(finalColor, color.a);
                }
            `
            },
            // Square pixels - Grayscale style
            {
                vertex: vertexShader,
                fragment: `
                uniform sampler2D uTexture;
                uniform float uIntensity;
                uniform float uReveal; // 0.0 = black, 1.0 = full effect
                uniform float uMirror;
                varying vec2 vUv;
                void main() {
                    vec2 uv = vUv;
                    if (uMirror > 0.5) {
                        uv.x = 1.0 - uv.x; // Mirror horizontally only for video
                    }
                    vec2 pixelSize = vec2(20.0, 20.0); // Perfect squares
                    vec2 pixelUv = floor(uv * pixelSize) / pixelSize;
                    
                    vec4 color = texture2D(uTexture, pixelUv);
                    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                    
                    // Website color palette: #ddddd1 (light) to #444 (dark)
                    vec3 lightColor = vec3(0.867, 0.867, 0.820); // #ddddd1
                    vec3 darkColor = vec3(0.267, 0.267, 0.267);  // #444
                    
                    vec3 websiteColor = vec3(0.0);
                    if (gray > 0.6) {
                        websiteColor = mix(darkColor, lightColor, 0.75); // Bright blend
                    } else if (gray > 0.3) {
                        websiteColor = mix(darkColor, lightColor, 0.35); // Medium blend
                    } else {
                        websiteColor = mix(darkColor, lightColor, 0.02); // Almost pure dark
                    }
                    
                    // Mix between black and the effect based on reveal
                    vec3 finalColor = mix(vec3(0.0), websiteColor, uReveal);
                    gl_FragColor = vec4(finalColor, color.a);
                }
            `
            }
        ];
    }

    startEntranceAnimation(fastMode = false) {
        // Allow entrance animation in ALL modes now, not just pixelation
        // console.log('🎬 Starting entrance animation with smooth transitions...');
        this.isEntranceAnimating = true;
        this.revealedPanels = new Map(); // Store panel index and animation start time
        this.lastRevealTime = Date.now();

        // Set timing based on mode - much faster for non-pixelation modes
        if (fastMode || !this.isPixelationMode) {
            this.currentEntranceSpeed = 15; // 15ms between reveals (very fast)
            this.currentRevealDuration = 300; // 300ms transition duration (fast)
            // console.log('⚡ Using FAST entrance animation (1-2 seconds total)');
        } else {
            this.currentEntranceSpeed = this.entranceAnimationSpeed; // 80ms (original)
            this.currentRevealDuration = 800; // 800ms (original)
            // console.log('🐌 Using SLOW entrance animation (pixelation mode)');
        }

        // Reset all panels to black (reveal = 0.0) - works for ALL materials now
        this.facePlanes.forEach((faceData, index) => {
            if (!faceData.isTextPanel) {
                // Video panels - check all possible materials
                if (faceData.pixelationMaterial && faceData.pixelationMaterial.uniforms.uReveal) {
                    faceData.pixelationMaterial.uniforms.uReveal.value = 0.0;
                }
                if (faceData.effectMaterial && faceData.effectMaterial.uniforms.uReveal) {
                    faceData.effectMaterial.uniforms.uReveal.value = 0.0;
                }
                if (faceData.plainMaterial && faceData.plainMaterial.uniforms.uReveal) {
                    faceData.plainMaterial.uniforms.uReveal.value = 0.0;
                }
                if (faceData.zoomMaterial && faceData.zoomMaterial.uniforms.uReveal) {
                    faceData.zoomMaterial.uniforms.uReveal.value = 0.0;
                }

                // For materials without uReveal, temporarily hide the mesh
                if (!this.materialHasReveal(faceData.mesh.material)) {
                    faceData.mesh.material.opacity = 0.0;
                    faceData.mesh.material.transparent = true;
                    faceData._needsOpacityAnimation = true;
                }
            } else if (faceData.isTextPanel && faceData.textMaterial && faceData.textMaterial.uniforms.uReveal) {
                // Text panels
                faceData.textMaterial.uniforms.uReveal.value = 0.0;
            }

            // Character overlay opacity
            if (faceData.overlayPlane && faceData.isCharacterPanel) {
                faceData.overlayPlane.material.opacity = 0.0;
            }
        });
    }

    // Helper function to check if a material has uReveal uniform
    materialHasReveal(material) {
        return material && material.uniforms && material.uniforms.uReveal;
    }

    updateEntranceAnimation() {
        if (!this.isEntranceAnimating) return;

        const currentTime = Date.now();

        // Get indices of ALL panels (both video and text) in the main facePlanes array
        const allPanelIndices = [];
        this.facePlanes.forEach((face, index) => {
            allPanelIndices.push(index);
        });

        // Check if it's time to start revealing a new panel
        if (currentTime - this.lastRevealTime > this.currentEntranceSpeed) {
            if (this.revealedPanels.size < allPanelIndices.length) {
                // Find a random unrevealed panel index
                let randomPanelIndex;
                let attempts = 0;
                do {
                    randomPanelIndex = allPanelIndices[Math.floor(Math.random() * allPanelIndices.length)];
                    attempts++;
                } while (this.revealedPanels.has(randomPanelIndex) && attempts < 100);

                if (!this.revealedPanels.has(randomPanelIndex)) {
                    // Start revealing this panel
                    this.revealedPanels.set(randomPanelIndex, currentTime);
                    this.lastRevealTime = currentTime;
                    const faceData = this.facePlanes[randomPanelIndex];
                    const panelType = faceData.isTextPanel ? 'text' : 'video';
                    // // console.log(`🔲 Starting reveal of ${panelType} panel ${this.revealedPanels.size}/${allPanelIndices.length}`);
                }
            }
        }

        // Update all panels that are currently animating
        this.revealedPanels.forEach((startTime, panelIndex) => {
            const faceData = this.facePlanes[panelIndex];
            if (faceData) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / this.currentRevealDuration, 1.0);

                // Ease-in-out cubic easing function
                const easedProgress = progress < 0.5
                    ? 4 * progress * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;

                // Update the appropriate material based on panel type
                if (!faceData.isTextPanel) {
                    // Video panels - update any material that has uReveal
                    if (faceData.pixelationMaterial && faceData.pixelationMaterial.uniforms.uReveal) {
                        faceData.pixelationMaterial.uniforms.uReveal.value = easedProgress;
                    }
                    if (faceData.effectMaterial && faceData.effectMaterial.uniforms.uReveal) {
                        faceData.effectMaterial.uniforms.uReveal.value = easedProgress;
                    }
                    if (faceData.plainMaterial && faceData.plainMaterial.uniforms.uReveal) {
                        faceData.plainMaterial.uniforms.uReveal.value = easedProgress;
                    }
                    if (faceData.zoomMaterial && faceData.zoomMaterial.uniforms.uReveal) {
                        faceData.zoomMaterial.uniforms.uReveal.value = easedProgress;
                    }

                    // For materials without uReveal, animate opacity
                    if (faceData._needsOpacityAnimation) {
                        faceData.mesh.material.opacity = easedProgress;
                    }
                } else if (faceData.isTextPanel && faceData.textMaterial && faceData.textMaterial.uniforms.uReveal) {
                    // Text panels
                    faceData.textMaterial.uniforms.uReveal.value = easedProgress;
                }

                // Also update character overlay opacity if it exists
                if (faceData.overlayPlane && faceData.isCharacterPanel) {
                    faceData.overlayPlane.material.opacity = easedProgress * 0.95;
                }
            }
        });

        // Check if animation is complete
        const allFullyRevealed = Array.from(this.revealedPanels.values()).every(startTime =>
            currentTime - startTime >= this.currentRevealDuration
        );

        if (this.revealedPanels.size === allPanelIndices.length && allFullyRevealed) {
            this.isEntranceAnimating = false;

            // Clean up animation flags and ensure all panels are fully visible
            this.facePlanes.forEach((faceData) => {
                if (faceData._needsOpacityAnimation) {
                    faceData.mesh.material.opacity = 1.0;
                    faceData._needsOpacityAnimation = false;
                }
            });

            const mode = this.isPixelationMode ? 'pixelation' :
                this.isDelayMode ? 'delay' :
                    this.isZoomMode ? 'zoom' :
                        this.isPrimitiveMode ? 'primitive' : 'effects';
            // console.log(`✅ Entrance animation complete for ${mode} mode!`);
        }
    }

    createCharacterTexture(character, width, height, style = 'headline') {
        // Check cache first
        const cacheKey = `char_${character}_${width}_${height}_${style}`;
        if (this.overlayTextCache.has(cacheKey)) {
            return this.overlayTextCache.get(cacheKey);
        }

        // Get device pixel ratio for high-DPI support
        const pixelRatio = window.devicePixelRatio || 1;

        const canvas = document.createElement('canvas');
        canvas.width = width * pixelRatio;
        canvas.height = height * pixelRatio;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        const ctx = canvas.getContext('2d');
        ctx.scale(pixelRatio, pixelRatio);

        // Clear canvas (transparent background - no background color!)
        ctx.clearRect(0, 0, width, height);

        // Configure styling for Hebrew characters
        let fontSize, fontFamily, textColor, strokeColor, strokeWidth;

        switch (style) {
            case 'headline':
                fontSize = Math.min(width, height) * 1; // Even bigger - almost completely fill panel
                fontFamily = this.fontsLoaded ? this.fontConfig.headline.name : 'Arial Black, Arial, sans-serif';
                textColor = '#222'; // characters color
                strokeColor = '#000000';
                strokeWidth = 0; // Thicker stroke for better visibility over video
                break;
            case 'highlight':
                fontSize = Math.min(width, height) * 0.85; // Even larger for highlights
                fontFamily = this.fontsLoaded ? this.fontConfig.title.name : 'Arial, sans-serif';
                textColor = '#c225a5'; // Pink accent
                strokeColor = '#ffffff';
                strokeWidth = 4; // Very thick stroke for contrast
                break;
            case 'minimal':
                fontSize = Math.min(width, height) * 0.75; // Large but slightly smaller
                fontFamily = this.fontsLoaded ? this.fontConfig.author.name : 'Arial, sans-serif';
                textColor = '#ffffff';
                strokeColor = '#000000';
                strokeWidth = 2;
                break;
            default:
                fontSize = Math.min(width, height) * 0.8;
                fontFamily = 'Arial, sans-serif';
                textColor = '#ffffff';
                strokeColor = '#000000';
                strokeWidth = 3;
        }

        // Configure text rendering
        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const x = width / 2;
        const y = height / 1.8;

        // Draw character with thick stroke for visibility over video
        // if (strokeWidth > 0 && strokeColor) {
        //     ctx.strokeStyle = strokeColor;
        //     ctx.lineWidth = strokeWidth;
        //     ctx.strokeText(character, x, y);
        // }

        ctx.fillStyle = textColor;
        ctx.fillText(character, x, y);

        // Create texture
        const texture = new THREE.CanvasTexture(canvas);
        texture.transparent = true; // Enable transparency
        texture.needsUpdate = true;

        // Cache the texture
        this.overlayTextCache.set(cacheKey, texture);

        return texture;
    }

    splitHebrewText(text) {
        // Split Hebrew text into individual characters
        // Don't reverse here - we'll handle RTL in the positioning logic
        const characters = [...text]; // This properly handles Hebrew characters
        return characters; // Return in natural order, positioning will handle RTL
    }

    generateScatteredCharacterPositions(characters, cols, rows, totalPanels, textPanelMap, forceNoGaps = false) {
        const positions = [];
        const usedColumns = new Set(); // Track used columns to avoid conflicts
        const totalCharacters = characters.length;

        // console.log(`🎲 Generating scattered positions for ${totalCharacters} characters in ${cols}x${rows} grid...`);

        // Get all text panel positions to avoid them completely
        const textPanelPositions = new Set();

        // Use the ACTUAL text panel positions from textPanelMap
        if (textPanelMap) {
            for (let [panelIndex, textPanel] of textPanelMap) {
                textPanelPositions.add(panelIndex);
            }
        }

        // Also avoid bottom-left reserved panel
        const bottomLeftIndex = (rows - 1) * cols;
        textPanelPositions.add(bottomLeftIndex);

        // console.log(`🚫 Avoiding ${textPanelPositions.size} actual text panel positions:`, Array.from(textPanelPositions).sort((a,b) => a-b));

        // Create a sequence of available columns for Hebrew RTL flow
        // Start from right (highest column) and work left
        const availableColumns = [];
        for (let col = cols - 1; col >= 0; col--) {
            // Check if this column has any video panels available
            let hasVideoPanel = false;
            for (let row = 0; row < rows - 1; row++) { // Exclude last row
                const panelIndex = row * cols + col;
                if (!textPanelPositions.has(panelIndex) && panelIndex < totalPanels) {
                    hasVideoPanel = true;
                    break;
                }
            }
            if (hasVideoPanel) {
                availableColumns.push(col);
            }
        }

        // console.log(`📊 Available columns for characters (RTL): [${availableColumns.join(', ')}]`);

        // Ensure we have enough columns for all characters
        if (availableColumns.length < totalCharacters) {
            console.warn(`⚠️ Only ${availableColumns.length} columns available for ${totalCharacters} characters!`);
        }

        // Check if gaps will cause overflow - if so, disable gaps
        let finalGapProbability = forceNoGaps ? 0 : this.characterGapProbability;
        if (!forceNoGaps && this.characterGapProbability > 0) {
            // Estimate potential positions needed with gaps
            const estimatedPositionsNeeded = totalCharacters + Math.floor(totalCharacters * this.characterGapProbability * 1.5);
            if (estimatedPositionsNeeded > availableColumns.length) {
                // console.log(`⚠️ Potential overflow detected (need ~${estimatedPositionsNeeded}, have ${availableColumns.length}) - disabling gaps for this word`);
                finalGapProbability = 0;
            }
        }

        if (forceNoGaps) {
            // console.log(`🔄 Restarting positioning without gaps to maintain RTL flow...`);
        }

        // Place characters in Hebrew RTL order with scattered rows and optional gaps
        let currentColumnIndex = 0;

        for (let charIndex = 0; charIndex < totalCharacters; charIndex++) {
            const character = characters[charIndex];
            let position = null;

            // Add random gaps between characters (only if no overflow risk)
            if (charIndex > 0 && Math.random() < finalGapProbability) {
                const gapsToSkip = Math.floor(Math.random() * 2) + 1; // Skip 1-2 columns
                currentColumnIndex += gapsToSkip;
                // console.log(`💨 Adding ${gapsToSkip} column gap(s) before "${character}"`);
            }

            // Get the target column (simple sequential with proper bounds checking)
            let targetCol;
            if (currentColumnIndex >= availableColumns.length) {
                if (!forceNoGaps) {
                    // If we exceed available columns, restart without gaps
                    // console.log(`🔄 Column overflow detected - restarting without gaps...`);
                    return this.generateScatteredCharacterPositions(characters, cols, rows, totalPanels, textPanelMap, true);
                } else {
                    // Already trying without gaps and still overflow - use modulo positioning
                    // console.log(`⚠️ Overflow even without gaps - using modulo positioning`);
                    targetCol = availableColumns[charIndex % availableColumns.length];
                }
            } else {
                targetCol = availableColumns[currentColumnIndex];
                currentColumnIndex++;
            }

            // Find available rows in this column
            const availableRows = [];
            for (let row = 0; row < rows - 1; row++) { // Exclude last row
                const panelIndex = row * cols + targetCol;
                if (!textPanelPositions.has(panelIndex) && panelIndex < totalPanels) {
                    availableRows.push(row);
                }
            }

            if (availableRows.length > 0) {
                // Choose a random row from available ones
                const chosenRow = availableRows[Math.floor(Math.random() * availableRows.length)];
                const panelIndex = chosenRow * cols + targetCol;

                position = {
                    character: character,
                    index: charIndex,
                    row: chosenRow,
                    col: targetCol,
                    panelIndex: panelIndex,
                    char: character // For debugging
                };

                usedColumns.add(targetCol);
                positions.push(position);
                // // console.log(`📝 Placed "${character}" (${charIndex + 1}/${totalCharacters}) at col ${targetCol}, row ${chosenRow} (panel ${panelIndex}) [column index: ${currentColumnIndex - 1}]`);
            } else {
                console.warn(`⚠️ No available rows in column ${targetCol} for character "${character}"`);

                // Fallback: find ANY available video panel
                let fallbackFound = false;
                for (let row = 0; row < rows - 1 && !fallbackFound; row++) {
                    for (let col = 0; col < cols && !fallbackFound; col++) {
                        const panelIndex = row * cols + col;

                        if (!textPanelPositions.has(panelIndex) &&
                            !usedColumns.has(col) &&
                            panelIndex < totalPanels) {

                            position = {
                                character: character,
                                index: charIndex,
                                row: row,
                                col: col,
                                panelIndex: panelIndex,
                                char: character
                            };

                            usedColumns.add(col);
                            positions.push(position);
                            // console.log(`✅ Fallback: "${character}" placed at col ${col}, row ${row}`);
                            fallbackFound = true;
                        }
                    }
                }

                if (!fallbackFound) {
                    console.error(`❌ Could not place character "${character}" anywhere!`);
                }
            }
        }

        // console.log(`✅ Generated ${positions.length}/${totalCharacters} scattered positions with Hebrew RTL flow`);
        // console.log(`📊 Used columns: [${Array.from(usedColumns).sort((a,b) => b-a).join(', ')}]`);
        return positions;
    }

    setCurrentHeadline(headline) {
        this.currentHeadline = headline;
        // Reset scattered positions when headline changes
        this.scatteredCharacterPositions = null;
        // console.log(`📝 Setting headline: ${headline}`);

        if (this.isRunning && this.videoTexture) {
            // Recreate face planes with new headline
            this.createFacePlanes();
        }
    }

    // Function to regenerate scattered character positions (for testing/variety)
    rescatterCharacters() {
        if (!this.currentHeadline || !this.enableCharacterDisplay) {
            // console.log('❌ No headline set or character display disabled');
            return;
        }

        // Force regeneration by clearing cached positions
        this.scatteredCharacterPositions = null;
        // console.log('🎲 Regenerating scattered character positions...');

        if (this.isRunning && this.videoTexture) {
            // Recreate face planes with new scattered positions
            this.createFacePlanes();
        }
    }

    // Function to toggle character gap probability
    toggleCharacterGaps() {
        if (!this.enableCharacterDisplay) {
            // console.log('❌ Character display disabled');
            return;
        }

        // Cycle through gap probabilities: 0% → 30% → 60% → 0%
        if (this.characterGapProbability === 0) {
            this.characterGapProbability = 0.3; // 30%
        } else if (this.characterGapProbability === 0.3) {
            this.characterGapProbability = 0.6; // 60%
        } else {
            this.characterGapProbability = 0; // 0% (no gaps)
        }

        const percentage = Math.round(this.characterGapProbability * 100);
        // console.log(`💨 Character gap probability set to ${percentage}%`);

        // Force regeneration with new gap setting
        this.scatteredCharacterPositions = null;

        if (this.isRunning && this.videoTexture) {
            this.createFacePlanes();
        }
    }

    logCurrentState() {
        const currentMode = this.getCurrentModeKey();
        const strategies = ['random', 'zonal', 'gradient', 'symmetrical', 'concentric', 'diagonal'];
        const currentStrategy = this.currentStrategyIndex !== undefined ?
            strategies[this.currentStrategyIndex] : 'random (default)';

        console.log(`🔍 DEBUG STATE: Mode = "${currentMode}", Effect Strategy = "${currentStrategy}" (index: ${this.currentStrategyIndex || 0})`);
    }

    // Test function for the 3x3 system
    test3x3System() {
        if (!this.isRunning || !this.facePlanes.length) {
            // console.log('❌ Camera not running or no face planes available');
            return;
        }

        // Find a random text panel
        const textPanels = this.facePlanes.filter(face => face.isTextPanel);
        if (textPanels.length === 0) {
            // console.log('❌ No text panels available for testing');
            return;
        }

        const randomTextPanel = textPanels[Math.floor(Math.random() * textPanels.length)];
        const testIndex = this.facePlanes.indexOf(randomTextPanel);

        // console.log(`🧪 Testing 3x3 system on panel ${testIndex}`);

        // Clean up any existing overlay
        if (this.hoveredArea) {
            this.hide3x3Overlay();
        }

        // Show 3x3 overlay
        const gridInfo = this.calculate3x3Grid(testIndex);
        if (gridInfo) {
            const articleInfo = this.getArticleInfoFromPanel(randomTextPanel);
            this.show3x3Overlay(gridInfo, articleInfo);
            // console.log('✅ 3x3 test overlay shown! Move mouse to clear it.');
            // console.log('📄 Article:', articleInfo?.title);
        } else {
            // console.log('❌ Failed to calculate grid info');
        }
    }
}

// Initialize the application  
// Initialize the display and make it globally accessible
const display = new MultiFaceDisplay();
window.multiFaceDisplay = display;

// Add click event listener to the document
document.addEventListener('click', (event) => display.onTextPanelClick(event));

// Auto-start camera if user came from navbar (has URL parameters)
function autoStartFromNavbar() {
    const urlParams = new URLSearchParams(window.location.search);
    const hasMode = urlParams.has('mode');
    const hasNav = urlParams.has('nav');

    // Pixelation mode is already the default from constructor
    // console.log('🔲 Starting with Pixelation Mode (default)...');

    if (hasMode || hasNav) {
        // console.log('🔗 User came from navbar, auto-starting camera...');
        // Start immediately - no delay
        if (!display.isRunning) {
            display.startCamera().catch(error => {
                console.log('📹 Camera failed to start, but system is still running with fallback mode');
            });
        }
    } else {
        // Even for direct visits, auto-start with pixelation mode
        // console.log('🔲 Direct visit - auto-starting with Pixelation Mode...');
        if (!display.isRunning) {
            display.startCamera().catch(error => {
                console.log('📹 Camera failed to start, but system is still running with fallback mode');
            });
        }
    }
}

// Run auto-start check when page loads
document.addEventListener('DOMContentLoaded', autoStartFromNavbar);

// Navbar is now handled by navbar.js