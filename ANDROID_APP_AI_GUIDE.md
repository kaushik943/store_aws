# Android App AI Guide

## Purpose

This file is for any future AI agent that will build an Android app for this project.

The goal is:

- reuse the existing AWS backend
- reuse the existing DynamoDB data
- reuse the existing S3 image flow
- keep the Android app compatible with the current web app behavior

## Current Architecture

### Backend

- Framework: FastAPI
- Folder: `backend/`
- Hosted on: AWS Lambda + API Gateway
- Base URL:

```text
https://23tkt4cqz3.execute-api.ap-south-1.amazonaws.com/prod
```

- Health endpoint:

```text
https://23tkt4cqz3.execute-api.ap-south-1.amazonaws.com/prod/api/health
```

### Database

- Database: DynamoDB
- Used directly by backend
- Local development also uses AWS DynamoDB, not local SQLite

### Images

- Admin uploads product/category images through backend
- Backend stores images in AWS S3
- Product records store image URLs
- Frontend renders the stored S3 image URL directly

So Android should also render image URLs directly from backend responses.

### Web Frontend

- Folder: `front-web/`
- Hosted on: Vercel
- URL:

```text
https://ak-store-rxl.vercel.app
```

## Important Rule For Android App

Do not create a separate backend for Android.

Use the same AWS backend already in production.

That means:

- same auth
- same products API
- same cart/order APIs
- same reviews/coupons/admin flows if needed

## Auth Model

### Login

Endpoint:

```text
POST /api/auth/login
```

Body:

```json
{
  "phone": "8210282102",
  "password": "aditya123"
}
```

Response shape:

```json
{
  "id": 8210282102,
  "phone": "8210282102",
  "name": "Aditya Kaushik",
  "email": "kaushikaditya943@gmail.com",
  "role": "customer",
  "token": "JWT_TOKEN",
  "street_address": "...",
  "city": "...",
  "state": "...",
  "pincode": "...",
  "landmark": "..."
}
```

### Admin login

Endpoint:

```text
POST /api/auth/admin-login
```

### OTP flow

Available:

- `POST /api/auth/request-otp`
- `POST /api/auth/verify-otp`

### Token usage

Protected routes use the `Authorization` header.

Examples:

```text
Authorization: JWT_TOKEN
```

or

```text
Authorization: Bearer JWT_TOKEN
```

Current backend accepts either style.

## Main API Areas For Android

### Public/customer

- `GET /api/categories`
- `GET /api/products`
- `GET /api/products/search?q=...`
- `GET /api/products/{product_id}/reviews`
- `POST /api/products/{product_id}/reviews`
- `GET /api/delivery-slots`
- `GET /api/pickup-locations`
- `GET /api/pickup-slots`

### Authenticated customer

- `GET /api/user/addresses`
- `POST /api/user/addresses`
- `DELETE /api/user/addresses/{address_id}`
- `GET /api/user/cart`
- `POST /api/user/cart/sync`
- `POST /api/coupons/validate`
- `GET /api/orders`
- `POST /api/orders`

### Admin

- `GET /api/admin/stats`
- `GET /api/admin/orders`
- `PUT /api/admin/orders/{order_id}/status`
- `DELETE /api/admin/orders/{order_id}`
- `GET /api/admin/users`
- `PUT /api/admin/users/{user_id}/role`
- `GET /api/admin/users/{user_id}/cart`
- `DELETE /api/admin/users/{user_id}`
- `POST /api/admin/products`
- `PATCH /api/admin/products/{product_id}/inline`
- `DELETE /api/admin/products/{product_id}`
- `POST /api/admin/categories`
- `DELETE /api/admin/categories/{category_id}`
- `POST /api/admin/upload`
- `GET /api/admin/coupons`
- `POST /api/admin/coupons`
- `DELETE /api/admin/coupons/{coupon_id}`
- `POST /api/admin/delivery-slots`
- `DELETE /api/admin/delivery-slots/{slot_id}`
- `POST /api/admin/pickup-locations`
- `PATCH /api/admin/pickup-locations/{location_id}/toggle`
- `DELETE /api/admin/pickup-locations/{location_id}`
- `POST /api/admin/pickup-slots`
- `PATCH /api/admin/pickup-slots/{slot_id}/toggle`
- `DELETE /api/admin/pickup-slots/{slot_id}`

### Executive

- `GET /api/executive/orders`
- `PUT /api/executive/items/{item_id}/pick`

## Product/Image Behavior

Android app should assume:

- `product.image` is the main product image
- this is usually a public S3 URL
- render it directly in the app

Do not rewrite image URLs unless clearly necessary.

If some older product data still contains plain filenames, treat that as legacy data. The backend now normalizes old seed image values to usable placeholder URLs.

## Order Behavior

When creating orders, send:

- items
- total
- address id or pickup info
- delivery slot or pickup slot
- optional coupon
- discount amount
- order type

Example:

```json
{
  "items": [
    { "id": 1, "quantity": 2, "price": 40 },
    { "id": 2, "quantity": 1, "price": 30 }
  ],
  "total": 110,
  "address_id": "ADDRESS_ID",
  "delivery_slot_id": 1,
  "coupon_id": 1,
  "discount_amount": 11,
  "order_type": "delivery"
}
```

## Cart Behavior

Current cart sync model:

- app keeps local cart state
- app syncs cart to backend using:

```text
POST /api/user/cart/sync
```

Body:

```json
[
  { "product_id": 1, "quantity": 2 },
  { "product_id": 2, "quantity": 1 }
]
```

Then fetch:

```text
GET /api/user/cart
```

## Android App Recommendations

### Suggested stack

Prefer:

- Kotlin
- Jetpack Compose
- Retrofit or Ktor client
- Coil for image loading
- DataStore or Room for local token/session cache

### Session handling

- store JWT securely
- attach token to authenticated requests
- clear token on logout

### Network design

- centralize API base URL in one config file
- create typed models matching backend JSON
- handle timeouts and offline states
- surface backend errors clearly

### Image handling

- use direct URL loading with caching
- do not proxy S3 through the app

## Base URL Config Recommendation

Android app should have environment-based base URLs:

### Production

```text
https://23tkt4cqz3.execute-api.ap-south-1.amazonaws.com/prod
```

### Local backend testing from Android emulator

If backend runs locally on your PC:

```text
http://10.0.2.2:8000
```

For a real Android device on same Wi-Fi, use your computer's LAN IP.

## Local Development In This Repo

Project layout:

- `backend/`
- `front-web/`
- `START_AK_STORE.bat`
- `DEPLOY_GUIDE.md`

Local backend:

```text
http://localhost:8000
```

Local frontend:

```text
http://localhost:5173
```

The backend still talks to AWS DynamoDB and S3 during local development.

So local testing already reflects real cloud-backed data behavior.

## Deployment Rules

If backend changes:

Run from repo root:

```powershell
npx serverless deploy --verbose
```

If frontend changes:

Run from `front-web/`:

```powershell
npx vercel --prod
```

If Android app is created later:

- no AWS backend duplication needed
- no separate database needed
- Android app should call the same deployed backend

## Seed/Test Accounts

- Admin: `9999999999 / admin123`
- Executive: `8888888888 / exec123`
- Customer: `8210282102 / aditya123`

## Critical Constraints For Future AI

1. Do not replace the backend unless explicitly requested.
2. Do not introduce a second source of truth for products/orders/users.
3. Do not move image storage away from S3 unless explicitly requested.
4. Keep API compatibility with current web frontend.
5. Prefer using the existing backend contract over inventing new endpoints.
6. If new mobile-specific endpoints are ever added, they should still remain compatible with the current system design.
