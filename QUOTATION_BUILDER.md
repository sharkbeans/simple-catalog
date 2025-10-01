# Quotation Builder Feature

## Overview
The quotation builder feature allows you to create professional quotations from your cart items or from scratch. It integrates the open-source Quotr PHP library to generate quotations in PDF format.

## Features

### 1. Create Quotations
- Build quotations from scratch or from cart items
- Add customer information (name, address, contact)
- Manage quotation items (name, description, quantity, price)
- Set validity period (valid from/till dates)
- Calculate subtotal, tax, and total automatically
- Add custom notes and terms & conditions
- Professional PDF template with clean design

### 2. Manage Quotations
- View all quotations in a list
- Track quotation status (draft, sent, accepted, rejected)
- Edit existing quotations
- Delete quotations

### 3. Export Quotations
- Download as PDF (professional format)
- Share via email or other channels

### 4. Cart Integration
- Create quotations directly from cart items
- One-click conversion from cart to quotation
- Automatically populates items, quantities, and prices

## How to Use

### Creating a Quotation from Cart

1. Add items to your cart from the public catalog
2. Go to the Cart page
3. Click "Create Quotation" button
4. Fill in customer information
5. Adjust validity dates if needed
6. Add notes or terms & conditions
7. Click "Create Quotation"

### Creating a Quotation from Scratch

1. Log in as admin
2. Navigate to "Quotations" from the sidebar
3. Click "Create Quotation"
4. Fill in customer information
5. Add items manually using "Add Item" button
6. Set quantities and prices
7. Configure validity dates
8. Add notes
9. Click "Create Quotation"

### Viewing and Managing Quotations

1. Log in as admin
2. Navigate to "Quotations" from the sidebar
3. View list of all quotations
4. Click on a quotation number to view details
5. Use action buttons to:
   - Edit quotation
   - Download PDF
   - Delete quotation

### Downloading Quotations

From the quotation detail page, click "Download PDF" to open the PDF in a new tab for printing or saving.

## Technical Details

### Database Schema
The quotations table includes:
- `quotation_number` - Auto-generated unique identifier (QT-YYYYMM-####)
- `customer_name`, `customer_address`, `customer_contact` - Customer details
- `valid_from`, `valid_till` - Validity period
- `items` - JSON array of quotation items
- `subtotal`, `tax`, `total` - Calculated amounts
- `notes` - Additional notes
- `status` - Current status (draft/sent/accepted/rejected)
- `user_id` - Creator reference

### Template
The PDF template is stored in `/public/quolib/PDF/simple.php` - a clean, professional design suitable for all business needs.

### Dependencies
- **mpdf/mpdf** - PDF generation (v6.1)

### Routes
- `GET /quotations` - List all quotations
- `GET /quotations/create` - Show create form
- `POST /quotations` - Store new quotation
- `GET /quotations/{id}` - View quotation details
- `GET /quotations/{id}/edit` - Show edit form
- `PUT /quotations/{id}` - Update quotation
- `DELETE /quotations/{id}` - Delete quotation
- `GET /quotations/{id}/download` - Download quotation as PDF

## Customization

### Company Information
To customize company information in quotations, edit:
`app/Http/Controllers/QuotationController.php` (download method)

Look for the company information section:
```php
$quotr->set('company', [
    url('/logo.png'),
    public_path('logo.png'),
    config('app.name', 'Simple Catalog'),
    'Your Company Address',
    'Phone: xxx-xxx-xxx',
    url('/'),
    'info@example.com'
]);
```

### Template
To customize the PDF template, edit the file:
- `/public/quolib/PDF/simple.php` - PDF template structure and styling

## Troubleshooting

### PDF Generation Issues
If you encounter issues with PDF generation:
1. Check that composer dependencies are installed: `composer install`
2. Verify that mpdf/mpdf package is installed
3. Ensure vendor path is correctly configured in `/public/quolib/quotr.php`
4. Check PHP extensions: mbstring is required

### Template Not Found
Ensure the template file exists at:
- `/public/quolib/PDF/simple.php`

## Credits
This feature uses the open-source [Quotr library](https://github.com/code-boxx/quotr) by Code Boxx.
