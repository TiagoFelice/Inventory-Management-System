#!/bin/sh
set -eu

until pg_isready -h "${DB_HOST:-db}" -p "${DB_PORT:-5432}" -U "${DB_USER:-inventory_user}" -d "${DB_NAME:-inventory}" >/dev/null 2>&1; do
  echo "Waiting for PostgreSQL..."
  sleep 1
done

python manage.py migrate --noinput
python manage.py collectstatic --noinput

if [ "${SEED_DEMO_DATA:-false}" = "true" ]; then
  python manage.py seed_demo_inventory \
    --username "${DEMO_USERNAME:-DEMO}" \
    --password "${DEMO_PASSWORD:-demo1234}" \
    --multiplier "${DEMO_MULTIPLIER:-1}"
fi

exec gunicorn --bind "0.0.0.0:${PORT:-8000}" ims_backend.wsgi:application
