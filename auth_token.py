# auth_token.py
from datetime import datetime, timedelta
import jwt

#JWT Configuration
SECRET_KEY = "your_secret_key"  # It is recommended to store this in an environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

#Create access token
def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    data: dict, stores the payload information such as {"sub": username, "role": role, "id": id}
    expires_delta: timedelta, token expiration time
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt