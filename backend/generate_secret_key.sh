#!/bin/bash
# Script to generate a secure SECRET_KEY for Django

python3 -c "from django.core.management.utils import get_random_secret_key; print('SECRET_KEY=' + get_random_secret_key())"
