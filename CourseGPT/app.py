from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import uuid
import google.generativeai as genai
from dotenv import load_dotenv
import json
import re

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini API
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

# Store lessons and modules in memory
lessons = []
modules = []

# Serve static files
@app.route('/')
def serve_index():
    return send_from_directory('static', 'index.html')

# Generate lesson using Gemini API
def generate_lesson(topic, concept):
    prompt = f"""
    Create a detailed and structured educational lesson for the topic '{topic}' focusing on the concept '{concept}'.
    The lesson should be formatted as JSON with the following structure:
    {{
        "title": "Lesson title",
        "description": "A detailed lesson description (at least 2-3 sentences)",
        "learning_outcomes": ["Outcome 1", "Outcome 2", "Outcome 3", "Outcome 4"],
        "key_concepts": [
            {{"term": "Term 1", "definition": "Detailed definition (2-3 sentences)", "example": "Example 1"}},
            {{"term": "Term 2", "definition": "Detailed definition (2-3 sentences)", "example": "Example 2"}},
            {{"term": "Term 3", "definition": "Detailed definition (2-3 sentences)", "example": "Example 3"}}
        ],
        "activities": [
            {{"type": "Activity type 1", "description": "Detailed activity description (2-3 sentences)", "resources": "Optional resource link or reference"}},
            {{"type": "Activity type 2", "description": "Detailed activity description (2-3 sentences)", "resources": "Optional resource link or reference"}},
            {{"type": "Activity type 3", "description": "Detailed activity description (2-3 sentences)", "resources": "Optional resource link or reference"}},
            {{"type": "Activity type 4", "description": "Detailed activity description (2-3 sentences)", "resources": "Optional resource link or reference"}}
        ]
    }}
    Ensure the content is engaging, pedagogically sound, and suitable for beginners. Include practical examples and resources where applicable.
    Return the response wrapped in ```json\n and \n```.
    """
    try:
        response = model.generate_content(prompt)
        text = response.text
        json_match = re.search(r'```json\n(.*?)\n```', text, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
        else:
            json_str = text
        lesson = json.loads(json_str)
        lesson["id"] = str(uuid.uuid4())
        return lesson
    except Exception as e:
        print(f"Error generating lesson: {e}")
        return {
            "id": str(uuid.uuid4()),
            "title": f"Introduction to {topic}",
            "description": f"This lesson introduces the fundamentals of {topic}, focusing on {concept}. It provides a comprehensive overview for beginners, with practical examples and activities to reinforce learning.",
            "learning_outcomes": [
                f"Understand the core principles of {topic}",
                f"Apply {concept} in real-world scenarios",
                f"Identify key components of {topic}",
                "Develop foundational skills for further exploration"
            ],
            "key_concepts": [
                {"term": f"{topic} Basics", "definition": f"The core principles of {topic}, including its history and applications.", "example": f"Using {topic} to solve a simple problem."},
                {"term": concept, "definition": f"A key aspect of {topic} that involves understanding its mechanics and usage.", "example": f"Applying {concept} in a beginner-level project."},
                {"term": f"Advanced {topic}", "definition": f"More complex aspects of {topic} that build on the basics.", "example": f"Extending {topic} knowledge to a real-world case study."}
            ],
            "activities": [
                {"type": "Quiz", "description": f"A multiple-choice quiz to test understanding of {topic}. Includes 5 questions with feedback.", "resources": "N/A"},
                {"type": "Example", "description": f"A practical example of using {concept} in a real-world scenario. Follow the steps to complete the task.", "resources": "N/A"},
                {"type": "Discussion", "description": f"Discuss how {topic} can be applied in different fields. Share your thoughts with peers.", "resources": "N/A"},
                {"type": "Project", "description": f"Create a small project using {concept}. Document your process and results.", "resources": "N/A"}
            ]
        }

@app.route('/api/lessons', methods=['POST'])
def create_lesson():
    data = request.json
    if not data or 'topic' not in data or 'concept' not in data:
        return jsonify({"error": "Missing topic or concept"}), 400
    lesson = generate_lesson(data.get('topic'), data.get('concept'))
    lessons.append(lesson)
    return jsonify(lesson), 201

@app.route('/api/lessons', methods=['GET'])
def get_lessons():
    return jsonify(lessons)

@app.route('/api/modules', methods=['POST'])
def create_module():
    data = request.json
    if not data or 'title' not in data:
        return jsonify({"error": "Missing module title"}), 400
    module = {
        "id": str(uuid.uuid4()),
        "title": data.get('title'),
        "lessons": data.get('lessons', []),
        "prerequisites": data.get('prerequisites', []),
        "difficulty": data.get('difficulty', 'beginner'),
        "estimated_time": data.get('estimated_time', '1 hour')
    }
    modules.append(module)
    return jsonify(module), 201

@app.route('/api/modules', methods=['GET'])
def get_modules():
    return jsonify(modules)

@app.route('/api/lessons/<lesson_id>', methods=['PUT'])
def update_lesson(lesson_id):
    data = request.json
    for lesson in lessons:
        if lesson['id'] == lesson_id:
            lesson.update({
                "id": lesson_id,
                "title": data.get('title', lesson['title']),
                "description": data.get('description', lesson['description']),
                "learning_outcomes": data.get('learning_outcomes', lesson['learning_outcomes']),
                "key_concepts": data.get('key_concepts', lesson['key_concepts']),
                "activities": data.get('activities', lesson['activities'])
            })
            return jsonify(lesson)
    return jsonify({"error": "Lesson not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)