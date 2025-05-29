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
        active = request.data.get("active")

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

        # Normalize `active` input to boolean if provided
        if active is not None:
            if str(active).lower() in ['true', '1']:
                user.is_active = True
            elif str(active).lower() in ['false', '0']:
                user.is_active = False

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
        active = request.query_params.get('active')

        queryset = CustomUser.objects.exclude(id=request.user.id)

        if active is not None:
            if active.lower() in ['true', '1']:
                queryset = queryset.filter(is_active=True)
            elif active.lower() in ['false', '0']:
                queryset = queryset.filter(is_active=False)

        if query:
            queryset = queryset.filter(
                Q(first_name__icontains=query) | Q(last_name__icontains=query) | Q(company__name__icontains=query)
            )

        return queryset
