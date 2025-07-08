from flask import Flask, render_template, request, jsonify, redirect, url_for, session
import json, os

app = Flask(__name__, static_folder='static', template_folder='templates')
app.secret_key = "tajny_klucz"

USERS_FILE = os.path.join(app.static_folder, 'users.json')

def load_users():
    with open(USERS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_users(users):
    with open(USERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(users, f, indent=2, ensure_ascii=False)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/change-password')
def change_password():
    if 'user' not in session:
        return redirect(url_for('index'))
    return render_template('change-password.html')

@app.route('/manage-workers')
def manage_workers():
    if 'user' not in session or session.get('role') != 'manager':
        return redirect(url_for('index'))
    return render_template('manage-workers.html')

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    users = load_users()
    for u in users:
        if u['login'] == data.get('login') and u['password'] == data.get('password'):
            session['user'] = u['login']
            session['role'] = u['role']
            return jsonify(success=True, role=u['role'])
    return jsonify(success=False)

@app.route('/api/change-password', methods=['POST'])
def api_change_password():
    if 'user' not in session:
        return jsonify(success=False, message='Nie jesteś zalogowany!')
    data = request.get_json()
    new_password = data.get('newPassword','')
    users = load_users()
    for u in users:
        if u['login'] == session['user']:
            u['password'] = new_password
            save_users(users)
            return jsonify(success=True)
    return jsonify(success=False, message='Błąd zmiany hasła!')

@app.route('/api/users', methods=['GET','POST','PUT','DELETE'])
def api_users():
    # dostęp tylko dla Zarządcy
    if 'user' not in session or session.get('role') != 'manager':
        return jsonify(success=False, message='Brak dostępu!'), 403

    users = load_users()

    if request.method == 'GET':
        # zwracamy bez haseł
        return jsonify([
            {
                'login': u['login'],
                'role': u['role'],
                'name': u.get('name',''),
                'surname': u.get('surname','')
            }
            for u in users
        ])

    data = request.get_json()
    # dodawanie
    if request.method == 'POST':
        login = data.get('login','').strip()
        if any(u['login'] == login for u in users):
            return jsonify(success=False, message='Użytkownik już istnieje')
        users.append({
            'login': login,
            'password': data.get('password',''),
            'role': data.get('role','worker'),
            'name': data.get('name',''),
            'surname': data.get('surname','')
        })
        save_users(users)
        return jsonify(success=True)

    # edycja
    if request.method == 'PUT':
        login = data.get('login','').strip()
        for u in users:
            if u['login'] == login:
                if data.get('password') is not None:
                    u['password'] = data.get('password')
                u['role']    = data.get('role', u['role'])
                u['name']    = data.get('name', u.get('name',''))
                u['surname'] = data.get('surname', u.get('surname',''))
                save_users(users)
                return jsonify(success=True)
        return jsonify(success=False, message='Nie znaleziono użytkownika')

    # usuwanie
    if request.method == 'DELETE':
        login = data.get('login','').strip()
        new = [u for u in users if u['login'] != login]
        if len(new)==len(users):
            return jsonify(success=False, message='Nie znaleziono użytkownika')
        save_users(new)
        return jsonify(success=True)

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True, port=5050)
