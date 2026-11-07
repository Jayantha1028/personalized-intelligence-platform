import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.auth.security import hash_password, check_password, decode_token


def test_scrypt_password_hashing():
    pwd = "SecureStudentPass2026!"
    hashed = hash_password(pwd)
    assert "$" in hashed
    assert check_password(pwd, hashed) is True
    assert check_password("WrongPassword!", hashed) is False


@pytest.mark.asyncio
async def test_auth_demo_login_student():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/auth/demo-login", json={"account_type": "student"})
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["tokenType"] == "Bearer"
        assert data["user"]["email"] == "alex.sharma@example.in"
        assert data["user"]["role"] == "STUDENT"

        # Verify decoded token
        payload = decode_token(data["token"])
        assert payload["email"] == "alex.sharma@example.in"
        assert payload["role"] == "STUDENT"


@pytest.mark.asyncio
async def test_auth_demo_login_fellow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/auth/demo-login", json={"account_type": "fellow"})
        assert response.status_code == 200
        data = response.json()
        assert data["user"]["email"] == "ananya.rao@karnataka.gov.in"
        assert data["user"]["role"] == "RESEARCHER"


@pytest.mark.asyncio
async def test_auth_me_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # First login as student
        login_resp = await ac.post("/api/auth/demo-login", json={"account_type": "student"})
        token = login_resp.json()["token"]

        # Call /me with Bearer token
        me_resp = await ac.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_resp.status_code == 200
        me_data = me_resp.json()
        assert me_data["status"] == "authenticated"
        assert me_data["user"]["email"] == "alex.sharma@example.in"
        assert me_data["session"]["algorithm"] == "HS256"


@pytest.mark.asyncio
async def test_auth_registration_and_login_flow():
    test_email = "new.developer.karnataka@example.in"
    test_password = "KarnatakaDevPass123!"

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Register new user
        reg_resp = await ac.post(
            "/api/auth/register",
            json={
                "full_name": "Praveen Gowda",
                "email": test_email,
                "password": test_password,
                "role": "STUDENT",
                "state": "Karnataka",
                "course_or_degree": "B.Tech Computer Science",
            },
        )
        assert reg_resp.status_code in [201, 409]

        # Login with registered user
        login_resp = await ac.post(
            "/api/auth/login",
            json={"email": test_email, "password": test_password},
        )
        assert login_resp.status_code == 200
        login_data = login_resp.json()
        assert login_data["user"]["email"] == test_email
        assert "token" in login_data
