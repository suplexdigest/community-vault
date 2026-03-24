from rest_framework.permissions import BasePermission

# Role hierarchy: admin > manager > president > treasurer > secretary > board_member > resident
ROLE_HIERARCHY = {
    "resident": 0,
    "board_member": 1,
    "secretary": 2,
    "treasurer": 3,
    "president": 4,
    "manager": 5,
    "admin": 6,
}


def _get_user_role_level(user, community_id):
    """Get the highest role level for a user in a community."""
    from core.models import Role
    roles = Role.objects.filter(user=user, community_id=community_id)
    if not roles.exists():
        return -1
    return max(ROLE_HIERARCHY.get(r.role, 0) for r in roles)


def _get_community_id(request):
    """Extract community ID from the request header."""
    return request.headers.get("X-Community-Id")


class IsResident(BasePermission):
    """User has at least resident role in the community."""
    def has_permission(self, request, view):
        community_id = _get_community_id(request)
        if not community_id:
            return False
        return _get_user_role_level(request.user, community_id) >= ROLE_HIERARCHY["resident"]


class IsBoardMember(BasePermission):
    """User has at least board_member role in the community."""
    def has_permission(self, request, view):
        community_id = _get_community_id(request)
        if not community_id:
            return False
        return _get_user_role_level(request.user, community_id) >= ROLE_HIERARCHY["board_member"]


class IsTreasurerOrAbove(BasePermission):
    """User has at least treasurer role in the community."""
    def has_permission(self, request, view):
        community_id = _get_community_id(request)
        if not community_id:
            return False
        return _get_user_role_level(request.user, community_id) >= ROLE_HIERARCHY["treasurer"]


class IsManagerOrAbove(BasePermission):
    """User has at least manager role in the community."""
    def has_permission(self, request, view):
        community_id = _get_community_id(request)
        if not community_id:
            return False
        return _get_user_role_level(request.user, community_id) >= ROLE_HIERARCHY["manager"]


class IsAdmin(BasePermission):
    """User has admin role in the community."""
    def has_permission(self, request, view):
        community_id = _get_community_id(request)
        if not community_id:
            return False
        return _get_user_role_level(request.user, community_id) >= ROLE_HIERARCHY["admin"]


class IsResidentReadBoardWrite(BasePermission):
    """Residents can read, board members+ can write."""
    def has_permission(self, request, view):
        community_id = _get_community_id(request)
        if not community_id:
            return False
        level = _get_user_role_level(request.user, community_id)
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return level >= ROLE_HIERARCHY["resident"]
        return level >= ROLE_HIERARCHY["board_member"]
