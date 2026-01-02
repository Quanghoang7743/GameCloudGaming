"""
Example usage of role-based access control in FastAPI routes

This file demonstrates how to use the role system and permissions
in your API endpoints.
"""

from fastapi import APIRouter, Depends
from apps.lib.permissions import (
    require_admin,
    require_moderator_or_admin,
    require_role,
    is_self_or_admin
)
from apps.lib.roles import UserRole
from apps.models.user.user import User
from apps.lib.jwt_utils import get_current_user

router = APIRouter(prefix="/example", tags=["examples"])

# Example 1: Admin-only endpoint
@router.get("/admin-only")
async def admin_only_endpoint(current_user: User = Depends(require_admin)):
    """Only accessible by ADMIN role"""
    return {"message": "Welcome admin!", "user": current_user.username}

# Example 2: Moderator or Admin
@router.get("/moderator-area")
async def moderator_area(current_user: User = Depends(require_moderator_or_admin)):
    """Accessible by MODERATOR or ADMIN roles"""
    return {"message": f"Welcome {current_user.role}!", "user": current_user.username}

# Example 3: Multiple allowed roles using require_role
@router.get("/premium-content")
async def premium_content(
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER))
):
    """Accessible by ADMIN, MODERATOR, or USER (not GUEST)"""
    return {"message": "Premium content", "user_role": current_user.role}

# Example 4: Check if user is accessing their own resource or is admin
@router.get("/users/{user_id}/profile")
async def get_user_profile(
    user_id: str,
    current_user: User = Depends(is_self_or_admin(user_id))
):
    """Users can access their own profile, admins can access any profile"""
    return {
        "user_id": user_id,
        "accessed_by": current_user.username,
        "is_admin": current_user.role == UserRole.ADMIN.value
    }

# Example 5: Public endpoint (no role check)
@router.get("/public")
async def public_endpoint():
    """No authentication required"""
    return {"message": "This is public"}

# Example 6: Authenticated user (any role)
@router.get("/authenticated")
async def authenticated_endpoint(current_user: User = Depends(get_current_user)):
    """Any authenticated user can access"""
    return {
        "message": "You are authenticated",
        "username": current_user.username,
        "role": current_user.role
    }

# Example 7: Manually check permissions in function
@router.post("/custom-permission")
async def custom_permission(current_user: User = Depends(get_current_user)):
    """Custom permission logic"""
    from apps.lib.roles import has_permission
    
    # Check if user has at least MODERATOR permission
    if not has_permission(current_user.role, UserRole.MODERATOR.value):
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action requires moderator privileges"
        )
    
    return {"message": "Action performed successfully"}

# Example 8: Admin can update user roles
@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    new_role: UserRole,
    current_user: User = Depends(require_admin)
):
    """Only admins can change user roles"""
    # In real implementation, you would update the database here
    return {
        "message": f"User {user_id} role updated to {new_role.value}",
        "updated_by": current_user.username
    }
