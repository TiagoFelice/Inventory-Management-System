import pytest
from django.contrib.auth.models import User


@pytest.mark.django_db
def test_current_user_endpoint_returns_superuser_flag(api_client, user):
    user.is_superuser = True
    user.save(update_fields=['is_superuser'])
    api_client.force_authenticate(user=user)

    response = api_client.get('/api/auth/me/')

    assert response.status_code == 200
    assert response.data['id'] == user.id
    assert response.data['username'] == user.username
    assert response.data['is_superuser'] is True


@pytest.mark.django_db
def test_non_superuser_cannot_access_user_management(authenticated_client):
    response = authenticated_client.get('/api/users/')

    assert response.status_code == 403


@pytest.mark.django_db
def test_superuser_can_list_and_create_users(api_client):
    admin_user = User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='pass1234',
    )
    api_client.force_authenticate(user=admin_user)
    User.objects.create_user(username='existing-user', password='pass1234')

    list_response = api_client.get('/api/users/')

    assert list_response.status_code == 200
    assert any(
        user['username'] == 'existing-user'
        for user in list_response.data['results']
    )

    create_response = api_client.post(
        '/api/users/',
        {
            'username': 'manager-user',
            'email': 'manager@example.com',
            'first_name': 'Manager',
            'last_name': 'User',
            'password': 'securepass123',
            'is_superuser': False,
            'is_active': True,
        },
        format='json',
    )

    assert create_response.status_code == 201
    created_user = User.objects.get(username='manager-user')
    assert created_user.email == 'manager@example.com'
    assert created_user.check_password('securepass123')
    assert created_user.is_staff is False


@pytest.mark.django_db
def test_superuser_can_update_user_without_changing_password(api_client):
    admin_user = User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='pass1234',
    )
    managed_user = User.objects.create_user(
        username='managed-user',
        email='managed@example.com',
        password='originalpass123',
    )
    api_client.force_authenticate(user=admin_user)

    response = api_client.patch(
        f'/api/users/{managed_user.id}/',
        {
            'first_name': 'Updated',
            'is_superuser': True,
        },
        format='json',
    )

    assert response.status_code == 200
    managed_user.refresh_from_db()
    assert managed_user.first_name == 'Updated'
    assert managed_user.is_superuser is True
    assert managed_user.is_staff is True
    assert managed_user.check_password('originalpass123')


@pytest.mark.django_db
def test_superuser_can_delete_user(api_client):
    admin_user = User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='pass1234',
    )
    managed_user = User.objects.create_user(
        username='delete-me',
        email='delete-me@example.com',
        password='pass1234',
    )
    api_client.force_authenticate(user=admin_user)

    response = api_client.delete(f'/api/users/{managed_user.id}/')

    assert response.status_code == 204
    assert not User.objects.filter(id=managed_user.id).exists()


@pytest.mark.django_db
def test_superuser_without_staff_flag_can_access_user_management(api_client):
    manager_user = User.objects.create_user(
        username='manager',
        email='manager@example.com',
        password='pass1234',
        is_superuser=True,
        is_staff=False,
    )
    api_client.force_authenticate(user=manager_user)

    response = api_client.get('/api/users/')

    assert response.status_code == 200


@pytest.mark.django_db
def test_creating_superuser_from_manager_syncs_staff_flag(api_client):
    admin_user = User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='pass1234',
    )
    api_client.force_authenticate(user=admin_user)

    response = api_client.post(
        '/api/users/',
        {
            'username': 'ui-created-superuser',
            'email': 'ui-created-superuser@example.com',
            'password': 'securepass123',
            'is_superuser': True,
            'is_active': True,
        },
        format='json',
    )

    assert response.status_code == 201
    created_user = User.objects.get(username='ui-created-superuser')
    assert created_user.is_superuser is True
    assert created_user.is_staff is True
