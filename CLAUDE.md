# Claude Code Instructions

## Project
Estate liquidation mobile app. See docs/PLAN.md for the full plan.

## Structure
- mobile/ — React Native Expo app
- infra/ — Terraform AWS infrastructure

## Mobile
- React Native with Expo Router for navigation
- React Context for state management (to be replaced with Zustand post-backend)
- npm install --legacy-peer-deps always required

## Infra
- Terraform flat file structure in infra/
- AWS region ap-southeast-2 (Sydney)
- SSM parameter store for secrets

## Key conventions
- DynamoDB single table design — PK=JOB#jobId SK=ITEM#itemId
- S3 key convention — jobs/{jobId}/items/{itemId}/photo.jpg
- All items have a disposition tag — sell/donate/keep/throw/hold/tbc