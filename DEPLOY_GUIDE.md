# AK Store Deploy Guide

## Project Structure

- `backend/` -> FastAPI backend, DynamoDB access, S3 upload logic, seed scripts
- `front-web/` -> React/Vite frontend
- `.env` -> local environment values used for local testing
- `START_AK_STORE.bat` -> starts backend and frontend locally

## Current Hosted Setup

- Frontend: Vercel
- Backend API: AWS Lambda + API Gateway
- Database: DynamoDB on AWS
- Uploaded product images: S3 on AWS

Live URLs:

- Frontend: `https://ak-store-rxl.vercel.app`
- Backend: `https://23tkt4cqz3.execute-api.ap-south-1.amazonaws.com/prod`
- Health: `https://23tkt4cqz3.execute-api.ap-south-1.amazonaws.com/prod/api/health`

## Local Development

### 1. Check `.env`

Keep these values in root `.env`:

- `DATABASE_TYPE=dynamodb`
- `AWS_ACCESS_KEY_ID=...`
- `AWS_SECRET_ACCESS_KEY=...`
- `AWS_SESSION_TOKEN=...` if using temporary credentials
- `SECRET_KEY=...`
- `VITE_BACKEND_URL=http://localhost:8000`
- `CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://ak-store-rxl.vercel.app`

This means local backend still reads/writes directly to AWS DynamoDB and S3.

So yes:

- products are fetched from AWS
- categories are fetched from AWS
- uploaded product images go to AWS S3
- frontend shows those same AWS-backed records locally

## Start Locally

Double-click:

- `START_AK_STORE.bat`

Or run manually:

### Backend

```powershell
venv\Scripts\python.exe -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend

```powershell
cd front-web
npm install
npm run dev:frontend
```

Open:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:8000/api/health`

## What Happens Locally

Frontend:

- runs from `front-web/`
- calls `/api/...`
- Vite proxies `/api` and `/uploads` to `http://localhost:8000`

Backend:

- runs from `backend/`
- reads and writes DynamoDB on AWS
- uploads admin images to S3 on AWS

So your local changes can be tested against the real AWS data/services before deployment.

## Typical Local Workflow

1. Start the project with `START_AK_STORE.bat`
2. Make frontend changes in `front-web/src/`
3. Make backend changes in `backend/`
4. Test:
   - home page
   - login
   - admin add product
   - admin upload image
   - cart
   - checkout
   - profile
5. Run frontend type-check:

```powershell
cd front-web
npm run lint
```

6. Run frontend production build:

```powershell
cd front-web
npm run build
```

## Deploy Backend To AWS

Run from project root:

```powershell
npx serverless deploy --verbose
```

That deploys:

- FastAPI backend from `backend/`
- DynamoDB access
- S3 upload support
- Lambda + API Gateway

Verify after deploy:

- `https://23tkt4cqz3.execute-api.ap-south-1.amazonaws.com/prod/api/health`

## Deploy Frontend To Vercel

Run from `front-web/`:

```powershell
npx vercel --prod
```

Verify after deploy:

- `https://ak-store-rxl.vercel.app`
- `https://ak-store-rxl.vercel.app/api/health`

## If You Change Only Frontend

Deploy only frontend:

```powershell
cd front-web
npx vercel --prod
```

## If You Change Only Backend

Deploy only backend:

```powershell
npx serverless deploy --verbose
```

## If You Change Both

1. Test locally
2. Deploy backend first
3. Verify backend health
4. Deploy frontend
5. Verify live frontend

## Admin Product + Image Flow

When admin adds a product:

1. admin uploads image
2. backend uploads image to AWS S3
3. backend gets a public S3 URL
4. admin saves product
5. product record in DynamoDB stores the image URL
6. frontend fetches product from backend
7. frontend shows the image from S3

## Seeded Accounts

- Admin: `9999999999 / admin123`
- Executive: `8888888888 / exec123`
- Customer: `8210282102 / aditya123`
