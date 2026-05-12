# Laravel API Backend

This directory contains the Laravel API structure for syncing scraped products.

## Setup

1. Create a new Laravel project:
```bash
composer create-project laravel/laravel laravel-api
```

2. Install required packages:
```bash
composer require tymon/jwt-auth
```

3. Configure database and run migrations

## API Endpoints

### POST /api/products/import
Import a single product

Request:
```json
{
  "product_id": "abc123",
  "title": "Product Title",
  "price": "29.99",
  "original_price": "39.99",
  "stock": "100",
  "sold_count": "500",
  "shop_name": "Shop Name",
  "shop_url": "https://...",
  "description": "...",
  "slider_images": [],
  "color_images": [],
  "description_images": [],
  "variants": [],
  "attributes": []
}
```

### POST /api/products/images
Upload product images

### POST /api/products/variants
Sync product variants

### PUT /api/products/{id}/stock
Update product stock

### GET /api/products/{id}/status
Get product sync status

## Routes

```php
Route::prefix('products')->group(function () {
    Route::post('/import', [ProductController::class, 'import']);
    Route::post('/images', [ProductController::class, 'uploadImages']);
    Route::post('/variants', [ProductController::class, 'syncVariants']);
    Route::put('/{id}/stock', [ProductController::class, 'updateStock']);
    Route::get('/{id}/status', [ProductController::class, 'getStatus']);
});
```