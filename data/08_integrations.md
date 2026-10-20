---
id: VNT-08
title: "Integration and data formats"
category: "Technical"
status: synthetic-demo
version: "1.0"
---

# Integration and data formats

> Fictional demonstration content. Not a real vendor claim.

DesignHub accepts PDF, CSV registers and IFC 4 metadata imports. ProjectFlow accepts CSV schedule baselines and work-package registers. AssetTwin accepts structured asset registers in CSV. Connect exposes REST/JSON endpoints, configured webhooks and scheduled CSV exchange.

Illustrative integration process: identify system of record; define entity mapping; choose one-way or two-way transfer; set refresh frequency; agree error handling; validate a sample dataset; then conduct user acceptance testing. The initial pilot should prioritize one or two integrations, not attempt enterprise-wide connectivity.

For IFC, the demo supports metadata extraction and links to model references, not native geometric editing. For CAD authoring systems, an export or converter is required. For ERP or maintenance-management systems, compatibility is unconfirmed until an interface review.

Important constraints: source data quality remains the customer's responsibility; identity and authorization must be mapped; duplicate tags may require human resolution; historical revisions should not be overwritten by a sync; integration latency depends on the configured workflow.

Do not describe any third-party vendor integration as certified, supported out of the box or commercially available without separate evidence.
