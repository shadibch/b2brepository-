# B2B Platform

A B2B commerce and company-management platform: a Django REST Framework backend
serving a React single-page application. It supports multi-company / multi-branch
operations, company-admin and staff roles, a product catalog with category
hierarchies, cart and purchase requests, an order lifecycle with invoicing,
reporting, navigation management, and a complaint (support ticket) workflow. The
UI is bilingual (Arabic / English) with RTL support.

## Tech stack

| Layer     | Technologies |
|-----------|--------------|
| Backend   | Python 3.10, Django 4.2+/5.2, Django REST Framework, SimpleJWT, PostgreSQL, Cloudinary (media), WhiteNoise (static), Gunicorn, ReportLab, Babel |
| Frontend  | React 19, Vite 6, React Router 7, MUI 7, Ant Design, Bootstrap, Tailwind, axios, i18next |
| Deployment| Render (`render.yml.txt`), Gunicorn, WhiteNoise, Cloudinary |

## Repository layout

```
b2brepository/
├── b2b_platform/                 # Django project (backend)
│   ├── b2b_platform/             # settings, urls, wsgi/asgi
│   ├── b2busers/                 # custom user, auth, complaints
│   ├── company/                  # companies, branches
│   ├── product/                  # products, categories, groups
│   ├── cart/                     # cart, orders, purchase requests, invoices
│   ├── navigation/               # navigation links
│   ├── locale/                   # backend translations (ar / en)
│   ├── manage.py
│   └── requirements.txt
├── b2bfrontend/
│   └── b2b-react-app/            # React + Vite SPA
│       ├── src/
│       ├── package.json
│       └── vite.config.js
├── build.sh                      # Render build script
├── render.yml.txt                # Render service definition
└── requirements.txt
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL
- (Optional) A Cloudinary account for media uploads
- (Optional) SMTP credentials for outgoing email

## Backend setup

```bash
cd b2b_platform
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in `b2b_platform/` (loaded via `python-dotenv`):

```dotenv
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_ENGINE=django.db.backends.postgresql
DB_NAME=b2b
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_HOST_USER=noreply@example.com
EMAIL_HOST_PASSWORD=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

EXPIARY_TOKEN_TIME=10
```

Apply migrations and run the server:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 8000
```

The API is then available at `http://localhost:8000` and the Django admin at
`http://localhost:8000/administrator/`.

## Frontend setup

```bash
cd b2bfrontend/b2b-react-app
npm install

npm run dev      # http://localhost:5173
npm run build    # production build to dist/
npm run preview  # preview the production build
npm run lint
```

Environment configuration:

- `src/config/development.js` - `API_BASE_URL = http://localhost:8000`
- `src/config/production.js` - same-origin (empty base URL)
- `src/config/index.js` selects the config based on `NODE_ENV`.

Make sure the dev-server origin (`http://localhost:5173`) is listed in the
backend's `CORS_ALLOWED_ORIGINS`.

## Authentication

The API uses JWT (SimpleJWT). The frontend stores the access and refresh tokens
in `localStorage` and automatically refreshes on `401` responses
(`src/components/axiosInstance.jsx`).

- `POST /api/login/` - obtain access + refresh tokens
- `POST /api/refresh/` - refresh the access token
- `POST /register/` - company-admin registration
- `POST /api/register_staff/` - staff registration
- `POST /api/request/resetpassword/`, `POST /api/reset_password/` - password reset
- `GET  /api/user/` - current user

**Roles** (`CustomUser.role`): `super_user`, `company_admin`, `staff`.
**Account status**: `Pending`, `Active`, `FixIssues`, `Blocked` (only `Active`
and `FixIssues` users can log in).

## Main API areas

- Auth & users: `/api/login/`, `/api/user/`, `/api/users/`, `/api/register_staff/`
- Companies & branches: `/api/company-management/`, `/api/companies/...`, `/branches/...`
- Catalog: `/api/categories/`, `/api/products/`, `/api/product_groups/`, `/api/admin/...`
- Cart & orders: `/api/cart/`, `/api/purchase_request/`, `/api/orders/`,
  `/api/admin/orders/...`, `/api/download_invoice/<order_id>/`
- Navigation: `/api/navigation/`
- Complaints: `/api/complaints/`, `/api/complaints/<id>/`,
  `/api/complaints/<id>/comments/`
- Django admin: `/administrator/`

## Localization

Backend translations live under `b2b_platform/locale/` (Arabic and English; the
settings also list French). The frontend uses `i18next` and supports RTL layouts.

## Deployment

`render.yml.txt` describes a Render web service:

- Build command: `./build.sh`
- Start command: `cd b2b_platform && gunicorn b2b_platform.wsgi:application`
- Python version: `3.10`

`build.sh` installs dependencies and runs `collectstatic`; static files are
served by WhiteNoise and media by Cloudinary. The SPA is served by Django from
the built frontend bundle (`b2b_platform/react/dist`); build the frontend and
place its `dist/` output there before deploying.

## Notes

- `b2b_platform/b2b_platform/settings.py` currently hardcodes `SECRET_KEY`,
  `DEBUG`, and `ALLOWED_HOSTS`. Move these to environment variables before
  deploying to production.
- The complaint feature adds the `Complaint` and `ComplaintComment` models.
  A migration is required (`python manage.py makemigrations b2busers` then
  `python manage.py migrate`) before the complaint endpoints will work.
- Tests (where present) are run with `python manage.py test` or `run_test.bat`
  in `b2b_platform/`.
