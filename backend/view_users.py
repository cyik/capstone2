import sqlite3

# Connect to your database
conn = sqlite3.connect("sql_app.db")  # Make sure the file name matches exactly
cursor = conn.cursor()

# Fetch all users
cursor.execute("SELECT * FROM users")
users = cursor.fetchall()

# Print each user (id, username, password, role)
for user in users:
    print(user)

# Close the connection
conn.close()