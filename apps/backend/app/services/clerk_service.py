# fleet-ai/backend/services/clerk_service.py
import dotenv
dotenv.load_dotenv()

import os
import requests
from typing import Optional
import logging
import jwt
from jwt.exceptions import InvalidTokenError
import json

logger = logging.getLogger(__name__)

# Initialize Clerk configuration
CLERK_SECRET_KEY = os.getenv('CLERK_SECRET_KEY')
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = os.getenv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY')
CLERK_JWKS_URL = os.getenv('CLERK_JWKS_URL')

if not CLERK_SECRET_KEY:
    raise ValueError("CLERK_SECRET_KEY environment variable not set. Please add it to your .env file.")

if not NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
    raise ValueError("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable not set. Please add it to your .env file.")

async def get_clerk_session(session_token: str) -> Optional[dict]:
    """
    Verifies a Clerk session token (JWT) and returns the decoded payload.
    Returns None if the session token is invalid or expired.
    """
    if not session_token:
        logger.error("Session token is required")
        return None
    
    try:
        # Get JWKS (JSON Web Key Set) from Clerk to verify the JWT
        jwks_response = requests.get(CLERK_JWKS_URL)
        if jwks_response.status_code != 200:
            logger.error(f"Failed to fetch JWKS: {jwks_response.status_code}")
            return None
            
        jwks = jwks_response.json()
        
        # Decode the JWT header to get the key ID (kid)
        unverified_header = jwt.get_unverified_header(session_token)
        kid = unverified_header.get('kid')
        
        if not kid:
            logger.error("No 'kid' found in JWT header")
            return None
            
        # Find the appropriate key from JWKS
        public_key = None
        for key in jwks.get('keys', []):
            if key.get('kid') == kid:
                public_key = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(key))
                break
                
        if not public_key:
            logger.error(f"No matching key found for kid: {kid}")
            return None
            
        # Verify and decode the JWT with clock skew tolerance
        decoded_token = jwt.decode(
            session_token,
            public_key,
            algorithms=['RS256'],
            options={"verify_exp": True, "verify_nbf": True},
            leeway=60  # Allow 60 seconds of clock skew tolerance
        )
        
        # Return session data for compatibility
        return {
            'user_id': decoded_token.get('sub'),
            'session_id': decoded_token.get('sid'),
            'payload': decoded_token
        }
        
    except InvalidTokenError as e:
        logger.error(f"Invalid JWT token: {e}")
        return None
    except Exception as e:
        logger.error(f"Error verifying Clerk session token: {e}")
        return None


async def get_google_access_token_from_clerk(user_id: str) -> Optional[str]:
    """
    Retrieves the Google OAuth access token for a given Clerk user.
    Returns None if the Google account is not connected or token not found.
    """
    try:
        headers = {
            'Authorization': f'Bearer {CLERK_SECRET_KEY}',
            'Content-Type': 'application/json'
        }
        
        url = f"https://api.clerk.com/v1/users/{user_id}/oauth_access_tokens/oauth_google"
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            # Handle both list and dict responses from Clerk API
            if isinstance(data, list) and len(data) > 0:
                return data[0].get('token') if isinstance(data[0], dict) else None
            elif isinstance(data, dict):
                return data.get('token')
            else:
                logger.error(f"Unexpected response format from Clerk API: {type(data)}")
                return None
        elif response.status_code == 404:
            logger.warning(f"No Google OAuth token found for user {user_id}")
            return None
        else:
            logger.error(f"Failed to get Google token: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        logger.error(f"Error fetching Google access token from Clerk for user {user_id}: {e}")
        return None


async def get_microsoft_access_token_from_clerk(user_id: str) -> Optional[str]:
    """
    Retrieves the Microsoft OAuth access token for a given Clerk user.
    Returns None if the Microsoft account is not connected or token not found.
    """
    try:
        headers = {
            'Authorization': f'Bearer {CLERK_SECRET_KEY}',
            'Content-Type': 'application/json'
        }

        url = f"https://api.clerk.com/v1/users/{user_id}/oauth_access_tokens/oauth_microsoft"
        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            data = response.json()
            # Handle both list and dict responses from Clerk API
            if isinstance(data, list) and len(data) > 0:    
                return data[0].get('token') if isinstance(data[0], dict) else None
            elif isinstance(data, dict):
                return data.get('token')
            else:
                logger.error(f"Unexpected response format from Clerk API: {type(data)}")
                return None
        elif response.status_code == 404:
            logger.warning(f"No Microsoft OAuth token found for user {user_id}")
            return None
        else:
            logger.error(f"Failed to get Microsoft token: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        logger.error(f"Error fetching Microsoft access token from Clerk for user {user_id}: {e}")
        return None
