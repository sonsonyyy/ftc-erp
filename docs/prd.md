# Fire Protection Company ERP — AI Agent Notes

## Document Purpose
This markdown is an **AI-agent-friendly implementation brief** derived from the full PRD for the **Fire Protection Company ERP**.

Use this as the primary high-level product context for planning, implementation, and code generation.

---

## Product Summary
Build an internal ERP for a fire protection company focused on:

- quotation tracking and sales KPI monitoring
- customer and site management
- projects
- work orders / service jobs
- inventory and warehouse
- purchasing / supplier management
- billing / accounts receivable
- employee and payroll basics
- tax and statutory reporting
- compliance and renewals
- document attachments
- dashboards and reports

This is an **internal business system**, not a public SaaS product.

---

## Critical Business Rules

### 1. Installed equipment is NOT a core asset registry
Do **not** build a standalone installed-equipment / site-equipment registry as a core module.

Reason:
- once equipment is delivered and installed at the client site, it is considered the **client's asset**
- the ERP should track company-owned inventory **before issuance/delivery**
- the ERP may still reference equipment in:
  - project descriptions
  - work order descriptions
  - inventory issuance records
  - billing support documents
  - file attachments

### 2. Quotations stay external
Do **not** build a quotation builder or estimation engine.

Quotations and estimates are prepared externally, mainly in **Excel**.

The ERP must only:
- register quotation records
- attach quotation files
- track quotation statuses
- link quotations to customers/sites
- convert awarded quotations into projects or work orders
- monitor quotation KPIs

### 3. Sales KPI tracking is in scope
Even though quotations are external, the ERP must support management visibility such as:
- total quotations submitted
- total quotations materialized
- quotation conversion rate
- total quoted value
- awarded value
- lost quotations
- pending quotations
- lost reasons

### 4. Compliance and renewals are required
The ERP must track corporate compliance items such as:
- GIS
- PCAB
- Mayor's Permit
- SSS employer compliance
- Pag-IBIG employer compliance
- PhilHealth employer compliance

### 5. Payroll is basic, not full HRIS
Include:
- employee masterfile
- departments/positions
- salary basics
- payroll runs
- government IDs
- deductions
- payroll-linked statutory support

Do **not** treat this as a full HRIS or talent-management platform.

---

## Product Goals
The ERP should help the company:

- centralize operational records
- track quotations and conversion performance
- manage project and service execution
- control stock and purchasing
- bill customers and monitor receivables
- prepare payroll-linked statutory records
- monitor deadlines, renewals, and filings
- improve management visibility

---

## MVP Scope

### In Scope
- authentication and role-based access
- dashboard and KPI monitoring
- customer and site management
- quotation tracking / sales KPI monitoring
- projects
- work orders / service jobs
- inventory and warehouse
- purchasing / supplier management
- billing / accounts receivable
- employee and payroll basics
- tax and statutory reporting
- compliance and renewals tracking
- file attachments and document repository
- operational and management reports

### Out of Scope
- installed equipment / client asset registry
- built-in quotation generation
- built-in estimation engine
- advanced accounting / full general ledger
- customer portal
- offline-first field app
- route optimization
- OCR / AI extraction for MVP
- full CRM sales automation
- full HRIS suite

---

## Core Modules

### 1. Dashboard
Purpose:
- provide management and staff with a summary of sales, operations, finance, inventory, payroll, and compliance

Key widgets:
- quotations by status
- quotation conversion rate
- awarded quotation value
- projects by status
- work orders by status
- low stock items
- pending purchase orders
- unpaid invoices
- compliance deadlines
- payroll summary snapshot

---

### 2. Customers & Sites
Purpose:
- maintain customer master records and service/project locations

Key features:
- customer masterfile
- site records
- contact persons
- billing details
- tax details
- attachments

Core entities:
- customers
- customer_sites
- customer_contacts

---

### 3. Quotation Tracking / Sales KPI Monitoring
Purpose:
- track externally prepared quotations and monitor sales conversion

Key features:
- quotation registry
- customer/site linkage
- quotation number
- quotation date
- subject/title
- quotation amount
- validity date
- Excel attachment upload
- status tracking
- awarded/lost/pending tagging
- lost reason logging
- conversion to project or work order
- KPI dashboards
- status history

Quotation statuses:
- Draft
- Submitted
- Under Review
- Awarded
- Lost
- Cancelled
- Expired

Required KPI outputs:
- total quotations submitted
- total quotations awarded/materialized
- quotation conversion rate
- total quotation value
- awarded value
- value conversion rate
- pending quotation count
- lost quotation count
- average days to materialize
- top customers by quotation value
- top customers by awarded value
- lost reasons summary

Core entities:
- quotations
- quotation_status_logs

---

### 4. Projects
Purpose:
- track larger customer jobs such as installation, upgrades, corrective works, contract-based jobs

Key features:
- project creation
- linked customer/site
- optional linked quotation
- status tracking
- target dates
- assignments
- attachments

Project statuses:
- Draft
- Open
- In Progress
- On Hold
- Completed
- Cancelled

Core entities:
- projects
- project_assignments
- project_status_logs

---

### 5. Work Orders / Service Jobs
Purpose:
- track field/service execution

Key features:
- work order creation
- link to customer/site
- optional link to project
- optional link to quotation
- schedule date
- assigned staff
- materials used
- findings/notes
- attachments
- completion tracking

Work order types:
- Preventive Maintenance
- Corrective Service
- Emergency Service
- Inspection-related Work
- Installation Support
- Other Service Job

Work order statuses:
- Draft
- Scheduled
- In Progress
- For Review
- Completed
- Closed
- Cancelled

Core entities:
- work_orders
- work_order_assignments
- work_order_materials
- work_order_logs

---

### 6. Inventory & Warehouse
Purpose:
- track company-owned stock before issuance

Key features:
- item master
- categories
- warehouses
- stock balances
- stock in/out
- adjustments
- stock issuance to project/work order
- returns
- reorder levels
- movement history

Important rule:
- track inventory while company-owned
- once issued/delivered, track transaction history only
- do not convert into client-asset registry

Core entities:
- inventory_categories
- inventory_items
- warehouses
- stock_balances
- stock_movements
- stock_issuances
- stock_issuance_items
- stock_returns
- stock_return_items

---

### 7. Purchasing / Supplier Management
Purpose:
- support material procurement and receiving

Key features:
- supplier masterfile
- purchase requests
- purchase orders
- receiving records
- attachments
- supplier references

PO statuses:
- Draft
- Submitted
- Approved
- Partially Received
- Fully Received
- Cancelled

Core entities:
- suppliers
- purchase_requests
- purchase_request_items
- purchase_orders
- purchase_order_items
- purchase_receipts
- purchase_receipt_items

---

### 8. Billing / Accounts Receivable
Purpose:
- track billings, invoices, receivables, and payments

Key features:
- invoice generation
- link to project/work order
- optional link to quotation
- supporting document attachments
- payment entry
- aging and balance tracking

Invoice statuses:
- Draft
- Issued
- Partially Paid
- Paid
- Overdue
- Cancelled

Core entities:
- invoices
- invoice_items
- payments
- payment_allocations

---

### 9. Employee & Payroll Basic
Purpose:
- maintain employee records and support payroll processing

Key features:
- employee masterfile
- departments and positions
- salary setup
- government IDs
- payroll runs
- payroll entries
- deductions
- payroll summaries

Core entities:
- departments
- positions
- employees
- payroll_runs
- payroll_entries
- payroll_deductions

---

### 10. Tax & Statutory Reports
Purpose:
- support tax and statutory output generation from source records

Expected support includes:
- Form 1601-C
- Form 1604-C
- Form 2316
- Form 2307
- Form 1601-E / 1601-EQ
- VAT summaries
- filing history
- audit trail

Important implementation rule:
- derive these from source transactions where possible
- do not force duplicate manual encoding if avoidable

Core entities:
- withholding_records
- vat_records
- tax_report_runs
- tax_report_items
- tax_certificates

---

### 11. Compliance & Renewals
Purpose:
- track company licenses, permits, filings, deadlines, and recurring obligations

Key features:
- compliance record master
- due date and expiry date tracking
- recurrence rules
- reminder settings
- assigned responsible person
- attachments
- submission history
- renewal history
- dashboard
- calendar view

Sample compliance records:
- GIS
- PCAB
- Mayor's Permit
- SSS employer compliance
- Pag-IBIG employer compliance
- PhilHealth employer compliance

Compliance statuses:
- Draft
- Active
- Due Soon
- For Renewal
- For Filing
- In Progress
- Submitted
- Renewed
- Expired
- Overdue
- Archived

Core entities:
- compliance_templates
- compliance_records
- compliance_tasks
- compliance_alerts
- compliance_submissions

---

### 12. Attachments / Document Repository
Purpose:
- reusable file upload and linking across modules

Must support attachment contexts:
- customers
- sites
- quotations
- projects
- work orders
- invoices
- suppliers
- compliance records
- payroll/tax records

Important use case:
- Excel quotation files must be attachable to quotations, projects, work orders, invoices, and customer/site records if needed

Core entities:
- attachments
- attachment_links

---

## User Roles

### Super Admin
Full system access.

### Sales Admin / Business Development
Can:
- register quotations
- upload quotation files
- update quotation statuses
- track sales KPI records

### Operations Admin
Can:
- manage customers/sites
- manage projects
- manage work orders
- link quotations to execution records

### Project Coordinator
Can:
- monitor and update assigned projects and work orders

### Warehouse / Inventory Officer
Can:
- manage inventory items
- stock movements
- issuance and returns

### Purchasing Officer
Can:
- manage suppliers
- purchase requests/orders
- receiving

### Billing / Accounting Staff
Can:
- create invoices
- record payments
- view AR and billing reports
- maintain tax-related billing data

### HR / Payroll Officer
Can:
- manage employees
- run payroll
- manage deductions and government IDs

### Compliance Officer / Corporate Admin
Can:
- maintain compliance records
- manage reminders
- upload renewal documents
- track submission history

### Management / CEO
Can:
- view dashboards
- review KPIs
- monitor projects, receivables, and compliance status

---

## Key Workflows

### Quotation Workflow
1. Create quotation record
2. Link customer and site
3. Enter quotation date and amount
4. Attach Excel quotation file
5. Mark as submitted
6. Update status over time
7. If awarded, convert into:
   - project
   - work order
   - both, depending on process
8. If lost, record lost reason
9. Feed KPI dashboards

### Project Workflow
1. Create customer and site
2. Create project
3. Optionally link awarded quotation
4. Assign staff
5. Issue materials
6. Create work orders if needed
7. Track status
8. Generate billing
9. Close project

### Work Order Workflow
1. Create work order
2. Link customer/site
3. Optionally link project and quotation
4. Assign staff
5. Record materials used
6. Record job findings
7. Complete and close
8. Trigger billing if needed

### Purchasing Workflow
1. Create purchase request
2. Create purchase order
3. Receive items
4. Update stock
5. Store supplier references and attachments

### Billing Workflow
1. Create invoice
2. Link project/work order/quotation where applicable
3. Attach support files
4. Record payment
5. Monitor outstanding balance

### Compliance Workflow
1. Create compliance record
2. Set recurrence and due/expiry dates
3. Assign owner
4. Upload documents
5. Generate reminders
6. Record submission or renewal
7. Update next due date

### Payroll Workflow
1. Create/update employee records
2. Run payroll
3. Generate payroll entries
4. Record deductions
5. Produce source data for statutory reports

---

## Success Metrics / KPI Targets
The ERP should support measurement of:

### Sales
- total quotations submitted
- quotation conversion rate
- awarded quotation value
- lost quotations count
- pending quotations count

### Operations
- active projects tracked
- work orders recorded
- project and work order visibility

### Inventory
- stock balance accuracy
- low-stock tracking
- movement visibility

### Billing
- invoice visibility
- aging visibility
- collection tracking

### Compliance
- missed renewal incidents
- upcoming due items
- overdue filings

### Adoption
- usage per department
- percentage of workflows recorded in ERP

---

## Tech Stack / Implementation Context
Target stack:

- Laravel 13
- Inertia.js
- React
- TypeScript
- PostgreSQL
- Tailwind CSS
- queues / notifications / scheduler
- local or S3-compatible file storage

Recommended architecture:
- modular monolith
- domain-based folders
- server-side routes with Inertia pages
- reusable attachments subsystem
- report generation from source records

---

## Recommended Build Order

### Phase 0 — Foundation
Build first:
- Laravel 13 app bootstrap
- auth
- roles and permissions
- base layout and navigation
- shared UI components
- attachment system
- audit log foundation
- notification foundation

### Phase 1 — Sales + Core Operations MVP
Build in order:
1. Customers & Sites
2. Quotation Tracking / Sales KPI
3. Projects
4. Work Orders
5. Inventory
6. Purchasing
7. Billing
8. Dashboard widgets

### Phase 2 — Payroll + Statutory + Compliance
Build in order:
1. Employees / departments / positions
2. Payroll runs and payroll entries
3. Withholding / contribution source records
4. Tax report runs
5. Compliance records and renewals
6. Reminder jobs and calendar views
7. Management dashboards

### Phase 3 — Hardening
Build later:
- approvals
- escalations
- recurring templates
- better search and filters
- exports
- richer audit trails
- background jobs for heavy reports

---

## Database Entity List

### Core / Security
- users
- roles
- permissions
- role_user
- permission_role
- audit_logs

### Shared Files
- attachments
- attachment_links

### Customers
- customers
- customer_sites
- customer_contacts

### Quotations
- quotations
- quotation_status_logs

### Projects
- projects
- project_assignments
- project_status_logs

### Work Orders
- work_orders
- work_order_assignments
- work_order_materials
- work_order_logs

### Inventory
- inventory_categories
- inventory_items
- warehouses
- stock_balances
- stock_movements
- stock_issuances
- stock_issuance_items
- stock_returns
- stock_return_items

### Purchasing
- suppliers
- purchase_requests
- purchase_request_items
- purchase_orders
- purchase_order_items
- purchase_receipts
- purchase_receipt_items

### Billing
- invoices
- invoice_items
- payments
- payment_allocations

### Payroll
- departments
- positions
- employees
- payroll_runs
- payroll_entries
- payroll_deductions

### Tax / Statutory
- withholding_records
- vat_records
- tax_report_runs
- tax_report_items
- tax_certificates

### Compliance
- compliance_templates
- compliance_records
- compliance_tasks
- compliance_alerts
- compliance_submissions

---

## Important Data / Schema Notes

### Quotations
Must include:
- customer link
- site link
- quotation number
- amount
- status
- valid_until
- assigned sales owner
- materialized_at
- converted_project_id nullable
- converted_work_order_id nullable
- lost_reason

### Projects
Must optionally link back to quotation.

### Work Orders
Must optionally link back to quotation and/or project.

### Invoices
Should optionally link to quotation, project, and work order.

### Compliance Records
Must support both:
- `due_date`
- `expiry_date`

Because some records are deadline-based filings and others are true renewals/licenses.

### Attachments
Use polymorphic linking so files can be attached across modules consistently.

---

## Status Reference

### Quotation
- Draft
- Submitted
- Under Review
- Awarded
- Lost
- Cancelled
- Expired

### Project
- Draft
- Open
- In Progress
- On Hold
- Completed
- Cancelled

### Work Order
- Draft
- Scheduled
- In Progress
- For Review
- Completed
- Closed
- Cancelled

### Purchase Order
- Draft
- Submitted
- Approved
- Partially Received
- Fully Received
- Cancelled

### Invoice
- Draft
- Issued
- Partially Paid
- Paid
- Overdue
- Cancelled

### Compliance Record
- Draft
- Active
- Due Soon
- For Renewal
- For Filing
- In Progress
- Submitted
- Renewed
- Expired
- Overdue
- Archived

---

## Implementation Rules for Agents

1. Prefer **simple, maintainable CRUD + workflow design** over overengineering.
2. Do not invent an installed-equipment asset subsystem unless explicitly requested later.
3. Do not build quotation line items or estimating formulas in MVP.
4. Treat attachments as a reusable cross-module subsystem.
5. Keep source transactions authoritative; derive reports from them.
6. Use policies/permissions for access control.
7. Use enums/constants for statuses.
8. Keep list pages filterable and paginated.
9. Design dashboards as widget-based summaries, not one giant query.
10. Build phase-by-phase in dependency order.

---

## Future / Later Possibilities
These are not MVP priorities, but may be added later:
- approval workflows
- recurring service templates
- customer portal
- mobile-heavy work order UX
- advanced accounting
- deeper payroll
- imports/exports
- AI-assisted summarization or search
- OCR/document extraction

---

## One-Line Product Definition
This ERP is an internal fire protection company system that manages **quotation tracking, sales KPI monitoring, customers, sites, projects, work orders, inventory, purchasing, billing, payroll-linked statutory reporting, and company compliance deadlines**, while **excluding client-owned installed equipment as a managed asset module** and **keeping quotation authoring outside the ERP**.
