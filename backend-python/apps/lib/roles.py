from enum import Enum
from typing import List

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    MODERATOR = "MODERATOR"
    USER = "USER"
    GUEST = "GUEST"

ROLE_HIERARCHY = {
    UserRole.ADMIN: [UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER, UserRole.GUEST],
    UserRole.MODERATOR: [UserRole.MODERATOR, UserRole.USER, UserRole.GUEST],
    UserRole.USER: [UserRole.USER, UserRole.GUEST],
    UserRole.GUEST: [UserRole.GUEST],
}

def has_permission(user_role: str, required_role: str) -> bool:
    try:
        user_role_enum = UserRole(user_role)
        required_role_enum = UserRole(required_role)
        return required_role_enum in ROLE_HIERARCHY.get(user_role_enum, [])
    except (ValueError, KeyError):
        return False

def get_allowed_roles(user_role: str) -> List[UserRole]:
    try:
        user_role_enum = UserRole(user_role)
        return ROLE_HIERARCHY.get(user_role_enum, [])
    except ValueError:
        return []
