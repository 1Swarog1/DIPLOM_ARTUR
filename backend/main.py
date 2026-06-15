from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel, EmailStr
from fastapi.middleware.cors import CORSMiddleware
from scalar_fastapi import get_scalar_api_reference
import random
import os
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

# Disable default docs to replace with Scalar
app = FastAPI(docs_url=None, redoc_url=None, title="ROSTELECOM BACKEND")

# Configure CORS (comma-separated list in CORS_ORIGINS)
_default_origins = "http://localhost:3000,http://127.0.0.1:3000,http://localhost,http://127.0.0.1"
origins = [o.strip() for o in os.getenv("CORS_ORIGINS", _default_origins).split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Scalar API Reference
@app.get("/docs", include_in_schema=False)
async def scalar_html():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title="ROSTELECOM BACKEND",
    )

class EmailRequest(BaseModel):
    email: EmailStr

# Mock database for storing codes (in memory for demo)
verification_codes = {}

def send_email(to_email: str, code: str) -> bool:
    """Gmail SMTP: с твоей почты на указанный адрес (можно себе)."""
    email_user = os.getenv("GMAIL_USER")
    email_pass = os.getenv("GMAIL_APP_PASSWORD")
    if not email_user or not email_pass:
        print(f"\n>>> КОД: {code} (GMAIL_USER и GMAIL_APP_PASSWORD в .env) <<<\n")
        return True
    try:
        msg = MIMEText(f"Ваш код подтверждения: {code}")
        msg["Subject"] = "Код подтверждения"
        msg["From"] = email_user
        msg["To"] = to_email
        with smtplib.SMTP("smtp.gmail.com", 587) as s:
            s.starttls()
            s.login(email_user, email_pass)
            s.sendmail(email_user, to_email, msg.as_string())
        print(f"Письмо отправлено на {to_email}")
        return True
    except Exception as e:
        print(f"Ошибка: {e}\n>>> КОД: {code} <<<\n")
        return True

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/api/send-code")
async def send_code(request: EmailRequest):
    email = request.email
    code = str(random.randint(100000, 999999))
    
    # Store code with email (in a real app, use Redis or DB with expiration)
    verification_codes[email] = code
    
    success = send_email(email, code)
    
    if not success:
         # In a real app, you might want to return an error, but for demo we proceed if mock worked
         pass

    return {"message": "Code sent successfully", "email": email}

@app.post("/api/verify-code")
async def verify_code(email: str = Body(...), code: str = Body(...)):
    if email in verification_codes and verification_codes[email] == code:
        del verification_codes[email] # One-time use
        return {"message": "Code verified successfully", "verified": True}
    else:
        raise HTTPException(status_code=400, detail="Invalid code or email")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
