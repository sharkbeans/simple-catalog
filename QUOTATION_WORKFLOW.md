# Quotation Request & Approval Workflow

This document describes the complete quotation request and approval workflow implemented in the system.

## Workflow Overview

### 1. Customer Submits Quotation Request
- Customers can visit `/quotations/create` (public, no login required)
- Fill in their details: name, contact number, email, address
- Add items from the cart
- Submit the quotation request
- **Status: Pending Review**
- Customer sees a success message that the request has been submitted

### 2. Admin Reviews Quotation Request
- Admin logs in and sees all quotation requests in `/quotations`
- Quotations with **Pending Review** status are highlighted in yellow
- Admin can click on a quotation to view details
- Admin has three options:
  - **Edit**: Modify customer details, items, prices, tax, notes
  - **Approve**: Accept the quotation request (moves to next step)
  - **Reject**: Decline the quotation request with a reason

### 3. Admin Approves and Amends Quotation
- Admin reviews the quotation request
- Can edit prices, quantities, tax, or any other details
- Click "Approve" button on quotation show page
- Optionally add admin notes (internal, not visible to customer)
- **Status: Approved**
- Quotation is now ready to be sent to customer

### 4. Admin Sends Quotation via WhatsApp
- Once approved, a "Send via WhatsApp" button appears
- Click the button to generate WhatsApp message with:
  - Customer name
  - Quotation number
  - Total amount
  - Valid until date
  - Link to view and approve quotation
- Opens WhatsApp Web/App with pre-filled message
- **Status: Sent to Customer**

### 5. Customer Reviews and Approves Quotation
- Customer receives WhatsApp message with quotation link
- Clicks link to view quotation details
- Reviews all items, prices, and terms
- Clicks "Approve Quotation" button
- Confirms approval in modal dialog
- **Status: Accepted**
- Approval timestamp and IP address are recorded

### 6. Admin Rejects Quotation (Alternative Path)
- If admin cannot approve the request
- Click "Reject" button on quotation show page
- Must provide a reason for rejection (admin notes)
- **Status: Rejected**
- Customer can see rejection status when viewing quotation

## Quotation Statuses

| Status | Color | Description |
|--------|-------|-------------|
| **Draft** | Gray | Created by admin, not yet finalized |
| **Pending Review** | Yellow | Customer request waiting for admin review |
| **Approved** | Green | Admin approved, ready to send to customer |
| **Sent** | Blue | Sent to customer via WhatsApp, awaiting customer approval |
| **Accepted** | Green | Customer has approved the quotation - **Final and Valid** |
| **Rejected** | Red | Admin rejected the request |

## Database Schema

### Fields in `quotations` table:
- `customer_email`: Customer's email address
- `admin_notes`: Internal notes from admin (review comments)
- `reviewed_by`: Foreign key to user who approved/rejected
- `reviewed_at`: Timestamp when admin reviewed
- `customer_approved_at`: Timestamp when customer approved
- `customer_ip`: IP address of customer when they approved

## Routes

### Public Routes
- `GET /quotations/create` - Customer quotation request form
- `POST /quotations` - Submit quotation request (creates with "pending" status)
- `GET /quotations/{access_token}/view` - View quotation (public link)
- `POST /quotations/{access_token}/customer-approve` - Customer approves quotation

### Admin Routes (requires authentication)
- `GET /quotations` - List all quotations
- `GET /quotations/{id}` - View quotation details
- `GET /quotations/{id}/edit` - Edit quotation
- `PUT /quotations/{id}` - Update quotation
- `POST /quotations/{id}/approve` - Admin approves quotation request
- `POST /quotations/{id}/reject` - Admin rejects quotation request
- `GET /quotations/{id}/send-whatsapp` - Generate WhatsApp message and mark as sent

## WhatsApp Integration

When admin clicks "Send via WhatsApp", the system:
1. Validates quotation is approved by admin
2. Extracts customer phone number
3. Generates public quotation URL using access token
4. Creates WhatsApp message with quotation details and approval link
5. Redirects to WhatsApp Web/App with pre-filled message
6. Updates quotation status to "Sent"

### WhatsApp Message Format:
```
Hello {Customer Name},

Your quotation {Quotation Number} is ready for your review!

Total: RM{Total Amount}
Valid until: {Valid Till Date}

Please review and approve your quotation here:
{Quotation URL}

Thank you for your business!
```

## Customer Experience

1. **Request**: Customer fills out quotation form without logging in
2. **Confirmation**: Sees success message explaining the review process
3. **Wait**: Status shows "Pending Review" - admin is reviewing the request
4. **Receive**: Gets WhatsApp message when admin approves and sends the quotation
5. **Review**: Views amended quotation with final prices via the link
6. **Approve**: Clicks "Approve Quotation" button to accept the terms
7. **Confirmed**: Status changes to "Accepted" - quotation is now valid
8. **No Login Required**: Entire customer journey is seamless without account creation

## Admin Experience

1. **Dashboard**: See all quotation requests in one place with color-coded statuses
2. **Review**: View customer details and requested items
3. **Amend**: Modify prices, quantities, tax, add/remove items, update details
4. **Approve/Reject**: Make decision with optional internal notes
5. **Send**: One-click WhatsApp sending with auto-generated message including approval link
6. **Track**: See when customer approves with timestamp and IP address
7. **Monitor**: View full audit trail of all actions

## Benefits

- **Customer-Friendly**: No login required for customers
- **Two-Stage Approval**: Admin reviews request first, then customer approves final quotation
- **Amendment Capability**: Admin can modify prices/items before sending to customer
- **Controlled Process**: Only admins can approve requests, only customers can approve final quotations
- **Efficient**: Quick review and amendment process for admin
- **Trackable**: All actions logged with timestamps, user info, and IP addresses
- **Professional**: WhatsApp integration for instant delivery
- **Flexible**: Admin can edit quotations before approving and sending
- **Transparent**: Status clearly shown at every step for both admin and customer
- **Quality Control**: Admin review ensures quotations meet business standards before customer sees them
- **Legal**: Customer approval creates a clear record of acceptance with timestamp and IP
