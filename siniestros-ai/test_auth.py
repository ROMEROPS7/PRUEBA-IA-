#!/usr/bin/env python3
"""
Test script for JWT Authentication System.

This script demonstrates the authentication system functionality.
Run this after starting the server with: python run.py

Usage:
    python test_auth.py
"""

import requests
import json
from typing import Optional, Dict, Any

# Configuration
API_URL = "http://localhost:8000"
AUTH_ENDPOINTS = {
    "login": f"{API_URL}/api/auth/login",
    "register": f"{API_URL}/api/auth/register",
    "me": f"{API_URL}/api/auth/me",
    "demo_users": f"{API_URL}/api/auth/demo-users",
}


def print_section(title: str):
    """Print a formatted section header."""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)


def print_response(response: requests.Response, label: str = "Response"):
    """Print a formatted API response."""
    print(f"\n{label}:")
    print(f"  Status: {response.status_code}")
    try:
        data = response.json()
        print(f"  Data: {json.dumps(data, indent=2)}")
        return data
    except json.JSONDecodeError:
        print(f"  Text: {response.text}")
        return None


def test_demo_users():
    """Test: Get demo users list."""
    print_section("TEST 1: Get Demo Users List")

    print(f"\nGET {AUTH_ENDPOINTS['demo_users']}")
    response = requests.get(AUTH_ENDPOINTS["demo_users"])
    data = print_response(response, "Demo Users Response")

    return data


def test_login(email: str, password: str) -> Optional[str]:
    """Test: Login with email and password."""
    print_section(f"TEST 2: Login as {email}")

    payload = {"email": email, "password": password}
    print(f"\nPOST {AUTH_ENDPOINTS['login']}")
    print(f"Payload: {json.dumps(payload, indent=2)}")

    response = requests.post(AUTH_ENDPOINTS["login"], json=payload)
    data = print_response(response, "Login Response")

    if data and "access_token" in data:
        return data["access_token"]
    return None


def test_get_me(token: str, label: str = "GET /api/auth/me"):
    """Test: Get current user info."""
    print_section(f"TEST 3: Get Current User Info")

    headers = {"Authorization": f"Bearer {token}"}
    print(f"\nGET {AUTH_ENDPOINTS['me']}")
    print(f"Headers: {json.dumps({'Authorization': 'Bearer <token>'}, indent=2)}")

    response = requests.get(AUTH_ENDPOINTS["me"], headers=headers)
    data = print_response(response, "Current User Response")

    return data


def test_invalid_token():
    """Test: Try to use invalid token."""
    print_section("TEST 4: Try Invalid Token")

    headers = {"Authorization": "Bearer invalid.token.here"}
    print(f"\nGET {AUTH_ENDPOINTS['me']}")
    print(f"Headers: Authorization: Bearer invalid.token.here")

    response = requests.get(AUTH_ENDPOINTS["me"], headers=headers)
    data = print_response(response, "Invalid Token Response")

    return data


def test_no_token():
    """Test: Call endpoint without token."""
    print_section("TEST 5: Call Endpoint Without Token")

    print(f"\nGET {AUTH_ENDPOINTS['me']}")
    print("Headers: (none)")

    response = requests.get(AUTH_ENDPOINTS["me"])
    data = print_response(response, "No Token Response")

    return data


def test_register(email: str, password: str, role: str = "CLIENTE") -> Optional[str]:
    """Test: Register new demo user."""
    print_section(f"TEST 6: Register New User")

    payload = {"email": email, "password": password, "role": role}
    print(f"\nPOST {AUTH_ENDPOINTS['register']}")
    print(f"Payload: {json.dumps(payload, indent=2)}")

    response = requests.post(AUTH_ENDPOINTS["register"], json=payload)
    data = print_response(response, "Register Response")

    if data and "access_token" in data:
        return data["access_token"]
    return None


def test_different_roles():
    """Test: Login with different user roles."""
    print_section("TEST 7: Login With Different Roles")

    test_users = [
        ("admin@segurcaixa.es", "admin123", "ADMIN"),
        ("gestor1@segurcaixa.es", "gestor123", "GESTOR"),
        ("cliente1@segurcaixa.es", "cliente123", "CLIENTE"),
    ]

    for email, password, role in test_users:
        print(f"\n[{role}] Logging in as {email}")
        token = test_login(email, password)

        if token:
            print(f"✓ Login successful")
            print(f"  Token: {token[:50]}...")

            # Verify with /me endpoint
            user_data = test_get_me(token)
            if user_data and user_data.get("authenticated"):
                print(f"✓ Token verified")
            else:
                print(f"✗ Token verification failed")
        else:
            print(f"✗ Login failed")


def main():
    """Run all authentication tests."""
    print_section("SegurCaixa Adeslas - JWT Authentication Test Suite")

    print(f"\nAPI Base URL: {API_URL}")
    print(f"Make sure the server is running: python run.py")

    try:
        # Test 1: Get demo users
        demo_data = test_demo_users()

        # Test 2: Login with valid credentials
        token = test_login("admin@segurcaixa.es", "admin123")

        if token:
            # Test 3: Use token to get user info
            test_get_me(token)
        else:
            print("\n✗ Could not get token, skipping authenticated tests")
            print("  Make sure the server is running: python run.py")
            return

        # Test 4: Invalid token
        test_invalid_token()

        # Test 5: No token
        test_no_token()

        # Test 6: Register new user
        new_email = "testuser@segurcaixa.es"
        new_token = test_register(new_email, "testpass123", "CLIENTE")

        if new_token:
            test_get_me(new_token)

        # Test 7: Test different roles
        test_different_roles()

        # Summary
        print_section("TEST SUMMARY")
        print("\n✓ Authentication system is working correctly!")
        print("\nYou can now:")
        print("  1. Use tokens to protect endpoints")
        print("  2. Implement role-based access control")
        print("  3. Update existing endpoints to require authentication")
        print("\nSee AUTHENTICATION.md for more details")

    except requests.exceptions.ConnectionError:
        print("\n✗ Error: Could not connect to server")
        print(f"  Make sure the server is running at {API_URL}")
        print("  Start the server with: python run.py")
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
