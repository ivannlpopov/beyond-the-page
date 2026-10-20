---
id: VNT-07
title: "Reference architecture"
category: "Technical"
status: synthetic-demo
version: "1.0"
---

# Reference architecture

> Fictional demonstration content. Not a real vendor claim.

The illustrative VANTER architecture has four layers: user interface, application services, structured document and record storage, and Connect integrations. DesignHub, ProjectFlow and AssetTwin share identity and tenant context but maintain product-specific records. An organization may deploy one or more modules.

The demonstration assumes a browser interface, a backend API, object storage for files, a relational database for structured records, and a search index for approved content. These are architectural concepts, not claims about a production implementation.

A knowledge-aware AI assistant should use retrieval from explicitly approved documents, record source IDs, and distinguish sourced facts from general explanatory text. It must not be granted direct write access to engineering approval states. Generated pages should be represented as structured blocks with source references, rather than arbitrary unreviewed HTML.

Suggested generated-page block types: executive summary, relevant products, technical fit, implementation considerations, source documents, clarifying question and next step. A renderer validates block schemas and refuses unsupported product claims. Every product-specific statement should be traceable to a knowledge-base document.

Availability, scale and resilience targets are to be defined during discovery; no uptime SLA is specified in this demo.
