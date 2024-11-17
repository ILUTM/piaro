import sqlite3

# Connect to SQLite database (or create it if it doesn't exist)
conn = sqlite3.connect('bot_database.db')
c = conn.cursor()

# Create tables for users and verification codes
c.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE,
    chat_id INTEGER
)
''')

c.execute('''
CREATE TABLE IF NOT EXISTS verification_codes (
    id INTEGER PRIMARY KEY,
    username TEXT,
    code TEXT,
    FOREIGN KEY (username) REFERENCES users (username)
)
''')

conn.commit()

def store_chat_id(username, chat_id):
    c.execute('INSERT OR IGNORE INTO users (username, chat_id) VALUES (?, ?)', (username, chat_id))
    conn.commit()

def get_user_chat_id(username):
    c.execute('SELECT chat_id FROM users WHERE username = ?', (username,))
    result = c.fetchone()
    return result[0] if result else None

def store_verification_code(username, code):
    c.execute('INSERT INTO verification_codes (username, code) VALUES (?, ?)', (username, code))
    conn.commit()

def get_verification_code(username):
    c.execute('SELECT code FROM verification_codes WHERE username = ?', (username,))
    result = c.fetchone()
    return result[0] if result else None

def delete_verification_code(username):
    c.execute('DELETE FROM verification_codes WHERE username = ?', (username,))
    conn.commit()
