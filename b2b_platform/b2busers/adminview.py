from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import CustomUser
from .permissions import IsSuperUser
from .serializers import UserSerializerActivation
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q


class AdminUpdateUser(APIView):
    permission_classes = [IsSuperUser]

    def post(self, request, user_id):
        user = get_object_or_404(CustomUser, id=user_id)

        credit = request.data.get("credit")
        period = request.data.get("period")
        status_value = request.data.get("status")
        reason = (request.data.get("reason") or "").strip()

        if credit is None or period is None:
            return Response(
                {"error": "Both 'credit' and 'period' are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not user.company:
            return Response(
                {"error": "User has no associated company."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if status_value is not None:
            allowed = {
                CustomUser.STATUS_PENDING,
                CustomUser.STATUS_ACTIVE,
                CustomUser.STATUS_FIX_ISSUES,
                CustomUser.STATUS_BLOCKED,
            }
            if status_value not in allowed:
                return Response(
                    {"error": "Invalid status"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Reason is mandatory for Blocked and FixIssues
            if status_value in {CustomUser.STATUS_BLOCKED, CustomUser.STATUS_FIX_ISSUES} and not reason:
                return Response(
                    {"error": "Reason is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user.status = status_value
            user.reason = reason if status_value in {CustomUser.STATUS_BLOCKED, CustomUser.STATUS_FIX_ISSUES} else ""

        user.company.credit = credit
        user.company.period = period
        user.company.save()
        user.save()

        serializer = UserSerializerActivation(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminUserRow(APIView):
    permission_classes = [IsSuperUser]
    serializer_class = UserSerializerActivation

    def get(self, request, user_id):
        user = get_object_or_404(CustomUser, id=user_id)
        serializer = self.serializer_class(user)
        return Response(serializer.data)


class AdminUserPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class SearchUsers(ListAPIView):
    permission_classes = [IsSuperUser]
    serializer_class = UserSerializerActivation
    pagination_class = AdminUserPagination

    def get_queryset(self):
        request = self.request
        query = request.query_params.get('q')
        status_param = request.query_params.get('status')
        active = request.query_params.get('active')  # backward-compat

        queryset = CustomUser.objects.exclude(id=request.user.id)

        if status_param:
            if status_param != "all":
                queryset = queryset.filter(status=status_param)
        elif active is not None:
            # Legacy mapping: active=true -> Active, active=false -> Pending
            if active.lower() in ['true', '1']:
                queryset = queryset.filter(status=CustomUser.STATUS_ACTIVE)
            elif active.lower() in ['false', '0']:
                queryset = queryset.filter(status=CustomUser.STATUS_PENDING)

        if query:
            queryset = queryset.filter(
                Q(first_name__icontains=query) | Q(last_name__icontains=query) | Q(company__name__icontains=query)
            )

        return queryset
