---
id: VNT-03
title: "DesignHub product specification"
category: "Products"
status: synthetic-demo
version: "1.0"
---

# DesignHub product specification

> Fictional demonstration content. Not a real vendor claim.

DesignHub is a controlled workspace for engineering documents, equipment registers, drawing metadata and revision history. Its core objects are project, discipline, document, revision, equipment tag and change request. Teams can link a drawing revision to an equipment tag and record its review status.

Supported demonstration imports: PDF documents; CSV equipment registers; IFC 4 model metadata; and exported drawing registers in CSV. DesignHub does not natively author CAD geometry or edit IFC models. Native proprietary CAD formats require an external converter or integration assessment.

Capabilities: document versioning; approval workflows with configurable reviewers; metadata search; equipment-tag linking; audit events; role-based permissions; and exportable handover registers. Revision states are Draft, In Review, Approved and Superseded. Approved records are not silently overwritten; a new revision is created.

Integration: Connect can synchronize selected metadata with other systems. No real-time bidirectional synchronization is guaranteed. DesignHub may be used without ProjectFlow, but change-request linkage is richer when both are deployed.

Limitations: not a full common data environment certification claim; not a 3D model authoring tool; not a substitute for engineering quality assurance. Performance for very large models must be tested in a pilot.
