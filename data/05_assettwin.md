---
id: VNT-05
title: "AssetTwin product specification"
category: "Products"
status: synthetic-demo
version: "1.0"
---

# AssetTwin product specification

> Fictional demonstration content. Not a real vendor claim.

AssetTwin brings together equipment-tag records, maintenance context, documents and selected operating-data references for an industrial asset. It is a digital asset-information workspace, not a physics simulation or a live operational control system.

Capabilities: asset hierarchy; tag-to-document links; equipment attributes; maintenance-event references; searchable handover records; and a contextual view of data received from approved integrations. Data ingestion can use structured CSV and configured Connect connectors. Near-real-time refresh may be possible for supported feeds, but is not assumed in the baseline demonstration.

AssetTwin can consume a validated handover register from DesignHub. It does not guarantee that upstream information is complete or correct. It does not send control commands to plant equipment, perform predictive maintenance autonomously or replace safety-critical systems.

Use cases include finding the latest approved pump datasheet, locating commissioning records and seeing which asset records are missing required fields. The quality of output depends on the completeness of asset identifiers and source-system governance.

A pilot should check tag naming, asset hierarchy, permissions, source-system ownership and data-refresh expectations.
