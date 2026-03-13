document.addEventListener('DOMContentLoaded', () => {
    // ---- Elements ----
    
    // Tabs
    const tabBrowse = document.getElementById('tabBrowse');
    const tabQuiz = document.getElementById('tabQuiz');
    
    // Views
    const introView = document.getElementById('introView');
    const browseView = document.getElementById('browseView');
    const quizSetupView = document.getElementById('quizSetupView');
    const quizActiveView = document.getElementById('quizActiveView');

    // Browse Elements
    const caseListEl = document.getElementById('caseList');
    const caseContentEl = document.getElementById('caseContent');
    const emptyStateEl = document.getElementById('emptyState');
    
    const caseTitleEl = document.getElementById('caseTitle');
    const ekgImageEl = document.getElementById('ekgImage');
    const clinicalHistoryEl = document.getElementById('clinicalHistory');
    const diagnosisTextEl = document.getElementById('diagnosisText');
    const sourceUrlEl = document.getElementById('sourceUrl');
    const difficultyBadgeEl = document.getElementById('difficultyBadge');
    const topicsContainerEl = document.getElementById('topicsContainer');
    const categoryBadgeEl = document.getElementById('categoryBadge');
    
    const difficultyFilterEl = document.getElementById('difficultyFilter');
    const topicFilterEl = document.getElementById('topicFilter');
    const categoryFilterEl = document.getElementById('categoryFilter');

    // Quiz Setup Elements
    const quizCategoryFilter = document.getElementById('quizCategoryFilter');
    const quizTopicFilter = document.getElementById('quizTopicFilter');
    const quizDifficultyFilter = document.getElementById('quizDifficultyFilter');
    const quizLengthFilter = document.getElementById('quizLengthFilter');
    const startQuizBtn = document.getElementById('startQuizBtn');
    const quizSetupError = document.getElementById('quizSetupError');

    // Quiz Active Elements
    const quizProgressTitle = document.getElementById('quizProgressTitle');
    const quitQuizBtn = document.getElementById('quitQuizBtn');
    const quizEkgImage = document.getElementById('quizEkgImage');
    const quizClinicalHistory = document.getElementById('quizClinicalHistory');
    const showAnswerBtn = document.getElementById('showAnswerBtn');
    const quizRevealedContent = document.getElementById('quizRevealedContent');
    const quizCategoryBadge = document.getElementById('quizCategoryBadge');
    const quizDifficultyBadge = document.getElementById('quizDifficultyBadge');
    const quizTopicsContainer = document.getElementById('quizTopicsContainer');
    const quizDiagnosisText = document.getElementById('quizDiagnosisText');
    const quizSourceUrl = document.getElementById('quizSourceUrl');
    const nextQuestionBtn = document.getElementById('nextQuestionBtn');

    // Learning Elements
    const tabLearning = document.getElementById('tabLearning');
    const learningSetupView = document.getElementById('learningSetupView');
    const learningPreLessonView = document.getElementById('learningPreLessonView');
    const learningActiveView = document.getElementById('learningActiveView');

    const learningCategorySelect = document.getElementById('learningCategorySelect');
    const startLearningBtn = document.getElementById('startLearningBtn');
    const learningSetupError = document.getElementById('learningSetupError');

    const learningPreLessonTopic = document.getElementById('learningPreLessonTopic');
    const learningFrame = document.getElementById('learningFrame');
    const continueToLessonCaseBtn = document.getElementById('continueToLessonCaseBtn');
    const quitLearningFromPrepBtn = document.getElementById('quitLearningFromPrepBtn');

    const learningProgressTitle = document.getElementById('learningProgressTitle');
    const learningProgressSub = document.getElementById('learningProgressSub');
    const learningPhaseBadge = document.getElementById('learningPhaseBadge');
    const quitLearningBtn = document.getElementById('quitLearningBtn');
    
    const learningPrincipleCallout = document.getElementById('learningPrincipleCallout');
    const learningEkgImage = document.getElementById('learningEkgImage');
    const learningClinicalHistory = document.getElementById('learningClinicalHistory');
    const learningShowAnswerBtn = document.getElementById('learningShowAnswerBtn');
    const learningRevealedContent = document.getElementById('learningRevealedContent');
    const learningDifficultyBadge = document.getElementById('learningDifficultyBadge');
    const learningDiagnosisText = document.getElementById('learningDiagnosisText');
    const learningSourceUrl = document.getElementById('learningSourceUrl');
    const learningNextBtn = document.getElementById('learningNextBtn');
    const learningLaunchInteractive = document.getElementById('learningLaunchInteractive');
    
    // Intro Elements
    const introContentEl = document.getElementById('introContent');
    const startAppBtn = document.getElementById('startAppBtn');
    const topNavEl = document.querySelector('.top-nav');

    // State
    let allCases = [];
    let lessonsData = {};
    
    let currentQuizCases = [];
    let currentQuizIndex = 0;
    
    let learningCurriculum = []; // Array of { type: 'pre_lesson'|'lesson'|'practice', topic: string, caseData: obj }
    let currentLearningIndex = 0;

    const INTRO_MARKDOWN = `
# Master EKG Interpretation

Welcome to the **EKG Cases Library**. This interactive platform is designed to help medical professionals and students sharpen their ECG interpretation skills through real-world clinical cases.

### What you can do:
- **Browse Mode**: Explore our extensive library of cases with detailed clinical histories and expert diagnoses.
- **Quiz Mode**: Test your knowledge with randomized quizzes tailored to specific categories or difficulty levels.
- **Learning Path**: Follow a progressive curriculum that takes you from fundamental principles to complex clinical scenarios.

> [!TIP]
> Use the **Learning Path** if you are just starting out. It provides theoretical background before challenging you with cases.

Click the button below to begin your journey into the world of electrocardiology.
`;

    // ---- Initialization ----

    function initFilters() {
        if (!categoryFilterEl) return;
        if(quizCategoryFilter) quizCategoryFilter.innerHTML = categoryFilterEl.innerHTML;
        if(quizTopicFilter) quizTopicFilter.innerHTML = topicFilterEl.innerHTML;
        if(quizDifficultyFilter) quizDifficultyFilter.innerHTML = difficultyFilterEl.innerHTML;
        if(learningCategorySelect) {
            // Remove 'All' for learning path, force a specific category
            let options = Array.from(categoryFilterEl.options).filter(opt => opt.value !== 'all');
            learningCategorySelect.innerHTML = options.map(opt => `<option value="${opt.value}">${opt.text}</option>`).join('');
        }
    }
    initFilters();

    function initIntro() {
        if (!introContentEl) return;
        
        // Render Markdown
        if (typeof marked !== 'undefined') {
            introContentEl.innerHTML = marked.parse(INTRO_MARKDOWN);
        } else {
            introContentEl.textContent = INTRO_MARKDOWN;
        }

        // Hide top nav initially
        if (topNavEl) topNavEl.style.display = 'none';
        
        // Show intro view, hide others
        introView.style.display = 'flex';
        browseView.style.display = 'none';
        
        startAppBtn.addEventListener('click', () => {
            introView.style.display = 'none';
            if (topNavEl) topNavEl.style.display = 'flex';
            switchTab('browse');
        });
    }
    initIntro();

    // Fetch Educational Content
    fetch('data/lessons.json?_t=' + new Date().getTime())
        .then(res => res.json())
        .then(data => lessonsData = data)
        .catch(err => console.error("Could not load lessons.json", err));

    // Tab Switching
    function switchTab(tab) {
        tabBrowse.classList.remove('active');
        tabQuiz.classList.remove('active');
        if(tabLearning) tabLearning.classList.remove('active');
        
        browseView.style.display = 'none';
        quizSetupView.style.display = 'none';
        quizActiveView.style.display = 'none';
        
        if(learningSetupView) learningSetupView.style.display = 'none';
        if(learningPreLessonView) learningPreLessonView.style.display = 'none';
        if(learningActiveView) learningActiveView.style.display = 'none';
        
        if (introView) introView.style.display = 'none';

        if (tab === 'browse') {
            tabBrowse.classList.add('active');
            browseView.style.display = 'flex';
            applyBrowseFilters();
        } else if (tab === 'quiz') {
            tabQuiz.classList.add('active');
            if (currentQuizCases.length > 0) {
                quizActiveView.style.display = 'flex';
            } else {
                quizSetupView.style.display = 'flex';
                quizSetupError.style.display = 'none';
            }
        } else if (tab === 'learning') {
            tabLearning.classList.add('active');
            if (learningCurriculum.length > 0) {
                renderLearningStep();
            } else {
                learningSetupView.style.display = 'flex';
                learningSetupError.style.display = 'none';
            }
        }
    }

    tabBrowse.addEventListener('click', () => switchTab('browse'));
    tabQuiz.addEventListener('click', () => switchTab('quiz'));
    if(tabLearning) tabLearning.addEventListener('click', () => switchTab('learning'));

    // Load Data
    fetch('data/cases_index.json?_t=' + new Date().getTime())
        .then(response => {
            if (!response.ok) throw new Error('Could not load cases index');
            return response.json();
        })
        .then(cases => {
            allCases = cases;
            renderSidebar(allCases);
            
            // Handle URL parameters for category filtering
            const urlParams = new URLSearchParams(window.location.search);
            const categoryParam = urlParams.get('category');
            if (categoryParam) {
                if (categoryFilterEl) {
                    categoryFilterEl.value = categoryParam;
                    switchTab('browse');
                }
            }
        })
        .catch(error => {
            console.error(error);
            caseListEl.innerHTML = `<p style="padding: 12px; color: #f87171; font-size: 14px;">Failed to load cases. Did you run \`python generate_index.py\`?</p>`;
        });

    // ---- Browse Mode Logic ----
    
    function renderSidebar(cases) {
        caseListEl.innerHTML = '';

        if (cases.length === 0) {
            caseListEl.innerHTML = '<p style="padding: 12px; color: var(--text-secondary); font-size: 13px;">No cases found for this standard.</p>';
            return;
        }

        cases.forEach(caseData => {
            const btn = document.createElement('button');
            btn.className = 'case-item';

            let diffLabel = '';
            if (caseData.difficulty && caseData.difficulty > 0) {
                diffLabel = ` <span style="opacity:0.5; font-size:11px;">(${'*'.repeat(caseData.difficulty)})</span>`;
            }

            btn.innerHTML = `Case ${caseData.case_id}${diffLabel}`;
            btn.dataset.folder = caseData.folder;
            btn.dataset.id = caseData.case_id;

            btn.addEventListener('click', () => {
                const prevActive = document.querySelector('.case-item.active');
                if (prevActive) prevActive.classList.remove('active');
                btn.classList.add('active');

                loadBrowseCase(caseData.folder, caseData.case_id);
            });

            caseListEl.appendChild(btn);
        });
    }

    function applyBrowseFilters() {
        let filtered = allCases;

        if (difficultyFilterEl) {
            const diffVal = difficultyFilterEl.value;
            if (diffVal !== 'all') {
                const diffNum = parseInt(diffVal, 10);
                filtered = filtered.filter(c => (c.difficulty || 0) === diffNum);
            }
        }

        if (topicFilterEl) {
            const topicVal = topicFilterEl.value;
            if (topicVal !== 'all') {
                filtered = filtered.filter(c => c.topics && c.topics.includes(topicVal));
            }
        }

        if (categoryFilterEl) {
            const catVal = categoryFilterEl.value;
            if (catVal !== 'all') {
                filtered = filtered.filter(c => c.category === catVal);
            }
        }

        renderSidebar(filtered);
    }

    if (difficultyFilterEl) difficultyFilterEl.addEventListener('change', applyBrowseFilters);
    if (topicFilterEl) topicFilterEl.addEventListener('change', applyBrowseFilters);
    if (categoryFilterEl) categoryFilterEl.addEventListener('change', applyBrowseFilters);

    function setImageWithFallback(imgEl, folderName) {
        const extensions = ['gif', 'jpg', 'png', 'jpeg'];
        let extIndex = 0;

        function tryNext() {
            if (extIndex >= extensions.length) return;
            imgEl.src = `data/cases/${folderName}/ekg.${extensions[extIndex]}`;
            extIndex++;
        }

        imgEl.onerror = tryNext;
        tryNext();
    }

    function loadBrowseCase(folderName, caseId) {
        emptyStateEl.style.display = 'none';
        caseContentEl.style.display = 'none'; 

        fetch(`data/cases/${folderName}/metadata.json?_t=` + new Date().getTime())
            .then(res => {
                if (!res.ok) throw new Error('HTTP error ' + res.status);
                return res.json();
            })
            .then(data => {
                caseTitleEl.textContent = `Case ${caseId}`;
                
                // Use fallback for image
                setImageWithFallback(ekgImageEl, folderName);

                clinicalHistoryEl.textContent = data.clinical_history || 'No history provided.';
                diagnosisTextEl.textContent = data.diagnosis || 'No diagnosis provided.';

                if (data.difficulty && data.difficulty > 0) {
                    difficultyBadgeEl.textContent = `Difficulty: ${'*'.repeat(data.difficulty)}`;
                    difficultyBadgeEl.style.display = 'inline-flex';
                } else {
                    difficultyBadgeEl.style.display = 'none';
                }

                if (data.category) {
                    categoryBadgeEl.textContent = data.category;
                    categoryBadgeEl.style.display = 'inline-flex';
                } else {
                    categoryBadgeEl.style.display = 'none';
                }

                topicsContainerEl.innerHTML = '';
                if (data.topics && data.topics.length > 0) {
                    data.topics.forEach(topic => {
                        if (topic === 'Uncategorized') return;
                        const badge = document.createElement('span');
                        badge.className = 'badge';
                        badge.style.backgroundColor = 'rgba(56, 189, 248, 0.1)';
                        badge.style.color = 'var(--primary-color)';
                        badge.style.borderColor = 'rgba(56, 189, 248, 0.2)';
                        badge.textContent = topic;
                        topicsContainerEl.appendChild(badge);
                    });
                }

                if (data.url) {
                    sourceUrlEl.href = data.url;
                    sourceUrlEl.style.display = 'inline-flex';
                } else {
                    sourceUrlEl.style.display = 'none';
                }

                caseContentEl.style.display = 'flex';
            })
            .catch(err => {
                console.error('Error loading case metadata:', err);
                caseTitleEl.textContent = 'Error Loading Case';
                emptyStateEl.textContent = 'Could not load metadata for this case.';
                emptyStateEl.style.display = 'flex';
            });
    }


    // ---- Quiz Mode Logic ----
    
    function shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    startQuizBtn.addEventListener('click', () => {
        let filtered = allCases;
        
        const catVal = quizCategoryFilter.value;
        if (catVal !== 'all') filtered = filtered.filter(c => c.category === catVal);
        
        const topicVal = quizTopicFilter.value;
        if (topicVal !== 'all') filtered = filtered.filter(c => c.topics && c.topics.includes(topicVal));
        
        const diffVal = quizDifficultyFilter.value;
        if (diffVal !== 'all') {
            const diffNum = parseInt(diffVal, 10);
            filtered = filtered.filter(c => (c.difficulty || 0) === diffNum);
        }

        if (filtered.length === 0) {
            quizSetupError.textContent = 'No cases match these filters. Try broader criteria.';
            quizSetupError.style.display = 'block';
            return;
        }

        quizSetupError.style.display = 'none';
        filtered = shuffleArray(filtered);

        const lengthVal = quizLengthFilter.value;
        if (lengthVal !== 'all') {
            const limit = parseInt(lengthVal, 10);
            filtered = filtered.slice(0, limit);
        }

        currentQuizCases = filtered;
        currentQuizIndex = 0;
        
        quizSetupView.style.display = 'none';
        quizActiveView.style.display = 'flex';
        
        loadQuizQuestion();
    });

    quitQuizBtn.addEventListener('click', () => {
        if(confirm('Are you sure you want to quit the current quiz?')) {
            currentQuizCases = [];
            currentQuizIndex = 0;
            quizActiveView.style.display = 'none';
            quizSetupView.style.display = 'flex';
        }
    });

    showAnswerBtn.addEventListener('click', () => {
        showAnswerBtn.style.display = 'none';
        quizRevealedContent.style.display = 'block';
    });

    nextQuestionBtn.addEventListener('click', () => {
        currentQuizIndex++;
        if (currentQuizIndex >= currentQuizCases.length) {
            alert('Quiz completed!');
            currentQuizCases = [];
            currentQuizIndex = 0;
            switchTab('browse');
        } else {
            loadQuizQuestion();
        }
    });

    function loadQuizQuestion() {
        const caseData = currentQuizCases[currentQuizIndex];
        
        quizProgressTitle.textContent = `Question ${currentQuizIndex + 1} of ${currentQuizCases.length}`;
        quizEkgImage.src = '';
        quizClinicalHistory.textContent = 'Loading...';
        
        showAnswerBtn.style.display = 'block';
        quizRevealedContent.style.display = 'none';
        
        fetch(`data/cases/${caseData.folder}/metadata.json?_t=` + new Date().getTime())
            .then(res => {
                if(!res.ok) throw new Error('HTTP Error');
                return res.json();
            })
            .then(data => {
                setImageWithFallback(quizEkgImage, caseData.folder);
                quizClinicalHistory.textContent = data.clinical_history || 'No history provided.';
                quizDiagnosisText.textContent = data.diagnosis || 'No diagnosis provided.';
                
                if (data.difficulty && data.difficulty > 0) {
                    quizDifficultyBadge.textContent = `Difficulty: ${'*'.repeat(data.difficulty)}`;
                    quizDifficultyBadge.style.display = 'inline-flex';
                } else {
                    quizDifficultyBadge.style.display = 'none';
                }

                if (data.category) {
                    quizCategoryBadge.textContent = data.category;
                    quizCategoryBadge.style.display = 'inline-flex';
                } else {
                    quizCategoryBadge.style.display = 'none';
                }

                quizTopicsContainer.innerHTML = '';
                if (data.topics && data.topics.length > 0) {
                    data.topics.forEach(topic => {
                        if (topic === 'Uncategorized') return;
                        const badge = document.createElement('span');
                        badge.className = 'badge';
                        badge.style.backgroundColor = 'rgba(56, 189, 248, 0.1)';
                        badge.style.color = 'var(--primary-color)';
                        badge.style.borderColor = 'rgba(56, 189, 248, 0.2)';
                        badge.textContent = topic;
                        quizTopicsContainer.appendChild(badge);
                    });
                }

                if (data.url) {
                    quizSourceUrl.href = data.url;
                    quizSourceUrl.style.display = 'inline-flex';
                } else {
                    quizSourceUrl.style.display = 'none';
                }
            })
            .catch(err => {
                console.error(err);
                quizClinicalHistory.textContent = 'Error loading question details.';
            });
    }

    // ---- Learning Path Logic ----

    if (startLearningBtn) {
        startLearningBtn.addEventListener('click', () => {
            const category = learningCategorySelect.value;
            let categoryCases = allCases.filter(c => c.category === category);
            
            if (categoryCases.length === 0) {
                learningSetupError.textContent = 'No cases found for this category.';
                learningSetupError.style.display = 'block';
                return;
            }

            // Group by Topic
            let topicsMap = {};
            categoryCases.forEach(c => {
                let mainTopic = (c.topics && c.topics.length > 0 && c.topics[0] !== 'Uncategorized') ? c.topics[0] : 'General';
                if (!topicsMap[mainTopic]) topicsMap[mainTopic] = [];
                topicsMap[mainTopic].push(c);
            });

            // Build Curriculum
            learningCurriculum = [];
            
            for (let topic in topicsMap) {
                // Determine order by difficulty ascending
                let tCases = topicsMap[topic].sort((a, b) => (a.difficulty || 0) - (b.difficulty || 0));
                
                // 1. Pre-Lesson Theory Step
                learningCurriculum.push({
                    type: 'pre_lesson',
                    topic: topic,
                    category: category,
                    totalCases: tCases.length
                });

                // 2. The Cases
                tCases.forEach((cData, idx) => {
                    learningCurriculum.push({
                        type: idx === 0 ? 'lesson' : 'practice',
                        topic: topic,
                        caseData: cData,
                        caseNumber: idx + 1,
                        totalCases: tCases.length
                    });
                });
            }

            if (learningCurriculum.length === 0) return;

            currentLearningIndex = 0;
            switchTab('learning');
        });
    }

    function renderLearningStep() {
        learningSetupView.style.display = 'none';
        learningPreLessonView.style.display = 'none';
        learningActiveView.style.display = 'none';

        const step = learningCurriculum[currentLearningIndex];

        if (step.type === 'pre_lesson') {
            learningPreLessonView.style.display = 'flex';
            learningPreLessonTopic.textContent = `Topic: ${step.topic}`;
            learningFrame.src = 'about:blank';
            
            // Show interactive button if Fundamentals
            if (step.category === 'Fundamentals' && learningLaunchInteractive) {
                learningLaunchInteractive.style.display = 'block';
                const interactiveLink = learningLaunchInteractive.querySelector('a');
                if (interactiveLink) interactiveLink.href = 'fundamentals/';
            } else if (learningLaunchInteractive) {
                learningLaunchInteractive.style.display = 'none';
            }

            // Determine which HTML file to use in iframe
            const catData = lessonsData[step.category] || {};
            let lessonPath = null;
            
            // First check topic-specific file
            if (catData.topics && catData.topics[step.topic]) {
                lessonPath = catData.topics[step.topic];
            }
            // Fallback to category intro
            if (!lessonPath && catData.intro) {
                lessonPath = catData.intro;
            }
            
            if (lessonPath) {
                // Point iframe to the HTML file
                // If it starts with fundamentals/ or is already a data/ path, use as is. 
                // Otherwise prepend data/
                if (lessonPath.startsWith('fundamentals/') || lessonPath.startsWith('data/')) {
                    learningFrame.src = lessonPath;
                } else {
                    learningFrame.src = `data/${lessonPath}`;
                }
            } else {
                // Show a helpful error within the iframe if possible, or just blank
                console.warn(`No lesson HTML found for ${step.topic}`);
                learningFrame.srcdoc = `<html><body style="font-family: sans-serif; padding: 40px; text-align: center; color: #666;">
                    <h3>Lesson Coming Soon</h3>
                    <p>No HTML content is mapped for <b>${step.topic}</b> yet.</p>
                </body></html>`;
            }

        } else {
            learningActiveView.style.display = 'flex';
            
            learningProgressTitle.textContent = `Topic: ${step.topic}`;
            learningProgressSub.textContent = `Case ${step.caseNumber} of ${step.totalCases}`;
            
            learningEkgImage.src = '';
            learningClinicalHistory.textContent = 'Loading...';
            learningRevealedContent.style.display = 'none';

            if (step.type === 'lesson') {
                learningPhaseBadge.textContent = 'Walkthrough Lesson';
                learningPhaseBadge.style.backgroundColor = 'rgba(56, 189, 248, 0.1)';
                learningPhaseBadge.style.color = 'var(--primary-color)';
                learningPhaseBadge.style.borderColor = 'rgba(56, 189, 248, 0.2)';
                
                learningPrincipleCallout.style.display = 'block';
                learningShowAnswerBtn.style.display = 'none'; // Auto reveal for lessons
                learningNextBtn.innerHTML = "Got it! Start Practice &rarr;";
            } else {
                learningPhaseBadge.textContent = 'Practice Quiz';
                learningPhaseBadge.style.backgroundColor = 'rgba(168, 85, 247, 0.1)';
                learningPhaseBadge.style.color = '#c084fc';
                learningPhaseBadge.style.borderColor = 'rgba(168, 85, 247, 0.2)';

                learningPrincipleCallout.style.display = 'none';
                learningShowAnswerBtn.style.display = 'block'; // Wait for user
                learningNextBtn.innerHTML = "Next Step &rarr;";
            }

            // Fetch case details
            fetch(`data/cases/${step.caseData.folder}/metadata.json?_t=` + new Date().getTime())
                .then(res => res.json())
                .then(data => {
                    setImageWithFallback(learningEkgImage, step.caseData.folder);
                    learningClinicalHistory.textContent = data.clinical_history || 'No history provided.';
                    learningDiagnosisText.textContent = data.diagnosis || 'No diagnosis provided.';
                    
                    if (data.difficulty && data.difficulty > 0) {
                        learningDifficultyBadge.textContent = `Difficulty: ${'*'.repeat(data.difficulty)}`;
                        learningDifficultyBadge.style.display = 'inline-flex';
                    } else {
                        learningDifficultyBadge.style.display = 'none';
                    }

                    if (data.url) {
                        learningSourceUrl.href = data.url;
                        learningSourceUrl.style.display = 'inline-flex';
                    } else {
                        learningSourceUrl.style.display = 'none';
                    }

                    if (step.type === 'lesson') {
                        // Automatically show the answer for lesson phase
                        learningRevealedContent.style.display = 'block';
                    }
                })
                .catch(err => console.error('Error loading learning case', err));
        }
    }

    if(continueToLessonCaseBtn) continueToLessonCaseBtn.addEventListener('click', () => {
        currentLearningIndex++;
        renderLearningStep();
    });

    if(learningNextBtn) learningNextBtn.addEventListener('click', () => {
        currentLearningIndex++;
        if (currentLearningIndex >= learningCurriculum.length) {
            alert('Congratulations! You have completed this Path.');
            learningCurriculum = [];
            currentLearningIndex = 0;
            switchTab('learning');
        } else {
            renderLearningStep();
        }
    });

    if(learningShowAnswerBtn) learningShowAnswerBtn.addEventListener('click', () => {
        learningShowAnswerBtn.style.display = 'none';
        learningRevealedContent.style.display = 'block';
    });

    const quitHandler = () => {
        if(confirm('Are you sure you want to quit this learning path?')) {
            learningCurriculum = [];
            currentLearningIndex = 0;
            switchTab('learning');
        }
    };

    if(quitLearningBtn) quitLearningBtn.addEventListener('click', quitHandler);
    if(quitLearningFromPrepBtn) quitLearningFromPrepBtn.addEventListener('click', quitHandler);

});
