# Codex Prompt Pack — Fire Protection Company ERP

Use this prompt pack for **Laravel 13 + Inertia.js + React + TypeScript + PostgreSQL**.

## How to use this pack

1. Start a fresh Codex session.
2. Paste the **Master Context Prompt** first.
3. Then paste **one module prompt at a time**.
4. After each module, optionally use the **review / refactor / test prompts**.
5. Keep tasks bounded. Do not ask Codex to build the whole ERP in one go.

---

# 0. Master Context Prompt

```text
You are helping me build an internal Fire Protection Company ERP using Laravel 13 + Inertia.js + React + TypeScript + PostgreSQL.

Project rules:
- This is an internal business ERP, not a public SaaS.
- Architecture: modular monolith.
- Use Laravel best practices.
- Use policies for authorization.
- Use Form Requests for validation.
- Use soft deletes on major business records where appropriate.
- Use paginated and filterable index pages.
- Use reusable attachments via a polymorphic attachment system.
- Prefer simple, maintainable CRUD + workflow design.
- Avoid unnecessary abstractions.
- Use enums/constants for statuses.
- Derive reports from source transactions where possible.
- Keep list pages searchable and filterable.
- Build phase-by-phase in dependency order.

Critical business rules:
1. Do NOT build an installed-equipment/client-asset registry as a core module.
2. Quotations remain external, mainly Excel. Do NOT build a quotation builder or estimation engine.
3. The ERP must track quotation records, quotation attachments, quotation statuses, and sales KPI metrics.
4. Compliance and renewals are required, including GIS, PCAB, Mayor’s Permit, SSS, Pag-IBIG, and PhilHealth.
5. Payroll is basic only, not a full HRIS.
6. Attachments are reusable across quotations, projects, work orders, invoices, compliance, and other records.

Main modules:
- Customers & Sites
- Quotation Tracking / Sales KPI
- Projects
- Work Orders
- Inventory & Warehouse
- Purchasing / Supplier Management
- Billing / Accounts Receivable
- Employee & Payroll Basic
- Tax & Statutory Reports
- Compliance & Renewals
- Dashboard / Reports

Status references:
Quotation: Draft, Submitted, Under Review, Awarded, Lost, Cancelled, Expired
Project: Draft, Open, In Progress, On Hold, Completed, Cancelled
Work Order: Draft, Scheduled, In Progress, For Review, Completed, Closed, Cancelled
PO: Draft, Submitted, Approved, Partially Received, Fully Received, Cancelled
Invoice: Draft, Issued, Partially Paid, Paid, Overdue, Cancelled
Compliance: Draft, Active, Due Soon, For Renewal, For Filing, In Progress, Submitted, Renewed, Expired, Overdue, Archived

Coding expectations:
- For each module, implement migrations, models, enums/constants, requests, policies, controllers, routes, Inertia pages, and feature tests.
- Keep the UI clean and practical for internal users.
- Use TypeScript types for page props and shared domain types.
- If business logic grows, place it in Action/Service classes.
- Prefer explicit code over clever code.

Whenever I ask you to build a module:
1. Review dependencies first.
2. Implement backend and frontend together.
3. Add feature tests.
4. Summarize what was created.
5. Mention anything intentionally left for later.
```

---

# 1. Foundation Module

## 1.1 Bootstrap Review

```text
Review my Laravel 13 + Inertia React + TypeScript ERP setup and help me finalize the foundation.

I want:
- modular monolith structure
- PostgreSQL
- roles and permissions
- shared layout
- shared table/filter/form components
- attachment system
- audit log foundation
- notification foundation

Please:
1. Propose the best folder structure for backend and frontend.
2. Propose naming conventions for modules, requests, policies, enums, actions, filters, and pages.
3. Propose the initial migration order for foundation-related tables.
4. Identify risks or bad decisions before I start coding.
5. Give me a step-by-step implementation checklist.
```

## 1.2 Roles and Permissions

```text
Build the foundation for roles and permissions in my Laravel 13 + Inertia React + TypeScript ERP.

Requirements:
- tables: roles, permissions, role_user, permission_role
- seed the core roles:
  Super Admin
  Sales Admin / Business Development
  Operations Admin
  Project Coordinator
  Warehouse / Inventory Officer
  Purchasing Officer
  Billing / Accounting Staff
  HR / Payroll Officer
  Compliance Officer / Corporate Admin
  Management / CEO
- use policies for authorization
- keep implementation simple and maintainable

Please implement:
- migrations
- models
- seeders
- basic policy strategy
- middleware/gates approach if needed
- a short README note on how permissions should be used in modules

Definition of done:
- roles/permissions are ready to be used by future modules
- seeders work
- authorization strategy is clear and consistent
```

## 1.3 Reusable Attachment Subsystem

```text
Build a reusable attachment subsystem for my ERP.

Requirements:
- use a polymorphic design
- attachments must be reusable across customers, quotations, projects, work orders, invoices, suppliers, compliance records, and payroll/tax records
- support upload, view, download, and delete/unlink
- store metadata such as disk, path, original_name, mime_type, extension, file_size, uploaded_by
- keep it simple and practical

Please implement:
- migrations for attachments and attachment_links
- models and relationships
- upload and unlink actions/services if helpful
- controller endpoints
- request validation
- authorization
- reusable Inertia-friendly upload strategy
- feature tests

Definition of done:
- any future module can attach files using this system
- files can be linked polymorphically
- tests cover upload/link/unlink
```

## 1.4 Audit Log Foundation

```text
Build a simple audit log foundation for my ERP.

Requirements:
- audit_logs table
- capture user_id, auditable_type, auditable_id, action, old_values, new_values, ip_address, user_agent, created_at
- use JSON for old/new values
- keep implementation lightweight and not overengineered
- this will be used later by quotations, stock movements, invoices, payroll, and compliance

Please implement:
- migration
- model
- helper/service pattern for recording logs
- example usage pattern
- feature test or unit test for audit recording

Definition of done:
- I have a reusable audit logging mechanism that later modules can call
```

---

# 2. Customers & Sites Module

## 2.1 Build Customers & Sites

```text
Build the Customers & Sites module for my Laravel 13 + Inertia React + TypeScript ERP.

Follow these rules:
- modular monolith
- PostgreSQL
- policies
- form requests
- soft deletes for customers and sites
- paginated/filterable lists
- reusable attachments
- no unnecessary abstractions

Business requirements:
- customers have master data such as customer_code, company_name, trade_name, TIN, phone, email, billing_address, status, notes
- customers can have multiple sites
- sites include site_code, site_name, contact_person, contact_no, email, address, city, province, notes, is_active
- support customer contacts if practical
- customer and site records should support attachments

Please implement:
- migrations
- models and relationships
- enums/constants if useful
- form requests
- policies
- controllers
- routes
- Inertia pages
- filters/search
- feature tests

Definition of done:
- customer CRUD works
- site CRUD works
- customer list and site list are searchable/filterable/paginated
- status handling works
- attachments work
- authorization works
```

## 2.2 Improve Customers & Sites UX

```text
Improve the Customers & Sites module UI/UX for internal ERP usage.

Please:
- review the existing index, create, edit, and show pages
- improve filters, page layout, and information hierarchy
- ensure forms are practical for office users
- add helpful validation feedback
- add reusable sections/components where appropriate
- keep the design clean, fast, and business-oriented

Definition of done:
- pages are easier to use
- filters are practical
- no unnecessary design complexity
```

---

# 3. Quotation Tracking / Sales KPI Module

## 3.1 Build Quotation Registry

```text
Build the Quotation Tracking / Sales KPI module for my Laravel 13 + Inertia React + TypeScript ERP.

Important business rule:
- quotations are created externally, mainly in Excel
- do NOT build a quotation builder or estimation engine
- only build a quotation registry, attachment support, status tracking, and KPI monitoring

Quotation fields:
- quotation_no
- customer_id
- customer_site_id nullable
- subject
- quotation_date
- valid_until nullable
- quotation_amount
- status
- prepared_by_user_id nullable
- assigned_sales_user_id nullable
- materialized_at nullable
- converted_project_id nullable
- converted_work_order_id nullable
- lost_reason nullable
- remarks nullable

Statuses:
- Draft
- Submitted
- Under Review
- Awarded
- Lost
- Cancelled
- Expired

Please implement:
- migrations
- models
- status enum/constants
- form requests
- policies
- controllers
- routes
- Inertia pages
- paginated/filterable lists
- Excel quotation attachment support through the reusable attachments system
- feature tests

Definition of done:
- quotation CRUD works
- quotation file attachment works
- filtering by customer, status, and date works
- authorization works
```

## 3.2 Build Quotation Status Workflow and Logs

```text
Enhance the Quotations module with a proper status workflow and status history.

Requirements:
- every quotation status change must be logged
- create quotation_status_logs table
- store quotation_id, from_status, to_status, changed_by, changed_at, remarks
- if status becomes Lost, lost_reason should be required or strongly validated
- if status becomes Awarded, materialized_at should be recorded

Please implement:
- migration
- model
- service/action for status change
- controller endpoint or action route
- UI for changing status with remarks
- feature tests for status transitions

Definition of done:
- status changes are traceable
- Lost and Awarded transitions enforce business rules
- the quotation detail page shows status history
```

## 3.3 Build Quotation KPI Dashboard

```text
Build the Sales KPI dashboard for quotations.

Use quotation source records only. Do not invent a separate reporting truth.

Required KPIs:
- total quotations submitted
- total quotations awarded/materialized
- quotation conversion rate
- total quotation value
- awarded quotation value
- value conversion rate
- pending quotation count
- lost quotation count
- average days to materialize
- top customers by quotation value
- top customers by awarded value
- lost reasons summary

Please implement:
- backend queries/services
- a clean Inertia dashboard page or dashboard widget set
- date range filtering (at least monthly, quarterly, yearly, custom if practical)
- tests for KPI calculations where practical

Definition of done:
- management can see quotation performance from the ERP
- data comes from quotation records and statuses
- dashboard is performant and readable
```

## 3.4 Build Quotation Conversion Actions

```text
Add quotation conversion actions to the Quotations module.

Requirements:
- support “Convert to Project”
- support “Convert to Work Order”
- prefill related project/work order forms from the awarded quotation where appropriate
- do not auto-build excessive business logic yet
- keep it simple for MVP

Please implement:
- action routes/controllers
- UI buttons on quotation detail page
- validation that only Awarded quotations can be converted
- storage of converted_project_id and converted_work_order_id when created
- feature tests

Definition of done:
- awarded quotations can be converted to projects or work orders
- links between records are preserved
```

---

# 4. Projects Module

## 4.1 Build Projects

```text
Build the Projects module for my Laravel 13 + Inertia React + TypeScript ERP.

Business requirements:
- a project may optionally come from an awarded quotation
- project fields include:
  project_no
  quotation_id nullable
  customer_id
  customer_site_id
  title
  project_type
  start_date nullable
  target_end_date nullable
  actual_end_date nullable
  status
  description nullable
- support assignments and attachments
- use status history

Project statuses:
- Draft
- Open
- In Progress
- On Hold
- Completed
- Cancelled

Please implement:
- migrations
- models
- relationships
- status enum/constants
- form requests
- policies
- controllers
- routes
- Inertia pages
- project assignments
- project status logs
- attachments support
- feature tests

Definition of done:
- project CRUD works
- project assignments work
- project status changes are logged
- project detail page is usable
```

## 4.2 Improve Project Detail Workflow

```text
Review and improve the Project detail page and workflow.

Please:
- make the show page practical for operations users
- clearly show customer, site, linked quotation, assignments, status history, attachments, and related work orders if available
- keep layout simple and ERP-friendly
- suggest any missing actions for MVP only

Definition of done:
- project detail page is operationally useful
- no unnecessary complexity added
```

---

# 5. Work Orders Module

## 5.1 Build Work Orders

```text
Build the Work Orders / Service Jobs module for my Laravel 13 + Inertia React + TypeScript ERP.

Business requirements:
- work orders may optionally link to a quotation and/or project
- required fields:
  work_order_no
  quotation_id nullable
  project_id nullable
  customer_id
  customer_site_id
  service_type
  scheduled_date nullable
  priority
  status
  summary
  findings nullable
  completion_date nullable
- support staff assignments
- support work logs/history
- support materials relation
- support attachments

Work order types:
- Preventive Maintenance
- Corrective Service
- Emergency Service
- Inspection-related Work
- Installation Support
- Other Service Job

Statuses:
- Draft
- Scheduled
- In Progress
- For Review
- Completed
- Closed
- Cancelled

Please implement:
- migrations
- models
- enums/constants
- form requests
- policies
- controllers
- routes
- Inertia pages
- work order assignments
- work order logs
- work_order_materials structure
- attachments support
- feature tests

Definition of done:
- work order CRUD works
- assignments work
- work logs work
- status handling works
- attachments work
```

## 5.2 Add Work Order Status Flow and Completion Actions

```text
Enhance Work Orders with a proper status flow and completion actions.

Requirements:
- validate status transitions
- record status history/logs
- support completion_date when moved to Completed
- keep logic simple and suitable for MVP
- show logs clearly on the detail page

Please implement:
- status change action/service
- validation rules
- UI for status update
- feature tests for transitions

Definition of done:
- work order lifecycle is traceable and controlled
```

---

# 6. Inventory & Warehouse Module

## 6.1 Build Inventory & Warehouse

```text
Build the Inventory & Warehouse module for my Laravel 13 + Inertia React + TypeScript ERP.

Business requirements:
- inventory is company-owned stock before issuance
- do NOT turn this into a client asset registry
- support item master, categories, warehouses, stock balances, stock movements, issuances, and returns

Tables/entities needed:
- inventory_categories
- inventory_items
- warehouses
- stock_balances
- stock_movements
- stock_issuances
- stock_issuance_items
- stock_returns
- stock_return_items

Inventory item fields should include:
- sku nullable
- item_code
- item_name
- inventory_category_id nullable
- unit
- reorder_level
- standard_cost nullable
- status

Please implement:
- migrations
- models
- relationships
- form requests
- policies
- controllers
- routes
- Inertia pages
- feature tests

Definition of done:
- item CRUD works
- warehouse CRUD works
- stock balances are trackable
- stock movement structure is ready
```

## 6.2 Build Stock Movement, Issuance, and Return Logic

```text
Implement stock movement, stock issuance, and stock return logic for the Inventory module.

Requirements:
- stock in
- stock out
- adjustments
- issuance to project or work order
- returns from project or work order
- maintain stock_balances per warehouse + inventory_item
- create stock_movements for all changes
- keep logic transactional and safe

Please implement:
- service/action classes for stock operations
- controller endpoints/pages
- validation rules
- balance update logic
- feature tests for stock balance correctness

Definition of done:
- stock balances update correctly
- issuance and returns are traceable
- movements are auditable
```

## 6.3 Add Low-Stock Reporting

```text
Add low-stock reporting and dashboard support to the Inventory module.

Requirements:
- detect items below reorder_level
- support filtering by warehouse and category if practical
- create a clean low-stock list page
- add a dashboard widget or summary query

Definition of done:
- low-stock visibility exists for management and warehouse users
```

---

# 7. Purchasing / Supplier Management Module

## 7.1 Build Suppliers and Purchasing

```text
Build the Purchasing / Supplier Management module for my Laravel 13 + Inertia React + TypeScript ERP.

Requirements:
- supplier masterfile
- purchase requests
- purchase orders
- receiving records
- attachments
- support references to inventory items where applicable

Entities:
- suppliers
- purchase_requests
- purchase_request_items
- purchase_orders
- purchase_order_items
- purchase_receipts
- purchase_receipt_items

PO statuses:
- Draft
- Submitted
- Approved
- Partially Received
- Fully Received
- Cancelled

Please implement:
- migrations
- models
- relationships
- enums/constants
- form requests
- policies
- controllers
- routes
- Inertia pages
- feature tests

Definition of done:
- supplier CRUD works
- PR CRUD works
- PO CRUD works
- receiving works structurally
```

## 7.2 Connect Receiving to Stock Balances

```text
Enhance the Purchasing module so purchase receiving updates Inventory stock balances correctly.

Requirements:
- receiving against PO
- choose warehouse
- create stock movement entries
- increase stock balance
- support partial and full receipts
- keep implementation transactional and simple

Please implement:
- receiving action/service
- PO status updates after receipt
- stock balance integration
- feature tests

Definition of done:
- receiving updates stock properly
- PO status reflects received quantities
```

---

# 8. Billing / Accounts Receivable Module

## 8.1 Build Billing / Accounts Receivable

```text
Build the Billing / Accounts Receivable module for my Laravel 13 + Inertia React + TypeScript ERP.

Business requirements:
- invoices may optionally link to quotation, project, and work order
- payments must be recorded and allocated
- aging visibility is required

Entities:
- invoices
- invoice_items
- payments
- payment_allocations

Invoice fields:
- invoice_no
- quotation_id nullable
- customer_id
- project_id nullable
- work_order_id nullable
- invoice_date
- due_date nullable
- subtotal
- tax_amount
- total_amount
- balance_amount
- status
- remarks nullable

Invoice statuses:
- Draft
- Issued
- Partially Paid
- Paid
- Overdue
- Cancelled

Please implement:
- migrations
- models
- relationships
- enums/constants
- form requests
- policies
- controllers
- routes
- Inertia pages
- feature tests

Definition of done:
- invoice CRUD works
- invoice totals work
- invoice links to related records work
- basic AR visibility exists
```

## 8.2 Build Payment Recording and Allocation

```text
Enhance the Billing module with payment recording and allocation.

Requirements:
- record payments
- allocate a payment to one or more invoices
- update invoice balance_amount
- update invoice status based on paid amount
- keep allocation logic transactional and correct

Please implement:
- payment creation flow
- allocation logic/service
- invoice status update logic
- tests for full, partial, and multi-invoice payment allocation

Definition of done:
- payment recording is reliable
- invoice balances and statuses are correct
```

## 8.3 Build AR Aging Report

```text
Build an Accounts Receivable aging report for the Billing module.

Requirements:
- show current, overdue, partially paid, and paid visibility
- support filtering by customer and date range
- use source invoice/payment data only
- keep the page readable and practical for internal accounting users

Definition of done:
- management and billing users can review outstanding balances easily
```

---

# 9. Dashboard Module

## 9.1 Build Core Operational Dashboard

```text
Build the first-pass ERP dashboard for my system.

Important rule:
- do NOT build one giant query
- build separate widget queries/services
- keep the dashboard fast and readable

Widgets needed:
- quotations by status
- quotation conversion summary
- awarded quotation value
- projects by status
- work orders by status
- low stock items
- pending purchase orders
- invoice summary
- unpaid invoices / aging snapshot

Please implement:
- backend widget query/services
- a clean Inertia dashboard page
- role-aware widget visibility if practical
- tests for key calculations where appropriate

Definition of done:
- dashboard gives management meaningful visibility
- widgets are modular and performant
```

---

# 10. Employee & Payroll Basic Module

## 10.1 Build Employees & Payroll Basic

```text
Build the Employee & Payroll Basic module for my Laravel 13 + Inertia React + TypeScript ERP.

Important rule:
- this is basic payroll support, not a full HRIS

Entities:
- departments
- positions
- employees
- payroll_runs
- payroll_entries
- payroll_deductions

Employee fields should include:
- employee_no
- first_name
- last_name
- middle_name nullable
- department_id nullable
- position_id nullable
- employment_status
- hire_date nullable
- basic_salary nullable
- tin nullable
- sss_no nullable
- pagibig_no nullable
- philhealth_no nullable
- email nullable
- phone nullable
- address nullable
- is_active

Please implement:
- migrations
- models
- relationships
- form requests
- policies
- controllers
- routes
- Inertia pages
- feature tests

Definition of done:
- department and position CRUD works
- employee CRUD works
- payroll run structure exists
- payroll entries and deductions structure exists
```

## 10.2 Build Payroll Run Workflow

```text
Enhance the Payroll module with payroll run workflow.

Requirements:
- create payroll run with period_from, period_to, payroll_date, status
- add payroll entries per employee
- support gross pay, tax, SSS, Pag-IBIG, PhilHealth, total deductions, net pay
- support deduction breakdowns
- keep payroll logic simple for MVP

Definition of done:
- payroll runs can be created and reviewed
- employee payroll entries are stored correctly
```

---

# 11. Tax & Statutory Reports Module

## 11.1 Build Tax Source Records and Report Runs

```text
Build the Tax & Statutory module foundation for my ERP.

Important rule:
- derive tax/statutory outputs from source records where possible
- do not begin with complicated form rendering
- focus on correct source data and report run structure

Entities:
- withholding_records
- vat_records
- tax_report_runs
- tax_report_items
- tax_certificates

Expected support later includes:
- 1601-C
- 1604-C
- 2316
- 2307
- 1601-E / 1601-EQ
- VAT summaries

Please implement:
- migrations
- models
- relationships
- form requests if needed
- services/actions for creating report runs
- controllers/routes/pages for listing and viewing report runs
- feature tests

Definition of done:
- source tax records exist
- report runs can be generated and reviewed
- tax certificates structure exists
```

## 11.2 Connect Payroll and Billing Data to Statutory Source Records

```text
Connect Payroll and Billing source data to Tax & Statutory records.

Requirements:
- payroll data should support compensation-related withholding records
- billing/purchasing data should support VAT records where applicable
- keep it simple, traceable, and source-driven
- add tests for derived record creation

Definition of done:
- statutory source records are tied to real ERP transactions
```

---

# 12. Compliance & Renewals Module

## 12.1 Build Compliance & Renewals

```text
Build the Compliance & Renewals module for my Laravel 13 + Inertia React + TypeScript ERP.

Business requirements:
- track permits, filings, deadlines, and recurring obligations
- must support both due_date and expiry_date
- must support recurrence and reminders

Entities:
- compliance_templates
- compliance_records
- compliance_tasks
- compliance_alerts
- compliance_submissions

Sample records to support:
- GIS
- PCAB
- Mayor’s Permit
- SSS employer compliance
- Pag-IBIG employer compliance
- PhilHealth employer compliance

Statuses:
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

Please implement:
- migrations
- models
- relationships
- enums/constants
- form requests
- policies
- controllers
- routes
- Inertia pages
- feature tests

Definition of done:
- compliance records can be created and tracked
- due and expiry logic exists
- attachments and submission history work
```

## 12.2 Build Compliance Reminder Engine

```text
Enhance the Compliance module with reminder scheduling.

Requirements:
- support reminders such as 90, 60, 30, 15, 7 days before due/expiry
- support overdue reminders
- create compliance_alerts records
- use Laravel scheduler/queue approach
- keep the implementation simple and reliable

Please implement:
- reminder scheduling logic
- queued job(s) or scheduled command(s)
- alert creation logic
- tests for reminder generation

Definition of done:
- upcoming and overdue compliance items can generate alerts
```

## 12.3 Build Compliance Calendar and Dashboard

```text
Build a calendar view and dashboard widgets for the Compliance module.

Requirements:
- show due items
- show expiring items
- show overdue items
- support filtering by agency and status
- make it readable for management and compliance users

Definition of done:
- compliance deadlines are easy to review visually
```

---

# 13. Hardening / Stabilization Module

## 13.1 Improve Global Filters, Search, and Exports

```text
Review all major index pages in the ERP and improve search, filters, and exports.

Modules to review:
- customers
- quotations
- projects
- work orders
- inventory
- purchasing
- billing
- compliance

Please:
- standardize filter UX
- improve query performance where practical
- add export capability where most useful
- avoid overengineering

Definition of done:
- list pages are consistent and more usable
```

## 13.2 Add Approval Hooks Where Practical

```text
Propose and implement lightweight approval hooks for the ERP where practical for MVP+.

Focus only on high-value areas such as:
- purchase orders
- invoices
- compliance submissions

Please:
- propose a minimal approval design
- implement only what adds clear business value
- keep it simple and avoid a heavy workflow engine

Definition of done:
- approval logic is optional, focused, and maintainable
```

## 13.3 Improve Audit Coverage

```text
Review the ERP and improve audit log coverage for critical actions.

Focus on:
- quotation status changes
- stock issuance and returns
- invoice changes
- payment allocations
- payroll changes
- compliance status/submission changes

Definition of done:
- critical business actions are auditable
```

## 13.4 Stabilization and QA Sweep

```text
Perform a stabilization and QA-oriented review of the ERP.

Please:
- review module-by-module for missing validations
- review policy coverage
- review status transition safety
- review transactional integrity in inventory, billing, payroll, and compliance
- suggest bugs, risks, and cleanup items
- implement the most important fixes
- add missing feature tests for critical flows

Critical flows:
- quotation -> project
- quotation -> work order
- work order lifecycle
- stock issuance / return
- PO receiving -> stock update
- invoice -> payment allocation
- payroll run -> payroll entries
- compliance reminder generation

Definition of done:
- system is safer and more stable for real usage
```

---

# 14. Review / Refactor / Test Prompts

## 14.1 Architecture Review

```text
Review the current implementation of my ERP module and tell me:
1. what is good
2. what is risky
3. what is overengineered
4. what is missing from the PRD/business rules
5. what should be refactored now vs later

Keep the review grounded in Laravel 13 + Inertia React + TypeScript best practices.
```

## 14.2 Refactor Prompt

```text
Refactor this module for clarity and maintainability without changing business behavior.

Rules:
- keep Laravel conventions
- do not introduce unnecessary abstractions
- preserve policies, requests, and test coverage
- simplify where possible
```

## 14.3 Test Coverage Prompt

```text
Review this module’s tests and add missing feature tests for critical business flows, authorization, validation, and status transitions.
```

---

# 15. Suggested Usage Order

Use the prompts in this order:

1. Master Context Prompt
2. Foundation prompts
3. Customers & Sites prompts
4. Quotation Tracking / Sales KPI prompts
5. Projects prompts
6. Work Orders prompts
7. Inventory prompts
8. Purchasing prompts
9. Billing prompts
10. Dashboard prompt
11. Employee & Payroll prompts
12. Tax & Statutory prompts
13. Compliance prompts
14. Hardening prompts
15. Review / Refactor / Test prompts as needed

---

# 16. Practical Usage Notes

- Use one Codex prompt per bounded task.
- Let Codex finish one module before moving to the next.
- After each build prompt, run the review prompt.
- Ask for refactoring only after the module is working.
- Ask for extra tests before moving to the next phase.
- Do not ask Codex to build the entire ERP in one request.
