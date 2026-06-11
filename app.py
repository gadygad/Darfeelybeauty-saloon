import os
import sqlite3
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

DB_FILE = 'darfeely.db'
UPLOAD_FOLDER = 'assets'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Ensure assets folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            stock INTEGER NOT NULL,
            description TEXT,
            image_filename TEXT NOT NULL
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS feedbacks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            comment TEXT NOT NULL,
            source TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/admin')
def admin():
    return app.send_static_file('admin.html')

@app.route('/api/products', methods=['GET'])
def get_products():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute('SELECT * FROM products ORDER BY id DESC')
    products = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify(products)

@app.route('/api/products', methods=['POST'])
def add_product():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected image'}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Add a unique prefix to prevent overwriting
        import time
        filename = f"{int(time.time())}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        data = request.form
        name = data.get('name')
        category = data.get('category')
        price = data.get('price')
        stock = data.get('stock')
        description = data.get('description', '')
        
        if not all([name, category, price, stock]):
             return jsonify({'error': 'Missing required fields'}), 400
             
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute('''
            INSERT INTO products (name, category, price, stock, description, image_filename)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (name, category, price, stock, description, filename))
        conn.commit()
        product_id = c.lastrowid
        conn.close()
        
        return jsonify({
            'message': 'Product added successfully',
            'id': product_id,
            'filename': filename
        }), 201

    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/api/feedbacks', methods=['GET'])
def get_feedbacks():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute('SELECT * FROM feedbacks ORDER BY id DESC')
    feedbacks = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify(feedbacks)

@app.route('/api/feedbacks', methods=['POST'])
def add_feedback():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    name = data.get('name')
    comment = data.get('comment')
    source = data.get('source')
    
    if not all([name, comment, source]):
        return jsonify({'error': 'Name, comment, and how you reached us are required fields'}), 400
        
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        INSERT INTO feedbacks (name, comment, source)
        VALUES (?, ?, ?)
    ''', (name, comment, source))
    conn.commit()
    feedback_id = c.lastrowid
    conn.close()
    
    return jsonify({
        'message': 'Feedback submitted successfully',
        'id': feedback_id
    }), 201

@app.route('/api/feedbacks/<int:feedback_id>', methods=['DELETE'])
def delete_feedback(feedback_id):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('DELETE FROM feedbacks WHERE id = ?', (feedback_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Feedback deleted successfully'})

@app.route('/api/referrals/stats', methods=['GET'])
def get_referral_stats():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('SELECT source, COUNT(*) as count FROM feedbacks GROUP BY source')
    rows = c.fetchall()
    conn.close()
    
    stats = []
    total = sum(row[1] for row in rows)
    for row in rows:
        stats.append({
            'source': row[0],
            'count': row[1],
            'percentage': round((row[1] / total) * 100, 1) if total > 0 else 0
        })
    return jsonify({'total': total, 'stats': stats})

if __name__ == '__main__':
    init_db()
    # Run on port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)

