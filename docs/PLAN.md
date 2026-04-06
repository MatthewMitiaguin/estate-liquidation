# Estate Liquidation App — Master Plan

## Overview
A mobile app for estate liquidation field workers who walk through properties and photograph items for auction/sale. Digitises and automates the current manual photo + handwritten notes process.

## Core User Flow
1. Worker opens app, creates a new project (the property/estate)
2. Worker creates a job under that project (a walkthrough session)
3. For each item they photograph it
4. Photo is sent to Claude vision API which generates a structured inventory entry — item name, description, condition, estimated value range, category, auction suitability
5. Worker can review and edit the generated description and set a disposition tag before saving
6. At the end of a job a clean PDF report is generated from the underlying JSON showing all items with photos and descriptions
7. An admin can view all projects, jobs and inventory online
8. Auction houses can subscribe to access inventory data via a REST API — returns only items tagged `sell`, filterable by date, category, condition etc.

## Data Architecture
- JSON is the source of truth — every item stored as structured JSON in a cloud database
- PDF is a human readable view generated from the same JSON
- REST API is another view of the same JSON — per auction house API key authentication
- Project → Job → Item hierarchy

## Data Model

### Project
The property/estate. Has an address, customer(s) assigned, multiple jobs.

### Job
A walkthrough session under a project. Has a worker, date, status, and items.

### Item
Belongs to a job. Has the following fields:
- Name
- Description
- Condition
- Value range (low / high)
- Category
- Photo (S3 key)
- Disposition tag
- Auction suitability
- LLM raw output

## Item Disposition Tags
`sell` / `donate` / `keep` / `throw` / `hold` / `tbc`

## User Types

| Role | Access | Notes |
|------|--------|-------|
| `worker` | Mobile app only | Capture, photograph, tag items |
| `admin` | Full access | View all projects, jobs, inventory |
| `customer` | Web portal | View inventory, tag items, sign off on decisions |
| `vendor` | Allocated items only | Auction houses, donation centres, freight, disposal |

## Tech Stack
- **React Native (Expo)** — iOS first, cross-platform ready
- **Terraform** — IaC, cloud-agnostic for future GCP migration
- **AWS backend** — API Gateway, Lambda, S3, cloud database
- **Anthropic API (Claude)** — vision/LLM processing of photos
- **PDF generation Lambda** — renders job JSON into a formatted report

## Phases

### MVP — In Progress
- Expo app setup
- Photo capture
- Claude vision analysis
- Review and edit screen
- Save item
- No auth, no PDF, no voice, no customer portal, no vendor access

### Phase 2
- Auth (workers and admin)
- PDF report generation
- Jobs list and project management screens

### Phase 3
- Voice notes — OpenAI Whisper preferred over AWS Transcribe for accuracy, especially with Australian English accents
- Customer web portal — view inventory, tag items, e-signature sign-off
- Vendor access — allocated items fed to auction houses, donation centres etc.

### Phase 4
- Auction house REST API with API key auth per house — sell-tagged items only
- Data marketplace integrations (Snowflake etc.) — clean JSON structure makes this straightforward

## Notes
- Future GCP migration is possible — Terraform and the clean JSON structure make this straightforward
- Canopy (Swift/SwiftUI POC by contractor) informed the Project → Job hierarchy and disposition tag model
- OpenAI Whisper chosen over AWS Transcribe for Phase 3 voice notes due to superior accuracy on Australian English