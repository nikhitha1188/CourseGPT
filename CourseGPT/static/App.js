// Access globals from UMD builds
const { useState, useEffect } = React;
const { createRoot } = ReactDOM;
const { BrowserRouter, Switch, Route, Link, useLocation } = ReactRouterDOM;

// Navigation Bar Component
function Navbar() {
    const location = useLocation(); // Debug: Track current route
    console.log('Current route:', location.pathname);

    return (
        <nav className="bg-gradient-to-r from-blue-600 to-teal-500 text-white p-4 shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold tracking-wide">CourseGPT</Link>
                <div className="space-x-4">
                    <Link to="/" className="hover:underline hover:text-yellow-300 transition">Home</Link>
                    <Link to="/lessons" className="hover:underline hover:text-yellow-300 transition">Lessons</Link>
                    <Link to="/modules" className="hover:underline hover:text-yellow-300 transition">Modules</Link>
                    <Link to="/about" className="hover:underline hover:text-yellow-300 transition">About</Link>
                </div>
            </div>
        </nav>
    );
}

// Footer Component
function Footer() {
    return (
        <footer className="bg-gradient-to-r from-blue-600 to-teal-500 text-white p-4 mt-auto">
            <div className="container mx-auto text-center">
                <p className="text-sm">© 2025 CourseGPT. All rights reserved.</p>
                <div className="space-x-4 mt-2">
                    <Link to="/" className="hover:underline hover:text-yellow-300 transition">Home</Link>
                    <Link to="/lessons" className="hover:underline hover:text-yellow-300 transition">Lessons</Link>
                    <Link to="/modules" className="hover:underline hover:text-yellow-300 transition">Modules</Link>
                    <Link to="/about" className="hover:underline hover:text-yellow-300 transition">About</Link>
                </div>
            </div>
        </footer>
    );
}

// Home Page
function Home() {
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-teal-50">
            <div className="wave-header"></div>
            <Navbar />
            <div className="container mx-auto p-8 flex-grow">
                <h1 className="text-5xl font-bold mb-6 text-center text-blue-700" data-aos="fade-down">Welcome to CourseGPT</h1>
                <p className="text-lg text-gray-600 mb-12 text-center max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="100">
                    CourseGPT is an AI-powered educational platform that helps you generate lessons and organize modules seamlessly.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105 duration-300" data-aos="fade-up" data-aos-delay="200">
                        <div className="flex items-center mb-4">
                            <i className="fas fa-book-open text-3xl text-blue-600 mr-3"></i>
                            <h2 className="text-2xl font-semibold text-blue-600">Generate Lessons</h2>
                        </div>
                        <p className="text-gray-600 mb-4">Create engaging lessons on any topic using AI.</p>
                        <Link to="/lessons" className="inline-block bg-gradient-to-r from-blue-500 to-teal-500 text-white p-3 rounded-lg hover:from-blue-600 hover:to-teal-600 transition transform hover:scale-105">
                            Go to Lessons
                        </Link>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105 duration-300" data-aos="fade-up" data-aos-delay="300">
                        <div className="flex items-center mb-4">
                            <i className="fas fa-folder-open text-3xl text-teal-600 mr-3"></i>
                            <h2 className="text-2xl font-semibold text-teal-600">Organize Modules</h2>
                        </div>
                        <p className="text-gray-600 mb-4">Group lessons into modules for structured learning.</p>
                        <Link to="/modules" className="inline-block bg-gradient-to-r from-teal-500 to-blue-500 text-white p-3 rounded-lg hover:from-teal-600 hover:to-blue-600 transition transform hover:scale-105">
                            Go to Modules
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

// Lessons Page
function Lessons() {
    const [lessons, setLessons] = useState([]);
    const [topic, setTopic] = useState('');
    const [concept, setConcept] = useState('');
    const [loading, setLoading] = useState(false);
    const [editingLessonId, setEditingLessonId] = useState(null);
    const [editedLesson, setEditedLesson] = useState(null);
    const [notification, setNotification] = useState({ message: '', show: false });

    const fetchLessons = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/lessons');
            const data = await response.json();
            setLessons(data);
        } catch (error) {
            console.error('Error fetching lessons:', error);
        }
    };

    const generateLesson = async () => {
        if (!topic || !concept) {
            alert('Please enter both a topic and a concept.');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/lessons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, concept })
            });
            const data = await response.json();
            setLessons([...lessons, data]);
            setTopic('');
            setConcept('');
        } catch (error) {
            console.error('Error generating lesson:', error);
            alert('Failed to generate lesson. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const createModule = async (lessonId, lessonTitle) => {
        try {
            const response = await fetch('http://localhost:5000/api/modules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: `Module: ${lessonTitle}`,
                    lessons: [lessonId],
                    prerequisites: [],
                    difficulty: 'beginner',
                    estimated_time: '1 hour'
                })
            });
            const data = await response.json();
            setNotification({ message: 'Module created successfully!', show: true });
            setTimeout(() => setNotification({ message: '', show: false }), 3000);
        } catch (error) {
            console.error('Error creating module:', error);
            setNotification({ message: 'Failed to create module.', show: true });
            setTimeout(() => setNotification({ message: '', show: false }), 3000);
        }
    };

    const startEditing = (lesson) => {
        setEditingLessonId(lesson.id);
        setEditedLesson({ ...lesson });
    };

    const cancelEditing = () => {
        setEditingLessonId(null);
        setEditedLesson(null);
    };

    const saveLesson = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/lessons/${editingLessonId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editedLesson)
            });
            const updatedLesson = await response.json();
            setLessons(lessons.map(lesson => lesson.id === editingLessonId ? updatedLesson : lesson));
            setEditingLessonId(null);
            setEditedLesson(null);
            setNotification({ message: 'Lesson updated successfully!', show: true });
            setTimeout(() => setNotification({ message: '', show: false }), 3000);
        } catch (error) {
            console.error('Error updating lesson:', error);
            setNotification({ message: 'Failed to update lesson.', show: true });
            setTimeout(() => setNotification({ message: '', show: false }), 3000);
        }
    };

    useEffect(() => {
        fetchLessons();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-teal-50">
            <div className="wave-header"></div>
            <Navbar />
            <div className="container mx-auto p-8 flex-grow relative">
                {notification.show && (
                    <div className="notification">
                        {notification.message}
                    </div>
                )}
                <h1 className="text-4xl font-bold mb-8 text-center text-blue-700">Lessons</h1>
                <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
                    <h2 className="text-2xl font-semibold mb-6 text-teal-600">Generate a New Lesson</h2>
                    <div className="space-y-6">
                        <input
                            type="text"
                            placeholder="Enter topic (e.g., Python Programming)"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 transition"
                            disabled={loading}
                        />
                        <input
                            type="text"
                            placeholder="Enter key concept (e.g., Variables)"
                            value={concept}
                            onChange={(e) => setConcept(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 transition"
                            disabled={loading}
                        />
                        <button
                            onClick={generateLesson}
                            className={`w-full p-3 rounded-lg transition text-white font-semibold ${loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 transform hover:scale-105'}`}
                            disabled={loading}
                        >
                            {loading ? 'Generating...' : 'Generate Lesson'}
                        </button>
                        {loading && (
                            <div className="flex justify-center mt-4">
                                <div className="loader"></div>
                                <p className="ml-2 text-gray-600">Generating lesson...</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="space-y-8">
                    {lessons.length === 0 ? (
                        <p className="text-gray-600 text-center text-lg">No lessons generated yet.</p>
                    ) : (
                        lessons.map((lesson) => (
                            <div key={lesson.id} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-101 duration-300">
                                {editingLessonId === lesson.id ? (
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block font-semibold text-gray-800 mb-2">Title:</label>
                                            <input
                                                type="text"
                                                value={editedLesson.title}
                                                onChange={(e) => setEditedLesson({ ...editedLesson, title: e.target.value })}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-gray-800 mb-2">Description:</label>
                                            <textarea
                                                value={editedLesson.description}
                                                onChange={(e) => setEditedLesson({ ...editedLesson, description: e.target.value })}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition"
                                                rows="4"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-gray-800 mb-2">Learning Outcomes:</label>
                                            {editedLesson.learning_outcomes.map((outcome, idx) => (
                                                <input
                                                    key={idx}
                                                    type="text"
                                                    value={outcome}
                                                    onChange={(e) => {
                                                        const updatedOutcomes = [...editedLesson.learning_outcomes];
                                                        updatedOutcomes[idx] = e.target.value;
                                                        setEditedLesson({ ...editedLesson, learning_outcomes: updatedOutcomes });
                                                    }}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition mb-3"
                                                />
                                            ))}
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-gray-800 mb-2">Key Concepts:</label>
                                            {editedLesson.key_concepts.map((concept, idx) => (
                                                <div key={idx} className="space-y-3 mb-4 border-l-4 border-teal-500 pl-4">
                                                    <input
                                                        type="text"
                                                        placeholder="Term"
                                                        value={concept.term}
                                                        onChange={(e) => {
                                                            const updatedConcepts = [...editedLesson.key_concepts];
                                                            updatedConcepts[idx] = { ...concept, term: e.target.value };
                                                            setEditedLesson({ ...editedLesson, key_concepts: updatedConcepts });
                                                        }}
                                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 transition"
                                                    />
                                                    <textarea
                                                        placeholder="Definition"
                                                        value={concept.definition}
                                                        onChange={(e) => {
                                                            const updatedConcepts = [...editedLesson.key_concepts];
                                                            updatedConcepts[idx] = { ...concept, definition: e.target.value };
                                                            setEditedLesson({ ...editedLesson, key_concepts: updatedConcepts });
                                                        }}
                                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 transition"
                                                        rows="2"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Example"
                                                        value={concept.example}
                                                        onChange={(e) => {
                                                            const updatedConcepts = [...editedLesson.key_concepts];
                                                            updatedConcepts[idx] = { ...concept, example: e.target.value };
                                                            setEditedLesson({ ...editedLesson, key_concepts: updatedConcepts });
                                                        }}
                                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 transition"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-gray-800 mb-2">Activities:</label>
                                            {editedLesson.activities.map((activity, idx) => (
                                                <div key={idx} className="space-y-3 mb-4 border-l-4 border-coral-500 pl-4">
                                                    <input
                                                        type="text"
                                                        placeholder="Activity Type"
                                                        value={activity.type}
                                                        onChange={(e) => {
                                                            const updatedActivities = [...editedLesson.activities];
                                                            updatedActivities[idx] = { ...activity, type: e.target.value };
                                                            setEditedLesson({ ...editedLesson, activities: updatedActivities });
                                                        }}
                                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral-500 bg-gray-50 transition"
                                                    />
                                                    <textarea
                                                        placeholder="Description"
                                                        value={activity.description}
                                                        onChange={(e) => {
                                                            const updatedActivities = [...editedLesson.activities];
                                                            updatedActivities[idx] = { ...activity, description: e.target.value };
                                                            setEditedLesson({ ...editedLesson, activities: updatedActivities });
                                                        }}
                                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral-500 bg-gray-50 transition"
                                                        rows="2"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Resources (optional)"
                                                        value={activity.resources}
                                                        onChange={(e) => {
                                                            const updatedActivities = [...editedLesson.activities];
                                                            updatedActivities[idx] = { ...activity, resources: e.target.value };
                                                            setEditedLesson({ ...editedLesson, activities: updatedActivities });
                                                        }}
                                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral-500 bg-gray-50 transition"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex space-x-4">
                                            <button
                                                onClick={saveLesson}
                                                className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white p-3 rounded-lg hover:from-green-600 hover:to-teal-600 transition transform hover:scale-105"
                                            >
                                                Save Changes
                                            </button>
                                            <button
                                                onClick={cancelEditing}
                                                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white p-3 rounded-lg hover:from-gray-600 hover:to-gray-700 transition transform hover:scale-105"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => createModule(lesson.id, lesson.title)}
                                                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition transform hover:scale-105"
                                            >
                                                Add to Module
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="text-xl font-semibold text-blue-600 mb-3">{lesson.title}</h3>
                                        <p className="text-gray-600 mb-4">{lesson.description}</p>
                                        <h4 className="font-semibold text-gray-800 mb-2">Learning Outcomes:</h4>
                                        <ul className="list-disc pl-5 text-gray-600 mb-4">
                                            {lesson.learning_outcomes.map((outcome, idx) => (
                                                <li key={idx}>{outcome}</li>
                                            ))}
                                        </ul>
                                        <h4 className="font-semibold text-gray-800 mb-2">Key Concepts:</h4>
                                        <ul className="list-disc pl-5 text-gray-600 mb-4">
                                            {lesson.key_concepts.map((concept, idx) => (
                                                <li key={idx}>
                                                    <strong className="text-teal-600">{concept.term}:</strong> {concept.definition} <br />
                                                    <em className="text-gray-500">Example:</em> {concept.example}
                                                </li>
                                            ))}
                                        </ul>
                                        <h4 className="font-semibold text-gray-800 mb-2">Activities:</h4>
                                        <ul className="list-disc pl-5 text-gray-600 mb-4">
                                            {lesson.activities.map((activity, idx) => (
                                                <li key={idx}>
                                                    <strong className="text-coral-600">{activity.type}:</strong> {activity.description} <br />
                                                    {activity.resources !== "N/A" && <em className="text-gray-500">Resources:</em>} {activity.resources !== "N/A" ? activity.resources : ""}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="flex space-x-4">
                                            <button
                                                onClick={() => startEditing(lesson)}
                                                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-3 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition transform hover:scale-105"
                                            >
                                                Edit Lesson
                                            </button>
                                            <button
                                                onClick={() => createModule(lesson.id, lesson.title)}
                                                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition transform hover:scale-105"
                                            >
                                                Add to Module
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}

// Modules Page
function Modules() {
    const [modules, setModules] = useState([]);
    const [allLessons, setAllLessons] = useState([]);
    const [expandedModule, setExpandedModule] = useState(null);

    const fetchModules = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/modules');
            const data = await response.json();
            setModules(data);
        } catch (error) {
            console.error('Error fetching modules:', error);
        }
    };

    const fetchLessons = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/lessons');
            const data = await response.json();
            setAllLessons(data);
        } catch (error) {
            console.error('Error fetching lessons:', error);
        }
    };

    const toggleModule = (moduleId) => {
        setExpandedModule(expandedModule === moduleId ? null : moduleId);
    };

    useEffect(() => {
        fetchModules();
        fetchLessons();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-teal-50">
            <div className="wave-header"></div>
            <Navbar />
            <div className="container mx-auto p-8 flex-grow">
                <h1 className="text-4xl font-bold mb-8 text-center text-blue-700">Modules</h1>
                {modules.length === 0 ? (
                    <p className="text-gray-600 text-center text-lg">No modules created yet. Generate lessons and add them to modules from the Lessons page.</p>
                ) : (
                    <div className="space-y-8">
                        {modules.map((module) => {
                            const moduleLessons = allLessons.filter(lesson => module.lessons.includes(lesson.id));
                            return (
                                <div key={module.id} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-101 duration-300">
                                    <div
                                        className="cursor-pointer"
                                        onClick={() => toggleModule(module.id)}
                                    >
                                        <h3 className="text-xl font-semibold text-teal-600 mb-2">{module.title}</h3>
                                        <p className="text-gray-600">Difficulty: <span className="text-coral-600">{module.difficulty}</span></p>
                                        <p className="text-gray-600">Estimated Time: <span className="text-coral-600">{module.estimated_time}</span></p>
                                        <p className="text-gray-600">Lessons: <span className="text-coral-600">{module.lessons.length}</span></p>
                                    </div>
                                    {expandedModule === module.id && (
                                        <div className="mt-6">
                                            <h4 className="font-semibold text-gray-800 mb-3">Lessons in this Module:</h4>
                                            {moduleLessons.length === 0 ? (
                                                <p className="text-gray-600">No lessons found in this module.</p>
                                            ) : (
                                                <div className="space-y-6">
                                                    {moduleLessons.map((lesson) => (
                                                        <div key={lesson.id} className="p-6 bg-gray-50 rounded-lg">
                                                            <h5 className="text-lg font-semibold text-blue-600 mb-3">{lesson.title}</h5>
                                                            <p className="text-gray-600 mb-4">{lesson.description}</p>
                                                            <h6 className="font-semibold text-gray-800 mb-2">Learning Outcomes:</h6>
                                                            <ul className="list-disc pl-5 text-gray-600 mb-4">
                                                                {lesson.learning_outcomes.map((outcome, idx) => (
                                                                    <li key={idx}>{outcome}</li>
                                                                ))}
                                                            </ul>
                                                            <h6 className="font-semibold text-gray-800 mb-2">Key Concepts:</h6>
                                                            <ul className="list-disc pl-5 text-gray-600 mb-4">
                                                                {lesson.key_concepts.map((concept, idx) => (
                                                                    <li key={idx}>
                                                                        <strong className="text-teal-600">{concept.term}:</strong> {concept.definition} <br />
                                                                        <em className="text-gray-500">Example:</em> {concept.example}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                            <h6 className="font-semibold text-gray-800 mb-2">Activities:</h6>
                                                            <ul className="list-disc pl-5 text-gray-600 mb-4">
                                                                {lesson.activities.map((activity, idx) => (
                                                                    <li key={idx}>
                                                                        <strong className="text-coral-600">{activity.type}:</strong> {activity.description} <br />
                                                                        {activity.resources !== "N/A" && <em className="text-gray-500">Resources:</em>} {activity.resources !== "N/A" ? activity.resources : ""}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

// About Page
function About() {
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-teal-50">
            <div className="wave-header"></div>
            <Navbar />
            <div className="container mx-auto p-8 flex-grow">
                <h1 className="text-4xl font-bold mb-8 text-center text-blue-700">About CourseGPT</h1>
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                        CourseGPT is an innovative platform designed to help educators and learners create and organize educational content using AI.
                    </p>
                    <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                        With CourseGPT, you can:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-3">
                        <li>Generate lessons on any topic with AI assistance.</li>
                        <li>Organize lessons into modules for structured learning.</li>
                    </ul>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        Built with Flask, React, and Tailwind CSS, CourseGPT aims to make education accessible and engaging for everyone.
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
}

// Main App Component
function App() {
    return (
        <BrowserRouter>
            <Switch>
                <Route exact path="/" component={Home} />
                <Route exact path="/lessons" component={Lessons} />
                <Route exact path="/modules" component={Modules} />
                <Route exact path="/about" component={About} />
                <Route path="*" component={() => (
                    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-teal-50">
                        <div className="wave-header"></div>
                        <Navbar />
                        <div className="container mx-auto p-8 flex-grow">
                            <p className="text-red-600 text-center text-lg">Page not found.</p>
                            <Link to="/" className="block text-center text-blue-600 hover:underline hover:text-blue-700 transition mt-4">
                                Go to Home
                            </Link>
                        </div>
                        <Footer />
                    </div>
                )} />
            </Switch>
        </BrowserRouter>
    );
}

// Render the app
const root = createRoot(document.getElementById('root'));
root.render(<App />);