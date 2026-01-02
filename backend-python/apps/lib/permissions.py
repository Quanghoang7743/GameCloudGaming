from fastapi import Depends, HTTPException, status
from typing import List
from apps.models.user.user import User
from apps.lib.jwt_utils import get_current_user
from apps.lib.roles import UserRole, has_permission

def require_role(*allowed_roles: UserRole):
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )
        
        # Check if user has any of the allowed roles
        user_has_permission = any(
            has_permission(current_user.role, role.value)
            for role in allowed_roles
        )
        
        if not user_has_permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        
        return current_user
    
    return role_checker

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to require admin role"""
    if current_user.role != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

def require_moderator_or_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to require moderator or admin role"""
    if not has_permission(current_user.role, UserRole.MODERATOR.value):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Moderator or admin access required"
        )
    return current_user

def is_self_or_admin(user_id: str):
    async def checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.id != user_id and current_user.role != UserRole.ADMIN.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only access your own resources"
            )
        return current_user
    
    return checker
