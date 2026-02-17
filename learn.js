/* ============================================================
   learn.js — SkillForge Course Learning Dashboard
   Now loads data from the backend API
   ============================================================ */

/* ===== FALLBACK COURSE DATA (used when API is unavailable) ===== */
const FALLBACK_COURSE = {
    id: 'demo',
    title: 'The Complete Web Developer Bootcamp 2026',
    instructor: 'Dr. Angela Yu',
    skills: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'Express', 'REST APIs', 'Git', 'Deployment'],
    modules: [
        {
            title: 'Getting Started', lessons: [
                { title: 'Welcome & Course Overview', type: 'video', duration: '12:34', description: 'In this lesson, you\'ll get a complete overview of everything covered in this course.' },
                { title: 'How the Internet Works', type: 'video', duration: '18:22', description: 'Understand the fundamentals of how the internet works.' },
                { title: 'Setting Up Your Dev Environment', type: 'video', duration: '15:48', description: 'Install and configure VS Code, Node.js, Git, and Chrome DevTools.' },
                { title: 'Course Resources & Community', type: 'reading', duration: '5 min', description: 'Access all course resources and join the community.' },
            ]
        },
        {
            title: 'HTML5 Fundamentals', lessons: [
                { title: 'Introduction to HTML', type: 'video', duration: '22:15', description: 'Learn the basics of HTML — tags, elements, attributes.' },
                { title: 'HTML Document Structure', type: 'video', duration: '14:33', description: 'Understand the HTML document structure.' },
                { title: 'Text Elements & Forms', type: 'video', duration: '28:17', description: 'Master headings, paragraphs, lists, links, and forms.' },
                { title: 'Semantic HTML & Accessibility', type: 'video', duration: '19:45', description: 'Write semantic HTML and follow accessibility best practices.' },
                { title: 'HTML Quiz', type: 'quiz', duration: '10 min', description: 'Test your knowledge of HTML5 fundamentals.' },
                { title: 'Project: Build Your First Web Page', type: 'exercise', duration: '30 min', description: 'Build a personal profile page from scratch.' },
            ]
        },
        {
            title: 'CSS3 & Modern Styling', lessons: [
                { title: 'Introduction to CSS', type: 'video', duration: '20:10', description: 'Learn what CSS is and understand selectors, properties, and values.' },
                { title: 'The Box Model & Layout', type: 'video', duration: '24:38', description: 'Master the CSS box model — margin, padding, border, content.' },
                { title: 'Flexbox Deep Dive', type: 'video', duration: '32:22', description: 'A complete guide to CSS Flexbox.' },
                { title: 'CSS Grid Mastery', type: 'video', duration: '28:55', description: 'Master CSS Grid for complex layouts.' },
                { title: 'Animations & Transitions', type: 'video', duration: '18:40', description: 'Add life to your websites with CSS animations.' },
                { title: 'Responsive Design & Media Queries', type: 'video', duration: '22:15', description: 'Build responsive websites.' },
                { title: 'CSS Quiz', type: 'quiz', duration: '15 min', description: 'Test your CSS skills.' },
                { title: 'Project: Landing Page Clone', type: 'exercise', duration: '45 min', description: 'Clone a professional landing page.' },
            ]
        },
        {
            title: 'JavaScript Essentials', lessons: [
                { title: 'Introduction to JavaScript', type: 'video', duration: '16:30', description: 'Learn the fundamentals of JavaScript.' },
                { title: 'Functions & Scope', type: 'video', duration: '25:18', description: 'Understand functions, scope, closures, and arrow functions.' },
                { title: 'Arrays & Objects', type: 'video', duration: '30:45', description: 'Work with arrays and objects.' },
                { title: 'DOM Manipulation', type: 'video', duration: '35:12', description: 'Learn to manipulate the DOM.' },
                { title: 'Async JavaScript & APIs', type: 'video', duration: '28:55', description: 'Master promises, async/await, and fetch API.' },
                { title: 'JavaScript Quiz', type: 'quiz', duration: '20 min', description: 'JavaScript coding challenges.' },
                { title: 'Project: Interactive App', type: 'exercise', duration: '60 min', description: 'Build a fully interactive web application.' },
            ]
        },
        {
            title: 'React & Modern Frontend', lessons: [
                { title: 'What is React?', type: 'video', duration: '14:20', description: 'Understand React, virtual DOM, and components.' },
                { title: 'Components & JSX', type: 'video', duration: '22:48', description: 'Create React components using JSX.' },
                { title: 'State & Hooks', type: 'video', duration: '34:15', description: 'Master useState, useEffect, useRef, and custom hooks.' },
                { title: 'React Router & Navigation', type: 'video', duration: '20:30', description: 'Add client-side routing with React Router.' },
                { title: 'Project: React Dashboard', type: 'exercise', duration: '90 min', description: 'Build a complete React dashboard.' },
            ]
        },
        {
            title: 'Backend with Node.js', lessons: [
                { title: 'Introduction to Node.js', type: 'video', duration: '18:45', description: 'Learn what Node.js is and set up your first server.' },
                { title: 'Express.js Framework', type: 'video', duration: '26:30', description: 'Build RESTful APIs with Express.js.' },
                { title: 'MongoDB & Mongoose', type: 'video', duration: '32:20', description: 'Work with MongoDB using Mongoose.' },
                { title: 'Authentication & Security', type: 'video', duration: '28:55', description: 'Implement JWT auth and security best practices.' },
                { title: 'Final Project: Full-Stack App', type: 'exercise', duration: '120 min', description: 'Build and deploy a complete full-stack app.' },
            ]
        }
    ],
    resources: [
        { title: 'Course Slides — Complete Deck', type: 'pdf', url: '' },
        { title: 'HTML Cheat Sheet', type: 'pdf', url: '' },
        { title: 'CSS Flexbox & Grid Reference', type: 'pdf', url: '' },
        { title: 'JavaScript ES6+ Quick Guide', type: 'pdf', url: '' },
        { title: 'Starter Code — All Projects', type: 'zip', url: '' },
        { title: 'Final Project Source Code', type: 'code', url: '' },
    ]
};

/* ===== TRANSCRIPT DATA ===== */
function generateTranscript(lessonTitle) {
    const transcripts = {
        'Welcome & Course Overview': [
            { time: '0:00', text: 'Welcome to The Complete Web Developer Bootcamp 2026. I\'m Dr. Angela Yu, and I\'m thrilled to have you here.' },
            { time: '0:15', text: 'This course is designed to take you from absolute beginner to a professional full-stack web developer.' },
            { time: '0:32', text: 'We\'ll cover everything — HTML, CSS, JavaScript, React, Node.js, MongoDB, and more.' },
            { time: '0:48', text: 'By the end of this course, you\'ll have built over 10 real-world projects for your portfolio.' },
            { time: '1:05', text: 'Let me walk you through what each module covers.' },
            { time: '1:22', text: 'Module 1 is all about getting started — setting up VS Code, Node.js, and Git.' },
            { time: '1:45', text: 'Module 2 dives into HTML5 fundamentals — tags, elements, forms, and semantic HTML.' },
            { time: '2:08', text: 'Module 3 covers CSS3 and modern styling — Flexbox, Grid, animations, and responsive design.' },
            { time: '2:30', text: 'Module 4: JavaScript Essentials — functions, DOM manipulation, and async programming.' },
            { time: '2:55', text: 'Module 5: React — components, hooks, and routing.' },
            { time: '3:18', text: 'Module 6: Node.js, Express, MongoDB, and deployment.' },
            { time: '3:40', text: 'Each module ends with a hands-on project to reinforce what you\'ve learned.' },
            { time: '3:58', text: 'Don\'t worry if you have zero coding experience. This course starts from the very beginning.' },
            { time: '4:15', text: 'I recommend watching at 1x speed first, then 1.5x or 2x for review.' },
            { time: '4:35', text: 'Take advantage of the notes feature — it\'s a great way to retain information.' },
            { time: '4:52', text: 'If you get stuck, post in the Q&A section. I personally answer questions every day.' },
            { time: '5:10', text: 'You also have downloadable resources — cheat sheets, starter code, and reference guides.' },
            { time: '5:30', text: 'I\'ve also created a student community for connecting with other learners.' },
            { time: '5:48', text: 'Try to code along with every lesson. Muscle memory is key to learning programming.' },
            { time: '6:05', text: 'Alright, let\'s get started! In the next lesson, we\'ll learn how the internet works.' },
        ],
        default: [
            { time: '0:00', text: `Welcome to this lesson on "${lessonTitle}". Let's dive right in.` },
            { time: '0:18', text: 'Before we start, let me explain the key concepts we\'ll cover today.' },
            { time: '0:40', text: 'This is an important topic in web development, so pay close attention.' },
            { time: '1:05', text: 'Let\'s open our code editor and build together step by step.' },
            { time: '1:30', text: 'First, the basic syntax, then we\'ll build something practical with it.' },
            { time: '2:00', text: 'Notice how we structure this — clean, readable code is essential.' },
            { time: '2:35', text: 'Here\'s a common mistake beginners make. Let me show you how to avoid it.' },
            { time: '3:10', text: 'This pattern is used constantly in real-world development.' },
            { time: '3:45', text: 'Let me add some comments. Always document your code.' },
            { time: '4:20', text: 'Now let\'s test what we\'ve built. Open your browser to see the result.' },
            { time: '4:55', text: 'Everything works. Let\'s move on to a more advanced example.' },
            { time: '5:30', text: 'Try modifying this code on your own. Experimentation is the best teacher.' },
            { time: '6:00', text: 'That wraps up this lesson. In the next one, we\'ll take things further.' },
        ]
    };
    return transcripts[lessonTitle] || transcripts.default;
}

/* ===== Q&A DATA ===== */
const QNA_DATA = [
    {
        id: 1, author: 'Alex Chen', initials: 'AC', color: 'linear-gradient(135deg,#7c3aed,#2563eb)',
        title: 'How do I set up hot reloading in VS Code?',
        body: 'I followed the setup instructions but my browser doesn\'t automatically refresh when I save changes.',
        lesson: 0, time: '2 hours ago', upvotes: 12,
        reply: { author: 'Dr. Angela Yu', text: 'Install the Live Server extension. Right-click your HTML file and select "Open with Live Server" to enable auto-reload.' }
    },
    {
        id: 2, author: 'Priya Sharma', initials: 'PS', color: 'linear-gradient(135deg,#ec4899,#8b5cf6)',
        title: 'Difference between let, const, and var?',
        body: 'When should I use let vs const vs var?',
        lesson: 0, time: '5 hours ago', upvotes: 28,
        reply: { author: 'Dr. Angela Yu', text: 'Use const for values that won\'t change, let for values that will change, and avoid var entirely.' }
    },
    {
        id: 3, author: 'James Wilson', initials: 'JW', color: 'linear-gradient(135deg,#f59e0b,#ef4444)',
        title: 'CORS error when fetching API data',
        body: 'Getting a CORS error when trying to fetch from an external API. How do I fix this?',
        lesson: 0, time: '1 day ago', upvotes: 45,
        reply: { author: 'Dr. Angela Yu', text: 'Use a proxy during development or configure your backend with proper CORS headers. In production, your server should handle this.' }
    },
    {
        id: 4, author: 'Maria Garcia', initials: 'MG', color: 'linear-gradient(135deg,#10b981,#3b82f6)',
        title: 'Can I use this course for job interviews?',
        body: 'Will this course prepare me for junior developer technical interviews?',
        lesson: 0, time: '3 days ago', upvotes: 67,
        reply: { author: 'Dr. Angela Yu', text: 'Absolutely! Build all the projects and understand the concepts deeply. Supplement with LeetCode for data structures.' }
    }
];

/* ===== ANNOUNCEMENTS DATA ===== */
const ANNOUNCEMENTS = [
    {
        author: 'Dr. Angela Yu', initials: 'AY', date: 'Feb 14, 2026',
        title: '🎉 New Module Added: AI Integration with Web Apps',
        body: 'I\'ve just added a bonus module on integrating AI APIs (OpenAI, Gemini) into your web applications.'
    },
    {
        author: 'Dr. Angela Yu', initials: 'AY', date: 'Feb 10, 2026',
        title: '🔧 Updated: Node.js Section for v22 LTS',
        body: 'The Node.js section has been fully updated to reflect the latest v22 LTS changes.'
    },
    {
        author: 'Dr. Angela Yu', initials: 'AY', date: 'Feb 5, 2026',
        title: '📢 Live Q&A Session This Saturday',
        body: 'I\'ll be hosting a live Q&A session this Saturday at 2 PM EST. Link will be shared in the community.'
    },
    {
        author: 'Dr. Angela Yu', initials: 'AY', date: 'Jan 28, 2026',
        title: '✅ New Practice Exercises Added',
        body: 'I\'ve added 15 new practice exercises across all modules.'
    }
];


/* ============================
   APP STATE
   ============================ */
let COURSE = null; // Will be populated from API or fallback
let RESOURCES = [];
let currentLesson = null;
let currentModuleIndex = 0;
let currentLessonIndex = 0;
let lessonNotes = {};
let simulatedTime = 0;
let simulatedDuration = 754;
let isPlaying = false;
let playInterval = null;
let playbackSpeed = 1;

/* ============================
   INITIALIZATION
   ============================ */
document.addEventListener('DOMContentLoaded', async () => {
    await loadCourseData();
    loadProgress();
    renderCurriculum();
    renderResources();
    renderQnA();
    renderAnnouncements();
    selectLesson(0, 0);
    initTabs();
    initVideoControls();
    initNotes();
    initQnAForm();
    initSidebar();
    updateOverallProgress();
});

/**
 * Load course data from API, falling back to hardcoded data
 */
async function loadCourseData() {
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get('id');

    if (courseId) {
        try {
            // Fetch course metadata and content in parallel
            const [courseData, contentData] = await Promise.all([
                api.getCourse(courseId),
                api.getContent(courseId)
            ]);

            // Build the COURSE object from API data
            const instructor = courseData.instructor || 'Instructor';
            const initials = instructor.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

            // Use content modules if available, otherwise create a placeholder
            const modules = (contentData.modules && contentData.modules.length > 0)
                ? contentData.modules.map(m => ({
                    title: m.title || 'Untitled Module',
                    lessons: (m.lessons || []).map(l => ({
                        title: l.title || 'Untitled Lesson',
                        type: l.type || 'video',
                        duration: l.duration || '10:00',
                        description: l.description || '',
                        videoUrl: l.videoUrl || '',
                        completed: false
                    }))
                }))
                : FALLBACK_COURSE.modules.map(m => ({
                    ...m,
                    lessons: m.lessons.map(l => ({ ...l, completed: false }))
                }));

            COURSE = {
                id: courseId,
                title: courseData.title || 'Course',
                instructor: { name: instructor, initials, bio: `Instructor • ${courseData.category || 'Course'}` },
                skills: courseData.skills || courseData.tags || FALLBACK_COURSE.skills,
                modules
            };

            // Parse resources from content
            RESOURCES = (contentData.resources && contentData.resources.length > 0)
                ? contentData.resources.map(r => ({
                    name: r.title || 'Resource',
                    type: r.type || 'pdf',
                    size: '',
                    url: r.url || '',
                    module: 'all'
                }))
                : FALLBACK_COURSE.resources.map(r => ({
                    name: r.title,
                    type: r.type,
                    size: '',
                    url: r.url,
                    module: 'all'
                }));

            // Update the page title
            document.getElementById('courseTitle').textContent = COURSE.title;
            return;
        } catch (err) {
            console.warn('Failed to load course from API, using fallback data:', err);
        }
    }

    // Fallback: use hardcoded data
    COURSE = {
        ...FALLBACK_COURSE,
        instructor: { name: FALLBACK_COURSE.instructor, initials: 'AY', bio: 'Lead Instructor • Full-Stack Developer • 2M+ Students' },
        modules: FALLBACK_COURSE.modules.map(m => ({
            ...m,
            lessons: m.lessons.map(l => ({ ...l, completed: false }))
        }))
    };
    RESOURCES = FALLBACK_COURSE.resources.map(r => ({
        name: r.title, type: r.type, size: '', url: r.url, module: 'all'
    }));
}

/* ============================
   CURRICULUM RENDERING
   ============================ */
function renderCurriculum() {
    if (!COURSE) return;
    const container = document.getElementById('curriculumList');
    let totalLessons = 0;
    COURSE.modules.forEach(m => totalLessons += m.lessons.length);

    container.innerHTML = COURSE.modules.map((mod, mi) => {
        const completedInModule = mod.lessons.filter(l => l.completed).length;
        return `
        <div class="module ${mi === 0 ? 'open' : ''}" data-module="${mi}">
            <div class="module__header" onclick="toggleModule(${mi})">
                <div class="module__title-wrap">
                    <span class="module__label">Module ${mi + 1}</span>
                    <span class="module__title">${mod.title}</span>
                </div>
                <div class="module__meta">
                    <span class="module__count">${completedInModule}/${mod.lessons.length}</span>
                    <svg class="module__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
            </div>
            <div class="module__body">
                ${mod.lessons.map((les, li) => `
                    <div class="lesson ${les.completed ? 'completed' : ''} ${mi === currentModuleIndex && li === currentLessonIndex ? 'active' : ''}" data-module="${mi}" data-lesson="${li}" onclick="selectLesson(${mi},${li})">
                        <div class="lesson__check">${les.completed ? '✓' : ''}</div>
                        <div class="lesson__info">
                            <div class="lesson__name">${les.title}</div>
                            <div class="lesson__type">
                                ${getLessonTypeIcon(les.type)}
                                <span>${capitalize(les.type)}</span>
                            </div>
                        </div>
                        <span class="lesson__dur">${les.duration}</span>
                    </div>
                `).join('')}
            </div>
        </div>`;
    }).join('');

    updateLessonCounts();
}

function getLessonTypeIcon(type) {
    const icons = {
        video: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
        reading: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
        quiz: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        exercise: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>'
    };
    return icons[type] || icons.video;
}

function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

function toggleModule(mi) {
    const el = document.querySelector(`.module[data-module="${mi}"]`);
    el.classList.toggle('open');
}

/* ============================
   LESSON SELECTION
   ============================ */
function selectLesson(mi, li) {
    if (!COURSE) return;
    saveCurrentNotes();

    currentModuleIndex = mi;
    currentLessonIndex = li;
    const mod = COURSE.modules[mi];
    const les = mod.lessons[li];
    currentLesson = les;

    stopPlayback();

    // Update sidebar active state
    document.querySelectorAll('.lesson').forEach(el => el.classList.remove('active'));
    const activeLesson = document.querySelector(`.lesson[data-module="${mi}"][data-lesson="${li}"]`);
    if (activeLesson) {
        activeLesson.classList.add('active');
        activeLesson.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Open the module
    const moduleEl = document.querySelector(`.module[data-module="${mi}"]`);
    if (moduleEl && !moduleEl.classList.contains('open')) moduleEl.classList.add('open');

    // Update video player
    document.getElementById('lessonTag').textContent = `Module ${mi + 1} • Lesson ${li + 1}`;
    document.getElementById('lessonTitle').textContent = les.title;
    document.getElementById('lessonDur').textContent = les.duration;

    // Reset video state
    simulatedTime = 0;
    simulatedDuration = parseDuration(les.duration);
    document.getElementById('vcProgressFill').style.width = '0%';
    document.getElementById('vcTime').textContent = `0:00 / ${les.duration}`;
    document.getElementById('videoPoster').style.display = 'flex';
    isPlaying = false;

    // Update overview
    document.getElementById('overviewTitle').textContent = les.title;
    document.getElementById('overviewDuration').textContent = les.duration;
    document.getElementById('overviewModule').textContent = mi + 1;
    document.getElementById('overviewDesc').innerHTML = `<p>${les.description || 'No description available.'}</p>`;
    document.getElementById('instructorName').textContent = COURSE.instructor.name;
    document.getElementById('instructorBio').textContent = COURSE.instructor.bio;
    document.getElementById('instructorAvatar').textContent = COURSE.instructor.initials;

    // Skills
    document.getElementById('skillTags').innerHTML = (COURSE.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join('');

    // Transcript
    renderTranscript(les.title);

    // Load notes for this lesson
    loadNotesForLesson(`${mi}-${li}`);

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
}

function parseDuration(dur) {
    if (!dur) return 600;
    if (dur.includes('min')) return parseInt(dur) * 60;
    const parts = dur.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + (parts[1] || 0);
    return 600;
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

/* ============================
   VIDEO CONTROLS (SIMULATED)
   ============================ */
function initVideoControls() {
    document.getElementById('playBtn').addEventListener('click', startPlayback);
    document.getElementById('vcPlayBtn').addEventListener('click', togglePlayback);
    document.getElementById('prevLessonBtn').addEventListener('click', prevLesson);
    document.getElementById('nextLessonBtn').addEventListener('click', nextLesson);
    document.getElementById('speedBtn').addEventListener('click', cycleSpeed);
    document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);

    // Progress bar seeking
    document.querySelector('.vc-progress__bar').addEventListener('click', (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        simulatedTime = Math.floor(pct * simulatedDuration);
        updateVideoProgress();
    });
}

function startPlayback() {
    document.getElementById('videoPoster').style.display = 'none';
    isPlaying = true;
    playInterval = setInterval(() => {
        simulatedTime += playbackSpeed;
        if (simulatedTime >= simulatedDuration) {
            completeCurrentLesson();
            stopPlayback();
            autoAdvance();
            return;
        }
        updateVideoProgress();
    }, 1000);
}

function togglePlayback() {
    if (document.getElementById('videoPoster').style.display !== 'none') {
        startPlayback();
        return;
    }
    if (isPlaying) {
        stopPlayback();
    } else {
        isPlaying = true;
        playInterval = setInterval(() => {
            simulatedTime += playbackSpeed;
            if (simulatedTime >= simulatedDuration) {
                completeCurrentLesson();
                stopPlayback();
                autoAdvance();
                return;
            }
            updateVideoProgress();
        }, 1000);
    }
}

function stopPlayback() {
    isPlaying = false;
    if (playInterval) { clearInterval(playInterval); playInterval = null; }
}

function updateVideoProgress() {
    const pct = (simulatedTime / simulatedDuration) * 100;
    document.getElementById('vcProgressFill').style.width = pct + '%';
    document.getElementById('vcTime').textContent = `${formatTime(simulatedTime)} / ${formatTime(simulatedDuration)}`;
}

function cycleSpeed() {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const idx = speeds.indexOf(playbackSpeed);
    playbackSpeed = speeds[(idx + 1) % speeds.length];
    document.getElementById('speedText').textContent = playbackSpeed + 'x';
    showToast(`Playback speed: ${playbackSpeed}x`, 'info');
}

function toggleFullscreen() {
    const el = document.getElementById('videoPlayer');
    if (!document.fullscreenElement) {
        el.requestFullscreen().catch(() => { });
    } else {
        document.exitFullscreen();
    }
}

function prevLesson() {
    if (!COURSE) return;
    if (currentLessonIndex > 0) {
        selectLesson(currentModuleIndex, currentLessonIndex - 1);
    } else if (currentModuleIndex > 0) {
        const prevMod = COURSE.modules[currentModuleIndex - 1];
        selectLesson(currentModuleIndex - 1, prevMod.lessons.length - 1);
    }
}

function nextLesson() {
    if (!COURSE) return;
    const mod = COURSE.modules[currentModuleIndex];
    if (currentLessonIndex < mod.lessons.length - 1) {
        selectLesson(currentModuleIndex, currentLessonIndex + 1);
    } else if (currentModuleIndex < COURSE.modules.length - 1) {
        selectLesson(currentModuleIndex + 1, 0);
    }
}

function autoAdvance() {
    showToast('✅ Lesson completed!', 'success');
    setTimeout(() => nextLesson(), 1500);
}

function completeCurrentLesson() {
    if (!COURSE) return;
    const les = COURSE.modules[currentModuleIndex].lessons[currentLessonIndex];
    les.completed = true;
    saveProgress();
    renderCurriculum();
    updateOverallProgress();
    checkCompletion();
}

/* ============================
   PROGRESS TRACKING (localStorage, keyed by course ID)
   ============================ */
function getProgressKey() {
    return `sf_learn_progress_${COURSE?.id || 'demo'}`;
}
function getNotesKey() {
    return `sf_learn_notes_${COURSE?.id || 'demo'}`;
}

function updateOverallProgress() {
    if (!COURSE) return;
    let total = 0, completed = 0;
    COURSE.modules.forEach(m => {
        m.lessons.forEach(l => {
            total++;
            if (l.completed) completed++;
        });
    });
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('progressText').textContent = pct + '% complete';
    document.getElementById('sidebarProgressFill').style.width = pct + '%';
    document.getElementById('completedCount').textContent = completed;
    document.getElementById('totalCount').textContent = total;
}

function updateLessonCounts() {
    if (!COURSE) return;
    let total = 0, completed = 0;
    COURSE.modules.forEach(m => {
        m.lessons.forEach(l => {
            total++;
            if (l.completed) completed++;
        });
    });
    document.getElementById('completedCount').textContent = completed;
    document.getElementById('totalCount').textContent = total;
}

function saveProgress() {
    if (!COURSE) return;
    const progress = {};
    COURSE.modules.forEach((m, mi) => m.lessons.forEach((l, li) => {
        progress[`${mi}-${li}`] = l.completed;
    }));
    localStorage.setItem(getProgressKey(), JSON.stringify(progress));
}

function loadProgress() {
    if (!COURSE) return;
    try {
        const saved = JSON.parse(localStorage.getItem(getProgressKey()));
        if (saved) {
            COURSE.modules.forEach((m, mi) => m.lessons.forEach((l, li) => {
                if (saved[`${mi}-${li}`]) l.completed = true;
            }));
        }
    } catch (e) { /* ignore */ }

    // Load notes
    try {
        const savedNotes = JSON.parse(localStorage.getItem(getNotesKey()));
        if (savedNotes) lessonNotes = savedNotes;
    } catch (e) { /* ignore */ }
}

function checkCompletion() {
    if (!COURSE) return;
    let total = 0, completed = 0;
    COURSE.modules.forEach(m => m.lessons.forEach(l => { total++; if (l.completed) completed++; }));
    if (completed === total) showCertificate();
}

/* ============================
   TABS
   ============================ */
function initTabs() {
    document.querySelectorAll('.content-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.content-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
        });
    });
}

/* ============================
   NOTES
   ============================ */
function initNotes() {
    document.querySelectorAll('.notes__tool[data-cmd]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.execCommand(btn.dataset.cmd, false, null);
            document.getElementById('notesBody').focus();
        });
    });

    document.getElementById('timestampBtn').addEventListener('click', () => {
        const time = formatTime(simulatedTime);
        document.execCommand('insertHTML', false, `<span style="color:#7c3aed;font-weight:600;cursor:pointer;" class="note-timestamp">[${time}]</span> `);
        document.getElementById('notesBody').focus();
    });

    document.getElementById('notesBody').addEventListener('blur', saveCurrentNotes);
    document.getElementById('exportNotesBtn').addEventListener('click', exportNotes);
}

function saveCurrentNotes() {
    if (currentLesson === null) return;
    const content = document.getElementById('notesBody').innerHTML.trim();
    const key = `${currentModuleIndex}-${currentLessonIndex}`;
    if (content) {
        lessonNotes[key] = content;
        localStorage.setItem(getNotesKey(), JSON.stringify(lessonNotes));
    }
    renderSavedNotesList();
}

function loadNotesForLesson(lessonKey) {
    const body = document.getElementById('notesBody');
    body.innerHTML = lessonNotes[lessonKey] || '';
    renderSavedNotesList();
}

function renderSavedNotesList() {
    if (!COURSE) return;
    const container = document.getElementById('notesSavedList');
    const entries = Object.entries(lessonNotes).filter(([_, v]) => v.trim());
    if (entries.length === 0) {
        container.innerHTML = '';
        return;
    }
    container.innerHTML = `<h3>All Saved Notes (${entries.length})</h3>` + entries.map(([key, content]) => {
        const [mi, li] = key.split('-').map(Number);
        const lesson = COURSE.modules[mi]?.lessons[li];
        const preview = content.replace(/<[^>]+>/g, '').substring(0, 120);
        return `
        <div class="saved-note" onclick="jumpToLessonNote('${key}')">
            <div class="saved-note__header">
                <span class="saved-note__lesson">${lesson ? lesson.title : key}</span>
            </div>
            <div class="saved-note__preview">${preview}...</div>
        </div>`;
    }).join('');
}

function jumpToLessonNote(key) {
    const [mi, li] = key.split('-').map(Number);
    if (COURSE.modules[mi]?.lessons[li]) {
        selectLesson(mi, li);
    }
}

function exportNotes() {
    if (!COURSE) return;
    let text = `# Course Notes — ${COURSE.title}\n\n`;
    Object.entries(lessonNotes).forEach(([key, content]) => {
        const [mi, li] = key.split('-').map(Number);
        const lesson = COURSE.modules[mi]?.lessons[li];
        text += `## ${lesson ? lesson.title : key}\n`;
        text += content.replace(/<[^>]+>/g, '') + '\n\n';
    });
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'course-notes.md'; a.click();
    URL.revokeObjectURL(url);
    showToast('Notes exported as Markdown!', 'success');
}

/* ============================
   RESOURCES
   ============================ */
function renderResources() {
    const container = document.getElementById('resourcesList');
    if (!RESOURCES || RESOURCES.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);padding:20px;text-align:center;">No resources available yet.</p>';
        return;
    }
    const typeIcons = {
        pdf: '📄', code: '💻', zip: '📦', link: '🔗', img: '🖼️'
    };
    container.innerHTML = RESOURCES.map(res => {
        const iconClass = `resource-item__icon--${res.type}`;
        return `
        <div class="resource-item">
            <div class="resource-item__icon ${iconClass}">${typeIcons[res.type] || '📄'}</div>
            <div class="resource-item__info">
                <div class="resource-item__name">${res.name}</div>
                <div class="resource-item__meta">${res.size || res.type.toUpperCase()}</div>
            </div>
            <button class="resource-item__download" onclick="downloadResource('${res.name}', '${res.url || ''}')">
                Download
            </button>
        </div>`;
    }).join('');
}

function downloadResource(name, url) {
    if (url) {
        window.open(url, '_blank');
    } else {
        showToast(`Downloading "${name}"...`, 'info');
    }
}

/* ============================
   TRANSCRIPT
   ============================ */
function renderTranscript(lessonTitle) {
    const lines = generateTranscript(lessonTitle);
    const container = document.getElementById('transcriptBody');
    container.innerHTML = lines.map((line, i) => `
        <div class="transcript-line ${i === 0 ? 'active' : ''}" data-index="${i}" onclick="seekToTranscript(${i})">
            <span class="transcript-line__time">${line.time}</span>
            <span class="transcript-line__text">${line.text}</span>
        </div>
    `).join('');

    // Search
    document.getElementById('transcriptSearch').value = '';
    document.getElementById('transcriptSearch').oninput = (e) => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll('.transcript-line').forEach(el => {
            const textEl = el.querySelector('.transcript-line__text');
            const original = lines[parseInt(el.dataset.index)].text;
            if (!q) {
                textEl.innerHTML = original;
                el.style.display = '';
                return;
            }
            if (original.toLowerCase().includes(q)) {
                const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                textEl.innerHTML = original.replace(regex, '<mark>$1</mark>');
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        });
    };
}

function seekToTranscript(index) {
    document.querySelectorAll('.transcript-line').forEach(el => el.classList.remove('active'));
    document.querySelector(`.transcript-line[data-index="${index}"]`).classList.add('active');
    showToast('Jumped to timestamp', 'info');
}

/* ============================
   Q&A SECTION
   ============================ */
function renderQnA(filter = 'all') {
    const container = document.getElementById('qnaList');
    let filtered = QNA_DATA;
    if (filter === 'lesson') filtered = QNA_DATA.filter(q => q.lesson === currentLessonIndex);

    container.innerHTML = filtered.length === 0
        ? '<p style="color:var(--text-muted);padding:20px;text-align:center;">No questions yet for this filter. Be the first to ask!</p>'
        : filtered.map(q => `
        <div class="qna-item">
            <div class="qna-item__header">
                <div class="qna-item__avatar" style="background:${q.color}">${q.initials}</div>
                <div class="qna-item__info">
                    <div class="qna-item__author">${q.author}</div>
                    <div class="qna-item__meta">
                        <span>${q.time}</span>
                    </div>
                </div>
            </div>
            <div class="qna-item__title">${q.title}</div>
            <div class="qna-item__body">${q.body}</div>
            <div class="qna-item__actions">
                <button class="qna-item__action" onclick="upvoteQuestion(${q.id})">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                    Helpful (${q.upvotes})
                </button>
                <button class="qna-item__action">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    Reply
                </button>
            </div>
            ${q.reply ? `
            <div class="qna-item__reply">
                <div class="qna-item__reply-author">🎓 ${q.reply.author} (Instructor)</div>
                <div class="qna-item__reply-text">${q.reply.text}</div>
            </div>` : ''}
        </div>
    `).join('');
}

function upvoteQuestion(id) {
    const q = QNA_DATA.find(q => q.id === id);
    if (q) { q.upvotes++; renderQnA(); showToast('Marked as helpful', 'success'); }
}

function initQnAForm() {
    document.getElementById('askQuestionBtn').addEventListener('click', () => {
        document.getElementById('qnaForm').style.display = document.getElementById('qnaForm').style.display === 'none' ? 'block' : 'none';
    });
    document.getElementById('cancelQnaBtn').addEventListener('click', () => {
        document.getElementById('qnaForm').style.display = 'none';
    });
    document.getElementById('submitQnaBtn').addEventListener('click', () => {
        const title = document.getElementById('qnaTitle').value.trim();
        const details = document.getElementById('qnaDetails').value.trim();
        if (!title) { showToast('Please enter a question title', 'info'); return; }
        QNA_DATA.unshift({
            id: Date.now(), author: 'You', initials: 'YO', color: 'linear-gradient(135deg,#10b981,#3b82f6)',
            title, body: details || 'No additional details.',
            lesson: currentLessonIndex, time: 'Just now', upvotes: 0, reply: null
        });
        document.getElementById('qnaTitle').value = '';
        document.getElementById('qnaDetails').value = '';
        document.getElementById('qnaForm').style.display = 'none';
        renderQnA();
        showToast('Question posted successfully!', 'success');
    });

    // Filter buttons
    document.querySelectorAll('.qna__filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.qna__filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderQnA(btn.dataset.filter);
        });
    });
}

/* ============================
   ANNOUNCEMENTS
   ============================ */
function renderAnnouncements() {
    const container = document.getElementById('announcementsList');
    container.innerHTML = ANNOUNCEMENTS.map(a => `
        <div class="announcement">
            <div class="announcement__header">
                <div class="announcement__avatar">${a.initials}</div>
                <div>
                    <div class="announcement__author">${a.author}</div>
                    <div class="announcement__date">${a.date}</div>
                </div>
            </div>
            <div class="announcement__title">${a.title}</div>
            <div class="announcement__body">${a.body}</div>
        </div>
    `).join('');
}

/* ============================
   SIDEBAR
   ============================ */
function initSidebar() {
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
    document.getElementById('sidebarClose').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
    });
}

/* ============================
   CERTIFICATE
   ============================ */
function showCertificate() {
    if (!COURSE) return;
    const modal = document.getElementById('certModal');
    document.getElementById('certContent').innerHTML = `
        <div class="cert-modal__badge">🎓</div>
        <h2>Congratulations!</h2>
        <p>You've completed <strong>${COURSE.title}</strong></p>
        <p style="color:var(--text-muted);font-size:0.9rem;">You've demonstrated proficiency in all ${COURSE.modules.length} modules. Your certificate is ready!</p>
        <div class="cert-modal__actions">
            <button class="btn btn--outline btn--sm" onclick="document.getElementById('certModal').classList.remove('open')">Close</button>
            <button class="btn btn--primary btn--sm" onclick="downloadCert()">Download Certificate</button>
        </div>
    `;
    modal.classList.add('open');
}

function downloadCert() {
    showToast('Certificate downloaded!', 'success');
    document.getElementById('certModal').classList.remove('open');
}

/* ============================
   TOAST
   ============================ */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = message;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(20px)'; setTimeout(() => toast.remove(), 300); }, 3000);
}

/* ============================
   SHARE BUTTON
   ============================ */
document.getElementById('shareBtn')?.addEventListener('click', () => {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).then(() => showToast('Link copied to clipboard!', 'success'));
    } else {
        showToast('Share link: ' + window.location.href, 'info');
    }
});
